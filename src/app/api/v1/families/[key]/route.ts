import { json, optionsResponse, notFound, compactPattern } from '../../_shared'
import { PATTERNS, FAMILY_LIST } from '@/lib/atlas/patterns'
import { FAMILY_KNOWLEDGE } from '@/lib/atlas/knowledge'

export const runtime = 'nodejs'

export async function GET(request: Request, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params
  const fam = FAMILY_LIST.find((f) => f.key === key.toLowerCase())
  if (!fam) {
    return notFound(
      '/api/v1/families/{key}',
      `Family "${key}"`,
      `Known family keys: ${FAMILY_LIST.map((f) => f.key).join(', ')}.`
    )
  }

  const url = new URL(request.url)
  const limitRaw = Number(url.searchParams.get('limit'))
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(200, Math.floor(limitRaw))) : 50
  const own = PATTERNS.filter((p) => p.family === fam.key)
  const bpms = own.map((p) => p.bpm)
  const knowledge = FAMILY_KNOWLEDGE[fam.key] ?? null

  return json(
    {
      family: {
        key: fam.key,
        label: fam.label,
        count: own.length,
        meters: [...new Set(own.map((p) => `${p.timeSignature.num}/${p.timeSignature.den}`))],
        bpmMin: bpms.length ? Math.min(...bpms) : null,
        bpmMax: bpms.length ? Math.max(...bpms) : null,
        sampleIds: own.slice(0, 5).map((p) => p.id),
      },
      knowledge,
      patterns: own.slice(0, limit).map(compactPattern),
      patternsShown: Math.min(limit, own.length),
    },
    {
      endpoint: `/api/v1/families/${fam.key}`,
      hint: 'Raise ?limit= (max 200) to page through the family, or use /api/v1/patterns?family=' + fam.key + ' with offset.',
    }
  )
}

export async function OPTIONS() {
  return optionsResponse()
}
