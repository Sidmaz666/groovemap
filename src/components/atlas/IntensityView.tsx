'use client'

import type { GroovePattern } from '@/lib/atlas/types'
import { stepsPerBar } from '@/lib/atlas/types'
import { instrumentOf, TRACK_COLORS } from '@/lib/atlas/instruments'
import { cn } from '@/lib/utils'

/**
 * IntensityView — hit strength, density and accents over time as a compact
 * bar strip. Each column aggregates all tracks; segments are stacked per
 * instrument so accents stay readable.
 */

export interface IntensityViewProps {
  pattern: GroovePattern
  currentStep?: number | null
  className?: string
}

export function IntensityView({ pattern, currentStep, className }: IntensityViewProps) {
  const total = stepsPerBar(pattern.timeSignature, pattern.subdivision) * pattern.bars
  const spb = total / pattern.bars
  const columns = Array.from({ length: total }, (_, s) => {
    const evs = pattern.events.filter((e) => e.s === s)
    return { s, evs }
  })
  const trackOrder = pattern.tracks

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex h-28 items-end gap-[2px]" role="img" aria-label="Intensity view">
        {columns.map(({ s, evs }) => {
          const isCur = currentStep != null && currentStep === s
          const segs = trackOrder
            .map((t) => {
              const ev = evs.find((e) => e.t === t.id)
              if (!ev) return null
              const inst = instrumentOf(t.inst)
              const color = TRACK_COLORS[inst.color % TRACK_COLORS.length]
              return { id: t.id, v: ev.v, hex: color.hex, prob: ev.p }
            })
            .filter(Boolean) as { id: string; v: number; hex: string; prob?: number }[]
          const height = segs.reduce((a, b) => a + b.v / 127, 0)
          return (
            <div
              key={s}
              className={cn(
                'relative flex h-full flex-1 flex-col justify-end overflow-hidden rounded-[2px]',
                s % spb === 0 && 'border-l border-lime-400/40',
                isCur && 'bg-white/10'
              )}
              style={{ minHeight: '4px' }}
              title={`Step ${s + 1}: ${segs.length} hits`}
            >
              {segs.map((seg) => (
                <div
                  key={seg.id}
                  className="w-full"
                  style={{
                    height: `${(seg.v / 127) * 100}%`,
                    backgroundColor: seg.hex,
                    opacity: 0.35 + (seg.v / 127) * 0.65,
                    backgroundImage: seg.prob ? 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,.35) 2px, rgba(0,0,0,.35) 3px)' : undefined,
                  }}
                />
              ))}
              {height === 0 && <div className="h-[2px] w-full bg-white/10" />}
            </div>
          )
        })}
      </div>
      {/* labels anchored to each bar's start edge, not spread evenly */}
      <div className="relative h-4 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
        {Array.from({ length: pattern.bars }, (_, b) => (
          <span
            key={b}
            className="absolute top-0"
            style={{ left: `${(b * spb) / total * 100}%` }}
          >
            bar {b + 1}
          </span>
        ))}
      </div>
    </div>
  )
}
