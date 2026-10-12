import { json, optionsResponse, parsePatternQuery, filterPatterns, compactPattern } from '../_shared'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const { query, error } = parsePatternQuery(url)
  if (error) {
    return json({ error }, { status: 400, endpoint: '/api/v1/patterns', hint: 'Use bpm_min <= bpm_max, e.g. ?bpm_min=90&bpm_max=120.' })
  }
  const filtered = filterPatterns(query)
  const page = filtered.slice(query.offset, query.offset + query.limit)
  const items = query.fields === 'full' ? page.map((p) => p) : page.map(compactPattern)

  return json(
    {
      total: filtered.length,
      count: items.length,
      offset: query.offset,
      limit: query.limit,
      fields: query.fields,
      items,
      query: {
        ...(query.families.length && { family: query.families }),
        ...(query.genres.length && { genre: query.genres }),
        ...(query.q && { q: query.q }),
        ...(query.meter && { meter: query.meter }),
        ...(query.feels.length && { feel: query.feels }),
        ...(query.difficulties.length && { difficulty: query.difficulties }),
        ...(query.bpmMin != null && { bpm_min: query.bpmMin }),
        ...(query.bpmMax != null && { bpm_max: query.bpmMax }),
        ...(query.bars != null && { bars: query.bars }),
        ...(query.subdivision != null && { subdivision: query.subdivision }),
        ...(query.sort && { sort: query.sort }),
      },
    },
    {
      endpoint: '/api/v1/patterns',
      hint:
        'Fetch a full pattern with /api/v1/patterns/{id}; narrow further with family, genre, meter, feel, difficulty, bpm_min/bpm_max, bars, subdivision, q.',
    }
  )
}

export async function OPTIONS() {
  return optionsResponse()
}
