import type { GroovePattern } from '../types'
import { renderPatternWav } from '../audio/engine'
import { loadSettings } from '../storage'

/**
 * WAV export — renders the actual sequence through OfflineAudioContext using
 * the same recorded drum samples as live playback, then encodes PCM.
 * Supports 16-bit (44.1 kHz) and 24-bit (48 kHz) masters.
 */

export function audioBufferToWav(buffer: AudioBuffer, bitDepth: 16 | 24 = 16): Blob {
  const numCh = buffer.numberOfChannels
  const len = buffer.length
  const sr = buffer.sampleRate
  const bytesPerSample = bitDepth / 8
  const blockAlign = numCh * bytesPerSample
  const dataSize = len * blockAlign
  const ab = new ArrayBuffer(44 + dataSize)
  const view = new DataView(ab)

  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i))
  }

  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, numCh, true)
  view.setUint32(24, sr, true)
  view.setUint32(28, sr * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)
  writeStr(36, 'data')
  view.setUint32(40, dataSize, true)

  const channels: Float32Array[] = []
  for (let c = 0; c < numCh; c++) channels.push(buffer.getChannelData(c))

  if (bitDepth === 16) {
    let off = 44
    for (let i = 0; i < len; i++) {
      for (let c = 0; c < numCh; c++) {
        let s = channels[c][i]
        s = Math.max(-1, Math.min(1, s))
        view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true)
        off += 2
      }
    }
  } else {
    let off = 44
    for (let i = 0; i < len; i++) {
      for (let c = 0; c < numCh; c++) {
        let s = channels[c][i]
        s = Math.max(-1, Math.min(1, s))
        const v = Math.round(s < 0 ? s * 0x800000 : s * 0x7fffff)
        // 24-bit little-endian across three bytes
        view.setUint8(off, v & 0xff)
        view.setUint8(off + 1, (v >> 8) & 0xff)
        view.setUint8(off + 2, (v >> 16) & 0xff)
        off += 3
      }
    }
  }
  return new Blob([ab], { type: 'audio/wav' })
}

export interface WavOpts {
  loops?: number
  bpm?: number
  swing?: number
  kitId?: GroovePattern['kitSuggestion']
  tail?: number
  sampleRate?: 44100 | 48000
  bitDepth?: 16 | 24
  /** room ambience baked into the render (default: the app's current room) */
  roomId?: string
}

export async function downloadWav(p: GroovePattern, opts?: WavOpts) {
  const bitDepth = opts?.bitDepth ?? 16
  const sampleRate = opts?.sampleRate ?? 44100
  // default to the room the user is hearing right now
  const roomId = opts?.roomId ?? (typeof window !== 'undefined' ? (loadSettings().roomId as string | undefined) : undefined)
  const buffer = await renderPatternWav(p, {
    loops: opts?.loops,
    bpm: opts?.bpm,
    swing: opts?.swing,
    kitId: opts?.kitId,
    tail: opts?.tail,
    sampleRate,
    roomId: roomId as import('../audio/rooms').RoomId | undefined,
  })
  const blob = audioBufferToWav(buffer, bitDepth)
  const suffix = sampleRate === 48000 || bitDepth === 24 ? `-${Math.round(sampleRate / 1000)}k${bitDepth}` : ''
  triggerDownload(blob, `${p.slug}${suffix}.wav`)
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
