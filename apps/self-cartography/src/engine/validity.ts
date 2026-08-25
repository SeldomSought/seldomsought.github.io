import type { FacetScore, Response, ValidityFlag } from './types'
import { ALL_ITEMS, ITEMS_BY_ID } from '../content/instruments'
import { FACETS, PERSONALITY_DOMAINS } from '../content/facets'
import { likertToPoints } from './scoring/contributions'

const PERSONALITY_FACET_IDS = [
  ...FACETS.filter((f) => f.group === 'personality').map((f) => f.id),
  ...PERSONALITY_DOMAINS.map((d) => d.id),
]

const STATEMENT_FORMATS = new Set(['likert5', 'likertFrequency', 'confidence', 'behavioralHistory'])

function mean(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function stdev(nums: number[]): number {
  const m = mean(nums)
  return Math.sqrt(mean(nums.map((n) => (n - m) ** 2)))
}

/**
 * Quiet, background bias/quality checks. None of these are shown mid-
 * assessment — they surface only as confidence dampening and as factual
 * notes in the "Internal Contradictions" section of the results.
 */
export function computeValidityFlags(
  responses: Record<string, Response>,
  facetScores: Record<string, FacetScore>,
): ValidityFlag[] {
  const flags: ValidityFlag[] = []
  const allFacetIds = Object.keys(facetScores)

  // ── straightlining / careless responding ──
  const statementResponses = ALL_ITEMS.filter(
    (item) => STATEMENT_FORMATS.has(item.format) && responses[item.id],
  ).map((item) => (responses[item.id].value as number))

  if (statementResponses.length >= 10) {
    const sd = stdev(statementResponses)
    if (sd < 0.4) {
      flags.push({
        id: 'straightlining',
        severity: 'flag',
        label: 'Possible straightlining',
        detail: 'Nearly every rating-scale answer used the same point on the scale. That flattens the signal these questions are designed to pick up, so confidence has been lowered across the board.',
        relatedFacetIds: allFacetIds,
      })
    }

    const extremeShare = statementResponses.filter((v) => v === 1 || v === 5).length / statementResponses.length
    if (extremeShare > 0.75) {
      flags.push({
        id: 'extreme-response',
        severity: 'note',
        label: 'Extreme response style',
        detail: 'Most rating-scale answers landed at the far ends of the scale rather than in between. This can be a genuine trait (strong, decisive self-views) or a response style — worth knowing either way.',
      })
    }

    const acquiescentShare = statementResponses.filter((v) => v >= 4).length / statementResponses.length
    if (acquiescentShare > 0.8) {
      flags.push({
        id: 'acquiescence',
        severity: 'note',
        label: 'Acquiescence tendency',
        detail: 'There was a strong lean toward agreeing across rating-scale items, including on statements that would usually pull in different directions from each other.',
      })
    }

    const avgResponseTime = mean(
      ALL_ITEMS.filter((item) => STATEMENT_FORMATS.has(item.format) && responses[item.id]).map(
        (item) => responses[item.id].responseTimeMs,
      ),
    )
    if (avgResponseTime < 1200 && statementResponses.length >= 15) {
      flags.push({
        id: 'fast-completion',
        severity: 'flag',
        label: 'Unusually fast completion',
        detail: 'Rating-scale items were answered faster, on average, than most people can meaningfully read and consider them. Confidence has been lowered across the board.',
        relatedFacetIds: allFacetIds,
      })
    }
  }

  // ── contradictory answers: forward vs. reverse-keyed item on the same facet ──
  const byFacet: Record<string, typeof ALL_ITEMS> = {}
  for (const item of ALL_ITEMS) {
    if (item.format !== 'likert5') continue
    ;(byFacet[item.facetId] ??= []).push(item)
  }
  for (const [facetId, items] of Object.entries(byFacet)) {
    const forward = items.find((i) => i.format === 'likert5' && !i.reverseScored && responses[i.id])
    const reverse = items.find((i) => i.format === 'likert5' && i.reverseScored && responses[i.id])
    if (!forward || !reverse) continue
    const forwardVal = responses[forward.id].value as number
    const reverseVal = responses[reverse.id].value as number
    if (forwardVal >= 4 && reverseVal >= 4) {
      flags.push({
        id: `contradiction-${facetId}`,
        severity: 'flag',
        label: `Internal contradiction — ${facetScores[facetId]?.label ?? facetId}`,
        detail: `You agreed with both "${forward.format === 'likert5' ? forward.prompt : ''}" and its near-opposite, "${reverse.format === 'likert5' ? reverse.prompt : ''}" This facet's score reflects the average, but treat it as lower-confidence.`,
        relatedFacetIds: [facetId],
      })
    }
  }

  // ── self-report vs. behavioral-evidence gap ──
  for (const item of ALL_ITEMS) {
    if (item.format !== 'behavioralHistory' || !item.contrastsWithItemId) continue
    const behaviorResponse = responses[item.id]
    const selfItem = ITEMS_BY_ID[item.contrastsWithItemId]
    const selfResponse = selfItem ? responses[selfItem.id] : undefined
    if (!behaviorResponse || !selfResponse || selfItem?.format !== 'likert5') continue
    const behaviorPoints = likertToPoints(behaviorResponse.value as number)
    const selfPoints = likertToPoints(selfResponse.value as number, selfItem.reverseScored)
    if (Math.abs(behaviorPoints - selfPoints) > 40) {
      flags.push({
        id: `self-behavior-gap-${item.facetId}`,
        severity: 'flag',
        label: `Self-report vs. behavior gap — ${facetScores[item.facetId]?.label ?? item.facetId}`,
        detail: 'How you described yourself here and what your recent behavior actually shows point in different directions. That gap is itself useful information, not just noise.',
        relatedFacetIds: [item.facetId],
      })
    }
  }

  // ── respondent-flagged uncertainty about their own answers ──
  const confidenceItem = ALL_ITEMS.find((i) => i.format === 'confidence')
  if (confidenceItem && responses[confidenceItem.id]) {
    const value = responses[confidenceItem.id].value as number
    if (value <= 2) {
      flags.push({
        id: 'respondent-flagged-uncertainty',
        severity: 'note',
        label: 'Respondent-flagged uncertainty',
        detail: 'You indicated you weren’t fully confident the personality section reflects who you actually are, as opposed to who you’d like to be. That self-awareness is noted, and confidence has been lowered for those facets.',
        relatedFacetIds: PERSONALITY_FACET_IDS.filter((id) => allFacetIds.includes(id)),
      })
    }
  }

  return flags
}
