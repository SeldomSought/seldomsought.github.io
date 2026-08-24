import type { FacetScore, Item, Response } from '../types'
import { ALL_ITEMS } from '../../content/instruments'
import { computeContributions } from './contributions'

/**
 * Construct-level confidence — central to preventing pseudo-precision.
 * Two facets can land on the exact same 0-100 score and deserve very
 * different trust: eleven direct items, five tradeoff choices, three
 * behavioral indicators, and strong cross-method agreement is a
 * fundamentally different claim than one strongly-answered self-report
 * scale with almost nothing else behind it. This module is what tells
 * those two apart — and it is built to NEVER read `facet.score`. Every
 * input here is about how much and what kind of evidence exists, never
 * about what the evidence says.
 */

export type EvidenceMethod = 'direct' | 'forcedChoice' | 'behavioral'

const METHOD_LABEL: Record<EvidenceMethod, string> = {
  direct: 'self-report',
  forcedChoice: 'forced-choice',
  behavioral: 'behavioral',
}

/** A method needs at least this many answered items to count as
 *  meaningfully represented — one lone item is a data point, not a method. */
const WELL_REPRESENTED_MIN = 2

function classifyMethod(item: Item): EvidenceMethod {
  if ('evidenceStrength' in item && item.evidenceStrength === 'behavioral') return 'behavioral'
  switch (item.format) {
    case 'behavioralHistory':
      return 'behavioral'
    case 'tradeoff':
    case 'forcedChoiceRank':
    case 'ranking':
    case 'scenario':
      return 'forcedChoice'
    default:
      return 'direct'
  }
}

export interface EvidenceBuckets {
  direct: number[]
  forcedChoice: number[]
  behavioral: number[]
}

function gatherEvidenceByFacet(responses: Record<string, Response>): Record<string, EvidenceBuckets> {
  const out: Record<string, EvidenceBuckets> = {}
  for (const item of ALL_ITEMS) {
    const response = responses[item.id]
    if (!response) continue
    const method = classifyMethod(item)
    for (const contribution of computeContributions(item, response)) {
      const bucket = (out[contribution.facetId] ??= { direct: [], forcedChoice: [], behavioral: [] })
      bucket[method].push(contribution.points)
    }
  }
  return out
}

function mean(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function wellRepresented(points: number[]): boolean {
  return points.length >= WELL_REPRESENTED_MIN
}

export type ConstructConfidenceLevel = 'Very High' | 'High' | 'Moderate' | 'Low' | 'Very Low'

export interface ConstructConfidence {
  facetId: string
  label: string
  /** Present for reference only — this module's own reasoning never reads it. */
  score: number
  level: ConstructConfidenceLevel
  directItems: number
  forcedChoiceItems: number
  behavioralItems: number
  /** 0-100 agreement between methods' own averages, or null when fewer
   *  than two methods are well-represented enough to compare at all. */
  crossMethodAgreement: number | null
  contradictionCount: number
  /** Plain-language explanation — always present, not just for low confidence. */
  reason: string
}

function describeMethodList(methods: EvidenceMethod[]): string {
  const labels = methods.map((m) => METHOD_LABEL[m])
  if (labels.length === 1) return labels[0]
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
}

function buildReason(ctx: {
  wellRepMethods: EvidenceMethod[]
  buckets: EvidenceBuckets
  crossMethodAgreement: number | null
  contradictionCount: number
  ratio: number
}): string {
  const parts: string[] = []
  const hasBehavioral = ctx.buckets.behavioral.length > 0
  const behavioralThin = hasBehavioral && !wellRepresented(ctx.buckets.behavioral)
  const hasForcedChoice = ctx.buckets.forcedChoice.length > 0

  if (ctx.wellRepMethods.length >= 3) {
    parts.push('broad evidence across self-report, forced-choice, and behavioral methods')
  } else if (ctx.wellRepMethods.length === 2) {
    parts.push(`solid evidence from ${describeMethodList(ctx.wellRepMethods)}`)
  } else if (ctx.buckets.direct.length > 0) {
    parts.push('strong self-report')
  } else if (hasForcedChoice) {
    parts.push('forced-choice evidence only')
  } else if (hasBehavioral) {
    parts.push('behavioral evidence only')
  }

  if (ctx.crossMethodAgreement !== null) {
    parts.push(
      ctx.crossMethodAgreement >= 80 ? 'high cross-method agreement'
        : ctx.crossMethodAgreement >= 50 ? 'moderate cross-method agreement'
          : 'methods that don’t fully agree with each other',
    )
  }

  if (behavioralThin) {
    parts.push('limited behavioral evidence')
  } else if (!hasBehavioral && ctx.wellRepMethods.length < 2) {
    parts.push('no behavioral evidence yet')
  } else if (!hasForcedChoice && ctx.wellRepMethods.length < 2 && hasBehavioral) {
    parts.push('no forced-choice cross-check')
  }

  if (ctx.contradictionCount > 0) {
    parts.push(`${ctx.contradictionCount} flagged contradiction${ctx.contradictionCount > 1 ? 's' : ''}`)
  }

  if (ctx.ratio < 0.5 && parts.length < 2) {
    parts.push('only partial coverage so far')
  }

  if (parts.length === 0) return 'Limited evidence overall.'
  const joined = parts.join(', ')
  return `${joined.charAt(0).toUpperCase()}${joined.slice(1)}.`
}

/**
 * The core computation as a standalone, independently testable pure
 * function — takes a facet's evidence buckets directly (points per method,
 * already direction-adjusted 0-100 by computeContributions) rather than
 * requiring a full pass over real content. computeConstructConfidence
 * below is just this, wired to ALL_ITEMS/responses for every scored facet.
 */
export function computeConfidenceFromEvidence(facet: FacetScore, buckets: EvidenceBuckets): ConstructConfidence {
  const methods: EvidenceMethod[] = ['direct', 'forcedChoice', 'behavioral']
  const wellRepMethods = methods.filter((m) => wellRepresented(buckets[m]))

  const ratio = facet.itemsExpected > 0 ? facet.evidenceCount / facet.itemsExpected : (facet.evidenceCount > 0 ? 1 : 0)
  const volumePoints = ratio >= 0.8 ? 2 : ratio >= 0.5 ? 1 : 0

  const diversityPoints = wellRepMethods.length >= 3 ? 2 : wellRepMethods.length === 2 ? 1 : 0

  let crossMethodAgreement: number | null = null
  let agreementPoints = 0
  if (wellRepMethods.length >= 2) {
    const methodAverages = wellRepMethods.map((m) => mean(buckets[m]))
    const spread = Math.max(...methodAverages) - Math.min(...methodAverages)
    crossMethodAgreement = Math.round(Math.max(0, 100 - spread))
    agreementPoints = crossMethodAgreement >= 80 ? 2 : crossMethodAgreement >= 50 ? 1 : 0
  }

  const behavioralBonus = wellRepresented(buckets.behavioral) ? 1 : 0
  const contradictionPenalty = facet.contradictionCount * 2

  const totalPoints = volumePoints + diversityPoints + agreementPoints + behavioralBonus - contradictionPenalty

  const level: ConstructConfidenceLevel =
    totalPoints >= 6 ? 'Very High'
      : totalPoints >= 4 ? 'High'
        : totalPoints >= 2 ? 'Moderate'
          : totalPoints >= 1 ? 'Low'
            : 'Very Low'

  return {
    facetId: facet.facetId,
    label: facet.label,
    score: facet.score,
    level,
    directItems: buckets.direct.length,
    forcedChoiceItems: buckets.forcedChoice.length,
    behavioralItems: buckets.behavioral.length,
    crossMethodAgreement,
    contradictionCount: facet.contradictionCount,
    reason: buildReason({ wellRepMethods, buckets, crossMethodAgreement, contradictionCount: facet.contradictionCount, ratio }),
  }
}

/**
 * The entry point: one ConstructConfidence per scored facet, built purely
 * from how many items of each method answered it, how well those methods
 * agree, and how many contradictions were flagged against it — never from
 * the facet's own score. Two facets scoring identically can, and often
 * should, come back with different confidence levels; two facets with
 * wildly different scores but identical evidence profiles always come
 * back with the same confidence level.
 */
export function computeConstructConfidence(
  facetScores: Record<string, FacetScore>,
  responses: Record<string, Response>,
): Record<string, ConstructConfidence> {
  const evidenceByFacet = gatherEvidenceByFacet(responses)
  const out: Record<string, ConstructConfidence> = {}
  for (const facet of Object.values(facetScores)) {
    const buckets = evidenceByFacet[facet.facetId] ?? { direct: [], forcedChoice: [], behavioral: [] }
    out[facet.facetId] = computeConfidenceFromEvidence(facet, buckets)
  }
  return out
}
