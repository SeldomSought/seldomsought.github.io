import type { FacetScore } from '../types'
import { STRENGTH_DOMAINS } from '../../content/facets'

export type StrengthCategory =
  | 'naturalDeveloped'
  | 'naturalUnderdeveloped'
  | 'developedDraining'
  | 'interestedUnproven'
  | 'weak'

export const STRENGTH_CATEGORY_LABEL: Record<StrengthCategory, string> = {
  naturalDeveloped: 'Natural + Developed',
  naturalUnderdeveloped: 'Natural + Underdeveloped',
  developedDraining: 'Developed but Draining',
  interestedUnproven: 'Interested but Unproven',
  weak: 'Weak / Low Interest',
}

export const STRENGTH_CATEGORY_BLURB: Record<StrengthCategory, string> = {
  naturalDeveloped: 'Comes easily and the track record backs it up — a genuine, reliable strength.',
  naturalUnderdeveloped: 'Learning this came unusually fast, but there’s not much history or training behind it yet — raw, untapped talent.',
  developedDraining: 'The evidence and training are real — this person can do it — but it drains rather than energizes. Capable is not the same as sustainable.',
  interestedUnproven: 'It energizes them, but neither the aptitude nor the track record is confirmed yet — interest ahead of evidence.',
  weak: 'No strong signal on any of the four axes measured here.',
}

export interface StrengthDomainResult {
  domainId: string
  label: string
  ease?: FacetScore
  ability?: FacetScore
  skill?: FacetScore
  energy?: FacetScore
  category: StrengthCategory
  axesAnswered: number
}

const HIGH = 60
const LOW = 40

/**
 * Four independent signals per domain — ease (raw aptitude), demonstrated
 * ability (behavioral track record), skill (deliberate training), and
 * energy (energizes vs. drains) — are never collapsed into one "talent"
 * score. A missing facet (an axis nobody answered) is treated as unknown,
 * not as evidence of "low": it simply can't push any of the booleans below
 * to true, so a domain only ever gets flagged "weak" from axes that were
 * actually answered and actually came back low.
 */
export function classifyStrengths(facetScores: Record<string, FacetScore>): StrengthDomainResult[] {
  return STRENGTH_DOMAINS.map((domain) => {
    const ease = facetScores[domain.easeFacetId]
    const ability = facetScores[domain.abilityFacetId]
    const skill = facetScores[domain.skillFacetId]
    const energy = facetScores[domain.energyFacetId]

    const natural = ease !== undefined && ease.score >= HIGH
    const developed = (ability !== undefined && ability.score >= HIGH) || (skill !== undefined && skill.score >= HIGH)
    const energized = energy !== undefined && energy.score >= HIGH

    const known = [ease, ability, skill, energy].filter((f): f is FacetScore => f !== undefined)
    const allLow = known.length > 0 && known.every((f) => f.score < LOW)

    let category: StrengthCategory
    if (allLow) category = 'weak'
    // Excellent at it but it drains them — evidence of capability wins over
    // whether it also came easily; draining is the more actionable fact.
    else if (developed && !energized) category = 'developedDraining'
    // Learns fast, but no real track record or training yet.
    else if (natural && !developed) category = 'naturalUnderdeveloped'
    // Real ability/training, and it energizes — a confirmed strength,
    // whether or not it also happened to come unusually easily.
    else if (developed) category = 'naturalDeveloped'
    // Energizes them, but neither fast-learning nor a track record is there yet.
    else if (energized) category = 'interestedUnproven'
    else category = 'weak'

    return {
      domainId: domain.id,
      label: domain.label,
      ease,
      ability,
      skill,
      energy,
      category,
      axesAnswered: known.length,
    }
  }).filter((r) => r.axesAnswered > 0) // never show a domain nobody answered anything for
}
