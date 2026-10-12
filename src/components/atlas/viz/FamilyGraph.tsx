'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Route } from '../AppShell'
import { FAMILY_STATS, FAMILY_EDGES, FAMILY_NEIGHBORS, familyStat } from './vizData'
import type { FamilyStat } from './vizData'
import { prepareCanvas, useOnScreen, useResize, useRenderLoop, FONT_MONO } from './viz-utils'

/**
 * FamilyGraph — force-directed network of the 38 style families.
 * Node size = pattern count; edges = shared DNA (curated knowledge links +
 * aggregated cross-family related-pattern links). Deterministic seeded
 * simulation → identical layout every load. Hover highlights a family's
 * constellation, click dives into Explore filtered by that family.
 * Drag to pan, scroll to zoom, double-click to reset.
 */

interface GNode {
  stat: FamilyStat
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

const WORLD_W = 980
const WORLD_H = 620

function buildNodes(): GNode[] {
  // deterministic seed layout on a golden-angle ring
  const nodes: GNode[] = FAMILY_STATS.map((stat, i) => {
    const a = i * 2.399963
    const rad = 150 + (i % 7) * 26
    return {
      stat,
      x: Math.cos(a) * rad * (WORLD_W / WORLD_H) * 0.62,
      y: Math.sin(a) * rad * 0.62,
      vx: 0,
      vy: 0,
      r: 9 + Math.sqrt(stat.count) * 1.9,
    }
  })
  // Fruchterman–Reingold-ish simulation, fully deterministic
  const byKey = new Map(nodes.map((n) => [n.stat.key, n]))
  const edges = FAMILY_EDGES.map((e) => ({ a: byKey.get(e.a)!, b: byKey.get(e.b)!, w: e.w })).filter((e) => e.a && e.b)
  const temp0 = 16
  for (let it = 0; it < 420; it++) {
    const temp = temp0 * (1 - it / 420) + 0.4
    // pairwise repulsion
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]
        let dx = a.x - b.x
        let dy = a.y - b.y
        let d2 = dx * dx + dy * dy
        if (d2 < 1) {
          dx = (i % 3) - 1 || 0.6
          dy = (j % 3) - 1 || 0.6
          d2 = dx * dx + dy * dy
        }
        const f = Math.min(2600, 42000 / d2)
        const d = Math.sqrt(d2)
        const fx = (dx / d) * f
        const fy = (dy / d) * f
        a.vx += (fx / a.r) * 2.2
        a.vy += (fy / a.r) * 2.2
        b.vx -= (fx / b.r) * 2.2
        b.vy -= (fy / b.r) * 2.2
      }
      // gravity
      a.vx -= a.x * 0.0022
      a.vy -= a.y * 0.0022
    }
    // springs
    for (const e of edges) {
      const dx = e.b.x - e.a.x
      const dy = e.b.y - e.a.y
      const d = Math.max(1, Math.hypot(dx, dy))
      const rest = 150 - Math.min(40, e.w * 4)
      const f = (d - rest) * (0.010 + 0.0018 * Math.min(e.w, 10))
      const fx = (dx / d) * f
      const fy = (dy / d) * f
      e.a.vx += fx
      e.a.vy += fy
      e.b.vx -= fx
      e.b.vy -= fy
    }
    // integrate with clamping
    for (const n of nodes) {
      n.vx *= 0.86
      n.vy *= 0.86
      const sp = Math.hypot(n.vx, n.vy)
      if (sp > temp) {
        n.vx = (n.vx / sp) * temp
        n.vy = (n.vy / sp) * temp
      }
      n.x += n.vx * 0.5
      n.y += n.vy * 0.5
    }
  }
  // normalize to the world box with margins
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const n of nodes) {
    minX = Math.min(minX, n.x - n.r)
    maxX = Math.max(maxX, n.x + n.r)
    minY = Math.min(minY, n.y - n.r)
    maxY = Math.max(maxY, n.y + n.r)
  }
  const s = Math.min((WORLD_W - 90) / (maxX - minX), (WORLD_H - 80) / (maxY - minY))
  const ox = (minX + maxX) / 2
  const oy = (minY + maxY) / 2
  for (const n of nodes) {
    n.x = (n.x - ox) * s
    n.y = (n.y - oy) * s
    n.vx = 0
    n.vy = 0
  }
  return nodes
}

interface HoverInfo {
  key: string
  sx: number
  sy: number
}

export function FamilyGraph({ navigate }: { navigate: (r: Route) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<GNode[] | null>(null)
  const viewRef = useRef<{ init: boolean; scale: number; tx: number; ty: number }>({ init: false, scale: 1, tx: 0, ty: 0 })
  const dragRef = useRef({ down: false, x: 0, y: 0, moved: 0, over: '' })
  const hoverRef = useRef('')
  const [hover, setHover] = useState<HoverInfo | null>(null)
  const [boxW, setBoxW] = useState(400)
  const visible = useOnScreen(wrapRef)

  const hitTest = useCallback((sx: number, sy: number): { node: GNode; scale: number; tx: number; ty: number } | null => {
    const nodes = nodesRef.current
    if (!nodes) return null
    const v = viewRef.current
    let best: GNode | null = null
    let bestD = Infinity
    for (const n of nodes) {
      const d = Math.hypot(n.x * v.scale + v.tx - sx, n.y * v.scale + v.ty - sy)
      if (d < Math.max(14, n.r * v.scale + 4) && d < bestD) {
        best = n
        bestD = d
      }
    }
    return best ? { node: best, scale: v.scale, tx: v.tx, ty: v.ty } : null
  }, [])

  /* ---------------- render loop ---------------- */
  useRenderLoop(visible, (ts) => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const w = wrap.clientWidth
    const h = wrap.clientHeight
    const ctx = prepareCanvas(canvas, w, h)
    if (!ctx) return
    if (!nodesRef.current) nodesRef.current = buildNodes()
    const v = viewRef.current
    if (!v.init && w > 0 && h > 0) {
      v.scale = Math.min(w / WORLD_W, h / WORLD_H)
      v.tx = w / 2
      v.ty = h / 2
      v.init = true
    }
    const nodes = nodesRef.current
    const hov = hoverRef.current
    const hovStat = hov ? FAMILY_NEIGHBORS.get(hov) : null
    const t = ts / 1000

    ctx.clearRect(0, 0, w, h)

    // ---- edges (curved, weight → presence) ----
    const byKey = new Map(nodes.map((n) => [n.stat.key, n]))
    for (const e of FAMILY_EDGES) {
      const a = byKey.get(e.a)
      const b = byKey.get(e.b)
      if (!a || !b) continue
      const linked = hov !== '' && (e.a === hov || e.b === hov)
      let alpha = 0.045 + (e.w / 12) * 0.16
      if (hov !== '') alpha = linked ? Math.min(0.85, 0.3 + e.w / 10) : 0.018
      ctx.strokeStyle = linked ? 'hsla(84 90% 65% / 0.5)' : `hsla(0 0% 70% / ${alpha})`
      ctx.lineWidth = linked ? 1.4 : 0.5 + Math.min(1.6, e.w / 6)
      const mx = (a.x + b.x) / 2 - (b.y - a.y) * 0.08
      const my = (a.y + b.y) / 2 + (b.x - a.x) * 0.08
      ctx.beginPath()
      ctx.moveTo(a.x * v.scale + v.tx, a.y * v.scale + v.ty)
      ctx.quadraticCurveTo(mx * v.scale + v.tx, my * v.scale + v.ty, b.x * v.scale + v.tx, b.y * v.scale + v.ty)
      ctx.stroke()
    }

    // ---- nodes ----
    const small = w < 560
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      const x = n.x * v.scale + v.tx
      const y = n.y * v.scale + v.ty
      const r = Math.max(3.5, n.r * v.scale)
      const isHov = n.stat.key === hov
      const isNb = hovStat?.has(n.stat.key) ?? false
      const dimmed = hov !== '' && !isHov && !isNb
      const breathe = 0.26 + 0.05 * Math.sin(t * 1.1 + i * 1.7)

      // glow
      const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 2.8)
      g.addColorStop(0, `hsla(${n.stat.hue} 85% 62% / ${dimmed ? 0.05 : isHov ? 0.5 : breathe})`)
      g.addColorStop(1, 'hsla(0 0% 0% / 0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, r * 2.8, 0, Math.PI * 2)
      ctx.fill()

      // core
      ctx.globalAlpha = dimmed ? 0.3 : 1
      ctx.fillStyle = n.stat.color
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = isHov ? 'rgba(163 230 53 / 0.95)' : 'rgba(255 255 255 / 0.22)'
      ctx.lineWidth = isHov ? 1.8 : 1
      ctx.stroke()
      // inner facet
      ctx.fillStyle = 'rgba(255 255 255 / 0.28)'
      ctx.beginPath()
      ctx.arc(x - r * 0.28, y - r * 0.3, r * 0.32, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      // hover pulse ring
      if (isHov) {
        const p = (t * 0.9) % 1
        ctx.strokeStyle = `hsla(84 90% 65% / ${0.5 * (1 - p)})`
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(x, y, r + 4 + p * 14, 0, Math.PI * 2)
        ctx.stroke()
      }

      // labels — screen space
      if (!small || isHov || n.stat.count > 120) {
        const fs = isHov ? 11.5 : 10
        ctx.font = `${fs}px ${FONT_MONO}`
        ctx.textAlign = 'center'
        ctx.fillStyle = dimmed ? 'rgba(161 161 170 / 0.25)' : isHov ? 'rgba(230 255 180 / 0.95)' : 'rgba(190 190 200 / 0.62)'
        ctx.fillText(n.stat.label, x, y + r + 13)
        ctx.font = `9px ${FONT_MONO}`
        ctx.fillStyle = dimmed ? 'rgba(113 113 122 / 0.2)' : 'rgba(140 140 150 / 0.55)'
        ctx.fillText(String(n.stat.count), x, y + r + 24)
      }
    }
  })

  /* ---------------- resize ---------------- */
  useResize(wrapRef, (w) => setBoxW(w))

  /* ---------------- pointer interaction ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onDown = (e: PointerEvent) => {
      try {
        canvas.setPointerCapture(e.pointerId)
      } catch {
        // synthetic/inactive pointers can't be captured — drag still works
      }
      dragRef.current.down = true
      dragRef.current.x = e.offsetX
      dragRef.current.y = e.offsetY
      dragRef.current.moved = 0
    }
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current
      if (d.down) {
        const v = viewRef.current
        const dx = e.offsetX - d.x
        const dy = e.offsetY - d.y
        v.tx += dx
        v.ty += dy
        d.moved += Math.abs(dx) + Math.abs(dy)
        d.x = e.offsetX
        d.y = e.offsetY
        return
      }
      const hit = hitTest(e.offsetX, e.offsetY)
      const key = hit?.node.stat.key ?? ''
      if (key !== hoverRef.current) {
        hoverRef.current = key
        setHover(key ? { key, sx: e.offsetX, sy: e.offsetY } : null)
      } else if (key) {
        setHover({ key, sx: e.offsetX, sy: e.offsetY })
      }
      canvas.style.cursor = key ? 'pointer' : 'grab'
    }
    const onUp = (e: PointerEvent) => {
      const d = dragRef.current
      d.down = false
      if (d.moved < 6) {
        const hit = hitTest(e.offsetX, e.offsetY)
        if (hit) navigate({ view: 'explore', filters: { families: [hit.node.stat.key] } })
      }
    }
    const onLeave = () => {
      dragRef.current.down = false
      hoverRef.current = ''
      setHover(null)
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const v = viewRef.current
      const f = Math.exp(-e.deltaY * 0.0016)
      const ns = Math.min(4, Math.max(0.4, v.scale * f))
      const k = ns / v.scale
      const rect = canvas.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      v.tx = px - (px - v.tx) * k
      v.ty = py - (py - v.ty) * k
      v.scale = ns
    }
    const onDbl = () => {
      const wrap = wrapRef.current
      const v = viewRef.current
      if (!wrap) return
      v.scale = Math.min(wrap.clientWidth / WORLD_W, wrap.clientHeight / WORLD_H)
      v.tx = wrap.clientWidth / 2
      v.ty = wrap.clientHeight / 2
    }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('dblclick', onDbl)
    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('dblclick', onDbl)
    }
  }, [hitTest, navigate])

  /* ---------------- tooltip data ---------------- */
  const hoverNode: { stat: FamilyStat; top: [string, number][] } | null = (() => {
    if (!hover) return null
    const stat = familyStat(hover.key)
    const top = [...(FAMILY_NEIGHBORS.get(hover.key)?.entries() ?? [])].sort((a, b) => b[1] - a[1]).slice(0, 4)
    return { stat, top }
  })()

  return (
    <div ref={wrapRef} className="relative h-[440px] w-full select-none overflow-hidden rounded-md border border-zinc-800/80 bg-zinc-950/60 sm:h-[500px]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-grab touch-none" aria-label="Force-directed graph of style family relations" role="img" />
      {hoverNode && hover && (
        <div
          className="pointer-events-none absolute z-10 max-w-56 border border-zinc-700 bg-zinc-950/95 p-3 shadow-xl backdrop-blur-sm"
          style={{
            left: Math.min(hover.sx + 14, boxW - 230),
            top: Math.max(8, hover.sy - 10),
          }}
        >
          <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: hoverNode.stat.color }} aria-hidden />
            <span className="text-zinc-100">{hoverNode.stat.label}</span>
          </p>
          <p className="mt-1 font-mono text-[10px] text-zinc-500">{hoverNode.stat.count} patterns · click to explore</p>
          {hoverNode.top.length > 0 && (
            <p className="mt-1.5 text-[10px] leading-relaxed text-zinc-400">
              shares DNA with{' '}
              {hoverNode.top.map(([k, w], i) => (
                <span key={k}>
                  {i > 0 && ', '}
                  <span className="text-zinc-200">{familyStat(k).label}</span>
                  <span className="text-zinc-600"> ({w})</span>
                </span>
              ))}
            </p>
          )}
        </div>
      )}
      <p className="pointer-events-none absolute bottom-2 right-3 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
        drag · scroll · hover · click
      </p>
    </div>
  )
}
