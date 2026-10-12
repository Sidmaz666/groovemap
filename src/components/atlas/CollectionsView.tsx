'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, FolderOpen, FolderPlus, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MiniGrid, PatternCard } from './PatternCard'
import { useAtlas } from './AtlasProvider'
import type { Route } from './AppShell'
import type { GroovePattern } from '@/lib/atlas/types'
import { CURATED_COLLECTIONS, getPattern } from '@/lib/atlas/patterns'
import { deleteUserCollection, listUserCollections, saveUserCollection } from '@/lib/atlas/storage'
import type { StoredCollection } from '@/lib/atlas/storage'

/**
 * CollectionsView — curated collections + the user's own localStorage
 * collections. Nothing here touches a server: `saveUserCollection` /
 * `deleteUserCollection` persist to `groove-atlas:collections` and the view
 * re-reads after every mutation.
 */

function SectionHeading({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-lime-400/90">{kicker}</p>
      <h2 className="mt-1 text-lg font-semibold text-zinc-100 sm:text-xl">{title}</h2>
      {sub && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-400">{sub}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Curated collection card (overview grid)                             */
/* ------------------------------------------------------------------ */

function CuratedCard({ id, name, blurb, patternIds, onOpen }: {
  id: string
  name: string
  blurb: string
  patternIds: string[]
  onOpen: (id: string) => void
}) {
  const thumbs = useMemo(
    () => patternIds.slice(0, 3).map((pid) => getPattern(pid)).filter((p): p is GroovePattern => p != null),
    [patternIds]
  )
  return (
    <button
      type="button"
      onClick={() => onOpen(id)}
      className="group flex h-full flex-col gap-3 border border-zinc-800/80 bg-zinc-900/40 p-4 text-left transition-colors hover:border-lime-400/40 hover:bg-zinc-900/70"
      aria-label={`Open collection: ${name}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-zinc-100 group-hover:text-lime-300">{name}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">{blurb}</p>
        </div>
        <Badge variant="outline" className="shrink-0 border-zinc-700 font-mono text-[10px] text-zinc-400">
          {patternIds.length}
        </Badge>
      </div>
      <div className="mt-auto grid grid-cols-3 items-end gap-2" aria-hidden>
        {thumbs.map((p) => (
          <MiniGrid key={p.id} pattern={p} className="min-w-0" />
        ))}
      </div>
      <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-600 group-hover:text-zinc-500">
        {patternIds.length} pattern{patternIds.length === 1 ? '' : 's'} →
      </p>
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* "Add current pattern…" — persists the loaded catalog pattern         */
/* ------------------------------------------------------------------ */

function AddToCollectionBar({ userCols, onAdded, onNewCollection }: {
  userCols: StoredCollection[]
  onAdded: (colName: string) => void
  onNewCollection: () => void
}) {
  const a = useAtlas()
  const addable = a.pattern && a.playingId != null && getPattern(a.playingId) ? a.pattern : null
  if (!addable) return null

  const add = (col: StoredCollection) => {
    if (col.patternIds.includes(addable.id)) {
      toast.info(`"${addable.title}" is already in ${col.name}`)
      return
    }
    saveUserCollection({ ...col, patternIds: [addable.id, ...col.patternIds] })
    onAdded(col.name)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border border-lime-400/25 bg-lime-400/[0.04] px-4 py-3">
      <span className="font-mono text-[10px] uppercase tracking-widest text-lime-400/90">now loaded</span>
      <span className="truncate text-sm text-zinc-200">{addable.title}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto border-lime-400/50 font-mono text-[11px] uppercase tracking-wider text-lime-300 hover:bg-lime-400/10"
          >
            <FolderPlus className="h-3.5 w-3.5" aria-hidden />
            Add to…
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-950">
          <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            My collections
          </DropdownMenuLabel>
          {userCols.length === 0 && (
            <DropdownMenuItem disabled className="text-xs text-zinc-500">No collections yet</DropdownMenuItem>
          )}
          {userCols.map((col) => (
            <DropdownMenuItem key={col.id} onClick={() => add(col)} className="text-xs">
              {col.name}
              <span className="ml-auto pl-4 font-mono text-[10px] text-zinc-600">{col.patternIds.length}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem onClick={onNewCollection} className="text-xs text-lime-300">
            <Plus className="h-3.5 w-3.5" aria-hidden />
            New collection…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* My Collections list + create form                                   */
/* ------------------------------------------------------------------ */

function UserCollectionsSection({ userCols, onOpen, onDeleteRequest, onCreate }: {
  userCols: StoredCollection[]
  onOpen: (id: string) => void
  onDeleteRequest: (col: StoredCollection) => void
  onCreate: (name: string) => void
}) {
  const [name, setName] = useState('')
  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Give the collection a name first')
      return
    }
    onCreate(trimmed)
    setName('')
  }
  return (
    <section aria-labelledby="my-collections-heading">
      <SectionHeading
        kicker="stored in your browser"
        title="My Collections"
        sub="Your own sets, saved to localStorage on this device. Load any catalog pattern and use “Add to…” to fill them."
      />
      <span id="my-collections-heading" className="sr-only">My Collections</span>

      <form
        className="mb-5 flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New collection name…"
          aria-label="New collection name"
          className="border-zinc-800 bg-zinc-900/60 font-mono text-xs placeholder:text-zinc-600"
          maxLength={48}
        />
        <Button type="submit" size="sm" className="shrink-0 bg-lime-400 font-mono text-[11px] uppercase tracking-wider text-zinc-950 hover:bg-lime-300">
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Create
        </Button>
      </form>

      {userCols.length === 0 ? (
        <p className="border border-dashed border-zinc-800 bg-zinc-900/20 p-6 text-center text-xs text-zinc-500">
          No collections yet — create one above, or open a pattern and pick “Add to…”.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {userCols.map((col) => (
            <li key={col.id} className="flex items-center gap-2 border border-zinc-800/80 bg-zinc-900/40 px-3 py-2.5 transition-colors hover:border-zinc-600">
              <FolderOpen className="h-4 w-4 shrink-0 text-zinc-600" aria-hidden />
              <button
                type="button"
                onClick={() => onOpen(col.id)}
                className="min-w-0 flex-1 text-left"
                aria-label={`Open collection ${col.name}`}
              >
                <span className="block truncate text-sm text-zinc-200 hover:text-lime-300">{col.name}</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
                  {col.patternIds.length} pattern{col.patternIds.length === 1 ? '' : 's'}
                </span>
              </button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDeleteRequest(col)}
                aria-label={`Delete collection ${col.name}`}
                className="h-8 w-8 shrink-0 text-zinc-600 hover:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Main view                                                           */
/* ------------------------------------------------------------------ */

export function CollectionsView({ collectionId, navigate, openPattern }: {
  collectionId?: string
  navigate: (r: Route) => void
  openPattern: (id: string) => void
}) {
  const a = useAtlas()
  const [userCols, setUserCols] = useState<StoredCollection[]>([])
  const [mounted, setMounted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogName, setDialogName] = useState('')
  const [dialogAddCurrent, setDialogAddCurrent] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<StoredCollection | null>(null)

  const refresh = useCallback(() => {
    setUserCols(listUserCollections())
  }, [])

  useEffect(() => {
    // localStorage is read post-mount (deferred out of the effect body) so the
    // SSR render and first client render stay identical
    let cancelled = false
    const t = window.setTimeout(() => {
      if (cancelled) return
      setUserCols(listUserCollections())
      setMounted(true)
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [refresh])

  const addablePattern = a.pattern && a.playingId != null && getPattern(a.playingId) ? a.pattern : null

  const createCollection = (name: string, withCurrent: boolean) => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Give the collection a name first')
      return
    }
    const col: StoredCollection = {
      id: `uc_${Date.now()}`,
      name: trimmed,
      patternIds: withCurrent && addablePattern ? [addablePattern.id] : [],
    }
    saveUserCollection(col)
    refresh()
    toast.success(
      withCurrent && addablePattern
        ? `Created "${col.name}" with "${addablePattern.title}" inside`
        : `Collection "${col.name}" created`
    )
  }

  const removePattern = (col: StoredCollection, patternId: string) => {
    const next: StoredCollection = { ...col, patternIds: col.patternIds.filter((x) => x !== patternId) }
    saveUserCollection(next)
    refresh()
    const p = getPattern(patternId)
    toast.success(`Removed "${p?.title ?? patternId}" from ${next.name}`)
  }

  const deleteCollection = (col: StoredCollection) => {
    deleteUserCollection(col.id)
    setConfirmDelete(null)
    refresh()
    toast.success(`Deleted collection "${col.name}"`)
    // if we were viewing the deleted collection, go back to the overview
    if (collectionId === col.id) navigate({ view: 'collections' })
  }

  const backLink = (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => navigate({ view: 'collections' })}
      className="-ml-2 font-mono text-[11px] uppercase tracking-wider text-zinc-400 hover:text-lime-300"
    >
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
      All collections
    </Button>
  )

  /* ------------------------- detail: curated ------------------------ */
  const curated = CURATED_COLLECTIONS.find((c) => c.id === collectionId)
  if (curated) {
    const patterns = curated.patternIds.map((id) => getPattern(id)).filter((p): p is GroovePattern => p != null)
    return (
      <div className="space-y-6">
        {backLink}
        <header>
          <p className="font-mono text-[10px] uppercase tracking-widest text-lime-400/90">curated collection</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">{curated.name}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-400">{curated.blurb}</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            {patterns.length} pattern{patterns.length === 1 ? '' : 's'}
          </p>
        </header>

        <AddToCollectionBar
          userCols={userCols}
          onAdded={(colName) => {
            refresh()
            toast.success(`Added "${addablePattern?.title}" to ${colName}`)
          }}
          onNewCollection={() => {
            setDialogAddCurrent(true)
            setDialogName('')
            setDialogOpen(true)
          }}
        />

        {patterns.length === 0 ? (
          <p className="border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">This collection is empty.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {patterns.map((p) => (
              <PatternCard key={p.id} pattern={p} onOpen={openPattern} />
            ))}
          </div>
        )}

        <NewCollectionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          name={dialogName}
          onNameChange={setDialogName}
          withCurrent={dialogAddCurrent}
          currentTitle={addablePattern?.title}
          onSubmit={(name) => {
            createCollection(name, dialogAddCurrent)
            setDialogOpen(false)
            setDialogAddCurrent(false)
          }}
        />
      </div>
    )
  }

  /* ------------------------- detail: user --------------------------- */
  if (collectionId?.startsWith('uc_')) {
    const col = userCols.find((c) => c.id === collectionId)
    if (!col) {
      if (!mounted) return <div className="min-h-24" aria-hidden />
      return (
        <div className="space-y-6">
          {backLink}
          <div className="border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200" role="alert">
            This collection no longer exists — it may have been deleted from this browser.
          </div>
        </div>
      )
    }
    const patterns = col.patternIds.map((id) => getPattern(id)).filter((p): p is GroovePattern => p != null)
    return (
      <div className="space-y-6">
        {backLink}
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-lime-400/90">my collection</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">{col.name}</h1>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              {col.patternIds.length} pattern{col.patternIds.length === 1 ? '' : 's'} · saved in this browser
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConfirmDelete(col)}
            className="border-zinc-700 font-mono text-[11px] uppercase tracking-wider text-rose-400 hover:border-rose-400/60 hover:bg-rose-500/10 hover:text-rose-300"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Delete collection
          </Button>
        </header>

        <AddToCollectionBar
          userCols={userCols}
          onAdded={(colName) => {
            refresh()
            toast.success(`Added "${addablePattern?.title}" to ${colName}`)
          }}
          onNewCollection={() => {
            setDialogAddCurrent(true)
            setDialogName('')
            setDialogOpen(true)
          }}
        />

        {patterns.length === 0 ? (
          <p className="border border-dashed border-zinc-800 bg-zinc-900/20 p-6 text-center text-xs text-zinc-500">
            No patterns yet. Load any catalog pattern, then use the “Add to…” menu on this page to fill the collection.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {patterns.map((p) => (
              <div key={p.id} className="flex flex-col gap-1.5">
                <PatternCard pattern={p} onOpen={openPattern} />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removePattern(col, p.id)}
                  className="self-start font-mono text-[10px] uppercase tracking-wider text-zinc-500 hover:text-rose-400"
                >
                  <X className="h-3 w-3" aria-hidden />
                  Remove from collection
                </Button>
              </div>
            ))}
          </div>
        )}

        <NewCollectionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          name={dialogName}
          onNameChange={setDialogName}
          withCurrent={dialogAddCurrent}
          currentTitle={addablePattern?.title}
          onSubmit={(name) => {
            createCollection(name, dialogAddCurrent)
            setDialogOpen(false)
            setDialogAddCurrent(false)
          }}
        />

        <DeleteConfirmDialog
          collection={confirmDelete}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => confirmDelete && deleteCollection(confirmDelete)}
        />
      </div>
    )
  }

  /* ------------------------- overview ------------------------------- */
  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-lime-400/90">
          <FolderOpen className="h-3.5 w-3.5" aria-hidden />
          collections
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">Curated sets &amp; your own shelves</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Ten editorial collections put the catalog in context — start-here grooves, dance-floor DNA, odd meters and more.
          Below them live your own collections, stored privately in this browser.
        </p>
      </header>

      <AddToCollectionBar
        userCols={userCols}
        onAdded={(colName) => {
          refresh()
          toast.success(`Added "${addablePattern?.title}" to ${colName}`)
        }}
        onNewCollection={() => {
          setDialogAddCurrent(true)
          setDialogName('')
          setDialogOpen(true)
        }}
      />

      <section aria-labelledby="curated-heading">
        <SectionHeading
          kicker="by the groovemap editors"
          title="Curated Collections"
          sub="Each set is a guided tour: play through it in order and the family resemblance does the teaching."
        />
        <span id="curated-heading" className="sr-only">Curated Collections</span>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {CURATED_COLLECTIONS.map((c) => (
            <CuratedCard
              key={c.id}
              id={c.id}
              name={c.name}
              blurb={c.blurb}
              patternIds={c.patternIds}
              onOpen={(id) => navigate({ view: 'collections', collection: id })}
            />
          ))}
        </div>
      </section>

      <Separator className="bg-zinc-800/80" />

      <UserCollectionsSection
        userCols={userCols}
        onOpen={(id) => navigate({ view: 'collections', collection: id })}
        onDeleteRequest={(col) => setConfirmDelete(col)}
        onCreate={(name) => createCollection(name, false)}
      />

      <NewCollectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        name={dialogName}
        onNameChange={setDialogName}
        withCurrent={dialogAddCurrent}
        currentTitle={addablePattern?.title}
        onSubmit={(name) => {
          createCollection(name, dialogAddCurrent)
          setDialogOpen(false)
          setDialogAddCurrent(false)
        }}
      />

      <DeleteConfirmDialog
        collection={confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && deleteCollection(confirmDelete)}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Dialogs                                                             */
/* ------------------------------------------------------------------ */

function NewCollectionDialog({ open, onOpenChange, name, onNameChange, withCurrent, currentTitle, onSubmit }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  onNameChange: (v: string) => void
  withCurrent: boolean
  currentTitle?: string
  onSubmit: (name: string) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-widest text-zinc-100">New collection</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-zinc-500">
            {withCurrent && currentTitle
              ? `Creates a new collection and adds “${currentTitle}” as its first pattern.`
              : 'Collections are stored privately in this browser (localStorage).'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(name)
          }}
          className="space-y-4"
        >
          <Input
            autoFocus
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Sunday practice set"
            aria-label="Collection name"
            maxLength={48}
            className="border-zinc-800 bg-zinc-900/60 font-mono text-xs placeholder:text-zinc-600"
          />
          <DialogFooter className="gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => onOpenChange(false)} className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-lime-400 font-mono text-[11px] uppercase tracking-wider text-zinc-950 hover:bg-lime-300">
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteConfirmDialog({ collection, onCancel, onConfirm }: {
  collection: StoredCollection | null
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={collection != null} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm uppercase tracking-widest text-zinc-100">Delete collection?</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-zinc-500">
            “{collection?.name}” and its {collection?.patternIds.length ?? 0} pattern reference{collection?.patternIds.length === 1 ? '' : 's'} will be
            removed from this browser. The patterns themselves stay in the catalog.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button size="sm" variant="ghost" onClick={onCancel} className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
            Cancel
          </Button>
          <Button size="sm" onClick={onConfirm} className="bg-rose-500 font-mono text-[11px] uppercase tracking-wider text-zinc-950 hover:bg-rose-400">
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
