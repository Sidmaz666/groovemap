import type { GroovePattern } from '../types'
import { stepsPerBar } from '../types'
import { INSTRUMENTS, type InstrumentId } from '../instruments'

/**
 * Standard MIDI File writer — no dependencies.
 *
 * Two formats:
 *  - Type 0: single track, all percussion on channel 10 (GM map).
 *  - Type 1: one track per instrument (tempo/conductor track first) — drops
 *    straight into a DAW with each drum isolated for mixing/processing.
 *
 * Timing: PPQ 480. Bar length = quartersPerBar × 480 ticks (den 8 meters
 * count the eighth note as half a quarter). Event deltas are computed from a
 * properly sorted absolute-tick event list, so overlapping note-offs can never
 * corrupt the running status of the stream.
 */

export const PPQ = 480

export type MidiMapping = Record<string, number>

export function defaultMidiMapping(): MidiMapping {
  const map: MidiMapping = {}
  for (const inst of Object.values(INSTRUMENTS)) {
    map[inst.id] = inst.gm
  }
  return map
}

function barLengthInTicks(p: GroovePattern): number {
  // bars are measured in quarter-note ticks
  const quartersPerBar = p.timeSignature.den === 4 ? p.timeSignature.num : p.timeSignature.num / 2
  return Math.round(quartersPerBar * PPQ)
}

function ticksPerStep(p: GroovePattern): number {
  const spb = stepsPerBar(p.timeSignature, p.subdivision)
  return barLengthInTicks(p) / spb
}

export interface MidiNote {
  tick: number
  note: number
  velocity: number
  dur: number
  /** instrument id — used by the multi-track writer to split voices */
  inst?: InstrumentId
}

export function buildMidiNotes(p: GroovePattern, mapping: MidiMapping = defaultMidiMapping()): MidiNote[] {
  const tps = ticksPerStep(p)
  const notes: MidiNote[] = []
  for (const e of p.events) {
    const track = p.tracks.find((t) => t.id === e.t)
    if (!track) continue
    const note = mapping[track.inst] ?? INSTRUMENTS[track.inst as InstrumentId]?.gm ?? 36
    const dur = Math.max(30, Math.round(tps * 0.45))
    const ratchet = e.r ?? 1
    if (ratchet > 1) {
      const spacing = Math.max(10, Math.round(tps * 0.9 / ratchet))
      for (let i = 0; i < ratchet; i++) {
        notes.push({ tick: Math.round(e.s * tps + i * spacing), note, velocity: Math.round(e.v * (1 - i * 0.12)), dur, inst: track.inst as InstrumentId })
      }
    } else {
      notes.push({ tick: Math.round(e.s * tps), note, velocity: e.v, dur, inst: track.inst as InstrumentId })
    }
  }
  notes.sort((a, b) => a.tick - b.tick)
  return notes
}

function varLen(n: number): number[] {
  const bytes = [n & 0x7f]
  n >>= 7
  while (n > 0) {
    bytes.unshift((n & 0x7f) | 0x80)
    n >>= 7
  }
  return bytes
}

function str(s: string): number[] {
  return [...s].map((c) => c.charCodeAt(0))
}

function u16(n: number): number[] {
  return [(n >> 8) & 0xff, n & 0xff]
}

function u32(n: number): number[] {
  return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

/** meta: tempo + time signature + name — always delta 0 from track start */
function metaEvents(p: GroovePattern, tempo: number, name?: string): number[] {
  const usPerQuarter = Math.round(60000000 / tempo)
  const out: number[] = []
  out.push(...varLen(0), 0xff, 0x51, 0x03, (usPerQuarter >> 16) & 0xff, (usPerQuarter >> 8) & 0xff, usPerQuarter & 0xff)
  out.push(...varLen(0), 0xff, 0x58, 0x04, p.timeSignature.num, Math.log2(p.timeSignature.den), 24, 8)
  if (name) {
    const nm = str(name.slice(0, 120))
    out.push(...varLen(0), 0xff, 0x03, ...varLen(nm.length), ...nm)
  }
  return out
}

interface AbsEvent {
  tick: number
  /** note-offs sort before note-ons at the same tick */
  order: number
  bytes: number[]
}

/** convert sorted notes into an absolute event stream (correct delta math) */
function notesToEvents(notes: MidiNote[], channel: number): AbsEvent[] {
  const ev: AbsEvent[] = []
  for (const n of notes) {
    ev.push({ tick: n.tick, order: 1, bytes: [0x90 | channel, n.note & 0x7f, Math.max(1, Math.min(127, Math.round(n.velocity)))] })
    ev.push({ tick: n.tick + n.dur, order: 0, bytes: [0x80 | channel, n.note & 0x7f, 0] })
  }
  ev.sort((a, b) => a.tick - b.tick || a.order - b.order)
  return ev
}

function writeTrack(events: AbsEvent[], leading: number[]): number[] {
  const track: number[] = [...leading]
  let last = 0
  for (const e of events) {
    track.push(...varLen(e.tick - last), ...e.bytes)
    last = e.tick
  }
  track.push(...varLen(0), 0xff, 0x2f, 0x00)
  return track
}

function wrapFile(tracks: number[][], type: 0 | 1): Uint8Array {
  const bytes: number[] = []
  bytes.push(...str('MThd'), ...u32(6), ...u16(type), ...u16(tracks.length), ...u16(PPQ))
  for (const t of tracks) bytes.push(...str('MTrk'), ...u32(t.length), ...t)
  return new Uint8Array(bytes)
}

/** Type 0 — everything on one channel-10 track */
export function renderMidiFile(p: GroovePattern, bpm?: number, mapping?: MidiMapping): Uint8Array {
  const tempo = bpm ?? p.bpm
  const track = writeTrack(notesToEvents(buildMidiNotes(p, mapping), 9), metaEvents(p, tempo, `Groovemap — ${p.title}`))
  return wrapFile([track], 0)
}

/** Type 1 — conductor track + one track per instrument (named) */
export function renderMidiFileMulti(p: GroovePattern, bpm?: number, mapping?: MidiMapping): Uint8Array {
  const tempo = bpm ?? p.bpm
  const notes = buildMidiNotes(p, mapping)
  const tracks: number[][] = [writeTrack([], metaEvents(p, tempo, `Groovemap — ${p.title}`))]

  // preserve a musical top-down order (cymbals → drums → percussion)
  const seen: InstrumentId[] = []
  for (const n of notes) {
    if (n.inst && !seen.includes(n.inst)) seen.push(n.inst)
  }
  const rank = (id: InstrumentId) => {
    const i = TAB_RANK.indexOf(id as never)
    return i === -1 ? TAB_RANK.length : i
  }
  seen.sort((a, b) => rank(a) - rank(b))

  for (const inst of seen) {
    const name = INSTRUMENTS[inst]?.name ?? inst
    const gm = mapping?.[inst] ?? INSTRUMENTS[inst]?.gm ?? 36
    const evs: AbsEvent[] = []
    for (const n of notes) {
      if (n.inst !== inst) continue
      evs.push({ tick: n.tick, order: 1, bytes: [0x90 | 9, n.note & 0x7f, Math.max(1, Math.min(127, Math.round(n.velocity)))] })
      evs.push({ tick: n.tick + n.dur, order: 0, bytes: [0x80 | 9, n.note & 0x7f, 0] })
    }
    evs.sort((a, b) => a.tick - b.tick || a.order - b.order)
    const label = str(`${name} (GM ${gm})`.slice(0, 120))
    const leading: number[] = [...varLen(0), 0xff, 0x03, ...varLen(label.length), ...label]
    tracks.push(writeTrack(evs, leading))
  }
  return wrapFile(tracks, 1)
}

/** stable top-down ordering shared by the multi-track writer */
const TAB_RANK: string[] = [
  'crash', 'splash', 'ride', 'hatOpen', 'hatPedal', 'hatClosed',
  'tomHi', 'tomMid', 'tomLow', 'snare', 'clap', 'rimshot', 'kick',
  'shaker', 'maracas', 'cabasa', 'guiro', 'tambourine', 'cowbell', 'agogo',
  'clave', 'block', 'triangle', 'bongoHi', 'bongoLo', 'congaHi', 'congaLo',
]

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function downloadMidi(p: GroovePattern, bpm?: number, mapping?: MidiMapping) {
  const data = renderMidiFile(p, bpm, mapping)
  triggerDownload(new Blob([data as unknown as BlobPart], { type: 'audio/midi' }), `${p.slug}.mid`)
}

export function downloadMidiMulti(p: GroovePattern, bpm?: number, mapping?: MidiMapping) {
  const data = renderMidiFileMulti(p, bpm, mapping)
  triggerDownload(new Blob([data as unknown as BlobPart], { type: 'audio/midi' }), `${p.slug}-multitrack.mid`)
}
