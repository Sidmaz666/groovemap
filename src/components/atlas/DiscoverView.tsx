'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  SlidersHorizontal,
  GraduationCap,
  Clock3,
  Sparkles,
  Shuffle,
  Library,
  Tags,
  Drum,
  AudioWaveform,
  Gauge,
  History,
  FolderOpen,
  type LucideIcon,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PatternCard } from './PatternCard'
import { CardPlayButton } from './TransportBar'
import { HeroShowcase } from './hero-HeroShowcase'
import { HeroBackdrop } from './hero-Backdrop'
import { PATTERNS, CURATED_COLLECTIONS, getPattern, FAMILY_LIST, type CuratedCollection } from '@/lib/atlas/patterns'
import { KIT_LIST } from '@/lib/atlas/audio/kits'
import { listRecents } from '@/lib/atlas/storage'
import { vagueCount } from '@/lib/atlas/vague'
import { collectionArtFor } from '@/lib/atlas/genreArt'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Route } from './AppShell'
import type { GroovePattern } from '@/lib/atlas/types'

/**
 * DiscoverView — the Groovemap homepage.
 *
 * Hero: copy + search + quick genres + CTAs on the left, an auto-cycling live
 * featured-groove player (HeroShowcase) on the right, over a genre-art/grid
 * backdrop (HeroBackdrop). Body: a bento board — wide featured cell, tall
 * at-a-glance cell, a responsive row of history/starters/odd-meters panels
 * with compact pattern rows, and a full-width collections cell.
 *
 * Marketing surfaces show vague numbers only (vagueCount / vagueSmall) —
 * never exact catalog counts.
 */

const QUICK_GENRES = ['House', 'Techno', 'Hip-Hop', 'Boom Bap', 'Trap', 'Funk', 'Disco', 'Drum & Bass', 'Reggae', 'Jazz', 'Samba', 'UK Garage']

/** curated hero grooves — diverse families, compact grids, all instant reads */
const HERO_GROOVE_IDS = ['funk-16ths', 'house-basic', 'afrobeat-groove', 'trap-modern']

/** structural counts ≥10 render vague (38 → "35+"); below 10 stay exact */
function vagueSmall(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '0'
  if (n < 10) return String(n)
  if (n < 100) return `${n - 3}+`
  return vagueCount(n)
}

const DIFF_STYLE: Record<string, string> = {
  beginner: 'border-lime-400/30 text-lime-400/90',
  intermediate: 'border-amber-400/30 text-amber-400/90',
  advanced: 'border-rose-400/30 text-rose-400/90',
}

/* ------------------------------------------------------------------ */
/* Bento primitives                                                    */
/* ------------------------------------------------------------------ */

function BentoPanel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn('min-w-0 border border-zinc-800 bg-zinc-900/30', className)}>{children}</section>
}

function PanelHeader({
  icon: Icon,
  kicker,
  title,
  action,
}: {
  icon: LucideIcon
  kicker: string
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-3 border-b border-zinc-800/60 px-4 pb-3 pt-4">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-lime-400/90">
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {kicker}
        </p>
        <h2 className="mt-1 truncate text-base font-semibold text-zinc-100 sm:text-lg">{title}</h2>
      </div>
      {action}
    </div>
  )
}

function PanelAction({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="group shrink-0 cursor-pointer font-mono text-[10px] uppercase tracking-wider text-zinc-400 hover:bg-lime-400/10 hover:text-lime-300"
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
    </Button>
  )
}

/** interactive targets inside the row that must NOT trigger the row-level open */
const ROW_INTERACTIVE = 'button, a, input, select, textarea, [role="button"], [data-noclick]'

/** compact clickable row for list-style bento panels (starters / odd meters / history) */
function PatternRow({ pattern, onOpen }: { pattern: GroovePattern; onOpen: (id: string) => void }) {
  /** row-level click: open the pattern unless an inner control (e.g. play) was hit */
  const onRowClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(ROW_INTERACTIVE)) return
    onOpen(pattern.id)
  }
  const onRowKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    if ((e.target as HTMLElement).closest(ROW_INTERACTIVE)) return
    e.preventDefault()
    onOpen(pattern.id)
  }
  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`Open ${pattern.title}`}
      onClick={onRowClick}
      onKeyDown={onRowKey}
      className="group flex w-full cursor-pointer items-center gap-3 border-b border-zinc-800/40 px-3.5 py-2.5 text-left transition-colors last:border-b-0 outline-none hover:bg-lime-400/[0.05] focus-visible:bg-lime-400/[0.05] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-lime-400/50"
    >
      <CardPlayButton pattern={pattern} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-zinc-200 transition-colors group-hover:text-lime-300">
          {pattern.title}
        </span>
        <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          {pattern.timeSignature.num}/{pattern.timeSignature.den} · {pattern.bpm} bpm · {pattern.feel}
        </span>
      </span>
      <span
        className={cn(
          'hidden shrink-0 border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider sm:inline-block',
          DIFF_STYLE[pattern.difficulty]
        )}
      >
        {pattern.difficulty === 'intermediate' ? 'interm.' : pattern.difficulty}
      </span>
      <ArrowUpRight
        className="h-3.5 w-3.5 shrink-0 text-zinc-600 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lime-300"
        aria-hidden
      />
    </div>
  )
}

function CollectionCard({ collection, onOpen }: { collection: CuratedCollection; onOpen: () => void }) {
  const firstFam = getPattern(collection.patternIds[0])?.family ?? 'default'
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open collection ${collection.name}`}
      className="group flex cursor-pointer flex-col overflow-hidden border border-zinc-800/80 bg-zinc-900/40 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-lime-400/50 hover:bg-zinc-900/70 hover:shadow-[0_14px_34px_-18px_rgba(163,230,53,0.4)] focus-visible:border-lime-400/70 focus-visible:outline-none"
    >
      <div className="relative h-16 w-full overflow-hidden border-b border-zinc-800/60 sm:h-20">
        <Image
          src={collectionArtFor(collection.id, firstFam)}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 20vw"
          className="object-cover opacity-75 transition-opacity duration-300 group-hover:opacity-100"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        <span className="absolute bottom-1.5 left-3 font-mono text-[9px] uppercase tracking-[0.2em] text-lime-300/90">
          {vagueSmall(collection.patternIds.length)} patterns
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="text-sm font-semibold text-zinc-100 transition-colors group-hover:text-lime-300">{collection.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">{collection.blurb}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-2.5 font-mono text-[9px] uppercase tracking-widest text-zinc-600 transition-colors group-hover:text-lime-300/80">
          open collection
          <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* View                                                                */
/* ------------------------------------------------------------------ */

export function DiscoverView({
  navigate,
  openPattern,
  openExplore,
  openLab,
}: {
  navigate: (r: Route, replace?: boolean) => void
  openPattern: (id: string) => void
  openExplore: (filters?: Partial<import('@/lib/atlas/search').CatalogFilters>) => void
  openLab: (patternId?: string) => void
}) {
  const [query, setQuery] = useState('')
  const [recents, setRecents] = useState<string[]>([])

  useEffect(() => {
    const t = setTimeout(() => setRecents(listRecents()), 0)
    return () => clearTimeout(t)
  }, [])

  const heroGrooves = useMemo(
    () => HERO_GROOVE_IDS.map((id) => getPattern(id)).filter((p): p is GroovePattern => !!p),
    []
  )
  const featured = useMemo(
    () => PATTERNS.filter((p) => p.featured && !HERO_GROOVE_IDS.includes(p.id)).slice(0, 4),
    []
  )
  const starters = useMemo(() => PATTERNS.filter((p) => p.starter).slice(0, 5), [])
  const odd = useMemo(
    () =>
      PATTERNS.filter(
        (p) => p.family === 'experimental' || (p.timeSignature.den === 8 && p.timeSignature.num !== 4) || ['seven-eight-rupcha', 'karsilama-9-8', 'ewe-bell', 'euclid-sketch', 'polyrhythm-3-4'].includes(p.id)
      ).slice(0, 5),
    []
  )
  const recentPatterns = useMemo(
    () => recents.map((id) => getPattern(id)).filter((p): p is GroovePattern => !!p).slice(0, 5),
    [recents]
  )

  // live catalog numbers for the bento cell — rendered vague, never exact
  const stats = useMemo(() => {
    const meters = new Set(PATTERNS.map((p) => `${p.timeSignature.num}/${p.timeSignature.den}`)).size
    const genres = new Set(PATTERNS.flatMap((p) => p.genres)).size
    return [
      { icon: AudioWaveform, value: vagueCount(PATTERNS.length), label: 'verified grooves', sub: 'every one playable in-browser' },
      { icon: Library, value: vagueSmall(FAMILY_LIST.length), label: 'style families', sub: 'rock to balkan & beyond' },
      { icon: Tags, value: vagueSmall(genres), label: 'genre tags', sub: 'cross-referenced' },
      { icon: Clock3, value: vagueSmall(meters), label: 'meters covered', sub: 'from 4/4 to 12/8' },
      { icon: Drum, value: String(KIT_LIST.length), label: 'synth kits', sub: 'pure web audio, zero downloads' },
    ] satisfies { icon: LucideIcon; value: string; label: string; sub: string }[]
  }, [])

  return (
    <div className="space-y-6">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border border-zinc-800 bg-zinc-950" aria-label="Search the map">
        <HeroBackdrop />

        <div className="relative grid gap-8 p-5 sm:gap-10 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:p-10">
          {/* left — kicker, headline, value prop, search, quick genres, CTAs */}
          <div className="flex min-w-0 flex-col justify-center">
            <p className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.3em] text-lime-400">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping bg-lime-400/60" aria-hidden />
                <span className="relative inline-flex h-2 w-2 bg-lime-400" aria-hidden />
              </span>
              interactive drum-pattern encyclopedia
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-[1.03] tracking-tight text-zinc-50 sm:text-5xl lg:text-[3.45rem]">
              See it. <span className="text-lime-400">Hear it.</span>
              <br />
              Play it. Take it.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              A living encyclopedia of{' '}
              <span className="font-mono font-semibold text-zinc-200">{vagueCount(PATTERNS.length)}</span> grooves across{' '}
              <span className="font-mono font-semibold text-zinc-200">{vagueSmall(FAMILY_LIST.length)}</span> style
              families — every beat playable in your browser, dissected track by track, then exported as MIDI, audio or
              a share link for your own music.
            </p>

            <form
              className="mt-7 flex max-w-xl flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault()
                openExplore(query.trim() ? { query: query.trim() } : undefined)
              }}
              role="search"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search grooves, genres, feels…"
                  aria-label="Search patterns"
                  className="h-11 rounded-none border-zinc-800 bg-zinc-950/80 pl-9 text-sm shadow-none transition-colors focus-visible:border-lime-400/60 focus-visible:ring-lime-400/25"
                />
              </div>
              <Button
                type="submit"
                className="h-11 cursor-pointer rounded-none bg-lime-400 px-5 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-950 transition-all duration-200 hover:bg-lime-300 hover:shadow-[0_12px_30px_-12px_rgba(163,230,53,0.55)]"
              >
                Search the map
              </Button>
            </form>

            <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Quick genre links">
              {QUICK_GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => openExplore({ query: g })}
                  className="cursor-pointer border border-zinc-800 bg-zinc-900/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400 transition-all duration-150 hover:-translate-y-0.5 hover:border-lime-400/60 hover:bg-lime-400/[0.07] hover:text-lime-300 focus-visible:border-lime-400/70 focus-visible:text-lime-300 focus-visible:outline-none"
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <Button
                onClick={() => openLab()}
                className="group cursor-pointer border border-lime-400/50 bg-lime-400/10 font-mono text-[11px] font-semibold uppercase tracking-wider text-lime-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-lime-400 hover:bg-lime-400/20 hover:text-lime-200 hover:shadow-[0_12px_30px_-12px_rgba(163,230,53,0.55)]"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-90" aria-hidden />
                Open Groove Lab
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate({ view: 'learn' })}
                className="group cursor-pointer border-zinc-700 bg-transparent font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-lime-400/60 hover:bg-lime-400/10 hover:text-lime-300"
              >
                <GraduationCap className="h-3.5 w-3.5" aria-hidden />
                Learn rhythm
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
              </Button>
            </div>

            <p className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              <span>no signup</span>
              <span aria-hidden className="text-zinc-800">/</span>
              <span>space = play</span>
              <span aria-hidden className="text-zinc-800">/</span>
              <span>MIDI · audio · share links</span>
            </p>
          </div>

          {/* right — live featured player (auto-cycles, pauses while playing/hovered) */}
          <HeroShowcase patterns={heroGrooves} openPattern={openPattern} openLab={openLab} />
        </div>
      </section>

      {/* ================= BENTO BODY ================= */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-6">
        {/* featured — wide bento cell with full cards */}
        <BentoPanel className="lg:col-span-4">
          <PanelHeader
            icon={Sparkles}
            kicker="editor's picks"
            title="Featured grooves"
            action={<PanelAction onClick={() => openExplore()}>All patterns</PanelAction>}
          />
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {featured.map((p) => (
              <PatternCard key={p.id} pattern={p} onOpen={openPattern} />
            ))}
          </div>
        </BentoPanel>

        {/* at a glance — tall bento cell with vague numbers */}
        <BentoPanel className="flex flex-col lg:col-span-2">
          <PanelHeader icon={Gauge} kicker="by the numbers" title="The map at a glance" />
          <div className="flex flex-1 flex-col">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-1 items-center gap-3 border-b border-zinc-800/40 px-4 py-3 last:border-b-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-zinc-800 bg-zinc-950 text-lime-400/80">
                  <s.icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-lg font-semibold leading-none tabular-nums text-zinc-50">{s.value}</p>
                  <p className="mt-1 truncate font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                    {s.label} · {s.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </BentoPanel>

        {/* mid row — history (when present) / starters / odd meters, equal widths */}
        <div className="flex flex-col gap-3 lg:col-span-6 lg:flex-row">
          {recentPatterns.length > 0 && (
            <BentoPanel className="min-w-0 flex-1">
              <PanelHeader icon={History} kicker="your history" title="Recently explored" />
              <div className="flex flex-col">
                {recentPatterns.map((p) => (
                  <PatternRow key={p.id} pattern={p} onOpen={openPattern} />
                ))}
              </div>
            </BentoPanel>
          )}

          <BentoPanel className="min-w-0 flex-1">
            <PanelHeader
              icon={GraduationCap}
              kicker="start here"
              title="First beats to learn"
              action={
                <PanelAction onClick={() => navigate({ view: 'collections', collection: 'first-beats' })}>Collection</PanelAction>
              }
            />
            <div className="flex flex-col">
              {starters.map((p) => (
                <PatternRow key={p.id} pattern={p} onOpen={openPattern} />
              ))}
            </div>
          </BentoPanel>

          <BentoPanel className="min-w-0 flex-1">
            <PanelHeader
              icon={Shuffle}
              kicker="beyond 4/4"
              title="Odd meters & experiments"
              action={
                <PanelAction onClick={() => navigate({ view: 'collections', collection: 'odd-meters' })}>Collection</PanelAction>
              }
            />
            <div className="flex flex-col">
              {odd.map((p) => (
                <PatternRow key={p.id} pattern={p} onOpen={openPattern} />
              ))}
            </div>
          </BentoPanel>
        </div>

        {/* collections — full-width bento cell with art cards */}
        <BentoPanel className="lg:col-span-6">
          <PanelHeader
            icon={FolderOpen}
            kicker="curated paths"
            title="Collections"
            action={<PanelAction onClick={() => navigate({ view: 'collections' })}>All collections</PanelAction>}
          />
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 xl:grid-cols-5">
            {CURATED_COLLECTIONS.map((c) => (
              <CollectionCard
                key={c.id}
                collection={c}
                onOpen={() => navigate({ view: 'collections', collection: c.id })}
              />
            ))}
          </div>
        </BentoPanel>
      </div>
    </div>
  )
}
