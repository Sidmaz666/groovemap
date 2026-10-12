import type { GroovePattern } from '../types'
import { stepsPerBar, eventsForTrack, velocityTier } from '../types'
import { INSTRUMENTS, TRACK_COLORS } from '../instruments'
import { drumTab } from '../notation'
import { triggerDownload } from './wav'

/**
 * Grid-diagram PNG — renders the step grid to a crisp 2× canvas (dark
 * hardware-sequencer look) and downloads it. Great for sharing to docs,
 * Discord, slide decks.
 */

export function downloadPng(p: GroovePattern): void {
  const spb = stepsPerBar(p.timeSignature, p.subdivision)
  const totalSteps = spb * p.bars
  const SCALE = 2
  const CELL = Math.max(22, Math.min(44, Math.floor(1180 / totalSteps)))
  const LABEL_W = 118
  const TOP = 150
  const ROW = 40
  const BOTTOM = 88
  const W = LABEL_W + totalSteps * CELL + 32
  const H = TOP + p.tracks.length * ROW + BOTTOM

  const canvas = document.createElement('canvas')
  canvas.width = W * SCALE
  canvas.height = H * SCALE
  const ctx = canvas.getContext('2d')!
  ctx.scale(SCALE, SCALE)

  // background
  ctx.fillStyle = '#0b0b0c'
  ctx.fillRect(0, 0, W, H)

  // header
  ctx.fillStyle = '#a3e635'
  ctx.font = 'bold 11px ui-monospace, Menlo, monospace'
  ctx.fillText('GROOVEMAP', 20, 26)
  ctx.fillStyle = '#fafafa'
  ctx.font = 'bold 30px ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(p.title.slice(0, 42), 20, 62)
  ctx.fillStyle = '#8b8b93'
  ctx.font = '13px ui-sans-serif, system-ui, sans-serif'
  const meta = `${p.family.toUpperCase()} · ${p.bpm} BPM · ${p.timeSignature.num}/${p.timeSignature.den} · ${p.bars} bar${p.bars > 1 ? 's' : ''} · ${p.feel} · 1/${p.subdivision * 4} notes${p.swing > 0 ? ` · swing ${Math.round(p.swing * 100)}%` : ''}`
  ctx.fillText(meta, 20, 84)

  // counts
  const counts = drumTab(p).counts
  ctx.font = '10px ui-monospace, Menlo, monospace'
  for (let s = 0; s < totalSteps; s++) {
    if (!counts[s]) continue
    const cx = LABEL_W + s * CELL + CELL / 2
    ctx.fillStyle = s % p.subdivision === 0 ? '#c8c8ce' : '#55555c'
    ctx.fillText(counts[s], cx - ctx.measureText(counts[s]).width / 2, TOP - 10)
  }

  // rows
  p.tracks.forEach((track, ri) => {
    const ry = TOP + ri * ROW
    const inst = INSTRUMENTS[track.inst] ?? INSTRUMENTS.kick
    const color = TRACK_COLORS[inst.color % TRACK_COLORS.length].hex

    // label
    ctx.fillStyle = color
    ctx.font = 'bold 13px ui-monospace, Menlo, monospace'
    ctx.fillText(inst.short, 20, ry + ROW / 2 + 4)
    ctx.fillStyle = '#55555c'
    ctx.font = '10px ui-sans-serif, system-ui, sans-serif'
    ctx.fillText(inst.name.slice(0, 12), 20, ry + ROW / 2 + 16)

    const evs = new Map<number, ReturnType<typeof eventsForTrack>>()
    for (const e of eventsForTrack(p, track.id)) evs.set(e.s, [e])

    for (let s = 0; s < totalSteps; s++) {
      const cx = LABEL_W + s * CELL
      // cell background
      ctx.fillStyle = s % spb === 0 ? '#16161a' : s % p.subdivision === 0 ? '#121215' : '#0e0e10'
      ctx.fillRect(cx + 1, ry + 2, CELL - 2, ROW - 4)
      // grid lines
      if (s % spb === 0) {
        ctx.fillStyle = '#a3e63555'
        ctx.fillRect(cx, ry + 2, 1.5, ROW - 4)
      } else if (s % p.subdivision === 0) {
        ctx.fillStyle = '#ffffff12'
        ctx.fillRect(cx, ry + 2, 1, ROW - 4)
      }

      const e = evs.get(s)?.[0]
      if (!e) continue
      const tier = velocityTier(e.v)
      const cxm = cx + CELL / 2
      const cym = ry + ROW / 2
      const r = Math.min(CELL, ROW) * 0.24
      ctx.beginPath()
      if (tier === 'accent') {
        ctx.fillStyle = color
        ctx.arc(cxm, cym, r + 2.4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#0b0b0c'
        ctx.fillRect(cxm - 1, cym - 4, 2, 8)
      } else if (tier === 'ghost') {
        ctx.strokeStyle = color + 'aa'
        ctx.lineWidth = 1.6
        ctx.arc(cxm, cym, r - 0.6, 0, Math.PI * 2)
        ctx.stroke()
      } else {
        ctx.fillStyle = color
        ctx.arc(cxm, cym, r, 0, Math.PI * 2)
        ctx.fill()
      }
      if (e.p !== undefined) {
        ctx.fillStyle = '#ffffff99'
        ctx.font = 'bold 9px ui-monospace, monospace'
        ctx.fillText('?', cxm + r + 1, cym - r)
      }
      if ((e.r ?? 1) > 1) {
        ctx.fillStyle = '#ffffffcc'
        ctx.font = 'bold 9px ui-monospace, monospace'
        ctx.fillText(`×${e.r}`, cxm - r - 10, cym - r)
      }
    }
  })

  // legend footer
  const ly = H - 42
  ctx.fillStyle = '#55555c'
  ctx.fillRect(20, ly - 14, W - 40, 1)
  ctx.font = '10px ui-monospace, Menlo, monospace'
  ctx.fillStyle = '#8b8b93'
  let lx = 20
  const legend = ['● accent', '● normal', '○ ghost', '? probabilistic', '×n roll']
  for (const l of legend) {
    ctx.fillText(l, lx, ly + 6)
    lx += ctx.measureText(l).width + 18
  }
  ctx.fillStyle = '#55555c'
  ctx.font = '10px ui-sans-serif, system-ui, sans-serif'
  const prov = `${p.source.type} · ${p.source.note.slice(0, 96)}`
  ctx.fillText(prov, 20, ly + 24)

  canvas.toBlob((blob) => {
    if (blob) triggerDownload(blob, `${p.slug}.png`)
  }, 'image/png')
}
