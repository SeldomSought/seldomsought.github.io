import type { FacetScore, Response } from '../types'
import { evaluateCondition } from './synthesis'
import { computeConstructConfidence } from './constructConfidence'
import type { ConstructConfidenceLevel } from './constructConfidence'
import type { CoreDriverDefinition } from '../../content/copy/coreDrivers'
import { CORE_DRIVER_DEFINITIONS } from '../../content/copy/coreDrivers'

/**
 * CORE DRIVERS — the engine half. Identifies the 3-6 strongest
 * motivational forces behind a profile by running the same convergence
 * check synthesis.ts and unconventionalPaths.ts already use (a real
 * majority of a driver's own conditions independently clearing threshold —
 * never a single strong trait, never an average that would blend a driver
 * into existence). What's new here is the evidence packet attached to
 * each surfaced driver: an importance score, a construct-level confidence
 * borrowed from constructConfidence.ts (as strong as its weakest
 * contributing facet — the same "weakest constituent" rule composite
 * constructs use everywhere else in this engine), a count of genuinely
 * behavioral (not just self-report) contributions, and the full list of
 * supporting facets, open to inspection.
 */

export interface CoreDriverSupportingFacet {
  facetId: string
  label: string
  score: number
  /** Whether this specific facet cleared the driver's own threshold, or is
   *  shown only for context (scored, but didn't individually meet the bar). */
  met: boolean
}

export interface CoreDriverResult {
  id: string
  label: string
  description: string
  whenHealthy: string[]
  whenExcessive: string
  /** 0-100 — mean score across every scored contributing facet (met or
   *  not) — how strong this force reads overall, not just how many
   *  conditions happened to clear the bar. */
  importance: number
  /** As strong as the single weakest well-measured contributing facet. */
  confidence: ConstructConfidenceLevel
  /** Summed across contributing facets — real evidence from demonstrated
   *  behavior, not just self-report, backing this driver. */
  behavioralEvidenceCount: number
  conditionsMet: number
  conditionsTotal: number
  supportingFacets: CoreDriverSupportingFacet[]
}

const CONFIDENCE_RANK: Record<ConstructConfidenceLevel, number> = { 'Very Low': 0, Low: 1, Moderate: 2, High: 3, 'Very High': 4 }

function evaluateDriver(
  def: CoreDriverDefinition,
  facetScores: Record<string, FacetScore>,
  confidenceByFacet: Record<string, ConstructConfidenceLevel>,
): CoreDriverResult | null {
  const evaluated = def.conditions.map((cond) => ({ cond, ...evaluateCondition(facetScores, cond) }))
  const scored = evaluated.filter((e): e is typeof e & { facet: FacetScore } => Boolean(e.facet))
  const met = scored.filter((e) => e.met)
  const conditionsMet = met.length
  if (conditionsMet < def.minimumMet) return null

  // Only the facets that actually converged count toward how strong this
  // force reads — a condition that didn't clear its own threshold isn't
  // evidence FOR the driver, and averaging it in would understate a driver
  // that's otherwise a strong, clean signal just because one unrelated
  // condition happened to miss.
  const importance = Math.round(met.reduce((s, e) => s + e.facet.score, 0) / met.length)
  const behavioralEvidenceCount = scored.reduce((s, e) => s + e.facet.behavioralEvidenceCount, 0)
  const confidences = scored.map((e) => confidenceByFacet[e.cond.facetId])
  const confidence = confidences.reduce((worst, level) => (CONFIDENCE_RANK[level] < CONFIDENCE_RANK[worst] ? level : worst))

  const supportingFacets: CoreDriverSupportingFacet[] = [...scored]
    .sort((a, b) => b.facet.score - a.facet.score)
    .map((e) => ({ facetId: e.cond.facetId, label: e.facet.label, score: e.facet.score, met: e.met }))

  return {
    id: def.id,
    label: def.label,
    description: def.description,
    whenHealthy: def.whenHealthy,
    whenExcessive: def.whenExcessive,
    importance,
    confidence,
    behavioralEvidenceCount,
    conditionsMet,
    conditionsTotal: def.conditions.length,
    supportingFacets,
  }
}

/** The 3-6 strongest motivational forces, ranked by importance. `definitions`
 *  mirrors matchCareers/evaluatePoorFits/detectUnconventionalPaths — data,
 *  not a hardcoded reference — so this stays testable against synthetic
 *  drivers without touching real content. An empty result is legitimate:
 *  nothing here manufactures a driver a sparse or genuinely flat profile
 *  didn't actually earn. */
export function identifyCoreDrivers(
  facetScores: Record<string, FacetScore>,
  responses: Record<string, Response>,
  definitions: CoreDriverDefinition[] = CORE_DRIVER_DEFINITIONS,
): CoreDriverResult[] {
  const confidenceByFacet = Object.fromEntries(
    Object.entries(computeConstructConfidence(facetScores, responses)).map(([id, c]) => [id, c.level]),
  )
  return definitions
    .map((def) => evaluateDriver(def, facetScores, confidenceByFacet))
    .filter((r): r is CoreDriverResult => r !== null)
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 6)
}
