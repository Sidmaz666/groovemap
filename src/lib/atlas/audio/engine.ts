import type { GroovePattern, KitId, RhythmEvent } from '../types'
import { stepsPerBar, stepDuration, barDuration } from '../types'
import type { InstrumentId } from '../instruments'
import { resolveKit, kitGroupVolume, effectiveLayers, kitSampleFiles, KIT_LIST, type SampleKitDef } from './kits'
import { swingOffset, mulberry32 } from '../rhythm'
import { resolveRoom, buildImpulseResponse, type RoomId } from './rooms'

/**
 * GrooveEngine — shared Web Audio transport powered by REAL sampled drums.
 *
 * Scheduling strategy ("A Tale of Two Clocks"):
 *  - a setInterval(30ms) look-ahead loop schedules steps 130ms ahead using the
 *    AudioContext clock (never UI timers for musical timing),
 *  - the visual playhead follows the *scheduled* transport position via rAF,
 *  - React re-renders are decoupled: listeners subscribe to position updates.
 *
 * All drum sounds are multi-velocity recorded samples served from /samples
 * (decoded once into AudioBuffers, cached forever). The same sample playback
 * code runs against OfflineAudioContext for WAV export.
 *
 * Instant-start discipline:
 *  - the app preloads the saved kit at mount (decodeAudioData works on a
 *    suspended context) and warm-decodes every other kit in idle time, so
 *    pressing play never waits on the network,
 *  - if play() is called before a kit is decoded anyway, it waits for the
 *    kit's voices and only THEN starts the scheduler — the first loop is
 *    never silent,
 *  - sample fetches are prioritized: instruments used by the loaded pattern
 *    decode before the rest of the kit.
 *
 * Real-kit articulation: hi-hats form a choke group — a closed/pedal hat
 * naturally stops any ringing open hat, exactly like a real pedal.
 */

export interface PlayPos {
  step: number
  stepInBar: number
  bar: number
  beat: number
  progress: number
}

export interface TrackMix {
  muted: boolean
  solo: boolean
  vol: number
  pan: number
}

export interface RenderOpts {
  loops?: number
  bpm?: number
  swing?: number
  kitId?: KitId
  tail?: number
  /** offline render sample rate (44100 default, 48000 for video workflows) */
  sampleRate?: number
  /** render only these instruments (stem export) — others are silent */
  soloInst?: Set<InstrumentId>
  /** room ambience baked into the render (matches live playback) */
  roomId?: RoomId
}

export type KitLoadState = 'idle' | 'loading' | 'ready'
export interface KitLoadInfo {
  state: KitLoadState
  progress: number
  kitId: KitId
}

type PosListener = (pos: PlayPos | null) => void
type KitListener = (info: KitLoadInfo) => void

const LOOKAHEAD = 0.13
const TICK_MS = 30

interface VoiceSet {
  /** decoded buffers ordered soft → hard */
  buffers: AudioBuffer[]
  /** per-layer gain (manifest trim × kit gain) */
  gains: number[]
}

export class GrooveEngine {
  /* audio graph */
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private masterLow: BiquadFilterNode | null = null
  private shaper: WaveShaperNode | null = null
  private comp: DynamicsCompressorNode | null = null
  /* room ambience: parallel convolution bus over the master */
  private roomDry: GainNode | null = null
  private roomPre: DelayNode | null = null
  private roomConvolver: ConvolverNode | null = null
  private roomFilter: BiquadFilterNode | null = null
  private roomWet: GainNode | null = null
  private roomId: RoomId = 'close'
  private irCache = new Map<string, AudioBuffer>()
  private trackNodes = new Map<string, { g: GainNode; p: StereoPannerNode; soloable: boolean }>()
  private currentKitId: KitId = 'analog909'

  /* sample data */
  private rawCache = new Map<string, ArrayBuffer>()
  private decoded = new Map<string, AudioBuffer>()
  private kitVoices = new Map<InstrumentId, VoiceSet>()
  private kitLoadInfo: KitLoadInfo = { state: 'idle', progress: 0, kitId: 'analog909' }
  private kitListeners = new Set<KitListener>()
  private trims: Record<string, number> | null = null
  private loadToken = 0
  /** in-flight fetch+decode per file (live context) — prevents duplicated work when
   *  preload, kit-switch and play-time critical loads run at the same time */
  private fileLoads = new Map<string, Promise<AudioBuffer | null>>()
  /** the one UI-visible full kit load currently running (dedupes redundant restarts) */
  private fullLoad: { kitId: KitId; promise: Promise<void> } | null = null
  /** ringing chokeable voices per group (hat articulation) */
  private chokes = new Map<string, { src: AudioBufferSourceNode; g: GainNode; time: number }[]>()

  /* transport state */
  private timer: ReturnType<typeof setInterval> | null = null
  private nextStepTime = 0
  private schedStep = 0
  private playing = false
  private pattern: GroovePattern | null = null
  private eventsByStep = new Map<number, RhythmEvent[]>()
  private bpm = 120
  private swing = 0
  private humanize = 0
  private seed = 7
  private metronome = false
  private masterVol = 0.9
  private trackMix = new Map<string, TrackMix>()
  private rng: () => number = Math.random
  private posListeners = new Set<PosListener>()
  private pending: { step: number; time: number }[] = []
  private lastPos: PlayPos | null = null
  private raf: number = 0

  /* -------------------------------------------------------------- */
  /* context + graph                                                 */
  /* -------------------------------------------------------------- */

  ensureContext(): AudioContext {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      return this.ctx
    }
    const AC: typeof AudioContext =
      typeof window !== 'undefined'
        ? window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        : null as never
    const ctx = new AC()
    this.ctx = ctx

    const master = ctx.createGain()
    master.gain.value = this.masterVol

    const low = ctx.createBiquadFilter()
    low.type = 'lowpass'
    low.frequency.value = 20000

    const shaper = ctx.createWaveShaper()
    shaper.curve = softClipCurve(0.4)
    shaper.oversample = '2x'

    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -12
    comp.knee.value = 24
    comp.ratio.value = 3
    comp.attack.value = 0.004
    comp.release.value = 0.18

    shaper.connect(low)
    low.connect(comp)
    comp.connect(master)
    master.connect(ctx.destination)

    /* room ambience bus — comp splits into a dry leg and a
       predelay → convolver → damp-filter → wet leg, both into master */
    const roomDry = ctx.createGain()
    roomDry.gain.value = 1
    const roomPre = ctx.createDelay(0.2)
    roomPre.delayTime.value = 0
    const roomConvolver = ctx.createConvolver()
    roomConvolver.normalize = false
    const roomFilter = ctx.createBiquadFilter()
    roomFilter.type = 'lowpass'
    roomFilter.frequency.value = 20000
    const roomWet = ctx.createGain()
    roomWet.gain.value = 0
    comp.connect(roomDry)
    roomDry.connect(master)
    comp.connect(roomPre)
    roomPre.connect(roomConvolver)
    roomConvolver.connect(roomFilter)
    roomFilter.connect(roomWet)
    roomWet.connect(master)
    this.roomDry = roomDry
    this.roomPre = roomPre
    this.roomConvolver = roomConvolver
    this.roomFilter = roomFilter
    this.roomWet = roomWet

    this.masterGain = master
    this.masterLow = low
    this.shaper = shaper
    this.comp = comp
    this.applyKitChain(this.currentKitId)
    this.applyRoom()
    return ctx
  }

  private applyKitChain(kitId: KitId) {
    const kit = resolveKit(kitId)
    this.currentKitId = kit.id
    if (!this.ctx || !this.masterLow || !this.shaper) return
    this.masterLow.frequency.setTargetAtTime(kit.lowpass ?? 20000, this.ctx.currentTime, 0.02)
    this.shaper.curve = softClipCurve(0.35 + (kit.drive ?? 0) * 0.65)
    // sample data loads asynchronously; playback falls back to whatever is
    // already loaded until the new kit finishes decoding
    void this.loadKitVoices(kit)
  }

  /* -------------------------------------------------------------- */
  /* room ambience                                                   */
  /* -------------------------------------------------------------- */

  setRoom(id: RoomId) {
    this.roomId = id
    if (this.ctx) this.applyRoom()
  }

  get currentRoom(): RoomId {
    return this.roomId
  }

  /** swap the impulse response + wet/dry balance with click-free ramps */
  private applyRoom() {
    if (!this.ctx || !this.roomConvolver || !this.roomWet || !this.roomDry || !this.roomPre || !this.roomFilter) return
    const room = resolveRoom(this.roomId)
    const now = this.ctx.currentTime
    this.roomPre.delayTime.setTargetAtTime(room.predelay, now, 0.02)
    this.roomFilter.frequency.setTargetAtTime(room.lowpass, now, 0.03)
    if (room.wet <= 0 || room.decay <= 0) {
      this.roomWet.gain.setTargetAtTime(0, now, 0.04)
      this.roomDry.gain.setTargetAtTime(1, now, 0.04)
      return
    }
    const key = `${ctxSampleTag(this.ctx)}:${room.id}`
    let ir = this.irCache.get(key)
    if (!ir) {
      ir = buildImpulseResponse(this.ctx, room)
      this.irCache.set(key, ir)
    }
    this.roomConvolver.buffer = ir
    // keep a touch of dry compensation so louder rooms don't clip the master
    this.roomWet.gain.setTargetAtTime(room.wet, now, 0.04)
    this.roomDry.gain.setTargetAtTime(1 - room.wet * 0.35, now, 0.04)
  }

  get kitId(): KitId {
    return this.currentKitId
  }

  get kitState(): KitLoadInfo {
    return this.kitLoadInfo
  }

  onKitLoad(cb: KitListener): () => void {
    this.kitListeners.add(cb)
    cb(this.kitLoadInfo)
    return () => {
      this.kitListeners.delete(cb)
    }
  }

  private emitKit(info: Partial<KitLoadInfo>) {
    this.kitLoadInfo = { ...this.kitLoadInfo, ...info }
    for (const cb of this.kitListeners) cb(this.kitLoadInfo)
  }

  /**
   * Decode kit samples into the live context.
   *
   *  - full load (default): every sample of the kit, with UI progress; identical
   *    in-flight requests for the same kit are deduped instead of restarted —
   *    this is what made rapid play clicks feel like an endless loading loop.
   *  - `{ only }`: decode just the given instruments (the loaded pattern's
   *    critical files) so the transport can start in a fraction of the time.
   *  - `{ quiet }`: finish the remaining samples without touching UI state.
   */
  async loadKitVoices(kit: SampleKitDef, opts: { only?: Set<InstrumentId>; quiet?: boolean } = {}): Promise<void> {
    if (!opts.only && !opts.quiet) {
      const inflight = this.fullLoad
      if (inflight && inflight.kitId === kit.id) return inflight.promise
      const p = this.doLoadKitVoices(kit, {})
      this.fullLoad = { kitId: kit.id, promise: p }
      void p.finally(() => {
        if (this.fullLoad?.promise === p) this.fullLoad = null
      })
      return p
    }
    return this.doLoadKitVoices(kit, opts)
  }

  private async doLoadKitVoices(kit: SampleKitDef, opts: { only?: Set<InstrumentId>; quiet?: boolean }): Promise<void> {
    const ctx = this.ctx
    if (!ctx) return
    const token = ++this.loadToken
    if (!opts.quiet) this.emitKit({ state: 'loading', progress: 0, kitId: kit.id })
    if (!this.trims) {
      try {
        const r = await fetch('/samples/manifest.json')
        if (r.ok) this.trims = (await r.json()) as Record<string, number>
      } catch {
        this.trims = {}
      }
    }
    const trims = this.trims ?? {}
    const layers = effectiveLayers(kit)
    const wanted: { file: string; gain: number; inst: InstrumentId }[] = []
    for (const [inst, ls] of Object.entries(layers) as [InstrumentId, { file: string; gain?: number }[]][]) {
      if (opts.only && !opts.only.has(inst)) continue
      for (const l of ls) {
        wanted.push({ file: l.file, gain: (l.gain ?? 1) * (trims[l.file] ?? 1), inst })
      }
    }
    // fetch order matters on slow links: the loaded pattern's instruments
    // decode first so playback can start musically-complete, then the rest
    const patternInsts = new Set<InstrumentId>(this.pattern?.tracks.map((t) => t.inst) ?? [])
    const criticalFiles = new Set(wanted.filter((w) => patternInsts.has(w.inst)).map((w) => w.file))
    const unique = [...new Set(wanted.map((w) => w.file))]
    if (!opts.only) unique.sort((a, b) => Number(criticalFiles.has(b)) - Number(criticalFiles.has(a)))
    let done = 0
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency ?? 4 : 4
    // A parallel burst of decodeAudioData pegs every core and starves the UI on
    // low-core machines — decode sequentially with yields there. On real
    // machines (and the small play-critical `only` set) stay parallel.
    if (!opts.only && cores < 4) {
      for (const file of unique) {
        const buf = await this.decodeLive(file, ctx)
        if (!buf) console.warn(`[atlas] failed to load sample ${file}`)
        done++
        if (!opts.quiet && token === this.loadToken) this.emitKit({ progress: done / unique.length })
        await new Promise((r) => setTimeout(r, 0))
      }
    } else {
      await Promise.all(
        unique.map(async (file) => {
          const buf = await this.decodeLive(file, ctx)
          if (!buf) console.warn(`[atlas] failed to load sample ${file}`)
          done++
          if (!opts.quiet && token === this.loadToken) this.emitKit({ progress: done / unique.length })
        })
      )
    }
    if (token !== this.loadToken) return
    // rebuild the voice map from everything decoded for this kit (not just the
    // `only` set) so previously warmed instruments stay playable
    const voices = new Map<InstrumentId, VoiceSet>()
    for (const [inst, ls] of Object.entries(layers) as [InstrumentId, { file: string; gain?: number }[]][]) {
      const buffers: AudioBuffer[] = []
      const gains: number[] = []
      for (const l of ls) {
        const buf = this.decoded.get(`live:${l.file}`)
        if (buf) {
          buffers.push(buf)
          gains.push((l.gain ?? 1) * (trims[l.file] ?? 1))
        }
      }
      if (buffers.length) voices.set(inst, { buffers, gains })
    }
    this.kitVoices = voices
    if (!opts.quiet) this.emitKit({ state: 'ready', progress: 1, kitId: kit.id })
  }

  /** decode (or reuse an in-flight decode of) one sample for the live context */
  private decodeLive(file: string, ctx: AudioContext): Promise<AudioBuffer | null> {
    const hit = this.decoded.get(`live:${file}`)
    if (hit) return Promise.resolve(hit)
    let p = this.fileLoads.get(file)
    if (!p) {
      p = this.decodeFile(file, ctx)
        .catch(() => null)
        .finally(() => {
          this.fileLoads.delete(file)
        })
      this.fileLoads.set(file, p)
    }
    return p
  }

  /** decode a file into an arbitrary (possibly offline) context */
  private async decodeFile(file: string, ctx: BaseAudioContext): Promise<AudioBuffer> {
    const key = `${ctxSampleTag(ctx)}:${file}`
    const hit = this.decoded.get(key)
    if (hit) return hit
    let raw = this.rawCache.get(file)
    if (!raw) {
      const r = await fetch(`/samples/${file}`)
      if (!r.ok) throw new Error(`fetch ${file}: ${r.status}`)
      raw = await r.arrayBuffer()
      this.rawCache.set(file, raw)
    }
    const buf = await ctx.decodeAudioData(raw.slice(0))
    this.decoded.set(key, buf)
    return buf
  }

  private buildTrackNodes(tracks: { id: string; vol: number; pan: number }[]) {
    if (!this.ctx) return
    const old = this.trackNodes
    this.trackNodes = new Map()
    for (const t of tracks) {
      const prev = old.get(t.id)
      const mix = this.trackMix.get(t.id)
      const g = prev?.g ?? this.ctx.createGain()
      const p = prev?.p ?? this.ctx.createStereoPanner()
      g.disconnect()
      p.disconnect()
      g.connect(p)
      p.connect(this.shaper!)
      g.gain.value = mix?.muted ? 0 : t.vol * (mix?.vol ?? 1)
      p.pan.value = mix?.pan ?? t.pan
      this.trackNodes.set(t.id, { g, p, soloable: true })
    }
    this.applyMix()
  }

  private applyMix() {
    if (!this.ctx) return
    const anySolo = [...this.trackMix.values()].some((m) => m.solo)
    for (const [id, node] of this.trackNodes) {
      const mix = this.trackMix.get(id)
      const base = this.pattern?.tracks.find((t) => t.id === id)?.vol ?? 0.9
      const audible = mix ? (!mix.muted && (!anySolo || mix.solo)) : true
      node.g.gain.setTargetAtTime(audible ? base * (mix?.vol ?? 1) : 0, this.ctx.currentTime, 0.015)
      if (mix) node.p.pan.setTargetAtTime(mix.pan, this.ctx.currentTime, 0.02)
    }
  }

  /* -------------------------------------------------------------- */
  /* public transport API                                            */
  /* -------------------------------------------------------------- */

  get isPlaying(): boolean {
    return this.playing
  }

  /** id of the pattern currently loaded into the transport (global-player check) */
  get loadedId(): string | null {
    return this.pattern?.id ?? null
  }

  get position(): PlayPos | null {
    return this.lastPos
  }

  get currentBpm(): number {
    return this.bpm
  }

  get currentSwing(): number {
    return this.swing
  }

  loadPattern(
    pattern: GroovePattern,
    opts?: { bpm?: number; swing?: number; kitId?: KitId; humanize?: number; mix?: Record<string, TrackMix> }
  ) {
    this.stop()
    this.pattern = pattern
    this.eventsByStep = new Map()
    for (const e of pattern.events) {
      const arr = this.eventsByStep.get(e.s)
      if (arr) arr.push(e)
      else this.eventsByStep.set(e.s, [e])
    }
    this.bpm = opts?.bpm ?? pattern.bpm
    this.swing = opts?.swing ?? pattern.swing
    this.humanize = opts?.humanize ?? 0
    if (opts?.kitId) {
      this.applyKitChain(opts.kitId)
    } else {
      this.applyKitChain(pattern.kitSuggestion)
    }
    this.trackMix = new Map(Object.entries(opts?.mix ?? {}))
    this.buildTrackNodes(pattern.tracks)
  }

  /** update edited pattern data without restarting transport (live edit) */
  updatePattern(pattern: GroovePattern) {
    this.pattern = pattern
    this.eventsByStep = new Map()
    for (const e of pattern.events) {
      const arr = this.eventsByStep.get(e.s)
      if (arr) arr.push(e)
      else this.eventsByStep.set(e.s, [e])
    }
    if (!this.ctx) return
    const ids = new Set(pattern.tracks.map((t) => t.id))
    for (const t of pattern.tracks) {
      if (this.trackNodes.has(t.id)) continue
      const g = this.ctx.createGain()
      const p = this.ctx.createStereoPanner()
      g.connect(p)
      p.connect(this.shaper!)
      this.trackNodes.set(t.id, { g, p, soloable: true })
    }
    for (const id of [...this.trackNodes.keys()]) {
      if (!ids.has(id)) {
        const n = this.trackNodes.get(id)!
        n.g.disconnect()
        n.p.disconnect()
        this.trackNodes.delete(id)
      }
    }
    this.applyMix()
  }

  async play() {
    const ctx = this.ensureContext()
    if (!this.pattern) return
    if (this.playing) return
    // track nodes are built in loadPattern, which can run before the
    // AudioContext exists (created here) — rebuild if they were skipped
    if (this.trackNodes.size === 0) this.buildTrackNodes(this.pattern.tracks)
    this.playing = true
    this.rng = mulberry32(this.seed)
    this.masterGain!.gain.cancelScheduledValues(ctx.currentTime)
    this.masterGain!.gain.setTargetAtTime(this.masterVol, ctx.currentTime, 0.03)
    this.pending = []
    this.lastPos = null
    this.emitPos(this.computePos())
    this.startRaf()
    // Never schedule a silent first loop — but don't block on the WHOLE kit
    // either: decode only the instruments this pattern actually hits (a small,
    // priority-ordered set) and start the clock the moment they're ready. The
    // remaining velocity layers / fallbacks finish decoding quietly behind it.
    const kit = resolveKit(this.currentKitId)
    if (this.kitLoadInfo.state !== 'ready' || this.kitLoadInfo.kitId !== kit.id || !this.kitVoices.size) {
      const patternInsts = new Set<InstrumentId>(this.pattern.tracks.map((t) => t.inst))
      await this.loadKitVoices(kit, { only: patternInsts })
      if (!this.playing) return // user hit stop/pause while we were loading
      void this.loadKitVoices(kit, { quiet: true })
    }
    // the context may have been created suspended (mount preload) — resume on
    // the play gesture BEFORE scheduling so times aren't computed on a frozen
    // clock. The resume promise can stay pending indefinitely when the call
    // arrives outside a trusted gesture (autoplay policy), so race it with a
    // short timeout: the scheduler always starts, and audio flows the moment
    // the context actually runs.
    if (ctx.state === 'suspended') {
      try {
        await Promise.race([ctx.resume(), new Promise((r) => setTimeout(r, 350))])
      } catch {
        /* resume without gesture — scheduling still works once it runs */
      }
      if (!this.playing) return
    }
    if (!this.timer) {
      this.nextStepTime = ctx.currentTime + 0.08
      this.schedStep = Math.max(0, this.schedStep)
      this.timer = setInterval(() => this.schedulerTick(), TICK_MS)
    }
  }

  pause() {
    if (!this.playing) return
    this.playing = false
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    this.stopRaf()
    const ctx = this.ctx
    if (ctx && this.masterGain) {
      // kill tails of already-scheduled notes
      this.masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.015)
    }
    this.pending = []
  }

  toggle() {
    if (this.playing) this.pause()
    else this.play()
  }

  stop() {
    this.pause()
    this.schedStep = 0
    this.lastPos = null
    this.emitPos(null)
  }

  setBpm(bpm: number) {
    this.bpm = Math.min(300, Math.max(30, bpm))
  }

  setSwing(swing: number) {
    this.swing = Math.min(0.66, Math.max(0, swing))
  }

  setHumanize(h: number) {
    this.humanize = Math.min(1, Math.max(0, h))
  }

  setSeed(seed: number) {
    this.seed = seed
  }

  setMetronome(on: boolean) {
    this.metronome = on
  }

  get metronomeOn(): boolean {
    return this.metronome
  }

  setKit(kitId: KitId) {
    this.applyKitChain(kitId)
  }

  /* -------------------------------------------------------------- */
  /* instant-start preloading                                        */
  /* -------------------------------------------------------------- */

  /**
   * Warm the current (or given) kit: create the AudioContext (fine while
   * suspended — decodeAudioData works) and decode every sample so the very
   * first press of play is sample-perfect. Call at app mount.
   */
  async preload(kitId?: KitId): Promise<void> {
    const kit = resolveKit(kitId ?? this.currentKitId)
    if (this.kitLoadInfo.state === 'ready' && this.kitLoadInfo.kitId === kit.id && this.kitVoices.size) return
    this.ensureContext()
    await this.loadKitVoices(kit)
  }

  /** fetch + decode a kit's samples into the shared cache without switching kits.
   *  Sequential with yields between files: a parallel burst of decodeAudioData
   *  saturates the main thread (and low-core machines) for its whole duration. */
  async warmKit(kitId: KitId): Promise<void> {
    const ctx = this.ctx
    if (!ctx) return
    const files = kitSampleFiles(resolveKit(kitId))
    for (const f of files) {
      if (!this.decoded.has(`live:${f}`)) await this.decodeLive(f, ctx)
      // hand a frame back to the UI between decodes
      await new Promise((r) => setTimeout(r, 0))
    }
  }

  /**
   * Decode every kit into the shared cache, one kit at a time (idle work).
   * Skipped on low-core machines — there, warming 10 kits is minutes of churn
   * that fights the UI; kits decode on demand the first time they're selected.
   */
  async preloadAll(): Promise<void> {
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency ?? 4 : 4
    if (cores < 4) return
    for (const kit of KIT_LIST) {
      await this.warmKit(kit.id)
    }
  }

  setMasterVolume(v: number) {
    this.masterVol = Math.min(1, Math.max(0, v))
    if (this.ctx && this.masterGain && this.playing) {
      this.masterGain.gain.setTargetAtTime(this.masterVol, this.ctx.currentTime, 0.03)
    }
  }

  get masterVolume(): number {
    return this.masterVol
  }

  setTrackMix(id: string, mix: Partial<TrackMix>) {
    const prev = this.trackMix.get(id) ?? { muted: false, solo: false, vol: 1, pan: 0 }
    this.trackMix.set(id, { ...prev, ...mix })
    this.applyMix()
  }

  getTrackMix(id: string): TrackMix | undefined {
    return this.trackMix.get(id)
  }

  /** audition a single hit (instrument label click, cell edit feedback) */
  preview(inst: InstrumentId, velocity = 110) {
    const ctx = this.ensureContext()
    const kit = resolveKit(this.currentKitId)
    const gain = ctx.createGain()
    gain.gain.value = 0.9
    const pan = ctx.createStereoPanner()
    gain.connect(pan)
    pan.connect(this.shaper!)
    const fire = () => {
      this.triggerSample(ctx, gain, ctx.currentTime + 0.01, inst, velocity * kitGroupVolume(kit, inst))
    }
    if (this.kitVoices.has(inst) && this.kitLoadInfo.kitId === kit.id) {
      fire()
    } else {
      // decode just this instrument's samples, then fire — no full-kit wait
      void this.loadKitVoices(kit, { only: new Set([inst]) }).then(fire)
    }
  }

  /* -------------------------------------------------------------- */
  /* position subscription                                           */
  /* -------------------------------------------------------------- */

  onPosition(cb: PosListener): () => void {
    this.posListeners.add(cb)
    cb(this.lastPos)
    return () => {
      this.posListeners.delete(cb)
    }
  }

  private emitPos(p: PlayPos | null) {
    this.lastPos = p
    for (const cb of this.posListeners) cb(p)
  }

  private startRaf() {
    const loop = () => {
      if (!this.playing) return
      const ctx = this.ctx
      if (ctx) {
        const now = ctx.currentTime
        while (this.pending.length > 1 && this.pending[1].time <= now) {
          this.pending.shift()
        }
        if (this.pending.length && this.pending[0].time <= now) {
          this.emitPos(this.computePos())
        }
      }
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  private stopRaf() {
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = 0
  }

  private computePos(): PlayPos | null {
    if (!this.pattern) return null
    const p0 = this.pending[0]
    if (!p0) return this.lastPos
    const spb = stepsPerBar(this.pattern.timeSignature, this.pattern.subdivision)
    const step = p0.step
    const stepInBar = step % spb
    return {
      step,
      stepInBar,
      bar: Math.floor(step / spb),
      beat: Math.floor(stepInBar / this.pattern.subdivision),
      progress: (step % this.pattern.subdivision) / this.pattern.subdivision,
    }
  }

  /* -------------------------------------------------------------- */
  /* scheduler core                                                  */
  /* -------------------------------------------------------------- */

  private schedulerTick() {
    const ctx = this.ctx
    const pattern = this.pattern
    if (!ctx || !pattern || !this.playing) return
    const total = pattern.timeSignature.num * pattern.subdivision * pattern.bars
    while (this.nextStepTime < ctx.currentTime + LOOKAHEAD) {
      const time = this.nextStepTime
      const step = this.schedStep % total
      this.scheduleStep(step, time)
      this.pending.push({ step, time })
      if (this.pending.length > 96) this.pending.shift()
      this.nextStepTime += stepDuration(pattern.timeSignature, pattern.subdivision, this.bpm)
      this.schedStep = (this.schedStep + 1) % total
    }
  }

  private scheduleStep(step: number, time: number) {
    const pattern = this.pattern!
    const ctx = this.ctx!
    const kit = resolveKit(this.currentKitId)
    const spb = stepsPerBar(pattern.timeSignature, pattern.subdivision)
    const stepInBar = step % spb
    const stepDur = stepDuration(pattern.timeSignature, pattern.subdivision, this.bpm)
    const swOff = swingOffset(stepInBar, pattern.subdivision, this.swing)
    const events = this.eventsByStep.get(step)
    const anySolo = [...this.trackMix.values()].some((m) => m.solo)

    if (events) {
      for (const e of events) {
        const mix = this.trackMix.get(e.t)
        if (mix?.muted) continue
        if (anySolo && !mix?.solo) continue
        if (e.p !== undefined && this.rng() > e.p) continue
        const track = pattern.tracks.find((t) => t.id === e.t)
        if (!track) continue
        const nodes = this.trackNodes.get(e.t)
        if (!nodes) continue
        let t = time + swOff
        let vel = e.v
        if (this.humanize > 0) {
          t += (this.rng() * 2 - 1) * this.humanize * 0.011
          vel = Math.max(8, Math.min(127, vel + (this.rng() * 2 - 1) * this.humanize * 26))
        }
        const gv = kitGroupVolume(kit, track.inst)
        const ratchet = e.r ?? 1
        if (ratchet > 1) {
          const spacing = (stepDur * 0.9) / ratchet
          for (let i = 0; i < ratchet; i++) {
            this.triggerSample(ctx, nodes.g, t + i * spacing, track.inst, vel * (1 - i * 0.12) * gv)
          }
        } else {
          this.triggerSample(ctx, nodes.g, t, track.inst, vel * gv)
        }
      }
    }

    if (this.metronome && stepInBar % pattern.subdivision === 0) {
      this.click(time, stepInBar === 0)
    }
  }

  /* -------------------------------------------------------------- */
  /* sample playback                                                 */
  /* -------------------------------------------------------------- */

  private click(time: number, strong: boolean) {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.value = strong ? 1568 : 1046
    const g = ctx.createGain()
    g.gain.setValueAtTime(strong ? 0.16 : 0.09, time)
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.04)
    osc.connect(g)
    g.connect(this.comp!)
    osc.start(time)
    osc.stop(time + 0.06)
  }

  /** velocity → gain curve (musical, compressed at the top) */
  private static velGain(vel: number): number {
    const v = Math.max(1, Math.min(127, vel)) / 127
    return Math.pow(v, 1.35)
  }

  /**
   * The single voice renderer — plays a recorded sample with velocity layer
   * selection. Used by the live scheduler and by preview().
   *
   * Hi-hats form a choke group: hitting a closed/pedal hat ducks and stops
   * any still-ringing open hat, the way a real pedal does.
   */
  triggerSample(
    ctx: BaseAudioContext,
    dest: AudioNode,
    time: number,
    inst: InstrumentId,
    velocity: number
  ) {
    const voices = this.kitVoices.get(inst)
    if (!voices || !voices.buffers.length) return
    const v = Math.max(1, Math.min(127, velocity)) / 127
    const idx = Math.min(voices.buffers.length - 1, Math.round(v * (voices.buffers.length - 1)))
    const buf = voices.buffers[idx]
    const src = ctx.createBufferSource()
    src.buffer = buf
    const g = ctx.createGain()
    g.gain.value = voices.gains[idx] * GrooveEngine.velGain(velocity)
    src.connect(g)
    g.connect(dest)
    src.start(time)
    if (ctx instanceof AudioContext) this.applyChoke(ctx, inst, src, g, time)
  }

  /** hi-hat articulation: close/pedal hats silence a ringing open hat */
  private applyChoke(
    ctx: AudioContext,
    inst: InstrumentId,
    src: AudioBufferSourceNode,
    g: GainNode,
    time: number
  ) {
    if (inst !== 'hatOpen' && inst !== 'hatClosed' && inst !== 'hatPedal') return
    const list = this.chokes.get('hat') ?? []
    for (const c of list) {
      if (c.src === src || c.time >= time) continue
      try {
        // duck fast (6ms) and stop just after — no click, natural pedal feel
        c.g.gain.setTargetAtTime(0, time, 0.006)
        c.src.stop(time + 0.04)
      } catch {
        /* already stopped */
      }
    }
    const alive = list.filter((c) => c.time > time - 8 && c.src !== src)
    alive.push({ src, g, time })
    if (alive.length > 12) alive.splice(0, alive.length - 12)
    this.chokes.set('hat', alive)
  }

  /** decode a file into an arbitrary (possibly offline) context */
  async decodeForContext(file: string, ctx: BaseAudioContext): Promise<AudioBuffer> {
    return this.decodeFile(file, ctx)
  }

  getRawCache(): Map<string, ArrayBuffer> {
    return this.rawCache
  }

  getTrims(): Record<string, number> {
    return this.trims ?? {}
  }
}

function ctxSampleTag(ctx: BaseAudioContext): string {
  // distinguish live vs offline contexts so buffers are never reused cross-context
  return ctx instanceof AudioContext ? 'live' : 'off'
}

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function softClipCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 1024
  const curve = new Float32Array(new ArrayBuffer(n * 4))
  const k = 1 + amount * 14
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1
    curve[i] = Math.tanh(k * x) / Math.tanh(k)
  }
  return curve
}

/* ------------------------------------------------------------------ */
/* offline render (WAV export) — real samples                          */
/* ------------------------------------------------------------------ */

export async function renderPatternWav(
  pattern: GroovePattern,
  opts: RenderOpts = {}
): Promise<AudioBuffer> {
  const loops = Math.max(1, Math.min(16, opts.loops ?? 2))
  const bpm = opts.bpm ?? pattern.bpm
  const swing = opts.swing ?? pattern.swing
  const kit = resolveKit(opts.kitId ?? pattern.kitSuggestion)
  const room = resolveRoom(opts.roomId)
  // the reverb tail needs space to ring out past the last hit
  const tail = (opts.tail ?? 1.4) + room.decay
  const barSec = barDuration(pattern.timeSignature, pattern.subdivision, bpm)
  const total = barSec * pattern.bars * loops + tail
  const sr = opts.sampleRate ?? 44100
  const OfflineAC: typeof OfflineAudioContext =
    typeof window !== 'undefined'
      ? window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext
      : null as never
  const ctx = new OfflineAC(2, Math.ceil(total * sr), sr)

  const master = ctx.createGain()
  master.gain.value = 0.9
  const low = ctx.createBiquadFilter()
  low.type = 'lowpass'
  low.frequency.value = kit.lowpass ?? 20000
  const shaper = ctx.createWaveShaper()
  shaper.curve = softClipCurve(0.35 + (kit.drive ?? 0) * 0.65)
  shaper.oversample = '2x'
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -12
  comp.knee.value = 24
  comp.ratio.value = 3
  shaper.connect(low)
  low.connect(comp)
  comp.connect(master)
  master.connect(ctx.destination)

  /* room ambience — the same parallel convolution bus as live playback */
  if (room.wet > 0 && room.decay > 0) {
    const roomDry = ctx.createGain()
    roomDry.gain.value = 1 - room.wet * 0.35
    const roomPre = ctx.createDelay(0.2)
    roomPre.delayTime.value = room.predelay
    const roomConvolver = ctx.createConvolver()
    roomConvolver.normalize = false
    roomConvolver.buffer = buildImpulseResponse(ctx, room)
    const roomFilter = ctx.createBiquadFilter()
    roomFilter.type = 'lowpass'
    roomFilter.frequency.value = room.lowpass
    const roomWet = ctx.createGain()
    roomWet.gain.value = room.wet
    comp.connect(roomDry)
    roomDry.connect(master)
    comp.connect(roomPre)
    roomPre.connect(roomConvolver)
    roomConvolver.connect(roomFilter)
    roomFilter.connect(roomWet)
    roomWet.connect(master)
  }

  // gather + decode all needed samples
  const layers = effectiveLayers(kit)
  const trims = await fetchTrims()
  const voiceMap = new Map<InstrumentId, { buffers: AudioBuffer[]; gains: number[] }>()
  const jobs: Promise<void>[] = []
  for (const [inst, ls] of Object.entries(layers) as [InstrumentId, { file: string; gain?: number }[]][]) {
    voiceMap.set(inst, { buffers: [], gains: [] })
    for (const l of ls) {
      jobs.push(
        engine
          .decodeForContext(l.file, ctx)
          .then((buf) => {
            const entry = voiceMap.get(inst)!
            entry.buffers.push(buf)
            entry.gains.push((l.gain ?? 1) * (trims[l.file] ?? 1))
          })
          .catch(() => {
            console.warn(`[atlas] wav export: missing sample ${l.file}`)
          })
      )
    }
  }
  await Promise.all(jobs)

  const rng = mulberry32(11)
  const stepDur = stepDuration(pattern.timeSignature, pattern.subdivision, bpm)
  const total_ = pattern.timeSignature.num * pattern.subdivision * pattern.bars
  const grid = new Map<number, RhythmEvent[]>()
  for (const e of pattern.events) {
    const arr = grid.get(e.s)
    if (arr) arr.push(e)
    else grid.set(e.s, [e])
  }
  // hat choke tracking for the offline render (same articulation as live)
  const renderChokes: { src: AudioBufferSourceNode; g: GainNode; time: number }[] = []
  const isHat = (inst: InstrumentId) => inst === 'hatOpen' || inst === 'hatClosed' || inst === 'hatPedal'
  const velGain = (vel: number) => {
    const v = Math.max(1, Math.min(127, vel)) / 127
    return Math.pow(v, 1.35)
  }
  for (let loop = 0; loop < loops; loop++) {
    const base = 0.05 + loop * barSec * pattern.bars
    for (let step = 0; step < total_; step++) {
      const events = grid.get(step)
      if (!events) continue
      const stepInBar = step % (pattern.timeSignature.num * pattern.subdivision)
      const swOff = swingOffset(stepInBar, pattern.subdivision, swing)
      for (const e of events) {
        const track = pattern.tracks.find((t) => t.id === e.t)
        if (!track) continue
        if (opts.soloInst && !opts.soloInst.has(track.inst)) continue
        if (e.p !== undefined && rng() > e.p) continue
        const voices = voiceMap.get(track.inst)
        if (!voices || !voices.buffers.length) continue
        const gv = kitGroupVolume(kit, track.inst)
        const t = base + step * stepDur + swOff
        const v = Math.max(1, Math.min(127, e.v)) / 127
        const idx = Math.min(voices.buffers.length - 1, Math.round(v * (voices.buffers.length - 1)))
        const ratchet = e.r ?? 1
        const fire = (time: number, velMul: number) => {
          const src = ctx.createBufferSource()
          src.buffer = voices.buffers[idx]
          const g = ctx.createGain()
          g.gain.value = voices.gains[idx] * velGain(e.v * velMul * gv)
          src.connect(g)
          g.connect(master)
          src.start(time)
          if (isHat(track.inst)) {
            for (const c of renderChokes) {
              if (c.src === src || c.time >= time) continue
              try {
                c.g.gain.setTargetAtTime(0, time, 0.006)
                c.src.stop(time + 0.04)
              } catch { /* already stopped */ }
            }
            renderChokes.push({ src, g, time })
          }
        }
        if (ratchet > 1) {
          const spacing = (stepDur * 0.9) / ratchet
          for (let i = 0; i < ratchet; i++) fire(t + i * spacing, 1 - i * 0.12)
        } else {
          fire(t, 1)
        }
      }
    }
  }
  return await ctx.startRendering()
}

async function fetchTrims(): Promise<Record<string, number>> {
  try {
    const r = await fetch('/samples/manifest.json')
    if (r.ok) return (await r.json()) as Record<string, number>
  } catch { /* offline-safe */ }
  return {}
}

export const engine = /* @__PURE__ */ (() => {
  return typeof window !== 'undefined' ? new GrooveEngine() : (null as unknown as GrooveEngine)
})()
