import { json, optionsResponse, compactPattern, API_NAME, API_DOCS } from './_shared'
import { PATTERNS, FAMILY_LIST, CURATED_COLLECTIONS } from '@/lib/atlas/patterns'
import { KNOWLEDGE_COVERAGE } from '@/lib/atlas/knowledge'

export const runtime = 'nodejs'

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/v1',
    description: 'This discovery document. `?format=text` returns it as markdown.',
  },
  {
    method: 'GET',
    path: '/api/v1/patterns',
    description:
      'Search/list patterns. Params: limit (1-200, default 50), offset, family (csv), genre (csv), q (full-text), meter ("4/4"), feel, difficulty, bpm_min, bpm_max, bars, subdivision (1|2|3|4|6), sort (bpm|difficulty|family|id), fields (compact|full).',
  },
  {
    method: 'GET',
    path: '/api/v1/patterns/{id}',
    description:
      'One pattern, complete: events grid, learning notes, story knowledge, notation tab, references, related patterns.',
  },
  {
    method: 'GET',
    path: '/api/v1/families',
    description: 'All style families with counts, meters, BPM ranges and sample pattern ids.',
  },
  {
    method: 'GET',
    path: '/api/v1/families/{key}',
    description: 'One family: origin/knowledge, stats and its patterns (`?limit=`).',
  },
  {
    method: 'GET',
    path: '/api/v1/random',
    description: 'Random compact pattern(s). `?count=` 1-10.',
  },
  {
    method: 'GET',
    path: '/api/v1/collections',
    description: 'Curated collections with counts, families and pattern ids.',
  },
  {
    method: 'GET',
    path: '/api/v1/stats',
    description: 'Catalog totals: patterns, families, genres, meters, kits, BPM range, knowledge coverage.',
  },
]

export async function GET(request: Request) {
  const url = new URL(request.url)
  const text = url.searchParams.get('format') === 'text'

  if (text) {
    const md = [
      '# Groovemap API v1',
      '',
      '> Machine-readable catalog of drum patterns: search, inspect, and export grooves.',
      `> ${PATTERNS.length} patterns across ${FAMILY_LIST.length} style families. Read-only, JSON, CORS-open.`,
      '',
      '## Endpoints',
      ...ENDPOINTS.map((e) => `- \`${e.method} ${e.path}\` — ${e.description}`),
      '',
      '## Examples',
      '- `/api/v1/patterns?family=funk&q=ghost&limit=5` — five funk patterns mentioning ghosts',
      '- `/api/v1/patterns/bossa-core` — full pattern with tab + story',
      '- `/api/v1/random?count=3` — three random grooves',
      '',
      `Full docs: ${API_DOCS} · MCP server: \`/mcp?XTransformPort=3121\` (JSON-RPC 2.0)`,
      '',
    ].join('\n')
    return new Response(md, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }

  const genres = new Set(PATTERNS.flatMap((p) => p.genres))
  const meters = new Set(PATTERNS.map((p) => `${p.timeSignature.num}/${p.timeSignature.den}`))

  return json(
    {
      name: API_NAME,
      description:
        'Groovemap is a drum-pattern encyclopedia: every pattern is an original study composition or a documented common-practice/traditional groove, encoded as a step grid (tracks + events with velocities), with construction notes, per-instrument roles, variations, provenance and references. This API exposes the whole catalog read-only as JSON for humans, apps and LLM agents.',
      catalog: {
        patterns: PATTERNS.length,
        families: FAMILY_LIST.length,
        genres: genres.size,
        meters: [...meters].sort(),
        curatedCollections: CURATED_COLLECTIONS.length,
        knowledgeCoverage: KNOWLEDGE_COVERAGE,
        familyKeys: FAMILY_LIST.map((f) => f.key),
        license: 'Pattern data (rhythms, grids, original text) by Groovemap — free to quote with attribution; traditional timelines belong to their living traditions.',
      },
      conventions: {
        responseType: 'JSON with a top-level `meta` block (service, endpoint, docs, next-step hint)',
        pagination: 'limit + offset; responses include total, count, offset',
        compactFields:
          'id, title, family, genres, bpm, timeSignature ("4/4"), feel, difficulty, bars, subdivision, swing, summary, stepCount, hitCount, kit',
        fullFields: 'compact + description, tags, tracks, events, learning, variations, related, source, tempoRange, syncopation, density',
        cors: 'Access-Control-Allow-Origin: * on every endpoint',
        caching: 'Cache-Control: public, max-age=300 on stable GETs',
      },
      endpoints: ENDPOINTS,
      examples: [
        '/api/v1/patterns?family=funk&q=ghost&limit=5',
        '/api/v1/patterns?meter=4/4&bpm_min=120&bpm_max=130&sort=bpm',
        '/api/v1/patterns/funk-jb',
        '/api/v1/families/jungle',
        '/api/v1/random?count=3',
      ],
      mcp: {
        transport: 'Streamable HTTP (JSON-RPC 2.0) at /mcp?XTransformPort=3121',
        note: 'Same catalog over the Model Context Protocol — tools: search_patterns, get_pattern, list_families, get_family, random_pattern, get_stats, list_collections, export_pattern_midi_b64.',
      },
      sample: compactPattern(PATTERNS[0]),
    },
    {
      endpoint: '/api/v1',
      hint: 'Start with /api/v1/patterns?family=funk&q=ghost — then fetch a single pattern by id for its full grid and notation.',
    }
  )
}

export async function OPTIONS() {
  return optionsResponse()
}
