'use client'

import { Toaster as Sonner } from '@/components/ui/sonner'

/** themed sonner toaster for Groovemap feedback */
export function SonnerToaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'bg-zinc-900 border-zinc-700 text-zinc-100 rounded-none font-sans',
          description: 'text-zinc-400',
          actionButton: 'bg-lime-400 text-zinc-950',
        },
      }}
    />
  )
}
