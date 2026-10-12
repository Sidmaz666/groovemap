'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { ArrowUpRight, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardPlayButton, PositionReadout } from './TransportBar'
import { StepGrid } from './StepGrid'
import { HeroKitTracer } from './hero-KitTracer'
import { useAtlas, usePlayhead } from './AtlasProvider'
import { FAMILY_LIST } from '@/lib/atlas/patterns'
import { genreArtFor } from '@/lib/atlas/genreArt'
import { cn } from '@/lib/utils'
import type { GroovePattern } from '@/lib/atlas/types'

/**
 * HeroShowcase — the live featured-groove player on the homepage hero.
 *
 * Auto-cycles through the curated hero grooves every ~10s with a fade-up
 * transition. Cycling pauses while the visitor hovers/focuses the player or
 * while THIS groove is actively playing (so the visualization never swaps
 * under a running loop). The primary visualization is the StepGrid with a
 * live playhead in its own framed panel; a compact kit-tracer strip beneath
 * it lights up the exact instruments firing on the current step.
 */

const CYCLE_MS = 10000

export function HeroShowcase({
  patterns,
  openPattern,
  openLab,
}: {
  patterns: GroovePattern[]
  openPattern: (id: string) => void
  openLab: (patternId?: string) => void
}) {
  const [index, setIndex] = useState(0)
  const [engaged, setEngaged] = useState(false) // hover or keyboard focus
  const a = useAtlas()
  const pos = usePlayhead()

  const pattern = patterns[index] ?? patterns[0]
  const isLoaded = a.playingId === pattern.id && a.pattern != null
  const currentStep = isLoaded ? pos?.step ?? null : null
  const playingThis = isLoaded && a.playing
  // hold the carousel while hovered/focused OR while ANY groove is audible —
  // the global player means the user may be listening to another pattern,
  // and swapping the showcased groove mid-listen would be disorienting
  const holding = engaged || playingThis || a.playing

  // auto-cycle — restarted whenever the hold state or slide changes so the
  // progress bar and the timer always agree
  useEffect(() => {
    if (holding) return
    const t = setInterval(() => setIndex((i) => (i + 1) % patterns.length), CYCLE_MS)
    return () => clearInterval(t)
  }, [holding, index, patterns.length])

  const family = FAMILY_LIST.find((f) => f.key === pattern.family)
  const gridLabel = pattern.subdivision === 3 || pattern.subdivision === 6 ? 'triplet' : `1/${pattern.subdivision * 4}`

  const meta = useMemo(
    () => [
      ['level', pattern.difficulty],
      ['grid', gridLabel],
      ['swing', `${Math.round(pattern.swing * 100)}%`],
      ['bars', String(pattern.bars)],
    ],
    [pattern.difficulty, gridLabel, pattern.swing, pattern.bars]
  )

  return (
    <div
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={() => setEngaged(false)}
      aria-label="Featured groove player"
      className={cn(
        'relative flex min-w-0 flex-col border bg-zinc-950/85 backdrop-blur-sm transition-[border-color,box-shadow] duration-500',
        playingThis
          ? 'border-lime-400/40 shadow-[0_0_50px_-20px_rgba(163,230,53,0.45)]'
          : 'border-zinc-800 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.9)]'
      )}
    >
      {/* lime hairline */}
      <div aria-hidden className="h-px w-full bg-gradient-to-r from-transparent via-lime-400/45 to-transparent" />

      {/* crossfading slide content */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.38, ease: 'easeOut' }}
          className="flex min-w-0 flex-1 flex-col p-4 sm:p-5"
        >
          {/* header — identity + big transport */}
          <div className="flex items-start gap-4">
            <div className="relative hidden h-14 w-14 shrink-0 overflow-hidden border border-zinc-800 sm:block">
              <Image src={genreArtFor(pattern.family)} alt="" fill sizes="56px" className="object-cover opacity-90" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.28em] text-lime-400">
                featured groove · {family?.label ?? pattern.family}
              </p>
              <h2 className="mt-1 truncate text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
                {pattern.title}
              </h2>
              <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                {pattern.timeSignature.num}/{pattern.timeSignature.den} · {pattern.bpm} bpm · {pattern.feel} ·{' '}
                {pattern.genres.slice(0, 2).join(' / ')}
              </p>
            </div>
            <div
              className="shrink-0 [&>button]:h-12 [&>button]:w-12 [&>button]:rounded-none"
              title={playingThis ? 'Pause this groove' : 'Play this groove'}
            >
              <CardPlayButton pattern={pattern} />
            </div>
          </div>

          {/* pattern vitals */}
          <div className="mt-4 grid grid-cols-4 gap-px border border-zinc-800 bg-zinc-800" aria-label="Pattern vitals">
            {meta.map(([k, v]) => (
              <div key={k} className="bg-zinc-950/80 px-2 py-1.5 text-center">
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-600">{k}</p>
                <p className="mt-0.5 truncate font-mono text-[11px] font-semibold capitalize text-zinc-200">{v}</p>
              </div>
            ))}
          </div>

          {/* primary live visualization — step grid with playhead */}
          <div className="mt-3 min-w-0 border border-zinc-800/80 bg-zinc-900/40 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-500">
                step grid · {gridLabel} notes
              </p>
              <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                <span
                  className={cn(
                    'h-1.5 w-1.5',
                    playingThis ? 'animate-pulse bg-lime-400' : 'bg-zinc-600'
                  )}
                  aria-hidden
                />
                {playingThis ? 'live' : 'idle'}
              </p>
            </div>
            <StepGrid pattern={pattern} currentStep={currentStep} maxCellWidth={22} showCounts />
          </div>

          {/* compact live kit tracer */}
          <div className="mt-3 flex items-center gap-3 border-t border-zinc-800/70 pt-3">
            <p className="shrink-0 font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-600">kit tracer</p>
            <HeroKitTracer pattern={pattern} currentStep={currentStep} />
          </div>

          <p className="mt-3 line-clamp-2 border-t border-zinc-800/70 pt-3 text-xs leading-relaxed text-zinc-500">
            {pattern.learning.construction}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* stable footer — slide selector + transport readout + actions */}
      <div className="border-t border-zinc-800 px-4 pb-4 pt-3 sm:px-5">
        {/* cycle progress (only advances while cycling is live) */}
        <style>{`@keyframes hero-cycle-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
        <div aria-hidden className="relative mb-3 h-px w-full bg-zinc-800/70">
          <div
            key={`${index}:${holding}`}
            className="h-full origin-left bg-lime-400/70"
            style={{
              animation: `hero-cycle-progress ${CYCLE_MS}ms linear forwards`,
              animationPlayState: holding ? 'paused' : 'running',
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" aria-label="Choose featured groove">
            {patterns.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={i === index}
                aria-label={`Show featured groove ${p.title}`}
                onClick={() => setIndex(i)}
                className="group/dot relative h-5 w-7 cursor-pointer"
              >
                <span
                  className={cn(
                    'absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 transition-colors duration-200',
                    i === index ? 'bg-lime-400' : 'bg-zinc-700 group-hover/dot:bg-zinc-500'
                  )}
                />
              </button>
            ))}
          </div>
          <span className="font-mono text-[10px] tabular-nums tracking-widest text-zinc-600">
            {String(index + 1).padStart(2, '0')}/{String(patterns.length).padStart(2, '0')}
          </span>
          <PositionReadout className="ml-auto" />
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openPattern(pattern.id)}
            className="group cursor-pointer border-zinc-700 font-mono text-[10px] uppercase tracking-wider text-zinc-300 transition-all duration-200 hover:border-lime-400/60 hover:bg-lime-400/10 hover:text-lime-300"
          >
            Open pattern
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </Button>
          <Button
            size="sm"
            onClick={() => openLab(pattern.id)}
            className="group cursor-pointer bg-lime-400 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-lime-300 hover:shadow-[0_10px_26px_-12px_rgba(163,230,53,0.55)]"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-90" aria-hidden />
            Remix in Groove Lab
          </Button>
        </div>
      </div>
    </div>
  )
}
