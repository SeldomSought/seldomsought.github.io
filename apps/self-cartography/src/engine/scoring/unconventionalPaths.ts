import type { ConfidenceLevel, FacetScore } from '../types'
import { evaluateCondition } from './synthesis'
import { deriveRecommendationConfidence } from './recommendationConfidence'
import type { RecommendationConfidence } from './recommendationConfidence'
import type { CareerStructure } from '../../content/careers/careerStructures'
import { CAREER_STRUCTURES } from '../../content/careers/careerStructures'

/**
 * UNCONVENTIONAL PATHS — the engine half. Standard assessments
 * overrecommend known job titles because job titles are what occupational
 * databases index; this module exists to surface the other axis entirely:
 * CAREER STRUCTURES (portfolio career, consulting, independent operator,
 * and so on — see content/careers/careerStructures.ts) detected from
 * combinations of traits, using the exact same convergence mechanism
 * engine/scoring/synthesis.ts already uses for trait relationships — a
 * structure only fires when a real MAJORITY of its defining conditions
 * independently clear their threshold, never from one trait averaged in
 * with the rest. Every result carries the same confidence + open-dimensions
 * ledger every other recommendation surface in this app carries, so this
 * reads with the same rigor as career fit and likely-poor-fits, not as a
 * lighter-weight afterthought.
 */

export type UnconventionalPathStrength = 'Emerging' | 'Notable' | 'Strong'

export interface StructureDimensionDetail {
  facetId: string
  label: string
  direction: 'high' | 'low'
  threshold: number
  actual: number
  met: boolean
  confidence: ConfidenceLevel
}

export interface UnconventionalPathResult {
  id: string
  label: string
  description: string
  exampleRoles: string[]
  strength: UnconventionalPathStrength
  conditionsMet: number
  conditionsTotal: number
  /** Hand-written: why this specific combination points toward this specific structure. */
  detail: string
  confidence: RecommendationConfidence
  confidenceReason: string
  /** Every defining condition — met or not — for a user to open and inspect directly. */
  dimensions: StructureDimensionDetail[]
}

function evaluateStructure(structure: CareerStructure, facetScores: Record<string, FacetScore>): UnconventionalPathResult | null {
  const evaluated = structure.conditions.map((cond) => ({ cond, ...evaluateCondition(facetScores, cond) }))
  const conditionsMet = evaluated.filter((e) => e.met).length
  if (conditionsMet < structure.minimumMet) return null

  const fraction = conditionsMet / structure.conditions.length
  const strength: UnconventionalPathStrength = fraction >= 1 ? 'Strong' : fraction >= 0.75 ? 'Notable' : 'Emerging'

  const dimensions: StructureDimensionDetail[] = evaluated
    .filter((e): e is typeof e & { facet: FacetScore } => Boolean(e.facet))
    .map((e) => ({
      facetId: e.cond.facetId,
      label: e.facet.label,
      direction: e.cond.direction,
      threshold: e.cond.threshold,
      actual: e.facet.score,
      met: e.met,
      confidence: e.facet.confidence,
    }))

  const scoredFacets = evaluated.filter((e): e is typeof e & { facet: FacetScore } => Boolean(e.facet)).map((e) => e.facet)
  const { level: confidence, reason: confidenceReason } = deriveRecommendationConfidence(
    scoredFacets,
    dimensions.length,
    structure.conditions.length,
  )

  return {
    id: structure.id,
    label: structure.label,
    description: structure.description,
    exampleRoles: structure.exampleRoles,
    strength,
    conditionsMet,
    conditionsTotal: structure.conditions.length,
    detail: structure.detail,
    confidence,
    confidenceReason,
    dimensions,
  }
}

/** Every career structure that clears its own convergence bar, strongest
 *  signal first. `structures` mirrors matchCareers/evaluatePoorFits —
 *  defaults to the real content set but takes it as data, so this stays
 *  testable against synthetic structures without touching real content. */
export function detectUnconventionalPaths(
  facetScores: Record<string, FacetScore>,
  structures: CareerStructure[] = CAREER_STRUCTURES,
): UnconventionalPathResult[] {
  return structures
    .map((s) => evaluateStructure(s, facetScores))
    .filter((r): r is UnconventionalPathResult => r !== null)
    .sort((a, b) => b.conditionsMet - a.conditionsMet)
}
