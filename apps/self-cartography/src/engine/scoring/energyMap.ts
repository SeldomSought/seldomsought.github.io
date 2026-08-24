import type { ConfidenceLevel, FacetScore } from '../types'
import type { EnergyActivityDefinition } from '../../content/copy/energyMap'
import { ENERGY_ACTIVITIES } from '../../content/copy/energyMap'

/**
 * ENERGY MAP — the engine half. Answers "what kinds of work will I still
 * tolerate after the novelty wears off," by reading the one facet that
 * actually measures sustained energize-vs-drain for each activity (see
 * content/copy/energyMap.ts) and sorting every activity into exactly one
 * of three buckets. No convergence gating here, unlike most of this app's
 * other pattern-detection engines — every activity gets classified,
 * because a map with entries silently missing would answer the question
 * worse than one that's honest about thin data via `unscored` instead.
 */

export type EnergyMapCategory = 'energizes' | 'neutral' | 'drains'

export interface EnergyActivityResult {
  id: string
  label: string
  category: EnergyMapCategory
  /** 0-100, oriented so higher always means "more energizing" — inverted facets are already flipped here. */
  score: number
  facetId: string
  facetLabel: string
  confidence: ConfidenceLevel
  /** Other activities in this map reading off the exact same underlying
   *  facet — this instrument measures six energy domains, not sixteen
   *  independent ones, and this is where that's made explicit rather than
   *  implied away. */
  sharesSignalWith: string[]
}

export interface EnergyMapResult {
  energizes: EnergyActivityResult[]
  neutral: EnergyActivityResult[]
  drains: EnergyActivityResult[]
  /** Activities whose underlying facet hasn't been scored yet — never
   *  silently dropped, never guessed at. */
  unscored: { id: string; label: string }[]
}

const ENERGIZE_THRESHOLD = 60
const DRAIN_THRESHOLD = 40

function categorize(score: number): EnergyMapCategory {
  if (score >= ENERGIZE_THRESHOLD) return 'energizes'
  if (score <= DRAIN_THRESHOLD) return 'drains'
  return 'neutral'
}

/** `activities` mirrors matchCareers/evaluatePoorFits/detectUnconventionalPaths
 *  /identifyCoreDrivers — data, not a hardcoded reference — so this stays
 *  testable against a synthetic activity list without touching real content. */
export function buildEnergyMap(
  facetScores: Record<string, FacetScore>,
  activities: EnergyActivityDefinition[] = ENERGY_ACTIVITIES,
): EnergyMapResult {
  const labelsByFacet = new Map<string, string[]>()
  for (const a of activities) {
    labelsByFacet.set(a.facetId, [...(labelsByFacet.get(a.facetId) ?? []), a.label])
  }

  const energizes: EnergyActivityResult[] = []
  const neutral: EnergyActivityResult[] = []
  const drains: EnergyActivityResult[] = []
  const unscored: { id: string; label: string }[] = []

  for (const a of activities) {
    const facet = facetScores[a.facetId]
    if (!facet) {
      unscored.push({ id: a.id, label: a.label })
      continue
    }
    const score = a.invert ? 100 - facet.score : facet.score
    const result: EnergyActivityResult = {
      id: a.id,
      label: a.label,
      category: categorize(score),
      score,
      facetId: a.facetId,
      facetLabel: facet.label,
      confidence: facet.confidence,
      sharesSignalWith: (labelsByFacet.get(a.facetId) ?? []).filter((l) => l !== a.label),
    }
    if (result.category === 'energizes') energizes.push(result)
    else if (result.category === 'drains') drains.push(result)
    else neutral.push(result)
  }

  return {
    energizes: energizes.sort((a, b) => b.score - a.score),
    neutral: neutral.sort((a, b) => b.score - a.score),
    drains: drains.sort((a, b) => a.score - b.score), // worst (most draining) first
    unscored,
  }
}

/** One deterministic sentence answering the map's own question directly —
 *  never a summary of the whole map, just the two ends of it. */
export function summarizeEnergyMap(map: EnergyMapResult): string | null {
  const top = map.energizes[0]
  const bottom = map.drains[0]
  if (!top && !bottom) return null
  if (top && bottom) {
    return `After the novelty wears off, ${top.label.toLowerCase()} is the kind of work you're likeliest to still want — ${bottom.label.toLowerCase()} is the kind you're likeliest to start avoiding.`
  }
  if (top) return `After the novelty wears off, ${top.label.toLowerCase()} is the kind of work you're likeliest to still want.`
  return `After the novelty wears off, ${bottom!.label.toLowerCase()} is the kind of work you're likeliest to start avoiding.`
}
