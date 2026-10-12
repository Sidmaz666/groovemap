import { json, optionsResponse } from '../_shared'
import { PATTERNS, FAMILY_LIST, CURATED_COLLECTIONS } from '@/lib/atlas/patterns'
import { KNOWLEDGE_COVERAGE } from '@/lib/atlas/knowledge'

export const runtime = 'nodejs'

const KIT_NAMES: Record<string, string> = {
  analog808: 'TR-808 analog',
  analog909: 'TR-909 analog',
  studio: 'Studio rock (acoustic)',
  tight: 'Tight / LinnDrum-flavoured',
  dusty: 'Dusty vintage',
  perc: 'World percussion ensemble',
  synth: 'Synth / CR-78 / R-8',
  studioBright: 'Studio Bright (acoustic, open mix)',
  studioRoom: 'Studio Roomy (acoustic, dark mix)',
  tr808Tape: '808 Tape (dark saturated mix)',
  tr909Club: '909 Club (driven club mix)',
}

export async function GET() {
  const genres = new Map<string, number>()
  const meters = new Map<string, number>()
  const kits = new Map<string, number>()
  const feels = new Map<string, number>()
  const difficulties = new Map<string, number>()
  for (const p of PATTERNS) {
    for (const g of p.genres) genres.set(g, (genres.get(g) ?? 0) + 1)
    const m = `${p.timeSignature.num}/${p.timeSignature.den}`
    meters.set(m, (meters.get(m) ?? 0) + 1)
    kits.set(p.kitSuggestion, (kits.get(p.kitSuggestion) ?? 0) + 1)
    feels.set(p.feel, (feels.get(p.feel) ?? 0) + 1)
    difficulties.set(p.difficulty, (difficulties.get(p.difficulty) ?? 0) + 1)
  }
  const bpms = PATTERNS.map((p) => p.bpm)
  const perFamily = FAMILY_LIST.map((f) => ({
    key: f.key,
    label: f.label,
    count: PATTERNS.filter((p) => p.family === f.key).length,
  })).sort((a, b) => b.count - a.count)

  return json(
    {
      patterns: PATTERNS.length,
      families: FAMILY_LIST.length,
      genres: genres.size,
      metersTotal: meters.size,
      kitsTotal: kits.size,
      curatedCollections: CURATED_COLLECTIONS.length,
      bpmRange: { min: Math.min(...bpms), max: Math.max(...bpms) },
      difficulty: Object.fromEntries(difficulties),
      feels: Object.fromEntries(feels),
      meters: Object.fromEntries([...meters].sort((a, b) => b[1] - a[1])),
      kits: Object.fromEntries([...kits].map(([k, v]) => [k, { name: KIT_NAMES[k] ?? k, patterns: v }])),
      topGenres: [...genres.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([g, c]) => ({ genre: g, patterns: c })),
      perFamily: perFamily,
      knowledgeCoverage: KNOWLEDGE_COVERAGE,
    },
    {
      endpoint: '/api/v1/stats',
      hint: 'Use /api/v1/families for family detail or /api/v1/patterns?family={key} to list a family.',
    }
  )
}

export async function OPTIONS() {
  return optionsResponse()
}
