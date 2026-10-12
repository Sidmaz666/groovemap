'use client'

import {
  AudioWaveform,
  BookOpen,
  Bot,
  Braces,
  Clock3,
  Drum,
  FileAudio,
  FileCode2,
  FileDown,
  FileMusic,
  FileText,
  Headphones,
  Image as ImageIcon,
  Keyboard,
  Layers,
  Link2,
  Lock,
  Music2,
  Music4,
  Network,
  Printer,
  ScrollText,
  Sheet,
  SlidersHorizontal,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Route } from './AppShell'
import { PATTERNS, FAMILY_LIST } from '@/lib/atlas/patterns'
import { INSTRUMENT_LIST } from '@/lib/atlas/instruments'
import { KIT_LIST } from '@/lib/atlas/audio/kits'
import { vagueCount } from '@/lib/atlas/vague'
import { cn } from '@/lib/utils'
import { DataAtlasSection } from './viz/DataAtlasSection'

/**
 * AboutView — the honest supporting pages: what this is, how patterns are
 * authored, where ideas come from, what leaves your machine (nothing),
 * keyboard shortcuts, and what each export format contains.
 *
 * Layout: full-width header + asymmetric bento stats row, then a two-column
 * body — sticky section rail (Radix Tabs, routed via navigate) on the left,
 * measured content column (max-w-3xl) on the right.
 */

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'data', label: 'Data Atlas' },
  { id: 'methodology', label: 'Methodology' },
  { id: 'sources', label: 'Sources & Licensing' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'shortcuts', label: 'Shortcuts' },
  { id: 'exports', label: 'Exports' },
  { id: 'ai', label: 'For AI & Devs' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

function isSection(v: string | undefined): v is SectionId {
  return v != null && SECTIONS.some((s) => s.id === v)
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function Kicker({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-lime-400/90">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {children}
    </p>
  )
}

function Spec({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-zinc-800/80 py-3 first:border-t-0 sm:grid sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6">
      <dt className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">{term}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-zinc-300 sm:mt-0">{children}</dd>
    </div>
  )
}

function SectionBody({ children }: { children: React.ReactNode }) {
  return <div className="max-w-3xl space-y-5">{children}</div>
}

function Para({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-zinc-300">{children}</p>
}

function Mono({ children }: { children: React.ReactNode }) {
  return <code className="bg-zinc-900 px-1.5 py-0.5 font-mono text-[12px] text-lime-300">{children}</code>
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-block min-w-7 border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-center font-mono text-[10px] font-semibold text-zinc-200">
      {children}
    </kbd>
  )
}

function StatCard({
  icon: Icon,
  value,
  label,
  sub,
  wide = false,
}: {
  icon: LucideIcon
  value: string
  label: string
  sub?: string
  wide?: boolean
}) {
  return (
    <div
      className={cn(
        'bg-gradient-to-b from-zinc-900/60 to-zinc-950/40 p-4 ring-1 ring-white/5 transition-colors hover:ring-lime-400/30',
        wide && 'col-span-2'
      )}
    >
      <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
        <Icon className="h-3.5 w-3.5 text-lime-400/80" aria-hidden />
        {label}
      </p>
      <p className={cn('mt-2 font-semibold leading-none tabular-nums text-zinc-50', wide ? 'text-4xl' : 'text-2xl')}>{value}</p>
      {sub && <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{sub}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Live catalog numbers (computed, never hard-coded)                   */
/* ------------------------------------------------------------------ */

const METER_COUNT = new Set(PATTERNS.map((p) => `${p.timeSignature.num}/${p.timeSignature.den}`)).size
const GENRE_COUNT = new Set(PATTERNS.flatMap((p) => p.genres)).size

/* ------------------------------------------------------------------ */
/* About                                                               */
/* ------------------------------------------------------------------ */

function AboutSection() {
  return (
    <SectionBody>
      <Para>
        <strong className="text-zinc-100">Groovemap is three tools sharing one engine.</strong> An{' '}
        <strong className="text-zinc-100">encyclopedia</strong> of drum patterns — every groove documented with its
        construction, each instrument&apos;s role, variations, provenance and related patterns. A{' '}
        <strong className="text-zinc-100">laboratory</strong> (Groove Lab) where any pattern can be loaded, edited step by
        step, transformed, and taken away as MIDI, audio, JSON or a share link. And a{' '}
        <strong className="text-zinc-100">learning platform</strong> — the Rhythm School lessons and curated collections
        that teach the vocabulary the catalog is written in.
      </Para>

      <Para>
        The whole thing stands on five systems, each kept small and honest:
      </Para>

      <dl className="border border-zinc-800 bg-zinc-900/40 px-4 py-2">
        <Spec term="01 · Pattern model">
          One canonical schema (<Mono>GroovePattern</Mono>): tracks, events with absolute step indices and velocities,
          meter, tempo, feel, learning notes, provenance. The grid, rhythm circle, intensity view, MIDI file, WAV render,
          print sheet and share link are all projections of that single source of truth.
        </Spec>
        <Spec term="02 · Catalog">
          Over 4,000 grooves across thirty-eight style families — from a basic rock backbeat to son clave,
          batucada, samba-reggae, drill, grime, blast beats, 12/8 timelines and a dedicated fills dictionary — each
          with construction notes, roles, variations and provenance, plus a curated story layer of origins and history.
        </Spec>
        <Spec term="03 · Audio engine">
          Seven kits of REAL recorded drum samples — multi-velocity acoustic, TR-808, TR-909, R-8, CR-78, LinnDrum and
          a world-percussion ensemble — decoded locally and played through a look-ahead scheduler on the Web Audio
          clock, with per-hit swing, humanize, probability and ratchets. No synthesized drum substitutes.
        </Spec>
        <Spec term="04 · Editing">
          Groove Lab: step editing with velocity cycling, track management, structural transforms (shift, thin, double,
          ghost-fill, Euclid fill…), undo/redo, and seeded randomness that stays repeatable.
        </Spec>
        <Spec term="05 · Study layer">
          Ten Rhythm School lessons with live examples, curated collections, user collections, favorites and exports —
          the connective tissue between hearing a groove and owning it.
        </Spec>
      </dl>

      <Para>
        How the app handles data is documented once, in the <strong className="text-zinc-100">Privacy</strong> section
        of this page.
      </Para>
    </SectionBody>
  )
}

/* ------------------------------------------------------------------ */
/* Methodology                                                         */
/* ------------------------------------------------------------------ */

function MethodologySection() {
  return (
    <SectionBody>
      <Para>
        <strong className="text-zinc-100">Authoring.</strong> Patterns are written in a compact grid notation — one
        character per step, <Mono>|</Mono> between bars: <Mono>X</Mono> accent (velocity 127), <Mono>x</Mono> normal
        (100), <Mono>o</Mono> ghost (40), <Mono>2/3/4</Mono> ratchet rolls, <Mono>p</Mono>/<Mono>P</Mono> probabilistic
        hits, <Mono>.</Mono> rest. The notation is parsed into the canonical event model
        (<Mono>{'{ track, step, velocity, probability?, ratchet? }'}</Mono>) — never stored as pictures.
      </Para>
      <Para>
        <strong className="text-zinc-100">Meter-aware grids.</strong> Events address absolute steps
        (<Mono>bar × stepsPerBar + positionInBar</Mono>), and <Mono>stepsPerBar = beatsPerBar × subdivision</Mono>. A
        4/4 sixteenth grid is 16 columns because the math says 4 × 4 — not because the app hard-coded it. 5/4, 7/8,
        12/8 and 9/8 patterns get exactly the grid they need, and the count labels (<Mono>1 e &amp; a</Mono>,{' '}
        <Mono>1 la li</Mono>) are generated per meter.
      </Para>
      <Para>
        <strong className="text-zinc-100">Validation.</strong> Every pattern passes <Mono>validatePattern</Mono>: events
        must reference known tracks, steps must fall inside the meter&apos;s range, velocities must be 1–127; empty
        patterns warn. The same gate runs on JSON import and on every decoded share link, so nothing invalid can reach
        the engine.
      </Para>
      <Para>
        <strong className="text-zinc-100">Why original compositions.</strong> Catalog entries are original study
        compositions or widely-documented common-practice skeletons — not artist-exact transcriptions. Exact
        transcriptions would be both legally fraught and pedagogically noisy: the point of a groove dictionary is the
        reusable skeleton, with the famous recordings one search away. Where a pattern follows a common-practice idiom
        (punk backbeat, half-time trap, four-on-the-floor house) it is labelled{' '}
        <Mono>reference</Mono>; where it is our own teaching material it is labelled <Mono>original</Mono>. Every detail
        page shows the label and note.
      </Para>
    </SectionBody>
  )
}

/* ------------------------------------------------------------------ */
/* Sources & licensing                                                 */
/* ------------------------------------------------------------------ */

function SourcesSection() {
  return (
    <SectionBody>
      <Para>Every pattern carries one of three source types, shown on its detail page:</Para>
      <dl className="border border-zinc-800 bg-zinc-900/40 px-4 py-2">
        <Spec term="original">
          An original composition written for this catalog — including the Building Blocks teaching series and
          algorithmic sketches (Euclid, cross-rhythm, probability). Free of third-party claims.
        </Spec>
        <Spec term="traditional">
          A traditional timeline with its own cultural home — son clave, the Ewe bell, karsilama. These are presented as{' '}
          <em>study patterns</em> with cultural context in the source note: they belong to living traditions, and the
          catalog documents them rather than claiming them.
        </Spec>
        <Spec term="reference">
          A widely-documented common-practice pattern (the punk beat, half-time rock, four-on-the-floor house): the
          generic skeleton thousands of records share, not any single artist&apos;s part.
        </Spec>
      </dl>

      <Para>
        <strong className="text-zinc-100">Sound sources — real recordings, credited.</strong> Every drum hit in the
        Atlas is a real recorded sample served locally and decoded in your browser — never a synthesized substitute:
      </Para>
      <dl className="border border-zinc-800 bg-zinc-900/40 px-4 py-2">
        <Spec term="Studio Rock">
          Hydrogen <em>GMRockKit</em> — a genuinely recorded acoustic rock kit with five velocity layers per drum
          (GPL-licensed sample library).
        </Spec>
        <Spec term="TR-808">
          Roland TR-808 hardware one-shots recorded by freesound contributors, Sonic Pi&apos;s <Mono>bd_808</Mono>, and
          the Hydrogen TR-808 kit.
        </Spec>
        <Spec term="TR-909">
          Roland TR-909 hardware one-shots recorded by freesound contributors (AaronGNP, DWSD, NoiseCollector,
          sakebeats, and more).
        </Spec>
        <Spec term="R-8 / CR-78 / LinnDrum">
          Roland R-8, CompuRhythm CR-78 and LinnDrum recordings from the web-audio-samples library used by Tone.js
          (Google Chrome audio team); LinnDrum kit supplemented with Sonic Pi cymbal samples.
        </Spec>
        <Spec term="World Percussion">
          Hand-percussion one-shots (congas, bongos, claves, agogô, güiro, cabasa, maracas, triangle, shakers,
          tambourine) from freesound recordings, Sonic Pi CC samples and the acoustic-kit library.
        </Spec>
      </dl>

      <Para>
        <strong className="text-zinc-100">Licensing stance.</strong> Samples are drawn from openly-licensed libraries
        (GPL sample kits, CC0/CC-BY freesound recordings, the Tone.js sample hosting). Rhythmic timelines themselves are
        not ownable property; what we take care over is text and content: descriptions and learning notes are our own,
        and patterns are original study material or common-practice skeletons. Traditional timelines are attributed to
        their traditions and offered for study with context, not as decontextualized loops.
      </Para>

      <Para>
        <strong className="text-zinc-100">Research starting points.</strong> Three projects shaped the pedagogy and
        coverage; none of their content is copied here:
      </Para>
      <ul className="space-y-2 border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm leading-relaxed text-zinc-300">
        <li>
          <strong className="text-zinc-100">Pocket Operations</strong> — the open collection of drumline &amp; percussion
          exercises, a model for compact, honest notation and practice-first sequencing.
        </li>
        <li>
          <strong className="text-zinc-100">Attack Magazine — Beat Dissected</strong> — its build-a-beat-by-layer method
          informed the lesson structure (skeleton first, subdivision second, ghosts and swing last).
        </li>
        <li>
          <strong className="text-zinc-100">Groove Pizza</strong> (NYU Music Experience Design Lab) — proof that rhythm
          visualization + instant playback teaches; inspired the circular view and the geometry-forward framing.
        </li>
      </ul>
      <Para>
        They are starting points for <em>how to teach</em>, credited as inspiration. Any errors of simplification are
        ours.
      </Para>
    </SectionBody>
  )
}

/* ------------------------------------------------------------------ */
/* Privacy                                                             */
/* ------------------------------------------------------------------ */

function PrivacySection() {
  return (
    <SectionBody>
      <Para>
        <strong className="text-zinc-100">There is no server.</strong> Groovemap is a static app: after the page
        loads, nothing is sent anywhere — no account, no analytics, no telemetry, no cookies. Audio never leaves your
        machine because it is decoded and played on it.
      </Para>
      <Para>
        <strong className="text-zinc-100">Your data lives in localStorage</strong>, namespaced under{' '}
        <Mono>groove-atlas:</Mono> — projects you save, favorites, recently viewed patterns, your collections and app
        settings (kit, volume, metronome). It stays in this browser on this device: clearing site data wipes it, by
        design and without ceremony.
      </Para>
      <Para>
        <strong className="text-zinc-100">Share links carry their own data.</strong> The share URL embeds the entire
        pattern (JSON, base64url-encoded) in the link itself — the recipient&apos;s browser decodes it locally. Nothing
        is uploaded, there is no link database, and a share link works forever or not at all, entirely independent of
        this app being online.
      </Para>
    </SectionBody>
  )
}

/* ------------------------------------------------------------------ */
/* Shortcuts — bento of kbd cards                                      */
/* ------------------------------------------------------------------ */

const SHORTCUTS: { keys: string[]; where: string; does: string }[] = [
  { keys: ['Space'], where: 'anywhere (except text inputs)', does: 'Play / pause the loaded pattern' },
  { keys: ['Click'], where: 'editable step grid', does: 'Toggle a step on / off' },
  { keys: ['Shift / Alt + Click'], where: 'editable step grid', does: 'Cycle velocity — accent → normal → ghost → off' },
  { keys: ['Ctrl', 'Z'], where: 'Groove Lab', does: 'Undo the last edit' },
  { keys: ['Ctrl', 'Shift', 'Z'], where: 'Groove Lab', does: 'Redo' },
  { keys: ['Esc'], where: 'dialogs & menus', does: 'Close the open dialog / dropdown' },
]

function ShortcutsSection() {
  return (
    <SectionBody>
      <Para>Keys are global and minimal — the grid itself is the main instrument:</Para>
      <div className="grid gap-3 sm:grid-cols-2" aria-label="Keyboard shortcuts">
        {SHORTCUTS.map((s, i) => (
          <div
            key={i}
            className="bg-gradient-to-b from-zinc-900/60 to-zinc-950/40 p-4 ring-1 ring-white/5 transition-colors hover:ring-lime-400/30"
          >
            <div className="flex flex-wrap items-center gap-1">
              {s.keys.map((k, ki) => (
                <span key={k} className="flex items-center gap-1">
                  {ki > 0 && <span aria-hidden className="text-zinc-600">+</span>}
                  <Kbd>{k}</Kbd>
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-zinc-200">{s.does}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">{s.where}</p>
          </div>
        ))}
      </div>
      <Para>
        Shift/Alt-click behaves per grid: on editable grids it cycles the hit&apos;s velocity tier — the exact cycle is
        empty → normal → accent → off, with ghosts stepping up to normal.
      </Para>
    </SectionBody>
  )
}

/* ------------------------------------------------------------------ */
/* Exports — bento of format cards, grouped                            */
/* ------------------------------------------------------------------ */

const EXPORT_GROUPS: { label: string; items: { icon: LucideIcon; name: string; desc: string }[] }[] = [
  {
    label: 'Audio',
    items: [
      {
        icon: FileAudio,
        name: 'WAV · 44.1/16 + 48/24',
        desc: 'Rendered offline through OfflineAudioContext using the same recorded samples as live playback — not a recording of it. 44.1 kHz, 16-bit stereo, plus a 48 kHz / 24-bit delivery spec; renders 2 loops plus a ~1.2 s tail so open hats and reverb-like decays finish.',
      },
      {
        icon: Music2,
        name: 'MP3 · 320 kbps',
        desc: 'Universal compressed preview — 320 kbps CBR stereo, encoded locally in your browser.',
      },
      {
        icon: Layers,
        name: 'Stems (.zip)',
        desc: 'One WAV per instrument, zipped — drop individual drums straight into a DAW session.',
      },
    ],
  },
  {
    label: 'MIDI',
    items: [
      {
        icon: Music4,
        name: 'MIDI Type 0 (.mid)',
        desc: "Standard MIDI File type 0, 480 PPQ (ticks per quarter note), with tempo and time-signature meta events derived from the pattern's meter. Notes go on the percussion channel using the General MIDI drum map; the exact instrument → GM note mapping is visible in the code (src/lib/atlas/export/midi.ts) and printed on the sheet export. GM is the documented baseline so files open correctly in every DAW.",
      },
      {
        icon: Music4,
        name: 'MIDI Type 1 (.mid)',
        desc: 'One track per drum, each named — drop straight into a DAW and mute, swap or re-groove individual instruments.',
      },
    ],
  },
  {
    label: 'DAW & Notation',
    items: [
      {
        icon: FileText,
        name: 'REAPER project (.rpp)',
        desc: 'Native REAPER project with an embedded MIDI item — the groove lands on track 1 with tempo and meter preset.',
      },
      {
        icon: Sheet,
        name: 'MusicXML (.musicxml)',
        desc: 'Unpitched drumset part in classic chart positions — opens in MuseScore, Finale, Sibelius and Dorico.',
      },
      {
        icon: Printer,
        name: 'PDF sheet (.pdf)',
        desc: 'A black-on-white A-series sheet: the step grid with count labels, a legend for the velocity shapes, tempo / meter / feel metadata, and the GM note number for every track — a handout you can actually practice from.',
      },
      {
        icon: ImageIcon,
        name: 'Grid diagram (.png)',
        desc: 'Crisp 2× dark-theme image of the step grid — for docs, slides and liner notes.',
      },
      {
        icon: FileCode2,
        name: 'Drum tab (.txt)',
        desc: 'Plain-text drum tab plus Indian bol notation — pastes cleanly anywhere.',
      },
    ],
  },
  {
    label: 'Data',
    items: [
      {
        icon: Braces,
        name: 'Pattern JSON',
        desc: 'The complete GroovePattern schema (schemaVersion: 1): grid, events, tempo, learning notes, provenance. Imports are validated with the same gate as the catalog, so a JSON file round-trips losslessly into the Lab or the detail view.',
      },
      {
        icon: Link2,
        name: 'Share URL',
        desc: 'The JSON payload, base64url-encoded into the link hash (#/s=…), version-tagged (v1) and capped at roughly 9 KB so links stay manageable. Decoding re-runs full validation; nothing is uploaded — the pattern travels inside the URL itself.',
      },
    ],
  },
]

function ExportsSection() {
  return (
    <SectionBody>
      <Para>
        Every export is generated on the fly in your browser from the same pattern object you see on screen — what you
        hear is what you get:
      </Para>
      <div className="space-y-6">
        {EXPORT_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-lime-400/90">{group.label}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.items.map((item) => (
                <div
                  key={item.name}
                  className="bg-gradient-to-b from-zinc-900/60 to-zinc-950/40 p-3.5 ring-1 ring-white/5 transition-colors hover:ring-lime-400/30"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
                    <item.icon className="h-4 w-4 shrink-0 text-lime-400/80" aria-hidden />
                    {item.name}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Para>
        The MIDI and JSON formats are deliberately boring and documented — Groovemap is a study tool, and your data
        should be trivially portable out of it.
      </Para>
    </SectionBody>
  )
}

/* ------------------------------------------------------------------ */
/* For AI & developers                                                 */
/* ------------------------------------------------------------------ */

const API_ENDPOINTS: { path: string; returns: string }[] = [
  { path: 'GET /api/v1', returns: 'Discovery doc — endpoint list, conventions, example queries (`?format=text` for markdown).' },
  { path: 'GET /api/v1/patterns', returns: 'Search & list — limit, offset, family, genre, q, meter, feel, difficulty, bpm_min/max, bars, subdivision, sort, fields=compact|full.' },
  { path: 'GET /api/v1/patterns/{id}', returns: 'One pattern, complete — events grid, learning notes, story knowledge, drum tab, references, related.' },
  { path: 'GET /api/v1/families', returns: 'All style families with counts, meters, BPM ranges and sample ids.' },
  { path: 'GET /api/v1/families/{key}', returns: 'Family detail: origin/era knowledge + its patterns.' },
  { path: 'GET /api/v1/random', returns: 'Random pattern(s), `?count=` 1–10.' },
  { path: 'GET /api/v1/collections', returns: 'The 15 curated collections with pattern ids (`?items=1` embeds patterns).' },
  { path: 'GET /api/v1/stats', returns: 'Catalog totals — patterns, families, genres, meters, kits, BPM range, knowledge coverage.' },
]

const MCP_TOOLS: { name: string; does: string }[] = [
  { name: 'search_patterns', does: 'Filter the catalog by family, genre, free text, BPM range, difficulty.' },
  { name: 'get_pattern', does: 'Full pattern as text: metadata, ASCII drum tab, construction, roles, story, references.' },
  { name: 'list_families', does: 'All 38 families with counts, meters, BPM ranges.' },
  { name: 'get_family', does: 'One family: origin/era knowledge + its patterns.' },
  { name: 'random_pattern', does: '1–10 random patterns.' },
  { name: 'get_stats', does: 'Catalog totals.' },
  { name: 'list_collections', does: 'Curated collections with their pattern ids.' },
  { name: 'export_pattern_midi_b64', does: 'Pattern → base64 of a General-MIDI Type-0 .mid — decode and hand the user a real MIDI file.' },
]

function AiSection() {
  return (
    <SectionBody>
      <Para>
        <strong className="text-zinc-100">Groovemap is built for machines too.</strong> The entire catalog is exposed
        read-only so LLM agents, assistants and apps can search it, quote it and even hand a user a real MIDI file. JSON
        responses carry a <Mono>meta</Mono> block with a next-step hint, CORS is open (<Mono>*</Mono>), and stable
        responses cache for 5 minutes.
      </Para>

      <Para>
        <strong className="text-zinc-100">REST API</strong> — base <Mono>/api/v1</Mono>, full reference at{' '}
        <Mono>/api/v1/README.md</Mono>, machine discovery at <Mono>/api/v1?format=text</Mono>:
      </Para>
      <dl className="border border-zinc-800 bg-zinc-900/40 px-4 py-2">
        {API_ENDPOINTS.map((e) => (
          <Spec key={e.path} term={e.path}>
            {e.returns}
          </Spec>
        ))}
      </dl>
      <Para>
        Quick start: <Mono>curl "/api/v1/patterns?family=funk&amp;q=ghost&amp;limit=5"</Mono> — then fetch any{' '}
        <Mono>id</Mono> at <Mono>/api/v1/patterns/{'{id}'}</Mono> for the complete grid.
      </Para>

      <Para>
        <strong className="text-zinc-100">MCP server</strong> — the same catalog over the Model Context Protocol
        (Streamable HTTP, JSON-RPC 2.0). Point any MCP client at <Mono>/mcp?XTransformPort=3121</Mono> (locally:{' '}
        <Mono>http://127.0.0.1:3121/mcp</Mono>), e.g.
      </Para>
      <pre className="overflow-x-auto border border-zinc-800 bg-zinc-950/80 p-4 font-mono text-[12px] leading-relaxed text-zinc-300">
{`{ "mcpServers": { "groovemap": {
    "type": "http", "url": "/mcp?XTransformPort=3121" } } }`}
      </pre>
      <div className="grid gap-2 sm:grid-cols-2">
        {MCP_TOOLS.map((t) => (
          <div
            key={t.name}
            className="bg-gradient-to-b from-zinc-900/60 to-zinc-950/40 p-3.5 ring-1 ring-white/5 transition-colors hover:ring-lime-400/30"
          >
            <p className="font-mono text-[12px] font-semibold text-lime-300">{t.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">{t.does}</p>
          </div>
        ))}
      </div>

      <Para>
        <strong className="text-zinc-100">LLM landing pads.</strong> <Mono>/llms.txt</Mono> is a short, llmstxt.org-style
        index of the catalog and API; <Mono>/llms-full.txt</Mono> adds every family, the full parameter tables and example
        responses. <Mono>robots.txt</Mono> explicitly allows GPTBot, ClaudeBot, PerplexityBot, CCBot, Google-Extended and
        friends, and the homepage embeds schema.org <Mono>DataCatalog</Mono> structured data.
      </Para>

      <Para>
        Agents are welcome to quote patterns with attribution; every entry carries an honest{' '}
        <Mono>source</Mono> label (original · reference · traditional) so derived claims stay traceable.
      </Para>
    </SectionBody>
  )
}

/* ------------------------------------------------------------------ */
/* View                                                                */
/* ------------------------------------------------------------------ */

const SECTION_ICONS: Record<SectionId, LucideIcon> = {
  about: BookOpen,
  data: Network,
  methodology: SlidersHorizontal,
  sources: ScrollText,
  privacy: Lock,
  shortcuts: Keyboard,
  exports: FileDown,
  ai: Bot,
}

export function AboutView({ section, navigate }: {
  section?: string
  navigate: (r: Route) => void
}) {
  const active: SectionId = isSection(section) ? section : 'about'

  return (
    <div className="space-y-10">
      {/* full-width header — no max-w cap, intro paragraph keeps its measure */}
      <header>
        <Kicker icon={BookOpen}>about this project</Kicker>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">Groovemap, honestly documented</h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">docs v1 · client-side study instrument</p>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          What this is, how the patterns are built, where the ideas came from, what happens to your data (nothing), and
          what exactly each export contains.
        </p>
      </header>

      {/* bento stats — asymmetric, live from the catalog */}
      <section aria-label="The atlas in numbers">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            wide
            icon={AudioWaveform}
            value={vagueCount(PATTERNS.length)}
            label="verified patterns"
            sub={`${FAMILY_LIST.length} style families · ${METER_COUNT} meters · ${GENRE_COUNT} genre tags — each groove with construction notes, roles, variations and provenance.`}
          />
          <StatCard icon={SlidersHorizontal} value={String(FAMILY_LIST.length)} label="style families" sub="punk backbeats to 12/8 timelines" />
          <StatCard icon={Clock3} value={String(METER_COUNT)} label="meters covered" sub="4/4 · 3/4 · 5/4 · 6/8 · 7/4 · 7/8 · 9/8 · 12/8" />
          <StatCard icon={Drum} value={String(INSTRUMENT_LIST.length)} label="instruments mapped" sub="general-MIDI drum map, per-track colors" />
          <StatCard icon={Headphones} value={String(KIT_LIST.length)} label="sample kits" sub="real recorded one-shots — zero synth drums" />
          <StatCard icon={FileMusic} value="3" label="notation systems" sub="step grid & drum tab · staff · indian bol" />
          <StatCard icon={FileDown} value="14" label="export paths" sub="MIDI · audio · DAW · notation · data · print" />
        </div>
      </section>

      {/* two-column body: sticky section rail + measured content */}
      <Tabs value={active} onValueChange={(v) => navigate({ view: 'about', section: v as SectionId })}>
        <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
          <div className="lg:sticky lg:top-20 lg:self-start">
            <TabsList
              aria-label="About sections"
              className="h-auto w-full flex-row flex-wrap items-center justify-start gap-1 rounded-none bg-transparent p-0 lg:flex-col lg:items-stretch"
            >
              {SECTIONS.map((s, i) => {
                const Icon = SECTION_ICONS[s.id]
                return (
                  <TabsTrigger
                    key={s.id}
                    value={s.id}
                    className="h-auto flex-none justify-start gap-2 rounded-none border border-transparent px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors hover:bg-zinc-900/80 data-[state=active]:border-lime-400 data-[state=active]:bg-lime-400 data-[state=active]:text-zinc-950 data-[state=inactive]:text-zinc-400 lg:w-full dark:data-[state=active]:border-lime-400 dark:data-[state=active]:bg-lime-400 dark:data-[state=active]:text-zinc-950"
                  >
                    <span aria-hidden className="font-mono text-[9px] tabular-nums text-zinc-600">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <Icon className="h-3 w-3" aria-hidden />
                    {s.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          <div className="min-w-0">
            <TabsContent value="about" className="mt-0">
              <AboutSection />
            </TabsContent>
            <TabsContent value="data" className="mt-0">
              <DataAtlasSection navigate={navigate} />
            </TabsContent>
            <TabsContent value="methodology" className="mt-0">
              <MethodologySection />
            </TabsContent>
            <TabsContent value="sources" className="mt-0">
              <SourcesSection />
            </TabsContent>
            <TabsContent value="privacy" className="mt-0">
              <PrivacySection />
            </TabsContent>
            <TabsContent value="shortcuts" className="mt-0">
              <ShortcutsSection />
            </TabsContent>
            <TabsContent value="exports" className="mt-0">
              <ExportsSection />
            </TabsContent>
            <TabsContent value="ai" className="mt-0">
              <AiSection />
            </TabsContent>
          </div>
        </div>
      </Tabs>

      <footer className="border-t border-zinc-800/60 pt-4">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          <Link2 className="h-3 w-3" aria-hidden />
          groovemap · a client-side study instrument · every pattern: see · hear · understand · change · take
        </p>
      </footer>
    </div>
  )
}
