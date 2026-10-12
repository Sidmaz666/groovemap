/**
 * References — every pattern page links out to authoritative reading and
 * listening: Wikipedia articles (stable, encyclopedic) and YouTube search
 * links (always valid, surface lessons / performances / classics).
 *
 * Family-level refs cover every pattern in that family; KEYWORD_REFS adds
 * pattern-specific articles (tresillo, amen break, clave…) by matching
 * titles, genres and tags.
 */

export type RefKind = 'wiki' | 'youtube'

export interface RefLink {
  kind: RefKind
  label: string
  /** why this link is here */
  note: string
  url: string
}

interface FamilyRefs {
  label: string
  /** Wikipedia article slug (after /wiki/) */
  wiki?: string
  /** youtube search query for listening/study */
  listen: string
}

const wiki = (slug: string) => `https://en.wikipedia.org/wiki/${slug}`
export const ytSearch = (q: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`

export const FAMILY_REFS: Record<string, FamilyRefs> = {
  rock: { label: 'Rock', wiki: 'Rock_music', listen: 'rock drumming beats lesson' },
  pop: { label: 'Pop', wiki: 'Pop_music', listen: 'pop drum groove tutorial' },
  metal: { label: 'Metal', wiki: 'Heavy_metal_music', listen: 'heavy metal drumming double kick lesson' },
  punk: { label: 'Punk', wiki: 'Punk_rock', listen: 'punk drumming beats lesson' },
  country: { label: 'Country & Bluegrass', wiki: 'Country_music', listen: 'country train beat drumming lesson' },
  gospel: { label: 'Gospel', wiki: 'Gospel_music', listen: 'gospel chops drumming lesson' },
  blues: { label: 'Blues & Shuffle', wiki: 'Blues', listen: 'blues shuffle drumming lesson' },
  funk: { label: 'Funk & Soul', wiki: 'Funk', listen: 'funk drumming lesson ghost notes' },
  rnb: { label: 'R&B / Soul', wiki: 'Contemporary_R%26B', listen: 'neo soul rnb drum groove tutorial' },
  disco: { label: 'Disco & Boogie', wiki: 'Disco', listen: 'disco drumming four on the floor lesson' },
  jazz: { label: 'Jazz', wiki: 'Jazz', listen: 'jazz ride swing pattern drum lesson' },
  bossa: { label: 'Bossa Nova', wiki: 'Bossa_nova', listen: 'bossa nova drumming lesson' },
  samba: { label: 'Samba', wiki: 'Samba', listen: 'samba batucada drumming lesson' },
  latin: { label: 'Latin Timelines', wiki: 'Clave_(rhythm)', listen: 'latin drumming clave lesson' },
  reggae: { label: 'Dub & Reggae', wiki: 'Reggae', listen: 'reggae one drop drumming lesson' },
  ska: { label: 'Ska & Rocksteady', wiki: 'Ska', listen: 'ska drumming lesson' },
  hiphop: { label: 'Hip-Hop & Boom Bap', wiki: 'Hip_hop_music', listen: 'boom bap drum programming tutorial' },
  trap: { label: 'Trap', wiki: 'Trap_music', listen: 'trap hi-hat rolls drum programming' },
  lofi: { label: 'Lo-Fi & Chill', wiki: 'Lo-fi_music', listen: 'lofi boom bap drums tutorial' },
  house: { label: 'House', wiki: 'House_music', listen: 'house drums four on the floor programming' },
  garage: { label: 'UK Garage & Broken', wiki: 'UK_garage', listen: 'uk garage 2-step drums tutorial' },
  jungle: { label: 'Jungle & DnB', wiki: 'Jungle_music', listen: 'jungle breakbeat chopping tutorial' },
  breaks: { label: 'Breaks & Big Beat', wiki: 'Breakbeat', listen: 'breakbeat drum programming tutorial' },
  techno: { label: 'Techno & Electro', wiki: 'Techno', listen: 'techno drum programming tutorial' },
  dubstep: { label: 'Dubstep & 140', wiki: 'Dubstep', listen: 'dubstep drum pattern tutorial' },
  afrobeat: { label: 'Afrobeat', wiki: 'Afrobeat', listen: 'afrobeat drum lesson tony allen' },
  world: { label: 'World Percussion', wiki: 'Hand_drum', listen: 'world percussion rhythms lesson' },
  experimental: { label: 'Odd Meter & Experimental', wiki: 'Metre_(music)', listen: 'odd time signatures drum lesson' },
  learn: { label: 'Building Blocks', wiki: 'Drum_beat', listen: 'how to count drum patterns for beginners' },
  synthwave: { label: 'Synthwave', wiki: 'Synthwave', listen: 'synthwave drum programming tutorial' },
  fills: { label: 'Fills & Phrasing', wiki: 'Drum_fill', listen: 'drum fills lesson' },
  indian: { label: 'Indian & Carnatic', wiki: 'Tala_(music)', listen: 'carnatic solkattu rhythm lesson' },
  arabic: { label: 'Middle Eastern', wiki: 'Arabic_music', listen: 'arabic rhythms maqsum doumbek lesson' },
  balkan: { label: 'Balkan & Aksak', wiki: 'Balkan_music', listen: 'balkan 7/8 odd meters drum lesson' },
  caribbean: { label: 'Caribbean & Carnival', wiki: 'Music_of_the_Caribbean', listen: 'soca dancehall reggaeton drum lesson' },
  african: { label: 'African & Diaspora', wiki: 'Music_of_Africa', listen: 'west african bell pattern drum lesson' },
  drill: { label: 'Drill & Grime', wiki: 'Drill_music', listen: 'drill sliding 808 drum programming' },
  club: { label: 'Club & Ballroom', wiki: 'Electronic_dance_music', listen: 'juke footwork ballroom drums lesson' },
}

/** pattern-specific article matches: keyword → wiki slug (word-boundary match) */
const KEYWORD_REFS: { test: RegExp; slug: string; label: string }[] = [
  { test: /\btresillo\b/i, slug: 'Tresillo_(rhythm)', label: 'Tresillo (rhythm)' },
  { test: /\bhabanera\b/i, slug: 'Habanera', label: 'Habanera' },
  { test: /\bdembow\b/i, slug: 'Dembow', label: 'Dembow' },
  { test: /\bclave\b/i, slug: 'Clave_(rhythm)', label: 'Clave' },
  { test: /\bamen\b/i, slug: 'Amen_break', label: 'Amen break' },
  { test: /\bfunky drummer\b/i, slug: 'Funky_Drummer', label: '“Funky Drummer”' },
  { test: /\bbo diddley\b/i, slug: 'Bo_Diddley', label: 'Bo Diddley beat' },
  { test: /\bbackbeat\b/i, slug: 'Back_beat', label: 'Backbeat' },
  { test: /\bfour on the floor\b|\b4 on the floor\b/i, slug: 'Four_on_the_floor_(music)', label: 'Four on the floor' },
  { test: /\bshuffle\b/i, slug: 'Shuffle', label: 'Shuffle rhythm' },
  { test: /\bswing\b/i, slug: 'Swing_(jazz_performance_style)', label: 'Swing feel' },
  { test: /\bsecond line\b/i, slug: 'Second_line', label: 'Second line' },
  { test: /\breggaeton\b/i, slug: 'Reggaeton', label: 'Reggaeton' },
  { test: /\bcumbia\b/i, slug: 'Cumbia', label: 'Cumbia' },
  { test: /\bamapiano\b/i, slug: 'Amapiano', label: 'Amapiano' },
  { test: /\bgqom\b/i, slug: 'Gqom', label: 'Gqom' },
  { test: /\bsoukous\b/i, slug: 'Soukous', label: 'Soukous' },
  { test: /\bsolkattu\b/i, slug: 'Solkattu', label: 'Solkattu' },
  { test: /\btala\b/i, slug: 'Tala_(music)', label: 'Tala' },
  { test: /\beuclid/i, slug: 'Euclidean_rhythm', label: 'Euclidean rhythm' },
  { test: /\bpolyrhythm\b|\bpolyrhythmic\b/i, slug: 'Polyrhythm', label: 'Polyrhythm' },
  { test: /\bmotown\b/i, slug: 'Motown', label: 'Motown' },
  { test: /\bbreakbeat\b/i, slug: 'Breakbeat', label: 'Breakbeat' },
  { test: /\bghost ?note\b/i, slug: 'Ghost_note', label: 'Ghost notes' },
  { test: /\bsoca\b/i, slug: 'Soca_music', label: 'Soca' },
  { test: /\bkompa\b|\bkonpa\b/i, slug: 'Compas', label: 'Kompa' },
  { test: /\bbatucada\b/i, slug: 'Batucada_(samba_style)', label: 'Batucada' },
  { test: /\bbossa\b/i, slug: 'Bossa_nova', label: 'Bossa nova' },
  { test: /\bhighlife\b/i, slug: 'Highlife', label: 'Highlife' },
  { test: /\bjerk? \b|\btimbales\b/i, slug: 'Timbales', label: 'Timbales' },
  { test: /\bconga?s?\b/i, slug: 'Conga', label: 'Congas' },
  { test: /\bdunun\b|\bdjembe\b/i, slug: 'Djembe', label: 'Djembe & dunun' },
  { test: /\btrip ?hop\b/i, slug: 'Trip_hop', label: 'Trip hop' },
  { test: /\bjungle\b/i, slug: 'Jungle_music', label: 'Jungle' },
  { test: /\bdnb\b|\bdrum (and|&) bass\b/i, slug: 'Drum_and_bass', label: 'Drum and bass' },
]

/**
 * Build the reference set for one pattern: family wiki → keyword articles →
 * family listening → title/genre listening. Deduped, capped at 7.
 */
export function referencesFor(p: {
  title: string
  family: string
  genres: string[]
  tags: string[]
}): RefLink[] {
  const out: RefLink[] = []
  const seen = new Set<string>()
  const push = (l: RefLink) => {
    if (seen.has(l.url) || out.length >= 7) return
    seen.add(l.url)
    out.push(l)
  }

  const fam = FAMILY_REFS[p.family]
  if (fam?.wiki) {
    push({
      kind: 'wiki',
      label: `Wikipedia — ${fam.label}`,
      note: `the ${fam.label} story, key artists and recordings`,
      url: wiki(fam.wiki),
    })
  }

  const haystack = [p.title, p.genres.join(' '), p.tags.join(' ')].join(' · ')
  for (const k of KEYWORD_REFS) {
    if (k.test.test(haystack)) {
      push({
        kind: 'wiki',
        label: `Wikipedia — ${k.label}`,
        note: `specifically relevant to this groove`,
        url: wiki(k.slug),
      })
    }
  }

  if (fam) {
    push({
      kind: 'youtube',
      label: `YouTube search — ${fam.label} drums`,
      note: `lessons & performances: “${fam.listen}”`,
      url: ytSearch(fam.listen),
    })
  }
  push({
    kind: 'youtube',
    label: `YouTube search — “${p.title}”`,
    note: 'hear drummers play this exact groove',
    url: ytSearch(`${p.title} drum groove`),
  })
  const g = p.genres[0]
  if (g) {
    push({
      kind: 'youtube',
      label: `YouTube search — ${g} drum patterns`,
      note: `more ${g} grooves in context`,
      url: ytSearch(`${g} drum patterns`),
    })
  }
  return out
}
