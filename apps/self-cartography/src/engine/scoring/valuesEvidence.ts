import type { EvidenceStrength, Response } from '../types'
import { ALL_ITEMS } from '../../content/instruments'
import { computeContributions } from './contributions'

export type ValuesAgreement = 'aligned' | 'mixed' | 'diverged' | 'insufficient-evidence'

export interface ValuesEvidenceBreakdown {
  facetId: string
  /** What they say when asked directly (plain rating items). */
  professed: number | null
  /** What emerges when they're forced to give something up for it (tradeoffs, scarcity exercises, conflict scenarios). */
  revealedTradeoff: number | null
  /** What their actual past behavior shows. */
  behavioral: number | null
  agreement: ValuesAgreement
  /** Largest gap between any two present sub-scores — the number `agreement` is derived from. */
  spread: number | null
}

const AGREEMENT_THRESHOLDS = { aligned: 20, mixed: 40 }

/**
 * The point of distinguishing these three isn't to pick a "real" answer —
 * it's the disagreement itself that's informative. Reuses
 * computeContributions exactly as scoring/index.ts does; the only
 * difference is bucketing by each item's evidenceStrength tag instead of
 * pooling everything into one blended average.
 */
export function computeValuesEvidenceBreakdown(
  facetIds: string[],
  responses: Record<string, Response>,
): ValuesEvidenceBreakdown[] {
  const buckets: Record<string, Partial<Record<EvidenceStrength, { sum: number; weight: number }>>> = {}

  for (const item of ALL_ITEMS) {
    const response = responses[item.id]
    if (!response) continue
    const strength = 'evidenceStrength' in item ? item.evidenceStrength : undefined
    if (!strength) continue

    for (const contribution of computeContributions(item, response)) {
      const facetBucket = (buckets[contribution.facetId] ??= {})
      const b = (facetBucket[strength] ??= { sum: 0, weight: 0 })
      b.sum += contribution.points * contribution.weight
      b.weight += contribution.weight
    }
  }

  return facetIds.map((facetId) => {
    const b = buckets[facetId] ?? {}
    const professed = scoreFor(b['self-report'])
    const revealedTradeoff = scoreFor(b['stated-preference'])
    const behavioral = scoreFor(b.behavioral)

    const present = [professed, revealedTradeoff, behavioral].filter((v): v is number => v !== null)
    let agreement: ValuesAgreement = 'insufficient-evidence'
    let spread: number | null = null
    if (present.length >= 2) {
      spread = Math.max(...present) - Math.min(...present)
      agreement = spread <= AGREEMENT_THRESHOLDS.aligned ? 'aligned' : spread <= AGREEMENT_THRESHOLDS.mixed ? 'mixed' : 'diverged'
    }

    return { facetId, professed, revealedTradeoff, behavioral, agreement, spread }
  })
}

function scoreFor(bucket: { sum: number; weight: number } | undefined): number | null {
  if (!bucket || bucket.weight === 0) return null
  return Math.round(bucket.sum / bucket.weight)
}
