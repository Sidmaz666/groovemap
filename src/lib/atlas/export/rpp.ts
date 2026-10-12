import type { GroovePattern } from '../types'
import { stepsPerBar } from '../types'
import { INSTRUMENTS, type InstrumentId } from '../instruments'
import { PPQ, buildMidiNotes } from './midi'
import { triggerDownload } from './wav'

/**
 * REAPER project export (.rpp) — a native REAPER project with the groove as a
 * MIDI item (inline MIDI source, PPQ 960 basis, GM percussion channel 10).
 * Open in REAPER and the pattern appears on track 1, ready to route to any
 * drum plugin (ReaDrum, Superior Drummer, etc.).
 */

function guid(): string {
  const h = '0123456789ABCDEF'
  let s = '{'
  for (let i = 0; i < 8; i++) s += h[Math.floor(Math.random() * 16)]
  s += '-'
  for (let i = 0; i < 4; i++) s += h[Math.floor(Math.random() * 16)]
  s += '-'
  for (let i = 0; i < 4; i++) s += h[Math.floor(Math.random() * 16)]
  s += '-'
  for (let i = 0; i < 4; i++) s += h[Math.floor(Math.random() * 16)]
  s += '-'
  for (let i = 0; i < 12; i++) s += h[Math.floor(Math.random() * 16)]
  return s + '}'
}

export function renderReaperProject(p: GroovePattern, bpm?: number): string {
  const tempo = bpm ?? p.bpm
  const spb = stepsPerBar(p.timeSignature, p.subdivision)
  // beats (quarter notes) of pattern content
  const barBeats = p.timeSignature.den === 4 ? p.timeSignature.num : p.timeSignature.num / 2
  const lengthBeats = barBeats * p.bars

  // MIDI notes on PPQ 480 basis → beats; REAPER inline events are beat-based
  const notes = buildMidiNotes(p).map((n) => ({
    beat: n.tick / PPQ,
    dur: n.dur / PPQ,
    note: n.note,
    vel: Math.max(1, Math.min(127, n.velocity)),
  }))
  notes.sort((a, b) => a.beat - b.beat)

  const lines: string[] = []
  lines.push(`<REAPER_PROJECT 0.1 "Groovemap/1.0" ${Math.floor(Date.now() / 1000)}`)
  lines.push('  RIPPLE 0')
  lines.push('  GROUPOVERRIDE 0 0 0')
  lines.push('  AUTOXFADE 1')
  lines.push(`  TEMPO ${tempo} ${p.timeSignature.num} ${p.timeSignature.den}`)
  lines.push('  PLAYRATE 1 0 1 0')
  lines.push(`  SELECTION 0 0`)
  lines.push(`  SELECTION2 0 0`)
  lines.push('  MASTERAUTOMODE 0')
  lines.push('  MASTERTRACKHEIGHT 0 0')
  lines.push('  <TRACK')
  lines.push(`    NAME "Groovemap — ${p.title.slice(0, 60)}"`)
  lines.push('    PEAKCOL 16576')
  lines.push('    BEAT -1')
  lines.push('    AUTOMODE 0')
  lines.push('    PANLAW 1')
  lines.push('    PERF 0')
  lines.push('    MIDIOUT -1')
  lines.push('    MAINSEND 1 0')
  lines.push('    NCHAN 2')
  lines.push('    FX 1')
  lines.push(`    TRACKID ${guid()}`)
  lines.push('    <ITEM')
  lines.push('      POSITION 0')
  lines.push('      SNAPOFFS 0')
  lines.push(`      LENGTH ${lengthBeats}`)
  lines.push('      LOOP 1')
  lines.push('      ALLTAKES 0')
  lines.push('      FADEIN 1 0 0 1 0 0 0')
  lines.push('      FADEOUT 1 0 0 1 0 0 0')
  lines.push('      MUTE 0 0')
  lines.push('      SEL 0')
  lines.push(`      IGUID ${guid()}`)
  lines.push('      IID 1')
  lines.push(`      NAME "${p.slug}"`)
  lines.push('      VOLPAN 1 0 1 -1')
  lines.push('      SOFFS 0 0')
  lines.push('      PLAYRATE 1 1 0 -1 0 0.0025')
  lines.push('      CHANMODE 0')
  lines.push(`      GUID ${guid()}`)
  lines.push('      <SOURCE MIDI')
  lines.push('        HASDATA 1 960 1')
  let last = 0
  for (const n of notes) {
    const off = (n.beat - last).toFixed(6)
    lines.push(`        E ${off} ${n.note} ${n.vel} 9 ${n.beat.toFixed(6)} ${(n.beat + n.dur).toFixed(6)}`)
    last = n.beat
  }
  lines.push('        QUANTIZE-HD 0.25')
  lines.push('      >')
  lines.push('    >')
  lines.push('  >')
  lines.push(`  <!-- ${spb} steps/bar · ${p.bars} bars · subdivision ${p.subdivision} · GM percussion map -->`)
  lines.push('>')
  return lines.join('\n')
}

export function downloadReaper(p: GroovePattern, bpm?: number) {
  const text = renderReaperProject(p, bpm)
  triggerDownload(new Blob([text], { type: 'application/octet-stream' }), `${p.slug}.rpp`)
}

/** list of instruments used — exported for the DAW guide copy */
export function usedInstruments(p: GroovePattern): InstrumentId[] {
  const out: InstrumentId[] = []
  for (const t of p.tracks) if (!out.includes(t.inst as InstrumentId)) out.push(t.inst as InstrumentId)
  return out.map((i) => INSTRUMENTS[i] ? i : i)
}
