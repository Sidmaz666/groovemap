import type { GroovePattern, RhythmEvent, Subdivision, TimeSignature } from './types'
import { stepsPerBar } from './types'
import type { InstrumentId } from './instruments'
import { eventsToTrackString, stepLabels } from './rhythm'

/**
 * notation.ts — one pattern, every written form musicians actually use.
 *
 *  - drumTab()     → classic text tab (`|x-x-x-x-|`, X/x/o/rolls per bar)
 *  - staffModel()  → note events positioned on a 5-line staff for the SVG score
 *  - indianModel() → Hindustani/Carnatic rendering: tabla bols, solkattu gait
 *                    counts and a tala (vibhag/clap/khali) structure row
 *
 * All three read the same events grid — nothing can drift out of sync.
 */

/* ------------------------------------------------------------------ */
/* Drum tab                                                            */
/* ------------------------------------------------------------------ */

export interface DrumTabRow {
  inst: InstrumentId
  label: string
  /** one string per bar, one char per step — X accent · x normal · o ghost · digit roll · p prob */
  bars: string[]
}

export interface DrumTab {
  rows: DrumTabRow[]
  counts: string[]
  spb: number
}

const TAB_ORDER: InstrumentId[] = [
  'hatClosed', 'hatOpen', 'hatPedal', 'ride', 'crash', 'splash',
  'snare', 'clap', 'rimshot', 'kick',
  'tomHi', 'tomMid', 'tomLow',
  'cowbell', 'clave', 'block', 'agogo', 'triangle',
  'shaker', 'maracas', 'cabasa', 'tambourine', 'guiro',
  'congaHi', 'congaLo', 'bongoHi', 'bongoLo',
]

function tabChar(ev: RhythmEvent | undefined): string {
  if (!ev) return '-'
  if (ev.r !== undefined && ev.r > 1) return String(Math.min(9, ev.r))
  if (ev.p !== undefined) return ev.v >= 120 ? 'P' : 'p'
  if (ev.v >= 120) return 'X'
  if (ev.v >= 75) return 'x'
  return 'o'
}

/** order tracks the way tabs are printed: cymbals on top, kick at the bottom */
export function drumTab(p: GroovePattern, trackOrder?: string[]): DrumTab {
  const spb = stepsPerBar(p.timeSignature, p.subdivision)
  const byId = new Map(p.tracks.map((t) => [t.id, t]))
  const ids = trackOrder ?? orderTracks(p)
  const rows: DrumTabRow[] = []
  for (const id of ids) {
    const track = byId.get(id)
    if (!track) continue
    const events = p.events.filter((e) => e.t === id)
    if (events.length === 0) continue
    const bars: string[] = []
    for (let b = 0; b < p.bars; b++) {
      const slice = events.filter((e) => e.s >= b * spb && e.s < (b + 1) * spb).map((e) => ({ ...e, s: e.s - b * spb }))
      bars.push(eventsToTrackString(slice, spb, 1))
    }
    rows.push({ inst: track.inst, label: track.label ?? shortLabel(track.inst), bars })
  }
  const labels = stepLabels(p.timeSignature, p.subdivision)
  const counts: string[] = []
  for (let b = 0; b < p.bars; b++) counts.push(labels.slice(0, spb).join(''))
  return { rows, counts, spb }
}

function orderTracks(p: GroovePattern): string[] {
  const rank = new Map<InstrumentId, number>(TAB_ORDER.map((i, idx) => [i, idx]))
  return [...p.tracks]
    .sort((a, b) => (rank.get(a.inst) ?? 99) - (rank.get(b.inst) ?? 99))
    .map((t) => t.id)
}

function shortLabel(inst: InstrumentId): string {
  const map: Partial<Record<InstrumentId, string>> = {
    kick: 'KCK', snare: 'SNR', clap: 'CLP', rimshot: 'RIM',
    hatClosed: 'CHH', hatOpen: 'OHH', hatPedal: 'PHH', ride: 'RID', crash: 'CRS', splash: 'SPL',
    tomHi: 'TMH', tomMid: 'TMM', tomLow: 'TML',
    shaker: 'SHK', tambourine: 'TMB', cowbell: 'CWB', congaHi: 'CGH', congaLo: 'CGL',
    bongoHi: 'BGH', bongoLo: 'BGL', clave: 'CLV', block: 'WBL', agogo: 'AGO', guiro: 'GUI',
    cabasa: 'CAB', maracas: 'MRC', triangle: 'TRI',
  }
  return map[inst] ?? inst.toUpperCase()
}

export function tabToText(tab: DrumTab, title: string): string {
  const width = Math.max(...tab.rows.map((r) => r.label.length), 6)
  const lines: string[] = [title, '']
  const pad = ' '.repeat(width)
  tab.counts.forEach((c, i) => {
    lines.push(`${pad}  |${c.slice(0, tab.spb)}|`)
    for (const r of tab.rows) {
      lines.push(`${r.label.padEnd(width)}  |${r.bars[i] ?? ''}|`)
    }
    lines.push('')
  })
  lines.push('X accent · x normal · o ghost · digits = roll ×n · p probabilistic · - rest')
  return lines.join('\n')
}

/* ------------------------------------------------------------------ */
/* Standard staff notation (data model for the SVG score renderer)     */
/* ------------------------------------------------------------------ */

export type StaffHead = 'x' | 'note' | 'diamond'

export interface StaffNote {
  inst: InstrumentId
  step: number
  accent: boolean
  ghost: boolean
  roll?: number
  probabilistic?: boolean
}

export interface StaffBeat {
  /** absolute step of the beat start */
  step: number
  notes: StaffNote[]
}

export interface StaffBar {
  index: number
  beats: StaffBeat[]
}

export interface StaffModel {
  bars: StaffBar[]
  spb: number
  sub: Subdivision
  ts: TimeSignature
  /** diatonic steps above the bottom staff line (0 = bottom line E4) */
  positions: Map<InstrumentId, number>
  heads: Map<InstrumentId, StaffHead>
}

/** classic drum-chart staff positions (treble clef, bottom line E4 = 0) */
const STAFF_POSITIONS: Partial<Record<InstrumentId, number>> = {
  hatPedal: -2,
  kick: 1,      // bottom space F4
  rimshot: 0,   // bottom line E4
  tomLow: 2,    // G4 line
  clap: 3,      // A4 space
  tomMid: 4,    // B4 line
  snare: 5,     // C5 space
  cowbell: 6,   // D5 line
  tomHi: 7,     // E5 space
  ride: 8,      // F5 top line
  hatClosed: 9, // G5 above staff
  hatOpen: 10,  // A5 above (o marking drawn by renderer)
  crash: 11,    // B5 above
  splash: 12,   // C6 above
}

const STAFF_HEADS: Partial<Record<InstrumentId, StaffHead>> = {
  hatClosed: 'x', hatOpen: 'x', hatPedal: 'x', ride: 'x', crash: 'x', splash: 'x', rimshot: 'x',
  cowbell: 'diamond',
}

export function staffModel(p: GroovePattern): StaffModel {
  const spb = stepsPerBar(p.timeSignature, p.subdivision)
  const positions = new Map<InstrumentId, number>()
  const heads = new Map<InstrumentId, StaffHead>()
  // allocate known positions; unknown percussion stacks above the staff in
  // track order so every instrument gets its own readable row position
  let overflow = Math.max(11, ...Object.values(STAFF_POSITIONS).map((v) => v ?? 0)) + 1
  for (const t of p.tracks) {
    const known = STAFF_POSITIONS[t.inst]
    if (known !== undefined) positions.set(t.inst, known)
    else positions.set(t.inst, overflow++)
    const head = STAFF_HEADS[t.inst]
    if (head) heads.set(t.inst, head)
  }
  const bars: StaffBar[] = []
  for (let b = 0; b < p.bars; b++) {
    const beats: StaffBeat[] = []
    for (let beat = 0; beat < p.timeSignature.num; beat++) {
      const step = b * spb + beat * p.subdivision
      const notes: StaffNote[] = []
      for (let k = 0; k < p.subdivision; k++) {
        const s = step + k
        for (const e of p.events) {
          if (e.s !== s) continue
          notes.push({
            inst: (p.tracks.find((t) => t.id === e.t)?.inst ?? 'kick') as InstrumentId,
            step: s,
            accent: e.v >= 120,
            ghost: e.v < 75,
            roll: e.r && e.r > 1 ? e.r : undefined,
            probabilistic: e.p !== undefined,
          })
        }
      }
      beats.push({ step, notes })
    }
    bars.push({ index: b, beats })
  }
  return { bars, spb, sub: p.subdivision, ts: p.timeSignature, positions, heads }
}

/* ------------------------------------------------------------------ */
/* Indian notation — tabla bols + solkattu counts + tala structure     */
/* ------------------------------------------------------------------ */

export interface BolCell {
  bol: string
  accent: boolean
  ghost: boolean
  roll?: number
  probabilistic?: boolean
  /** instruments that produced this bol (for the legend) */
  from: InstrumentId[]
}

export interface BolBeat {
  /** absolute step of the beat start */
  step: number
  cells: (BolCell | null)[] // one slot per subdivision step
}

export interface BolBar {
  index: number
  beats: BolBeat[]
}

export interface IndianModel {
  bars: BolBar[]
  sub: Subdivision
  /** solkattu gait syllables for the subdivision (one per step) */
  gait: string[]
  tala: TalaInfo
}

export interface TalaInfo {
  name: string
  beats: number
  vibhag: number[]
  /** mark per vibhag: x = sam (clap), 0 = khali (wave), digits = claps */
  marks: string[]
}

const TALA_MAP: Record<number, { name: string; vibhag: number[]; marks: string[] }> = {
  16: { name: 'Teentaal', vibhag: [4, 4, 4, 4], marks: ['x', '2', '0', '3'] },
  14: { name: 'Dhamar', vibhag: [5, 2, 3, 4], marks: ['x', '2', '0', '3'] },
  12: { name: 'Ektaal', vibhag: [2, 2, 2, 2, 2, 2], marks: ['x', '2', '0', '2', '0', '2'] },
  10: { name: 'Jhaptaal', vibhag: [2, 3, 2, 3], marks: ['x', '2', '0', '3'] },
  9: { name: 'Matta taal', vibhag: [4, 2, 3], marks: ['x', '0', '2'] },
  8: { name: 'Keherwa', vibhag: [4, 4], marks: ['x', '2'] },
  7: { name: 'Rupak', vibhag: [3, 2, 2], marks: ['x', '2', '3'] },
  6: { name: 'Dadra', vibhag: [3, 3], marks: ['x', '2'] },
  5: { name: 'Jhampa', vibhag: [2, 1, 2], marks: ['x', '2', '3'] },
  4: { name: 'Bhajani (4-beat)', vibhag: [2, 2], marks: ['x', '2'] },
  3: { name: '3-beat cycle', vibhag: [3], marks: ['x'] },
  2: { name: '2-beat cycle', vibhag: [2], marks: ['x'] },
}

function talaFor(beats: number): TalaInfo {
  const known = TALA_MAP[beats]
  if (known) return { name: known.name, beats, vibhag: known.vibhag, marks: known.marks }
  return { name: `${beats}-beat cycle`, beats, vibhag: [beats], marks: ['x'] }
}

/** solkattu gait — the spoken count for each subdivision */
const GAIT: Record<Subdivision, string[]> = {
  1: ['tā'],
  2: ['tā', 'kā'],
  3: ['tā', 'ki', 'ṭa'],
  4: ['tā', 'kā', 'ḍi', 'mi'],
  6: ['tā', 'kā', 'ḍi', 'mi', 'tā', 'kā'],
}

type BolSpec = { main: string; ghost?: string }

/**
 * Bols follow tabla stroke logic:
 *   kick  = ge (left-hand bass) · snare = nā (ringing slap) · both together = dhā
 *   hats  = ka/thā (dry slaps) · toms = resonant tun/dhin/kat · cymbals ring like tun/tā
 */
const BOLS: Record<InstrumentId, BolSpec> = {
  kick: { main: 'ge', ghost: 'gê' },
  snare: { main: 'nā', ghost: 'ta' },
  clap: { main: 'thā', ghost: 'tha' },
  rimshot: { main: 'ta', ghost: 'ta' },
  hatClosed: { main: 'ka', ghost: 'ka' },
  hatPedal: { main: 'ka', ghost: 'ka' },
  hatOpen: { main: 'thā', ghost: 'tha' },
  ride: { main: 'tā', ghost: 'ta' },
  crash: { main: 'tun', ghost: 'tun' },
  splash: { main: 'ti', ghost: 'ti' },
  tomHi: { main: 'tun', ghost: 'tun' },
  tomMid: { main: 'dhin', ghost: 'dhin' },
  tomLow: { main: 'kat', ghost: 'kat' },
  shaker: { main: 'tha', ghost: 'tha' },
  maracas: { main: 'tha', ghost: 'tha' },
  cabasa: { main: 'tha', ghost: 'tha' },
  tambourine: { main: 'thā', ghost: 'tha' },
  guiro: { main: 'the', ghost: 'the' },
  cowbell: { main: 'ṭhā', ghost: 'ṭha' },
  congaHi: { main: 'tā', ghost: 'te' },
  congaLo: { main: 'ge', ghost: 'gê' },
  bongoHi: { main: 'tī', ghost: 'ti' },
  bongoLo: { main: 'ta', ghost: 'ta' },
  clave: { main: 'ṭhā', ghost: 'ṭha' },
  block: { main: 'ṭa', ghost: 'ṭa' },
  agogo: { main: 'ḍhā', ghost: 'ḍha' },
  triangle: { main: 'tīn', ghost: 'tīn' },
}

export function bolLegend(p: GroovePattern): { bol: string; inst: InstrumentId }[] {
  const seen = new Map<InstrumentId, string>()
  for (const t of p.tracks) {
    if (seen.has(t.inst)) continue
    seen.set(t.inst, BOLS[t.inst]?.main ?? '·')
  }
  return [...seen.entries()].map(([inst, bol]) => ({ bol, inst }))
}

export function indianModel(p: GroovePattern): IndianModel {
  const spb = stepsPerBar(p.timeSignature, p.subdivision)
  const trackInst = new Map(p.tracks.map((t) => [t.id, t.inst]))
  const gait = GAIT[p.subdivision]
  const bars: BolBar[] = []
  for (let b = 0; b < p.bars; b++) {
    const beats: BolBeat[] = []
    for (let beat = 0; beat < p.timeSignature.num; beat++) {
      const step = b * spb + beat * p.subdivision
      const cells: (BolCell | null)[] = []
      for (let k = 0; k < p.subdivision; k++) {
        const s = step + k
        const evs = p.events.filter((e) => e.s === s)
        if (evs.length === 0) {
          cells.push(null)
          continue
        }
        const withInst = evs.map((e) => ({ e, inst: trackInst.get(e.t) ?? ('kick' as InstrumentId) }))
        const hasKick = withInst.some((x) => x.inst === 'kick')
        const hasSnare = withInst.some((x) => x.inst === 'snare')
        // kick + snare together is THE tabla 'dhā' (bass + open ring)
        let bol: string
        if (hasKick && hasSnare) bol = 'dhā'
        else bol = BOLS[withInst[0].inst]?.main ?? '·'
        const lead = withInst[0].e
        const ghost = lead.v < 75
        if (ghost && !hasKick && hasSnare) bol = BOLS.snare.ghost ?? bol
        cells.push({
          bol,
          accent: lead.v >= 120,
          ghost,
          roll: lead.r && lead.r > 1 ? lead.r : undefined,
          probabilistic: lead.p !== undefined,
          from: withInst.map((x) => x.inst),
        })
      }
      beats.push({ step, cells })
    }
    bars.push({ index: b, beats })
  }
  const beatsPerBar = p.timeSignature.num
  const beatsTotal = beatsPerBar * p.bars
  // tala structure wraps the whole cycle (all bars) — pick a tala whose length
  // matches the full loop, else per-bar
  const cycle = talaFor(beatsPerBar === beatsTotal ? beatsTotal : beatsPerBar)
  return { bars, sub: p.subdivision, gait, tala: cycle }
}

export function indianToText(m: IndianModel, title: string): string {
  const lines: string[] = [
    title,
    `${m.tala.name} — ${m.tala.beats} beats (${m.tala.vibhag.join('+')})`,
    `claps/waves: ${m.tala.marks.join(' · ')}`,
    `count: ${m.gait.join(' ')}`,
    '',
  ]
  for (const bar of m.bars) {
    const cells: string[] = []
    for (const beat of bar.beats) {
      for (const c of beat.cells) cells.push(c ? (c.roll && c.roll > 1 ? `${c.bol}×${c.roll}` : c.bol) : '·')
    }
    lines.push(cells.join(' | '))
  }
  return lines.join('\n')
}
