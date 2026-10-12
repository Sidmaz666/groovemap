'use client'

import { Orbit, Network, PieChart, TrendingUp, Timer, Layers, Tags } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Route } from '../AppShell'
import type { CatalogFilters } from '@/lib/atlas/search'
import { cn } from '@/lib/utils'
import { vagueCount } from '@/lib/atlas/vague'
import { FAMILY_STATS, METER_DIST, GENRE_DIST, DIFFICULTY_DIST, FEEL_DIST, TOTAL_PATTERNS, FAMILY_EDGES, RELATION_LINK_COUNT } from './vizData'
import { Galaxy3D } from './Galaxy3D'
import { FamilyGraph } from './FamilyGraph'
import { SunburstTree } from './SunburstTree'
import { TempoScatter } from './TempoScatter'

/**
 * DataAtlasSection — "About → Data Atlas": the whole dataset rendered as
 * relations. A 3D constellation of every pattern, a force-directed graph of
 * family relations, a radial tree of the full hierarchy, a tempo × density
 * scatter, and the plain distributions underneath. Every pixel is computed
 * at runtime from the live catalog; every chart is click-through.
 */

function VizPanel({
  icon: Icon,
  title,
  desc,
  hint,
  children,
  className,
}: {
  icon: LucideIcon
  title: string
  desc: string
  hint: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-zinc-800/70 bg-gradient-to-b from-zinc-900/50 to-zinc-950/30 p-4 ring-1 ring-white/5 transition-colors hover:ring-lime-400/25',
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-zinc-100">
          <Icon className="h-3.5 w-3.5 text-lime-400/90" aria-hidden />
          {title}
        </h3>
        <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">{hint}</p>
      </div>
      <p className="max-w-2xl text-xs leading-relaxed text-zinc-500">{desc}</p>
      {children}
    </section>
  )
}

function BarList({
  rows,
  unit,
  onOpen,
}: {
  rows: { key: string; label?: string; count: number }[]
  unit: string
  onOpen: (key: string) => void
}) {
  const max = Math.max(...rows.map((r) => r.count), 1)
  return (
    <ul className="flex flex-col gap-1.5">
      {rows.map((r) => (
        <li key={r.key}>
          <button
            type="button"
            onClick={() => onOpen(r.key)}
            className="group/bar flex w-full cursor-pointer items-center gap-2.5 rounded-sm px-1 py-0.5 text-left transition-colors hover:bg-zinc-900/70"
          >
            <span className="w-14 shrink-0 truncate font-mono text-[10px] text-zinc-400 transition-colors group-hover/bar:text-zinc-200 sm:w-16">
              {r.label ?? r.key}
            </span>
            <span className="h-2 min-w-0 flex-1 overflow-hidden bg-zinc-900/90" aria-hidden>
              <span
                className="block h-full bg-gradient-to-r from-lime-400/70 to-lime-300/25 transition-all group-hover/bar:from-lime-300"
                style={{ width: `${(r.count / max) * 100}%` }}
              />
            </span>
            <span className="w-10 shrink-0 text-right font-mono text-[10px] tabular-nums text-zinc-500">
              {r.count}
              <span className="sr-only"> {unit}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export function DataAtlasSection({ navigate }: { navigate: (r: Route) => void }) {
  const openExploreFam = (key: string) => navigate({ view: 'explore', filters: { families: [key] } })
  const topMeters = METER_DIST.slice(0, 10)
  const topGenres = GENRE_DIST.slice(0, 12)

  return (
    <div className="space-y-6">
      <div className="max-w-3xl space-y-3">
        <p className="text-sm leading-relaxed text-zinc-300">
          <strong className="text-zinc-100">The atlas is one connected dataset</strong> — every groove belongs to a style
          family, a meter and a set of related patterns. The Data Atlas draws those relations the way the data actually
          holds them: {vagueCount(TOTAL_PATTERNS)} patterns as a 3D constellation, the {FAMILY_STATS.length} families as a
          relation graph ({FAMILY_EDGES.length} edges, {RELATION_LINK_COUNT.toLocaleString()} pattern-to-pattern links),
          the full family → meter → groove hierarchy as a radial tree, and the tempo–density spread of the whole catalog.
        </p>
        <p className="flex flex-wrap gap-1.5 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
          <span className="border border-zinc-800 bg-zinc-900/70 px-1.5 py-0.5">hover = detail</span>
          <span className="border border-zinc-800 bg-zinc-900/70 px-1.5 py-0.5">click = navigate</span>
          <span className="border border-zinc-800 bg-zinc-900/70 px-1.5 py-0.5">drag / scroll = 3d &amp; graph</span>
          <span className="border border-zinc-800 bg-zinc-900/70 px-1.5 py-0.5">all computed live from the catalog</span>
        </p>
      </div>

      {/* 01 — 3D galaxy */}
      <VizPanel
        icon={Orbit}
        title="01 · Atlas Galaxy — every pattern in 3D"
        desc="Each star is one groove, clustered into 38 family nebulae on a golden-angle sphere. Star size follows hit density; color follows family. Orbit, zoom, and click any star to open its page."
        hint={`${TOTAL_PATTERNS} stars`}
      >
        <Galaxy3D navigate={navigate} />
      </VizPanel>

      {/* 02 — relation graph */}
      <VizPanel
        icon={Network}
        title="02 · Family relations — force-directed graph"
        desc="An edge exists when two families share DNA — curated knowledge links plus every cross-family related-pattern reference, aggregated by weight. Bigger nodes hold more grooves; pull an edge with your cursor to trace the lineage."
        hint={`${FAMILY_STATS.length} nodes · ${FAMILY_EDGES.length} edges`}
      >
        <FamilyGraph navigate={navigate} />
      </VizPanel>

      {/* 03 — radial tree (full width — every atlas card spans the whole column) */}
      <VizPanel
        icon={PieChart}
        title="03 · Radial tree — family › meter › groove"
        desc="The full hierarchy in one disc: inner ring = families, middle = meters, outer = every individual pattern as a thin arc in its family color. It revolves; hover slows it down and names the exact path under your cursor."
        hint="3 rings · one arc per groove"
      >
        <SunburstTree navigate={navigate} />
      </VizPanel>

      {/* 04 — tempo × density (full width) */}
      <VizPanel
        icon={TrendingUp}
        title="04 · Tempo × density — the whole spread"
        desc="Every groove as one dot: tempo left to right, grid density bottom to top, color = family, dot size = hit count. The genre clusters you can hear are the clusters you can see."
        hint="one dot per groove"
      >
        <TempoScatter navigate={navigate} />
      </VizPanel>

      {/* 05 — distributions */}
      <VizPanel
        icon={Timer}
        title="05 · Distributions — the catalog by the numbers"
        desc="The same dataset in its plainest form: where the meters, difficulties, feels and genre tags fall. Bars are clickable and dive into Explore."
        hint={`${METER_DIST.length} meters · ${GENRE_DIST.length} genre tags`}
      >
        <div className="grid gap-x-8 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
          <div className="min-w-0">
            <p className="mb-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
              <Timer className="h-3 w-3 text-lime-400/80" aria-hidden /> meters — top {topMeters.length}
            </p>
            <BarList rows={topMeters} unit="grooves" onOpen={(m) => navigate({ view: 'explore', filters: { meters: [m] } })} />
          </div>
          <div className="min-w-0">
            <p className="mb-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
              <Layers className="h-3 w-3 text-lime-400/80" aria-hidden /> difficulty
            </p>
            <BarList rows={DIFFICULTY_DIST} unit="grooves" onOpen={(d) => navigate({ view: 'explore', filters: { difficulties: [d] as CatalogFilters['difficulties'] } })} />
            <p className="mb-2 mt-4 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
              <Layers className="h-3 w-3 text-lime-400/80" aria-hidden /> feel
            </p>
            <BarList rows={FEEL_DIST} unit="grooves" onOpen={(f) => navigate({ view: 'explore', filters: { feels: [f] as CatalogFilters['feels'] } })} />
          </div>
          <div className="min-w-0">
            <p className="mb-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
              <Tags className="h-3 w-3 text-lime-400/80" aria-hidden /> genre tags — top {topGenres.length}
            </p>
            <BarList rows={topGenres} unit="grooves" onOpen={(g) => navigate({ view: 'explore', filters: { genres: [g] } })} />
          </div>
        </div>
      </VizPanel>

      {/* legend */}
      <VizPanel
        icon={Network}
        title="Legend — family colors"
        desc="One color per family, shared by every chart above (golden-angle hues, stable across reloads). Click a family to browse its grooves in Explore."
        hint={`${FAMILY_STATS.length} families`}
      >
        <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
          {FAMILY_STATS.map((f) => (
            <li key={f.key}>
              <button
                type="button"
                onClick={() => openExploreFam(f.key)}
                className="group/leg flex w-full cursor-pointer items-center gap-2 border border-transparent px-1.5 py-1 text-left transition-colors hover:border-zinc-700 hover:bg-zinc-900/60"
              >
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full transition-transform group-hover/leg:scale-125"
                  style={{ background: f.color, boxShadow: `0 0 6px ${f.color}` }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-zinc-400 transition-colors group-hover/leg:text-zinc-200">{f.label}</span>
                <span className="shrink-0 font-mono text-[10px] tabular-nums text-zinc-600">{f.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </VizPanel>

      <p className="max-w-3xl text-xs leading-relaxed text-zinc-500">
        Every chart here is derived at runtime from the same <span className="font-mono text-lime-300/90">GroovePattern</span>{' '}
        data that powers the grids, the audio engine and the exports — nothing is hand-drawn and nothing goes stale. The
        same data is also machine-readable at <span className="font-mono text-lime-300/90">/api/v1</span> (see{' '}
        <strong className="text-zinc-300">For AI &amp; Devs</strong>).
      </p>
    </div>
  )
}
