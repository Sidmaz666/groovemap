'use client'

import { useState } from 'react'
import {
  Download, Link2, Loader2, FileAudio, Layers, Music2, Music4, FileText,
  Sheet, FileDown, ImageIcon, Braces, FileCode2, ChevronDown, Info,
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { GroovePattern } from '@/lib/atlas/types'
import { downloadMidi, downloadMidiMulti, PPQ } from '@/lib/atlas/export/midi'
import { downloadWav } from '@/lib/atlas/export/wav'
import { downloadMp3 } from '@/lib/atlas/export/mp3'
import { downloadStems } from '@/lib/atlas/export/stems'
import { downloadReaper } from '@/lib/atlas/export/rpp'
import { downloadMusicXml } from '@/lib/atlas/export/musicxml'
import { downloadPdf } from '@/lib/atlas/export/pdf'
import { downloadPng } from '@/lib/atlas/export/png'
import { downloadTxt } from '@/lib/atlas/export/txt'
import { downloadJson } from '@/lib/atlas/export/json'
import { shareUrl } from '@/lib/atlas/share'

/**
 * ExportMenu — full DAW-grade export panel:
 * audio (WAV ×2 depths, MP3, stems), MIDI (type 0 + multi-track type 1),
 * native REAPER project, MusicXML score, PDF sheet, PNG diagram, tab text,
 * pattern JSON and share link — everything renders client-side.
 */

type BusyKey = 'wav44' | 'wav48' | 'mp3' | 'stems' | 'pdf' | null

interface Item {
  key: string
  icon: React.ComponentType<{ className?: string }>
  name: string
  desc: string
  run: () => void | Promise<void>
  busy?: BusyKey
}

export function ExportMenu({ pattern, triggerClassName }: { pattern: GroovePattern; triggerClassName?: string }) {
  const [busy, setBusy] = useState<BusyKey>(null)
  const [guideOpen, setGuideOpen] = useState(false)

  const guard = async (key: BusyKey, fn: () => Promise<void> | void) => {
    setBusy(key)
    try {
      await fn()
    } catch (e) {
      toast.error('Export failed', { description: e instanceof Error ? e.message : String(e) })
    } finally {
      setBusy(null)
    }
  }

  const onShare = async () => {
    try {
      const url = shareUrl(pattern)
      await navigator.clipboard.writeText(url)
      toast.success('Share link copied', { description: 'The full groove is embedded in the URL — no server involved.' })
    } catch {
      toast.error('Could not copy link', { description: 'Your browser blocked clipboard access.' })
    }
  }

  const groups: { label: string; items: Item[] }[] = [
    {
      label: 'Audio',
      items: [
        {
          key: 'wav44', icon: FileAudio, name: 'WAV · 44.1 kHz / 16-bit', desc: 'Mastered offline render, 2 loops + tail',
          busy: 'wav44', run: () => guard('wav44', async () => {
            await downloadWav(pattern, { loops: 2 })
            toast.success('WAV exported', { description: '44.1 kHz · 16-bit stereo · real kit samples' })
          }),
        },
        {
          key: 'wav48', icon: FileAudio, name: 'WAV · 48 kHz / 24-bit', desc: 'Video / mastering delivery spec',
          busy: 'wav48', run: () => guard('wav48', async () => {
            await downloadWav(pattern, { loops: 2, sampleRate: 48000, bitDepth: 24 })
            toast.success('WAV exported', { description: '48 kHz · 24-bit stereo · real kit samples' })
          }),
        },
        {
          key: 'mp3', icon: Music2, name: 'MP3 · 320 kbps', desc: 'Universal compressed preview',
          busy: 'mp3', run: () => guard('mp3', async () => {
            await downloadMp3(pattern, { loops: 2 })
            toast.success('MP3 exported', { description: '320 kbps CBR stereo' })
          }),
        },
        {
          key: 'stems', icon: Layers, name: 'Stems (.zip)', desc: 'One WAV per instrument, DAW-ready',
          busy: 'stems', run: () => guard('stems', async () => {
            await downloadStems(pattern, { loops: 2 })
            toast.success('Stems exported', { description: `${pattern.tracks.length} instrument stems zipped` })
          }),
        },
      ],
    },
    {
      label: 'MIDI',
      items: [
        {
          key: 'midi0', icon: Music4, name: 'MIDI Type 0 (.mid)', desc: `Single track · GM percussion · ${PPQ} PPQ`,
          run: () => guard(null, () => {
            downloadMidi(pattern)
            toast.success('MIDI (Type 0) exported', { description: `${pattern.bpm} BPM · ${pattern.timeSignature.num}/${pattern.timeSignature.den}` })
          }),
        },
        {
          key: 'midi1', icon: Music4, name: 'MIDI Type 1 · multi-track', desc: 'One track per drum — drop straight into a DAW',
          run: () => guard(null, () => {
            downloadMidiMulti(pattern)
            toast.success('MIDI (Type 1) exported', { description: 'Each instrument on its own named track' })
          }),
        },
      ],
    },
    {
      label: 'DAW & Notation',
      items: [
        {
          key: 'rpp', icon: FileText, name: 'REAPER project (.rpp)', desc: 'Native project with embedded MIDI item',
          run: () => guard(null, () => {
            downloadReaper(pattern)
            toast.success('REAPER project exported', { description: 'Open in REAPER — groove lands on track 1' })
          }),
        },
        {
          key: 'musicxml', icon: Sheet, name: 'MusicXML (.musicxml)', desc: 'MuseScore · Finale · Sibelius · Dorico',
          run: () => guard(null, () => {
            downloadMusicXml(pattern)
            toast.success('MusicXML exported', { description: 'Unpitched drumset part, classic chart positions' })
          }),
        },
        {
          key: 'pdf', icon: FileDown, name: 'Pattern sheet (.pdf)', desc: 'Grid + tab + bol notation + GM map',
          busy: 'pdf', run: () => guard('pdf', async () => {
            await downloadPdf(pattern)
            toast.success('PDF exported', { description: 'A4 print-ready pattern sheet' })
          }),
        },
        {
          key: 'png', icon: ImageIcon, name: 'Grid diagram (.png)', desc: 'Crisp dark-theme image for docs & decks',
          run: () => guard(null, () => {
            downloadPng(pattern)
            toast.success('PNG exported', { description: '2× resolution step grid' })
          }),
        },
        {
          key: 'txt', icon: FileCode2, name: 'Drum tab (.txt)', desc: 'Tab + Indian bol notation as plain text',
          run: () => guard(null, () => {
            downloadTxt(pattern)
            toast.success('Text tab exported', { description: 'Pastes cleanly anywhere' })
          }),
        },
      ],
    },
    {
      label: 'Data',
      items: [
        {
          key: 'json', icon: Braces, name: 'Pattern JSON', desc: 'Full schema, re-importable in the Lab',
          run: () => guard(null, () => {
            downloadJson(pattern)
            toast.success('JSON exported', { description: 'Re-import via Groove Lab → Import' })
          }),
        },
        {
          key: 'share', icon: Link2, name: 'Copy share link', desc: 'Pattern embedded in the URL',
          run: () => guard(null, () => onShare()),
        },
      ],
    },
  ]

  const dawGuide = [
    ['Ableton Live', 'drag the .mid onto a MIDI track (multi-track drops as one clip per drum → route to a Drum Rack)'],
    ['FL Studio', 'drag the .mid into the Playlist, or File → Import → MIDI file'],
    ['Logic Pro', 'drag the .mid straight into the Tracks area'],
    ['Cubase / Nuendo', 'File → Import → MIDI File…'],
    ['REAPER', 'open the .rpp directly — the groove is already on track 1'],
    ['Bitwig · Studio One · GarageBand', 'drag the .mid into the arrangement'],
    ['MuseScore · Finale · Sibelius · Dorico', 'open the .musicxml'],
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={busy !== null} className={triggerClassName}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          Export
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[400px] max-h-[min(560px,80vh)] overflow-y-auto p-0" sideOffset={8}>
        <div className="border-b border-zinc-800 bg-zinc-900/60 px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-lime-400">Export studio</p>
          <p className="mt-0.5 text-[11px] text-zinc-500">14 formats — audio, MIDI, DAW projects, notation, diagrams. All rendered locally.</p>
        </div>
        <div className="px-2 py-2">
          {groups.map((group) => (
            <div key={group.label} className="mb-1 last:mb-0">
              <p className="px-2 pb-1 pt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">{group.label}</p>
              {group.items.map((item) => {
                const Icon = item.icon
                const isBusy = item.busy !== undefined && busy === item.busy
                return (
                  <button
                    key={item.key}
                    type="button"
                    disabled={busy !== null && !isBusy}
                    onClick={() => void item.run()}
                    className="flex w-full items-start gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-zinc-800/80 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-zinc-800 bg-zinc-900 text-zinc-400">
                      {isBusy ? <Loader2 className="h-3 w-3 animate-spin text-lime-400" /> : <Icon className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12px] font-medium leading-tight text-zinc-200">{item.name}</span>
                      <span className="block text-[10px] leading-tight text-zinc-500">{item.desc}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <div className="border-t border-zinc-800">
          <button
            type="button"
            onClick={() => setGuideOpen((v) => !v)}
            className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-zinc-900/70"
            aria-expanded={guideOpen}
          >
            <Info className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-[11px] font-medium text-zinc-400">DAW import guide</span>
            <ChevronDown className={`ml-auto h-3.5 w-3.5 text-zinc-600 transition-transform ${guideOpen ? 'rotate-180' : ''}`} />
          </button>
          {guideOpen && (
            <div className="space-y-2 border-t border-zinc-800/60 bg-zinc-950/40 px-4 py-3">
              {dawGuide.map(([daw, how]) => (
                <p key={daw} className="text-[10.5px] leading-snug text-zinc-500">
                  <span className="font-mono text-[10px] font-semibold text-zinc-300">{daw}</span> — {how}
                </p>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
