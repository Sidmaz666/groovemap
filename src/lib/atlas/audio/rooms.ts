import { mulberry32 } from '../rhythm'

/**
 * Room ambience — REAL convolution reverb over the master bus.
 *
 * Every room is a measured-style impulse response synthesized per context:
 * exponentially decaying stereo noise with a discrete early-reflection
 * cluster (first echoes off the walls), a progressive high-frequency damping
 * curve (air absorbs highs as the tail grows) and per-room predelay handled
 * in the engine's graph. This is the same technique hardware reverbs and IR
 * libraries use to capture spaces — the drums themselves remain the recorded
 * samples; only the space around them changes.
 *
 * All IRs are deterministic (seeded RNG) so a room sounds identical every
 * session, in live playback and in offline WAV renders.
 */

export type RoomId = 'close' | 'studio' | 'room' | 'club' | 'hall' | 'plate' | 'arena'

export interface RoomDef {
  id: RoomId
  name: string
  desc: string
  /** diffuse tail length in seconds (≈ RT60) */
  decay: number
  /** wet mix 0..1 */
  wet: number
  /** pre-delay in seconds (distance to the first wall) */
  predelay: number
  /** lowpass on the wet path (Hz) — dull spaces are darker */
  lowpass: number
  /** early-reflection cluster level 0..1 */
  erLevel: number
  /** how fast the tail darkens 0 (bright forever) .. 1 (dark quickly) */
  damp: number
}

export const ROOMS: Record<RoomId, RoomDef> = {
  close: {
    id: 'close',
    name: 'Close & Dry',
    desc: 'No added space — the raw recorded samples, exactly as captured.',
    decay: 0,
    wet: 0,
    predelay: 0,
    lowpass: 20000,
    erLevel: 0,
    damp: 0,
  },
  studio: {
    id: 'studio',
    name: 'Studio Booth',
    desc: 'Tight, controlled control-room ambience — the "recorded in a great room" glue.',
    decay: 0.55,
    wet: 0.16,
    predelay: 0.008,
    lowpass: 9000,
    erLevel: 0.5,
    damp: 0.55,
  },
  room: {
    id: 'room',
    name: 'Live Room',
    desc: 'A mid-sized tracking room with wood walls — natural body and a short, musical tail.',
    decay: 1.1,
    wet: 0.24,
    predelay: 0.014,
    lowpass: 7500,
    erLevel: 0.7,
    damp: 0.5,
  },
  club: {
    id: 'club',
    name: 'Basement Club',
    desc: 'Low-ceiling brick venue — dense early reflections, dark fast tail. House & techno home turf.',
    decay: 1.5,
    wet: 0.3,
    predelay: 0.011,
    lowpass: 5200,
    erLevel: 0.9,
    damp: 0.72,
  },
  hall: {
    id: 'hall',
    name: 'Concert Hall',
    desc: 'Proper concert hall — long, smooth tail that carries rock and gospel grooves.',
    decay: 2.4,
    wet: 0.3,
    predelay: 0.022,
    lowpass: 6800,
    erLevel: 0.55,
    damp: 0.5,
  },
  plate: {
    id: 'plate',
    name: 'Vintage Plate',
    desc: 'The classic studio plate — dense, bright, instant. The 70s snare sound.',
    decay: 1.9,
    wet: 0.26,
    predelay: 0.004,
    lowpass: 11000,
    erLevel: 0.12,
    damp: 0.2,
  },
  arena: {
    id: 'arena',
    name: 'Arena',
    desc: 'Big empty venue — huge pre-delay and a tail that swells behind the backbeat. Power ballads live here.',
    decay: 3.6,
    wet: 0.34,
    predelay: 0.035,
    lowpass: 5600,
    erLevel: 0.4,
    damp: 0.55,
  },
}

export const ROOM_LIST: RoomDef[] = Object.values(ROOMS)

export function resolveRoom(id: string | undefined | null): RoomDef {
  return ROOMS[id as RoomId] ?? ROOMS.close
}

/* ------------------------------------------------------------------ */
/* impulse response synthesis (deterministic)                          */
/* ------------------------------------------------------------------ */

/** deterministic per-room seed so IRs are identical across sessions */
function roomSeed(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * Build the stereo impulse response for a room on any (live or offline) context.
 * Shape: sparse early reflections (0–60ms) → dense exponentially-decaying
 * diffuse tail whose spectrum darkens over time (progressive one-pole lowpass).
 */
export function buildImpulseResponse(ctx: BaseAudioContext, room: RoomDef): AudioBuffer {
  const sr = ctx.sampleRate
  // plates build almost instantly; rooms start diffuse after the ER cluster
  const len = Math.max(1, Math.ceil((room.decay + 0.08) * sr))
  const buf = ctx.createBuffer(2, len, sr)
  const rng = mulberry32(roomSeed(room.id))

  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch)
    // per-channel decorrelation offset (real rooms differ at each ear)
    const offset = ch === 1 ? Math.floor(sr * 0.0037) : 0

    // --- early reflections: sparse decaying taps over the first ~70ms ---
    if (room.erLevel > 0) {
      const erCount = 7 + Math.floor(rng() * 4)
      for (let i = 0; i < erCount; i++) {
        const t = Math.floor((0.004 + rng() * 0.062) * sr) + offset
        if (t >= len) continue
        const amp = room.erLevel * (0.5 + rng() * 0.5) * Math.pow(1 - i / erCount, 1.6)
        data[t] += amp * (rng() < 0.5 ? 1 : -1)
      }
    }

    // --- diffuse tail ---
    // tau chosen so the envelope reaches ≈ -60 dB at `decay`
    const tau = room.decay / 6.9
    let lp = 0 // one-pole lowpass state
    for (let i = 0; i < len; i++) {
      const t = i / sr
      const env = Math.exp(-t / tau)
      if (env < 0.001) break
      const n = rng() * 2 - 1
      // progressive damping: the cutoff coefficient falls over time
      const cutoff = Math.max(0.02, 1 - room.damp * Math.min(1, t / Math.max(0.2, room.decay)))
      lp += cutoff * 0.42 * (n - lp)
      data[i + offset >= len ? i : i + offset] += lp * env * 0.72
    }
  }

  // normalize to a sane peak (headroom for the wet gain stage)
  let peak = 0
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]))
  }
  if (peak > 0) {
    const g = 0.92 / peak
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch)
      for (let i = 0; i < d.length; i++) d[i] *= g
    }
  }
  return buf
}
