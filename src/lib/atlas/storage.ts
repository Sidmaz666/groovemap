import type { GroovePattern, KitId } from './types'

/**
 * Local persistence — browser localStorage, privacy-first.
 * User data is namespaced under `groove-atlas:` and never leaves the device.
 */

const KEYS = {
  projects: 'groove-atlas:projects',
  favorites: 'groove-atlas:favorites',
  recents: 'groove-atlas:recents',
  collections: 'groove-atlas:collections',
  settings: 'groove-atlas:settings',
}

export interface StoredProject {
  id: string
  name: string
  pattern: GroovePattern
  createdAt: number
  updatedAt: number
}

export interface StoredCollection {
  id: string
  name: string
  blurb?: string
  patternIds: string[]
}

export interface AppSettings {
  kitId: KitId
  masterVolume: number
  metronome: boolean
  /** room ambience (default close/dry) */
  roomId?: string
  midiMap?: Record<string, number>
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable — stay silent, app remains usable
  }
}

export function uid(): string {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/* ---------------- projects ---------------- */

export function listProjects(): StoredProject[] {
  return read<StoredProject[]>(KEYS.projects, []).sort((a, b) => b.updatedAt - a.updatedAt)
}

export function saveProject(name: string, pattern: GroovePattern, existingId?: string): StoredProject {
  const all = read<StoredProject[]>(KEYS.projects, [])
  const now = Date.now()
  let proj: StoredProject
  if (existingId) {
    const idx = all.findIndex((p) => p.id === existingId)
    proj = idx >= 0
      ? { ...all[idx], name, pattern, updatedAt: now }
      : { id: existingId, name, pattern, createdAt: now, updatedAt: now }
    if (idx >= 0) all[idx] = proj
    else all.push(proj)
  } else {
    proj = { id: uid(), name, pattern, createdAt: now, updatedAt: now }
    all.push(proj)
  }
  write(KEYS.projects, all)
  return proj
}

export function deleteProject(id: string) {
  write(KEYS.projects, read<StoredProject[]>(KEYS.projects, []).filter((p) => p.id !== id))
}

export function getProject(id: string): StoredProject | undefined {
  return read<StoredProject[]>(KEYS.projects, []).find((p) => p.id === id)
}

/* ---------------- favorites / recents ---------------- */

export function listFavorites(): string[] {
  return read<string[]>(KEYS.favorites, [])
}

export function toggleFavorite(patternId: string): string[] {
  const all = listFavorites()
  const next = all.includes(patternId) ? all.filter((x) => x !== patternId) : [patternId, ...all]
  write(KEYS.favorites, next)
  return next
}

export function pushRecent(patternId: string): string[] {
  const all = read<string[]>(KEYS.recents, []).filter((x) => x !== patternId)
  const next = [patternId, ...all].slice(0, 12)
  write(KEYS.recents, next)
  return next
}

export function listRecents(): string[] {
  return read<string[]>(KEYS.recents, [])
}

/* ---------------- user collections ---------------- */

export function listUserCollections(): StoredCollection[] {
  return read<StoredCollection[]>(KEYS.collections, [])
}

export function saveUserCollection(c: StoredCollection) {
  const all = read<StoredCollection[]>(KEYS.collections, [])
  const idx = all.findIndex((x) => x.id === c.id)
  if (idx >= 0) all[idx] = c
  else all.push(c)
  write(KEYS.collections, all)
}

export function deleteUserCollection(id: string) {
  write(KEYS.collections, read<StoredCollection[]>(KEYS.collections, []).filter((c) => c.id !== id))
}

/* ---------------- settings ---------------- */

export function loadSettings(): AppSettings {
  return read<AppSettings>(KEYS.settings, { kitId: 'analog909', masterVolume: 0.9, metronome: false, roomId: 'close' })
}

export function saveSettings(s: AppSettings) {
  write(KEYS.settings, s)
}
