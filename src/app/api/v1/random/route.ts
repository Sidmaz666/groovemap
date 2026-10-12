import { json, optionsResponse, compactPattern } from '../_shared'
import { PATTERNS } from '@/lib/atlas/patterns'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const raw = Number(url.searchParams.get('count') ?? 1)
  const count = Number.isFinite(raw) ? Math.max(1, Math.min(10, Math.floor(raw))) : 1

  // Fisher-Yates on a copy — no modulo bias, no catalog mutation
  const pool = [...PATTERNS]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const items = pool.slice(0, count).map(compactPattern)

  return json(
    { count: items.length, items },
    {
      endpoint: '/api/v1/random',
      cache: false,
      hint: 'Fetch any item with /api/v1/patterns/{id} for its full grid, story and notation.',
    }
  )
}

export async function OPTIONS() {
  return optionsResponse()
}
