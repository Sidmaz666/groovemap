'use client'

import Image from 'next/image'

/**
 * HeroBackdrop — decorative layer behind the hero copy + player:
 * a fine hardware-grid texture, a low-opacity genre-art collage on the right,
 * heavy zinc-950 scrims so text contrast stays accessible, and an oversized
 * ghost "GROOVE" wordmark along the bottom edge. Purely presentational.
 */

const COLLAGE_FAMILIES = ['funk', 'house', 'afrobeat', 'trap']

export function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {/* fine sequencer grid */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(63,63,70,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(63,63,70,0.22) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      {/* genre-art collage (right half, masked out towards the copy) */}
      <div className="absolute inset-y-0 right-0 hidden w-[55%] grid-cols-2 grid-rows-2 opacity-[0.32] sm:grid lg:w-[46%] [mask-image:linear-gradient(to_left,black_25%,transparent_92%)]">
        {COLLAGE_FAMILIES.map((fam, i) => (
          <div key={fam} className="relative border border-zinc-950/60">
            <Image
              src={`/genre/${fam}.jpg`}
              alt=""
              fill
              sizes="(max-width: 1024px) 30vw, 22vw"
              priority={i === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* readability scrims — copy side always wins */}
      <div className="absolute inset-0 bg-zinc-950/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/72 to-zinc-950/25" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-zinc-950 to-transparent" />

      {/* oversized ghost wordmark */}
      <p className="absolute -bottom-4 left-0 whitespace-nowrap font-mono text-[18vw] font-bold leading-none tracking-tighter text-white/[0.03] sm:-bottom-7 sm:text-[10.5rem]">
        GROOVE
      </p>
    </div>
  )
}
