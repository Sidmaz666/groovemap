'use client'

import type { GroovePattern } from '@/lib/atlas/types'
import { stepsPerBar, velocityTier } from '@/lib/atlas/types'
import { instrumentOf, TRACK_COLORS } from '@/lib/atlas/instruments'
import { cn } from '@/lib/utils'

/**
 * RhythmCircle — the musical cycle as concentric rings (one per track).
 * Angular position maps to step position over the full pattern length,
 * so any meter/cycle length renders correctly. Click a slot to toggle it.
 */

export interface RhythmCircleProps {
  pattern: GroovePattern
  currentStep?: number | null
  editable?: boolean
  onToggleStep?: (trackId: string, step: number) => void
  className?: string
}

export function RhythmCircle({ pattern, currentStep, editable = false, onToggleStep, className }: RhythmCircleProps) {
  const total = stepsPerBar(pattern.timeSignature, pattern.subdivision) * pattern.bars
  const cx = 160
  const cy = 160
  const rMax = 128
  const rMin = 34
  const tracks = pattern.tracks
  const ringGap = tracks.length > 1 ? (rMax - rMin) / Math.max(1, tracks.length - 1 || 1) : 0

  const angleFor = (step: number) => (step / total) * Math.PI * 2 - Math.PI / 2

  const pos = (ring: number, step: number) => {
    const r = tracks.length > 1 ? rMin + ring * ringGap : (rMin + rMax) / 2
    const a = angleFor(step)
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!editable) return
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * 320
    const py = ((e.clientY - rect.top) / rect.height) * 320
    // find nearest ring
    let bestRing = -1
    let bestDist = 14
    tracks.forEach((_, i) => {
      const r = tracks.length > 1 ? rMin + i * ringGap : (rMin + rMax) / 2
      const d = Math.abs(Math.hypot(px - cx, py - cy) - r)
      if (d < bestDist) {
        bestDist = d
        bestRing = i
      }
    })
    if (bestRing < 0) return
    const ang = Math.atan2(py - cy, px - cx) + Math.PI / 2
    const norm = ((ang / (Math.PI * 2)) % 1 + 1) % 1
    const step = Math.round(norm * total) % total
    onToggleStep?.(tracks[bestRing].id, step)
  }

  const playAngle = currentStep != null ? angleFor(currentStep) : null

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <svg
        viewBox="0 0 320 320"
        className={cn('max-w-full', editable && 'cursor-pointer')}
        onClick={handleClick}
        role="img"
        aria-label="Rhythm circle visualization"
      >
        {/* ring guides */}
        {tracks.map((_, i) => {
          const r = tracks.length > 1 ? rMin + i * ringGap : (rMin + rMax) / 2
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
          )
        })}
        {/* beat spokes */}
        {Array.from({ length: total }, (_, s) => {
          if (s % pattern.subdivision !== 0) return null
          const a = angleFor(s)
          return (
            <line
              key={s}
              x1={cx + (rMin - 10) * Math.cos(a)}
              y1={cy + (rMin - 10) * Math.sin(a)}
              x2={cx + (rMax + 10) * Math.cos(a)}
              y2={cy + (rMax + 10) * Math.sin(a)}
              stroke={s === 0 ? 'rgba(163,230,53,0.4)' : 'rgba(255,255,255,0.08)'}
              strokeWidth={s === 0 ? 1.5 : 1}
            />
          )
        })}
        {/* playhead */}
        {playAngle != null && (
          <line
            x1={cx}
            y1={cy}
            x2={cx + (rMax + 14) * Math.cos(playAngle)}
            y2={cy + (rMax + 14) * Math.sin(playAngle)}
            stroke="#a3e635"
            strokeWidth={2}
            strokeLinecap="round"
          />
        )}
        {/* hits */}
        {tracks.map((track, ring) => {
          const inst = instrumentOf(track.inst)
          const color = TRACK_COLORS[inst.color % TRACK_COLORS.length]
          return pattern.events
            .filter((e) => e.t === track.id)
            .map((e) => {
              const { x, y } = pos(ring, e.s)
              const tier = velocityTier(e.v)
              const rr = 3.4 + (e.v / 127) * 5.4
              return (
                <circle
                  key={`${track.id}:${e.s}`}
                  cx={x}
                  cy={y}
                  r={rr}
                  fill={tier === 'ghost' ? 'none' : color.hex}
                  stroke={color.hex}
                  strokeWidth={tier === 'ghost' ? 1.4 : 0}
                  opacity={tier === 'ghost' ? 0.85 : 0.35 + (e.v / 127) * 0.65}
                  strokeDasharray={e.p !== undefined ? '2 2' : undefined}
                />
              )
            })
        })}
        <circle cx={cx} cy={cy} r={2.5} fill="rgba(255,255,255,0.4)" />
      </svg>
      <div className="flex flex-wrap justify-center gap-2">
        {tracks.map((track) => {
          const inst = instrumentOf(track.inst)
          const color = TRACK_COLORS[inst.color % TRACK_COLORS.length]
          return (
            <span key={track.id} className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              <span className={cn('h-1.5 w-1.5 rounded-[2px]', color.dot)} /> {track.label ?? inst.short}
            </span>
          )
        })}
      </div>
    </div>
  )
}
