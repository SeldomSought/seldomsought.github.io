import type { ConfidenceLevel, DomainReport, FacetScore, Item, Response } from '../types'
import { ALL_ITEMS } from '../../content/instruments'
import { FACETS, PERSONALITY_DOMAINS } from '../../content/facets'
import { computeContributions, type Contribution } from './contributions'
import { computeRawScore, transformToScale } from './rawScore'
import { computeValidityFlags } from '../validity'

const CONFIDENCE_RANK: Record<ConfidenceLevel, number> = { Low: 0, Medium: 1, High: 2 }

/** A facet backed by exactly one answered item can hit ratio=1.0 (100% of
 *  what was "expected") and, on ratio alone, read as fully trustworthy —
 *  it isn't. High requires real independent evidence volume, not just a
 *  complete-looking fraction; anything short of that caps at Medium even
 *  at 100% coverage. */
const MIN_ANSWERED_FOR_HIGH = 2

export function confidenceForRatio(ratio: number, answeredCount: number): ConfidenceLevel {
  if (ratio >= 0.8) return answeredCount >= MIN_ANSWERED_FOR_HIGH ? 'High' : 'Medium'
  if (ratio >= 0.4) return 'Medium'
  return 'Low'
}

function downgrade(level: ConfidenceLevel): ConfidenceLevel {
  return level === 'High' ? 'Medium' : 'Low'
}

/**
 * Behavioral evidence affects confidence in the related trait conclusion:
 * a facet backed by at least one answered, genuinely behavioral (not
 * self-report) item earns a one-step confidence boost — Medium becomes
 * High. Deliberately conservative: a single behavioral answer doesn't
 * rescue a Low (mostly-unanswered) facet on its own, and it never invents
 * a facet score that isn't already backed by real answers.
 */
function upgradeForBehavioralEvidence(level: ConfidenceLevel): ConfidenceLevel {
  return level === 'Medium' ? 'High' : level
}

/** Counts, not just membership — how many answered items per facet carried evidenceStrength 'behavioral'. */
function behavioralEvidenceCountsByFacet(responses: Record<string, Response>): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const item of ALL_ITEMS) {
    if (!('evidenceStrength' in item) || item.evidenceStrength !== 'behavioral') continue
    if (!('facetId' in item)) continue
    if (!responses[item.id]) continue
    counts[item.facetId] = (counts[item.facetId] ?? 0) + 1
  }
  return counts
}

/** Every facet id a given item could ever contribute to, regardless of whether it's answered. */
function facetIdsForItem(item: Item): string[] {
  switch (item.format) {
    case 'tradeoff':
      // Deduped: a bipolar tension (optionA and optionB sharing one
      // facetId, e.g. Desire's tensions or Work Environment's) would
      // otherwise count once per option — double-counting this single
      // item as two "expected" answers for that facet and skewing the
      // confidence ratio whenever the facet also has non-tradeoff items.
      return [...new Set([item.optionA.facetId, item.optionB.facetId])]
    case 'forcedChoiceRank':
      return item.statements.map((s) => s.facetId)
    case 'ranking':
      // A ranking pool can span several facets (a values card-sort), so
      // this counts toward every facet any option could possibly land on —
      // not just item.facetId, which is only the fallback.
      return [...new Set(item.options.map((o) => o.facetId ?? item.facetId))]
    case 'evidencePrompt':
    case 'openText':
      return []
    default:
      return 'facetId' in item ? [item.facetId] : []
  }
}

function expectedItemIdsByFacet(): Record<string, string[]> {
  const map: Record<string, string[]> = {}
  for (const item of ALL_ITEMS) {
    for (const facetId of facetIdsForItem(item)) {
      ;(map[facetId] ??= []).push(item.id)
    }
  }
  return map
}

const EXPECTED_ITEM_IDS_BY_FACET = expectedItemIdsByFacet()

export function mean(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function clampPct(n: number): number {
  return Math.min(100, Math.max(0, n))
}

/**
 * 100 minus the spread between a construct's highest- and lowest-pointing
 * contributions — how much its own evidence agrees with itself, not a
 * Cronbach's-alpha-style population statistic (that needs many
 * respondents; this needs only one). With 0 or 1 contributions there's
 * nothing to disagree about, so this is defined as 100 by convention —
 * "nothing contradicted itself," not "verified consistent."
 */
export function computeInternalConsistency(points: number[]): number {
  if (points.length <= 1) return 100
  const spread = Math.max(...points) - Math.min(...points)
  return Math.round(clampPct(100 - spread))
}

/** A same-construct contradiction (reverse-item disagreement, self-report
 *  vs. behavioral gap) — as opposed to a response-STYLE flag (straightlining,
 *  fast completion, acquiescence) that also downgrades confidence but isn't
 *  itself a contradiction about what the construct's value actually is. */
function isContradictionFlagId(id: string): boolean {
  return id.startsWith('contradiction-') || id.startsWith('self-behavior-gap-')
}

export interface CompositeConstructDef {
  id: string
  label: string
  facetIds: string[]
}

/**
 * A composite construct's score is the mean of its constituent subscales
 * (facets); its confidence is the WEAKEST of them, since a composite can
 * never be more trustworthy than its shakiest subscale. Generic and
 * independently testable — PERSONALITY_DOMAINS is the one registry
 * scoreAssessment wires through it today, but any {id,label,facetIds}[]
 * registry can reuse this exact function.
 */
export function computeCompositeConstruct(
  def: CompositeConstructDef,
  facetScores: Record<string, FacetScore>,
): FacetScore | null {
  const constituents = def.facetIds
    .map((id) => facetScores[id])
    .filter((f): f is FacetScore => Boolean(f))
  if (constituents.length === 0) return null

  const worstConfidence = constituents.reduce<ConfidenceLevel>(
    (worst, f) => (CONFIDENCE_RANK[f.confidence] < CONFIDENCE_RANK[worst] ? f.confidence : worst),
    'High',
  )

  return {
    facetId: def.id,
    label: def.label,
    score: Math.round(mean(constituents.map((f) => f.score))),
    confidence: worstConfidence,
    evidenceCount: constituents.reduce((s, f) => s + f.evidenceCount, 0),
    itemsExpected: constituents.reduce((s, f) => s + f.itemsExpected, 0),
    behavioralEvidenceCount: constituents.reduce((s, f) => s + f.behavioralEvidenceCount, 0),
    internalConsistency: Math.round(mean(constituents.map((f) => f.internalConsistency))),
    contradictionCount: constituents.reduce((s, f) => s + f.contradictionCount, 0),
  }
}

/**
 * The single entry point: raw responses in, a full domain report out. Pure
 * function — no React, no storage, no DOM — nothing else in this codebase
 * computes a score outside of what this function (and the pure helpers it
 * calls) does. A UI change cannot affect scoring: this function's output
 * depends only on the plain Response records passed in, never on which
 * component produced them, how many times a value was revisited before
 * settling, or anything about how it will be rendered.
 */
export function scoreAssessment(responses: Record<string, Response>): DomainReport {
  const contributionsByFacet: Record<string, Contribution[]> = {}
  const behavioralCounts = behavioralEvidenceCountsByFacet(responses)

  for (const item of ALL_ITEMS) {
    const response = responses[item.id]
    if (!response) continue
    for (const contribution of computeContributions(item, response)) {
      ;(contributionsByFacet[contribution.facetId] ??= []).push(contribution)
    }
  }

  const facetScores: Record<string, FacetScore> = {}

  for (const facet of FACETS) {
    if (facet.group === 'validityOnly') continue
    const contributions = contributionsByFacet[facet.id]
    if (!contributions || contributions.length === 0) continue // unanswered — omitted, never faked

    const raw = computeRawScore(facet.id, contributions)
    if (!raw) continue // zero total weight — treat the same as unanswered
    const score = transformToScale(raw)

    const expectedIds = EXPECTED_ITEM_IDS_BY_FACET[facet.id] ?? []
    const answeredCount = expectedIds.filter((id) => responses[id]).length
    const ratio = expectedIds.length ? answeredCount / expectedIds.length : 1
    const baseConfidence = confidenceForRatio(ratio, answeredCount)
    const behavioralEvidenceCount = behavioralCounts[facet.id] ?? 0

    facetScores[facet.id] = {
      facetId: facet.id,
      label: facet.label,
      score,
      confidence: behavioralEvidenceCount > 0 ? upgradeForBehavioralEvidence(baseConfidence) : baseConfidence,
      evidenceCount: answeredCount,
      itemsExpected: expectedIds.length,
      behavioralEvidenceCount,
      internalConsistency: computeInternalConsistency(contributions.map((c) => c.points)),
      contradictionCount: 0, // filled in below, once validity flags are known
    }
  }

  for (const domain of PERSONALITY_DOMAINS) {
    const composite = computeCompositeConstruct(domain, facetScores)
    if (composite) facetScores[domain.id] = composite
  }

  const validityFlags = computeValidityFlags(responses, facetScores)

  for (const flag of validityFlags) {
    for (const facetId of flag.relatedFacetIds ?? []) {
      const existing = facetScores[facetId]
      if (!existing) continue
      facetScores[facetId] = {
        ...existing,
        confidence: downgrade(existing.confidence),
        contradictionCount: existing.contradictionCount + (isContradictionFlagId(flag.id) ? 1 : 0),
      }
    }
  }

  return { facetScores, validityFlags }
}
