import type { GroovePattern, Difficulty, GrooveFeel, TimeSignature } from './types'
import { FAMILY_LIST } from './patterns'

/* ------------------------------------------------------------------ */
/* Deterministic memo caches                                           */
/* 4k+ patterns make the query path (haystack join) and the curated     */
/* sort (family lookup inside the comparator) hot. Both caches are pure */
/* functions of the pattern object — same input, same output, no ambient */
/* state — so they are hydration-safe and SSR-safe (WeakMaps are         */
/* per-process and never serialized).                                   */
/* ------------------------------------------------------------------ */

/** lowercase "title summary description family genres tags" haystack per pattern */
const SEARCH_HAY = new WeakMap<GroovePattern, string>()

function searchHaystack(p: GroovePattern): string {
  let hay = SEARCH_HAY.get(p)
  if (hay === undefined) {
    hay = [p.title, p.summary, p.description, p.family, ...p.genres, ...p.tags].join(' ').toLowerCase()
    SEARCH_HAY.set(p, hay)
  }
  return hay
}

/** family -> sort rank, computed once from FAMILY_LIST (stable order) */
const FAMILY_RANK = new Map<string, number>(FAMILY_LIST.map((f, i) => [f.key, i]))

function familyRank(p: GroovePattern): number {
  const r = FAMILY_RANK.get(p.family)
  return r === undefined ? FAMILY_LIST.length : r
}

/** complexityScore memo — pure function of the pattern's own fields */
const COMPLEXITY = new WeakMap<GroovePattern, number>()

function complexityOf(p: GroovePattern): number {
  let c = COMPLEXITY.get(p)
  if (c === undefined) {
    c = complexityScore(p)
    COMPLEXITY.set(p, c)
  }
  return c
}

export interface CatalogFilters {
  query: string
  families: string[]
  genres: string[]
  meters: string[] // "4/4", "6/8"...
  feels: GrooveFeel[]
  difficulties: Difficulty[]
  tempoMin: number | null
  tempoMax: number | null
  syncopation: number | null // 0..3
  density: number | null // 0..3
  bars: number | null
  sort: SortKey
}

export type SortKey = 'curated' | 'tempo-asc' | 'tempo-desc' | 'complexity' | 'title'

export const DEFAULT_FILTERS: CatalogFilters = {
  query: '',
  families: [],
  genres: [],
  meters: [],
  feels: [],
  difficulties: [],
  tempoMin: null,
  tempoMax: null,
  syncopation: null,
  density: null,
  bars: null,
  sort: 'curated',
}

export function meterKey(ts: TimeSignature): string {
  return `${ts.num}/${ts.den}`
}

export function complexityScore(p: GroovePattern): number {
  const density = p.events.length / Math.max(1, p.timeSignature.num * p.subdivision * p.bars)
  return density + p.syncopation * 0.15 + (p.difficulty === 'advanced' ? 0.25 : p.difficulty === 'intermediate' ? 0.1 : 0)
}

export function filterCatalog(patterns: GroovePattern[], f: CatalogFilters): GroovePattern[] {
  const q = f.query.trim().toLowerCase()
  let out = patterns.filter((p) => {
    if (f.families.length && !f.families.includes(p.family)) return false
    if (f.genres.length && !p.genres.some((g) => f.genres.includes(g))) return false
    if (f.meters.length && !f.meters.includes(meterKey(p.timeSignature))) return false
    if (f.feels.length && !f.feels.includes(p.feel)) return false
    if (f.difficulties.length && !f.difficulties.includes(p.difficulty)) return false
    if (f.tempoMin != null && p.tempoRange[1] < f.tempoMin) return false
    if (f.tempoMax != null && p.tempoRange[0] > f.tempoMax) return false
    if (f.syncopation != null && p.syncopation !== f.syncopation) return false
    if (f.density != null && p.density !== f.density) return false
    if (f.bars != null && p.bars !== f.bars) return false
    if (q) {
      if (!searchHaystack(p).includes(q)) return false
    }
    return true
  })
  switch (f.sort) {
    case 'tempo-asc':
      out = [...out].sort((a, b) => a.bpm - b.bpm)
      break
    case 'tempo-desc':
      out = [...out].sort((a, b) => b.bpm - a.bpm)
      break
    case 'complexity':
      out = [...out].sort((a, b) => complexityOf(a) - complexityOf(b))
      break
    case 'title':
      out = [...out].sort((a, b) => a.title.localeCompare(b.title))
      break
    default:
      // curated: featured first, then by family order (family rank memoized)
      out = [...out].sort((a, b) => {
        const fa = (a.featured ? 0 : 1) + (a.starter ? 0.5 : 0)
        const fb = (b.featured ? 0 : 1) + (b.starter ? 0.5 : 0)
        if (fa !== fb) return fa - fb
        return familyRank(a) - familyRank(b)
      })
  }
  return out
}

export function activeFilterCount(f: CatalogFilters): number {
  let n = 0
  if (f.query.trim()) n++
  n += f.families.length + f.genres.length + f.meters.length + f.feels.length + f.difficulties.length
  if (f.tempoMin != null) n++
  if (f.tempoMax != null) n++
  if (f.syncopation != null) n++
  if (f.density != null) n++
  if (f.bars != null) n++
  return n
}

/** build facet lists from the catalog itself */
export function buildFacets(patterns: GroovePattern[]) {
  const genres = new Map<string, number>()
  const meters = new Map<string, number>()
  for (const p of patterns) {
    for (const g of p.genres) genres.set(g, (genres.get(g) ?? 0) + 1)
    const m = meterKey(p.timeSignature)
    meters.set(m, (meters.get(m) ?? 0) + 1)
  }
  return {
    families: FAMILY_LIST,
    genres: [...genres.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
    meters: [...meters.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
  }
}

export function toggleInArray<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
}
