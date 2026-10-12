import { json, optionsResponse } from '../_shared'
import { PATTERNS, FAMILY_LIST } from '@/lib/atlas/patterns'

export const runtime = 'nodejs'

export async function GET() {
  const families = FAMILY_LIST.map((f) => {
    const own = PATTERNS.filter((p) => p.family === f.key)
    const bpms = own.map((p) => p.bpm)
    const meters = [...new Set(own.map((p) => `${p.timeSignature.num}/${p.timeSignature.den}`))]
    return {
      key: f.key,
      label: f.label,
      count: own.length,
      meters,
      bpmMin: bpms.length ? Math.min(...bpms) : null,
      bpmMax: bpms.length ? Math.max(...bpms) : null,
      sampleIds: own.slice(0, 5).map((p) => p.id),
    }
  })

  return json(
    {
      total: families.length,
      families,
    },
    {
      endpoint: '/api/v1/families',
      hint: 'Fetch /api/v1/families/{key} for a family story + its patterns, or /api/v1/patterns?family={key}.',
    }
  )
}

export async function OPTIONS() {
  return optionsResponse()
}
