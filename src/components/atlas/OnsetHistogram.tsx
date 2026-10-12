'use client'

import { useMemo } from 'react'
import type { GroovePattern } from '@/lib/atlas/types'
import { stepsPerBar } from '@/lib/atlas/types'
import { instrumentOf, TRACK_COLORS } from '@/lib/atlas/instruments'
import { cn } from '@/lib/utils'

/**
 * OnsetHistogram — "groove energy lane".
 *
 * One column per step across the whole pattern; column height = total velocity
 * at that step, stacked segments colored by instrument. Beat/bar gridlines and
 * count numerals run under the bars, a lime playhead marks the live step, and
 * the densest step is flagged as the pocket. Stateless.
 */

export function OnsetHistogram({ pattern, currentStep, className }: { pattern: GroovePattern; currentStep: number | null; className?: string }) {
  const spb = stepsPerBar(pattern.timeSignature, pattern.subdivision)
  const sub = pattern.subdivision
  const total = spb * pattern.bars

  const { columns, colorOf, max } = useMemo(() => {
    const colorMap = new Map<string, string>()
    for (const t of pattern.tracks) {
      const inst = instrumentOf(t.inst)
      colorMap.set(t.id, TRACK_COLORS[inst.color % TRACK_COLORS.length].hex)
    }
    const cols: { step: number; parts: { color: string; v: number }[]; sum: number }[] = []
    for (let s = 0; s < total; s++) cols.push({ step: s, parts: [], sum: 0 })
    for (const e of pattern.events) {
      if (e.s < 0 || e.s >= total) continue
      const c = cols[e.s]
      c.parts.push({ color: colorMap.get(e.t) ?? '#a3e635', v: e.v })
      c.sum += e.v
    }
    const maxSum = Math.max(1, ...cols.map((c) => c.sum))
    return { columns: cols, colorOf: colorMap, max: maxSum }
  }, [pattern, total])

  const W = 720
  const H = 132
  const padL = 6
  const padR = 6
  const barTop = 8
  const laneH = 78
  const countY = H - 8
  const innerW = W - padL - padR
  const colW = innerW / total
  const gap = total > 48 ? 0.6 : 1.2
  const beatW = colW * sub
  const pocket = columns.reduce((best, c) => (c.sum > best.sum ? c : best), columns[0])

  const busyInst = useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of pattern.events) counts.set(e.t, (counts.get(e.t) ?? 0) + 1)
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
    return top.map(([tid, n]) => ({ color: colorOf.get(tid) ?? '#a3e635', n }))
  }, [pattern, colorOf])

  return (
    <div className={cn('w-full', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Groove energy histogram, ${pattern.bars} bar${pattern.bars > 1 ? 's' : ''}`}>
        {/* beat gridlines */}
        {Array.from({ length: total / sub + 1 }).map((_, b) => {
          const x = padL + b * beatW
          return (
            <g key={b}>
              <line x1={x} y1={barTop} x2={x} y2={barTop + laneH + 6} stroke={b % pattern.timeSignature.num === 0 ? 'rgba(163,230,53,0.28)' : 'rgba(255,255,255,0.08)'} strokeWidth={1} />
              {b < total / sub && (
                <text x={x + beatW / 2} y={countY} textAnchor="middle" className="fill-zinc-600 font-mono" fontSize={9}>
                  {b % pattern.timeSignature.num === 0 ? b / pattern.timeSignature.num + 1 : '·'}
                </text>
              )}
            </g>
          )
        })}
        {/* baseline */}
        <line x1={padL} y1={barTop + laneH} x2={W - padR} y2={barTop + laneH} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
        {/* columns */}
        {columns.map((c) => {
          if (c.sum <= 0) return null
          const x = padL + c.step * colW
          const h = (c.sum / max) * (laneH - 4)
          let acc = 0
          const parts = [...c.parts]
            .sort((a, b) => a.v - b.v)
            .map((p, i) => {
              const ph = (p.v / c.sum) * h
              const y = barTop + laneH - acc - ph
              acc += ph
              return <rect key={i} x={x + gap / 2} y={y} width={Math.max(1.5, colW - gap)} height={Math.max(1.5, ph - 0.4)} fill={p.color} opacity={0.9} />
            })
          return <g key={c.step}>{parts}</g>
        })}
        {/* pocket flag */}
        {pocket && pocket.sum > 0 && (
          <g>
            <line x1={padL + pocket.step * colW + colW / 2} y1={barTop - 2} x2={padL + pocket.step * colW + colW / 2} y2={barTop + 3} stroke="#a3e635" strokeWidth={1.4} />
            <text
              x={Math.min(W - 60, Math.max(28, padL + pocket.step * colW + colW / 2))}
              y={barTop - 4}
              textAnchor="middle"
              className="fill-lime-400/90 font-mono"
              fontSize={8}
              letterSpacing={1.5}
            >
              pocket
            </text>
          </g>
        )}
        {/* playhead */}
        {currentStep != null && currentStep >= 0 && currentStep < total && (
          <line x1={padL + currentStep * colW + colW / 2} y1={barTop - 2} x2={padL + currentStep * colW + colW / 2} y2={barTop + laneH + 4} stroke="#a3e635" strokeWidth={1.6} />
        )}
      </svg>
      {/* legend */}
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
        <span>stack height = total velocity</span>
        {busyInst.map((b, i) => (
          <span key={i} className="flex items-center gap-1">
            <span aria-hidden className="inline-block h-1.5 w-1.5" style={{ backgroundColor: b.color }} />
            {b.n} hits
          </span>
        ))}
      </div>
    </div>
  )
}
