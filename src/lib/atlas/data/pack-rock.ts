/**
 * Groovemap — pack-rock: rock, pop, metal, punk, country, blues, gospel.
 *
 * Authored pattern data in the compact authoring format (see types.ts):
 *   X accent · x normal · o ghost · 2/3/4 ratchet roll · p probabilistic · . rest
 *   one char per step, `|` between bars.
 * All kit suggestions point at real sampled drum sets ('studio' acoustic kit
 * unless a specific vintage/punch character is musically essential).
 */

import type { AuthorPattern } from '../types'

export const PACK_ROCK: AuthorPattern[] = [
  /* ================================================================ Rock ==== */
  {
    id: 'rock-bo-diddley',
    title: 'Bo Diddley Beat',
    family: 'rock',
    genres: ['Rock & Roll', 'Blues Rock'],
    tags: ['clave', 'traditional', 'hambone', 'rumba'],
    difficulty: 'intermediate',
    bpm: 120,
    tempoRange: [96, 144],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'studio',
    summary:
      'The legendary Bo Diddley beat: a 3-2 rumba-clave timeline stamped by the kick and rimshot under straight eighth hats.',
    description:
      'This is the “hambone” rhythm — a 3-2 son-clave (hits on 1, the “a” of 1, the “&” of 2, 4, the “&” of 4) that migrated from African timeline patterns through rural American hambone hand-clapping into 1950s rock & roll. The kick and rimshot spell out the clave while the snare keeps a light 2 & 4 backbeat, so the groove simultaneously swings like rock and lopes like rumba. Maracas in even eighths are the glue, exactly as on the original recordings.',
    construction:
      'Layer 1: kick and rimshot double the 3-2 clave. Layer 2: light snare on 2 & 4. Layer 3: straight eighth hats plus maracas for the shimmer.',
    tracks: [
      { inst: 'kick', pat: 'X..X..X...X.X...', vol: 1 },
      { inst: 'rimshot', pat: 'x..x..x...x.x...', vol: 0.85 },
      { inst: 'snare', pat: '....x.......x...', vol: 0.8 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.55 },
      { inst: 'maracas', pat: 'x.x.x.x.x.x.x.x.', vol: 0.4 },
    ],
    roles: {
      kick: 'States the 3-2 clave — the pattern’s spine.',
      rimshot: 'Reinforces the clave with a dry, woody counter-tone.',
      snare: 'Light backbeat on 2 & 4 keeps the rock feel anchored.',
      hatClosed: 'Straight eighth subdivision with quarter-note accents.',
      maracas: 'Even eighths — the original song’s signature percussion layer.',
    },
    variations: [
      {
        name: 'Hambone ghost',
        note: 'A ghost snare right before beat 2 thickens the drag into the backbeat.',
        overrides: { snare: '...oX.......X...' },
      },
      {
        name: 'Flick into the loop',
        note: 'Double-stroke the final hat so the phrase flicks back to the top.',
        overrides: { hatClosed: 'X.x.X.x.X.x.X.2.' },
      },
    ],
    related: ['son-clave-32', 'rock-drive', 'country-bluegrass-drive'],
    source: {
      type: 'traditional',
      note: 'Traditional hambone/rumba-clave timeline popularized as the “Bo Diddley beat” in 1950s rock & roll.',
    },
  },
  {
    id: 'rock-syncopated-kick',
    title: 'Syncopated Kick Rock',
    family: 'rock',
    genres: ['Hard Rock', 'Classic Rock'],
    tags: ['syncopated', 'kick', 'hardrock', 'push'],
    difficulty: 'intermediate',
    bpm: 128,
    tempoRange: [100, 148],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'studio',
    summary:
      'Hard-rock groove with a syncopated kick (1, 3, the “&” of 3, the “&” of 4) under steady eighth hats.',
    description:
      'The engine of countless Aerosmith and Van Halen tracks: the backbeat stays square on 2 & 4, but the kick refuses to. Landing on 3, the “&” of 3 and the “&” of 4, the kick turns the second half of the bar into a ramp that launches the loop back to beat 1. A ghost snare on the “a” of 3 keeps the right hand honest and adds drag without clutter.',
    construction:
      'Steady eighth hats and a 2 & 4 backbeat carry the grid; the kick plays 1, 3, 3& and 4& while one ghost note precedes the final snare.',
    tracks: [
      { inst: 'kick', pat: 'X.......x.x....x', vol: 1 },
      { inst: 'snare', pat: '....X......oX...', vol: 0.9 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.55 },
    ],
    roles: {
      kick: 'Syncopated motor: downbeats plus off-beat pushes into 4 and 1.',
      snare: 'Backbeat on 2 & 4, with a ghost drag on the “a” of 3.',
      hatClosed: 'Steady eighths marking the quarters with accents.',
    },
    variations: [
      {
        name: 'Van Halen push',
        note: 'Add the kick on the “&” of 2 to make the whole bar churn.',
        overrides: { kick: 'X.....x.x.x....x' },
      },
      {
        name: 'Ghost volley',
        note: 'Two ghost snares leading into the “&” of 3 and beat 4 for a busier right-left drag.',
        overrides: { snare: '....X..o...oX...' },
      },
    ],
    related: ['rock-drive', 'alt-rock-push', 'backbeat-basic'],
    source: {
      type: 'reference',
      note: 'Inspired by the syncopated-kick hard-rock grooves of Aerosmith and Van Halen — rhythm data only.',
    },
  },
  {
    id: 'rock-open-hat-drive',
    title: 'Open-Hat Arena Drive',
    family: 'rock',
    genres: ['Arena Rock', 'Stadium Rock'],
    tags: ['openhat', 'anthem', 'driving', 'wide'],
    difficulty: 'beginner',
    bpm: 126,
    tempoRange: [110, 140],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 0,
    dens: 2,
    kit: 'studio',
    summary:
      'Anthemic arena-rock drive: open hi-hat on every eighth, kick on 1 and the “&” of 3, crash ringing over the downbeat.',
    description:
      'Washing open hats in even eighths are the sound of a big room — the U2/anthem-school way to make three players sound enormous. Accents fall on the quarter-note downbeats while the off-beat eighths ring, so the cymbal itself carries the pulse. The kick sits on 1 and the “&” of 3, pushing the groove back toward the top of the bar where the crash blooms.',
    construction:
      'Layer 1: open hi-hat eighths, accented on the quarters. Layer 2: kick on 1 and 3&. Layer 3: snare 2 & 4, crash on the downbeat.',
    tracks: [
      { inst: 'hatOpen', pat: 'X.x.X.x.X.x.X.x.', vol: 0.5 },
      { inst: 'kick', pat: 'X.........x.....', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'crash', pat: 'X...............', vol: 0.45 },
    ],
    roles: {
      hatOpen: 'The engine — every eighth rings, accented on the quarters.',
      kick: 'Grounds beat 1 and pushes off the “&” of 3.',
      snare: 'Backbeat anchor on 2 & 4.',
      crash: 'Marks the top of the bar and feeds the “big room” sound.',
    },
    variations: [
      {
        name: 'Fist-pump kick',
        note: 'Add kicks on 3, 3& and 4& for a chorus-level stomp.',
        overrides: { kick: 'X.......x.x....x' },
      },
      {
        name: 'Quarter choke',
        note: 'Choke the open hat to quarter notes for a tenser verse feel.',
        overrides: { hatOpen: 'X...X...X...X...' },
      },
    ],
    related: ['rock-drive', 'backbeat-basic', 'punk-anthem'],
    source: {
      type: 'reference',
      note: 'Inspired by the open-hat anthem grooves of U2 and 1980s stadium rock — rhythm data only.',
    },
  },
  {
    id: 'rock-half-time-power',
    title: 'Half-Time Power Stomp',
    family: 'rock',
    genres: ['Rock', 'Hard Rock'],
    tags: ['halftime', 'heavy', 'stomp', 'two-bar'],
    difficulty: 'beginner',
    bpm: 92,
    tempoRange: [76, 110],
    ts: [4, 4],
    bars: 2,
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 1,
    kit: 'studio',
    summary:
      'Two-bar half-time rock stomp: one massive snare on 3, kick on 1 and the “&” of 2, crash landing on the downbeat of every second bar.',
    description:
      'Half-time drops the backbeat rate in half: a single accented snare on beat 3 makes the bar feel twice as slow and twice as heavy. The kick answers on 1 and the “&” of 2 — early enough to push, late enough to breathe. Over two bars the crash only lands on the second downbeat, so the groove opens bare and slams shut, a dynamic arc in miniature.',
    construction:
      'Kick on 1 and 2&, one accented snare on 3, eighth hats with quarter accents; the crash enters only on the downbeat of bar 2.',
    tracks: [
      { inst: 'kick', pat: 'X.....x.........|X.....x.........', vol: 1 },
      { inst: 'snare', pat: '........X.......|........X.......', vol: 0.95 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.|X.x.X.x.X.x.X.x.', vol: 0.55 },
      { inst: 'crash', pat: '................|X...............', vol: 0.5 },
    ],
    roles: {
      kick: 'Beat 1 anchor plus the “&” of 2 push.',
      snare: 'The lone half-time backbeat — hit it like you mean it.',
      hatClosed: 'Keeps full-speed eighths so the half-time feel drags instead of dies.',
      crash: 'Rings over the second downbeat, defining the two-bar form.',
    },
    variations: [
      {
        name: 'Half-time flam',
        note: 'Replace the snare with a double-stroke flam for extra width.',
        overrides: { snare: '........2.......|........2.......' },
      },
      {
        name: 'Drag into 1',
        note: 'A kick on the “&” of 4 pulls the loop back to the top.',
        overrides: { kick: 'X.....x.......x.|X.....x.......x.' },
      },
    ],
    related: ['half-time-feel', 'metal-half-time-thrash', 'backbeat-basic'],
    source: { type: 'original', note: 'Original composition: generic half-time rock stomp with a two-bar crash arc.' },
  },

  /* ================================================================= Pop ==== */
  {
    id: 'pop-chart-8ths',
    title: 'Chart Pop Eighths',
    family: 'pop',
    genres: ['Pop', 'Top 40'],
    tags: ['pop', 'clap', 'radio', 'layered'],
    difficulty: 'beginner',
    bpm: 104,
    tempoRange: [92, 118],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 2,
    kit: 'tight',
    summary:
      'Modern chart-pop skeleton: eighth hats with an end-of-bar 16th flick, clap layered over snare on 2 & 4, kick on 1 and 3&.',
    description:
      'The default groove of the streaming era. Kick on 1 and the “&” of 3 leaves beats 2 and 4 free for a clap stacked on the snare — the layered backbeat that makes programmed pop feel like a room of people. The hats keep eighths with a double-stroke flick into the loop point, the tiny 16th detail that separates a demo from a record.',
    construction:
      'Kick on 1 and 3&; clap plus snare share 2 & 4; eighth hats with a ratcheted 16th pair on the “&” of 4.',
    tracks: [
      { inst: 'kick', pat: 'X.........x.....', vol: 1 },
      { inst: 'clap', pat: '....X.......X...', vol: 0.8 },
      { inst: 'snare', pat: '....x.......x...', vol: 0.85 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.2.', vol: 0.55 },
    ],
    roles: {
      kick: 'Sparse anchor on 1 and the “&” of 3.',
      clap: 'Bright top layer of the backbeat.',
      snare: 'Body of the backbeat under the clap.',
      hatClosed: 'Eighth-note pulse with a 16th double-stroke into the loop.',
    },
    variations: [
      {
        name: 'Kick lift',
        note: 'Add kicks on the “&” of 2 and the “&” of 4 to launch the chorus.',
        overrides: { kick: 'X.....x.x.....x.' },
      },
      {
        name: 'Chant clap',
        note: 'Add a softer clap on the “a” of 4 for a stadium-stomp layer.',
        overrides: { clap: '....X.......X..x' },
      },
    ],
    related: ['pop-cheerful', 'pop-clap-backbeat', 'backbeat-basic'],
    source: { type: 'original', note: 'Original composition: generic modern chart-pop groove.' },
  },
  {
    id: 'pop-billie-jean-groove',
    title: 'Billie Jean-Style Groove',
    family: 'pop',
    genres: ['Pop', 'R&B', 'Post-Disco'],
    tags: ['reference', 'tight', 'groove', 'iconic'],
    difficulty: 'intermediate',
    bpm: 117,
    tempoRange: [108, 126],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 2,
    kit: 'tight',
    summary:
      'Tight, dark pop groove in the style of “Billie Jean”: eighths on the hat, rimshot-tinted backbeat, kick on 1 and 3 with an occasional 4& pickup.',
    description:
      'Leon “Ndugu” Chancler’s groove on “Billie Jean” is a masterclass in restraint: hats in dead-even eighths, a dry rimshot-flavored snare on 2 & 4, and a kick that mostly just counts 1 and 3. The magic is the occasional extra kick on the “&” of 4 — here written probabilistically — that nudges the loop forward without ever breaking the hypnotic squareness. Ghost rimshot texture between the backbeats keeps the middle of the bar alive.',
    construction:
      'Layer 1: even eighth hats. Layer 2: snare 2 & 4 with a rimshot layer and one ghost. Layer 3: kick on 1 and 3, plus a ~55% chance kick on 4&.',
    tracks: [
      { inst: 'kick', pat: 'X.......X.....p.', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
      { inst: 'rimshot', pat: '....x......o....', vol: 0.7 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.5 },
    ],
    roles: {
      kick: 'Metronomic 1 and 3, with an optional 4& pickup.',
      snare: 'Dry backbeat on 2 & 4.',
      rimshot: 'Tight top-end layer on the backbeats plus one ghost on the “a” of 3.',
      hatClosed: 'Even eighths — resist the urge to swing them.',
    },
    variations: [
      {
        name: 'Certain pickup',
        note: 'Make the 4& kick deterministic for a more insistent loop.',
        overrides: { kick: 'X.......X.....x.' },
      },
      {
        name: 'Cooler hats',
        note: 'Remove the hat accents for a flatter, more mechanical verse sound.',
        overrides: { hatClosed: 'x.x.x.x.x.x.x.x.' },
      },
    ],
    related: ['pop-chart-8ths', 'motown-groove', 'pop-clap-backbeat'],
    source: {
      type: 'reference',
      note: 'Inspired by the drum groove of Michael Jackson’s “Billie Jean” (Leon Ndugu Chancler) — rhythm data only.',
    },
  },
  {
    id: 'pop-clap-backbeat',
    title: '80s Clap Backbeat',
    family: 'pop',
    genres: ['80s Pop', 'Dance-Pop'],
    tags: ['clap', '80s', 'offbeat', 'retro'],
    difficulty: 'beginner',
    bpm: 116,
    tempoRange: [100, 132],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 2,
    kit: 'dusty',
    summary:
      '80s dance-pop classic: machine clap stacked with snare on 2 & 4, open hats on the off-beats, kick on 1 and 3&.',
    description:
      'The gated-reverb decade in one bar. A machine clap doubled with a real snare gives the backbeat its paper-and-thunder sound, while open hats splash on every off-beat “&” — the disco inheritance that keeps 80s pop dancing. The kick is minimal on purpose: 1 and the “&” of 3 is all the low end a synth-bass line needs.',
    construction:
      'Clap and snare share 2 & 4; open hats mark the off-beat eighths over quarter-note closed hats; kick on 1 and 3&.',
    tracks: [
      { inst: 'kick', pat: 'X.........x.....', vol: 1 },
      { inst: 'clap', pat: '....X.......X...', vol: 0.85 },
      { inst: 'snare', pat: '....x.......x...', vol: 0.8 },
      { inst: 'hatOpen', pat: '..x...x...x...x.', vol: 0.5 },
      { inst: 'hatClosed', pat: 'X...X...X...X...', vol: 0.5 },
    ],
    roles: {
      kick: 'Minimal low end: 1 and the “&” of 3.',
      clap: 'The signature 80s crack on the backbeats.',
      snare: 'Acoustic body layered under the clap.',
      hatOpen: 'Off-beat splash — the disco inheritance.',
      hatClosed: 'Quarter-note downbeats between the splashes.',
    },
    variations: [
      {
        name: 'Kick push',
        note: 'Add kicks on 3 and the “&” of 3 for a busier dance-floor verse.',
        overrides: { kick: 'X.......x.x.....' },
      },
      {
        name: 'Snare only',
        note: 'Silence the clap for a drier, more human second verse.',
        overrides: { clap: '................' },
      },
    ],
    related: ['pop-cheerful', 'synthwave-gated', 'pop-chart-8ths'],
    source: { type: 'original', note: 'Original composition in the 1980s dance-pop idiom.' },
  },
  {
    id: 'pop-halftime-bridge',
    title: 'Half-Time Pop Bridge',
    family: 'pop',
    genres: ['Pop', 'R&B'],
    tags: ['halftime', 'bridge', 'space', 'shaker'],
    difficulty: 'beginner',
    bpm: 90,
    tempoRange: [80, 100],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 1,
    kit: 'studio',
    summary:
      'Half-time pop bridge: one snare on 3, shaker eighths, kick on 1 and the “&” of 2 — instant contrast section.',
    description:
      'When a pop song needs air, the band drops to half-time: the snare moves to beat 3 alone and every instrument gets twice the space. A shaker instead of hats keeps the subdivision bright and small-sounding, so the section feels lighter even though the backbeat is slower. The kick on 1 and the “&” of 2 whispers the pulse without competing with the vocal.',
    construction:
      'Kick on 1 and 2&, one snare on 3, shaker in accented eighths. Nothing else.',
    tracks: [
      { inst: 'kick', pat: 'X.....x.........', vol: 0.9 },
      { inst: 'snare', pat: '........X.......', vol: 0.9 },
      { inst: 'shaker', pat: 'X.x.X.x.X.x.X.x.', vol: 0.5 },
    ],
    roles: {
      kick: 'Quiet anchor on 1 and the “&” of 2.',
      snare: 'The single half-time backbeat on 3.',
      shaker: 'Bright eighth-note subdivision that keeps the section moving.',
    },
    variations: [
      {
        name: 'Breath ghost',
        note: 'A ghost snare immediately before beat 3 softens the landing.',
        overrides: { snare: '.......oX.......' },
      },
      {
        name: 'Into the chorus',
        note: 'Add a normal-velocity snare on the “&” of 4 to launch the next section.',
        overrides: { snare: '........X.....x.' },
      },
    ],
    related: ['half-time-feel', 'pop-cheerful', 'country-halftime-ballad'],
    source: { type: 'original', note: 'Original composition: generic half-time pop bridge section.' },
  },

  /* ============================================================== Metal ==== */
  {
    id: 'metal-driving-16ths',
    title: 'Driving Thrash 16ths',
    family: 'metal',
    genres: ['Thrash Metal', 'Speed Metal'],
    tags: ['thrash', '16ths', 'doublekick', 'aggressive'],
    difficulty: 'intermediate',
    bpm: 170,
    tempoRange: [150, 200],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 3,
    kit: 'tight',
    summary:
      'Thrash workhorse: 16th-note hats with quarter accents, kick 16th runs through beats 1–2, and a snare backbeat punching over the top.',
    description:
      'This is the “thrash backbeat”: double-kick intensity underneath, but the snare still cracks on 2 & 4 so the music keeps its rock skeleton. The kick churns 16ths across beats 1 and 2, then simplifies to quarter anchors on 3 and 4 — a wave shape that gives the bar a natural crescendo. Ride the hats with accents on the quarters and let the snare be the loudest thing in the mix.',
    construction:
      'Kick: 16ths on beats 1–2, then quarters on 3 and 4. Snare on 2 & 4. Hats in 16ths accented on the quarters, crash on 1.',
    tracks: [
      { inst: 'kick', pat: 'XxxxXxxxX...X...', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.95 },
      { inst: 'hatClosed', pat: 'XxxxXxxxXxxxXxxx', vol: 0.5 },
      { inst: 'crash', pat: 'X...............', vol: 0.45 },
    ],
    roles: {
      kick: 'Double-kick 16th runs on 1–2, quarter anchors on 3–4.',
      snare: 'The thrash backbeat — loud, on 2 & 4, over the churn.',
      hatClosed: '16th subdivision; accents mark the quarter pulse.',
      crash: 'Rings over the downbeat to crown the bar.',
    },
    variations: [
      {
        name: 'Full barrage',
        note: 'Kick 16ths through the entire bar for the mosh-point.',
        overrides: { kick: 'Xxxxxxxxxxxxxxxx' },
      },
      {
        name: 'Slide into 3',
        note: 'Break the kick run with a skip: 3, the “&” of 3, then 4.',
        overrides: { kick: 'XxxxXxxxX.x.X...' },
      },
    ],
    related: ['metal-double-kick', 'punk-straight-eighths', 'metal-gallop'],
    source: { type: 'original', note: 'Original composition: common-practice thrash backbeat over double-kick runs.' },
  },
  {
    id: 'metal-double-kick',
    title: 'Double-Kick Machine',
    family: 'metal',
    genres: ['Metal', 'Power Metal'],
    tags: ['doublekick', '16ths', 'machine', 'relentless'],
    difficulty: 'intermediate',
    bpm: 180,
    tempoRange: [160, 208],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 3,
    kit: 'tight',
    summary:
      'The double-bass foundation: kick 16ths through the whole bar, snare on 2 & 4, eighth hats for orientation.',
    description:
      'One bar, one idea: continuous kick 16ths like a drum-machine rotor, accented only on the downbeat. The snare on 2 & 4 is what keeps this metal instead of noise — listeners grab the backbeat and everything else reads as texture. Eighth hats on the quarters give the ear a slower reference point so the 16th wall feels controlled rather than frantic.',
    construction:
      'Kick 16ths all bar (accent on 1), snare 2 & 4, hats in eighths with quarter accents.',
    tracks: [
      { inst: 'kick', pat: 'Xxxxxxxxxxxxxxxx', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.95 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.45 },
    ],
    roles: {
      kick: 'The rotor — even 16ths, accented only on 1.',
      snare: 'Backbeat on 2 & 4; the groove’s handle for the listener.',
      hatClosed: 'Quarter-marked eighths as a slow reference pulse.',
    },
    variations: [
      {
        name: 'Accent the quarters',
        note: 'Pulse the kick in quarter-note swells for a galloping read.',
        overrides: { kick: 'XxxxXxxxXxxxXxxx' },
      },
      {
        name: 'Double-time hats',
        note: 'Move the hats to 16ths when the riff doubles.',
        overrides: { hatClosed: 'XxxxXxxxXxxxXxxx' },
      },
    ],
    related: ['metal-driving-16ths', 'metal-blast-fragment', 'punk-skate'],
    source: { type: 'original', note: 'Original composition: textbook double-bass metal foundation.' },
  },
  {
    id: 'metal-half-time-thrash',
    title: 'Half-Time Thrash Slam',
    family: 'metal',
    genres: ['Metal', 'Groove Metal'],
    tags: ['halftime', 'slam', 'heavy', 'crash'],
    difficulty: 'intermediate',
    bpm: 110,
    tempoRange: [96, 126],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'tight',
    summary:
      'Half-time metal slam: one snare on 3, syncopated low kick chunks, crash opening every bar.',
    description:
      'The mosh-pit breath: half-time puts the single snare on 3 while the kick spells syncopated low chunks on 1, the “&” of 2, the “&” of 3 and the “&” of 4. Quiet eighth hats keep time without stealing weight — in this register silence is the heaviest instrument. The crash on beat 1 of every bar marks the slam point like a guillotine.',
    construction:
      'Crash on 1, kick chunks on 1, 2&, 3& and 4&, one accented snare on 3, whisper-quiet eighth hats.',
    tracks: [
      { inst: 'kick', pat: 'X.....x...x...x.', vol: 1 },
      { inst: 'snare', pat: '........X.......', vol: 1 },
      { inst: 'hatClosed', pat: 'x.x.x.x.x.x.x.x.', vol: 0.4 },
      { inst: 'crash', pat: 'X...............', vol: 0.5 },
    ],
    roles: {
      kick: 'Syncopated low chunks outlining 1, 2&, 3& and 4&.',
      snare: 'The half-time slam on 3 — full accent, every time.',
      hatClosed: 'Low-volume eighths that keep the bar from stalling.',
      crash: 'Opens the bar and defines the slam.',
    },
    variations: [
      {
        name: 'Slam & crawl',
        note: 'Tighten the last beat to 3&, 4, 4& for a crawling exit.',
        overrides: { kick: 'X.....x...x.x.x.' },
      },
      {
        name: 'Flam the slam',
        note: 'Double-stroke the snare on 3 for extra width.',
        overrides: { snare: '........2.......' },
      },
    ],
    related: ['rock-half-time-power', 'metal-doom-8ths', 'metal-driving-16ths'],
    source: { type: 'original', note: 'Original composition: generic half-time metal slam.' },
  },
  {
    id: 'metal-gallop',
    title: 'Iron Gallop',
    family: 'metal',
    genres: ['Heavy Metal', 'NWOBHM'],
    tags: ['gallop', 'reference', 'maiden', 'riding'],
    difficulty: 'intermediate',
    bpm: 150,
    tempoRange: [132, 172],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 3,
    kit: 'studio',
    summary:
      'The Iron Maiden gallop: kick playing 8th-plus-two-16ths (X.xx) on every beat, snare 2 & 4, crash on 1.',
    description:
      'The gallop is heavy metal’s horse: one eighth followed by two 16ths, repeated on every beat — “daa-da-da, daa-da-da”. Played on the kick it turns four bars into a cavalry charge while the snare keeps a plain 2 & 4 so the phrase never loses its rock DNA. The crash on beat 1 is not decoration; it re-syncs the audience every bar at gallop speed.',
    construction:
      'Kick spells the gallop cell (8th + 2 16ths) on all four beats; snare 2 & 4; crash on the downbeat.',
    tracks: [
      { inst: 'kick', pat: 'X.xxX.xxX.xxX.xx', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.95 },
      { inst: 'crash', pat: 'X...............', vol: 0.5 },
    ],
    roles: {
      kick: 'The gallop cell on every beat — long-short-short.',
      snare: 'Plain backbeat on 2 & 4 keeps the charge grounded.',
      crash: 'Downbeat marker at gallop tempo.',
    },
    variations: [
      {
        name: 'Reverse gallop',
        note: 'Flip the cell to 16th-16th-8th (.xxX) for the twin-stroke variant.',
        overrides: { kick: '.xxX.xxX.xxX.xxX' },
      },
      {
        name: 'Trooper sprint',
        note: 'Fill the last beat with straight 16ths to accelerate into the loop.',
        overrides: { kick: 'X.xxX.xxX.xxXxxx' },
      },
    ],
    related: ['metal-driving-16ths', 'punk-straight-eighths', 'rock-drive'],
    source: {
      type: 'reference',
      note: 'Inspired by the gallop grooves of Iron Maiden (e.g. “The Trooper”) — rhythm data only.',
    },
  },
  {
    id: 'metal-blast-fragment',
    title: 'Classic Blast Fragment',
    family: 'metal',
    genres: ['Death Metal', 'Black Metal'],
    tags: ['blast', '16ths', 'extreme', 'advanced'],
    difficulty: 'advanced',
    bpm: 190,
    tempoRange: [180, 220],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 3,
    kit: 'tight',
    summary:
      'One bar of textbook classic blast: kick and snare alternating 16ths (kick even, snare odd) under a crash on 1.',
    description:
      'The classic blast is extreme metal’s blast furnace: kick and snare interlock in alternating 16ths so the two drums read as one continuous buzz at speed. The crash on beat 1 is the only accent — everything else is even, relentless, and deliberately anti-groove. This is one of the rare legitimate cases of an all-accent wall: the pattern’s identity is the wall itself.',
    construction:
      'Kick on every even 16th, snare on every odd 16th, crash on 1. Alternation, not coordination, is the trick.',
    tracks: [
      { inst: 'kick', pat: 'X.x.x.x.x.x.x.x.', vol: 1 },
      { inst: 'snare', pat: '.x.x.x.x.x.x.x.x', vol: 0.9 },
      { inst: 'crash', pat: 'X...............', vol: 0.5 },
    ],
    roles: {
      kick: 'Even 16ths — one half of the interlock.',
      snare: 'Odd 16ths — the other half; together they form the buzz.',
      crash: 'Single accent marking the top of the blast.',
    },
    variations: [
      {
        name: 'Bomb blast',
        note: 'Kick 16ths all bar with the snare back to 2 & 4 — the half-speed “bomb” variant.',
        overrides: { kick: 'Xxxxxxxxxxxxxxxx', snare: '....X.......X...' },
      },
      {
        name: 'Crash-ride blast',
        note: 'Pound quarter-note crashes over the interlock, hardcore style.',
        overrides: { crash: 'X...X...X...X...' },
      },
    ],
    related: ['metal-double-kick', 'metal-driving-16ths', 'punk-d-beat'],
    source: {
      type: 'original',
      note: 'Original composition: textbook classic blast-beat fragment (alternating kick/snare 16ths); a study pattern not tied to one recording.',
    },
  },
  {
    id: 'metal-djent-sync',
    title: 'Djent Syncopation',
    family: 'metal',
    genres: ['Progressive Metal', 'Djent'],
    tags: ['djent', 'syncopated', 'sparse', 'chunk'],
    difficulty: 'intermediate',
    bpm: 110,
    tempoRange: [96, 128],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 2,
    kit: 'tight',
    summary:
      'Djent-style syncopation: low kick chunks on 1, 2&, 3 and 4&, quarter-note hats, crash accents — space as density.',
    description:
      'Djent rhythm sections are built from silence: the kick fires short, palm-muted “chunks” on 1, the “&” of 2, 3 and the “&” of 4, and everything between is vacuum. Quarter-note hats are the only continuous element, giving the polyrhythmic guitar line a fixed frame. The crash on 1 is a punctuation mark, not a wash — hit it and let it decay into the gaps.',
    construction:
      'Kick chunks on 1, 2&, 3, 4&; closed hats on the quarters; crash on the downbeat. Nothing else moves.',
    tracks: [
      { inst: 'kick', pat: 'X.....x.X.....x.', vol: 1 },
      { inst: 'hatClosed', pat: 'X...X...X...X...', vol: 0.5 },
      { inst: 'crash', pat: 'X...............', vol: 0.5 },
    ],
    roles: {
      kick: 'The low chunks — the only rhythmic information that matters.',
      hatClosed: 'Quarter-note frame over the gaps.',
      crash: 'Downbeat punctuation with fast decay.',
    },
    variations: [
      {
        name: 'Extra chunk',
        note: 'Insert a kick on the “&” of 3 for a lopsided 5-against-4 read.',
        overrides: { kick: 'X.....x.X.x...x.' },
      },
      {
        name: 'Silent drop',
        note: 'Kill the hats for the breakdown — kick and vacuum only.',
        overrides: { hatClosed: '................' },
      },
    ],
    related: ['metal-half-time-thrash', 'metal-doom-8ths', 'metal-gallop'],
    source: {
      type: 'reference',
      note: 'Inspired by the syncopated low-chunk grooves of djent (Meshuggah / Periphery lineage) — rhythm data only.',
    },
  },
  {
    id: 'metal-doom-8ths',
    title: 'Doom 8ths',
    family: 'metal',
    genres: ['Doom Metal', 'Heavy Metal'],
    tags: ['doom', 'slow', 'heavy', 'reference'],
    difficulty: 'beginner',
    bpm: 70,
    tempoRange: [60, 88],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 0,
    dens: 1,
    kit: 'studio',
    summary:
      'Sabbath-school doom: eighth hats, kick on 1 and 3, light snare on 2 & 4 — heaviness through patience.',
    description:
      'The blueprint Black Sabbath handed to metal: nothing fast, everything massive. Eighth hats with quarter accents walk the bar while the kick lands only on 1 and 3 and the snare answers 2 & 4 at a deliberately light velocity — at 70 BPM a hard-hitting backbeat would sound jaunty, so the weight is left to the space. A crash on the downbeat tolls like a bell.',
    construction:
      'Kick on 1 and 3, light snare on 2 & 4, eighth hats with quarter accents, crash on 1.',
    tracks: [
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.5 },
      { inst: 'kick', pat: 'X.......X.......', vol: 1 },
      { inst: 'snare', pat: '....x.......x...', vol: 0.8 },
      { inst: 'crash', pat: 'X...............', vol: 0.45 },
    ],
    roles: {
      hatClosed: 'Slow eighth subdivision with quarter accents.',
      kick: 'Heavy downbeats on 1 and 3 — let them ring.',
      snare: 'Deliberately light backbeat; volume would lighten the feel.',
      crash: 'Bell-like downbeat marker.',
    },
    variations: [
      {
        name: 'Quarter dirge',
        note: 'Halve the hats to quarter notes for an even slower read.',
        overrides: { hatClosed: 'X...X...X...X...' },
      },
      {
        name: 'Push before 4',
        note: 'A kick on the “&” of 3 adds forward lean without losing the dirge.',
        overrides: { kick: 'X.......X.x.....' },
      },
    ],
    related: ['metal-half-time-thrash', 'rock-half-time-power', 'blues-walkin'],
    source: {
      type: 'reference',
      note: 'Inspired by the heavy blues of Black Sabbath’s early-70s doom material — rhythm data only.',
    },
  },

  /* ============================================================== Punk ===== */
  {
    id: 'punk-straight-eighths',
    title: 'Straight-Eighths Punk',
    family: 'punk',
    genres: ['Punk', 'Rock'],
    tags: ['ramones', 'reference', 'fast', 'eighths'],
    difficulty: 'beginner',
    bpm: 180,
    tempoRange: [160, 208],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 0,
    dens: 2,
    kit: 'tight',
    summary:
      'The Ramones template: straight eighth hats, kick on 1 & 3, hard snare on 2 & 4 — three chords and the truth.',
    description:
      'At 180 BPM this bare bar IS the song: hats in unrelenting eighths, kick marking 1 and 3, snare cracking on 2 & 4 with full accents. There is nowhere to hide and nothing to fix — endurance and commitment are the technique. The crash on 1 simply marks the top; punk’s economy means even fills are optional.',
    construction:
      'Kick on 1 and 3, hard snare on 2 & 4, eighth hats with quarter accents, crash on the downbeat.',
    tracks: [
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.55 },
      { inst: 'kick', pat: 'X.......x.......', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 1 },
      { inst: 'crash', pat: 'X...............', vol: 0.45 },
    ],
    roles: {
      hatClosed: 'Metronomic eighths — the engine at speed.',
      kick: 'Downbeats 1 and 3, no ornament.',
      snare: 'Hard backbeat on 2 & 4 — the loudest voice.',
      crash: 'Top-of-form marker.',
    },
    variations: [
      {
        name: 'Four-on-floor',
        note: 'Kick every quarter for the full-throttle variant.',
        overrides: { kick: 'X...x...X...x...' },
      },
      {
        name: 'Flam snare',
        note: 'Double-stroke the snare on 2 for a garage edge.',
        overrides: { snare: '....2.......X...' },
      },
    ],
    related: ['punk-anthem', 'punk-oi-stomp', 'rock-drive'],
    source: {
      type: 'reference',
      note: 'Inspired by the Ramones’ straight-eighths bar-of-punk (late-70s New York) — rhythm data only.',
    },
  },
  {
    id: 'punk-d-beat',
    title: 'D-Beat',
    family: 'punk',
    genres: ['D-Beat', 'Hardcore Punk'],
    tags: ['dbeat', 'discharge', 'reference', 'crashride'],
    difficulty: 'intermediate',
    bpm: 170,
    tempoRange: [150, 190],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 2,
    dens: 3,
    kit: 'tight',
    summary:
      'The Discharge D-beat: kick on 1, the “&” of 3 and 4, snare 2 & 4, all under pounding crash-ride eighths.',
    description:
      'One pattern named a genre. The D-beat’s kick signature — downbeat, the “&” of 3, then 4 — creates the galloping “D-D-DUM” that Discharge turned into a war march, while the snare holds a straight 2 & 4. The real secret is the right hand: crash-ride eighths hammered all bar give the wash that makes everything sound like it’s falling apart on purpose.',
    construction:
      'Kick on 1, 3& and 4; snare on 2 & 4; crash-ride hammered in accented eighths all bar.',
    tracks: [
      { inst: 'kick', pat: 'X.........x.X...', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 1 },
      { inst: 'crash', pat: 'X.x.X.x.X.x.X.x.', vol: 0.4 },
    ],
    roles: {
      kick: 'The D-beat signature: 1, 3& and 4.',
      snare: 'Straight 2 & 4 backbone.',
      crash: 'Crash-ride eighths — the “broken radio” wash.',
    },
    variations: [
      {
        name: 'The double D',
        note: 'Add a kick on the “a” of 1 for the double-tap version of the figure.',
        overrides: { kick: 'X..x......x.X...' },
      },
      {
        name: 'Snare kickback',
        note: 'Snare doubles the “&” of 3 and 4 — the half-D snare variant.',
        overrides: { snare: '....X.....X.X...' },
      },
    ],
    related: ['punk-straight-eighths', 'metal-blast-fragment', 'punk-anthem'],
    source: {
      type: 'reference',
      note: 'Inspired by Discharge’s D-beat (the pattern that named a subgenre) — rhythm data only.',
    },
  },
  {
    id: 'punk-skate',
    title: 'Skate-Punk Rush',
    family: 'punk',
    genres: ['Skate Punk', 'Melodic Hardcore'],
    tags: ['skate', 'fast', 'openhat', 'melodic'],
    difficulty: 'intermediate',
    bpm: 200,
    tempoRange: [180, 224],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 0,
    dens: 2,
    kit: 'tight',
    summary:
      'Skate-punk at 200 BPM: open-hat eighths, kick on 1 & 3, snare 2 & 4 — velocity with melody on top.',
    description:
      'Skate punk takes the Ramones bar and doubles the tempo, then relies on open-hat eighths to keep the wash musical instead of frantic. The kick’s simple 1 & 3 and the snare’s hard 2 & 4 are the only anchors at this speed — anything syncopated would disappear. A ratcheted snare on the “&” of 4 is the classic turnaround that launches the next loop.',
    construction:
      'Open hats in accented eighths, kick on 1 and 3, snare hard on 2 & 4.',
    tracks: [
      { inst: 'hatOpen', pat: 'X.x.X.x.X.x.X.x.', vol: 0.5 },
      { inst: 'kick', pat: 'X.......x.......', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 1 },
    ],
    roles: {
      hatOpen: 'Open eighths — speed rendered as wash, accented on the quarters.',
      kick: 'Bare downbeats 1 and 3.',
      snare: 'Hard backbeat; at 200 BPM it is the melody.',
    },
    variations: [
      {
        name: 'Push the 2',
        note: 'A kick on the “&” of 2 adds just enough lean at speed.',
        overrides: { kick: 'X.....x.x.......' },
      },
      {
        name: 'Turnaround roll',
        note: 'Double-stroke the snare on the “&” of 4 into the loop.',
        overrides: { snare: '....X.......X.2.' },
      },
    ],
    related: ['punk-pop-punk', 'punk-straight-eighths', 'punk-anthem'],
    source: { type: 'original', note: 'Original composition: generic skate-punk fast bar.' },
  },
  {
    id: 'punk-pop-punk',
    title: 'Pop-Punk Bounce',
    family: 'punk',
    genres: ['Pop Punk', 'Punk'],
    tags: ['poppunk', 'offbeat', 'bouncy', 'catchy'],
    difficulty: 'beginner',
    bpm: 190,
    tempoRange: [172, 210],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 2,
    kit: 'tight',
    summary:
      'Pop-punk bounce: kick on 1 and 3&, snare 2 & 4, closed hats on the beats with open hats chugging the off-beats.',
    description:
      'The pop-punk secret is the off-beat open hat: it mimics the upstroke of a punk guitar skank and turns a plain backbeat bar into something that bounces. Kick on 1 and the “&” of 3 leaves the “&” of 3 pushing toward the snare’s 4, a micro-tension the genre never resolves — and never tires of. Add a kick on 3 when the chorus arrives.',
    construction:
      'Closed hats on the quarters, open hats on the off-beat eighths, kick on 1 and 3&, snare on 2 & 4.',
    tracks: [
      { inst: 'hatClosed', pat: 'X...X...X...X...', vol: 0.5 },
      { inst: 'hatOpen', pat: '..x...x...x...x.', vol: 0.5 },
      { inst: 'kick', pat: 'X.........x.....', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.95 },
    ],
    roles: {
      hatClosed: 'Quarter-note skeleton.',
      hatOpen: 'Off-beat chug — the bounce.',
      kick: '1 and the “&” of 3, leaning into beat 4.',
      snare: 'Backbeat on 2 & 4.',
    },
    variations: [
      {
        name: 'Blink push',
        note: 'Add the kick on 3 and 3& for the driving-chorus version.',
        overrides: { kick: 'X.......x.x.....' },
      },
      {
        name: 'Dry verse',
        note: 'Remove the open hats for a tighter, drier verse texture.',
        overrides: { hatOpen: '................' },
      },
    ],
    related: ['punk-skate', 'pop-chart-8ths', 'punk-straight-eighths'],
    source: { type: 'original', note: 'Original composition: generic 90s pop-punk groove.' },
  },
  {
    id: 'punk-oi-stomp',
    title: 'Oi! Stomp',
    family: 'punk',
    genres: ['Oi!', 'Street Punk'],
    tags: ['oi', 'stomp', 'gang', 'midtempo'],
    difficulty: 'beginner',
    bpm: 120,
    tempoRange: [100, 140],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 0,
    dens: 1,
    kit: 'studio',
    summary:
      'Mid-tempo Oi! stomp: quarter-note hats, kick on 1 & 3, heavy snare on 2 & 4 — built for gang vocals.',
    description:
      'Oi! trades punk’s speed for boot-sized weight: quarter-note hats stomp the pulse, the kick marks 1 and 3, and the snare hits 2 & 4 at full accent with space around it for a crowd to shout back. At 120 BPM every hit is a footstep — the rhythm of a pub chorus rather than a mosh sprint. The crash on 1 is the “oi!” itself.',
    construction:
      'Kick on 1 and 3, heavy snare on 2 & 4, quarter-note hats, crash on the downbeat.',
    tracks: [
      { inst: 'hatClosed', pat: 'X...X...X...X...', vol: 0.6 },
      { inst: 'kick', pat: 'X.......x.......', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 1 },
      { inst: 'crash', pat: 'X...............', vol: 0.4 },
    ],
    roles: {
      hatClosed: 'Quarter-note stomp pulse.',
      kick: 'Downbeats 1 and 3.',
      snare: 'Full-accent backbeat — leave gaps for the gang vocals.',
      crash: 'Downbeat shout.',
    },
    variations: [
      {
        name: 'Eighth stomp',
        note: 'Double the hats to eighths for the chorus push.',
        overrides: { hatClosed: 'X.x.X.x.X.x.X.x.' },
      },
      {
        name: 'Boot push',
        note: 'A kick on the “&” of 1 starts the bar with a heel stamp.',
        overrides: { kick: 'X.x.....x.......' },
      },
    ],
    related: ['punk-straight-eighths', 'punk-anthem', 'punk-d-beat'],
    source: { type: 'original', note: 'Original composition: generic Oi!/street-punk stomp.' },
  },

  /* ========================================================== Country ====== */
  {
    id: 'country-train-beat',
    title: 'Train Beat',
    family: 'country',
    genres: ['Country', 'Bluegrass'],
    tags: ['train', 'ghosts', 'traditional', 'brushwork'],
    difficulty: 'advanced',
    bpm: 140,
    tempoRange: [120, 168],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 3,
    kit: 'studio',
    summary:
      'The traditional train beat: a dense snare texture of ghosted 16ths chugging under accented backbeats, sparse kick, quarter-note ride.',
    description:
      'The drumset imitating a steam locomotive: the snare’s ghosted 16ths are the chuh-chuh of the pistons while the accented 2 & 4 are the whistle’s punch on the drive wheels. Dynamics are everything — the ghosts must sit far under the accents or the imitation collapses into noise. The kick stays sparse on 1 and 3 (the engine’s weight) and the ride clicks quarter notes like rails.',
    construction:
      'Snare: ghost 16ths chugging around accented 2 & 4. Kick on 1 and 3. Quarter-note ride keeps the rail pulse.',
    tracks: [
      { inst: 'snare', pat: 'o.ooX.oo.o.oXo..', vol: 0.9 },
      { inst: 'kick', pat: 'X.......x.......', vol: 0.9 },
      { inst: 'ride', pat: 'X...X...X...X...', vol: 0.4 },
    ],
    roles: {
      snare: 'The locomotive — ghosted 16th texture with accented 2 & 4.',
      kick: 'Engine weight on 1 and 3, deliberately sparse.',
      ride: 'Quarter-note rail click.',
    },
    variations: [
      {
        name: 'Denser train',
        note: 'Fill nearly every 16th with ghosts for full-speed piston churn.',
        overrides: { snare: 'oo.oXoo.oo.oXo.o' },
      },
      {
        name: 'Sparse ghost train',
        note: 'Thin the ghosts to straight eighths for a ballad-speed version.',
        overrides: { snare: 'o.o.X.o.o.o.X.o.' },
      },
    ],
    related: ['country-bluegrass-drive', 'blues-chicago-shuffle', 'jazz-brush'],
    source: {
      type: 'traditional',
      note: 'Traditional train beat — railroad onomatopoeia on the snare, a staple of country and bluegrass drumming.',
    },
  },
  {
    id: 'country-two-step',
    title: 'Country Two-Step',
    family: 'country',
    genres: ['Country', 'Honky-Tonk'],
    tags: ['twostep', 'dance', 'traditional', 'brisk'],
    difficulty: 'beginner',
    bpm: 168,
    tempoRange: [150, 190],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 0,
    dens: 1,
    kit: 'studio',
    summary:
      'The two-step dance rhythm: kick on 1 & 3, snare on 2 & 4, brisk straight eighths — a fiddle-tune trot.',
    description:
      'Two-step is dance-floor logic: a steady boom (kick on 1 and 3) for the step-step, a chuck (snare on 2 and 4) for the weight change, all at a trot brisk enough to spin a partner. Straight eighths — not swing — keep it country rather than jazz. Lift the last open hat into the loop and the band sounds like it is grinning.',
    construction:
      'Kick on 1 and 3, snare on 2 & 4, straight eighth hats accented on the quarters.',
    tracks: [
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.55 },
      { inst: 'kick', pat: 'X.......x.......', vol: 1 },
      { inst: 'snare', pat: '....X.......X...', vol: 0.9 },
    ],
    roles: {
      hatClosed: 'Brisk straight eighths — the trot.',
      kick: 'Boom on 1 and 3 for the dance steps.',
      snare: 'Chuck on 2 & 4 for the weight change.',
    },
    variations: [
      {
        name: 'Push the &',
        note: 'A kick on the “&” of 2 adds the honky-tonk lean.',
        overrides: { kick: 'X.....x.x.......' },
      },
      {
        name: 'Flick the spin',
        note: 'Double-stroke the final hat so the turn feels like a spin.',
        overrides: { hatClosed: 'X.x.X.x.X.x.X.2.' },
      },
    ],
    related: ['country-boogie-shuffle', 'country-bluegrass-drive', 'backbeat-basic'],
    source: {
      type: 'traditional',
      note: 'Traditional country two-step dance rhythm (straight-eighth boom-chuck skeleton).',
    },
  },
  {
    id: 'country-boogie-shuffle',
    title: 'Boogie Shuffle',
    family: 'country',
    genres: ['Country', 'Rockabilly'],
    tags: ['shuffle', 'boogie', 'triplet', 'traditional'],
    difficulty: 'intermediate',
    bpm: 150,
    tempoRange: [130, 180],
    ts: [4, 4],
    sub: 3,
    feel: 'shuffled',
    sync: 0,
    dens: 2,
    kit: 'studio',
    summary:
      'Triplet-country “boom-chicka”: shuffle ride, kick on 1 & 3, snare on 2 & 4 — the boogie engine.',
    description:
      'Written in triplets, the boogie shuffle rides the first and third pulse of every beat — “X.x” — while the kick booms 1 and 3 and the snare chucks 2 and 4. That long-short triplet lilt is the “chicka” between the boom and the chuck, the sound of train tracks and fiddle tunes at once. Keep the kick plain: the shuffle already supplies the swing.',
    construction:
      'Shuffle ride (triplet 1st + 3rd of each beat), kick on 1 and 3, snare on 2 & 4.',
    tracks: [
      { inst: 'ride', pat: 'X.xX.xX.xX.x', vol: 0.5 },
      { inst: 'kick', pat: 'X.....X.....', vol: 1 },
      { inst: 'snare', pat: '...X.....X..', vol: 0.9 },
    ],
    roles: {
      ride: 'The shuffle — long-short triplet pairs, accented on the quarters.',
      kick: 'Boom on 1 and 3.',
      snare: 'Chuck on the backbeats.',
    },
    variations: [
      {
        name: 'Kick pickup',
        note: 'A kick on the last triplet launches the loop like a departing train.',
        overrides: { kick: 'X.....X....x' },
      },
      {
        name: 'Straight ride',
        note: 'Drop to quarter-note ride for a laid-back verse read.',
        overrides: { ride: 'X..X..X..X..' },
      },
    ],
    related: ['blues-texas-shuffle', 'blues-12-8-slow', 'country-two-step'],
    source: {
      type: 'traditional',
      note: 'Traditional boogie/rockabilly shuffle (“boom-chicka”) common to country and early rock & roll.',
    },
  },
  {
    id: 'country-halftime-ballad',
    title: 'Half-Time Country Ballad',
    family: 'country',
    genres: ['Country', 'Country Ballad'],
    tags: ['ballad', 'halftime', 'sparse', 'ghosts'],
    difficulty: 'beginner',
    bpm: 76,
    tempoRange: [60, 92],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 1,
    kit: 'studio',
    summary:
      'Country ballad in half-time: one snare on 3 softened by ghosts, kick on 1 and the “&” of 2, quiet eighth hats.',
    description:
      'A ballad bar that stays out of the singer’s way: the single snare on 3 arrives preceded by a ghost on the “a” of 2 — the little drag that makes the big hit feel inevitable rather than loud. The kick on 1 and the “&” of 2 sketches the pulse, and a trailing ghost on the “&” of 4 hands the phrase gently back to the top. Soft hats keep the seventh of the bar from feeling empty.',
    construction:
      'Kick on 1 and 2&; snare on 3 flanked by ghosts; eighth hats at low volume.',
    tracks: [
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.45 },
      { inst: 'kick', pat: 'X.....x.........', vol: 0.9 },
      { inst: 'snare', pat: '.......oX.....o.', vol: 0.85 },
    ],
    roles: {
      hatClosed: 'Quiet eighths that carry the half-bar space.',
      kick: 'Soft anchor on 1 and the “&” of 2.',
      snare: 'The one big backbeat on 3, softened by ghosts on either side.',
    },
    variations: [
      {
        name: 'Train-ballad ghosts',
        note: 'Add train-beat ghosts around the half-time backbeat.',
        overrides: { snare: 'o.o...o.X....o.o' },
      },
      {
        name: 'Sighing ghosts',
        note: 'A pair of trailing ghosts on the “&” of 4 hands the phrase back gently.',
        overrides: { snare: '.......oX....oo.' },
      },
    ],
    related: ['half-time-feel', 'pop-halftime-bridge', 'country-train-beat'],
    source: { type: 'original', note: 'Original composition: generic half-time country ballad groove.' },
  },
  {
    id: 'country-bluegrass-drive',
    title: 'Bluegrass Drive',
    family: 'country',
    genres: ['Bluegrass', 'Country'],
    tags: ['bluegrass', 'drive', 'chop', 'brisk'],
    difficulty: 'beginner',
    bpm: 170,
    tempoRange: [150, 200],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 0,
    dens: 1,
    kit: 'studio',
    summary:
      'Bluegrass drive on a kit: kick as the bass on 1 & 3, rimshot chops as the mandolin on 2 & 4, brisk shaker eighths.',
    description:
      'Bluegrass bands have no drummer, so the kit borrows the band’s jobs: the kick plays the bass fiddle’s boom on 1 and 3, and the rimshot snaps the mandolin’s chop on 2 and 4 — that dry “tick” is what makes it bluegrass instead of rock. A shaker runs the fiddle tune’s brisk eighths. Add a kick on the “&” of 4 and you have the classic run into the next turn.',
    construction:
      'Kick (bass) on 1 and 3; rimshot (chop) on 2 & 4; shaker in accented eighths.',
    tracks: [
      { inst: 'shaker', pat: 'X.x.X.x.X.x.X.x.', vol: 0.6 },
      { inst: 'kick', pat: 'X.......x.......', vol: 0.95 },
      { inst: 'rimshot', pat: '....X.......X...', vol: 0.9 },
    ],
    roles: {
      shaker: 'Brisk eighth-note drive, like the fiddle run.',
      kick: 'Bass fiddle boom on 1 and 3.',
      rimshot: 'Mandolin chop on the backbeats — keep it dry and high.',
    },
    variations: [
      {
        name: 'Run to the turn',
        note: 'A kick on the “&” of 4 imitates the bass run into the next phrase.',
        overrides: { kick: 'X.......x.....x.' },
      },
      {
        name: 'Driving 16ths',
        note: 'Double the shaker to 16ths for a fast fiddle-tune finish.',
        overrides: { shaker: 'XxxxXxxxXxxxXxxx' },
      },
    ],
    related: ['country-two-step', 'country-train-beat', 'country-boogie-shuffle'],
    source: {
      type: 'traditional',
      note: 'Traditional bluegrass “drive” boom-chuck adapted to the drum kit (bass on 1 & 3, chop on 2 & 4).',
    },
  },

  /* ============================================================== Blues ==== */
  {
    id: 'blues-12-8-slow',
    title: 'Slow Blues in 12/8',
    family: 'blues',
    genres: ['Blues', 'Blues Ballad'],
    tags: ['12-8', 'triplet', 'slow', 'traditional'],
    difficulty: 'intermediate',
    bpm: 60,
    tempoRange: [44, 76],
    ts: [4, 4],
    sub: 3,
    feel: 'shuffled',
    sync: 0,
    dens: 1,
    kit: 'studio',
    summary:
      'The 12/8 slow-blues ride: “ding .. ding-a” triplets on the ride, kick on 1 & 3, snare on 2 & 4.',
    description:
      'Slow blues lives in 12/8: each quarter beat splits into three, and the ride plays the first and third — the “ding .. ding-a” that every blues ballad floats on. The kick on 1 and 3 and the snare on 2 and 4 are as plain as it gets; at 60 BPM the emotion comes entirely from the space between the triplets. Drag the last triplet with a kick pickup and the bar sighs.',
    construction:
      'Ride: triplet pulses 1 and 3 of every beat (steps 0,2,3,5,6,8,9,11). Kick on beats 1 and 3, snare on beats 2 and 4.',
    tracks: [
      { inst: 'ride', pat: 'X.xX.xX.xX.x', vol: 0.5 },
      { inst: 'kick', pat: 'X.....X.....', vol: 0.95 },
      { inst: 'snare', pat: '...X.....X..', vol: 0.85 },
    ],
    roles: {
      ride: 'The 12/8 heartbeat — “ding .. ding-a” on every beat.',
      kick: 'Slow pulse on beats 1 and 3.',
      snare: 'Backbeat on beats 2 and 4.',
    },
    variations: [
      {
        name: 'Pickup into 4',
        note: 'A kick on the last triplet of beat 4 leans into the loop.',
        overrides: { kick: 'X.....X....x' },
      },
      {
        name: 'Drag ghosts',
        note: 'Ghost snares on the third triplet of beats 1 and 3 add a tired drag.',
        overrides: { snare: '..oX....oX..' },
      },
    ],
    related: ['blues-texas-shuffle', 'gospel-12-8', 'country-boogie-shuffle'],
    source: {
      type: 'traditional',
      note: 'Traditional 12/8 slow-blues triplet ride pattern (the standard blues-ballad pulse).',
    },
  },
  {
    id: 'blues-texas-shuffle',
    title: 'Texas Shuffle',
    family: 'blues',
    genres: ['Blues', 'Texas Blues'],
    tags: ['shuffle', 'triplet', 'walking', 'traditional'],
    difficulty: 'intermediate',
    bpm: 132,
    tempoRange: [110, 160],
    ts: [4, 4],
    sub: 3,
    feel: 'shuffled',
    sync: 1,
    dens: 2,
    kit: 'studio',
    summary:
      'The Texas shuffle: walking quarter-note kick under a triplet shuffle ride, snare cracking on 2 & 4.',
    description:
      'The Texas shuffle piles two grids on top of each other: the ride shuffles in triplets while the kick stomps plain quarter notes — 1, 2, 3, 4 — like a walking bass that refuses to swing. That square-kick-against-triplet-ride tension is the whole style, perfected by the SRV-era bands. The snare just cracks 2 and 4 and stays out of the argument.',
    construction:
      'Kick on all four quarter beats (triplet 1sts), shuffle ride on triplet 1st + 3rd, snare on beats 2 and 4.',
    tracks: [
      { inst: 'ride', pat: 'X.xX.xX.xX.x', vol: 0.5 },
      { inst: 'kick', pat: 'X..X..X..X..', vol: 1 },
      { inst: 'snare', pat: '...X.....X..', vol: 0.95 },
    ],
    roles: {
      ride: 'Triplet shuffle — the swinging layer.',
      kick: 'Square walking quarters — the refusing-to-swing layer.',
      snare: 'Backbeat on 2 & 4.',
    },
    variations: [
      {
        name: 'Push into 1',
        note: 'A kick on the final triplet charges the loop.',
        overrides: { kick: 'X..X..X..X.x' },
      },
      {
        name: 'Drag ghosts',
        note: 'Ghost snares on the third triplet of beats 1 and 3 smear the shuffle.',
        overrides: { snare: '..oX....oX..' },
      },
    ],
    related: ['blues-12-8-slow', 'blues-walkin', 'country-boogie-shuffle'],
    source: {
      type: 'traditional',
      note: 'Traditional Texas shuffle — walking quarter kick under a triplet ride shuffle.',
    },
  },
  {
    id: 'blues-chicago-shuffle',
    title: 'Chicago Shuffle',
    family: 'blues',
    genres: ['Blues', 'Chicago Blues'],
    tags: ['shuffle', 'ghosts', 'triplet', 'traditional'],
    difficulty: 'advanced',
    bpm: 112,
    tempoRange: [96, 132],
    ts: [4, 4],
    sub: 3,
    feel: 'shuffled',
    sync: 2,
    dens: 3,
    kit: 'studio',
    summary:
      'Chicago shuffle: ghost-triplet snare wash over a shuffle ride, kick on 1 and 3 with a pickup on the last triplet.',
    description:
      'The South Side trick: while the ride shuffles, the snare hums ghost triplets underneath the backbeats — a low “brrr” that makes the whole bar sound like it is idling. The kick keeps 1 and 3 and reaches for the last triplet of beat 4, the pickup that Chicago bands use to lean on the next chorus. This one is all wrist control: ghosts at 40, backbeats at full.',
    construction:
      'Shuffle ride; snare ghosts through the triplet grid with accents on 2 & 4; kick on 1, 3 and the final triplet.',
    tracks: [
      { inst: 'ride', pat: 'X.xX.xX.xX.x', vol: 0.5 },
      { inst: 'kick', pat: 'X.....X....x', vol: 0.95 },
      { inst: 'snare', pat: 'o.oX.oo.oX.o', vol: 0.95 },
    ],
    roles: {
      ride: 'Shuffle pulse on triplet 1st + 3rd.',
      kick: 'Downbeats 1 and 3, plus the final-triplet pickup.',
      snare: 'Ghost-triplet wash with full backbeats on 2 & 4.',
    },
    variations: [
      {
        name: 'West-side drag',
        note: 'Move the kick pickup earlier (the “a” of 3) for a lazier drag.',
        overrides: { kick: 'X.....X..x.x' },
      },
      {
        name: 'Bell roll',
        note: 'Double-stroke the ride’s last off-beat as a bell accent into the loop.',
        overrides: { ride: 'X.xX.xX.xX2x' },
      },
    ],
    related: ['blues-texas-shuffle', 'blues-12-8-slow', 'country-train-beat'],
    source: {
      type: 'traditional',
      note: 'Traditional Chicago shuffle — ghosted-triplet snare over a shuffle ride (South Side common practice).',
    },
  },
  {
    id: 'blues-walkin',
    title: 'Walking Boogie',
    family: 'blues',
    genres: ['Blues', 'Boogie'],
    tags: ['walking', 'boogie', 'shuffle', 'traditional'],
    difficulty: 'intermediate',
    bpm: 140,
    tempoRange: [120, 168],
    ts: [4, 4],
    sub: 3,
    feel: 'shuffled',
    sync: 1,
    dens: 2,
    kit: 'studio',
    summary:
      'Walking boogie blues: kick walks quarter accents with ghost in-betweens, shuffle hats, snare on 2 & 4.',
    description:
      'The kick imitates an upright bass walking: accented quarters on 1-2-3-4 with ghost notes tucked into the off-triplets, as if the bassist were passing through. Shuffle hats keep the triplet lilt and the snare holds 2 & 4. Together they turn the drum kit into a whole boogie trio — bass, chords and backbeat in one bar.',
    construction:
      'Kick: quarter accents with ghost triplet pickups; hats in shuffle triplets; snare on 2 & 4.',
    tracks: [
      { inst: 'hatClosed', pat: 'X.xX.xX.xX.x', vol: 0.5 },
      { inst: 'kick', pat: 'X..X.oX..X.o', vol: 1 },
      { inst: 'snare', pat: '...X.....X..', vol: 0.9 },
    ],
    roles: {
      hatClosed: 'Shuffle triplets — the chord pulse.',
      kick: 'Walking bass: quarter accents plus ghost pickups.',
      snare: 'Backbeat on 2 & 4.',
    },
    variations: [
      {
        name: 'Boogie 8ths',
        note: 'Fill every triplet for the full rolling-boogie read.',
        overrides: { hatClosed: 'XxxXxxXxxXxx' },
      },
      {
        name: 'Walking ghosts galore',
        note: 'Ghost on nearly every triplet for a bassist who never rests.',
        overrides: { kick: 'XooX.oXooX.o' },
      },
    ],
    related: ['blues-texas-shuffle', 'blues-jump', 'blues-chicago-shuffle'],
    source: {
      type: 'traditional',
      note: 'Traditional walking/boogie blues — quarter-note kick walking a bass line under shuffled hats.',
    },
  },
  {
    id: 'blues-jump',
    title: 'Jump Blues Swing',
    family: 'blues',
    genres: ['Jump Blues', 'Swing'],
    tags: ['jump', 'swing', '16ths', 'shout'],
    difficulty: 'intermediate',
    bpm: 168,
    tempoRange: [150, 200],
    ts: [4, 4],
    sub: 4,
    feel: 'swung',
    swing: 0.35,
    sync: 2,
    dens: 3,
    kit: 'studio',
    summary:
      'Jump blues: swung 16th hats over a stamping kick (1, 2&, 3), ghosted backbeat snare — Kansas City shout energy.',
    description:
      'Jump blues swings at double speed: the hats run straight-16th notation but the 0.35 swing shifts every off-16th, turning them into a rolling shimmy. The kick stamps 1, the “&” of 2 and 3 while the snare answers 2 & 4 with a ghost dragged behind beat 3 — the small imperfection that makes it breathe. It is big-band energy compressed into one bar and three horns shouting over it.',
    construction:
      'Swung 16th hats (quarter accents), kick on 1, 2& and 3, snare on 2 & 4 with a ghost on the “&” of 3.',
    tracks: [
      { inst: 'hatClosed', pat: 'XxxxXxxxXxxxXxxx', vol: 0.5 },
      { inst: 'kick', pat: 'X.....x.X.......', vol: 1 },
      { inst: 'snare', pat: '....X.....o.X...', vol: 0.9 },
    ],
    roles: {
      hatClosed: 'Swung 16th shimmy — the shuffle rendered in 16ths.',
      kick: 'Stamps 1, the “&” of 2 and 3.',
      snare: 'Backbeat with a ghost drag behind beat 3.',
    },
    variations: [
      {
        name: 'Shout-chorus push',
        note: 'Add the kick on the “&” of 4 for the full-band shout.',
        overrides: { kick: 'X.....x.X.....x.' },
      },
      {
        name: 'Stop-time quarters',
        note: 'Thin the hats to quarter notes for a stop-time break.',
        overrides: { hatClosed: 'X...X...X...X...' },
      },
    ],
    related: ['blues-walkin', 'blues-chicago-shuffle', 'jazz-swing'],
    source: {
      type: 'traditional',
      note: 'Traditional jump-blues swing (Kansas City shout tradition): swung 16ths over a stamping kick.',
    },
  },

  /* ============================================================ Gospel ===== */
  {
    id: 'gospel-shout',
    title: 'Gospel Shout',
    family: 'gospel',
    genres: ['Gospel', 'Praise & Worship'],
    tags: ['shout', 'uptempo', 'tambourine', 'traditional'],
    difficulty: 'intermediate',
    bpm: 150,
    tempoRange: [132, 176],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 1,
    dens: 3,
    kit: 'studio',
    summary:
      'Uptempo gospel shout: kick on 1 & 3, snare on 2 with a flam-double on 4, barking eighth hats and tambourine eighths.',
    description:
      'The praise-break engine: when the organ modulates and the choir stands up, the band rides this bar until the spirit moves. Hats and tambourine bark even eighths, the kick holds 1 and 3, and the snare answers 2 with a clean crack and 4 as a double-stroke — the flam that lifts the last beat into the next chorus. Everything is loud, nothing is complicated; the intensity is communal.',
    construction:
      'Kick on 1 and 3; snare on 2 plus a ratcheted double on 4; eighth-note hat barks and tambourine eighths.',
    tracks: [
      { inst: 'kick', pat: 'X.......x.......', vol: 1 },
      { inst: 'snare', pat: '....X.......2...', vol: 0.95 },
      { inst: 'hatClosed', pat: 'X.x.X.x.X.x.X.x.', vol: 0.55 },
      { inst: 'tambourine', pat: 'x.x.x.x.x.x.x.x.', vol: 0.5 },
    ],
    roles: {
      kick: 'Steady 1 and 3 under the shout.',
      snare: 'Backbeat on 2, double-stroke lift on 4.',
      hatClosed: 'Eighth-note bark, accented on the quarters.',
      tambourine: 'The congregation’s pulse in even eighths.',
    },
    variations: [
      {
        name: 'Sixteenth shout',
        note: 'Double the hats to 16ths when the key change hits.',
        overrides: { hatClosed: 'XxxxXxxxXxxxXxxx' },
      },
      {
        name: 'Drag into 4',
        note: 'A ghost before the double-stroke 4 tightens the lift.',
        overrides: { snare: '....X......o2...' },
      },
    ],
    related: ['gospel-12-8', 'gospel-pocket-halftime', 'funk-jb'],
    source: {
      type: 'traditional',
      note: 'Traditional gospel shout groove — the uptempo church praise-break feel.',
    },
  },
  {
    id: 'gospel-pocket-halftime',
    title: 'Gospel Half-Time Pocket',
    family: 'gospel',
    genres: ['Contemporary Gospel', 'Gospel'],
    tags: ['halftime', 'pocket', 'ghosts', 'pocket'],
    difficulty: 'advanced',
    bpm: 96,
    tempoRange: [84, 112],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 3,
    kit: 'studio',
    summary:
      'Contemporary gospel half-time pocket: ghost-dense snare flower around the beat-3 accent, syncopated kick, 16th hats with quarter accents.',
    description:
      'Modern gospel drumming turns the half-time bar into a ghost-note garden: the snare’s true accent sits on 3, but nine ghost notes bloom around it, shaping a melody the congregation feels more than hears. The kick answers syncopated on 1, the “a” of 2 and the “&” of 3, while 16th hats with quarter accents keep the time-keeping ironed flat. The pocket is the point — every ghost must stay under the accent or the pocket punctures.',
    construction:
      'Snare: one accent on 3 ringed by ghosts; kick on 1, 2a and 3&; 16th hats accented on the quarters.',
    tracks: [
      { inst: 'kick', pat: 'X......x..x.....', vol: 1 },
      { inst: 'snare', pat: 'o.o.o.ooXo.o.oo.', vol: 0.9 },
      { inst: 'hatClosed', pat: 'XxxxXxxxXxxxXxxx', vol: 0.45 },
    ],
    roles: {
      kick: 'Syncopated low answer: 1, the “a” of 2, the “&” of 3.',
      snare: 'Half-time accent on 3 wrapped in a ghost-note melody.',
      hatClosed: 'Flat 16th subdivision with quarter accents.',
    },
    variations: [
      {
        name: 'Flam the pocket',
        note: 'Double-stroke the beat-3 accent for the big-band gospel read.',
        overrides: { snare: 'o.o.o.oo2o.o.oo.' },
      },
      {
        name: 'Kick answer',
        note: 'Add the kick on the “&” of 4 to push the loop home.',
        overrides: { kick: 'X......x..x...x.' },
      },
    ],
    related: ['half-time-feel', 'gospel-shout', 'funk-16ths'],
    source: { type: 'original', note: 'Original composition: contemporary gospel half-time pocket study.' },
  },
  {
    id: 'gospel-12-8',
    title: 'Gospel 12/8 Shuffle',
    family: 'gospel',
    genres: ['Gospel', 'Traditional Gospel'],
    tags: ['12-8', 'shuffle', 'tambourine', 'traditional'],
    difficulty: 'intermediate',
    bpm: 100,
    tempoRange: [84, 120],
    ts: [4, 4],
    sub: 3,
    feel: 'shuffled',
    sync: 0,
    dens: 2,
    kit: 'studio',
    summary:
      'Sunday-morning gospel shuffle in 12/8: ride triplets, kick on 1 & 3, snare on 2 & 4, tambourine riding the eighths.',
    description:
      'Gospel’s triplet side: the ride swings “X.x” through every beat while the tambourine doubles the shuffle for the pew behind you. Kick on 1 and 3 and snare on 2 and 4 keep the hymn’s feet; nothing else is needed. The tambourine is not decoration — in this music it is the second timekeeper, and losing it collapses the lift.',
    construction:
      'Ride: triplet 1st + 3rd of each beat; tambourine doubles the same grid; kick on 1 and 3, snare on 2 & 4.',
    tracks: [
      { inst: 'ride', pat: 'X.xX.xX.xX.x', vol: 0.5 },
      { inst: 'kick', pat: 'X.....X.....', vol: 0.95 },
      { inst: 'snare', pat: '...X.....X..', vol: 0.9 },
      { inst: 'tambourine', pat: 'x.xx.xx.xx.x', vol: 0.5 },
    ],
    roles: {
      ride: '12/8 shuffle — the hymn’s lilt.',
      kick: 'Pulse on beats 1 and 3.',
      snare: 'Backbeat on beats 2 and 4.',
      tambourine: 'Second timekeeper doubling the shuffle.',
    },
    variations: [
      {
        name: 'Full-triplet ride',
        note: 'Fill every triplet on the ride for the climax verse.',
        overrides: { ride: 'XxxXxxXxxXxx' },
      },
      {
        name: 'Turnaround kick',
        note: 'A kick on the last triplet walks the hymn back to the top.',
        overrides: { kick: 'X.....X....x' },
      },
    ],
    related: ['blues-12-8-slow', 'gospel-shout', 'gospel-pocket-halftime'],
    source: {
      type: 'traditional',
      note: 'Traditional gospel 12/8 shuffle — the Sunday-morning triplet pocket.',
    },
  },
  {
    id: 'gospel-linear-chops',
    title: 'Linear Chop Phrase',
    family: 'gospel',
    genres: ['Contemporary Gospel', 'Gospel Chops'],
    tags: ['linear', 'chops', 'advanced', 'study'],
    difficulty: 'advanced',
    bpm: 110,
    tempoRange: [96, 126],
    ts: [4, 4],
    sub: 4,
    feel: 'straight',
    sync: 3,
    dens: 3,
    kit: 'tight',
    summary:
      'A clean linear gospel phrase: kick, snare and hat share one continuous 16th line with no simultaneous hits, ending on a ratchet chop.',
    description:
      'Linear drumming means one voice per 16th — kick, snare and hat hand the line to each other without ever overlapping, which is why it sounds like a sentence rather than a groove. This phrase walks K-H-S-H up the bar, ghosts the snare on the “a” of 2, and finishes with a double-stroke chop on the “a” of 4 that hands the phrase back to beat 1. Practice it slow with a metronome: the accent shape (kick on 1, kick on 3) is what keeps it musical instead of athletic.',
    construction:
      'One voice per 16th step: kick on 1, 2, 3 and 4; snare fills 1a, 2&, 2a and 3& with a ghost; hats occupy every remaining 16th; ratchet-2 chop on the “a” of 4.',
    tracks: [
      { inst: 'kick', pat: 'X...x...x...X...', vol: 0.95 },
      { inst: 'snare', pat: '..x..x.o..x..2..', vol: 0.9 },
      { inst: 'hatClosed', pat: '.x.x..x..x.x..xx', vol: 0.5 },
    ],
    roles: {
      kick: 'Downbeat skeleton — 1, 2, 3 and 4 inside the line.',
      snare: 'Off-beat snare steps plus a ghost on the “a” of 2 and the final chop.',
      hatClosed: 'Every remaining 16th — the glue voice of the line.',
    },
    variations: [
      {
        name: 'Triple chop',
        note: 'Upgrade the ending to a triple-stroke for the big finish.',
        overrides: { snare: '..x..x.o..x..3..' },
      },
      {
        name: 'Quadruple did-it',
        note: 'The full “did-it-DID-it” four-stroke chop into the loop.',
        overrides: { snare: '..x..x.o..x..4..' },
      },
    ],
    related: ['gospel-pocket-halftime', 'gospel-shout', 'funk-16ths'],
    source: {
      type: 'original',
      note: 'Original composition: a clean linear gospel-style chop phrase (one voice per 16th, no unisons).',
    },
  },
  {
    id: 'gospel-2-bar-turn',
    title: 'Two-Bar Gospel Turn',
    family: 'gospel',
    genres: ['Contemporary Gospel', 'Gospel'],
    tags: ['two-bar', 'turnaround', 'shuffle', 'fill'],
    difficulty: 'advanced',
    bpm: 108,
    tempoRange: [96, 120],
    ts: [4, 4],
    bars: 2,
    sub: 3,
    feel: 'shuffled',
    sync: 2,
    dens: 3,
    kit: 'studio',
    summary:
      'Two-bar gospel shuffle pocket where the second bar replaces its last backbeat with a ratchet-roll turnaround.',
    description:
      'Bar 1 is pure pocket: ghost-heavy snare around the 2 & 4 accents over the 12/8 shuffle. Bar 2 repeats the pocket until the final beat, where the backbeat dissolves into double- and triple-stroke rolls that spin the phrase back to bar 1 — the “turn” that gospel bands use to stay in one groove for ten minutes without it ever sounding static. The tambourine never wavers; it is the thread stitched through both bars.',
    construction:
      'Both bars: shuffle ride and tambourine, kick on 1 & 3, ghost-heavy snare on 2 & 4. Bar 2’s last beat becomes ratchet rolls (double then triple) instead of the plain backbeat.',
    tracks: [
      { inst: 'kick', pat: 'X.....X.....|X.....X.....', vol: 0.95 },
      { inst: 'snare', pat: 'o.oX.oo.oX.o|o.oX.oo.o2.3', vol: 0.9 },
      { inst: 'ride', pat: 'X.xX.xX.xX.x|X.xX.xX.xX.x', vol: 0.5 },
      { inst: 'tambourine', pat: 'x.xx.xx.xx.x|x.xx.xx.xx.x', vol: 0.5 },
    ],
    roles: {
      kick: 'Pocket pulse on beats 1 and 3 of both bars.',
      snare: 'Ghost-triplet pocket in bar 1; bar 2 turns the last beat into a roll.',
      ride: 'The 12/8 shuffle thread.',
      tambourine: 'Unshakable second timekeeper across the turn.',
    },
    variations: [
      {
        name: 'Kick turnaround',
        note: 'Answer the snare roll with kick triplets on the last beat of bar 2.',
        overrides: { kick: 'X.....X.....|X.....X..xxx' },
      },
      {
        name: 'Quadruple turn',
        note: 'Make both turns of the last beat quadruple-stroke for the big church ending.',
        overrides: { snare: 'o.oX.oo.oX.o|o.oX.oo.o4.4' },
      },
    ],
    related: ['gospel-12-8', 'gospel-pocket-halftime', 'gospel-shout'],
    source: {
      type: 'original',
      note: 'Original composition: two-bar gospel shuffle pocket with a ratchet-roll turnaround.',
    },
  },
]
