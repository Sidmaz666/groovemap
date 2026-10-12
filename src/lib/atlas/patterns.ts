/**
 * Groovemap — pattern knowledge base.
 *
 * Authored content: each pattern is an original, documented composition or a
 * common-practice / traditional timeline described honestly (see `source`).
 * Rhythms are encoded in compact track strings:
 *   X accent · x normal · o ghost · 2/3/4 ratchet roll · p probabilistic · . rest
 *   one char per step, `|` between bars.
 */

import type { GroovePattern, PatternTrack, RhythmEvent, KitId, Subdivision, Difficulty, GrooveFeel, PatternVariation } from './types'
import { stepsPerBar } from './types'
import type { InstrumentId } from './instruments'
import { parseTrackString } from './rhythm'
import { euclideanEvents } from './rhythm'
import { PACK_ROCK } from './data/pack-rock'
import { PACK_SOUL } from './data/pack-soul'
import { PACK_URBAN } from './data/pack-urban'
import { PACK_ELECTRONIC } from './data/pack-electronic'
import { PACK_EXPANSION_GROOVE } from './data/pack-expansion-groove'
import { PACK_EXPANSION_ELECTRONIC } from './data/pack-expansion-electronic'
import { PACK_EXPANSION_ROOTS } from './data/pack-expansion-roots'
import { PACK_EXPANSION_WORLD } from './data/pack-expansion-world'
import { PACK_GLOBAL } from './data/pack-global'
import { PACK_CLUB } from './data/pack-club'
import { PACK_MODERN } from './data/pack-modern'
import { PACK_FILLS2 } from './data/pack-fills2'
import { PACK_GENERATED } from './data/pack-generated'
import { BASE_AUTHORS } from './data/base-authors'

interface AuthorTrack {
  inst: InstrumentId
  pat: string
  vol?: number
  pan?: number
}

interface AuthorPattern {
  id: string
  title: string
  family: string
  genres: string[]
  tags: string[]
  difficulty: Difficulty
  bpm: number
  tempoRange: [number, number]
  ts: [number, 4 | 8]
  bars?: number
  sub: Subdivision
  feel: GrooveFeel
  swing?: number
  sync: 0 | 1 | 2 | 3
  dens: 0 | 1 | 2 | 3
  kit: KitId
  summary: string
  description: string
  construction: string
  tracks: AuthorTrack[]
  roles: Record<string, string>
  variations?: PatternVariation[]
  related?: string[]
  source: GroovePattern['source']
  featured?: boolean
  starter?: boolean
}

const FAMILIES: Record<string, string> = {
  rock: 'Rock',
  pop: 'Pop',
  metal: 'Metal',
  punk: 'Punk',
  country: 'Country & Bluegrass',
  gospel: 'Gospel',
  blues: 'Blues & Shuffle',
  funk: 'Funk & Soul',
  rnb: 'R&B / Soul',
  disco: 'Disco & Boogie',
  jazz: 'Jazz',
  bossa: 'Bossa Nova',
  samba: 'Samba',
  latin: 'Latin Timelines',
  reggae: 'Dub & Reggae',
  ska: 'Ska & Rocksteady',
  hiphop: 'Hip-Hop & Boom Bap',
  trap: 'Trap',
  lofi: 'Lo-Fi & Chill',
  house: 'House',
  garage: 'UK Garage & Broken',
  jungle: 'Jungle & DnB',
  breaks: 'Breaks & Big Beat',
  techno: 'Techno & Electro',
  dubstep: 'Dubstep & 140',
  afrobeat: 'Afrobeat',
  world: 'World Percussion',
  experimental: 'Odd Meter & Experimental',
  learn: 'Building Blocks',
  synthwave: 'Synthwave',
  fills: 'Fills & Phrasing',
  indian: 'Indian & Carnatic',
  arabic: 'Middle Eastern',
  balkan: 'Balkan & Aksak',
  caribbean: 'Caribbean & Carnival',
  african: 'African & Diaspora',
  drill: 'Drill & Grime',
  club: 'Club & Ballroom',
}

export const FAMILY_LIST = Object.entries(FAMILIES).map(([key, label]) => ({ key, label }))

function buildPattern(a: AuthorPattern): GroovePattern {
  const ts = { num: a.ts[0], den: a.ts[1] }
  const bars = a.bars ?? 1
  const spb = stepsPerBar(ts, a.sub)
  const total = spb * bars
  const tracks: PatternTrack[] = []
  const events: RhythmEvent[] = []
  for (const t of a.tracks) {
    const id = t.inst
    // normalize string length to the pattern grid (pad / truncate, warn)
    let pat = t.pat.replace(/\|/g, '')
    if (pat.length < total) pat = pat + '.'.repeat(total - pat.length)
    if (pat.length > total) {
      console.warn(`[atlas] pattern ${a.id} track ${id}: string truncated (${pat.length} > ${total})`)
      pat = pat.slice(0, total)
    }
    tracks.push({ id, inst: t.inst, vol: t.vol ?? 0.9, pan: t.pan ?? 0 })
    events.push(...parseTrackString(pat, id))
  }
  return {
    id: a.id,
    slug: a.id,
    title: a.title,
    summary: a.summary,
    description: a.description,
    family: a.family,
    genres: a.genres,
    tags: a.tags,
    difficulty: a.difficulty,
    bpm: a.bpm,
    tempoRange: a.tempoRange,
    timeSignature: ts,
    bars,
    subdivision: a.sub,
    feel: a.feel,
    swing: a.swing ?? 0,
    syncopation: a.sync,
    density: a.dens,
    tracks,
    events,
    kitSuggestion: a.kit,
    learning: { construction: a.construction, roles: a.roles },
    variations: a.variations,
    related: a.related,
    source: a.source,
    featured: a.featured,
    starter: a.starter,
    schemaVersion: 1,
  }
}

/* ================================================================== */
/* Authored catalog                                                    */
/* ================================================================== */

// BASE_AUTHORS (the 60 foundation patterns) moved verbatim to
// ./data/base-authors.ts so the generated-variation pack can import the
// authored parents directly without a circular import through patterns.ts.

export const PATTERNS: GroovePattern[] = (() => {
  // merge base catalog + expansion packs, guarding against duplicate ids
  const merged: AuthorPattern[] = [
    ...BASE_AUTHORS, ...PACK_ROCK, ...PACK_SOUL, ...PACK_URBAN, ...PACK_ELECTRONIC,
    ...PACK_EXPANSION_GROOVE, ...PACK_EXPANSION_ELECTRONIC, ...PACK_EXPANSION_ROOTS, ...PACK_EXPANSION_WORLD,
    ...PACK_GLOBAL, ...PACK_CLUB, ...PACK_MODERN, ...PACK_FILLS2,
    ...PACK_GENERATED,
  ]
  const seen = new Set<string>()
  const authors: AuthorPattern[] = []
  for (const a of merged) {
    if (seen.has(a.id)) {
      console.warn(`[atlas] duplicate pattern id "${a.id}" skipped`)
      continue
    }
    seen.add(a.id)
    authors.push(a)
  }
  const list = authors.map(buildPattern)
  // Euclid Sketch — generate the algorithmic tracks programmatically so the
  // stored grid always matches the Bjorklund implementation used in the Lab.
  const euclid = list.find((p) => p.id === 'euclid-sketch')
  if (euclid) {
    const kick = euclideanEvents(5, 16, 0, 'kick', 120)
    const hats = euclideanEvents(9, 16, 0, 'hatClosed', 60)
    euclid.events = [...euclid.events, ...kick, ...hats]
  }
  return list
})()

export const PATTERN_INDEX = new Map(PATTERNS.map((p) => [p.id, p]))

export function getPattern(id: string): GroovePattern | undefined {
  return PATTERN_INDEX.get(id)
}

export const ALL_SLUGS = new Set(PATTERNS.map((p) => p.id))

/* Curated collections — each is grounded in real pattern ids */
export interface CuratedCollection {
  id: string
  name: string
  blurb: string
  patternIds: string[]
}

export const CURATED_COLLECTIONS: CuratedCollection[] = [
  {
    id: 'first-beats',
    name: 'First Beats to Learn',
    blurb: 'Start here: simple, satisfying grooves that teach the fundamentals.',
    patternIds: ['build-01-kick-quarters', 'build-02-eighth-hats', 'backbeat-basic', 'hiphop-oldschool', 'reggae-one-drop', 'build-03-sixteenth-hats'],
  },
  {
    id: 'dance-floor',
    name: 'Foundational Dance Grooves',
    blurb: 'Four-on-the-floor DNA from disco to techno.',
    patternIds: ['disco-classic', 'house-basic', 'techno-basic', 'deep-house', 'disco-strings', 'garage-4x4'],
  },
  {
    id: 'funk-syncopation',
    name: 'Funk & Syncopation',
    blurb: 'Ghost notes, displaced kicks and the fine art of the one.',
    patternIds: ['funk-16ths', 'funk-jb', 'motown-groove', 'breaks-funky', 'breaks-think', 'funk-open-push'],
  },
  {
    id: 'broken-grooves',
    name: 'Broken & Swung',
    blurb: 'UK garage, broken beat and the jungle chop.',
    patternIds: ['ukg-2step', 'broken-beat', 'garage-4x4', 'jungle-two-step', 'dnb-rolling'],
  },
  {
    id: 'odd-meters',
    name: 'Odd Meters & Timelines',
    blurb: '3/4 to 12/8 — rhythms that refuse the four-count.',
    patternIds: ['waltz-backbeat', 'five-four-take', 'seven-eight-rupcha', 'karsilama-9-8', 'ewe-bell'],
  },
  {
    id: 'sparse-minimal',
    name: 'Sparse & Minimal',
    blurb: 'Less is a rhythm section: space as an instrument.',
    patternIds: ['minimal-click', 'techno-basic', 'reggae-one-drop', 'soul-slow', 'lofi-hop'],
  },
  {
    id: 'dense-percussion',
    name: 'Dense Percussion',
    blurb: 'When every sixteenth has a voice.',
    patternIds: ['afrobeat-busy', 'samba-batucada', 'funk-16ths', 'jungle-two-step', 'trap-rolling'],
  },
  {
    id: 'live-foundations',
    name: 'Live-Band Foundations',
    blurb: 'Acoustic grooves for bands, singers and songwriters.',
    patternIds: ['backbeat-basic', 'rock-drive', 'soul-slow', 'jazz-brush', 'jazz-swing', 'motown-groove'],
  },
  {
    id: 'building-blocks',
    name: 'Rhythm Building Exercises',
    blurb: 'The Learn-series patterns in playing order.',
    patternIds: ['build-01-kick-quarters', 'build-02-eighth-hats', 'build-03-sixteenth-hats', 'build-04-offbeat', 'build-05-ghosts', 'build-06-fill'],
  },
  {
    id: 'math-rhythms',
    name: 'Mathematical Rhythms',
    blurb: 'Euclidean generators, cross-rhythms and probability.',
    patternIds: ['euclid-sketch', 'polyrhythm-3-4', 'idm-glitch', 'ewe-bell'],
  },
  {
    id: 'roots-american',
    name: 'Roots: Blues, Country & Gospel',
    blurb: 'Shuffles, train beats and shout-band fire — the American wellspring.',
    patternIds: ['blues-texas-shuffle', 'blues-12-8-slow', 'country-train-beat', 'country-two-step', 'gospel-shout', 'gospel-12-8', 'rock-bo-diddley'],
  },
  {
    id: 'heavy-units',
    name: 'Heavy Machinery',
    blurb: 'Metal, punk and the double-kick discipline.',
    patternIds: ['metal-gallop', 'metal-double-kick', 'metal-blast-fragment', 'punk-d-beat', 'punk-straight-eighths', 'metal-half-time-thrash'],
  },
  {
    id: 'atlantic-grooves',
    name: 'Atlantic Grooves: Bossa to Samba',
    blurb: 'Bossa clave wisdom and samba ground motion.',
    patternIds: ['bossa-core', 'bossa-2-bar', 'samba-partido-alto', 'samba-reggae-olodum', 'samba-pandeiro', 'latin-rumba-guaguanco'],
  },
  {
    id: 'street-140',
    name: 'Street & 140',
    blurb: 'Drill, grime, dubstep and footwork — the halftime generation.',
    patternIds: ['hiphop-drill-uk', 'grime-eski', 'dubstep-halftime-140', 'footwork-juke', 'trap-south-bounce', 'dubstep-riddim'],
  },
  {
    id: 'fills-phrasing',
    name: 'Fills & Phrasing',
    blurb: 'Turnarounds, press rolls and chops that move a track.',
    patternIds: ['fill-rock-16th-toms', 'fill-press-roll', 'fill-linear-gospel', 'fill-dnb-ghost', 'fill-latin-conga-call', 'fill-boom-bap-2bar'],
  },
]
