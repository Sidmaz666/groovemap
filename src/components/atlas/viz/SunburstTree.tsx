'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Route } from '../AppShell'
import { HIERARCHY, TOTAL_PATTERNS } from './vizData'
import type { FamilyStat } from './vizData'
import { prepareCanvas, useOnScreen, useResize, useRenderLoop, FONT_MONO } from './viz-utils'
import { vagueCount } from '@/lib/atlas/vague'

/**
 * SunburstTree — the whole catalog as one radial tree:
 * center = atlas · ring 1 = style families · ring 2 = meters ·
 * ring 3 = every individual pattern (4k+ thin arcs in family colors).
 * Static disc is pre-rendered once per resize and slowly revolves;
 * hover reveals the exact path, click navigates (family/meter → Explore,
 * leaf → pattern page).
 */

interface LeafSeg {
  start: number
  end: number
  id: string
  slug: string
  title: string
  bpm: number
}

interface MeterSeg {
  start: number
  end: number
  key: string
  leaves: LeafSeg[]
}

interface FamSeg {
  stat: FamilyStat
  start: number
  end: number
  meters: MeterSeg[]
}

// precomputed angle map (deterministic; rotation applied at draw/hover time)
const FAM_SEGS: FamSeg[] = (() => {
  const TAU = Math.PI * 2
  const segs: FamSeg[] = []
  let a = -Math.PI / 2 // start at 12 o'clock
  for (const branch of HIERARCHY) {
    const total = branch.meters.reduce((n, m) => n + m.patterns.length, 0)
    if (total === 0) continue
    const span = (total / TOTAL_PATTERNS) * TAU
    const famStart = a
    const meters: MeterSeg[] = []
    for (const m of branch.meters) {
      const mStart = a
      const leaves: LeafSeg[] = []
      for (const p of m.patterns) {
        const lStart = a
        a += span / total
        leaves.push({ start: lStart, end: a, id: p.id, slug: p.slug, title: p.title, bpm: p.bpm })
      }
      meters.push({ start: mStart, end: a, key: m.key, leaves })
    }
    segs.push({ stat: branch.stat, start: famStart, end: a, meters })
  }
  return segs
})()

type Hit =
  | { ring: 'family'; stat: FamilyStat }
  | { ring: 'meter'; stat: FamilyStat; meter: string }
  | { ring: 'leaf'; stat: FamilyStat; meter: string; leaf: LeafSeg }

function hitAt(angle: number, r: number, radii: { r0: number; r1: number; r2: number; r3: number }): Hit | null {
  if (r < radii.r0 || r > radii.r3) return null
  for (const f of FAM_SEGS) {
    if (angle < f.start || angle >= f.end) continue
    if (r <= radii.r1) return { ring: 'family', stat: f.stat }
    for (const m of f.meters) {
      if (angle < m.start || angle >= m.end) continue
      if (r <= radii.r2) return { ring: 'meter', stat: f.stat, meter: m.key }
      for (const l of m.leaves) {
        if (angle < l.start || angle >= l.end) continue
        return { ring: 'leaf', stat: f.stat, meter: m.key, leaf: l }
      }
    }
  }
  return null
}

export function SunburstTree({ navigate }: { navigate: (r: Route) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offRef = useRef<HTMLCanvasElement | null>(null)
  const rotRef = useRef(0)
  const radiiRef = useRef({ r0: 60, r1: 120, r2: 165, r3: 200 })
  const sizeRef = useRef({ w: 0, h: 0 })
  const hoverRef = useRef<Hit | null>(null)
  const [hit, setHit] = useState<Hit | null>(null)
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null)
  const [boxW, setBoxW] = useState(400)
  const visible = useOnScreen(wrapRef)

  /* ------- static disc pre-render ------- */
  const renderDisc = useCallback(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const w = wrap.clientWidth
    const h = wrap.clientHeight
    if (w < 10 || h < 10) return
    sizeRef.current = { w, h }
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

    const side = Math.min(w, h)
    const r0 = side * 0.185
    const r1 = r0 + side * 0.14
    const r2 = r1 + side * 0.115
    const r3 = r2 + side * 0.105
    radiiRef.current = { r0, r1, r2, r3 }
    const cx = w / 2
    const cy = h / 2

    const sector = (rIn: number, rOut: number, a0: number, a1: number) => {
      ctx.beginPath()
      ctx.arc(cx, cy, rOut, a0, a1)
      ctx.arc(cx, cy, rIn, a1, a0, true)
      ctx.closePath()
    }

    // background halo rings
    ctx.strokeStyle = 'rgba(255 255 255 / 0.045)'
    ctx.lineWidth = 1
    for (const r of [r0, r1, r2, r3]) {
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()
    }

    // leaves — one thin arc per pattern
    ctx.lineWidth = Math.max(1, (r3 - r2) * 0.82)
    for (const f of FAM_SEGS) {
      ctx.strokeStyle = `hsla(${f.stat.hue} 68% 56% / 0.42)`
      for (const m of f.meters) {
        for (const l of m.leaves) {
          if (l.end - l.start <= 0) continue
          ctx.beginPath()
          ctx.arc(cx, cy, (r2 + r3) / 2, l.start, Math.max(l.start + 0.0004, l.end - 0.0004))
          ctx.stroke()
        }
      }
    }

    // meters
    for (const f of FAM_SEGS) {
      let mi = 0
      for (const m of f.meters) {
        ctx.fillStyle = `hsla(${f.stat.hue} 60% ${44 + (mi % 3) * 8}% / 0.85)`
        sector(r1, r2 - 0.8, m.start + 0.0012, m.end - 0.0012)
        ctx.fill()
        mi++
      }
    }

    // families
    for (const f of FAM_SEGS) {
      ctx.fillStyle = `hsla(${f.stat.hue} 74% 58% / 0.95)`
      sector(r0, r1 - 0.8, f.start + 0.002, f.end - 0.002)
      ctx.fill()
    }

    // radial family labels
    ctx.font = `9.5px ${FONT_MONO}`
    for (const f of FAM_SEGS) {
      if (f.stat.count < 45) continue
      const mid = (f.start + f.end) / 2
      const flip = mid > Math.PI / 2 && mid < (3 * Math.PI) / 2
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(mid)
      ctx.translate(r1 - 6, 0)
      if (flip) {
        ctx.rotate(Math.PI)
        ctx.textAlign = 'right'
        ctx.fillStyle = 'rgba(9 9 11 / 0.85)'
        ctx.fillText(f.stat.label.toUpperCase(), -3, 3.2)
        ctx.fillStyle = 'rgba(240 244 220 / 0.92)'
        ctx.fillText(f.stat.label.toUpperCase(), -4, 3)
      } else {
        ctx.textAlign = 'right'
        ctx.fillStyle = 'rgba(9 9 11 / 0.85)'
        ctx.fillText(f.stat.label.toUpperCase(), -3, 3.2)
        ctx.fillStyle = 'rgba(12 12 10 / 0.92)'
        ctx.fillText(f.stat.label.toUpperCase(), -4, 3)
      }
      ctx.restore()
    }
  }, [])

  useResize(wrapRef, (w) => {
    setBoxW(w)
    renderDisc()
  })

  /* ------- animation loop ------- */
  useRenderLoop(visible, (ts) => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    const off = offRef.current
    if (!canvas || !wrap || !off) return
    const { w, h } = sizeRef.current
    const ctx = prepareCanvas(canvas, w, h)
    if (!ctx) return
    if (!hoverRef.current) rotRef.current += 0.00045

    ctx.clearRect(0, 0, w, h)
    const cx = w / 2
    const cy = h / 2
    const rot = rotRef.current
    const { r0, r1, r2, r3 } = radiiRef.current

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rot)
    ctx.drawImage(off, -cx, -cy, w, h)

    // hover highlight in disc space
    const hv = hoverRef.current
    if (hv) {
      const sector = (rIn: number, rOut: number, a0: number, a1: number) => {
        ctx.beginPath()
        ctx.arc(0, 0, rOut, a0, a1)
        ctx.arc(0, 0, rIn, a1, a0, true)
        ctx.closePath()
      }
      ctx.lineWidth = 1.4
      if (hv.ring === 'family') {
        const f = FAM_SEGS.find((ff) => ff.stat.key === hv.stat.key)
        if (f) {
          ctx.strokeStyle = 'rgba(190 255 100 / 0.95)'
          sector(r0 - 2, r1 + 2, f.start, f.end)
          ctx.stroke()
        }
      } else if (hv.ring === 'meter') {
        const f = FAM_SEGS.find((ff) => ff.stat.key === hv.stat.key)
        const m = f?.meters.find((mm) => mm.key === hv.meter)
        if (f && m) {
          ctx.strokeStyle = 'rgba(190 255 100 / 0.9)'
          sector(r1 - 1, r2 + 1, m.start, m.end)
          ctx.stroke()
        }
      } else {
        ctx.strokeStyle = 'rgba(200 255 120 / 0.98)'
        sector(r2 - 1, r3 + 1.5, hv.leaf.start, hv.leaf.end)
        ctx.stroke()
        const t = ts / 1000
        ctx.fillStyle = `hsla(84 95% 70% / ${0.5 + 0.3 * Math.sin(t * 5)})`
        ctx.beginPath()
        ctx.arc(Math.cos((hv.leaf.start + hv.leaf.end) / 2) * (r3 + 5), Math.sin((hv.leaf.start + hv.leaf.end) / 2) * (r3 + 5), 2.2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.restore()

    // center label (screen space)
    ctx.textAlign = 'center'
    if (hv) {
      ctx.font = `600 13px ${FONT_MONO}`
      ctx.fillStyle = 'rgba(240 240 245 / 0.95)'
      const label = hv.ring === 'leaf' ? hv.leaf.title : hv.stat.label
      const clipped = label.length > 18 ? `${label.slice(0, 17)}…` : label
      ctx.fillText(clipped, cx, cy - 2)
      ctx.font = `10px ${FONT_MONO}`
      ctx.fillStyle = 'rgba(150 150 160 / 0.85)'
      const sub = hv.ring === 'family' ? `${hv.stat.count} grooves` : `${hv.meter} · ${hv.stat.label}`
      ctx.fillText(sub, cx, cy + 14)
    } else {
      ctx.font = `600 20px ${FONT_MONO}`
      ctx.fillStyle = 'rgba(163 230 53 / 0.95)'
      ctx.fillText(vagueCount(TOTAL_PATTERNS), cx, cy - 1)
      ctx.font = `9px ${FONT_MONO}`
      ctx.fillStyle = 'rgba(140 140 150 / 0.8)'
      ctx.fillText('GROOVES', cx, cy + 15)
    }
  })

  /* ------- pointer ------- */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const angleFor = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left - sizeRef.current.w / 2
      const y = e.clientY - rect.top - sizeRef.current.h / 2
      // normalize into the segment domain [-PI/2, 3PI/2) — atan2 is (-PI, PI]
      // and idle rotation can push the offset arbitrarily far
      const TAU = Math.PI * 2
      let a = Math.atan2(y, x) - rotRef.current
      a = (((a + Math.PI / 2) % TAU) + TAU) % TAU - Math.PI / 2
      return { a, r: Math.hypot(x, y), px: e.clientX - rect.left, py: e.clientY - rect.top }
    }
    const onMove = (e: PointerEvent) => {
      const { a, r, px, py } = angleFor(e)
      const h = hitAt(a, r, radiiRef.current)
      if ((h?.ring === 'leaf' && hoverRef.current?.ring === 'leaf' && h.leaf.id === (hoverRef.current as { leaf: LeafSeg }).leaf.id) || h === hoverRef.current) {
        setTip({ x: px, y: py })
        return
      }
      hoverRef.current = h
      setHit(h)
      setTip({ x: px, y: py })
      canvas.style.cursor = h ? 'pointer' : 'default'
    }
    const onLeave = () => {
      hoverRef.current = null
      setHit(null)
      setTip(null)
    }
    const onClick = (e: PointerEvent) => {
      const { a, r } = angleFor(e)
      const h = hitAt(a, r, radiiRef.current)
      if (!h) return
      if (h.ring === 'family') navigate({ view: 'explore', filters: { families: [h.stat.key] } })
      else if (h.ring === 'meter') navigate({ view: 'explore', filters: { families: [h.stat.key], meters: [h.meter] } })
      else navigate({ view: 'pattern', id: h.leaf.id })
    }
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('click', onClick)
    return () => {
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('click', onClick)
    }
  }, [navigate])

  const tipContent = (() => {
    if (!hit) return null
    if (hit.ring === 'family') return { title: hit.stat.label, sub: `${hit.stat.count} patterns · click to explore` }
    if (hit.ring === 'meter') return { title: `${hit.stat.label} · ${hit.meter}`, sub: 'click to explore this meter' }
    return { title: hit.leaf.title, sub: `${hit.stat.label} · ${hit.meter} · ${hit.leaf.bpm} bpm · open pattern →` }
  })()

  return (
    <div ref={wrapRef} className="relative h-[460px] w-full select-none overflow-hidden rounded-md border border-zinc-800/80 bg-zinc-950/60 sm:h-[520px]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Radial sunburst tree of the whole pattern catalog" role="img" />
      {tipContent && tip && (
        <div
          className="pointer-events-none absolute z-10 max-w-64 border border-zinc-700 bg-zinc-950/95 p-2.5 shadow-xl backdrop-blur-sm"
          style={{ left: Math.min(tip.x + 12, boxW - 250), top: Math.max(6, tip.y - 40) }}
        >
          <p className="font-mono text-[11px] font-semibold text-zinc-100">{tipContent.title}</p>
          <p className="mt-0.5 font-mono text-[10px] text-zinc-500">{tipContent.sub}</p>
        </div>
      )}
      <p className="pointer-events-none absolute bottom-2 right-3 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
        hover · click to open
      </p>
    </div>
  )
}
