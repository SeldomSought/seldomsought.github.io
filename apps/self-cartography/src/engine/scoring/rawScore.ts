import type { Contribution } from './contributions'

/**
 * Stage one of scoring, kept explicitly separate from stage two
 * (transformToScale): the weighted aggregate of every contribution for one
 * construct, in its own right — before it becomes the 0-100 scale anyone
 * reads. Nothing here decides what the final number means; it just adds
 * points × weight and keeps the totals.
 */
export interface RawConstructScore {
  facetId: string
  /** Σ(points × weight) across every contributing, answered item. */
  rawSum: number
  /** Σ(weight) — the denominator a mean needs. */
  rawWeight: number
  /** How many separate contributions were folded in. */
  contributionCount: number
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Stage one: reduce a construct's contributions to a raw weighted sum.
 * Returns null for an empty or zero-weight contribution set — "no data"
 * is never silently coerced into a fabricated score of 0.
 */
export function computeRawScore(facetId: string, contributions: Contribution[]): RawConstructScore | null {
  let rawSum = 0
  let rawWeight = 0
  for (const c of contributions) {
    rawSum += c.points * c.weight
    rawWeight += c.weight
  }
  if (rawWeight === 0) return null
  return { facetId, rawSum, rawWeight, contributionCount: contributions.length }
}

/**
 * Stage two, and the ONLY place a raw aggregate becomes the internally
 * interpretable 0-100 scale — deliberately just a weighted mean, clamped
 * and rounded, with no hidden curve or reweighting. Kept as its own named
 * function (rather than inlined at the call site) so "raw" and
 * "transformed" are never conflated, and so a future non-linear transform,
 * if one were ever justified, has exactly one place to live.
 */
export function transformToScale(raw: RawConstructScore): number {
  return Math.round(clamp(raw.rawSum / raw.rawWeight, 0, 100))
}
