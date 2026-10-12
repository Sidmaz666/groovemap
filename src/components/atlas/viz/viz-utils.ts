'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

/** prepare a canvas for crisp drawing at devicePixelRatio, returns its 2d ctx */
export function prepareCanvas(canvas: HTMLCanvasElement, w: number, h: number): CanvasRenderingContext2D | null {
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const bw = Math.max(1, Math.round(w * dpr))
  const bh = Math.max(1, Math.round(h * dpr))
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw
    canvas.height = bh
  }
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return ctx
}

/**
 * tracks whether the element is (near) the viewport — used to pause render
 * loops for offscreen visualizations so the page stays butter-smooth.
 * Returns a ref that stays current without re-renders.
 */
export function useOnScreen(ref: RefObject<HTMLElement | null>): RefObject<boolean> {
  const visible = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.current = e.isIntersecting
      },
      { rootMargin: '120px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return visible
}

/** ResizeObserver → callback with content-box size (rAF-throttled) */
export function useResize(ref: RefObject<HTMLElement | null>, onSize: (w: number, h: number) => void) {
  const cb = useRef(onSize)
  useEffect(() => {
    cb.current = onSize
  }, [onSize])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const ro = new ResizeObserver((entries) => {
      const e = entries[0]
      if (!e) return
      const w = e.contentRect.width
      const h = e.contentRect.height
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => cb.current(w, h))
    })
    ro.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [ref])
}

/** pause-friendly rAF loop: cb(ts) runs only while `visible.current` is true */
export function useRenderLoop(visible: RefObject<boolean>, cb: (ts: number) => void) {
  const draw = useRef(cb)
  useEffect(() => {
    draw.current = cb
  }, [cb])
  useEffect(() => {
    let raf = 0
    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick)
      if (visible.current && !document.hidden) draw.current(ts)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visible])
}

export const FONT_MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'
