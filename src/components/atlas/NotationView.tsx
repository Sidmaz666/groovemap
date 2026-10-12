'use client'

import { useMemo, useState } from 'react'
import { Copy, Music4 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { GroovePattern } from '@/lib/atlas/types'
import { stepsPerBar } from '@/lib/atlas/types'
import { instrumentOf } from '@/lib/atlas/instruments'
import { drumTab, staffModel, indianModel, tabToText, indianToText, bolLegend } from '@/lib/atlas/notation'
import { cn } from '@/lib/utils'

/**
 * NotationView — every written form of the loaded groove:
 *   TAB     classic drum-mag tab, playhead-aware
 *   STAFF   standard drum-chart score on a 5-line staff (SVG)
 *   INDIAN  tabla bols + solkattu count + tala (clap/khali) structure
 */

type Mode = 'tab' | 'staff' | 'indian'

const MODES: { key: Mode; label: string; sub: string }[] = [
  { key: 'tab', label: 'Drum tab', sub: 'text grid' },
  { key: 'staff', label: 'Staff', sub: 'standard chart' },
  { key: 'indian', label: 'Indian', sub: 'bols · tala' },
]

export function NotationView({
  pattern,
  currentStep,
  stacked = false,
}: {
  pattern: GroovePattern
  currentStep?: number | null
  /** render EVERY notation system at once (detail page single-scroll) */
  stacked?: boolean
}) {
  const [mode, setMode] = useState<Mode>('tab')

  const tab = useMemo(() => drumTab(pattern), [pattern])
  const staff = useMemo(() => staffModel(pattern), [pattern])
  const indian = useMemo(() => indianModel(pattern), [pattern])

  const curBar = currentStep != null ? Math.floor(currentStep / stepsPerBar(pattern.timeSignature, pattern.subdivision)) : null
  const curStepInBar = currentStep != null ? currentStep % stepsPerBar(pattern.timeSignature, pattern.subdivision) : null

  const copy = async (which: Mode = mode) => {
    try {
      const text =
        which === 'tab'
          ? tabToText(tab, pattern.title)
          : which === 'indian'
            ? indianToText(indian, `${pattern.title} — ${indian.tala.name}`)
            : tabToText(tab, `${pattern.title} (staff view renders in the app)`)
      await navigator.clipboard.writeText(text)
      toast.success(`${MODES.find((m) => m.key === which)?.label} copied to clipboard`)
    } catch {
      toast.error('Clipboard is unavailable in this browser')
    }
  }

  if (stacked) {
    return (
      <div className="space-y-6">
        {MODES.map((m) => (
          <section key={m.key} aria-label={m.label} className="rounded-lg border border-zinc-800 bg-zinc-950/60">
            <div className="flex items-center justify-between border-b border-zinc-800/80 px-3.5 py-2">
              <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-200">
                {m.label} <span className="ml-1 text-[9px] font-normal text-zinc-600">{m.sub}</span>
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copy(m.key)}
                className="h-7 font-mono text-[10px] uppercase tracking-wider text-zinc-400 hover:text-lime-300"
              >
                <Copy className="h-3 w-3" /> Copy
              </Button>
            </div>
            <div className="p-3">
              {m.key === 'tab' && <DrumTabView tab={tab} curBar={curBar} curStepInBar={curStepInBar} />}
              {m.key === 'staff' && <StaffScore staff={staff} curBar={curBar} curStepInBar={curStepInBar} pattern={pattern} />}
              {m.key === 'indian' && <IndianView pattern={pattern} indian={indian} curBar={curBar} curStepInBar={curStepInBar} />}
            </div>
          </section>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Notation system">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={mode === m.key}
              onClick={() => setMode(m.key)}
              className={cn(
                'border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer',
                mode === m.key
                  ? 'border-lime-400 bg-lime-400/15 text-lime-300'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
              )}
            >
              {m.label} <span className="ml-1 text-[9px] text-zinc-600">{m.sub}</span>
            </button>
          ))}
        </div>
        <Button size="sm" variant="ghost" onClick={() => copy()} className="h-7 font-mono text-[10px] uppercase tracking-wider text-zinc-400 hover:text-lime-300">
          <Copy className="h-3 w-3" /> Copy
        </Button>
      </div>

      {mode === 'tab' && (
        <DrumTabView tab={tab} curBar={curBar} curStepInBar={curStepInBar} />
      )}
      {mode === 'staff' && (
        <StaffScore staff={staff} curBar={curBar} curStepInBar={curStepInBar} pattern={pattern} />
      )}
      {mode === 'indian' && (
        <IndianView pattern={pattern} indian={indian} curBar={curBar} curStepInBar={curStepInBar} />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Drum tab                                                            */
/* ------------------------------------------------------------------ */

function DrumTabView({ tab, curBar, curStepInBar }: { tab: ReturnType<typeof drumTab>; curBar: number | null; curStepInBar: number | null }) {
  return (
    <div className="overflow-x-auto border border-zinc-800 bg-zinc-950/60 p-4" role="img" aria-label="Drum tab notation">
      <div className="min-w-max font-mono text-[13px] leading-6">
        {/* count header */}
        <div className="flex">
          <span className="w-12 shrink-0" />
          <span className="whitespace-pre text-zinc-600">
            {tab.counts.map((c, b) => (
              <span key={b}>
                <span>|</span>
                {c.split('').map((ch, i) => (
                  <span key={i} className={cn(curBar === b && curStepInBar === i && 'bg-lime-400/25 text-lime-200')}>
                    {ch}
                  </span>
                ))}
                <span>|</span>
              </span>
            ))}
          </span>
        </div>
        {tab.rows.map((row) => (
          <div key={row.inst} className="flex items-center">
            <span className="w-12 shrink-0 pr-2 text-right text-[10px] uppercase tracking-wider text-zinc-500">{row.label}</span>
            <span className="whitespace-pre text-zinc-300">
              {row.bars.map((barStr, b) => (
                <span key={b}>
                  <span className="text-zinc-600">|</span>
                  {barStr.split('').map((ch, i) => {
                    const isCur = curBar === b && curStepInBar === i
                    return (
                      <span
                        key={i}
                        className={cn(
                          ch === '-' ? 'text-zinc-700' : ch === 'X' ? 'font-bold text-lime-300' : ch === 'x' ? 'text-zinc-200' : ch === 'o' ? 'text-amber-300/90' : 'text-cyan-300',
                          isCur && 'bg-lime-400/25 text-lime-200'
                        )}
                      >
                        {ch}
                      </span>
                    )
                  })}
                  <span className="text-zinc-600">|</span>
                </span>
              ))}
            </span>
          </div>
        ))}
        <div className="mt-2 flex">
          <span className="w-12 shrink-0" />
          <span className="text-[10px] text-zinc-600">X accent · x normal · o ghost · 2/3/4 roll ×n · p probabilistic · – rest</span>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Staff score (SVG)                                                   */
/* ------------------------------------------------------------------ */

const LINE_GAP = 8
const BEAT_W = 44
const LEAD_W = 60
const Y0 = 46 // top staff line

function staffY(pos: number): number {
  const bottom = Y0 + 4 * LINE_GAP
  return bottom - pos * (LINE_GAP / 2)
}

function posName(pos: number): string {
  const lines = ['E4', 'G4', 'B4', 'D5', 'F5']
  const spaces = ['F4', 'A4', 'C5', 'E5']
  if (pos >= 9) return pos === 9 ? 'G5 — above staff' : pos === 10 ? 'A5 — above staff' : 'above staff'
  if (pos < 0) return 'below staff'
  if (pos % 2 === 0) return `${lines[pos / 2]} line`
  return `${spaces[(pos - 1) / 2]} space`
}

function StaffScore({
  staff,
  curBar,
  curStepInBar,
  pattern,
}: {
  staff: ReturnType<typeof staffModel>
  curBar: number | null
  curStepInBar: number | null
  pattern: GroovePattern
}) {
  const beatsPerBar = staff.ts.num
  const spb = staff.spb
  const barW = beatsPerBar * BEAT_W + 12
  const width = LEAD_W + staff.bars.length * barW + 8
  const height = Y0 + 4 * LINE_GAP + 46
  const bottom = Y0 + 4 * LINE_GAP
  const beamY = Y0 - 26
  const slotW = BEAT_W / staff.sub

  const noteX = (barIdx: number, step: number): number => {
    const stepInBar = step % spb
    return LEAD_W + barIdx * barW + 8 + stepInBar * slotW
  }

  const ink = '#e4e4e7'
  const dim = '#52525b'

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto border border-zinc-800 bg-zinc-950/60 p-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-max"
          style={{ width: Math.round(width * 1.45) }}
          role="img"
          aria-label={`Standard drum chart notation, ${staff.ts.num}/${staff.ts.den}, ${staff.bars.length} bars`}
        >
          {/* playhead column highlights */}
          {curStepInBar != null &&
            curBar != null &&
            Array.from({ length: staff.bars.length }, (_, b) =>
              curBar === b ? (
                <rect
                  key={`ph${b}`}
                  x={LEAD_W + b * barW + 8 + curStepInBar * slotW - slotW / 2 + 1}
                  y={beamY - 8}
                  width={slotW}
                  height={bottom - beamY + 26}
                  fill="rgba(163,230,53,0.13)"
                />
              ) : null
            )}

          {/* staff lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={8} y1={Y0 + i * LINE_GAP} x2={width - 6} y2={Y0 + i * LINE_GAP} stroke={dim} strokeWidth={i === 0 || i === 4 ? 1.4 : 1} />
          ))}

          {/* percussion clef: two thick verticals */}
          <rect x={11} y={Y0 - 3} width={3.6} height={4 * LINE_GAP + 6} fill={ink} />
          <rect x={17.5} y={Y0 - 3} width={3.6} height={4 * LINE_GAP + 6} fill={ink} />

          {/* time signature */}
          <text x={34} y={Y0 + 13} fontSize={19} fontWeight={700} fill={ink} fontFamily="ui-monospace, monospace" textAnchor="middle">
            {staff.ts.num}
          </text>
          <text x={34} y={Y0 + 32} fontSize={19} fontWeight={700} fill={ink} fontFamily="ui-monospace, monospace" textAnchor="middle">
            {staff.ts.den}
          </text>

          {staff.bars.map((bar, barIdx) => {
            const barX = LEAD_W + barIdx * barW
            const endX = barX + beatsPerBar * BEAT_W + 8
            return (
              <g key={bar.index}>
                {/* beat ticks */}
                {Array.from({ length: beatsPerBar }, (_, beat) => (
                  <line
                    key={beat}
                    x1={barX + 8 + beat * BEAT_W}
                    y1={Y0 - 6}
                    x2={barX + 8 + beat * BEAT_W}
                    y2={bottom + 6}
                    stroke={beat === 0 ? dim : '#3f3f46'}
                    strokeWidth={beat === 0 ? 1.2 : 0.7}
                  />
                ))}
                {/* bar line (final = double) */}
                <line x1={endX} y1={Y0 - 6} x2={endX} y2={bottom + 6} stroke={ink} strokeWidth={1.4} />
                {barIdx === staff.bars.length - 1 && (
                  <line x1={endX - 5} y1={Y0 - 6} x2={endX - 5} y2={bottom + 6} stroke={ink} strokeWidth={3} />
                )}
                {barIdx < staff.bars.length - 1 && (
                  <text x={endX + 5} y={Y0 - 12} fontSize={9} fill={dim} fontFamily="ui-monospace, monospace">
                    {barIdx + 2}
                  </text>
                )}

                {bar.beats.map((beat) => {
                  const withStems = beat.notes.filter((n) => n.inst !== 'kick')
                  const xs = beat.notes.map((n) => noteX(barIdx, n.step))
                  const firstX = xs.length ? Math.min(...xs) : 0
                  const lastX = xs.length ? Math.max(...xs) : 0
                  const beamable = withStems.length >= 2
                  return (
                    <g key={beat.step}>
                      {beat.notes.map((n, ni) => {
                        const inst = instrumentOf(n.inst)
                        const x = noteX(barIdx, n.step)
                        const y = staffY(staff.positions.get(n.inst) ?? 4)
                        const head = staff.heads.get(n.inst) ?? 'note'
                        const stemX = x + 4.6
                        const hasStem = n.inst !== 'kick'
                        return (
                          <g key={`${n.inst}:${n.step}:${ni}`}>
                            {/* head */}
                            {head === 'x' ? (
                              <g stroke={ink} strokeWidth={1.6} strokeLinecap="round">
                                <line x1={x - 3.6} y1={y - 3.2} x2={x + 3.6} y2={y + 3.2} />
                                <line x1={x + 3.6} y1={y - 3.2} x2={x - 3.6} y2={y + 3.2} />
                              </g>
                            ) : head === 'diamond' ? (
                              <rect x={x - 3.4} y={y - 3.4} width={6.8} height={6.8} transform={`rotate(45 ${x} ${y})`} fill={ink} />
                            ) : (
                              <ellipse cx={x} cy={y} rx={4.4} ry={3.4} transform={`rotate(-18 ${x} ${y})`} fill={n.ghost ? 'none' : ink} stroke={ink} strokeWidth={n.ghost ? 1.2 : 0.8} />
                            )}
                            {/* ghost parens */}
                            {n.ghost && (
                              <g stroke={dim} strokeWidth={1} fill="none">
                                <path d={`M ${x - 7.5} ${y - 5} q -2.5 5 0 10`} />
                                <path d={`M ${x + 7.5} ${y - 5} q 2.5 5 0 10`} />
                              </g>
                            )}
                            {/* open-hat ring */}
                            {n.inst === 'hatOpen' && (
                              <text x={x} y={y - 7} fontSize={8.5} fill={ink} fontFamily="ui-monospace, monospace" textAnchor="middle">
                                o
                              </text>
                            )}
                            {/* accent */}
                            {n.accent && (
                              <text x={x} y={y - 9} fontSize={10} fontWeight={700} fill="#a3e635" textAnchor="middle">
                                {'>'}
                              </text>
                            )}
                            {/* roll badge */}
                            {n.roll && n.roll > 1 && (
                              <text x={x} y={bottom + 18} fontSize={8.5} fontWeight={700} fill="#67e8f9" textAnchor="middle">
                                ×{n.roll}
                              </text>
                            )}
                            {/* stem */}
                            {hasStem && <line x1={stemX} y1={y} x2={stemX} y2={beamable ? beamY : beamY + 14} stroke={ink} strokeWidth={1.4} />}
                          </g>
                        )
                      })}
                      {/* beat beams */}
                      {beamable && (
                        <>
                          <line x1={firstX + 4.6} y1={beamY} x2={lastX + 4.6} y2={beamY} stroke={ink} strokeWidth={3.4} />
                          {staff.sub === 4 && <line x1={firstX + 4.6} y1={beamY + 5} x2={lastX + 4.6} y2={beamY + 5} stroke={ink} strokeWidth={2.6} />}
                          {staff.sub === 3 && (
                            <text x={(firstX + lastX) / 2 + 4.6} y={beamY - 5} fontSize={9} fill={ink} textAnchor="middle">
                              3
                            </text>
                          )}
                        </>
                      )}
                      {/* single stem with flag (isolated eighth) */}
                      {!beamable && withStems.length === 1 && staff.sub >= 2 && (
                        <path
                          d={`M ${lastX + 4.6} ${beamY + 14} q 7 3 8 11`}
                          stroke={ink}
                          strokeWidth={1.6}
                          fill="none"
                        />
                      )}
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>

      {/* legend */}
      <div className="grid gap-x-4 gap-y-1 border border-zinc-800 bg-zinc-900/40 p-3 text-[10px] sm:grid-cols-2 lg:grid-cols-3">
        {pattern.tracks.map((t) => {
          const inst = instrumentOf(t.inst)
          const pos = staff.positions.get(t.inst)
          const head = staff.heads.get(t.inst) ?? 'note'
          return (
            <div key={t.id} className="flex items-center gap-2 font-mono uppercase tracking-wider text-zinc-400">
              <span className="text-zinc-200">{inst.name}</span>
              <span className="text-zinc-600">
                {head === 'x' ? '× head' : head === 'diamond' ? '◆ head' : '● head'} · {pos != null ? posName(pos) : 'above staff'}
              </span>
            </div>
          )
        })}
        <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-zinc-600 sm:col-span-2 lg:col-span-3">
          <Music4 className="h-3 w-3" aria-hidden /> {'>'} accent · (●) ghost · o = open hat · ×n roll · beamed per beat ({staff.sub === 3 ? 'triplet' : `1/${staff.sub * 4}`} grid)
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Indian notation                                                     */
/* ------------------------------------------------------------------ */

function IndianView({
  pattern,
  indian,
  curBar,
  curStepInBar,
}: {
  pattern: GroovePattern
  indian: ReturnType<typeof indianModel>
  curBar: number | null
  curStepInBar: number | null
}) {
  const spb = stepsPerBar(pattern.timeSignature, pattern.subdivision)
  const legend = useMemo(() => bolLegend(pattern), [pattern])
  const beatsPerBar = indian.tala.beats

  // mark per beat across the whole cycle (all bars)
  const beatMark = (absBeat: number): string | null => {
    const marks = indian.tala.marks
    const vibhag = indian.tala.vibhag
    let acc = 0
    for (let v = 0; v < vibhag.length; v++) {
      if (absBeat === acc) return marks[v] ?? null
      acc += vibhag[v]
    }
    return null
  }
  const isVibhagStart = (absBeat: number): boolean => {
    let acc = 0
    for (const v of indian.tala.vibhag) {
      if (absBeat === acc) return true
      acc += v
    }
    return false
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto border border-zinc-800 bg-zinc-950/60 p-4">
        <div className="min-w-max">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-lime-400">
            {indian.tala.name} — {indian.tala.beats} beats ({indian.tala.vibhag.join('+')})
          </p>

          {/* clap / khali row */}
          <div className="flex items-center font-mono text-[11px]">
            <span className="w-20 shrink-0 pr-2 text-right text-[9px] uppercase tracking-wider text-zinc-600">claps</span>
            {Array.from({ length: beatsPerBar * pattern.bars }, (_, b) => {
              const mark = beatMark(b)
              return (
                <div
                  key={b}
                  className={cn(
                    'px-1 text-center',
                    b % beatsPerBar === 0 && 'border-l border-zinc-700/80',
                    mark === 'x' && 'font-bold text-lime-300',
                    mark === '0' && 'font-bold text-amber-300',
                    mark && mark !== 'x' && mark !== '0' && 'text-cyan-300'
                  )}
                  style={{ minWidth: 34 }}
                >
                  {mark ?? ''}
                </div>
              )
            })}
          </div>

          {/* beat numbers */}
          <div className="flex items-center font-mono text-[10px] text-zinc-600">
            <span className="w-20 shrink-0 pr-2 text-right text-[9px] uppercase tracking-wider">beat</span>
            {Array.from({ length: beatsPerBar * pattern.bars }, (_, b) => (
              <div key={b} className={cn('px-1 text-center', b % beatsPerBar === 0 && 'border-l border-zinc-700/80')} style={{ minWidth: 34 }}>
                {(b % beatsPerBar) + 1}
              </div>
            ))}
          </div>

          {/* solkattu count row */}
          <div className="mt-0.5 flex items-center font-mono text-[11px]">
            <span className="w-20 shrink-0 pr-2 text-right text-[9px] uppercase tracking-wider text-zinc-600">count</span>
            {Array.from({ length: beatsPerBar * pattern.bars }, (_, beat) => (
              <div key={beat} className="flex" style={{ minWidth: 34 * indian.sub }}>
                {indian.gait.map((g, k) => (
                  <div key={k} className="px-0.5 text-center text-zinc-500" style={{ minWidth: 34 }}>
                    {g}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* bols rows — one row per bar, one cell per step */}
          {indian.bars.map((bar) => (
            <div key={bar.index} className="mt-2 flex items-center border-t border-zinc-800/70 pt-2 first:border-t-0 first:pt-0">
              <span className="w-20 shrink-0 pr-2 text-right font-mono text-[9px] uppercase tracking-wider text-zinc-600">
                {pattern.bars > 1 ? `bar ${bar.index + 1}` : 'bols'}
              </span>
              <div className="flex">
                {bar.beats.map((beat, beatIdx) => {
                  const absBeat = bar.index * beatsPerBar + beatIdx
                  return (
                    <div key={beat.step} className={cn('flex', isVibhagStart(absBeat) && absBeat > 0 && 'ml-3 border-l-2 border-l-lime-400/40 pl-1')}>
                      {beat.cells.map((cell, k) => {
                        const absStep = bar.index * spb + beatIdx * indian.sub + k
                        const isCur = curBar === bar.index && curStepInBar === absStep % spb
                        return (
                          <div
                            key={k}
                            className={cn(
                              'px-0.5 text-center font-mono text-[13px] leading-7',
                              isCur && 'rounded-sm bg-lime-400/25 text-lime-200'
                            )}
                            style={{ minWidth: 34 }}
                          >
                            {cell ? (
                              <span
                                className={cn(
                                  cell.accent && 'font-bold text-lime-300',
                                  !cell.accent && !cell.ghost && 'text-zinc-100',
                                  cell.ghost && 'text-zinc-500'
                                )}
                              >
                                {cell.bol}
                                {cell.roll && cell.roll > 1 && <sup className="text-[8px] text-cyan-300">×{cell.roll}</sup>}
                                {cell.probabilistic && <sup className="text-[8px] text-amber-300">?</sup>}
                              </span>
                            ) : (
                              <span className="text-zinc-700">·</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="mt-3 flex">
            <span className="w-20 shrink-0" />
            <p className="font-mono text-[10px] leading-5 text-zinc-600">
              x = sam (clap) · 0 = khali (wave) · digits = claps — count row is Carnatic solkattu gait · bols follow tabla strokes
            </p>
          </div>
        </div>
      </div>

      {/* bol → instrument legend */}
      <div className="grid gap-x-4 gap-y-1 border border-zinc-800 bg-zinc-900/40 p-3 text-[10px] sm:grid-cols-2 lg:grid-cols-3">
        {legend.map((l) => (
          <div key={l.inst} className="flex items-center gap-2 font-mono uppercase tracking-wider text-zinc-400">
            <span className="min-w-9 text-center text-[13px] font-semibold normal-case text-lime-300">{l.bol}</span>
            <span>{instrumentOf(l.inst).name}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 font-mono uppercase tracking-wider text-zinc-600 sm:col-span-2 lg:col-span-3">
          dhā = ge + nā (kick + snare together) · dim syllables are ghost strokes · bold lime = accent
        </div>
      </div>
    </div>
  )
}
