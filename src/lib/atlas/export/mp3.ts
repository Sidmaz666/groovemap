import type { GroovePattern } from '../types'
import { renderPatternWav } from '../audio/engine'
import { triggerDownload } from './wav'
import { loadSettings } from '../storage'

/**
 * MP3 export — 320 kbps CBR stereo, encoded client-side with lamejs from the
 * same OfflineAudioContext render used by the WAV exporter.
 */

type LameModule = {
  Mp3Encoder: new (channels: number, sampleRate: number, kbps: number) => {
    encodeBuffer(left: Int16Array, right?: Int16Array): Uint8Array
    flush(): Uint8Array
  }
}

async function loadLame(): Promise<LameModule> {
  // the @breezystack/lamejs fork ships a clean ESM build
  const mod = (await import('@breezystack/lamejs')) as unknown as LameModule
  return mod
}

function floatTo16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length)
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]))
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return out
}

export async function encodeMp3(buffer: AudioBuffer, kbps = 320): Promise<Blob> {
  const lame = await loadLame()
  const numCh = Math.min(2, buffer.numberOfChannels)
  const encoder = new lame.Mp3Encoder(numCh, buffer.sampleRate, kbps)
  const left = floatTo16(buffer.getChannelData(0))
  const right = numCh > 1 ? floatTo16(buffer.getChannelData(1)) : undefined

  const blockSize = 1152
  const data: Uint8Array[] = []
  for (let i = 0; i < left.length; i += blockSize) {
    const l = left.subarray(i, i + blockSize)
    const r = right ? right.subarray(i, i + blockSize) : undefined
    const chunk = numCh > 1 ? encoder.encodeBuffer(l, r) : encoder.encodeBuffer(l)
    if (chunk.length) data.push(new Uint8Array(chunk))
  }
  const end = encoder.flush()
  if (end.length) data.push(new Uint8Array(end))
  return new Blob(data as unknown as BlobPart[], { type: 'audio/mpeg' })
}

export async function downloadMp3(p: GroovePattern, opts?: { loops?: number; bpm?: number; swing?: number; kitId?: GroovePattern['kitSuggestion']; roomId?: string }) {
  const roomId = opts?.roomId ?? (typeof window !== 'undefined' ? (loadSettings().roomId as string | undefined) : undefined)
  const buffer = await renderPatternWav(p, { loops: opts?.loops ?? 2, bpm: opts?.bpm, swing: opts?.swing, kitId: opts?.kitId, roomId: roomId as import('../audio/rooms').RoomId | undefined })
  const blob = await encodeMp3(buffer, 320)
  triggerDownload(blob, `${p.slug}.mp3`)
}
