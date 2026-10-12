import type { GroovePattern } from '../types'
import { drumTab, tabToText, indianModel, indianToText } from '../notation'
import { defaultMidiMapping } from './midi'
import { INSTRUMENTS } from '../instruments'
import { triggerDownload } from './wav'

/**
 * Text export — drum tab + Indian bol notation as a plain .txt file
 * (pastes cleanly into forums, README files, lesson notes).
 */

export function downloadTxt(p: GroovePattern): void {
  const tab = drumTab(p)
  const ind = indianModel(p)
  const gm = defaultMidiMapping()
  const lines: string[] = []

  lines.push(`GROOVEMAP — ${p.title.toUpperCase()}`)
  lines.push('='.repeat(Math.min(72, p.title.length + 14)))
  lines.push(`${p.family} · ${p.genres.join(' / ')}`)
  lines.push(`${p.bpm} BPM · ${p.timeSignature.num}/${p.timeSignature.den} · ${p.bars} bars · ${p.feel} · 1/${p.subdivision * 4} notes${p.swing > 0 ? ` · swing ${Math.round(p.swing * 100)}%` : ''}`)
  lines.push('')
  lines.push(tabToText(tab, p.title))
  lines.push('')
  lines.push(`INDIAN NOTATION — ${ind.tala.name} (vibhag ${ind.tala.vibhag.join('+')}, claps ${ind.tala.marks.join(' ')})`)
  lines.push('-'.repeat(60))
  lines.push(indianToText(ind, p.title))
  lines.push('')
  lines.push('GENERAL-MIDI MAP')
  lines.push('-'.repeat(40))
  for (const t of p.tracks) {
    const inst = INSTRUMENTS[t.inst] ?? INSTRUMENTS.kick
    lines.push(`  ${inst.short.padEnd(4)} ${inst.name.padEnd(16)} GM ${gm[t.inst] ?? inst.gm}`)
  }
  lines.push('')
  lines.push(`construction: ${p.learning.construction}`)
  lines.push(`provenance: ${p.source.type} — ${p.source.note}`)
  lines.push('')
  lines.push('Generated from Groovemap')

  triggerDownload(new Blob([lines.join('\n')], { type: 'text/plain' }), `${p.slug}-tab.txt`)
}
