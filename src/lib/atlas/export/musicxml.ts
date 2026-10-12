import type { GroovePattern } from '../types'
import { stepsPerBar } from '../types'
import { INSTRUMENTS, type InstrumentId } from '../instruments'
import { staffModel } from '../notation'
import { triggerDownload } from './wav'

/**
 * MusicXML export — unpitched-percussion drumset part that opens in MuseScore,
 * Finale, Sibelius, Dorico and Cubase's score editor. Pitch positions reuse
 * the app's classic drum-chart mapping (kick F4, snare C5, hats G5 …).
 */

const STEP_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

/** diatonic steps above E4 → (display step, display octave) */
function positionToStepOctave(n: number): { step: string; octave: number } {
  const abs = 4 * 7 + 2 + n // E4 = octave 4, index 2
  return { step: STEP_NAMES[((abs % 7) + 7) % 7], octave: Math.floor(abs / 7) }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function noteType(durInQuarters: number): string {
  const table: [number, string][] = [
    [4, 'whole'], [3, 'half'], [2, 'half'], [1.5, 'quarter'], [1, 'quarter'],
    [0.75, 'eighth'], [0.5, 'eighth'], [0.375, '16th'], [0.25, '16th'],
    [0.1875, '32nd'], [0.125, '32nd'], [0.0625, '64th'],
  ]
  let best = table[table.length - 1]
  for (const t of table) {
    if (durInQuarters >= t[0] - 1e-6) {
      best = t
      break
    }
  }
  return best[1]
}

interface XEvent {
  /** absolute divisions from measure start */
  pos: number
  dur: number
  inst: InstrumentId
  vel: number
}

export function renderMusicXml(p: GroovePattern): string {
  const sub = p.subdivision
  const divisionsPerStep = 48 // high resolution so ratchets stay representable
  const divisions = divisionsPerStep * sub // divisions per quarter note
  const spb = stepsPerBar(p.timeSignature, p.subdivision)

  const model = staffModel(p)
  const positions = model.positions

  const insts: InstrumentId[] = []
  for (const t of p.tracks) {
    if (!insts.includes(t.inst as InstrumentId)) insts.push(t.inst as InstrumentId)
  }

  const out: string[] = []
  out.push('<?xml version="1.0" encoding="UTF-8"?>')
  out.push('<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">')
  out.push('<score-partwise version="4.0">')
  out.push(`  <work><work-title>${esc(p.title)}</work-title></work>`)
  out.push('  <identification>')
  out.push('    <creator type="composer">Groovemap</creator>')
  out.push(`    <encoding><software>Groovemap</software><supports element="accidental" type="no"/></encoding>`)
  out.push('  </identification>')
  out.push('  <part-list>')
  out.push('    <score-part id="P1">')
  out.push('      <part-name>Drumset</part-name>')
  out.push('      <part-abbreviation>D.S.</part-abbreviation>')
  for (let i = 0; i < insts.length; i++) {
    const inst = INSTRUMENTS[insts[i]] ?? INSTRUMENTS.kick
    out.push(`      <score-instrument id="P1-I${i + 1}"><instrument-name>${esc(inst.name)}</instrument-name></score-instrument>`)
    out.push(`      <midi-instrument id="P1-I${i + 1}"><midi-channel>10</midi-channel><midi-program>1</midi-program><midi-unpitched>${inst.gm + 1}</midi-unpitched></midi-instrument>`)
  }
  out.push('    </score-part>')
  out.push('  </part-list>')
  out.push('  <part id="P1">')

  for (let bar = 0; bar < p.bars; bar++) {
    out.push(`    <measure number="${bar + 1}">`)
    if (bar === 0) {
      out.push('      <attributes>')
      out.push(`        <divisions>${divisions}</divisions>`)
      out.push('        <key><fifths>0</fifths></key>')
      out.push(`        <time><beats>${p.timeSignature.num}</beats><beat-type>${p.timeSignature.den}</beat-type></time>`)
      out.push('        <clef><sign>percussion</sign></clef>')
      out.push('      </attributes>')
      if (p.swing > 0.05) {
        out.push('      <direction placement="above"><direction-type><words>swing</words></direction-type></direction>')
      }
    }

    // expand events for this bar
    const evs: XEvent[] = []
    for (const e of p.events) {
      const track = p.tracks.find((t) => t.id === e.t)
      if (!track) continue
      const stepInBar = e.s - bar * spb
      if (stepInBar < 0 || stepInBar >= spb) continue
      const ratchet = e.r ?? 1
      if (ratchet > 1) {
        for (let i = 0; i < ratchet; i++) {
          evs.push({
            pos: Math.round(stepInBar * divisionsPerStep + ((0.9 * divisionsPerStep) / ratchet) * i),
            dur: Math.max(6, Math.round(divisionsPerStep * 0.45)),
            inst: track.inst as InstrumentId,
            vel: Math.max(1, Math.round(e.v * (1 - i * 0.12))),
          })
        }
      } else {
        evs.push({ pos: stepInBar * divisionsPerStep, dur: Math.max(6, Math.round(divisionsPerStep * 0.45)), inst: track.inst as InstrumentId, vel: e.v })
      }
    }
    evs.sort((a, b) => a.pos - b.pos)

    // merge same-position events into chords
    const chordGroups: XEvent[][] = []
    for (const e of evs) {
      const g = chordGroups[chordGroups.length - 1]
      if (g && g[0].pos === e.pos) g.push(e)
      else chordGroups.push([e])
    }

    // emit with rest padding
    let cursor = 0
    for (const group of chordGroups) {
      const pos = group[0].pos
      if (pos > cursor) {
        const gap = pos - cursor
        out.push('      <note>')
        out.push('        <rest/>')
        out.push(`        <duration>${gap}</duration>`)
        out.push('        <voice>1</voice>')
        out.push(`        <type>${noteType(gap / divisions)}</type>`)
        out.push('      </note>')
      }
      group.forEach((e, idx) => {
        const def = INSTRUMENTS[e.inst] ?? INSTRUMENTS.kick
        const po = positions.get(e.inst) ?? 8
        const { step, octave } = positionToStepOctave(po)
        out.push('      <note>')
        if (idx > 0) out.push('        <chord/>')
        out.push('        <unpitched>')
        out.push(`          <display-step>${step}</display-step>`)
        out.push(`          <display-octave>${octave}</display-octave>`)
        out.push('        </unpitched>')
        out.push(`        <duration>${e.dur}</duration>`)
        out.push(`        <instrument id="P1-I${insts.indexOf(e.inst) + 1}"/>`)
        out.push('        <voice>1</voice>')
        out.push(`        <type>${noteType(e.dur / divisions)}</type>`)
        if (sub === 3 || sub === 6) {
          out.push('        <time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>')
        }
        if (e.vel >= 120) out.push('        <notations><accidental-mark>accent</accidental-mark></notations>')
        if (e.vel > 0 && e.vel < 60) out.push('        <notehead paren="yes">normal</notehead>')
        out.push(`        <stem>up</stem>`)
        out.push('      </note>')
      })
      cursor = pos + group[0].dur
    }
    if (cursor < spb * divisionsPerStep) {
      const gap = spb * divisionsPerStep - cursor
      out.push('      <note>')
      out.push(cursor === 0 ? '        <rest measure="yes"/>' : '        <rest/>')
      out.push(`        <duration>${gap}</duration>`)
      out.push('        <voice>1</voice>')
      out.push(`        <type>${noteType(gap / divisions)}</type>`)
      out.push('      </note>')
    }
    out.push('    </measure>')
  }

  out.push('  </part>')
  out.push('</score-partwise>')
  return out.join('\n')
}

export function downloadMusicXml(p: GroovePattern) {
  const xml = renderMusicXml(p)
  triggerDownload(new Blob([xml], { type: 'application/vnd.recordare.musicxml+xml' }), `${p.slug}.musicxml`)
}
