import type { GroovePattern } from '../types'
import type { InstrumentId } from '../instruments'
import { INSTRUMENTS } from '../instruments'
import { renderPatternWav } from '../audio/engine'
import { audioBufferToWav, triggerDownload } from './wav'
import { zipSync, type Zippable } from 'fflate'

/**
 * Stems export — renders one WAV per instrument (only the instruments the
 * pattern actually uses), bundles them in a .zip. Drop straight into any DAW
 * for mixing, or use individual stems as one-shot layers.
 */

export async function downloadStems(p: GroovePattern, opts?: { loops?: number; bpm?: number; swing?: number; kitId?: GroovePattern['kitSuggestion'] }) {
  const insts: InstrumentId[] = []
  for (const t of p.tracks) {
    if (!insts.includes(t.inst as InstrumentId)) insts.push(t.inst as InstrumentId)
  }
  if (!insts.length) throw new Error('pattern has no tracks')

  const files: Zippable = {}
  for (const inst of insts) {
    const buffer = await renderPatternWav(p, {
      loops: opts?.loops ?? 2,
      bpm: opts?.bpm,
      swing: opts?.swing,
      kitId: opts?.kitId,
      soloInst: new Set([inst]),
    })
    const blob = audioBufferToWav(buffer, 16)
    const ab = await blob.arrayBuffer()
    const name = `${INSTRUMENTS[inst]?.short ?? inst} - ${INSTRUMENTS[inst]?.name ?? inst}.wav`
    files[name] = new Uint8Array(ab)
  }

  const zipped = zipSync(files, { level: 0 }) // WAVs are already compressed audio; store fast
  const blob = new Blob([zipped as unknown as BlobPart], { type: 'application/zip' })
  triggerDownload(blob, `${p.slug}-stems.zip`)
}
