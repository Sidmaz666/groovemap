'use client'

import { useCallback, useEffect, useState } from 'react'
import { Compass, Grid3x3, SlidersHorizontal, GraduationCap, FolderOpen, Info, Github } from 'lucide-react'
import NextTopLoader from 'nextjs-toploader'
import 'nprogress/nprogress.css'
import { cn } from '@/lib/utils'
import { useAtlas } from './AtlasProvider'
import type { CatalogFilters } from '@/lib/atlas/search'
import { DEFAULT_FILTERS } from '@/lib/atlas/search'
import { PATTERNS } from '@/lib/atlas/patterns'
import { vagueCount } from '@/lib/atlas/vague'
import { decodeShare } from '@/lib/atlas/share'
import type { GroovePattern } from '@/lib/atlas/types'
import { DiscoverView } from './DiscoverView'
import { ExploreView } from './ExploreView'
import { PatternDetailView } from './PatternDetailView'
import { GrooveLabView } from './GrooveLabView'
import { LearnView } from './LearnView'
import { CollectionsView } from './CollectionsView'
import { AboutView } from './AboutView'
import { BrandMark } from './BrandMark'
import { FloatingPlayer } from './FloatingPlayer'

export type Route =
  | { view: 'discover' }
  | { view: 'explore'; filters?: Partial<CatalogFilters> }
  | { view: 'pattern'; id: string }
  | { view: 'lab'; patternId?: string; sharedCode?: string }
  | { view: 'learn'; lesson?: string }
  | { view: 'collections'; collection?: string }
  | { view: 'about'; section?: string }

const NAV = [
  { key: 'discover', label: 'Discover', icon: Compass },
  { key: 'explore', label: 'Explore', icon: Grid3x3 },
  { key: 'lab', label: 'Groove Lab', icon: SlidersHorizontal },
  { key: 'learn', label: 'Learn', icon: GraduationCap },
  { key: 'collections', label: 'Collections', icon: FolderOpen },
  { key: 'about', label: 'About', icon: Info },
] as const

/** in-app progress flash for SPA (hash) navigations — the NextTopLoader covers page loads */
function flashProgress() {
  if (typeof window === 'undefined') return
  void import('nprogress')
    .then(({ default: NProgress }) => {
      NProgress.configure({ showSpinner: false, minimum: 0.2, trickleSpeed: 60 })
      NProgress.set(0.3)
      setTimeout(() => NProgress.done(), 220)
    })
    .catch(() => {})
}

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#/, '')
  if (h.startsWith('/s=')) return { view: 'lab', sharedCode: h.slice(3) }
  const [path, query] = h.split('?')
  const parts = path.split('/').filter(Boolean)
  const head = parts[0] ?? 'discover'
  const params = new URLSearchParams(query ?? '')
  switch (head) {
    case 'explore': {
      const filters: Partial<CatalogFilters> = {}
      const q = params.get('q')
      if (q) filters.query = q
      const fam = params.get('fam')
      if (fam) filters.families = fam.split(',').filter(Boolean)
      const genres = params.get('g')
      if (genres) filters.genres = genres.split(',').filter(Boolean)
      const meters = params.get('m')
      if (meters) filters.meters = meters.split(',').filter(Boolean)
      const feels = params.get('f')
      if (feels) filters.feels = feels.split(',').filter(Boolean) as CatalogFilters['feels']
      const diff = params.get('d')
      if (diff) filters.difficulties = diff.split(',').filter(Boolean) as CatalogFilters['difficulties']
      const sort = params.get('sort')
      if (sort) filters.sort = sort as CatalogFilters['sort']
      const tmin = params.get('tmin')
      if (tmin && !Number.isNaN(Number(tmin))) filters.tempoMin = Number(tmin)
      const tmax = params.get('tmax')
      if (tmax && !Number.isNaN(Number(tmax))) filters.tempoMax = Number(tmax)
      const sync = params.get('sync')
      if (sync !== null && !Number.isNaN(Number(sync))) filters.syncopation = Number(sync)
      const dens = params.get('dens')
      if (dens !== null && !Number.isNaN(Number(dens))) filters.density = Number(dens)
      const bars = params.get('bars')
      if (bars !== null && !Number.isNaN(Number(bars))) filters.bars = Number(bars)
      return { view: 'explore', filters }
    }
    case 'pattern':
      return parts[1] ? { view: 'pattern', id: decodeURIComponent(parts[1]) } : { view: 'discover' }
    case 'lab':
      return { view: 'lab', patternId: parts[1] ? decodeURIComponent(parts[1]) : undefined }
    case 'learn':
      return { view: 'learn', lesson: parts[1] }
    case 'collections':
      return { view: 'collections', collection: parts[1] }
    case 'about':
      return { view: 'about', section: parts[1] }
    default:
      return { view: 'discover' }
  }
}

export function routeToHash(r: Route): string {
  switch (r.view) {
    case 'discover':
      return '#/'
    case 'explore': {
      const p = new URLSearchParams()
      const f = r.filters ?? {}
      if (f.query) p.set('q', f.query)
      if (f.families?.length) p.set('fam', f.families.join(','))
      if (f.genres?.length) p.set('g', f.genres.join(','))
      if (f.meters?.length) p.set('m', f.meters.join(','))
      if (f.feels?.length) p.set('f', f.feels.join(','))
      if (f.difficulties?.length) p.set('d', f.difficulties.join(','))
      if (f.sort && f.sort !== 'curated') p.set('sort', f.sort)
      if (f.tempoMin != null) p.set('tmin', String(f.tempoMin))
      if (f.tempoMax != null) p.set('tmax', String(f.tempoMax))
      if (f.syncopation != null) p.set('sync', String(f.syncopation))
      if (f.density != null) p.set('dens', String(f.density))
      if (f.bars != null) p.set('bars', String(f.bars))
      const qs = p.toString()
      return `#/explore${qs ? `?${qs}` : ''}`
    }
    case 'pattern':
      return `#/pattern/${encodeURIComponent(r.id)}`
    case 'lab':
      return r.patternId ? `#/lab/${encodeURIComponent(r.patternId)}` : '#/lab'
    case 'learn':
      return r.lesson ? `#/learn/${r.lesson}` : '#/learn'
    case 'collections':
      return r.collection ? `#/collections/${r.collection}` : '#/collections'
    case 'about':
      return r.section ? `#/about/${r.section}` : '#/about'
  }
}

export function AppShell() {
  const [route, setRoute] = useState<Route>(() => ({ view: 'discover' }))
  const [sharedPattern, setSharedPattern] = useState<GroovePattern | null>(null)
  const [shareError, setShareError] = useState<string | null>(null)

  const navigate = useCallback((r: Route, replace = false) => {
    flashProgress()
    setRoute(r)
    const hash = routeToHash(r)
    if (replace) window.history.replaceState(null, '', hash)
    else window.history.pushState(null, '', hash)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  useEffect(() => {
    const apply = () => {
      const r = parseHash(window.location.hash)
      if (r.view === 'lab' && r.sharedCode) {
        try {
          const p = decodeShare(r.sharedCode)
          setSharedPattern(p)
          setShareError(null)
          setRoute({ view: 'lab' })
        } catch (e) {
          setShareError(e instanceof Error ? e.message : 'Could not restore the shared pattern')
          setRoute({ view: 'discover' })
        }
      } else {
        setRoute(r)
      }
    }
    apply()
    const onPop = () => apply()
    window.addEventListener('popstate', onPop)
    window.addEventListener('hashchange', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('hashchange', onPop)
    }
  }, [])

  const openPattern = useCallback((id: string) => navigate({ view: 'pattern', id }), [navigate])
  const openExplore = useCallback((filters?: Partial<CatalogFilters>) => navigate({ view: 'explore', filters }), [navigate])
  const openLab = useCallback((patternId?: string) => navigate({ view: 'lab', patternId }), [navigate])

  // global spacebar transport
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable || t.tagName === 'SELECT') return
      if (e.code === 'Space') {
        e.preventDefault()
        // handled by provider via custom event to avoid re-render loops
        window.dispatchEvent(new CustomEvent('atlas:toggle-play'))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const ctx = useAtlas()
  useEffect(() => {
    const handler = () => ctx.togglePlay()
    window.addEventListener('atlas:toggle-play', handler)
    return () => window.removeEventListener('atlas:toggle-play', handler)
  }, [ctx])

  const activeNav = route.view === 'pattern' ? 'discover' : route.view

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-200" id="app-root">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-lime-400 focus:px-3 focus:py-1.5 focus:text-zinc-950">
        Skip to content
      </a>

      {/* page-level top loader (initial load + any real Next transitions) */}
      <NextTopLoader color="#a3e635" height={2.5} showSpinner={false} shadow="0 0 10px #a3e635,0 0 5px #a3e635" />

      <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-950/85 backdrop-blur-md print:hidden">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate({ view: 'discover' })}
            className="group flex shrink-0 items-center gap-2.5"
            aria-label="Groovemap home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-lime-400 transition-colors group-hover:border-lime-400/50 group-hover:text-lime-300">
              <BrandMark className="h-6 w-6" />
            </span>
            <span className="font-mono text-sm font-bold tracking-[0.22em] text-zinc-100">
              GROOVE<span className="text-lime-400">MAP</span>
            </span>
          </button>

          <nav aria-label="Main" className="ml-auto flex flex-1 items-center justify-end gap-0.5 overflow-x-auto sm:gap-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NAV.map((item) => {
              const Icon = item.icon
              const active = activeNav === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate({ view: item.key } as Route)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors sm:text-xs',
                    active
                      ? 'bg-zinc-800 text-lime-300 shadow-[inset_0_-2px_0_0_var(--color-lime-400)]'
                      : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  <span className="hidden xs:inline sm:inline">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-3 py-6 sm:px-6 sm:py-8">
        {shareError && (
          <div className="mb-6 border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200" role="alert">
            <strong className="font-mono uppercase tracking-wider">Share link error —</strong> {shareError}
          </div>
        )}
        {route.view === 'discover' && <DiscoverView navigate={navigate} openPattern={openPattern} openExplore={openExplore} openLab={openLab} />}
        {route.view === 'explore' && <ExploreView initialFilters={route.filters} navigate={navigate} openPattern={openPattern} />}
        {route.view === 'pattern' && <PatternDetailView id={route.id} sharedPattern={sharedPattern} navigate={navigate} openPattern={openPattern} openLab={openLab} />}
        {route.view === 'lab' && <GrooveLabView patternId={route.patternId} sharedPattern={sharedPattern} navigate={navigate} />}
        {route.view === 'learn' && <LearnView lesson={route.lesson} navigate={navigate} openPattern={openPattern} />}
        {route.view === 'collections' && <CollectionsView collectionId={route.collection} navigate={navigate} openPattern={openPattern} />}
        {route.view === 'about' && <AboutView section={route.section} navigate={navigate} />}
      </main>

      {/* global mini transport — follows the engine, hides while a main transport is visible */}
      <FloatingPlayer openPattern={openPattern} />

      <footer className="mt-auto print:hidden">
        <div aria-hidden className="h-px w-full bg-gradient-to-r from-transparent via-lime-400/25 to-transparent" />
        <div className="mx-auto flex max-w-7xl flex-col gap-1.5 px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            <BrandMark className="h-4 w-4 text-lime-400/70" />
            Groovemap — every beat: <span className="text-zinc-500">see · hear · understand · change · take</span>
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-700">
            {vagueCount(PATTERNS.length)} grooves · <span className='text-lime-700'>Built by <a className='underline text-lime-300'
            target='_blank'
            href="https://github.com/Sidmaz666"> 
            <Github className="inline h-3 w-3 mr-0.5" aria-hidden />
             Sidmaz666</a></span>
          </p>
        </div>
      </footer>
    </div>
  )
}
