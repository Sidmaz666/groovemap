/**
 * Groovemap — pack-modern: western-vocabulary extras (Motown, soul, Britpop,
 * shoegaze, grunge, post-punk, new wave, synth-pop, country, gospel, blues)
 * plus metal/punk extras (blast beats, d-beat, death, black, djent, metalcore, nu-metal).
 *
 * Authored pattern data in the compact authoring format (see types.ts):
 *   X accent · x normal · o ghost · 2/3/4 ratchet roll · p probabilistic · . rest
 *   one char per step, `|` between bars.
 */

import type { AuthorPattern } from '../types'

export const PACK_MODERN: AuthorPattern[] = [
  /* ================================================== Western extras (18) ==== */
  {
    id: 'motown-chuck',
    title: 'Motown — Backbeat Snap',
    family: 'rnb',
    genres: ['Motown', 'Soul'],
    tags: ['backbeat', 'tambourine', 'snap', '60s'],
    difficulty: 'beginner',
    bpm: 125,
    tempoRange: [110, 140],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 2,
    kit: 'studio',
    summary:
      'Classic Motown snap: kick on 1 and 3 with a ghost push on 4&, snare backbeats, and tambourine riding eighth notes.',
    description:
      'Benny Benjamin and Uriel Jones of the Funk Brothers house band defined the Motown drum sound at Hitsville U.S.A. The recipe is simple but instantly recognizable: a square kick on 1 and 3, a crisp backbeat on 2 and 4, and the tambourine — Motown’s trademark — doubling the eighths on top. A single ghost stroke on the “&” of 4 lifts the loop back to the downbeat without disturbing the pocket.',
    construction:
      'Kick states 1 and 3 with a ghost note on 4&; snare answers on 2 and 4; tambourine and closed hat split the eighth-note grid.',
    tracks: [
      { inst: 'kick', pat: 'X.......X.....o.', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'tambourine', pat: 'X.x.X.x.X.x.X.x.', vol: 0.6 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.4 },
    ],
    roles: {
      kick: 'Anchors 1 and 3, with a ghost on 4& to spring back to the top.',
      snare: 'Crisp backbeat on 2 and 4 — the snap of the style.',
      tambourine: 'Motown’s signature: even eighths with quarter-note accents.',
      hatClosed: 'Low-level eighth notes gluing the tambourine to the grid.',
    },
    source: {
      type: 'reference',
      note: 'Motown-era groove vocabulary of the Funk Brothers drummers (Benjamin, Jones) — rhythm data only.',
    },
  },
  {
    id: 'northern-soul-stomp',
    title: 'Northern Soul — Floor Stomp',
    family: 'rnb',
    genres: ['Northern Soul', 'R&B'],
    tags: ['four-on-floor', 'clap', 'dance', 'wigan'],
    difficulty: 'beginner',
    bpm: 135,
    tempoRange: [120, 150],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 0,
    dens: 2,
    kit: 'studio',
    summary:
      'Wigan-Casino-floor Northern Soul: relentless four-on-the-floor kick under heavy claps on 2 and 4.',
    description:
      'Northern Soul was all-nighter dance music — obscure American soul records played at breakneck tempo to packed English ballrooms. To keep hundreds of dancers locked in, the beat had to be utterly literal: kick on every quarter, claps cracking on 2 and 4, and open hats breathing on the off-beats. Nothing syncopates; the momentum comes purely from tempo and weight.',
    construction:
      'Layer 1: four-on-the-floor kick. Layer 2: heavy clap backbeats on 2 and 4. Layer 3: open-hat eighths and tambourine shimmer.',
    tracks: [
      { inst: 'kick', pat: 'X...X...X...X...', vol: 1 },
      { inst: 'clap', pat: '....X.......X...', vol: 1 },
      { inst: 'hatOpen', pat: 'x.x.x.x.x.x.x.x.', vol: 0.5 },
      { inst: 'tambourine', pat: 'x.x.x.x.x.x.x.x.', vol: 0.45 },
    ],
    roles: {
      kick: 'Four-on-the-floor pulse — the dance floor’s metronome.',
      clap: 'Heavy backbeat on 2 and 4, stacked with the snare’s job.',
      hatOpen: 'Off-beat eighths add breath and forward lean.',
      tambourine: 'Even eighths — the classic all-nighter percussion layer.',
    },
    source: {
      type: 'reference',
      note: 'Northern Soul club-stomper groove (Wigan Casino / Twisted Wheel era) — rhythm data only.',
    },
  },
  {
    id: 'philly-soul',
    title: 'Philly Soul — Bell Caravan',
    family: 'rnb',
    genres: ['Philadelphia Soul', 'Smooth Soul'],
    tags: ['four-on-floor', 'ride-bell', 'strings', 'tambourine'],
    difficulty: 'intermediate',
    bpm: 115,
    tempoRange: [100, 128],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 2,
    kit: 'studio',
    summary:
      'Philly International lushness: four-on-the-floor kick, disco-strings temperament, and a ride-bell line bobbing over the bar.',
    description:
      'The Sound of Philadelphia — Gamble & Huff’s MFSB machine — glided between soul and proto-disco. Earl Young’s kick stayed square on every quarter so the string section could soar, while the ride bell sketched a gentle syncopation (1, the “&” of 2, 3, the “&” of 4) that would soon power the disco era. Tambourine eighths keep the gospel-choir warmth of the arrangement grounded.',
    construction:
      'Kick marks every quarter for the strings; snare and tambourine carry 2 and 4; the ride bell outlines 1, 2&, 3 and 4&.',
    tracks: [
      { inst: 'kick', pat: 'X...X...X...X...', vol: 1 },
      { inst: 'ride', pat: 'X.....X.X.....X.', vol: 0.75 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.8 },
      { inst: 'tambourine', pat: 'x.x.x.x.x.x.x.x.', vol: 0.45 },
    ],
    roles: {
      kick: 'Four-on-the-floor bed beneath the string arrangements.',
      ride: 'Bell accents on 1, 2&, 3 and 4& — the proto-disco signature.',
      snare: 'Soft backbeat on 2 and 4 keeps the gospel-rooted lift.',
      tambourine: 'Eighth-note shimmer that fattens the backbeat.',
    },
    source: {
      type: 'reference',
      note: 'Philly International / MFSB house-band style (Earl Young lineage) — rhythm data only.',
    },
  },
  {
    id: 'southern-soul-shuffle',
    title: 'Southern Soul — Swamp Shuffle',
    family: 'blues',
    genres: ['Southern Soul', 'Memphis Blues'],
    tags: ['shuffle', 'swung', 'sparse', 'backbeat'],
    difficulty: 'beginner',
    bpm: 105,
    tempoRange: [90, 120],
    ts: [4, 4],
    sub: 2,
    feel: 'shuffled',
    swing: 0.2,
    sync: 1,
    dens: 1,
    kit: 'dusty',
    summary:
      'Lazy Southern shuffle: sparse kick, swung backbeat, and hats leaning into a mild 0.2 shuffle drag.',
    description:
      'From Muscle Shoals to Memphis backrooms, the Southern shuffle keeps its smile subtle — a gentle 0.2 swing on the eighths rather than a hard triplet lilt. The kick steps only on 1 and a soft 3, letting the snare’s swung backbeat and a loping hat do the talking. It is the feel behind a thousand horn-band soul sides and swamp-blues strolls.',
    construction:
      'Swung-eighth grid with 0.2 shuffle: kick pats 1 and a soft 3, snare cracks 2 and 4, hats mark the loping eighths.',
    tracks: [
      { inst: 'kick', pat: 'X...x...', vol: 1 },
      { inst: 'snare', pat: '..X...X.', vol: 0.85 },
      { inst: 'hatClosed', pat: 'X.x.X.x.', vol: 0.5 },
    ],
    roles: {
      kick: 'Sparse 1 and soft 3 — room for the horns to breathe.',
      snare: 'Swung backbeat on 2 and 4 carries the drag.',
      hatClosed: 'Eighth-note lilt with quarter accents defines the shuffle.',
    },
    source: {
      type: 'traditional',
      note: 'Southern soul-blues shuffle vocabulary (Muscle Shoals / Memphis studio tradition).',
    },
  },
  {
    id: 'memphis-soul',
    title: 'Memphis Soul — Iceberg Pocket',
    family: 'rnb',
    genres: ['Memphis Soul', 'Stax'],
    tags: ['pocket', 'lean', 'iceberg', 'tight'],
    difficulty: 'intermediate',
    bpm: 104,
    tempoRange: [90, 118],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 1,
    kit: 'tight',
    summary:
      'Stax-school iceberg groove: nine-tenths hidden — a lean kick, dry backbeat, and tambourine over deep, unplayed space.',
    description:
      'Al Jackson Jr. played less than anyone and swung harder than everyone: the Stax pocket works like an iceberg, most of its weight invisible. The kick lands only on 1 and 3, the snare stays dry and behind the beat, and the space between notes is the actual instrument. Tambourine eighths — the Hi and Stax trademark — float on top without ever filling the hole the band leaves open.',
    construction:
      'Kick on 1 and 3 only; dry snare on 2 and 4; tambourine eighths with quarter accents float over deliberately empty space.',
    tracks: [
      { inst: 'kick', pat: 'X.......X.......', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.85 },
      { inst: 'tambourine', pat: 'x.x.x.x.x.x.x.x.', vol: 0.45 },
      { inst: 'hatClosed', pat: 'x...x...x...x...', vol: 0.35 },
    ],
    roles: {
      kick: 'Only 1 and 3 — the iceberg keeps its mass below the waterline.',
      snare: 'Dry, slightly laid-back backbeat; the crack defines the pocket.',
      tambourine: 'Even eighths supply motion without filling the space.',
      hatClosed: 'Quarter-note tick, low and unobtrusive.',
    },
    source: {
      type: 'reference',
      note: 'Stax / Hi Records Memphis-soul pocket in the spirit of Al Jackson Jr. — rhythm data only.',
    },
  },
  {
    id: 'britpop',
    title: 'Britpop — Ride & Row',
    family: 'rock',
    genres: ['Britpop', 'UK Indie'],
    tags: ['ride', 'backbeat', 'swagger', '90s'],
    difficulty: 'beginner',
    bpm: 130,
    tempoRange: [112, 145],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 0,
    dens: 1,
    kit: 'studio',
    summary:
      'Britpop swagger: confident eighth-note ride, steady backbeat, and a no-nonsense kick on 1 and 3.',
    description:
      'The mid-90s UK sound — Oasis, Blur, Cast — leaned on a drum style of almost aggressive simplicity: a big ride cymbal fanning eighths, a fat backbeat on 2 and 4, and a kick that plants itself on 1 and 3 like a flag. The attitude is “lads at the pub singing along,” so nothing syncopates and every accent is unashamed. Crash on the downbeat and sing louder.',
    construction:
      'Ride plays accented eighths; snare cracks 2 and 4; kick plants 1 and 3 with no decoration.',
    tracks: [
      { inst: 'ride', pat: 'X.x.X.x.X.x.X.x.', vol: 0.7 },
      { inst: 'kick', pat: 'X.......X.......', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.95 },
    ],
    roles: {
      ride: 'Eighth-note engine with quarter accents — the anthem shimmer.',
      kick: 'Square 1 and 3; zero syncopation, all swagger.',
      snare: 'Wide-open backbeat on 2 and 4 for the terrace singalong.',
    },
    source: {
      type: 'reference',
      note: 'Britpop-era drumming (Oasis/Blur school) — rhythm data only.',
    },
  },
  {
    id: 'shoegaze-wall',
    title: 'Shoegaze — Wall of Wash',
    family: 'rock',
    genres: ['Shoegaze', 'Dream Pop'],
    tags: ['16th-hats', 'wash', 'sparse-kick', 'blur'],
    difficulty: 'beginner',
    bpm: 120,
    tempoRange: [100, 135],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 0,
    dens: 2,
    kit: 'studio',
    summary:
      'Shoegaze haze: a continuous sixteenth-note hat wash blurring the bar while a sparse kick and soft snare hold the floor.',
    description:
      'Shoegaze drums are less a beat than a weather system. The hats run all sixteenths — deliberately unaccented, half-lost in reverb — so the guitar wall and the cymbals smear into one texture. Underneath, the kick touches 1 and a soft 3 and the snare whispers 2 and 4, just enough skeleton for the swirl to hang on. The blur is the point.',
    construction:
      'Hats churn nonstop sixteenths with quarter accents; kick touches 1 and a soft 3; snare ghosts the backbeat under a downbeat crash.',
    tracks: [
      { inst: 'hatClosed', pat: 'XxxXXxxXXxxXXxxx', vol: 0.45 },
      { inst: 'kick', pat: 'X.......x.......', vol: 0.9 },
      { inst: 'snare', pat: '....x.......x...', vol: 0.6 },
      { inst: 'crash', pat: 'X...............', vol: 0.7 },
    ],
    roles: {
      hatClosed: 'Continuous sixteenth wash — the “wall” itself.',
      kick: 'Sparse 1 and soft 3; presence without definition.',
      snare: 'Ghosted backbeat, half-dissolved in the wash.',
      crash: 'Downbeat bloom that melts into the texture.',
    },
    source: {
      type: 'reference',
      note: 'Shoegaze texture drumming (My Bloody Valentine / Ride school) — rhythm data only.',
    },
  },
  {
    id: 'grunge-stop',
    title: 'Grunge — Stop-Time Slam',
    family: 'rock',
    genres: ['Grunge', 'Seattle Sound'],
    tags: ['stop-time', 'fill', 'heavy', '90s'],
    difficulty: 'intermediate',
    bpm: 112,
    tempoRange: [95, 130],
    ts: [4, 4],
    bars: 2,
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'studio',
    summary:
      'Two-bar grunge statement: stop-time unison hits on 1, 2, 3 and 3&, one bar of silence, then a heavy fill that slams back in.',
    description:
      'Seattle-era songcraft loved the stop-time riff: the band stabs together on 1, 2, 3 and the “&” of 3, then beat 4 hangs in dead air. The drummer’s job is tension — leave the space truly empty, no ride, no fill — then detonate the second bar with a descending fill that launches the riff home. It is dynamics as arrangement: loud, silent, louder.',
    construction:
      'Bar 1: unison kick+snare stops on 1, 2, 3 and 3&, then nothing. Bar 2: downbeat slam, backbeat, and a sixteenth tom-and-snare fill into the repeat.',
    tracks: [
      { inst: 'kick', pat: 'X...X...X.X.....|X...............', vol: 1 },
      { inst: 'snare', pat: '....X...X.X.....|....X...x.x.xxxx', vol: 0.95 },
      { inst: 'tomMid', pat: '................|..........x.x.x.', vol: 0.8 },
      { inst: 'crash', pat: 'X...............|................', vol: 0.85 },
    ],
    roles: {
      kick: 'Stop-time unison hits, then anchors bar 2’s downbeat.',
      snare: 'Cracks the stops with the kick, then drives the fill.',
      tomMid: 'Descending fill steps on 3& and 4 of bar 2.',
      crash: 'Blooms on each downbeat and stays silent elsewhere.',
    },
    source: {
      type: 'reference',
      note: 'Grunge stop-time riff drumming, Seattle early-90s vocabulary — rhythm data only.',
    },
  },
  {
    id: 'post-punk-motorik',
    title: 'Post-Punk — Motorik March',
    family: 'rock',
    genres: ['Post-Punk', 'Krautrock-influenced'],
    tags: ['motorik', 'eighth-kick', 'ride', 'hypnotic'],
    difficulty: 'intermediate',
    bpm: 145,
    tempoRange: [128, 160],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 3,
    kit: 'tight',
    summary:
      'Motorik-driven post-punk: accented eighth-note kick, square backbeat, and an unblinking eighth ride at 145.',
    description:
      'Bands from Neu! to Joy Division’s heirs ran the drum kit like a machine: the kick pulses every eighth with accents on the quarters, the snare refuses to deviate from 2 and 4, and the ride ticks eighths with metronomic indifference. Nothing fills, nothing varies — repetition becomes hypnotic propulsion. The tight kit keeps every stroke dry and forward.',
    construction:
      'Kick plays all eighths accented on the quarters; snare holds 2 and 4; ride runs unaccented eighths beneath.',
    tracks: [
      { inst: 'kick', pat: 'X.x.X.x.X.x.X.x.', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'ride', pat: 'x.x.x.x.x.x.x.x.', vol: 0.55 },
    ],
    roles: {
      kick: 'Eighth-note motorik pulse, accented on the downbeats.',
      snare: 'Immovable backbeat on 2 and 4.',
      ride: 'Cold eighth-note tick keeping the hypnosis level.',
    },
    source: {
      type: 'reference',
      note: 'Post-punk motorik drive (Neu!-influenced UK school) — rhythm data only.',
    },
  },
  {
    id: 'new-wave',
    title: 'New Wave — Choppy Drive',
    family: 'pop',
    genres: ['New Wave', '80s Pop'],
    tags: ['choppy', 'open-hat', 'stabs', '80s'],
    difficulty: 'beginner',
    bpm: 140,
    tempoRange: [120, 155],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 2,
    kit: 'studio',
    summary:
      'New-wave nervous energy: open-hat stabs on the off-beat eighths against a square kick and backbeat.',
    description:
      'The Cars-to-Talking-Headsthe-school of new wave made the hi-hat talk in short, choked syllables: open stabs on every off-beat eighth, clamped shut immediately, giving the groove its choppy, nervous flicker. The kick and snare stay square beneath, so the tune can be danceable and twitchy at once. Tight, bright, and impatient — perfect for a chorus that arrives early.',
    construction:
      'Open hats chop the off-beat eighths; closed hats answer on the downbeats; kick on 1 and 3, snare on 2 and 4.',
    tracks: [
      { inst: 'hatOpen', pat: '..x...x...x...x.', vol: 0.6 },
      { inst: 'hatClosed', pat: 'X...X...X...X...', vol: 0.5 },
      { inst: 'kick', pat: 'X.......X.......', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
    ],
    roles: {
      hatOpen: 'Choked off-beat stabs — the nervous flick of the style.',
      hatClosed: 'Downbeat closures that reset the chop.',
      kick: 'Square 1 and 3 pulse for the dance floor.',
      snare: 'Backbeat 2 and 4, bright and forward.',
    },
    source: {
      type: 'reference',
      note: 'New-wave choppy-hat vocabulary (late-70s/80s) — rhythm data only.',
    },
  },
  {
    id: 'synthpop-gated',
    title: 'Synth-Pop — Gated Thunder',
    family: 'pop',
    genres: ['Synth-Pop', '80s'],
    tags: ['gated-snare', '808-kick', 'machine', '80s'],
    difficulty: 'beginner',
    bpm: 118,
    tempoRange: [100, 132],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 0,
    dens: 1,
    kit: 'analog808',
    summary:
      'Eighties synth-pop canon: massive gated-reverb snare on 2 and 4 over a dry 808 kick on 1 and 3.',
    description:
      'When LinnDrums met cavernous reverb gates, the 80s drum sound was born: a snare that thunders and dies instantly, hovering over a kick so dry and round it could only be an 808. The rhythm itself is childlike — kick on 1 and 3, snare on 2 and 4, hats ticking eighths — because the drama lives entirely in the production. restraint plus echo equals anthem.',
    construction:
      '808 kick stamps 1 and 3; gated snare detonates on 2 and 4; machine-even hats tick the eighths.',
    tracks: [
      { inst: 'kick', pat: 'X.......X.......', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 1 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.45 },
    ],
    roles: {
      kick: 'Dry, round 808 thump on 1 and 3.',
      snare: 'Gated-reverb cannon on 2 and 4 — the decade’s fingerprint.',
      hatClosed: 'Metronomic eighths, mixed low under the reverb.',
    },
    source: {
      type: 'reference',
      note: '80s synth-pop Linn/808 drum-machine vocabulary — rhythm data only.',
    },
  },
  {
    id: 'country-train',
    title: 'Country — Train Beat Chug',
    family: 'country',
    genres: ['Country', 'Bluegrass-inflected'],
    tags: ['train-beat', 'ghosts', 'rimshot', 'chug'],
    difficulty: 'intermediate',
    bpm: 170,
    tempoRange: [150, 190],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 2,
    kit: 'studio',
    summary:
      'The freight-train chug: accented snare and rimshot ghosting eighth notes while the kick puffs on 1 and 3.',
    description:
      'The train beat mimics a locomotive at full steam: every eighth note sounds — ghosts between the accents — so the snare and rimshot together become the wheels on the rail. Accents land square on the quarters like the whistle’s pulse, while the kick puffs softly on 1 and 3. Played right, it gallops at 170 without ever leaving the pocket.',
    construction:
      'Snare accents all four quarters with ghost eighths between; rimshot layers the same chug softer; kick pats 1 and a low 3.',
    tracks: [
      { inst: 'snare', pat: 'X.o.X.o.X.o.X.o.', vol: 0.9 },
      { inst: 'rimshot', pat: 'o.o.o.o.o.o.o.o.', vol: 0.5 },
      { inst: 'kick', pat: 'X.......x.......', vol: 0.95 },
    ],
    roles: {
      snare: 'Quarter accents with ghost eighths — the driving wheels.',
      rimshot: 'Woody undertone doubling the chug an octave of timbre down.',
      kick: 'Soft 1 and 3 puffs, like the engine breathing.',
    },
    source: {
      type: 'traditional',
      note: 'Traditional country train-beat vocabulary (Johnny Cash / Buddy Harman lineage).',
    },
  },
  {
    id: 'bluegrass-roll',
    title: 'Bluegrass — Banjo Roll Bounce',
    family: 'country',
    genres: ['Bluegrass', 'New Acoustic'],
    tags: ['shaker', 'banjo-roll', 'sparse', 'acoustic'],
    difficulty: 'beginner',
    bpm: 160,
    tempoRange: [140, 180],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 0,
    dens: 1,
    kit: 'studio',
    summary:
      'Bluegrass lift: a shaker tracing the banjo roll’s eighths over a kick that only nods on 1 and 3.',
    description:
      'Bluegrass drummers survive by subtraction — the banjo roll is already the subdivision. The kit’s job is to bounce the roll’s eighth-note grid with a light shaker, drop a respectful kick on 1 and 3, and whisper a backbeat behind the mandolin chop. Anything louder and the fiddle leaves. Keep it rolling and out of the way.',
    construction:
      'Shaker carries even eighths like a banjo roll; kick plants 1 and 3; a ghost-soft snare shadows 2 and 4.',
    tracks: [
      { inst: 'shaker', pat: 'x.x.x.x.x.x.x.x.', vol: 0.55 },
      { inst: 'kick', pat: 'X.......X.......', vol: 0.9 },
      { inst: 'snare', pat: '....x.......x...', vol: 0.45 },
    ],
    roles: {
      shaker: 'Even eighths echoing the banjo roll’s perpetual motion.',
      kick: 'Two honest beats on 1 and 3 — the bass fiddle’s shadow.',
      snare: 'Ghost backbeat tucked behind the mandolin chop.',
    },
    source: {
      type: 'traditional',
      note: 'Bluegrass-band drumming convention (sparse contemporary acoustic style).',
    },
  },
  {
    id: 'western-swing',
    title: 'Western Swing — Flat-Town Drag',
    family: 'country',
    genres: ['Western Swing', 'Honky-Tonk'],
    tags: ['swung', 'four-on-floor', 'ride', 'bob-wills'],
    difficulty: 'intermediate',
    bpm: 180,
    tempoRange: [160, 200],
    ts: [4, 4],
    sub: 2,
    feel: 'swung',
    swing: 0.25,
    sync: 1,
    dens: 1,
    kit: 'studio',
    summary:
      'Western swing at a gallop: quarter-note kick four to the bar, swung backbeat, and a ride leaning 0.25 into the drag.',
    description:
      'Bob Wills’s western swing married jazz swing to country two-step, and the drums made the deal: a rolling four-to-the-bar kick like a tuba, a snare snapping 2 and 4, and a ride whose eighths drag a mild 0.25 swing. At 180 it feels like a freight train doing a waltz — propulsive, cheerful, and slightly tilted.',
    construction:
      'Kick stamps all four quarters; snare pops 2 and 4; ride swings eighths at 0.25 over the eighth-note grid.',
    tracks: [
      { inst: 'kick', pat: 'X.X.X.X.', vol: 1 },
      { inst: 'snare', pat: '..X...X.', vol: 0.85 },
      { inst: 'ride', pat: 'X.x.X.x.', vol: 0.6 },
    ],
    roles: {
      kick: 'Four-to-the-bar tuba roll keeps the dance floor two-stepping.',
      snare: 'Swung backbeat on 2 and 4.',
      ride: 'Mild 0.25 drag on the eighths — the tilt in the grin.',
    },
    source: {
      type: 'traditional',
      note: 'Western-swing rhythm tradition (Bob Wills / Texas Playboys school).',
    },
  },
  {
    id: 'gospel-praise-break',
    title: 'Gospel — Praise Break Shout',
    family: 'gospel',
    genres: ['Gospel', 'Praise Break'],
    tags: ['shout', 'fast', 'tambourine', 'syncopated'],
    difficulty: 'advanced',
    bpm: 175,
    tempoRange: [160, 190],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 3,
    kit: 'studio',
    summary:
      'Fast praise-break shout: syncopated kick stabs, backbeat with a drag ghost, and tambourine and ride fanning the fire.',
    description:
      'When the spirit hits, the band jumps into the shout — a fast, heavily syncopated vamp where the kick answers the organ’s calls on the off-beats (1, the “a” of 1, the “&” of 2, 3) and a ghost snare drags into every backbeat. Tambourine and ride keep the eighth-note fire roaring over the top. Maximum syncopation, maximum joy, zero restraint.',
    construction:
      'Kick stabs 1, 1a, 2&, 3 and 4&; snare cracks 2 and 4 with a 4& ghost; ride and tambourine churn eighths over a quarter pedal hat.',
    tracks: [
      { inst: 'kick', pat: 'X..x..X.X.....x.', vol: 1 },
      { inst: 'snare', pat: '....X.......X..o', vol: 0.9 },
      { inst: 'ride', pat: 'x.x.x.x.x.x.x.x.', vol: 0.6 },
      { inst: 'tambourine', pat: 'x.x.x.x.x.x.x.x.', vol: 0.5 },
      { inst: 'hatPedal', pat: 'x...x...x...x...', vol: 0.45 },
    ],
    roles: {
      kick: 'Syncopated shout stabs answering the organ.',
      snare: 'Backbeat with a 4& ghost drag into the loop.',
      ride: 'Eighth-note fire under the shout.',
      tambourine: 'Church-wagon eighths lifting the energy.',
      hatPedal: 'Quarter-note chick keeping the fast grid honest.',
    },
    source: {
      type: 'traditional',
      note: 'Black church praise-break / shout music tradition.',
    },
  },
  {
    id: 'gospel-shuffle',
    title: 'Gospel — Sunday Slow Shuffle',
    family: 'gospel',
    genres: ['Gospel', 'Traditional'],
    tags: ['shuffle', 'slow', 'ride', 'triplet'],
    difficulty: 'intermediate',
    bpm: 80,
    tempoRange: [68, 92],
    ts: [4, 4],
    sub: 3,
    feel: 'shuffled',
    sync: 0,
    dens: 1,
    kit: 'studio',
    summary:
      'Slow Sunday shuffle: triplet-grid ride lilting through a skipped shuffle, kick on 1 and 3, backbeat warm and wide.',
    description:
      'The slow gospel shuffle sways like the congregation: on a triplet grid the ride plays the skipped shuffle — downbeat plus third triplet — so every beat rocks forward. The kick steps square on 1 and 3, the pedal hat ticks the quarters, and the snare leans on 2 and 4 with all the warmth of the choir behind it. Patience is the technique.',
    construction:
      'Triplet grid: ride plays the skipped shuffle (1 and 3rd triplet per beat); kick on 1 and 3; pedal hat quarters; snare on 2 and 4.',
    tracks: [
      { inst: 'ride', pat: 'X.xX.xX.xX.x', vol: 0.7 },
      { inst: 'kick', pat: 'X.....X.....', vol: 1 },
      { inst: 'snare', pat: '...X.....X..', vol: 0.85 },
      { inst: 'hatPedal', pat: 'X..X..X..X..', vol: 0.45 },
    ],
    roles: {
      ride: 'Skipped-triplet shuffle — the sway of the groove.',
      kick: 'Square 1 and 3 under the sway.',
      snare: 'Warm backbeat on 2 and 4.',
      hatPedal: 'Quarter-note chick anchoring the triplet grid.',
    },
    source: {
      type: 'traditional',
      note: 'Traditional gospel slow-shuffle Sunday-service feel.',
    },
  },
  {
    id: 'texas-shuffle',
    title: 'Texas Shuffle — Double Down',
    family: 'blues',
    genres: ['Texas Blues', 'Electric Blues'],
    tags: ['double-shuffle', 'ride', 'triplet', 'sr-v'],
    difficulty: 'advanced',
    bpm: 120,
    tempoRange: [104, 136],
    ts: [4, 4],
    sub: 3,
    feel: 'shuffled',
    sync: 1,
    dens: 2,
    kit: 'studio',
    summary:
      'The double shuffle: kick doubling the ride’s skipped-triplet line while the snare keeps 2 and 4 — the full Texas freight train.',
    description:
      'The Texas shuffle — think Stevie Ray Vaughan’s rhythm section — stacks the shuffle twice: the ride sketches the skipped-triplet line while the kick quietly doubles the exact same figure an octave of timbre below. With the pedal hat chicking quarters and the snare on 2 and 4, the groove becomes a freight train: every swung eighth accounted for twice, propelling the lead guitar’s boogie.',
    construction:
      'Ride states the skipped shuffle; kick doubles it softly on the same triplet line; snare 2 and 4; pedal hat quarters.',
    tracks: [
      { inst: 'ride', pat: 'X.xX.xX.xX.x', vol: 0.8 },
      { inst: 'kick', pat: 'X.xX.xX.xX.x', vol: 0.65 },
      { inst: 'snare', pat: '...X.....X..', vol: 0.85 },
      { inst: 'hatPedal', pat: 'X..X..X..X..', vol: 0.4 },
    ],
    roles: {
      ride: 'Skipped-triplet shuffle line — the train’s rhythm rail.',
      kick: 'Doubles the ride figure softly — the “double” in double shuffle.',
      snare: 'Backbeat on 2 and 4.',
      hatPedal: 'Quarter chick gluing the triplet grid.',
    },
    source: {
      type: 'reference',
      note: 'Texas blues double-shuffle in the SRV/Double Trouble tradition — rhythm data only.',
    },
  },
  {
    id: 'slow-12-8-blues',
    title: 'Slow Blues — 12/8 Sigh',
    family: 'blues',
    genres: ['Slow Blues', 'Chicago Blues'],
    tags: ['12-8', 'triplet', 'ballad', 'slow'],
    difficulty: 'beginner',
    bpm: 60,
    tempoRange: [50, 72],
    ts: [4, 4],
    sub: 3,
    feel: 'triplet',
    sync: 0,
    dens: 1,
    kit: 'studio',
    summary:
      'Slow-blues 12/8 lilt: triplet ride sighing through the bar, kick breathing on 1 and 3, backbeat soft as midnight.',
    description:
      'Notated as 12/8 but felt as four triplet-lit beats, the slow blues breathes in twelves: the ride rocks a skipped shuffle through each triplet group while the hats pedal the quarters and the snare sighs on 2 and 4. At 60 bpm every note has room to bend, and the kick’s soft touch on 1 and 3 keeps the pulse as patient as the soloist’s longest bend.',
    construction:
      'Triplet grid at sub 3: ride plays the skipped shuffle per beat; kick touches 1 and a soft 3; snare 2 and 4; pedal hat quarters.',
    tracks: [
      { inst: 'ride', pat: 'X.xX.xX.xX.x', vol: 0.7 },
      { inst: 'kick', pat: 'X.....x.....', vol: 0.95 },
      { inst: 'snare', pat: '...X.....X..', vol: 0.8 },
      { inst: 'hatPedal', pat: 'X..X..X..X..', vol: 0.45 },
    ],
    roles: {
      ride: 'Skipped triplet line — the 12/8 lilt in quarter-note clothing.',
      kick: 'Breathing pulse on 1 and a soft 3.',
      snare: 'Soft backbeat sigh on 2 and 4.',
      hatPedal: 'Quarter-note tick pacing the slow sway.',
    },
    source: {
      type: 'traditional',
      note: 'Slow 12/8 blues tradition (Chicago ballad-blues school).',
    },
  },

  /* ================================================== Metal/punk extras (9) == */
  {
    id: 'blast-beat-core',
    title: 'Blast Beat — Alternating Core',
    family: 'metal',
    genres: ['Death Metal', 'Grindcore'],
    tags: ['blast', 'alternating', '16ths', 'extreme'],
    difficulty: 'advanced',
    bpm: 180,
    tempoRange: [160, 210],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 3,
    kit: 'tight',
    summary:
      'The canonical alternating blast: kick and snare trade sixteenths in a continuous 180 bpm machine-gun roll.',
    description:
      'The alternating blast beat is extreme metal’s engine of chaos: the kick and snare interlock on alternating sixteenth notes — kick on the downbeats, snare on the upbeats — producing a single relentless stream of hits. A crash on beat 1 marks the top of the phrase before the roll swallows the bar. Endurance, not speed alone, is the technique: every stroke even, every accent mechanical.',
    construction:
      'Kick plays X.x. sixteenths, snare answers x.X. — a locked alternating roll — under a downbeat crash.',
    tracks: [
      { inst: 'kick', pat: 'X.x.X.x.X.x.X.x.', vol: 1 },
      { inst: 'snare', pat: 'x.X.x.X.x.X.x.X.', vol: 0.95 },
      { inst: 'crash', pat: 'X...............', vol: 0.85 },
    ],
    roles: {
      kick: 'Sixteenths on the downbeat side of the alternating blast.',
      snare: 'Sixteenths on the upbeat side, completing the roll.',
      crash: 'Phrase marker on 1 before the blast swallows the bar.',
    },
    source: {
      type: 'reference',
      note: 'Canonical alternating blast-beat vocabulary (Napalm Death / death-metal school) — rhythm data only.',
    },
  },
  {
    id: 'double-bass-gallop',
    title: 'Double Bass — Iron Gallop',
    family: 'metal',
    genres: ['NWOBHM', 'Power Metal'],
    tags: ['gallop', 'double-kick', 'riding', 'maiden'],
    difficulty: 'advanced',
    bpm: 180,
    tempoRange: [160, 200],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 3,
    kit: 'tight',
    summary:
      'The iron gallop: kick figures of one eighth plus two sixteens charging through every beat, snare square on 2 and 4.',
    description:
      'The gallop is heavy metal’s horse: within each beat the kick plays a long eighth followed by two short sixteenths — dum-da-da — four times per bar, evoking cavalry at full charge. Iron Maiden’s rhythm section made it the genre’s signature locomotion. The snare stays square on 2 and 4 so the horse always knows where the road is, and a crash crowns the downbeat.',
    construction:
      'Kick repeats the X.xx gallop cell on all four beats; snare cracks 2 and 4; crash marks the bar.',
    tracks: [
      { inst: 'kick', pat: 'X.xxX.xxX.xxX.xx', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.95 },
      { inst: 'crash', pat: 'X...............', vol: 0.8 },
    ],
    roles: {
      kick: 'Gallop cells (eighth + two sixteenths) driving every beat.',
      snare: 'Square backbeat on 2 and 4.',
      crash: 'Downbeat banner for each galloping bar.',
    },
    source: {
      type: 'reference',
      note: 'NWOBHM gallop tradition (Iron Maiden school) — rhythm data only.',
    },
  },
  {
    id: 'd-beat-raw',
    title: 'D-Beat — Raw Discharge',
    family: 'punk',
    genres: ['D-Beat', 'Hardcore Punk'],
    tags: ['d-beat', 'raw', 'crusty', 'offset'],
    difficulty: 'intermediate',
    bpm: 190,
    tempoRange: [170, 210],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 3,
    kit: 'dusty',
    summary:
      'Raw Discharge-style d-beat: the kick’s stuttering X..X..X. engine under a snare offset onto the off-beat eighths.',
    description:
      'The d-beat — named after Discharge — is hardcore’s most imitated stencil: the kick hammers a stuttering X..X..X. figure twice per bar while the snare sits offset on the off-beat eighths, giving the beat its lurching, head-down swagger. Played raw and slightly overdriven, precision matters less than momentum: it should sound like a wall falling forward at 190 bpm.',
    construction:
      'Kick repeats the X..X..X. d-figure through the bar; snare offsets to the off-beat eighths; crash opens the assault.',
    tracks: [
      { inst: 'kick', pat: 'X..X..X.X..X..X.', vol: 1 },
      { inst: 'snare', pat: '..X...X...X...X.', vol: 0.9 },
      { inst: 'crash', pat: 'X...............', vol: 0.8 },
    ],
    roles: {
      kick: 'The stuttering “D” figure — the beat’s namesake engine.',
      snare: 'Offset off-beat eighths creating the lurch.',
      crash: 'Raw downbeat wash to open the assault.',
    },
    source: {
      type: 'reference',
      note: 'D-beat stencil popularized by Discharge — rhythm data only.',
    },
  },
  {
    id: 'thrash-punk-bridge',
    title: 'Thrash Punk — Sixteenth Sprint',
    family: 'punk',
    genres: ['Thrashcore', 'Hardcore Punk'],
    tags: ['16th-kick', 'sprint', 'fast', 'bridge'],
    difficulty: 'advanced',
    bpm: 200,
    tempoRange: [180, 220],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 3,
    kit: 'tight',
    summary:
      'All-out thrash sprint: sixteenth-note kick hammering every step while the snare pins 2 and 4 at 200 bpm.',
    description:
      'When a hardcore song hits its bridge, the kick stops negotiating: all sixteen sixteenth notes per bar, hammered evenly, while the snare holds the only fixed points left — 2 and 4. At 200 bpm this is less a groove than controlled collapse, the drum equivalent of a mosh pit’s forward surge. Keep the strokes even and let the crash on 1 reset the riot.',
    construction:
      'Kick runs all sixteenths at an even level; snare cracks 2 and 4; crash marks the downbeat.',
    tracks: [
      { inst: 'kick', pat: 'xxxxxxxxxxxxxxxx', vol: 0.9 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.95 },
      { inst: 'crash', pat: 'X...............', vol: 0.8 },
    ],
    roles: {
      kick: 'Continuous sixteenth sprint — the bridge’s forward surge.',
      snare: 'The only fixed landmarks: 2 and 4.',
      crash: 'Downbeat riot-reset.',
    },
    source: {
      type: 'reference',
      note: 'Thrash/hardcore bridge-section vocabulary — rhythm data only.',
    },
  },
  {
    id: 'death-double-kick',
    title: 'Death Metal — Constant Double',
    family: 'metal',
    genres: ['Death Metal', 'Technical Death'],
    tags: ['double-kick', '16ths', 'cymbal-accents', 'constant'],
    difficulty: 'advanced',
    bpm: 190,
    tempoRange: [170, 210],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 3,
    kit: 'tight',
    summary:
      'Constant double-kick wall: sixteen sixteenth-note kicks per bar with crash accents carving the quarters.',
    description:
      'Death metal’s modern foundation is the constant double-kick wall: both feet lock into unbroken sixteenth notes, a machine-gun carpet under the riff. Cymbal crashes on the quarters slice audible landmarks into the blur, and a low ghosted snare on 2 and 4 keeps a skeleton of the old backbeat alive. The effect is tectonic — a floor that never stops moving.',
    construction:
      'Kick sustains all sixteen sixteenths (accent on 1); crashes accent every quarter; soft snare ghosts 2 and 4.',
    tracks: [
      { inst: 'kick', pat: 'Xxxxxxxxxxxxxxxx', vol: 1 },
      { inst: 'crash', pat: 'X...X...X...X...', vol: 0.75 },
      { inst: 'snare', pat: '....x.......x...', vol: 0.6 },
    ],
    roles: {
      kick: 'Unbroken sixteenth wall — the tectonic floor.',
      crash: 'Quarter-note accents carving landmarks into the blur.',
      snare: 'Ghosted 2 and 4, a skeleton of the backbeat.',
    },
    source: {
      type: 'reference',
      note: 'Death-metal constant double-kick vocabulary — rhythm data only.',
    },
  },
  {
    id: 'black-tremor',
    title: 'Black Metal — Tremor Blast',
    family: 'metal',
    genres: ['Black Metal', 'Atmospheric Black'],
    tags: ['blast', 'tremolo', 'splash', 'frozen'],
    difficulty: 'advanced',
    bpm: 200,
    tempoRange: [180, 220],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 3,
    kit: 'tight',
    summary:
      'Frozen black-metal tremor: alternating blast core under splash accents and a cold eighth-note ride shimmer.',
    description:
      'Black metal’s drums are a blizzard: the alternating blast — kick and snare trading sixteenths — spins beneath tremolo-picked guitars while splash cymbals puncture the wall every two beats like gusts of wind. A low, cold ride shimmers through the middle of the texture, more atmosphere than rhythm. Played at 200 it should feel less played than weathered.',
    construction:
      'Kick and snare interlock the alternating blast; splash accents land on 1 and 3; ride shimmers eighths underneath.',
    tracks: [
      { inst: 'kick', pat: 'X.x.X.x.X.x.X.x.', vol: 1 },
      { inst: 'snare', pat: 'x.X.x.X.x.X.x.X.', vol: 0.9 },
      { inst: 'splash', pat: 'X.......X.......', vol: 0.7 },
      { inst: 'ride', pat: 'x.x.x.x.x.x.x.x.', vol: 0.4 },
    ],
    roles: {
      kick: 'Downbeat side of the alternating blast blizzard.',
      snare: 'Upbeat side of the blast, raw and even.',
      splash: 'Gusting accents on 1 and 3 piercing the tremolo.',
      ride: 'Cold eighth shimmer — atmosphere over assertion.',
    },
    source: {
      type: 'reference',
      note: 'Black-metal blast/tremolo drumming vocabulary — rhythm data only.',
    },
  },
  {
    id: 'djent-poly',
    title: 'Djent — Poly Stabs',
    family: 'metal',
    genres: ['Djent', 'Progressive Metal'],
    tags: ['syncopated', 'tom-low', 'polymetric', 'stabs'],
    difficulty: 'advanced',
    bpm: 140,
    tempoRange: [120, 160],
    ts: [4, 4],
    sub: 4,
    feel: 'broken',
    sync: 3,
    dens: 2,
    kit: 'tight',
    summary:
      'Djent punctuation: syncopated kick stabs across the bar, a lone snare on 3, and low-tom accents thudding like palm-muted riffs.',
    description:
      'Djent drumming accompanies riff math: the kick lands on 1, the “e” of 1, 3, the “&” of 3 and the “e” of 4, mirroring the guitar’s palm-muted stabs, while the snare abandons the backbeat for a single crack on 3. Low-tom accents thud the pattern’s corners like a second, deeper guitar. The grid feels broken on purpose — syncopation 3, all tension, resolve deferred.',
    construction:
      'Kick stabs 1, 1e, 3, 3& and 4e; snare cracks only on 3; tomLow accents 1 and 4; hats tick a low quarter pulse.',
    tracks: [
      { inst: 'kick', pat: 'X.X.....X.X..X..', vol: 1 },
      { inst: 'snare', pat: '........X.......', vol: 0.9 },
      { inst: 'tomLow', pat: 'X...........X...', vol: 0.85 },
      { inst: 'hatClosed', pat: 'x...x...x...x...', vol: 0.35 },
    ],
    roles: {
      kick: 'Syncopated stabs doubling the palm-muted riff.',
      snare: 'Single displaced crack on 3 — the only fixed point.',
      tomLow: 'Low accents on 1 and 4 — the riff’s deep shadow.',
      hatClosed: 'Quiet quarter pulse to keep the poly-feel navigable.',
    },
    source: {
      type: 'reference',
      note: 'Djent/prog-metal syncopated riff drumming — rhythm data only.',
    },
  },
  {
    id: 'metalcore-half-breakdown',
    title: 'Metalcore — Halftime Breakdown',
    family: 'metal',
    genres: ['Metalcore', 'Breakdown'],
    tags: ['halftime', 'breakdown', 'crash', 'chug'],
    difficulty: 'intermediate',
    bpm: 150,
    tempoRange: [130, 170],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 1,
    kit: 'tight',
    summary:
      'The halftime breakdown: kick slamming 1, 3 and a 3& pickup, snare alone on 3, crash hanging over half-open air.',
    description:
      'The breakdown is metalcore’s valley: the feel drops to halftime, the kick stamps 1, 3 and a pickup on the “&” of 3, and the snare — now the only backbeat — cracks alone on 3 while the crash hangs over the downbeat. Space becomes the heaviest instrument: the half-open hat sighs between hits and every silence begs for the guitar’s low chug to answer.',
    construction:
      'Kick plays X.......X..X.... (1, 3, 3&); snare cracks on 3 only; crash blooms on 1; half-open hat sighs on 1 and 3.',
    tracks: [
      { inst: 'kick', pat: 'X.......X..X....', vol: 1 },
      { inst: 'snare', pat: '........X.......', vol: 0.95 },
      { inst: 'crash', pat: 'X...............', vol: 0.8 },
      { inst: 'hatOpen', pat: 'x.......x.......', vol: 0.45 },
    ],
    roles: {
      kick: 'Halftime stamps on 1, 3 and the 3& pickup into the loop.',
      snare: 'Lone halftime crack on 3 — the valley’s only peak.',
      crash: 'Downbeat wash hanging over the air.',
      hatOpen: 'Half-open sigh marking 1 and 3 between chugs.',
    },
    source: {
      type: 'reference',
      note: 'Metalcore halftime-breakdown vocabulary — rhythm data only.',
    },
  },
  {
    id: 'nu-metal-riff',
    title: 'Nu Metal — Riff Crumbs',
    family: 'metal',
    genres: ['Nu Metal', 'Rap Metal'],
    tags: ['hip-hop-influenced', 'rim', 'syncopated', '90s'],
    difficulty: 'intermediate',
    bpm: 110,
    tempoRange: [92, 128],
    ts: [4, 4],
    sub: 4,
    feel: 'broken',
    sync: 3,
    dens: 2,
    kit: 'tight',
    summary:
      'Nu-metal riff-lock: hip-hop-inflected kick placements on 1, 2&, 3& and 4&, rim clicks filling the gaps, snare square on 2 and 4.',
    description:
      'Nu metal taught metal drums to breakdance: the kick copies hip-hop boom-bap placements — 1, the “&” of 2, the “&” of 3 and 4 — leaving the backbeat to stand alone while rimshot clicks scatter like hi-hat crumbs through the gaps. The tight kit and dry tuning make every note percussive and close, so the guitar’s drop-tuned riff locks to the kick like it’s sampling it.',
    construction:
      'Kick plays the hip-hop-inflected X..X..X...X..... figure; snare holds 2 and 4; rimshot clicks the gaps; low hats keep eighths.',
    tracks: [
      { inst: 'kick', pat: 'X..X..X...X.....', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.95 },
      { inst: 'rimshot', pat: '..x.....x....x..', vol: 0.6 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.35 },
    ],
    roles: {
      kick: 'Boom-bap-derived placements locking to the riff.',
      snare: 'Square 2 and 4 anchor amid the syncopation.',
      rimshot: 'Dry clicks filling the gaps like hi-hat crumbs.',
      hatClosed: 'Low eighths keeping the broken feel readable.',
    },
    source: {
      type: 'reference',
      note: 'Nu-metal hip-hop-influenced kit vocabulary (late-90s) — rhythm data only.',
    },
  },
]
