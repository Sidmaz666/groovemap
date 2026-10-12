import type { GroovePattern } from '../types'
import { validatePattern } from '../types'

/** Pattern JSON export/import — round-trips the full canonical schema. */

export function downloadJson(p: GroovePattern) {
  const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${p.slug}.groove.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function importJson(text: string): GroovePattern {
  const raw = JSON.parse(text) as GroovePattern
  if (!raw || typeof raw !== 'object') throw new Error('Not a valid pattern file')
  if (!Array.isArray(raw.tracks) || !Array.isArray(raw.events)) {
    throw new Error('Missing tracks or events')
  }
  const p: GroovePattern = {
    ...raw,
    id: raw.id || 'imported',
    slug: raw.slug || raw.id || 'imported',
    title: raw.title || 'Imported Groove',
    summary: raw.summary || 'Imported from JSON.',
    description: raw.description || 'Imported pattern file.',
    family: raw.family || 'experimental',
    genres: raw.genres || ['Imported'],
    tags: raw.tags || ['imported'],
    difficulty: raw.difficulty || 'intermediate',
    bpm: raw.bpm || 120,
    tempoRange: raw.tempoRange || [60, 200],
    timeSignature: raw.timeSignature || { num: 4, den: 4 },
    bars: raw.bars || 1,
    subdivision: raw.subdivision || 4,
    feel: raw.feel || 'straight',
    swing: raw.swing ?? 0,
    syncopation: raw.syncopation ?? 1,
    density: raw.density ?? 1,
    kitSuggestion: raw.kitSuggestion || 'analog909',
    learning: raw.learning || { construction: 'Imported pattern.', roles: {} },
    source: raw.source || { type: 'original', note: 'Imported JSON' },
    schemaVersion: 1,
  }
  const issues = validatePattern(p)
  if (issues.some((i) => i.level === 'error')) {
    throw new Error(`Validation failed: ${issues.filter((i) => i.level === 'error').map((i) => i.msg).join('; ')}`)
  }
  return p
}
