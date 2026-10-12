'use client'

import type { GroovePattern } from '@/lib/atlas/types'
import { stepsPerBar } from '@/lib/atlas/types'
import { instrumentOf, TRACK_COLORS } from '@/lib/atlas/instruments'
import { cn } from '@/lib/utils'

/**
 * PulseClock — a circular beat-clock for one groove.
 *
 * One concentric ring per bar. Each ring is a full bar: beat ticks subdivide
 * it, hits are plotted as dots (radius = velocity, color = instrument), and a
 * lime sweep-hand points at the live step. Stateless — everything derives from
 * (pattern, currentStep), so it is safe in lists and needs no engine.
 */

const SIZE = 260

export function PulseClock({ pattern, currentStep, className }: { pattern: GroovePattern; currentStep: number | null; className?: string }) {
  const spb = stepsPerBar(pattern.timeSignature, pattern.subdivision)
  const sub = pattern.subdivision
  const bars = Math.min(pattern.bars, 3)
  const total = spb * pattern.bars
  const cx = SIZE / 2
  const cy = SIZE / 2
  const rOuter = 118
  const ringGap = bars > 1 ? Math.min(30, (rOuter - 52) / Math.max(1, bars - 1)) : 0

  const colorOf = (trackId: string): string => {
    const t = pattern.tracks.find((x) => x.id === trackId)
    if (!t) return '#a3e635'
    const inst = instrumentOf(t.inst)
    return TRACK_COLORS[inst.color % TRACK_COLORS.length].hex
  }

  const angleFor = (withinBar: number) => (withinBar / spb) * Math.PI * 2 - Math.PI / 2

  const readout =
    currentStep != null && currentStep >= 0 && currentStep < total
      ? `${Math.floor(currentStep / spb) + 1}.${Math.floor((currentStep % spb) / sub) + 1}.${((currentStep % spb) % sub) + 1}`
      : '–.–.–'

  // live sweep
  const sweep = (() => {
    if (currentStep == null || currentStep < 0 || currentStep >= total) return null
    const bar = Math.min(Math.floor(currentStep / spb), bars - 1)
    const within = currentStep % spb
    const a = angleFor(within)
    const radius = rOuter - bar * ringGap
    return {
      x1: cx + Math.cos(a) * (radius - 16),
      y1: cy + Math.sin(a) * (radius - 16),
      x2: cx + Math.cos(a) * (radius + 2),
      y2: cy + Math.sin(a) * (radius + 2),
      cx: cx + Math.cos(a) * radius,
      cy: cy + Math.sin(a) * radius,
    }
  })()

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-auto w-full max-w-[300px]"
        role="img"
        aria-label={`Pulse clock: ${pattern.bars} bar${pattern.bars > 1 ? 's' : ''} of ${pattern.timeSignature.num}/${pattern.timeSignature.den}`}
      >
        {/* rings */}
        {Array.from({ length: bars }).map((_, b) => (
          <circle key={b} cx={cx} cy={cy} r={rOuter - b * ringGap} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={1} />
        ))}
        {/* beat ticks */}
        {Array.from({ length: bars }).flatMap((_, b) => {
          const radius = rOuter - b * ringGap
          return Array.from({ length: pattern.timeSignature.num }).map((__, beat) => {
            const a = angleFor(beat * sub)
            const strong = beat === 0
            const r1 = radius - (strong ? 7 : 4)
            const r2 = radius + (strong ? 7 : 4)
            return (
              <line
                key={`${b}-${beat}`}
                x1={cx + Math.cos(a) * r1}
                y1={cy + Math.sin(a) * r1}
                x2={cx + Math.cos(a) * r2}
                y2={cy + Math.sin(a) * r2}
                stroke={strong ? 'rgba(163,230,53,0.55)' : 'rgba(255,255,255,0.22)'}
                strokeWidth={strong ? 1.6 : 1}
              />
            )
          })
        })}
        {/* beat numbers just outside the outermost ring */}
        {Array.from({ length: pattern.timeSignature.num }).map((_, beat) => {
          const a = angleFor(beat * sub)
          const r = rOuter + 13
          return (
            <text
              key={beat}
              x={cx + Math.cos(a) * r}
              y={cy + Math.sin(a) * r + 3}
              textAnchor="middle"
              className="fill-zinc-500 font-mono"
              fontSize={9}
            >
              {beat + 1}
            </text>
          )
        })}
        {/* hits — dot radius scales with velocity */}
        {pattern.events.map((e, i) => {
          const bar = Math.floor(e.s / spb)
          if (bar < 0 || bar >= bars) return null
          const within = e.s % spb
          const a = angleFor(within)
          const radius = rOuter - bar * ringGap
          return (
            <circle
              key={i}
              cx={cx + Math.cos(a) * radius}
              cy={cy + Math.sin(a) * radius}
              r={2 + (e.v / 127) * 3.4}
              fill={colorOf(e.t)}
              opacity={0.92}
            />
          )
        })}
        {/* sweep hand */}
        {sweep && (
          <g>
            <line x1={sweep.x1} y1={sweep.y1} x2={sweep.x2} y2={sweep.y2} stroke="#a3e635" strokeWidth={2.2} strokeLinecap="round" />
            <circle cx={sweep.cx} cy={sweep.cy} r={4.4} fill="#a3e635" opacity={0.95} />
            <circle cx={sweep.cx} cy={sweep.cy} r={8.5} fill="#a3e635" opacity={0.18} />
          </g>
        )}
        {/* center readout */}
        <text x={cx} y={cy - 2} textAnchor="middle" className="fill-zinc-200 font-mono" fontSize={13} fontWeight={600}>
          {readout}
        </text>
        <text x={cx} y={cy + 13} textAnchor="middle" className="fill-zinc-600 font-mono" fontSize={8} letterSpacing={2}>
          BAR.BEAT.SUB
        </text>
        {bars > 1 && (
          <text x={cx} y={cy + 26} textAnchor="middle" className="fill-zinc-600 font-mono" fontSize={8} letterSpacing={1}>
            outer = bar 1 · inner = bar {bars}
          </text>
        )}
      </svg>
    </div>
  )
}
