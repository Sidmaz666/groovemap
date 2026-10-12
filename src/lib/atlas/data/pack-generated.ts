/**
 * Groovemap — Generated practice-variations pack.
 *
 * Every entry here is DETERMINISTICALLY derived from an authored parent
 * pattern at module load: track-string surgery driven by a seeded PRNG
 * (mulberry32 keyed on a hash of the parent id) or by pure index arithmetic.
 * There is no ambient randomness — no clock-seeded or crypto-seeded RNG and no
 * reading of mutable global state — so server and client compute byte-identical
 * data, making hydration safe.
 *
 * Twenty transform families (suffixes are stable and collision-checked):
 *   gw  ghost-weave       — soft 'o' ghosts woven into silent offbeats of the snare (or kick)
 *   oh  open-hat lift     — the closed hat's final offbeat of each bar moves to a (new or
 *                           existing) hatOpen track
 *   kd  kick-displacement — exactly one kick hit shifts one step inside bar 2 (bar 1 for
 *                           1-bar loops), never past the bar line
 *   ht  half-time feel    — every snare hit moves from position p to 2p within its bar
 *                           (only when the whole pattern fits the rule)
 *   sf  straight-flip     — swing 0 → 0.12 or swing > 0 → 0 (even grids only)
 *   dt  double-time hats  — closed hat filled to a continuous stream at 'x', accents kept
 *   sc  sparse-cut        — all ghost 'o' hits removed
 *   ap  accent-push       — 'x' hits on downbeats upgraded to 'X' accents
 *   rs  rim-swap          — snare track revoiced as 'rimshot' (NOTE: 'rim' is NOT a valid
 *                           InstrumentId in instruments.ts; 'rimshot' is the rim voice)
 *   ft  fill-tail         — 1-bar parents doubled to 2 bars; bar 2's snare closes with a
 *                           small authored fill
 *   rd  ride-swap         — closed-hat track revoiced as 'ride' (drum-kit families only,
 *                           never when a ride track already exists)
 *   cl  clap-swap         — strictly on-beat snare revoiced as 'clap' (club/pop/disco and
 *                           related machine/dance families, never when a clap track exists)
 *   tm  tom-accent        — 1–2 low/mid tom accents added in the final beat of the last bar
 *   k2  kick-double       — the first kick of bar 1 doubled with a soft kick one step later
 *                           (16th/sextuplet grids only, only when the next step is silent)
 *   hs  hat-soften        — hat accents 'X' softened to 'x' plus one ghost on a silent
 *                           snare offbeat (lofi/dusty-feel families or the 'dusty' kit)
 *   pb  push-beat         — every snare hit shifted one eighth later inside its bar
 *                           (even grids only; guarded against collisions and the bar line)
 *   rl  reggae-lean       — kick reduced to the one-drop on beat 3 + rimshot crossstick
 *                           (reggae/ska/dubstep families, 4/4 only)
 *   tl  triplet-lean      — one hat accent displaced one triplet step later (triplet grids
 *                           sub 3/6 only, only when the next step is silent)
 *   sl  second-line       — two snare ghosts tucked at the classic second-line positions
 *                           ('a' of 1 and 'a' of 3) for jazz/funk/gospel/blues/rnb families
 *   bd  bass-drop         — the first kick of bar 1 lifted out so the loop enters on space
 *                           (dance-music families, only when bar 1 keeps other kicks)
 *
 * ts / sub / bars (except ft) / kit / sync / dens / bpm / tempoRange always stay
 * identical to the parent, so every derived grid validates against the same
 * steps-per-bar rule as its parent. featured/starter are never set.
 */

import type { AuthorPattern, InstrumentId } from '../types'
import { hashSeed, mulberry32 } from '../rhythm'
import { BASE_AUTHORS } from './base-authors'
import { PACK_ROCK } from './pack-rock'
import { PACK_SOUL } from './pack-soul'
import { PACK_URBAN } from './pack-urban'
import { PACK_ELECTRONIC } from './pack-electronic'
import { PACK_EXPANSION_GROOVE } from './pack-expansion-groove'
import { PACK_EXPANSION_ELECTRONIC } from './pack-expansion-electronic'
import { PACK_EXPANSION_ROOTS } from './pack-expansion-roots'
import { PACK_EXPANSION_WORLD } from './pack-expansion-world'
import { PACK_GLOBAL } from './pack-global'
import { PACK_CLUB } from './pack-club'
import { PACK_MODERN } from './pack-modern'
import { PACK_FILLS2 } from './pack-fills2'

type AuthorTrack = AuthorPattern['tracks'][number]
type AuthorFeel = AuthorPattern['feel']

/* ------------------------------------------------------------------ */
/* Source packs (parents) — imported directly, never via patterns.ts.
 * BASE_AUTHORS lives in ./base-authors.ts (verbatim extraction from
 * patterns.ts) so this module can import it without a circular import. */
/* ------------------------------------------------------------------ */

const SOURCE_PACKS: AuthorPattern[][] = [
  BASE_AUTHORS,
  PACK_ROCK,
  PACK_SOUL,
  PACK_URBAN,
  PACK_ELECTRONIC,
  PACK_EXPANSION_GROOVE,
  PACK_EXPANSION_ELECTRONIC,
  PACK_EXPANSION_ROOTS,
  PACK_EXPANSION_WORLD,
  PACK_GLOBAL,
  PACK_CLUB,
  PACK_MODERN,
  PACK_FILLS2,
]

/* ------------------------------------------------------------------ */
/* Track-string helpers                                                */
/* ------------------------------------------------------------------ */

/** Split a (possibly sloppy) parent string into exact per-bar segments. */
function normalizePat(pat: string, spb: number, bars: number): string[] {
  const flat = pat.replace(/\|/g, '')
  const total = spb * bars
  const padded = flat.length < total ? flat + '.'.repeat(total - flat.length) : flat.slice(0, total)
  const segs: string[] = []
  for (let b = 0; b < bars; b++) segs.push(padded.slice(b * spb, (b + 1) * spb))
  return segs
}

function joinPat(segs: string[]): string {
  return segs.join('|')
}

/** within-beat offset of the primary offbeat ('&' / 'la') for a subdivision */
function offbeatPos(sub: number): number {
  if (sub === 4) return 2
  if (sub === 6) return 3
  return 1 // sub 2 and sub 3
}

function gridWord(sub: number): string {
  if (sub === 1) return 'quarter'
  if (sub === 2) return 'eighth'
  if (sub === 3) return 'triplet'
  if (sub === 4) return 'sixteenth'
  return 'sextuplet'
}

function cloneTracks(tracks: AuthorTrack[]): AuthorTrack[] {
  return tracks.map((t) => ({ ...t }))
}

/* ------------------------------------------------------------------ */
/* Variation scaffolding                                               */
/* ------------------------------------------------------------------ */

interface Variation {
  /** id suffix, e.g. 'gw' → parent.id--gw */
  suffix: string
  /** display name appended to the parent title */
  variant: string
  tracks: AuthorTrack[]
  roles: Record<string, string>
  /** override swing (sf) */
  swing?: number
  /** override feel (sf) */
  feel?: AuthorFeel
  /** override bars (ft) */
  bars?: number
  summary: string
  description: string
  construction: string
}

interface Ctx {
  parent: AuthorPattern
  spb: number
  bars: number
  rng: () => number
  track: (inst: InstrumentId) => AuthorTrack | undefined
  segs: (inst: InstrumentId) => string[] | undefined
}

type Transform = (ctx: Ctx) => Variation | null

function buildVariation(parent: AuthorPattern, v: Variation): AuthorPattern {
  const spb = parent.ts[0] * parent.sub
  const bars = v.bars ?? (parent.bars ?? 1)
  // every track string is re-normalized to exact per-bar segments so generated
  // grids are always well-formed, even when a parent string was sloppy
  const tracks = v.tracks.map((t) => ({ ...t, pat: joinPat(normalizePat(t.pat, spb, bars)) }))
  return {
    id: `${parent.id}--${v.suffix}`,
    title: `${parent.title} · ${v.variant}`,
    family: parent.family,
    genres: [...parent.genres],
    tags: [...parent.tags, 'variation'],
    difficulty: parent.difficulty,
    bpm: parent.bpm,
    tempoRange: [parent.tempoRange[0], parent.tempoRange[1]],
    ts: [parent.ts[0], parent.ts[1]] as [number, 4 | 8],
    bars,
    sub: parent.sub,
    feel: v.feel ?? parent.feel,
    swing: v.swing !== undefined ? v.swing : (parent.swing ?? 0),
    sync: parent.sync,
    dens: parent.dens,
    kit: parent.kit,
    summary: v.summary,
    description: v.description,
    construction: v.construction,
    tracks,
    roles: v.roles,
    related: [parent.id],
    source: {
      type: 'reference',
      note: `Practice variation derived from the catalog entry “${parent.title}” (${parent.id}). Same grid, transformed per the description.`,
    },
  }
}

/* ------------------------------------------------------------------ */
/* Transform 1 — gw: ghost-weave                                       */
/* ------------------------------------------------------------------ */

function txGhostWeave(ctx: Ctx): Variation | null {
  const { parent, spb, bars, rng } = ctx
  if (parent.sub === 1) return null // quarter grids have no offbeats
  const targetInst: InstrumentId | undefined = ctx.track('snare')
    ? 'snare'
    : ctx.track('kick')
      ? 'kick'
      : undefined
  if (!targetInst) return null
  const segs = ctx.segs(targetInst)
  if (!segs) return null
  const off = offbeatPos(parent.sub)
  // silent offbeat candidates per bar
  const candsPerBar = segs.map((seg) => {
    const c: number[] = []
    for (let i = 0; i < spb; i++) {
      if (i % parent.sub === off && seg[i] === '.') c.push(i)
    }
    return c
  })
  if (candsPerBar.every((c) => c.length === 0)) return null
  const perBarCap = 2 + Math.floor(rng() * 2) // 2 or 3 ghosts per bar
  let added = 0
  const newSegs = segs.map((seg, b) => {
    const cands = candsPerBar[b]
    if (cands.length === 0) return seg
    const arr = seg.split('')
    const start = Math.floor(rng() * cands.length)
    const n = Math.min(perBarCap, cands.length)
    for (let k = 0; k < n; k++) {
      arr[cands[(start + k) % cands.length]] = 'o'
      added++
    }
    return arr.join('')
  })
  if (added === 0) return null
  const instWord = targetInst === 'snare' ? 'snare' : 'kick'
  const gw = gridWord(parent.sub)
  const roles = { ...parent.roles }
  const origRole = roles[targetInst]
  if (origRole !== undefined) {
    roles[targetInst] = `${origRole} Ghost notes woven into the offbeats in this variation.`
  } else {
    roles[targetInst] = 'Ghost notes woven into the offbeats in this variation.'
  }
  return {
    suffix: 'gw',
    variant: 'Ghost Weave',
    tracks: cloneTracks(parent.tracks).map((t) =>
      t.inst === targetInst ? { ...t, pat: joinPat(newSegs) } : { ...t },
    ),
    roles,
    summary: `Ghost-note weave on “${parent.title}”: soft ${instWord} ghosts on the ${gw} offbeats loosen the pocket without moving a single accent.`,
    description: `The parent groove's skeleton — every accent, kick, hat and rest — plays exactly as authored. On top, ${added} quiet ghost hits are woven into silent ${gw} offbeats of the ${instWord} (up to ${perBarCap} per bar, only on steps that were silent). Ghosts sit at the softest velocity tier, so the original accents still mark the form while the added notes smear the feel the way a session player's fingers loosen a take that reads as too tight. Same grid, same length — only the dynamics gain a layer.`,
    construction: `Parent bar${bars > 1 ? 's' : ''} verbatim; ghost notes (“o”) added on silent ${gw} offbeats (within-beat offset ${off}) of the ${instWord} track, capped at ${perBarCap} per bar, never replacing an existing hit.`,
  }
}

/* ------------------------------------------------------------------ */
/* Transform 2 — oh: open-hat lift                                     */
/* ------------------------------------------------------------------ */

function txOpenHatLift(ctx: Ctx): Variation | null {
  const { parent, spb } = ctx
  if (parent.sub === 1) return null
  const hc = ctx.track('hatClosed')
  if (!hc) return null
  const hcSegs = ctx.segs('hatClosed')
  if (!hcSegs) return null
  const lift = spb - parent.sub + offbeatPos(parent.sub) // last beat's primary offbeat
  const existingOpen = ctx.track('hatOpen')
  const openSegs = existingOpen ? ctx.segs('hatOpen') : undefined
  const added = !existingOpen
  // clear the closed hat at the lift so the open ring is never choked
  const newClosed = hcSegs.map((seg) => {
    const arr = seg.split('')
    arr[lift] = '.'
    return arr.join('')
  })
  let newOpen: string[]
  if (openSegs) {
    newOpen = openSegs.map((seg) => {
      const arr = seg.split('')
      if (arr[lift] === '.') arr[lift] = 'X'
      return arr.join('')
    })
  } else {
    newOpen = hcSegs.map(() => '.'.repeat(spb).split('').fill('X', lift, lift + 1).join(''))
  }
  const changed =
    added ||
    newClosed.some((s, i) => s !== hcSegs[i]) ||
    (openSegs ? newOpen.some((s, i) => s !== openSegs[i]) : true)
  if (!changed) return null
  const gw = gridWord(parent.sub)
  const tracks = cloneTracks(parent.tracks).map((t) =>
    t.inst === 'hatClosed' ? { ...t, pat: joinPat(newClosed) } : { ...t },
  )
  if (added) {
    const openTrack: AuthorTrack = {
      inst: 'hatOpen',
      pat: joinPat(newOpen),
      vol: Math.min(1, (hc.vol ?? 0.9) * 0.95),
      pan: hc.pan ?? 0,
    }
    const idx = tracks.findIndex((t) => t.inst === 'hatClosed')
    tracks.splice(idx + 1, 0, openTrack)
  }
  const roles = { ...parent.roles }
  const hcRole = roles.hatClosed
  roles.hatClosed = hcRole
    ? `${hcRole} Final-offbeat lift handed to the open hat in this variation.`
    : 'Final-offbeat lift handed to the open hat in this variation.'
  roles.hatOpen = added
    ? 'Open hi-hat lift on the final offbeat of each bar — rings into the downbeat and signals the loop point.'
    : 'Lift reinforced at the final offbeat of each bar, unchoked by the closed hat.'
  const where = `step ${lift} of ${spb} — the last ${gw} offbeat of each bar`
  return {
    suffix: 'oh',
    variant: 'Open-Hat Lift',
    tracks,
    roles,
    summary: `Open-hat lift on “${parent.title}”: the last ${gw} offbeat of each bar is handed to a ringing open hat — the classic signal that the loop is turning over.`,
    description: added
      ? `A closed-hat figure drives the parent groove, but it never breathes. This variation keeps every other hit untouched and moves the closed hat's final offbeat of each bar (${where}) onto an open hi-hat, added as a new track. The open hat rings into the following downbeat, creating the lift house, funk and rock engineers reach for when a loop needs to exhale at the turnaround.`
      : `The parent already carries an open-hat track; this variation reinforces its lift at ${where} and clears the closed hat there, so the open ring is never choked an instant after it sounds. Everything else in the grid is the parent, note-for-note.`,
    construction: `Closed-hat hit at ${where} moved to hatOpen (“X”); ${added ? 'new hatOpen track added' : 'existing hatOpen track reinforced'} — all other tracks verbatim.`,
  }
}

/* ------------------------------------------------------------------ */
/* Transform 3 — kd: kick-displacement                                 */
/* ------------------------------------------------------------------ */

function txKickDisplacement(ctx: Ctx): Variation | null {
  const { parent, spb, bars, rng } = ctx
  const kick = ctx.track('kick')
  if (!kick) return null
  const segs = ctx.segs('kick')
  if (!segs) return null
  const barIdx = bars > 1 ? 1 : 0
  const seg = segs[barIdx]
  const hits: number[] = []
  for (let i = 0; i < spb; i++) if (seg[i] !== '.') hits.push(i)
  let from = -1
  let to = -1
  const later = hits.filter((i) => i + 1 < spb && seg[i + 1] === '.')
  if (later.length > 0) {
    from = later[Math.floor(rng() * later.length)]
    to = from + 1
  } else {
    const earlier = hits.filter((i) => i - 1 >= 0 && seg[i - 1] === '.')
    if (earlier.length === 0) return null
    from = earlier[Math.floor(rng() * earlier.length)]
    to = from - 1
  }
  const arr = seg.split('')
  arr[to] = arr[from]
  arr[from] = '.'
  const newSegs = segs.slice()
  newSegs[barIdx] = arr.join('')
  const dir = to > from ? 'late' : 'early'
  const barNo = barIdx + 1
  const gw = gridWord(parent.sub)
  const roles = { ...parent.roles }
  const kRole = roles.kick
  roles.kick = kRole
    ? `${kRole} One hit displaced a single ${gw} step ${dir} in bar ${barNo} in this variation.`
    : `One hit displaced a single ${gw} step ${dir} in bar ${barNo} in this variation.`
  return {
    suffix: 'kd',
    variant: 'Kick Displacement',
    tracks: cloneTracks(parent.tracks).map((t) =>
      t.inst === 'kick' ? { ...t, pat: joinPat(newSegs) } : { ...t },
    ),
    roles,
    summary: `Kick displacement on “${parent.title}”: exactly one kick hit in bar ${barNo} slides one ${gw} step ${dir}, tilting the groove without breaking it.`,
    description: `This is the smallest edit that audibly changes a groove: the kick hit at step ${from} of bar ${barNo} moves to step ${to} — one ${gw} step ${dir}. Every other hit stays exactly where the parent put it. Delaying (or anticipating) a single kick by one subdivision is the standard producer's trick for turning a stiff loop into one that leans; here it is applied exactly once, inside the bar line, so the grid and bar length never change.`,
    construction: `Kick hit at step ${from} of bar ${barNo} displaced to step ${to} (one ${gw} step ${dir}); the vacated step becomes a rest — all other hits and tracks unchanged.`,
  }
}

/* ------------------------------------------------------------------ */
/* Transform 4 — ht: half-time feel                                    */
/* ------------------------------------------------------------------ */

function txHalfTimeFeel(ctx: Ctx): Variation | null {
  const { parent, spb } = ctx
  const snare = ctx.track('snare')
  if (!snare) return null
  const segs = ctx.segs('snare')
  if (!segs) return null
  const newSegs: string[] = []
  for (const seg of segs) {
    const hits: { pos: number; ch: string }[] = []
    for (let i = 0; i < spb; i++) if (seg[i] !== '.') hits.push({ pos: i, ch: seg[i] })
    const fits = hits.every((h) => h.pos * 2 < spb) && hits.some((h) => h.pos > 0)
    if (!fits) return null // this parent's backbeat does not fold into half-time
    const arr = new Array<string>(spb).fill('.')
    for (const h of hits) arr[h.pos * 2] = h.ch
    newSegs.push(arr.join(''))
  }
  const roles = { ...parent.roles }
  roles.snare =
    'Snare hits relocated to their half-time positions (p → 2p) — the backbeat breathes while the rest of the kit keeps the parent clock.'
  return {
    suffix: 'ht',
    variant: 'Half-Time Feel',
    tracks: cloneTracks(parent.tracks).map((t) =>
      t.inst === 'snare' ? { ...t, pat: joinPat(newSegs) } : { ...t },
    ),
    roles,
    summary: `Half-time feel on “${parent.title}”: every snare hit jumps to double its position inside the bar — half the backbeats, same clock.`,
    description: `The classic half-time move: each snare hit at position p is rewritten at 2p, so hits from the first half of the bar land in the second half and the backbeat density drops by half while kick, hats and percussion keep the parent's exact time. The grid and bar count are unchanged — the ear simply hears the phrase slow down. This variation only exists where the parent's snare placements all fit inside the first half of the bar, which is why it is not generated for every groove.`,
    construction: `Snare-only transform: every hit at position p is rewritten at 2p within its bar; vacated positions become rests. All other tracks verbatim.`,
  }
}

/* ------------------------------------------------------------------ */
/* Transform 5 — sf: straight-flip                                     */
/* ------------------------------------------------------------------ */

function txStraightFlip(ctx: Ctx): Variation | null {
  const { parent } = ctx
  if (parent.sub !== 2 && parent.sub !== 4) return null // swing only affects even grids
  const cur = parent.swing ?? 0
  const roles = { ...parent.roles }
  const gw = gridWord(parent.sub)
  if (cur > 0) {
    return {
      suffix: 'sf',
      variant: 'Straightened',
      tracks: cloneTracks(parent.tracks),
      roles,
      swing: 0,
      feel: 'straight',
      summary: `Straightened “${parent.title}”: the parent's ${cur} swing is removed — every odd ${gw} step lands dead on the grid.`,
      description: `Swing on an even grid delays the odd steps of each pair — here by up to ${cur} of a step, which is what made the parent lean. This variation keeps every hit in its position and simply removes the timing offset, so the same notes are read square. A/B-ing a groove with and without its swing is the fastest way to hear how much of a "feel" was timing rather than notes.`,
      construction: `Timing metadata only: swing ${cur} → 0, feel → straight. Every track string, role and velocity is identical to the parent.`,
    }
  }
  return {
    suffix: 'sf',
    variant: 'Light Swing',
    tracks: cloneTracks(parent.tracks),
    roles,
    swing: 0.12,
    feel: 'swung',
    summary: `Light swing on “${parent.title}”: a 0.12 swing is applied — odd ${gw} steps lean slightly late, relaxing a rigid grid without shuffling it.`,
    description: `The parent plays every step dead on the grid. This variation adds a 0.12 swing, which delays the odd steps of each ${gw} pair by a twelfth of a step — barely a shuffle, but enough that the loop stops sounding like a metronome. Positions, velocities and every track are the parent's; only the playback timing model changes, which is exactly how a DAW groove template works.`,
    construction: `Timing metadata only: swing 0 → 0.12, feel → swung. Every track string, role and velocity is identical to the parent.`,
  }
}

/* ------------------------------------------------------------------ */
/* Transform 6 — dt: double-time hats                                  */
/* ------------------------------------------------------------------ */

function txDoubleTimeHats(ctx: Ctx): Variation | null {
  const { parent, spb, bars } = ctx
  const hc = ctx.track('hatClosed')
  if (!hc) return null
  const segs = ctx.segs('hatClosed')
  if (!segs) return null
  const flat = segs.join('')
  const filled = flat
    .split('')
    .map((ch) => (ch === '.' ? 'x' : ch))
    .join('')
  if (filled === flat) return null // hat already plays every step
  const newSegs: string[] = []
  for (let b = 0; b < bars; b++) newSegs.push(filled.slice(b * spb, (b + 1) * spb))
  const gw = gridWord(parent.sub)
  const roles = { ...parent.roles }
  const hRole = roles.hatClosed
  roles.hatClosed = hRole
    ? `${hRole} Filled out to a continuous ${gw} stream at lower velocity in this variation.`
    : `Filled out to a continuous ${gw} stream at lower velocity in this variation.`
  return {
    suffix: 'dt',
    variant: 'Double-Time Hats',
    tracks: cloneTracks(parent.tracks).map((t) =>
      t.inst === 'hatClosed' ? { ...t, pat: joinPat(newSegs) } : { ...t },
    ),
    roles,
    summary: `Double-time hats on “${parent.title}”: the closed hat sounds on every step of the grid at lower velocity — the parent's spaces become motion.`,
    description: `Every silent step of the parent's closed-hat track is filled with a soft “x” hit, so the hat plays a continuous ${gw} stream while original accents (“X”) and existing hits keep their positions and levels. This is the standard way to add drive to a loop without re-writing it: kick and snare stay verbatim, and the ear reads the doubled hat rate as a tempo lift even though the clock never moves.`,
    construction: `Closed-hat track filled to a continuous ${spb * bars}-step stream (silent steps → “x”, accents kept); all other tracks verbatim.`,
  }
}

/* ------------------------------------------------------------------ */
/* Transform 7 — sc: sparse-cut                                        */
/* ------------------------------------------------------------------ */

function txSparseCut(ctx: Ctx): Variation | null {
  const { parent, spb, bars } = ctx
  let removed = 0
  const changedInsts: InstrumentId[] = []
  const tracks = parent.tracks.map((t) => {
    const flat = t.pat.replace(/\|/g, '')
    if (!flat.includes('o')) return { ...t }
    const cut = flat
      .split('')
      .map((ch) => (ch === 'o' ? '.' : ch))
      .join('')
    const segs: string[] = []
    for (let b = 0; b < bars; b++) segs.push(cut.slice(b * spb, (b + 1) * spb))
    for (const ch of flat) if (ch === 'o') removed++
    changedInsts.push(t.inst)
    return { ...t, pat: joinPat(segs) }
  })
  if (removed === 0) return null
  const roles = { ...parent.roles }
  for (const inst of changedInsts) {
    const r = roles[inst]
    roles[inst] = r ? `${r} Ghost layer removed in this variation.` : 'Ghost layer removed in this variation.'
  }
  return {
    suffix: 'sc',
    variant: 'Sparse Cut',
    tracks,
    roles,
    summary: `Sparse cut of “${parent.title}”: every ghost note is lifted out, leaving the bare accent skeleton of the groove.`,
    description: `The parent's ghost layer — the soft “o” hits that smear the pocket — is removed completely (${removed} hits across ${changedInsts.length} track${changedInsts.length === 1 ? '' : 's'}). What remains is the structural skeleton: accents, normal hits, rolls and probabilistic hits all in their original positions. Engineers A-B this move constantly: with the ghosts muted you hear exactly how much of a groove's feel lived below the accents.`,
    construction: `Ghost notes (“o”) removed from all tracks (${removed} hits cleared); every other character, position and track unchanged.`,
  }
}

/* ------------------------------------------------------------------ */
/* Transform 8 — ap: accent-push                                       */
/* ------------------------------------------------------------------ */

function txAccentPush(ctx: Ctx): Variation | null {
  const { parent, spb, bars } = ctx
  const beatsPerBar = spb / parent.sub
  const oddBeats: number[] = []
  const evenBeats: number[] = []
  for (let b = 0; b < beatsPerBar; b++) (b % 2 === 1 ? oddBeats : evenBeats).push(b)
  // tier 1: backbeat-region beats (2, 4, …); tier 2 fallback: front beats (1, 3, …)
  for (const tier of [oddBeats, evenBeats]) {
    let pushed = 0
    const changedInsts: InstrumentId[] = []
    const tracks = parent.tracks.map((t) => {
      const segs = normalizePat(t.pat, spb, bars)
      let trackChanged = false
      const newSegs = segs.map((seg) => {
        const arr = seg.split('')
        for (const b of tier) {
          const pos = b * parent.sub
          if (arr[pos] === 'x') {
            arr[pos] = 'X'
            trackChanged = true
            pushed++
          }
        }
        return arr.join('')
      })
      if (trackChanged) changedInsts.push(t.inst)
      return trackChanged ? { ...t, pat: joinPat(newSegs) } : { ...t }
    })
    if (pushed === 0) continue // no “x” on this tier — try the other one
    const roles = { ...parent.roles }
    for (const inst of changedInsts) {
      const r = roles[inst]
      roles[inst] = r
        ? `${r} Downbeat hits pushed to full accents in this variation.`
        : 'Downbeat hits pushed to full accents in this variation.'
    }
    const beatNums = tier.map((b) => b + 1).join(' & ')
    const tierWord = tier === oddBeats ? 'backbeat-region' : 'front-end'
    const trackWord = changedInsts.length === 1 ? 'track' : 'tracks'
    const gw = gridWord(parent.sub)
    return {
      suffix: 'ap',
      variant: 'Accent Push',
      tracks,
      roles,
      summary: `Accent push on “${parent.title}”: ${pushed} downbeat hit${pushed === 1 ? '' : 's'} step${pushed === 1 ? 's' : ''} up from normal velocity to full accents, sharpening beat${tier.length > 1 ? 's' : ''} ${beatNums}.`,
      description: `In the parent, the ${gw} downbeats of beat${tier.length > 1 ? 's' : ''} ${beatNums} carried normal (“x”) hits. This variation pushes them to accented (“X”) — ${pushed} hits across ${changedInsts.length} ${trackWord}. Nothing moves in time and no ghost or rest is touched; only the velocity tier changes. Pushing downbeat hits to full accents is the arranger's way of making the same loop hit harder without adding a single note.`,
      construction: `Velocity-only transform: “x” hits on ${tierWord} downbeats (beat${tier.length > 1 ? 's' : ''} ${beatNums}) upgraded to “X” — ${pushed} hits across ${changedInsts.length} ${trackWord}; positions unchanged.`,
    }
  }
  return null
}

/* ------------------------------------------------------------------ */
/* Transform 9 — rs: rim-swap                                          */
/* ------------------------------------------------------------------ */

function txRimSwap(ctx: Ctx): Variation | null {
  const { parent } = ctx
  const snare = ctx.track('snare')
  if (!snare) return null
  if (ctx.track('rimshot')) return null // never duplicate the rim voice
  const tracks = parent.tracks.map((t) =>
    t.inst === 'snare' ? ({ ...t, inst: 'rimshot' as InstrumentId }) : { ...t },
  )
  const roles = { ...parent.roles }
  const snareRole = roles.snare
  delete roles.snare
  roles.rimshot = `Rimshot standing in for the snare — ${snareRole ?? 'same pattern, played narrower and drier.'}`
  return {
    suffix: 'rs',
    variant: 'Rimshot Swap',
    tracks,
    roles,
    summary: `Rimshot swap on “${parent.title}”: the snare track is revoiced as rimshot clicks — same pattern, narrower and drier.`,
    description: `The parent's snare line plays note-for-note, but every hit sounds as a rimshot: high, woody and much narrower than a drum head. Swapping the snare voice for a rim is a standard studio substitute when a backbeat cuts too wide for a mix — the rhythm reads identically on the grid while the timbre pulls the loop back between the speakers. Only the instrument assignment changes; velocities, positions and every other track are the parent's.`,
    construction: `Track revoice only: snare → rimshot with identical pattern, volume and pan; all other tracks and roles unchanged.`,
  }
}

/* ------------------------------------------------------------------ */
/* Transform 10 — ft: fill-tail                                        */
/* ------------------------------------------------------------------ */

const FILL_LIBRARY: { pat: string; desc: string }[] = [
  { pat: 'ooXX', desc: 'two ghost taps into two full accents' },
  { pat: 'o.oX', desc: 'a dragged ghost, a rest, then a last-instant accent' },
  { pat: 'xxXX', desc: 'an even four-stroke build that lands accented' },
  { pat: 'ooxo', desc: 'an all-soft churn that ducks under the loop point' },
]

function txFillTail(ctx: Ctx): Variation | null {
  const { parent, spb, bars, rng } = ctx
  if (bars !== 1 || (parent.bars ?? 1) !== 1) return null // single-bar parents only
  if (spb < 8) return null // too little room for a four-step tail
  const snare = ctx.track('snare')
  if (!snare) return null
  const fill = FILL_LIBRARY[Math.floor(rng() * FILL_LIBRARY.length)]
  const tracks = parent.tracks.map((t) => {
    const seg = normalizePat(t.pat, spb, 1)[0]
    let seg2 = seg
    if (t.inst === 'snare') {
      const arr = seg.split('')
      for (let k = 0; k < 4; k++) arr[spb - 4 + k] = fill.pat[k]
      seg2 = arr.join('')
    }
    return { ...t, pat: `${seg}|${seg2}` }
  })
  const roles = { ...parent.roles }
  const sRole = roles.snare
  roles.snare = sRole
    ? `${sRole} Bar 2 closes with the four-step authored fill “${fill.pat}” in this variation.`
    : `Bar 2 closes with the four-step authored fill “${fill.pat}” in this variation.`
  return {
    suffix: 'ft',
    variant: 'Fill Tail',
    tracks,
    roles,
    bars: 2,
    summary: `Fill tail on “${parent.title}”: the parent bar is doubled and bar 2 ends with a four-step snare fill that launches the loop back to one.`,
    description: `Bar 1 is the parent groove, note-for-note. Bar 2 repeats it, but the snare's last four steps are replaced with a small authored fill — ${fill.desc} (“${fill.pat}”). A fill in the final beat of a two-bar phrase is how a loop tells the listener it is turning over; everything else (kick, hats, percussion) keeps the parent's exact grid in both bars, so the fill is the only new information the ear gets.`,
    construction: `bars: 2 — bar 1 verbatim; bar 2 verbatim except the snare's final four steps, replaced with the authored fill “${fill.pat}” (${fill.desc}).`,
  }
}

/* ------------------------------------------------------------------ */
/* Transform 11 — rd: ride-swap                                        */
/* ------------------------------------------------------------------ */

/** families where a ride cymbal is a natural kit voice (drum-kit styles,
 *  not machine/programmed styles) */
const RIDE_FAMILIES = new Set([
  'jazz', 'rock', 'blues', 'country', 'gospel', 'metal', 'ska', 'reggae',
  'afrobeat', 'african', 'samba', 'latin', 'bossa', 'world', 'caribbean',
  'funk', 'rnb', 'pop', 'punk', 'fills', 'learn', 'experimental', 'balkan',
  'indian', 'arabic',
])

function txRideSwap(ctx: Ctx): Variation | null {
  const { parent } = ctx
  if (parent.sub === 1) return null // ride revoice needs a subdivided grid
  if (!RIDE_FAMILIES.has(parent.family)) return null
  const hc = ctx.track('hatClosed')
  if (!hc) return null
  if (ctx.track('ride')) return null // never duplicate the ride voice
  const tracks = parent.tracks.map((t) =>
    t.inst === 'hatClosed' ? ({ ...t, inst: 'ride' as InstrumentId }) : { ...t },
  )
  const roles = { ...parent.roles }
  const hcRole = roles.hatClosed
  delete roles.hatClosed
  roles.ride = `Ride standing in for the closed hat — ${hcRole ?? 'same pattern, played on the larger cymbal.'}`
  return {
    suffix: 'rd',
    variant: 'Ride Swap',
    tracks,
    roles,
    summary: `Ride swap on “${parent.title}”: the closed-hat line is revoiced on the ride — same pattern, broader cymbal color.`,
    description: `The parent's closed-hat figure plays note-for-note, but every hit sounds on the ride cymbal: wider, washier and lower-pitched than the hat. Moving the timekeeping voice from hat to ride is one of the oldest arranging moves in jazz, rock and Afro-Caribbean drumming — the rhythm reads identically on the grid while the timbre opens the top end of the kit. Only the instrument assignment changes; velocities, positions and every other track are the parent's.`,
    construction: `Track revoice only: hatClosed → ride with identical pattern, volume and pan; all other tracks unchanged.`,
  }
}

/* ------------------------------------------------------------------ */
/* Transform 12 — cl: clap-swap                                        */
/* ------------------------------------------------------------------ */

/** families where a clap on the backbeat is idiomatic (dance/pop/machine styles) */
const CLAP_FAMILIES = new Set([
  'club', 'pop', 'disco', 'house', 'garage', 'techno', 'synthwave', 'rnb',
  'hiphop', 'trap', 'drill', 'dubstep', 'breaks', 'jungle', 'funk', 'lofi',
])

function txClapSwap(ctx: Ctx): Variation | null {
  const { parent, spb, bars } = ctx
  if (!CLAP_FAMILIES.has(parent.family)) return null
  const snare = ctx.track('snare')
  if (!snare) return null
  if (ctx.track('clap')) return null // never duplicate the clap voice
  const segs = ctx.segs('snare')
  if (!segs) return null
  // the clap revoice is honest only for a strictly on-beat, sparse backbeat:
  // every hit on a beat start, at most 4 hits per bar
  let hits = 0
  for (const seg of segs) {
    let perBar = 0
    for (let i = 0; i < spb; i++) {
      if (seg[i] !== '.') {
        hits++
        perBar++
        if (i % parent.sub !== 0 || perBar > 4) return null
      }
    }
  }
  if (hits === 0) return null
  const tracks = parent.tracks.map((t) =>
    t.inst === 'snare' ? ({ ...t, inst: 'clap' as InstrumentId }) : { ...t },
  )
  const roles = { ...parent.roles }
  const snareRole = roles.snare
  delete roles.snare
  roles.clap = `Clap standing in for the snare — ${snareRole ?? 'same backbeat, layered crowd width.'}`
  const gw = gridWord(parent.sub)
  return {
    suffix: 'cl',
    variant: 'Clap Swap',
    tracks,
    roles,
    summary: `Clap swap on “${parent.title}”: the on-beat snare backbeat is revoiced as claps — the signature dance/pop width move.`,
    description: `The parent's snare plays only on beat starts (${hits} hit${hits === 1 ? '' : 's'} across ${bars} bar${bars === 1 ? '' : 's'}), which is exactly the shape a clap revoice wants: claps have a wide, diffuse attack that reads best on anchor positions, not on busy offbeats. This variation keeps every position, velocity and other track identical and simply swaps the snare voice for a clap — the standard revoicing behind disco, house and pop backbeats on a ${gw} grid.`,
    construction: `Track revoice only: snare → clap with identical pattern, volume and pan; applied only because every snare hit sits on a beat start (≤ 4 per bar); all other tracks unchanged.`,
  }
}

/* ------------------------------------------------------------------ */
/* Transform 13 — tm: tom-accent                                       */
/* ------------------------------------------------------------------ */

/** families where toms are part of the working kit voice */
const TOM_FAMILIES = new Set([
  'fills', 'rock', 'metal', 'punk', 'funk', 'gospel', 'jazz', 'blues',
  'country', 'latin', 'samba', 'bossa', 'afrobeat', 'world', 'caribbean',
  'rnb', 'pop', 'hiphop', 'drill', 'trap', 'breaks', 'learn', 'reggae',
  'ska', 'experimental', 'arabic', 'indian', 'balkan',
])

function txTomAccent(ctx: Ctx): Variation | null {
  const { parent, spb, bars, rng } = ctx
  if (!TOM_FAMILIES.has(parent.family)) return null
  if (spb < 8) return null // need a full beat of room
  const lastBeatStart = spb - parent.sub
  // prefer the low tom; fall back to the mid tom when the low tom exists but
  // has no silent step left in the final beat
  const tryInsts: InstrumentId[] = ['tomLow', 'tomMid']
  for (const inst of tryInsts) {
    const existing = ctx.track(inst)
    const segs = existing ? ctx.segs(inst) : undefined
    if (existing && !segs) continue
    const lastSeg = segs ? segs[bars - 1] : undefined
    const cands: number[] = []
    if (lastSeg) {
      for (let i = lastBeatStart; i < spb; i++) if (lastSeg[i] === '.') cands.push(i)
    } else {
      for (let i = lastBeatStart; i < spb; i++) cands.push(i)
    }
    if (cands.length === 0) continue
    const start = Math.floor(rng() * cands.length)
    const n = Math.min(1 + (rng() < 0.5 ? 1 : 0), cands.length)
    const added: number[] = []
    for (let k = 0; k < n; k++) added.push(cands[(start + k) % cands.length])
    const newSegs = segs
      ? segs.slice()
      : new Array<string>(bars).fill('.'.repeat(spb))
    newSegs[bars - 1] = (() => {
      const arr = newSegs[bars - 1].split('')
      for (const p of added) arr[p] = 'X'
      return arr.join('')
    })()
    const inserted = !existing
    const tracks = cloneTracks(parent.tracks)
    if (inserted) {
      const track: AuthorTrack = { inst, pat: joinPat(newSegs), vol: 0.85, pan: inst === 'tomLow' ? -0.15 : 0.15 }
      const anchor = tracks.findIndex((t) => t.inst === 'snare')
      if (anchor >= 0) tracks.splice(anchor + 1, 0, track)
      else tracks.push(track)
    } else {
      const idx = tracks.findIndex((t) => t.inst === inst)
      tracks[idx] = { ...tracks[idx], pat: joinPat(newSegs) }
    }
    const roles = { ...parent.roles }
    const r = roles[inst]
    roles[inst] = r
      ? `${r} Accent${n === 1 ? '' : 's'} added in the final beat of the last bar in this variation.`
      : `Accent${n === 1 ? '' : 's'} added in the final beat of the last bar in this variation.`
    const posWord = added.map((p) => `step ${p}`).join(' and ')
    const beatNo = Math.floor(lastBeatStart / parent.sub) + 1
    const tomName = inst === 'tomLow' ? 'low tom' : 'mid tom'
    return {
      suffix: 'tm',
      variant: 'Tom Accent',
      tracks,
      roles,
      summary: `Tom accent${n === 1 ? '' : 's'} on “${parent.title}”: ${n === 1 ? 'a low/mid tom hit' : `${n} low/mid tom hits`} land${n === 1 ? 's' : ''} in the final beat of the last bar — a fill-adjacent signal that the phrase is ending.`,
      description: `The parent groove plays untouched until the very end of the phrase. In the final beat of the last bar (beat ${beatNo}), ${n === 1 ? 'one accent' : `${n} accents`} on the ${tomName} sound at ${posWord} — steps that were silent in the parent. Dropping a tom into the last beat is the smallest possible fill: it does not disturb the backbeat, but it tells the listener the loop is about to turn over, the way a drummer leans into the kit at the end of a phrase.`,
      construction: `${inserted ? `New ${inst} track added; ` : ''}accent${n === 1 ? '' : 's'} (“X”) added at ${posWord} of the last bar's final beat; all other hits and tracks verbatim.`,
    }
  }
  return null
}

/* ------------------------------------------------------------------ */
/* Transform 14 — k2: kick-double                                      */
/* ------------------------------------------------------------------ */

function txKickDouble(ctx: Ctx): Variation | null {
  const { parent, spb } = ctx
  if (parent.sub !== 4 && parent.sub !== 6) return null // fine grids only
  const kick = ctx.track('kick')
  if (!kick) return null
  const segs = ctx.segs('kick')
  if (!segs) return null
  const seg = segs[0]
  let first = -1
  for (let i = 0; i < spb; i++) {
    if (seg[i] !== '.') {
      first = i
      break
    }
  }
  if (first < 0 || first + 1 >= spb || seg[first + 1] !== '.') return null
  const arr = seg.split('')
  arr[first + 1] = 'x'
  const newSegs = segs.slice()
  newSegs[0] = arr.join('')
  const gw = gridWord(parent.sub)
  const roles = { ...parent.roles }
  const kRole = roles.kick
  roles.kick = kRole
    ? `${kRole} The first kick of bar 1 is doubled one ${gw} step later in this variation.`
    : `The first kick of bar 1 is doubled one ${gw} step later in this variation.`
  return {
    suffix: 'k2',
    variant: 'Kick Double',
    tracks: cloneTracks(parent.tracks).map((t) =>
      t.inst === 'kick' ? { ...t, pat: joinPat(newSegs) } : { ...t },
    ),
    roles,
    summary: `Kick double on “${parent.title}”: the first kick of the loop is answered by a soft kick one ${gw} step later — the classic double-stroke push.`,
    description: `The parent's first kick lands at step ${first} of bar 1 and nothing follows it. This variation adds a single softer kick (“x”) at step ${first + 1}, one ${gw} step later — a double stroke. Doubling the first kick is a signature move in funk, gospel and drum-line playing: the downbeat keeps its full weight from the original hit, and the quick second hit adds forward motion into the rest of the bar. Every other hit in the pattern is untouched.`,
    construction: `Kick hit added at step ${first + 1} of bar 1 (“x”, one ${gw} step after the parent's first kick at step ${first}); all other hits and tracks verbatim.`,
  }
}

/* ------------------------------------------------------------------ */
/* Transform 15 — hs: hat-soften                                       */
/* ------------------------------------------------------------------ */

/** families with the lofi/dusty dampened-hat aesthetic */
const DUSTY_FAMILIES = new Set([
  'lofi', 'hiphop', 'rnb', 'trap', 'drill', 'dubstep', 'jungle', 'garage',
  'pop', 'disco', 'funk', 'breaks', 'club', 'house',
])

function txHatSoften(ctx: Ctx): Variation | null {
  const { parent, spb } = ctx
  if (parent.sub === 1) return null
  const hc = ctx.track('hatClosed')
  if (!hc) return null
  const hcSegs = ctx.segs('hatClosed')
  if (!hcSegs) return null
  if (!hcSegs.some((s) => s.includes('X'))) return null // nothing to soften
  const snare = ctx.track('snare')
  if (!snare) return null
  const snSegs = ctx.segs('snare')
  if (!snSegs) return null
  const gated = parent.kit === 'dusty' || DUSTY_FAMILIES.has(parent.family)
  if (!gated) return null
  const off = offbeatPos(parent.sub)
  // one ghost on the first silent snare offbeat of each bar
  let ghosts = 0
  const newSnSegs = snSegs.map((seg) => {
    for (let i = 0; i < spb; i++) {
      if (i % parent.sub === off && seg[i] === '.') {
        ghosts++
        return `${seg.slice(0, i)}o${seg.slice(i + 1)}`
      }
    }
    return seg
  })
  if (ghosts === 0) return null
  const newHatSegs = hcSegs.map((seg) => seg.split('').map((c) => (c === 'X' ? 'x' : c)).join(''))
  const roles = { ...parent.roles }
  const hRole = roles.hatClosed
  roles.hatClosed = hRole
    ? `${hRole} Accents softened to normal velocity in this variation.`
    : 'Accents softened to normal velocity in this variation.'
  const sRole = roles.snare
  roles.snare = sRole
    ? `${sRole} One ghost added on a silent offbeat of each bar in this variation.`
    : 'One ghost added on a silent offbeat of each bar in this variation.'
  const gw = gridWord(parent.sub)
  return {
    suffix: 'hs',
    variant: 'Hat Soften',
    tracks: cloneTracks(parent.tracks).map((t) => {
      if (t.inst === 'hatClosed') return { ...t, pat: joinPat(newHatSegs) }
      if (t.inst === 'snare') return { ...t, pat: joinPat(newSnSegs) }
      return { ...t }
    }),
    roles,
    summary: `Hat soften on “${parent.title}”: every hat accent relaxes to a normal hit and one snare ghost per bar tucks underneath — the dusty, lo-fi way to de-stiffen a loop.`,
    description: `Two small dynamics moves, applied together: every accented (“X”) closed-hat hit is softened to a normal (“x”) hit — ${hcSegs.join('').split('').filter((c) => c === 'X').length} accents across the loop — and one soft ghost (“o”) is added on the first silent ${gw} offbeat of the snare in each bar (${ghosts} ghosts total). Nothing moves in time and no note is removed. This is the standard velocity treatment when a programmed loop sounds too eager: the hats stop chopping the top end and the snare gains the low, brushed undertone that defines dusty boom-bap and lo-fi takes.`,
    construction: `Velocity edits only: hatClosed “X” → “x” everywhere; snare ghost (“o”) added at the first silent ${gw} offbeat of each bar; positions otherwise unchanged.`,
  }
}

/* ------------------------------------------------------------------ */
/* Transform 16 — pb: push-beat                                        */
/* ------------------------------------------------------------------ */

function txPushBeat(ctx: Ctx): Variation | null {
  const { parent, spb } = ctx
  if (parent.sub !== 2 && parent.sub !== 4) return null // 'one eighth later' needs an even grid
  const snare = ctx.track('snare')
  if (!snare) return null
  const segs = ctx.segs('snare')
  if (!segs) return null
  const shift = parent.sub === 2 ? 1 : 2 // one eighth note, in grid steps
  for (const seg of segs) {
    let any = false
    for (let i = 0; i < spb; i++) {
      if (seg[i] === '.') continue
      any = true
      if (i + shift >= spb || seg[i + shift] !== '.') return null // past the bar line or collision
    }
    if (!any) return null
  }
  const newSegs = segs.map((seg) => {
    const arr = seg.split('')
    // shift right-to-left so hits never overwrite each other
    for (let i = spb - 1 - shift; i >= 0; i--) {
      if (arr[i] !== '.') {
        arr[i + shift] = arr[i]
        arr[i] = '.'
      }
    }
    return arr.join('')
  })
  const roles = { ...parent.roles }
  const sRole = roles.snare
  roles.snare = sRole
    ? `${sRole} Every hit shifted one eighth later within its bar in this variation.`
    : 'Every hit shifted one eighth later within its bar in this variation.'
  return {
    suffix: 'pb',
    variant: 'Late Push',
    tracks: cloneTracks(parent.tracks).map((t) =>
      t.inst === 'snare' ? { ...t, pat: joinPat(newSegs) } : { ...t },
    ),
    roles,
    summary: `Late push on “${parent.title}”: every snare hit moves one eighth later inside its bar — the whole backbeat leans back.`,
    description: `Every snare hit in the parent — accents, ghosts, all of them — is displaced exactly one eighth note later (${shift} grid step${shift === 1 ? '' : 's'} on this ${gridWord(parent.sub)} grid), staying inside its own bar. The guard allows the move only when every landing step was silent, so no information is lost and no hit crosses the bar line. Delaying an entire backbeat by an eighth is the classic "laid-back drummer" edit: the kick and hats keep the original clock, and the snare's new placement creates the behind-the-beat tension that reads as feel rather than mistake.`,
    construction: `Snare-only transform: every hit moved ${shift} step${shift === 1 ? '' : 's'} later within its bar (only where the landing step was silent); all other tracks verbatim.`,
  }
}

/* ------------------------------------------------------------------ */
/* Transform 17 — rl: reggae-lean                                      */
/* ------------------------------------------------------------------ */

function txReggaeLean(ctx: Ctx): Variation | null {
  const { parent, spb, bars } = ctx
  if (parent.family !== 'reggae' && parent.family !== 'ska' && parent.family !== 'dubstep') return null
  if (parent.ts[0] !== 4) return null // one-drop is defined on 4/4
  const kick = ctx.track('kick')
  if (!kick) return null
  const segs = ctx.segs('kick')
  if (!segs) return null
  const drop = 2 * parent.sub // beat 3 in a 4/4 bar
  const oneDropSeg = `${'.'.repeat(drop)}X${'.'.repeat(spb - drop - 1)}`
  const newKickSegs = segs.map(() => oneDropSeg)
  const kickChanged = newKickSegs.some((s, i) => s !== segs[i])
  const existingRim = ctx.track('rimshot')
  const rimAdded = !existingRim
  const newRimSegs = new Array<string>(bars).fill(oneDropSeg)
  if (!kickChanged && !rimAdded) return null
  const tracks = cloneTracks(parent.tracks).map((t) =>
    t.inst === 'kick' ? { ...t, pat: joinPat(newKickSegs) } : { ...t },
  )
  if (rimAdded) {
    const rimTrack: AuthorTrack = { inst: 'rimshot', pat: joinPat(newRimSegs), vol: 0.75, pan: 0 }
    const idx = tracks.findIndex((t) => t.inst === 'kick')
    tracks.splice(idx + 1, 0, rimTrack)
  }
  const roles = { ...parent.roles }
  const kRole = roles.kick
  roles.kick = kRole
    ? `${kRole} Reduced to the one-drop (beat 3 only) in this variation.`
    : 'Reduced to the one-drop (beat 3 only) in this variation.'
  if (rimAdded) roles.rimshot = 'Crossstick rimshot doubling the one-drop on beat 3 — the classic reggae anchor.'
  const beatNo = Math.floor(drop / parent.sub) + 1
  return {
    suffix: 'rl',
    variant: 'One-Drop Lean',
    tracks,
    roles,
    summary: `One-drop lean on “${parent.title}”: the kick is stripped to a single hit on beat ${beatNo} — with a rimshot crossstick on top when none was present — turning the groove into a reggae one-drop.`,
    description: `The one-drop is the reggae signature: the kick plays only on beat ${beatNo} of the bar, and the drum's "snare hand" rests on the same beat as a dry crossstick. This variation rewrites the parent's kick line to that single anchor hit in every bar${rimAdded ? ' and adds a rimshot crossstick on the same beat' : ''}. Hats, percussion and every other track keep the parent's exact grid, so the change reads as a re-weighting of the groove's center of gravity — the discipline move that makes a loop lean back like Kingston instead of pushing forward.`,
    construction: `Kick track rewritten to a single “X” on beat ${beatNo} (step ${drop}) of each bar; ${rimAdded ? 'new rimshot track added on the same beat; ' : ''}all other tracks verbatim.`,
  }
}

/* ------------------------------------------------------------------ */
/* Transform 18 — tl: triplet-lean                                     */
/* ------------------------------------------------------------------ */

function txTripletLean(ctx: Ctx): Variation | null {
  const { parent, spb, rng } = ctx
  if (parent.sub !== 3 && parent.sub !== 6) return null // triplet grids only
  const hc = ctx.track('hatClosed')
  if (!hc) return null
  const segs = ctx.segs('hatClosed')
  if (!segs) return null
  for (let b = 0; b < segs.length; b++) {
    const seg = segs[b]
    const cands: number[] = []
    for (let i = 0; i < spb - 1; i++) {
      if (seg[i] === 'X' && seg[i + 1] === '.') cands.push(i)
    }
    if (cands.length === 0) continue
    const from = cands[Math.floor(rng() * cands.length)]
    const arr = seg.split('')
    arr[from] = '.'
    arr[from + 1] = 'X'
    const newSegs = segs.slice()
    newSegs[b] = arr.join('')
    const gw = gridWord(parent.sub)
    const roles = { ...parent.roles }
    const hRole = roles.hatClosed
    roles.hatClosed = hRole
      ? `${hRole} One accent displaced one ${gw} step later in this variation.`
      : `One accent displaced one ${gw} step later in this variation.`
    return {
      suffix: 'tl',
      variant: 'Triplet Lean',
      tracks: cloneTracks(parent.tracks).map((t) =>
        t.inst === 'hatClosed' ? { ...t, pat: joinPat(newSegs) } : { ...t },
      ),
      roles,
      summary: `Triplet lean on “${parent.title}”: one hat accent slips one ${gw} step later, tilting the triplet grid without moving anything else.`,
      description: `On a triplet grid the ear is hypersensitive to where accents sit inside the three-part beat. This variation takes a single closed-hat accent at step ${from} and moves it to step ${from + 1} — one ${gw} subdivision later, onto a step that was silent. One step of displacement on a triplet feel is the difference between "on top" and "leaning"; drummers do this constantly by feel, and here it is applied exactly once, deterministically, with every other hit exactly where the parent put it.`,
      construction: `Closed-hat accent moved from step ${from} to step ${from + 1} (one ${gw} step later, landing on a previously silent step); all other hits and tracks verbatim.`,
    }
  }
  return null
}

/* ------------------------------------------------------------------ */
/* Transform 19 — sl: second-line                                      */
/* ------------------------------------------------------------------ */

const SECOND_LINE_FAMILIES = new Set(['jazz', 'funk', 'gospel', 'blues', 'rnb', 'fills', 'learn'])

function txSecondLine(ctx: Ctx): Variation | null {
  const { parent, spb } = ctx
  if (!SECOND_LINE_FAMILIES.has(parent.family)) return null
  if (parent.sub !== 2 && parent.sub !== 4) return null
  const snare = ctx.track('snare')
  if (!snare) return null
  const segs = ctx.segs('snare')
  if (!segs) return null
  // the second-line ghost positions: the 'a' of beat 1 and the 'a' of beat 3
  const ghostPos = parent.sub === 4 ? [3, 11] : [1, 5]
  if (ghostPos.some((p) => p >= spb)) return null
  let added = 0
  const newSegs = segs.map((seg) => {
    const arr = seg.split('')
    for (const p of ghostPos) {
      if (arr[p] === '.') {
        arr[p] = 'o'
        added++
      }
    }
    return arr.join('')
  })
  if (added === 0) return null
  const roles = { ...parent.roles }
  const sRole = roles.snare
  roles.snare = sRole
    ? `${sRole} Second-line ghosts added at the 'a' of 1 and 'a' of 3 in this variation.`
    : `Second-line ghosts added at the 'a' of 1 and 'a' of 3 in this variation.`
  const gw = gridWord(parent.sub)
  const posWord = parent.sub === 4 ? 'the “a” of beat 1 and the “a” of beat 3' : 'the “&” of beat 1 and the “&” of beat 3'
  return {
    suffix: 'sl',
    variant: 'Second-Line Ghosts',
    tracks: cloneTracks(parent.tracks).map((t) =>
      t.inst === 'snare' ? { ...t, pat: joinPat(newSegs) } : { ...t },
    ),
    roles,
    summary: `Second-line ghosts on “${parent.title}”: soft snare ghosts tuck into ${posWord} — the New Orleans undercurrent that loosens a backbeat.`,
    description: `New Orleans second-line drumming hangs its feel on quiet snare notes between the accents. This variation adds at most two ghosts per bar (${added} across the loop), at ${posWord} — steps that were silent in the parent — and only where the parent left them silent. The accents, kick and hats are untouched: the ghosts sit at the softest velocity tier underneath, which is exactly the layer a parade drummer keeps moving while the band plays the form.`,
    construction: `Snare ghosts (“o”) added at ${posWord} (≤ 2 per bar, only on silent steps); all other hits and tracks verbatim.`,
  }
}

/* ------------------------------------------------------------------ */
/* Transform 20 — bd: bass-drop                                        */
/* ------------------------------------------------------------------ */

const DANCE_FAMILIES = new Set([
  'house', 'techno', 'garage', 'jungle', 'breaks', 'dubstep', 'club',
  'disco', 'drill', 'trap', 'hiphop', 'synthwave', 'lofi', 'pop',
])

function txBassDrop(ctx: Ctx): Variation | null {
  const { parent, spb } = ctx
  if (!DANCE_FAMILIES.has(parent.family)) return null
  const kick = ctx.track('kick')
  if (!kick) return null
  const segs = ctx.segs('kick')
  if (!segs) return null
  const seg = segs[0]
  let first = -1
  let hits = 0
  for (let i = 0; i < spb; i++) {
    if (seg[i] !== '.') {
      hits++
      if (first < 0) first = i
    }
  }
  if (first < 0 || hits < 2) return null // bar 1 must keep at least one other kick
  const arr = seg.split('')
  arr[first] = '.'
  const newSegs = segs.slice()
  newSegs[0] = arr.join('')
  const roles = { ...parent.roles }
  const kRole = roles.kick
  roles.kick = kRole
    ? `${kRole} The first kick of bar 1 is lifted out in this variation.`
    : 'The first kick of bar 1 is lifted out in this variation.'
  return {
    suffix: 'bd',
    variant: 'Bass Drop',
    tracks: cloneTracks(parent.tracks).map((t) =>
      t.inst === 'kick' ? { ...t, pat: joinPat(newSegs) } : { ...t },
    ),
    roles,
    summary: `Bass drop on “${parent.title}”: the first kick of the loop is lifted out, so the bar enters on space and the remaining kicks hit harder by contrast.`,
    description: `The parent's kick lands at step ${first} of bar 1. This variation removes exactly that hit — bar 1 still carries its other ${hits - 1} kick hit${hits - 1 === 1 ? '' : 's'}, so the groove keeps its pulse — and the loop now enters on a breath of silence. Starting a dance loop one kick "short" is a standard edit in house, techno and garage: the empty downbeat makes the next kick land heavier and gives DJs a cleaner phrase boundary to mix across. Nothing else in the grid is touched.`,
    construction: `Kick hit removed at step ${first} of bar 1 (the vacated step becomes a rest); all other hits and tracks verbatim.`,
  }
}

/* ------------------------------------------------------------------ */
/* Transform registry (fixed order → deterministic rng consumption;    */
/* old and new transforms interleaved so the per-parent cap keeps a    */
/* representative mix of both generations)                             */
/* ------------------------------------------------------------------ */

const TRANSFORMS: Transform[] = [
  txGhostWeave,
  txRideSwap,
  txOpenHatLift,
  txClapSwap,
  txKickDisplacement,
  txTomAccent,
  txHalfTimeFeel,
  txKickDouble,
  txStraightFlip,
  txHatSoften,
  txDoubleTimeHats,
  txPushBeat,
  txSparseCut,
  txReggaeLean,
  txAccentPush,
  txTripletLean,
  txRimSwap,
  txSecondLine,
  txFillTail,
  txBassDrop,
]

function variationsOf(parent: AuthorPattern): AuthorPattern[] {
  const bars = parent.bars ?? 1
  const spb = parent.ts[0] * parent.sub
  const ctx: Ctx = {
    parent,
    spb,
    bars,
    rng: mulberry32(hashSeed(parent.id)),
    track: (inst) => parent.tracks.find((t) => t.inst === inst),
    segs: (inst) => {
      const t = parent.tracks.find((x) => x.inst === inst)
      return t ? normalizePat(t.pat, spb, bars) : undefined
    },
  }
  const out: AuthorPattern[] = []
  for (const tx of TRANSFORMS) {
    const v = tx(ctx)
    if (v) out.push(buildVariation(parent, v))
  }
  // per-parent yield cap: at most MAX_PER_PARENT variations per parent, taken
  // in registry order (deterministic; the interleaved registry keeps a mix of
  // first- and second-generation transforms)
  return out.length > MAX_PER_PARENT ? out.slice(0, MAX_PER_PARENT) : out
}

/* ------------------------------------------------------------------ */
/* Parent selection — family round-robin, highest yield first          */
/* ------------------------------------------------------------------ */

const TARGET_VARIATIONS = 3450 // soft target → ≈ 4100 total with 655 authored
const MAX_PARENTS = 700 // above the full parent pool — every eligible parent may be used
const FLOOR_VARIATIONS = 3400 // hard guarantee — overrides MAX_PARENTS if needed
const MIN_YIELD = 6 // a parent must produce at least 6 valid variations
const MAX_PER_PARENT = 10 // per-parent yield cap (was 6–9 in the 946-variation build)

interface Candidate {
  parent: AuthorPattern
  order: number
  variations: AuthorPattern[]
}

const CANDIDATES: Map<string, Candidate[]> = (() => {
  const map = new Map<string, Candidate[]>()
  let order = 0
  for (const pack of SOURCE_PACKS) {
    for (const parent of pack) {
      const variations = variationsOf(parent)
      if (variations.length < MIN_YIELD) continue
      const list = map.get(parent.family) ?? []
      list.push({ parent, order: order++, variations })
      map.set(parent.family, list)
    }
  }
  // deterministic order: most productive parents first, pack order as tie-break
  for (const list of map.values()) {
    list.sort((a, b) => b.variations.length - a.variations.length || a.order - b.order)
  }
  return map
})()

export const PACK_GENERATED: AuthorPattern[] = (() => {
  const familyOrder = [...CANDIDATES.keys()]
  const pointers = new Map<string, number>(familyOrder.map((f) => [f, 0]))
  const counts = new Map<string, number>(familyOrder.map((f) => [f, 0]))
  const out: AuthorPattern[] = []
  let total = 0
  let used = 0

  // family with the fewest selections so far wins (ties → first in family order);
  // this guarantees every family contributes before any family dominates
  const pickNextFamily = (): string | null => {
    let best: string | null = null
    let bestCount = Number.POSITIVE_INFINITY
    for (const f of familyOrder) {
      const list = CANDIDATES.get(f) ?? []
      const ptr = pointers.get(f) ?? 0
      if (ptr >= list.length) continue
      const c = counts.get(f) ?? 0
      if (c < bestCount) {
        bestCount = c
        best = f
      }
    }
    return best
  }

  const takeOne = (): number => {
    const f = pickNextFamily()
    if (!f) return 0
    const list = CANDIDATES.get(f) ?? []
    const ptr = pointers.get(f) ?? 0
    const cand = list[ptr]
    pointers.set(f, ptr + 1)
    counts.set(f, (counts.get(f) ?? 0) + 1)
    out.push(...cand.variations)
    used++
    return cand.variations.length
  }

  while (total < TARGET_VARIATIONS && used < MAX_PARENTS) {
    const added = takeOne()
    if (added === 0) break
    total += added
  }
  // hard floor for the ≥ 880 catalog guarantee
  while (total < FLOOR_VARIATIONS) {
    const added = takeOne()
    if (added === 0) break
    total += added
  }
  return out
})()
