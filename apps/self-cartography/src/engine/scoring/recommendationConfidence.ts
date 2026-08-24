import type { ConfidenceLevel, FacetScore } from '../types'

/** How much weight a specific recommendation deserves — deliberately
 *  separate from its own score/severity: a strong-looking number and a
 *  weak one can be equally well- or poorly-evidenced. Reuses the same
 *  three-tier vocabulary as ResponseQuality's Profile Confidence, since it
 *  answers the same kind of question ("how much should you trust this")
 *  in the same voice. */
export type RecommendationConfidence = 'High' | 'Moderate' | 'Limited'

const CONFIDENCE_WEIGHT: Record<ConfidenceLevel, number> = { High: 3, Medium: 2, Low: 1 }

function downgrade(level: RecommendationConfidence): RecommendationConfidence {
  if (level === 'High') return 'Moderate'
  return 'Limited'
}

/**
 * Shared by every "this specific recommendation, built from several scored
 * facets" surface in this app — career fit, likely-poor-fit archetypes, and
 * anything added later — so the same evidence pattern always reads the same
 * way regardless of which feature is showing it. Confidence here is built
 * the same way composite-construct confidence is (only as strong as the
 * weakest well-weighted contributor), plus the two penalty factors that
 * show up everywhere else in this engine: thin coverage of the dimensions
 * that actually matter, and unresolved contradictions among them. Never
 * reads the recommendation's own score/severity — a strong-looking number
 * built on thin evidence is exactly the case this exists to catch,
 * symmetrically whether the recommendation is a positive fit or a warned-of
 * mismatch.
 */
export function deriveRecommendationConfidence(
  contributingFacets: FacetScore[],
  dimensionsScored: number,
  dimensionsTotal: number,
): { level: RecommendationConfidence; reason: string } {
  if (contributingFacets.length === 0) {
    return { level: 'Limited', reason: 'No matching evidence — none of the relevant dimensions have been scored yet.' }
  }

  const worstWeight = Math.min(...contributingFacets.map((f) => CONFIDENCE_WEIGHT[f.confidence]))
  let level: RecommendationConfidence = worstWeight === 3 ? 'High' : worstWeight === 2 ? 'Moderate' : 'Limited'

  const coverageRatio = dimensionsTotal === 0 ? 0 : dimensionsScored / dimensionsTotal
  const thinCoverage = coverageRatio < 0.5
  if (thinCoverage) level = downgrade(level)

  const contradicted = contributingFacets.some((f) => f.contradictionCount > 0)
  if (contradicted) level = downgrade(level)

  const lowCount = contributingFacets.filter((f) => f.confidence === 'Low').length
  const coveragePhrase = `Built from ${dimensionsScored} of ${dimensionsTotal} relevant dimensions`

  let reason: string
  if (level === 'High') {
    reason = `${coveragePhrase}, most backed by strong, consistent evidence.`
  } else if (contradicted) {
    reason = `${coveragePhrase}, but one or more of them carry conflicting signals elsewhere in your profile — treat this as a hypothesis rather than a conclusion.`
  } else if (thinCoverage) {
    reason = `${coveragePhrase} — several relevant dimensions haven’t been scored yet, so this reads as directional rather than exact.`
  } else if (lowCount > 0) {
    reason = `${coveragePhrase}, but ${lowCount} of them still rest on thin, early evidence — treat this as directional rather than exact.`
  } else {
    reason = `${coveragePhrase}, with moderate evidence behind most of them.`
  }

  return { level, reason }
}
