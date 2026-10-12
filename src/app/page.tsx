'use client'

import { AtlasProvider } from '@/components/atlas/AtlasProvider'
import { AppShell } from '@/components/atlas/AppShell'

export default function Home() {
  return (
    <AtlasProvider>
      <AppShell />
    </AtlasProvider>
  )
}
