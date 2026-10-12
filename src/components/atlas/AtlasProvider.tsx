'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { GroovePattern, KitId } from '@/lib/atlas/types'
import { engine, type PlayPos, type TrackMix, type KitLoadInfo } from '@/lib/atlas/audio/engine'
import type { InstrumentId } from '@/lib/atlas/instruments'
import type { RoomId } from '@/lib/atlas/audio/rooms'
import { loadSettings, saveSettings } from '@/lib/atlas/storage'

/**
 * AtlasProvider — single React binding around the shared audio engine.
 * React state mirrors transport parameters; the engine stays the source of
 * truth for audio timing. The playhead is delivered by direct subscription
 * (usePlayhead) so only playhead components re-render at animation rate.
 */

export interface LoadOpts {
  play?: boolean
  bpm?: number
  swing?: number
  kitId?: KitId
  humanize?: number
  id?: string
}

interface AtlasContextValue {
  pattern: GroovePattern | null
  playingId: string | null
  /**
   * id of the groove the user actually STARTED listening to — the anchor of
   * the current listening session. Silent staging (open a page, nothing
   * audible) never sets this — only a real play gesture does. It persists
   * through pause AND stop (so the mini player can always resume/replay it)
   * and is only replaced by the next play gesture. Merely visiting pages
   * never sets it, so the mini player never pops up for visited pages.
   */
  activeId: string | null
  /**
   * true when the user explicitly HID the mini player (the X button). It
   * stays hidden until the next real play gesture, which reveals it again.
   */
  miniHidden: boolean
  /** dismiss the mini player until the next play gesture */
  hideMini: () => void
  playing: boolean
  bpm: number
  swing: number
  humanize: number
  metronome: boolean
  kitId: KitId
  roomId: RoomId
  masterVolume: number
  mix: Record<string, TrackMix>
  loadPattern: (p: GroovePattern, opts?: LoadOpts) => void
  /** canonical "make this the audible groove" — no-op re-play if it's already loaded */
  playPattern: (p: GroovePattern, opts?: LoadOpts) => void
  updatePattern: (p: GroovePattern) => void
  play: () => void
  pause: () => void
  stop: () => void
  togglePlay: () => void
  setBpm: (n: number) => void
  setSwing: (n: number) => void
  setHumanize: (n: number) => void
  setMetronome: (b: boolean) => void
  setKit: (k: KitId) => void
  setRoom: (r: RoomId) => void
  setMasterVolume: (n: number) => void
  setTrackMix: (id: string, mix: Partial<TrackMix>) => void
  preview: (inst: InstrumentId, vel?: number) => void
}

const AtlasContext = createContext<AtlasContextValue | null>(null)

export function AtlasProvider({ children }: { children: React.ReactNode }) {
  const [pattern, setPattern] = useState<GroovePattern | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [miniHidden, setMiniHidden] = useState(false)
  const [playing, setPlaying] = useState(false)
  /** synchronous mirror of playingId for callbacks that must not go stale */
  const playingIdRef = useRef<string | null>(null)
  const [bpm, setBpmState] = useState(120)
  const [swing, setSwingState] = useState(0)
  const [humanize, setHumanizeState] = useState(0)
  const [metronome, setMetronomeState] = useState(false)
  const [kitId, setKitState] = useState<KitId>('analog909')
  const [roomId, setRoomState] = useState<RoomId>('close')
  const [masterVolume, setMasterVolState] = useState(0.9)
  const [mix, setMix] = useState<Record<string, TrackMix>>({})
  const settingsLoaded = useRef(false)

  // restore settings once (deferred so storage access stays off the render path)
  useEffect(() => {
    if (settingsLoaded.current) return
    settingsLoaded.current = true
    const t = setTimeout(() => {
      const s = loadSettings()
      setKitState(s.kitId)
      setMasterVolState(s.masterVolume)
      setMetronomeState(s.metronome)
      const room = (s.roomId ?? 'close') as RoomId
      setRoomState(room)
      engine?.setKit(s.kitId)
      engine?.setMasterVolume(s.masterVolume)
      engine?.setMetronome(s.metronome)
      engine?.setRoom(room)
      // instant-start: decode the saved kit now (works on the suspended
      // context), then warm every other kit well after first paint so early
      // interactions (first play click!) never compete with background work
      void engine?.preload(s.kitId).then(() => {
        const idle: (cb: () => void) => void =
          (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback ??
          ((cb: () => void) => setTimeout(cb, 2500))
        idle(() => void engine?.preloadAll())
      })
    }, 0)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!settingsLoaded.current) return
    saveSettings({ kitId, masterVolume, metronome, roomId })
  }, [kitId, masterVolume, metronome, roomId])

  const loadPattern = useCallback((p: GroovePattern, opts?: LoadOpts) => {
    const clone: GroovePattern = structuredClone(p)
    const kit = opts?.kitId ?? clone.kitSuggestion
    const useBpm = opts?.bpm ?? clone.bpm
    const useSwing = opts?.swing ?? clone.swing
    const useHumanize = opts?.humanize ?? 0
    const id = opts?.id ?? clone.id
    const audible = opts?.play !== false
    setPattern(clone)
    setPlayingId(id)
    playingIdRef.current = id
    if (audible) {
      setActiveId(id) // a real (re)start of playback — the mini player follows
      setMiniHidden(false) // a fresh play gesture always reveals the mini player again
    }
    setBpmState(useBpm)
    setSwingState(useSwing)
    setHumanizeState(useHumanize)
    setKitState(kit)
    setMix({})
    engine?.loadPattern(clone, { bpm: useBpm, swing: useSwing, kitId: kit, humanize: useHumanize })
    if (audible) {
      engine?.play()
      setPlaying(true)
    }
  }, [])

  /**
   * playPattern — the GLOBAL PLAYER contract. If this exact pattern is already
   * loaded into the engine, keep its transport (position/bpm) and just ensure
   * it's audible — never reload (which would stop() and restart the groove).
   * Only a genuinely different pattern goes through loadPattern.
   */
  const playPattern = useCallback((p: GroovePattern, opts?: LoadOpts) => {
    const sameId = playingId != null && (opts?.id ?? p.id) === playingId && engine?.loadedId === p.id
    if (sameId) {
      if (engine?.isPlaying) {
        if (opts?.play === false) {
          engine.pause()
          setPlaying(false)
        }
        return
      }
      if (opts?.play !== false) {
        void engine?.play()
        setPlaying(true)
        setActiveId(playingId)
        setMiniHidden(false)
      }
      return
    }
    loadPattern(p, opts)
  }, [playingId, loadPattern])

  const updatePattern = useCallback((p: GroovePattern) => {
    setPattern(p)
    engine?.updatePattern(p)
  }, [])

  const play = useCallback(() => {
    engine?.play()
    setPlaying(true)
    // resuming an audible session counts as user intent — surface the mini player
    if (playingIdRef.current) setActiveId(playingIdRef.current)
    setMiniHidden(false)
  }, [])

  const pause = useCallback(() => {
    engine?.pause()
    setPlaying(false)
  }, [])

  const stop = useCallback(() => {
    engine?.stop()
    setPlaying(false)
    // stop ends audible playback but does NOT kill the listening session —
    // activeId survives so the mini player stays around showing the groove,
    // ready to replay it. Only the user's X dismisses it (until the next play).
  }, [])

  const hideMini = useCallback(() => setMiniHidden(true), [])

  const togglePlay = useCallback(() => {
    if (!pattern) return
    if (engine?.isPlaying) {
      engine.pause()
      setPlaying(false)
    } else {
      engine?.play()
      setPlaying(true)
      setActiveId(playingIdRef.current ?? playingId)
      setMiniHidden(false)
    }
  }, [pattern, playingId])

  const setBpm = useCallback((n: number) => {
    setBpmState(n)
    engine?.setBpm(n)
  }, [])

  const setSwing = useCallback((n: number) => {
    setSwingState(n)
    engine?.setSwing(n)
  }, [])

  const setHumanize = useCallback((n: number) => {
    setHumanizeState(n)
    engine?.setHumanize(n)
  }, [])

  const setMetronome = useCallback((b: boolean) => {
    setMetronomeState(b)
    engine?.setMetronome(b)
  }, [])

  const setKit = useCallback((k: KitId) => {
    setKitState(k)
    engine?.setKit(k)
  }, [])

  const setRoom = useCallback((r: RoomId) => {
    setRoomState(r)
    engine?.setRoom(r)
  }, [])

  const setMasterVolume = useCallback((n: number) => {
    setMasterVolState(n)
    engine?.setMasterVolume(n)
  }, [])

  const setTrackMix = useCallback((id: string, partial: Partial<TrackMix>) => {
    setMix((prev) => {
      const next = { ...prev, [id]: { ...(prev[id] ?? { muted: false, solo: false, vol: 1, pan: 0 }), ...partial } }
      engine?.setTrackMix(id, next[id])
      return next
    })
  }, [])

  const preview = useCallback((inst: InstrumentId, vel?: number) => {
    engine?.preview(inst, vel)
  }, [])

  const value = useMemo<AtlasContextValue>(
    () => ({
      pattern,
      playingId,
      activeId,
      miniHidden,
      hideMini,
      playing,
      bpm,
      swing,
      humanize,
      metronome,
      kitId,
      roomId,
      masterVolume,
      mix,
      loadPattern,
      playPattern,
      updatePattern,
      play,
      pause,
      stop,
      togglePlay,
      setBpm,
      setSwing,
      setHumanize,
      setMetronome,
      setKit,
      setRoom,
      setMasterVolume,
      setTrackMix,
      preview,
    }),
    [
      pattern, playingId, activeId, miniHidden, hideMini, playing, bpm, swing, humanize, metronome, kitId, roomId, masterVolume, mix,
      loadPattern, playPattern, updatePattern, play, pause, stop, togglePlay, setBpm, setSwing, setHumanize, setMetronome, setKit, setRoom, setMasterVolume, setTrackMix, preview,
    ]
  )

  return <AtlasContext.Provider value={value}>{children}</AtlasContext.Provider>
}

export function useAtlas(): AtlasContextValue {
  const ctx = useContext(AtlasContext)
  if (!ctx) throw new Error('useAtlas must be used inside AtlasProvider')
  return ctx
}

/** playhead subscription — re-renders only this component at animation rate */
export function usePlayhead(): PlayPos | null {
  const [pos, setPos] = useState<PlayPos | null>(null)
  useEffect(() => {
    if (!engine) return
    return engine.onPosition((p) => setPos(p))
  }, [])
  return pos
}

/** kit sample-loading subscription — for transport "loading kit" indicators */
export function useKitLoad(): KitLoadInfo | null {
  const [info, setInfo] = useState<KitLoadInfo | null>(null)
  useEffect(() => {
    if (!engine) return
    return engine.onKitLoad((i) => setInfo(i))
  }, [])
  return info
}
