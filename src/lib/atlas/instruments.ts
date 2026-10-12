import type { InstrumentGroup } from './types'
export type { InstrumentGroup }

export type InstrumentId =
  | 'kick'
  | 'snare'
  | 'clap'
  | 'rimshot'
  | 'hatClosed'
  | 'hatOpen'
  | 'hatPedal'
  | 'ride'
  | 'crash'
  | 'splash'
  | 'tomHi'
  | 'tomMid'
  | 'tomLow'
  | 'shaker'
  | 'tambourine'
  | 'cowbell'
  | 'congaHi'
  | 'congaLo'
  | 'bongoHi'
  | 'bongoLo'
  | 'clave'
  | 'block'
  | 'agogo'
  | 'guiro'
  | 'cabasa'
  | 'maracas'
  | 'triangle'

export interface InstrumentDef {
  id: InstrumentId
  name: string
  /** very short label for dense grids */
  short: string
  group: InstrumentGroup
  /** General MIDI percussion note (GM drum map) */
  gm: number
  /** stable color slot for multi-track visuals */
  color: number
  /** default synth voice character */
  voice: VoiceKind
}

export type VoiceKind =
  | 'kick'
  | 'snare'
  | 'clap'
  | 'hat'
  | 'cymbal'
  | 'tom'
  | 'rim'
  | 'shaker'
  | 'tamb'
  | 'cowbell'
  | 'conga'
  | 'bongo'
  | 'clave'
  | 'block'
  | 'percHit'

export const INSTRUMENTS: Record<InstrumentId, InstrumentDef> = {
  kick:        { id: 'kick',        name: 'Kick',          short: 'KCK', group: 'drums',      gm: 36, color: 0, voice: 'kick' },
  snare:       { id: 'snare',       name: 'Snare',         short: 'SNR', group: 'drums',      gm: 38, color: 1, voice: 'snare' },
  clap:        { id: 'clap',        name: 'Clap',          short: 'CLP', group: 'drums',      gm: 39, color: 1, voice: 'clap' },
  rimshot:     { id: 'rimshot',     name: 'Rimshot',       short: 'RIM', group: 'drums',      gm: 37, color: 1, voice: 'rim' },
  hatClosed:   { id: 'hatClosed',   name: 'Closed Hi-Hat', short: 'CHH', group: 'cymbals',    gm: 42, color: 2, voice: 'hat' },
  hatOpen:     { id: 'hatOpen',     name: 'Open Hi-Hat',   short: 'OHH', group: 'cymbals',    gm: 46, color: 2, voice: 'hat' },
  hatPedal:    { id: 'hatPedal',    name: 'Pedal Hi-Hat',  short: 'PHH', group: 'cymbals',    gm: 44, color: 2, voice: 'hat' },
  ride:        { id: 'ride',        name: 'Ride',          short: 'RID', group: 'cymbals',    gm: 51, color: 2, voice: 'cymbal' },
  crash:       { id: 'crash',       name: 'Crash',         short: 'CRS', group: 'cymbals',    gm: 49, color: 2, voice: 'cymbal' },
  splash:      { id: 'splash',      name: 'Splash',        short: 'SPL', group: 'cymbals',    gm: 55, color: 2, voice: 'cymbal' },
  tomHi:       { id: 'tomHi',       name: 'High Tom',      short: 'TMH', group: 'drums',      gm: 50, color: 3, voice: 'tom' },
  tomMid:      { id: 'tomMid',      name: 'Mid Tom',       short: 'TMM', group: 'drums',      gm: 47, color: 3, voice: 'tom' },
  tomLow:      { id: 'tomLow',      name: 'Low Tom',       short: 'TML', group: 'drums',      gm: 43, color: 3, voice: 'tom' },
  shaker:      { id: 'shaker',      name: 'Shaker',        short: 'SHK', group: 'percussion', gm: 70, color: 4, voice: 'shaker' },
  tambourine:  { id: 'tambourine',  name: 'Tambourine',    short: 'TMB', group: 'percussion', gm: 54, color: 4, voice: 'tamb' },
  cowbell:     { id: 'cowbell',     name: 'Cowbell',       short: 'CWB', group: 'percussion', gm: 56, color: 4, voice: 'cowbell' },
  congaHi:     { id: 'congaHi',     name: 'Conga (hi)',    short: 'CGH', group: 'percussion', gm: 62, color: 4, voice: 'conga' },
  congaLo:     { id: 'congaLo',     name: 'Conga (lo)',    short: 'CGL', group: 'percussion', gm: 64, color: 4, voice: 'conga' },
  bongoHi:     { id: 'bongoHi',     name: 'Bongo (hi)',    short: 'BGH', group: 'percussion', gm: 60, color: 4, voice: 'bongo' },
  bongoLo:     { id: 'bongoLo',     name: 'Bongo (lo)',    short: 'BGL', group: 'percussion', gm: 61, color: 4, voice: 'bongo' },
  clave:       { id: 'clave',       name: 'Claves',        short: 'CLV', group: 'percussion', gm: 75, color: 4, voice: 'clave' },
  block:       { id: 'block',       name: 'Wood Block',    short: 'WBL', group: 'percussion', gm: 76, color: 4, voice: 'block' },
  agogo:       { id: 'agogo',       name: 'Agogô Bell',    short: 'AGO', group: 'percussion', gm: 67, color: 4, voice: 'percHit' },
  guiro:       { id: 'guiro',       name: 'Güiro',         short: 'GUI', group: 'percussion', gm: 73, color: 4, voice: 'percHit' },
  cabasa:      { id: 'cabasa',      name: 'Cabasa',        short: 'CAB', group: 'percussion', gm: 69, color: 4, voice: 'percHit' },
  maracas:     { id: 'maracas',     name: 'Maracas',       short: 'MRC', group: 'percussion', gm: 70, color: 4, voice: 'percHit' },
  triangle:    { id: 'triangle',    name: 'Triangle',      short: 'TRI', group: 'percussion', gm: 81, color: 4, voice: 'percHit' },
}

export const INSTRUMENT_LIST: InstrumentDef[] = Object.values(INSTRUMENTS)

/** stable palette for track colors (lime, amber, cyan, rose, violet) */
export const TRACK_COLORS = [
  { dot: 'bg-lime-400', text: 'text-lime-300', border: 'border-lime-400', hex: '#a3e635' },
  { dot: 'bg-amber-400', text: 'text-amber-300', border: 'border-amber-400', hex: '#fbbf24' },
  { dot: 'bg-cyan-400', text: 'text-cyan-300', border: 'border-cyan-400', hex: '#22d3ee' },
  { dot: 'bg-rose-400', text: 'text-rose-300', border: 'border-rose-400', hex: '#fb7185' },
  { dot: 'bg-violet-400', text: 'text-violet-300', border: 'border-violet-400', hex: '#a78bfa' },
] as const

export function instrumentOf(id: InstrumentId): InstrumentDef {
  return INSTRUMENTS[id] ?? INSTRUMENTS.kick
}

/** which instruments are typical for a given group of styles (used by lab "add track") */
export const COMMON_ORDER: InstrumentId[] = [
  'kick', 'snare', 'clap', 'rimshot',
  'hatClosed', 'hatOpen', 'hatPedal', 'ride', 'crash', 'splash',
  'tomHi', 'tomMid', 'tomLow',
  'shaker', 'tambourine', 'cowbell',
  'congaHi', 'congaLo', 'bongoHi', 'bongoLo', 'clave', 'block',
  'agogo', 'guiro', 'cabasa', 'maracas', 'triangle',
]
