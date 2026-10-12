'use client'

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { RotateCw } from 'lucide-react'
import type { GroovePattern, InstrumentId } from '@/lib/atlas/types'
import { INSTRUMENTS } from '@/lib/atlas/instruments'

/**
 * DrumKit3D — a PBR studio drum kit, photographed in a dark room.
 *
 * Every piece is built from real drum hardware geometry (lathe-profiled
 * cymbals with hammering ripples, triple-flange hoops, instanced tension
 * rods + lugs, tripod stands with memory locks, kick claws, snare throw-off,
 * hi-hat clutch + pedal + beater, throne, rug) with canvas-generated
 * materials: lacquered walnut shells, brushed chrome, lathed bronze,
 * mylar heads. Lighting = local Environment lightformers + spot with
 * shadows + contact shadows over a subtle reflector floor.
 *
 * Props (unchanged API):
 *   pattern      — GroovePattern; its events drive the hit animations
 *   currentStep  — live playhead step (null when idle)
 *   onPreview?   — fired when a piece is clicked (audition)
 *   className?   — wrapper class
 *
 * Hit system: a ref registry mutated by the module-scope tickRegistry()
 * inside useFrame (react-compiler-safe). Hits flash lime emissive on the
 * exact piece, flinch drums (scale spring), wobble cymbals (rotation
 * springs), lift the hat on open hits, kick the beater and pulse a point
 * light. Percussion voices land on a real auxiliary table (congas,
 * bongos, cowbell, agogô, wood block, claves, triangle, güiro, shakers,
 * tambourine).
 */

/* ------------------------------------------------------------------ */
/* kit layout                                                          */
/* ------------------------------------------------------------------ */

type PieceKind = 'drum' | 'kick' | 'cymbal' | 'hat' | 'block' | 'beater'

type SlotKind = 'drum' | 'cymbal' | 'hat'

interface PieceDef {
  id: string
  kind: SlotKind
  insts: InstrumentId[]
  pos: [number, number, number]
  rot?: [number, number, number]
  radius: number
  depth: number
  label: string
}

const PIECES: PieceDef[] = [
  { id: 'kick',     kind: 'drum',   insts: ['kick'],                             pos: [0, 0.62, 0.15],     rot: [Math.PI / 2, 0, 0], radius: 0.6,  depth: 0.52, label: 'KICK' },
  { id: 'snare',    kind: 'drum',   insts: ['snare', 'rimshot', 'clap'],         pos: [-0.56, 1.04, 0.8],  rot: [0.14, 0, 0.05],     radius: 0.36, depth: 0.17, label: 'SNARE' },
  { id: 'tomHi',    kind: 'drum',   insts: ['tomHi'],                            pos: [-0.35, 1.58, 0.36], rot: [0.44, 0, 0.08],     radius: 0.28, depth: 0.3,  label: 'TOM 1' },
  { id: 'tomMid',   kind: 'drum',   insts: ['tomMid'],                           pos: [0.37, 1.58, 0.36],  rot: [0.44, 0, -0.08],    radius: 0.31, depth: 0.32, label: 'TOM 2' },
  { id: 'tomFloor', kind: 'drum',   insts: ['tomLow'],                           pos: [1.04, 0.98, 0.92],  rot: [0, 0, 0],           radius: 0.42, depth: 0.42, label: 'FLOOR' },
  { id: 'hat',      kind: 'hat',    insts: ['hatClosed', 'hatOpen', 'hatPedal'], pos: [-1.2, 1.38, 0.98],  rot: [0, 0, 0],           radius: 0.36, depth: 0.02, label: 'HI-HAT' },
  { id: 'ride',     kind: 'cymbal', insts: ['ride'],                             pos: [1.46, 1.66, 0.52],  rot: [0.12, 0, -0.16],    radius: 0.54, depth: 0.02, label: 'RIDE' },
  { id: 'crash',    kind: 'cymbal', insts: ['crash'],                            pos: [-1.46, 1.9, 0.34],  rot: [0.18, 0, 0.22],     radius: 0.47, depth: 0.02, label: 'CRASH' },
  { id: 'splash',   kind: 'cymbal', insts: ['splash'],                           pos: [-0.74, 2.1, 0.16],  rot: [0.14, 0, 0.14],     radius: 0.3,  depth: 0.02, label: 'SPLASH' },
]

const PIECE_BY_INST = new Map<InstrumentId, PieceDef>(PIECES.flatMap((p) => p.insts.map((i) => [i, p] as const)))
const KIT_INSTS = new Set<string>(PIECES.flatMap((p) => p.insts))
const PIECE_POS = new Map<string, [number, number, number]>(PIECES.map((p) => [p.id, p.pos]))

/** slots on the auxiliary percussion table, left→right */
const AUX_ROW: [number, number][] = [
  [-1.06, 2.18], [-0.84, 2.22], [-0.62, 2.25], [-0.4, 2.27], [-0.18, 2.28],
  [0.06, 2.28], [0.28, 2.27], [0.5, 2.25], [0.72, 2.22], [0.94, 2.18],
]
const CONGA_SPOTS: [number, number, number][] = [[-1.95, 0, 1.62], [-1.62, 0, 2.1]]
const BONGO_SPOT: [number, number, number] = [1.92, 0, 1.72]
const TABLE_TOP = 0.52

/* ------------------------------------------------------------------ */
/* canvas textures (module scope, built once, SSR-guarded)             */
/* ------------------------------------------------------------------ */

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] | null {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  return ctx ? [c, ctx] : null
}

function toTex(c: HTMLCanvasElement, srgb = true): THREE.Texture {
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 4
  return t
}

/** wood-grain palette — lets each kit finish get its own wrap colorway */
interface WoodPalette {
  top: string
  mid: string
  bottom: string
  /** grain stroke hsl ranges */
  grainH: [number, number]
  grainSat: [number, number]
  grainLight: [number, number]
}

const WOOD_WALNUT: WoodPalette = {
  top: '#42261a', mid: '#301a10', bottom: '#3d2216',
  grainH: [16, 14], grainSat: [34, 22], grainLight: [8, 22],
}

function paintWood(pal: WoodPalette = WOOD_WALNUT): HTMLCanvasElement | null {
  const p = makeCanvas(512, 512)
  if (!p) return null
  const [c, ctx] = p
  const grad = ctx.createLinearGradient(0, 0, 0, 512)
  grad.addColorStop(0, pal.top)
  grad.addColorStop(0.5, pal.mid)
  grad.addColorStop(1, pal.bottom)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 170; i++) {
    const y = Math.random() * 512
    const l = pal.grainLight[0] + Math.random() * pal.grainLight[1]
    ctx.strokeStyle = `hsla(${pal.grainH[0] + Math.random() * pal.grainH[1]}, ${pal.grainSat[0] + Math.random() * pal.grainSat[1]}%, ${l}%, ${0.1 + Math.random() * 0.24})`
    ctx.lineWidth = 0.6 + Math.random() * 2.4
    ctx.beginPath()
    ctx.moveTo(0, y)
    for (let x = 0; x <= 512; x += 32) ctx.lineTo(x, y + Math.sin((x / 512) * Math.PI * (1 + (i % 3)) + i) * (2 + Math.random() * 4))
    ctx.stroke()
  }
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.07})`
    ctx.lineWidth = 3 + Math.random() * 7
    ctx.beginPath()
    ctx.ellipse(Math.random() * 512, Math.random() * 512, 30 + Math.random() * 70, 8 + Math.random() * 14, Math.random(), 0, Math.PI * 2)
    ctx.stroke()
  }
  const sheen = ctx.createLinearGradient(0, 0, 512, 0)
  sheen.addColorStop(0.3, 'rgba(255,255,255,0)')
  sheen.addColorStop(0.42, 'rgba(255,246,230,0.05)')
  sheen.addColorStop(0.58, 'rgba(255,255,255,0)')
  ctx.fillStyle = sheen
  ctx.fillRect(0, 0, 512, 512)
  return c
}

/** brushed chrome streaks (shared by roughness + metalness maps) */
function paintStreaks(base: string, light: string, dark: string): HTMLCanvasElement | null {
  const p = makeCanvas(256, 256)
  if (!p) return null
  const [c, ctx] = p
  ctx.fillStyle = base
  ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 900; i++) {
    const y = Math.random() * 256
    ctx.strokeStyle = Math.random() > 0.5 ? light : dark
    ctx.globalAlpha = 0.03 + Math.random() * 0.12
    ctx.lineWidth = 0.5 + Math.random()
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(256, y + (Math.random() - 0.5) * 2)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  return c
}

/** lathed cymbal alloy — palette drives bronze / bright silver / dark / brass */
interface CymPalette {
  c0: string
  c1: string
  c2: string
  c3: string
  grooveLight: string
  grooveDark: string
  blotch: string
}

const CYM_BRONZE: CymPalette = {
  c0: '#efd795', c1: '#d3ae55', c2: '#a67f34', c3: '#8a6a2a',
  grooveLight: '255,240,200', grooveDark: '60,42,12', blotch: '96,74,30',
}

function paintCymbal(pal: CymPalette = CYM_BRONZE): HTMLCanvasElement | null {
  const p = makeCanvas(512, 512)
  if (!p) return null
  const [c, ctx] = p
  const grad = ctx.createRadialGradient(256, 246, 10, 256, 256, 256)
  grad.addColorStop(0, pal.c0)
  grad.addColorStop(0.45, pal.c1)
  grad.addColorStop(0.85, pal.c2)
  grad.addColorStop(1, pal.c3)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 512)
  for (let r = 18; r < 256; r += 2.2) {
    ctx.strokeStyle = `rgba(${Math.random() > 0.5 ? pal.grooveLight : pal.grooveDark},${0.03 + Math.random() * 0.07})`
    ctx.lineWidth = 0.7 + Math.random() * 1.3
    ctx.beginPath()
    ctx.arc(256, 256, r, 0, Math.PI * 2)
    ctx.stroke()
  }
  for (let i = 0; i < 26; i++) {
    ctx.fillStyle = `rgba(${pal.blotch},${0.04 + Math.random() * 0.06})`
    ctx.beginPath()
    ctx.arc(256 + (Math.random() - 0.5) * 400, 256 + (Math.random() - 0.5) * 400, 6 + Math.random() * 22, 0, Math.PI * 2)
    ctx.fill()
  }
  return c
}

/** mylar head — off-white with scuffs; variant adds the kick logo */
function paintHead(withLogo: boolean): HTMLCanvasElement | null {
  const p = makeCanvas(512, 512)
  if (!p) return null
  const [c, ctx] = p
  const grad = ctx.createRadialGradient(256, 236, 24, 256, 256, 256)
  grad.addColorStop(0, '#f4f1e6')
  grad.addColorStop(0.7, '#e2dbc8')
  grad.addColorStop(1, '#b9b09a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 42; i++) {
    ctx.strokeStyle = `rgba(120,110,90,${0.03 + Math.random() * 0.05})`
    ctx.lineWidth = 0.6 + Math.random()
    ctx.beginPath()
    ctx.arc(256, 256, 40 + Math.random() * 210, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)
    ctx.stroke()
  }
  if (withLogo) {
    ctx.strokeStyle = 'rgba(163,230,53,0.85)'
    ctx.lineWidth = 7
    ctx.beginPath()
    ctx.arc(256, 256, 178, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = '#18181b'
    ctx.font = '700 30px ui-monospace, monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('GROOVE', 256, 236)
    ctx.fillText('MAP', 256, 272)
    ctx.fillStyle = 'rgba(163,230,53,0.9)'
    ctx.fillRect(206, 300, 100, 3)
  }
  return c
}

/** studio rug — charcoal weave, lime border */
function paintRug(): HTMLCanvasElement | null {
  const p = makeCanvas(512, 512)
  if (!p) return null
  const [c, ctx] = p
  ctx.fillStyle = '#131316'
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 5200; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.018)' : 'rgba(0,0,0,0.05)'
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 1)
  }
  ctx.strokeStyle = 'rgba(163,230,53,0.22)'
  ctx.lineWidth = 10
  roundRect(ctx, 26, 26, 460, 460, 18)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(163,230,53,0.1)'
  ctx.lineWidth = 3
  roundRect(ctx, 46, 46, 420, 420, 12)
  ctx.stroke()
  return c
}

/** stage floor — near-black lacquer: baked warm light pool + faint pseudo-reflection streaks */
function paintFloor(): HTMLCanvasElement | null {
  const p = makeCanvas(512, 512)
  if (!p) return null
  const [c, ctx] = p
  ctx.fillStyle = '#0c0c0f'
  ctx.fillRect(0, 0, 512, 512)
  const pool = ctx.createRadialGradient(256, 300, 30, 256, 300, 310)
  pool.addColorStop(0, 'rgba(255,240,214,0.11)')
  pool.addColorStop(0.5, 'rgba(255,240,214,0.04)')
  pool.addColorStop(1, 'rgba(255,240,214,0)')
  ctx.fillStyle = pool
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 26; i++) {
    const x = 60 + Math.random() * 392
    const w = 3 + Math.random() * 14
    const g = ctx.createLinearGradient(0, 170, 0, 480)
    g.addColorStop(0, `rgba(190,200,215,${0.015 + Math.random() * 0.05})`)
    g.addColorStop(1, 'rgba(190,200,215,0)')
    ctx.fillStyle = g
    ctx.fillRect(x, 170, w, 310)
  }
  const lime = ctx.createRadialGradient(256, 215, 8, 256, 215, 160)
  lime.addColorStop(0, 'rgba(163,230,53,0.05)')
  lime.addColorStop(1, 'rgba(163,230,53,0)')
  ctx.fillStyle = lime
  ctx.fillRect(0, 0, 512, 512)
  return c
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/* ------------------------------------------------------------------ */
/* shared geometries (module scope, built once)                        */
/* ------------------------------------------------------------------ */

/** triple-flange hoop profile */
function hoopGeometry(R: number): THREE.LatheGeometry {
  const pts = [
    new THREE.Vector2(R - 0.007, -0.004),
    new THREE.Vector2(R + 0.002, 0.007),
    new THREE.Vector2(R + 0.011, 0.018),
    new THREE.Vector2(R + 0.013, 0.027),
    new THREE.Vector2(R + 0.005, 0.022),
    new THREE.Vector2(R - 0.002, 0.011),
  ]
  return new THREE.LatheGeometry(pts, 48)
}

/** cymbal with bell, bow curve and hammering ripples */
function cymbalGeometry(R: number, bell = 0.34, bellH = 0.11): THREE.LatheGeometry {
  const pts: THREE.Vector2[] = [new THREE.Vector2(0.012, bellH * R)]
  const NB = 10
  for (let i = 1; i <= NB; i++) {
    const t = i / NB
    pts.push(new THREE.Vector2(0.012 * R + (bell * R - 0.012 * R) * t, bellH * R * (1 - t ** 1.6) + 0.004 * R * t))
  }
  const NB2 = 14
  for (let i = 1; i <= NB2; i++) {
    const t = i / NB2
    pts.push(new THREE.Vector2(bell * R + (R - bell * R) * t, -(t ** 1.7) * 0.055 * R + Math.sin(t * Math.PI) * 0.01 * R))
  }
  pts.push(new THREE.Vector2(R * 1.004, -0.042 * R))
  const geo = new THREE.LatheGeometry(pts, 84)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const r = Math.hypot(x, z)
    const a = Math.atan2(z, x)
    const ripple = Math.sin(a * 9 + r * 34) * Math.sin(a * 5 + 1.1) * 0.0038 * R * Math.sin(Math.min(1, r / Math.max(0.01, R)) * Math.PI)
    pos.setY(i, pos.getY(i) + ripple)
  }
  geo.computeVertexNormals()
  return geo
}

function discGeometry(R: number, segs = 40): THREE.CircleGeometry {
  return new THREE.CircleGeometry(R, segs)
}

/** hand-drum barrel profile (congas/bongos) */
function barrelGeometry(rTop: number, rBot: number, h: number): THREE.LatheGeometry {
  const pts = [
    new THREE.Vector2(rBot * 0.86, -h / 2),
    new THREE.Vector2(rBot * 1.02, -h * 0.28),
    new THREE.Vector2(Math.max(rTop, rBot) * 1.03, 0),
    new THREE.Vector2(rTop * 1.0, h * 0.3),
    new THREE.Vector2(rTop * 0.99, h / 2),
  ]
  return new THREE.LatheGeometry(pts, 28)
}

const GEO = {
  hoop: {
    kick: hoopGeometry(0.6),
    snare: hoopGeometry(0.36),
    tomHi: hoopGeometry(0.28),
    tomMid: hoopGeometry(0.31),
    tomFloor: hoopGeometry(0.42),
  },
  cymbal: {
    ride: cymbalGeometry(0.54, 0.3, 0.1),
    crash: cymbalGeometry(0.47, 0.36, 0.12),
    splash: cymbalGeometry(0.3, 0.4, 0.15),
    hatTop: cymbalGeometry(0.36, 0.5, 0.14),
  },
  disc: {
    kick: discGeometry(0.588),
    snare: discGeometry(0.348),
    tomHi: discGeometry(0.268),
    tomMid: discGeometry(0.298),
    tomFloor: discGeometry(0.408),
    hat: discGeometry(0.356, 36),
    congaHi: discGeometry(0.145, 24),
    congaLo: discGeometry(0.165, 24),
    bongoHi: discGeometry(0.1, 20),
    bongoLo: discGeometry(0.11, 20),
  },
  barrel: {
    congaHi: barrelGeometry(0.145, 0.165, 0.36),
    congaLo: barrelGeometry(0.165, 0.185, 0.4),
    bongoHi: barrelGeometry(0.1, 0.112, 0.2),
    bongoLo: barrelGeometry(0.11, 0.122, 0.22),
  },
}

/* ------------------------------------------------------------------ */
/* shared materials (module scope, built once)                         */
/* ------------------------------------------------------------------ */

const A = (() => {
  const woodC = paintWood()
  const woodTex = woodC ? toTex(woodC) : null
  if (woodTex) woodTex.repeat.set(2.2, 1)

  const roughC = paintStreaks('#7a7a7a', '#a5a5a5', '#4f4f4f')
  const metalC = paintStreaks('#e9e9e9', '#ffffff', '#c4c4c4')
  const roughTex = roughC ? toTex(roughC, false) : null
  const metalTex = metalC ? toTex(metalC, false) : null

  const cymC = paintCymbal()
  const cymTex = cymC ? toTex(cymC) : null

  const headC = paintHead(false)
  const headTex = headC ? toTex(headC) : null
  const kickHeadC = paintHead(true)
  const kickHeadTex = kickHeadC ? toTex(kickHeadC) : null

  const rugC = paintRug()
  const rugTex = rugC ? toTex(rugC) : null

  const floorC = paintFloor()
  const floorTex = floorC ? toTex(floorC) : null

  const chrome = new THREE.MeshStandardMaterial({
    color: '#d6dade',
    metalness: 1,
    roughness: 0.3,
    roughnessMap: roughTex,
    metalnessMap: metalTex,
    envMapIntensity: 1.35,
    side: THREE.DoubleSide,
  })
  const darkMetal = new THREE.MeshStandardMaterial({ color: '#2b2d31', metalness: 0.85, roughness: 0.42, envMapIntensity: 1.0 })
  const shell = new THREE.MeshPhysicalMaterial({
    color: woodTex ? '#ffffff' : '#3a2216',
    map: woodTex ?? undefined,
    metalness: 0.05,
    roughness: 0.32,
    clearcoat: 0.75,
    clearcoatRoughness: 0.18,
    envMapIntensity: 1.15,
  })
  const head = new THREE.MeshStandardMaterial({
    color: headTex ? '#ffffff' : '#e5dfcc',
    map: headTex ?? undefined,
    metalness: 0.02,
    roughness: 0.48,
    envMapIntensity: 0.7,
  })
  const kickHead = head.clone()
  if (kickHeadTex) kickHead.map = kickHeadTex
  const cymbal = new THREE.MeshStandardMaterial({
    color: cymTex ? '#ffffff' : '#c8a44e',
    map: cymTex ?? undefined,
    metalness: 1,
    roughness: 0.34,
    envMapIntensity: 1.5,
    side: THREE.DoubleSide,
  })
  const felt = new THREE.MeshStandardMaterial({ color: '#8f2d2d', roughness: 0.9, metalness: 0 })
  const wood = new THREE.MeshStandardMaterial({ color: '#7a5a34', roughness: 0.6, metalness: 0.05 })
  const hide = new THREE.MeshStandardMaterial({ color: '#d9cfae', roughness: 0.7, metalness: 0 })
  const rug = new THREE.MeshStandardMaterial({ color: '#ffffff', map: rugTex ?? undefined, transparent: true, roughness: 0.97, metalness: 0 })
  const floor = new THREE.MeshStandardMaterial({
    color: '#e8e8ee',
    map: floorTex ?? undefined,
    metalness: 0.72,
    roughness: 0.3,
    envMapIntensity: 0.55,
  })
  const brass = new THREE.MeshStandardMaterial({ color: '#b08a3e', metalness: 0.95, roughness: 0.38, envMapIntensity: 1.2 })
  return { chrome, darkMetal, shell, head, kickHead, cymbal, felt, wood, hide, rug, floor, brass }
})()

const LIME = '#a3e635'
const LIME_COLOR = new THREE.Color(LIME)

/* ------------------------------------------------------------------ */
/* kit finishes — one visual colorway per sample kit                    */
/* ------------------------------------------------------------------ */

const CYM_SILVER: CymPalette = {
  c0: '#f4f6f4', c1: '#d9ddda', c2: '#a9aeab', c3: '#84898a',
  grooveLight: '255,255,255', grooveDark: '70,74,76', blotch: '110,116,118',
}
const CYM_DARK: CymPalette = {
  c0: '#b99a55', c1: '#93773a', c2: '#6b5426', c3: '#52400f',
  grooveLight: '235,215,160', grooveDark: '30,22,6', blotch: '54,42,16',
}
const CYM_BRASS: CymPalette = {
  c0: '#f0dc9a', c1: '#d8b45c', c2: '#b08a3e', c3: '#8f6e2c',
  grooveLight: '255,242,205', grooveDark: '70,50,14', blotch: '110,84,34',
}

const WOOD_WHITE_PEARL: WoodPalette = {
  top: '#efe9dc', mid: '#e2dbcb', bottom: '#d8d0bd',
  grainH: [40, 10], grainSat: [10, 10], grainLight: [70, 18],
}
const WOOD_NATURAL: WoodPalette = {
  top: '#8a6440', mid: '#6f4e30', bottom: '#7c5a38',
  grainH: [24, 10], grainSat: [30, 18], grainLight: [14, 22],
}
const WOOD_BLACK: WoodPalette = {
  top: '#17171a', mid: '#0e0e11', bottom: '#131316',
  grainH: [220, 20], grainSat: [4, 6], grainLight: [10, 12],
}
const WOOD_GRAPHITE: WoodPalette = {
  top: '#3a3d42', mid: '#2a2c30', bottom: '#33363b',
  grainH: [210, 20], grainSat: [4, 6], grainLight: [16, 16],
}
const WOOD_CHAMPAGNE: WoodPalette = {
  top: '#c8a86a', mid: '#b3904f', bottom: '#c19d5c',
  grainH: [38, 12], grainSat: [26, 14], grainLight: [34, 18],
}
const WOOD_CREAM: WoodPalette = {
  top: '#e6d9b8', mid: '#d6c69e', bottom: '#ddcda7',
  grainH: [42, 10], grainSat: [20, 12], grainLight: [55, 16],
}
const WOOD_EBONY: WoodPalette = {
  top: '#232018', mid: '#171510', bottom: '#1d1a13',
  grainH: [45, 10], grainSat: [8, 8], grainLight: [12, 10],
}
const WOOD_MAHOGANY: WoodPalette = {
  top: '#5e2a1c', mid: '#471e13', bottom: '#54251a',
  grainH: [12, 10], grainSat: [38, 18], grainLight: [10, 18],
}

interface KitFinish {
  name: string
  shell: WoodPalette
  /** material color multiplier over the shell texture */
  shellTint: string
  cymbal: CymPalette
  cymbalTint: string
  /** polished hardware color (hoops, lugs, stands) */
  hardware: string
  /** matte/dark metal (pedals, memory locks) */
  darkHardware: string
  felt: string
  rugTint: string
}

/** professional wrap colorways — one per sample kit, keyed by kit id */
const KIT_FINISHES: Record<string, KitFinish> = {
  studio: {
    name: 'Walnut Wine',
    shell: WOOD_WALNUT, shellTint: '#ffffff',
    cymbal: CYM_BRONZE, cymbalTint: '#ffffff',
    hardware: '#d6dade', darkHardware: '#2b2d31',
    felt: '#8f2d2d', rugTint: '#ffffff',
  },
  studioBright: {
    name: 'White Pearl',
    shell: WOOD_WHITE_PEARL, shellTint: '#ffffff',
    cymbal: CYM_SILVER, cymbalTint: '#ffffff',
    hardware: '#e4e8ec', darkHardware: '#3a3d42',
    felt: '#c9c4b4', rugTint: '#f2f0ea',
  },
  studioRoom: {
    name: 'Natural Oak',
    shell: WOOD_NATURAL, shellTint: '#ffffff',
    cymbal: CYM_BRONZE, cymbalTint: '#e8ddc8',
    hardware: '#b9bdc2', darkHardware: '#232527',
    felt: '#5c5142', rugTint: '#d8d2c4',
  },
  analog808: {
    name: 'Onion Black',
    shell: WOOD_BLACK, shellTint: '#ffffff',
    cymbal: CYM_DARK, cymbalTint: '#ffffff',
    hardware: '#5a5e64', darkHardware: '#17181b',
    felt: '#3f3f45', rugTint: '#8c8c92',
  },
  tr808Tape: {
    name: 'Aged Black',
    shell: WOOD_BLACK, shellTint: '#c9bfa8',
    cymbal: CYM_DARK, cymbalTint: '#d8c8a8',
    hardware: '#8a8578', darkHardware: '#1c1a16',
    felt: '#4a4132', rugTint: '#a89c84',
  },
  analog909: {
    name: 'Anthracite',
    shell: WOOD_GRAPHITE, shellTint: '#ffffff',
    cymbal: CYM_BRONZE, cymbalTint: '#dfe3e8',
    hardware: '#cfd4d9', darkHardware: '#222428',
    felt: '#2f3237', rugTint: '#b9bcc2',
  },
  tr909Club: {
    name: 'Blackout',
    shell: WOOD_GRAPHITE, shellTint: '#8f939a',
    cymbal: CYM_DARK, cymbalTint: '#cfd4d9',
    hardware: '#6a6f75', darkHardware: '#101114',
    felt: '#1e2023', rugTint: '#7d8187',
  },
  tight: {
    name: 'Champagne Metallic',
    shell: WOOD_CHAMPAGNE, shellTint: '#ffffff',
    cymbal: CYM_SILVER, cymbalTint: '#f2ead8',
    hardware: '#e8ecf0', darkHardware: '#33363a',
    felt: '#b3924a', rugTint: '#efe6d2',
  },
  dusty: {
    name: 'Cream Vintage',
    shell: WOOD_CREAM, shellTint: '#ffffff',
    cymbal: CYM_BRASS, cymbalTint: '#ffffff',
    hardware: '#c2a25c', darkHardware: '#3b342a',
    felt: '#9c8448', rugTint: '#e8dfc8',
  },
  synth: {
    name: 'Ebony',
    shell: WOOD_EBONY, shellTint: '#ffffff',
    cymbal: CYM_SILVER, cymbalTint: '#ffffff',
    hardware: '#d6dade', darkHardware: '#26282c',
    felt: '#6d2f2f', rugTint: '#cfcbc2',
  },
  perc: {
    name: 'Mahogany Burst',
    shell: WOOD_MAHOGANY, shellTint: '#ffffff',
    cymbal: CYM_BRONZE, cymbalTint: '#ffffff',
    hardware: '#d6dade', darkHardware: '#2b2d31',
    felt: '#a3562d', rugTint: '#efe2d2',
  },
}

/** painted-texture caches so finish swaps never re-rasterize twice */
const shellTexCache = new Map<string, THREE.Texture | null>()
const cymTexCacheB = new Map<string, THREE.Texture | null>()

function shellTextureFor(f: KitFinish): THREE.Texture | null {
  const key = f.shell === WOOD_WALNUT ? 'walnut' : `${f.name}-shell`
  if (!shellTexCache.has(key)) {
    const c = paintWood(f.shell)
    const t = c ? toTex(c) : null
    if (t) t.repeat.set(2.2, 1)
    shellTexCache.set(key, t)
  }
  return shellTexCache.get(key) ?? null
}

function cymbalTextureFor(f: KitFinish): THREE.Texture | null {
  const key = f.cymbal === CYM_BRONZE ? 'bronze' : `${f.name}-cym`
  if (!cymTexCacheB.has(key)) {
    const c = paintCymbal(f.cymbal)
    cymTexCacheB.set(key, c ? toTex(c) : null)
  }
  return cymTexCacheB.get(key) ?? null
}

let appliedFinishName = 'Walnut Wine'

/** swap every shared material to a kit's colorway — instant, no re-mount */
export function setKitFinish(kitId: string | null | undefined) {
  const f = (kitId && KIT_FINISHES[kitId]) || KIT_FINISHES.studio
  if (appliedFinishName === f.name) return
  appliedFinishName = f.name
  const shellTex = shellTextureFor(f)
  A.shell.map = shellTex
  A.shell.color.set(f.shellTint)
  A.shell.needsUpdate = true
  propagateFinish(A.shell)
  const cymTex = cymbalTextureFor(f)
  A.cymbal.map = cymTex
  A.cymbal.color.set(f.cymbalTint)
  A.cymbal.needsUpdate = true
  propagateFinish(A.cymbal)
  A.chrome.color.set(f.hardware)
  A.darkMetal.color.set(f.darkHardware)
  A.felt.color.set(f.felt)
  A.rug.color.set(f.rugTint)
}

export function currentKitFinishName(): string {
  return appliedFinishName
}

/** pure lookup for labels — render-safe (no module mutation read) */
export function finishNameFor(kitId: string | null | undefined): string {
  return (kitId && KIT_FINISHES[kitId]?.name) || appliedFinishName
}

/* ------------------------------------------------------------------ */
/* venue — the 3D room adapts to the audio room ambience                */
/* ------------------------------------------------------------------ */

interface VenueDef {
  bg: string
  fogNear: number
  fogFar: number
  exposure: number
}

const VENUES: Record<string, VenueDef> = {
  close: { bg: '#08080a', fogNear: 7, fogFar: 16, exposure: 1.12 },
  studio: { bg: '#0a0908', fogNear: 7, fogFar: 17, exposure: 1.16 },
  room: { bg: '#0c0a07', fogNear: 7.5, fogFar: 18, exposure: 1.22 },
  club: { bg: '#050505', fogNear: 5, fogFar: 12, exposure: 1.0 },
  hall: { bg: '#0d0b07', fogNear: 9, fogFar: 21, exposure: 1.26 },
  plate: { bg: '#070708', fogNear: 7, fogFar: 15, exposure: 1.1 },
  arena: { bg: '#060607', fogNear: 8, fogFar: 23, exposure: 1.06 },
}

/* ------------------------------------------------------------------ */
/* hit registry (imperative, react-compiler-safe)                      */
/* ------------------------------------------------------------------ */

interface HitEntry {
  time: number
  vel: number
  open?: boolean
}

interface Body {
  obj: THREE.Group
  kind: PieceKind
  mat: THREE.MeshStandardMaterial
  baseRotX: number
  baseRotZ: number
  /** hat: the floating top-cymbal group */
  top?: THREE.Group
  topY?: number
}

interface Registry {
  hits: Map<string, HitEntry>
  bodies: Map<string, Body>
  glow: { pos: [number, number, number] | null; time: number }
}

type RegistryRef = React.RefObject<Registry>

const DUR: Record<PieceKind, number> = { drum: 300, kick: 300, cymbal: 460, hat: 380, block: 240, beater: 240 }

/** module-scope tick — mutates the registry outside React's ownership model */
function tickRegistry(registry: Registry, now: number) {
  for (const [id, body] of registry.bodies) {
    const hit = registry.hits.get(id)
    if (!hit) continue
    const dur = body.kind === 'beater' ? DUR.beater : DUR[body.kind]
    const k = (now - hit.time) / dur
    if (k >= 1) {
      registry.hits.delete(id)
      body.obj.scale.set(1, 1, 1)
      body.obj.rotation.x = body.baseRotX
      body.obj.rotation.z = body.baseRotZ
      if (body.top && body.topY !== undefined) body.top.position.y = body.topY
      body.mat.emissiveIntensity = 0
      continue
    }
    const decay = (1 - k) ** 1.5
    const velF = 0.35 + 0.65 * (hit.vel / 127)
    if (body.kind === 'cymbal') {
      const w = Math.sin(k * Math.PI * 6) * decay
      const w2 = Math.sin(k * Math.PI * 4.4 + 1.2) * decay
      body.obj.rotation.x = body.baseRotX + 0.34 * w * velF
      body.obj.rotation.z = body.baseRotZ + 0.17 * w2 * velF
    } else if (body.kind === 'hat') {
      const w = Math.sin(k * Math.PI * 7) * decay
      if (body.top) body.obj.rotation.x = body.baseRotX + 0.12 * w * velF
      if (body.top && body.topY !== undefined) {
        body.top.position.y = body.topY + (hit.open ? 0.055 * Math.min(1, decay * 4) : 0.012 * decay)
      }
    } else if (body.kind === 'beater') {
      const strike = Math.sin(Math.min(1, k * 2.4) * Math.PI)
      body.obj.rotation.x = body.baseRotX - 0.5 * strike * (1 - k * 0.4)
    } else if (body.kind === 'block' || body.kind === 'kick') {
      const boost = 1 + 0.09 * decay * velF
      body.obj.scale.set(boost, 1 / boost ** 0.45, boost)
      if (body.kind === 'kick') body.obj.rotation.x = body.baseRotX + 0.02 * Math.sin(k * Math.PI * 4) * decay
    } else {
      const boost = 1 + 0.11 * decay * velF
      body.obj.scale.set(boost, 1 / boost ** 0.4, boost)
    }
    body.mat.emissiveIntensity = 2.4 * decay * velF
  }
}

/** flashes + flinches pieces when the playhead fires them; pulses the glow light */
function Animator({ registryRef }: { registryRef: RegistryRef }) {
  const light = useRef<THREE.PointLight>(null)
  useFrame(() => {
    const registry = registryRef.current
    if (!registry) return
    tickRegistry(registry, performance.now())
    if (light.current) {
      const g = registry.glow
      const dt = (performance.now() - g.time) / 1000
      const inten = g.pos ? Math.max(0, 22 * Math.exp(-6.5 * dt)) : 0
      light.current.intensity = inten
      if (g.pos && inten > 0.02) light.current.position.set(g.pos[0], g.pos[1] + 0.14, g.pos[2] + 0.2)
    }
  })
  return <pointLight ref={light} intensity={0} color={LIME} distance={3.4} decay={2} />
}

/* ------------------------------------------------------------------ */
/* small shared hardware helpers                                       */
/* ------------------------------------------------------------------ */

/** flash-capable clone of a shared material */
/** live flash-clones (WeakRef'd, pruned on propagation) so finish swaps reach them */
const flashClones: { ref: WeakRef<THREE.MeshStandardMaterial>; base: THREE.MeshStandardMaterial }[] = []

function registerFlashClone(m: THREE.MeshStandardMaterial, base: THREE.MeshStandardMaterial) {
  flashClones.push({ ref: new WeakRef(m), base })
}

/** push a base material's finish (map + color) onto every live clone of it */
function propagateFinish(base: THREE.MeshStandardMaterial) {
  for (let i = flashClones.length - 1; i >= 0; i--) {
    const e = flashClones[i]
    const m = e.ref.deref()
    if (!m) {
      flashClones.splice(i, 1)
      continue
    }
    if (e.base !== base) continue
    m.map = base.map
    m.color.copy(base.color)
    m.needsUpdate = true
  }
}

function useFlashMat(base: THREE.MeshStandardMaterial): THREE.MeshStandardMaterial {
  return useMemo(() => {
    const m = base.clone()
    m.emissive = LIME_COLOR
    m.emissiveIntensity = 0
    registerFlashClone(m, base)
    return m
  }, [base])
}

/** instanced cylinders/boxes arranged by matrix — one draw call */
function Instances({
  geometry,
  material,
  matrices,
  castShadow,
}: {
  geometry: THREE.BufferGeometry
  material: THREE.Material
  matrices: THREE.Matrix4[]
  castShadow?: boolean
}) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m))
    mesh.instanceMatrix.needsUpdate = true
  }, [matrices])
  return <instancedMesh ref={ref} args={[geometry, material, matrices.length]} castShadow={castShadow} />
}

const dummy = new THREE.Object3D()

/** lugs + tension rods + washers around a drum shell, instanced */
function ShellHardware({ radius, depth, count = 8, offset = 0 }: { radius: number; depth: number; count?: number; offset?: number }) {
  const lugGeo = useMemo(() => new THREE.BoxGeometry(0.032, depth * 0.46, 0.042), [depth])
  const rodGeo = useMemo(() => new THREE.CylinderGeometry(0.0065, 0.0065, depth * 0.6, 6), [depth])
  const washerGeo = useMemo(() => new THREE.CylinderGeometry(0.014, 0.014, 0.008, 10), [])

  const { lugs, rods, washers } = useMemo(() => {
    const lugs: THREE.Matrix4[] = []
    const rods: THREE.Matrix4[] = []
    const washers: THREE.Matrix4[] = []
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + offset
      const x = Math.cos(a) * radius
      const z = Math.sin(a) * radius
      dummy.position.set(x * 1.0, 0, z * 1.0)
      dummy.rotation.set(0, -a, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      lugs.push(dummy.matrix.clone())
      dummy.position.set(Math.cos(a) * radius * 1.045, depth * 0.16, Math.sin(a) * radius * 1.045)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      rods.push(dummy.matrix.clone())
      dummy.position.set(Math.cos(a) * radius * 1.045, depth / 2 + 0.014, Math.sin(a) * radius * 1.045)
      dummy.updateMatrix()
      washers.push(dummy.matrix.clone())
    }
    return { lugs, rods, washers }
  }, [radius, depth, count, offset])

  return (
    <group>
      <Instances geometry={lugGeo} material={A.chrome} matrices={lugs} castShadow />
      <Instances geometry={rodGeo} material={A.chrome} matrices={rods} />
      <Instances geometry={washerGeo} material={A.chrome} matrices={washers} />
    </group>
  )
}

/** claw hooks gripping the kick's front hoop, instanced */
function KickClaws({ radius, depth, count }: { radius: number; depth: number; count: number }) {
  const clawGeo = useMemo(() => new THREE.BoxGeometry(0.018, 0.034, 0.06), [])
  const matrices = useMemo(() => {
    const out: THREE.Matrix4[] = []
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      dummy.position.set(Math.cos(a) * (radius + 0.028), depth / 2 + 0.012, Math.sin(a) * (radius + 0.028))
      dummy.rotation.set(0, -a, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      out.push(dummy.matrix.clone())
    }
    return out
  }, [radius, depth, count])
  return <Instances geometry={clawGeo} material={A.chrome} matrices={matrices} castShadow />
}

/** tripod stand with memory lock; optional tilter plate on top */
function Stand({ x, z, topY, boom = false, tilt = 0 }: { x: number; z: number; topY: number; boom?: boolean; tilt?: number }) {
  const legH = Math.min(0.5, topY * 0.62)
  return (
    <group position={[x, 0, z]}>
      {/* tripod */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + Math.PI / 6
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0.11, legH / 2 - 0.02, 0]} rotation={[0, 0, -0.62]} castShadow>
              <cylinderGeometry args={[0.011, 0.014, legH, 8]} />
              <primitive object={A.darkMetal} attach="material" />
            </mesh>
            <mesh position={[0.2, 0.012, 0]}>
              <cylinderGeometry args={[0.016, 0.02, 0.024, 8]} />
              <primitive object={A.chrome} attach="material" />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.024, 0.028, 0.05, 10]} />
        <primitive object={A.chrome} attach="material" />
      </mesh>
      {/* lower tube + memory lock */}
      <mesh position={[0, (topY - 0.14) / 2 + 0.05, 0]}>
        <cylinderGeometry args={[0.019, 0.019, topY - 0.14, 10]} />
        <primitive object={A.chrome} attach="material" />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.023, 0.023, 0.024, 10]} />
        <primitive object={A.darkMetal} attach="material" />
      </mesh>
      {/* upper tube + tilter */}
      <mesh position={[0, topY - 0.07, 0]}>
        <cylinderGeometry args={[0.0135, 0.0135, 0.18, 10]} />
        <primitive object={A.chrome} attach="material" />
      </mesh>
      <mesh position={[0, topY - 0.005, 0]} rotation={[boom ? tilt : 0, 0, boom ? 0 : tilt]}>
        <boxGeometry args={[0.055, 0.02, 0.055]} />
        <primitive object={A.darkMetal} attach="material" />
      </mesh>
      <mesh position={[0, topY + 0.015, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.018, 10]} />
        <primitive object={A.felt} attach="material" />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* pieces                                                              */
/* ------------------------------------------------------------------ */

function DrumPiece({ def, registryRef, onPreview }: { def: PieceDef; registryRef: RegistryRef; onPreview?: (i: InstrumentId) => void }) {
  const group = useRef<THREE.Group>(null)
  const shellMat = useFlashMat(A.shell)
  // register after mount so group.current exists (Body created here — hook-safe)
  useEffect(() => {
    const reg = registryRef.current
    if (!group.current || !reg) return
    reg.bodies.set(def.id, {
      obj: group.current,
      kind: 'drum',
      mat: shellMat,
      baseRotX: def.rot?.[0] ?? 0,
      baseRotZ: def.rot?.[2] ?? 0,
    })
    return () => {
      reg.bodies.delete(def.id)
    }
  }, [shellMat, def, registryRef])

  const hoop = GEO.hoop[def.id as keyof typeof GEO.hoop]
  const disc = GEO.disc[def.id as keyof typeof GEO.disc]
  const headMat = def.id === 'kick' ? A.kickHead : A.head
  const lugCount = def.radius > 0.5 ? 10 : def.radius > 0.4 ? 8 : 6

  return (
    <group
      ref={group}
      position={def.pos}
      rotation={def.rot}
      onClick={(e) => {
        e.stopPropagation()
        onPreview?.(def.insts[0])
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* shell */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[def.radius, def.radius, def.depth, 40, 1, true]} />
        <primitive object={shellMat} attach="material" />
      </mesh>
      {/* batter head */}
      <mesh geometry={disc} material={headMat} position={[0, def.depth / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      {def.id === 'kick' && (
        <mesh position={[0, -def.depth / 2 - 0.002, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <primitive object={GEO.disc.kick} attach="geometry" />
          <primitive object={A.kickHead} attach="material" />
        </mesh>
      )}
      {/* hoops */}
      {hoop && (
        <>
          <mesh geometry={hoop} material={A.chrome} position={[0, def.depth / 2 + 0.006, 0]} castShadow />
          <mesh geometry={hoop} material={A.chrome} position={[0, -def.depth / 2 - 0.006, 0]} />
        </>
      )}
      <ShellHardware radius={def.radius} depth={def.depth} count={lugCount} offset={Math.PI / lugCount} />
      {/* kick hoop claws over the front hoop */}
      {def.id === 'kick' && <KickClaws radius={def.radius} depth={def.depth} count={lugCount} />}
      {/* kick spurs */}
      {def.id === 'kick' &&
        [-1, 1].map((s) => (
          <group key={s} position={[s * (def.radius + 0.02), -0.12, 0]} rotation={[0, 0, s * -0.55]}>
            <mesh position={[0, 0.14, 0]}>
              <cylinderGeometry args={[0.012, 0.014, 0.42, 8]} />
              <primitive object={A.chrome} attach="material" />
            </mesh>
            <mesh position={[0, -0.12, 0]}>
              <sphereGeometry args={[0.028, 12, 10]} />
              <primitive object={A.darkMetal} attach="material" />
            </mesh>
          </group>
        ))}
      {/* floor tom legs */}
      {def.id === 'tomFloor' &&
        [0, 2.1, 4.2].map((a) => {
          const rad = (a * Math.PI) / 180
          return (
            <mesh key={a} position={[Math.cos(rad) * (def.radius + 0.1), -def.depth / 2 - 0.3, Math.sin(rad) * (def.radius + 0.1)]}>
              <cylinderGeometry args={[0.009, 0.009, 0.66, 6]} />
              <primitive object={A.chrome} attach="material" />
            </mesh>
          )
        })}
      {/* snare throw-off + butt plate */}
      {def.id === 'snare' && (
        <group position={[def.radius + 0.012, -0.01, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.02, 0.075, 0.06]} />
            <primitive object={A.chrome} attach="material" />
          </mesh>
          <mesh position={[0.012, 0.03, 0]} rotation={[0, 0, -0.5]}>
            <boxGeometry args={[0.012, 0.07, 0.016]} />
            <primitive object={A.chrome} attach="material" />
          </mesh>
          <mesh position={[0, -def.depth * 0.32, 0]}>
            <boxGeometry args={[0.016, 0.03, 0.05]} />
            <primitive object={A.chrome} attach="material" />
          </mesh>
        </group>
      )}
    </group>
  )
}

function CymbalPiece({ def, registryRef, onPreview }: { def: PieceDef; registryRef: RegistryRef; onPreview?: (i: InstrumentId) => void }) {
  const group = useRef<THREE.Group>(null)
  const mat = useFlashMat(A.cymbal)
  const baseRotX = def.rot?.[0] ?? 0
  const baseRotZ = def.rot?.[2] ?? 0
  useEffect(() => {
    const reg = registryRef.current
    if (!group.current || !reg) return
    reg.bodies.set(def.id, { obj: group.current, kind: 'cymbal', mat, baseRotX, baseRotZ })
    return () => {
      reg.bodies.delete(def.id)
    }
  }, [mat, baseRotX, baseRotZ, def, registryRef])

  const geo = GEO.cymbal[def.id as keyof typeof GEO.cymbal]

  return (
    <group>
      <Stand x={def.pos[0]} z={def.pos[2]} topY={def.pos[1] - 0.06} tilt={baseRotZ} />
      <group
        ref={group}
        position={def.pos}
        rotation={def.rot}
        onClick={(e) => {
          e.stopPropagation()
          onPreview?.(def.insts[0])
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <mesh geometry={geo} material={mat} castShadow />
        {/* wing nut + sleeve */}
        <mesh position={[0, 0.028, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.03, 10]} />
          <primitive object={A.chrome} attach="material" />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.036, 0.008, 0.008]} />
          <primitive object={A.chrome} attach="material" />
        </mesh>
      </group>
    </group>
  )
}

function HatPiece({ def, registryRef, onPreview }: { def: PieceDef; registryRef: RegistryRef; onPreview?: (i: InstrumentId) => void }) {
  const top = useRef<THREE.Group>(null)
  const mat = useFlashMat(A.cymbal)
  const { pos } = def
  const openGap = 0.052
  const topBaseY = pos[1] - 0.05 + openGap
  useEffect(() => {
    const reg = registryRef.current
    if (!top.current || !reg) return
    reg.bodies.set('hat', {
      obj: top.current,
      kind: 'hat',
      mat,
      baseRotX: 0,
      baseRotZ: 0,
      top: top.current,
      topY: topBaseY,
    })
    return () => {
      reg.bodies.delete('hat')
    }
  }, [mat, topBaseY, registryRef])
  return (
    <group>
      {/* stand with pedal */}
      <Stand x={pos[0]} z={pos[2]} topY={pos[1] - 0.14} />
      <group position={[pos[0], 0, pos[2]]}>
        {/* pull rod */}
        <mesh position={[0, pos[1] - 0.07, 0]}>
          <cylinderGeometry args={[0.005, 0.005, pos[1] - 0.06, 6]} />
          <primitive object={A.chrome} attach="material" />
        </mesh>
        {/* pedal */}
        <group position={[0, 0.012, 0.24]}>
          <mesh rotation={[-0.16, 0, 0]} castShadow>
            <boxGeometry args={[0.11, 0.012, 0.3]} />
            <primitive object={A.darkMetal} attach="material" />
          </mesh>
          <mesh position={[0, 0.012, -0.14]}>
            <boxGeometry args={[0.11, 0.03, 0.06]} />
            <primitive object={A.darkMetal} attach="material" />
          </mesh>
        </group>
        {/* bottom cymbal */}
        <mesh
          geometry={GEO.cymbal.hatTop}
          material={A.cymbal}
          position={[0, pos[1] - 0.05, 0]}
          rotation={[Math.PI, 0, 0]}
          onClick={(e) => {
            e.stopPropagation()
            onPreview?.('hatPedal')
          }}
        />
        {/* top cymbal + clutch (wobbles / lifts on open hits) */}
        <group ref={top} position={[0, pos[1] - 0.05 + openGap, 0]}>
          <mesh
            geometry={GEO.cymbal.hatTop}
            material={mat}
            castShadow
            onClick={(e) => {
              e.stopPropagation()
              onPreview?.('hatClosed')
            }}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = 'auto')}
          />
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 0.06, 10]} />
            <primitive object={A.chrome} attach="material" />
          </mesh>
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.022, 0.016, 0.026, 10]} />
            <primitive object={A.chrome} attach="material" />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/** kick pedal + swinging beater (registry kind 'beater') */
function Beater({ pos, registryRef }: { pos: [number, number, number]; registryRef: RegistryRef }) {
  const pivot = useRef<THREE.Group>(null)
  const rodMat = useFlashMat(A.chrome)
  useEffect(() => {
    const reg = registryRef.current
    if (!pivot.current || !reg) return
    reg.bodies.set('beater', { obj: pivot.current, kind: 'beater', mat: rodMat, baseRotX: 0.22, baseRotZ: 0 })
    return () => {
      reg.bodies.delete('beater')
    }
  }, [rodMat, registryRef])
  return (
    <group position={pos}>
      {/* base plate + footboard */}
      <mesh position={[0, 0.015, 0.1]} rotation={[-0.18, 0, 0]} castShadow>
        <boxGeometry args={[0.16, 0.014, 0.4]} />
        <primitive object={A.darkMetal} attach="material" />
      </mesh>
      <mesh position={[0, 0.02, -0.12]}>
        <boxGeometry args={[0.16, 0.05, 0.1]} />
        <primitive object={A.darkMetal} attach="material" />
      </mesh>
      <mesh position={[0, 0.05, -0.16]}>
        <cylinderGeometry args={[0.03, 0.03, 0.06, 12]} />
        <primitive object={A.chrome} attach="material" />
      </mesh>
      {/* beater assembly */}
      <group ref={pivot} position={[0, 0.06, -0.14]} rotation={[0.22, 0, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.4, 8]} />
          <primitive object={rodMat} attach="material" />
        </mesh>
        <mesh position={[0, 0.42, 0]} castShadow>
          <sphereGeometry args={[0.036, 16, 12]} />
          <primitive object={A.felt} attach="material" />
        </mesh>
      </group>
    </group>
  )
}

function Throne({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.66, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.27, 0.09, 28]} />
        <meshStandardMaterial color="#17171a" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.66, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.27, 0.026, 10, 32]} />
        <meshStandardMaterial color="#1f1f23" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.026, 0.026, 0.56, 10]} />
        <primitive object={A.chrome} attach="material" />
      </mesh>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0.1, 0.11, 0]} rotation={[0, 0, -0.6]}>
              <cylinderGeometry args={[0.011, 0.013, 0.32, 8]} />
              <primitive object={A.darkMetal} attach="material" />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* auxiliary percussion (non-kit voices land here)                     */
/* ------------------------------------------------------------------ */

function AuxTable() {
  return (
    <group position={[0, 0, 2.2]}>
      <mesh position={[0, TABLE_TOP - 0.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.05, 0.72]} />
        <primitive object={A.wood} attach="material" />
      </mesh>
      {[
        [-1.16, -0.28],
        [1.16, -0.28],
        [-1.16, 0.28],
        [1.16, 0.28],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, TABLE_TOP / 2 - 0.05, z]}>
          <boxGeometry args={[0.05, TABLE_TOP - 0.05, 0.05]} />
          <primitive object={A.darkMetal} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

function MiniPost({ height }: { height: number }) {
  return (
    <group>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.008, 0.008, height, 8]} />
        <primitive object={A.chrome} attach="material" />
      </mesh>
      <mesh position={[0, 0.006, 0]}>
        <cylinderGeometry args={[0.055, 0.06, 0.012, 14]} />
        <primitive object={A.darkMetal} attach="material" />
      </mesh>
    </group>
  )
}

/** one aux instrument — proper little instrument shapes, all flashable */
function AuxPiece({ inst, pos, registryRef, onPreview }: { inst: InstrumentId; pos: [number, number, number]; registryRef: RegistryRef; onPreview?: (i: InstrumentId) => void }) {
  const group = useRef<THREE.Group>(null)
  const baseMat =
    inst === 'cowbell' || inst === 'agogo' ? A.brass : inst === 'triangle' ? A.chrome : inst === 'clave' || inst === 'block' || inst === 'guiro' ? A.wood : inst === 'tambourine' ? A.wood : A.hide
  const mat = useFlashMat(baseMat)
  useEffect(() => {
    const reg = registryRef.current
    if (!group.current || !reg) return
    reg.bodies.set(inst, { obj: group.current, kind: 'block', mat, baseRotX: 0, baseRotZ: 0 })
    return () => {
      reg.bodies.delete(inst)
    }
  }, [mat, inst, registryRef])

  const click = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    onPreview?.(inst)
  }
  const hover = {
    onPointerOver: () => (document.body.style.cursor = 'pointer'),
    onPointerOut: () => (document.body.style.cursor = 'auto'),
  }

  return (
    <group ref={group} position={pos} onClick={click} {...hover}>
      {inst === 'cowbell' && (
        <group>
          <MiniPost height={0.16} />
          <mesh position={[0, 0.27, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.085, 0.2, 4, 1, true]} />
            <primitive object={mat} attach="material" />
          </mesh>
        </group>
      )}
      {inst === 'agogo' && (
        <group>
          <MiniPost height={0.16} />
          <mesh position={[-0.035, 0.28, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.055, 0.12, 4, 1, true]} />
            <primitive object={mat} attach="material" />
          </mesh>
          <mesh position={[0.04, 0.23, 0]} rotation={[0, Math.PI / 4, 0]}>
            <cylinderGeometry args={[0.024, 0.045, 0.1, 4, 1, true]} />
            <primitive object={mat} attach="material" />
          </mesh>
        </group>
      )}
      {inst === 'block' && (
        <group>
          <MiniPost height={0.1} />
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.16, 0.09, 0.11]} />
            <primitive object={mat} attach="material" />
          </mesh>
        </group>
      )}
      {inst === 'clave' && (
        <group position={[0, TABLE_TOP - pos[1] + 0.02, 0]}>
          {[-0.05, 0.05].map((x) => (
            <mesh key={x} position={[x, 0.02, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.018, 0.016, 0.2, 10]} />
              <primitive object={mat} attach="material" />
            </mesh>
          ))}
        </group>
      )}
      {inst === 'triangle' && (
        <group>
          <MiniPost height={0.3} />
          <mesh position={[0, 0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.075, 0.006, 8, 30, Math.PI * 1.75]} />
            <primitive object={mat} attach="material" />
          </mesh>
        </group>
      )}
      {inst === 'guiro' && (
        <group position={[0, TABLE_TOP - pos[1] + 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.042, 0.042, 0.22, 14]} />
            <primitive object={mat} attach="material" />
          </mesh>
        </group>
      )}
      {(inst === 'shaker' || inst === 'maracas' || inst === 'cabasa') && (
        <group>
          <mesh position={[0, 0.07, 0]} castShadow>
            <cylinderGeometry args={[0.032, 0.036, 0.14, 12]} />
            <primitive object={mat} attach="material" />
          </mesh>
        </group>
      )}
      {inst === 'tambourine' && (
        <group position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow>
            <torusGeometry args={[0.09, 0.018, 10, 24]} />
            <primitive object={mat} attach="material" />
          </mesh>
        </group>
      )}
      {/* generic padded pad fallback */}
      {!['cowbell', 'agogo', 'block', 'clave', 'triangle', 'guiro', 'shaker', 'maracas', 'cabasa', 'tambourine'].includes(inst) && (
        <group>
          <mesh position={[0, 0.11, 0]} castShadow>
            <boxGeometry args={[0.22, 0.2, 0.22]} />
            <primitive object={mat} attach="material" />
          </mesh>
          <mesh position={[0, 0.215, 0]}>
            <boxGeometry args={[0.23, 0.016, 0.23]} />
            <primitive object={A.hide} attach="material" />
          </mesh>
        </group>
      )}
    </group>
  )
}

/** conga/bongo hand drums on the floor beside the table */
function HandDrum({ inst, pos, registryRef, onPreview }: { inst: InstrumentId; pos: [number, number, number]; registryRef: RegistryRef; onPreview?: (i: InstrumentId) => void }) {
  const group = useRef<THREE.Group>(null)
  const shellMat = useFlashMat(A.shell)
  const mat = useFlashMat(A.hide)
  useEffect(() => {
    const reg = registryRef.current
    if (!group.current || !reg) return
    reg.bodies.set(inst, { obj: group.current, kind: 'block', mat, baseRotX: 0, baseRotZ: 0 })
    return () => {
      reg.bodies.delete(inst)
    }
  }, [mat, inst, registryRef])

  const geo = GEO.barrel[inst as keyof typeof GEO.barrel]
  const disc = GEO.disc[inst as keyof typeof GEO.disc]
  const h = inst.startsWith('bongo') ? 0.21 : 0.38
  const isBongo = inst.startsWith('bongo')
  return (
    <group ref={group} position={pos} onClick={(e) => { e.stopPropagation(); onPreview?.(inst) }} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = 'auto')}>
      {isBongo ? (
        <group position={[0, 0.62, 0]}>
          <mesh geometry={geo} material={shellMat} position={[-0.078, 0, 0]} castShadow />
          <mesh geometry={GEO.disc.bongoHi} material={mat} position={[-0.078, 0.105, 0]} rotation={[-Math.PI / 2, 0, 0]} />
          <mesh geometry={geo} material={shellMat} position={[0.082, 0.012, 0]} castShadow />
          <mesh geometry={GEO.disc.bongoLo} material={mat} position={[0.082, 0.126, 0]} rotation={[-Math.PI / 2, 0, 0]} />
          {/* wood block base */}
          <mesh position={[0, -0.075, 0]} castShadow>
            <boxGeometry args={[0.27, 0.09, 0.17]} />
            <primitive object={A.wood} attach="material" />
          </mesh>
        </group>
      ) : (
        <>
          <mesh geometry={geo} material={shellMat} position={[0, h / 2 + 0.02, 0]} castShadow />
          <mesh geometry={disc} material={A.hide} position={[0, h + 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} />
          {/* stand */}
          <mesh position={[0, 0.012, 0]}>
            <cylinderGeometry args={[0.14, 0.16, 0.02, 16]} />
            <primitive object={A.darkMetal} attach="material" />
          </mesh>
          {[0, 2.1, 4.2].map((a) => {
            const rad = (a * Math.PI) / 180
            return (
              <mesh key={a} position={[Math.cos(rad) * 0.09, 0.02, Math.sin(rad) * 0.09]} rotation={[0, -a, 0.35]}>
                <cylinderGeometry args={[0.008, 0.008, 0.12, 6]} />
                <primitive object={A.chrome} attach="material" />
              </mesh>
            )
          })}
        </>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* scene                                                               */
/* ------------------------------------------------------------------ */

/** memoized: nothing here changes while the playhead ticks — only `pattern`/aux rebuild it */
const Scene = memo(function Scene({
  pattern,
  aux,
  registryRef,
  onPreview,
  lowSpec = false,
}: {
  pattern: GroovePattern
  aux: AuxMap
  registryRef: RegistryRef
  onPreview?: (i: InstrumentId) => void
  /** software-WebGL machines: cheaper env, no dynamic shadow pass */
  lowSpec?: boolean
}) {
  const { congas, bongos, table: tableInsts } = aux

  return (
    <>
      {/* background + fog are owned by <Venue> (they follow the audio room) */}

      {/* lighting rig: local lightformer environment (no network) + spot */}
      <Environment resolution={lowSpec ? 128 : 256} frames={1}>
        <color attach="background" args={['#050506']} />
        <Lightformer intensity={5} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[9, 9, 1]} color="#fff7ea" />
        <Lightformer intensity={2.4} position={[-5, 2, -1]} rotation-y={Math.PI / 2} scale={[6, 2.6, 1]} color="#cfe4ff" />
        <Lightformer intensity={2.2} position={[5, 1.6, 0]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#ffe6bd" />
        <Lightformer intensity={3} position={[0, 2.4, -5]} scale={[8, 2.2, 1]} color="#a3e635" />
        <Lightformer intensity={0.8} position={[0, 1.2, 5]} scale={[4, 2, 1]} color="#9ba1ab" />
      </Environment>
      <ambientLight intensity={0.28} />
      <spotLight
        position={[2.4, 6.4, 3.4]}
        angle={0.55}
        penumbra={0.9}
        intensity={320}
        color="#fff2dd"
        castShadow={!lowSpec}
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.0003}
      />
      <spotLight position={[-4, 5, -3]} angle={0.7} penumbra={1} intensity={110} color="#bfd9ff" />
      <pointLight position={[0, 2.4, -3.4]} intensity={4.5} color="#a3e635" distance={9} />

      {/* floor + rug — static lacquer stage (no per-frame mirror pass; sheen comes from the lightformer env) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[11, 48]} />
        <primitive object={A.floor} attach="material" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 1.05]} material={A.rug}>
        <planeGeometry args={[3.9, 3.0]} />
      </mesh>
      {/* static contact shadows: baked once at mount (pieces rest here; flinches are sub-cm) */}
      <ContactShadows position={[0, 0.02, 0.4]} opacity={0.62} scale={8.5} blur={2.3} far={3} frames={1} />

      {/* drums */}
      {PIECES.filter((p) => p.kind !== 'cymbal' && p.id !== 'hat').map((p) => (
        <DrumPiece key={p.id} def={p} registryRef={registryRef} onPreview={onPreview} />
      ))}
      {/* tom mounts into the kick */}
      {[PIECES[2], PIECES[3]].map((p) => (
        <mesh key={`mount-${p.id}`} position={[p.pos[0] * 0.55, 1.28, (p.pos[2] + 0.15) / 2 + 0.05]} rotation={[0.5, 0, p.pos[0] < 0 ? 0.35 : -0.35]}>
          <cylinderGeometry args={[0.012, 0.012, 0.42, 8]} />
          <primitive object={A.chrome} attach="material" />
        </mesh>
      ))}
      <HatPiece def={PIECES[5]} registryRef={registryRef} onPreview={onPreview} />
      {PIECES.filter((p) => p.kind === 'cymbal').map((p) => (
        <CymbalPiece key={p.id} def={p} registryRef={registryRef} onPreview={onPreview} />
      ))}
      <Beater pos={[0, 0, 0.72]} registryRef={registryRef} />
      <Throne pos={[0.1, 0, 2.7]} />

      {/* auxiliary percussion table + hand drums */}
      {tableInsts.length > 0 && <AuxTable />}
      {tableInsts.slice(0, AUX_ROW.length).map((inst, i) => {
        const [x, z] = AUX_ROW[i]
        return <AuxPiece key={inst} inst={inst} pos={[x, TABLE_TOP, z]} registryRef={registryRef} onPreview={onPreview} />
      })}
      {congas.slice(0, 2).map((inst, i) => (
        <HandDrum key={inst} inst={inst} pos={CONGA_SPOTS[i]} registryRef={registryRef} onPreview={onPreview} />
      ))}
      {bongos.length > 0 && <HandDrum inst={bongos[0]} pos={BONGO_SPOT} registryRef={registryRef} onPreview={onPreview} />}

      <Animator registryRef={registryRef} />
    </>
  )
})

/** glow-light targets for aux instruments (module knowledge, no scene access needed) */
interface AuxMap {
  congas: InstrumentId[]
  bongos: InstrumentId[]
  table: InstrumentId[]
  posMap: Map<string, [number, number, number]>
}

/**
 * Playhead → registry bridge. Lives OUTSIDE the Canvas so a step tick
 * never reconciles the three.js tree — it only writes hit entries that
 * the frame loop (tickRegistry) consumes. Zero scene re-renders per step.
 */
function HitScheduler({
  pattern,
  currentStep,
  registryRef,
  posMap,
}: {
  pattern: GroovePattern
  currentStep: number | null
  registryRef: RegistryRef
  posMap: Map<string, [number, number, number]>
}) {
  useEffect(() => {
    const registry = registryRef.current
    if (currentStep == null || !registry) return
    for (const e of pattern.events) {
      if (e.s !== currentStep) continue
      const track = pattern.tracks.find((t) => t.id === e.t)
      if (!track) continue
      const inst = track.inst
      const def = PIECE_BY_INST.get(inst)
      const target = def ? def.id : inst
      const prev = registry.hits.get(target)
      registry.hits.set(target, {
        time: performance.now(),
        vel: Math.max(prev?.vel ?? 0, e.v),
        open: inst === 'hatOpen' || prev?.open,
      })
      if (!prev) {
        const p = def ? PIECE_POS.get(def.id) : posMap.get(inst)
        if (p) registry.glow = { pos: p, time: performance.now() }
      }
    }
  }, [currentStep, pattern, registryRef, posMap])
  return null
}

/* ------------------------------------------------------------------ */
/* public component                                                    */
/* ------------------------------------------------------------------ */

const ORBIT_TARGET: [number, number, number] = [0, 1.02, 0.6]

/**
 * DemandDriver — under the `demand` frameloop (software rasterizers), frames
 * are produced only when something actually changes: while the kit animates
 * (spin or live playhead) this invalidates every frame; idle pages cost zero GPU.
 */
function DemandDriver({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate)
  useFrame(() => {
    if (active) invalidate()
  })
  return null
}

/**
 * Venue — the 3D room follows the audio room ambience: backdrop + fog swap
 * declaratively (R3F attach), and exposure rides the Canvas `gl` prop so
 * nothing hook-returned is ever mutated.
 */
function Venue({ roomId }: { roomId: string }) {
  const v = VENUES[roomId] ?? VENUES.close
  return (
    <>
      <color attach="background" args={[v.bg]} />
      <fog attach="fog" args={[v.bg, v.fogNear, v.fogFar]} />
    </>
  )
}

export default function DrumKit3D({
  pattern,
  currentStep,
  onPreview,
  className,
  kitId,
  roomId,
}: {
  pattern: GroovePattern
  currentStep: number | null
  onPreview?: (i: InstrumentId) => void
  className?: string
  /** sample kit id → drives the shell/cymbal/hardware colorway */
  kitId?: string
  /** audio room id → drives the venue backdrop/fog/exposure */
  roomId?: string
}) {
  const registryRef = useRef<Registry>({ hits: new Map(), bodies: new Map(), glow: { pos: null, time: 0 } })
  // software rasterizers (SwiftShader/llvmpipe — CI, sandboxes, weak iGPUs) get a
  // cheaper render path; on a real GPU nothing changes
  const [lowSpec, setLowSpec] = useState(false)
  const [spin, setSpin] = useState(true)
  // the kit's visual finish follows the selected sample kit
  useEffect(() => {
    setKitFinish(kitId)
  }, [kitId])
  const venue = VENUES[roomId ?? 'close'] ?? VENUES.close
  // stable dispatcher: Scene is memoized, so the parent's fresh arrow per render must not reach it
  const previewRef = useRef(onPreview)
  useEffect(() => {
    previewRef.current = onPreview
  }, [onPreview])
  const handlePreview = useCallback((i: InstrumentId) => previewRef.current?.(i), [])
  const activeChips = useMemo(
    () => Array.from(new Set(pattern.tracks.map((t) => t.inst))).map((i) => INSTRUMENTS[i]?.short ?? i),
    [pattern]
  )
  // aux percussion layout + glow positions (recomputed only when the pattern changes)
  const aux = useMemo<AuxMap>(() => {
    const all = Array.from(new Set(pattern.tracks.map((t) => t.inst))).filter(
      (i) => !KIT_INSTS.has(i)
    ) as InstrumentId[]
    const congas: InstrumentId[] = all.filter((i) => i === 'congaHi' || i === 'congaLo')
    const bongos: InstrumentId[] = all.filter((i) => i === 'bongoHi' || i === 'bongoLo')
    const table = all.filter((i) => !congas.includes(i) && !bongos.includes(i))
    const posMap = new Map<string, [number, number, number]>()
    table.slice(0, AUX_ROW.length).forEach((inst, i) => {
      const [x, z] = AUX_ROW[i]
      posMap.set(inst, [x, TABLE_TOP + 0.16, z])
    })
    congas.forEach((inst, i) => {
      const [x, , z] = CONGA_SPOTS[i]
      posMap.set(inst, [x, 0.44, z])
    })
    if (bongos.length > 0) posMap.set(bongos[0], [BONGO_SPOT[0], 0.66, BONGO_SPOT[2]])
    return { congas, bongos, table, posMap }
  }, [pattern])
  return (
    <div className={className}>
      <HitScheduler pattern={pattern} currentStep={currentStep} registryRef={registryRef} posMap={aux.posMap} />
      <div className="relative h-[340px] w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 sm:h-[440px]" data-noclick data-lowspec={lowSpec ? "1" : "0"}>
        <Canvas
          frameloop={lowSpec ? 'demand' : 'always'}
          shadows={!lowSpec}
          dpr={lowSpec ? 1 : [1, 1.5]}
          gl={{ antialias: !lowSpec, toneMappingExposure: venue.exposure, powerPreference: 'high-performance' }}
          camera={{ position: [2.7, 2.1, 4.7], fov: 38, near: 0.1, far: 40 }}
          onCreated={({ gl }) => {
            try {
              const glCtx = gl.getContext() as WebGLRenderingContext
              const dbg = glCtx.getExtension('WEBGL_debug_renderer_info')
              const gpu = dbg ? String(glCtx.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : ''
              if (/swiftshader|llvmpipe|softpipe|software/i.test(gpu)) {
                setLowSpec(true)
                setSpin(false)
              }
            } catch {
              /* probe failed — keep the full-quality path */
            }
          }}
          aria-label="3D drum kit playing the groove"
          role="img"
        >
          <DemandDriver active={lowSpec && (spin || currentStep != null)} />
          <Venue roomId={roomId ?? 'close'} />
          <Scene pattern={pattern} aux={aux} registryRef={registryRef} onPreview={handlePreview} lowSpec={lowSpec} />
          <OrbitControls
            makeDefault
            target={ORBIT_TARGET}
            enableDamping
            dampingFactor={0.08}
            autoRotate={spin}
            autoRotateSpeed={0.5}
            minDistance={2.2}
            maxDistance={8}
            minPolarAngle={0.22}
            maxPolarAngle={1.46}
          />
        </Canvas>
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1">
          <span className="rounded border border-zinc-800/80 bg-zinc-950/70 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-zinc-500 backdrop-blur-sm">
            3d kit · drag to orbit · scroll to zoom
          </span>
          {kitId && (
            <span className="rounded border border-zinc-800/60 bg-zinc-950/60 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-zinc-400 backdrop-blur-sm">
              finish: {finishNameFor(kitId)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setSpin((s) => !s)}
          aria-pressed={spin}
          className={`absolute right-3 top-3 flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[9px] uppercase tracking-widest backdrop-blur-sm transition-colors cursor-pointer ${
            spin ? 'border-lime-400/40 bg-lime-400/10 text-lime-300' : 'border-zinc-800 bg-zinc-950/70 text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <RotateCw className="h-3 w-3" />
          {spin ? 'orbit on' : 'orbit off'}
        </button>
        <span className="sr-only">
          Interactive 3D studio drum kit. Instruments in play: {activeChips.join(', ') || 'none'}. Drag to orbit, scroll to zoom.
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">in play:</span>
        {activeChips.map((s, i) => (
          <span key={`${s}-${i}`} className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}
