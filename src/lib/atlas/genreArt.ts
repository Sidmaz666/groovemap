/**
 * Genre artwork — one cohesive dark/lime-accent image per style family,
 * generated into public/genre/. Every card and family surface pulls from
 * this map so the same family always looks the same everywhere.
 */
const GENRE_KEYS = new Set([
  'rock', 'pop', 'metal', 'punk', 'country', 'gospel', 'blues', 'funk',
  'rnb', 'disco', 'jazz', 'bossa', 'samba', 'latin', 'reggae', 'ska',
  'hiphop', 'trap', 'lofi', 'house', 'garage', 'jungle', 'breaks',
  'techno', 'dubstep', 'afrobeat', 'world', 'experimental', 'learn',
  'synthwave', 'fills', 'indian', 'arabic', 'balkan', 'caribbean',
  'african', 'drill', 'club', 'default',
])

export function genreArtFor(family: string): string {
  return GENRE_KEYS.has(family) ? `/genre/${family}.jpg` : '/genre/default.jpg'
}

/** curated collections map to the family art that best matches their theme */
export const COLLECTION_ART: Record<string, string> = {
  'first-beats': 'learn',
  'odd-meters': 'experimental',
}

export function collectionArtFor(id: string, firstFamily: string): string {
  const key = COLLECTION_ART[id] ?? firstFamily
  return genreArtFor(key)
}
