import type { Career } from '../../content/careers/occupationData'
import type { CareerCategoryProfile, CareerFitCategory } from './careerFitModel'
import { CATEGORY_LABEL, deriveFitCategories } from './careerFitModel'
import type { ConfidenceLevel, FacetScore } from '../types'
import { FACET_BY_ID } from '../../content/facets'
import { phrase } from './dimensionPhrases'
import { deriveRecommendationConfidence } from './recommendationConfidence'
import type { RecommendationConfidence } from './recommendationConfidence'

/**
 * CareerFit = weighted compatibility across relevant dimensions, minus
 * major-incompatibility penalties. Two respondents can land on the same
 * blended fit score for very different reasons — this model keeps the two
 * halves (the weighted average, and the explicit penalties) visibly
 * separate rather than folding a severe mismatch into an average where it
 * would just get smoothed away by everything else. See computeCareerFit
 * for the exact arithmetic; nothing about it is hidden.
 */

export interface CareerAlignmentBullet {
  dimensionId: string
  category: CareerFitCategory
  text: string
}

/** Career fit's own name for the shared recommendation-confidence scale —
 *  see recommendationConfidence.ts for how it's actually derived. */
export type CareerFitConfidence = RecommendationConfidence

/** Every dimension that fed this career's fit score, laid out so a user
 *  can open the recommendation up and see exactly what drove it — never a
 *  black box behind the headline number. */
export interface CareerFitDimensionDetail {
  facetId: string
  label: string
  category: CareerFitCategory
  categoryLabel: string
  /** 0-100 — what this career wants on this dimension. */
  desired: number
  /** 0-100 — the respondent's own scored facet. */
  actual: number
  /** 0-100 — this single dimension's own compatibility, independent of every other. */
  alignment: number
  dealbreaker: boolean
  /** The underlying facet score's own confidence — how well-measured this
   *  particular input is, independent of the career-level confidence above. */
  confidence: ConfidenceLevel
  role: 'strength' | 'friction' | 'neutral'
}

export interface CategoryFitResult {
  category: CareerFitCategory
  label: string
  weight: number
  /** 0-100 — this category's own alignment, independent of every other category. */
  compatibility: number
  dimensionsScored: number
  dimensionsTotal: number
}

export interface IncompatibilityPenalty {
  facetId: string
  label: string
  category: CareerFitCategory
  desired: number
  actual: number
  gap: number
  points: number
  detail: string
}

export interface CareerFitResult {
  career: Career
  /** Final 0-100, after penalties — this is the number careers are ranked by. */
  fitScore: number
  /** The weighted average across categories, BEFORE penalties — shown
   *  alongside fitScore so the subtraction itself is visible, not hidden
   *  inside one blended number. */
  weightedCompatibility: number
  penaltyTotal: number
  /** A second, smaller deduction from ordinary (non-dealbreaker) friction —
   *  see FRICTION_GAP_THRESHOLD below for why this exists: category
   *  averaging alone can dilute a genuinely large gap on one dimension
   *  into invisibility when that category also holds several well-aligned
   *  ones, or carries a low weight. This doesn't replace the dealbreaker
   *  penalty system (still the stronger, itemized signal for a
   *  near-requirement miss) — it just means several real, moderate
   *  frictions nudge the headline number down instead of vanishing into
   *  an average, the same way they'd genuinely register with a person. */
  frictionPenalty: number
  categories: CategoryFitResult[]
  penalties: IncompatibilityPenalty[]
  strengths: CareerAlignmentBullet[]
  frictions: CareerAlignmentBullet[]
  dimensionsScored: number
  dimensionsTotal: number
  /** "Excellent X fit, but severe mismatch on Y." — only set when a real
   *  strength category and a real penalty coexist on the same career. */
  headline: string | null
  /** How much to trust this specific recommendation — independent of fitScore itself. */
  confidence: CareerFitConfidence
  confidenceReason: string
  /** Every scored dimension behind the score, for a user to open and inspect directly. */
  dimensions: CareerFitDimensionDetail[]
}

const SEVERE_GAP_THRESHOLD = 45
const PENALTY_RATE = 1.0
const MAX_PENALTY_PER_DIMENSION = 30

/** Same boundary dimensionRole already uses to call a gap "friction" —
 *  reused here so "this dimension reads as friction" and "this dimension
 *  nudges the score down" never disagree with each other. Deliberately a
 *  much gentler rate/cap than the dealbreaker penalty above: this is for
 *  ordinary, real friction the career itself never flagged as a
 *  near-requirement, so several of these together should be noticeable,
 *  not punishing the way one severe dealbreaker miss is. */
const FRICTION_GAP_THRESHOLD = 40
const FRICTION_PENALTY_RATE = 0.3
const MAX_FRICTION_PENALTY_PER_DIMENSION = 10

function mean(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}


interface Alignment {
  facetId: string
  desired: number
  dealbreaker: boolean
  userScore: number
  diff: number
  alignment: number
}

function scoreCategory(
  profile: CareerCategoryProfile,
  facetScores: Record<string, FacetScore>,
): { category: CareerFitCategory; weight: number; compatibility: number; dimensionsScored: number; dimensionsTotal: number; alignments: Alignment[] } | null {
  const alignments: Alignment[] = profile.dimensions
    .filter((d) => facetScores[d.facetId])
    .map((d) => {
      const userScore = facetScores[d.facetId].score
      const diff = Math.abs(userScore - d.desired)
      return { facetId: d.facetId, desired: d.desired, dealbreaker: Boolean(d.dealbreaker), userScore, diff, alignment: Math.max(0, 100 - diff) }
    })
  if (alignments.length === 0) return null
  return {
    category: profile.category,
    weight: profile.weight,
    compatibility: Math.round(mean(alignments.map((a) => a.alignment))),
    dimensionsScored: alignments.length,
    dimensionsTotal: profile.dimensions.length,
    alignments,
  }
}

function composeHeadline(
  categories: CategoryFitResult[],
  penalties: IncompatibilityPenalty[],
): string | null {
  if (penalties.length === 0) return null
  const strongest = [...categories].sort((a, b) => b.compatibility - a.compatibility)[0]
  if (!strongest || strongest.compatibility < 75) return null
  const topPenalty = [...penalties].sort((a, b) => b.points - a.points)[0]
  if (strongest.category === topPenalty.category) return null // the mismatch is already inside the "strong" category — not the surprising juxtaposition this headline is for
  return `Excellent ${strongest.label.toLowerCase()}, but severe mismatch on ${topPenalty.label.toLowerCase()}.`
}

function dimensionRole(diff: number, desired: number): CareerFitDimensionDetail['role'] {
  if (diff <= 20 && desired >= 55) return 'strength'
  if (diff > 40) return 'friction'
  return 'neutral'
}

export function computeCareerFit(career: Career, facetScores: Record<string, FacetScore>): CareerFitResult {
  // The bridge from objective occupation data to our fit categories is a
  // single, named, auditable call — never fields read directly off `career`.
  const fitCategories = deriveFitCategories(career)

  const scoredCategories = fitCategories
    .map((profile) => scoreCategory(profile, facetScores))
    .filter((c): c is NonNullable<typeof c> => c !== null)

  const dimensionsTotal = fitCategories.reduce((s, c) => s + c.dimensions.length, 0)

  if (scoredCategories.length === 0) {
    return {
      career, fitScore: 0, weightedCompatibility: 0, penaltyTotal: 0, frictionPenalty: 0,
      categories: [], penalties: [], strengths: [], frictions: [],
      dimensionsScored: 0, dimensionsTotal, headline: null,
      confidence: 'Limited',
      confidenceReason: 'No matching evidence — none of this career’s relevant dimensions have been scored yet.',
      dimensions: [],
    }
  }

  const categories: CategoryFitResult[] = scoredCategories.map((c) => ({
    category: c.category, label: CATEGORY_LABEL[c.category], weight: c.weight,
    compatibility: c.compatibility, dimensionsScored: c.dimensionsScored, dimensionsTotal: c.dimensionsTotal,
  }))

  const totalWeight = scoredCategories.reduce((s, c) => s + c.weight, 0)
  const weightedCompatibility = Math.round(scoredCategories.reduce((s, c) => s + c.compatibility * c.weight, 0) / totalWeight)

  const penalties: IncompatibilityPenalty[] = []
  for (const c of scoredCategories) {
    for (const a of c.alignments) {
      if (!a.dealbreaker || a.diff <= SEVERE_GAP_THRESHOLD) continue
      const points = Math.min(MAX_PENALTY_PER_DIMENSION, Math.round((a.diff - SEVERE_GAP_THRESHOLD) * PENALTY_RATE))
      penalties.push({
        facetId: a.facetId,
        label: FACET_BY_ID[a.facetId]?.label ?? a.facetId,
        category: c.category,
        desired: a.desired,
        actual: a.userScore,
        gap: a.diff,
        points,
        detail: `Severe mismatch on ${FACET_BY_ID[a.facetId]?.label ?? a.facetId} — this career treats it as a near-requirement, and the gap here is too large to average away.`,
      })
    }
  }
  const penaltyTotal = penalties.reduce((s, p) => s + p.points, 0)

  // Ordinary friction: every non-dealbreaker dimension whose gap is still
  // large enough to read as real friction (the same threshold dimensionRole
  // classifies as 'friction'), each contributing a small, capped deduction.
  // Never double-counts a dimension already penalized above as a dealbreaker.
  let frictionPenalty = 0
  for (const c of scoredCategories) {
    for (const a of c.alignments) {
      if (a.dealbreaker || a.diff <= FRICTION_GAP_THRESHOLD) continue
      frictionPenalty += Math.min(MAX_FRICTION_PENALTY_PER_DIMENSION, Math.round((a.diff - FRICTION_GAP_THRESHOLD) * FRICTION_PENALTY_RATE))
    }
  }

  const fitScore = clamp(weightedCompatibility - penaltyTotal - frictionPenalty, 0, 100)

  const allAlignments = scoredCategories.flatMap((c) => c.alignments.map((a) => ({ ...a, category: c.category })))
  const strengths: CareerAlignmentBullet[] = allAlignments
    .filter((a) => a.diff <= 20 && a.desired >= 55)
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 4)
    .map((a) => ({ dimensionId: a.facetId, category: a.category, text: phrase(a.facetId, 'positive') }))
  const frictions: CareerAlignmentBullet[] = allAlignments
    .filter((a) => a.diff > 40)
    .sort((a, b) => b.diff - a.diff)
    .slice(0, 4)
    .map((a) => ({ dimensionId: a.facetId, category: a.category, text: phrase(a.facetId, a.userScore > a.desired ? 'frictionHigh' : 'frictionLow') }))

  const dimensions: CareerFitDimensionDetail[] = allAlignments.map((a) => ({
    facetId: a.facetId,
    label: FACET_BY_ID[a.facetId]?.label ?? a.facetId,
    category: a.category,
    categoryLabel: CATEGORY_LABEL[a.category],
    desired: a.desired,
    actual: a.userScore,
    alignment: a.alignment,
    dealbreaker: a.dealbreaker,
    confidence: facetScores[a.facetId].confidence,
    role: dimensionRole(a.diff, a.desired),
  })).sort((a, b) => b.alignment - a.alignment)

  const { level: confidence, reason: confidenceReason } = deriveRecommendationConfidence(
    allAlignments.map((a) => facetScores[a.facetId]),
    allAlignments.length,
    dimensionsTotal,
  )

  return {
    career,
    fitScore,
    weightedCompatibility,
    penaltyTotal,
    frictionPenalty,
    categories,
    penalties,
    strengths,
    frictions,
    dimensionsScored: allAlignments.length,
    dimensionsTotal,
    headline: composeHeadline(categories, penalties),
    confidence,
    confidenceReason,
    dimensions,
  }
}

export function matchCareers(facetScores: Record<string, FacetScore>, careers: Career[]): CareerFitResult[] {
  return careers
    .map((career) => computeCareerFit(career, facetScores))
    .sort((a, b) => b.fitScore - a.fitScore)
}
