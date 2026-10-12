'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import type { GroovePattern } from '@/lib/atlas/types'
import { stepsPerBar } from '@/lib/atlas/types'
import { instrumentOf, TRACK_COLORS } from '@/lib/atlas/instruments'
import { FAMILY_LIST } from '@/lib/atlas/patterns'
import { genreArtFor } from '@/lib/atlas/genreArt'
import { CardPlayButton } from './TransportBar'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PatternCardProps {
  pattern: GroovePattern
  onOpen?: (id: string) => void
  className?: string
}

const DIFF_LABEL: Record<string, string> = {
  beginner: 'beginner',
  intermediate: 'interm.',
  advanced: 'advanced',
}

/** interactive targets inside the card that must NOT trigger the card-level open */
const INTERACTIVE = 'button, a, input, select, textarea, [role="button"], [data-noclick]'

export function PatternCard({ pattern, onOpen, className }: PatternCardProps) {
  const family = FAMILY_LIST.find((f) => f.key === pattern.family)
  const art = genreArtFor(pattern.family)

  const open = () => onOpen?.(pattern.id)

  /** card-level click: open the pattern page unless an inner control was hit */
  const onCardClick = (e: React.MouseEvent) => {
    if (!onOpen) return
    if ((e.target as HTMLElement).closest(INTERACTIVE)) return
    open()
  }

  const onCardKey = (e: React.KeyboardEvent) => {
    if (!onOpen) return
    if (e.key !== 'Enter' && e.key !== ' ') return
    if ((e.target as HTMLElement).closest(INTERACTIVE)) return
    e.preventDefault()
    open()
  }

  return (
    <article
      role={onOpen ? 'link' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      aria-label={onOpen ? `Open ${pattern.title}` : undefined}
      onClick={onCardClick}
      onKeyDown={onCardKey}
      className={cn(
        'group flex cursor-pointer flex-col gap-3 border border-zinc-800/80 bg-zinc-900/40 p-0 transition-[border-color,background-color,transform,box-shadow] duration-200 outline-none hover:-translate-y-0.5 hover:border-lime-400/40 hover:bg-zinc-900/70 hover:shadow-[0_10px_28px_-16px_rgba(163,230,53,0.35)] focus-visible:border-lime-400/70 focus-visible:ring-1 focus-visible:ring-lime-400/60',
        className
      )}
    >
      {/* genre art cover */}
      <div className="relative h-20 w-full overflow-hidden border-b border-zinc-800/60 bg-zinc-900">
        <Image
          src={art}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 20vw"
          className="object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-100"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
        <span className="absolute bottom-1.5 left-3 font-mono text-[9px] uppercase tracking-[0.2em] text-lime-300/90">
          {family?.label ?? pattern.family}
        </span>
        <span className="absolute right-2 top-2 rounded border border-zinc-800/80 bg-zinc-950/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-400 backdrop-blur-sm">
          {pattern.genres[0]}
        </span>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                open()
              }}
              className="block max-w-full truncate text-left text-sm font-semibold text-zinc-100 decoration-lime-400/70 decoration-2 underline-offset-4 hover:text-lime-300 hover:underline"
            >
              {pattern.title}
            </button>
            <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              {pattern.timeSignature.num}/{pattern.timeSignature.den} · {pattern.feel}
            </p>
          </div>
          <CardPlayButton pattern={pattern} size="sm" />
        </div>

        <MiniGrid pattern={pattern} className="w-full" />

        <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">{pattern.summary}</p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-zinc-800/60 pt-2.5">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            <span className="text-zinc-300">{pattern.bpm} bpm</span>
            <span>{pattern.bars} bar{pattern.bars > 1 ? 's' : ''}</span>
            <span className={cn(
              pattern.difficulty === 'beginner' && 'text-lime-400/90',
              pattern.difficulty === 'intermediate' && 'text-amber-400/90',
              pattern.difficulty === 'advanced' && 'text-rose-400/90'
            )}>
              {DIFF_LABEL[pattern.difficulty]}
            </span>
            {pattern.swing > 0 && <span className="text-cyan-400/80">swing</span>}
          </div>
          {onOpen && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation()
                open()
              }}
              aria-label={`Open ${pattern.title}`}
              className="text-zinc-500 hover:text-lime-300"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

/** static mini preview: every track compressed to 16 bins */
export function MiniGrid({ pattern, className }: { pattern: GroovePattern; className?: string }) {
  const total = stepsPerBar(pattern.timeSignature, pattern.subdivision) * pattern.bars
  const rows = useMemo(
    () =>
      pattern.tracks.slice(0, 6).map((t) => {
        const inst = instrumentOf(t.inst)
        const color = TRACK_COLORS[inst.color % TRACK_COLORS.length]
        const bins = new Array<number>(16).fill(0)
        for (const e of pattern.events) {
          if (e.t !== t.id) continue
          const bin = Math.floor((e.s / total) * 16)
          if (bin >= 0 && bin < 16) bins[bin] = Math.max(bins[bin], e.v / 127)
        }
        return { id: t.id, color, bins }
      }),
    [pattern, total]
  )
  return (
    <div className={cn('space-y-[3px]', className)} aria-hidden>
      {rows.map((r) => (
        <div key={r.id} className="grid grid-cols-16 gap-[2px]" style={{ gridTemplateColumns: 'repeat(16, 1fr)' }}>
          {r.bins.map((v, i) => (
            <div
              key={i}
              className="h-[5px] rounded-[1px]"
              style={{
                backgroundColor: v > 0 ? r.color.hex : 'rgba(255,255,255,0.05)',
                opacity: v > 0 ? 0.3 + v * 0.7 : 1,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
