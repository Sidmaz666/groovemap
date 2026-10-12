/**
 * Vague counts — marketing surfaces (homepage, footer, metadata) never show
 * exact catalog sizes. 655 → "600+", 1601 → "1.6k+", 999 → "900+".
 * Small counts (<100) stay exact — they are structural, not catalog size.
 */
export function vagueCount(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '0'
  if (n < 100) return String(n)
  if (n < 1000) return `${Math.floor(n / 100) * 100}+`
  return `${(Math.floor(n / 100) / 10).toFixed(1)}k+`
}
