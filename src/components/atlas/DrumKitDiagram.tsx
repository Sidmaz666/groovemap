'use client'

import { useMemo, useState } from 'react'
import type { GroovePattern } from '@/lib/atlas/types'
import { stepsPerBar } from '@/lib/atlas/types'
import { INSTRUMENTS, TRACK_COLORS, type InstrumentId } from '@/lib/atlas/instruments'

/**
 * DrumKitDiagram — real kit playing simulation.
 *
 *  · Kit mode: a spatial drum-kit map (hi-hat → snare → kick → toms → ride →
 *    crashes) where every piece lights up exactly when its sample fires —
 *    stroke thickness follows velocity tier, hats visually open/closed,
 *    rolls show as rapid double-flashes.
 *  · Pads mode: a 27-pad MPC-style grid of every instrument in the registry.
 *
 * Clicking any piece/pad fires a live preview of that instrument. During
 * playback the visualization is driven by the shared playhead, so what you
 * see is literally what you hear.
 */

const KIT_PIECES: { inst: InstrumentId; cx: number; cy: number; r: number }[] = [
  { inst: 'crash', cx: 138, cy: 84, r: 44 },
  { inst: 'splash', cx: 252, cy: 56, r: 26 },
  { inst: 'ride', cx: 596, cy: 108, r: 46 },
  { inst: 'hatClosed', cx: 66, cy: 176, r: 36 },
  { inst: 'tomHi', cx: 288, cy: 150, r: 34 },
  { inst: 'tomMid', cx: 374, cy: 138, r: 36 },
  { inst: 'tomLow', cx: 512, cy: 196, r: 44 },
  { inst: 'snare', cx: 202, cy: 262, r: 42 },
  { inst: 'kick', cx: 366, cy: 290, r: 74 },
]

const PERC_STRIP: InstrumentId[] = [
  'shaker', 'maracas', 'cabasa', 'guiro', 'tambourine', 'cowbell', 'agogo', 'clave',
  'block', 'triangle', 'bongoHi', 'bongoLo', 'congaHi', 'congaLo', 'clap', 'rimshot',
]

const KIT_EXTRA: InstrumentId[] = ['hatOpen', 'hatPedal']

export function DrumKitDiagram({
  pattern,
  currentStep,
  onPreview,
  className,
  stacked = false,
}: {
  pattern: GroovePattern
  currentStep: number | null
  onPreview?: (inst: InstrumentId) => void
  className?: string
  /** render kit + pads + percussion rack all at once (detail page single-scroll) */
  stacked?: boolean
}) {
  const [mode, setMode] = useState<'kit' | 'pads'>('kit')

  // which instruments fire at the current step (velocity-aware)
  const active = useMemo(() => {
    const map = new Map<InstrumentId, { vel: number; ratchet: number; prob: boolean }>()
    if (currentStep === null) return map
    for (const e of pattern.events) {
      if (e.s !== currentStep) continue
      const track = pattern.tracks.find((t) => t.id === e.t)
      if (!track) continue
      const inst = track.inst as InstrumentId
      const prev = map.get(inst)
      map.set(inst, {
        vel: Math.max(prev?.vel ?? 0, e.v),
        ratchet: Math.max(prev?.ratchet ?? 1, e.r ?? 1),
        prob: (prev?.prob ?? false) || e.p !== undefined,
      })
    }
    return map
  }, [pattern, currentStep])

  const usedInsts = useMemo(() => {
    const s = new Set<InstrumentId>()
    for (const t of pattern.tracks) s.add(t.inst as InstrumentId)
    return s
  }, [pattern])

  const hatOpenActive = active.has('hatOpen')
  const colorOf = (inst: InstrumentId) => TRACK_COLORS[(INSTRUMENTS[inst] ?? INSTRUMENTS.kick).color % TRACK_COLORS.length].hex
  const shortOf = (inst: InstrumentId) => (INSTRUMENTS[inst] ?? INSTRUMENTS.kick).short
  /** alternate class names per step so consecutive hits retrigger the CSS animation */
  const hitAnim = (hit: boolean) => (hit ? (currentStep ?? 0) % 2 === 0 ? 'atlas-hit-piece-a' : 'atlas-hit-piece-b' : undefined)
  const padAnim = (hit: boolean) => (hit ? (currentStep ?? 0) % 2 === 0 ? 'atlas-pad-a' : 'atlas-pad-b' : undefined)

  return (
    <div className={className}>
      <style>{`
        @keyframes atlas-kit-hit {
          0% { transform: scale(1); }
          30% { transform: scale(1.07); }
          100% { transform: scale(1); }
        }
        @keyframes atlas-kit-ring {
          0% { opacity: 0.55; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.55); }
        }
        .atlas-hit-piece-a, .atlas-hit-piece-b { animation: atlas-kit-hit 200ms ease-out; transform-box: fill-box; transform-origin: center; }
        .atlas-hit-ring { animation: atlas-kit-ring 320ms ease-out forwards; transform-box: fill-box; transform-origin: center; pointer-events: none; }
        .atlas-pad-a, .atlas-pad-b { animation: atlas-kit-hit 200ms ease-out; }
      `}</style>

      {/* mode toggle */}
      {!stacked && (
        <div className="mb-3 flex items-center gap-1.5" role="tablist" aria-label="Kit visualization mode">
          {(['kit', 'pads'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors cursor-pointer ${
                mode === m ? 'bg-lime-400/15 text-lime-300 ring-1 ring-lime-400/40' : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {m === 'kit' ? 'Drum Kit' : 'Pad Grid'}
            </button>
          ))}
          <span className="ml-auto hidden items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-zinc-600 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-400/70" /> live hit tracer
          </span>
        </div>
      )}

      {(stacked || mode === 'kit') && (
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950">
          <svg viewBox="0 0 672 384" className="block h-auto w-full" role="img" aria-label="Drum kit hit visualization">
            {/* rug shadow */}
            <ellipse cx="336" cy="368" rx="300" ry="12" fill="#ffffff06" />

            {KIT_PIECES.map(({ inst, cx, cy, r }) => {
              const hit = active.get(inst)
              const key = `${inst}-${currentStep ?? 'idle'}`
              const color = colorOf(inst)
              const tier = hit ? (hit.vel >= 120 ? 1 : hit.vel >= 75 ? 0.66 : 0.4) : 0
              const used = usedInsts.has(inst)
              const isHat = inst === 'hatClosed'
              return (
                <g
                  key={inst}
                  className={hitAnim(!!hit)}
                  onClick={() => onPreview?.(inst)}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  aria-label={`Preview ${INSTRUMENTS[inst].name}`}
                >
                  {/* stand */}
                  <line x1={cx} y1={cy + r} x2={cx} y2={Math.min(cy + r + 60, 380)} stroke="#3f3f46" strokeWidth={2.5} />
                  {hit && (
                    <circle key={key} className="atlas-hit-ring" cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={2.5} />
                  )}
                  {isHat ? (
                    <>
                      <ellipse cx={cx} cy={cy - (hatOpenActive ? 9 : 3)} rx={r} ry={7.5} fill={used ? '#27272a' : '#1c1c1f'} stroke={hit ? color : '#3f3f46'} strokeWidth={hit ? 2.5 : 1.5} />
                      <ellipse cx={cx} cy={cy + (hatOpenActive ? 11 : 4)} rx={r} ry={7.5} fill={used ? '#1f2125' : '#1a1a1d'} stroke="#3f3f46" strokeWidth={1.5} />
                      <line x1={cx} y1={cy + 11} x2={cx} y2={cy + 60} stroke="#3f3f46" strokeWidth={2.5} />
                    </>
                  ) : (
                    <>
                      <circle cx={cx} cy={cy} r={r} fill={used ? '#1e1f23' : '#18181b'} stroke={hit ? color : '#3f3f46'} strokeWidth={hit ? 3 : 1.5} />
                      <circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke="#ffffff0d" strokeWidth={1} />
                      {/* lug points */}
                      {[0, 60, 120, 180, 240, 300].map((deg) => {
                        const rad = (deg * Math.PI) / 180
                        return <circle key={deg} cx={cx + Math.cos(rad) * (r - 5)} cy={cy + Math.sin(rad) * (r - 5)} r={1.6} fill="#52525b" />
                      })}
                    </>
                  )}
                  {/* velocity glow */}
                  {hit && <circle cx={cx} cy={cy} r={r} fill={color} opacity={0.14 * tier + 0.08} />}
                  <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize={10} fontFamily="ui-monospace, monospace" fill={hit ? color : '#71717a'} fontWeight="700">
                    {shortOf(inst)}
                  </text>
                </g>
              )
            })}

            {/* pedal hi-hat marker */}
            {(() => {
              const hit = active.get('hatPedal')
              return (
                <g
                  onClick={() => onPreview?.('hatPedal')}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  aria-label="Preview pedal hi-hat"
                  className={hitAnim(!!hit)}
                >
                  <rect x={54} y={252} width={26} height={10} rx={2} fill={hit ? colorOf('hatPedal') : '#27272a'} opacity={hit ? 0.9 : 1} stroke="#3f3f46" />
                  <text x={67} y={278} textAnchor="middle" fontSize={8.5} fontFamily="ui-monospace, monospace" fill={hit ? colorOf('hatPedal') : '#71717a'} fontWeight="700">PHH</text>
                </g>
              )
            })()}

            {/* open-hat flash indicator */}
            {hatOpenActive && (
              <g>
                <circle cx={66} cy={176} r={42} fill="none" stroke={colorOf('hatOpen')} strokeWidth={2} strokeDasharray="4 4" opacity={0.7} />
                <text x={66} y={222} textAnchor="middle" fontSize={8.5} fontFamily="ui-monospace, monospace" fill={colorOf('hatOpen')} fontWeight="700">OPEN</text>
              </g>
            )}

            {/* ride bell detail */}
            <circle cx={596} cy={108} r={12} fill="none" stroke="#ffffff10" />
          </svg>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-zinc-800 px-4 py-2.5">
            {KIT_EXTRA.concat(['crash', 'ride', 'tomLow']).includes('hatOpen') && null}
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">Click any piece to audition · hats draw open when the open hat fires</span>
          </div>
        </div>
      )}

      {(stacked || mode === 'pads') && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {(Object.keys(INSTRUMENTS) as InstrumentId[]).map((inst) => {
              const hit = active.get(inst)
              const color = colorOf(inst)
              const def = INSTRUMENTS[inst]
              return (
                <button
                  key={inst}
                  type="button"
                  onClick={() => onPreview?.(inst)}
                  className={`relative flex h-16 flex-col items-center justify-center rounded-md border bg-zinc-900 transition-none cursor-pointer ${padAnim(!!hit)}`}
                  style={{
                    borderColor: hit ? color : '#27272a',
                    boxShadow: hit ? `0 0 14px ${color}44, inset 0 0 12px ${color}22` : undefined,
                  }}
                  aria-label={`Preview ${def.name}`}
                >
                  <span className="font-mono text-[11px] font-bold" style={{ color: hit ? color : '#a1a1aa' }}>{def.short}</span>
                  <span className="mt-0.5 hidden truncate px-1 text-[8px] text-zinc-600 sm:block">{def.name}</span>
                  <span className="absolute inset-x-2 bottom-1 h-[2px] rounded" style={{ background: hit ? color : '#27272a' }} />
                </button>
              )
            })}
          </div>
          <p className="mt-2.5 px-1 font-mono text-[9px] uppercase tracking-widest text-zinc-600">27-instrument registry · click to audition · lights follow playback</p>
        </div>
      )}

      {/* percussion strip (kit mode) */}
      {(stacked || mode === 'kit') && (
        <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950 p-2.5">
          <p className="px-1 pb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">Percussion rack</p>
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
            {PERC_STRIP.map((inst) => {
              const hit = active.get(inst)
              const color = colorOf(inst)
              const used = usedInsts.has(inst)
              return (
                <button
                  key={inst}
                  type="button"
                  onClick={() => onPreview?.(inst)}
                  className={`flex h-11 items-center justify-center rounded border font-mono text-[10px] font-bold transition-none cursor-pointer ${padAnim(!!hit)}`}
                  style={{
                    borderColor: hit ? color : used ? '#3f3f46' : '#27272a',
                    color: hit ? color : used ? '#d4d4d8' : '#52525b',
                    background: hit ? `${color}1f` : '#101012',
                    boxShadow: hit ? `0 0 10px ${color}33` : undefined,
                  }}
                  aria-label={`Preview ${INSTRUMENTS[inst].name}`}
                >
                  {shortOf(inst)}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/** compact variant for hero/cards — kit only, no toggle, read-only */
export function DrumKitMini({ pattern, currentStep, className }: { pattern: GroovePattern; currentStep: number | null; className?: string }) {
  const spb = stepsPerBar(pattern.timeSignature, pattern.subdivision)
  const step = currentStep === null ? null : currentStep % spb
  const active = useMemo(() => {
    const s = new Set<InstrumentId>()
    if (step === null) return s
    for (const e of pattern.events) {
      if (e.s % spb !== step) continue
      const track = pattern.tracks.find((t) => t.id === e.t)
      if (track) s.add(track.inst as InstrumentId)
    }
    return s
  }, [pattern, step, spb])
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className ?? ''}`} aria-hidden>
      {KIT_PIECES.slice(0, 6).map(({ inst, r }) => (
        <span
          key={inst}
          className="inline-block rounded-full transition-all duration-100"
          style={{
            width: r * 0.5,
            height: r * 0.5,
            background: active.has(inst) ? TRACK_COLORS[(INSTRUMENTS[inst] ?? INSTRUMENTS.kick).color % TRACK_COLORS.length].hex : '#27272a',
            boxShadow: active.has(inst) ? `0 0 8px ${TRACK_COLORS[(INSTRUMENTS[inst] ?? INSTRUMENTS.kick).color % TRACK_COLORS.length].hex}66` : undefined,
          }}
        />
      ))}
    </div>
  )
}
