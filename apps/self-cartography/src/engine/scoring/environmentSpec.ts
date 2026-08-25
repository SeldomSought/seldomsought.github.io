import type { ConfidenceLevel, FacetScore } from '../types'
import type { EnvironmentSpecItem } from '../../content/copy/environmentSpec'
import { ENVIRONMENT_SPEC_ITEMS, ENVIRONMENT_FRICTION_ITEMS } from '../../content/copy/environmentSpec'

/**
 * ENVIRONMENT SPECIFICATION — the engine half. Instead of a job title,
 * this constructs the environment the profile actually appears designed
 * for: a short list of required conditions and a short list of
 * recognizable friction, read almost like a datasheet. No convergence
 * gating (unlike most of this app's pattern-detectors) — each line is
 * independently gated to its own facet and score band, because a spec is
 * a list of individually-true requirements, not a single combined signal.
 */

export interface EnvironmentSpecLine {
  id: string
  phrase: string
  facetId: string
  facetLabel: string
  score: number
  confidence: ConfidenceLevel
}

export interface EnvironmentSpecResult {
  required: EnvironmentSpecLine[]
  friction: EnvironmentSpecLine[]
}

function evaluate(items: EnvironmentSpecItem[], facetScores: Record<string, FacetScore>): EnvironmentSpecLine[] {
  const lines: EnvironmentSpecLine[] = []
  for (const item of items) {
    const facet = facetScores[item.facetId]
    if (!facet) continue
    if (facet.score < item.min || facet.score >= item.max) continue
    lines.push({ id: item.id, phrase: item.phrase, facetId: item.facetId, facetLabel: facet.label, score: facet.score, confidence: facet.confidence })
  }
  return lines.sort((a, b) => b.score - a.score)
}

/** `specItems`/`frictionItems` mirror every other pattern-detector this
 *  session (matchCareers, evaluatePoorFits, ...) — data, not a hardcoded
 *  reference, so this stays testable against a synthetic spec without
 *  touching real content. */
export function buildEnvironmentSpec(
  facetScores: Record<string, FacetScore>,
  specItems: EnvironmentSpecItem[] = ENVIRONMENT_SPEC_ITEMS,
  frictionItems: EnvironmentSpecItem[] = ENVIRONMENT_FRICTION_ITEMS,
): EnvironmentSpecResult {
  return {
    required: evaluate(specItems, facetScores),
    friction: evaluate(frictionItems, facetScores),
  }
}
