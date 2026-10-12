import type { GroovePattern, RhythmEvent, PatternTrack, PatternVariation } from './types'
import { stepsPerBar, VELOCITY } from './types'
import type { InstrumentId } from './instruments'
import { INSTRUMENTS } from './instruments'
import { parseTrackString, mulberry32, hashSeed, euclideanEvents, eventsToTrackString } from './rhythm'
import type { PatternVariation as _PV } from './types'

/**
 * Pure pattern transformations. Every function returns a NEW pattern
 * (no mutation) so undo/redo and A/B comparison stay trivial.
 */

export function withEvents(p: GroovePattern, events: RhythmEvent[]): GroovePattern {
  return { ...p, events }
}

export function withTracks(p: GroovePattern, tracks: PatternTrack[]): GroovePattern {
  return { ...p, tracks }
}

/* ---------------- step editing ---------------- */

export function toggleStep(p: GroovePattern, trackId: string, step: number): GroovePattern {
  const existing = p.events.find((e) => e.t === trackId && e.s === step)
  if (existing) {
    return withEvents(p, p.events.filter((e) => e !== existing))
  }
  return withEvents(p, [...p.events, { t: trackId, s: step, v: VELOCITY.normal }])
}

export function setVelocity(p: GroovePattern, trackId: string, step: number, velocity: number): GroovePattern {
  return withEvents(
    p,
    p.events.map((e) => (e.t === trackId && e.s === step ? { ...e, v: Math.max(1, Math.min(127, velocity)) } : e))
  )
}

export function cycleVelocity(p: GroovePattern, trackId: string, step: number): { pattern: GroovePattern; added: boolean } {
  const existing = p.events.find((e) => e.t === trackId && e.s === step)
  if (!existing) {
    return { pattern: withEvents(p, [...p.events, { t: trackId, s: step, v: VELOCITY.normal }]), added: true }
  }
  if (existing.v >= 120) {
    return { pattern: withEvents(p, p.events.filter((e) => e !== existing)), added: false }
  }
  if (existing.v >= 75) {
    return { pattern: withEvents(p, p.events.map((e) => (e === existing ? { ...e, v: VELOCITY.accent } : e))), added: true }
  }
  return { pattern: withEvents(p, p.events.map((e) => (e === existing ? { ...e, v: VELOCITY.normal } : e))), added: true }
}

export function setEventProps(p: GroovePattern, trackId: string, step: number, props: Partial<RhythmEvent>): GroovePattern {
  return withEvents(
    p,
    p.events.map((e) => (e.t === trackId && e.s === step ? { ...e, ...props } : e))
  )
}

/* ---------------- track management ---------------- */

export function addTrack(p: GroovePattern, inst: InstrumentId): { pattern: GroovePattern; trackId: string } {
  let id: string = inst
  let n = 2
  while (p.tracks.some((t) => t.id === id)) {
    id = `${inst}${n++}`
  }
  const track: PatternTrack = { id, inst, vol: 0.85, pan: 0 }
  return { pattern: withTracks(p, [...p.tracks, track]), trackId: id }
}

export function removeTrack(p: GroovePattern, trackId: string): GroovePattern {
  return {
    ...withTracks(p, p.tracks.filter((t) => t.id !== trackId)),
    events: p.events.filter((e) => e.t !== trackId),
  }
}

export function moveTrack(p: GroovePattern, trackId: string, dir: -1 | 1): GroovePattern {
  const idx = p.tracks.findIndex((t) => t.id === trackId)
  const to = idx + dir
  if (idx < 0 || to < 0 || to >= p.tracks.length) return p
  const tracks = [...p.tracks]
  const [t] = tracks.splice(idx, 1)
  tracks.splice(to, 0, t)
  return withTracks(p, tracks)
}

export function updateTrack(p: GroovePattern, trackId: string, patch: Partial<PatternTrack>): GroovePattern {
  return withTracks(p, p.tracks.map((t) => (t.id === trackId ? { ...t, ...patch } : t)))
}

/* ---------------- structural edits ---------------- */

export function changeGrid(p: GroovePattern, ts: GroovePattern['timeSignature'], sub: GroovePattern['subdivision'], bars: number): GroovePattern {
  const oldSpb = stepsPerBar(p.timeSignature, p.subdivision)
  const newSpb = stepsPerBar(ts, sub)
  const newTotal = newSpb * bars
  const events: RhythmEvent[] = []
  for (const e of p.events) {
    // keep events whose position maps within the new grid
    const bar = Math.floor(e.s / oldSpb)
    const pos = e.s % oldSpb
    if (bar >= bars) continue
    const mapped = pos < newSpb ? pos : newSpb - 1
    const s = bar * newSpb + mapped
    if (s >= 0 && s < newTotal && !events.some((x) => x.t === e.t && x.s === s)) {
      events.push({ ...e, s })
    }
  }
  return { ...p, timeSignature: ts, subdivision: sub, bars, events }
}

export function shiftTrack(p: GroovePattern, trackId: string, dir: -1 | 1): GroovePattern {
  const total = stepsPerBar(p.timeSignature, p.subdivision) * p.bars
  return withEvents(
    p,
    p.events.map((e) => (e.t === trackId ? { ...e, s: (e.s + dir + total) % total } : e))
  )
}

/* ---------------- musical transformations ---------------- */

export function applyVariation(p: GroovePattern, v: PatternVariation): GroovePattern {
  if (!v.overrides) return p
  const spb = stepsPerBar(p.timeSignature, p.subdivision)
  const events = [...p.events]
  for (const [trackId, pat] of Object.entries(v.overrides)) {
    const track = p.tracks.find((t) => t.id === trackId)
    if (!track) continue
    // remove old events of the track, re-add from string
    const kept = events.filter((e) => e.t !== trackId)
    const norm = pat.replace(/\|/g, '')
    const total = spb * p.bars
    let padded = norm
    if (padded.length < total) padded += '.'.repeat(total - padded.length)
    kept.push(...parseTrackString(padded.slice(0, total), trackId))
    events.length = 0
    events.push(...kept)
  }
  return withEvents(p, events)
}

export function thinTrack(p: GroovePattern, trackId: string): GroovePattern {
  const rng = mulberry32(hashSeed(p.id + trackId))
  const evs = p.events.filter((e) => e.t === trackId)
  const remove = new Set(evs.filter((e) => e.v < 120 && rng() < 0.45))
  return withEvents(p, p.events.filter((e) => !remove.has(e)))
}

export function doubleTrack(p: GroovePattern, trackId: string): GroovePattern {
  const total = stepsPerBar(p.timeSignature, p.subdivision) * p.bars
  const grid = new Set(p.events.filter((e) => e.t === trackId).map((e) => e.s))
  const added: RhythmEvent[] = []
  for (const e of p.events) {
    if (e.t !== trackId) continue
    const next = e.s + total / 2
    if (Number.isInteger(next) && next < total && !grid.has(next)) {
      added.push({ t: trackId, s: next, v: Math.max(20, e.v - 30) })
    }
  }
  return withEvents(p, [...p.events, ...added])
}

export function addGhostNotes(p: GroovePattern, trackId: string): GroovePattern {
  const rng = mulberry32(hashSeed('ghost' + p.id + trackId + p.events.length))
  const spb = stepsPerBar(p.timeSignature, p.subdivision)
  const grid = new Set(p.events.filter((e) => e.t === trackId).map((e) => e.s))
  const added: RhythmEvent[] = []
  for (let s = 0; s < spb * p.bars; s++) {
    if (grid.has(s)) continue
    const inBar = s % spb
    // 16th off-positions only, when grid is fine enough
    if (p.subdivision >= 4 && inBar % 2 === 1 && rng() < 0.22) {
      added.push({ t: trackId, s, v: VELOCITY.ghost })
    }
  }
  return withEvents(p, [...p.events, ...added])
}

export function humanizeVelocities(p: GroovePattern, seed = Date.now()): GroovePattern {
  const rng = mulberry32(seed)
  return withEvents(
    p,
    p.events.map((e) => ({
      ...e,
      v: Math.max(12, Math.min(127, Math.round(e.v + (rng() * 2 - 1) * 22))),
    }))
  )
}

export function randomizeTrack(p: GroovePattern, trackId: string, seed = Date.now()): GroovePattern {
  const inst = p.tracks.find((t) => t.id === trackId)?.inst
  if (!inst) return p
  const group = INSTRUMENTS[inst].group
  const rng = mulberry32(seed)
  const spb = stepsPerBar(p.timeSignature, p.subdivision)
  const total = spb * p.bars
  const events: RhythmEvent[] = p.events.filter((e) => e.t !== trackId)
  // constraint profiles per group keep results musical
  const probPerStep = group === 'drums' ? 0.16 : group === 'cymbals' ? 0.4 : 0.2
  for (let s = 0; s < total; s++) {
    const inBar = s % spb
    const onBeat = inBar % p.subdivision === 0
    const r = rng()
    const chance = onBeat ? probPerStep * 2.2 : probPerStep
    if (r < chance) {
      const v = onBeat ? (rng() < 0.4 ? VELOCITY.accent : VELOCITY.normal) : rng() < 0.7 ? VELOCITY.normal : VELOCITY.ghost
      events.push({ t: trackId, s, v })
    }
  }
  return withEvents(p, events)
}

/** generate a complementary percussion layer that avoids existing onsets */
export function complementPercussion(p: GroovePattern, seed = Date.now()): { pattern: GroovePattern; trackId: string } {
  const candidates: InstrumentId[] = ['shaker', 'tambourine', 'clave', 'cowbell', 'congaHi', 'block']
  const used = new Set(p.tracks.map((t) => t.inst))
  const inst = candidates.find((c) => !used.has(c)) ?? 'shaker'
  const { pattern, trackId } = addTrack(p, inst)
  const rng = mulberry32(seed)
  const spb = stepsPerBar(pattern.timeSignature, pattern.subdivision)
  const occupied = new Set(p.events.map((e) => e.s))
  const events = [...pattern.events]
  for (let s = 0; s < spb * pattern.bars; s++) {
    const inBar = s % spb
    if (occupied.has(s)) continue
    const syncopated = inBar % pattern.subdivision !== 0
    if (rng() < (syncopated ? 0.3 : 0.12)) {
      events.push({ t: trackId, s, v: syncopated ? VELOCITY.ghost : VELOCITY.normal })
    }
  }
  return { pattern: withEvents(pattern, events), trackId }
}

export function addFillBar(p: GroovePattern, barIndex: number): GroovePattern {
  const spb = stepsPerBar(p.timeSignature, p.subdivision)
  if (barIndex < 0 || barIndex >= p.bars) return p
  const start = barIndex * spb
  const fillStart = start + spb - Math.max(4, spb / 4)
  const events = p.events.filter((e) => !(e.s >= fillStart && (e.t === 'hatClosed' || e.t === 'hatOpen')))
  const rng = mulberry32(start + 1)
  const added: RhythmEvent[] = []
  const exists = (t: string, s: number) => events.some((e) => e.t === t && e.s === s)
  for (let s = fillStart; s < start + spb; s++) {
    const t = s === start + spb - 1 ? 'tomLow' : s % 2 === 0 ? 'snare' : rng() < 0.5 ? 'snare' : 'tomHi'
    if (!exists(t, s)) added.push({ t, s, v: s === fillStart ? VELOCITY.accent : VELOCITY.normal })
  }
  // ensure snare/tom tracks exist
  let pattern = p
  for (const t of added.map((a) => a.t)) {
    if (!pattern.tracks.some((tr) => tr.id === t)) {
      pattern = addTrack(pattern, t as InstrumentId).pattern
    }
  }
  return withEvents(pattern, [...pattern.events, ...added])
}

export function densify(p: GroovePattern): GroovePattern {
  const spb = stepsPerBar(p.timeSignature, p.subdivision)
  const grid = new Set(p.events.map((e) => `${e.t}:${e.s}`))
  const added: RhythmEvent[] = []
  for (let s = 0; s < spb * p.bars; s++) {
    const inBar = s % spb
    const onBeat = inBar % p.subdivision === 0
    if (onBeat && !grid.has(`kick:${s}`) && s % (spb / 2) === 0) {
      added.push({ t: 'kick', s, v: VELOCITY.normal })
    }
  }
  let pattern = p
  if (added.length && !pattern.tracks.some((t) => t.id === 'kick')) {
    pattern = addTrack(pattern, 'kick').pattern
  }
  return withEvents(pattern, [...pattern.events, ...added])
}

export function simplify(p: GroovePattern): GroovePattern {
  const spb = stepsPerBar(p.timeSignature, p.subdivision)
  return withEvents(
    p,
    p.events.filter((e) => {
      const inBar = e.s % spb
      const onBeat = inBar % p.subdivision === 0
      const onOff = inBar % Math.max(1, p.subdivision / 2) === 0
      return e.v >= 100 ? true : onBeat || (onOff && e.v >= 75)
    })
  )
}

export function euclidFillTrack(p: GroovePattern, trackId: string, pulses: number, steps: number, rotate: number): GroovePattern {
  const newEvents = p.events.filter((e) => e.t !== trackId)
  const evs = euclideanEvents(pulses, steps, rotate, trackId, VELOCITY.normal)
  return withEvents(p, [...newEvents, ...evs])
}

export function trackToCompactString(p: GroovePattern, trackId: string): string {
  const spb = stepsPerBar(p.timeSignature, p.subdivision)
  return eventsToTrackString(p.events.filter((e) => e.t === trackId), spb, p.bars)
}

export function cloneWithId(p: GroovePattern, id: string, title?: string): GroovePattern {
  return { ...p, id, slug: id, title: title ?? `${p.title} (copy)`, source: { type: 'original', note: p.source?.note ?? 'User composition' } }
}
