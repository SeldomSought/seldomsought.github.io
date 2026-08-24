import type { ConfidenceLevel, FacetScore } from '../types'
import { FACET_BY_ID } from '../../content/facets'
import { phrase } from './dimensionPhrases'
import { deriveRecommendationConfidence } from './recommendationConfidence'
import type { RecommendationConfidence } from './recommendationConfidence'
import type { EnvironmentArchetype } from '../../content/careers/poorFitArchetypes'
import { ENVIRONMENT_ARCHETYPES } from '../../content/careers/poorFitArchetypes'

/**
 * The inverse of career-fit recommendations: environment ARCHETYPES (never
 * specific occupations) that this profile's own responses point AWAY from.
 * "This environment contains several characteristics your responses
 * indicate would repeatedly drain or frustrate you" is the honest claim
 * this whole module exists to support — never "you cannot do this job."
 * Nothing here asserts capability; it only names a pattern of friction.
 */

export interface PoorFitDimensionDetail {
  facetId: string
  label: string
  /** 0-100 — how characteristic this trait is of the environment itself. */
  characteristic: number
  /** 0-100 — the respondent's own scored facet. */
  actual: number
  /** 0-100 — |actual - characteristic|. */
  gap: number
  confidence: ConfidenceLevel
}

export interface PoorFitReason {
  dimensionId: string
  text: string
}

export interface PoorFitResult {
  id: string
  label: string
  description: string
  /** 0-100 — mean gap across this archetype's scored defining dimensions.
   *  Never shown on its own — always beside the reasons/dimensions that explain it. */
  conflictSeverity: number
  dimensionsScored: number
  dimensionsTotal: number
  /** Only the dimensions whose gap actually clears the friction threshold —
   *  what a user reads as "why." */
  reasons: PoorFitReason[]
  confidence: RecommendationConfidence
  confidenceReason: string
  /** Every scored dimension behind the flag, for a user to open and inspect directly. */
  dimensions: PoorFitDimensionDetail[]
}

const MIN_DIMENSIONS_SCORED = 2
/** An archetype needs real coverage of its own defining dimensions before
 *  it's eligible to be flagged at all — never inferred from a minority of them. */
const MIN_COVERAGE_RATIO = 0.6
/** Same threshold careerMatch.ts uses to call a gap a "friction," reused
 *  here so "severe" means the same thing on both sides of a recommendation. */
const FRICTION_GAP_THRESHOLD = 40
/** "Do NOT average unrelated traits into meaningless global scores" applies
 *  here exactly as it does in synthesis.ts: a real MAJORITY of an
 *  archetype's own dimensions must independently clear the friction
 *  threshold — one bad outlier dragging an otherwise-neutral average is
 *  never enough to flag an entire environment. */
const MIN_FRICTION_FRACTION = 0.6

function evaluateArchetype(archetype: EnvironmentArchetype, facetScores: Record<string, FacetScore>): PoorFitResult | null {
  const scored = archetype.dimensions
    .filter((d) => facetScores[d.facetId])
    .map((d) => {
      const actual = facetScores[d.facetId].score
      return { facetId: d.facetId, characteristic: d.characteristic, actual, gap: Math.abs(actual - d.characteristic) }
    })

  const dimensionsTotal = archetype.dimensions.length
  const dimensionsScored = scored.length
  if (dimensionsScored < MIN_DIMENSIONS_SCORED) return null
  if (dimensionsScored / dimensionsTotal < MIN_COVERAGE_RATIO) return null

  const frictionDims = scored.filter((s) => s.gap > FRICTION_GAP_THRESHOLD)
  if (frictionDims.length / dimensionsScored < MIN_FRICTION_FRACTION) return null

  const conflictSeverity = Math.round(scored.reduce((s, d) => s + d.gap, 0) / scored.length)

  const reasons: PoorFitReason[] = [...frictionDims]
    .sort((a, b) => b.gap - a.gap)
    .map((s) => ({ dimensionId: s.facetId, text: phrase(s.facetId, s.actual > s.characteristic ? 'frictionHigh' : 'frictionLow') }))

  const dimensions: PoorFitDimensionDetail[] = [...scored]
    .sort((a, b) => b.gap - a.gap)
    .map((s) => ({
      facetId: s.facetId,
      label: FACET_BY_ID[s.facetId]?.label ?? s.facetId,
      characteristic: s.characteristic,
      actual: s.actual,
      gap: s.gap,
      confidence: facetScores[s.facetId].confidence,
    }))

  const { level: confidence, reason: confidenceReason } = deriveRecommendationConfidence(
    scored.map((s) => facetScores[s.facetId]),
    dimensionsScored,
    dimensionsTotal,
  )

  return {
    id: archetype.id,
    label: archetype.label,
    description: archetype.description,
    conflictSeverity,
    dimensionsScored,
    dimensionsTotal,
    reasons,
    confidence,
    confidenceReason,
    dimensions,
  }
}

/** Every environment archetype that clears the convergence bar above,
 *  strongest conflict first. An empty array is a legitimate result — most
 *  profiles won't strongly conflict with most archetypes, and this never
 *  manufactures a poor fit to have something to show. `archetypes` mirrors
 *  matchCareers(facetScores, careers) — defaults to the real content set,
 *  but takes it as data rather than hardcoding it, so this stays testable
 *  against synthetic archetypes without touching real content. */
export function evaluatePoorFits(
  facetScores: Record<string, FacetScore>,
  archetypes: EnvironmentArchetype[] = ENVIRONMENT_ARCHETYPES,
): PoorFitResult[] {
  return archetypes
    .map((a) => evaluateArchetype(a, facetScores))
    .filter((r): r is PoorFitResult => r !== null)
    .sort((a, b) => b.conflictSeverity - a.conflictSeverity)
}
