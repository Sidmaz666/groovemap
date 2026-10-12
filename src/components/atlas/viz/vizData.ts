import { PATTERNS, FAMILY_LIST } from '@/lib/atlas/patterns'
import { FAMILY_KNOWLEDGE } from '@/lib/atlas/knowledge'
import type { GroovePattern } from '@/lib/atlas/types'

/**
 * vizData — the whole dataset, reshaped once for the About → Data Atlas
 * visualizations. Everything is computed deterministically from the live
 * PATTERNS catalog at module load: family colors (golden-angle hues), the
 * family relation graph (knowledge links + cross-family related patterns),
 * the family→meter→pattern hierarchy, scatter points and 3D galaxy positions.
 *
 * No randomness that isn't seeded — every jitter and cluster offset derives
 * from the pattern id, so renders are identical across processes.
 */

/* ------------------------------------------------------------------ */
/* seeded helpers                                                      */
/* ------------------------------------------------------------------ */

/** FNV-1a string hash → uint32 */
export function hashId(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** mulberry32 PRNG — deterministic, tiny */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ------------------------------------------------------------------ */
/* family stats + colors                                               */
/* ------------------------------------------------------------------ */

export interface FamilyStat {
  key: string
  label: string
  count: number
  hue: number
  color: string
  dim: string
}

const GOLDEN_ANGLE = 137.508

const FAMILY_COUNTS = new Map<string, number>()
for (const p of PATTERNS) FAMILY_COUNTS.set(p.family, (FAMILY_COUNTS.get(p.family) ?? 0) + 1)

export const FAMILY_STATS: FamilyStat[] = FAMILY_LIST.map((f, i) => {
  const hue = Math.round((i * GOLDEN_ANGLE) % 360)
  return {
    key: f.key,
    label: f.label,
    count: FAMILY_COUNTS.get(f.key) ?? 0,
    hue,
    color: `hsl(${hue} 72% 60%)`,
    dim: `hsl(${hue} 60% 50% / 0.28)`,
  }
})

const STAT_BY_KEY = new Map(FAMILY_STATS.map((f) => [f.key, f]))

export function familyStat(key: string): FamilyStat {
  return STAT_BY_KEY.get(key) ?? { key, label: key, count: 0, hue: 84, color: 'hsl(84 72% 60%)', dim: 'hsl(84 60% 50% / 0.28)' }
}

/* ------------------------------------------------------------------ */
/* family relation edges                                               */
/* ------------------------------------------------------------------ */

export interface FamilyEdge {
  a: string
  b: string
  /** knowledge-link weight (2) + aggregated cross-family related-pattern links (1 each) */
  w: number
}

const EDGE_MAP = new Map<string, FamilyEdge>()
function addEdge(a: string, b: string, w: number) {
  if (a === b || !STAT_BY_KEY.has(a) || !STAT_BY_KEY.has(b)) return
  const [x, y] = a < b ? [a, b] : [b, a]
  const k = `${x}|${y}`
  const e = EDGE_MAP.get(k)
  if (e) e.w += w
  else EDGE_MAP.set(k, { a: x, b: y, w })
}

// knowledge links — curated "shares DNA with" relations
for (const f of FAMILY_STATS) {
  const rel = FAMILY_KNOWLEDGE[f.key]?.relatedFamilies ?? []
  for (const r of rel) addEdge(f.key, r, 2)
}

// cross-family pattern relations — data-driven relations
const FAMILY_OF = new Map<string, string>()
for (const p of PATTERNS) FAMILY_OF.set(p.id, p.family)
for (const p of PATTERNS) {
  for (const r of p.related ?? []) {
    const rf = FAMILY_OF.get(r)
    if (rf) addEdge(p.family, rf, 1)
  }
}

export const FAMILY_EDGES: FamilyEdge[] = [...EDGE_MAP.values()].sort((a, b) => b.w - a.w)
export const MAX_EDGE_W = FAMILY_EDGES.reduce((m, e) => Math.max(m, e.w), 1)

/** neighbor map for hover highlighting */
export const FAMILY_NEIGHBORS = new Map<string, Map<string, number>>()
for (const e of FAMILY_EDGES) {
  if (!FAMILY_NEIGHBORS.has(e.a)) FAMILY_NEIGHBORS.set(e.a, new Map())
  if (!FAMILY_NEIGHBORS.has(e.b)) FAMILY_NEIGHBORS.set(e.b, new Map())
  FAMILY_NEIGHBORS.get(e.a)!.set(e.b, (FAMILY_NEIGHBORS.get(e.a)!.get(e.b) ?? 0) + e.w)
  FAMILY_NEIGHBORS.get(e.b)!.set(e.a, (FAMILY_NEIGHBORS.get(e.b)!.get(e.a) ?? 0) + e.w)
}

/* ------------------------------------------------------------------ */
/* hierarchy: family → meter → patterns                                */
/* ------------------------------------------------------------------ */

export interface MeterGroup {
  key: string // "4/4"
  patterns: GroovePattern[]
}

export interface FamilyBranch {
  stat: FamilyStat
  meters: MeterGroup[]
}

export const TOTAL_PATTERNS = PATTERNS.length

export const HIERARCHY: FamilyBranch[] = FAMILY_STATS.map((stat) => {
  const byMeter = new Map<string, GroovePattern[]>()
  for (const p of PATTERNS) {
    if (p.family !== stat.key) continue
    const m = `${p.timeSignature.num}/${p.timeSignature.den}`
    const list = byMeter.get(m)
    if (list) list.push(p)
    else byMeter.set(m, [p])
  }
  const meters = [...byMeter.entries()]
    .map(([key, patterns]) => ({ key, patterns }))
    .map((g) => {
      // deterministic order inside each meter — by id
      g.patterns.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
      return g
    })
    .sort((a, b) => b.patterns.length - a.patterns.length || (a.key < b.key ? -1 : 1))
  return { stat, meters }
})

/* ------------------------------------------------------------------ */
/* scatter points (bpm × density, deterministic jitter)                */
/* ------------------------------------------------------------------ */

export interface ScatterPoint {
  id: string
  slug: string
  title: string
  family: string
  bpm: number
  density: number
  syncopation: number
  hits: number
  /** deterministic jitter, bpm units and density units */
  jx: number
  jy: number
}

export const SCATTER_POINTS: ScatterPoint[] = PATTERNS.map((p) => {
  const r = rng(hashId(p.id))
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    family: p.family,
    bpm: p.bpm,
    density: p.density,
    syncopation: p.syncopation,
    hits: p.events.length,
    jx: (r() - 0.5) * 5,
    jy: (r() - 0.5) * 0.62,
  }
})

export const BPM_MIN = Math.max(30, Math.floor((SCATTER_POINTS.reduce((m, p) => Math.min(m, p.bpm), 400) - 4) / 10) * 10)
export const BPM_MAX = Math.min(320, Math.ceil((SCATTER_POINTS.reduce((m, p) => Math.max(m, p.bpm), 0) + 4) / 10) * 10)

/* ------------------------------------------------------------------ */
/* 3D galaxy points — family clusters on a phyllotaxis sphere          */
/* ------------------------------------------------------------------ */

export interface GalaxyPoint {
  id: string
  slug: string
  title: string
  family: string
  bpm: number
  hits: number
  x: number
  y: number
  z: number
  size: number
}

export const GALAXY_RADIUS = 15

const FAMILY_CENTERS = new Map<string, [number, number, number]>()
{
  const n = FAMILY_STATS.length
  FAMILY_STATS.forEach((f, i) => {
    // phyllotaxis (golden-angle) sphere — even, deterministic, organic spread
    const y = 1 - (2 * (i + 0.5)) / n
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const th = i * GOLDEN_ANGLE * (Math.PI / 180)
    FAMILY_CENTERS.set(f.key, [r * Math.cos(th) * GALAXY_RADIUS, y * GALAXY_RADIUS * 0.72, r * Math.sin(th) * GALAXY_RADIUS])
  })
}

export function familyCenter(key: string): [number, number, number] {
  return FAMILY_CENTERS.get(key) ?? [0, 0, 0]
}

export const GALAXY_POINTS: GalaxyPoint[] = (() => {
  const out: GalaxyPoint[] = []
  const maxHits = PATTERNS.reduce((m, p) => Math.max(m, p.events.length), 1)
  for (const p of PATTERNS) {
    const [cx, cy, cz] = familyCenter(p.family)
    const count = FAMILY_COUNTS.get(p.family) ?? 1
    // bigger families breathe a little wider, but stay distinct
    const spread = 1.6 + Math.min(2.2, count / 26)
    const r = rng(hashId(`g:${p.id}`))
    // gaussian-ish offset (3-planet average) inside the cluster sphere
    const gx = (r() + r() + r()) / 1.5 - 1
    const gy = (r() + r() + r()) / 1.5 - 1
    const gz = (r() + r() + r()) / 1.5 - 1
    out.push({
      id: p.id,
      slug: p.slug,
      title: p.title,
      family: p.family,
      bpm: p.bpm,
      hits: p.events.length,
      x: cx + gx * spread,
      y: cy + gy * spread * 0.8,
      z: cz + gz * spread,
      // size by groove density (log hits), gentle range
      size: 0.55 + (Math.log2(1 + p.events.length) / Math.log2(1 + maxHits)) * 0.9,
    })
  }
  return out
})()

/* ------------------------------------------------------------------ */
/* distributions (DOM mini-charts)                                     */
/* ------------------------------------------------------------------ */

export const METER_DIST: { key: string; count: number }[] = (() => {
  const m = new Map<string, number>()
  for (const p of PATTERNS) {
    const k = `${p.timeSignature.num}/${p.timeSignature.den}`
    m.set(k, (m.get(k) ?? 0) + 1)
  }
  return [...m.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count)
})()

export const GENRE_DIST: { key: string; count: number }[] = (() => {
  const m = new Map<string, number>()
  for (const p of PATTERNS) for (const g of p.genres) m.set(g, (m.get(g) ?? 0) + 1)
  return [...m.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count)
})()

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
}

export const DIFFICULTY_DIST: { key: string; label: string; count: number }[] = (() => {
  const m = new Map<string, number>()
  for (const p of PATTERNS) m.set(p.difficulty, (m.get(p.difficulty) ?? 0) + 1)
  return Object.keys(DIFFICULTY_LABELS)
    .filter((k) => m.has(k))
    .map((k) => ({ key: k, label: DIFFICULTY_LABELS[k], count: m.get(k) ?? 0 }))
    .sort((a, b) => b.count - a.count)
})()

export const FEEL_DIST: { key: string; count: number }[] = (() => {
  const m = new Map<string, number>()
  for (const p of PATTERNS) m.set(p.feel, (m.get(p.feel) ?? 0) + 1)
  return [...m.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count)
})()

/** total cross-family relation links (for copy) */
export const RELATION_LINK_COUNT = PATTERNS.reduce((n, p) => n + (p.related?.length ?? 0), 0)
