'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { PatternCard } from './PatternCard'
import { PATTERNS } from '@/lib/atlas/patterns'
import { buildFacets, filterCatalog, toggleInArray, DEFAULT_FILTERS, activeFilterCount, type CatalogFilters, type SortKey } from '@/lib/atlas/search'
import { cn } from '@/lib/utils'

/**
 * Explore — the full catalog with composable filters. State is synced to the
 * URL hash so filtered views are shareable.
 */

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'curated', label: 'Curated' },
  { value: 'title', label: 'A–Z' },
  { value: 'tempo-asc', label: 'Tempo ↑' },
  { value: 'tempo-desc', label: 'Tempo ↓' },
  { value: 'complexity', label: 'Complexity' },
]

const FEELS: { value: CatalogFilters['feels'][number]; label: string }[] = [
  { value: 'straight', label: 'Straight' },
  { value: 'swung', label: 'Swung' },
  { value: 'shuffled', label: 'Shuffled' },
  { value: 'triplet', label: 'Triplet' },
  { value: 'broken', label: 'Broken' },
]

const DIFFS = ['beginner', 'intermediate', 'advanced'] as const

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-zinc-800/70 py-3 last:border-0">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
      {children}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors',
        active
          ? 'border-lime-400/70 bg-lime-400/15 text-lime-300'
          : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
      )}
    >
      {children}
    </button>
  )
}

export function ExploreView({
  initialFilters,
  navigate,
  openPattern,
}: {
  initialFilters?: Partial<CatalogFilters>
  navigate: (r: import('./AppShell').Route, replace?: boolean) => void
  openPattern: (id: string) => void
}) {
  const [filters, setFilters] = useState<CatalogFilters>(() => ({ ...DEFAULT_FILTERS, ...initialFilters }))
  const [showFiltersMobile, setShowFiltersMobile] = useState(false)
  const facets = useMemo(() => buildFacets(PATTERNS), [])
  const results = useMemo(() => filterCatalog(PATTERNS, filters), [filters])

  // chunked rendering — 1.6k pattern cards is too many DOM nodes for one paint
  const PAGE_SIZE = 48
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [lastResults, setLastResults] = useState(results)
  if (lastResults !== results) {
    setLastResults(results)
    setVisible(PAGE_SIZE)
  }
  const shown = useMemo(() => results.slice(0, visible), [results, visible])
  const sentinelRef = useRef<HTMLDivElement>(null)
  const resultsLen = results.length
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible((v) => (v < resultsLen ? Math.min(v + PAGE_SIZE, resultsLen) : v))
        }
      },
      { rootMargin: '700px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [resultsLen])

  // Re-initialize when the incoming route filters change (back/forward nav,
  // nav clicks). Uses the "adjust state during render" pattern with a
  // serialized signature, so object-identity churn can never loop and locally
  // edited state survives unrelated re-renders.
  const incomingSignature = JSON.stringify(initialFilters ?? {})
  const [appliedSignature, setAppliedSignature] = useState(incomingSignature)
  if (appliedSignature !== incomingSignature) {
    setAppliedSignature(incomingSignature)
    setFilters({ ...DEFAULT_FILTERS, ...(initialFilters ?? {}) })
  }

  const patch = useCallback((p: Partial<CatalogFilters>) => {
    setFilters((prev) => ({ ...prev, ...p }))
  }, [])

  // sync to URL hash (replaceState, no history spam)
  useEffect(() => {
    const p = new URLSearchParams()
    if (filters.query) p.set('q', filters.query)
    if (filters.families.length) p.set('fam', filters.families.join(','))
    if (filters.genres.length) p.set('g', filters.genres.join(','))
    if (filters.meters.length) p.set('m', filters.meters.join(','))
    if (filters.feels.length) p.set('f', filters.feels.join(','))
    if (filters.difficulties.length) p.set('d', filters.difficulties.join(','))
    if (filters.sort !== 'curated') p.set('sort', filters.sort)
    if (filters.tempoMin != null) p.set('tmin', String(filters.tempoMin))
    if (filters.tempoMax != null) p.set('tmax', String(filters.tempoMax))
    if (filters.syncopation != null) p.set('sync', String(filters.syncopation))
    if (filters.density != null) p.set('dens', String(filters.density))
    if (filters.bars != null) p.set('bars', String(filters.bars))
    const qs = p.toString()
    window.history.replaceState(null, '', `#/explore${qs ? `?${qs}` : ''}`)
  }, [filters])

  const nActive = activeFilterCount(filters)

  const sidebar = (
    <div className="text-sm">
      <FilterGroup label="Search">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" aria-hidden />
          <Input
            value={filters.query}
            onChange={(e) => patch({ query: e.target.value })}
            placeholder="Name, tag, genre…"
            className="border-zinc-800 bg-zinc-900/70 pl-8"
            aria-label="Search patterns"
          />
        </div>
      </FilterGroup>

      <FilterGroup label="Style family">
        <div className="flex flex-wrap gap-1.5">
          {facets.families.map((f) => (
            <Chip key={f.key} active={filters.families.includes(f.key)} onClick={() => patch({ families: toggleInArray(filters.families, f.key) })}>
              {f.label}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Meter">
        <div className="flex flex-wrap gap-1.5">
          {facets.meters.map((m) => (
            <Chip key={m.name} active={filters.meters.includes(m.name)} onClick={() => patch({ meters: toggleInArray(filters.meters, m.name) })}>
              {m.name}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Groove feel">
        <div className="flex flex-wrap gap-1.5">
          {FEELS.map((f) => (
            <Chip key={f.value} active={filters.feels.includes(f.value)} onClick={() => patch({ feels: toggleInArray(filters.feels, f.value) })}>
              {f.label}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Difficulty">
        <div className="flex flex-wrap gap-1.5">
          {DIFFS.map((d) => (
            <Chip key={d} active={filters.difficulties.includes(d)} onClick={() => patch({ difficulties: toggleInArray(filters.difficulties, d) })}>
              {d}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label={`Tempo range — ${filters.tempoMin ?? 60}–${filters.tempoMax ?? 200} bpm`}>
        <Slider
          value={[filters.tempoMin ?? 60, filters.tempoMax ?? 200]}
          min={60}
          max={200}
          step={5}
          onValueChange={([min, max]) => patch({ tempoMin: min, tempoMax: max })}
          aria-label="Tempo range"
        />
      </FilterGroup>

      <FilterGroup label="Syncopation">
        <div className="flex flex-wrap gap-1.5">
          {[0, 1, 2, 3].map((s) => (
            <Chip key={s} active={filters.syncopation === s} onClick={() => patch({ syncopation: filters.syncopation === s ? null : s })}>
              {['none', 'light', 'medium', 'heavy'][s]}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Density">
        <div className="flex flex-wrap gap-1.5">
          {[0, 1, 2, 3].map((s) => (
            <Chip key={s} active={filters.density === s} onClick={() => patch({ density: filters.density === s ? null : s })}>
              {['sparse', 'light', 'medium', 'dense'][s]}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Bar length">
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 4].map((b) => (
            <Chip key={b} active={filters.bars === b} onClick={() => patch({ bars: filters.bars === b ? null : b })}>
              {b} bar{b > 1 ? 's' : ''}
            </Chip>
          ))}
        </div>
      </FilterGroup>
    </div>
  )

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 sm:text-2xl">Explore the Map</h1>
          <p className="mt-0.5 text-xs text-zinc-500">
            {results.length} of {PATTERNS.length} patterns{nActive > 0 && ` · ${nActive} filter${nActive > 1 ? 's' : ''} active`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-zinc-800 font-mono text-[10px] uppercase tracking-wider lg:hidden"
            onClick={() => setShowFiltersMobile((s) => !s)}
            aria-expanded={showFiltersMobile}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters {nActive > 0 && `(${nActive})`}
          </Button>
          {nActive > 0 && (
            <Button size="sm" variant="ghost" onClick={() => setFilters({ ...DEFAULT_FILTERS })} className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 hover:text-rose-300">
              <X className="h-3.5 w-3.5" /> Clear all
            </Button>
          )}
          <Select value={filters.sort} onValueChange={(v) => patch({ sort: v as SortKey })}>
            <SelectTrigger size="sm" className="w-32 border-zinc-800 bg-zinc-900/70 font-mono text-[10px] uppercase tracking-wider" aria-label="Sort results">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value} className="font-mono text-xs">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className={cn('border border-zinc-800/70 bg-zinc-900/30 px-4 py-1 lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto', showFiltersMobile ? 'block' : 'hidden')}>
          {sidebar}
        </aside>

        <div>
          {results.length === 0 ? (
            <div className="border border-dashed border-zinc-800 p-10 text-center">
              <p className="text-sm font-medium text-zinc-300">Nothing matches those filters.</p>
              <p className="mt-1 text-xs text-zinc-500">Try clearing one filter — or explore a nearby style.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setFilters({ ...DEFAULT_FILTERS, families: ['funk'] })} className="border-zinc-700">
                  Try Funk
                </Button>
                <Button size="sm" variant="outline" onClick={() => setFilters({ ...DEFAULT_FILTERS, families: ['house'] })} className="border-zinc-700">
                  Try House
                </Button>
                <Button size="sm" variant="outline" onClick={() => setFilters({ ...DEFAULT_FILTERS, meters: ['4/4'] })} className="border-zinc-700">
                  Straight 4/4
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((p) => (
                  <PatternCard key={p.id} pattern={p} onOpen={openPattern} />
                ))}
              </div>
              {visible < results.length && (
                <div ref={sentinelRef} className="mt-6 flex flex-col items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setVisible((v) => Math.min(v + PAGE_SIZE, results.length))}
                    className="border-zinc-700 font-mono text-[10px] uppercase tracking-wider"
                  >
                    Load {Math.min(PAGE_SIZE, results.length - visible)} more
                  </Button>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                    showing {visible} of {results.length} — scroll for more
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
