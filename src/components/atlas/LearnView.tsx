'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, FlaskConical, GraduationCap, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { GroovePattern, InstrumentId, KitId, PatternTrack, RhythmEvent, Subdivision } from '@/lib/atlas/types'
import { stepsPerBar } from '@/lib/atlas/types'
import { parseTrackString, euclideanEvents } from '@/lib/atlas/rhythm'
import { getPattern } from '@/lib/atlas/patterns'
import { cycleVelocity } from '@/lib/atlas/transforms'
import { StepGrid } from './StepGrid'
import { CardPlayButton, PositionReadout } from './TransportBar'
import { useAtlas, usePlayhead } from './AtlasProvider'
import type { Route } from './AppShell'

/**
 * LearnView — "Rhythm School". Every explanation ships with a live, playable
 * example bound to the shared atlas context: the same engine, grid and
 * playhead used across the app, so lessons transfer directly to the catalog
 * and Groove Lab.
 */

interface LessonProps {
  navigate: (r: Route) => void
  openPattern: (id: string) => void
}

interface LessonMeta {
  id: string
  short: string
  title: string
  blurb: string
  minutes: number
}

const LESSONS: LessonMeta[] = [
  { id: 'grid-basics', short: 'The Grid', title: 'The Grid & Subdivisions', blurb: 'Rows, columns and count labels — how every pattern in the map is drawn.', minutes: 4 },
  { id: 'kick-snare', short: 'Kick & Snare', title: 'Kick & Snare Anchors', blurb: 'Build the two-hit skeleton most music stands on, one layer at a time.', minutes: 5 },
  { id: 'backbeat', short: 'Backbeat', title: 'The Backbeat', blurb: 'Snare on 2 & 4 — and what happens when it moves to beat 3.', minutes: 4 },
  { id: 'subdivisions-hats', short: 'Subdivisions', title: 'Hi-Hat Subdivisions', blurb: 'Same skeleton, faster clock: eighths vs sixteenths.', minutes: 4 },
  { id: 'accents-ghosts', short: 'Accents & Ghosts', title: 'Accents & Ghost Notes', blurb: 'X, x and o — the three loudness levels drawn in the grid.', minutes: 5 },
  { id: 'swing-shuffle', short: 'Swing', title: 'Swing & Shuffle', blurb: 'One grid, three timings: 0%, 33% and 58% swing.', minutes: 5 },
  { id: 'syncopation', short: 'Syncopation', title: 'Syncopation', blurb: 'A straight backbeat vs a funk kick that keeps missing the beat — on purpose.', minutes: 5 },
  { id: 'velocity-dynamics', short: 'Velocity', title: 'Velocity & Dynamics', blurb: 'Edit velocities live and hear loudness become arrangement.', minutes: 6 },
  { id: 'euclidean', short: 'Euclidean', title: 'Euclidean Rhythms', blurb: 'E(p, steps): spread pulses evenly and meet the tresillo.', minutes: 7 },
  { id: 'fills', short: 'Fills', title: 'Fills & Transitions', blurb: 'Read a two-bar pattern: groove in bar 1, fill in bar 2.', minutes: 5 },
]

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function subLabel(sub: Subdivision): string {
  switch (sub) {
    case 1: return 'quarters'
    case 2: return '8ths'
    case 3: return '8th triplets'
    case 4: return '16ths'
    case 6: return '16th triplets'
  }
}

/** build a small self-contained teaching pattern from compact track strings */
function synthPattern(cfg: {
  id: string
  title: string
  bpm?: number
  ts?: [number, 4 | 8]
  bars?: number
  sub?: Subdivision
  kit?: KitId
  tracks: { inst: InstrumentId; pat: string; vol?: number; pan?: number }[]
}): GroovePattern {
  const ts = { num: cfg.ts?.[0] ?? 4, den: cfg.ts?.[1] ?? 4 }
  const bars = cfg.bars ?? 1
  const sub: Subdivision = cfg.sub ?? 4
  const total = stepsPerBar(ts, sub) * bars
  const tracks: PatternTrack[] = []
  const events: RhythmEvent[] = []
  for (const t of cfg.tracks) {
    let pat = t.pat.replace(/\|/g, '')
    if (pat.length < total) pat += '.'.repeat(total - pat.length)
    pat = pat.slice(0, total)
    tracks.push({ id: t.inst, inst: t.inst, vol: t.vol ?? 0.9, pan: t.pan ?? 0 })
    events.push(...parseTrackString(pat, t.inst))
  }
  return {
    id: cfg.id,
    slug: cfg.id,
    title: cfg.title,
    summary: cfg.title,
    description: cfg.title,
    family: 'learn',
    genres: ['Study'],
    tags: ['lesson'],
    difficulty: 'beginner',
    bpm: cfg.bpm ?? 100,
    tempoRange: [70, 160],
    timeSignature: ts,
    bars,
    subdivision: sub,
    feel: 'straight',
    swing: 0,
    syncopation: 0,
    density: 1,
    tracks,
    events,
    kitSuggestion: cfg.kit ?? 'synth',
    learning: { construction: cfg.title, roles: {} },
    source: { type: 'original', note: 'Lesson example authored for the Rhythm School.' },
    schemaVersion: 1,
  }
}

/* ------------------------------------------------------------------ */
/* LessonPlayer — transport-lite + grid with live playhead             */
/* ------------------------------------------------------------------ */

function LessonPlayer({ pattern, editable = false, onToggleStep, hint }: {
  pattern: GroovePattern
  editable?: boolean
  onToggleStep?: (trackId: string, step: number, mods: { shift: boolean; alt: boolean }) => void
  hint?: string
}) {
  const a = useAtlas()
  const pos = usePlayhead()
  const isLoaded = a.playingId === pattern.id && a.pattern != null
  const currentStep = isLoaded ? pos?.step ?? null : null
  return (
    <div className="border border-zinc-800 bg-zinc-900/40">
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800/80 px-3 py-2">
        <CardPlayButton pattern={pattern} size="sm" />
        <PositionReadout />
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          {pattern.bpm} bpm · {pattern.timeSignature.num}/{pattern.timeSignature.den} · {subLabel(pattern.subdivision)}
        </span>
        <span className="ml-auto hidden font-mono text-[10px] text-zinc-600 sm:inline">
          {hint ?? (isLoaded ? 'this example is loaded' : 'press play to hear it')}
        </span>
      </div>
      <StepGrid
        pattern={pattern}
        currentStep={currentStep}
        editable={editable}
        onToggleStep={onToggleStep}
        maxCellWidth={26}
        className="px-3 py-3"
      />
    </div>
  )
}

/* shared bits ------------------------------------------------------ */

function VariantPicker<T extends string>({ options, value, onChange, ariaLabel }: {
  options: { value: T; label: string; sub?: string }[]
  value: T
  onChange: (v: T) => void
  ariaLabel: string
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            'border px-3 py-1.5 text-left font-mono text-[11px] uppercase tracking-wider transition-colors',
            value === o.value
              ? 'border-lime-400 bg-lime-400/10 text-lime-300'
              : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
          )}
        >
          {o.label}
          {o.sub && <span className="ml-1.5 text-[9px] normal-case text-zinc-500">{o.sub}</span>}
        </button>
      ))}
    </div>
  )
}

function LessonNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-l-2 border-lime-400/40 bg-zinc-900/40 px-3 py-2 text-xs leading-relaxed text-zinc-400">
      {children}
    </p>
  )
}

/** Friendly fallback so a missing data id can never blank an entire lesson. */
function LessonMissing() {
  return (
    <div className="border border-amber-400/30 bg-amber-400/5 p-4" role="status">
      <p className="font-mono text-[10px] uppercase tracking-widest text-amber-400">lesson example unavailable</p>
      <p className="mt-1 text-sm text-amber-200">This lesson&apos;s backing pattern is missing — try another lesson.</p>
    </div>
  )
}

function LessonShell({ meta, catalogId, labId, navigate, openPattern, children }: {
  meta: LessonMeta
  catalogId?: string
  labId?: string
  navigate: (r: Route) => void
  openPattern: (id: string) => void
  children: React.ReactNode
}) {
  const index = LESSONS.findIndex((l) => l.id === meta.id)
  const prev = index > 0 ? LESSONS[index - 1] : null
  const next = index < LESSONS.length - 1 ? LESSONS[index + 1] : null
  return (
    <article className="space-y-5">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-widest text-lime-400/90">
          lesson {String(index + 1).padStart(2, '0')} / {String(LESSONS.length).padStart(2, '0')} · ~{meta.minutes} min
        </p>
        <h2 className="mt-1 text-xl font-semibold text-zinc-100 sm:text-2xl">{meta.title}</h2>
      </header>

      {children}

      <footer className="flex flex-wrap items-center gap-2 border-t border-zinc-800/60 pt-4">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate({ view: 'lab', patternId: labId })}
          className="border-zinc-700 font-mono text-[11px] uppercase tracking-wider hover:border-lime-400/60 hover:text-lime-300"
        >
          <FlaskConical className="h-3.5 w-3.5" aria-hidden />
          Try in Groove Lab
        </Button>
        {catalogId && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openPattern(catalogId)}
            className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 hover:text-lime-300"
          >
            Open full pattern
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Button>
        )}
        <div className="ml-auto flex gap-1.5">
          {prev && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate({ view: 'learn', lesson: prev.id })}
              className="font-mono text-[11px] text-zinc-500 hover:text-zinc-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              {prev.short}
            </Button>
          )}
          {next && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate({ view: 'learn', lesson: next.id })}
              className="font-mono text-[11px] text-zinc-500 hover:text-lime-300"
            >
              {next.short}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Button>
          )}
        </div>
      </footer>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* 01 — The Grid & Subdivisions                                        */
/* ------------------------------------------------------------------ */

function GridBasicsLesson({ navigate, openPattern }: LessonProps) {
  const variants = useMemo(() => ({
    quarters: getPattern('build-01-kick-quarters'),
    eighths: getPattern('build-02-eighth-hats'),
    sixteenths: getPattern('build-03-sixteenth-hats'),
  }), [])
  const [which, setWhich] = useState<'quarters' | 'eighths' | 'sixteenths'>('quarters')
  const pattern = variants[which]
  if (!pattern) return <LessonMissing />
  return (
    <LessonShell meta={LESSONS[0]} catalogId={pattern.id} labId={pattern.id} navigate={navigate} openPattern={openPattern}>
      <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
        <p>
          Every groove in Groovemap is drawn on the same surface: <strong className="text-zinc-100">rows are tracks</strong>{' '}
          (instruments) and <strong className="text-zinc-100">columns are steps</strong> — the smallest slices of time the
          pattern uses. The numbers along the top count the beats (<span className="font-mono text-lime-300">1 2 3 4</span>),
          with smaller marks for the in-between subdivisions. Vertical lines thicken at each bar.
        </p>
        <p>
          Subdivision is how finely each beat is sliced. Switch between the three versions below and watch the hat row:
          the kick never moves, but the clock doubles from one hit per beat to four.
        </p>
      </div>

      <VariantPicker
        ariaLabel="Subdivision example"
        value={which}
        onChange={setWhich}
        options={[
          { value: 'quarters', label: 'Quarters', sub: '1 2 3 4' },
          { value: 'eighths', label: '8ths', sub: '1 & 2 &' },
          { value: 'sixteenths', label: '16ths', sub: '1 e & a' },
        ]}
      />

      <LessonPlayer pattern={pattern} />

      <LessonNote>
        The three examples are real catalog patterns — {variants.quarters?.title}, {variants.eighths?.title} and{' '}
        {variants.sixteenths?.title}. Nothing here is a hard-coded 16-column picture: a 4/4 bar at 16th resolution simply
        has 4 beats × 4 steps = 16 columns, and other meters get their own widths.
      </LessonNote>
    </LessonShell>
  )
}

/* ------------------------------------------------------------------ */
/* 02 — Kick & Snare anchors (3 stages)                                */
/* ------------------------------------------------------------------ */

const STAGE_TITLES = ['kick only', 'kick + snare', 'kick + snare + hi-hats'] as const

function KickSnareLesson({ navigate, openPattern }: LessonProps) {
  const a = useAtlas()
  const base = useMemo(() => getPattern('build-02-eighth-hats'), [])
  const [stage, setStage] = useState<1 | 2 | 3>(1)

  const buildStage = (n: 1 | 2 | 3): GroovePattern | null => {
    if (!base) return null
    const keep = base.tracks.slice(0, n) // base track order: kick, snare, hatClosed
    const ids = new Set(keep.map((t) => t.id))
    const id = `lesson-kick-snare-${n}`
    return {
      ...structuredClone(base),
      id,
      slug: id,
      title: `Stage ${n} — ${STAGE_TITLES[n - 1]}`,
      tracks: keep.map((t) => ({ ...t })),
      events: base.events.filter((e) => ids.has(e.t)).map((e) => ({ ...e })),
    }
  }

  const pattern = useMemo(() => buildStage(stage), [base, stage])

  const pickStage = (next: 1 | 2 | 3) => {
    const wasPlayingThis = base != null && a.playingId === `lesson-kick-snare-${stage}` && a.playing
    setStage(next)
    if (wasPlayingThis) {
      const nextPattern = buildStage(next)
      if (nextPattern) a.loadPattern(nextPattern, { play: true })
    }
  }

  if (!pattern || !base) return null

  return (
    <LessonShell meta={LESSONS[1]} catalogId={base.id} labId={base.id} navigate={navigate} openPattern={openPattern}>
      <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
        <p>
          Strip any famous beat down far enough and you find two instruments agreeing: the{' '}
          <strong className="text-zinc-100">kick</strong> marks the strong downbeats (1 and 3) and the{' '}
          <strong className="text-zinc-100">snare</strong> answers on the backbeats (2 and 4). Everything else — hats,
          ghosts, percussion — decorates that conversation.
        </p>
        <p>Play each stage and listen for the job each layer does before the next one arrives:</p>
      </div>

      <VariantPicker
        ariaLabel="Build-up stage"
        value={String(stage) as '1' | '2' | '3'}
        onChange={(v) => pickStage(Number(v) as 1 | 2 | 3)}
        options={[
          { value: '1', label: 'Stage 1', sub: 'kick only' },
          { value: '2', label: 'Stage 2', sub: '+ snare' },
          { value: '3', label: 'Stage 3', sub: '+ hi-hats' },
        ]}
      />

      <LessonPlayer pattern={pattern} hint={`stage ${stage} of 3 — ${STAGE_TITLES[stage - 1]}`} />

      <LessonNote>
        Stage 2 is already music: kick on 1 &amp; 3 plus snare on 2 &amp; 4 is a complete beat you could clap along to.
        The hats in stage 3 add no new pitches — they add a clock, so your ear always knows where the bar is.
      </LessonNote>
    </LessonShell>
  )
}

/* ------------------------------------------------------------------ */
/* 03 — The Backbeat                                                   */
/* ------------------------------------------------------------------ */

function BackbeatLesson({ navigate, openPattern }: LessonProps) {
  const standard = useMemo(() => getPattern('backbeat-basic'), [])
  const halftime = useMemo(() => getPattern('half-time-feel'), [])
  const [which, setWhich] = useState<'standard' | 'halftime'>('standard')
  const pattern = which === 'standard' ? standard : halftime
  if (!pattern || !standard || !halftime) return null
  return (
    <LessonShell meta={LESSONS[2]} catalogId={pattern.id} labId={pattern.id} navigate={navigate} openPattern={openPattern}>
      <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
        <p>
          Beats 2 and 4 are called the <strong className="text-zinc-100">backbeats</strong> — the natural clapping points
          in almost any popular song. Put the snare there and the groove pushes forward; listeners feel it as “the
          beat” even when every other instrument is syncopated.
        </p>
        <p>
          Move that single snare hit to beat 3 and the same tempo suddenly feels <em>twice as slow</em>. That is
          half-time, and it is less a different pattern than a different placement of one hit.
        </p>
      </div>

      <VariantPicker
        ariaLabel="Backbeat variant"
        value={which}
        onChange={setWhich}
        options={[
          { value: 'standard', label: 'Backbeat 2 & 4', sub: 'standard' },
          { value: 'halftime', label: 'Snare on 3 only', sub: 'half-time' },
        ]}
      />

      <LessonPlayer pattern={pattern} />

      <LessonNote>
        A/B the two variants at the same tempo. The kick and hat motion barely change — the perceived speed lives almost
        entirely in where the snare lands. This is your first proof that <em>placement beats density</em>.
      </LessonNote>
    </LessonShell>
  )
}

/* ------------------------------------------------------------------ */
/* 04 — Hi-hat subdivisions                                            */
/* ------------------------------------------------------------------ */

function SubdivisionHatsLesson({ navigate, openPattern }: LessonProps) {
  const eighths = useMemo(() => getPattern('build-02-eighth-hats'), [])
  const sixteenths = useMemo(() => getPattern('build-03-sixteenth-hats'), [])
  const [which, setWhich] = useState<'eighths' | 'sixteenths'>('eighths')
  const pattern = which === 'eighths' ? eighths : sixteenths
  if (!pattern || !eighths || !sixteenths) return null
  return (
    <LessonShell meta={LESSONS[3]} catalogId={pattern.id} labId={pattern.id} navigate={navigate} openPattern={openPattern}>
      <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
        <p>
          The kick/snare skeleton from lesson 2 stays identical here — <span className="font-mono text-lime-300">X on 1 &amp; 3, snare on 2 &amp; 4</span>.
          Only the hi-hat row changes: straight eighths (<span className="font-mono">1 &amp; 2 &amp; 3 &amp; 4 &amp;</span>) become sixteenths
          (<span className="font-mono">1 e &amp; a 2 e &amp; a</span>).
        </p>
        <p>
          Sixteenths are the working currency of programmed drums — house, funk, jungle and trap all live at this
          resolution. Notice the accented hats on the quarter beats: they keep the old eighth feel alive inside the
          faster stream.
        </p>
      </div>

      <VariantPicker
        ariaLabel="Hat subdivision"
        value={which}
        onChange={setWhich}
        options={[
          { value: 'eighths', label: '8th hats', sub: '1 & 2 &' },
          { value: 'sixteenths', label: '16th hats', sub: '1 e & a' },
        ]}
      />

      <LessonPlayer pattern={pattern} />

      <LessonNote>
        Count out loud while it plays. If “1 e &amp; a” feels like too much, slow the tempo in the transport — subdivision
        practice at 80 bpm transfers directly to 120.
      </LessonNote>
    </LessonShell>
  )
}

/* ------------------------------------------------------------------ */
/* 05 — Accents & Ghost notes                                          */
/* ------------------------------------------------------------------ */

function VelocityShape({ kind }: { kind: 'accent' | 'normal' | 'ghost' }) {
  return (
    <span className="relative inline-block h-5 w-5 border border-zinc-700 bg-white/[0.04]">
      <span
        className={cn(
          'absolute inset-[3px]',
          kind === 'accent' && 'bg-lime-300',
          kind === 'normal' && 'bg-lime-500',
          kind === 'ghost' && 'border border-lime-400/70 bg-lime-400/15'
        )}
      >
        {kind === 'accent' && <span className="absolute -top-[3px] left-1/2 h-[3px] w-2 -translate-x-1/2 bg-white" aria-hidden />}
      </span>
    </span>
  )
}

function AccentsGhostsLesson({ navigate, openPattern }: LessonProps) {
  const pattern = useMemo(() => getPattern('build-05-ghosts'), [])
  if (!pattern) return <LessonMissing />
  return (
    <LessonShell meta={LESSONS[4]} catalogId={pattern.id} labId={pattern.id} navigate={navigate} openPattern={openPattern}>
      <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
        <p>
          A row of equal hits sounds like a machine. Real grooves whisper and shout: <strong className="text-zinc-100">accents</strong> are
          the loud hits that mark the beat, <strong className="text-zinc-100">ghost notes</strong> are quiet hits that fill space
          between them. Groovemap writes velocity into the pattern itself, and the grid draws it as shape as well as brightness:
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border border-zinc-800 bg-zinc-900/40 px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
          <span className="flex items-center gap-2"><VelocityShape kind="accent" /> X — accent (127)</span>
          <span className="flex items-center gap-2"><VelocityShape kind="normal" /> x — normal (100)</span>
          <span className="flex items-center gap-2"><VelocityShape kind="ghost" /> o — ghost (40)</span>
        </div>
      </div>

      <LessonPlayer pattern={pattern} hint="solo the snare row in your head: ghosts whisper between 2 and 4" />

      <LessonNote>
        In this bar the snare owns all three tiers: accented backbeats on 2 and 4, ghost snares on the “&amp;”s around them.
        The kick is accented, the hats normal. Try the Groove Lab on this pattern and convert ghosts to accents — the feel
        turns from laid-back to aggressive without moving a single step.
      </LessonNote>
    </LessonShell>
  )
}

/* ------------------------------------------------------------------ */
/* 06 — Swing & Shuffle                                                */
/* ------------------------------------------------------------------ */

const SWING_PRESETS = [
  { value: 0, label: 'Straight', pct: '0%' },
  { value: 0.33, label: 'Light swing', pct: '33%' },
  { value: 0.58, label: 'Hard shuffle', pct: '58%' },
] as const

function SwingShuffleLesson({ navigate, openPattern }: LessonProps) {
  const a = useAtlas()
  const pattern = useMemo(() => synthPattern({
    id: 'lesson-swing-shuffle',
    title: 'Swing demo — kick, snare, eighth hats',
    bpm: 96,
    sub: 2,
    kit: 'studio',
    tracks: [
      { inst: 'kick', pat: 'X...X...', vol: 1 },
      { inst: 'snare', pat: '....X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'x.x.x.x.', vol: 0.55 },
    ],
  }), [])
  const isLoaded = a.playingId === pattern.id

  const applySwing = (v: number) => {
    if (isLoaded) {
      a.setSwing(v)
    } else {
      a.loadPattern(pattern, { swing: v, play: false })
    }
  }

  const activePct = isLoaded ? Math.round(a.swing * 100) : null

  return (
    <LessonShell meta={LESSONS[5]} catalogId="jazz-swing" labId={undefined} navigate={navigate} openPattern={openPattern}>
      <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
        <p>
          Swing does not add or remove any hit — it <strong className="text-zinc-100">delays every odd off-beat</strong> a little
          later, as a percentage of one step. At 0% the off-beats sit exactly halfway (straight); around 33% they land where
          a triplet would (light shuffle); past 50% they drag behind it (hard shuffle).
        </p>
        <p>
          Load the example, press play, then flip the presets and listen to the same grid bend in time:
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {SWING_PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => applySwing(p.value)}
            aria-pressed={activePct != null && activePct === p.value}
            className={cn(
              'border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors',
              activePct === p.value
                ? 'border-lime-400 bg-lime-400/10 text-lime-300'
                : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
            )}
          >
            {p.label} <span className="ml-1 text-[9px] text-zinc-500">{p.pct}</span>
          </button>
        ))}
        <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-zinc-500" role="status">
          current swing: {activePct != null ? `${activePct}%` : 'not loaded'}
        </span>
      </div>

      <LessonPlayer pattern={pattern} hint={isLoaded ? 'swing applies live — flip presets while it plays' : 'press play, then flip the swing presets'} />

      <LessonNote>
        Triplet grids don&apos;t need a swing dial at all: a swung 12/8 bar already <em>encodes</em> the shuffle in its
        column layout. Compare this with the jazz-swing catalog pattern, which is written on a triplet grid — the presets
        above are simply automating what triplets spell out by hand.
      </LessonNote>
    </LessonShell>
  )
}

/* ------------------------------------------------------------------ */
/* 07 — Syncopation                                                    */
/* ------------------------------------------------------------------ */

function SyncopationLesson({ navigate, openPattern }: LessonProps) {
  const straight = useMemo(() => getPattern('backbeat-basic'), [])
  const funk = useMemo(() => getPattern('funk-16ths'), [])
  const [which, setWhich] = useState<'straight' | 'funk'>('straight')
  const pattern = which === 'straight' ? straight : funk
  if (!pattern || !straight || !funk) return null
  return (
    <LessonShell meta={LESSONS[6]} catalogId={pattern.id} labId={pattern.id} navigate={navigate} openPattern={openPattern}>
      <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
        <p>
          <strong className="text-zinc-100">Syncopation</strong> means stressing the weak positions — off-beats and
          in-between sixteenths — while the backbeat keeps your bearings. It is the difference between a nursery-rhyme
          pulse and a groove that pulls.
        </p>
        <p>
          Variant A is the plain backbeat: the kick never leaves the strong beats. Variant B keeps the same snare on 2 &amp; 4
          but the kick plays 1, the “a” of 1, the “&amp;” of 2, the “&amp;” of 3 and the “&amp;” of 4 — a tresillo-flavoured funk figure.
          A/B them and notice the snare is what stops it from falling apart.
        </p>
      </div>

      <VariantPicker
        ariaLabel="Syncopation variant"
        value={which}
        onChange={setWhich}
        options={[
          { value: 'straight', label: 'A — straight kick', sub: '1 & 3' },
          { value: 'funk', label: 'B — funk kick', sub: 'syncopated' },
        ]}
      />

      <LessonPlayer pattern={pattern} />

      <LessonNote>
        The funk kick looks busier, but count the hits: five against the straight version&apos;s two. Syncopation is not
        random — the funk figure avoids beat 2 and lands <em>just</em> before beats, creating forward motion into each
        backbeat.
      </LessonNote>
    </LessonShell>
  )
}

/* ------------------------------------------------------------------ */
/* 08 — Velocity & Dynamics                                            */
/* ------------------------------------------------------------------ */

function VelocityDynamicsLesson({ navigate, openPattern }: LessonProps) {
  const a = useAtlas()
  const [pattern, setPattern] = useState<GroovePattern>(() => {
    const base = getPattern('build-05-ghosts')
    const p = structuredClone(base ?? synthPattern({
      id: 'lesson-velocity-fallback',
      title: 'Velocity playground',
      tracks: [
        { inst: 'kick', pat: 'X.......X.......', vol: 1 },
        { inst: 'snare', pat: '....X..o..o.X..o', vol: 0.9 },
        { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.5 },
      ],
    }))
    p.id = 'lesson-velocity'
    p.slug = 'lesson-velocity'
    p.title = 'Velocity playground — click cells to cycle loudness'
    return p
  })

  const handleToggleStep = (trackId: string, step: number) => {
    const { pattern: next } = cycleVelocity(pattern, trackId, step)
    setPattern(next)
    if (a.playingId === pattern.id) a.updatePattern(next)
  }

  return (
    <LessonShell meta={LESSONS[7]} catalogId="build-05-ghosts" labId="build-05-ghosts" navigate={navigate} openPattern={openPattern}>
      <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
        <p>
          Velocity is the loudness of one hit, from 1 to 127. Groovemap groups it into three musical tiers drawn in the
          grid: <span className="font-mono text-lime-300">X</span> accent (127), <span className="font-mono text-lime-300">x</span> normal (100)
          and <span className="font-mono text-lime-300">o</span> ghost (40). Dynamics are arrangement: a ghost-note snare is a
          different <em>part</em>, not just a quieter one.
        </p>
        <p>
          <strong className="text-zinc-100">This grid is editable.</strong> Click any filled cell to cycle its velocity
          (normal → accent → off, ghosts step up to normal), and click empty cells to add normal hits. If the pattern is
          playing, edits apply live — no reload.
        </p>
      </div>

      <LessonPlayer pattern={pattern} editable onToggleStep={handleToggleStep} hint="editable — click cells while it loops" />

      <LessonNote>
        Try three moves: accent the “&amp;” of 2 on the hat row, delete a ghost snare, then add a new ghost of your own.
        Each edit changes the <em>character</em> of the groove while the notes stay in place. In Groove Lab the same cycling
        is available via shift/alt-click on any editable grid.
      </LessonNote>
    </LessonShell>
  )
}

/* ------------------------------------------------------------------ */
/* 09 — Euclidean rhythms                                              */
/* ------------------------------------------------------------------ */

interface EuclidParams { pulses: number; steps: 8 | 12 | 16; rotate: number }
const EUCLID_ID = 'lesson-euclid'

function buildEuclidPattern({ pulses, steps, rotate }: EuclidParams): GroovePattern {
  // meter-aware: each step count maps to its own honest grid
  const cfg = steps === 8
    ? { ts: [4, 4] as [number, 4 | 8], sub: 2 as Subdivision, hatPat: 'x.x.x.x.', bpm: 108 }
    : steps === 12
      ? { ts: [12, 8] as [number, 4 | 8], sub: 1 as Subdivision, hatPat: 'x..x..x..x..', bpm: 116 }
      : { ts: [4, 4] as [number, 4 | 8], sub: 4 as Subdivision, hatPat: 'x...x...x...x...', bpm: 100 }
  const kickEvents = euclideanEvents(pulses, steps, rotate, 'kick', 127)
  const hatEvents = parseTrackString(cfg.hatPat, 'hatClosed')
  const id = EUCLID_ID
  return {
    id,
    slug: id,
    title: `E(${pulses},${steps})${rotate ? ` · rotate ${rotate}` : ''}`,
    summary: `Euclidean rhythm E(${pulses},${steps}) over ${steps} steps.`,
    description: `Euclidean rhythm E(${pulses},${steps}) over ${steps} steps.`,
    family: 'learn',
    genres: ['Study'],
    tags: ['lesson', 'euclidean'],
    difficulty: 'intermediate',
    bpm: cfg.bpm,
    tempoRange: [70, 160],
    timeSignature: { num: cfg.ts[0], den: cfg.ts[1] },
    bars: 1,
    subdivision: cfg.sub,
    feel: 'straight',
    swing: 0,
    syncopation: 2,
    density: 2,
    tracks: [
      { id: 'kick', inst: 'kick', vol: 1, pan: 0 },
      { id: 'hatClosed', inst: 'hatClosed', vol: 0.35, pan: 0 },
    ],
    events: [...kickEvents, ...hatEvents],
    kitSuggestion: 'perc',
    learning: { construction: `Kick: E(${pulses},${steps}) rotated ${rotate}. Hats: beat markers.`, roles: {} },
    source: { type: 'original', note: 'Generated live by the Bjorklund algorithm on this page.' },
    schemaVersion: 1,
  }
}

function EuclidLesson({ navigate, openPattern }: LessonProps) {
  const a = useAtlas()
  const [params, setParams] = useState<EuclidParams>({ pulses: 5, steps: 16, rotate: 0 })
  const pattern = useMemo(() => buildEuclidPattern(params), [params])

  const change = (next: EuclidParams) => {
    setParams(next)
    if (a.playingId === EUCLID_ID) a.updatePattern(buildEuclidPattern(next))
  }

  const applyPreset = (pulses: number, steps: 8 | 12 | 16) => change({ pulses, steps, rotate: 0 })

  return (
    <LessonShell meta={LESSONS[8]} labId={undefined} navigate={navigate} openPattern={openPattern}>
      <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
        <p>
          An <strong className="text-zinc-100">Euclidean rhythm</strong> E(p, steps) spreads p onsets as evenly as possible
          across steps — the Bjorklund algorithm runs live below. The surprising part: most of these mathematical results are
          rhythms humans already play. E(3,8) is the <em>tresillo</em> — the 3-side of the son clave — and E(5,16) is a
          staple of funk and trap kick patterns.
        </p>
        <p>Drag the sliders (edits apply live while playing), pick a step-count, and listen:</p>
      </div>

      <div className="space-y-4 border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-sm font-semibold text-lime-300" role="status">
            E({params.pulses},{params.steps}){params.rotate ? ` · rotate ${params.rotate}` : ''}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {([
              { p: 3, s: 8 as const, label: 'E(3,8) tresillo' },
              { p: 5, s: 16 as const, label: 'E(5,16)' },
              { p: 7, s: 16 as const, label: 'E(7,16)' },
              { p: 9, s: 16 as const, label: 'E(9,16)' },
            ]).map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.p, preset.s)}
                className="border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400 transition-colors hover:border-lime-400/60 hover:text-lime-300"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
          <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            <span>pulses: <span className="text-lime-300">{params.pulses}</span></span>
            <Slider
              value={[params.pulses]}
              min={1}
              max={8}
              step={1}
              onValueChange={([v]) => change({ ...params, pulses: v })}
              className="mt-3 w-full"
              aria-label="Euclidean pulses"
            />
          </label>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            <span>rotate: <span className="text-lime-300">{params.rotate}</span></span>
            <Slider
              value={[params.rotate]}
              min={0}
              max={7}
              step={1}
              onValueChange={([v]) => change({ ...params, rotate: v })}
              className="mt-3 w-full"
              aria-label="Euclidean rotation"
            />
          </label>
          <div className="flex gap-1.5" role="group" aria-label="Step count">
            {([8, 12, 16] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => change({ ...params, steps: s })}
                aria-pressed={params.steps === s}
                className={cn(
                  'border px-2.5 py-1.5 font-mono text-[11px] transition-colors',
                  params.steps === s
                    ? 'border-lime-400 bg-lime-400/10 text-lime-300'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <LessonPlayer pattern={pattern} hint="regenerates live — tweak while it plays" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          grid width follows the step count: 8 = 4/4 eighths · 12 = 12/8 · 16 = 4/4 sixteenths — hats mark the beats
        </p>
      </div>

      <LessonNote>
        Rotation matters: E(3,8) starting on step 1 is a tresillo, but rotate it and you get the 3-side of the son clave
        itself. Hear both in context — the Groovemap catalog has a Son Clave (3-2) study pattern and an Euclidean Sketch
        pairing E(5,16) kick with E(9,16) hats. Groove Lab has the same generator built into its Euclid panel.
      </LessonNote>
    </LessonShell>
  )
}

/* ------------------------------------------------------------------ */
/* 10 — Fills & transitions                                            */
/* ------------------------------------------------------------------ */

function FillsLesson({ navigate, openPattern }: LessonProps) {
  const pattern = useMemo(() => getPattern('build-06-fill'), [])
  if (!pattern) return <LessonMissing />
  return (
    <LessonShell meta={LESSONS[9]} catalogId={pattern.id} labId={pattern.id} navigate={navigate} openPattern={openPattern}>
      <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
        <p>
          This is the first <strong className="text-zinc-100">two-bar</strong> pattern in the school. Bar 1 is a normal
          groove; bar 2 plays the groove for three beats, then spends beat 4 on a sixteenth-note fill — snare, snare,
          low tom — that hands the phrase back to the top of the loop.
        </p>
        <p>
          Read multi-bar grids top to bottom just like this: the header shows <span className="font-mono text-lime-300">bar 1 / bar 2</span> over
          the columns, and events are stored as absolute steps (bar × steps-per-bar + position), so the fill lands exactly
          where the math says. Watch the hi-hat row too — it stops during the fill, a classic arrangement trick that makes
          the toms read clearly.
        </p>
      </div>

      <LessonPlayer pattern={pattern} hint="bar 1 = groove · beat 4 of bar 2 = fill" />

      <LessonNote>
        Fills are transitions, not showcases: two or three well-placed hits beat a tom solo. In Groove Lab, load this
        pattern and try shifting the fill earlier or thinner-ing it out — then compare with the breakbeat catalog, where
        entire grooves are built from fill material.
      </LessonNote>
    </LessonShell>
  )
}

/* ------------------------------------------------------------------ */
/* Registry + view                                                     */
/* ------------------------------------------------------------------ */

const LESSON_COMPONENTS: Record<string, (props: LessonProps) => React.ReactNode> = {
  'grid-basics': GridBasicsLesson,
  'kick-snare': KickSnareLesson,
  'backbeat': BackbeatLesson,
  'subdivisions-hats': SubdivisionHatsLesson,
  'accents-ghosts': AccentsGhostsLesson,
  'swing-shuffle': SwingShuffleLesson,
  'syncopation': SyncopationLesson,
  'velocity-dynamics': VelocityDynamicsLesson,
  'euclidean': EuclidLesson,
  'fills': FillsLesson,
}

export function LearnView({ lesson, navigate, openPattern }: {
  lesson?: string
  navigate: (r: Route) => void
  openPattern: (id: string) => void
}) {
  const active = lesson && LESSONS.some((l) => l.id === lesson) ? lesson : LESSONS[0].id

  const renderContent = () => {
    const Comp = LESSON_COMPONENTS[active] ?? GridBasicsLesson
    // each lesson component renders its own LessonShell (it knows its
    // catalog/lab links); key resets per-lesson state
    return <Comp key={active} navigate={navigate} openPattern={openPattern} />
  }

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-lime-400/90">
          <GraduationCap className="h-3.5 w-3.5" aria-hidden />
          rhythm school
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">Learn rhythm by listening to it</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Ten short lessons, each with a live, playable example running on the same engine as the rest of Groovemap.
          Read a little, press play, change something. No account, no download — the lab is one click away whenever a
          lesson makes you want to try your own version.
        </p>
      </header>

      {/* desktop: sidebar + content */}
      <div className="hidden lg:grid lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-10">
        <nav aria-label="Lessons" className="lg:sticky lg:top-20 lg:self-start">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            {LESSONS.length} lessons · ~{LESSONS.reduce((n, l) => n + l.minutes, 0)} min total
          </p>
          <ol className="space-y-0.5 border-l border-zinc-800/80">
            {LESSONS.map((l, i) => {
              const isActive = l.id === active
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => navigate({ view: 'learn', lesson: l.id })}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      '-ml-px flex w-full items-baseline gap-2 border-l-2 px-3 py-2 text-left transition-colors',
                      isActive
                        ? 'border-l-lime-400 bg-zinc-900/70 text-lime-300'
                        : 'border-l-transparent text-zinc-400 hover:border-l-zinc-600 hover:text-zinc-200'
                    )}
                  >
                    <span className="font-mono text-[10px] text-zinc-600">{String(i + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{l.title}</span>
                      <span className="block truncate font-mono text-[9px] uppercase tracking-wider text-zinc-600">{l.blurb}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>
        <div className="min-w-0">{renderContent()}</div>
      </div>

      {/* mobile: tabs */}
      <div className="lg:hidden">
        <Tabs value={active} onValueChange={(v) => navigate({ view: 'learn', lesson: v })}>
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-zinc-900/60 p-1">
            {LESSONS.map((l, i) => (
              <TabsTrigger
                key={l.id}
                value={l.id}
                className="gap-1.5 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950"
              >
                <span className="text-[9px] text-zinc-500">{String(i + 1).padStart(2, '0')}</span>
                {l.short}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={active} className="mt-6">
            {renderContent()}
          </TabsContent>
        </Tabs>
      </div>

      <p className="flex items-start gap-2 border border-zinc-800 bg-zinc-900/40 p-4 text-xs leading-relaxed text-zinc-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden />
        Every example here also exists as a full catalog pattern with provenance, variations and related grooves —
        use the “Open full pattern” links to keep studying after each lesson.
      </p>
    </div>
  )
}
