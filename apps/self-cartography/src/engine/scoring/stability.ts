import type { FacetScore } from '../types'
import type { StabilityClass } from '../../content/stability'
import { STABILITY_BY_GROUP } from '../../content/stability'
import { FACET_BY_ID } from '../../content/facets'
import type { ConstructConfidenceLevel } from './constructConfidence'

/**
 * RETESTING ARCHITECTURE — the engine half. Two things this module does,
 * kept deliberately separate:
 *
 *  classifyStability — what KIND of construct this facet theoretically is
 *  (see content/stability.ts), downgraded to 'uncertain' whenever the
 *  evidence behind today's specific number is itself too thin to trust —
 *  independent of the score's magnitude, the same discipline
 *  constructConfidence.ts already holds itself to elsewhere.
 *
 *  compareSnapshots — the actual year-over-year read: given a PRIOR scored
 *  profile and TODAY's, buckets every facet present in both into Stable /
 *  Changing / Uncertain by combining the construct's theoretical class
 *  with how much it actually moved. This only ever runs once real
 *  historical data exists (see engine/snapshot.ts, engine/persistence.ts)
 *  — dormant, not fabricated, until a respondent has actually retaken.
 */

const THIN_CONFIDENCE: ReadonlySet<ConstructConfidenceLevel> = new Set(['Low', 'Very Low'])

/** A facet with thin construct-level evidence reads as 'uncertain'
 *  regardless of what the literature says about its theoretical class —
 *  you can't call a number "stable" or "changing" over time if you don't
 *  trust today's single measurement of it. `confidence` is optional so
 *  this still works from the plain per-facet ConfidenceLevel
 *  (FacetScore.confidence) when the richer 5-tier construct confidence
 *  hasn't been computed for this call site. */
export function classifyStability(facetId: string, confidence?: ConstructConfidenceLevel): StabilityClass {
  if (confidence && THIN_CONFIDENCE.has(confidence)) return 'uncertain'
  const group = FACET_BY_ID[facetId]?.group
  return group ? STABILITY_BY_GROUP[group] : 'uncertain'
}

export interface StabilityComparison {
  facetId: string
  label: string
  class: StabilityClass
  previousScore: number
  currentScore: number
  delta: number
}

export interface StabilityComparisonResult {
  stable: StabilityComparison[]
  changing: StabilityComparison[]
  uncertain: StabilityComparison[]
}

/** A movement large enough that "changing" reads as an observation about
 *  this specific retest, not just ordinary measurement noise around an
 *  otherwise-stable number. */
const NOTABLE_MOVEMENT = 15

/**
 * Compares a prior scored profile against today's. A facet only appears
 * when both snapshots actually scored it (never fabricated from a facet
 * only one of the two measured). The bucket a facet lands in blends its
 * theoretical class with how far it actually moved: a theoretically
 * "changing" construct that barely moved still reads as changing (that's
 * what the construct IS, movement or not); a theoretically "stable"
 * construct that moved a lot is surfaced as changing too — real movement
 * in a trait-like construct is exactly the kind of thing worth flagging,
 * not smoothing over with a prior.
 */
export function compareSnapshots(
  previous: Record<string, FacetScore>,
  current: Record<string, FacetScore>,
): StabilityComparisonResult {
  const result: StabilityComparisonResult = { stable: [], changing: [], uncertain: [] }

  for (const facetId of Object.keys(current)) {
    const prev = previous[facetId]
    const now = current[facetId]
    if (!prev) continue

    const theoreticalClass = classifyStability(facetId)
    const delta = now.score - prev.score
    // A stored snapshot keeps only the scored facet, not the raw responses
    // behind it (see engine/snapshot.ts) — the richer 5-tier construct
    // confidence needs response-level evidence buckets that no longer
    // exist by the time a retest happens, so this reads the plain
    // per-facet ConfidenceLevel that survives in the snapshot itself.
    const thinEvidence = prev.confidence === 'Low' || now.confidence === 'Low'

    const comparison: StabilityComparison = {
      facetId, label: now.label, class: theoreticalClass,
      previousScore: prev.score, currentScore: now.score, delta,
    }

    if (thinEvidence) {
      result.uncertain.push({ ...comparison, class: 'uncertain' })
    } else if (Math.abs(delta) >= NOTABLE_MOVEMENT) {
      result.changing.push({ ...comparison, class: 'changing' })
    } else if (theoreticalClass === 'changing') {
      result.changing.push(comparison)
    } else if (theoreticalClass === 'uncertain') {
      result.uncertain.push(comparison)
    } else {
      result.stable.push({ ...comparison, class: 'stable' })
    }
  }

  const bySize = (a: StabilityComparison, b: StabilityComparison) => Math.abs(b.delta) - Math.abs(a.delta)
  result.stable.sort(bySize)
  result.changing.sort(bySize)
  result.uncertain.sort(bySize)
  return result
}
