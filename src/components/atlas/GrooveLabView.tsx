'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type ReactNode,
} from 'react'
import {
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Link2,
  Pencil,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  Trash2,
  Undo2,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { useAtlas, usePlayhead } from './AtlasProvider'
import { StepGrid } from './StepGrid'
import { TransportBar } from './TransportBar'
import { ExportMenu } from './ExportMenu'
import { PrintSheet } from './PrintSheet'
import type { Route } from './AppShell'
import type { GroovePattern, RhythmEvent, Subdivision, TimeSignature } from '@/lib/atlas/types'
import { stepsPerBar, velocityTier } from '@/lib/atlas/types'
import type { InstrumentDef, InstrumentId } from '@/lib/atlas/instruments'
import { instrumentOf, TRACK_COLORS, COMMON_ORDER } from '@/lib/atlas/instruments'
import { parseTrackString, subdivisionChoices, euclidean } from '@/lib/atlas/rhythm'
import {
  addGhostNotes,
  addTrack,
  addFillBar,
  changeGrid,
  complementPercussion,
  cycleVelocity,
  densify,
  doubleTrack,
  euclidFillTrack,
  humanizeVelocities,
  moveTrack,
  randomizeTrack,
  removeTrack,
  setEventProps,
  setVelocity,
  shiftTrack,
  simplify,
  thinTrack,
  toggleStep,
  withEvents,
} from '@/lib/atlas/transforms'
import { getPattern } from '@/lib/atlas/patterns'
import { deleteProject, getProject, listProjects, saveProject, type StoredProject } from '@/lib/atlas/storage'
import { importJson } from '@/lib/atlas/export/json'
import { downloadMidi, PPQ } from '@/lib/atlas/export/midi'
import { shareUrl } from '@/lib/atlas/share'

/* ================================================================== */
/* helpers                                                             */
/* ================================================================== */

const HISTORY_CAP = 50
const RANGE16 = Array.from({ length: 16 }, (_, i) => i + 1)
const ROT16 = Array.from({ length: 16 }, (_, i) => i)
const GROUPS: { key: InstrumentDef['group']; label: string }[] = [
  { key: 'drums', label: 'Drums' },
  { key: 'cymbals', label: 'Cymbals' },
  { key: 'percussion', label: 'Percussion' },
]

function defaultLabPattern(): GroovePattern {
  return {
    id: 'lab-untitled',
    slug: 'lab-untitled',
    title: 'Untitled Groove',
    summary: 'A fresh backbeat started in the Groove Lab.',
    description: 'Your own groove — edit it here, then save, share or export it.',
    family: 'experimental',
    genres: ['Original'],
    tags: ['lab'],
    difficulty: 'beginner',
    bpm: 100,
    tempoRange: [70, 130],
    timeSignature: { num: 4, den: 4 },
    bars: 1,
    subdivision: 4,
    feel: 'straight',
    swing: 0,
    syncopation: 1,
    density: 1,
    tracks: [
      { id: 'kick', inst: 'kick', vol: 0.9, pan: 0 },
      { id: 'snare', inst: 'snare', vol: 0.85, pan: 0 },
      { id: 'hatClosed', inst: 'hatClosed', vol: 0.7, pan: 0.15 },
    ],
    events: [
      ...parseTrackString('X.......X.......', 'kick'),
      ...parseTrackString('....X.......X...', 'snare'),
      ...parseTrackString('x.x.x.x.x.x.x.x.', 'hatClosed'),
    ],
    kitSuggestion: 'analog909',
    learning: {
      construction: 'Backbeat skeleton — kick on 1 and the “&” of 3, snare on 2 and 4, closed hats on every 8th.',
      roles: {},
    },
    source: { type: 'original', note: 'Started in Groove Lab' },
    schemaVersion: 1,
  }
}

/** pick the closest subdivision still offered for a new time signature */
function pickSub(ts: TimeSignature, sub: Subdivision): Subdivision {
  const ch = subdivisionChoices(ts)
  if (ch.some((c) => c.value === sub)) return sub
  const lower = ch.filter((c) => c.value < sub)
  return lower.length ? lower[lower.length - 1].value : ch[0].value
}

function panLabel(pct: number): string {
  return pct === 0 ? 'C' : `${pct < 0 ? 'L' : 'R'}${Math.abs(pct)}`
}

/** collapsible sidebar section */
function LabPanel({ title, hint, actions, children }: { title: string; hint?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="border border-zinc-800 bg-zinc-900/40" aria-label={title}>
      <header className="flex items-center justify-between gap-2 border-b border-zinc-800/80 px-3 py-2">
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-lime-400">{title}</h3>
        {actions ?? (hint && <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">{hint}</span>)}
      </header>
      <div className="space-y-2.5 p-3">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-zinc-600">{label}</Label>
      {children}
    </div>
  )
}

/** sidebar action button — 40px tall on touch, compact from sm up */
function MBtn({ className, ...rest }: ComponentProps<typeof Button>) {
  return (
    <Button
      size="sm"
      variant="outline"
      className={cn('h-10 justify-start border-zinc-700 px-2 font-mono text-[10px] uppercase tracking-wider sm:h-8', className)}
      {...rest}
    />
  )
}

function Dot({ colorSlot, className }: { colorSlot: number; className?: string }) {
  return <span className={cn('h-2 w-2 shrink-0 rounded-[2px]', TRACK_COLORS[colorSlot % TRACK_COLORS.length].dot, className)} aria-hidden />
}

/** numeric select — mono trigger, numeric values */
function NumSelect({
  value,
  onChange,
  options,
  label,
  className,
  disabled,
}: {
  value: number
  onChange: (n: number) => void
  options: { value: number; label: string }[]
  label: string
  className?: string
  disabled?: boolean
}) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))} disabled={disabled}>
      <SelectTrigger size="sm" className={cn('font-mono text-xs', className)} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={String(o.value)} className="font-mono text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** track picker — colored dots + optional "+ new instrument" entry */
function TrackSelect({
  value,
  onChange,
  items,
  label,
  allowNew,
  disabled,
}: {
  value: string
  onChange: (id: string) => void
  items: { id: string; name: string; colorSlot: number }[]
  label: string
  allowNew?: boolean
  disabled?: boolean
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger size="sm" className="w-full font-mono text-xs" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((t) => (
          <SelectItem key={t.id} value={t.id} className="font-mono text-xs">
            <span className="flex items-center gap-1.5">
              <Dot colorSlot={t.colorSlot} /> {t.name}
            </span>
          </SelectItem>
        ))}
        {allowNew && (
          <SelectItem value="__new" className="font-mono text-xs">
            + new instrument…
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}

/** searchable instrument picker used by "add track" */
function AddTrackPicker({ onAdd, disabled }: { onAdd: (inst: InstrumentId) => void; disabled?: boolean }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const pick = (inst: InstrumentId) => {
    setOpen(false)
    setQ('')
    onAdd(inst)
  }
  const match = (d: InstrumentDef) => !q || d.name.toLowerCase().includes(q.toLowerCase()) || d.short.toLowerCase().includes(q.toLowerCase())
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled} aria-label="Add a track" className="h-7 border-zinc-700 px-2 font-mono text-[9px] uppercase tracking-wider">
          <Plus className="h-3 w-3" /> add track
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 border-zinc-800 bg-zinc-950 p-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="search instruments…"
          aria-label="Search instruments"
          className="mb-2 h-8 rounded-none border-zinc-800 bg-zinc-900/80 font-mono text-xs"
        />
        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {GROUPS.map((g) => {
            const items = COMMON_ORDER.map((id) => instrumentOf(id)).filter((d) => d.group === g.key && match(d))
            if (!items.length) return null
            return (
              <div key={g.key}>
                <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-zinc-600">{g.label}</p>
                <div className="grid grid-cols-2 gap-1">
                  {items.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => pick(d.id)}
                      className="flex min-h-[36px] items-center gap-1.5 border border-zinc-800 bg-zinc-900/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300 hover:border-lime-400/60 hover:text-lime-300"
                      aria-label={`Add ${d.name} track`}
                    >
                      <Dot colorSlot={d.color} />
                      <span className="truncate">{d.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** desktop gets an aside, mobile gets tabs */
function useIsWide(): boolean {
  const [wide, setWide] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)')
    const on = () => setWide(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return wide
}

/* ================================================================== */
/* GrooveLabView                                                       */
/* ================================================================== */

export function GrooveLabView({
  patternId,
  sharedPattern,
  navigate,
}: {
  patternId?: string
  sharedPattern: GroovePattern | null
  navigate: (r: Route) => void
}) {
  const a = useAtlas()
  const { updatePattern, loadPattern: loadCtx, stop: stopCtx } = a
  const pos = usePlayhead()
  const isWide = useIsWide()

  /* ---------------- working state ---------------- */
  const [working, setWorking] = useState<GroovePattern>(() => defaultLabPattern())
  const [title, setTitle] = useState('Untitled Groove')
  const [sourceTag, setSourceTag] = useState<'new' | 'catalog' | 'project' | 'shared' | 'imported'>('new')
  const workingRef = useRef(working)
  useEffect(() => {
    workingRef.current = working
  }, [working])

  /* ---------------- undo / redo (cap 50, coalesced drags) ---------------- */
  const undoStack = useRef<GroovePattern[]>([])
  const redoStack = useRef<GroovePattern[]>([])
  const [hist, setHist] = useState({ u: 0, r: 0 })
  const lastSig = useRef<{ sig: string; t: number } | null>(null)
  const bump = () => setHist({ u: undoStack.current.length, r: redoStack.current.length })

  const commit = useCallback(
    (next: GroovePattern, sig?: string) => {
      const prev = workingRef.current
      const now = Date.now()
      const coalesce = !!sig && lastSig.current?.sig === sig && now - lastSig.current.t < 700
      if (!coalesce) undoStack.current = [...undoStack.current.slice(-(HISTORY_CAP - 1)), prev]
      lastSig.current = sig ? { sig, t: now } : null
      redoStack.current = []
      setWorking(next)
      updatePattern(next)
      bump()
    },
    [updatePattern]
  )

  const undo = useCallback(() => {
    const stack = undoStack.current
    if (!stack.length) return
    const prev = stack[stack.length - 1]
    undoStack.current = stack.slice(0, -1)
    redoStack.current = [...redoStack.current.slice(-(HISTORY_CAP - 1)), workingRef.current]
    setWorking(prev)
    updatePattern(prev)
    bump()
  }, [updatePattern])

  const redo = useCallback(() => {
    const stack = redoStack.current
    if (!stack.length) return
    const next = stack[stack.length - 1]
    redoStack.current = stack.slice(0, -1)
    undoStack.current = [...undoStack.current.slice(-(HISTORY_CAP - 1)), workingRef.current]
    setWorking(next)
    updatePattern(next)
    bump()
  }, [updatePattern])

  /* ---------------- ctrl/cmd+z · ctrl/cmd+shift+z · ctrl+y ---------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return
      if (!(e.metaKey || e.ctrlKey)) return
      const k = e.key.toLowerCase()
      if (k === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if (k === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  /* ---------------- selection + A/B + panel state ---------------- */
  const [selected, setSelected] = useState<{ trackId: string; step: number } | null>(null)
  const [slotB, setSlotB] = useState<GroovePattern | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [mutTrack, setMutTrack] = useState('')
  const [eu, setEu] = useState<{ pulses: number; steps: number; rotate: number; target: string; newInst: InstrumentId }>({
    pulses: 3,
    steps: 16,
    rotate: 0,
    target: '__new',
    newInst: 'clap',
  })

  /* ---------------- projects ---------------- */
  const [projects, setProjects] = useState<StoredProject[]>([])
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null)
  const [projOpen, setProjOpen] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')
  const refreshProjects = useCallback(() => setProjects(listProjects()), [])
  useEffect(() => {
    // deferred: localStorage only exists on the client, after mount
    queueMicrotask(refreshProjects)
  }, [refreshProjects])

  /* ---------------- load a pattern into the lab ---------------- */
  const loadIntoLab = useCallback(
    (p: GroovePattern, name: string, projId: string | null, tag: typeof sourceTag) => {
      undoStack.current = []
      redoStack.current = []
      lastSig.current = null
      bump()
      setSelected(null)
      setSlotB(null)
      setCompareMode(false)
      setRenamingId(null)
      setWorking(p)
      setTitle(name)
      setLoadedProjectId(projId)
      setSourceTag(tag)
      setMutTrack(p.tracks[0]?.id ?? '')
      stopCtx()
      loadCtx(p, { play: false })
    },
    [loadCtx, stopCtx]
  )

  /* ---------------- source resolution (mount / patternId / sharedPattern) ---------------- */
  const loadedKeyRef = useRef<string | null>(null)
  const resolveSource = () => {
    if (sharedPattern) {
      const key = `shared:${sharedPattern.id}:${sharedPattern.title}`
      if (loadedKeyRef.current === key) return
      loadedKeyRef.current = key
      loadIntoLab(structuredClone(sharedPattern), sharedPattern.title || 'Shared Groove', null, 'shared')
      return
    }
    if (patternId) {
      const key = `id:${patternId}`
      if (loadedKeyRef.current === key) return
      loadedKeyRef.current = key
      const cat = getPattern(patternId)
      if (cat) {
        loadIntoLab(structuredClone(cat), cat.title, null, 'catalog')
        return
      }
      const proj = getProject(patternId)
      if (proj) {
        loadIntoLab(structuredClone(proj.pattern), proj.name, proj.id, 'project')
        return
      }
      loadIntoLab(defaultLabPattern(), 'Untitled Groove', null, 'new')
      return
    }
    // no explicit source — seed the default groove on the very first mount only,
    // so navigating back to the Lab never wipes work in progress
    if (loadedKeyRef.current === null) {
      loadedKeyRef.current = 'blank'
      loadIntoLab(defaultLabPattern(), 'Untitled Groove', null, 'new')
    }
  }
  useEffect(() => {
    // deferred: source resolution reads browser localStorage and syncs the audio engine
    queueMicrotask(resolveSource)
    // rerun only when the route inputs change — resolveSource reads them from closure
  }, [patternId, sharedPattern])

  /* ---------------- derived ---------------- */
  const spb = stepsPerBar(working.timeSignature, working.subdivision)
  const isLoaded = a.playingId === working.id && a.pattern != null
  const currentStep = isLoaded ? pos?.step ?? null : null
  const playingA = isLoaded && a.playing
  const playingB = !!slotB && a.playingId === slotB.id && a.playing

  const dimTracks = useMemo(() => new Set(Object.entries(a.mix).filter(([, m]) => m.muted).map(([tid]) => tid)), [a.mix])

  const diffCells = useMemo(() => {
    if (!compareMode || !slotB) return undefined
    const bMap = new Map(slotB.events.map((e) => [`${e.t}:${e.s}`, e]))
    const aMap = new Map(working.events.map((e) => [`${e.t}:${e.s}`, e]))
    const keys = new Set<string>()
    for (const [k, ea] of aMap) {
      const eb = bMap.get(k)
      if (!eb || eb.v !== ea.v || (eb.p ?? 1) !== (ea.p ?? 1) || (eb.r ?? 1) !== (ea.r ?? 1)) keys.add(k)
    }
    for (const k of bMap.keys()) if (!aMap.has(k)) keys.add(k)
    return keys
  }, [compareMode, slotB, working])

  /** working pattern with live transport tempo/swing baked in — used for save/export/print */
  const live = useMemo<GroovePattern>(() => ({ ...working, bpm: Math.round(a.bpm), swing: a.swing }), [working, a.bpm, a.swing])

  const activeMut = working.tracks.some((t) => t.id === mutTrack) ? mutTrack : working.tracks[0]?.id ?? ''
  const euTarget = eu.target === '__new' || working.tracks.some((t) => t.id === eu.target) ? eu.target : '__new'

  const selTrack = selected ? working.tracks.find((t) => t.id === selected.trackId) : undefined
  const selInst = selTrack ? instrumentOf(selTrack.inst) : null
  const selEv = selected ? working.events.find((e) => e.t === selected.trackId && e.s === selected.step) : undefined

  const trackItems = useMemo(
    () => working.tracks.map((t) => ({ id: t.id, name: t.label ?? instrumentOf(t.inst).name, colorSlot: instrumentOf(t.inst).color })),
    [working.tracks]
  )
  const subOptions = useMemo(
    () => subdivisionChoices(working.timeSignature).map((c) => ({ value: c.value as number, label: c.label })),
    [working.timeSignature]
  )
  const eucPreview = useMemo(() => euclidean(eu.pulses, Math.max(1, Math.min(16, eu.steps)), eu.rotate), [eu.pulses, eu.steps, eu.rotate])

  /* ---------------- step editing ---------------- */
  const onToggleStep = (trackId: string, step: number, mods: { shift: boolean; alt: boolean }) => {
    if (compareMode) return
    const track = working.tracks.find((t) => t.id === trackId)
    if (!track) return
    if (mods.shift || mods.alt) {
      const { pattern: next, added } = cycleVelocity(working, trackId, step)
      commit(next, `cv:${trackId}:${step}`)
      if (added) {
        const ev = next.events.find((e) => e.t === trackId && e.s === step)
        if (ev) a.preview(track.inst, ev.v)
      }
    } else {
      const existed = working.events.some((e) => e.t === trackId && e.s === step)
      commit(toggleStep(working, trackId, step), `tg:${trackId}:${step}`)
      if (!existed) a.preview(track.inst)
    }
  }

  /* ---------------- track label tools (M / S + hover move/remove) ---------------- */
  const renderLabelActions = (tid: string): ReactNode => {
    const idx = working.tracks.findIndex((t) => t.id === tid)
    const inst = working.tracks[idx] ? instrumentOf(working.tracks[idx].inst) : null
    const name = inst?.name ?? 'track'
    const mini =
      'flex h-3.5 w-3.5 items-center justify-center border text-[7px] font-bold leading-none border-zinc-700 text-zinc-500 hover:text-zinc-300'
    return (
      <span className="group/lab relative flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => a.setTrackMix(tid, { muted: !a.mix[tid]?.muted })}
          aria-label={`Mute ${name}`}
          aria-pressed={!!a.mix[tid]?.muted}
          className={cn(mini, a.mix[tid]?.muted && 'border-rose-400 bg-rose-400 text-zinc-950')}
        >
          M
        </button>
        <button
          type="button"
          onClick={() => a.setTrackMix(tid, { solo: !a.mix[tid]?.solo })}
          aria-label={`Solo ${name}`}
          aria-pressed={!!a.mix[tid]?.solo}
          className={cn(mini, a.mix[tid]?.solo && 'border-cyan-400 bg-cyan-400 text-zinc-950')}
        >
          S
        </button>
        <span className="absolute left-5 top-1/2 z-20 hidden -translate-y-1/2 items-center gap-0.5 border border-zinc-700 bg-zinc-950 p-0.5 shadow-lg shadow-black/60 group-focus-within/lab:flex group-hover/lab:flex">
          <button
            type="button"
            disabled={idx <= 0}
            onClick={() => commit(moveTrack(working, tid, -1))}
            aria-label={`Move ${name} up`}
            title="Move track up"
            className="flex h-5 w-5 items-center justify-center text-zinc-400 hover:text-lime-300 disabled:opacity-30"
          >
            <ArrowUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            disabled={idx >= working.tracks.length - 1}
            onClick={() => commit(moveTrack(working, tid, 1))}
            aria-label={`Move ${name} down`}
            title="Move track down"
            className="flex h-5 w-5 items-center justify-center text-zinc-400 hover:text-lime-300 disabled:opacity-30"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => {
              commit(removeTrack(working, tid))
              if (selected?.trackId === tid) setSelected(null)
              if (mutTrack === tid) setMutTrack('')
              toast(`Removed ${name}`, { description: 'Undo with Ctrl+Z.' })
            }}
            aria-label={`Remove ${name}`}
            title="Remove track"
            className="flex h-5 w-5 items-center justify-center text-zinc-400 hover:text-rose-400"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      </span>
    )
  }

  /* ---------------- grid config ---------------- */
  const setNum = (n: number) => {
    const ts: TimeSignature = { num: n, den: working.timeSignature.den }
    commit(changeGrid(working, ts, pickSub(ts, working.subdivision), working.bars))
  }
  const setDen = (d: number) => {
    const ts: TimeSignature = { num: working.timeSignature.num, den: d as 4 | 8 }
    commit(changeGrid(working, ts, pickSub(ts, working.subdivision), working.bars))
  }
  const setSub = (s: number) => commit(changeGrid(working, working.timeSignature, s as Subdivision, working.bars))
  const setBars = (b: number) => commit(changeGrid(working, working.timeSignature, working.subdivision, b))

  /* ---------------- title sync ---------------- */
  const commitTitle = () => {
    const name = title.trim() || 'Untitled Groove'
    if (compareMode) return
    if (working.title !== name) commit({ ...working, title: name })
    if (title !== name) setTitle(name)
  }

  /* ---------------- transforms ("Mutate") ---------------- */
  const mutate = (label: string, fn: (p: GroovePattern) => GroovePattern, desc?: string) => {
    commit(fn(working))
    toast.success(label, { description: desc ?? 'Undo anytime with Ctrl+Z.' })
  }
  const instTrackId = (inst: InstrumentId): string | null => {
    const t = working.tracks.find((x) => x.inst === inst)
    if (!t) {
      toast.error(`No ${instrumentOf(inst).name} track`, { description: 'Add one from the Mixer panel first.' })
      return null
    }
    return t.id
  }

  const addInst = (inst: InstrumentId) => {
    const { pattern: next, trackId } = addTrack(working, inst)
    commit(next)
    setMutTrack(trackId)
    a.preview(inst)
    toast.success(`Added ${instrumentOf(inst).name}`, { description: 'Empty track — paint hits in the grid.' })
  }

  const applyEuclid = () => {
    let p = working
    let tid = euTarget
    if (tid === '__new') {
      const r = addTrack(p, eu.newInst)
      p = r.pattern
      tid = r.trackId
    } else if (!p.tracks.some((t) => t.id === tid)) {
      toast.error('Target track is missing')
      return
    }
    p = euclidFillTrack(p, tid, eu.pulses, eu.steps, eu.rotate)
    commit(p)
    setEu((s) => ({ ...s, target: tid }))
    const inst = p.tracks.find((t) => t.id === tid)?.inst
    if (inst) a.preview(inst)
    toast.success(`Euclidean ${Math.min(eu.pulses, eu.steps)}/${eu.steps} applied`, {
      description: `rotated by ${eu.rotate} — replaced all hits on that track.`,
    })
  }

  /* ---------------- A/B compare actions ---------------- */
  const copyToB = () => {
    const b = structuredClone(workingRef.current)
    b.id = `${workingRef.current.id}__b`
    setSlotB(b)
    toast.success('Copied to slot B', { description: 'Flip compare mode to audition B against A.' })
  }
  const toggleCompare = (on: boolean) => {
    if (on) {
      if (!slotB) {
        toast.error('Slot B is empty — copy the current groove to B first.')
        return
      }
      setCompareMode(true)
      loadCtx(slotB, { play: a.playing })
    } else {
      setCompareMode(false)
      loadCtx(workingRef.current, { play: a.playing })
    }
  }
  const playA = () => loadCtx(workingRef.current)
  const playB = () => {
    if (slotB) loadCtx(slotB)
  }
  const restoreB = () => {
    if (!slotB) return
    const next = structuredClone(slotB)
    next.id = workingRef.current.id
    commit(next)
    toast.success('Slot B → working groove', { description: 'The B arrangement replaces A. Ctrl+Z to undo.' })
  }

  /* ---------------- save / projects ---------------- */
  const doSave = (asNew: boolean) => {
    const name = title.trim() || 'Untitled Groove'
    const existing = asNew ? undefined : (loadedProjectId ?? undefined)
    const proj = saveProject(name, { ...live, title: name }, existing)
    setLoadedProjectId(proj.id)
    refreshProjects()
    toast.success(existing ? `Saved — ${proj.name}` : 'Saved as new pattern', {
      description: 'Stored in “My Patterns” (browser-local, private).',
    })
  }
  const loadProject = (p: StoredProject) => {
    loadIntoLab(structuredClone(p.pattern), p.name, p.id, 'project')
    toast(`Loaded “${p.name}”`, { description: 'Previous groove replaced — it stays saved in My Patterns.' })
  }
  const submitRename = () => {
    if (!renamingId) return
    const p = projects.find((x) => x.id === renamingId)
    const name = renameVal.trim()
    if (p && name && name !== p.name) {
      saveProject(name, p.pattern, p.id)
      refreshProjects()
      toast.success('Renamed')
    }
    setRenamingId(null)
  }

  /* ---------------- import / export / share ---------------- */
  const fileRef = useRef<HTMLInputElement>(null)
  const onImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const p = importJson(await f.text())
      loadIntoLab(structuredClone(p), p.title || 'Imported Groove', null, 'imported')
      toast.success('Pattern imported', { description: p.title })
    } catch (err) {
      toast.error('Import failed', { description: err instanceof Error ? err.message : String(err) })
    }
  }
  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(live))
      toast.success('Share link copied', { description: 'The full groove is embedded in the URL.' })
    } catch {
      toast.error('Could not copy link', { description: 'Your browser blocked clipboard access.' })
    }
  }
  const onMidi = () => {
    try {
      downloadMidi(live)
      toast.success('MIDI exported', { description: `GM percussion map · PPQ ${PPQ} · tempo ${Math.round(a.bpm)} BPM` })
    } catch (err) {
      toast.error('MIDI export failed', { description: String(err) })
    }
  }
  const onNew = () => {
    loadIntoLab(defaultLabPattern(), 'Untitled Groove', null, 'new')
    navigate({ view: 'lab' })
    toast('Fresh groove started')
  }

  /* ================================================================ */
  /* sidebar panels (shared between desktop aside and mobile tabs)     */
  /* ================================================================ */

  const feelPanel = (
    <LabPanel title="Feel" hint="playback only">
      <Field label={`swing — ${Math.round(a.swing * 100)}%`}>
        <Slider value={[Math.round(a.swing * 100)]} min={0} max={66} step={1} onValueChange={([v]) => a.setSwing(v / 100)} aria-label="Swing amount" />
      </Field>
      <Field label={`humanize — ${Math.round(a.humanize * 100)}%`}>
        <Slider value={[Math.round(a.humanize * 100)]} min={0} max={100} step={1} onValueChange={([v]) => a.setHumanize(v / 100)} aria-label="Humanize amount" />
      </Field>
      <MBtn
        className="w-full"
        onClick={() => {
          a.setSwing(0)
          a.setHumanize(0)
        }}
        aria-label="Reset swing and humanize to zero"
      >
        <RotateCcw className="h-3 w-3" /> reset to straight
      </MBtn>
      <p className="font-mono text-[9px] leading-relaxed text-zinc-600">
        swing delays every off-beat (straight grids) · humanize jitters velocities live — the grid stays untouched.
      </p>
    </LabPanel>
  )

  const mutatePanel = (
    <LabPanel title="Mutate" hint={compareMode ? 'paused' : 'undo-able'}>
      <Field label="target track">
        <TrackSelect label="Track to mutate" value={activeMut} onChange={setMutTrack} items={trackItems} disabled={compareMode || !trackItems.length} />
      </Field>
      <div className="grid grid-cols-2 gap-1.5">
        <MBtn disabled={!activeMut || compareMode} onClick={() => mutate('Shifted left', (p) => shiftTrack(p, activeMut, -1))} title="Rotate every hit one step earlier" aria-label="Shift track left">
          <ChevronLeft className="h-3 w-3" /> shift
        </MBtn>
        <MBtn disabled={!activeMut || compareMode} onClick={() => mutate('Shifted right', (p) => shiftTrack(p, activeMut, 1))} title="Rotate every hit one step later" aria-label="Shift track right">
          shift <ChevronRight className="h-3 w-3" />
        </MBtn>
        <MBtn
          disabled={compareMode}
          onClick={() => {
            const tid = instTrackId('hatClosed')
            if (tid) mutate('Thinned hats', (p) => thinTrack(p, tid), 'Dropped ~45% of non-accent hits.')
          }}
          title="Drop ~45% of non-accent closed-hat hits"
          aria-label="Thin out closed hats"
        >
          thin hats
        </MBtn>
        <MBtn
          disabled={compareMode}
          onClick={() => {
            const tid = instTrackId('hatClosed')
            if (tid) mutate('Doubled hats', (p) => doubleTrack(p, tid), 'Mirrored the first half into the second.')
          }}
          title="Copy first-half hats into the second half"
          aria-label="Double closed hats into second half"
        >
          double hats
        </MBtn>
        <MBtn
          disabled={compareMode}
          onClick={() => {
            const tid = instTrackId('snare')
            if (tid) mutate('Ghost notes added', (p) => addGhostNotes(p, tid), 'Quiet off-beat snare fills.')
          }}
          title="Scatter quiet off-beat snare hits"
          aria-label="Add ghost notes to snare"
        >
          ghost notes
        </MBtn>
        <MBtn disabled={!activeMut || compareMode} onClick={() => mutate('Randomized track', (p) => randomizeTrack(p, activeMut), 'Constraint-based — stays musical.')} title="Regenerate the target track" aria-label="Randomize target track">
          randomize
        </MBtn>
        <MBtn disabled={compareMode} onClick={() => mutate('Simplified', (p) => simplify(p), 'Kept structural beats, dropped clutter.')} title="Keep on-beat and accent hits only" aria-label="Simplify whole pattern">
          simplify
        </MBtn>
        <MBtn disabled={compareMode} onClick={() => mutate('Densified', (p) => densify(p), 'Added kick hits on the half-bar.')} title="Fill out the kick on main subdivisions" aria-label="Densify pattern">
          densify
        </MBtn>
        <MBtn disabled={compareMode} onClick={() => mutate('Velocities humanized', (p) => humanizeVelocities(p), 'Subtle accent jitter across all hits.')} title="Jitter every velocity slightly" aria-label="Humanize velocities">
          humanize vel
        </MBtn>
        <MBtn disabled={compareMode || working.bars < 1} onClick={() => mutate('Fill bar added', (p) => addFillBar(p, p.bars - 1), 'Snare/tom fill over the last bar.')} title="Generate a snare/tom fill on the last bar" aria-label="Add fill on last bar">
          + fill bar
        </MBtn>
        <MBtn
          disabled={compareMode}
          onClick={() => {
            const r = complementPercussion(working)
            commit(r.pattern)
            setMutTrack(r.trackId)
            const inst = r.pattern.tracks.find((t) => t.id === r.trackId)?.inst
            if (inst) a.preview(inst)
            toast.success('Complement layer added', { description: 'New percussion track avoiding existing onsets.' })
          }}
          title="Generate a percussion counter-layer"
          aria-label="Add complementary percussion layer"
        >
          complement
        </MBtn>
        <MBtn
          disabled={!activeMut || compareMode}
          onClick={() => {
            const name = trackItems.find((t) => t.id === activeMut)?.name ?? 'track'
            mutate(`Cleared ${name}`, (p) => withEvents(p, p.events.filter((e) => e.t !== activeMut)))
          }}
          title="Remove every hit from the target track"
          aria-label="Clear all hits on target track"
          className="hover:border-rose-400/60 hover:text-rose-300"
        >
          clear track
        </MBtn>
        <MBtn disabled={compareMode} className="col-span-2 justify-center hover:border-rose-400/60 hover:text-rose-300" onClick={() => mutate('Cleared all hits', (p) => withEvents(p, []), 'All events removed — tracks remain.')} aria-label="Clear all hits in the pattern">
          clear all hits
        </MBtn>
      </div>
    </LabPanel>
  )

  const euclidPanel = (
    <LabPanel title="Euclidean" hint="bjorklund">
      <div className="grid grid-cols-3 gap-1.5">
        <Field label="pulses">
          <NumSelect label="Euclidean pulses" value={eu.pulses} onChange={(n) => setEu((s) => ({ ...s, pulses: n }))} options={RANGE16.map((n) => ({ value: n, label: String(n) }))} className="w-full" />
        </Field>
        <Field label="steps">
          <NumSelect label="Euclidean steps" value={eu.steps} onChange={(n) => setEu((s) => ({ ...s, steps: n }))} options={RANGE16.map((n) => ({ value: n, label: String(n) }))} className="w-full" />
        </Field>
        <Field label="rotate">
          <NumSelect label="Euclidean rotation" value={eu.rotate} onChange={(n) => setEu((s) => ({ ...s, rotate: n }))} options={ROT16.map((n) => ({ value: n, label: String(n) }))} className="w-full" />
        </Field>
      </div>
      <div className="flex min-h-[24px] flex-wrap items-center gap-[3px]" aria-hidden>
        {eucPreview.map((on, i) => (
          <span key={i} className={cn('h-2.5 w-2.5 border', on ? 'border-lime-400 bg-lime-400' : 'border-zinc-700 bg-zinc-800/60')} />
        ))}
      </div>
      <p className="sr-only">
        Euclidean preview: {Math.min(eu.pulses, eu.steps)} pulses in {eu.steps} steps, rotated by {eu.rotate}.
      </p>
      <Field label="target track">
        <TrackSelect label="Euclidean target track" value={euTarget} onChange={(v) => setEu((s) => ({ ...s, target: v }))} items={trackItems} allowNew disabled={compareMode} />
      </Field>
      {euTarget === '__new' && (
        <Field label="new instrument">
          <Select value={eu.newInst} onValueChange={(v) => setEu((s) => ({ ...s, newInst: v as InstrumentId }))}>
            <SelectTrigger size="sm" className="w-full font-mono text-xs" aria-label="New instrument for euclidean rhythm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMMON_ORDER.map((id) => instrumentOf(id)).map((d) => (
                <SelectItem key={d.id} value={d.id} className="font-mono text-xs">
                  <span className="flex items-center gap-1.5">
                    <Dot colorSlot={d.color} /> {d.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
      <Button size="sm" disabled={compareMode} onClick={applyEuclid} aria-label="Apply euclidean rhythm to target track" className="h-10 w-full bg-lime-400 font-mono text-[10px] uppercase tracking-wider text-zinc-950 hover:bg-lime-300 sm:h-8">
        apply rhythm
      </Button>
      <p className="font-mono text-[9px] leading-relaxed text-zinc-600">
        replaces all hits on the target track · covers steps 1–{Math.min(16, eu.steps)} of the pattern.
      </p>
    </LabPanel>
  )

  const abPanel = (
    <LabPanel title="A / B compare" hint={slotB ? 'B loaded' : 'B empty'}>
      <div className="grid grid-cols-3 gap-1.5">
        <MBtn onClick={playA} aria-label="Play slot A (working groove)" className={cn('justify-center', playingA && 'border-lime-400 text-lime-300')}>
          play A
        </MBtn>
        <MBtn disabled={!slotB} onClick={playB} aria-label="Play slot B" className={cn('justify-center', playingB && 'border-amber-400 text-amber-300')}>
          play B
        </MBtn>
        <MBtn disabled={!slotB} onClick={restoreB} aria-label="Copy slot B back into the working groove" className="justify-center">
          b → a
        </MBtn>
      </div>
      <MBtn disabled={compareMode} onClick={copyToB} aria-label="Copy current groove to slot B" className="w-full justify-center">
        <Copy className="h-3 w-3" /> copy current → slot B
      </MBtn>
      <div className="flex items-center justify-between border border-zinc-800 bg-zinc-950/60 px-2 py-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">compare mode</span>
        <div className="flex items-center gap-2">
          {compareMode && diffCells && (
            <Badge className="rounded-none border-amber-400/60 bg-amber-400/10 font-mono text-[9px] text-amber-300">
              {diffCells.size} diff{diffCells.size === 1 ? '' : 's'}
            </Badge>
          )}
          <Switch checked={compareMode} onCheckedChange={toggleCompare} disabled={!slotB} aria-label="Toggle A/B compare mode" />
        </div>
      </div>
      <p className="font-mono text-[9px] leading-relaxed text-zinc-600">
        compare mode plays slot B and outlines every cell where A and B differ. Editing resumes when you switch it off.
      </p>
    </LabPanel>
  )

  const mixerPanel = (
    <LabPanel title="Mixer" actions={<AddTrackPicker onAdd={addInst} disabled={compareMode} />}>
      {working.tracks.length === 0 && <p className="font-mono text-[10px] text-zinc-600">no tracks — add one with “add track”.</p>}
      {working.tracks.map((t) => {
        const inst = instrumentOf(t.inst)
        const vol = Math.round((a.mix[t.id]?.vol ?? t.vol) * 100)
        const pan = Math.round((a.mix[t.id]?.pan ?? t.pan) * 100)
        return (
          <div key={t.id} className="space-y-1 border-b border-zinc-800/60 pb-2.5 last:border-b-0 last:pb-0">
            <div className="flex items-center gap-1.5">
              <Dot colorSlot={inst.color} />
              <span className="min-w-0 flex-1 truncate font-mono text-[10px] uppercase tracking-wider text-zinc-300">{t.label ?? inst.name}</span>
              <span className="font-mono text-[9px] tabular-nums text-zinc-500">
                v{vol} · {panLabel(pan)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 shrink-0 text-center font-mono text-[8px] text-zinc-600" aria-hidden>
                v
              </span>
              <Slider value={[vol]} min={0} max={100} step={1} onValueChange={([v]) => a.setTrackMix(t.id, { vol: v / 100 })} aria-label={`${inst.name} volume`} className="flex-1" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 shrink-0 text-center font-mono text-[8px] text-zinc-600" aria-hidden>
                p
              </span>
              <Slider value={[pan]} min={-100} max={100} step={5} onValueChange={([v]) => a.setTrackMix(t.id, { pan: v / 100 })} aria-label={`${inst.name} pan`} className="flex-1" />
            </div>
          </div>
        )
      })}
      <p className="font-mono text-[9px] leading-relaxed text-zinc-600">volume/pan are playback settings — M/S on the grid labels mute or solo instantly.</p>
    </LabPanel>
  )

  const loadedFromName = loadedProjectId ? projects.find((p) => p.id === loadedProjectId)?.name : undefined

  const savePanel = (
    <LabPanel title="Save / projects" hint="browser-local">
      <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">
        {loadedFromName ? (
          <>
            opened from <span className="text-zinc-400">{loadedFromName}</span> — save overwrites it
          </>
        ) : (
          'new groove — save creates a project'
        )}
      </p>
      <Collapsible
        open={projOpen}
        onOpenChange={(o) => {
          setProjOpen(o)
          if (o) refreshProjects()
        }}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            aria-expanded={projOpen}
            className="flex min-h-[36px] w-full items-center justify-between border border-zinc-800 bg-zinc-950/60 px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400 hover:text-lime-300"
          >
            my patterns ({projects.length})
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', projOpen && 'rotate-180')} aria-hidden />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-1.5 max-h-72 space-y-1 overflow-y-auto pr-1">
            {projects.length === 0 && <p className="py-3 text-center font-mono text-[10px] text-zinc-600">no saved patterns yet</p>}
            {projects.map((p) => (
              <div key={p.id} className="flex items-center gap-1 border border-zinc-800 bg-zinc-950/60 px-2 py-1.5">
                {renamingId === p.id ? (
                  <form
                    className="flex min-w-0 flex-1 items-center gap-1"
                    onSubmit={(e) => {
                      e.preventDefault()
                      submitRename()
                    }}
                  >
                    <Input value={renameVal} onChange={(e) => setRenameVal(e.target.value)} autoFocus aria-label="Project name" className="h-7 rounded-none border-zinc-700 bg-zinc-900 font-mono text-xs" />
                    <button type="submit" aria-label="Confirm rename" className="flex h-7 w-7 shrink-0 items-center justify-center border border-zinc-700 text-zinc-400 hover:border-lime-400/60 hover:text-lime-300">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" aria-label="Cancel rename" onClick={() => setRenamingId(null)} className="flex h-7 w-7 shrink-0 items-center justify-center border border-zinc-700 text-zinc-400 hover:text-rose-300">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </form>
                ) : (
                  <>
                    <button type="button" onClick={() => loadProject(p)} title={`Load “${p.name}”`} className="min-w-0 flex-1 text-left" aria-label={`Load project ${p.name}`}>
                      <span className="block truncate font-mono text-xs text-zinc-200 hover:text-lime-300">{p.name}</span>
                      <span className="font-mono text-[9px] text-zinc-600">
                        {new Date(p.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {p.pattern.tracks.length} tracks · {p.pattern.bars} bar
                        {p.pattern.bars === 1 ? '' : 's'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRenamingId(p.id)
                        setRenameVal(p.name)
                      }}
                      aria-label={`Rename ${p.name}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center text-zinc-500 hover:text-lime-300"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        saveProject(`${p.name} copy`, structuredClone(p.pattern))
                        refreshProjects()
                        toast.success('Duplicated')
                      }}
                      aria-label={`Duplicate ${p.name}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center text-zinc-500 hover:text-cyan-300"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteProject(p.id)
                        if (loadedProjectId === p.id) setLoadedProjectId(null)
                        refreshProjects()
                        toast(`Deleted “${p.name}”`)
                      }}
                      aria-label={`Delete ${p.name}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center text-zinc-500 hover:text-rose-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
      <p className="font-mono text-[9px] leading-relaxed text-zinc-600">
        saving overwrites only the project this groove was opened from — “save as new” never touches existing patterns.
      </p>
    </LabPanel>
  )

  const ioPanel = (
    <LabPanel title="Take it with you">
      <div className="grid grid-cols-2 gap-1.5">
        <MBtn onClick={onShare} aria-label="Copy share link to clipboard" className="justify-center">
          <Link2 className="h-3 w-3" /> share link
        </MBtn>
        <MBtn onClick={onMidi} aria-label="Download MIDI file" className="justify-center">
          <Download className="h-3 w-3" /> .mid file
        </MBtn>
        <MBtn onClick={() => fileRef.current?.click()} aria-label="Import pattern JSON file" className="justify-center">
          <Upload className="h-3 w-3" /> import json
        </MBtn>
        <div className="col-span-2">
          <ExportMenu pattern={live} triggerClassName="h-10 w-full border-zinc-700 bg-transparent font-mono text-[10px] uppercase tracking-wider hover:border-lime-400/60 sm:h-8" />
        </div>
      </div>
      <input ref={fileRef} type="file" accept="application/json,.json" onChange={onImportFile} className="hidden" aria-hidden tabIndex={-1} />
      <p className="font-mono text-[9px] leading-relaxed text-zinc-600">
        midi: GM percussion map · PPQ {PPQ} · tempo {Math.round(a.bpm)} bpm — wav renders offline · json round-trips the full pattern.
      </p>
    </LabPanel>
  )

  const TABS = [
    ['feel', feelPanel],
    ['mutate', mutatePanel],
    ['euclid', euclidPanel],
    ['ab', abPanel],
    ['mixer', mixerPanel],
    ['save', savePanel],
    ['io', ioPanel],
  ] as const

  const sidebar =
    isWide ? (
      <aside className="w-80 shrink-0 space-y-3" aria-label="Groove lab panels">
        {TABS.map(([key, node]) => (
          <div key={key}>{node}</div>
        ))}
      </aside>
    ) : (
      <Tabs defaultValue="feel" className="w-full">
        <TabsList className="h-9 w-full justify-start gap-0.5 overflow-x-auto rounded-none border border-zinc-800 bg-zinc-950 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map(([value]) => (
            <TabsTrigger key={value} value={value} className="shrink-0 font-mono text-[10px] uppercase tracking-wider data-[state=active]:text-lime-300">
              {value}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map(([value, node]) => (
          <TabsContent key={value} value={value} className="mt-3">
            {node}
          </TabsContent>
        ))}
      </Tabs>
    )

  /* ================================================================ */
  /* render                                                           */
  /* ================================================================ */

  return (
    <div className="space-y-4">
      {/* sticky header: title, undo/redo, save/export + transport */}
      <div className="sticky top-14 z-30 -mx-3 border-b border-zinc-800 bg-zinc-950/95 px-3 pb-2 pt-2 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="hidden shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-lime-400 lg:inline">groove·lab</span>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            }}
            placeholder="Untitled Groove"
            aria-label="Pattern title"
            className="h-10 min-w-0 flex-1 rounded-none border-zinc-800 bg-zinc-900/80 font-mono text-sm font-semibold text-zinc-100 sm:h-9 sm:max-w-sm"
          />
          <span className="hidden shrink-0 border border-zinc-800 px-1.5 py-1 font-mono text-[9px] uppercase tracking-wider text-zinc-500 sm:inline">{sourceTag}</span>
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <Button size="icon" variant="outline" disabled={hist.u === 0} onClick={undo} aria-label="Undo (Ctrl+Z)" title="Undo (Ctrl+Z)" className="h-10 w-10 rounded-none border-zinc-700 sm:h-8 sm:w-8">
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" disabled={hist.r === 0} onClick={redo} aria-label="Redo (Ctrl+Shift+Z)" title="Redo (Ctrl+Shift+Z)" className="h-10 w-10 rounded-none border-zinc-700 sm:h-8 sm:w-8">
              <Redo2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onNew} aria-label="Start a new groove" className="hidden h-8 rounded-none font-mono text-[10px] uppercase tracking-wider text-zinc-400 hover:text-lime-300 sm:flex">
              <Plus className="h-3.5 w-3.5" /> new
            </Button>
            <ExportMenu pattern={live} triggerClassName="h-10 rounded-none border-zinc-700 font-mono text-[10px] uppercase tracking-wider sm:h-8" />
            <Button size="sm" onClick={() => doSave(false)} aria-label="Save pattern" className="h-10 rounded-none bg-lime-400 font-mono text-[10px] uppercase tracking-wider text-zinc-950 hover:bg-lime-300 sm:h-8">
              <Save className="h-3.5 w-3.5" /> save
            </Button>
          </div>
        </div>
        <div className="mt-2 rounded-none border border-zinc-800 bg-zinc-900/60 p-2" data-main-transport>
          <TransportBar />
        </div>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        {/* main column */}
        <div className="min-w-0 flex-1 space-y-3">
          <section className="border border-zinc-800 bg-zinc-900/40" aria-label="Step sequencer">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2 border-b border-zinc-800/80 p-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">meter</span>
              <NumSelect label="Beats per bar" value={working.timeSignature.num} onChange={setNum} options={[2, 3, 4, 5, 6, 7, 9, 12].map((n) => ({ value: n, label: String(n) }))} className="w-14" disabled={compareMode} />
              <span className="font-mono text-xs text-zinc-500">/</span>
              <NumSelect label="Beat unit" value={working.timeSignature.den} onChange={setDen} options={[4, 8].map((n) => ({ value: n, label: String(n) }))} className="w-14" disabled={compareMode} />
              <span className="ml-2 font-mono text-[9px] uppercase tracking-widest text-zinc-600">grid</span>
              <NumSelect label="Subdivision" value={working.subdivision} onChange={setSub} options={subOptions} className="w-28" disabled={compareMode} />
              <span className="ml-2 font-mono text-[9px] uppercase tracking-widest text-zinc-600">bars</span>
              <NumSelect label="Number of bars" value={working.bars} onChange={setBars} options={[1, 2, 3, 4].map((n) => ({ value: n, label: String(n) }))} className="w-14" disabled={compareMode} />
              <span className="ml-auto font-mono text-[10px] tabular-nums text-lime-400">
                {spb} steps/bar · {spb * working.bars} total
              </span>
              {compareMode && (
                <Badge className="rounded-none border-amber-400/50 bg-amber-400/10 font-mono text-[9px] uppercase tracking-wider text-amber-300">
                  comparing B — editing paused
                </Badge>
              )}
            </div>
            <div className="p-3 sm:p-4">
              <StepGrid
                pattern={working}
                currentStep={currentStep}
                editable={!compareMode}
                onToggleStep={onToggleStep}
                selected={selected}
                onSelectStep={setSelected}
                diffCells={diffCells}
                dimTracks={dimTracks}
                onLabelClick={(tid) => {
                  const t = working.tracks.find((x) => x.id === tid)
                  if (t) a.preview(t.inst)
                }}
                labelActions={renderLabelActions}
                maxCellWidth={spb > 32 ? 22 : spb > 24 ? 26 : 34}
              />
              <p className="mt-2 font-mono text-[9px] text-zinc-600">
                click = toggle · shift/alt-click = cycle accent→ghost→off · click a lit cell to fine-tune velocity / chance / ratchets · hover a track label for tools · ctrl+z
                undo
              </p>
            </div>
          </section>

          {/* step inspector */}
          {selected && (
            <section className="border border-cyan-400/30 bg-cyan-400/[0.03] p-3" aria-label="Step inspector">
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate font-mono text-[10px] uppercase tracking-widest text-cyan-300">
                  inspector — {selInst?.name ?? 'track'} · bar {Math.floor(selected.step / spb) + 1} · step {(selected.step % spb) + 1}
                  {selEv ? ` · ${velocityTier(selEv.v)}` : ' · empty'}
                </p>
                <Button size="icon" variant="ghost" onClick={() => setSelected(null)} aria-label="Close step inspector" className="h-6 w-6 shrink-0 text-zinc-500 hover:text-zinc-200">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              {selEv ? (
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  <Field label={`velocity — ${selEv.v}`}>
                    <Slider
                      value={[selEv.v]}
                      min={1}
                      max={127}
                      step={1}
                      disabled={compareMode}
                      onValueChange={([v]) => commit(setVelocity(working, selected.trackId, selected.step, v), `vel:${selected.trackId}:${selected.step}`)}
                      aria-label="Hit velocity"
                    />
                  </Field>
                  <Field label={`chance — ${selEv.p !== undefined ? `${Math.round(selEv.p * 100)}%` : 'off'}`}>
                    <Slider
                      value={[Math.round((selEv.p ?? 1) * 100)]}
                      min={5}
                      max={100}
                      step={5}
                      disabled={compareMode}
                      onValueChange={([v]) =>
                        commit(setEventProps(working, selected.trackId, selected.step, { p: v >= 100 ? undefined : v / 100 }), `prob:${selected.trackId}:${selected.step}`)
                      }
                      aria-label="Hit probability"
                    />
                  </Field>
                  <Field label="ratchets">
                    <NumSelect
                      label="Ratchet count"
                      value={selEv.r ?? 1}
                      className="w-full"
                      disabled={compareMode}
                      onChange={(n) => commit(setEventProps(working, selected.trackId, selected.step, { r: n > 1 ? n : undefined }))}
                      options={[
                        { value: 1, label: '×1 single' },
                        { value: 2, label: '×2 roll' },
                        { value: 3, label: '×3 roll' },
                        { value: 4, label: '×4 roll' },
                      ]}
                    />
                  </Field>
                </div>
              ) : (
                <p className="mt-2 font-mono text-[10px] text-zinc-500">empty step — click toggles a hit; open a lit cell to fine-tune it.</p>
              )}
            </section>
          )}
        </div>

        {/* sidebar: aside on xl, tabs below */}
        {sidebar}
      </div>

      <PrintSheet pattern={live} />
    </div>
  )
}
