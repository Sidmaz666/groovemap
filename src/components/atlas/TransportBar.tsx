'use client'

import { Play, Pause, Square, Volume2, Timer, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAtlas, usePlayhead, useKitLoad } from './AtlasProvider'
import { KIT_LIST } from '@/lib/atlas/audio/kits'
import { ROOM_LIST } from '@/lib/atlas/audio/rooms'
import type { GroovePattern, KitId } from '@/lib/atlas/types'
import { cn } from '@/lib/utils'

/**
 * TransportBar — shared playback controls. `full` variant adds tempo, swing,
 * metronome and kit; `compact` is used on pattern cards and inline previews.
 */

export function TransportBar({ showKit = true, className }: { showKit?: boolean; className?: string }) {
  const a = useAtlas()
  const pos = usePlayhead()
  const kit = useKitLoad()
  const kitLoading = kit?.state === 'loading'

  return (
    <div className={cn('flex flex-wrap items-center gap-2 sm:gap-3', className)}>
      <div className="flex items-center gap-1">
        <Button
          size="icon-sm"
          variant={a.playing ? 'default' : 'outline'}
          onClick={a.togglePlay}
          disabled={!a.pattern}
          aria-label={a.playing ? 'Pause' : 'Play'}
          className={a.playing ? 'bg-lime-400 text-zinc-950 hover:bg-lime-300' : 'border-zinc-700 hover:border-lime-400/60 hover:text-lime-300'}
        >
          {a.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          size="icon-sm"
          variant="outline"
          onClick={a.stop}
          disabled={!a.pattern}
          aria-label="Stop"
          className="border-zinc-700 hover:border-zinc-500"
        >
          <Square className="h-3.5 w-3.5" />
        </Button>
        {kitLoading && (
          <span
            className="flex items-center gap-1.5 rounded-sm border border-zinc-800 bg-zinc-900/80 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-300/90"
            role="status"
            aria-live="polite"
            title="Decoding drum samples — the first beat starts the moment they're ready"
          >
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            kit {Math.round((kit?.progress ?? 0) * 100)}%
          </span>
        )}
      </div>

      <PositionReadout />

      <div className="flex items-center gap-1.5">
        <div className="flex items-baseline gap-1 rounded-sm border border-zinc-800 bg-zinc-900/80 px-2 py-1">
          <input
            type="number"
            value={Math.round(a.bpm)}
            min={30}
            max={300}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (v >= 30 && v <= 300) a.setBpm(v)
            }}
            className="w-12 bg-transparent font-mono text-sm font-semibold text-zinc-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Tempo in BPM"
          />
          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">bpm</span>
        </div>
        <Slider
          value={[a.bpm]}
          min={30}
          max={220}
          step={1}
          onValueChange={([v]) => a.setBpm(v)}
          className="w-24 sm:w-32"
          aria-label="Tempo slider"
        />
      </div>

      <div className="hidden items-center gap-1.5 md:flex" title="Swing delays every off-beat — 0% straight, 60% heavy shuffle">
        <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">swing</span>
        <Slider
          value={[Math.round(a.swing * 100)]}
          min={0}
          max={66}
          step={1}
          onValueChange={([v]) => a.setSwing(v / 100)}
          className="w-20"
          aria-label="Swing amount"
        />
        <span className="w-7 font-mono text-[10px] text-zinc-400">{Math.round(a.swing * 100)}%</span>
      </div>

      <div className="flex items-center gap-1.5" title="Metronome click on every beat">
        <Timer className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
        <Switch checked={a.metronome} onCheckedChange={a.setMetronome} aria-label="Metronome" className="scale-90" />
      </div>

      {showKit && (
        <Select value={a.kitId} onValueChange={(v) => a.setKit(v as KitId)}>
          <SelectTrigger size="sm" className="w-36 border-zinc-800 bg-zinc-900/80 font-mono text-xs" aria-label="Drum kit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72 overflow-y-auto">
            {KIT_LIST.map((k) => (
              <SelectItem key={k.id} value={k.id} className="font-mono text-xs">
                {k.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showKit && (
        <Select value={a.roomId} onValueChange={(v) => a.setRoom(v as typeof ROOM_LIST[number]['id'])}>
          <SelectTrigger
            size="sm"
            className="w-32 border-zinc-800 bg-zinc-900/80 font-mono text-xs"
            aria-label="Room ambience"
            title="Room ambience — convolution reverb over the master bus"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72 overflow-y-auto">
            {ROOM_LIST.map((r) => (
              <SelectItem key={r.id} value={r.id} className="font-mono text-xs">
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="ml-auto hidden items-center gap-1.5 sm:flex">
        <Volume2 className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
        <Slider
          value={[Math.round(a.masterVolume * 100)]}
          min={0}
          max={100}
          onValueChange={([v]) => a.setMasterVolume(v / 100)}
          className="w-20"
          aria-label="Master volume"
        />
      </div>
    </div>
  )
}

export function PositionReadout({ className }: { className?: string }) {
  const pos = usePlayhead()
  const a = useAtlas()
  const label = pos
    ? `${pos.bar + 1}.${pos.beat + 1}.${(pos.stepInBar % (a.pattern?.subdivision ?? 1)) + 1}`
    : '–.–.–'
  return (
    <div
      className={cn('rounded-sm border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-xs tabular-nums text-lime-300', className)}
      role="status"
      aria-label={`Playback position ${label}`}
    >
      {label}
    </div>
  )
}

/** compact play toggle for pattern cards */
export function CardPlayButton({ pattern, size = 'default' }: { pattern: GroovePattern; size?: 'default' | 'sm' }) {
  const a = useAtlas()
  const kit = useKitLoad()
  const isCurrent = a.playingId === pattern.id && a.pattern != null
  const isPlaying = isCurrent && a.playing
  const warming = isPlaying && kit?.state === 'loading'

  return (
    <Button
      size={size === 'sm' ? 'icon-sm' : 'icon'}
      variant={isPlaying ? 'default' : 'outline'}
      onClick={(e) => {
        e.stopPropagation()
        if (isCurrent) {
          a.togglePlay()
        } else {
          // global player: loads + plays, or resumes if the engine already holds it
          a.playPattern(pattern)
        }
      }}
      aria-label={isPlaying ? 'Stop preview' : 'Play preview'}
      title={warming ? 'Warming up the kit…' : undefined}
      className={cn(
        isPlaying ? 'bg-lime-400 text-zinc-950 hover:bg-lime-300' : 'border-zinc-700 bg-zinc-950/60 hover:border-lime-400/60 hover:text-lime-300'
      )}
    >
      {warming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
    </Button>
  )
}
