/**
 * Groovemap — canonical pattern data model.
 *
 * Musical time model:
 *  - A pattern spans `bars` bars of `timeSignature` at `subdivision` resolution.
 *  - stepsPerBar = timeSignature.num * subdivision  (beat unit = quarter for /4, eighth for /8)
 *  - Events store an absolute step index (bar * stepsPerBar + positionInBar).
 *  - This keeps the same rhythm renderable as a step grid, a rhythm circle,
 *    an intensity view, MIDI, WAV and a print card — always from one source of truth.
 */

export interface TimeSignature {
  /** beat units per bar */
  num: number
  /** 4 = quarter-note beat, 8 = eighth-note beat */
  den: 4 | 8
}

import type { InstrumentId } from './instruments'
export type { InstrumentId }

/** subdivisions per beat unit: 1,2,4 straight — 3,6 triplet */
export type Subdivision = 1 | 2 | 3 | 4 | 6

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type GrooveFeel = 'straight' | 'swung' | 'shuffled' | 'triplet' | 'broken'

export type InstrumentGroup = 'drums' | 'cymbals' | 'percussion'

export interface RhythmEvent {
  /** track id (pattern-local) */
  t: string
  /** absolute step index within the pattern */
  s: number
  /** 1..127 */
  v: number
  /** 0.05..1 — chance the hit actually fires */
  p?: number
  /** repeat count for rolls/ratchets (1 = single hit) */
  r?: number
}

export interface PatternTrack {
  id: string
  inst: InstrumentId
  label?: string
  /** 0..1 */
  vol: number
  /** -1..1 */
  pan: number
  muted?: boolean
}

export interface PatternVariation {
  name: string
  note: string
  /** track-id -> compact pattern string applied over the base track (same length grid) */
  overrides?: Record<string, string>
  /** simple textual suggestion when no concrete override is provided */
  hint?: string
}

export interface PatternSource {
  type: 'original' | 'traditional' | 'reference'
  note: string
}

export interface GroovePattern {
  id: string
  slug: string
  title: string
  summary: string
  description: string
  /** style family key, e.g. 'funk' */
  family: string
  genres: string[]
  tags: string[]
  difficulty: Difficulty
  bpm: number
  tempoRange: [number, number]
  timeSignature: TimeSignature
  bars: number
  subdivision: Subdivision
  feel: GrooveFeel
  /** 0..1 default swing applied at playback */
  swing: number
  syncopation: 0 | 1 | 2 | 3
  density: 0 | 1 | 2 | 3
  tracks: PatternTrack[]
  events: RhythmEvent[]
  kitSuggestion: KitId
  learning: {
    /** how the pattern is built, shown on detail page */
    construction: string
    /** trackId -> what this instrument contributes */
    roles: Record<string, string>
  }
  variations?: PatternVariation[]
  related?: string[]
  source: PatternSource
  featured?: boolean
  starter?: boolean
  schemaVersion: 1
}

export type KitId =
  | 'analog808'
  | 'analog909'
  | 'studio'
  | 'tight'
  | 'dusty'
  | 'perc'
  | 'synth'
  | 'studioBright'
  | 'studioRoom'
  | 'tr808Tape'
  | 'tr909Club'

export interface KitInfo {
  id: KitId
  name: string
  desc: string
}

/* ------------------------------------------------------------------ */
/* Authoring format (compact)                                          */
/* ------------------------------------------------------------------ */

/**
 * Compact authoring format for the pattern catalog.
 * Track strings: one char per step — X accent · x normal · o ghost ·
 * 2/3/4 ratchet roll · p probabilistic · . rest; `|` between bars optional.
 */
export interface AuthorPattern {
  id: string
  title: string
  family: string
  genres: string[]
  tags: string[]
  difficulty: Difficulty
  bpm: number
  tempoRange: [number, number]
  ts: [number, 4 | 8]
  bars?: number
  sub: Subdivision
  feel: GrooveFeel
  swing?: number
  sync: 0 | 1 | 2 | 3
  dens: 0 | 1 | 2 | 3
  kit: KitId
  summary: string
  description: string
  construction: string
  tracks: { inst: InstrumentId; pat: string; vol?: number; pan?: number }[]
  roles: Record<string, string>
  variations?: PatternVariation[]
  related?: string[]
  source: PatternSource
  featured?: boolean
  starter?: boolean
}

/* ------------------------------------------------------------------ */
/* Derived helpers                                                     */
/* ------------------------------------------------------------------ */

export function stepsPerBar(ts: TimeSignature, sub: Subdivision): number {
  return ts.num * sub
}

export function totalSteps(p: Pick<GroovePattern, 'timeSignature' | 'bars' | 'subdivision'>): number {
  return stepsPerBar(p.timeSignature, p.subdivision) * p.bars
}

/** duration of one step in seconds at given bpm */
export function stepDuration(
  ts: TimeSignature,
  sub: Subdivision,
  bpm: number
): number {
  const quarter = 60 / bpm
  const beatUnit = quarter * (4 / ts.den)
  return beatUnit / sub
}

/** bar duration in seconds */
export function barDuration(
  ts: TimeSignature,
  sub: Subdivision,
  bpm: number
): number {
  return stepDuration(ts, sub, bpm) * stepsPerBar(ts, sub)
}

export function eventsForTrack(p: GroovePattern, trackId: string): RhythmEvent[] {
  return p.events.filter((e) => e.t === trackId)
}

/** build a fast lookup: step -> events */
export function eventGrid(p: GroovePattern): Map<number, RhythmEvent[]> {
  const m = new Map<number, RhythmEvent[]>()
  for (const e of p.events) {
    const arr = m.get(e.s)
    if (arr) arr.push(e)
    else m.set(e.s, [e])
  }
  return m
}

/** velocity tiers used by the grid UI */
export const VELOCITY = { accent: 127, normal: 100, ghost: 40 } as const

export type VelocityTier = 'accent' | 'normal' | 'ghost' | 'custom'

export function velocityTier(v: number): VelocityTier {
  if (v >= 120) return 'accent'
  if (v >= 75) return 'normal'
  if (v > 0) return 'ghost'
  return 'custom'
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export interface ValidationIssue {
  level: 'error' | 'warn'
  msg: string
}

export function validatePattern(p: GroovePattern, knownSlugs?: Set<string>): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const ts = p.timeSignature
  if (!ts || ts.num < 1 || (ts.den !== 4 && ts.den !== 8))
    issues.push({ level: 'error', msg: 'invalid time signature' })
  const spb = stepsPerBar(ts, p.subdivision)
  const max = spb * Math.max(1, p.bars)
  const trackIds = new Set(p.tracks.map((t) => t.id))
  for (const e of p.events) {
    if (!trackIds.has(e.t))
      issues.push({ level: 'error', msg: `event on unknown track "${e.t}" (step ${e.s})` })
    if (e.s < 0 || e.s >= max)
      issues.push({ level: 'error', msg: `event step ${e.s} out of range 0..${max - 1}` })
    if (e.v < 1 || e.v > 127)
      issues.push({ level: 'error', msg: `event velocity ${e.v} out of range (step ${e.s})` })
  }
  if (p.tracks.length === 0) issues.push({ level: 'warn', msg: 'pattern has no tracks' })
  if (p.events.length === 0) issues.push({ level: 'warn', msg: 'pattern has no events' })
  if (knownSlugs) {
    for (const r of p.related ?? []) {
      if (!knownSlugs.has(r)) issues.push({ level: 'warn', msg: `related pattern "${r}" not found` })
    }
  }
  return issues
}
