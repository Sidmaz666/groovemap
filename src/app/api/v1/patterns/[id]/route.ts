import { json, optionsResponse, notFound, compactPattern, meterOf, stepCountOf } from '../../_shared'
import { getPattern } from '@/lib/atlas/patterns'
import { knowledgeFor } from '@/lib/atlas/knowledge'
import { referencesFor } from '@/lib/atlas/references'
import { drumTab } from '@/lib/atlas/notation'

export const runtime = 'nodejs'

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const p = getPattern(id)
  if (!p) {
    return notFound(
      '/api/v1/patterns/{id}',
      `Pattern "${id}"`,
      'List valid ids with /api/v1/patterns or /api/v1/families — ids are kebab-case like "funk-jb", "backbeat-basic".'
    )
  }

  const knowledge = knowledgeFor(p)
  const references = referencesFor({ title: p.title, family: p.family, genres: p.genres, tags: p.tags })
  const tab = drumTab(p)
  const related = (p.related ?? []).map((rid) => getPattern(rid)).filter((r) => r != null)

  return json(
    {
      pattern: {
        ...p,
        meter: meterOf(p),
        stepCount: stepCountOf(p),
        hitCount: p.events.length,
      },
      knowledge,
      references,
      notation: {
        legend: 'X accent · x normal · o ghost · digits = roll ×n · p probabilistic · - rest',
        drumTab: tab,
      },
      related: related.map(compactPattern),
    },
    {
      endpoint: `/api/v1/patterns/${id}`,
      hint: 'Render notation.drumTab.rows as an ASCII grid (label + one char per step, counts row on top); events[] are absolute step indices for re-sequencing.',
    }
  )
}

export async function OPTIONS() {
  return optionsResponse()
}
