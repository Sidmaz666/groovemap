# Groovemap API v1

Read-only JSON API over the Groovemap drum-pattern catalog — **1,601 patterns across 38 style families**, each with a step-event grid, learning notes, provenance and notation. Designed to be equally usable by humans and LLM agents: every response carries a `meta` block (service, endpoint, docs URL, next-step `hint`), fields are stable, and CORS is open (`Access-Control-Allow-Origin: *`) so agents can call from anywhere. Stable GETs send `Cache-Control: public, max-age=300`.

Base URL: `/api/v1` · All endpoints: `GET` (+ `OPTIONS` preflight) · Errors are JSON (`{"meta":…, "error":"…"}`) with proper status codes.

---

## Endpoints

### `GET /api/v1`
Discovery document: catalog summary, conventions, endpoint list, example queries, MCP connection info.
- `?format=text` → same content as markdown (`text/markdown`), handy for LLMs.

```bash
curl http://localhost:3000/api/v1
curl "http://localhost:3000/api/v1?format=text"
```

### `GET /api/v1/patterns`
Search / list patterns. Returns `{ total, count, offset, limit, items: [...] }`.

| Param | Values | Default | Notes |
| --- | --- | --- | --- |
| `limit` | 1–200 | 50 | page size |
| `offset` | ≥0 | 0 | pagination |
| `family` | csv of family keys | — | e.g. `funk`, `jungle,house` |
| `genre` | csv of genre tags | — | e.g. `Jazz` (case-insensitive) |
| `q` | text | — | matches title/summary/description/family/genres/tags |
| `meter` | `"num/den"` | — | e.g. `4/4`, `7/8`, `12/8` |
| `feel` | csv | — | `straight`, `swung`, `shuffled`, `triplet`, `broken` |
| `difficulty` | csv | — | `beginner`, `intermediate`, `advanced` |
| `bpm_min` / `bpm_max` | number | — | filters the pattern's canonical BPM |
| `bars` | number | — | 1 or 2 (…) exact bar count |
| `subdivision` | 1/2/3/4/6 | — | 4 = 16ths, 3 = triplets |
| `sort` | `bpm`, `difficulty`, `family`, `id` | catalog order | |
| `fields` | `compact`, `full` | `compact` | `full` inlines tracks + events + learning + related |

**Compact item:** `id, title, family, genres, bpm, timeSignature ("4/4"), feel, difficulty, bars, subdivision, swing, summary, stepCount, hitCount, kit`.

```bash
curl "http://localhost:3000/api/v1/patterns?family=funk&q=ghost&limit=5"
curl "http://localhost:3000/api/v1/patterns?meter=4/4&bpm_min=120&bpm_max=130&sort=bpm&limit=10"
curl "http://localhost:3000/api/v1/patterns?family=jungle&fields=full&limit=2"
```

### `GET /api/v1/patterns/{id}`
One pattern, complete: full grid (`tracks`, `events` with absolute step indices + velocities), `learning` (construction + per-instrument roles), `variations`, `source` provenance, merged story `knowledge` (origin/era/history/listening), `references` (Wikipedia/YouTube), `notation.drumTab` (classic text tab), and compact `related` patterns. `404` JSON on unknown id.

```bash
curl http://localhost:3000/api/v1/patterns/funk-jb
curl http://localhost:3000/api/v1/patterns/backbeat-basic
```

### `GET /api/v1/families`
All 38 style families: `key, label, count, meters, bpmMin, bpmMax, sampleIds`.

```bash
curl http://localhost:3000/api/v1/families
```

### `GET /api/v1/families/{key}`
Family detail + its curated knowledge (origin, era, classification, history, artists, listening) + compact patterns (`?limit=` 1–200, default 50). `404` JSON with the list of valid keys on miss.

```bash
curl "http://localhost:3000/api/v1/families/jungle?limit=10"
```

### `GET /api/v1/random`
Random compact pattern(s). `?count=` 1–10 (default 1). Not cached (`no-store`).

```bash
curl "http://localhost:3000/api/v1/random?count=3"
```

### `GET /api/v1/collections`
The 15 curated collections with `count`, `families`, `art` key and `patternIds`. Add `?items=1` to embed compact patterns.

```bash
curl "http://localhost:3000/api/v1/collections"
curl "http://localhost:3000/api/v1/collections?items=1"
```

### `GET /api/v1/stats`
Catalog totals: patterns, families, genres, meters, kits (named), curated collections, BPM range, difficulty/feel/meter breakdowns, top genres, per-family counts, knowledge coverage.

```bash
curl http://localhost:3000/api/v1/stats
```

---

## Consuming the grid

- `events[]` are `{ t: trackId, s: absoluteStep, v: velocity(1–127), p?: probability, r?: ratchet rolls }`; absolute step = `bar × stepsPerBar + positionInBar`, `stepsPerBar = beatsPerBar × subdivision`.
- `notation.drumTab` gives `{ rows: [{ inst, label, bars: [one char per step per bar] }], counts, spb }` — chars: `X` accent, `x` normal, `o` ghost, digits = roll ×n, `p` probabilistic, `-` rest.
- Velocity tiers: ≥120 accent, ≥75 normal, else ghost.
- General-MIDI note map is documented per pattern in the UI and embedded in the app's MIDI export (`src/lib/atlas/export/midi.ts`).

## MCP server

The same catalog is also served over the **Model Context Protocol** (Streamable HTTP, JSON-RPC 2.0) by an independent mini-service:

- Local: `http://127.0.0.1:3121/mcp` (POST JSON-RPC; GET returns server info)
- Through the sandbox gateway: `/mcp?XTransformPort=3121`
- Tools: `search_patterns`, `get_pattern`, `list_families`, `get_family`, `random_pattern`, `get_stats`, `list_collections`, `export_pattern_midi_b64`

## LLM discoverability

- `public/llms.txt` — short index (llmstxt.org format)
- `public/llms-full.txt` — expanded catalog + parameter reference
- `src/app/robots.ts` — explicitly allows GPTBot, ClaudeBot, PerplexityBot, CCBot, …
- JSON-LD `DataCatalog` in the root layout.
