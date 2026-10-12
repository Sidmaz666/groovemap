'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Route } from '../AppShell'
import { GALAXY_POINTS, FAMILY_STATS, familyCenter, familyStat, hashId, rng } from './vizData'
import { useResize } from './viz-utils'
import type { GalaxyPoint } from './vizData'

/**
 * Galaxy3D — the entire dataset as an orbitable 3D constellation.
 * Every pattern is a star; stars cluster into 38 family nebulae arranged
 * on a golden-angle sphere. Color = family, brightness/size = hit density.
 * Drag to orbit, scroll to zoom, hover to name a star, click to open it.
 * Family anchors carry projected HTML labels. Auto-rotates by default.
 */

interface HoverStar {
  p: GalaxyPoint
  x: number
  y: number
}

interface GalaxyApi {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  controls: OrbitControls
  points: THREE.Points
  resize: (w: number, h: number) => void
  reset: () => void
  dispose: () => void
}

export function Galaxy3D({ navigate }: { navigate: (r: Route) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<GalaxyApi | null>(null)
  const labelsRef = useRef<HTMLDivElement | null>(null)
  const navRef = useRef(navigate)
  const [hover, setHover] = useState<HoverStar | null>(null)
  const [spin, setSpin] = useState(true)
  const [boxW, setBoxW] = useState(400)

  useEffect(() => {
    navRef.current = navigate
  }, [navigate])

  useResize(wrapRef, (w) => setBoxW(w))

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    /* ---------- renderer / scene ---------- */
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    } catch {
      // no WebGL — inject an inline fallback (imperative, no re-render needed)
      const fb = document.createElement('div')
      fb.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:1.5rem;text-align:center;'
      fb.textContent = 'WebGL is unavailable in this browser — the 3D galaxy needs it. The rest of the atlas keeps working.'
      fb.style.color = 'rgb(113 113 122)'
      fb.style.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace'
      fb.style.maxWidth = '20rem'
      wrap.appendChild(fb)
      return () => {
        fb.remove()
      }
    }
    renderer.setClearColor(0x09090b, 1)
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    renderer.setPixelRatio(dpr)
    renderer.setSize(wrap.clientWidth, wrap.clientHeight)
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab;'
    wrap.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x09090b, 0.011)
    const camera = new THREE.PerspectiveCamera(55, Math.max(0.1, wrap.clientWidth / Math.max(1, wrap.clientHeight)), 0.1, 500)
    const HOME = new THREE.Vector3(0, 7.5, 30)
    camera.position.copy(HOME)

    /* ---------- family star field ---------- */
    const n = GALAXY_POINTS.length
    const positions = new Float32Array(n * 3)
    const colors = new Float32Array(n * 3)
    const sizes = new Float32Array(n)
    const tmpColor = new THREE.Color()
    GALAXY_POINTS.forEach((p, i) => {
      positions[i * 3] = p.x
      positions[i * 3 + 1] = p.y
      positions[i * 3 + 2] = p.z
      const st = familyStat(p.family)
      tmpColor.setStyle(`hsl(${st.hue}, 75%, 62%)`)
      colors[i * 3] = tmpColor.r
      colors[i * 3 + 1] = tmpColor.g
      colors[i * 3 + 2] = tmpColor.b
      sizes[i] = p.size * 2.3
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    const mat = new THREE.ShaderMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute float size;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (150.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          float a = smoothstep(0.5, 0.06, d);
          gl_FragColor = vec4(vColor, a * 0.95);
        }
      `,
    })
    const points = new THREE.Points(geo, mat)
    scene.add(points)

    /* ---------- starfield backdrop ---------- */
    const sr = rng(hashId('starfield'))
    const sCount = 900
    const sPos = new Float32Array(sCount * 3)
    for (let i = 0; i < sCount; i++) {
      const r = 85 + sr() * 70
      const th = sr() * Math.PI * 2
      const ph = Math.acos(2 * sr() - 1)
      sPos[i * 3] = r * Math.sin(ph) * Math.cos(th)
      sPos[i * 3 + 1] = r * Math.cos(ph)
      sPos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th)
    }
    const sGeo = new THREE.BufferGeometry()
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3))
    const sMat = new THREE.PointsMaterial({ color: 0x9a9aa5, size: 0.9, transparent: true, opacity: 0.45, depthWrite: false })
    const stars = new THREE.Points(sGeo, sMat)
    scene.add(stars)

    /* ---------- central glow ---------- */
    const glowCanvas = document.createElement('canvas')
    glowCanvas.width = 128
    glowCanvas.height = 128
    const gctx = glowCanvas.getContext('2d')
    if (gctx) {
      const grad = gctx.createRadialGradient(64, 64, 2, 64, 64, 64)
      grad.addColorStop(0, 'rgba(163 230 53 / 0.5)')
      grad.addColorStop(0.35, 'rgba(120 180 50 / 0.12)')
      grad.addColorStop(1, 'rgba(0 0 0 / 0)')
      gctx.fillStyle = grad
      gctx.fillRect(0, 0, 128, 128)
    }
    const glowTex = new THREE.CanvasTexture(glowCanvas)
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
    glow.scale.setScalar(24)
    scene.add(glow)

    /* ---------- family anchor labels (projected DOM) ---------- */
    const labelLayer = labelsRef.current
    const labelEls: HTMLDivElement[] = []
    if (labelLayer) {
      for (const f of FAMILY_STATS) {
        const el = document.createElement('div')
        el.style.cssText =
          'position:absolute;top:0;left:0;display:flex;align-items:center;gap:4px;font:600 9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:0.08em;text-transform:uppercase;color:rgb(212 212 220);pointer-events:none;white-space:nowrap;will-change:transform,opacity;text-shadow:0 1px 3px rgba(0,0,0,0.9);'
        const dot = document.createElement('span')
        dot.style.cssText = `width:6px;height:6px;border-radius:9999px;background:${f.color};box-shadow:0 0 6px ${f.color};flex:none;`
        el.appendChild(dot)
        el.appendChild(document.createTextNode(f.label))
        labelLayer.appendChild(el)
        labelEls.push(el)
      }
    }
    const anchorVec = new THREE.Vector3()

    /* ---------- controls ---------- */
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.enablePan = false
    controls.minDistance = 6
    controls.maxDistance = 90
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.55

    /* ---------- interaction ---------- */
    const raycaster = new THREE.Raycaster()
    raycaster.params.Points = { threshold: 1.0 }
    const ndc = new THREE.Vector2()
    let downAt = { x: 0, y: 0, moved: 0 }
    let hoveredIdx = -1

    const onMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(ndc, camera)
      const hits = raycaster.intersectObject(points)
      const idx = hits.length > 0 ? hits[0].index ?? -1 : -1
      hoveredIdx = idx
      renderer.domElement.style.cursor = idx >= 0 ? 'pointer' : 'grab'
      if (idx >= 0) {
        setHover({ p: GALAXY_POINTS[idx], x: e.clientX - rect.left, y: e.clientY - rect.top })
      } else {
        setHover(null)
      }
    }
    const onLeave = () => {
      hoveredIdx = -1
      setHover(null)
    }
    const onDown = (e: PointerEvent) => {
      downAt = { x: e.clientX, y: e.clientY, moved: 0 }
    }
    const onUp = (e: PointerEvent) => {
      const moved = Math.abs(e.clientX - downAt.x) + Math.abs(e.clientY - downAt.y)
      if (moved < 6 && hoveredIdx >= 0) {
        navRef.current({ view: 'pattern', id: GALAXY_POINTS[hoveredIdx].id })
      }
    }
    renderer.domElement.addEventListener('pointermove', onMove)
    renderer.domElement.addEventListener('pointerleave', onLeave)
    renderer.domElement.addEventListener('pointerdown', onDown)
    renderer.domElement.addEventListener('pointerup', onUp)

    /* ---------- loop ---------- */
    let visible = true
    const io = new IntersectionObserver((es) => {
      for (const e of es) visible = e.isIntersecting
    }, { rootMargin: '120px' })
    io.observe(wrap)

    let raf = 0
    const render = () => {
      raf = requestAnimationFrame(render)
      if (!visible || document.hidden) return
      controls.update()
      renderer.render(scene, camera)
      // project family labels
      if (labelLayer) {
        const w = wrap.clientWidth
        const h = wrap.clientHeight
        for (let i = 0; i < FAMILY_STATS.length; i++) {
          const el = labelEls[i]
          const [x, y, z] = familyCenter(FAMILY_STATS[i].key)
          anchorVec.set(x, y + 2.4, z)
          const dist = camera.position.distanceTo(anchorVec)
          anchorVec.project(camera)
          if (anchorVec.z > 1) {
            el.style.opacity = '0'
            continue
          }
          const px = (anchorVec.x * 0.5 + 0.5) * w
          const py = (-anchorVec.y * 0.5 + 0.5) * h
          el.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px) translate(-50%, -100%)`
          const op = Math.max(0, Math.min(0.95, 1.5 - dist / 60))
          el.style.opacity = op.toFixed(2)
        }
      }
    }
    render()

    /* ---------- resize ---------- */
    const onResize = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      camera.aspect = Math.max(0.1, w / Math.max(1, h))
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(wrap)

    apiRef.current = {
      renderer,
      scene,
      camera,
      controls,
      points,
      resize: onResize,
      reset: () => {
        camera.position.copy(HOME)
        controls.target.set(0, 0, 0)
      },
      dispose: () => {
        cancelAnimationFrame(raf)
        io.disconnect()
        ro.disconnect()
        controls.dispose()
        geo.dispose()
        mat.dispose()
        sGeo.dispose()
        sMat.dispose()
        glowTex.dispose()
        glow.material.dispose()
        renderer.domElement.removeEventListener('pointermove', onMove)
        renderer.domElement.removeEventListener('pointerleave', onLeave)
        renderer.domElement.removeEventListener('pointerdown', onDown)
        renderer.domElement.removeEventListener('pointerup', onUp)
        renderer.dispose()
        renderer.domElement.remove()
        for (const el of labelEls) el.remove()
      },
    }

    return () => {
      apiRef.current?.dispose()
      apiRef.current = null
    }
  }, [])

  /* spin toggle → controls */
  useEffect(() => {
    if (apiRef.current) apiRef.current.controls.autoRotate = spin
  }, [spin])

  const resetView = () => apiRef.current?.reset()

  return (
    <div ref={wrapRef} className="relative h-[520px] w-full select-none overflow-hidden rounded-md border border-zinc-800/80 bg-zinc-950/60 sm:h-[600px]">
      <div ref={labelsRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden />
      {hover && (
        <div
          className="pointer-events-none absolute z-10 max-w-60 border border-zinc-700 bg-zinc-950/95 p-2.5 shadow-xl backdrop-blur-sm"
          style={{
            left: Math.min(hover.x + 14, boxW - 240),
            top: Math.max(6, hover.y - 54),
          }}
        >
          <p className="font-mono text-[11px] font-semibold text-zinc-100">{hover.p.title}</p>
          <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: familyStat(hover.p.family).color }} aria-hidden />
            {familyStat(hover.p.family).label} · {hover.p.bpm} bpm · {hover.p.hits} hits
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-lime-400/80">open pattern →</p>
        </div>
      )}
      <div className="absolute left-3 top-3 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setSpin((s) => !s)}
          className={`cursor-pointer border px-2 py-1 font-mono text-[9px] uppercase tracking-widest transition-colors ${
            spin ? 'border-lime-400/60 bg-lime-400/10 text-lime-300' : 'border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200'
          }`}
          aria-pressed={spin}
        >
          {spin ? '◉ orbiting' : '○ paused'}
        </button>
        <button
          type="button"
          onClick={resetView}
          className="cursor-pointer border border-zinc-700 bg-zinc-900/80 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-zinc-400 transition-colors hover:text-zinc-200"
        >
          reset view
        </button>
      </div>
      <p className="pointer-events-none absolute bottom-2 right-3 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
        drag to orbit · scroll to zoom · hover · click
      </p>
    </div>
  )
}
