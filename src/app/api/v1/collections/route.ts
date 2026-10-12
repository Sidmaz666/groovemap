import { json, optionsResponse, collectionPayload } from '../_shared'
import { CURATED_COLLECTIONS } from '@/lib/atlas/patterns'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const withItems = url.searchParams.get('items') === '1'
  const collections = CURATED_COLLECTIONS.map((c) => {
    const payload = collectionPayload(c)
    return withItems ? payload : { ...payload, items: undefined }
  })

  return json(
    { total: collections.length, collections },
    {
      endpoint: '/api/v1/collections',
      hint: 'Pass ?items=1 to embed compact patterns; every pattern id also resolves at /api/v1/patterns/{id}.',
    }
  )
}

export async function OPTIONS() {
  return optionsResponse()
}
