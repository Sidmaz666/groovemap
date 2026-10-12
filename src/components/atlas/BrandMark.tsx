/**
 * BrandMark — the Groovemap mark: a drum with two crossed sticks above it.
 * Single-color (currentColor) so it works on any surface; the dark "head hole"
 * matches the app background.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden focusable="false">
      <g stroke="currentColor" strokeWidth="4.2" strokeLinecap="round">
        <line x1="14" y1="8" x2="33" y2="24" />
        <line x1="50" y1="8" x2="31" y2="24" />
      </g>
      <path d="M17 28 v13 a15 6.5 0 0 0 30 0 v-13 z" fill="currentColor" />
      <ellipse cx="32" cy="28" rx="15" ry="6.5" fill="currentColor" />
      <ellipse cx="32" cy="28" rx="10.4" ry="4.3" fill="#09090b" />
    </svg>
  )
}
