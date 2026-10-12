'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import {
  ArrowLeft, Heart, SlidersHorizontal, RotateCcw, Ear, Music2, Layers, BookOpenText,
  ExternalLink, Youtube, BookMarked, Anchor, MapPin, Clock3, Bookmark, Users, Headphones, Lightbulb, Play,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { StepGrid } from './StepGrid'
import { RhythmCircle } from './RhythmCircle'
import { IntensityView } from './IntensityView'
import { NotationView } from './NotationView'
import { DrumKitDiagram } from './DrumKitDiagram'
import { WaveformView } from './WaveformView'
import { TransportBar, CardPlayButton } from './TransportBar'
import { ExportMenu } from './ExportMenu'
import { PrintSheet } from './PrintSheet'
import { PatternCard } from './PatternCard'
import { PulseClock } from './PulseClock'
import { OnsetHistogram } from './OnsetHistogram'
import { useAtlas, usePlayhead } from './AtlasProvider'
import { engine } from '@/lib/atlas/audio/engine'
import { getPattern, FAMILY_LIST, PATTERNS } from '@/lib/atlas/patterns'
import { instrumentOf, TRACK_COLORS } from '@/lib/atlas/instruments'
import { genreArtFor } from '@/lib/atlas/genreArt'
import { referencesFor } from '@/lib/atlas/references'
import { knowledgeFor } from '@/lib/atlas/knowledge'
import { cycleVelocity, toggleStep, applyVariation } from '@/lib/atlas/transforms'
import { validatePattern } from '@/lib/atlas/types'
import { toggleFavorite, listFavorites, pushRecent, listUserCollections, saveUserCollection, type StoredCollection } from '@/lib/atlas/storage'
import { FolderPlus, Plus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { GroovePattern } from '@/lib/atlas/types'
import type { Route } from './AppShell'
import { cn } from '@/lib/utils'

const DrumKit3D = dynamic(() => import('./DrumKit3D'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[340px] items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 sm:h-[420px]">
      <span className="animate-pulse font-mono text-[10px] uppercase tracking-widest text-zinc-500">assembling the 3d kit…</span>
    </div>
  ),
})

const PATTERNS_BY_FAMILY = new Map<string, GroovePattern[]>()
for (const p of PATTERNS) {
  const arr = PATTERNS_BY_FAMILY.get(p.family) ?? []
  arr.push(p)
  PATTERNS_BY_FAMILY.set(p.family, arr)
}

/** numbered single-scroll section — everything on one page, no tabs */
function Section({
  id, num, title, hint, children, className,
}: {
  id: string
  num: string
  title: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} aria-label={title} className={cn('scroll-mt-20', className)}>
      <div className="mb-3 flex items-baseline gap-2.5">
        <span className="font-mono text-[11px] font-bold text-lime-400/80">{num}</span>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-100">{title}</h2>
        {hint && <span className="hidden font-mono text-[9px] uppercase tracking-widest text-zinc-600 sm:block">{hint}</span>}
        <div aria-hidden className="ml-2 h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
      </div>
      {children}
    </section>
  )
}

/** compact add-current-pattern-to-collection menu (pattern detail header) */
function AddToCollectionMenu() {
  const a = useAtlas()
  const [cols, setCols] = useState<StoredCollection[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const addable = a.pattern && a.playingId != null && getPattern(a.playingId) ? a.pattern : null

  useEffect(() => {
    const t = setTimeout(() => setCols(listUserCollections()), 0)
    return () => clearTimeout(t)
  }, [a.playingId])

  if (!addable) return null

  const add = (col: StoredCollection) => {
    if (col.patternIds.includes(addable.id)) {
      toast.info(`“${addable.title}” is already in ${col.name}`)
      return
    }
    saveUserCollection({ ...col, patternIds: [addable.id, ...col.patternIds] })
    setCols(listUserCollections())
    toast.success(`Added “${addable.title}” to ${col.name}`)
  }

  const create = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Give the collection a name first')
      return
    }
    saveUserCollection({ id: `uc_${Date.now()}`, name: trimmed, patternIds: [addable.id] })
    setCols(listUserCollections())
    setDialogOpen(false)
    setName('')
    toast.success(`Created “${trimmed}” with “${addable.title}”`)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" aria-label="Add loaded pattern to a collection" className="border-zinc-700 font-mono text-[11px] uppercase tracking-wider text-zinc-300">
            <FolderPlus className="h-3.5 w-3.5" /> Add to…
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">My collections</DropdownMenuLabel>
          {cols.length === 0 && <DropdownMenuItem disabled className="text-xs text-zinc-500">No collections yet</DropdownMenuItem>}
          {cols.map((c) => (
            <DropdownMenuItem key={c.id} onClick={() => add(c)} className="text-xs">
              {c.name}
              <span className="ml-auto pl-4 font-mono text-[10px] text-zinc-600">{c.patternIds.length}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDialogOpen(true)} className="text-xs text-lime-300">
            <Plus className="h-3.5 w-3.5" /> New collection…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-950">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-wider">New collection</DialogTitle>
          </DialogHeader>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Collection name"
            aria-label="Collection name"
            onKeyDown={(e) => e.key === 'Enter' && create()}
          />
          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setDialogOpen(false)} className="border-zinc-700">Cancel</Button>
            <Button size="sm" onClick={create} className="bg-lime-400 text-zinc-950 hover:bg-lime-300">Create with “{addable.title.slice(0, 18)}”</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/** story & origins — the history/origin/era block from the knowledge layer */
function StorySection({ pattern }: { pattern: GroovePattern }) {
  const k = useMemo(() => knowledgeFor(pattern), [pattern])
  if (!k.hasStory) return null
  return (
    <Section id="story" num="09" title="Story & origins" hint="where this groove comes from">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {/* meta chips */}
          <div className="flex flex-wrap gap-1.5">
            {k.origin && (
              <span className="flex items-center gap-1.5 border border-zinc-800 bg-zinc-900/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300">
                <MapPin className="h-3 w-3 text-lime-400" /> {k.origin}
              </span>
            )}
            {k.region && (
              <span className="flex items-center gap-1.5 border border-zinc-800 bg-zinc-900/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300">
                <Bookmark className="h-3 w-3 text-lime-400/80" /> {k.region}
              </span>
            )}
            {k.era && (
              <span className="flex items-center gap-1.5 border border-zinc-800 bg-zinc-900/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300">
                <Clock3 className="h-3 w-3 text-lime-400/80" /> {k.era}
              </span>
            )}
          </div>
          {k.classification && (
            <p className="border-l-2 border-lime-400/50 pl-3 text-xs leading-relaxed text-zinc-400">{k.classification}</p>
          )}
          {k.history.map((h, i) => (
            <p key={i} className="text-sm leading-relaxed text-zinc-400">{h}</p>
          ))}
        </div>

        <div className="space-y-4">
          {k.artists.length > 0 && (
            <div className="border border-zinc-800 bg-zinc-900/40 p-4">
              <h3 className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                <Users className="h-3.5 w-3.5 text-lime-400/80" /> key artists
              </h3>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {k.artists.map((a) => (
                  <span key={a} className="bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-300">{a}</span>
                ))}
              </div>
            </div>
          )}
          {k.listening.length > 0 && (
            <div className="border border-zinc-800 bg-zinc-900/40 p-4">
              <h3 className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                <Headphones className="h-3.5 w-3.5 text-lime-400/80" /> hear it on
              </h3>
              <ul className="mt-2.5 space-y-2.5">
                {k.listening.map((l) => (
                  <li key={`${l.title}-${l.artist}`} className="text-xs leading-relaxed">
                    <p className="text-zinc-200">
                      “{l.title}” — {l.artist}
                      {l.year ? <span className="ml-1 font-mono text-[10px] text-zinc-500">({l.year})</span> : null}
                    </p>
                    {l.note && <p className="mt-0.5 text-[11px] text-zinc-500">{l.note}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {k.didYouKnow.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {k.didYouKnow.map((d, i) => (
            <div key={i} className="flex gap-2.5 border border-lime-400/25 bg-lime-400/5 p-3">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lime-400" aria-hidden />
              <p className="text-xs leading-relaxed text-zinc-300">{d}</p>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

/* the single-page anchor map */
const SECTIONS: { id: string; label: string }[] = [
  { id: 'grid', label: 'grid' },
  { id: 'wave', label: 'waveform' },
  { id: 'kit3d', label: '3d kit' },
  { id: 'kit', label: 'kit & pads' },
  { id: 'notation', label: 'notation' },
  { id: 'circle', label: 'circle & pulse' },
  { id: 'intensity', label: 'intensity & energy' },
  { id: 'theory', label: 'theory' },
  { id: 'story', label: 'story & origins' },
  { id: 'variations', label: 'variations' },
  { id: 'refs', label: 'references' },
  { id: 'related', label: 'related' },
]

export function PatternDetailView({
  id,
  sharedPattern,
  navigate,
  openPattern,
  openLab,
}: {
  id: string
  sharedPattern: GroovePattern | null
  navigate: (r: Route, replace?: boolean) => void
  openPattern: (id: string) => void
  openLab: (patternId?: string) => void
}) {
  const a = useAtlas()
  const pos = usePlayhead()
  const original = useMemo(() => getPattern(id), [id])
  const source: GroovePattern | null = original ?? (id === 'shared' ? sharedPattern : null)
  const [working, setWorking] = useState<GroovePattern | null>(source ? structuredClone(source) : null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [slowPractice, setSlowPractice] = useState(false)
  const [listeningMode, setListeningMode] = useState<'full' | 'kick-snare' | 'cymbals'>('full')
  const loadedFor = useRef<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setFavorites(listFavorites())
      if (source && loadedFor.current !== source.id + id) {
        loadedFor.current = source.id + id
        const clone = structuredClone(source)
        setWorking(clone)
        // GLOBAL PLAYER: if this exact groove is already loaded into the engine
        // (e.g. the user played it on a card, then opened its page), ADOPT the
        // running transport — never reload, which would stop() and restart it.
        // A genuinely different pattern is staged silently (play: false) — but
        // ONLY when nothing is audible: staging while a groove is playing or
        // paused would stop it without any user action. In that case the page
        // shows a "Play this groove" button that switches playback explicitly.
        const alreadyLoaded = a.playingId === source.id && engine.loadedId === source.id
        if (!alreadyLoaded && a.activeId == null) {
          a.loadPattern(clone, { play: false })
        }
        if (original) pushRecent(original.id)
      }
    }, 0)
    return () => clearTimeout(t)
  }, [id, source])

  const isModified = useMemo(
    () => !!working && !!source && JSON.stringify(working.events) !== JSON.stringify(source.events),
    [working, source]
  )

  const related = useMemo(() => {
    if (!source) return []
    const ids = source.related ?? []
    const direct = ids.map((r) => getPattern(r)).filter((p): p is GroovePattern => !!p)
    if (direct.length >= 3) return direct.slice(0, 4)
    // fallback: same family
    const fam = PATTERNS_BY_FAMILY.get(source.family) ?? []
    return [...direct, ...fam.filter((p) => p.id !== source.id && !direct.some((d) => d.id === p.id))].slice(0, 4)
  }, [source])

  const refs = useMemo(() => (source ? referencesFor(source) : []), [source])
  const famLabel = source ? FAMILY_LIST.find((f) => f.key === source.family)?.label ?? source.family : ''
  const art = source ? genreArtFor(source.family) : '/genre/default.jpg'

  const jump = (sid: string) => {
    document.getElementById(sid)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (!source || !working) {
    return (
      <div className="border border-dashed border-zinc-800 p-10 text-center">
        <p className="text-sm text-zinc-300">Pattern not found.</p>
        <Button variant="outline" size="sm" className="mt-3 border-zinc-700" onClick={() => navigate({ view: 'explore' })}>
          Back to Explore
        </Button>
      </div>
    )
  }

  const isLoaded = a.playingId === working.id && a.pattern != null
  const currentStep = isLoaded ? pos?.step ?? null : null
  const issues = validatePattern(working)
  const dimTracks = new Set(Object.entries(a.mix).filter(([, m]) => m.muted).map(([tid]) => tid))

  const commit = (next: GroovePattern) => {
    setWorking(next)
    a.updatePattern(next)
  }

  const onToggle = (trackId: string, step: number, mods: { shift: boolean; alt: boolean }) => {
    const track = working.tracks.find((t) => t.id === trackId)
    if (!track) return
    if (mods.shift || mods.alt) {
      const { pattern, added } = cycleVelocity(working, trackId, step)
      commit(pattern)
      const ev = pattern.events.find((e) => e.t === trackId && e.s === step)
      if (added && ev) a.preview(track.inst, ev.v)
    } else {
      const next = toggleStep(working, trackId, step)
      const existed = working.events.some((e) => e.t === trackId && e.s === step)
      commit(next)
      if (!existed) a.preview(track.inst)
    }
  }

  const clearMix = () => {
    for (const t of working.tracks) a.setTrackMix(t.id, { muted: false, solo: false })
    setListeningMode('full')
  }

  /** make the VIEWED groove the audible one (explicit switch while another groove plays) */
  const makeAudible = () => {
    if (!isLoaded) a.playPattern(working)
  }

  const setMode = (mode: 'full' | 'kick-snare' | 'cymbals') => {
    // listening modes describe THIS groove — if another groove is audible, the
    // click itself is the intent to switch (load + play), then solo applies
    makeAudible()
    clearMixState()
    setListeningMode(mode)
    if (mode === 'kick-snare') {
      for (const t of working.tracks) {
        const inst = instrumentOf(t.inst)
        a.setTrackMix(t.id, { solo: inst.id === 'kick' || inst.id === 'snare' })
      }
    } else if (mode === 'cymbals') {
      for (const t of working.tracks) {
        const inst = instrumentOf(t.inst)
        a.setTrackMix(t.id, { solo: inst.group === 'cymbals' })
      }
    }
  }

  const clearMixState = () => {
    for (const t of working.tracks) a.setTrackMix(t.id, { muted: false, solo: false })
  }

  const isFav = favorites.includes(source.id)

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------ genre-art banner */}
      <div className="relative overflow-hidden border border-zinc-800">
        <Image src={art} alt={`${famLabel} genre artwork`} fill priority sizes="(max-width: 1280px) 100vw, 1200px" className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/15" />
        <div className="relative flex min-h-[150px] flex-col justify-end p-4 sm:min-h-[180px] sm:p-6">
          <div className="mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate({ view: 'explore' })} className="-ml-2 font-mono text-[10px] uppercase tracking-wider text-zinc-400 hover:text-lime-300">
              <ArrowLeft className="h-3.5 w-3.5" /> Explore
            </Button>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-lime-400">{famLabel}</p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-50 drop-shadow sm:text-4xl">{source.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {source.genres.map((g) => (
              <Badge key={g} variant="outline" className="border-zinc-600/80 bg-zinc-950/50 font-mono text-[10px] uppercase tracking-wider text-zinc-300 backdrop-blur-sm">
                {g}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* summary + actions */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">{source.summary}</p>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              const next = toggleFavorite(source.id)
              setFavorites(next)
              toast(next.includes(source.id) ? 'Added to favorites' : 'Removed from favorites')
            }}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFav}
            className={cn('border-zinc-700', isFav && 'border-rose-400/60 text-rose-400')}
          >
            <Heart className={cn('h-4 w-4', isFav && 'fill-rose-400')} />
          </Button>
          <AddToCollectionMenu />
          <ExportMenu pattern={working} />
          <Button
            size="sm"
            onClick={() => {
              if (isModified) {
                openLab()
                toast('Modified version loaded into the Lab')
              } else {
                openLab(source.id)
              }
            }}
            className="bg-lime-400 font-mono text-[11px] uppercase tracking-wider text-zinc-950 hover:bg-lime-300"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Groove Lab
          </Button>
        </div>
      </div>

      {/* meta strip */}
      <dl className="grid grid-cols-3 gap-px overflow-hidden border border-zinc-800 bg-zinc-800 sm:grid-cols-6" aria-label="Pattern metadata">
        {[
          ['meter', `${source.timeSignature.num}/${source.timeSignature.den}`],
          ['tempo', `${source.tempoRange[0]}–${source.tempoRange[1]}`],
          ['feel', source.feel],
          ['level', source.difficulty],
          ['bars', String(source.bars)],
          ['grid', source.subdivision === 3 || source.subdivision === 6 ? 'triplet' : `1/${source.subdivision * 4}`],
        ].map(([k, v]) => (
          <div key={k} className="bg-zinc-900/80 px-3 py-2">
            <dt className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">{k}</dt>
            <dd className="mt-0.5 font-mono text-xs font-semibold capitalize text-zinc-200">{v}</dd>
          </div>
        ))}
      </dl>

      {/* ------------------------------------- on-this-page anchor strip */}
      <nav aria-label="On this page" className="flex flex-wrap items-center gap-1.5 border-y border-zinc-800/70 py-2.5">
        <span className="mr-1 flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
          <Anchor className="h-3 w-3" /> jump:
        </span>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => jump(s.id)}
            className="border border-zinc-800/80 bg-zinc-900/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-500 transition-colors hover:border-lime-400/50 hover:text-lime-300"
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* ------------------------------------------------------ player */}
      <section className="border border-zinc-800 bg-zinc-900/40" aria-label="Interactive pattern player" data-main-transport>
        <div className="border-b border-zinc-800/80 p-3 sm:px-4">
          <TransportBar />
        </div>
        <div className="p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            {!isLoaded && (
              <Button
                size="sm"
                onClick={() => a.playPattern(working)}
                className="bg-lime-400 font-mono text-[10px] uppercase tracking-wider text-zinc-950 hover:bg-lime-300"
                title="Another groove is on the player — this starts this one"
              >
                <Play className="h-3.5 w-3.5" /> Play this groove
              </Button>
            )}
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              <Ear className="h-3.5 w-3.5" /> listen:
            </span>
            {(
              [
                ['full', 'Full pattern'],
                ['kick-snare', 'Kick & snare'],
                ['cymbals', 'Hats & cymbals'],
              ] as const
            ).map(([key, label]) => (
              <Button
                key={key}
                size="sm"
                variant={listeningMode === key ? 'default' : 'outline'}
                onClick={() => (key === 'full' ? (clearMix(), setListeningMode('full')) : setMode(key))}
                className={cn(
                  'h-7 border-zinc-700 px-2.5 font-mono text-[10px] uppercase tracking-wider',
                  listeningMode === key ? 'border-lime-400 bg-lime-400 text-zinc-950' : 'bg-transparent text-zinc-400'
                )}
              >
                {label}
              </Button>
            ))}
            <Button
              size="sm"
              variant={slowPractice ? 'default' : 'outline'}
              onClick={() => {
                if (slowPractice) {
                  a.setBpm(source.bpm)
                  setSlowPractice(false)
                } else {
                  const slowed = Math.max(40, Math.round(source.bpm * 0.7))
                  if (!isLoaded) {
                    // switching grooves with slow-practice intent — load at the slowed tempo
                    a.playPattern(working, { bpm: slowed })
                  } else {
                    a.setBpm(slowed)
                  }
                  setSlowPractice(true)
                }
              }}
              className={cn(
                'h-7 border-zinc-700 px-2.5 font-mono text-[10px] uppercase tracking-wider',
                slowPractice ? 'border-cyan-400 bg-cyan-400 text-zinc-950' : 'bg-transparent text-zinc-400'
              )}
            >
              Slow practice
            </Button>
            {isModified && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  commit(structuredClone(source))
                  toast('Reverted to the original pattern')
                }}
                className="h-7 border-amber-400/60 bg-amber-400/10 px-2.5 font-mono text-[10px] uppercase tracking-wider text-amber-300"
              >
                <RotateCcw className="h-3 w-3" /> Revert edits
              </Button>
            )}
          </div>
          {issues.length > 0 && (
            <p className="mt-2 font-mono text-[10px] text-amber-400/80">
              validator: {issues.map((i) => i.msg).join(' · ')}
            </p>
          )}
        </div>
      </section>

      {/* ----------------------------------------------- 01 step grid */}
      <Section id="grid" num="01" title="The step grid" hint="click = toggle · shift/alt-click = accent → ghost → off">
        <StepGrid
          pattern={working}
          currentStep={currentStep}
          editable
          onToggleStep={onToggle}
          dimTracks={dimTracks}
          onLabelClick={(tid) => {
            const t = working.tracks.find((x) => x.id === tid)
            if (t) a.preview(t.inst)
          }}
          labelActions={(tid) => (
            <span className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  const m = a.mix[tid]
                  a.setTrackMix(tid, { muted: !m?.muted })
                }}
                aria-label="Mute track"
                className={cn('h-3.5 w-3.5 border text-[7px] font-bold leading-none', a.mix[tid]?.muted ? 'border-rose-400 bg-rose-400 text-zinc-950' : 'border-zinc-700 text-zinc-500 hover:text-zinc-300')}
              >
                M
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  const m = a.mix[tid]
                  a.setTrackMix(tid, { solo: !m?.solo })
                }}
                aria-label="Solo track"
                className={cn('h-3.5 w-3.5 border text-[7px] font-bold leading-none', a.mix[tid]?.solo ? 'border-cyan-400 bg-cyan-400 text-zinc-950' : 'border-zinc-700 text-zinc-500 hover:text-zinc-300')}
              >
                S
              </button>
            </span>
          )}
        />
      </Section>

      {/* ------------------------------------------------ 02 waveform */}
      <Section id="wave" num="02" title="The waveform" hint="rendered with the real sample kit">
        <WaveformView pattern={working} currentStep={currentStep} />
      </Section>

      {/* --------------------------------------------- 03 3d drum kit */}
      <Section id="kit3d" num="03" title="3D drum kit — watch it played" hint="drag to orbit · scroll to zoom · click a piece to audition">
        <DrumKit3D pattern={working} currentStep={currentStep} onPreview={(inst) => a.preview(inst)} kitId={a.kitId} roomId={a.roomId} />
      </Section>

      {/* --------------------------------------- 04 2d kit + pads + perc */}
      <Section id="kit" num="04" title="Kit diagram, pad grid & percussion rack" hint="every instrument, lit as it fires">
        <DrumKitDiagram pattern={working} currentStep={currentStep} stacked onPreview={(inst) => a.preview(inst)} />
      </Section>

      {/* ------------------------------------------------ 05 notation */}
      <Section id="notation" num="05" title="Notation — tab, staff & Indian bols" hint="three written systems, one groove">
        <NotationView pattern={working} currentStep={currentStep} stacked />
      </Section>

      {/* ------------------------------ 06 circle + pulse clock (2-up) */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Section id="circle" num="06" title="Rhythm circle" hint="the pattern as a clock">
          <RhythmCircle pattern={working} currentStep={currentStep} />
        </Section>
        <Section id="pulse" num="06b" title="Pulse clock" hint="one ring per bar · sweep = live step">
          <PulseClock pattern={working} currentStep={currentStep} />
        </Section>
      </div>

      {/* --------------------------- 07 intensity + energy lane */}
      <div className="space-y-8">
        <Section id="intensity" num="07" title="Intensity map" hint="accents, ghosts & density">
          <IntensityView pattern={working} currentStep={currentStep} />
        </Section>
        <Section id="energy" num="07b" title="Groove energy lane" hint="stacked onset histogram · live playhead">
          <OnsetHistogram pattern={working} currentStep={currentStep} />
        </Section>
      </div>

      {/* -------------------------------------------------- 08 theory */}
      <Section id="theory" num="08" title="How this groove works" hint="construction · roles · physics">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-200">
              <BookOpenText className="h-4 w-4 text-lime-400" /> Construction
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{source.description}</p>
            <div className="mt-3 border-l-2 border-lime-400/50 pl-3 text-xs leading-relaxed text-zinc-400">
              {source.learning.construction}
            </div>
          </div>
          <div className="border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-200">
              <Layers className="h-4 w-4 text-lime-400" /> Instrument roles
            </h3>
            <Accordion type="single" collapsible className="mt-2">
              {working.tracks.map((t) => {
                const inst = instrumentOf(t.inst)
                const color = TRACK_COLORS[inst.color % TRACK_COLORS.length]
                return (
                  <AccordionItem key={t.id} value={t.id} className="border-zinc-800">
                    <AccordionTrigger className="cursor-pointer py-2.5 text-left hover:no-underline">
                      <span className="flex items-center gap-2 text-xs">
                        <span className={cn('h-2 w-2 rounded-[2px]', color.dot)} aria-hidden />
                        <span className="font-mono uppercase tracking-wider text-zinc-300">{t.label ?? inst.name}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs leading-relaxed text-zinc-400">
                      {source.learning.roles[t.id] ?? source.learning.roles[inst.id] ?? 'Supporting layer — mute and solo it to hear what it contributes.'}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------- 09 story & origins */}
      <StorySection pattern={source} />

      {/* ---------------------------------------------- 10 variations */}
      {source.variations && source.variations.length > 0 && (
        <Section id="variations" num="10" title="Try a variation" hint="apply straight onto the grid">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {source.variations.map((v) => (
              <div key={v.name} className="flex flex-col border border-zinc-800 bg-zinc-900/40 p-4">
                <h3 className="text-xs font-semibold text-zinc-100">{v.name}</h3>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-zinc-500">{v.note ?? v.hint}</p>
                <div className="mt-3 flex gap-2">
                  {v.overrides && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 border-zinc-700 font-mono text-[10px] uppercase tracking-wider"
                      onClick={() => {
                        commit(applyVariation(working, v))
                        toast(`Applied: ${v.name}`, { description: 'The grid now shows the variation. Revert anytime.' })
                      }}
                    >
                      Apply & hear
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* --------------------------------------------- 10 references */}
      {refs.length > 0 && (
        <Section id="refs" num="11" title="References & further listening" hint="wikipedia · youtube — open in a new tab">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {refs.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex cursor-pointer items-start gap-3 border border-zinc-800 bg-zinc-900/40 p-3 transition-colors hover:border-lime-400/40 hover:bg-zinc-900/70"
              >
                <span className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center border',
                  r.kind === 'wiki' ? 'border-zinc-700 bg-zinc-900 text-zinc-300' : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                )}>
                  {r.kind === 'wiki' ? <BookMarked className="h-4 w-4" /> : <Youtube className="h-4 w-4" />}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-100 group-hover:text-lime-300">
                    {r.label} <ExternalLink className="h-3 w-3 opacity-40 transition-opacity group-hover:opacity-90" />
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-zinc-500">{r.note}</span>
                </span>
              </a>
            ))}
          </div>
          <p className="mt-2.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
            <Music2 className="h-3 w-3" /> external links — groovemap never embeds or hosts third-party media
          </p>
        </Section>
      )}

      {/* ------------------------------------------------ 11 related */}
      {related.length > 0 && (
        <Section id="related" num="12" title="Related grooves" hint="same family, same language">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <PatternCard key={p.id} pattern={p} onOpen={openPattern} />
            ))}
          </div>
        </Section>
      )}

      {/* ---------------------------------------------------- source */}
      <section className="border border-zinc-800/60 bg-zinc-900/20 p-4" aria-label="Source and attribution">
        <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">source & provenance</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          <span className="font-mono uppercase tracking-wider text-zinc-400">{source.source.type}</span> — {source.source.note}
        </p>
      </section>

      <PrintSheet pattern={working} />
    </div>
  )
}
