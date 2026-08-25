import type { ConfidenceLevel } from '../types'
import type { StrengthDomainResult } from './strengthsClassification'
import type { CareerFitResult } from './careerMatch'

/**
 * The 2×2 STRENGTH MAP: every strength domain already classified by
 * strengthsClassification.ts, now placed on two axes instead of into one
 * five-way category —
 *
 *   ABILITY (low → high)  — demonstrated ability and/or trained skill,
 *   never raw self-perceived ease unless nothing else was answered. This
 *   app never blends ease/ability/skill/energy into one "talent" score
 *   (see the Strengths section's own copy) — this is a DIFFERENT, narrower
 *   composite built for exactly one purpose: placing a domain on a plane.
 *
 *   ENERGY (draining → energizing) — straight from the domain's own energy
 *   facet, the same one Energy Map (engine/scoring/energyMap.ts) reads.
 *
 * Unlike this app's convergence-gated pattern-detectors, every domain with
 * enough data gets placed somewhere — a 2×2 map with silently missing
 * quadrants would answer less than one that's honest about thin data via
 * `unplaced` instead.
 */

export type StrengthQuadrant = 'signature' | 'utilitarian' | 'development' | 'lowReturn'

export const QUADRANT_LABEL: Record<StrengthQuadrant, string> = {
  signature: 'Signature Strengths',
  utilitarian: 'Utilitarian Skills',
  development: 'Development Opportunities',
  lowReturn: 'Low-Return Areas',
}

/** Short form for inline tags — QUADRANT_LABEL is too long to sit next to a dimension name in a table row. */
export const QUADRANT_SHORT_LABEL: Record<StrengthQuadrant, string> = {
  signature: 'Signature',
  utilitarian: 'Utilitarian',
  development: 'Developing',
  lowReturn: 'Low-Return',
}

export const QUADRANT_BLURB: Record<StrengthQuadrant, string> = {
  signature: 'High demonstrated ability and it energizes you — the strongest possible case for building a career around it.',
  utilitarian: 'You can do this well, but it drains rather than energizes — useful in small doses, a weak foundation for an entire role.',
  development: 'It energizes you, but the demonstrated ability isn’t there yet — worth deliberate investment if the interest holds up.',
  lowReturn: 'Neither strong ability nor energy here — the least promising place to spend effort building a career around.',
}

export interface StrengthQuadrantResult {
  domainId: string
  label: string
  quadrant: StrengthQuadrant
  /** 0-100 — the Ability axis. */
  abilityScore: number
  abilitySource: 'ability+skill' | 'ability' | 'skill' | 'ease'
  /** 0-100 — the Energy axis. */
  energyScore: number
  confidence: ConfidenceLevel
  /** Facet ids behind the Ability axis for this domain — the lookup key
   *  career-fit annotations use to connect a scored dimension back to a quadrant. */
  abilityFacetIds: string[]
}

export interface StrengthQuadrantMap {
  placed: StrengthQuadrantResult[]
  /** Domains without enough data (no ability-ish axis, or no energy axis) to place. */
  unplaced: { domainId: string; label: string }[]
}

const MID = 50
const CONF_RANK: Record<ConfidenceLevel, number> = { High: 2, Medium: 1, Low: 0 }

function worseConfidence(a: ConfidenceLevel, b: ConfidenceLevel): ConfidenceLevel {
  return CONF_RANK[a] <= CONF_RANK[b] ? a : b
}

function computeAbilityAxis(
  result: StrengthDomainResult,
): { score: number; source: StrengthQuadrantResult['abilitySource']; confidence: ConfidenceLevel; facetIds: string[] } | null {
  const parts = [result.ability, result.skill].filter((f): f is NonNullable<typeof f> => Boolean(f))
  if (parts.length > 0) {
    const score = Math.round(parts.reduce((s, f) => s + f.score, 0) / parts.length)
    const confidence = parts.reduce((worst, f) => worseConfidence(worst, f.confidence), parts[0].confidence)
    return { score, source: parts.length === 2 ? 'ability+skill' : result.ability ? 'ability' : 'skill', confidence, facetIds: parts.map((f) => f.facetId) }
  }
  if (result.ease) return { score: result.ease.score, source: 'ease', confidence: result.ease.confidence, facetIds: [result.ease.facetId] }
  return null
}

function quadrantFor(ability: number, energy: number): StrengthQuadrant {
  const highAbility = ability >= MID
  const highEnergy = energy >= MID
  if (highAbility && highEnergy) return 'signature'
  if (highAbility) return 'utilitarian'
  if (highEnergy) return 'development'
  return 'lowReturn'
}

/** Reuses classifyStrengths()'s own per-domain ease/ability/skill/energy
 *  extraction rather than re-deriving it from facetScores — one source of
 *  truth for what those four axes are. */
export function classifyStrengthQuadrants(strengthResults: StrengthDomainResult[]): StrengthQuadrantMap {
  const placed: StrengthQuadrantResult[] = []
  const unplaced: { domainId: string; label: string }[] = []

  for (const result of strengthResults) {
    const abilityAxis = computeAbilityAxis(result)
    if (!abilityAxis || !result.energy) {
      unplaced.push({ domainId: result.domainId, label: result.label })
      continue
    }
    placed.push({
      domainId: result.domainId,
      label: result.label,
      quadrant: quadrantFor(abilityAxis.score, result.energy.score),
      abilityScore: abilityAxis.score,
      abilitySource: abilityAxis.source,
      energyScore: result.energy.score,
      confidence: worseConfidence(abilityAxis.confidence, result.energy.confidence),
      abilityFacetIds: abilityAxis.facetIds,
    })
  }

  return { placed, unplaced }
}

/** facetId -> quadrant, across every Ability-axis facet in every placed
 *  domain. This is the actual integration point: careerFitModel.ts's
 *  strength category always maps onto a domain's `_ability` facet id, so
 *  looking that id up here connects a scored career dimension straight
 *  back to the respondent's own quadrant for it. */
export function quadrantByFacetId(map: StrengthQuadrantMap): Record<string, StrengthQuadrant> {
  const out: Record<string, StrengthQuadrant> = {}
  for (const r of map.placed) {
    for (const facetId of r.abilityFacetIds) out[facetId] = r.quadrant
  }
  return out
}

export interface CareerStrengthAnnotation {
  dimensionId: string
  label: string
  quadrant: StrengthQuadrant
}

/**
 * The actual "strongly influence career recommendations" integration: for
 * any strength dimension a career's fit score already draws on, name which
 * quadrant it falls in for THIS respondent. A career leaning heavily on a
 * Utilitarian Skill or Low-Return Area scores exactly as high numerically
 * as one leaning on a Signature Strength — that's a real gap this closes
 * in the explanation, not the arithmetic: a high fit score built on a
 * draining-but-capable skill is a materially different bet than the same
 * score built on something that energizes, and a reader should see that
 * difference directly on the card, not have to infer it.
 */
export function annotateCareerFitStrengths(
  result: CareerFitResult,
  quadrants: Record<string, StrengthQuadrant>,
): CareerStrengthAnnotation[] {
  return result.dimensions
    .filter((d) => d.category === 'strength' && quadrants[d.facetId])
    .map((d) => ({ dimensionId: d.facetId, label: d.label, quadrant: quadrants[d.facetId] }))
}
