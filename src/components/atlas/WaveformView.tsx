'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AudioWaveform } from 'lucide-react'
import type { GroovePattern } from '@/lib/atlas/types'
import { barDuration } from '@/lib/atlas/types'
import { renderPatternWav } from '@/lib/atlas/audio/engine'
import { cn } from '@/lib/utils'

/**
 * WaveformView — the pattern rendered through the real sample kit offline,
 * drawn as a symmetric peak waveform (min/max pairs). The played portion is
 * tinted lime and a playhead follows the live transport position.
 */

const PEAK_BINS = 220

interface Peaks {
  /** interleaved [min, max] per bin, normalized 0..1 */
  data: Float32Array
  /** seconds of the rendered audio (excludes tail) */
  loopSeconds: number
  /** total rendered seconds including tail */
  totalSeconds: number
}

let cacheKey = ''
let cache: Peaks | null = null
/** small module-level cache: one render at a time, keyed by pattern identity */
function cacheKeyOf(p: GroovePattern): string {
  return `${p.id}:${p.kitSuggestion}:${p.bpm}:${p.swing}:${p.events.length}`
}

export function WaveformView({
  pattern,
  currentStep,
  className,
}: {
  pattern: GroovePattern
  currentStep?: number | null
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [peaks, setPeaks] = useState<Peaks | null>(null)
  const [rendering, setRendering] = useState(false)
  const tokenRef = useRef(0)

  const key = cacheKeyOf(pattern)

  useEffect(() => {
    const token = ++tokenRef.current
    // let the shimmer paint before the (sync-blocking) offline render; all
    // state updates happen inside the async callback (never sync in effect)
    const t = setTimeout(() => {
      if (tokenRef.current !== token) return
      if (cache && cacheKey === key) {
        setPeaks(cache)
        setRendering(false)
        return
      }
      setRendering(true)
      setPeaks(null)
      renderPatternWav(pattern, { loops: 2, tail: 0.9 })
        .then((buffer) => {
          if (tokenRef.current !== token) return
          const built = buildPeaks(buffer, pattern)
          cacheKey = key
          cache = built
          setPeaks(built)
          setRendering(false)
        })
        .catch(() => {
          if (tokenRef.current !== token) return
          setRendering(false)
        })
    }, 30)
    return () => clearTimeout(t)
  }, [key])

  const totalSteps = useMemo(
    () => pattern.timeSignature.num * pattern.subdivision * pattern.bars,
    [pattern]
  )

  // draw whenever data, size or playhead changes
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      if (w === 0 || h === 0) return
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, w, h)

      const mid = h / 2
      // playhead progress across the drawn 2-loop waveform
      let progress = -1
      if (peaks && currentStep != null && currentStep >= 0) {
        progress = (currentStep % (totalSteps * 2)) / (totalSteps * 2)
      }

      if (!peaks) {
        // idle placeholder bars
        ctx.fillStyle = '#27272a'
        const bw = w / PEAK_BINS
        for (let i = 0; i < PEAK_BINS; i++) {
          const ph = 2 + Math.abs(Math.sin(i * 0.7)) * 4
          ctx.fillRect(i * bw, mid - ph / 2, Math.max(1, bw - 1), ph)
        }
        return
      }

      const bw = w / PEAK_BINS
      for (let i = 0; i < PEAK_BINS; i++) {
        const min = peaks.data[i * 2]
        const max = peaks.data[i * 2 + 1]
        const y1 = mid - max * (mid - 3)
        const y2 = mid - min * (mid - 3)
        const played = i / PEAK_BINS <= progress
        ctx.fillStyle = played ? '#a3e635' : 'rgba(163,163,175,0.5)'
        ctx.fillRect(i * bw, y1, Math.max(1, bw - 1), Math.max(1.4, y2 - y1))
      }

      if (progress >= 0) {
        const x = progress * w
        ctx.fillStyle = '#f4f4f5'
        ctx.fillRect(x - 0.5, 0, 1, h)
        ctx.fillStyle = '#a3e635'
        ctx.fillRect(x - 2, 0, 4, 2)
        ctx.fillRect(x - 2, h - 2, 4, 2)
      }
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [peaks, currentStep, totalSteps])

  return (
    <div className={cn('rounded-lg border border-zinc-800 bg-zinc-950', className)}>
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-3 py-2">
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          <AudioWaveform className="h-3.5 w-3.5 text-lime-400/80" /> waveform — real kit render
        </p>
        <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">
          {rendering || !peaks ? 'rendering…' : `${peaks.totalSeconds.toFixed(1)}s · 2 loops · 44.1 kHz`}
        </p>
      </div>
      <div ref={wrapRef} className="relative h-24 w-full sm:h-28">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Audio waveform of the pattern" role="img" />
        {(rendering || !peaks) && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className={cn('font-mono text-[10px] uppercase tracking-widest text-zinc-500', rendering && 'animate-pulse')}>
              {rendering ? 'rendering with the sample kit…' : 'waveform unavailable'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function buildPeaks(buffer: AudioBuffer, pattern: GroovePattern): Peaks {
  const ch = buffer.getChannelData(0)
  const loopSeconds = barDuration(pattern.timeSignature, pattern.subdivision, pattern.bpm) * pattern.bars * 2
  const usable = Math.min(ch.length, Math.floor(loopSeconds * buffer.sampleRate))
  const step = Math.max(1, Math.floor(usable / PEAK_BINS))
  const data = new Float32Array(PEAK_BINS * 2)
  let peak = 0.0001
  for (let i = 0; i < PEAK_BINS; i++) {
    let min = 0
    let max = 0
    const start = i * step
    const end = Math.min(usable, start + step)
    for (let j = start; j < end; j++) {
      const v = ch[j]
      if (v < min) min = v
      if (v > max) max = v
    }
    data[i * 2] = min
    data[i * 2 + 1] = max
    if (-min > peak) peak = -min
    if (max > peak) peak = max
  }
  const norm = 1 / peak
  for (let i = 0; i < data.length; i++) data[i] *= norm
  const totalSeconds = buffer.duration
  return { data, loopSeconds, totalSeconds }
}
