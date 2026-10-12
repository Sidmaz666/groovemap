'use client'

import type { GroovePattern } from '@/lib/atlas/types'
import { stepsPerBar, velocityTier } from '@/lib/atlas/types'
import { stepLabels } from '@/lib/atlas/rhythm'
import { instrumentOf } from '@/lib/atlas/instruments'
import { drumTab, indianModel } from '@/lib/atlas/notation'
import { FAMILY_LIST } from '@/lib/atlas/patterns'
import { defaultMidiMapping } from '@/lib/atlas/export/midi'

/**
 * PrintSheet — a clean, black-on-white pattern card used for printing and
 * PNG diagram export. Rendered hidden on screen; print CSS reveals it.
 */

export function PrintSheet({ pattern }: { pattern: GroovePattern }) {
  const spb = stepsPerBar(pattern.timeSignature, pattern.subdivision)
  const labels = stepLabels(pattern.timeSignature, pattern.subdivision)
  const famLabel = FAMILY_LIST.find((f) => f.key === pattern.family)?.label ?? pattern.family
  const mapping = defaultMidiMapping()
  const tab = drumTab(pattern)
  const indian = indianModel(pattern)

  const hitAt = (trackId: string, step: number) => pattern.events.find((e) => e.t === trackId && e.s === step)

  const tabText = (t: ReturnType<typeof drumTab>, steps: number, bars: number): string => {
    const width = Math.max(...t.rows.map((r) => r.label.length), 6)
    const pad = ' '.repeat(width)
    const lines: string[] = [`${pad}  |${labels.slice(0, steps).join('')}|`]
    for (const row of t.rows) {
      lines.push(`${row.label.padEnd(width)}  ${row.bars.map((b) => `|${b}|`).join('')}`)
    }
    void bars
    return lines.join('\n')
  }

  return (
    <div className="print-sheet hidden" aria-hidden>
      <div style={{ background: '#fff', color: '#111', padding: '28px 32px', fontFamily: 'ui-monospace, monospace', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '3px solid #111', paddingBottom: 10 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.08em' }}>GROOVEMAP — PATTERN SHEET</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{pattern.title}</div>
          </div>
          <div style={{ fontSize: 11, textAlign: 'right', lineHeight: 1.7 }}>
            <div>{famLabel} · {pattern.genres.join(', ')}</div>
            <div>{pattern.timeSignature.num}/{pattern.timeSignature.den} · {pattern.bpm} BPM ({pattern.tempoRange[0]}–{pattern.tempoRange[1]})</div>
            <div>{pattern.bars} bar(s) · feel: {pattern.feel} · {pattern.difficulty}</div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 18 }}>
          <thead>
            <tr>
              <th style={{ width: 110, textAlign: 'left', fontSize: 10, padding: 2 }}>TRACK</th>
              {Array.from({ length: pattern.bars }, (_, b) => (
                <th key={b} colSpan={spb} style={{ fontSize: 9, borderBottom: '1px solid #999', padding: 2, textAlign: 'left' }}>
                  BAR {b + 1}
                </th>
              ))}
            </tr>
            <tr>
              <th />
              {labels.map((l, i) => (
                <th key={i} style={{ fontSize: 8, fontWeight: i % pattern.subdivision === 0 ? 700 : 400, padding: '2px 0', textAlign: 'center', color: '#555' }}>
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pattern.tracks.map((t) => {
              const inst = instrumentOf(t.inst)
              return (
                <tr key={t.id}>
                  <td style={{ fontSize: 10, fontWeight: 700, padding: '3px 4px 3px 0', whiteSpace: 'nowrap' }}>{inst.name}</td>
                  {Array.from({ length: spb * pattern.bars }, (_, s) => {
                    const ev = hitAt(t.id, s)
                    const stepInBar = s % spb
                    const tier = ev ? velocityTier(ev.v) : null
                    return (
                      <td
                        key={s}
                        style={{
                          border: '1px solid #ccc',
                          borderLeft: stepInBar === 0 ? '2px solid #111' : stepInBar % pattern.subdivision === 0 ? '1px solid #666' : '1px solid #ccc',
                          height: 18,
                          padding: 0,
                          textAlign: 'center',
                          fontSize: 9,
                          background: tier ? (tier === 'accent' ? '#111' : tier === 'ghost' ? '#fff' : '#555') : 'transparent',
                          color: tier === 'ghost' ? '#111' : '#fff',
                          fontWeight: 700,
                        }}
                      >
                        {tier === 'ghost' ? '○' : tier ? '●' : ''}
                        {ev?.p !== undefined ? '?' : ''}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>

        <div style={{ display: 'flex', gap: 24, marginTop: 16, fontSize: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, borderBottom: '1px solid #111', marginBottom: 4, paddingBottom: 2 }}>HOW IT WORKS</div>
            <div style={{ lineHeight: 1.6 }}>{pattern.learning.construction}</div>
            <div style={{ lineHeight: 1.6, marginTop: 6 }}>{pattern.summary}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, borderBottom: '1px solid #111', marginBottom: 4, paddingBottom: 2 }}>LEGEND & MIDI MAP</div>
            {pattern.tracks.map((t) => {
              const inst = instrumentOf(t.inst)
              return (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', lineHeight: 1.55 }}>
                  <span>● {inst.name}</span>
                  <span>GM note {mapping[inst.id] ?? inst.gm}</span>
                </div>
              )
            })}
            <div style={{ marginTop: 4, color: '#555' }}>○ ghost note · ● hit · ? probabilistic · ×n roll</div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, borderBottom: '1px solid #111', marginBottom: 6, paddingBottom: 2, fontSize: 11 }}>DRUM TAB</div>
          <pre style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10.5, lineHeight: 1.7, margin: 0, whiteSpace: 'pre' }}>
            {tabText(tab, spb, pattern.bars)}
          </pre>
          <div style={{ fontSize: 8.5, color: '#555', marginTop: 2 }}>
            X accent · x normal · o ghost · digits = roll ×n · p probabilistic · - rest
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, borderBottom: '1px solid #111', marginBottom: 6, paddingBottom: 2, fontSize: 11 }}>
            INDIAN NOTATION — {indian.tala.name.toUpperCase()} ({indian.tala.beats} BEATS · {indian.tala.vibhag.join('+')})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ fontSize: 10 }}>
              <span style={{ color: '#555' }}>claps: </span>
              {indian.tala.marks.join(' · ')}
            </div>
            <div style={{ fontSize: 10 }}>
              <span style={{ color: '#555' }}>count: </span>
              {indian.gait.join(' ')}
            </div>
          </div>
          <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {indian.bars.map((bar) => {
              const cells: string[] = []
              for (const beat of bar.beats) {
                for (const c of beat.cells) cells.push(c ? (c.roll && c.roll > 1 ? `${c.bol}×${c.roll}` : c.bol) : '·')
              }
              return (
                <div key={bar.index} style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>
                  {pattern.bars > 1 ? <span style={{ color: '#555' }}>bar {bar.index + 1}: </span> : null}
                  {cells.join(' | ')}
                </div>
              )
            })}
          </div>
          <div style={{ fontSize: 8.5, color: '#555', marginTop: 4 }}>
            x = sam (clap) · 0 = khali (wave) · solkattu count row · dhā = kick + snare · ge kick · nā snare · ka hats
          </div>
        </div>

        <div style={{ marginTop: 14, fontSize: 9, color: '#555', borderTop: '1px solid #ccc', paddingTop: 6 }}>
          {pattern.source.type === 'traditional' ? 'Traditional timeline — ' : ''}
          {pattern.source.note} · grooves shipped with Groovemap are original study compositions or
          commonly-documented practice patterns; see the About page for licensing and attribution.
        </div>
      </div>
    </div>
  )
}
