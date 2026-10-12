import type { GroovePattern, RhythmEvent, PatternTrack, Subdivision, Difficulty, GrooveFeel, KitId } from './types'
import { validatePattern } from './types'

/**
 * Shareable links — the pattern's musical data is serialized into a compact,
 * versioned payload embedded in the URL hash. Nothing is sent to a server.
 *
 * Payload format v1:
 *   { v:1, t, ts:[n,d], b, sub, bpm, sw, k, tr:[[inst,vol,pan]...], ev:[[ti,s,v,p?,r?]...] }
 * encoded as JSON → UTF-8 → base64url. Size-capped and strictly validated on load.
 */

const MAX_LENGTH = 9000

interface SharePayload {
  v: 1
  t: string
  ts: [number, 4 | 8]
  b: number
  sub: Subdivision
  bpm: number
  sw: number
  k: KitId
  tr: [string, number, number][]
  ev: (number | string)[][]
}

export function encodeShare(pattern: GroovePattern): string {
  const trackIndex = new Map<string, number>()
  const tr: [string, number, number][] = pattern.tracks.map((t, i) => {
    trackIndex.set(t.id, i)
    return [t.inst, Math.round(t.vol * 100) / 100, t.pan]
  })
  const ev = pattern.events.map((e) => [
    trackIndex.get(e.t) ?? 0,
    e.s,
    e.v,
    e.p !== undefined ? Math.round(e.p * 100) / 100 : 1,
    e.r !== undefined && e.r > 1 ? e.r : 1,
  ])
  const payload: SharePayload = {
    v: 1,
    t: pattern.title.slice(0, 80),
    ts: [pattern.timeSignature.num, pattern.timeSignature.den],
    b: pattern.bars,
    sub: pattern.subdivision,
    bpm: pattern.bpm,
    sw: Math.round(pattern.swing * 100) / 100,
    k: pattern.kitSuggestion,
    tr,
    ev,
  }
  const json = JSON.stringify(payload)
  const b64 = base64UrlEncode(json)
  if (b64.length > MAX_LENGTH) {
    throw new Error('Pattern too large to share via URL — export JSON instead.')
  }
  return b64
}

export function decodeShare(code: string): GroovePattern {
  const json = base64UrlDecode(code)
  const raw = JSON.parse(json) as SharePayload
  if (!raw || raw.v !== 1) throw new Error('Unsupported share payload version')
  if (!Array.isArray(raw.tr) || raw.tr.length === 0 || raw.tr.length > 24) {
    throw new Error('Invalid track data')
  }
  if (!Array.isArray(raw.ev) || raw.ev.length > 4096) throw new Error('Invalid event data')

  const tracks: PatternTrack[] = raw.tr.map((row, i) => ({
    id: `t${i}`,
    inst: row[0] as PatternTrack['inst'],
    vol: clamp(row[1] ?? 0.9, 0, 1),
    pan: clamp(row[2] ?? 0, -1, 1),
  }))
  const events: RhythmEvent[] = raw.ev.map((row) => {
    const ti = Number(row[0])
    const e: RhythmEvent = { t: `t${ti}`, s: Number(row[1]), v: clamp(Math.round(Number(row[2])), 1, 127) }
    const p = Number(row[3] ?? 1)
    if (p > 0 && p < 1) e.p = clamp(p, 0.05, 1)
    const r = Number(row[4] ?? 1)
    if (r > 1) e.r = Math.min(4, Math.round(r))
    return e
  })

  const pattern: GroovePattern = {
    id: 'shared',
    slug: 'shared',
    title: typeof raw.t === 'string' && raw.t ? raw.t : 'Shared Groove',
    summary: 'A groove restored from a share link.',
    description: 'This pattern was restored entirely from the data embedded in the link. Open it in the Groove Lab to edit, save or export it.',
    family: 'experimental',
    genres: ['Shared'],
    tags: ['shared'],
    difficulty: 'intermediate',
    bpm: clamp(Math.round(raw.bpm) || 120, 30, 300),
    tempoRange: [60, 200],
    timeSignature: { num: raw.ts?.[0] ?? 4, den: raw.ts?.[1] === 8 ? 8 : 4 },
    bars: clamp(Math.round(raw.b) || 1, 1, 8),
    subdivision: (raw.sub ?? 4) as Subdivision,
    feel: 'straight',
    swing: clamp(raw.sw ?? 0, 0, 0.66),
    syncopation: 1,
    density: 1,
    tracks,
    events,
    kitSuggestion: raw.k ?? 'analog909',
    learning: { construction: 'Shared pattern — no authored notes.', roles: {} },
    related: [],
    source: { type: 'original', note: 'Shared by URL' },
    schemaVersion: 1,
  }
  const issues = validatePattern(pattern)
  if (issues.some((i) => i.level === 'error')) {
    throw new Error('Shared pattern failed validation')
  }
  return pattern
}

export function shareUrl(pattern: GroovePattern): string {
  if (typeof window === 'undefined') return ''
  const code = encodeShare(pattern)
  return `${window.location.origin}${window.location.pathname}#/s=${code}`
}

function clamp(v: number, min: number, max: number): number {
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : min
}

function base64UrlEncode(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64 + '==='.slice((b64.length + 3) % 4)
  const bin = atob(pad)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

/* unused imports guard */
export type { Difficulty, GrooveFeel }
