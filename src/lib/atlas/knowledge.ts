import type { GroovePattern } from './types'

/**
 * knowledge.ts — the "story layer" of the catalog.
 *
 * Two levels of curated context:
 *  1. FAMILY_KNOWLEDGE — per style family: where it comes from, when, how it
 *     evolved, who plays it, what to listen to.
 *  2. PATTERN_KNOWLEDGE — per famous groove: the specific story (e.g. the
 *     Amen break on "Amen, Brother", Funky Drummer on the James Brown record).
 *
 * `knowledgeFor()` merges both levels for a pattern so the UI/API can render
 * one consistent "story & origins" block. Every field degrades gracefully —
 * if the family entry is missing the section simply shows less.
 */

export interface ListenPick {
  title: string
  artist: string
  year?: string
  note?: string
}

export interface FamilyKnowledge {
  /** country or countries the style was born in, e.g. "Cuba" */
  origin: string
  /** broader region, e.g. "Caribbean" */
  region: string
  /** when the style (or its drum vocabulary) emerged, e.g. "late 1950s–present" */
  era: string
  /** one-line classification, e.g. "Afro-Cuban folkloric → popular dance music" */
  classification: string
  /** 2–4 paragraphs of history and evolution */
  history: string[]
  /** key artists / bands that define the style's drum language */
  artists: string[]
  /** records to hear the style on */
  listening: ListenPick[]
  /** surprising, memorable facts */
  didYouKnow?: string[]
  /** family keys that influenced or are related */
  relatedFamilies?: string[]
}

export interface PatternKnowledge {
  /** pattern-specific origin if it differs from / sharpens the family story */
  origin?: string
  era?: string
  /** pattern-specific history, e.g. the recording it comes from */
  history?: string[]
  artists?: string[]
  listening?: ListenPick[]
  didYouKnow?: string[]
}

/** per-family curated knowledge — keyed by FAMILY_LIST key */
export const FAMILY_KNOWLEDGE: Record<string, FamilyKnowledge> = {
  rock: {
    origin: 'United States',
    region: 'North America',
    era: 'mid-1950s–present',
    classification: 'Blues-derived popular music organized around the 2 & 4 backbeat',
    history: [
      'Rock & roll surfaced in the mid-1950s when blues, country and gospel met electrified rhythm sections: Chuck Berry, Little Richard and Elvis Presley put a driving backbeat — kick on 1 and 3, snare on 2 and 4 — at the centre of popular culture. That simple bar, played with feel rather than precision, became the most repeated drum figure on Earth.',
      'The 1960s British Invasion and studio-era rock pushed the kit in two directions at once: Ringo Starr proved song-serving economy could be iconic, Keith Moon treated the kit like an orchestra on fire, and John Bonham fused blues power with a monolithic low end. Charlie Watts, meanwhile, made restraint a style — the pocket over the fill.',
      'Post-punk, heavy rock, grunge and indie multiplied the vocabulary (motorik drives, half-time stomps, quiet-loud dynamics), and modern rock drumming borrows freely from funk ghost notes, hip-hop offsets and grid-tight electronics. Through every fashion, the backbeat has survived intact — it is the genre’s load-bearing wall.',
    ],
    artists: ['John Bonham', 'Charlie Watts', 'Keith Moon', 'Ringo Starr', 'Levon Helm', 'Ian Paice', 'Dave Grohl', 'Meg White'],
    listening: [
      { title: 'When the Levee Breaks', artist: 'Led Zeppelin', year: '1971', note: 'Bonham at the foot of a stairwell — the most imitated rock drum sound ever committed to tape.' },
      { title: 'Gimme Shelter', artist: 'The Rolling Stones', year: '1969', note: 'Charlie Watts proving a rock backbeat can swing and menace at the same time.' },
      { title: 'My Generation', artist: 'The Who', year: '1965', note: 'Keith Moon detonating the rule that drums are accompaniment.' },
      { title: 'Bloodbuzz Ohio', artist: 'The National', year: '2010', note: 'Bryan Devendorf’s interlocking engine — modern rock pocket at its best.' },
    ],
    didYouKnow: [
      'The huge drum sound on “When the Levee Breaks” came from placing Bonham’s kit at the foot of Headley Grange’s staircase and aiming the microphones up the steps.',
      'Meg White’s four-on-the-floor-and-snare simplicity on “Seven Nation Army” (2003) became one of the most imitated rock beats of the century.',
    ],
    relatedFamilies: ['blues', 'punk', 'metal', 'pop', 'country'],
  },
  pop: {
    origin: 'United States & United Kingdom',
    region: 'North America / Europe',
    era: 'mid-1950s–present',
    classification: 'Chart-oriented popular music — from session drummers to programmed grids',
    history: [
      'Pop built its drum engine by borrowing: rock’s backbeat, soul’s pocket and dance’s four-on-the-floor, polished for radio. The LA session scene gave it an architecture — Hal Blaine and the Wrecking Crew turned the downbeat into an event, and the introduction of “Be My Baby” (1963) is arguably the most copied bar in pop history.',
      'The 1980s replaced the drummer with the machine: LinnDrum and 808 grids carried “Thriller”, “Purple Rain” and “1999”, while programmers learned to humanize the grid with ghost notes, velocity tiers and swing. The drum chair became a production role without losing its funk.',
      'Since the 1990s, pop drums have been hybrid by default — programmed kick-and-bass frameworks with live overdubs, all aimed at the dance floor. Whether it comes from a laptop or a booth, the style still lives and dies by the same thing: a 2 & 4 snap you can feel through a phone speaker.',
    ],
    artists: ['Hal Blaine', 'Ndugu Chancler', 'Jim Keltner', 'Steve Ferrone', 'Sheila E.', 'Timbaland', 'Max Martin & Shellback (production)'],
    listening: [
      { title: 'Be My Baby', artist: 'The Ronettes', year: '1963', note: 'Hal Blaine’s floor-tom-heavy downbeat blueprint.' },
      { title: 'Billie Jean', artist: 'Michael Jackson', year: '1982', note: 'Ndugu Chancler’s unfailing four-minute loop.' },
      { title: '1999', artist: 'Prince', year: '1982', note: 'LinnDrum bounce that taught a decade to dance.' },
      { title: 'Uptown Funk', artist: 'Mark Ronson feat. Bruno Mars', year: '2014', note: 'Sixties funk drumming rebuilt for the streaming era.' },
    ],
    didYouKnow: [
      'Hal Blaine played on dozens of US number ones and is credited with coining the name “the Wrecking Crew” for the LA session elite.',
      'Quincy Jones famously pushed for the “Billie Jean” intro to stay exactly as recorded — the groove was already perfect, so the band ran it untouched.',
    ],
    relatedFamilies: ['rock', 'funk', 'disco', 'rnb', 'synthwave'],
  },
  metal: {
    origin: 'United Kingdom & United States',
    region: 'Europe / North America',
    era: 'late 1960s–present',
    classification: 'Amplified blues-rock escalated into precision power drumming',
    history: [
      'Metal’s founding drum style came from British blues-rock turned up to destruction: Bill Ward’s swinging doom behind Black Sabbath and Ian Paice’s hard-rock drives behind Deep Purple set the template — heavy, human and harmonically dark.',
      'The 1980s split the style into technical lineages. NWOBHM codified the gallop (Iron Maiden’s Nicko McBrain and Clive Burr), thrash industrialized the double bass (Dave Lombardo in Slayer, Metallica’s expanding foot technique), and grindcore invented the blast beat — Napalm Death’s Mick Harris and Terrorizer-era Pete Sandoval turned alternating kick-snare sixteenths into a machine-gun discipline.',
      'From there metal absorbed everything: death metal’s polyrhythms (Gene Hoglan, Sean Reinert), Pantera-school power grooves, djent’s Meshuggah-school metric displacement, and metalcore’s half-time breakdowns. Foot technique and relaxed speed became athletic disciplines — and Blast beats, gallops and double-kick sprints are now a global shared language.',
    ],
    artists: ['Bill Ward', 'Ian Paice', 'Nicko McBrain', 'Dave Lombardo', 'Pete Sandoval', 'Gene Hoglan', 'Tomas Haake', 'Mario Duplantier'],
    listening: [
      { title: 'War Pigs', artist: 'Black Sabbath', year: '1970', note: 'Bill Ward’s swinging, human heavy-metal drumming.' },
      { title: 'The Trooper', artist: 'Iron Maiden', year: '1983', note: 'The definitive gallop — eight legs and never a wobble.' },
      { title: 'Angel of Death', artist: 'Slayer', year: '1986', note: 'Dave Lombardo’s double-bass engine at full thrust.' },
      { title: 'New Millennium Cyanide Christ', artist: 'Meshuggah', year: '2002', note: 'Tomas Haake’s polymetric kick choreography.' },
    ],
    didYouKnow: [
      'Elite blast-beat players sustain the alternating figure above 240 BPM by relaxing the ankles and letting gravity rebound the beat — tension is the enemy.',
      'Motörhead’s Phil “Philthy Animal” Taylor, a founding heavy-metal drummer, cited both rock and dance records as references for his relentless drive.',
    ],
    relatedFamilies: ['rock', 'punk', 'experimental', 'fills'],
  },
  punk: {
    origin: 'United States & United Kingdom',
    region: 'North America / Europe',
    era: 'mid-1970s–present',
    classification: 'Fast, loud backbeat minimalism — attitude before chops',
    history: [
      'Punk stripped rock to its skeleton. In mid-1970s New York the Ramones defined the style — Tommy Ramone’s straight eighths, kick on 1 and 3, snare on 2 and 4, leaning forward at speed. Three chords, one bar, no ornament.',
      'UK punk (Sex Pistols, The Clash) added reggae and rocksteady fluency — The Clash’s Topper Headon was a schooled ska and jazz player — while American hardcore (Black Flag, Minor Threat, Bad Brains) pushed tempos toward and past 200 BPM with d-beat, thrash and anti-solo snare work.',
      'The Discharge-designed “D-beat” (circa 1980) became its own skeleton for Swedish käng and Japanese hardcore. Later waves — pop-punk, skate punk, street punk, Oi! — kept the same grammar: relentless eighths, crashing quarters, and drums whose honesty matters more than their vocabulary.',
    ],
    artists: ['Tommy Ramone', 'Paul Cook', 'Topper Headon', 'Earl Hudson', 'Bill Stevenson', 'Terry “Tezz” Roberts', 'Jeff Nelson'],
    listening: [
      { title: 'Blitzkrieg Bop', artist: 'Ramones', year: '1976', note: 'The punk bar of truth — straight eighths and a shout.' },
      { title: 'Hear Nothing See Nothing Say Nothing', artist: 'Discharge', year: '1982', note: 'The record that defined D-beat.' },
      { title: 'I Against I', artist: 'Bad Brains', year: '1986', note: 'Earl Hudson’s reggae-rooted hardcore pocket.' },
    ],
    didYouKnow: [
      'D-beat is literally named after Discharge — the “D” is the first letter of the band’s name.',
      'Topper Headon, punk’s most technically fluent drummer, also played the piano and bass parts on the Clash’s “Rock the Casbah”.',
    ],
    relatedFamilies: ['rock', 'metal', 'ska', 'blues'],
  },
  country: {
    origin: 'United States (Appalachia & the American South)',
    region: 'North America',
    era: '1920s roots; drum kit from the 1950s',
    classification: 'Folk, railroad and honky-tonk rhythm adapted to the drum kit',
    history: [
      'Country began as fiddle-and-banjo string-band music with no kit at all — the pulse came from the railroad and the bow. Drums entered slowly and from the studio: Nashville A-Team pioneer Buddy Harman helped normalize the drum chair through the late 1950s after the Opry-era resistance faded.',
      'The style’s signature vocabulary is the train beat: ghosted sixteenth-note snare “chuff” under accented backbeats, echoing the steam locomotive that carried the music. Around it live the boom-chuck two-step, the swung honky-tonk shuffle and bluegrass’s mandolin-chop drive translated to rimshots.',
      'Modern country is a rhythm-section melting pot — Texas swing, Southern rock and pop balladry all flow through it — but the train beat remains the style’s drum fingerprint, and bluegrass drive (fast quarter-note bass, off-beat chops) still shapes how session players hear a back porch.',
    ],
    artists: ['Buddy Harman', 'W.S. “Fluke” Holland', 'Larrie Londin', 'Eddie Bayers', 'Shannon Forrest'],
    listening: [
      { title: 'Folsom Prison Blues (Live at Folsom Prison)', artist: 'Johnny Cash', year: '1968', note: 'W.S. Holland’s freight-train chug in front of the inmates.' },
      { title: 'Blue Moon of Kentucky', artist: 'Bill Monroe & his Blue Grass Boys', year: '1946', note: 'The pre-kit bluegrass pulse every country drummer internalizes.' },
      { title: 'Crazy', artist: 'Patsy Cline', year: '1961', note: 'Brushes and Nashville polish from the A-Team era.' },
    ],
    didYouKnow: [
      'The Grand Ole Opry was famously slow to allow drum kits on its stage, so country’s first great drummers built the style’s vocabulary behind the glass of Nashville studios.',
      'The train beat is pure onomatopoeia: ghosted snare strokes mimic the “chuh-chuh” of steam, and the accented backbeats are the whistle and the crossing bell.',
    ],
    relatedFamilies: ['blues', 'rock', 'gospel', 'pop'],
  },
  gospel: {
    origin: 'United States (Black church traditions)',
    region: 'North America',
    era: 'early 20th century–present',
    classification: 'Sacred music of the Black American church — from ring shout to praise break',
    history: [
      'Gospel drumming grew out of the ring shout and hymn traditions that Thomas A. Dorsey’s gospel blues formalized in the 1930s. The church band’s job was ecstatic: push the congregation, follow the preacher, and lift every chorus into the rafters.',
      'Shout music — the fast, driving climax played while congregants “get happy” — produced a dense, syncopated kit style with tambourine, walking bass drum and relentless backbeats. Long before drum clinics existed, church drummers were trading chops every Sunday, and the tradition demanded both fire and discipline.',
      'That lineage reshaped popular drumming: the linear phrases, ghost-note licks and blazing praise-break double-time heard across modern R&B, hip-hop and pop came straight out of Black churches. The “gospel chops” generation of the 2000s made the church the most advanced open drum school on the planet.',
    ],
    artists: ['Marvin McQuitty', 'Aaron Spears', 'Calvin Rodgers', 'Gerald Heyward', 'Chris Coleman', 'Tony Royster Jr.', 'Nate Smith'],
    listening: [
      { title: 'Caught Up', artist: 'Israel & New Breed', year: '2005', note: 'Aaron Spears’ fill heard round the world.' },
      { title: 'Stomp', artist: 'Kirk Franklin', year: '1997', note: 'Gospel bounce with mainstream club power.' },
      { title: 'Is My Living in Vain', artist: 'The Clark Sisters', year: '1980', note: 'Live church pocket at its most joyful.' },
    ],
    didYouKnow: [
      'The ring shout — a counterclockwise shuffle-and-clap ceremony — is among the oldest continuous Black American musical practices, and its accent pattern still echoes in gospel drumming.',
      'Many first-call pop and R&B drummers of the last thirty years learned their trade exclusively in church, without a single formal lesson.',
    ],
    relatedFamilies: ['blues', 'rnb', 'funk', 'rock', 'hiphop'],
  },
  blues: {
    origin: 'United States (Mississippi Delta → Chicago & Texas)',
    region: 'North America',
    era: 'late 19th century–present',
    classification: 'African-American folk blues and its amplified shuffle descendants',
    history: [
      'Field hollers and Delta guitar blues carried the triplet “sigh” that became blues drumming’s DNA. When the music electrified in post-war Chicago, drummers like Fred Below built the electric blues kit language: shuffle ride, swung backbeat, and kick drops placed like punctuation.',
      'Regional schools formed distinct drum identities. Texas shuffles walk a quarter-note bass under a triplet ride — the school Stevie Ray Vaughan’s Chris Layton perfected. The 12/8 slow blues stretches every phrase into triplets, and boogie-woogie shuffles turn the kick drum into a walking bass line.',
      'Blues drumming’s core lesson is economy: every fill answers a vocal phrase, and space is part of the form. Its grammar — the shuffle, the 12-bar structure, the stop-time break — underwrites rock, funk, country and jazz alike, which is why blues remains every drummer’s first theory class.',
    ],
    artists: ['Fred Below', 'Sam Lay', 'Chris Layton', 'Jim Keltner'],
    listening: [
      { title: 'I’m Your Hoochie Coochie Man', artist: 'Muddy Waters', year: '1954', note: 'Fred Below’s stop-time swagger — the electric blues kit defined.' },
      { title: 'Pride and Joy', artist: 'Stevie Ray Vaughan & Double Trouble', year: '1983', note: 'Chris Layton’s textbook Texas shuffle.' },
      { title: 'The Sky Is Crying', artist: 'Elmore James', year: '1959', note: 'The 12/8 slow-blues pulse at its most sighing.' },
    ],
    didYouKnow: [
      'John Lee Hooker made his earliest classics with no drummer at all — he stamped the tempo with his foot, and the records groove anyway.',
      'The triplet “long-short” feel of a shuffle and the even 12/8 of a slow blues share one grid: blues drummers learn to slide between them mid-song.',
    ],
    relatedFamilies: ['rock', 'jazz', 'country', 'gospel', 'funk'],
  },
  funk: {
    origin: 'United States (James Brown’s band & New Orleans)',
    region: 'North America',
    era: 'mid-1960s–present',
    classification: 'Rhythm-first dance music built on syncopation and the One',
    history: [
      'Funk was engineered by James Brown and his drummers in the mid-1960s. “Papa’s Got a Brand New Bag” (1965) and “Cold Sweat” (1967) dissolved chord changes into rhythm — one chord, endless groove, every instrument playing percussion. Clyde Stubblefield’s “Funky Drummer” break (1969) would become the most sampled groove in history.',
      'New Orleans contributed the other half of funk grammar: The Meters’ Zigaboo Modeliste turned second-line street beats into stuttering, ghost-note-heavy funk (“Cissy Strut”, 1969), influencing everyone from P-Funk to hip-hop producers.',
      'The style’s technical signature is the sixteenth-note grid with selectively accented hits, ghosted snare filling the cracks, and drums that “talk” — a direct inheritance from church and New Orleans parade traditions. From Tower of Power to Ohio Players to Parliament-Funkadelic, the funk drum chair has always demanded machine precision and conversational looseness at once.',
    ],
    artists: ['Clyde Stubblefield', 'John “Jabo” Starks', 'Zigaboo Modeliste', 'David Garibaldi', 'Mike Clark', 'Steve Ferrone', 'Dennis Chambers'],
    listening: [
      { title: 'Cold Sweat (Pt. 1)', artist: 'James Brown', year: '1967', note: 'The moment rhythm replaced harmony.' },
      { title: 'Cissy Strut', artist: 'The Meters', year: '1969', note: 'Zigaboo’s two-note kick hook and ghost-riddled backbeat.' },
      { title: 'Funky Drummer (Pt. 1 & 2)', artist: 'James Brown', year: '1970', note: 'The break that built hip-hop.' },
      { title: 'Actual Proof', artist: 'Herbie Hancock', year: '1974', note: 'Mike Clark reading the meter like a conversation.' },
    ],
    didYouKnow: [
      'James Brown reportedly fined band members for missing the “One” — the downbeat that everything else exists to slam.',
      'The “Funky Drummer” break happened in one take with no rehearsal — Brown announces and conducts it live on the tape.',
    ],
    relatedFamilies: ['rnb', 'hiphop', 'blues', 'jazz', 'disco'],
  },
  rnb: {
    origin: 'United States',
    region: 'North America',
    era: '1940s–present',
    classification: 'Jump blues → soul → modern R&B: the mainstream voice of Black American music',
    history: [
      'R&B began as post-war jump blues — small bands, boogie shuffle, horns — then matured into 1960s soul. The era’s definitive drum chairs: Motown’s Funk Brothers (Benny Benjamin’s tap-and-snap, with Uriel Jones and Richard “Pistol” Allen rotating beside him), Stax’s Al Jackson Jr. behind Otis Redding and Booker T. & the MG’s, and Muscle Shoals’ Roger Hawkins.',
      'The 1970s and 80s added Philadelphia’s four-on-the-floor sophistication and then the machine age: LinnDrum boogie, the Minneapolis sound of Prince and The Time, and Teddy Riley’s new jack swing, which swung programmed sixteenths directly into hip-hop territory.',
      'Modern R&B drums borrow from hip-hop’s half-time and trap architecture while keeping soul’s pocket: rolling hats, displaced snares and 808s that sing. The ghost notes of the session legends survive inside every DAW project — the tradition is the grid’s soul.',
    ],
    artists: ['Al Jackson Jr.', 'Benny Benjamin', 'Roger Hawkins', 'James Gadson', 'Steve Ferrone', 'Teddy Riley', 'Questlove'],
    listening: [
      { title: 'Respect', artist: 'Aretha Franklin', year: '1967', note: 'Roger Hawkins’ Muscle Shoals punch behind the Queen of Soul.' },
      { title: 'Green Onions', artist: 'Booker T. & the MG’s', year: '1962', note: 'Al Jackson Jr. laying down the soul backbone.' },
      { title: 'My Prerogative', artist: 'Bobby Brown', year: '1988', note: 'New jack swing’s swung-machine blueprint.' },
      { title: 'You Got Me', artist: 'The Roots feat. Erykah Badu', year: '1999', note: 'Questlove bridging soul pocket and hip-hop break science.' },
    ],
    didYouKnow: [
      'Al Jackson Jr. was called “the Human Timekeeper” — he played on virtually every Stax hit while also co-writing many of them.',
      'Motown hits were cut by the Funk Brothers, whose drum chair rotated between Benny Benjamin, Uriel Jones and Richard “Pistol” Allen — sometimes within the same week.',
    ],
    relatedFamilies: ['funk', 'disco', 'hiphop', 'gospel', 'blues'],
  },
  disco: {
    origin: 'United States (Philadelphia & New York)',
    region: 'North America',
    era: 'early 1970s–present (through house and nu-disco descendants)',
    classification: 'Four-on-the-floor dance music engineered for the club',
    history: [
      'Disco codified the four-on-the-floor kick. Earl Young of the Philadelphia scene is widely credited with locking the steady quarter-note kick around 1973–74 (“The Love I Lost”), freeing the hi-hat to pump the off-beats and the strings to soar above an unbroken floor.',
      'New York’s club culture — the Loft, Studio 54, the Paradise Garage — turned the style into an empire, and 1977’s Saturday Night Fever took it global. Studio drummers like CHIC’s Tony Thompson fused funk precision with disco’s continuous motion: sixteenth hats, rimshot backbeats, no stops, no dead air.',
      'The genre’s nominal death around 1979–80 was only the end of the name. Its drum architecture rebooted as post-disco boogie, then house, then effectively everything electronic. Every dance record since is a disco variation — same floor, new furniture.',
    ],
    artists: ['Earl Young', 'Tony Thompson', 'James Gadson', 'Dennis Bryon', 'Nile Rodgers (CHIC)', 'Giorgio Moroder (programming)'],
    listening: [
      { title: 'The Love I Lost', artist: 'Harold Melvin & the Blue Notes', year: '1973', note: 'Earl Young’s four-on-the-floor prototype.' },
      { title: 'Good Times', artist: 'CHIC', year: '1979', note: 'Tony Thompson’s sixteenth-hat funk precision.' },
      { title: 'I Feel Love', artist: 'Donna Summer', year: '1977', note: 'Giorgio Moroder’s sequenced future of dance drums.' },
      { title: 'Stayin’ Alive', artist: 'Bee Gees', year: '1977', note: 'The groove the whole world carries in its pulse.' },
    ],
    didYouKnow: [
      'CPR trainers recommend compressions at about 103 BPM — the tempo of “Stayin’ Alive” — which is why the song is a medical reference standard.',
      'Disco drum parts were engineered to loop seamlessly for DJs: the goal was a floor you could dance on all night without ever feeling the bar line.',
    ],
    relatedFamilies: ['house', 'funk', 'rnb', 'techno', 'garage'],
  },
  jazz: {
    origin: 'United States (New Orleans)',
    region: 'North America',
    era: 'early 1900s–present',
    classification: 'Improvised music where the drummer keeps time on the ride cymbal — and breaks it',
    history: [
      'Jazz drumming was born in New Orleans street bands and riverboat groups: Baby Dodds translated parade bass-drum-and-snare vocabulary onto the kit. In the swing era, Jo Jones of Count Basie’s band moved the pulse to a whisper-light hi-hat on 2 and 4 — the first great refinement of swing time.',
      'Bebop (early 1940s, Minton’s Playhouse) handed the drummer the melody’s chaos. Kenny Clarke moved the beat up to the ride cymbal and began “dropping bombs” — sudden kick-and-snare accents — while Max Roach turned comping into counter-melody, with timbre and dynamics as vocabulary.',
      'Hard bop (Art Blakey’s Afro-rooted power, Philly Joe Jones’ brushwork) and the modal era (Elvin Jones’ rolling triplets, Tony Williams’ controlled fire) made the kit a full conversational partner. Modern jazz drumming folds in brushes, ostinatos and electronics, but the ride-swing axis remains its grammar.',
    ],
    artists: ['Baby Dodds', 'Jo Jones', 'Kenny Clarke', 'Max Roach', 'Art Blakey', 'Elvin Jones', 'Tony Williams', 'Jack DeJohnette'],
    listening: [
      { title: 'Moanin’', artist: 'Art Blakey & the Jazz Messengers', year: '1958', note: 'Hard-bop power with a gospel backbone.' },
      { title: 'A Love Supreme', artist: 'John Coltrane', year: '1965', note: 'Elvin Jones’ rolling triplet liturgy.' },
      { title: 'Ko-Ko', artist: 'Charlie Parker', year: '1945', note: 'Max Roach’s bebop fireworks.' },
      { title: 'The Drum Also Waltzes', artist: 'Max Roach', year: '1961', note: 'Two minutes that taught a century of drummers.' },
    ],
    didYouKnow: [
      '“Spang-a-lang” — one swung eighth plus two — is the ride-cymbal pattern jazz treats as closest thing it has to a law.',
      'Max Roach’s “The Drum Also Waltzes” is a solo in 3/4 that musicians from Neil Peart to Steve Coleman have openly studied as composition.',
    ],
    relatedFamilies: ['blues', 'bossa', 'funk', 'hiphop', 'fills'],
  },
  bossa: {
    origin: 'Brazil (Rio de Janeiro)',
    region: 'South America',
    era: 'late 1950s–present',
    classification: 'Samba softened and harmonized — a lyricism built on the clave',
    history: [
      'Bossa nova crystallized in late-1950s Rio when João Gilberto’s whispery guitar, Tom Jobim’s harmonies and Vinicius de Moraes’ poetry distilled samba’s syncopation into something intimate — “Chega de Saudade” (1958) is the landmark single.',
      'Drummers translated the style for the kit: the kick mimics the surdo’s soft pulse, the rimshot carries the bossa clave (a 3-2 timeline), and the hat pedal marks quarter notes like a metronome. Milton Banana’s playing on Getz/Gilberto (1964) remains the textbook.',
      'The jazz world adopted bossa wholesale after Stan Getz’s crossover with Charlie Byrd and Gilberto, and it has become a universal jazz-standard language — from 1960s jazz-samba to the modern Brazilian instrumental scene that keeps refining its brush-stroke precision.',
    ],
    artists: ['Milton Banana', 'Dom Um Romão', 'Airto Moreira', 'Robertinho Silva', 'Paulo Braga'],
    listening: [
      { title: 'The Girl from Ipanema', artist: 'Stan Getz & João Gilberto', year: '1964', note: 'Milton Banana’s kit bossa — the global reference.' },
      { title: 'Chega de Saudade', artist: 'João Gilberto', year: '1958', note: 'The record that started it all.' },
      { title: 'Desafinado', artist: 'Stan Getz & Charlie Byrd', year: '1962', note: 'Jazz Samba — bossa’s American beachhead.' },
    ],
    didYouKnow: [
      'Bossa’s rim clave is the same 3-2 timeline Cuban music uses — another sign that the Atlantic world shares a rhythmic spine.',
      'João Gilberto reportedly shut himself away for months perfecting a guitar attack soft enough to sing over — bossa’s hush is a design choice, not an accident.',
    ],
    relatedFamilies: ['samba', 'jazz', 'latin', 'world'],
  },
  samba: {
    origin: 'Brazil (Rio de Janeiro & Bahia)',
    region: 'South America',
    era: 'early 20th century–present',
    classification: 'Afro-Brazilian carnival music — the percussion ensemble as democracy',
    history: [
      'Samba grew from Afro-Brazilian batuque circles in early-20th-century Rio and became the sound of Carnival through the escolas de samba, whose bateria — hundreds of drummers — is organized like an orchestra: surdos on the bass line, caixas, tamborins, agogôs, chocalhos, cuícas and repiniques interlocking above.',
      'The drum-kit world borrowed selectively: batucada’s surdo pulse with its characteristic pickups (the antecipações), partido alto’s interlocking two-bar timeline, and the pandeiro’s thumb-and-slap vocabulary all map onto kick, snare and hats.',
      'Bahia added the heavyweight chapter: the blocos afros of Salvador — Ilê Aiyê (founded 1975) and Olodum (1979) — fused samba with reggae and Yoruba-rooted grooves into samba-reggae, whose 3+3+2 bass timeline conquered world stages through Paul Simon and Michael Jackson.',
    ],
    artists: ['Neguinho do Samba', 'Grupo Fundo de Quintal', 'Monobloco', 'Timbalada', 'Naná Vasconcelos', 'Cyro Baptista'],
    listening: [
      { title: 'The Obvious Child', artist: 'Paul Simon', year: '1990', note: 'Olodum’s drummers detonate the samba-reggae timeline.' },
      { title: 'Mas Que Nada', artist: 'Sérgio Mendes & Brasil ’66', year: '1966', note: 'Samba’s sly syncopation in pop clothes.' },
      { title: 'Samba-Enredo (annual Carnaval albums)', artist: 'Mangueira, Portela & Salgueiro samba schools', note: 'The bateria in full: listen for the surdo line under everything.' },
    ],
    didYouKnow: [
      'A top samba school’s bateria can exceed 300 drummers; the mestre de bateria conducts across the avenue with a whistle and hand signals.',
      'The cuíca — the “laughing” friction drum — is one of the few percussion instruments that sings intervals; its stick is rubbed, not struck.',
    ],
    relatedFamilies: ['bossa', 'latin', 'world', 'afrobeat', 'reggae'],
  },
  latin: {
    origin: 'Cuba (and the wider Caribbean)',
    region: 'Caribbean / Latin America',
    era: 'late 19th century–present',
    classification: 'Music organized around the clave timeline and interlocking percussion',
    history: [
      'Afro-Cuban music’s organizing principle is the clave — a five-stroke timeline in 3-2 or 2-3 orientation that every part must obey. It came from West African bell patterns through Cuban rumba, son and danzón, and it underwrites mambo, cha-cha-chá, songo, timba and most of what the world calls “Latin”.',
      'The congas, bongó, timbales, güiro and cowbell interlock above the timeline: rumba’s salidor-and-quinto dialogue, the bongó martillo of son, the cáscara bell patterns of mambo. New York’s Palladium era — Tito Puente, Machito, Tito Rodríguez — globalized the sound in the 1950s.',
      'The drum kit entered Cuban music late: songo (Los Van Van’s Changuito, early 1970s) and timba folded it into the percussion section, with the kick doubling the low conga and the hat carrying cáscara. Outside Cuba, merengue, cumbia and bachata keep their own timelines — all cousins of the same African inheritance.',
    ],
    artists: ['Changuito', 'Tata Güines', 'Tito Puente', 'Mongo Santamaría', 'Cándido Camero', 'Horacio “El Negro” Hernández', 'Los Muñequitos de Matanzas'],
    listening: [
      { title: 'Dance Mania', artist: 'Tito Puente', year: '1958', note: 'The Palladium-era bell-and-timbale engine.' },
      { title: 'Afro Blue', artist: 'Mongo Santamaría', year: '1959', note: 'The 6/8 bell pattern bridging bembé tradition and jazz.' },
      { title: 'Songo-era recordings', artist: 'Juan Formell & Los Van Van', note: 'The drum kit made a naturalized Cuban citizen.' },
    ],
    didYouKnow: [
      'In son, flipping from 3-2 to 2-3 clave mid-song is a composition event — the whole arrangement re-orients around the timeline.',
      '“Afro Blue,” Mongo Santamaría’s 1959 standard, is built on a 6/8 bell figure straight out of the bembé tradition — later a jazz standard through Coltrane.',
    ],
    relatedFamilies: ['samba', 'bossa', 'reggae', 'world', 'jazz'],
  },
  reggae: {
    origin: 'Jamaica',
    region: 'Caribbean',
    era: 'late 1960s–present',
    classification: 'Backbeat-averse island music — space, depth and the one-drop',
    history: [
      'Reggae emerged in Kingston in the late 1960s as the slowed child of ska and rocksteady. Its defining beat, the one-drop, inverts rock logic: kick and rim together on beat 3 only — the snare never on 2 and 4. Carlton Barrett of the Wailers made it immortal.',
      'Producers then treated the drums like clay. King Tubby and Lee “Scratch” Perry built dub by muting, echoing and drowning the drum track, turning the drummer’s rests into architecture. Steppers (kick on all four) and rockers (kick everywhere with the one-drop rim) became the style’s other great engines.',
      'Reggae’s drummers are minimalist masters: everything sits behind the beat, the hi-hat often plays a lazy “bubble”, and the space between hits carries the message. Its DNA flows through dancehall, trip-hop, UK bass music and nearly every genre that loves low end.',
    ],
    artists: ['Carlton Barrett', 'Sly Dunbar', 'Leroy “Horsemouth” Wallace', 'Santa Davis', 'Winston Grennan', 'Style Scott'],
    listening: [
      { title: 'One Drop', artist: 'Bob Marley & the Wailers', year: '1979', note: 'Carlton Barrett’s definitive statement of the beat.' },
      { title: 'King Tubby Meets Rockers Uptown', artist: 'Augustus Pablo', year: '1976', note: 'Dub space used as an instrument.' },
      { title: 'Marcus Garvey', artist: 'Burning Spear', year: '1975', note: 'Roots-reggae weight and patience.' },
    ],
    didYouKnow: [
      'In one-drop the “one” is literally dropped — the strongest beat of the bar receives no drum hit at all.',
      'King Tubby mixed his dubs live on a modified two-track remix desk, riding faders like an instrument — the birth of the producer as performer.',
    ],
    relatedFamilies: ['ska', 'hiphop', 'dubstep', 'caribbean', 'world'],
  },
  ska: {
    origin: 'Jamaica',
    region: 'Caribbean',
    era: 'c. 1960–present',
    classification: 'Mento meets American R&B: the off-beat skank as a national sound',
    history: [
      'Ska arrived with Jamaica’s independence era when local bands fused mento, calypso and jazz with the American R&B and New Orleans grooves drifting over the radio. The signature move: a bright, accented upstroke — the skank — landing on the off-beats where rock plays nothing.',
      'The Skatalites’ Lloyd Knibb defined the drum language: rim clicks, ride accents and a disciplined kick-snare frame under frantic tempos. By 1966 the heat and economics of the island slowed the tempo into rocksteady, which in turn ripened into reggae.',
      'Ska’s second life came through Britain’s 2-Tone movement (The Specials, Madness, The Beat, 1979), which married the skank to punk urgency, and its third through the US third wave. The drum rule stayed constant across every wave: the backbeat can wait — the off-beat cannot.',
    ],
    artists: ['Lloyd Knibb', 'Winston Grennan', 'John Bradbury', 'Everett Morton', 'Daniel Woodgate'],
    listening: [
      { title: 'Guns of Navarone', artist: 'The Skatelites', note: 'Lloyd Knibb and the Skatalites at full sprint.' },
      { title: 'A Message to You Rudy', artist: 'The Specials', year: '1979', note: '2-Tone discipline: skank tight, snap harder.' },
      { title: 'Simmer Down', artist: 'The Wailers', year: '1964', note: 'First-wave ska — the Wailers backed by the Skatalites.' },
    ],
    didYouKnow: [
      '“Simmer Down” (1964), the Wailers’ first hit, was backed by the Skatalites — Bob Marley’s ska career predates reggae by half a decade.',
      'The skank is mento’s afterbeat sped up and electrified — the same off-beat pulse you hear in calypso’s strums.',
    ],
    relatedFamilies: ['reggae', 'punk', 'caribbean', 'rock'],
  },
  hiphop: {
    origin: 'United States (the Bronx, New York)',
    region: 'North America',
    era: 'early 1970s–present',
    classification: 'DJ-built beat culture — breaks, machines and sampled drums',
    history: [
      'Hip-hop’s drum kit was invented twice. First live: Kool Herc stretched the percussion breaks of funk records at early-1970s Bronx parties, looping the break for the dancers who became “break-boys”. Then in the studio: drum machines and samplers — the 808, the SP-1200, the MPC — replaced the band.',
      'The golden era (roughly 1986–96) built boom bap’s language: Marley Marl’s accidental drum sampling, DJ Premier’s chopped breaks, Pete Rock’s swung dust, Large Professor’s SP-1200 crunch. The 12-bit samplers’ grit became the aesthetic itself.',
      'Regional schools spread the grammar — Los Angeles’ G-funk lean, Memphis’ dark triplets, Atlanta’s trap bounce, New Orleans’ bounce, London’s 140 answer in grime. The drummer’s role became the producer, but the values remain drum-culture values: pocket, swing, the One, the head nod.',
    ],
    artists: ['Kool Herc', 'Marley Marl', 'DJ Premier', 'Pete Rock', 'J Dilla', 'Dr. Dre', 'Large Professor', 'Kanye West'],
    listening: [
      { title: 'The Message', artist: 'Grandmaster Flash & the Furious Five', year: '1982', note: 'Sugarhill house-band drums meeting early machine grids.' },
      { title: 'Mass Appeal', artist: 'Gang Starr', year: '1994', note: 'DJ Premier’s chopped-break architecture.' },
      { title: 'Donuts', artist: 'J Dilla', year: '2006', note: 'The drum loop as emotional monologue.' },
    ],
    didYouKnow: [
      'Marley Marl discovered drum sampling by accident in the mid-1980s when a drum hit bled into a vocal sample — an error that redefined beatmaking.',
      'The SP-1200’s 12-bit sampler and ten-second sample limit forced producers into the punchy, gritty loops that defined golden-era hip-hop.',
    ],
    relatedFamilies: ['funk', 'rnb', 'trap', 'jungle', 'lofi'],
  },
  trap: {
    origin: 'United States (Atlanta & the South)',
    region: 'North America',
    era: 'late 1990s–present',
    classification: 'Southern hip-hop architecture: half-time snare, rolling hats, 808 as bass line',
    history: [
      'Trap grew from Southern rap’s late-1990s ground — Memphis’ Three 6 Mafia, New Orleans’ Cash Money and No Limit, Atlanta’s Organized Noize — and took its name from the “trap”, the drug house at the centre of the lyrics.',
      'The drum grammar was set by the 2000s (T.I.’s Trap Muzik, Young Jeezy’s Thug Motivation): a half-time skeleton — snare only on beat 3 at 130–150 BPM — over an 808 kick that carries the bass melody, with hats rolling in sixteenth, thirty-second and triplet bursts.',
      'Lex Luger’s 2010 run (Flockaveli) globalized the sound, and producers like Metro Boomin and Zaytoven refined its cinematic menace. Trap’s half-time grid now underwrites pop, festival EDM and even metal — the triplet hat roll is the 21st century’s snare roll.',
    ],
    artists: ['Lex Luger', 'Metro Boomin', 'Zaytoven', 'Shawty Redd', 'Southside', 'Mannie Fresh (precursor)', 'DJ Paul & Juicy J (Three 6 Mafia)'],
    listening: [
      { title: 'Hard in da Paint', artist: 'Waka Flocka Flame', year: '2010', note: 'Lex Luger’s template-setting chaos.' },
      { title: 'Put On', artist: 'Young Jeezy feat. Kanye West', year: '2008', note: 'The 808-and-rolls Southern blueprint.' },
      { title: 'Mask Off', artist: 'Future', year: '2017', note: 'Minimal half-time menace with a flute where the melody should be.' },
    ],
    didYouKnow: [
      'Trap is notated around 140 BPM but felt at half that — the snare’s lonely beat 3 is why the music feels both frantic and frozen.',
      'The signature “ratchet” hat rolls began as a hardware workaround: thirty-second notes and triplet mashes were the fastest way to sound dangerous on an old sequencer.',
    ],
    relatedFamilies: ['hiphop', 'drill', 'club', 'dubstep', 'lofi'],
  },
  lofi: {
    origin: 'United States & Japan (internet-era culture)',
    region: 'Global',
    era: '1990s underground → 2010s streaming culture',
    classification: 'Downtempo, dusty, loop-based hip-hop for focus and calm',
    history: [
      'Lo-fi hip-hop descends from J Dilla’s warm, imperfect MPC loops and the Tokyo scene around Nujabes, whose jazzy, melancholy productions gave the genre its sound. “Lo-fi” originally meant a limitation — budget gear, tape hiss — and turned itself into an aesthetic.',
      'The 2010s YouTube era industrialized the mood: 24/7 “beats to relax/study to” streams and chillhop playlists made lo-fi the default background music of a generation, complete with vinyl crackle as a design element.',
      'Drum-wise, lo-fi is boom bap slowed down: swung hats at 70–90 BPM, soft kicks, muted snares, ghosts everywhere. Swing and dynamics do the work that loudness does in other genres — the genre’s hardest skill is making quiet feel big.',
    ],
    artists: ['J Dilla', 'Nujabes', 'Fat Jon', 'Ta-ku', 'Kupla', 'Jinsang'],
    listening: [
      { title: 'Donuts', artist: 'J Dilla', year: '2006', note: 'The emotional blueprint.' },
      { title: 'Modal Soul', artist: 'Nujabes', year: '2005', note: 'Jazzhop’s golden reference.' },
      { title: 'lofi hip hop radio – beats to relax/study to', artist: 'Lofi Girl (livestream)', year: '2017–present', note: 'The stream that made a genre infrastructure.' },
    ],
    didYouKnow: [
      'The vinyl crackle in most lo-fi tracks is a deliberate layer — surface-noise samples cue the brain into “old recording” mode.',
      'J Dilla programmed his drums unquantized — deliberately off the grid — to make machines sound like hands; that humanity is lo-fi’s core technique.',
    ],
    relatedFamilies: ['hiphop', 'jazz', 'rnb', 'trap'],
  },
  house: {
    origin: 'United States (Chicago)',
    region: 'North America → global',
    era: 'early 1980s–present',
    classification: 'Disco’s four-on-the-floor rebuilt on drum machines',
    history: [
      'House was born when Chicago DJs — Frankie Knuckles at the Warehouse, Ron Hardy at the Music Box — stretched disco into hypnotic, stripped-down loops, and local producers began making that music themselves. Jesse Saunders’ “On and On” (1984) is often cited as the first house record.',
      'Affordable machines wrote the genre’s drum language: the TR-808 and especially the TR-909 (1983) — whose soft kick, dry clap and metallic off-beat open hat remain the house default. Marshall Jefferson’s “Move Your Body” (1986) proved the format could carry melody and madness.',
      'Larry Heard deepened the palette with “Can You Feel It” (1986), whose 909-and-Juno haze defined deep house. From Chicago, house seeded New York garage, London’s acid Summer of Love (1988) and effectively every modern club genre — techno, UKG, Afro house and Jersey club are all its children.',
    ],
    artists: ['Frankie Knuckles', 'Ron Hardy', 'Larry Heard', 'Marshall Jefferson', 'Jesse Saunders', 'Kerri Chandler'],
    listening: [
      { title: 'Move Your Body', artist: 'Marshall Jefferson', year: '1986', note: 'The house anthem template.' },
      { title: 'Can You Feel It', artist: 'Mr. Fingers', year: '1986', note: 'Deep-house genesis on a 909.' },
      { title: 'Your Love', artist: 'Frankie Knuckles & Jamie Principle', year: '1987', note: 'The Warehouse era distilled.' },
    ],
    didYouKnow: [
      'The TR-909 was a commercial flop, which is exactly why it flooded second-hand shops — and how broke Chicago producers got their hands on house music’s drum engine.',
      'The genre is named after the Warehouse club — “house” was shorthand for the records played there.',
    ],
    relatedFamilies: ['disco', 'techno', 'garage', 'club', 'african'],
  },
  garage: {
    origin: 'United States (New York/New Jersey) → United Kingdom (London)',
    region: 'North America / Europe',
    era: 'mid-1990s–present',
    classification: 'Swung, chopped dance music — US garage soul rebuilt in the UK',
    history: [
      '“Garage” is New York’s Paradise Garage — Larry Levan’s church of a club — lending its name to a soulful, vocal strain of house. The UK took that DNA and warped it: speed garage (1997) pitched up rave bass, and by 1998–99 producers were cutting the kick pattern to pieces.',
      'UK garage’s 2-step became the era’s signature: kick on 1 and the “and” of 3, snare on 2 and 4, hats swung hard, everything skippy and syncopated. Todd Edwards’ gospel-chopped vocals and producers like El-B, MJ Cole, Wookie and Zed Bias built its architecture.',
      'Garage’s broken swing then fractured outward — into grime’s skeletal 140, into dubstep’s deep half-step, and into the 2000s–2020s revival scene (UK funky, bassline, modern 2-step) that keeps the syncopation alive on new floors.',
    ],
    artists: ['Todd Edwards', 'El-B', 'MJ Cole', 'Wookie', 'Zed Bias', 'Groove Chronicles'],
    listening: [
      { title: 'Ripgroove', artist: 'Double 99', year: '1997', note: 'Speed garage’s rave-shuffle peak.' },
      { title: 'Sincere', artist: 'MJ Cole', year: '2000', note: '2-step’s most elegant statement.' },
      { title: 'Saved My Life', artist: 'Todd Edwards', note: 'Vocal-chop church — the swing that taught UKG its lilt.' },
    ],
    didYouKnow: [
      'UK garage’s swing values run so high that the drums are practically triplet-adjacent — DJs had to learn to beatmatch “skippiness”, not straight beats.',
      'The Paradise Garage sold no alcohol; the music was the point, and Larry Levan’s booth was fitted like a recording studio.',
    ],
    relatedFamilies: ['house', 'jungle', 'dubstep', 'drill', 'club'],
  },
  jungle: {
    origin: 'United Kingdom (London)',
    region: 'Europe',
    era: 'early 1990s–present',
    classification: 'Breakbeat hardcore chopped to 160–170 BPM over reggae-weight bass',
    history: [
      'Jungle emerged in early-1990s London when hardcore rave producers sped up hip-hop and reggae breakbeats — most famously the Amen break — into frenetic, pitched edits over deep, dubwise bass. Ragga MCs gave it its first voice.',
      'The style’s drum grammar is the chopped break: kick-snare two-step skeletons plus ghost-snare chatter and sudden “edits” — stutters, reverses, ratchet rolls. Producers like Remarc turned the break itself into an instrument, phrase by phrase.',
      'By 1995–97 jungle matured into drum & bass — smooth “rollers”, atmospheric wings (LTJ Bukem), sci-fi precision (Photek, Source Direct) and Goldie’s crossover “Timeless”. The amen chop remains drum music’s most recognizable two bars.',
    ],
    artists: ['Shy FX', 'Remarc', 'Goldie', 'Dillinja', 'LTJ Bukem', 'Photek', 'Source Direct'],
    listening: [
      { title: 'Original Nuttah', artist: 'Shy FX & UK Apachi', year: '1994', note: 'Ragga jungle at its most joyful.' },
      { title: 'Timeless', artist: 'Goldie', year: '1995', note: 'Jungle’s symphonic coming-of-age.' },
      { title: 'Modus Operandi', artist: 'Photek', year: '1997', note: 'Drum programming as architecture.' },
    ],
    didYouKnow: [
      'The Amen break — four bars from The Winstons’ 1969 “Amen, Brother” — powers jungle almost single-handedly and is often cited as the most sampled drum loop ever recorded.',
      'Jungle DJs loved “double drops” — syncing two copies so breaks landed together — a ritual that later migrated into dubstep and UK bass culture.',
    ],
    relatedFamilies: ['breaks', 'garage', 'hiphop', 'reggae', 'techno'],
  },
  breaks: {
    origin: 'United Kingdom & United States',
    region: 'Europe / North America',
    era: '1970s (break as DJ technique) → 1990s (genre proper)',
    classification: 'The b-boy break elevated to a full genre: funk breaks at rave tempo',
    history: [
      'The breakbeat began as a DJ technique — isolating the drum break for dancers at Kool Herc’s Bronx parties — then became a genre when UK producers built whole tracks around sped-up funk breaks in the early 1990s.',
      'Its biggest pop wing was big beat: The Chemical Brothers, Fatboy Slim and The Prodigy shipped fat breakbeats with rock energy and festival-sized hooks. In the US, Florida breaks kept a rolling, Miami-bass-flavoured school alive, and nu-skool breaks dragged the tempo and deepened the bass.',
      'Breaks’ identity is the funk break itself — the Funky Drummer and Think loops, chopped and swung at 128–138. It is the bridge genre: between hip-hop’s dust and techno’s floor, between jungle’s speed and house’s four.',
    ],
    artists: ['The Chemical Brothers', 'Fatboy Slim', 'The Prodigy', 'Adam Freeland', 'DJ Icey'],
    listening: [
      { title: 'Block Rockin’ Beats', artist: 'The Chemical Brothers', year: '1997', note: 'Big beat’s swinging swagger.' },
      { title: 'The Rockafeller Skank', artist: 'Fatboy Slim', year: '1998', note: 'One break, distorted, immortal.' },
      { title: 'Firestarter', artist: 'The Prodigy', year: '1996', note: 'Breakbeat with rock-band violence.' },
    ],
    didYouKnow: [
      'Fatboy Slim has described big beat as breaks you can rock out to rather than choreograph to — dance music for people who head-bang.',
      'Nearly every classic big-beat track is built on the same handful of 1960s–70s funk breaks hip-hop had been mining for two decades.',
    ],
    relatedFamilies: ['hiphop', 'jungle', 'techno', 'funk', 'club'],
  },
  techno: {
    origin: 'United States (Detroit)',
    region: 'North America → Europe',
    era: 'mid-1980s–present',
    classification: 'Machine funk for the future — repetition as dance ritual',
    history: [
      'Techno was named in Detroit by the Belleville Three — Juan Atkins, Derrick May and Kevin Saunderson — fusing Euro-synth futurism (Kraftwerk, read through Alvin Toffler’s “techno rebels”) with American funk and house drums. Model 500’s “No UFO’s” (1985) and Rhythim Is Rhythim’s “Strings of Life” (1987) are founding documents.',
      'Berlin adopted and industrialized the sound after the Wall fell — Tresor opened in 1991 inside abandoned bank vaults — and the genre hardened into hypnotic, relentless 130–140 loops: kick, off-beat hat, rumble, atmosphere.',
      'Techno’s drum philosophy is reduction: one kick, one hat, one motif, a thousand variations through filter and texture. Its offshoots — minimal (Richie Hawtin), the EBM march, gabber’s 180-plus fury, and Detroit’s own electro lineage — all share the machine-time aesthetic.',
    ],
    artists: ['Juan Atkins', 'Derrick May', 'Kevin Saunderson', 'Jeff Mills', 'Richie Hawtin', 'Robert Hood'],
    listening: [
      { title: 'Strings of Life', artist: 'Rhythim Is Rhythim', year: '1987', note: 'Techno’s most human machine.' },
      { title: 'No UFO’s', artist: 'Model 500', year: '1985', note: 'The blueprint from Metro Detroit.' },
      { title: 'The Bells', artist: 'Jeff Mills', year: '1997', note: 'Minimal loops, maximal suspense.' },
    ],
    didYouKnow: [
      'Juan Atkins took the word “techno” from Alvin Toffler’s futurist book The Third Wave, which described “techno-rebels” rebuilding culture with machines.',
      'Derrick May famously compared Detroit techno to “George Clinton and Kraftwerk stuck in an elevator” — funk logic inside machine logic.',
    ],
    relatedFamilies: ['house', 'club', 'breaks', 'dubstep', 'experimental'],
  },
  dubstep: {
    origin: 'United Kingdom (South London / Croydon)',
    region: 'Europe',
    era: 'early 2000s–present',
    classification: '140 BPM bass music — UK garage swing slowed into half-step darkness',
    history: [
      'Dubstep crystallized in South London around 2001–2005, when the 2-step legacy of El-B and Steve Gurley met the Croydon circle around Big Apple Records — Skream, Benga, Artwork — and, in Lewisham, Digital Mystikz (Mala and Coki) with Loefah. The DMZ club night (2005) gave it a cathedral.',
      'The beat is dubwise minimalism at 140: a half-time snare on beat 3, a skanky off-beat hat, sub-bass filling the silence, and — in classic form — no drums at all for entire phrases. “Midnight Request Line” (2005) announced the genre’s melodic power.',
      'The style globalized violently through festival “brostep” in the 2010s, while the deeper 140 scene (Mala, Kode9’s Hyperdub) kept the original alive — and its half-time logic informs drill’s snap, trap’s kinship and much of modern bass music.',
    ],
    artists: ['Skream', 'Benga', 'Mala', 'Coki', 'Loefah', 'Kode9'],
    listening: [
      { title: 'Midnight Request Line', artist: 'Skream', year: '2005', note: 'The moment dubstep found its melody.' },
      { title: 'Skream!', artist: 'Skream', year: '2006', note: 'The genre’s foundational LP.' },
      { title: 'Anti War Dub', artist: 'Digital Mystikz', year: '2006', note: 'Half-step weight and dread.' },
    ],
    didYouKnow: [
      'Classic dubstep is built around the silence after the snare — sub-bass occupies the gaps where drums used to be.',
      'The genre’s home club DMZ ran a strict no-photos policy — you had to be present, which is one reason “dubstep face” became folklore.',
    ],
    relatedFamilies: ['garage', 'jungle', 'reggae', 'trap', 'drill'],
  },
  afrobeat: {
    origin: 'Nigeria (Lagos)',
    region: 'West Africa',
    era: 'late 1960s–present',
    classification: 'Fela Kuti’s politically charged big-band groove — highlife, jazz and funk locked to an interlocking drum “talk”',
    history: [
      'Afrobeat was engineered in Lagos by Fela Kuti. His highlife-and-jazz band Koola Lobitos toured the United States in 1969, where Fela absorbed the Black Power movement and funk’s rhythmic urgency; back home he renamed the group Africa ’70 and christened the new sound “Afrobeat” — a music built to move bodies and to indict governments.',
      'The style’s engine is Tony Allen’s drumming: a kit voice that talks. Allen translated Yoruba drum phrasing onto kick, snare and hats, interlocking with congas, shekere, claves and the bar-guitar syncopations into a rolling pattern that sits between a straight 4/4 and a swung 12/8 — drummers argue about which it is, which is the point. Ten-to-fifteen minute vamps, horn-section call-and-response and Fela’s declamatory vocals rode on top. When Cream’s Ginger Baker guested with Africa ’70 on Live! (1971, recorded at Abbey Road), the world heard African and rock drumming meet as equals.',
      'Fela died in 1997, but the lineage split into two living rivers. Tony Allen carried the classic interlock into jazz and club collaborations until his death in 2020; Seun and Made Kuti keep the big band alive in Lagos. Meanwhile “Afrobeats” — the pop of Burna Boy, Wizkid and Davido — is a different, though clearly descended, genre: dancehall, hiplife and amapiano (including its pitch-bent log-drum bass) folded into the old groove logic. The drum talk continues.',
    ],
    artists: ['Tony Allen', 'Fela Kuti', 'Ginger Baker', 'Seun Kuti', 'Made Kuti', 'Dele Sosimi', 'Burna Boy', 'Wizkid'],
    listening: [
      { title: 'Zombie', artist: 'Fela Kuti & Africa ’70', year: '1976', note: 'Tony Allen’s kit in full conversation with the horn section.' },
      { title: 'Gentleman', artist: 'Fela Kuti & Africa ’70', year: '1973', note: 'The 4/4–12/8 blur at its most contagious.' },
      { title: 'Live! (with Ginger Baker)', artist: 'Fela Ransome-Kuti & Africa ’70', year: '1971', note: 'Afrobeat meets a rock legend’s hands — equality, not guest solo.' },
      { title: 'Ye', artist: 'Burna Boy', year: '2018', note: 'Modern Afrobeats: the old groove logic in a streaming-era frame.' },
    ],
    didYouKnow: [
      'Fela Kuti said it plainly: “Without Tony Allen, Afrobeat would not exist.”',
      'Allen described his kit not as an American drum set but as a set of African drums — each limb answering a different “voice”, the way talking drums answer the master drum in a village ensemble.',
    ],
    relatedFamilies: ['african', 'funk', 'jazz', 'club', 'world'],
  },
  world: {
    origin: 'Traditional cultures worldwide',
    region: 'Global',
    era: 'Centuries of living tradition — translated to the kit through the 20th century',
    classification: 'A curated cross-section of ceremonial and social percussion traditions',
    history: [
      'This family is honestly labelled: it is not one tradition but a curated cross-section of the ensemble musics the modern drum kit grew out of — and returned to borrow from. What the entries share is structure: a bell or master-drum timeline that every other voice must obey, and a web of interlocking parts that together carry more than any single drummer could.',
      'The catalogue reaches into West Africa (the Ewe people of Ghana, Togo and Benin with their gankogui bell, axatse rattle and master atsimevu drum; the Ga people’s kpanlogo of post-independence Accra; the 12/8 bembé timeline of Yoruba religion), the Middle East (Egyptian maqsum and baladi loops for doumbek and riq), Persia’s lilting 6/8, Punjab’s dhol-powered bhangra, and Japan’s taiko — whose modern ensemble format (kumi-daiko) was assembled by Daihachi Oguchi in 1951 and globalized by Ondekoza and Kodō.',
      'Why put them on a kit? Because these timelines are the ancestor vocabulary of nearly every groove in this encyclopedia: the tresillo and clave are African bell patterns; the shuffle is a triplet bell; jazz’s “Afro Blue” is a bembé. Playing a bell pattern between kick, rim and hat is the fastest known cure for stiff limb independence — and the surest way to hear where popular rhythm comes from.',
    ],
    artists: ['Babatunde Olatunji', 'Mamady Keïta', 'C.K. Ladzekpo', 'Kodō (ensemble)', 'Ondekoza (ensemble)', 'Hossam Ramzy', 'Eitetsu Hayashi'],
    listening: [
      { title: 'Drums of Passion', artist: 'Babatunde Olatunji', year: '1960', note: 'The record that introduced African ensemble drumming to the American mainstream.' },
      { title: 'O-Daiko', artist: 'Kodō', year: '1981', note: 'Two players, one monumental drum — ensemble taiko as concert art.' },
      { title: 'Mundian To Bach Ke', artist: 'Panjabi MC', year: '1998', note: 'Dhol-driven bhangra that conquered hip-hop and dancefloors worldwide.' },
      { title: 'Agbekor & Gahu ensemble recordings', artist: 'Dagbe Cultural Centre, Kopeyia (Ghana)', note: 'Field-school documentation of the Ewe canon — bell first, drums after.' },
    ],
    didYouKnow: [
      'In Ewe drumming the gankogui bell is called “the key”: the master drum and every supporting part enter only after it has laid the timeline.',
      'Ondekoza’s founding rule for its taiko troupe was famously ascetic — “run first, drum second” — with members covering marathon distances as part of their percussion training.',
    ],
    relatedFamilies: ['african', 'afrobeat', 'latin', 'arabic', 'indian'],
  },
  experimental: {
    origin: 'Global (concert avant-garde, progressive rock studios, IDM bedrooms)',
    region: 'Global',
    era: 'mid-20th century avant-garde → 1990s IDM → present',
    classification: 'Rhythm as research: odd meters, displacement, probability and machine impossibility',
    history: [
      'Experimental drumming has two parents. The first is the concert avant-garde: Edgard Varèse’s Ionisation (1931) made percussion a concert protagonist, John Cage treated rhythm as structure, and the post-war “new complexity” school of Brian Ferneyhough pushed notation density past any comfortable performance. John Zorn’s game pieces and Frank Zappa’s notoriously difficult charts belong to the same story — Zappa’s “The Black Page” (1976), written for Terry Bozzio, remains the discipline’s most famous drum etude.',
      'The second parent is the progressive-rock rhythm lab: Bill Bruford’s angular kitscape for King Crimson, Billy Cobham’s metric fireworks for the Mahavishnu Orchestra, and Vinnie Colaiuta’s feats with Zappa. From them comes a practical toolkit every modern player borrows — backbeat displacement (moving the 2 & 4 off their seats), metric modulation, polyrhythmic ostinatos and four-limb independence as studied by Gavin Harrison and a generation of math-rock drummers.',
      'The 1990s handed the kit to machines and to players who think like machines. IDM and drill’n’bass — Aphex Twin, Squarepusher, Autechre — chopped breaks into hyperhuman spasms no single drummer could play, then wrote software to do it. This family honours that lineage in-app too: its notation includes probabilistic “p” cells (hits that fire only sometimes) and Euclidean distributions, so the grid itself becomes an instrument of chance.',
    ],
    artists: ['Terry Bozzio', 'Vinnie Colaiuta', 'Bill Bruford', 'Billy Cobham', 'Gavin Harrison', 'Squarepusher', 'Aphex Twin', 'Autechre'],
    listening: [
      { title: 'The Black Page', artist: 'Frank Zappa (Terry Bozzio)', year: '1976', note: 'The drum etude that outlived the band — melody built from displacement.' },
      { title: 'Feed Me Weird Things', artist: 'Squarepusher', year: '1996', note: 'Jazz chops and drill’n’bass spasm in one pair of hands.' },
      { title: 'Larks’ Tongues in Aspic', artist: 'King Crimson (Bill Bruford)', year: '1973', note: 'Odd meter as architecture, not gimmick.' },
      { title: 'Incunabula', artist: 'Autechre', year: '1993', note: 'Machine rhythm learning to think for itself.' },
    ],
    didYouKnow: [
      '“The Black Page” earned its name because the notation page was almost entirely black with notes — drummers of the era called it unplayable; Bozzio made it canonical.',
      'Probabilistic notation — a hit that fires only some of the time — has a concert-music pedigree (Iannis Xenakis used stochastic processes in the 1950s), and lives on in this app’s “p” grid cells.',
    ],
    relatedFamilies: ['jazz', 'metal', 'techno', 'learn', 'balkan'],
  },
  learn: {
    origin: 'Drum pedagogy (the method-book tradition, US & Europe)',
    region: 'Global',
    era: '19th-century rudimental methods → present',
    classification: 'Foundation patterns: the first grooves and the counting systems that teach them',
    history: [
      'Every groove family in this encyclopedia has a teaching tradition, and this family is that tradition. Its roots are military: rudimental drumming’s rolls, flams and drags were codified for the field drum, formalized in America by the National Association of Rudimental Drummers in 1933 with its “thirteen essential rudiments”.',
      'The method-book canon grew from there: George Lawrence Stone’s Stick Control (1935) — still in print and still assigned — built hands; Jim Chapin’s Advanced Techniques for the Modern Drummer (1948) taught the kit to swing independently; Ted Reed’s Syncopation (1958) turned one page of syncopated rhythms into an infinite comping puzzle that jazz teachers still mine. The video era added Tommy Igoe’s Groove Essentials (2002) and the online lesson platforms, making the drum chair the best-documented instrument in popular music.',
      'The Learn-series patterns here (Build 01–06) follow the classic arc: quarter-note kicks, then eighth-note hats, then the sixteenth grid, then off-beats, ghost notes and a first two-bar fill — the same staircase a teacher would walk a student up, with the counting system (“1 e & a”) as the handrail. Master these six and every other family in the catalog is readable at sight.',
    ],
    artists: ['George Lawrence Stone (author)', 'Jim Chapin (author)', 'Ted Reed (author)', 'Tommy Igoe', 'Dom Famularo', 'Benny Greb'],
    listening: [
      { title: 'Stick Control', artist: 'George Lawrence Stone', year: '1935', note: 'The book — snare science that built a century of hands.' },
      { title: 'Syncopation for the Modern Drummer', artist: 'Ted Reed', year: '1958', note: 'One rhythm page, a thousand jazz applications.' },
      { title: 'Groove Essentials', artist: 'Tommy Igoe', year: '2002', note: 'The video-era groove dictionary every garage drummer grew up with.' },
    ],
    didYouKnow: [
      'Stick Control’s full title — Stick Control for the Snare Drummer — understates its reach: jazz, rock and metal teachers all still assign the same 1935 pages.',
      'The “1 e & a” counting system is onomatopoeic scaffolding for the sixteenth grid; the parallel takadimi system gives each syllable its own beat-class, which is why conservatories teach it as theory, not slang.',
    ],
    relatedFamilies: ['rock', 'jazz', 'experimental', 'fills', 'world'],
  },
  synthwave: {
    origin: 'Europe & North America (retro-futurist producers reviving 1980s film-score drums)',
    region: 'Global',
    era: '2000s revival of 1980s studio vocabulary',
    classification: 'Nostalgia-futurism: LinnMachine grids and gated-reverb snares for imaginary soundtracks',
    history: [
      'Synthwave is a revival built from the drum sound of 1980s film and pop production. The source vocabulary: Roger Linn’s LM-1 (1979) — the first programmable sampled-drum machine, heard on Prince’s “1999” — and its cheaper, everywhere LinnDrum successor; Yamaha’s DX7 bells; and above all the gated-reverb snare, the gigantic reverse-decay hit engineered by Hugh Padgham during the Peter Gabriel “Intruder” sessions (1980) and immortalized a year later on Phil Collins’ “In the Air Tonight”.',
      'The original synthwave drum kit was already cinematic: John Carpenter scored his own films with driving machine rhythms (Assault on Precinct 13, Escape from New York), Tangerine Dream and Vangelis built neon atmospheres (Thief, Blade Runner), and Giorgio Moroder’s sequenced disco pointed at the future. The 2000s revival — College, Kavinsky, David Grellier’s “1980s memory” aesthetic — rebuilt that kit sample-by-sample, and the Drive soundtrack (2011, featuring Kavinsky’s “Nightcall”) pushed it from internet fandom into cinema mainstream.',
      'The family’s wings: “outrun”/nightdrive keeps a four-on-the-floor pulse at car-cruise tempos (roughly 100–110) with gated snare cracks; darker “darksynth” (Carpenter Brut, Perturbator) borrows metal’s aggression; Com Truise’s “mid-fi synthwave” smears the machines in tape. The drum rule throughout: the machines play perfectly, then the reverb turns perfection into melancholy.',
    ],
    artists: ['Kavinsky', 'Carpenter Brut', 'Perturbator', 'Com Truise', 'The Midnight', 'College', 'John Carpenter (source)'],
    listening: [
      { title: 'Nightcall', artist: 'Kavinsky', year: '2010', note: 'The genre’s signature single — Linn grid, gated snare, chrome heartbreak.' },
      { title: 'In the Air Tonight', artist: 'Phil Collins', year: '1981', note: 'The 1980s source code: Padgham’s gated-reverb snare heard round the world.' },
      { title: 'Turbo Killer', artist: 'Carpenter Brut', year: '2016', note: 'Darksynth at full throttle — metal violence on an 80s grid.' },
      { title: 'Brother', artist: 'The Midnight', year: '2016', note: 'Nightdrive sax-and-gated-snares at its most wistful.' },
    ],
    didYouKnow: [
      'The gated-reverb snare was a studio accident: Padgham routed a close mic through a gate fed by a reverberant signal, and the snare suddenly ended in a wall of silence — space itself became the drum tail.',
      '“Nightcall” was co-produced by Guy-Manuel de Homem-Christo of Daft Punk — synthwave’s most famous track has a robot’s fingerprints on it.',
    ],
    relatedFamilies: ['pop', 'house', 'techno', 'club', 'learn'],
  },
  fills: {
    origin: 'Drum-kit culture worldwide',
    region: 'Global',
    era: 'As old as the kit — vocabulary codified through the 20th century',
    classification: 'The art of the transition: fills, turnarounds and phrases that move a track',
    history: [
      'A fill is grammar, not decoration: the drum kit’s way of ending one musical sentence and launching the next. The kit inherited its first vocabulary from military rudiments — flams, drags and rolls that big-band drummers like Chick Webb and Gene Krupa deployed in shout choruses, with Krupa’s solo on “Sing, Sing, Sing” (1937) making the fill a headline act.',
      'Rock and funk turned fills into hooks. John Bonham’s triplet tom runs (the “Good Times Bad Times” intro, 1969) made the descending triplet a rite of passage; Keith Moon treated each fill as a small orchestral event; David Garibaldi’s work with Tower of Power in the 1970s codified linear drumming — single-note phrases threaded kick-snare-tom with no two voices together — a technique later carried into Latin, jazz-fusion and hip-hop production.',
      'The 2000s gospel-chops movement (Aaron Spears’ “Caught Up” fill, 2005) made the fill into fast-food-style virtuosity: linear gospel phrases traded at drum camps and YouTube speed. Meanwhile every electronic genre built its own transition dialect — ghost-chopped jungle fills, riser-and-stop EDM, half-time trap rollouts. This family is the catalogue’s phrasebook: each pattern is a transition you can lift whole.',
    ],
    artists: ['Gene Krupa', 'John Bonham', 'David Garibaldi', 'Steve Gadd', 'Vinnie Colaiuta', 'Aaron Spears', 'Tony Royster Jr.'],
    listening: [
      { title: 'Sing, Sing, Sing', artist: 'Benny Goodman (Gene Krupa)', year: '1937', note: 'The drum fill goes headline — swing-era tom thunder.' },
      { title: 'Good Times Bad Times', artist: 'Led Zeppelin', year: '1969', note: 'Bonham’s hand-foot-hand triplets — the fill every rock drummer learns first.' },
      { title: 'What Is Hip?', artist: 'Tower of Power', year: '1973', note: 'Garibaldi’s linear vocabulary at funk tempo.' },
      { title: 'Caught Up', artist: 'Israel & New Breed', year: '2005', note: 'The gospel fill heard round the world.' },
    ],
    didYouKnow: [
      '“Linear” drumming means no two limbs ever strike together — the kit becomes one fast, single-note instrument; the phrasebook comes from funk and church as much as from jazz.',
      'Steve Gadd’s drum solo on Steely Dan’s “Aja” (1977) is studied as composed music — a fill stretched into a two-minute form that ends in a ride-out most drummers still transcribe.',
    ],
    relatedFamilies: ['rock', 'funk', 'jazz', 'gospel', 'learn'],
  },
  indian: {
    origin: 'India',
    region: 'South Asia',
    era: 'Two millennia of theory (from the Natyashastra era) to the modern concert stage',
    classification: 'Classical tala systems: Hindustani tabla and Carnatic percussion, built on mnemonic syllables',
    history: [
      'Indian classical music organizes rhythm through tala — cyclic metrical frameworks far older and more elaborate than Western bar lines. The North Indian (Hindustani) system plays theka cycles on the tabla: teentaal’s sixteen matras in four equal vibhags (4+4+4+4) is the default cycle, with keherwa (8), dadra (6), rupak (7), jhaptaal (10) and ektaal (12) as siblings. The South Indian (Carnatic) system counters with adi talam (8) and the asymmetrical chapu talams, played on mridangam and joined by ghatam (clay pot), kanjira (frame drum) and morsing (jaw harp).',
      'The pedagogical genius is the bol — mnemonic syllables where every stroke has a name: tabla’s dha dhin dhin dha, mridangam’s solkattu tā kā ḍi mi. Rhythm is taught as language before it is taught as arithmetic: students recite phrases (kaydas, korvais) while clapping the tali/khali wave structure — teentaal claps on matras 1, 5 and 13 with an empty khali wave on 9. A solo ends with a tihai, a phrase repeated three times whose last stroke lands exactly on sam, the cycle’s return — mathematics as applause.',
      'The modern era globalized the systems: Alla Rakha toured with Ravi Shankar (Monterey, 1967); his son Zakir Hussain became the style’s planet-wide ambassador and co-founded Shakti with John McLaughlin and ghatam player Vikku Vinayakram in 1973, fusing tala with jazz improvisation; Bickram Ghosh and a generation of Carnatic players keep the South’s arithmetic fire burning. Every producer who has ever swung a hi-hat grid is working, knowingly or not, in this family’s shadow.',
    ],
    artists: ['Zakir Hussain', 'Alla Rakha', 'Kishan Maharaj', 'Vikku Vinayakram', 'Bickram Ghosh', 'Anindo Chatterjee', 'Umayalpuram Sivaraman'],
    listening: [
      { title: 'Ravi Shankar at Monterey', artist: 'Ravi Shankar with Alla Rakha', year: '1967', note: 'Tabla meets the rock generation — the tala system introduced to the West.' },
      { title: 'Making Music', artist: 'Zakir Hussain', year: '1987', note: 'Tala as world-music conversation — the ambassador at his best.' },
      { title: 'Joy', artist: 'Shakti with John McLaughlin', year: '1975', note: 'Vikku Vinayakram’s ghatam and the mridangam driving jazz fusion.' },
    ],
    didYouKnow: [
      'A tihai is computed like a puzzle: the phrase is lengthened and re-cut so that three repetitions end precisely on sam — one of music’s oldest solved math problems.',
      'The tabla’s dayan is tuned to the soloist’s tonic (sa): players hammer a black paste disk on the drumhead until the ring matches the raga. A tabla is a melody instrument that happens to keep time.',
      'Shakti’s reunion album This Moment (2023) won the Grammy for Best Global Music Album in 2024 — half a century after the band first fused tala with jazz.',
    ],
    relatedFamilies: ['world', 'jazz', 'arabic', 'experimental', 'learn'],
  },
  arabic: {
    origin: 'Middle East & North Africa (Egypt as the pop axis)',
    region: 'MENA',
    era: 'Folk roots centuries old; modern orchestral pop from the 1940s',
    classification: 'Doumbek-driven rhythmic cycles (iqā’āt) — from zaar trance to belly-dance pop',
    history: [
      'Arabic rhythm is organized as iqā’ — fixed cycles spelled in onomatopoeia like India’s bols: DUM for the low dome stroke, TAK for the edge slap. The goblet drum (doumbek / darbuka / tabla) is the voice of the system, with the riq (a skinned tambourine) and frame drums completing the classical takht ensemble. Egyptian pop’s workhorse cycles — maqsum (4/4: DUM TAK – TAK DUM – TAK –), the heavier baladi, saidi, the two-beat malfouf and ayyub, the stately ten-beat samai thaqil — are to Middle Eastern music what the backbeat is to rock.',
      'The mid-century Egyptian orchestra made these cycles global: the ensembles behind Umm Kulthum — whose 1964 milestone “Enta Omri”, composed by Mohammed Abdel Wahab, defined the orchestral sound — played percussion sections arranged like horn sections: cycle-first, always. Belly dance (raqs sharqi) carried the drum vocabulary to Western stages, and dedicated percussionists like Hossam Ramzy became the style’s ambassadors, arranging doumbek sections for pop and film.',
      'The street renewed the tradition: Egyptian shaabi (Ahmed Adaweya’s 1970s hits) sped the loops for weddings; mahraganat, the 2010s electro-shaabi of Cairo’s corners, put maqsum’s bones through laptops and autotune; and regional scenes — Turkish darbuka virtuosos like Misirli Ahmet, Gulf khaleeji rhythms, Levantine dabke — keep adding dialects. Modern Egyptian and pan-Arab pop still sits on the same DUM-TAK skeleton, now under 808s.',
    ],
    artists: ['Hossam Ramzy', 'Said El Artist', 'Misirli Ahmet', 'Umm Kulthum’s percussion section (era-defining)', 'Ahmed Adaweya (shaabi era)'],
    listening: [
      { title: 'Enta Omri', artist: 'Umm Kulthum', year: '1964', note: 'The orchestral golden age — percussion as architecture under the diva.' },
      { title: 'Nour El Ein', artist: 'Amr Diab', year: '1996', note: 'Modern Arab pop’s biggest single — maqsum under synths.' },
      { title: 'Sabla Tolo', artist: 'Hossam Ramzy', note: 'Pure Egyptian percussion cycles, arranged for the world stage.' },
    ],
    didYouKnow: [
      'The ayyub, a driving two-beat cycle, accompanies the zaar — a trance/healing ceremony whose rhythm is traditionally believed to “call” and then settle restless spirits.',
      'Samai thaqil’s ten-beat cycle arrives from the Ottoman-era sama’i suite form — proof that Arabic rhythm has always traded meters across empires, not just around them.',
    ],
    relatedFamilies: ['world', 'balkan', 'indian', 'caribbean', 'club'],
  },
  balkan: {
    origin: 'Balkan Peninsula (Bulgaria, Serbia, North Macedonia, Romania)',
    region: 'Southeast Europe',
    era: 'folk antiquity → 20th-century ensembles → present',
    classification: 'asymmetric additive meters — dance music built on uneven beat groupings',
    history: [
      'Balkan dance music is organized around additive meters: the Bulgarian ruchenitsa is 7/8 grouped 2+2+3, the paidushko is 5/8 grouped 2+3, and the Macedonian karsilama stretches to 9/8 in 2+2+2+3. These are not odd for the sake of odd — each grouping is a dance step, and the drum pattern is literally the choreography.',
      'Traditional instrumentation — tapan (double-headed bass drum), davul, tarambuka — carried the meter; the mid-20th-century state ensembles orchestrated it with brass and clarinet, and post-Yugoslav brass bands like Goran Bregović’s and Fanfare Ciocărlia turned it into a worldwide festival engine.',
      'Jazz and rock players study Balkan meters the way drummers once studied clave: as proof that groove lives in grouping, not in symmetry. The karsilama 9/8 has crossed into metal, prog and djent, usually losing the dance step and gaining the math.',
    ],
    artists: ['Ivo Papazov', 'Goran Bregović', 'Fanfare Ciocărlia', 'The Bulgarian State Ensemble', 'Kottarashky'],
    listening: [
      { title: 'Ruchenitsa (band arrangement)', artist: 'Bulgarian State Ensemble traditions', note: 'The 2+2+3 lift you can dance to.' },
      { title: 'Karsilama', artist: 'Macedonian brass tradition', note: 'Nine beats, one breathless dance.' },
      { title: 'Bregović live sets', artist: 'Goran Bregović Wedding and Funeral Band', note: 'Odd meters at rock-concert energy.' },
    ],
    didYouKnow: [
      'Bulgarian musicologists count the meters aloud as short-long syllables — “du-ta du-ta du-ka-ta” for 2+2+3 — and the syllables land exactly on the dance steps.',
      'Fanfare Ciocărlia, a Roma brass band from a Romanian village, never notated a note — the 11/8 kopanitsa in their book exists only in hands and feet.',
    ],
    relatedFamilies: ['arabic', 'world', 'jazz', 'club'],
  },
  caribbean: {
    origin: 'Dominican Republic, Trinidad & Tobago, Haiti, Puerto Rico',
    region: 'Caribbean',
    era: '1950s–present (older folkloric roots)',
    classification: 'dance-floor rhythms of the Spanish, English and French Caribbean',
    history: [
      'The Caribbean speaks rhythm in three colonial languages. The Spanish-speaking islands gave the world the dembow — a 3+3+2-lifted backbeat cell named for Shabba Ranks’ “Dem Bow” riddim (1990–91) that became the chassis of reggaeton and half of Latin pop. The English Caribbean built soca out of calypso for Trinidad Carnival (Ras Shorty I’s “Soul of Calypso”, mid-1970s) — wall-of-iron percussion at road-march tempo. The French/French-Creole islands answered with kompa, which bandleader Nemours Jean-Baptiste codified in Haiti around 1955: a smooth, constant one-drop-flavored dance pulse.',
      'The dembow is the century’s most reproduced groove — a single cell that powers Dominican dembow, reggaeton, moombahton and much of afrobeats’ club face. Soca’s engine is the engine room: the bass drum, cot and iron section that keeps thousands of masqueraders in step for hours.',
      'Bachata (güira + bongó + requinto) and merengue (tambora + güira) round out the Dominican contribution — both built on the same accent physics, played at different temperatures.',
    ],
    artists: ['Nemours Jean-Baptiste', 'Ras Shorty I', 'Juan Luis Guerra', 'El Alfa', 'Kassav’'],
    listening: [
      { title: 'Dem Bow', artist: 'Shabba Ranks', year: '1990', note: 'The riddim that renamed a groove.' },
      { title: 'Ti Carole', artist: 'Nemours Jean-Baptiste', note: 'Kompa direct at the source.' },
      { title: 'Soca Baptist', artist: 'Blue Boy', year: '1980', note: 'Early soca’s engine-room proof.' },
    ],
    didYouKnow: [
      'Producers call it “the dembow riddim” because one 1990 dancehall riddim was re-recorded thousands of times — reggaeton is, structurally, a riddim economy like Jamaica’s.',
      'Trinidad’s Carnival road march is judged while the band moves: a tune that makes masqueraders lose the step loses the title, so soca drums are mixed for feet, not headphones.',
    ],
    relatedFamilies: ['reggae', 'latin', 'club', 'african'],
  },
  african: {
    origin: 'West, Central and Southern Africa (Ghana, Nigeria, DR Congo, Cameroon, Senegal, South Africa)',
    region: 'Africa',
    era: '1950s–present (roots far older)',
    classification: 'interlocking guitar/bell/percussion cycles from highlife to amapiano',
    history: [
      'Across the continent, the common grammar is the timeline: a short bell or shaker phrase that cycles against the longer phrases around it — highlife’s mainline bell, soukous’ sebene sparkle, mbalax’ sabar flurries. Highlife (Ghana, 1950s–60s, E.T. Mensah, later Osibisa’s spread) married palm-wine guitar to Western brass and kept a bells-and-congas engine. Congolese rumba slowed into soukous, whose sebene outro turns the drum kit and guitars into a single cycling machine.',
      'Senegal’s mbalax fused sabar drum tans (each stroke a call-and-response sentence) with pop form — Youssou N’Dour’s band made 6/8-and-4/4 hybrid feels a radio norm. In the 2010s, South Africa’s townships produced amapiano (log-drum bass, slow 112-ish shaker patience) and gqom (Durban’s raw, drumless-negative space), both now global club dialects.',
      'Tony Allen — Fela Kuti’s drummer — is the bridge figure: his “ten-per-cent” philosophy (the kit plays ten percent drum set, ninety percent African percussion) defined afrobeat’s drum language and, through it, half of modern alternative pop.',
    ],
    artists: ['Tony Allen', 'E.T. Mensah', 'Youssou N’Dour', 'Kanda Bongo Man', 'Kabza De Small', 'DJ Lag'],
    listening: [
      { title: 'Zombie', artist: 'Fela Kuti & Afrika 70', year: '1976', note: 'Tony Allen’s kit-as-percussion-ensemble masterclass.' },
      { title: 'Sweet Mother', artist: 'Prince Nico Mbarga', year: '1976', note: 'Highlife’s most sung groove.' },
      { title: 'Ampiano (early log-drum era sets)', artist: 'Kabza De Small & DJ Maphorisa', note: 'The log drum as a bass drum argument.' },
    ],
    didYouKnow: [
      'Tony Allen said he learned by playing four different rhythms at once — hi-hat from jazz, snare from highlife’s bell, kick from the conga, tom from the akpala.',
      'Amapiano’s name (“the pianos”) outlived the piano itself: the genre’s signature became the rounded log-drum bass note, hit like a drum and tuned like a bass.',
    ],
    relatedFamilies: ['afrobeat', 'caribbean', 'club', 'latin'],
  },
  drill: {
    origin: 'Chicago, USA → London, UK → New York, USA',
    region: 'North America / Europe',
    era: '2011–present',
    classification: 'dark half-time trap dialect — sliding 808s, skittering hats, cold space',
    history: [
      'Drill began on Chicago’s South Side around 2011–2012 — Chief Keef and producer Young Chop slowed trap’s chassis, emptied the midrange, and let a sliding 808 carry the menace. The drums: a half-time snare snap, sparse kick hits that mirror the bass slide, and hi-hats that stutter in short bursts rather than run continuously.',
      'London re-engineered it around 2016: UK drill (67, Headie One, producer Ghosty and the 140-BPM inheritance of garage/grime) added sliding bass melodies, off-grid hat flurries and a distinctive staccato bounce — and became the UK’s dominant street-pop dialect. Brooklyn drill (Pop Smoke, producer 808Melo, 2019) fused UK’s bounce with New York sample weight and went global.',
      'Drum-culture significance: drill is the clearest proof that a beat can be defined by restraint — the most copied patterns are the emptiest, with silence doing the intimidation.',
    ],
    artists: ['Young Chop', 'Chief Keef', 'Ghosty', '808Melo', 'M1OnTheBeat', 'Gotit'],
    listening: [
      { title: 'Love Sosa', artist: 'Chief Keef', year: '2012', note: 'The Chicago chassis.' },
      { title: 'Dior', artist: 'Pop Smoke', year: '2019', note: 'Brooklyn drill’s global proof.' },
      { title: 'Smoke', artist: 'Headie One', note: 'UK drill bounce, bar-by-bar.' },
    ],
    didYouKnow: [
      'UK drill typically sits near 140 BPM but counts as half-time — the snare lands on beat 3, so it feels like 70; producers switch hat subdivisions to change the perceived tempo without touching the clock.',
      'The “slide” in drill’s sliding 808 is a portamento bass note that replaces what would be a drum fill — the most important percussion in the genre isn’t a drum.',
    ],
    relatedFamilies: ['trap', 'hiphop', 'dubstep', 'club'],
  },
  club: {
    origin: 'New Jersey / Baltimore / Chicago / Detroit, USA',
    region: 'North America',
    era: '1980s–present',
    classification: 'regional club-rap and dance families — jersey club, footwork, Baltimore club, big-room',
    history: [
      'Baltimore club (late 1980s–90s, Scottie B, K-Swift) chopped hip-hop vocals over 130-ish BPM breakbeats with a signature “think”-break stomp. New Jersey answered with jersey club (DJ Tameil, the Brick Bandits, 2000s): the same skeleton at 135–140 with a triplet kick bounce and the infamous bed-squeak sample. Chicago’s footwork (RP Boo, DJ Rashad, DJ Spinn) pushed past both — 160 BPM, half-time-feeling tracks, and drums chopped like the dancers’ feet: stabs, repeats, dropouts.',
      'These are DJ-culture drums: built from breaks, edited in loops, distributed on white labels and SoundCloud. The kit is a sample source, the arrangement is a dance instruction, and the “groove” is whatever the floor forgives.',
      'The broader club family also carries the big-room side — psytrance’s rolling 16th bass, hardstyle’s gated kick — but its beating heart is the triplet-kick jersey cell and footwork’s syncopated stutter, both now standards in pop production.',
    ],
    artists: ['RP Boo', 'DJ Rashad', 'DJ Tameil', 'K-Swift', 'UNiiQU3', 'TT The Artist'],
    listening: [
      { title: 'Bounce That', artist: 'DJ Rashad (GhettoTekz era)', note: 'Footwork drums as conversation.' },
      { title: 'Watchin’ (club edits)', artist: 'Brick Bandits', note: 'Jersey triplet-kick canon.' },
      { title: 'It’s a Killa (Bmore classic era)', artist: 'K-Swift sets', note: 'Baltimore club’s floor law.' },
    ],
    didYouKnow: [
      'Footwork tracks are mixed for battle dancers: producers leave deliberate “holes” (dropouts) so a single footwork stab reads as an event, not a loop.',
      'The jersey club bed-squeak started as a royalty-free workaround — producers needed a cheap, distinctive percussive squeak, and one sample became a genre’s handshake.',
    ],
    relatedFamilies: ['house', 'hiphop', 'drill', 'breaks'],
  },
}

/** per-pattern curated knowledge — keyed by pattern id (authored/famous grooves) */
export const PATTERN_KNOWLEDGE: Record<string, PatternKnowledge> = {
  'jungle-amen-edit': {
    origin: 'The Winstons, “Amen, Brother” (1969, B-side) — break taken by Bronx and UK DJs in the 1980s–90s',
    era: 'break isolated 1980s; jungle built on it 1991–95',
    history: [
      'The 6-second drum break from “Amen, Brother” — GC Coleman’s performance — became the most sampled drum recording in history. UK producers spliced, pitched and resequenced it into jungle’s rolling chop style: the break isn’t played, it is edited.',
      'An “amen edit” pattern in a modern catalog is a compositional study: the same slices, re-voiced for a DAW grid. Learning it teaches you why jungle drums feel like a conversation between two drummers who never quite agree.',
    ],
    artists: ['The Winstons', 'GC Coleman', 'Remarc', 'Dillinja'],
    listening: [
      { title: 'Amen, Brother', artist: 'The Winstons', year: '1969', note: 'The source — wait for the break.' },
    ],
    didYouKnow: [
      'Richard Spencer (The Winstons) received no royalties for decades; a 2015 crowdfunding campaign finally delivered a GoFundMe “thank you” — sampling culture’s most famous unpaid debt.',
    ],
  },
  'xg-funk-dusty-break': {
    origin: 'the classic funk break tradition — James Brown’s drummers, 1968–1974',
    era: 'late 1960s–early 1970s',
    history: [
      'Two-bar funk breaks are the DNA of hip-hop: the drummer drops the melody’s responsibilities and plays pure time — kick on the turn, snare ghosts everywhere, hats barely moving. Breaks like this were the sections DJs looped before samplers existed.',
      'Play it straight, then swing the ghost notes: the entire history of boom-bap is that one adjustment.',
    ],
    artists: ['Clyde Stubblefield', 'Jabo Starks', 'John “Jabo” Starks'],
    listening: [
      { title: 'Funky Drummer (break)', artist: 'James Brown', year: '1970', note: 'The loop that built a genre.' },
    ],
    didYouKnow: [
      'Clyde Stubblefield never received royalties for the “Funky Drummer” break — James Brown owned the recording, so the most imitated drum performance of the 20th century paid its originator in session wages.',
    ],
  },
  'funk-cissy-strut': {
    origin: 'The Meters, “Cissy Strut” (1969), New Orleans',
    era: '1969–present',
    history: [
      'Zigaboo Modeliste’s groove on “Cissy Strut” is the holy grail of sparse funk: a syncopated kick-snare dialogue where every note lands like a decision. The Meters were New Orleans’ second-line tradition compressed into a four-piece.',
      'The lesson the pattern teaches: funk is what you DON’T play. Count the rests — they outnumber the hits.',
    ],
    artists: ['Zigaboo Modeliste', 'The Meters', 'Art Neville'],
    listening: [
      { title: 'Cissy Strut', artist: 'The Meters', year: '1969', note: 'Three notes of kick, endless groove.' },
    ],
    didYouKnow: [
      'Zigaboo Modeliste combined a second-line parade drummer’s coordination with a James Brown precision — drummers as different as Questlove and John Bonham cite the same Meters records.',
    ],
  },
  'xg-rnb-motown-pocket': {
    origin: 'Hitsville U.S.A., Detroit — the Funk Brothers, 1962–1971',
    era: '1960s',
    history: [
      'The Motown pocket is the meeting of a blues shuffle and a pop clock: Benny Benjamin and Uriel Jones (with James Jamerson’s bass) kept the drums slightly laid-back and voice-led while the sessions ran like clockwork. “The Snake Pit” (Studio A) had a sprung floor that drummers used as a rebound surface.',
      'Its modern descendants are every “vintage soul” drum loop — the ghost-note pickup into beat 4 is the fingerprint.',
    ],
    artists: ['Benny Benjamin', 'Uriel Jones', 'Richard “Pistol” Allen', 'The Funk Brothers'],
    listening: [
      { title: 'My Girl', artist: 'The Temptations', year: '1964', note: 'Benjamin’s patience at 100 BPM.' },
      { title: 'Ain’t No Mountain High Enough', artist: 'Marvin Gaye & Tammi Terrell', year: '1967', note: 'Pocket over orchestration.' },
    ],
    didYouKnow: [
      'The Funk Brothers played on more #1 hits than The Beatles, Rolling Stones and Beach Boys combined — and weren’t publicly credited until the 2002 film “Standing in the Shadows of Motown”.',
    ],
  },
  'xg-hiphop-boom-bap-core': {
    origin: 'New York, mid-1980s–90s — SP-1200/MPC-era boom bap',
    era: '1986–1996 (canon era)',
    history: [
      '“Boom bap” is onomatopoeia for the kick-snare frame itself. Producers (Marley Marl’s sampling innovations, then DJ Premier, Pete Rock, Large Professor) built grooves from chopped breaks + added kick, quantized roughly on purpose — the MPC3000’s swing and the SP-1200’s 12-bit grit are part of the notation.',
      'A “core” boom-bap pattern is the handshake: learn it and every ghost-note variation that follows makes sense.',
    ],
    artists: ['DJ Premier', 'Pete Rock', 'Marley Marl', 'Large Professor'],
    listening: [
      { title: 'N.Y. State of Mind', artist: 'Nas (DJ Premier)', year: '1994', note: 'Rough quantization as a style.' },
    ],
    didYouKnow: [
      'The SP-1200’s sampler limited loops to ~2.5 seconds at 12-bit — boom-bap’s crunchy, repetitive drum style is partly a hardware constraint turned into an aesthetic.',
    ],
  },
  'boombap-dusty': {
    origin: 'the lofi/boom-bap crossroads — Dilla, Madlib, 2010s beat-tape culture',
    era: '1996–present',
    history: [
      '“Dusty” describes the process, not the genre: pitch-down breaks, vinyl noise, swing that shoves the hats late. J Dilla’s “Donuts”-era approach — unquantized, felt-by-hand drums — turned timing humanization into a signature.',
      'In notation terms: the grid says straight; the swing slider and ghost notes make it breathe.',
    ],
    artists: ['J Dilla', 'Madlib', 'Nujabes', 'Knxwledge'],
    listening: [
      { title: 'Donuts', artist: 'J Dilla', year: '2006', note: 'Drums played like speech.' },
    ],
    didYouKnow: [
      'Dilla programmed many of his late-era drums note-by-note on the MPC without quantize — copies of his patterns in DAWs reveal grid lines that his hits deliberately ignore.',
    ],
  },
  'trap-halftime-noir': {
    origin: 'Atlanta, 2000s–2010s — trap’s halftime chassis',
    era: '2003–present',
    history: [
      'Trap’s drum chassis: a snare on beat 3 (half-time feel) over 130–150 BPM hats that roll in 16ths, 32nds and stuttered ratchets, with the 808 doing melody and percussion simultaneously. “Noir” variants strip the hats back and let reverb tails do the dread.',
      'The notation lesson: at 140 BPM with a snare on 3, the listener hears 70 BPM — trap is the first mainstream genre to make perceived tempo optional.',
    ],
    artists: ['Shawty Redd', 'Zaytoven', 'Metro Boomin', 'Southside'],
    listening: [
      { title: 'Mount Kimbie-era trap sets / early Gucci productions', artist: 'Shawty Redd', note: 'The chassis before the gloss.' },
    ],
    didYouKnow: [
      'Trap hat rolls borrow from drum-machine arpeggiators — the “ratchet” stutter (32nd-note bursts) was originally a way to fake live rolls on Roland TR-808s with no velocity layering.',
    ],
  },
  'xg-trap-halftime-core': {
    origin: 'Atlanta — the halftime foundation of trap production',
    era: '2000s–present',
    history: [
      'This is the pattern under thousands of records: halftime snare, hat grid, sparse kick tied to the 808. Everything else in trap is decoration on this chassis.',
      'Practice it with a metronome at 130, 140 and 150 — the feel flips from menacing to danceable purely through hat density.',
    ],
    artists: ['Shawty Redd', 'Drumma Boy', 'Metro Boomin'],
    listening: [
      { title: 'Any early T.I. / Young Jeezy production', artist: 'various', note: 'Chassis in the wild.' },
    ],
    didYouKnow: [
      'Because the snare lands on beat 3, trap patterns look “empty” on a grid — until you render the hats: the same bar can contain 3 drum notes or 40.',
    ],
  },
  'hiphop-drill-uk': {
    origin: 'London, UK — 2016 onward (Chicago drill re-engineered)',
    era: '2016–present',
    history: [
      'UK drill took Chicago’s menace and rebuilt it on the UK’s 140-BPM garage/grime clock: sliding 808 melodies, off-grid hat flurries, and a snappy halftime backbeat that leaves space for bass glides. The drums sit slightly behind the grid — pressure, not panic.',
      'Drum-wise the signature is the slide-and-snap: an 808 glide answered by a dry snare, repeated like a heartbeat.',
    ],
    artists: ['Ghosty', 'M1OnTheBeat', 'Gotts', 'Ghetts', 'Headie One'],
    listening: [
      { title: 'Only Dreaming / UK drill compilations', artist: 'Headie One', note: 'Slide-snap phrasing at its cleanest.' },
    ],
    didYouKnow: [
      'UK drill’s BPM (~140) matches dubstep and garage — the same tempo, three accents: garage skips, dubstep waits, drill slides.',
    ],
  },
  'reggae-one-drop': {
    origin: 'Jamaica — Kingston studios, late 1960s (though attributed widely to Winston Grennan’s session work)',
    era: '1968–present',
    history: [
      'The one-drop removes the kick from beat 1 entirely — the kit “drops” a single kick that lands WITH the snare on beat 3. Combined with the skanking off-beat, it makes beat 1 a decision instead of a reflex.',
      'It is the anti-backbeat: four centuries of European march and fifty years of R&B both say kick on 1; reggae says no. That refusal is the genre’s groove physics.',
    ],
    artists: ['Winston Grennan', 'Carlton Barrett', 'Sly Dunbar', 'Leroy “Horsemouth” Wallace'],
    listening: [
      { title: 'One Drop', artist: 'Bob Marley & The Wailers', year: '1978', note: 'Carlton Barrett naming the concept in a title.' },
      { title: 'Ballistic Affair', artist: 'Leroy Smart (Sly & Robbie)', note: 'One-drop with a steel pulse.' },
    ],
    didYouKnow: [
      'Carlton Barrett’s one-drop hi-hat was so steady that engineers used his takes as timing reference when cutting tape — human click track.',
    ],
  },
  'jazz-bossa': {
    origin: 'Brazil — Rio de Janeiro, late 1950s (João Gilberto, Antônio Carlos Jobim)',
    era: '1958–present',
    history: [
      'Bossa nova took samba’s batucada pulse and whispered it: the drum kit (via Edison Machado’s uso de vassourinhas and later Dom Um Romão) translated the pandeiro’s pattern to brushwork, while the guitar held the 3-2 bossa clave as chords.',
      'The kick pattern is the pandeiro pattern; the rim click is the tamborim line simplified. Everything in a bossa beat is a reduction of street percussion.',
    ],
    artists: ['Edison Machado', 'Dom Um Romão', 'Airto Moreira', 'Paulo Braga'],
    listening: [
      { title: 'Chega de Saudade', artist: 'João Gilberto', year: '1959', note: 'The genre’s quiet detonation.' },
      { title: 'Getz/Gilberto', artist: 'Stan Getz & João Gilberto', year: '1964', note: 'Bossa goes global, drums intact.' },
    ],
    didYouKnow: [
      'Bossa means “thing” or “knack” — the name describes the BEAT’s knack: syncopation so relaxed it sounds like it’s behind itself.',
    ],
  },
  'bossa-core': {
    origin: 'Brazil — the essential bossa clave and pandeiro-derived kit reduction',
    era: 'late 1950s–present',
    history: [
      'The core bossa pattern is a two-bar cell: rim clicks carrying the 3-2 bossa clave, kick spelling the surdo’s 2-and-4 heartbeat, brush or stick texture filling the pandeiro role.',
      'Learn this cell and samba-jazz, partido alto and MPB grooves all become variations of something you already own.',
    ],
    artists: ['Edison Machado', 'Robertinho Silva', 'Pascoal Meirelles'],
    listening: [
      { title: 'Samba de Uma Nota Só', artist: 'João Gilberto', year: '1960', note: 'One-note proof of the clave logic.' },
    ],
    didYouKnow: [
      'The bossa rim-click pattern fits on one line of a napkin — yet Getz/Gilberto (1964) sold over a million copies on its back.',
    ],
  },
  'son-clave-32': {
    origin: 'Cuba — the son cubano lineage (19th-century Santiago de Cuba)',
    era: '19th century–present',
    history: [
      'The clave is not a drum beat — it is the meter’s constitution. The 3-2 son clave’s three-sided bar and two-sided bar tell every other instrument where tension and resolution live. Kick, rim, bell and even horn stabs are supposed to obey it.',
      'Every Afro-Cuban groove in this catalog (mambo, cha-cha, songo, mozambique, timba) is a different relationship with the same two bars.',
    ],
    artists: ['Arsenio Rodríguez', 'Los Van Van', 'Eddie Palmieri bands'],
    listening: [
      { title: 'La Comparsa de los Congos', artist: 'Arsenio Rodríguez', note: 'Son’s engine at full steam.' },
    ],
    didYouKnow: [
      '“Clave” means “key” — literally the wooden key/stick pair the pattern is played on. The instrument and the rule share a name because they were the same thing.',
    ],
  },
  'samba-batucada': {
    origin: 'Brazil — Rio de Janeiro samba schools (early 20th century)',
    era: '1917 (first recorded samba)–present',
    history: [
      'Batucada is the percussion-only heart of samba: surdo heartbeat on 2, caixa/tarol 16th-machine, tamborim telegraph chords, ganzá/shaker wash, repique calls. On a drum kit you play a reduction — kick as surdo, snare as caixa, rim/toms as tamborim cues.',
      'The feel lives in the tension between the surdo’s half-note patience and the caixa’s relentless subdivision. Drummers call it “playing relaxed on top of urgent”.',
    ],
    artists: ['Wilson das Neves', 'Baterias of Mangueira / Portela', 'Paulo Braga'],
    listening: [
      { title: 'Carnival Avenue recordings (bateria solos)', artist: 'Mangueira bateria', note: '200+ drummers, one breath.' },
      { title: 'Samba Esquema Novo', artist: 'Jorge Ben', year: '1963', note: 'Batucada as pop engine.' },
    ],
    didYouKnow: [
      'A first-class samba school bateria can exceed 250 drummers; the “ Directors de Bateria” rehearses them with hand signals, no conductor’s baton, no amplification.',
    ],
  },
  'samba-partido-alto': {
    origin: 'Brazil — Rio’s partido alto circle tradition (1960s–70s pop form)',
    era: '1960s–present',
    history: [
      'Partido alto is samba’s conversational subset: a syncopated 2-bar tamborim/pandeiro cell under call-and-response singing. The kit version collapses the cell into kick-snare-rim dialogue that never quite accents where you expect.',
      'It’s the groove behind much of Jorge Ben Jovem’s catalog and the reason samba-funk crossovers feel “pushed but relaxed”.',
    ],
    artists: ['Jorge Ben Jovem', 'Clara Nunes (Abolição-era bands)', 'Wilson das Neves'],
    listening: [
      { title: 'Take It Easy My Brother Charles', artist: 'Jorge Ben', year: '1969', note: 'Partido alto meets rock backbeat.' },
    ],
    didYouKnow: [
      'Partido alto parties (rodas) had one rule: keep the cell going all night. Dropping the pattern was socially equivalent to interrupting a conversation.',
    ],
  },
  'samba-reggae-olodum': {
    origin: 'Salvador, Bahia, Brazil — Olodum and the afro-blocos (late 1980s)',
    era: '1980s–present',
    history: [
      'Samba-reggae was engineered by Bahia’s afro-blocks (Ilê Aiyê’s template, Olodum’s signature): reggae’s half-weight under samba’s 16th-machine, with 3 surdo lines tuned as a bass choir and repique patterns borrowed from reggae drums.',
      'Paul Simon’s “The Obvious Child” (1990, recorded with Olodum) put the pattern on a global stage; drumline culture worldwide borrowed it within the decade.',
    ],
    artists: ['Olodum', 'Ilê Aiyê', 'Timbalada (Carlinhos Brown)'],
    listening: [
      { title: 'The Obvious Child', artist: 'Paul Simon with Olodum', year: '1990', note: 'Bahian drums on a Western LP.' },
    ],
    didYouKnow: [
      'Olodum’s surdos are tuned to specific pitches so the bass line is played BY drums — the “bass solo” in samba-reggae is literally three drummers agreeing.',
    ],
  },
  'ska-upstroke-1': {
    origin: 'Jamaica — early 1960s (Coxsone Dodd / Duke Reid studio scene)',
    era: '1961–1966 (first wave)',
    history: [
      'Ska’s upstroke puts the guitar/keys accent on the off-beats, and the drum kit answers with a kick-then-lift: one-drop-adjacent kick placement with hats riding steady. It’s mento + R&B shuffled through a hot Kingston summer.',
      'The Skatalites’ drummers (Lloyd Knibb above all) made the pattern a science: relaxed kick, metronome hats, rim clicks for conversation.',
    ],
    artists: ['Lloyd Knibb', 'The Skatalites', 'Carlton & the Shoes (era sessions)'],
    listening: [
      { title: 'Guns of Navarone', artist: 'The Skatalites', note: 'Knibb’s upstroke engine.' },
    ],
    didYouKnow: [
      'Lloyd Knibb learned from Jamaicanjazz drummers and never used a hi-hat stand clamp — he balanced it, claiming the wobble kept his wrists loose.',
    ],
  },
  'ska-two-tone': {
    origin: 'Coventry, UK — 2 Tone Records (1979: The Specials, The Beat, Madness)',
    era: '1979–1985',
    history: [
      '2 Tone sped Jamaican ska up and tightened it for punk audiences: brighter hats, snappier snare, the upstroke as a machine. John Bradbury’s and Everett Morton’s playing kept the Caribbean lift inside a post-punk tempo.',
      'The drum lesson: authenticity lives in the off-beat accent, not in the tempo — the pattern reads ska at 170 or 140 as long as the lift survives.',
    ],
    artists: ['John Bradbury', 'Everett Morton', 'The Skatalites (as reference)'],
    listening: [
      { title: 'Gangsters', artist: 'The Specials', year: '1979', note: 'UK ska’s drum handshake.' },
    ],
    didYouKnow: [
      'The 2 Tone label’s checkerboard logo was a statement about racial cooperation — and the drum pattern was its musical proof: a Jamaican groove with a British punk clock.',
    ],
  },
  'country-train-beat': {
    origin: 'USA — railroads into country/western swing (1920s–50s studio tradition)',
    era: '1930s–present',
    history: [
      'The train beat imitates a locomotive: kick (the wheels’ heavy chuff) + rimshot/side-stick and ghost snare clusters (the rods’ rattle), often with brushes. Johnny Cash’s Tennessee Two simplified it to “boom-chicka” — the train beat is its virtuoso expansion.',
      'Session drummers like Larrie Londin and the Nashville A-Team turned it into a discipline: the ghost-note web must sound like ONE machine, not fast hands.',
    ],
    artists: ['Buddy Harman', 'Larrie Londin', 'The Nashville A-Team'],
    listening: [
      { title: 'Folsom Prison Blues (live)', artist: 'Johnny Cash', year: '1968', note: 'Boom-chicka-boom at 110.' },
    ],
    didYouKnow: [
      'Buddy Harman’s “Ring of Fire” train chuff was played with brushes on asnare and a suitcase — Nashville’s mid-century trick gear economy.',
    ],
  },
  'metal-blast-fragment': {
    origin: 'extreme metal — UK/US underground, mid-1980s (Napalm Death, Repulsion lineage)',
    era: '1985–present',
    history: [
      'The blast beat alternates kick and snare on the same subdivision — a wall of single strokes at 180+ BPM. Early grindcore (Mick Harris) treated it as texture; later death metal (Pete Sandoval) turned it into precision sport.',
      'Notation-wise it is the simplest pattern in this catalog and the hardest to sustain: every stroke identical, no accents to hide behind.',
    ],
    artists: ['Mick Harris', 'Pete Sandoval', 'Gene Hoglan', 'George Kolias'],
    listening: [
      { title: 'You Suffer', artist: 'Napalm Death', year: '1989', note: 'One second of blast history.' },
    ],
    didYouKnow: [
      'A sustained blast at 200 BPM means the drummer’s feet and hands share one subdivision — the floor tom hinge technique (heel-up “swivel”) exists almost entirely because of this pattern.',
    ],
  },
  'gospel-shout': {
    origin: 'Black American church tradition — the up-tempo “shout” service section',
    era: '19th-century roots → 20th-century gospel canon',
    history: [
      'The gospel shout is the church’s fast 2-and-4 drive with linear chops,32nd fills and a ride pattern that keeps the congregation dancing. It is the gym where modern chops culture (the “gospel chops” movement) was born.',
      'Its DNA went mainstream through session players raised in church — every linear fill in contemporary R&B and pop passes through this tradition.',
    ],
    artists: ['Aaron Spears', 'Gerald Heyward', 'Calvin Rodgers', 'Teddy Campbell'],
    listening: [
      { title: 'Amazing (drum-feature live versions)', artist: 'Ricky Dillard & New G', note: 'Shout music at full throttle.' },
    ],
    didYouKnow: [
      '“Shout music” is the fast section where offering is collected — drummers are hired as much for stamina as for vocabulary: 20-minute shout sections at 200+ BPM.',
    ],
  },
  'gospel-linear-chops': {
    origin: 'modern gospel chop culture — church drumlines → YouTube era (2000s–2010s)',
    era: '2000s–present',
    history: [
      'Linear chops sequence kick, snare and toms with NO simultaneous strokes — a relay race of single hits that sounds like one continuous gesture. The style systematized in church, then exploded via drum-cam videos.',
      'In a catalog context, linear phrases teach orchestration: the same phrase lands completely differently depending on which drum eats which step.',
    ],
    artists: ['Aaron Spears', 'Tony Royster Jr.', 'Eric Moore', 'Cobus Potgieter (popularization)'],
    listening: [
      { title: 'Chops-check drum cams', artist: 'various gospel session players', note: 'The living textbook.' },
    ],
    didYouKnow: [
      '“Linear” describes the hands/feet rule, not the sound: at performance speed, listeners hear chords — the drums are faking harmony.',
    ],
  },
  'jazz-second-line': {
    origin: 'New Orleans — parade tradition into jazz and R&B (1880s–present)',
    era: '1880s–present',
    history: [
      'Second line is the street parade rhythm of New Orleans’ social aid clubs: bass drum on beats 1 and 3, snare improvising military-plus-triplet figures behind. Drummers like Earl Palmer translated it onto the kit and into rock’n’roll sessions — “Tutti Frutti” is second line with an amplifier.',
      'The kit version splits the parade across limbs: kick plays the bass drummer’s steady beat while the snare plays the parade’s slang.',
    ],
    artists: ['Earl Palmer', 'Joseph “Smokey” Johnson', 'Herlin Riley', 'Shannon Powell'],
    listening: [
      { title: 'Tutti Frutti', artist: 'Little Richard (Earl Palmer)', year: '1955', note: 'Second line detonates rock.’n’roll.' },
      { title: 'It’s A New Day', artist: 'James Black', note: 'New Orleans funk’s second-line bridge.' },
    ],
    didYouKnow: [
      'Earl Palmer said he played rock’n’roll like a parade — “you always keep the bass drum like the big drum walking”. He left New Orleans for LA in 1957 and accidentally scored half of early rock.',
    ],
  },
  'dubstep-halftime-140': {
    origin: 'South London / Croydon — 2001–2005 (Skream, Benga, Digital Mystikz)',
    era: '2002–present',
    history: [
      'Classic 140 dubstep is half-step: a snare on beat 3, an off-beat hat, and NOTHING else on the grid — the drums exist to frame sub-bass silence. “Midnight Request Line” proved the pattern could carry melody; DMZ nights proved it could carry a room.',
      'Drummers study it as a lesson in negative space: what you remove creates the pressure the bass fills.',
    ],
    artists: ['Skream', 'Benga', 'Mala', 'Coki', 'Loefah'],
    listening: [
      { title: 'Midnight Request Line', artist: 'Skream', year: '2005', note: 'The half-step anthem.' },
    ],
    didYouKnow: [
      'Early dubstep drum patterns were often just two hits per bar — producers called the rest “the void”, and treating it as an instrument is the genre’s core skill.',
    ],
  },
  'footwork-juke': {
    origin: 'Chicago — juke/footwork scene (RP Boo, DJ Rashad, DJ Spinn; 1990s → 2010s)',
    era: '1990s–present',
    history: [
      'Juke/footwork runs at ~160 BPM but FEELS half-time: sparse syncopated hits, stuttered vocal chops, drums that jump-cut like the dancers’ feet. The GhettoTekz/Tea Party DJ circles built the vocabulary on MPCs and Serato EDITS.',
      'It is battle music: patterns are engineered for 60-second solo battles, so every drum hit is a cue for a move.',
    ],
    artists: ['RP Boo', 'DJ Rashad', 'DJ Spinn', 'DJ Clent', 'Traxman'],
    listening: [
      { title: 'Baby Came Home / Legacy-era compilations', artist: 'DJ Rashad', note: 'Footwork’s drum logic in full bloom.' },
    ],
    didYouKnow: [
      'Footwork producers sometimes say the drums “dance”: RP Boo’s early tracks were named after and dedicated to dancers — the drum pattern IS choreography notation.',
    ],
  },
  'amapiano-log': {
    origin: 'Pretoria & Johannesburg townships, South Africa — 2012–2019 (Kabza De Small, DJ Maphorisa generation)',
    era: '2012–present',
    history: [
      'Amapiano slowed kwaito/house’s chassis to ~112 BPM and replaced the bass guitar with the log drum: a pitched, rounded percussion hit played like a drum and tuned like a bass. The kit side is patient — shaker 16ths, sparse kick, rim-and-click conversation.',
      'The log pocket pattern is THE amapiano signature: where the log note lands, everything else steps aside.',
    ],
    artists: ['Kabza De Small', 'DJ Maphorisa', 'DJ Lag (gqom cousin)', 'Focalistic'],
    listening: [
      { title: 'Amapiano Balancè / early Kubu sessions', artist: 'Kabza De Small', note: 'The log drum as lead singer.' },
    ],
    didYouKnow: [
      'The log drum sound comes from the “log drum” patch on old Korg and Yamaha workstations — township producers resurrected a forgotten preset and built a continent’s soundtrack on it.',
    ],
  },
  'breaks-big-beat': {
    origin: 'UK — mid-1990s big beat (The Chemical Brothers, Fatboy Slim; Brighton/London)',
    era: '1994–2001',
    history: [
      'Big beat took hip-hop breaks, raised the tempo to house range, and mixed them like rock drums: fat kick, slamming snare, filter sweeps as build-ups. The Chemical Brothers’ “Block Rockin’ Beats” and Fatboy Slim’s “The Rockafeller Skank” are the canon.',
      'On the grid it’s a breakbeat with rock-mixing values — the pattern is half drum programming, half console attitude.',
    ],
    artists: ['The Chemical Brothers', 'Fatboy Slim', 'The Prodigy (adjacent)', 'Propellerheads'],
    listening: [
      { title: 'Block Rockin’ Beats', artist: 'The Chemical Brothers', year: '1997', note: 'Big beat’s mission statement.' },
    ],
    didYouKnow: [
      'Big beat’s name was half marketing, half genre description — a record-label shorthand for “breakbeats loud enough for a rock venue”.',
    ],
  },
  'garage-bassline': {
    origin: 'UK — speed garage / bassline (Sheffield/Northern England, late 1990s–2000s)',
    era: '1997–present',
    history: [
      'Bassline garage kept 2-step’s broken backbeat but re-weighted everything around a wobbling, sub-heavy bass riff — the drums play defense: crisp skippy hats, claps on 2-and-4, kick lands where the bass rests.',
      'It’s the link in the chain from US house → UK garage → bassline → modern UK club edits.',
    ],
    artists: ['T2', 'Blackout JA (production circles)', 'DJ Q', 'Marcus Nasty (N.A.S.A. era)'],
    listening: [
      { title: 'Heartbroken', artist: 'T2 & Jodie Aysha', year: '2007', note: 'Bassline’s pop summit.' },
    ],
    didYouKnow: [
      'Bassline’s drum rule of thumb among Sheffield producers: “the kick is the bass’s shadow” — if both hit together, one of them is wrong.',
    ],
  },
  'xe-garage-2step-classic': {
    origin: 'London — UK garage’s 2-step era (1997–2001: MJ Cole, El-B, Todd Edwards influence)',
    era: '1997–2002',
    history: [
      '2-step removed house’s steady four-on-floor kick and answered with a broken kick pattern (hits on 1 and around the “and” of 3) under shuffled hats and RJ-dipped snare ghosts. It made UK garage feel like house dancing on ice.',
      'The classic cell — kick 0/10, snare/clap 4/12, swing 12–20% — is one of the most reused templates in modern pop production.',
    ],
    artists: ['MJ Cole', 'El-B', 'Zed Bias', 'Todd Edwards (US influence)'],
    listening: [
      { title: 'Sincere', artist: 'MJ Cole', year: '2000', note: '2-step with strings and manners.' },
    ],
    didYouKnow: [
      '“2-step” describes the KICK pattern, not the tempo — producers joke that the genre’s real name is “where-did-the-other-two-kicks-go house”.',
    ],
  },
  'xg-pop-dembow-tropic': {
    origin: 'the dembow riddim (Kingston → San Juan → global Latin pop)',
    era: '1990–present',
    history: [
      'The dembow cell — a 3+3+2-lifted kick with snare/rim accents — is the chassis of reggaeton and tropical pop. This pattern places it inside a modern pop arrangement: same physics, radio scale.',
      'Count it as “boom… ch-boom-chick” and you’ll hear it in roughly half of the Billboard Latin chart, and increasingly everywhere else.',
    ],
    artists: ['Shabba Ranks (source riddim)', 'Daddy Yankee', 'Dímelo Flow (modern engine rooms)'],
    listening: [
      { title: 'Gasolina', artist: 'Daddy Yankee', year: '2004', note: 'Dembow at pop velocity.' },
    ],
    didYouKnow: [
      'The word “dembow” comes from Shabba Ranks’ “Dem Bow” — the riddim’s name outlived the song so thoroughly that producers now use it as a genre name without knowing the origin.',
    ],
  },
  'karsilama-9-8': {
    origin: 'Macedonia/Thrace — the karsilama dance (9/8, 2+2+2+3)',
    era: 'folk antiquity–present',
    history: [
      'Karsilama groups nine eighth-notes as 2+2+2+3 — four steps, the last one stretched. The drum pattern marks the group heads with a deep stroke (DUM) and fills with taks, so dancers hear the “and-a-half” bar as four unequal strides.',
      'It migrated into bellydance orchestras, Balkan brass and modern metal/prog as the ur-example of an asymmetric meter that still grooves.',
    ],
    artists: ['Ivo Papazov', 'Ferus Mustafov', 'Balkan beat box (modern)'],
    listening: [
      { title: 'Karsilama sets (Balkan brass)', artist: 'various Roma brass bands', note: '9/8 at dance tempo.' },
    ],
    didYouKnow: [
      'In 2+2+2+3, the extra half-beat at the end is the DANCE flourish — choreography sources describe it as the step where the dancer “decorates” before the loop restarts.',
    ],
  },
  'country-halftime-ballad': {
    origin: 'Nashville session tradition — the half-time country ballad engine',
    era: '1960s–present',
    history: [
      'Country ballads often sit the snare on beat 3 with train-derived ghost webs underneath — a half-time reading of the boom-chicka engine. It creates the “wide open road” feel under verses without doubling the tempo.',
      'The Nashville A-Team’s discipline: ghost notes like a machine, not like a player — the snare web should sound like a train you can hear, not hands you can watch.',
    ],
    artists: ['Buddy Harman', 'Larrie Londin', 'Eddie Bayers'],
    listening: [
      { title: 'He Stopped Loving Her Today', artist: 'George Jones', year: '1980', note: 'Half-time ballad patience.' },
    ],
    didYouKnow: [
      'Eddie Bayers, the most-nominated Nashville session drummer, keeps a train-beat ghost map written on setlists — a 40-year practice reduced to pencil marks.',
    ],
  },
  'metal-half-time-thrash': {
    origin: 'Bay Area thrash — the half-time “circle pit” slam (Metallica, Slayer, Exodus era)',
    era: '1983–present',
    history: [
      'Thrash’s half-time sections drop the double-kick engine to a stomping halftime with open hats and crash accents — the “slam” where crowds circle. The drums flip from machine gun to sledgehammer without changing tempo.',
      'Notation-wise: same BPM, half the events, twice the weight — a masterclass in density contrast.',
    ],
    artists: ['Lars Ulrich (era context)', 'Dave Lombardo', 'Gene Hoglan'],
    listening: [
      { title: 'Angel of Death (mid-song slam)', artist: 'Slayer', year: '1986', note: 'Half-time as violence modulation.' },
    ],
    didYouKnow: [
      'Gene Hoglan earned the nickname “The Atomic Clock” partly for exactly this skill: holding halftime slams as steady as his double-kick blasts.',
    ],
  },
  'rock-half-time-power': {
    origin: 'classic rock’s power-ballad/stomp tradition (1970s arena era)',
    era: '1970s–present',
    history: [
      'Half-time power stomps put the backbeat on 3 with a wide kick stance — the “arms crossed, head down” moment of arena rock. John Bonham’s ballad work and every stadium act since use the modulation: verses in four, choruses in weight.',
      'The pattern teaches dynamics through subtraction: same tempo, fewer notes, bigger room.',
    ],
    artists: ['John Bonham', 'Phil Rudd (school of)', 'Matt Cameron (grunge-era)'],
    listening: [
      { title: 'When the Levee Breaks', artist: 'Led Zeppelin', year: '1971', note: 'Half-time as architecture.' },
    ],
    didYouKnow: [
      '“When the Levee Breaks” drums were recorded in a manor-house hallway with two microphones on the stair landing — the halftime stomp’s “size” is literally the room.',
    ],
  },
  'disco-halftime-bridge': {
    origin: 'Philly/NY disco arrangements — the half-time breakdown bridge (MFSB, Salsoul era)',
    era: '1974–1982',
    history: [
      'Disco bridges drop to half-time for 4–8 bars: open hats bloom, the backbeat sits on 3, strings build the ceiling — then the four-on-floor detonates again. Earl Young’s hi-hat work set the template; the breakdown is the DJ’s favorite 8 bars.',
      'Modern house and pop still use the exact dramaturgy: halftime bridge → filter riser → drop.',
    ],
    artists: ['Earl Young', 'James Gadson (session cousin)', 'Salsoul Orchestra rhythm section'],
    listening: [
      { title: 'Love Hangover', artist: 'Diana Ross', year: '1976', note: 'Halftime bridge as architecture.' },
    ],
    didYouKnow: [
      'Earl Young invented the four-on-floor disco kick almost by accident — he said he played it “like a big band floor tom figure”, and the dancefloor did the rest.',
    ],
  },
  'rnb-neo-dilla': {
    origin: 'Detroit / LA — J Dilla’s unquantized school as adopted by neo-soul (Erykah Badu, D’Angelo eras)',
    era: '1998–present',
    history: [
      'Neo-Dilla grooves play behind the grid on purpose: swing pushed past comfortable, ghosts where the click says rests. Questlove and Pino Palladino’s live takes on Dilla’s productions (Voodoo sessions, 2000) translated MPC-feel into band-feel.',
      'The pattern is a timing study: notate it straight, then drag the snare 20–30 ms and the groove appears.',
    ],
    artists: ['J Dilla', 'Questlove', 'Karriem Riggins', 'Chris “Daddy” Dave'],
    listening: [
      { title: 'Didn’t Cha Know', artist: 'Erykah Badu (Jay Dee)', year: '2000', note: 'The drag made audible.' },
    ],
    didYouKnow: [
      'Questlove practiced Dilla’s “Voodoo” grooves by playing along with the MPC demo, not the record — copying the machine’s imperfection before humans ever played it.',
    ],
  },
  'lofi-vinyl-half': {
    origin: '2010s lofi/beat-tape culture — Dilla and Nujabes inheritances',
    era: '2012–present',
    history: [
      'Lofi halftime is boom-bap slowed and darkened: snare on 3, dusty hats, vinyl crackle as percussion. The genre is a mood system — drums mixed for studying, not for the club.',
      'Notationally it is one of the simplest patterns here; aesthetically it is one of the most specific — every element is degraded on purpose.',
    ],
    artists: ['Nujabes', 'J Dilla (school)', 'Idealism-era producers', 'mndsgn (adjacent)'],
    listening: [
      { title: 'Luv(sic) series', artist: 'Nujabes & Shing02', note: 'Lofi’s warm-blooded blueprint.' },
    ],
    didYouKnow: [
      'Much lofi’s “vinyl noise” is literally an audio file of a needle dropped on wax — producers layer it like a hi-hat, at volume levels that would horrify mastering engineers.',
    ],
  },
}

/** merge family + pattern knowledge for one pattern (no-throw, UI-safe) */
export interface MergedKnowledge {
  origin: string | null
  region: string | null
  era: string | null
  classification: string | null
  history: string[]
  artists: string[]
  listening: ListenPick[]
  didYouKnow: string[]
  hasStory: boolean
}

export function knowledgeFor(p: GroovePattern): MergedKnowledge {
  const fam = FAMILY_KNOWLEDGE[p.family] ?? null
  const pat = PATTERN_KNOWLEDGE[p.id] ?? null
  const origin = pat?.origin ?? fam?.origin ?? null
  const region = fam?.region ?? null
  const era = pat?.era ?? fam?.era ?? null
  const classification = fam?.classification ?? null
  const history = [...(pat?.history ?? []), ...(fam?.history ?? [])]
  const artists = [...(pat?.artists ?? []), ...(fam?.artists ?? [])]
  const listening = [...(pat?.listening ?? []), ...(fam?.listening ?? [])]
  const didYouKnow = [...(pat?.didYouKnow ?? []), ...(fam?.didYouKnow ?? [])]
  return {
    origin,
    region,
    era,
    classification,
    history,
    artists,
    listening,
    didYouKnow,
    hasStory: history.length > 0 || !!origin,
  }
}

/** how much of the catalog the story layer currently covers (for audits) */
export const KNOWLEDGE_COVERAGE = {
  families: Object.keys(FAMILY_KNOWLEDGE).length,
  patterns: Object.keys(PATTERN_KNOWLEDGE).length,
}
