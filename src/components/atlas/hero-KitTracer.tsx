'use client'

import { useMemo } from 'react'
import type { GroovePattern } from '@/lib/atlas/types'
import { instrumentOf, TRACK_COLORS } from '@/lib/atlas/instruments'
import { cn } from '@/lib/utils'

/**
 * HeroKitTracer — compact live strip for the hero player: one chip per
 * instrument the pattern actually uses (in track order). Each chip lights up
 * in the instrument's track color at the exact moment its sample fires,
 * scaled by velocity. Correct by construction: it reads the same absolute
 * step index the audio engine broadcasts, so what lights is what you hear.
 */
export function HeroKitTracer({
  pattern,
  currentStep,
  className,
}: {
  pattern: GroovePattern
  currentStep: number | null
  className?: string
}) {
  const chips = useMemo(() => {
    const seen = new Set<string>()
    const out: { inst: string; label: string; hex: string }[] = []
    for (const t of pattern.tracks) {
      if (seen.has(t.inst)) continue
      seen.add(t.inst)
      const def = instrumentOf(t.inst)
      out.push({ inst: t.inst, label: t.label ?? def.short, hex: TRACK_COLORS[def.color % TRACK_COLORS.length].hex })
    }
    return out
  }, [pattern])

  const active = useMemo(() => {
    const m = new Map<string, number>()
    if (currentStep == null) return m
    const byTrack = new Map(pattern.tracks.map((t) => [t.id, t.inst]))
    for (const e of pattern.events) {
      if (e.s !== currentStep) continue
      const inst = byTrack.get(e.t)
      if (!inst) continue
      m.set(inst, Math.max(m.get(inst) ?? 0, e.v))
    }
    return m
  }, [pattern, currentStep])

  return (
    <div className={cn('flex min-w-0 flex-wrap items-center gap-1.5', className)} aria-hidden>
      {chips.map((c) => {
        const vel = active.get(c.inst) ?? 0
        const lit = vel > 0
        return (
          <span
            key={c.inst}
            className={cn(
              'inline-flex h-6 shrink-0 items-center gap-1.5 border px-2 font-mono text-[9px] uppercase tracking-widest transition-all duration-100',
              lit ? 'font-bold' : 'border-zinc-800 bg-zinc-900/60 text-zinc-500'
            )}
            style={
              lit
                ? {
                    borderColor: c.hex,
                    color: c.hex,
                    background: `${c.hex}${vel >= 110 ? '33' : '1f'}`,
                    boxShadow: `0 0 ${vel >= 110 ? 12 : 6}px ${c.hex}55`,
                  }
                : undefined
            }
          >
            <span className="h-1.5 w-1.5" style={{ background: lit ? c.hex : '#3f3f46' }} />
            {c.label}
          </span>
        )
      })}
      {chips.length === 0 && (
        <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">no tracks</span>
      )}
    </div>
  )
}
