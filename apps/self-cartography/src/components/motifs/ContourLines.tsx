import styles from './ContourLines.module.css'

/**
 * A quiet two-line topographic squiggle used as a section-header rule
 * instead of a hard border. Deterministic (no randomness) so it renders
 * identically every time — but not identical to every OTHER instance: with
 * a `seed` (a section's own eyebrow label is enough), the control points
 * shift by a small, consistent amount unique to that seed. A real
 * topographic map never draws the same contour twice; a report built from
 * thirty section rules that are all one hardcoded squiggle reads as
 * printed, not surveyed. The jitter is a deterministic hash of the seed
 * string, not Math.random — the same section always draws the same line.
 */

function hashNoise(seed: number, salt: number): number {
  const n = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453
  return n - Math.floor(n) // deterministic pseudo-random in [0, 1)
}

function jitter(base: number, seedHash: number, salt: number, range: number): number {
  return base + (hashNoise(seedHash, salt) - 0.5) * 2 * range
}

function hashString(text: string): number {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0
  return h
}

export function ContourLines({ seed }: { seed?: string }) {
  const h = seed ? hashString(seed) : 0
  const j = (base: number, salt: number, range = 2.2) => (seed ? jitter(base, h, salt, range) : base)

  const line1 = `M0,${j(7, 1)} C50,${j(2, 2)} 90,${j(12, 3)} 140,${j(7, 4)} C190,${j(2, 5)} 230,${j(12, 6)} 280,${j(7, 7)} C330,${j(2, 8)} 370,${j(12, 9)} 400,${j(7, 10)}`
  const line2 = `M0,${j(10, 11)} C60,${j(13, 12)} 100,${j(4, 13)} 160,${j(10, 14)} C220,${j(16, 15, 1.5)} 260,${j(4, 16)} 320,${j(10, 17)} C360,${j(14, 18)} 380,${j(7, 19)} 400,${j(10, 20)}`

  return (
    <svg className={styles.contour} viewBox="0 0 400 14" preserveAspectRatio="none" aria-hidden="true">
      <path className={styles.line} d={line1} />
      <path className={styles.line} d={line2} />
    </svg>
  )
}
