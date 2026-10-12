import type { GroovePattern } from '../types'
import { stepsPerBar, eventsForTrack, velocityTier } from '../types'
import { INSTRUMENTS } from '../instruments'
import { drumTab, indianModel } from '../notation'
import { defaultMidiMapping } from './midi'

/**
 * Pattern-sheet PDF — a real, programmatically drawn document (jsPDF): step
 * grid, drum tab, Indian bol notation, legend + GM map. Black-on-white,
 * print-ready A4. Complements the browser's native print route.
 */

export async function downloadPdf(p: GroovePattern): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const W = 210
  const M = 14 // margin
  const CW = W - M * 2
  let y = 0

  const mono = (size: number, style: 'normal' | 'bold' = 'normal') => {
    doc.setFont('courier', style)
    doc.setFontSize(size)
  }
  const helv = (size: number, style: 'normal' | 'bold' = 'normal') => {
    doc.setFont('helvetica', style)
    doc.setFontSize(size)
  }

  /* header ---------------------------------------------------------------- */
  doc.setFillColor(12, 12, 12)
  doc.rect(0, 0, W, 30, 'F')
  doc.setTextColor(163, 230, 53)
  mono(8, 'bold')
  doc.text('GROOVEMAP — PATTERN SHEET', M, 9)
  doc.setTextColor(250, 250, 250)
  helv(17, 'bold')
  doc.text(p.title, M, 18.5)
  helv(8.5)
  doc.setTextColor(180, 180, 180)
  doc.text(`${p.family.toUpperCase()}  ·  ${p.genres.join(' / ')}  ·  ${p.feel}`, M, 24.5)
  y = 38

  /* meta chips ------------------------------------------------------------ */
  const meta: [string, string][] = [
    ['TEMPO', `${p.bpm} BPM (${p.tempoRange[0]}–${p.tempoRange[1]})`],
    ['METER', `${p.timeSignature.num}/${p.timeSignature.den}`],
    ['BARS', String(p.bars)],
    ['SUB', `1/${p.subdivision * 4}`],
    ['FEEL', p.feel],
    ['LEVEL', p.difficulty],
    ['KIT', p.kitSuggestion],
    ['SWING', p.swing > 0 ? `${Math.round(p.swing * 100)}%` : 'off'],
  ]
  mono(6.2)
  let x = M
  for (const [k, v] of meta) {
    const w = Math.max(k.length, v.length) * 1.35 + 6
    doc.setDrawColor(200, 200, 200)
    doc.roundedRect(x, y, w, 11, 1.2, 1.2)
    doc.setTextColor(120, 120, 120)
    doc.text(k, x + 3, y + 4.2)
    doc.setTextColor(30, 30, 30)
    mono(6.6, 'bold')
    doc.text(v.slice(0, 18), x + 3, y + 8.6)
    mono(6.2)
    x += w + 2.4
  }
  y += 18

  /* step grid ------------------------------------------------------------- */
  const spb = stepsPerBar(p.timeSignature, p.subdivision)
  const totalSteps = spb * p.bars
  const labelW = 22
  const cellW = (CW - labelW) / totalSteps
  const cellH = Math.min(7.5, Math.max(4.2, 120 / p.tracks.length))
  const gridTop = y

  doc.setTextColor(60, 60, 60)
  mono(5.6)
  // counts row
  const counts = drumTab(p).counts
  for (let s = 0; s < totalSteps; s++) {
    const cx = M + labelW + s * cellW
    if (counts[s]) doc.text(counts[s], cx + cellW / 2, gridTop - 1.6, { align: 'center' })
  }

  p.tracks.forEach((track, ri) => {
    const ry = gridTop + ri * cellH
    const inst = INSTRUMENTS[track.inst] ?? INSTRUMENTS.kick
    doc.setTextColor(40, 40, 40)
    mono(6.4, 'bold')
    doc.text(inst.short, M + 1, ry + cellH / 2 + 1.6)
    mono(4.8)
    doc.setTextColor(130, 130, 130)
    doc.text(inst.name.slice(0, 9), M + 1, ry + cellH / 2 + 4.6)

    const evs = new Map<number, ReturnType<typeof eventsForTrack>>()
    for (const e of eventsForTrack(p, track.id)) evs.set(e.s, [e])

    for (let s = 0; s < totalSteps; s++) {
      const cx = M + labelW + s * cellW
      const barLine = s % spb === 0
      const beatLine = s % p.subdivision === 0
      doc.setDrawColor(barLine ? 40 : beatLine ? 205 : 228)
      doc.setLineWidth(barLine ? 0.5 : 0.15)
      doc.rect(cx, ry, cellW, cellH)
      const e = evs.get(s)?.[0]
      if (e) {
        const tier = velocityTier(e.v)
        const r = Math.min(cellW, cellH) * 0.28
        const cxx = cx + cellW / 2
        const cyy = ry + cellH / 2
        if (tier === 'accent') {
          doc.setFillColor(20, 20, 20)
          doc.circle(cxx, cyy, r + 0.7, 'F')
        } else if (tier === 'ghost') {
          doc.setDrawColor(90, 90, 90)
          doc.setLineWidth(0.25)
          doc.circle(cxx, cyy, r - 0.4)
        } else {
          doc.setFillColor(120, 120, 120)
          doc.circle(cxx, cyy, r, 'F')
        }
        if (e.p !== undefined) {
          doc.setTextColor(150, 150, 150)
          mono(3.8, 'bold')
          doc.text('?', cxx + r + 0.4, cyy + 1.2)
        }
        if ((e.r ?? 1) > 1) {
          doc.setTextColor(20, 20, 20)
          mono(3.8, 'bold')
          doc.text(`×${e.r}`, cxx - r - 0.5, cyy + 1.2)
        }
      }
    }
  })
  y = gridTop + p.tracks.length * cellH + 8

  /* construction note ------------------------------------------------------ */
  helv(8, 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text('HOW IT WORKS', M, y)
  y += 2
  helv(7.6)
  doc.setTextColor(70, 70, 70)
  const construction = doc.splitTextToSize(p.learning.construction, CW)
  doc.text(construction, M, y + 4)
  y += 6 + construction.length * 3.6

  /* drum tab --------------------------------------------------------------- */
  if (y > 225) {
    doc.addPage()
    y = 20
  }
  helv(8, 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text('DRUM TAB', M, y)
  y += 4
  mono(6.4)
  doc.setTextColor(60, 60, 60)
  const tab = drumTab(p)
  for (const row of tab.rows) {
    doc.text(`${row.label.padEnd(4)}${row.bars.join('')}`, M, y)
    y += 3.4
  }
  y += 2
  mono(5.2)
  doc.setTextColor(130, 130, 130)
  doc.text('X accent · x normal · o ghost · 2-9 roll · P probabilistic · - rest', M, y)
  y += 9

  /* indian notation --------------------------------------------------------- */
  const ind = indianModel(p)
  if (y > 232) {
    doc.addPage()
    y = 20
  }
  helv(8, 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text(`INDIAN NOTATION — ${ind.tala.name.toUpperCase()}`, M, y)
  y += 1.5
  mono(5)
  doc.setTextColor(130, 130, 130)
  doc.text(`vibhag ${ind.tala.vibhag.join('+')} · claps ${ind.tala.marks.join(' ')} · gait ${ind.gait.slice(0, spb).join(' ')}`, M, y + 3.6)
  y += 7
  mono(6.4)
  doc.setTextColor(60, 60, 60)
  for (const bar of ind.bars.slice(0, 4)) {
    const cells = bar.beats.flatMap((beat) => beat.cells.map((c) => (c ? c.bol : '·')))
    doc.text(`bar ${bar.index + 1}  ${cells.join(' ')}`, M, y)
    y += 3.6
    if (y > 280) break
  }
  y += 4

  /* legend + GM map ---------------------------------------------------------- */
  if (y > 240) {
    doc.addPage()
    y = 20
  }
  helv(8, 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text('GENERAL-MIDI MAP', M, y)
  y += 3.6
  const gm = defaultMidiMapping()
  mono(5.8)
  doc.setTextColor(70, 70, 70)
  let gx = M
  let gy = y
  for (const t of p.tracks) {
    const inst = INSTRUMENTS[t.inst] ?? INSTRUMENTS.kick
    const label = `${inst.short} = GM ${gm[t.inst] ?? inst.gm} (${inst.name})`
    doc.text(label, gx, gy)
    gy += 3.2
    if (gy > 285) {
      gy = y
      gx += 66
    }
  }
  y = gy + 8

  /* footer ------------------------------------------------------------------- */
  doc.setDrawColor(220, 220, 220)
  doc.line(M, 285, W - M, 285)
  mono(5.4)
  doc.setTextColor(150, 150, 150)
  doc.text(`Generated from Groovemap · ${new Date().toISOString().slice(0, 10)} · provenance: ${p.source.type} — ${p.source.note.slice(0, 90)}`, M, 289)

  doc.save(`${p.slug}-sheet.pdf`)
}
