/**
 * Groovemap — groove expansion pack: funk, rnb, disco, hiphop, trap, pop.
 *
 * 90 authored patterns in the compact authoring format (see types.ts):
 *   X accent · x normal · o ghost · 2/3/4 ratchet roll · p probabilistic · P accent-prob · . rest
 *   one char per step, `|` between bars.
 * All ids carry the `xg-` namespace to stay collision-free with other packs.
 */

import type { AuthorPattern } from '../types'

export const PACK_EXPANSION_GROOVE: AuthorPattern[] = [
  /* ================================================================ Funk ==== */
  {
    id: 'xg-funk-jb-split',
    title: 'JB Split-Beat',
    family: 'funk',
    genres: ['Funk', 'Soul'],
    tags: ['ghost notes', '16ths', 'breakbeat', 'james brown'],
    difficulty: 'intermediate',
    bpm: 102,
    tempoRange: [94, 110],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 3,
    kit: 'dusty',
    summary:
      'James Brown-school funk: a syncopated split kick, a wall of snare ghosts and driving 16th hats.',
    description:
      'Clyde Stubblefield\'s James Brown beats taught drummers that the snare is a conversation, not a backbeat. The kick splits the bar (1, the "a" of 1, the "&" of 2, "&" of 3 and 4) while ghost strokes murmur in every gap around the 2 & 4 cracks. The hats stay in full 16ths with ghosted "a"-counts so the quarters stay audible without ever sounding stiff. Keep the accents staccato and the ghosts under the rafters — this groove is 80% feel.',
    construction:
      'Layer 1: syncopated kick on 1, a1, &2, &3 and 4. Layer 2: backbeat snare wrapped in ghost strokes. Layer 3: 16th hats with quarter accents and an open-hat lift on "&4".',
    tracks: [
      { inst: 'kick', pat: 'X..x..x..x.X...', vol: 1 },
      { inst: 'snare', pat: '....X..o...oX.oo', vol: 0.9 },
      { inst: 'hatClosed', pat: 'XxxoXxxoXxxoXxxo', vol: 0.6 },
      { inst: 'hatOpen', pat: '..............X.', vol: 0.55 },
    ],
    roles: {
      kick: 'The split-beat engine — five points that make the bar lean forward.',
      snare: 'Backbeat anchor plus the ghost-note chatter that fills every gap.',
      hatClosed: 'Relentless 16th subdivision with quarter-note accents.',
      hatOpen: 'One lift on the "&" of 4 pushes the loop back to the one.',
    },
    variations: [
      {
        name: 'Double split',
        note: 'A soft kick on the "a" of 4 doubles the push into the one.',
        overrides: { kick: 'X..x..x..x.X..x' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of James Brown\'s split-beat funk grooves (Clyde Stubblefield era) — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-ghost-pockets',
    title: 'Ghost Pockets',
    family: 'funk',
    genres: ['Funk', 'R&B'],
    tags: ['ghost notes', 'two-bar', 'pocket', 'congas'],
    difficulty: 'intermediate',
    bpm: 96,
    tempoRange: [90, 104],
    ts: [4, 4],
    bars: 2,
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 2,
    kit: 'dusty',
    summary:
      'A two-bar pocket vamp where snare ghosts thicken in bar two and congas answer the kick.',
    description:
      'This is the second-line-meets-funk pocket: bar one states a three-point kick skeleton and bar two doubles the ghost density so the vamp breathes in and out. The conga plays a sparse answer line that never crowds the backbeat, in the spirit of 70s funk rhythm sections that kept a percussionist chained to the pocket. Play the ghosts with fingers only; if you can hear them clearly in a mix, they are too loud.',
    construction:
      'Bar 1: kick on 1, &2 and "&3" with scattered ghosts. Bar 2: same skeleton plus a denser ghost cluster leading home. Hats in swung-straight 8ths with quarter accents throughout.',
    tracks: [
      { inst: 'kick', pat: 'X.....x...X.....|X.....x...X...x.', vol: 1 },
      { inst: 'snare', pat: '....X..o.o..X.o.|....X.oo.o..X.oo', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.|X.x.X.x.X.x.X.x.', vol: 0.6 },
      { inst: 'congaHi', pat: '..x...x...x..x..|..x...x...x..x..', vol: 0.7, pan: 0.2 },
    ],
    roles: {
      kick: 'Three-point skeleton; the bar-2 pickup pushes back to the one.',
      snare: 'Backbeats on 2 & 4 with a bar-2 ghost swell.',
      hatClosed: 'Eighth-note grid with quarter accents keeps the vamp honest.',
      congaHi: 'Answer phrase that fills the space between backbeats.',
    },
    variations: [
      {
        name: 'Pocket lift',
        note: 'A double-stroke on the very last 16th flicks the vamp around.',
        overrides: { hatClosed: 'X.x.X.x.X.x.X.x.|X.x.X.x.X.x.X..2' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice 1970s funk pocket vamp with conga seasoning — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-push-the-one',
    title: 'Push the One',
    family: 'funk',
    genres: ['Funk', 'Soul'],
    tags: ['anticipation', 'push', 'ghosts'],
    difficulty: 'intermediate',
    bpm: 95,
    tempoRange: [88, 102],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 2,
    kit: 'dusty',
    summary:
      'Anticipation funk: the kick fires on the "a" of 4 so beat 1 arrives already falling downhill.',
    description:
      'Funk lives on anticipation — the greatest push in the style is the kick (or bass) that lands on the "a" of 4 and drags the whole band over the barline early. Here the kick hits 1, "&3" and that crucial "a4" pickup, while ghost snares glue the middle of the bar together. Used as a one-bar loop it creates the endless downhill-roll feeling that made 70s funk vamps so hard to sit still to.',
    construction:
      'Kick on 1, "&3" and the "a" of 4. Snare backbeats with ghosts on the "a" of 1 and "&2". Straight 16th hats with quarter accents.',
    tracks: [
      { inst: 'kick', pat: 'X.......x......x', vol: 1 },
      { inst: 'snare', pat: '...oX..o....X.o.', vol: 0.9 },
      { inst: 'hatClosed', pat: 'XxxxXxxxXxxxXxxx', vol: 0.6 },
    ],
    roles: {
      kick: 'States the downbeat and the anticipation pickup that re-loads the loop.',
      snare: 'Backbeat plus two glue ghosts.',
      hatClosed: 'Full 16th subdivision, accented on the quarters.',
    },
    variations: [
      {
        name: 'Harder push',
        note: 'A kick on the "&" of 3 makes the descent into the pickup relentless.',
        overrides: { kick: 'X.......x..x...x' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice funk anticipation figure in the style of 1970s soul-funk rhythm sections — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-linear-court',
    title: 'Linear Court',
    family: 'funk',
    genres: ['Funk', 'Fusion'],
    tags: ['linear', 'ghost notes', 'study'],
    difficulty: 'advanced',
    bpm: 100,
    tempoRange: [92, 108],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 3,
    kit: 'dusty',
    summary:
      'A strictly linear funk groove — no two voices ever land on the same 16th.',
    description:
      'Linear funk, popularized by drummers like Dennis Chambers and the gospel-chop school, spreads every 16th between exactly one voice: kick, snare or hat, never two at once. The result sounds twice as dense as it is played, because the ear hears one continuous line instead of separate limbs. Practise it slowly hands-first: the hat is the glue, the kick and snare are the melody that peels off it.',
    construction:
      'Sixteen 16ths split between three voices with zero overlap: kick on 1, "&2" and "&3"; snare on "e2" (soft), 2, "a3" (ghost) and 3; hats fill every other gap.',
    tracks: [
      { inst: 'kick', pat: 'X......x..x.....', vol: 1 },
      { inst: 'snare', pat: '..x.X......oX...', vol: 0.9 },
      { inst: 'hatClosed', pat: '.x.x.xx..xx..xxx', vol: 0.55 },
    ],
    roles: {
      kick: 'Melodic low voice — the only thing allowed on 1.',
      snare: 'Backbeat plus one soft pickup and one ghost inside the line.',
      hatClosed: 'Continuous filler that completes the 16th line between kicks and snares.',
    },
    variations: [
      {
        name: 'Ghost line',
        note: 'Soften two hat strokes into ghosts for a dragged, behind-the-hand feel.',
        overrides: { hatClosed: '.x.o.xx..xo..xxx' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice linear funk coordination study — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-open-close',
    title: 'Open-Close Funk',
    family: 'funk',
    genres: ['Funk', 'Soul'],
    tags: ['open hat', 'choke', 'syncopation'],
    difficulty: 'intermediate',
    bpm: 103,
    tempoRange: [96, 110],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'studio',
    summary:
      'Open/closed hi-hat choke funk: the open hat breathes on the upbeats and gets slapped shut instantly.',
    description:
      'The open-close hat technique is the fingerprint of live funk drumming — the hat rings on an off-beat and is choked shut by the pedal a split second later, adding a gasping "psst" to the groove. Here the open hat lands on the "&" of 4 as the loop lift, with the closed hat playing sparse upbeats underneath. The kick stays syncopated on 1, "&2" and "&3" so the hat never has to carry the groove alone.',
    construction:
      'Kick on 1, "&2" and "&3". Snare backbeats with two ghosts. Closed hat upbeats under a single open-hat lift on "&4".',
    tracks: [
      { inst: 'kick', pat: 'X.....x...x.....', vol: 1 },
      { inst: 'snare', pat: '....X..o....X.o.', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X...', vol: 0.6 },
      { inst: 'hatOpen', pat: '..............X.', vol: 0.55 },
    ],
    roles: {
      kick: 'Syncopated three-point floor.',
      snare: 'Backbeats plus ghost seasoning.',
      hatClosed: 'Upbeat strokes that choke against the open hat.',
      hatOpen: 'The breathing lift that signals the loop point.',
    },
    variations: [
      {
        name: 'Second lift',
        note: 'Open the hat on the "&" of 2 as well for a doubled gasp.',
        overrides: { hatClosed: 'X.x.X.x.....X...', hatOpen: '......X.......X.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice open/closed hi-hat funk technique — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-half-time-thud',
    title: 'Half-Time Thud',
    family: 'funk',
    genres: ['Funk', 'R&B'],
    tags: ['halftime', 'sparse', 'tambourine'],
    difficulty: 'beginner',
    bpm: 92,
    tempoRange: [84, 100],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 1,
    kit: 'dusty',
    summary:
      'A lazy half-time funk crawl: one snare on 3, three kick anchors and a tambourine on eighths.',
    description:
      'Slow funk lives or dies by how much space it dares to leave. With the backbeat reduced to a single crack on beat 3, the three kick anchors do all the dancing, and the tambourine — the great unsung instrument of soul sessions — keeps the eighths from evaporating. This is the sound of a hot August night ballad-that-still-grooves, the tempo zone where every 70s soul band slowed down without going dead.',
    construction:
      'Kick on 1, "&2" and "&3". One half-time snare on 3. Eighths on hats and tambourine; the tamb carries the 2 & 4 accents.',
    tracks: [
      { inst: 'kick', pat: 'X.....x...x.....', vol: 1 },
      { inst: 'snare', pat: '........X.......', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.6 },
      { inst: 'tambourine', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6, pan: 0.2 },
    ],
    roles: {
      kick: 'The only dancer — three anchors that keep the crawl moving.',
      snare: 'The lone half-time crack on beat 3.',
      hatClosed: 'Eighths with quarter accents.',
      tambourine: 'Soul-session shimmer that outlines 2 & 4.',
    },
    variations: [
      {
        name: 'Ghost drag',
        note: 'A ghost snare on the "a" of 3 pulls the ear into the half-time crack.',
        overrides: { snare: '........X...o...' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice half-time funk/soul feel — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-perc-crew',
    title: 'Conga Funk Crew',
    family: 'funk',
    genres: ['Funk', 'Latin Funk'],
    tags: ['congas', 'shaker', 'percussion'],
    difficulty: 'intermediate',
    bpm: 98,
    tempoRange: [90, 106],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 3,
    kit: 'dusty',
    summary:
      'Percussion-driven funk vamp: two congas and a 16th shaker ride over a minimal kick-snare frame.',
    description:
      'From War to Santana-adjacent Chicano funk, the one way to super-size a simple drum part is to hire a percussion crew. Here the kit shrinks to a two-point kick and clean backbeats while hi/lo congas interlock and a shaker burrs through every 16th. The congas never double the kick — they answer it a 16th later, which is what keeps the layering transparent instead of muddy.',
    construction:
      'Kick on 1 and "&3"; backbeat snares with one ghost. Hi conga answers on upbeats, low conga shadows the kick, shaker runs all 16ths.',
    tracks: [
      { inst: 'kick', pat: 'X.........x.....', vol: 1 },
      { inst: 'snare', pat: '....X..o....X...', vol: 0.9 },
      { inst: 'congaHi', pat: '..o..o..o..o.o..', vol: 0.7, pan: 0.2 },
      { inst: 'congaLo', pat: 'o.....o...o.....', vol: 0.7, pan: -0.2 },
      { inst: 'shaker', pat: 'xxxxxxxxxxxxxxxx', vol: 0.5, pan: -0.2 },
    ],
    roles: {
      kick: 'Minimal floor — leaves the middle of the bar to the crew.',
      snare: 'Backbeats with a single ghost.',
      congaHi: 'Upbeat answer line — the melodic percussion voice.',
      congaLo: 'Shadows the kick and adds the low conga tone.',
      shaker: '16th motor that binds kit and percussion.',
    },
    variations: [
      {
        name: 'Bell lift',
        note: 'For a vamp\'s last four bars, double the hi-conga with an agogo bell on the same steps.',
        hint: 'Add an agogo track doubling the congaHi hits at the same positions.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice Latin-tinged funk percussion vamp — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-rim-click',
    title: 'Rimshot Click Vamp',
    family: 'funk',
    genres: ['Funk', 'Soul'],
    tags: ['rimshot', 'ghost notes', 'vamp'],
    difficulty: 'intermediate',
    bpm: 100,
    tempoRange: [92, 108],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 2,
    kit: 'dusty',
    summary:
      'Dry rimshot funk in the "Sex Machine" school: click backbeats, a busy syncopated kick and 16th hats.',
    description:
      'When a funk groove needs to talk over a horn section, drummers swap the fat backbeat for a rimshot click — the same 2 & 4 message at a fraction of the sustain. The kick here plays the four-point James Brown figure (1, "a1", "&2", "&3") while ghost rim strokes fill the gaps. Everything is short and dry: if any voice rings longer than a 16th, the vamp stops sounding like a machine.',
    construction:
      'Kick on 1, a1, &2 and &3. Rimshot backbeats with two ghosts. 16th hats with quarter accents and ghosted "a" counts.',
    tracks: [
      { inst: 'kick', pat: 'X..x..x..x.....', vol: 1 },
      { inst: 'rimshot', pat: '....x..o....x.o.', vol: 0.85 },
      { inst: 'hatClosed', pat: 'XxxoXxxoXxxoXxxo', vol: 0.6 },
    ],
    roles: {
      kick: 'Four-point funk figure that keeps the vamp churning.',
      rimshot: 'Dry click backbeat plus ghost seasoning.',
      hatClosed: '16th subdivision; ghosts on the "a" counts keep the quarter accents honest.',
    },
    variations: [
      {
        name: 'Snare swap',
        note: 'Trade the rim for a full snare crack when the horns drop out.',
        hint: 'Replace the rimshot track with snare at the same positions for a heavier vamp.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of James Brown-style rimshot vamps — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-p-funk-stomp',
    title: 'P-Funk Stomp',
    family: 'funk',
    genres: ['Funk', 'P-Funk'],
    tags: ['stomp', 'tambourine', '16ths'],
    difficulty: 'intermediate',
    bpm: 106,
    tempoRange: [98, 112],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 3,
    kit: 'studio',
    summary:
      'Parliament-Funkadelic stomp: kick on 1 and 3, an "a4" pickup, and every 16th accounted for.',
    description:
      'The P-Funk rhythm section played big: kicks like floorboards, hats like a sewing machine, and a tambourine player whose only job was to make the backbeat shimmer. The kick here is deliberately simple — 1 and 3 plus a pickup on the "a" of 4 — because the density budget is spent on the hats and tambourine. This is the dance-floor compromise between funk syncopation and four-on-the-floor clarity.',
    construction:
      'Kick on 1, 3 and the "a" of 4. Backbeat snare with one closing ghost. Full 16th hats accented on the quarters, tambourine in accented eighths.',
    tracks: [
      { inst: 'kick', pat: 'X.......X.....x.', vol: 1 },
      { inst: 'snare', pat: '....X.......X..o', vol: 0.9 },
      { inst: 'hatClosed', pat: 'Xxxxxxxxxxxxxxxx', vol: 0.6 },
      { inst: 'tambourine', pat: 'X.x.X.x.X.x.X.x.', vol: 0.6, pan: 0.2 },
    ],
    roles: {
      kick: 'Big square anchors with a loop-point pickup.',
      snare: 'Backbeat with a ghost that nudges the loop.',
      hatClosed: 'Full 16th motor — the busiest voice in the bar.',
      tambourine: 'Accent layer that puts 2 & 4 in your face.',
    },
    variations: [
      {
        name: 'Casino push',
        note: 'Add a kick on the "&" of 2 to turn the stomp into a churn.',
        overrides: { kick: 'X.....x.X.....x.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of Parliament-Funkadelic-era stomp grooves — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-two-bar-bridge',
    title: 'Two-Bar Bridge',
    family: 'funk',
    genres: ['Funk', 'R&B'],
    tags: ['two-bar', 'ghost notes', 'ratchet', 'openhat'],
    difficulty: 'advanced',
    bpm: 99,
    tempoRange: [92, 106],
    ts: [4, 4],
    bars: 2,
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 3,
    kit: 'dusty',
    summary:
      'A two-bar funk bridge: bar one states the pocket, bar two adds a kick turn and a snare double-stroke into the loop.',
    description:
      'Great funk rhythm sections think in two-bar sentences: the first bar is the subject, the second is the verb. Bar two here thickens the kick (an extra anchor on 4) and answers the backbeat with a double-stroke drag on the last 16th, while a single open hat breathes on the final "&". Learned as a pair, the bars teach the most valuable funk skill — repetition with one pointed difference.',
    construction:
      'Bar 1: kick on 1, a1, &2, &3 with ghosts around the backbeats. Bar 2: same plus a kick on 4 and a 2-ratchet snare drag on the final 16th; open hat on the last "&".',
    tracks: [
      { inst: 'kick', pat: 'X..x..x..x.....|X..x..x..x.X.x.', vol: 1 },
      { inst: 'snare', pat: '...oX..o.o..X...|....X..o..o.X..2', vol: 0.9 },
      { inst: 'hatClosed', pat: 'XxxoXxxoXxxoXxxo|XxxoXxxoXxxoXxxo', vol: 0.6 },
      { inst: 'hatOpen', pat: '..............................x.', vol: 0.55 },
    ],
    roles: {
      kick: 'States the pocket in bar one, turns the phrase home in bar two.',
      snare: 'Backbeats plus a bar-2 double-stroke drag into the loop.',
      hatClosed: 'Continuous 16th engine across both bars.',
      hatOpen: 'One breath on the final "&" of the two-bar form.',
    },
    variations: [
      {
        name: 'Turn kick',
        note: 'Two soft kicks on the last 16ths of bar two whip the loop around harder.',
        overrides: { kick: 'X..x..x..x.....|X..x..x...x...xx' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice two-bar funk vamp construction — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-punch-pocket',
    title: 'Punch Pocket',
    family: 'funk',
    genres: ['Funk', 'R&B'],
    tags: ['stabs', 'ghosts', 'syncopation'],
    difficulty: 'intermediate',
    bpm: 97,
    tempoRange: [90, 104],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 2,
    kit: 'dusty',
    summary:
      'Horn-section funk on a drum kit: kick punches on 1, "a1" and "&3" answering the snare backbeats.',
    description:
      'When a funk arranger writes horn stabs, the drummer mirrors them with kick-and-snare punches so the charts and the beat lock into one instrument. This pocket puts the kick on 1, the "a" of 1 and the "&" of 3 — classic answer points — while ghosts on "&2" and "&4" keep the snare line alive between cracks. It is the ideal backing groove for a one-chord riff that needs punches, not rolls.',
    construction:
      'Kick punches on 1, a1 and &3. Snare backbeats with ghosts on &2 and &4. Eighth hats with quarter accents.',
    tracks: [
      { inst: 'kick', pat: 'X..x......x.....', vol: 1 },
      { inst: 'snare', pat: '....X..o....X.o.', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'Horn-stab mirror — punches where the section would hit.',
      snare: 'Backbeats with ghost answers.',
      hatClosed: 'Eighth grid, quarters accented.',
    },
    variations: [
      {
        name: 'Modern punch',
        note: 'Layer a clap under the backbeats for a drier, later-era pocket.',
        hint: 'Add a clap track doubling the snare on 2 & 4.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice funk backing groove for horn stabs — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-swung-lean',
    title: 'Swung Lean',
    family: 'funk',
    genres: ['Funk', 'R&B'],
    tags: ['shuffle', 'swing', 'lean'],
    difficulty: 'intermediate',
    bpm: 106,
    tempoRange: [96, 114],
    ts: [4, 4],
    sub: 4,
    feel: 'swung',
    swing: 0.16,
    sync: 2,
    dens: 2,
    kit: 'dusty',
    summary:
      'Shuffle-lean funk: the mid-60s bridge between R&B shuffle and straight-16th funk, with a swung hat.',
    description:
      'Before funk snapped to straight 16ths, it leaned — James Brown\'s mid-60s records still carry the R&B shuffle inside them, with the offbeat eighths pulled late. This groove keeps that lean at a funk tempo: swung eighth hats, a three-point kick and a clean backbeat. It is the perfect bridge groove for repertoires that jump from blues shuffles into full funk within one set.',
    construction:
      'Kick on 1, "&2" and "&3". Straight backbeats. Swung eighth hats accented on the quarters; light swing (~0.16) shifts every offbeat late.',
    tracks: [
      { inst: 'kick', pat: 'X.....x...x.....', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'Three-point floor with the mid-bar push.',
      snare: 'Clean 2 & 4 backbeat.',
      hatClosed: 'Swung eighths — the lean lives here.',
    },
    variations: [
      {
        name: 'Bass lean',
        note: 'Let a bassline double the swung kick exactly — unison with kick is the 60s way.',
        hint: 'Have the bass double the kick pattern note-for-note.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of mid-1960s shuffle-funk transition grooves — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-dusty-break',
    title: 'Dusty Two-Bar Break',
    family: 'funk',
    genres: ['Funk', 'Breaks'],
    tags: ['breakbeat', 'sampling', 'two-bar', 'ghosts'],
    difficulty: 'advanced',
    bpm: 101,
    tempoRange: [94, 108],
    ts: [4, 4],
    bars: 2,
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 3,
    kit: 'dusty',
    summary:
      'A sampler-bait two-bar funk break: ghost-riddled backbeats, syncopated kicks and 16th hats.',
    description:
      'The funk breaks that built hip-hop were two-bar vamps exactly like this — busy enough to sample, honest enough to loop forever. Bar one lays the drag between backbeats; bar two adds a kick on the "a" of 4 and an extra ghost cluster for a landing. On the CR-78-flavoured dusty kit it conjures the tape-saturated sound of a break worn smooth by fifty years of loops.',
    construction:
      'Both bars: kick on 1, a1, 3 and &3, backbeats with ghosts. Bar 2 adds a kick on the "a" of 4 and a closing ghost pair. 16th hats with quarter accents.',
    tracks: [
      { inst: 'kick', pat: 'X..x....X..x....|X..x....X..x..x.', vol: 1 },
      { inst: 'snare', pat: '....X..o.o..X.o.|....X..o.o..X.oo', vol: 0.9 },
      { inst: 'hatClosed', pat: 'XxxoXxxoXxxoXxxo|XxxoXxxoXxxoXxxo', vol: 0.6 },
    ],
    roles: {
      kick: 'Four anchors per bar plus the bar-2 pickup that makes the break land.',
      snare: 'Backbeats wrapped in ghost chatter — the sampled texture.',
      hatClosed: '16th ride that keeps the break danceable.',
    },
    variations: [
      {
        name: 'Break open',
        note: 'Silence the hats in bar two so the break hits arrive dry.',
        overrides: { hatClosed: 'XxxoXxxoXxxoXxxo|................................' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of late-60s/70s funk breaks favored by sample culture — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-horn-band-push',
    title: 'Horn-Band Push',
    family: 'funk',
    genres: ['Funk', 'Soul Jazz'],
    tags: ['tower of power', '16ths', 'push'],
    difficulty: 'advanced',
    bpm: 104,
    tempoRange: [96, 112],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 3,
    kit: 'studio',
    summary:
      'Bay-area horn-band funk: five syncopated kick anchors, tight 16th hats and a snare that answers late.',
    description:
      'The Oakland school — Tower of Power and its disciples — played funk like a contact sport: kicks landed where the horns stabbed, and the snare answered a hair late with ghost strokes. Five kick hits (1, "a1", "&1", "a2" and "&2") pack the first half of the bar before the backbeat takes over, and two ghost answers trail the second snare. It is technically demanding and utterly unforgiving of sloppy subdivisions.',
    construction:
      'Kick on 1, a1, &1, a2 and &2. Snare backbeats with ghost answers on "a3" and "&4". Full 16th hats accented on the quarters.',
    tracks: [
      { inst: 'kick', pat: 'X..x.x.x.x......', vol: 1 },
      { inst: 'snare', pat: '....X......oX.o.', vol: 0.9 },
      { inst: 'hatClosed', pat: 'XxxxXxxxXxxxXxxx', vol: 0.6 },
    ],
    roles: {
      kick: 'Five-point horn-stab figure crowding the first half of the bar.',
      snare: 'Backbeats plus late ghost answers — the Oakland call-and-response.',
      hatClosed: 'Full 16ths; the accuracy audit for everything else.',
    },
    variations: [
      {
        name: 'Full crew',
        note: 'Double the backbeats with baritone-sax-style rimshots.',
        hint: 'Layer a rimshot under the snare on 2 & 4 for the big-band weight.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of Tower of Power-style horn-band funk — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-minimal-thumb',
    title: 'Minimal Thumbprint',
    family: 'funk',
    genres: ['Funk', 'R&B'],
    tags: ['minimal', 'sparse', 'pocket'],
    difficulty: 'beginner',
    bpm: 94,
    tempoRange: [86, 102],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 1,
    kit: 'dusty',
    summary:
      'Strip-mined funk: two kicks, two backbeats, one ghost and eighths — space as the main instrument.',
    description:
      'The deepest funk often hides in the fewest notes: a two-point kick, a clean backbeat and one well-placed ghost. This thumbprint groove leaves so much room that a single bass note or guitar chop becomes an event. It is also the best entry point into funk drumming — learn to make these six hits feel enormous before adding a single ghost.',
    construction:
      'Kick on 1 and "&3". Snare on 2 & 4 with one ghost on the "a" of 4. Eighth hats accented on the quarters.',
    tracks: [
      { inst: 'kick', pat: 'X.........x.....', vol: 1 },
      { inst: 'snare', pat: '....X.......X..o', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'Two anchors — every silence between them is part of the riff.',
      snare: 'Backbeats plus a single parting ghost.',
      hatClosed: 'Eighth grid that holds the tempo down without pushing.',
    },
    variations: [
      {
        name: 'Thumb pickup',
        note: 'A soft kick on the "a" of 2 nudges the groove along.',
        overrides: { kick: 'X......x..x.....' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice minimal funk pocket — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-backbeat-chatter',
    title: 'Backbeat Chatter',
    family: 'funk',
    genres: ['Funk', 'R&B'],
    tags: ['ghost notes', '16ths', 'chatter'],
    difficulty: 'advanced',
    bpm: 100,
    tempoRange: [92, 108],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 3,
    kit: 'dusty',
    summary:
      'Maximum ghost-chatter funk: every 16th around the backbeats speaks, the accents barely whisper above it.',
    description:
      'This is the funk drummer\'s full-voice exercise: the snare plays ghosts on every available 16th ("&1", "a1", "&2", "a2"...) with the backbeats barely distinguishing themselves from the chatter. The kick holds a steady three-point line under the noise. In performance the ghosts should sound like one sustained hum that cracks on 2 and 4 — the sound of a rhythm section breathing together at full volume.',
    construction:
      'Kick on 1, "&2" and "&3". Snare: backbeats on 2 & 4 plus ghosts on every other 16th. Full 16th hats accented on the quarters.',
    tracks: [
      { inst: 'kick', pat: 'X......x..x.....', vol: 1 },
      { inst: 'snare', pat: '....X.oo.oo.X.oo', vol: 0.9 },
      { inst: 'hatClosed', pat: 'XxxxXxxxXxxxXxxx', vol: 0.6 },
    ],
    roles: {
      kick: 'The steady floor beneath the chatter.',
      snare: 'Backbeats inside a wall of ghosts — one hum, four cracks.',
      hatClosed: '16th subdivision that keeps the chatter from blurring.',
    },
    variations: [
      {
        name: 'Half-open chatter',
        note: 'For the last bar of a phrase, let the ghost pair before beat 4 ring half-open.',
        hint: 'Swap the two ghosts before beat 4 for a half-open hat splash.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice ghost-note-heavy funk coordination — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-open-highway',
    title: 'Open-Hat Highway',
    family: 'funk',
    genres: ['Funk', 'Southern Rock'],
    tags: ['openhat', 'driving', 'southern'],
    difficulty: 'intermediate',
    bpm: 102,
    tempoRange: [94, 112],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'studio',
    summary:
      'Southern-funk highway cruise: ringing open-hat offbeats over a syncopated kick and quarter-note closed hats.',
    description:
      'Between Muscle Shoals soul and southern-rock boogie sits this hybrid: the open hat rings on every offbeat eighth like a hi-wattage shaker while the closed hat marks the quarters. The kick\'s syncopated anchor on the "&" of 3 (plus a late push on "a3") keeps it from turning into straight rock. It is the natural groove for a chugging one-chord riff that needs to dance without losing its road feel.',
    construction:
      'Kick on 1, "&2" and "a3". Snare backbeats with one ghost. Closed hats on the quarters, open hats on the offbeat eighths.',
    tracks: [
      { inst: 'kick', pat: 'X.....x....x....', vol: 1 },
      { inst: 'snare', pat: '....X....o..X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X...X...X...X...', vol: 0.6 },
      { inst: 'hatOpen', pat: '..X...X...X...X.', vol: 0.55 },
    ],
    roles: {
      kick: 'Syncopated engine under the ringing hats.',
      snare: 'Backbeats plus a single ghost push.',
      hatClosed: 'Quarter-note markers.',
      hatOpen: 'Offbeat ring — the highway wind.',
    },
    variations: [
      {
        name: 'Choke to quarters',
        note: 'Silence the open hats for a tighter verse section.',
        overrides: { hatOpen: '................', hatClosed: 'X.x.X.x.X.x.X.x.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice southern funk/rock hybrid feel — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-drums-talk',
    title: 'Talking-Drum Funk',
    family: 'funk',
    genres: ['Funk', 'Afro-Funk'],
    tags: ['bongos', 'percussion', 'afro'],
    difficulty: 'intermediate',
    bpm: 99,
    tempoRange: [92, 108],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 3,
    kit: 'dusty',
    summary:
      'Afro-funk dialogue: interlocking bongos answer a minimal kick-snare frame, Fela-style discipline at funk tempo.',
    description:
      'The Afro-beat exchange ran both ways: Tony Allen borrowed funk ghost language, and American funk bands borrowed African hand-drum interlock. Here hi and lo bongos weave a six-point conversation that never doubles the kit, while the drumset shrinks to itsfunk essentials — one kick anchor on "&3", clean backbeats, one ghost. The bongos are panned wide so the dialogue reads as two speakers, not one blur.',
    construction:
      'Kick on 1 and "&3"; backbeats with one ghost. Bongos interlock: hi voice on 1, e1, &2, 3, &3 and a3; lo voice on the e-count upbeats.',
    tracks: [
      { inst: 'kick', pat: 'X.........x.....', vol: 1 },
      { inst: 'snare', pat: '....X..o....X...', vol: 0.9 },
      { inst: 'bongoHi', pat: 'o.o..o..o.o..o..', vol: 0.65, pan: -0.2 },
      { inst: 'bongoLo', pat: '..o...o...o...o.', vol: 0.65, pan: 0.2 },
    ],
    roles: {
      kick: 'Minimal kit floor.',
      snare: 'Backbeats with one ghost — the kit\'s only decoration.',
      bongoHi: 'Lead hand-drum phrase, calling from the left.',
      bongoLo: 'Answer phrase, replying from the right.',
    },
    variations: [
      {
        name: 'Conga trade',
        note: 'Trade the bongos for congas and let the phrase stretch over a full bar.',
        hint: 'Move the bongo parts to hi/lo congas with the same steps.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of 1970s Afro-funk drum/percussion dialogues — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-back-porch',
    title: 'Back-Porch Drag',
    family: 'funk',
    genres: ['Funk', 'Southern Soul'],
    tags: ['swing', 'lazy', 'sparse'],
    difficulty: 'beginner',
    bpm: 93,
    tempoRange: [84, 102],
    ts: [4, 4],
    sub: 4,
    feel: 'swung',
    swing: 0.14,
    sync: 2,
    dens: 1,
    kit: 'dusty',
    summary:
      'A lazy back-porch soul groove: light swing, three kicks and hats that only sometimes bother to play.',
    description:
      'Some southern soul drummers played like the porch chair was too comfortable to leave — everything slightly behind, hats dropped where a metronome would insist. This groove bakes that drag in with a 0.14 swing, sparse probabilistic hats and the simplest possible kick-snare frame. Perfect under a warm Rhodes chord progression that never wants to hurry.',
    construction:
      'Kick on 1 and 3. Backbeats on 2 & 4. Hats on 1 and 3, with 55%-chance strokes on 2 and 4 for a humanized stumble.',
    tracks: [
      { inst: 'kick', pat: 'X.......x.......', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X...p...X...p...', vol: 0.6 },
    ],
    roles: {
      kick: 'Downbeat floor, unbothered.',
      snare: 'Backbeats — the only firm grid in the bar.',
      hatClosed: 'Probabilistic strokes that stumble like a relaxed right hand.',
    },
    variations: [
      {
        name: 'Porch pickup',
        note: 'A single kick on the "&" of 4 gets the porch rocker moving.',
        overrides: { kick: 'X.......x......x' },
      },
    ],
    source: {
      type: 'original',
      note: 'Original composition: lazy southern-soul pocket study with probabilistic hats.',
    },
  },
  {
    id: 'xg-funk-16th-lift',
    title: '16th-Hat Lift',
    family: 'funk',
    genres: ['Funk', 'R&B'],
    tags: ['openhat', '16ths', 'lift'],
    difficulty: 'intermediate',
    bpm: 105,
    tempoRange: [96, 112],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'studio',
    summary:
      'Full 16th hats that open on the "&" of 4 — the classic funk lift into every loop.',
    description:
      'The cheapest, most reliable way to make a funk loop feel alive: run the hats in unbroken 16ths and open the last one on the "&" of 4. The short choke before beat 1 resets the ear every bar. The kick keeps the classic 1-"&2"-"&3" line and a single ghost closes the snare part, making this the workhorse groove for functions, weddings and any funk tune that needs to start with maximum momentum.',
    construction:
      'Kick on 1, "&2" and "&3". Snare backbeat with one ghost on the "a" of 4. Hats: 15 closed 16ths plus one open stroke on "&4".',
    tracks: [
      { inst: 'kick', pat: 'X.....x...x.....', vol: 1 },
      { inst: 'snare', pat: '....X.......X..o', vol: 0.9 },
      { inst: 'hatClosed', pat: 'Xxxxxxxxxxxxxxx.', vol: 0.6 },
      { inst: 'hatOpen', pat: '..............X.', vol: 0.55 },
    ],
    roles: {
      kick: 'The classic three-point funk floor.',
      snare: 'Backbeats plus a parting ghost.',
      hatClosed: 'Unbroken 16th engine.',
      hatOpen: 'The lift — a one-stroke breath into the loop.',
    },
    variations: [
      {
        name: 'Late lift',
        note: 'Move the open hat to the "a" of 4 and fill the freed 16th for a twitchier loop.',
        overrides: { hatClosed: 'Xxxxxxxxxxxxxxxx', hatOpen: '...............X' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice funk open-hat lift figure — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-split-second',
    title: 'Split-Second Sync',
    family: 'funk',
    genres: ['Funk', 'Funk Fusion'],
    tags: ['syncopation', '16ths', 'study'],
    difficulty: 'advanced',
    bpm: 103,
    tempoRange: [94, 112],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 3,
    kit: 'dusty',
    summary:
      'Five-point syncopated kick against ghosted backbeats — a coordination gauntlet at funk tempo.',
    description:
      'This study stacks every classic funk displacement in one bar: kick on 1, "a1", "&1", "a2" and the "a" of 4, answered by snare ghosts on "&1" and "&4". The danger is rushing the "a"-counts; the cure is practising the kick line alone until it swings without help. Fusion and future-funk players use figures like this to modernise a two-chord vamp without abandoning the backbeat.',
    construction:
      'Kick on 1, a1, &1, a2 and a4. Snare backbeats with ghosts on &1 and &4. 16th hats with quarter accents and ghosted "a" counts.',
    tracks: [
      { inst: 'kick', pat: 'x..X..x..x...x..', vol: 1 },
      { inst: 'snare', pat: '....X...o...X.o.', vol: 0.9 },
      { inst: 'hatClosed', pat: 'XxxoXxxoXxxoXxxo', vol: 0.6 },
    ],
    roles: {
      kick: 'Five displaced anchors — the whole personality of the groove.',
      snare: 'Backbeats with two ghosts answering the displaced kicks.',
      hatClosed: '16th grid with ghosted "a" counts.',
    },
    variations: [
      {
        name: 'Second split',
        note: 'Push the final kick to the "a" of 4 for a later, nastier pickup.',
        overrides: { kick: 'x..X..x..x....x.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice displaced-kick funk study — rhythm data only.',
    },
  },
  {
    id: 'xg-funk-maraca-vamp',
    title: 'Maraca Vamp',
    family: 'funk',
    genres: ['Funk', 'Latin Funk'],
    tags: ['maracas', '16ths', 'vamp'],
    difficulty: 'intermediate',
    bpm: 96,
    tempoRange: [88, 104],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'dusty',
    summary:
      'Maraca-driven funk vamp: an unbroken 16th shaker layer over the classic kick-backbeat frame.',
    description:
      'Hand percussion was funk\'s secret weapon — a maraca player running even 16ths adds glue that no amount of hi-hat work replicates, because the shaker breathes between strokes. The kit here stays deliberately plain: three-point kick, backbeats, one ghost, straight eighth hats. The maracas (soft, wide-left) do the talking that would otherwise demand a busier drummer.',
    construction:
      'Kick on 1, "&2" and "&3". Snare backbeats with one ghost. Eighths on hats; maracas run all 16ths.',
    tracks: [
      { inst: 'kick', pat: 'X.....x...x.....', vol: 1 },
      { inst: 'snare', pat: '....X..o....X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6 },
      { inst: 'maracas', pat: 'xxxxxxxxxxxxxxxx', vol: 0.5, pan: -0.2 },
    ],
    roles: {
      kick: 'Three-point funk floor.',
      snare: 'Backbeats with one ghost.',
      hatClosed: 'Even eighths.',
      maracas: 'The 16th glue — constant, breathing, wide.',
    },
    variations: [
      {
        name: 'Accent swirl',
        note: 'Accent the maracas on the quarters so they cut like a guiro.',
        overrides: { maracas: 'XxxxXxxxXxxxXxxx' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice funk vamp with hand-percussion layer — rhythm data only.',
    },
  },

  /* ================================================================= R&B ==== */
  {
    id: 'xg-rnb-motown-pocket',
    title: 'Motown Pocket',
    family: 'rnb',
    genres: ['R&B', 'Motown', 'Soul'],
    tags: ['motown', 'tambourine', 'pocket'],
    difficulty: 'beginner',
    bpm: 108,
    tempoRange: [100, 118],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 2,
    kit: 'studio',
    summary:
      'The Hitsville pocket: kick on 1 and the "&3-a3" pickup, snare 2 & 4, tambourine riding the eighths.',
    description:
      'The Funk Brothers\' rhythm section made simplicity monumental: the kick lands on 1, then picks up on the "&" of 3 into beat 4 while the snare keeps 2 & 4 square, and a tambourine player turns the eighth notes into a shimmering fence around the beat. Benny Benjamin and Uriel Jones played this figure behind a decade of Motown hits. Everything here should feel like it is leaning slightly forward — Motown records famously raced the click on purpose.',
    construction:
      'Kick on 1 plus the "&3-a3" pickup into 4. Snare backbeats. Eighth hats with quarter accents; tambourine eighths accented on 2 & 4.',
    tracks: [
      { inst: 'kick', pat: 'X.......x.x.....', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.6 },
      { inst: 'tambourine', pat: 'x.x.X.x.x.x.X.x.', vol: 0.6, pan: 0.2 },
    ],
    roles: {
      kick: 'Downbeat plus the "&3-a3" pickup — the Motown signature.',
      snare: 'Square 2 & 4 backbeat.',
      hatClosed: 'Eighth grid, quarters accented.',
      tambourine: 'The Hitsville shimmer — accents on the backbeats.',
    },
    variations: [
      {
        name: 'Launch pickup',
        note: 'A kick on the "a" of 4 launches the next bar like the records did.',
        overrides: { kick: 'X.......x.x....x' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of Motown-session drumming (Funk Brothers rhythm section) — rhythm data only.',
    },
  },
  {
    id: 'xg-rnb-detroit-drive',
    title: 'Detroit Drive',
    family: 'rnb',
    genres: ['R&B', 'Motown'],
    tags: ['motown', 'driving', 'tambourine'],
    difficulty: 'intermediate',
    bpm: 110,
    tempoRange: [102, 120],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'studio',
    summary:
      'Uptempo Motown drive: kick on 1, "&2" and 3, with tambourine and hats in double duty.',
    description:
      'For the up-tempo dancers ("Dancing in the Street" territory), Detroit drummers pushed the kick off its lazy perch: an extra hit on the "&" of 2 turns the first half of the bar into a sprint. The tambourine stays in even eighths so the excitement never outruns the pocket. This is the groove for hand-clap-heavy, call-and-response soul at full gallop.',
    construction:
      'Kick on 1, "&2" and 3. Square backbeats. Even eighth hats; tambourine accents on 2 & 4.',
    tracks: [
      { inst: 'kick', pat: 'X.....x.X.......', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6 },
      { inst: 'tambourine', pat: 'x.x.X.x.x.x.X.x.', vol: 0.6, pan: 0.2 },
    ],
    roles: {
      kick: 'Sprint engine — the "&2" push doubles the excitement.',
      snare: 'Backbeat anchor.',
      hatClosed: 'Even eighths, no accents — the tambourine owns the accents.',
      tambourine: 'Backbeat shimmer.',
    },
    variations: [
      {
        name: 'Maraca double',
        note: 'For the long-play feel, double the tambourine with maracas in even sixteenths.',
        hint: 'Add a maracas track running all 16ths.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of uptempo Motown dance records — rhythm data only.',
    },
  },
  {
    id: 'xg-rnb-stax-backbeat',
    title: 'Stax Backbeat',
    family: 'rnb',
    genres: ['R&B', 'Southern Soul'],
    tags: ['stax', 'backbeat', 'simple'],
    difficulty: 'beginner',
    bpm: 122,
    tempoRange: [110, 132],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 0,
    dens: 1,
    kit: 'studio',
    summary:
      'Memphis soul in one bar: kick on 1 & 3, cracking backbeats, eighth hats — the grid Otis built on.',
    description:
      'Stax records were cut live in a converted movie theatre, and the drum parts stayed as direct as the room: kick on 1 and 3, snare cracking hard on 2 & 4, eighth-note hats. Al Jackson Jr.\'s power came from consistency and a slightly-late snare placement that made every backbeat feel inevitable. No syncopation, no ghosts — just the wall that Booker T. and Otis Redding leaned against.',
    construction:
      'Kick on 1 and 3. Backbeat snare on 2 & 4. Eighth hats with quarter accents. Nothing else.',
    tracks: [
      { inst: 'kick', pat: 'X.......X.......', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'The two downbeats — one and three, forever.',
      snare: 'The crack that defines Southern soul.',
      hatClosed: 'Eighth grid, quarters accented.',
    },
    variations: [
      {
        name: 'Train push',
        note: 'Add the kick on the "&" of 2 for the Stax train-beat variant.',
        overrides: { kick: 'X.....x.X.......' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of Stax/Al Jackson Jr. backbeat grooves — rhythm data only.',
    },
  },
  {
    id: 'xg-rnb-80s-linn-boogie',
    title: '80s Linn Boogie',
    family: 'rnb',
    genres: ['R&B', 'Boogie'],
    tags: ['linndrum', '80s', 'clap', 'boogie'],
    difficulty: 'intermediate',
    bpm: 107,
    tempoRange: [100, 114],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'synth',
    summary:
      'LinnDrum quiet-storm boogie: syncopated machine kick, doubled claps and a closing hat flick.',
    description:
      'When Roger Linn\'s drum machine landed in R&B studios around 1981, it reshuffled the groove: claps replaced snares, kicks became robotic-but-syncopated, and hats clicked in perfect eighths with a flick at the end of the bar. This is the SOS Band / Luther Vandross dancefloor sound — post-disco R&B you can two-step to. The LinnDrum kit suggestion is not decoration; those claps and hats ARE the genre.',
    construction:
      'Machine kick on 1, "&2" and "&3". Claps on 2 & 4. Eighth hats with a double-stroke flick on the final 16th; one open hat breath on "&4".',
    tracks: [
      { inst: 'kick', pat: 'X......x..x.....', vol: 1 },
      { inst: 'clap', pat: '....X.......X...', vol: 0.85 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6 },
      { inst: 'hatOpen', pat: '..............x.', vol: 0.55 },
    ],
    roles: {
      kick: 'Syncopated LinnDrum floor.',
      clap: 'The 80s machine backbeat.',
      hatClosed: 'Machine-perfect eighths.',
      hatOpen: 'One breath of air before the loop.',
    },
    variations: [
      {
        name: 'Linn stutter',
        note: 'Double the final closed-hat stroke exactly as the LinnDrum presets did.',
        overrides: { hatClosed: 'x.x.x.x.x.x.x.x2' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of early-80s LinnDrum R&B/boogie records — rhythm data only.',
    },
  },
  {
    id: 'xg-rnb-slow-jam-128',
    title: 'Slow-Jam Sixes',
    family: 'rnb',
    genres: ['R&B', 'Slow Jam'],
    tags: ['12-8', 'ballad', 'triplet', 'slow'],
    difficulty: 'beginner',
    bpm: 66,
    tempoRange: [56, 74],
    ts: [4, 4],
    sub: 3,
    feel: 'triplet',
    sync: 1,
    dens: 1,
    kit: 'synth',
    summary:
      'A 12/8 slow jam: two kicks, one clap on 3, and triplet hats that rock like a lullaby.',
    description:
      'Slow jams from the 80s and 90s ("Between the Sheets" school) live in 12/8 — four beats of three triplet-eighths each. The drums reduce to gestures: two kicks, one clap on beat 3, and a hat that rocks on the quarter pulse. At 66 BPM the triplet grid supplies all the humanity a metronome cannot. This is the bed for whispered vocals and minor-seventh chord pads.',
    construction:
      'Kick on 1 and 3; clap on 3. Hats on the quarter pulse of the 12-step grid; open hat sighs into the loop on the last eighth.',
    tracks: [
      { inst: 'kick', pat: 'X.....X.....', vol: 1 },
      { inst: 'clap', pat: '......x.....', vol: 0.85 },
      { inst: 'hatClosed', pat: 'x..x..x..x..', vol: 0.55 },
      { inst: 'hatOpen', pat: '...........x', vol: 0.5 },
    ],
    roles: {
      kick: 'Two anchors in a sea of triplet air.',
      clap: 'The half-time heartbeat on 3.',
      hatClosed: 'Quarter-pulse rocking through the triplet grid.',
      hatOpen: 'The final sigh into the loop.',
    },
    variations: [
      {
        name: 'Sixes lift',
        note: 'Move the open hat one eighth earlier for an earlier lift.',
        overrides: { hatOpen: '..........x.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice 12/8 slow-jam R&B feel — rhythm data only.',
    },
  },
  {
    id: 'xg-rnb-philly-tamb',
    title: 'Philly Tambourine',
    family: 'rnb',
    genres: ['R&B', 'Philadelphia Soul'],
    tags: ['philly', 'tambourine', 'orchestral'],
    difficulty: 'intermediate',
    bpm: 104,
    tempoRange: [96, 112],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 2,
    kit: 'studio',
    summary:
      'Philadelphia International pocket: square kick-snare frame with the tambourine carrying the elegance.',
    description:
      'The Sound of Philadelphia wrapped southern-soul backbeats in strings and congas, and the drum parts got correspondingly elegant: a plain kick on 1 and 3, backbeats, and a tambourine player — Larry Washington on the MFSB records — whose accented eighths became the genre\'s fingerprint. The drums never rush; the tambourine\'s 2 & 4 accents do the pushing while strings soar over everything.',
    construction:
      'Kick on 1 and 3. Backbeats on 2 & 4. Even eighth hats; tambourine eighths accented on the backbeats.',
    tracks: [
      { inst: 'kick', pat: 'X.......X.......', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6 },
      { inst: 'tambourine', pat: 'x.x.X.x.x.x.X.x.', vol: 0.65, pan: 0.2 },
    ],
    roles: {
      kick: 'Square floor — the strings need the stability.',
      snare: 'Clean backbeats.',
      hatClosed: 'Even eighths.',
      tambourine: 'The Philly fingerprint — accented 2 & 4 in shimmer.',
    },
    variations: [
      {
        name: 'Philly push',
        note: 'A kick on the "a" of 3 lifts the second half of the bar.',
        overrides: { kick: 'X.......X..x....' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of Philadelphia International / MFSB records — rhythm data only.',
    },
  },
  {
    id: 'xg-rnb-new-jack-swing',
    title: 'New-Jack Swing',
    family: 'rnb',
    genres: ['R&B', 'New Jack Swing'],
    tags: ['new jack swing', '80s', 'syncopation', '16ths'],
    difficulty: 'intermediate',
    bpm: 104,
    tempoRange: [96, 112],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 3,
    kit: 'synth',
    summary:
      'Teddy Riley\'s swing-era machine funk: five-point kick, doubled claps and relentless 16th hats.',
    description:
      'New jack swing fused 90s R&B vocals with hip-hop drum programming: kicks landed in busy five-point patterns, claps doubled the backbeat, and hats ran every 16th like a sewing machine. The feel is technically straight but the syncopation is maximal — five kick hits between beat 1 and the "a" of 4. This pattern powered Guy, Bobby Brown and the whole swing-beat era.',
    construction:
      'Machine kick on 1, a1, &2, &3 and a3. Claps on 2 & 4. Full 16th hats.',
    tracks: [
      { inst: 'kick', pat: 'X..x..x...x..x..', vol: 1 },
      { inst: 'clap', pat: '....X.......X...', vol: 0.85 },
      { inst: 'hatClosed', pat: 'xxxxxxxxxxxxxxxx', vol: 0.55 },
    ],
    roles: {
      kick: 'Five-point swing-beat engine.',
      clap: 'Doubled machine backbeat.',
      hatClosed: 'The 16th treadmill that keeps the syncopation honest.',
    },
    variations: [
      {
        name: 'Swing it',
        note: 'Riley\'s programming often leaned — nudge every second 16th late (~0.12 swing).',
        hint: 'Apply a light swing to humanize the 16ths.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of Teddy Riley-era new jack swing programming — rhythm data only.',
    },
  },
  {
    id: 'xg-rnb-90s-swing',
    title: 'Swung 90s Groove',
    family: 'rnb',
    genres: ['R&B', 'Contemporary R&B'],
    tags: ['swing', '90s', 'ghosts'],
    difficulty: 'intermediate',
    bpm: 96,
    tempoRange: [88, 104],
    ts: [4, 4],
    sub: 4,
    feel: 'swung',
    swing: 0.17,
    sync: 2,
    dens: 2,
    kit: 'studio',
    summary:
      'The definitive 90s R&B swing beat: a 0.17 swing on the hats, syncopated kick and an open-hat lift.',
    description:
      'Between new jack swing and neo-soul, mid-90s R&B found its default: straight-looking 16ths played with a heavy swing so the backbeat arrives like a nod. Programming of this era (Babyface, R. Kelly, Mary J. Blige sessions) leaned on the same skeleton — syncopated kick on 1, "&2" and "&3", backbeats with a trailing ghost, and the hat opened on the "&" of 4 to breathe into the loop.',
    construction:
      'Kick on 1, "&2" and "&3". Backbeat snare with a ghost on "&4". Swung eighth hats (0.17) with the last offbeat opened.',
    tracks: [
      { inst: 'kick', pat: 'X......x..x.....', vol: 1 },
      { inst: 'snare', pat: '....X.......X.o.', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X...', vol: 0.6 },
      { inst: 'hatOpen', pat: '..............X.', vol: 0.55 },
    ],
    roles: {
      kick: 'Syncopated three-point floor.',
      snare: 'Backbeats plus a trailing ghost.',
      hatClosed: 'Swung eighths — the era-defining lean.',
      hatOpen: 'The lift on "&4".',
    },
    variations: [
      {
        name: 'Ghost drag',
        note: 'A ghost on the "a" of 1 deepens the drag.',
        overrides: { snare: '..o.X.......X.o.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice mid-90s R&B swing-beat programming — rhythm data only.',
    },
  },
  {
    id: 'xg-rnb-neo-lean',
    title: 'Neo-Soul Lean',
    family: 'rnb',
    genres: ['R&B', 'Neo-Soul'],
    tags: ['neo-soul', 'swing', 'ghosts', 'dilla'],
    difficulty: 'advanced',
    bpm: 84,
    tempoRange: [76, 92],
    ts: [4, 4],
    sub: 4,
    feel: 'swung',
    swing: 0.2,
    sync: 3,
    dens: 2,
    kit: 'studio',
    summary:
      'Neo-soul at its most horizontal: 0.2 swing, displaced ghosts and hats that hesitate on purpose.',
    description:
      'Neo-soul drumming — think ?uestlove on the D\'Angelo records — is drag as an art form: the backbeat arrives late, the ghosts arrive later, and the swing sits at the top of its legal range. Here the kick hits 1, "&2" and "a3", a ghost snare drags on "a2" ahead of the 3-crack, and one probabilistic hat stroke adds a stumble you cannot program twice the same way. Play it deliberately behind the grid.',
    construction:
      'Kick on 1, "&2" and "a3". Snare backbeats with a ghost on "a2". Swung eighth hats with one probabilistic stroke on "&3"; swing 0.2.',
    tracks: [
      { inst: 'kick', pat: 'X......x...x....', vol: 1 },
      { inst: 'snare', pat: '....X.....o.X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.p.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'Displaced anchors that let the bass answer freely.',
      snare: 'Late backbeats with a dragging ghost.',
      hatClosed: 'Swung eighths with a probabilistic stumble on "&3".',
    },
    variations: [
      {
        name: 'Dilla drag',
        note: 'Delay the backbeats a step\'s worth and drop the swing to feel intentionally behind.',
        hint: 'Nudge the snare backbeats a touch late in playback.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of late-90s neo-soul drumming — rhythm data only.',
    },
  },
  {
    id: 'xg-rnb-hiphop-soul',
    title: 'Hip-Hop Soul',
    family: 'rnb',
    genres: ['R&B', 'Hip-Hop Soul'],
    tags: ['90s', 'boom bap', 'clap', 'swing'],
    difficulty: 'intermediate',
    bpm: 92,
    tempoRange: [84, 100],
    ts: [4, 4],
    sub: 4,
    feel: 'swung',
    swing: 0.15,
    sync: 2,
    dens: 2,
    kit: 'dusty',
    summary:
      'Boom-bap bones under R&B skin: swing 0.15, doubled snare-clap backbeats and a closing ghost.',
    description:
      'When R&B producers started sampling their own live drums, the genre met hip-hop halfway: the kick took the boom-bap shape (1, "&2", "&3"), the backbeat doubled snare with clap, and a light swing made the sample feel dusted. This is the pocket of the "hip-hop soul" era — Faith Evans, early Mary J. — where the chorus is sung but the beat is strictly loop-town.',
    construction:
      'Kick on 1, "&2" and "&3". Snare plus clap on 2 & 4 with a ghost on "&4". Swung eighth hats with quarter accents.',
    tracks: [
      { inst: 'kick', pat: 'X......x..x.....', vol: 1 },
      { inst: 'snare', pat: '....X.......X..o', vol: 0.9 },
      { inst: 'clap', pat: '....X.......X...', vol: 0.85 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'Boom-bap floor transplanted into R&B.',
      snare: 'Live-crack half of the doubled backbeat.',
      clap: 'Sample-tape half of the doubled backbeat.',
      hatClosed: 'Swung eighth grid.',
    },
    variations: [
      {
        name: 'Chip flick',
        note: 'A double-stroke on the last 16th signals the loop point.',
        overrides: { hatClosed: 'X.x.X.x.X.x.X.x2' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice 90s hip-hop-soul hybrid feel — rhythm data only.',
    },
  },
  {
    id: 'xg-rnb-minneapolis',
    title: 'Minneapolis Snap',
    family: 'rnb',
    genres: ['R&B', 'Minneapolis Sound'],
    tags: ['minneapolis', '80s', 'rimshot', 'syncopation'],
    difficulty: 'intermediate',
    bpm: 108,
    tempoRange: [100, 118],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'synth',
    summary:
      'The Minneapolis sound on drums: snappy Linn kick cluster (1, a1, &1), rimshot backbeats, crisp eighths.',
    description:
      'Prince and The Time rebuilt R&B from LinnDrum presets and new-wave economy: the kick snaps in a tight cluster (1, the "a" of 1, the "&" of 1) before resting, the backbeat is a dry rimshot rather than a crack, and the hats click in unfeeling machine eighths. Everything is small, sharp and dry — the funk equivalent of a lip curl. The synth-kit suggestion is the whole point.',
    construction:
      'Machine kick on 1, a1 and &1, plus an anchor on "&3". Rimshot backbeats. Eighth hats with one open stroke on "&4".',
    tracks: [
      { inst: 'kick', pat: 'X..X..x...X.....', vol: 1 },
      { inst: 'rimshot', pat: '....x.......x...', vol: 0.8 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6 },
      { inst: 'hatOpen', pat: '..............x.', vol: 0.55 },
    ],
    roles: {
      kick: 'The snap cluster — three hits inside beat 1.',
      rimshot: 'Dry backbeat, deliberately small.',
      hatClosed: 'Machine eighths.',
      hatOpen: 'Single lift on "&4".',
    },
    variations: [
      {
        name: 'Snap double',
        note: 'Double the last kick into the "&" of 4 for the outro push.',
        overrides: { kick: 'X..X..x...X...x.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of Minneapolis-sound (Prince / The Time) drum programming — rhythm data only.',
    },
  },
  {
    id: 'xg-rnb-ballad-ride',
    title: 'Seventies Ballad Ride',
    family: 'rnb',
    genres: ['R&B', 'Soul Ballad'],
    tags: ['ballad', 'ride', 'cross-stick'],
    difficulty: 'beginner',
    bpm: 72,
    tempoRange: [62, 84],
    ts: [4, 4],
    sub: 4,
    feel: 'swung',
    swing: 0.15,
    sync: 1,
    dens: 1,
    kit: 'studio',
    summary:
      'A 70s soul ballad bed: kick on 1 and 3, cross-stick backbeats, ride bell quarters with a gentle swing.',
    description:
      'Soul ballads of the 70s used the cross-stick (sidestick) instead of a full snare crack — a woody click that leaves room for strings and voice. The ride bell marks quarters with a light swing, the kick touches down on 1 and 3, and nothing else happens. This is the arrangement-friendly ballad template: when the chorus needs more, the cross-stick becomes a full snare and the ride opens up.',
    construction:
      'Kick on 1 and 3. Cross-stick backbeats. Ride bell quarters with 0.15 swing.',
    tracks: [
      { inst: 'kick', pat: 'X.......x.......', vol: 1 },
      { inst: 'rimshot', pat: '....x.......x...', vol: 0.7 },
      { inst: 'ride', pat: 'x...x...x...x...', vol: 0.5 },
    ],
    roles: {
      kick: 'Soft floor on the downbeats.',
      rimshot: 'Cross-stick backbeat — understatement as power.',
      ride: 'Quarter-pulse bell with a light swing.',
    },
    variations: [
      {
        name: 'Eighth swell',
        note: 'Move to swung eighths on the ride for the chorus.',
        overrides: { ride: 'x.x.x.x.x.x.x.x.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice 1970s soul-ballad drum bed — rhythm data only.',
    },
  },
  {
    id: 'xg-rnb-modern-drag',
    title: 'Modern Half-Time Drag',
    family: 'rnb',
    genres: ['R&B', 'Alternative R&B'],
    tags: ['halftime', 'sparse', 'modern'],
    difficulty: 'beginner',
    bpm: 68,
    tempoRange: [60, 78],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 1,
    kit: 'synth',
    summary:
      'Alternative-R&B minimalism: a lone half-time snare, two kicks and hats that arrive like afterthoughts.',
    description:
      'The post-"Untitled (How Does It Feel)" school of R&B drums is nearly silent: one half-time snare on beat 3, a kick on 1 and a lone pickup on "a3", and hats that appear in twos and threes with an open stroke sighing into the loop. Space is the production — reverb tails do the work the notes refuse to. This is the pattern for slow-burn modern R&B and ambient soul.',
    construction:
      'Kick on 1 and the "a" of 3. Half-time snare on 3. Hats on 1, "&2" and 4; open hat on "&4".',
    tracks: [
      { inst: 'kick', pat: 'X..........x....', vol: 1 },
      { inst: 'snare', pat: '........X.......', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.....x.....x...', vol: 0.6 },
      { inst: 'hatOpen', pat: '..............x.', vol: 0.5 },
    ],
    roles: {
      kick: 'Two hits — downbeat and one pickup.',
      snare: 'The half-time crack on 3.',
      hatClosed: 'Sparse, almost accidental strokes.',
      hatOpen: 'A breath into the loop.',
    },
    variations: [
      {
        name: 'Four-thumb',
        note: 'Add the kick on the "&" of 2 for the pre-chorus.',
        overrides: { kick: 'X.....x....x....' },
      },
    ],
    source: {
      type: 'original',
      note: 'Original composition: modern alternative-R&B halftime study.',
    },
  },
  {
    id: 'xg-rnb-60s-shout',
    title: 'Sixties Shout-Soul',
    family: 'rnb',
    genres: ['R&B', 'Northern Soul'],
    tags: ['northern soul', '60s', 'tambourine', 'uptempo'],
    difficulty: 'intermediate',
    bpm: 126,
    tempoRange: [116, 134],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'studio',
    summary:
      'Northern-soul stomp: uptempo kick with a "&2" push, cracking backbeats and tambourine eighths.',
    description:
      'The dance-floor soul later canonised as northern soul ran hot — 120-plus BPM backbeats with a kick that pushes on the "&" of 2 to keep the dancers spinning. The tambourine rides the eighths, the hats stay plain, and every instrument plays slightly louder than polite. This is Sam & Dave-era shout-soul energy: the drum part is simple, but it never, ever drags.',
    construction:
      'Kick on 1, "&2" and 3. Backbeats on 2 & 4. Eighth hats with quarter accents; tambourine eighths accented on the backbeats.',
    tracks: [
      { inst: 'kick', pat: 'X.....x.X.......', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.6 },
      { inst: 'tambourine', pat: 'x.x.X.x.x.x.X.x.', vol: 0.6, pan: 0.2 },
    ],
    roles: {
      kick: 'The "&2" push keeps the floor moving.',
      snare: 'Hard backbeats.',
      hatClosed: 'Eighth grid with quarter accents.',
      tambourine: 'Backbeat shimmer for the dancers.',
    },
    variations: [
      {
        name: 'Call-and-answer',
        note: 'Answer each four-bar vocal phrase with a one-beat tom pickup.',
        hint: 'Place a tom figure on the last beat of every fourth bar.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of 1960s shout-soul / northern-soul records — rhythm data only.',
    },
  },

  /* =============================================================== Disco ==== */
  {
    id: 'xg-disco-4floor-core',
    title: 'Four-on-the-Floor Core',
    family: 'disco',
    genres: ['Disco', 'Soul'],
    tags: ['four-on-the-floor', 'openhat', '16ths', 'dance'],
    difficulty: 'beginner',
    bpm: 120,
    tempoRange: [112, 126],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 0,
    dens: 3,
    kit: 'dusty',
    summary:
      'The disco engine: kick on every quarter, open hats chopping the offbeat eighths, closed hats in full 16ths.',
    description:
      'Every disco record is built on this triangle: four kicks per bar so the feet never search, open hi-hat chopping the upbeats so the hands have something to clap, and closed 16ths underneath for the shimmer. Drummers like Earl Young invented it live; machines inherited it forever. The choke between open and closed hats is what gives the upbeats their percussive "chick" — let nothing ring over a kick.',
    construction:
      'Kick on 1, 2, 3, 4. Open hat on every offbeat eighth. Closed hats in all 16ths, choked against the opens.',
    tracks: [
      { inst: 'kick', pat: 'X...X...X...X...', vol: 1 },
      { inst: 'hatClosed', pat: 'xxxxxxxxxxxxxxxx', vol: 0.6 },
      { inst: 'hatOpen', pat: '..X...X...X...X.', vol: 0.55 },
    ],
    roles: {
      kick: 'The four-quarter floor — the reason the dance floor exists.',
      hatClosed: '16th shimmer, choked against the opens.',
      hatOpen: 'The offbeat chop hands clap to.',
    },
    variations: [
      {
        name: 'Open only',
        note: 'Rest the closed hat where the open hat rings for a lighter verse.',
        overrides: { hatClosed: 'x...x...x...x...' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice disco four-on-the-floor beat — rhythm data only.',
    },
  },
  {
    id: 'xg-disco-tamb-8ths',
    title: 'Tambourine Eighths',
    family: 'disco',
    genres: ['Disco', 'Philadelphia Soul'],
    tags: ['tambourine', 'four-on-the-floor', 'shimmer'],
    difficulty: 'beginner',
    bpm: 118,
    tempoRange: [110, 126],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 0,
    dens: 2,
    kit: 'dusty',
    summary:
      'Disco with the tambourine out front: four-floor kick, eighth hats and backbeat-shimmering tambourine.',
    description:
      'Studio 54-era records almost always hired a percussionist, and the tambourine usually got the star part: even eighths with hard accents on 2 & 4, doubling what the strings implied. Here the drum part stays skeletal — four-floor kick and plain eighth hats — so the tambourine\'s backbeat accents are the only choreography the ear needs. Perfect under string stabs and octave bass.',
    construction:
      'Kick on all quarters. Eighth hats. Tambourine eighths accented on the backbeats.',
    tracks: [
      { inst: 'kick', pat: 'X...X...X...X...', vol: 1 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6 },
      { inst: 'tambourine', pat: 'x.x.X.x.x.x.X.x.', vol: 0.65, pan: 0.2 },
    ],
    roles: {
      kick: 'Four-square floor.',
      hatClosed: 'Plain eighths — the tambourine owns the accents.',
      tambourine: 'Backbeat shimmer, the disco signature layer.',
    },
    variations: [
      {
        name: 'Sixteenth shimmer',
        note: 'Open the tambourine into full 16ths for the final chorus.',
        overrides: { tambourine: 'xxxxxxxxxxxxxxxx' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice disco tambourine layer — rhythm data only.',
    },
  },
  {
    id: 'xg-disco-shake-16ths',
    title: 'Shaker Sixteenths',
    family: 'disco',
    genres: ['Disco', 'Boogie'],
    tags: ['shaker', '16ths', 'four-on-the-floor'],
    difficulty: 'intermediate',
    bpm: 122,
    tempoRange: [114, 128],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 3,
    kit: 'dusty',
    summary:
      'Late-disco churn: four-floor kick, offbeat open hats and a 16th shaker doing the string section\'s homework.',
    description:
      'As disco got faster and European, the shaker took over from the tambourine: unbroken 16ths with a softer attack that fills the space between kick and open hat. The result is a groove that sounds like forward motion itself — nothing accents, everything flows. This is the layering discipline for 120-plus boogie and early Italo records.',
    construction:
      'Kick on all quarters. Shaker in even 16ths, panned left. Open hats chop the offbeat eighths.',
    tracks: [
      { inst: 'kick', pat: 'X...X...X...X...', vol: 1 },
      { inst: 'shaker', pat: 'xxxxxxxxxxxxxxxx', vol: 0.55, pan: -0.2 },
      { inst: 'hatOpen', pat: '..X...X...X...X.', vol: 0.55 },
    ],
    roles: {
      kick: 'The pulse.',
      shaker: '16th flow — constant, soft, wide-left.',
      hatOpen: 'Offbeat chop.',
    },
    variations: [
      {
        name: 'Perc swap',
        note: 'Trade the shaker for quarter notes to open the arrangement up.',
        overrides: { shaker: 'x.x.x.x.x.x.x.x.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice late-disco shaker layering — rhythm data only.',
    },
  },
  {
    id: 'xg-disco-orchestra-break',
    title: 'Orchestra Break',
    family: 'disco',
    genres: ['Disco', 'Orchestral Disco'],
    tags: ['two-bar', 'break', 'ratchet', 'snare'],
    difficulty: 'advanced',
    bpm: 119,
    tempoRange: [112, 126],
    ts: [4, 4],
    bars: 2,
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 3,
    kit: 'dusty',
    summary:
      'A two-bar disco break: bar one is the floor, bar two answers with a snare stab and double-stroke drags.',
    description:
      'Disco arrangements lived for the break — the second bar where strings stopped, the snare answered, and the DJ knew a mix point was coming. Bar one here is pure four-on-the-floor; bar two drops a snare accent on 2 and answers it with double-stroke drags on the "&" of 3 and the "&" of 4. The kick never stops: in disco, even the fill keeps dancing.',
    construction:
      'Bar 1: four-floor kick, 16th hats, offbeat opens. Bar 2: same floor plus a snare on 2 and 2-ratchet drags before beats 3 and 4.',
    tracks: [
      { inst: 'kick', pat: 'X...X...X...X...|X...X...X...X...', vol: 1 },
      { inst: 'hatClosed', pat: 'xxxxxxxxxxxxxxxx|xxxxxxxxxxxxxxxx', vol: 0.6 },
      { inst: 'hatOpen', pat: '..X...X...X...X.|..X...X...X...X.', vol: 0.55 },
      { inst: 'snare', pat: '................|....X.....2.X.2.', vol: 0.9 },
    ],
    roles: {
      kick: 'Unbroken floor across both bars.',
      hatClosed: '16th engine.',
      hatOpen: 'Offbeat chop.',
      snare: 'The break answer — one accent, two drags.',
    },
    variations: [
      {
        name: 'Break drop',
        note: 'Cut the kick for the first half of the break bar to spotlight the snare.',
        overrides: { kick: 'X...X...X...X...|X...........X...' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice disco break/turnaround construction — rhythm data only.',
    },
  },
  {
    id: 'xg-disco-boogie-rim',
    title: 'Boogie Rimshot',
    family: 'disco',
    genres: ['Disco', 'Boogie'],
    tags: ['rimshot', 'boogie', '80s'],
    difficulty: 'intermediate',
    bpm: 114,
    tempoRange: [108, 122],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'synth',
    summary:
      'Late-disco boogie: four-floor kick with a dry rimshot backbeat and machine-eighth hats.',
    description:
      'The bridge between disco and 80s boogie swapped the fat snare for a rimshot click — smaller, drier, faster-sounding at the same tempo. The kick stays four-square because the dance floor never left, but everything above it shrinks: rim cracks on 2 & 4, eighths on the machine hats. This is the pocket of late-70s/early-80s records where disco learned to walk quietly.',
    construction:
      'Kick on all quarters. Rimshot on 2 & 4. Machine-eighth hats.',
    tracks: [
      { inst: 'kick', pat: 'X...X...X...X...', vol: 1 },
      { inst: 'rimshot', pat: '....x.......x...', vol: 0.8 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'Four-square floor.',
      rimshot: 'Dry boogie backbeat.',
      hatClosed: 'Machine eighths.',
    },
    variations: [
      {
        name: 'Boogie pickup',
        note: 'Add the kick on the "&" of 4 to bounce into the loop.',
        overrides: { kick: 'X...X...X...X.x.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of late-70s boogie/disco hybrid records — rhythm data only.',
    },
  },
  {
    id: 'xg-disco-postdisco-pop',
    title: 'Post-Disco Pop',
    family: 'disco',
    genres: ['Disco', 'Post-Disco'],
    tags: ['post-disco', 'clap', 'openhat'],
    difficulty: 'intermediate',
    bpm: 116,
    tempoRange: [108, 124],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 2,
    kit: 'synth',
    summary:
      'Post-disco pop chassis: four-floor kick, machine claps on 2 & 4, open-hat offbeats over quarter hats.',
    description:
      'When disco went underground and pop reclaimed the beat, the kit became a machine hybrid: LinnDrum claps answered the four-floor kick, open hats chopped the offbeats, and the closed hat retreated to plain quarters. Michael Jackson\'s "Don\'t Stop \'Til You Get Enough" era and the whole post-disco pop wave ran on exactly this chassis. It is the most copied dance template in pop history.',
    construction:
      'Kick on all quarters. Claps on 2 & 4. Open hats on offbeat eighths, closed hats on quarters.',
    tracks: [
      { inst: 'kick', pat: 'X...X...X...X...', vol: 1 },
      { inst: 'clap', pat: '....X.......X...', vol: 0.85 },
      { inst: 'hatClosed', pat: 'x...x...x...x...', vol: 0.6 },
      { inst: 'hatOpen', pat: '..X...X...X...X.', vol: 0.55 },
    ],
    roles: {
      kick: 'Four-floor pulse.',
      clap: 'Machine backbeat.',
      hatClosed: 'Quarter markers.',
      hatOpen: 'Offbeat chop — the dance instruction.',
    },
    variations: [
      {
        name: 'Snare swap',
        note: 'Replace the clap with a fat snare for the live-band version.',
        hint: 'Swap the clap track for a snare at the same positions.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of post-disco pop records around 1979-1982 — rhythm data only.',
    },
  },
  {
    id: 'xg-disco-hihat-lift',
    title: 'Open-Hat Lift',
    family: 'disco',
    genres: ['Disco', 'House'],
    tags: ['openhat', 'crash', 'four-on-the-floor'],
    difficulty: 'beginner',
    bpm: 121,
    tempoRange: [112, 128],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 2,
    kit: 'dusty',
    summary:
      'The classic disco lift: four-floor kick, offbeat open hats accented hard, and a crash announcing the bar.',
    description:
      'Disco drummers used the crash like a lighthouse — one long ring on beat 1 telling the room the bar restarted. Between lighthouses, the open hats chop the offbeats with hard accents. This stripped version of the four-floor formula is the direct ancestor of house music: remove the crash, quantize the rest, and you have 1984 Chicago. Learn it as disco\'s gift to every dance genre that followed.',
    construction:
      'Kick on all quarters. Open hats accented on offbeat eighths. Closed hats on the other eighths. Crash on beat 1.',
    tracks: [
      { inst: 'kick', pat: 'X...X...X...X...', vol: 1 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6 },
      { inst: 'hatOpen', pat: '..X...X...X...X.', vol: 0.55 },
      { inst: 'crash', pat: 'X...............', vol: 0.45 },
    ],
    roles: {
      kick: 'Four-quarter floor.',
      hatClosed: 'Downbeat eighths.',
      hatOpen: 'Accented offbeat chop.',
      crash: 'The bar-restart lighthouse.',
    },
    variations: [
      {
        name: 'Second crash',
        note: 'Crash on beat 3 as well for the final chorus.',
        overrides: { crash: 'X.......X.......' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice disco/house transitional beat — rhythm data only.',
    },
  },
  {
    id: 'xg-disco-perc-crew',
    title: 'Conga Disco Crew',
    family: 'disco',
    genres: ['Disco', 'Latin Disco'],
    tags: ['congas', 'shaker', 'percussion'],
    difficulty: 'intermediate',
    bpm: 113,
    tempoRange: [106, 120],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 3,
    kit: 'dusty',
    summary:
      'Latin-tinged disco: four-floor kick with congas answering and a 16th shaker underneath.',
    description:
      'The salsa-meets-disco records of the late 70s kept the four-floor kick and hired a full conga player over it. The congas here answer the kick in a tumbao-flavored dialogue — never doubling it — while the shaker burrs in 16ths to keep the floor moving between phrases. Pan the congas wide and the whole rhythm section opens up like a ballroom.',
    construction:
      'Kick on all quarters. Hi conga answers on upbeats, low conga shadows 1, "&2" and "&3". Shaker in even 16ths.',
    tracks: [
      { inst: 'kick', pat: 'X...X...X...X...', vol: 1 },
      { inst: 'congaHi', pat: '..x.x...x.x.x...', vol: 0.7, pan: 0.2 },
      { inst: 'congaLo', pat: 'o.....o...o.....', vol: 0.7, pan: -0.2 },
      { inst: 'shaker', pat: 'xxxxxxxxxxxxxxxx', vol: 0.5, pan: -0.2 },
    ],
    roles: {
      kick: 'Four-quarter floor.',
      congaHi: 'Upbeat answer phrase.',
      congaLo: 'Low shadow of the kick line.',
      shaker: '16th motor.',
    },
    variations: [
      {
        name: 'Cowbell call',
        note: 'End the conga phrase with a double-stroke flick for a montuno-style call.',
        overrides: { congaHi: '..x.x...x.x.x.2.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice Latin-tinged disco percussion layering — rhythm data only.',
    },
  },
  {
    id: 'xg-disco-half-breakdown',
    title: 'Half-Time Breakdown',
    family: 'disco',
    genres: ['Disco', 'Orchestral Disco'],
    tags: ['two-bar', 'breakdown', 'halftime'],
    difficulty: 'intermediate',
    bpm: 115,
    tempoRange: [108, 124],
    ts: [4, 4],
    bars: 2,
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'dusty',
    summary:
      'A two-bar disco breakdown: bar one full-tilt, bar two drops to a lone half-time snare while the kick keeps walking.',
    description:
      'Disco breakdowns thinned the texture without losing the beat: the hats retreat to eighths, the snare fires once on beat 3, and the four-floor kick carries the room alone. Used every eight bars, this two-bar cell gives string arrangements a window and gives dancers a moment to look at each other. The kick\'s stubbornness through the breakdown is the entire trick.',
    construction:
      'Bar 1: four-floor kick, 16th hats, offbeat opens. Bar 2: kick still four-floor, hats to eighths, one half-time snare on 3.',
    tracks: [
      { inst: 'kick', pat: 'X...X...X...X...|X...X...X...X...', vol: 1 },
      { inst: 'hatClosed', pat: 'xxxxxxxxxxxxxxxx|x.x.x.x.x.x.x.x.', vol: 0.6 },
      { inst: 'hatOpen', pat: '..X...X...X...X.|..X...X...X...X.', vol: 0.55 },
      { inst: 'snare', pat: '................|........X.......', vol: 0.9 },
    ],
    roles: {
      kick: 'The stubborn four-floor that never breaks down.',
      hatClosed: '16ths in bar one, thinned eighths in bar two.',
      hatOpen: 'Offbeat chop throughout.',
      snare: 'The lone breakdown crack on 3.',
    },
    variations: [
      {
        name: 'Full return',
        note: 'Bring the 16th hats back through the breakdown for the chorus lift.',
        overrides: { hatClosed: 'xxxxxxxxxxxxxxxx|xxxxxxxxxxxxxxxx' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice disco breakdown arrangement — rhythm data only.',
    },
  },
  {
    id: 'xg-disco-push-loop',
    title: 'Push the Loop',
    family: 'disco',
    genres: ['Disco', 'Boogie'],
    tags: ['pickup', '16ths', 'openhat'],
    difficulty: 'intermediate',
    bpm: 123,
    tempoRange: [114, 128],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 3,
    kit: 'dusty',
    summary:
      'Peak-hour disco: four-floor kick with a pickup on the "a" of 4, full 16th hats and hard offbeat opens.',
    description:
      'At 123 BPM with the room already moving, the smallest gesture lands huge — one kick pickup on the "a" of 4 turns a static four-floor loop into a wheel that never quite stops turning. Everything else is maximum disco: 16th hats, hard offbeat open hats, no snare to interrupt. This is the peak-hour formula DJs stretched into ten-minute mix sequences.',
    construction:
      'Kick on all quarters plus a pickup on the "a" of 4. Full 16th closed hats. Open hats accented on the offbeat eighths.',
    tracks: [
      { inst: 'kick', pat: 'X...X...X...X..x', vol: 1 },
      { inst: 'hatClosed', pat: 'xxxxxxxxxxxxxxxx', vol: 0.6 },
      { inst: 'hatOpen', pat: '..X...X...X...X.', vol: 0.55 },
    ],
    roles: {
      kick: 'Four-floor plus the loop-turning pickup.',
      hatClosed: '16th engine.',
      hatOpen: 'Hard offbeat chop.',
    },
    variations: [
      {
        name: 'Double push',
        note: 'Add a soft kick on the "a" of 3 as well.',
        overrides: { kick: 'X...X...X.x.X..x' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice peak-tempo disco variation — rhythm data only.',
    },
  },
  {
    id: 'xg-disco-latin-tinge',
    title: 'Latin-Tinged Disco',
    family: 'disco',
    genres: ['Disco', 'Latin Disco'],
    tags: ['cowbell', 'congas', '16ths'],
    difficulty: 'intermediate',
    bpm: 120,
    tempoRange: [112, 128],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 3,
    kit: 'dusty',
    summary:
      'Cowbell-forward disco: four-floor kick, montuno cowbell accents, congas on the upbeats and 16th hats.',
    description:
      'From "Hot Stuff" to countless Salsoul records, the cowbell was disco\'s most confident percussionist: accented on 1 and 3, ticking through the eighths, utterly certain of itself. Underneath, hi congas chop the offbeat eighths while the kit holds the four-floor kick and 16th hats. The whole thing sounds like a bigger band than it is — that is the point.',
    construction:
      'Kick on all quarters. Cowbell eighths accented on 1 and 3. Hi conga on offbeat eighths. Closed hats in 16ths.',
    tracks: [
      { inst: 'kick', pat: 'X...X...X...X...', vol: 1 },
      { inst: 'cowbell', pat: 'X.x.x.x.X.x.x.x.', vol: 0.7, pan: -0.2 },
      { inst: 'congaHi', pat: '..x...x...x...x.', vol: 0.7, pan: 0.2 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'Four-quarter floor.',
      cowbell: 'Montuno-flavored accents on 1 & 3.',
      congaHi: 'Offbeat chop from the right.',
      hatClosed: 'Eighth grid.',
    },
    variations: [
      {
        name: 'Timbale burst',
        note: 'A double-stroke plus pickup at the bar\'s end mimics a timbale fill.',
        overrides: { cowbell: 'X.x.x.x.X.x.x.2x' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of Latin-tinged disco records — rhythm data only.',
    },
  },
  {
    id: 'xg-disco-nile-chic',
    title: 'Nile-Style Tight Loop',
    family: 'disco',
    genres: ['Disco', 'R&B'],
    tags: ['chic', 'ghosts', 'rimshot', '16ths'],
    difficulty: 'advanced',
    bpm: 119,
    tempoRange: [112, 126],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 3,
    kit: 'dusty',
    summary:
      'CHIC-school precision: four-floor kick, rimshot backbeats, ghost snare answers and full 16th hats.',
    description:
      'Tony Thompson\'s CHIC grooves proved four-on-the-floor could still swing: the kick never wavered, but a rimshot backbeat and ghost snare answers made every bar conversational. The ghost strokes on the "a" of 1 and "a" of 3 are the secret — they drag just enough to make the four-floor feel human. Add the tightest 16th hats in disco and you have the template for "Good Times" and half of early hip-hop sampling.',
    construction:
      'Kick on all quarters. Rimshot backbeats on 2 & 4. Snare ghosts on the "a" of 1 and "a" of 3. Full 16th hats.',
    tracks: [
      { inst: 'kick', pat: 'X...X...X...X...', vol: 1 },
      { inst: 'rimshot', pat: '....x.......x...', vol: 0.8 },
      { inst: 'snare', pat: '...o.......o....', vol: 0.9 },
      { inst: 'hatClosed', pat: 'xxxxxxxxxxxxxxxx', vol: 0.55 },
    ],
    roles: {
      kick: 'Unbroken four-floor — the CHIC discipline.',
      rimshot: 'Dry backbeat.',
      snare: 'Ghost answers that humanize the floor.',
      hatClosed: 'The tightest 16ths in the genre.',
    },
    variations: [
      {
        name: 'Good-times push',
        note: 'Add kicks on the "&" of 2 and the "&" of 4.',
        overrides: { kick: 'X...X.x.X...X.x.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of CHIC (Nile Rodgers/Tony Thompson) disco grooves — rhythm data only.',
    },
  },

  /* ============================================================= Hip-Hop ==== */
  {
    id: 'xg-hiphop-boom-bap-core',
    title: 'Boom-Bap Cornerstone',
    family: 'hiphop',
    genres: ['Hip-Hop', 'Boom Bap'],
    tags: ['boom bap', 'swing', '90s', 'foundation'],
    difficulty: 'intermediate',
    bpm: 90,
    tempoRange: [84, 96],
    ts: [4, 4],
    sub: 4,
    feel: 'swung',
    swing: 0.16,
    sync: 2,
    dens: 2,
    kit: 'dusty',
    summary:
      'THE boom-bap skeleton: kick on 1, "&2" and "&3", backbeat snare, swung eighth hats — 90 BPM, 0.16 swing.',
    description:
      'Strip away thirty years of sampling and you find this: the kick that walks (1, the "&" of 2, the "&" of 3), the snare that talks on 2 & 4, and the hats that swing just enough to nod. At 90 BPM with a 0.16 swing this is the default posture of East-coast hip-hop from 1988 onward — the shape every SP-1200 owner reached for first. The dusty kit is not optional nostalgia; the crunch IS the genre.',
    construction:
      'Kick on 1, "&2" and "&3". Snare on 2 & 4. Swung eighth hats with quarter accents (0.16 swing).',
    tracks: [
      { inst: 'kick', pat: 'X......x..x.....', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'The walking boom — three anchors that leave room for the sample.',
      snare: 'The bap on 2 & 4.',
      hatClosed: 'Swung eighths that set the nod.',
    },
    variations: [
      {
        name: 'Soul push',
        note: 'A kick on the "a" of 3 deepens the walk.',
        overrides: { kick: 'X......x..x..x..' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice boom-bap drum skeleton (East-coast hip-hop) — rhythm data only.',
    },
  },
  {
    id: 'xg-hiphop-primo-chop',
    title: 'Primo-Style Chop',
    family: 'hiphop',
    genres: ['Hip-Hop', 'Boom Bap'],
    tags: ['boom bap', 'two-bar', 'ghosts', 'chops'],
    difficulty: 'advanced',
    bpm: 92,
    tempoRange: [86, 98],
    ts: [4, 4],
    bars: 2,
    sub: 4,
    feel: 'swung',
    swing: 0.16,
    sync: 3,
    dens: 3,
    kit: 'dusty',
    summary:
      'A DJ Premier-flavored two-bar chop: displaced kicks, ghost-stuffed backbeats and a bar-two stumble.',
    description:
      'Premier\'s drums sound chopped because they are: kicks land where the sample\'s phrase dictates, not where a grid would prefer, and the snare carries ghost strokes like a funk drummer possessed. Bar one states the walk; bar two displaces it (kicks on the "&" of 1, "a2", "&2" and "a3") with a ghost cluster into the loop. Two bars of this under a horn stab loop is the whole Gang Starr formula.',
    construction:
      'Bar 1: kick on 1, a1, &3 with ghosts around the backbeats. Bar 2: displaced kick cluster plus a ghost answer on the "a" of 4. Swung eighth hats throughout.',
    tracks: [
      { inst: 'kick', pat: 'X..x......x.....|X....x.x...x....', vol: 1 },
      { inst: 'snare', pat: '....X..o....X...|....X....o.X...o', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.|X.x.X.x.X.x.X.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'Chopped kick line — bar one states it, bar two displaces it.',
      snare: 'Backbeats stuffed with ghosts, Premier-style.',
      hatClosed: 'Swung eighth metronome.',
    },
    variations: [
      {
        name: 'Scratch answer',
        note: 'Leave the last beat of bar two empty for a scratch answer.',
        hint: 'Trim the hats in the final beat and let a chirp sample answer.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of DJ Premier\'s chopped boom-bap drums — rhythm data only.',
    },
  },
  {
    id: 'xg-hiphop-soul-lift',
    title: 'Soul-Sample Lift',
    family: 'hiphop',
    genres: ['Hip-Hop', 'Boom Bap'],
    tags: ['boom bap', 'swing', 'openhat', 'soul'],
    difficulty: 'intermediate',
    bpm: 88,
    tempoRange: [82, 94],
    ts: [4, 4],
    sub: 4,
    feel: 'swung',
    swing: 0.18,
    sync: 2,
    dens: 2,
    kit: 'dusty',
    summary:
      'Pete Rock-style warmth: deep swing, the standard kick walk and an open-hat sigh on the "&" of 4.',
    description:
      'The Soul Brother number one trick was the open hat: a single lifted stroke on the "&" of 4 that made every loop exhale before the sample dropped back in. Under it, the drums keep the boom-bap walk at 88 BPM with an extra-deep 0.18 swing that feels like the record is slightly melting. This is the template for the entire "dreamy sample" school of East-coast production.',
    construction:
      'Kick on 1, "&2" and "&3". Snare backbeats. Swung eighth hats (0.18) with the last offbeat left open.',
    tracks: [
      { inst: 'kick', pat: 'X......x..x.....', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X...', vol: 0.6 },
      { inst: 'hatOpen', pat: '..............x.', vol: 0.55 },
    ],
    roles: {
      kick: 'The standard boom-bap walk.',
      snare: 'Backbeat crack.',
      hatClosed: 'Deep-swing eighths.',
      hatOpen: 'The exhale on "&4" — the Soul Brother signature.',
    },
    variations: [
      {
        name: 'Double lift',
        note: 'Open the hat on the "&" of 2 as well for a doubled sigh.',
        overrides: { hatClosed: 'X.x.X.x.....X...', hatOpen: '......x.......x.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of Pete Rock-style soul-sample boom bap — rhythm data only.',
    },
  },
  {
    id: 'xg-hiphop-olympic-break',
    title: 'Old-School Break',
    family: 'hiphop',
    genres: ['Hip-Hop', 'B-Boy Breaks'],
    tags: ['breaks', 'b-boy', 'oldschool'],
    difficulty: 'intermediate',
    bpm: 102,
    tempoRange: [96, 110],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'dusty',
    summary:
      'The b-boy break chassis at 102 BPM: punchy kick cluster on 1, "&2", 3 and "&3" with square backbeats.',
    description:
      'Before sampling, breakbeats were drummers — and the breaks b-boys demanded had a specific engine: a kick cluster crowding the middle of the bar, a square 2 & 4 crack, and hats that simply kept time. At 102 BPM this is the tempo zone of the legendary breaks (the "Apache" / "It\'s Just Begun" school). Nothing swings, nothing ghosts; the power is in the punches and the room they leave.',
    construction:
      'Kick on 1, "&2", 3 and "&3". Snare on 2 & 4. Straight eighth hats with quarter accents.',
    tracks: [
      { inst: 'kick', pat: 'X.....x.x.x.....', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'The punch cluster b-boys wait for.',
      snare: 'Square cracking backbeats.',
      hatClosed: 'Plain eighths keeping the break honest.',
    },
    variations: [
      {
        name: 'Bounce push',
        note: 'Move the third kick to the "a" of 3 for a later, bouncier break.',
        overrides: { kick: 'X.....x.x..x....' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of 1970s funk breaks used as early hip-hop beds — rhythm data only.',
    },
  },
  {
    id: 'xg-hiphop-linn-80s',
    title: 'Eighties Linn Rap',
    family: 'hiphop',
    genres: ['Hip-Hop', 'Old School'],
    tags: ['80s', 'linndrum', 'clap', 'oldschool'],
    difficulty: 'beginner',
    bpm: 100,
    tempoRange: [94, 106],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 2,
    kit: 'synth',
    summary:
      'Run-DMC-era LinnDrum rap: kick on 1 and 3, snare doubled with clap, machine eighths — no swing, all attitude.',
    description:
      'When hip-hop met the LinnDrum, the swing disappeared on purpose: perfect eighths, a kick on 1 and 3, and a snare doubled with the machine clap — the "Walk This Way" chassis. The flatness is the point; the gap between the rigid machine and the rapping voice created the genre\'s first pop tension. The synth kit (LinnDrum samples) makes this pattern sound instantly like 1986.',
    construction:
      'Machine kick on 1 and 3. Snare plus clap on 2 & 4. Machine eighth hats.',
    tracks: [
      { inst: 'kick', pat: 'X.......x.......', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'clap', pat: '....X.......X...', vol: 0.85 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'Square machine floor.',
      snare: 'Live-ish crack of the doubled backbeat.',
      clap: 'Machine half of the backbeat.',
      hatClosed: 'Flat eighths — deliberately unswung.',
    },
    variations: [
      {
        name: 'Linn roll',
        note: 'Double the final closed-hat stroke like the preset fills did.',
        overrides: { hatClosed: 'x.x.x.x.x.x.x.x2' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of mid-80s LinnDrum hip-hop records — rhythm data only.',
    },
  },
  {
    id: 'xg-hiphop-g-funk-lean',
    title: 'G-Funk Lean',
    family: 'hiphop',
    genres: ['Hip-Hop', 'West Coast'],
    tags: ['g-funk', 'west coast', 'swing', '808'],
    difficulty: 'intermediate',
    bpm: 92,
    tempoRange: [86, 98],
    ts: [4, 4],
    sub: 4,
    feel: 'swung',
    swing: 0.14,
    sync: 2,
    dens: 2,
    kit: 'analog808',
    summary:
      'West-coast lean at 92: the boom-bap walk on an 808 kit with probabilistic hat flicks and a light swing.',
    description:
      'G-funk kept the boom-bap skeleton but slowed the attitude: same walk (1, "&2", "&3"), 808-weight kick, and hats that flick in and out — here programmed as probabilistic strokes on the "&" of 1 and beat 4. The 0.14 swing feels like a lowrider on hydraulics: never rushed, always gliding. The analog-808 kit supplies the sub weight the whiney synth leads float above.',
    construction:
      'Kick on 1, "&2" and "&3". Snare backbeats. Eighth hats with probabilistic strokes on "&1" and 4; swing 0.14.',
    tracks: [
      { inst: 'kick', pat: 'X......x..x.....', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'x.x.p.x.x.x.p.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'The 808-weight walk.',
      snare: 'Backbeats for the whistle lead to answer.',
      hatClosed: 'Eighths with probabilistic flicks — the hydraulic stumble.',
    },
    variations: [
      {
        name: 'Whine open',
        note: 'Open the hat on the "&" of 4 into the loop.',
        overrides: { hatClosed: 'x.x.p.x.x.x.p...', hatOpen: '..............x.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of early-90s West-coast G-funk drums — rhythm data only.',
    },
  },
  {
    id: 'xg-hiphop-dusty-nineties',
    title: 'Dusty Nineties Chatter',
    family: 'hiphop',
    genres: ['Hip-Hop', 'Boom Bap'],
    tags: ['dusty', '90s', 'ghosts', 'swing'],
    difficulty: 'intermediate',
    bpm: 90,
    tempoRange: [84, 96],
    ts: [4, 4],
    sub: 4,
    feel: 'swung',
    swing: 0.18,
    sync: 2,
    dens: 2,
    kit: 'dusty',
    summary:
      'Dusty 90s chatter: the walking kick with a doubled "&3", a ghost muttering on beat 3 and swung hats that mumble in 16ths.',
    description:
      'The classic mid-decade boom-bap record never let the hats sit still: accents mark the quarters while ghosted offbeats and 16th pickups mumble underneath like a second voice. The kick uses the trusted walk (1, "&2") but doubles the "&3" landing — "a3" tags along — which pushes the loop forward into the snare. The ghost snare muttering on beat 3 is pure SP-1200-era dirt; mixed low, it reads as texture rather than a hit.',
    construction:
      'Layer 1: kick on 1, "&2", "&3" and "a3". Layer 2: backbeat snares on 2 & 4 with a beat-3 ghost. Layer 3: swung eighth hats with ghost offbeats and 16th pickups (0.18 swing).',
    tracks: [
      { inst: 'kick', pat: 'X.....x...xx....', vol: 1 },
      { inst: 'snare', pat: '....X...o...X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.o.X.x.X.o.X.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'The walk with a doubled "&3" push.',
      snare: 'Backbeat crack plus the beat-3 ghost murmur.',
      hatClosed: 'Swung chatter — accents on quarters, ghosts in between.',
    },
    variations: [
      {
        name: 'Loop-turn pickup',
        note: 'A 16th kick on the last offbeat spins the loop like a turntable jab.',
        overrides: { kick: 'X.....x...xx...x' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice mid-90s boom-bap drum kit vocabulary — rhythm data only.',
    },
  },
  {
    id: 'xg-hiphop-boom-bap-ghosts',
    title: 'Ghost-Chop Boom Bap',
    family: 'hiphop',
    genres: ['Hip-Hop', 'Boom Bap'],
    tags: ['boom bap', 'ghosts', 'chops', 'advanced'],
    difficulty: 'advanced',
    bpm: 92,
    tempoRange: [86, 98],
    ts: [4, 4],
    sub: 4,
    feel: 'swung',
    swing: 0.15,
    sync: 3,
    dens: 3,
    kit: 'dusty',
    summary:
      'A ghost-stuffed chop: kicks on 1, "a1", 3 and "a3", backbeats bracketed by snare ghosts and a two-ghost tail into the loop.',
    description:
      'This is the drummerly end of boom-bap, where the snare track behaves like a conga line of ghost strokes around the 2 & 4 cracks. The kick answers in pairs — downbeat plus "a" pickups on 1 and 3 — giving the loop its shuffling, chopped contour. The bar ends with two ghost snare ticks in a row, a classic muffle-drum pickup that makes the loop point feel hand-played. Everything sits under a moderate 0.15 swing so the ghosts lilt without losing the grid.',
    construction:
      'Layer 1: paired kicks on 1/"a1" and 3/"a3". Layer 2: backbeats on 2 & 4 with ghosts on "a2" and a 14/15 tail. Layer 3: swung eighth hats.',
    tracks: [
      { inst: 'kick', pat: 'X..x....x..x....', vol: 1 },
      { inst: 'snare', pat: '....X..o....X.oo', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'Paired downbeat-and-pickup hits that chop the bar.',
      snare: 'Ghost-bracketed backbeats with the loop-turn tail.',
      hatClosed: 'Swung eighths keeping the chatter grounded.',
    },
    variations: [
      {
        name: 'Open the tail',
        note: 'Lift the final ghost into an open-hat answer.',
        hint: 'Swap the last two snare ghosts for a single open-hat stroke on "a4".',
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the ghost-heavy school of sampled boom-bap drum programming — rhythm data only.',
    },
  },
  {
    id: 'xg-hiphop-jazz-rap-ride',
    title: 'Jazz-Rap Ride',
    family: 'hiphop',
    genres: ['Hip-Hop', 'Jazz Rap'],
    tags: ['jazz rap', 'ride', 'swing', 'native tongues'],
    difficulty: 'intermediate',
    bpm: 88,
    tempoRange: [82, 94],
    ts: [4, 4],
    sub: 4,
    feel: 'swung',
    swing: 0.2,
    sync: 2,
    dens: 2,
    kit: 'dusty',
    summary:
      'Native Tongues DNA: deep 0.2 swing, a jazz ride cymbal over pedal hats and a snare with a mid-bar sigh.',
    description:
      'When the Native Tongues crew pulled jazz into rap, the drum kit changed dialect: the ride cymbal took the lead, the hats dropped to pedal whispers, and the swing deepened until the loop swayed. Here the ride swings through eighths at 0.2 while the pedal hat clicks quarters beneath it — a two-layer cymbal engine straight off a early-90s jazz-rap record. The kick walks 1, "a2", "&3" and the snare sighs with a ghost on the "&" of 2, giving the backbeat a brushed, conversational feel.',
    construction:
      'Layer 1: kick on 1, "a2" and "&3". Layer 2: snare on 2 & 4 with a "&2" ghost. Layer 3: swung ride eighths over quarter pedal hats (0.2 swing).',
    tracks: [
      { inst: 'kick', pat: 'X......x..x.....', vol: 1 },
      { inst: 'snare', pat: '....X.o.....X...', vol: 0.9 },
      { inst: 'ride', pat: 'x.x.x.x.x.x.x.x.', vol: 0.55 },
      { inst: 'hatPedal', pat: 'X...X...X...X...', vol: 0.6 },
    ],
    roles: {
      kick: 'Laid-back walk leaving room for the double bass.',
      snare: 'Brushed-feeling backbeat with the "&2" sigh.',
      ride: 'The swinging voice of the groove.',
      hatPedal: 'Quarter-note glue under the ride.',
    },
    variations: [
      {
        name: 'Second sigh',
        note: 'Echo the ghost on the "a" of 3 for a call-and-answer snare.',
        overrides: { snare: '....X.o...o.X...' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of Native Tongues-era jazz-rap drums — rhythm data only.',
    },
  },
  {
    id: 'xg-hiphop-quest-loop',
    title: 'Tribe-Style Loop',
    family: 'hiphop',
    genres: ['Hip-Hop', 'Jazz Rap'],
    tags: ['two-bar', 'loop', 'swing', 'native tongues'],
    difficulty: 'intermediate',
    bpm: 90,
    tempoRange: [86, 96],
    ts: [4, 4],
    bars: 2,
    sub: 4,
    feel: 'swung',
    swing: 0.2,
    sync: 2,
    dens: 2,
    kit: 'dusty',
    summary:
      'A two-bar jazz-rap loop: bar one states the walk, bar two answers with a late kick, snare ghosts and a hat double-stroke.',
    description:
      'The jazz-rap school thought in two-bar phrases: the first bar keeps the pocket so the bass line can breathe, and the second decorates it — an extra kick on "&4", a ghost pair around the final snare, and a hat double-stroke that turns the loop like a record reaching its seam. At 90 BPM with 0.2 swing the whole thing sways on the back of the ride-like hat pattern. Loop it and the answer bar becomes the question for the next pass.',
    construction:
      'Bar 1: kick on 1, "&2", "&3" with square backbeats. Bar 2: same walk plus "&4" kick, snare ghosts on "a2" and "a4", and a 2-stroke hat turn. Swung eighths throughout (0.2).',
    tracks: [
      { inst: 'kick', pat: 'X.....x...x.....|X.....x...x...x.', vol: 1 },
      { inst: 'snare', pat: '....X.......X...|....X..o....X..o', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.|X.x.X.x.X.x.X.x2', vol: 0.6 },
    ],
    roles: {
      kick: 'States the walk in bar one, decorates it in bar two.',
      snare: 'Square backbeats in bar one, ghost answers in bar two.',
      hatClosed: 'Swung eighths with the loop-turn double stroke.',
    },
    variations: [
      {
        name: 'Bass dropout',
        note: 'Mute the "&4" kick every other repetition for a call-and-response with the bass sample.',
        hint: 'Toggle the second-bar "&4" kick off on alternating loops.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of early-90s jazz-rap two-bar loop construction — rhythm data only.',
    },
  },
  {
    id: 'xg-hiphop-head-nod-minimal',
    title: 'Head-Nod Minimal',
    family: 'hiphop',
    genres: ['Hip-Hop', 'Boom Bap'],
    tags: ['minimal', 'head nod', 'swing', 'dusty'],
    difficulty: 'beginner',
    bpm: 84,
    tempoRange: [82, 90],
    ts: [4, 4],
    sub: 4,
    feel: 'swung',
    swing: 0.16,
    sync: 2,
    dens: 1,
    kit: 'dusty',
    summary:
      'Bare-bones head-nodder: two kicks, two snares, a ghost tail and swung eighths — nothing else, all pocket.',
    description:
      'The most durable boom-bap is the kind you can tap out on a desk: kick on 1 and the "&" of 3, snares on 2 & 4, and one ghost tick dragging the ear toward the loop point. At 84 BPM with a 0.16 swing the empty space between hits becomes the feature — this is the school of leaving room for the sample to be the star. Beginners learn the shape in an afternoon; veterans spend years micro-mixing the ghost.',
    construction:
      'Layer 1: kick on 1 and "&3". Layer 2: snares on 2 & 4 with a ghost on "&4". Layer 3: swung eighth hats (0.16).',
    tracks: [
      { inst: 'kick', pat: 'X.........x.....', vol: 1 },
      { inst: 'snare', pat: '....X.......X.o.', vol: 0.9 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'Two floor-shakers, widely spaced.',
      snare: 'The bap, plus one ghost dragging the tail.',
      hatClosed: 'Swung eighths — the nod itself.',
    },
    variations: [
      {
        name: 'Middle anchor',
        note: 'Move the second kick to beat 3 for a square, declarative variant.',
        overrides: { kick: 'X.......x.x.....' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice minimal boom-bap skeleton — rhythm data only.',
    },
  },
  {
    id: 'xg-hiphop-golden-posse',
    title: 'Golden-Era Posse Push',
    family: 'hiphop',
    genres: ['Hip-Hop', 'Golden Era'],
    tags: ['golden era', 'posse cut', '16ths', 'swing'],
    difficulty: 'intermediate',
    bpm: 96,
    tempoRange: [90, 102],
    ts: [4, 4],
    sub: 4,
    feel: 'swung',
    swing: 0.14,
    sync: 2,
    dens: 3,
    kit: 'dusty',
    summary:
      'Posse-cut horsepower: the straight walk at 96 with relentless 16th hats and a light 0.14 swing to keep it human.',
    description:
      'When four MCs are waiting their turn, the beat has to run: 96 BPM, the boom-bap walk (1, "&2", "&3") and full 16th hats giving every syllable a grid to land on. The 0.14 swing is deliberately shallow — deep enough to nod, shallow enough to keep double-time flows legible. This is the engine-room sound of the 1993–96 posse-cut canon: no ghosts, no tricks, just drive.',
    construction:
      'Layer 1: kick on 1, "&2" and "&3". Layer 2: backbeats on 2 & 4. Layer 3: straight-ish 16th hats with a light 0.14 swing.',
    tracks: [
      { inst: 'kick', pat: 'X.....x...x.....', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'xxxxxxxxxxxxxxxx', vol: 0.6 },
    ],
    roles: {
      kick: 'The relentless walk.',
      snare: 'Square backbeats for the crowd to time their steps to.',
      hatClosed: 'Sixteenth momentum — the treadmill under the verses.',
    },
    variations: [
      {
        name: 'Turnaround flick',
        note: 'Double the final 16th hat to signal the loop.',
        overrides: { hatClosed: 'xxxxxxxxxxxxxxx2' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice golden-era East-coast rap drum engine — rhythm data only.',
    },
  },
  {
    id: 'xg-hiphop-east-coast-grit',
    title: 'East-Coast Grit',
    family: 'hiphop',
    genres: ['Hip-Hop', 'East Coast'],
    tags: ['grit', 'east coast', 'pickup', 'swing'],
    difficulty: 'intermediate',
    bpm: 94,
    tempoRange: [88, 100],
    ts: [4, 4],
    sub: 4,
    feel: 'swung',
    swing: 0.15,
    sync: 3,
    dens: 2,
    kit: 'dusty',
    summary:
      'Hard-body East-coast grit: kick pickups crowding the loop point, a ghost tucked against the "&4" snare and swung hats.',
    description:
      'Grit-era East-coast drums crowd the seams: this kick lands on 1, "&2", "&3" and then again on the "a" of 4, rushing the loop point like a producer nudging the fader. The snare tucks a ghost immediately before the "&4" crack — the classic "dig-dug" double that makes programmed drums sound like a nervous drummer. Swung eighths at 0.15 keep the whole thing lurching forward without ever sounding rushed.',
    construction:
      'Layer 1: kick on 1, "&2", "&3" and "a4". Layer 2: snare on 2 & 4 with a ghost on "a3". Layer 3: swung eighth hats (0.15).',
    tracks: [
      { inst: 'kick', pat: 'X.....x...x....x', vol: 1 },
      { inst: 'snare', pat: '....X......oX...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'The walk with a loop-point rush.',
      snare: 'Ghost-then-crack double into the "&4" backbeat.',
      hatClosed: 'Swung eighths holding the lurch.',
    },
    variations: [
      {
        name: 'Double rush',
        note: 'Split the final kick into two 16ths for a harder shove into the loop.',
        overrides: { kick: 'X.....x...x...xx' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of gritty 90s East-coast rap drums — rhythm data only.',
    },
  },
  {
    id: 'xg-hiphop-southern-bounce',
    title: 'Southern Bounce',
    family: 'hiphop',
    genres: ['Hip-Hop', 'Southern'],
    tags: ['bounce', 'atl', 'trill', '808'],
    difficulty: 'intermediate',
    bpm: 95,
    tempoRange: [90, 100],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'analog808',
    summary:
      'Trill-school bounce: a syncopated 808 kick (1, "a1", "&2", "a3") under square 808 snare-and-clap backbeats — no swing, all snap.',
    description:
      'Southern rap traded the East-coast swing for something straighter and springier: 808 kicks scattered across the front half of the bar so the groove bounces instead of walks. Here the kick hits 1, the "a" of 1, the "&" of 2 and the "a" of 3 — a lopsided cell that made Atlanta and Memphis beats feel like they were hopping. The backbeat is a stacked 808 snare plus clap on 2 & 4, dead straight, letting the kick do all the syncopating.',
    construction:
      'Layer 1: 808 kick on 1, "a1", "&2" and "a3". Layer 2: snare + clap stack on 2 & 4. Layer 3: straight eighth hats.',
    tracks: [
      { inst: 'kick', pat: 'X..x..x....x....', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'clap', pat: '....X.......X...', vol: 0.85 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'The hopping 808 cell — all the syncopation lives here.',
      snare: 'Square 808 backbeat.',
      clap: 'The crowd-side half of the backbeat.',
      hatClosed: 'Straight eighths — deliberately unswung.',
    },
    variations: [
      {
        name: 'Late hop',
        note: 'Add an "&4" kick for a second bounce before the loop.',
        overrides: { kick: 'X..x..x....x..x.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice 2000s Southern/trap-era bounce skeleton — rhythm data only.',
    },
  },
  {
    id: 'xg-hiphop-nola-bounce',
    title: 'NOLA Bounce',
    family: 'hiphop',
    genres: ['Hip-Hop', 'Bounce'],
    tags: ['new orleans', 'bounce', 'triggerman', '808'],
    difficulty: 'intermediate',
    bpm: 96,
    tempoRange: [92, 100],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'analog808',
    summary:
      'New Orleans bounce chassis: kicks on 1, "a1", 3 and "&3" with a doubled snare-and-clap hit on the last 16th.',
    description:
      'Bounce music runs on the "Triggerman" lineage: a bouncy 808 kick cell and a snare that doubles with a clap, ending the bar with an extra hit on the final 16th that keeps dancers chirping. The kick pairs a downbeat with its "a" pickup (1 and "a1"), lands square on 3 and answers on the "&" of 3 — a signature New Orleans lilt built without any swing at all. The bar-ending snare-and-clap jab is the call half of the call-and-response that defines the genre.',
    construction:
      'Layer 1: kick on 1, "a1", 3 and "&3". Layer 2: snare + clap on 2 & 4 plus the 16th jab at "a4". Layer 3: straight eighth hats.',
    tracks: [
      { inst: 'kick', pat: 'X..x....x.x.....', vol: 1 },
      { inst: 'snare', pat: '....X.......X..X', vol: 0.9 },
      { inst: 'clap', pat: '....X.......X..X', vol: 0.85 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'The Triggerman-style bounce cell.',
      snare: 'Backbeats plus the bar-end call.',
      clap: 'Doubles the snare for the shout texture.',
      hatClosed: 'Straight eighths keeping the party clock.',
    },
    variations: [
      {
        name: 'Second line answer',
        note: 'Leave the final 16th to a lone clap so the crowd answer reads.',
        hint: 'Mute the snare on "a4" for one loop; keep the clap.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of New Orleans bounce (the Triggerman lineage) — rhythm data only.',
    },
  },
  {
    id: 'xg-hiphop-crunk-clap',
    title: 'Crunk Clap',
    family: 'hiphop',
    genres: ['Hip-Hop', 'Crunk'],
    tags: ['crunk', 'clap', 'club', '808'],
    difficulty: 'beginner',
    bpm: 98,
    tempoRange: [94, 100],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'analog808',
    summary:
      'Crunk minimalism: 808 kick on 1, "a2" and "&3", huge claps on 2 & 4, straight machine hats — built for a shout-along.',
    description:
      'Crunk stripped rap drums down to three jobs: shake the floor with the 808, slam the backbeat with a stadium-sized clap, and keep machine-eighth hats ticking so the crowd chant has a grid. The kick hits the "a" of 2 and the "&" of 3 — a lopsided lurch that made club systems wobble from Atlanta to Memphis around 2003. There is nothing subtle here, and that is the point: every hit exists to be screamed over.',
    construction:
      'Layer 1: 808 kick on 1, "a2" and "&3". Layer 2: big claps on 2 & 4. Layer 3: straight eighth hats.',
    tracks: [
      { inst: 'kick', pat: 'X......x..x.....', vol: 1 },
      { inst: 'clap', pat: '....X.......X...', vol: 0.85 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'The wobbling floor-shaker.',
      clap: 'The arena backbeat every chant lands on.',
      hatClosed: 'Machine eighths — the chant metronome.',
    },
    variations: [
      {
        name: 'Double clap push',
        note: 'Add claps on the "a" of 2 and the final 16th for a call-out response.',
        overrides: { clap: '....X..X....X..X' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of mid-2000s crunk club drums — rhythm data only.',
    },
  },
  {
    id: 'xg-hiphop-808-boom-bap',
    title: '808 Boom Bap',
    family: 'hiphop',
    genres: ['Hip-Hop', 'Boom Bap'],
    tags: ['808', 'boom bap', 'weight', 'swing'],
    difficulty: 'intermediate',
    bpm: 86,
    tempoRange: [82, 92],
    ts: [4, 4],
    sub: 4,
    feel: 'swung',
    swing: 0.16,
    sync: 2,
    dens: 2,
    kit: 'analog808',
    summary:
      'Boom-bap bones on 808 muscles: the classic walk with an added "e4" kick, swung hats and sub-weight backbeats.',
    description:
      'As regional scenes traded drum machines in the early 90s, the boom-bap walk started appearing on 808 kits — same skeleton, twice the tonnage. The kick keeps 1, "&2" and "&3" but adds an "e"-of-4 pickup, giving the walk a heavy-footed stumble into the loop. Backbeats stay square on 2 & 4 while the hats swing 0.16, so the groove still nods even though the floor shakes like a Miami bass test record.',
    construction:
      'Layer 1: 808 kick on 1, "&2", "&3" and "e4". Layer 2: backbeats on 2 & 4. Layer 3: swung eighth hats (0.16).',
    tracks: [
      { inst: 'kick', pat: 'X.....x...x..x..', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'The walk, wearing 808 boots.',
      snare: 'Square backbeat crack.',
      hatClosed: 'Swung eighths keeping the nod alive.',
    },
    variations: [
      {
        name: 'Loop-point stomp',
        note: 'Move the "e4" pickup to the final 16th for a later, heavier stomp.',
        overrides: { kick: 'X.....x...x..x.x' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice early-90s 808-weight boom bap — rhythm data only.',
    },
  },
  {
    id: 'xg-hiphop-houston-drag',
    title: 'Houston Drag',
    family: 'hiphop',
    genres: ['Hip-Hop', 'Southern'],
    tags: ['houston', 'drag', 'slow', '808'],
    difficulty: 'intermediate',
    bpm: 82,
    tempoRange: [82, 88],
    ts: [4, 4],
    sub: 4,
    feel: 'swung',
    swing: 0.14,
    sync: 2,
    dens: 2,
    kit: 'analog808',
    summary:
      'Gulf-coast drag at 82: a stumbling 808 kick (1, "a2", "&3", "e4"), a beat-3 ghost and full 16th hats pulling like syrup.',
    description:
      'Houston taught hip-hop that slowness is a texture: at 82 BPM with full 16th hats and a shallow 0.14 swing, the grid itself feels poured over ice. The kick stumbles through 1, the "a" of 2, the "&" of 3 and the "e" of 4 — four uneven footsteps that never quite hurry — while a ghost snare mutters on beat 3 between the backbeats. This is the UGK-era chassis: heavy, unhurried, and allergic to snap.',
    construction:
      'Layer 1: 808 kick on 1, "a2", "&3" and "e4". Layer 2: backbeats on 2 & 4 with a beat-3 ghost. Layer 3: full 16th hats, light 0.14 swing.',
    tracks: [
      { inst: 'kick', pat: 'X......x..x..x..', vol: 1 },
      { inst: 'snare', pat: '....X...o...X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'xxxxxxxxxxxxxxxx', vol: 0.6 },
    ],
    roles: {
      kick: 'Four uneven, heavy footsteps.',
      snare: 'Backbeats with the beat-3 mutter.',
      hatClosed: 'Sixteenth pour — the syrup texture.',
    },
    variations: [
      {
        name: 'Chopped tail',
        note: 'Stutter the final beat by alternating hat accents for a chopped-and-screwed nod.',
        hint: 'Program bar-4-style hat stutters (X.x.X.x.) in the last beat of an extended loop.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of early-90s Texas Southern-rap drums — rhythm data only.',
    },
  },

  /* ================================================================ Trap ==== */
  {
    id: 'xg-trap-halftime-core',
    title: 'Halftime Foundation',
    family: 'trap',
    genres: ['Trap'],
    tags: ['halftime', '808', 'foundation', 'straight hats'],
    difficulty: 'intermediate',
    bpm: 140,
    tempoRange: [132, 150],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'analog808',
    summary:
      'The trap chassis at 140: an 808 kick walk, one halftime snare crack on 3 and straight 16th hats ending in a roll.',
    description:
      'Trap reorganized the drum kit around one idea: put the backbeat on 3, double the clock to 140, and let the hats carry all the momentum. The 808 kick walks (1, the "&" of 2, the "&" of 3) because the sub bass IS the kick — every kick note is a bass note the melody has to dodge. The lone snare on beat 3 makes the bar exhale, and a four-stroke ratchet on the last 16th keeps the loop from ever sitting still.',
    construction:
      'Layer 1: 808 kick on 1, "&2" and "&3". Layer 2: one snare crack on 3 — the halftime signature. Layer 3: straight 16th hats with quarter accents and a 4-hit ratchet on the final 16th.',
    tracks: [
      { inst: 'kick', pat: 'X.....x...x.....', vol: 1 },
      { inst: 'snare', pat: '........X.......', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x4', vol: 0.6 },
    ],
    roles: {
      kick: '808 sub weight — bass and drum in one voice.',
      snare: 'The halftime crack on 3.',
      hatClosed: 'Sixteenth momentum plus the closing roll.',
    },
    variations: [
      {
        name: 'Denser tail',
        note: 'Stack a triple roll into the final two 16ths.',
        overrides: { hatClosed: 'X.x.X.x.X.x.X.34' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice 2010s trap drum skeleton — rhythm data only.',
    },
  },
  {
    id: 'xg-trap-hat-rolls',
    title: 'Rolling Hat Engine',
    family: 'trap',
    genres: ['Trap'],
    tags: ['halftime', 'hat rolls', '808', 'ratchets'],
    difficulty: 'intermediate',
    bpm: 142,
    tempoRange: [136, 150],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 3,
    kit: 'analog808',
    summary:
      'A roll-obsessed loop: straight hats that dissolve into machine-gun ratchets over the last quarter of every bar.',
    description:
      'Atlanta trap turned the hi-hat into a lead instrument, and the roll is its signature ornament — bursts of strokes fired into single 16th slots. Here the hats ride plain until beat 4, where a triple roll and a doubled four-stroke send the loop spinning back to the top. The kick keeps the trusted walk plus a late "&4" push, and the halftime snare on 3 stays frozen in the center while everything around it accelerates.',
    construction:
      'Layer 1: 808 kick on 1, "&2", "&3" and "&4". Layer 2: halftime snare on 3. Layer 3: 16th hats ending in a 3-stroke ratchet on 4 and a 4-stroke ratchet across "&4"/"a4".',
    tracks: [
      { inst: 'kick', pat: 'X.....x...x...x.', vol: 1 },
      { inst: 'snare', pat: '........X.......', vol: 0.9 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.3.44', vol: 0.6 },
    ],
    roles: {
      kick: 'The walk with the "&4" push.',
      snare: 'The unmoved halftime center.',
      hatClosed: 'The engine — straight grid into double ratchets.',
    },
    variations: [
      {
        name: 'Sprint',
        note: 'Add an early 3-stroke burst on the "e" of 2 for a double-take feel.',
        overrides: { hatClosed: 'x.x.x3x.x.x.3.44' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice Atlanta trap hat-roll vocabulary — rhythm data only.',
    },
  },
  {
    id: 'xg-trap-triplet-skitter',
    title: 'Triplet Skitter',
    family: 'trap',
    genres: ['Trap'],
    tags: ['skitter', 'ratchets', '808', 'halftime'],
    difficulty: 'advanced',
    bpm: 138,
    tempoRange: [130, 146],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 3,
    kit: 'analog808',
    summary:
      'Buzz-roll skitter: 3-stroke hat bursts scattered like ad-libs over an offset 808 walk and a beat-4 snare ghost.',
    description:
      'The skitter style treats ratchets like gunshots in an ad-lib track — unpredictable bursts sprayed across an otherwise straight hat line. Two 3-stroke bursts (on the "e" of 2 and the "a" of 3) drag against the steady kick walk of 1, "a2" and "&3", while a ghost snare tick on beat 4 keeps the halftime skeleton honest. Play the bursts flat and even; the tension comes from machine-gun texture sitting inside a grid that never moves.',
    construction:
      'Layer 1: kick on 1, "a2" and "&3". Layer 2: halftime snare on 3 with a ghost on 4. Layer 3: 16th hats with 3-stroke bursts on "e2" and "a3".',
    tracks: [
      { inst: 'kick', pat: 'X......x..x.....', vol: 1 },
      { inst: 'snare', pat: '........X...o...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'x.x.x3.x.x.3.x.x', vol: 0.6 },
    ],
    roles: {
      kick: 'The offset walk skittering around.',
      snare: 'Halftime anchor with the beat-4 tick.',
      hatClosed: 'Straight line interrupted by buzz bursts.',
    },
    variations: [
      {
        name: 'Lazier stumble',
        note: 'Slide the second burst to the final 16th for a tail-end trip.',
        hint: 'Move the "a3" ratchet to step 15 and leave "&3" empty.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice skitter/trap hat-burst programming — rhythm data only.',
    },
  },
  {
    id: 'xg-trap-808-glide',
    title: '808 Glide Path',
    family: 'trap',
    genres: ['Trap'],
    tags: ['808 glide', 'slides', 'melodic', 'halftime'],
    difficulty: 'intermediate',
    bpm: 135,
    tempoRange: [128, 145],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'analog808',
    summary:
      'Slide-note chassis: doubled kicks that read as one 808 glide into beat 3, lazy eighth hats and a flick roll to restart.',
    description:
      'Modern 808 programming is as much portamento as percussion: the sub slides between pitches, and the drum pattern has to sell the illusion. Two kicks back to back — the "a" of 2 landing into beat 3 — read as one note gliding into the downbeat, with an extra 808 on the "a" of 3 keeping the slide theme going. The hats stay in relaxed eighths because this groove wants space, closing with a two-stroke flick that hands the bar back to the top.',
    construction:
      'Layer 1: kick on 1, "a2", 3 (the glide landing) and "a3". Layer 2: halftime snare on 3. Layer 3: eighth hats with a 2-stroke ratchet on the last 16th.',
    tracks: [
      { inst: 'kick', pat: 'X......xX..x....', vol: 1 },
      { inst: 'snare', pat: '........X.......', vol: 0.9 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x2', vol: 0.6 },
    ],
    roles: {
      kick: 'Downbeat plus the glide pair — the slide illusion.',
      snare: 'Halftime crack riding the glide landing.',
      hatClosed: 'Lazy eighths with the restart flick.',
    },
    variations: [
      {
        name: 'Deeper drop',
        note: 'Move the extra 808 to "&4" so the slide resolves later and lower.',
        overrides: { kick: 'X......xX.....x.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice melodic-trap 808-slide drum framing — rhythm data only.',
    },
  },
  {
    id: 'xg-trap-murky-minimal',
    title: 'Murky Minimal',
    family: 'trap',
    genres: ['Trap'],
    tags: ['minimal', 'dark', 'probabilistic', 'halftime'],
    difficulty: 'beginner',
    bpm: 130,
    tempoRange: [124, 140],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 1,
    kit: 'analog808',
    summary:
      'Dark and half-empty: a two-note 808 skeleton, one halftime snare and probabilistic hats drifting in and out.',
    description:
      'The murkiest trap throws most of the grid away. Two 808 hits (1 and "&3"), a single snare on 3 and hats that flicker in only half the time leave enormous negative space for synth stabs and the vocal. The probabilistic strokes on the "&" of 1 and the "a" of 4 mean the loop never repeats identically — the exact effect DAW randomizers gave the mid-2010s underground. Beginners can play this; producers can disappear into it.',
    construction:
      'Layer 1: kick on 1 and "&3". Layer 2: one halftime snare on 3. Layer 3: sparse hats with 55% probability on "&1" and "a4".',
    tracks: [
      { inst: 'kick', pat: 'X.........x.....', vol: 1 },
      { inst: 'snare', pat: '........X.......', vol: 0.9 },
      { inst: 'hatClosed', pat: 'x.x...p...x...p.', vol: 0.6 },
    ],
    roles: {
      kick: 'Two sub drops — the whole harmonic floor.',
      snare: 'The only backbeat, and it lands on 3.',
      hatClosed: 'Probabilistic flicker — atmosphere, not clock.',
    },
    variations: [
      {
        name: 'Solid flicker',
        note: 'Lock the probabilistic hats in for a more assertive take.',
        overrides: { hatClosed: 'x.x...x...x...x.' },
      },
    ],
    source: {
      type: 'original',
      note: 'Original composite of the minimal/dark trap school — rhythm data only.',
    },
  },
  {
    id: 'xg-trap-drill-slide',
    title: 'Drill Slide Chassis',
    family: 'trap',
    genres: ['Trap', 'Drill'],
    tags: ['drill', 'uk', 'slides', 'ratchets'],
    difficulty: 'advanced',
    bpm: 144,
    tempoRange: [138, 150],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 3,
    kit: 'analog808',
    summary:
      'Drill-adjacent lurch: offset 808 kicks on 1, "e2", "&3" and "e4" with rolling hats and a ghost-snare tail.',
    description:
      'Drill kept the halftime snare but shuffled the kick: hits land on the "e" of 2 and the "e" of 4, giving the loop its restless, sliding lurch that traveled from Chicago to London to New York. The hats answer with a 3-stroke burst on the "a" of 2 and a four-stroke roll on the final 16th, while a ghost snare tick on the last offbeat drags the ear into the repeat. Everything is one syncopation away from tipping over — that instability is the genre.',
    construction:
      'Layer 1: 808 kick on 1, "e2", "&3" and "e4". Layer 2: halftime snare on 3 with a "a4" ghost. Layer 3: 16th hats with a 3-burst on "a2" and a 4-roll on "a4".',
    tracks: [
      { inst: 'kick', pat: 'X....x....x..x..', vol: 1 },
      { inst: 'snare', pat: '........X......o', vol: 0.9 },
      { inst: 'hatClosed', pat: 'x.x.x.x3x.x.x.x4', vol: 0.6 },
    ],
    roles: {
      kick: 'The sliding, off-center 808 cell.',
      snare: 'Halftime anchor plus the tail drag.',
      hatClosed: 'Bursts and rolls stitched through the lurch.',
    },
    variations: [
      {
        name: 'Double slide',
        note: 'Add an "&1" kick so the front half slides too.',
        overrides: { kick: 'X.x..x....x..x..' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of drill-era halftime drums — rhythm data only.',
    },
  },
  {
    id: 'xg-trap-banger-roll',
    title: 'Arena Banger',
    family: 'trap',
    genres: ['Trap'],
    tags: ['banger', 'roll', 'aggressive', 'halftime'],
    difficulty: 'intermediate',
    bpm: 146,
    tempoRange: [140, 152],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 3,
    kit: 'analog808',
    summary:
      'Festival banger: a front-loaded kick cell (1, "a1", "&2", "&3"), snare flam on the last 16th and double hat rolls at "&4".',
    description:
      'The trap banger front-loads its energy: three kicks inside the first half of the bar make the drop feel detonated before beat 3 even arrives. The snare cracks the halftime center and flams a double-stroke on the final 16th, while the hats fire a four-stroke roll across "&4" and "a4" — the festival-mixdown version of a drum fill. Nothing about this loop breathes; it is engineered for a drop and a phone-light crowd.',
    construction:
      'Layer 1: kick on 1, "a1", "&2" and "&3". Layer 2: halftime snare with a 2-stroke flam on "a4". Layer 3: 16th hats with a 4-stroke roll on the final two 16ths.',
    tracks: [
      { inst: 'kick', pat: 'X..x..x...x.....', vol: 1 },
      { inst: 'snare', pat: '........X......2', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.44', vol: 0.6 },
    ],
    roles: {
      kick: 'The detonation cell up front.',
      snare: 'Halftime crack plus the closing flam.',
      hatClosed: 'Accented 16ths rolling into the loop point.',
    },
    variations: [
      {
        name: 'Triple tail',
        note: 'Upgrade the snare flam to a triple stroke.',
        overrides: { snare: '........X......3' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice festival-trap banger drums — rhythm data only.',
    },
  },
  {
    id: 'xg-trap-half-notation-70',
    title: 'Seventy Halftime',
    family: 'trap',
    genres: ['Trap'],
    tags: ['halftime', 'notation', 'lazy', '808'],
    difficulty: 'beginner',
    bpm: 70,
    tempoRange: [68, 78],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'analog808',
    summary:
      'The trap skeleton notated the slow way: 70 BPM halftime where the hats are eighths and the snare sits on 3 of a long bar.',
    description:
      'Producers argue about trap tempo because the genre supports two readings: 140 with halftime snares, or 70 with a long, lazy bar — this pattern takes the slow route honestly. At 70 the hats are eighths, the bar lasts a full 3.4 seconds, and the snare on beat 3 splits it in half; every symbol sounds twice as relaxed as its club-speed twin. A 3-stroke burst on the final eighth keeps a trace of the roll culture inside the drag.',
    construction:
      'Layer 1: kick on 1, "&2" and "&3" on the slow grid. Layer 2: snare on 3 of the long bar. Layer 3: eighth hats with a 3-stroke burst on the final eighth.',
    tracks: [
      { inst: 'kick', pat: 'X.....x...x.....', vol: 1 },
      { inst: 'snare', pat: '........X.......', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x3', vol: 0.6 },
    ],
    roles: {
      kick: 'The walk, drawn at half resolution.',
      snare: 'The long-bar halftime split.',
      hatClosed: 'Eighths with the closing burst.',
    },
    variations: [
      {
        name: 'Doubled clock',
        note: 'Play the same grid at 140 with all hats halved to hear the two notations meet.',
        hint: 'Switch bpm to 140 and halve every hat density.',
      },
    ],
    source: {
      type: 'reference',
      note: 'The halftime-notation reading of standard trap drums — rhythm data only.',
    },
  },
  {
    id: 'xg-trap-lazy-half',
    title: 'Lazy Seventy-Four',
    family: 'trap',
    genres: ['Trap'],
    tags: ['halftime', 'lazy', 'notation', '808'],
    difficulty: 'intermediate',
    bpm: 74,
    tempoRange: [68, 78],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'analog808',
    summary:
      'A draggy halftime reading at 74: kick on 1, "&2" and "e4", a beat-4 ghost and a 2-stroke hat flick on "&3".',
    description:
      'This is what trap looks like when the tape slowed down: the slow-grid reading at 74 with a kick that refuses to land square — 1, the "&" of 2, then not another step until the "e" of 4. A ghost snare mutters on beat 4 and a 2-stroke hat flick stutters the "&" of 3, giving the long bar a screwy, drawn-out stumble. Nothing here is fast; the genre tension comes from hearing roll culture stretched like taffy.',
    construction:
      'Layer 1: kick on 1, "&2" and "e4" on the slow grid. Layer 2: snare on 3 with a ghost on 4. Layer 3: eighth hats with a 2-stroke flick on "&3".',
    tracks: [
      { inst: 'kick', pat: 'X.....x......x..', vol: 1 },
      { inst: 'snare', pat: '........X...o...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.2.x.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'The uneven, draggy 808 steps.',
      snare: 'Halftime split plus the beat-4 mutter.',
      hatClosed: 'Lazy eighths with the "&3" stutter.',
    },
    variations: [
      {
        name: 'End burst',
        note: 'Give the final eighth a 3-stroke burst to hint at the club-speed rolls.',
        overrides: { hatClosed: 'x.x.x.x.x.2.x.x3' },
      },
    ],
    source: {
      type: 'original',
      note: 'Original slow-grid halftime composite — rhythm data only.',
    },
  },
  {
    id: 'xg-trap-open-air',
    title: 'Open-Air Exhale',
    family: 'trap',
    genres: ['Trap'],
    tags: ['open hat', 'airy', 'melodic', 'halftime'],
    difficulty: 'intermediate',
    bpm: 138,
    tempoRange: [130, 146],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'analog808',
    summary:
      'Melodic-trap breathing room: the core walk plus an "a4" kick, straight eighth hats and one open-hat sigh on "&4".',
    description:
      'Melodic trap learned from R&B that one open hat can act like a breath: here a single lifted stroke on the "&" of 4 makes the 140-BPM bar exhale before the loop resets. The kick adds an "a4" pickup under the sigh, so the sub re-enters exactly where the air leaves. Closed hats stay in plain eighths — this groove is about the gap, not the churn.',
    construction:
      'Layer 1: kick on 1, "&2", "&3" and "a4". Layer 2: halftime snare on 3. Layer 3: straight eighth hats with one open stroke on "&4".',
    tracks: [
      { inst: 'kick', pat: 'X.....x...x....x', vol: 1 },
      { inst: 'snare', pat: '........X.......', vol: 0.9 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6 },
      { inst: 'hatOpen', pat: '..............x.', vol: 0.55 },
    ],
    roles: {
      kick: 'The walk plus the "a4" re-entry.',
      snare: 'The halftime center.',
      hatClosed: 'Plain eighths keeping the clock quiet.',
      hatOpen: 'The single exhale on "&4".',
    },
    variations: [
      {
        name: 'Doubled sigh',
        note: 'Open the "&" of 2 as well for a two-breath bar.',
        overrides: { hatClosed: 'x.x.x.x.x.x.x.x.', hatOpen: '......x.......x.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice melodic-trap open-hat framing — rhythm data only.',
    },
  },
  {
    id: 'xg-trap-two-bar-build',
    title: 'Two-Bar Hat Ramp',
    family: 'trap',
    genres: ['Trap'],
    tags: ['two-bar', 'build', 'ramp', 'halftime'],
    difficulty: 'advanced',
    bpm: 140,
    tempoRange: [134, 148],
    ts: [4, 4],
    bars: 2,
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 3,
    kit: 'analog808',
    summary:
      'A two-bar tension ramp: bar one states the chassis, bar two stacks kicks, a snare ghost and a 3-into-4 hat roll.',
    description:
      'Trap loops build tension by density, not pitch: bar one is the calm chassis, and bar two piles on an "e4"/"a4" kick pair, a ghost snare tick and a hat ramp that rolls a triple into a quadruple across the last quarter. Played on repeat, the ramp reads as a wave — settle, stack, spill, reset — which is why two-bar trap loops feel longer than they are. The halftime snare never moves; everything else accelerates around it.',
    construction:
      'Bar 1: kick on 1, "&2", "&3"; snare on 3; straight 16th hats. Bar 2: same chassis plus "e4"/"a4" kicks, an "a4" snare ghost, and a 3-stroke roll on 4 into a 4-stroke roll on the final 16ths.',
    tracks: [
      { inst: 'kick', pat: 'X.....x...x.....|X.....x...x..x.x', vol: 1 },
      { inst: 'snare', pat: '........X.......|........X......o', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.|X.x.X.x.X.x.3.44', vol: 0.6 },
    ],
    roles: {
      kick: 'States bar one, stacks bar two.',
      snare: 'The fixed halftime center with a bar-two drag.',
      hatClosed: 'The ramp — straight grid into triple/quadruple rolls.',
    },
    variations: [
      {
        name: 'Third-bar drop',
        note: 'In an extended arrangement, mute everything but the kick on the downbeat after the ramp.',
        hint: 'Follow the two-bar loop with a single 808 note on 1.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice two-bar trap tension phrasing — rhythm data only.',
    },
  },
  {
    id: 'xg-trap-shaker-slick',
    title: 'Shaker Slick',
    family: 'trap',
    genres: ['Trap'],
    tags: ['shaker', 'slick', 'modern', 'halftime'],
    difficulty: 'advanced',
    bpm: 148,
    tempoRange: [140, 152],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 3,
    kit: 'analog808',
    summary:
      'Modern slick mode: a panned 16th shaker does the driving while the hats save themselves for a "&4" double roll.',
    description:
      'A lot of current trap hands the 16th-note grind to a shaker and lets the hi-hat specialize in rolls — the shaker reads smooth in headphones, the hat reads sharp on club rigs. Here the shaker (panned right) sprints through all sixteen slots while the kick works an off-center 1, "&2", "a3" cell and the hats hold back until a double four-stroke roll at "&4". The halftime snare stays dead center, the way a straight man stands next to a comedian.',
    construction:
      'Layer 1: kick on 1, "&2" and "a3". Layer 2: halftime snare on 3. Layer 3: eighth hats with a 4+4 roll at "&4"; shaker in straight 16ths panned right.',
    tracks: [
      { inst: 'kick', pat: 'X.....x....x....', vol: 1 },
      { inst: 'snare', pat: '........X.......', vol: 0.9 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.44', vol: 0.6 },
      { inst: 'shaker', pat: 'xxxxxxxxxxxxxxxx', vol: 0.7, pan: 0.2 },
    ],
    roles: {
      kick: 'The off-center 808 cell.',
      snare: 'The halftime anchor.',
      hatClosed: 'The roll specialist — silent until "&4".',
      shaker: 'The 16th engine, parked in the right ear.',
    },
    variations: [
      {
        name: 'Left-hand swap',
        note: 'Pan the shaker left for the second pass to fake a stereo answer.',
        hint: 'Alternate the shaker pan between loops instead of re-writing the grid.',
      },
    ],
    source: {
      type: 'original',
      note: 'Original composite of modern shaker-driven trap texture — rhythm data only.',
    },
  },

  /* ================================================================= Pop ==== */
  {
    id: 'xg-pop-sparse-modern',
    title: 'Streaming-Era Stub',
    family: 'pop',
    genres: ['Pop'],
    tags: ['sparse', 'modern', 'minimal', 'streaming'],
    difficulty: 'beginner',
    bpm: 104,
    tempoRange: [100, 110],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 1,
    kit: 'tight',
    summary:
      'The modern pop minimum: kick on 1 and "&3", claps on 2 & 4, pedal-hat quarters — a stub for hooks to live in.',
    description:
      'Streaming-era pop drums are often barely there: two kicks, two claps and a pedal hat ticking quarters, with every freed dB spent on the vocal. The "&3" kick keeps just enough motion to stop the bar from feeling like a metronome test. This is the skeleton demo engineers sketch first, because anything added later has to justify itself against the hook.',
    construction:
      'Layer 1: kick on 1 and "&3". Layer 2: claps on 2 & 4. Layer 3: pedal hats on quarters.',
    tracks: [
      { inst: 'kick', pat: 'X.........x.....', vol: 1 },
      { inst: 'clap', pat: '....X.......X...', vol: 0.85 },
      { inst: 'hatPedal', pat: 'X...X...X...X...', vol: 0.6 },
    ],
    roles: {
      kick: 'Floor and motion — one square, one syncopated.',
      clap: 'The only backbeat, machine-clean.',
      hatPedal: 'Quarter-note clock, tucked under the vocal.',
    },
    variations: [
      {
        name: 'Sixteenth tick',
        note: 'Add a pedal-hat pickup before bar 4-style transitions.',
        overrides: { hatPedal: 'X...X...X...X.x.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice 2010s/2020s minimal pop drum stub — rhythm data only.',
    },
  },
  {
    id: 'xg-pop-four-floor-sunshine',
    title: 'Sunshine Four-Floor',
    family: 'pop',
    genres: ['Pop', 'Dance'],
    tags: ['four-on-the-floor', 'upbeat', 'dance pop'],
    difficulty: 'beginner',
    bpm: 118,
    tempoRange: [112, 122],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 2,
    kit: 'studio',
    summary:
      'Upbeat dance-pop floor: kick on every quarter, claps on 2 & 4, quarter closed hats and open hats on all offbeats.',
    description:
      'When pop borrows the dance floor it takes the house engine wholesale: four kicks per bar, claps stacked on 2 & 4, and open hats sighing on every offbeat. The closed hats tick quarters underneath so radio speakers without sub weight still feel the pulse. This is the chassis of the last four decades of sunshine pop — from 1979 disco through every wedding-floor comeback since.',
    construction:
      'Layer 1: kick on all four quarters. Layer 2: claps on 2 & 4. Layer 3: closed hats on quarters plus open hats on the offbeat eighths.',
    tracks: [
      { inst: 'kick', pat: 'X...X...X...X...', vol: 1 },
      { inst: 'clap', pat: '....X.......X...', vol: 0.85 },
      { inst: 'hatClosed', pat: 'X...X...X...X...', vol: 0.6 },
      { inst: 'hatOpen', pat: '..x...x...x...x.', vol: 0.55 },
    ],
    roles: {
      kick: 'The four-square floor.',
      clap: 'Backbeat for the hands-in-the-air moment.',
      hatClosed: 'Quarter pulse for small speakers.',
      hatOpen: 'Offbeat lift — the dance-floor breath.',
    },
    variations: [
      {
        name: 'Radio shave',
        note: 'Drop the open hats for a leaner verse and bring them back for the chorus.',
        hint: 'Mute the open-hat track for eight bars, then return it at the drop.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice dance-pop four-on-the-floor engine — rhythm data only.',
    },
  },
  {
    id: 'xg-pop-handclap-drive',
    title: 'Clap-Along Drive',
    family: 'pop',
    genres: ['Pop'],
    tags: ['handclaps', 'anthem', 'clap-driven', 'upbeat'],
    difficulty: 'intermediate',
    bpm: 108,
    tempoRange: [102, 116],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'tight',
    summary:
      'Clap-driven anthem: claps on 2 & 4 plus an anticipation clap on the last 16th, kick on 1, 3 and "&3".',
    description:
      'Some pop records are really clap records: the handclap carries the identity while the drums politely support it. Here the clap takes 2 & 4 and sneaks an extra hit on the very last 16th — the audience-participation grab that makes arenas clap one bar early. The kick answers on 1, 3 and the "&" of 3, giving just enough stomp under the hands without crowding them.',
    construction:
      'Layer 1: kick on 1, 3 and "&3". Layer 2: snare on 2 & 4 under the claps. Layer 3: claps on 2 & 4 plus the "a4" anticipation; eighth hats throughout.',
    tracks: [
      { inst: 'kick', pat: 'X.......x.x.....', vol: 1 },
      { inst: 'clap', pat: '....X.......X..X', vol: 0.85 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'Stomp anchors with the "&3" push.',
      clap: 'The star — backbeats plus the early-audience grab.',
      snare: 'The dry crack underneath the hands.',
      hatClosed: 'Eighth-note glue.',
    },
    variations: [
      {
        name: 'Push clap',
        note: 'Add a clap on the "a" of 2 for a double-grab bar.',
        overrides: { clap: '....X..X....X..X' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice clap-driven pop anthem drums — rhythm data only.',
    },
  },
  {
    id: 'xg-pop-stadium-stomp',
    title: 'Stadium Stomp',
    family: 'pop',
    genres: ['Pop', 'Arena'],
    tags: ['stadium', 'stomp', 'clap', 'anthem'],
    difficulty: 'beginner',
    bpm: 100,
    tempoRange: [100, 110],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 1,
    kit: 'studio',
    summary:
      'Two stomps and a clap: kick on 1 and "&2", clap on 3, silence on 4 — the most famous audience rhythm in rock-pop.',
    description:
      'The stomp-stomp-clap cell is stadium folk music: two foot-stomps (1 and the "&" of 2) answered by a single clap on 3, with beat 4 left totally empty so the crowd noise fills it. Pop borrows this chassis whenever a chorus needs to feel like 60,000 people playing along. There are only two tracks here because that is all the idea needs; the drama is in the silence after the clap.',
    construction:
      'Layer 1: kick stomps on 1 and "&2". Layer 2: one clap on 3. Beat 4: nothing.',
    tracks: [
      { inst: 'kick', pat: 'X.....x.........', vol: 1 },
      { inst: 'clap', pat: '........X.......', vol: 0.85 },
    ],
    roles: {
      kick: 'The stomping feet — both hits.',
      clap: 'The hands, once per bar, big.',
    },
    variations: [
      {
        name: 'Crowd enters',
        note: 'Double the stomps on "&3" and "a4" as if the audience caught up.',
        overrides: { kick: 'X.....x.x.....x.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the stomp-stomp-clap stadium tradition — rhythm data only.',
    },
  },
  {
    id: 'xg-pop-gated-80s',
    title: 'Gated Eighties',
    family: 'pop',
    genres: ['Pop'],
    tags: ['80s', 'gated', 'synth pop', 'retro'],
    difficulty: 'beginner',
    bpm: 118,
    tempoRange: [110, 122],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 2,
    kit: 'synth',
    summary:
      'Synth-pop chassis: kick on 1 & 3, gated snare doubled with clap on 2 & 4, machine eighth hats.',
    description:
      'The 80s pop kit is a machine with shoulder pads: kick squarely on 1 & 3, a snare crushed by gated reverb and doubled with a clap, and eighth-note hats with zero swing. The flatness is the aesthetic — the grid IS the fashion. The synth kit reproduces the LinnDrum-generation palette that defined the era from 1983 to 1987 and every revival since.',
    construction:
      'Layer 1: kick on 1 & 3. Layer 2: gated snare plus clap on 2 & 4. Layer 3: machine eighth hats.',
    tracks: [
      { inst: 'kick', pat: 'X.......x.......', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'clap', pat: '....X.......X...', vol: 0.85 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'Square machine floor.',
      snare: 'The gated cannon.',
      clap: 'The machine half of the backbeat.',
      hatClosed: 'Flat eighths — deliberately stiff.',
    },
    variations: [
      {
        name: 'Tom cascade',
        note: 'Replace the last hat with a falling tom fill like every 1985 preset did.',
        hint: 'Program toms 3–2–1 across the final beat of the fourth bar.',
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice mid-80s synth-pop drum machine chassis — rhythm data only.',
    },
  },
  {
    id: 'xg-pop-dembow-tropic',
    title: 'Tropical Dembow Lift',
    family: 'pop',
    genres: ['Pop', 'Reggaeton'],
    tags: ['dembow', 'tropical', 'clap', 'crossover'],
    difficulty: 'intermediate',
    bpm: 100,
    tempoRange: [100, 108],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'tight',
    summary:
      'Pop with a dembow spine: kick on 1 & 3, claps on "a1", "&2", "a3" and "&4" — the riddim behind a decade of crossovers.',
    description:
      'The dembow is the most imported beat in modern pop: kicks on 1 & 3 while the clap stutters "a1", "&2", "a3", "&4", a cell that makes hips move before the brain consents. Pop productions layer it under synths and topline vocals, keeping the clap dry so the pattern stays legible. The eighth-note hats are deliberately plain — all the personality belongs to the clap cell.',
    construction:
      'Layer 1: kick on 1 & 3. Layer 2: clap dembow cell on "a1", "&2", "a3", "&4". Layer 3: straight eighth hats.',
    tracks: [
      { inst: 'kick', pat: 'X.......x.......', vol: 1 },
      { inst: 'clap', pat: '...X..X....X..X.', vol: 0.85 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'The square 1 & 3 floor.',
      clap: 'The dembow — every note of its personality.',
      hatClosed: 'Plain eighths for the pop sheen.',
    },
    variations: [
      {
        name: 'Bounce push',
        note: 'Add a "&2" kick for a bouncier tropical remix feel.',
        overrides: { kick: 'X.....x.x.......' },
      },
    ],
    source: {
      type: 'reference',
      note: 'The classic dembow riddim cell as used in pop crossovers — rhythm data only.',
    },
  },
  {
    id: 'xg-pop-funk-pocket',
    title: 'Funk-Pop Pocket',
    family: 'pop',
    genres: ['Pop', 'Funk'],
    tags: ['funk pop', 'pocket', 'ghosts', 'syncopated'],
    difficulty: 'advanced',
    bpm: 115,
    tempoRange: [110, 120],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 3,
    kit: 'tight',
    summary:
      'Funk-revival pocket: a four-hit syncopated kick, snare ghosts on "a2" and "a4" and a full 16th-hat floor.',
    description:
      'When pop goes funk it keeps the hooks but hires a drummer: the kick scatters across 1, "&2", "&3" and "e4" while the snare cracks 2 & 4 with ghosts muttering on the "a"s. Full 16th hats give the retro-revival sheen its floor, and the whole thing balances on being busy-but-tidy — every ghost mixed just under the crack. This is the chassis of the 2010s funk-pop revival school, tuned for bass players who read.',
    construction:
      'Layer 1: kick on 1, "&2", "&3" and "e4". Layer 2: snare on 2 & 4 with "a2"/"a4" ghosts. Layer 3: straight 16th hats.',
    tracks: [
      { inst: 'kick', pat: 'X.....x...x..x..', vol: 1 },
      { inst: 'snare', pat: '....X..o....X..o', vol: 0.9 },
      { inst: 'hatClosed', pat: 'xxxxxxxxxxxxxxxx', vol: 0.6 },
    ],
    roles: {
      kick: 'The syncopated engine of the pocket.',
      snare: 'Backbeat cracks with ghost mutters.',
      hatClosed: 'Sixteenth floor for the revival sheen.',
    },
    variations: [
      {
        name: 'Loop-point stab',
        note: 'Add a final 16th kick to ram the loop point.',
        overrides: { kick: 'X.....x...x..x.x' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Inspired by the feel of 2010s funk-pop revival drums — rhythm data only.',
    },
  },
  {
    id: 'xg-pop-swing-shuffle',
    title: 'Swing-Pop Shuffle',
    family: 'pop',
    genres: ['Pop'],
    tags: ['swing', 'shuffle', 'retro', 'lighthearted'],
    difficulty: 'beginner',
    bpm: 112,
    tempoRange: [106, 118],
    ts: [4, 4],
    sub: 4,
    feel: 'swung',
    swing: 0.12,
    sync: 1,
    dens: 1,
    kit: 'studio',
    summary:
      'A lighthearted pop shuffle: kick on 1 & 3, snare on 2 & 4, swung eighth hats at a gentle 0.12.',
    description:
      'Pop rediscovers the shuffle every few years and immediately uses it to sound friendly: kick on 1 & 3, snare on 2 & 4, hats swung just enough (0.12) to make the bar skip rather than swagger. It is the drum equivalent of a wink — nobody plays a sad chorus over this. The roominess of the kit leaves the piano or horns to decorate the swing further.',
    construction:
      'Layer 1: kick on 1 & 3. Layer 2: snare on 2 & 4. Layer 3: swung eighth hats with quarter accents (0.12).',
    tracks: [
      { inst: 'kick', pat: 'X.......x.......', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'The friendly two-step floor.',
      snare: 'Backbeat cracks, slightly tipsy.',
      hatClosed: 'The skip — swung eighths.',
    },
    variations: [
      {
        name: 'Turnaround tick',
        note: 'Double the final hat stroke to pivot the loop.',
        overrides: { hatClosed: 'X.x.X.x.X.x.X.x2' },
      },
    ],
    source: {
      type: 'original',
      note: 'Original composite of retro swing-pop shuffles — rhythm data only.',
    },
  },
  {
    id: 'xg-pop-halftime-drag',
    title: 'Halftime Drag',
    family: 'pop',
    genres: ['Pop'],
    tags: ['halftime', 'drag', 'minimal', 'moody'],
    difficulty: 'beginner',
    bpm: 100,
    tempoRange: [100, 108],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 1,
    kit: 'studio',
    summary:
      'Moody minimal pop: kick on 1 and "&3", a lone halftime snare on 3 and hats that only speak on 1, "&1", 3 and "&3".',
    description:
      'The moody end of pop drops the backbeat entirely: one snare on 3, kicks on 1 and "&3", and hats that huddle around the downbeats. The silence on 2 is what makes it moody — the ear keeps waiting for a backbeat that never comes. This chassis carried a wave of minimal, hip-hop-adjacent pop from the early 2010s onward and still reads as effortlessly cool.',
    construction:
      'Layer 1: kick on 1 and "&3". Layer 2: one snare on 3 (halftime). Layer 3: hats on 1, "&1", 3 and "&3" only.',
    tracks: [
      { inst: 'kick', pat: 'X.........x.....', vol: 1 },
      { inst: 'snare', pat: '........X.......', vol: 0.9 },
      { inst: 'hatClosed', pat: 'x.x.....x.x.....', vol: 0.6 },
    ],
    roles: {
      kick: 'Downbeat plus the "&3" lean.',
      snare: 'The single halftime crack.',
      hatClosed: 'Huddled eighth pairs around 1 and 3.',
    },
    variations: [
      {
        name: 'Chance flick',
        note: 'Give the second hat pair a probabilistic tail for human drift.',
        overrides: { hatClosed: 'x.x.....x.x...p.' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice minimal halftime pop chassis — rhythm data only.',
    },
  },
  {
    id: 'xg-pop-sixteenth-drive',
    title: 'Sixteenth Drive',
    family: 'pop',
    genres: ['Pop', 'Pop Rock'],
    tags: ['driving', '16ths', 'anthem', 'upbeat'],
    difficulty: 'intermediate',
    bpm: 122,
    tempoRange: [116, 122],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 2,
    kit: 'tight',
    summary:
      'Driving pop-rock push: full 16th hats, kick on 1, 3 and "&4", square backbeats — momentum without clutter.',
    description:
      'The dependable way to make a pop chorus move is to simply never stop: 16th hats all bar, backbeats on 2 & 4, and a kick that plants 1 and 3 before pushing on "&4" toward the loop. The "&4" kick is the whole trick — it leans the bar forward so the repeat feels like acceleration. Bands have run this chassis since the AM-radio era; it has never once failed a chorus.',
    construction:
      'Layer 1: kick on 1, 3 and "&4". Layer 2: snare on 2 & 4. Layer 3: straight 16th hats.',
    tracks: [
      { inst: 'kick', pat: 'X.......x.....x.', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'xxxxxxxxxxxxxxxx', vol: 0.6 },
    ],
    roles: {
      kick: 'Anchors plus the "&4" forward lean.',
      snare: 'Square backbeats.',
      hatClosed: 'The 16th treadmill.',
    },
    variations: [
      {
        name: 'Fill tick',
        note: 'Roll the final hat into a 4-stroke ratchet as a mini-fill.',
        overrides: { hatClosed: 'xxxxxxxxxxxxxxx4' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice driving pop-rock drum engine — rhythm data only.',
    },
  },
  {
    id: 'xg-pop-throwback-rim',
    title: 'Throwback Rim & Tamb',
    family: 'pop',
    genres: ['Pop'],
    tags: ['throwback', 'rimshot', 'tambourine', 'retro'],
    difficulty: 'intermediate',
    bpm: 116,
    tempoRange: [110, 120],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 2,
    kit: 'studio',
    summary:
      'Retro-soul pop finish: rimshot backbeats, an 8th-note tambourine off to the right and quarter hats keeping it tidy.',
    description:
      'The throwback-pop recipe swaps the snare crack for a rimshot, parks a tambourine on the eighths in the right speaker, and lets the retro-soul flavor do the marketing. Kick on 1 & 3 and quarter hats keep the chassis restrained so the rim clicks like a 1965 session and the tambourine shimmers like a one-take vocal booth. It is production cosplay, and it works every single time.',
    construction:
      'Layer 1: kick on 1 & 3. Layer 2: rimshot on 2 & 4. Layer 3: quarter closed hats plus a panned eighth tambourine.',
    tracks: [
      { inst: 'kick', pat: 'X.......x.......', vol: 1 },
      { inst: 'rimshot', pat: '....X.......X...', vol: 0.7 },
      { inst: 'tambourine', pat: 'x.x.x.x.x.x.x.x.', vol: 0.7, pan: 0.2 },
      { inst: 'hatClosed', pat: 'X...X...X...X...', vol: 0.6 },
    ],
    roles: {
      kick: 'The tidy 1 & 3 floor.',
      rimshot: 'The retro backbeat click.',
      tambourine: 'The right-channel shimmer.',
      hatClosed: 'Quarter-note restraint.',
    },
    variations: [
      {
        name: 'Ghosted click',
        note: 'Add a rim ghost on beat 3 for a lazier, session-player feel.',
        overrides: { rimshot: '....X...o...X...' },
      },
    ],
    source: {
      type: 'reference',
      note: 'Common-practice throwback/retro-soul pop drum dressing — rhythm data only.',
    },
  },
  {
    id: 'xg-pop-chorus-build',
    title: 'Chorus Lift (Two-Bar)',
    family: 'pop',
    genres: ['Pop'],
    tags: ['chorus', 'build', 'two-bar', 'lift'],
    difficulty: 'intermediate',
    bpm: 120,
    tempoRange: [114, 122],
    ts: [4, 4],
    bars: 2,
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 2,
    kit: 'synth',
    summary:
      'A verse-to-chorus lift in one loop: bar one is the sparse stub, bar two opens the four-on-the-floor with a crash.',
    description:
      'Pop arrangements live on contrast, and this two-bar loop compresses the whole journey: bar one is the restrained verse stub (kick on 1 and "&3", claps, pedal hats), bar two kicks the door open with four-on-the-floor, running eighth hats and a crash on the downbeat. Loop it and the song breathes in and out on its own — the trick demo writers use to sell a chorus before the chorus exists.',
    construction:
      'Bar 1: kick on 1 and "&3", claps on 2 & 4, pedal-hat quarters. Bar 2: kick on all quarters, clap backbeats, running eighth hats and a crash on 1.',
    tracks: [
      { inst: 'kick', pat: 'X.........x.....|X...X...X...X...', vol: 1 },
      { inst: 'clap', pat: '....X.......X...|....X.......X...', vol: 0.85 },
      { inst: 'hatClosed', pat: 'X...X...X...X...|x.x.x.x.x.x.x.x.', vol: 0.6 },
      { inst: 'crash', pat: '................|X...............', vol: 0.5 },
    ],
    roles: {
      kick: 'Verse sparse, chorus square — the dynamic switch.',
      clap: 'Constant backbeat through both gears.',
      hatClosed: 'Quarters in the verse, running eighths in the chorus.',
      crash: 'The chorus door opening.',
    },
    variations: [
      {
        name: 'Double lift',
        note: 'Add an open-hat offbeat engine in bar two for maximum lift.',
        hint: 'Program open hats on the bar-two offbeats ("&1" through "&4").',
      },
    ],
    source: {
      type: 'original',
      note: 'Original two-bar verse/chorus contrast composite — rhythm data only.',
    },
  },
]
