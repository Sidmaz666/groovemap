import type { KitId } from '../types'
import type { InstrumentId } from '../instruments'
import { INSTRUMENTS } from '../instruments'

/**
 * Kit + sample definitions — REAL recorded drum samples.
 *
 * Every kit maps instruments to one or more sample files (velocity layers,
 * ordered soft → hard). Files live under /public/samples/<kit>/<inst>_<n>.wav,
 * 44.1 kHz 16-bit PCM, silence-trimmed, with per-file gain trims in
 * /public/samples/manifest.json (peak-aligned headroom).
 *
 * Provenance (all real recordings — no synthesis):
 *  - studio (+ Bright/Roomy mixes) → Hydrogen "GMRockKit" (multi-velocity
 *    acoustic rock kit, GPL) — the mix variants are kit-level processing of
 *    the same recordings, the way console kit presets are made
 *  - analog808 (+ Tape mix) → Roland TR-808 hardware one-shots (freesound
 *    recordings), Sonic Pi "bd_808", Hydrogen TR-808 kit
 *  - analog909 (+ Club mix) → Roland TR-909 hardware one-shots (freesound)
 *  - tight     → Roland R-8 electronic drum machine (web-audio-samples)
 *  - dusty     → Roland CompuRhythm CR-78 (web-audio-samples)
 *  - synth     → LinnDrum (web-audio-samples) + Sonic Pi real hats/cymbals
 *  - perc      → world percussion one-shots (freesound) + Sonic Pi + acoustic kit
 */

export interface SampleLayer {
  /** path relative to /samples/ */
  file: string
  /** gain multiplier for this layer (manifest trim × mix tweak) */
  gain?: number
}

export interface SampleKitDef {
  id: KitId
  name: string
  desc: string
  /** provenance / credit line shown in About + kit tooltip */
  source: string
  character: 'acoustic' | 'machine' | 'percussion'
  /** master lowpass Hz — kit character (lo-fi warmth) */
  lowpass?: number
  /** extra master saturation 0..1 */
  drive?: number
  groupVol?: Partial<Record<'drums' | 'cymbals' | 'percussion', number>>
  /** per-instrument trim applied on top of layer gains */
  gains?: Partial<Record<InstrumentId, number>>
  /** instruments missing here resolve through this kit (then perc, then studio) */
  fallback?: KitId
  layers: Partial<Record<InstrumentId, SampleLayer[]>>
}

const studio: SampleKitDef = {
  id: 'studio',
  name: 'Studio Rock',
  desc: 'Multi-velocity acoustic rock kit — 5 recorded dynamics per drum, room-miked. The flagship.',
  source: 'Hydrogen GMRockKit — real recorded acoustic kit (GPL).',
  character: 'acoustic',
  groupVol: { drums: 1, cymbals: 0.82, percussion: 0.95 },
  gains: {
    kick: 1, snare: 0.98, rimshot: 0.9, clap: 0.85,
    hatClosed: 0.78, hatOpen: 0.75, hatPedal: 0.7,
    ride: 0.62, crash: 0.55, splash: 0.5,
    tomHi: 0.95, tomMid: 0.95, tomLow: 1, cowbell: 0.65,
  },
  fallback: 'perc',
  layers: {
    kick: [0, 1, 2, 3, 4].map((i) => ({ file: `studio/kick_${i}.wav` })),
    snare: [0, 1, 2, 3, 4].map((i) => ({ file: `studio/snare_${i}.wav` })),
    rimshot: [0, 1, 2, 3, 4].map((i) => ({ file: `studio/rimshot_${i}.wav` })),
    clap: [{ file: 'studio/clap_2.wav' }],
    hatClosed: [0, 1, 2, 3, 4].map((i) => ({ file: `studio/hatClosed_${i}.wav` })),
    hatOpen: [0, 1, 2, 3, 4].map((i) => ({ file: `studio/hatOpen_${i}.wav` })),
    hatPedal: [0, 1, 2, 3, 4].map((i) => ({ file: `studio/hatPedal_${i}.wav` })),
    ride: [0, 1, 2, 3, 4].map((i) => ({ file: `studio/ride_${i}.wav` })),
    crash: [0, 1, 2, 3, 4].map((i) => ({ file: `studio/crash_${i}.wav` })),
    splash: [0, 1, 2, 3, 4].map((i) => ({ file: `studio/splash_${i}.wav` })),
    tomHi: [0, 1, 2, 3, 4].map((i) => ({ file: `studio/tomHi_${i}.wav` })),
    tomMid: [0, 1, 2, 3, 4].map((i) => ({ file: `studio/tomMid_${i}.wav` })),
    tomLow: [0, 1, 2, 3, 4].map((i) => ({ file: `studio/tomLow_${i}.wav` })),
    cowbell: [0, 1, 2, 3, 4].map((i) => ({ file: `studio/cowbell_${i}.wav` })),
  },
}

const tr808: SampleKitDef = {
  id: 'analog808',
  name: 'TR-808',
  desc: 'The legendary Rhythm Composer — real hardware recordings: sub-boom kick, snappy snare, metallic hats, full Latin percussion.',
  source: 'Roland TR-808 hardware recordings — freesound contributors, Sonic Pi (bd_808), Hydrogen TR-808 kit.',
  character: 'machine',
  groupVol: { drums: 1, cymbals: 0.8, percussion: 0.95 },
  gains: {
    kick: 1, snare: 0.92, clap: 0.85, rimshot: 0.75,
    hatClosed: 0.62, hatOpen: 0.6, hatPedal: 0.55,
    crash: 0.5, cowbell: 0.6, clave: 0.62,
    congaHi: 0.9, congaLo: 0.9, bongoHi: 0.85, bongoLo: 0.85,
    tomHi: 0.85, tomMid: 0.85, tomLow: 0.9, shaker: 0.6, maracas: 0.6,
  },
  fallback: 'perc',
  layers: {
    kick: [{ file: 'tr808/kick_0.wav' }, { file: 'tr808/kick_1.wav' }, { file: 'tr808/kick_2.wav' }],
    snare: [{ file: 'tr808/snare_0.wav' }, { file: 'tr808/snare_1.wav' }],
    clap: [{ file: 'tr808/clap_0.wav' }],
    rimshot: [{ file: 'tr808/rimshot_0.wav' }, { file: 'tr808/rimshot_1.wav' }],
    hatClosed: [{ file: 'tr808/hatClosed_0.wav' }, { file: 'tr808/hatClosed_1.wav' }],
    hatOpen: [{ file: 'tr808/hatOpen_0.wav' }],
    hatPedal: [{ file: 'tr808/hatPedal_0.wav' }],
    crash: [{ file: 'tr808/crash_0.wav' }],
    cowbell: [{ file: 'tr808/cowbell_0.wav' }],
    clave: [{ file: 'tr808/clave_0.wav' }, { file: 'tr808/clave_1.wav' }],
    congaHi: [{ file: 'tr808/congaHi_0.wav' }],
    congaLo: [{ file: 'tr808/congaLo_0.wav' }, { file: 'tr808/congaLo_1.wav' }],
    bongoHi: [{ file: 'tr808/bongoHi_0.wav' }],
    bongoLo: [{ file: 'tr808/bongoLo_0.wav' }],
    tomHi: [{ file: 'tr808/tomHi_0.wav' }],
    tomMid: [{ file: 'tr808/tomMid_0.wav' }],
    tomLow: [{ file: 'tr808/tomLow_0.wav' }],
    shaker: [{ file: 'tr808/shaker_0.wav' }],
    maracas: [{ file: 'tr808/maracas_0.wav' }],
  },
}

const tr909: SampleKitDef = {
  id: 'analog909',
  name: 'TR-909',
  desc: 'The house & techno workhorse — real 909 hardware recordings: punchy kick, crack snare, sharp hats.',
  source: 'Roland TR-909 hardware recordings — freesound contributors (AaronGNP, DWSD, NoiseCollector, and more).',
  character: 'machine',
  groupVol: { drums: 1, cymbals: 0.85, percussion: 0.9 },
  gains: {
    kick: 1, snare: 0.95, clap: 0.8,
    hatClosed: 0.6, hatOpen: 0.58, hatPedal: 0.5,
    ride: 0.55, crash: 0.5, tomMid: 0.9,
  },
  fallback: 'studio',
  layers: {
    kick: [{ file: 'tr909/kick_0.wav' }, { file: 'tr909/kick_1.wav' }],
    snare: [{ file: 'tr909/snare_0.wav' }, { file: 'tr909/snare_1.wav' }],
    clap: [{ file: 'tr909/clap_0.wav' }, { file: 'tr909/clap_1.wav' }],
    hatClosed: [{ file: 'tr909/hatClosed_0.wav' }],
    hatOpen: [{ file: 'tr909/hatOpen_0.wav' }, { file: 'tr909/hatOpen_1.wav' }],
    ride: [{ file: 'tr909/ride_0.wav' }, { file: 'tr909/ride_1.wav' }],
    crash: [{ file: 'tr909/crash_0.wav' }, { file: 'tr909/crash_1.wav' }],
    tomMid: [{ file: 'tr909/tomMid_0.wav' }],
  },
}

const tight: SampleKitDef = {
  id: 'tight',
  name: 'R-8 Punch',
  desc: 'Roland R-8 electronic kit — tight, punchy transients for breaks, metal and modern pop.',
  source: 'Roland R-8 drum machine — cwilso/web-audio-samples (Tone.js).',
  character: 'machine',
  groupVol: { drums: 1, cymbals: 0.85, percussion: 0.95 },
  gains: { kick: 1, snare: 0.95, hatClosed: 0.72, tomHi: 0.9, tomMid: 0.9, tomLow: 0.95 },
  fallback: 'studio',
  layers: {
    kick: [{ file: 'tight/kick_0.wav' }],
    snare: [{ file: 'tight/snare_0.wav' }],
    hatClosed: [{ file: 'tight/hatClosed_0.wav' }],
    tomHi: [{ file: 'tight/tomHi_0.wav' }],
    tomMid: [{ file: 'tight/tomMid_0.wav' }],
    tomLow: [{ file: 'tight/tomLow_0.wav' }],
  },
}

const dusty: SampleKitDef = {
  id: 'dusty',
  name: 'CR-78 Vintage',
  desc: 'CompuRhythm CR-78 — the 1978 classic behind "Heart of Glass". Warm, band-limited, softly saturated.',
  source: 'Roland CR-78 — cwilso/web-audio-samples (Tone.js).',
  character: 'machine',
  lowpass: 6800,
  drive: 0.18,
  groupVol: { drums: 1, cymbals: 0.85, percussion: 0.95 },
  gains: { kick: 0.98, snare: 0.9, hatClosed: 0.7, tomHi: 0.85, tomMid: 0.85, tomLow: 0.9, rimshot: 0.7 },
  fallback: 'studio',
  layers: {
    kick: [{ file: 'dusty/kick_0.wav' }],
    snare: [{ file: 'dusty/snare_0.wav' }],
    hatClosed: [{ file: 'dusty/hatClosed_0.wav' }],
    tomHi: [{ file: 'dusty/tomHi_0.wav' }],
    tomMid: [{ file: 'dusty/tomMid_0.wav' }],
    tomLow: [{ file: 'dusty/tomLow_0.wav' }],
  },
}

const synthKit: SampleKitDef = {
  id: 'synth',
  name: 'LinnDrum',
  desc: 'The Linn LM-1 lineage — real LinnDrum recordings plus genuine cymbal samples. "1999", "Thriller", "Planets".',
  source: 'LinnDrum — cwilso/web-audio-samples (Tone.js); cymbals/kick/snare/cowbell — Sonic Pi CC samples.',
  character: 'machine',
  groupVol: { drums: 1, cymbals: 0.85, percussion: 0.95 },
  gains: {
    kick: 1, snare: 0.95, hatClosed: 0.65, hatOpen: 0.62, hatPedal: 0.55,
    ride: 0.6, crash: 0.5, tomHi: 0.9, tomMid: 0.9, tomLow: 0.95, cowbell: 0.6,
  },
  fallback: 'perc',
  layers: {
    kick: [{ file: 'synth/kick_0.wav' }, { file: 'synth/kick_1.wav' }],
    snare: [{ file: 'synth/snare_0.wav' }, { file: 'synth/snare_1.wav' }],
    hatClosed: [{ file: 'synth/hatClosed_0.wav' }, { file: 'synth/hatClosed_1.wav' }],
    hatOpen: [{ file: 'synth/hatOpen_0.wav' }],
    hatPedal: [{ file: 'synth/hatPedal_0.wav' }],
    ride: [{ file: 'synth/ride_0.wav' }],
    crash: [{ file: 'synth/crash_0.wav' }],
    tomHi: [{ file: 'synth/tomHi_0.wav' }, { file: 'synth/tomHi_1.wav' }],
    tomMid: [{ file: 'synth/tomMid_0.wav' }],
    tomLow: [{ file: 'synth/tomLow_0.wav' }],
    cowbell: [{ file: 'synth/cowbell_0.wav' }],
  },
}

const studioBright: SampleKitDef = {
  ...studio,
  id: 'studioBright',
  name: 'Studio Bright',
  desc: 'The same recorded rock kit, mixed up-front and open — crisp cymbals, full-bandwidth shells.',
  source: studio.source,
  gains: { ...studio.gains, hatClosed: 0.88, hatOpen: 0.85, hatPedal: 0.8, ride: 0.74, crash: 0.66, splash: 0.6 },
  groupVol: { drums: 1, cymbals: 1, percussion: 0.95 },
  drive: 0.05,
}

const studioRoom: SampleKitDef = {
  ...studio,
  id: 'studioRoom',
  name: 'Studio Roomy',
  desc: 'The acoustic kit mixed for the room — darker, softly saturated, cymbals tucked behind the drums.',
  source: studio.source,
  gains: { ...studio.gains, hatClosed: 0.66, hatOpen: 0.62, ride: 0.5, crash: 0.44 },
  groupVol: { drums: 1, cymbals: 0.72, percussion: 0.92 },
  lowpass: 8000,
  drive: 0.16,
}

const tr808Tape: SampleKitDef = {
  ...tr808,
  id: 'tr808Tape',
  name: '808 Tape',
  desc: 'The 808 recordings as if dubbed to tape — rounded top end, saturated lows. The lo-fi hip-hop staple.',
  source: tr808.source,
  lowpass: 5200,
  drive: 0.42,
  gains: { ...tr808.gains, kick: 1, snare: 0.95 },
}

const tr909Club: SampleKitDef = {
  ...tr909,
  id: 'tr909Club',
  name: '909 Club',
  desc: '909 hardware mixed for the main floor — slightly darkened hats, extra drive for warehouse punch.',
  source: tr909.source,
  lowpass: 11500,
  drive: 0.22,
  gains: { ...tr909.gains, hatClosed: 0.55, hatOpen: 0.52, kick: 1 },
}

const perc: SampleKitDef = {
  id: 'perc',
  name: 'World Percussion',
  desc: 'Real hand-percussion ensemble — congas, bongos, claves, agogô, güiro, cabasa, maracas, triangle — plus acoustic kit cores.',
  source: 'Freesound one-shot recordings; Sonic Pi (triangle, woodblock, bell, splash); cwilso acoustic-kit.',
  character: 'percussion',
  groupVol: { drums: 0.92, cymbals: 0.85, percussion: 1 },
  gains: {
    kick: 0.9, snare: 0.85, hatClosed: 0.68,
    congaHi: 0.95, congaLo: 0.95, bongoHi: 0.9, bongoLo: 0.9,
    clave: 0.72, block: 0.75, agogo: 0.7, guiro: 0.7, cabasa: 0.8,
    maracas: 0.75, triangle: 0.45, shaker: 0.75, tambourine: 0.8,
    tomHi: 0.9, tomMid: 0.9, tomLow: 0.95, splash: 0.45,
  },
  fallback: 'studio',
  layers: {
    kick: [{ file: 'perc/kick_0.wav' }],
    snare: [{ file: 'perc/snare_0.wav' }],
    hatClosed: [{ file: 'perc/hatClosed_0.wav' }],
    tomHi: [{ file: 'perc/tomHi_0.wav' }],
    tomMid: [{ file: 'perc/tomMid_0.wav' }],
    tomLow: [{ file: 'perc/tomLow_0.wav' }],
    congaHi: [{ file: 'perc/congaHi_0.wav' }, { file: 'perc/congaHi_1.wav' }],
    congaLo: [{ file: 'perc/congaLo_0.wav' }, { file: 'perc/congaLo_2.wav' }],
    bongoHi: [{ file: 'perc/bongoHi_0.wav' }],
    bongoLo: [{ file: 'perc/bongoLo_0.wav' }],
    clave: [{ file: 'perc/clave_0.wav' }, { file: 'perc/clave_1.wav' }, { file: 'perc/clave_2.wav' }],
    block: [{ file: 'perc/block_0.wav' }, { file: 'perc/block_1.wav' }],
    agogo: [{ file: 'perc/agogo_0.wav' }],
    guiro: [{ file: 'perc/guiro_0.wav' }],
    cabasa: [{ file: 'perc/cabasa_0.wav' }, { file: 'perc/cabasa_1.wav' }],
    maracas: [{ file: 'perc/maracas_0.wav' }],
    triangle: [{ file: 'perc/triangle_0.wav' }],
    shaker: [{ file: 'perc/shaker_0.wav' }, { file: 'perc/shaker_1.wav' }],
    tambourine: [{ file: 'perc/tambourine_0.wav' }, { file: 'perc/tambourine_1.wav' }],
    splash: [{ file: 'perc/splash_0.wav' }],
    cowbell: [{ file: 'perc/bell_0.wav' }],
  },
}

export const KITS: Record<KitId, SampleKitDef> = {
  studio,
  studioBright,
  studioRoom,
  analog808: tr808,
  tr808Tape,
  analog909: tr909,
  tr909Club,
  tight,
  dusty,
  synth: synthKit,
  perc,
}

export const KIT_LIST: SampleKitDef[] = Object.values(KITS)

/** map legacy/unknown kit ids onto a valid kit */
export function resolveKit(id: KitId | string): SampleKitDef {
  return KITS[id as KitId] ?? KITS.studio
}

/** per-instrument group volume multiplier */
export function kitGroupVolume(kit: SampleKitDef, inst: InstrumentId): number {
  const g = INSTRUMENTS[inst].group
  return kit.groupVol?.[g] ?? 1
}

const FALLBACK_CHAIN: KitId[] = ['perc', 'studio']

/** instrument → ordered velocity layers for a kit, with fallbacks resolved */
export function effectiveLayers(kit: SampleKitDef): Record<InstrumentId, SampleLayer[]> {
  const out = {} as Record<InstrumentId, SampleLayer[]>
  const all = Object.keys(INSTRUMENTS) as InstrumentId[]
  const chain: SampleKitDef[] = [kit]
  for (const fid of FALLBACK_CHAIN) {
    if (fid !== kit.id) chain.push(KITS[fid])
  }
  for (const inst of all) {
    for (const k of chain) {
      const ls = k.layers[inst]
      if (ls && ls.length) {
        out[inst] = ls.map((l) => ({ ...l, gain: (l.gain ?? 1) * (k.gains?.[inst] ?? 1) }))
        break
      }
    }
    if (!out[inst]) out[inst] = []
  }
  return out
}

/** all sample file paths a kit (with fallbacks) will load */
export function kitSampleFiles(kit: SampleKitDef): string[] {
  const files = new Set<string>()
  for (const layers of Object.values(effectiveLayers(kit))) {
    for (const l of layers) files.add(l.file)
  }
  return [...files]
}
