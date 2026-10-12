'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Route } from '../AppShell'
import { SCATTER_POINTS, BPM_MIN, BPM_MAX, familyStat } from './vizData'
import type { ScatterPoint } from './vizData'
import { prepareCanvas, useOnScreen, useResize, useRenderLoop, FONT_MONO } from './viz-utils'

/**
 * TempoScatter — every pattern in the catalog as one point:
 * x = tempo (bpm, deterministic jitter for shared values),
 * y = grid density (0 sparse → 3 max, jittered), color = family,
 * dot size = hit count. Hover names the groove; click opens it.
 * Dots render once into an offscreen layer; the loop only composes
 * layers + hover accents, so it stays at 60fps with 4k+ points.
 */

const DENSITY_LABELS = ['SPARSE', 'LIGHT', 'MID', 'MAX']
const BANDS: { from: number; to: number; label: string }[] = [
  { from: BPM_MIN, to: 78, label: 'halftime / doom' },
  { from: 78, to: 118, label: 'pocket' },
  { from: 118, to: 140, label: 'club' },
  { from: 140, to: 176, label: 'fast' },
  { from: 176, to: BPM_MAX, label: 'extreme' },
]

export function TempoScatter({ navigate }: { navigate: (r: Route) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offRef = useRef<HTMLCanvasElement | null>(null)
  const geomRef = useRef({ padL: 44, padR: 14, padT: 26, padB: 34, w: 0, h: 0 })
  const hoverRef = useRef<ScatterPoint | null>(null)
  const [hover, setHover] = useState<{ p: ScatterPoint; x: number; y: number } | null>(null)
  const [boxW, setBoxW] = useState(400)
  const visible = useOnScreen(wrapRef)

  const xFor = useCallback((bpm: number) => {
    const g = geomRef.current
    const innerW = g.w - g.padL - g.padR
    return g.padL + ((bpm - BPM_MIN) / (BPM_MAX - BPM_MIN)) * innerW
  }, [])
  const yFor = useCallback((density: number) => {
    const g = geomRef.current
    const innerH = g.h - g.padT - g.padB
    return g.padT + innerH - ((density + 0.5) / 3.6) * innerH
  }, [])

  /* ------- offscreen point layer ------- */
  const renderPoints = useCallback(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const w = wrap.clientWidth
    const h = wrap.clientHeight
    if (w < 10 || h < 10) return
    geomRef.current.w = w
    geomRef.current.h = h
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let off = offRef.current
    if (!off) {
      off = document.createElement('canvas')
      offRef.current = off
    }
    off.width = Math.round(w * dpr)
    off.height = Math.round(h * dpr)
    const ctx = off.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    // tempo bands
    ctx.textAlign = 'center'
    ctx.font = `8.5px ${FONT_MONO}`
    for (const b of BANDS) {
      const x0 = xFor(b.from)
      const x1 = xFor(b.to)
      ctx.fillStyle = 'rgba(255 255 255 / 0.016)'
      ctx.fillRect(x0, geomRef.current.padT, x1 - x0, h - geomRef.current.padT - geomRef.current.padB)
      ctx.fillStyle = 'rgba(140 140 150 / 0.4)'
      ctx.fillText(b.label, (x0 + x1) / 2, geomRef.current.padT - 9)
    }

    // gridlines + axes
    ctx.font = `9px ${FONT_MONO}`
    for (let d = 0; d < 4; d++) {
      const y = yFor(d)
      ctx.strokeStyle = 'rgba(255 255 255 / 0.05)'
      ctx.beginPath()
      ctx.moveTo(geomRef.current.padL, y)
      ctx.lineTo(w - geomRef.current.padR, y)
      ctx.stroke()
      ctx.fillStyle = 'rgba(140 140 150 / 0.7)'
      ctx.textAlign = 'right'
      ctx.fillText(DENSITY_LABELS[d], geomRef.current.padL - 8, y + 3)
    }
    ctx.textAlign = 'center'
    for (let bpm = Math.ceil(BPM_MIN / 40) * 40; bpm <= BPM_MAX; bpm += 40) {
      const x = xFor(bpm)
      ctx.strokeStyle = 'rgba(255 255 255 / 0.035)'
      ctx.beginPath()
      ctx.moveTo(x, geomRef.current.padT)
      ctx.lineTo(x, h - geomRef.current.padB)
      ctx.stroke()
      ctx.fillStyle = 'rgba(140 140 150 / 0.7)'
      ctx.fillText(String(bpm), x, h - geomRef.current.padB + 14)
    }
    ctx.fillStyle = 'rgba(113 113 122 / 0.8)'
    ctx.font = `8.5px ${FONT_MONO}`
    ctx.fillText('BPM →', w - geomRef.current.padR - 18, h - geomRef.current.padB + 26)

    // points — smallest last so dense families don't bury rare ones
    const pts = [...SCATTER_POINTS].sort((a, b) => b.hits - a.hits)
    for (const p of pts) {
      const st = familyStat(p.family)
      const r = 1.1 + Math.min(2.4, Math.log2(1 + p.hits) * 0.34)
      ctx.fillStyle = `hsla(${st.hue} 72% 58% / 0.5)`
      ctx.beginPath()
      ctx.arc(xFor(p.bpm + p.jx), yFor(p.density + p.jy), r, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [xFor, yFor])

  useResize(wrapRef, (w) => {
    setBoxW(w)
    renderPoints()
  })

  /* ------- loop: compose + hover ------- */
  useRenderLoop(visible, (ts) => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    const off = offRef.current
    if (!canvas || !wrap || !off) return
    const { w, h } = geomRef.current
    const ctx = prepareCanvas(canvas, w, h)
    if (!ctx) return
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(off, 0, 0, w, h)

    const hv = hoverRef.current
    if (hv) {
      const st = familyStat(hv.family)
      const x = xFor(hv.bpm + hv.jx)
      const y = yFor(hv.density + hv.jy)
      const t = ts / 1000
      // crosshair
      ctx.strokeStyle = 'rgba(163 230 53 / 0.25)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(geomRef.current.padL, y)
      ctx.lineTo(w - geomRef.current.padR, y)
      ctx.moveTo(x, geomRef.current.padT)
      ctx.lineTo(x, h - geomRef.current.padB)
      ctx.stroke()
      // ring + core
      const p2 = (t * 1.4) % 1
      ctx.strokeStyle = `hsla(84 95% 65% / ${0.75 * (1 - p2)})`
      ctx.beginPath()
      ctx.arc(x, y, 4 + p2 * 9, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = st.color
      ctx.beginPath()
      ctx.arc(x, y, 3.4, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255 255 255 / 0.9)'
      ctx.lineWidth = 1.2
      ctx.stroke()
    }
  })

  /* ------- hover / click ------- */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const pick = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      let best: ScatterPoint | null = null
      let bestD = 100 // squared px threshold
      for (const p of SCATTER_POINTS) {
        const dx = xFor(p.bpm + p.jx) - px
        const dy = yFor(p.density + p.jy) - py
        const d = dx * dx + dy * dy
        if (d < bestD) {
          bestD = d
          best = p
        }
      }
      return best ? { p: best, x: px, y: py } : null
    }
    const onMove = (e: PointerEvent) => {
      const h = pick(e)
      const key = h?.p.id ?? ''
      if (key !== (hoverRef.current?.id ?? '')) {
        hoverRef.current = h?.p ?? null
        setHover(h)
      } else if (h) {
        setHover(h)
      }
      canvas.style.cursor = h ? 'pointer' : 'default'
    }
    const onLeave = () => {
      hoverRef.current = null
      setHover(null)
    }
    const onClick = () => {
      const h = hoverRef.current
      if (h) navigate({ view: 'pattern', id: h.id })
    }
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('click', onClick)
    return () => {
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('click', onClick)
    }
  }, [navigate, xFor, yFor])

  return (
    <div ref={wrapRef} className="relative h-[460px] w-full select-none overflow-hidden rounded-md border border-zinc-800/80 bg-zinc-950/60 sm:h-[520px]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Scatter plot of tempo against density for every pattern" role="img" />
      {hover && (
        <div
          className="pointer-events-none absolute z-10 max-w-60 border border-zinc-700 bg-zinc-950/95 p-2.5 shadow-xl backdrop-blur-sm"
          style={{
            left: Math.min(hover.x + 12, boxW - 236),
            top: Math.max(6, hover.y - 52),
          }}
        >
          <p className="font-mono text-[11px] font-semibold text-zinc-100">{hover.p.title}</p>
          <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: familyStat(hover.p.family).color }} aria-hidden />
            {familyStat(hover.p.family).label} · {hover.p.bpm} bpm · {DENSITY_LABELS[hover.p.density].toLowerCase()} · {hover.p.hits} hits
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-lime-400/80">open pattern →</p>
        </div>
      )}
      <p className="pointer-events-none absolute bottom-2 right-3 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
        hover · click to open
      </p>
    </div>
  )
}
