import type { GroovePattern, RhythmEvent, Subdivision, TimeSignature } from './types'
import { stepsPerBar, VELOCITY } from './types'
import type { InstrumentId } from './instruments'

/* ------------------------------------------------------------------ */
/* Seeded RNG (repeatable humanization / randomization)                */
/* ------------------------------------------------------------------ */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/* ------------------------------------------------------------------ */
/* Compact pattern-string notation                                     */
/*   X accent (127) · x normal (100) · o ghost (40) · 2/3/4 ratchet     */
/*   p probabilistic (55%) · . rest — one char per step, `|` per bar    */
/* ------------------------------------------------------------------ */

const CHAR_MAP: Record<string, { v: number; r?: number; p?: number }> = {
  X: { v: VELOCITY.accent },
  x: { v: VELOCITY.normal },
  o: { v: VELOCITY.ghost },
  '2': { v: 110, r: 2 },
  '3': { v: 100, r: 3 },
  '4': { v: 100, r: 4 },
  p: { v: 100, p: 0.55 },
  P: { v: 127, p: 0.75 },
}

export function parseTrackString(pat: string, trackId: string, offset = 0): RhythmEvent[] {
  const events: RhythmEvent[] = []
  let step = offset
  for (const ch of pat) {
    if (ch === '|') continue
    const hit = CHAR_MAP[ch]
    if (hit) events.push({ t: trackId, s: step, v: hit.v, r: hit.r, p: hit.p })
    step++
  }
  return events
}

export function trackStringLength(pat: string): number {
  let n = 0
  for (const ch of pat) if (ch !== '|') n++
  return n
}

/** serialize events of one track back into compact notation (per bar) */
export function eventsToTrackString(events: RhythmEvent[], steps: number, bars: number): string {
  const total = steps * bars
  const cells = new Array<string>(total).fill('.')
  for (const e of events) {
    if (e.s < 0 || e.s >= total) continue
    if (e.r && e.r > 1) cells[e.s] = String(Math.min(4, e.r))
    else if (e.p !== undefined) cells[e.s] = e.v >= 120 ? 'P' : 'p'
    else if (e.v >= 120) cells[e.s] = 'X'
    else if (e.v >= 75) cells[e.s] = 'x'
    else cells[e.s] = 'o'
  }
  const out: string[] = []
  for (let b = 0; b < bars; b++) out.push(cells.slice(b * steps, (b + 1) * steps).join(''))
  return out.join('|')
}

/* ------------------------------------------------------------------ */
/* Count labels (1 e & a — meter aware)                                */
/* ------------------------------------------------------------------ */

export function stepLabels(ts: TimeSignature, sub: Subdivision): string[] {
  const spb = stepsPerBar(ts, sub)
  const labels: string[] = new Array(spb)
  if (sub === 1) {
    for (let i = 0; i < ts.num; i++) labels[i] = String(i + 1)
    return labels
  }
  if (sub === 2) {
    for (let i = 0; i < ts.num; i++) {
      labels[i * 2] = String(i + 1)
      labels[i * 2 + 1] = '&'
    }
    return labels
  }
  if (sub === 3) {
    for (let i = 0; i < ts.num; i++) {
      labels[i * 3] = String(i + 1)
      labels[i * 3 + 1] = 'la'
      labels[i * 3 + 2] = 'li'
    }
    return labels
  }
  if (sub === 4) {
    for (let i = 0; i < ts.num; i++) {
      labels[i * 4] = String(i + 1)
      labels[i * 4 + 1] = 'e'
      labels[i * 4 + 2] = '&'
      labels[i * 4 + 3] = 'a'
    }
    return labels
  }
  // sub 6 — sixteenth triplets
  for (let i = 0; i < ts.num; i++) {
    labels[i * 6] = String(i + 1)
    labels[i * 6 + 1] = 'e'
    labels[i * 6 + 2] = 'l'
    labels[i * 6 + 3] = '&'
    labels[i * 6 + 4] = 'l'
    labels[i * 6 + 5] = 'a'
  }
  return labels
}

/* ------------------------------------------------------------------ */
/* Swing                                                               */
/* ------------------------------------------------------------------ */

/**
 * Timing offset in [0..1] of a step duration for a given step-in-pair index.
 * Swing applies to even grids (sub 2 / 4): odd positions within each pair
 * are delayed. Triplet grids (sub 3 / 6) already encode the shuffle.
 */
export function swingOffset(stepInBar: number, sub: Subdivision, swing: number): number {
  if (swing <= 0) return 0
  if (sub !== 2 && sub !== 4) return 0
  if (stepInBar % 2 === 0) return 0
  // 0..1 fraction of a step; clamp for musicality
  return Math.min(0.66, swing) * (sub === 2 ? 1 : 0.5)
}

/* ------------------------------------------------------------------ */
/* Euclidean rhythms (Bjorklund)                                       */
/* ------------------------------------------------------------------ */

/** Bjorklund's algorithm — distribute `pulses` as evenly as possible over `steps`. */
export function euclidean(pulses: number, steps: number, rotate = 0): boolean[] {
  if (steps <= 0) return []
  const p = Math.max(0, Math.min(pulses, steps))
  const pattern: boolean[] = new Array(steps).fill(false)
  if (p === 0) return pattern
  if (p === steps) return new Array(steps).fill(true) as boolean[]
  // build via bucket accumulation
  let bucket = 0
  for (let i = 0; i < steps; i++) {
    bucket += p
    if (bucket >= steps) {
      bucket -= steps
      pattern[i] = true
    }
  }
  // rotate
  const r = ((rotate % steps) + steps) % steps
  if (r === 0) return pattern
  return [...pattern.slice(r), ...pattern.slice(0, r)]
}

export function euclideanEvents(
  pulses: number,
  steps: number,
  rotate: number,
  trackId: string,
  velocity: number = VELOCITY.normal,
  repeat = 1
): RhythmEvent[] {
  const pattern = euclidean(pulses, steps, rotate)
  const events: RhythmEvent[] = []
  for (let i = 0; i < steps; i++) {
    if (pattern[i]) events.push({ t: trackId, s: i, v: velocity, r: repeat })
  }
  return events
}

/* ------------------------------------------------------------------ */
/* Rhythm fingerprint (similarity for related patterns)                */
/* ------------------------------------------------------------------ */

/** 16-step normalized onset vector per track — used to suggest related patterns */
export function onsetVector(p: GroovePattern, trackId: string, bins = 16): number[] {
  const v = new Array<number>(bins).fill(0)
  const total = p.timeSignature.num * p.subdivision * p.bars
  for (const e of p.events) {
    if (e.t !== trackId) continue
    const bin = Math.floor((e.s / total) * bins)
    if (bin >= 0 && bin < bins) v[bin] += e.v / 127
  }
  return v
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  if (na === 0 || nb === 0) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

/* ------------------------------------------------------------------ */
/* Grid helpers                                                        */
/* ------------------------------------------------------------------ */

export function isBeatBoundary(stepInBar: number, sub: Subdivision): boolean {
  return stepInBar % sub === 0
}

export function barOfStep(step: number, stepsPerBar_: number): number {
  return Math.floor(step / stepsPerBar_)
}

/** group steps into beats for the grid header */
export function beatStarts(ts: TimeSignature, sub: Subdivision): number[] {
  const starts: number[] = []
  for (let b = 0; b < ts.num; b++) starts.push(b * sub)
  return starts
}

/** suggested subdivision choices per time signature */
export function subdivisionChoices(ts: TimeSignature): { value: Subdivision; label: string }[] {
  if (ts.den === 8) {
    return [
      { value: 1, label: '8ths' },
      { value: 2, label: '16ths' },
      { value: 3, label: '8th triplets' },
    ]
  }
  return [
    { value: 1, label: 'quarters' },
    { value: 2, label: '8ths' },
    { value: 3, label: '8th triplets' },
    { value: 4, label: '16ths' },
    { value: 6, label: '16th triplets' },
  ]
}

export type { InstrumentId }
