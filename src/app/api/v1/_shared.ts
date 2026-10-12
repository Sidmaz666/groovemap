/**
 * Groovemap API v1 — shared helpers for the /api/v1 route handlers.
 *
 * Design goals:
 *  - LLM-first: every response carries a `meta` block (service name, endpoint,
 *    a next-step hint) and stable field shapes; compact vs full projections.
 *  - CORS-open: AI agents may call from anywhere (browser or server side).
 *  - Read-only + cacheable: the catalog is static in memory, so stable GETs
 *    send `Cache-Control: public, max-age=300`.
 */

import { NextResponse } from 'next/server'
import { PATTERNS, FAMILY_LIST, type CuratedCollection } from '@/lib/atlas/patterns'
import type { GroovePattern } from '@/lib/atlas/types'

export const API_NAME = 'Groovemap API v1'
export const API_DOCS = '/api/v1/README.md'

/* ------------------------------------------------------------------ */
/* Response envelope                                                   */
/* ------------------------------------------------------------------ */

export interface ApiMeta {
  service: string
  endpoint: string
  docs: string
  /** a concrete next-step hint for LLM agents */
  hint?: string
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
}

export function json(
  body: Record<string, unknown>,
  opts: { status?: number; cache?: boolean; endpoint: string; hint?: string }
): NextResponse {
  const meta: ApiMeta = {
    service: API_NAME,
    endpoint: opts.endpoint,
    docs: API_DOCS,
    ...(opts.hint ? { hint: opts.hint } : {}),
  }
  const res = NextResponse.json({ meta, ...body }, { status: opts.status ?? 200 })
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.headers.set(k, v)
  res.headers.set('Cache-Control', opts.cache === false ? 'no-store' : 'public, max-age=300')
  return res
}

export function optionsResponse(): NextResponse {
  const res = new NextResponse(null, { status: 204 })
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.headers.set(k, v)
  res.headers.set('Allow', 'GET, OPTIONS')
  return res
}

export function notFound(endpoint: string, what: string, hint: string): NextResponse {
  return json({ error: `${what} not found` }, { status: 404, endpoint, hint, cache: false })
}

export function badRequest(endpoint: string, message: string, hint: string): NextResponse {
  return json({ error: message }, { status: 400, endpoint, hint, cache: false })
}

/* ------------------------------------------------------------------ */
/* Pattern projections                                                 */
/* ------------------------------------------------------------------ */

export function meterOf(p: GroovePattern): string {
  return `${p.timeSignature.num}/${p.timeSignature.den}`
}

/** number of steps in the full grid (bars × beats × subdivision) */
export function stepCountOf(p: GroovePattern): number {
  return p.timeSignature.num * p.subdivision * p.bars
}

/** compact list item — small, scannable, enough for an LLM to triage */
export function compactPattern(p: GroovePattern) {
  return {
    id: p.id,
    title: p.title,
    family: p.family,
    genres: p.genres,
    bpm: p.bpm,
    timeSignature: meterOf(p),
    feel: p.feel,
    difficulty: p.difficulty,
    bars: p.bars,
    subdivision: p.subdivision,
    swing: p.swing,
    summary: p.summary,
    stepCount: stepCountOf(p),
    hitCount: p.events.length,
    kit: p.kitSuggestion,
  }
}

export type CompactPattern = ReturnType<typeof compactPattern>

/* ------------------------------------------------------------------ */
/* Filtering / sorting (mirrors the in-app catalog search semantics)   */
/* ------------------------------------------------------------------ */

export type PatternSort = 'bpm' | 'difficulty' | 'family' | 'id'

const DIFFICULTY_RANK: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 }

export interface PatternQuery {
  limit: number
  offset: number
  families: string[]
  genres: string[]
  q: string
  meter: string | null
  feels: string[]
  difficulties: string[]
  bpmMin: number | null
  bpmMax: number | null
  bars: number | null
  subdivision: number | null
  sort: PatternSort | null
  fields: 'compact' | 'full'
}

const num = (v: string | null): number | null => {
  if (v == null || v.trim() === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const list = (v: string | null): string[] =>
  v == null || v.trim() === ''
    ? []
    : v
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)

export function parsePatternQuery(url: URL): { query: PatternQuery; error?: string } {
  const limitRaw = num(url.searchParams.get('limit')) ?? 50
  const limit = Math.max(1, Math.min(200, Math.floor(limitRaw)))
  const offset = Math.max(0, Math.floor(num(url.searchParams.get('offset')) ?? 0))
  const sortRaw = url.searchParams.get('sort')
  const sort = (['bpm', 'difficulty', 'family', 'id'] as const).find((s) => s === sortRaw) ?? null
  const fields = url.searchParams.get('fields') === 'full' ? 'full' : 'compact'
  const bpmMin = num(url.searchParams.get('bpm_min'))
  const bpmMax = num(url.searchParams.get('bpm_max'))
  const bars = num(url.searchParams.get('bars'))
  const subdivisionRaw = num(url.searchParams.get('subdivision'))
  if (bpmMin != null && bpmMax != null && bpmMin > bpmMax) {
    return { query: {} as PatternQuery, error: 'bpm_min is greater than bpm_max' }
  }
  return {
    query: {
      limit,
      offset,
      families: list(url.searchParams.get('family')),
      genres: list(url.searchParams.get('genre')),
      q: (url.searchParams.get('q') ?? '').trim().toLowerCase(),
      meter: url.searchParams.get('meter')?.trim() || null,
      feels: list(url.searchParams.get('feel')),
      difficulties: list(url.searchParams.get('difficulty')),
      bpmMin,
      bpmMax,
      bars: bars != null ? Math.max(1, Math.floor(bars)) : null,
      subdivision: subdivisionRaw != null ? ([1, 2, 3, 4, 6].find((s) => s === subdivisionRaw) ?? null) : null,
      sort,
      fields,
    },
  }
}

export function filterPatterns(q: PatternQuery): GroovePattern[] {
  const out = PATTERNS.filter((p) => {
    if (q.families.length && !q.families.includes(p.family)) return false
    if (q.genres.length && !p.genres.some((g) => q.genres.includes(g.toLowerCase()))) return false
    if (q.meter && meterOf(p) !== q.meter) return false
    if (q.feels.length && !q.feels.includes(p.feel)) return false
    if (q.difficulties.length && !q.difficulties.includes(p.difficulty)) return false
    if (q.bpmMin != null && p.bpm < q.bpmMin) return false
    if (q.bpmMax != null && p.bpm > q.bpmMax) return false
    if (q.bars != null && p.bars !== q.bars) return false
    if (q.subdivision != null && p.subdivision !== q.subdivision) return false
    if (q.q) {
      const hay = [p.title, p.summary, p.description, p.family, ...p.genres, ...p.tags].join(' ').toLowerCase()
      if (!hay.includes(q.q)) return false
    }
    return true
  })
  switch (q.sort) {
    case 'bpm':
      out.sort((a, b) => a.bpm - b.bpm || a.id.localeCompare(b.id))
      break
    case 'difficulty':
      out.sort(
        (a, b) => DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] || a.bpm - b.bpm
      )
      break
    case 'family':
      out.sort(
        (a, b) =>
          FAMILY_LIST.findIndex((f) => f.key === a.family) - FAMILY_LIST.findIndex((f) => f.key === b.family) ||
          a.id.localeCompare(b.id)
      )
      break
    case 'id':
      out.sort((a, b) => a.id.localeCompare(b.id))
      break
    default:
      // catalog order (authored/curated order across packs) — stable and deterministic
      break
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Collections helper                                                  */
/* ------------------------------------------------------------------ */

export function collectionPayload(c: CuratedCollection) {
  const resolved = c.patternIds.map((id) => PATTERNS.find((p) => p.id === id)).filter((p) => p != null) as GroovePattern[]
  const families = [...new Set(resolved.map((p) => p.family))]
  return {
    id: c.id,
    name: c.name,
    blurb: c.blurb,
    count: resolved.length,
    listedIds: c.patternIds.length,
    families,
    art: families[0] ?? 'default',
    patternIds: resolved.map((p) => p.id),
    items: resolved.map(compactPattern),
  }
}
