'use client'

import { useMemo } from 'react'
import type { GroovePattern } from '@/lib/atlas/types'
import { stepsPerBar, velocityTier } from '@/lib/atlas/types'
import { stepLabels } from '@/lib/atlas/rhythm'
import { instrumentOf, TRACK_COLORS } from '@/lib/atlas/instruments'
import { cn } from '@/lib/utils'

/**
 * StepGrid — the primary editing/visualization surface.
 * Rows = tracks, columns = steps. Bar/beat/subdivision boundaries are visually
 * distinct; velocity tiers are encoded by shape as well as color:
 *   accent = filled + bright notch · normal = filled · ghost = hollow outline
 * Probabilistic hits carry a dot, ratchets a ×n badge, the playhead a caret.
 */

export interface StepGridProps {
  pattern: GroovePattern
  currentStep?: number | null
  editable?: boolean
  onToggleStep?: (trackId: string, step: number, mods: { shift: boolean; alt: boolean }) => void
  selected?: { trackId: string; step: number } | null
  onSelectStep?: (sel: { trackId: string; step: number } | null) => void
  diffCells?: Set<string>
  showCounts?: boolean
  dimTracks?: Set<string>
  onLabelClick?: (trackId: string) => void
  labelActions?: (trackId: string) => React.ReactNode
  maxCellWidth?: number
  className?: string
}

export function StepGrid({
  pattern,
  currentStep,
  editable = false,
  onToggleStep,
  selected,
  onSelectStep,
  diffCells,
  showCounts = true,
  dimTracks,
  onLabelClick,
  labelActions,
  maxCellWidth = 34,
  className,
}: StepGridProps) {
  const spb = stepsPerBar(pattern.timeSignature, pattern.subdivision)
  const total = spb * pattern.bars
  const labels = useMemo(() => stepLabels(pattern.timeSignature, pattern.subdivision), [pattern.timeSignature, pattern.subdivision])

  const eventsByCell = useMemo(() => {
    const m = new Map<string, GroovePattern['events'][number]>()
    for (const e of pattern.events) m.set(`${e.t}:${e.s}`, e)
    return m
  }, [pattern.events])

  const cellTemplate = `repeat(${spb}, minmax(${maxCellWidth}px, 1fr))`

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="min-w-max">
        {/* header */}
        <div className="flex">
          <div className="w-24 shrink-0 sm:w-32" />
          <div className="flex-1">
            {pattern.bars > 1 && (
              <div className="grid" style={{ gridTemplateColumns: `repeat(${pattern.bars}, ${spb} * var(--cw, 1fr))` }}>
                {Array.from({ length: pattern.bars }, (_, b) => (
                  <div
                    key={b}
                    className="border-l border-l-lime-400/40 py-0.5 pl-1.5 font-mono text-[9px] uppercase tracking-widest text-lime-400/80"
                    style={{ gridColumn: `span ${spb}` }}
                  >
                    bar {b + 1}
                  </div>
                ))}
              </div>
            )}
            {showCounts && (
              <div className="grid" style={{ gridTemplateColumns: cellTemplate }}>
                {labels.map((lab, i) => {
                  const isBeat = i % pattern.subdivision === 0
                  return (
                    <div
                      key={i}
                      className={cn(
                        'border-l py-0.5 text-center font-mono text-[9px] leading-3',
                        i === 0 && 'border-l-transparent',
                        isBeat ? 'border-l-zinc-700 font-semibold text-zinc-300' : 'border-l-zinc-800/60 text-zinc-600',
                        currentStep != null && (currentStep % spb) === i && 'text-lime-300'
                      )}
                      aria-hidden
                    >
                      {isBeat || pattern.subdivision > 2 ? lab : ''}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* rows */}
        <div className="space-y-1" role="grid" aria-label={`Step grid: ${pattern.tracks.length} tracks, ${pattern.bars} bars`}>
          {pattern.tracks.map((track, rowIdx) => {
            const inst = instrumentOf(track.inst)
            const color = TRACK_COLORS[inst.color % TRACK_COLORS.length]
            const dim = dimTracks?.has(track.id)
            return (
              <div key={track.id} className="flex items-stretch" role="row">
                <div className="sticky left-0 z-10 flex w-24 shrink-0 items-center gap-1.5 bg-zinc-950 pr-2 sm:w-32">
                  {labelActions?.(track.id)}
                  <button
                    type="button"
                    onClick={() => onLabelClick?.(track.id)}
                    className={cn('group flex min-w-0 flex-1 items-center gap-1.5 rounded-sm px-1 py-1 text-left', onLabelClick && 'hover:bg-white/5')}
                    title={`${inst.name} — click to audition`}
                  >
                    <span className={cn('h-2 w-2 shrink-0 rounded-[2px]', color.dot)} aria-hidden />
                    <span className={cn('truncate font-mono text-[10px] uppercase tracking-wider', dim ? 'text-zinc-600' : 'text-zinc-400 group-hover:text-zinc-200')}>
                      {track.label ?? inst.short}
                    </span>
                  </button>
                </div>
                <div
                  className="grid flex-1 gap-0"
                  style={{ gridTemplateColumns: cellTemplate }}
                  role="gridcell"
                  aria-label={`${inst.name} track`}
                >
                  {Array.from({ length: spb * pattern.bars }, (_, s) => {
                    const stepInBar = s % spb
                    const isBeat = stepInBar % pattern.subdivision === 0
                    const isBarStart = stepInBar === 0
                    const ev = eventsByCell.get(`${track.id}:${s}`)
                    const tier = ev ? velocityTier(ev.v) : null
                    const isCurrent = currentStep != null && currentStep === s
                    const isPlayingCol = currentStep != null && (currentStep % spb) === stepInBar && Math.floor(currentStep / spb) === Math.floor(s / spb)
                    const isSelected = selected?.trackId === track.id && selected?.step === s
                    const isDiff = diffCells?.has(`${track.id}:${s}`)
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={!editable}
                        aria-label={`${inst.name} step ${s + 1}${ev ? `, ${tier ?? ''} hit` : ', empty'}`}
                        aria-pressed={!!ev}
                        onClick={(e) => {
                          if (!editable) return
                          onSelectStep?.({ trackId: track.id, step: s })
                          onToggleStep?.(track.id, s, { shift: e.shiftKey, alt: e.altKey })
                        }}
                        className={cn(
                          'relative h-7 border-l sm:h-8',
                          'bg-white/[0.035] transition-colors duration-75',
                          s === 0 ? 'border-l-transparent' : isBarStart ? 'border-l-2 border-l-lime-400/50' : isBeat ? 'border-l-zinc-700/80' : 'border-l-zinc-800/50',
                          rowIdx === 0 && 'border-t border-t-zinc-800/50',
                          !ev && 'hover:bg-white/[0.09]',
                          editable ? 'cursor-pointer' : 'cursor-default',
                          isPlayingCol && !isCurrent && 'bg-white/[0.07]',
                          isCurrent && 'bg-white/[0.12]',
                          isDiff && 'shadow-[inset_0_0_0_2px_rgba(251,191,36,0.7)]',
                          isSelected && 'shadow-[inset_0_0_0_2px_rgba(34,211,238,0.9)]',
                          dim && 'opacity-40'
                        )}
                      >
                        {ev && (
                          <span
                            className={cn(
                              'absolute inset-[3px] flex items-center justify-center',
                              tier === 'accent' && 'bg-lime-300',
                              tier === 'normal' && 'bg-lime-500',
                              tier === 'ghost' && 'border border-lime-400/70 bg-lime-400/15',
                              tier === 'custom' && 'bg-lime-400/60'
                            )}
                          >
                            {tier === 'accent' && <span className="absolute -top-[3px] left-1/2 h-[3px] w-2 -translate-x-1/2 bg-white" aria-hidden />}
                            {ev.p !== undefined && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-zinc-900/80" aria-hidden />}
                          </span>
                        )}
                        {ev && ev.r !== undefined && ev.r > 1 && (
                          <span className="absolute -bottom-0.5 right-0.5 font-mono text-[8px] font-bold text-zinc-950">
                            ×{ev.r}
                          </span>
                        )}
                        {isCurrent && (
                          <span className="absolute -top-[7px] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-lime-300" aria-hidden />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
