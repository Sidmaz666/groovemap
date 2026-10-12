'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Pause, Play, Square, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAtlas, usePlayhead, useKitLoad } from './AtlasProvider'
import { FAMILY_LIST } from '@/lib/atlas/patterns'
import { genreArtFor } from '@/lib/atlas/genreArt'
import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * FloatingPlayer — the global mini-transport.
 *
 * Anchored to the user's LISTENING SESSION (activeId — only a real play
 * gesture creates it, merely visiting pages never does). It survives pause
 * AND stop: a stopped groove stays listed here, ready to replay. It hides
 * while the page's main transport is on screen, and it only leaves for good
 * when the user taps the X (until the next play gesture reveals it again).
 */

export function FloatingPlayer({ openPattern }: { openPattern?: (id: string) => void }) {
  const a = useAtlas()
  const pos = usePlayhead()
  const kit = useKitLoad()
  const [mainVisible, setMainVisible] = useState(false)

  // track whether a main transport for the CURRENT pattern is on screen
  useEffect(() => {
    let raf = 0
    const check = () => {
      const marker = document.querySelector('[data-main-transport]')
      if (!marker) {
        setMainVisible(false)
        return
      }
      const r = marker.getBoundingClientRect()
      setMainVisible(r.top < window.innerHeight - 80 && r.bottom > 80)
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(check)
    }
    // defer the first check off the effect body (react-compiler: no sync setState)
    raf = requestAnimationFrame(check)
    // interval catches route changes without coupling to the router
    const t = setInterval(check, 700)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(t)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const famLabel = a.pattern ? FAMILY_LIST.find((f) => f.key === a.pattern?.family)?.label ?? a.pattern.family : ''
  const art = a.pattern ? genreArtFor(a.pattern.family) : '/genre/default.jpg'
  const warming = a.playing && kit?.state === 'loading'

  // beat pulse: 4 dots, the active one lit
  const beat = pos?.beat ?? -1

  // KEY RULE: only a listening session the user actually started (activeId)
  // may summon the mini player — silent staging (visiting pages) never does.
  // The player PERSISTS through pause and stop (a stopped groove stays
  // resumable from here); it only goes away via the user's X (until the next
  // play gesture) or while the main transport is on screen.
  const show = a.activeId != null && !a.miniHidden && !mainVisible
  const openable = !!openPattern && !!a.playingId && a.pattern && !a.playingId.startsWith('shared')

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="floating-player"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="fixed bottom-3 right-3 z-50 sm:bottom-5 sm:right-5 print:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          role="region"
          aria-label="Floating player"
        >
          <div className="flex items-center gap-2 border border-zinc-700/90 bg-zinc-950/95 py-1.5 pl-1.5 pr-2 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8)] backdrop-blur-md sm:gap-2.5">
            {/* genre art thumb + family label */}
            <button
              type="button"
              onClick={() => openable && openPattern!(a.playingId!)}
              className={cn('group relative h-9 w-9 shrink-0 overflow-hidden border border-zinc-800', openable && 'cursor-pointer')}
              aria-label={openable ? `Open ${a.pattern!.title}` : 'Now playing artwork'}
            >
              <Image src={art} alt="" fill sizes="36px" className="object-cover opacity-80 transition-opacity group-hover:opacity-100" />
            </button>

            <div className="min-w-0 sm:max-w-52">
              <button
                type="button"
                onClick={() => openable && openPattern!(a.playingId!)}
                className={cn(
                  'block max-w-full truncate text-left text-xs font-semibold text-zinc-100 hover:text-lime-300',
                  openable && 'cursor-pointer'
                )}
                title={a.pattern!.title}
              >
                {a.pattern!.title}
              </button>
              <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                <span className="truncate">{famLabel}</span>
                <span aria-hidden>·</span>
                <span className="tabular-nums text-zinc-400">{Math.round(a.bpm)} bpm</span>
                {/* beat pulse */}
                <span aria-hidden className="ml-0.5 flex gap-0.5">
                  {[0, 1, 2, 3].map((b) => (
                    <span
                      key={b}
                      className={cn(
                        'h-1 w-1 rounded-full transition-colors duration-75',
                        a.playing && beat === b ? 'bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.9)]' : 'bg-zinc-700'
                      )}
                    />
                  ))}
                </span>
              </div>
            </div>

            <div className="ml-1 flex shrink-0 items-center gap-1">
              {warming && <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-300" aria-label="Kit loading" />}
              <Button
                size="icon-sm"
                variant={a.playing ? 'default' : 'outline'}
                onClick={() => a.togglePlay()}
                aria-label={a.playing ? 'Pause' : 'Play'}
                className={a.playing ? 'h-8 w-8 bg-lime-400 text-zinc-950 hover:bg-lime-300' : 'h-8 w-8 border-zinc-700 hover:border-lime-400/60 hover:text-lime-300'}
              >
                {a.playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => a.stop()}
                aria-label="Stop"
                className="h-8 w-8 border-zinc-700 hover:border-zinc-500"
              >
                <Square className="h-3 w-3" />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => a.hideMini()}
                aria-label="Hide mini player"
                className="h-7 w-7 text-zinc-600 hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
