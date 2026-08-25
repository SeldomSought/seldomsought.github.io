import { describe, it, expect } from 'vitest'
import { computeConfidenceFromEvidence, computeConstructConfidence, type EvidenceBuckets } from './constructConfidence'
import { scoreAssessment } from './index'
import type { FacetScore, Response } from '../types'

function facet(overrides: Partial<FacetScore> = {}): FacetScore {
  return { facetId: 'f', label: 'Autonomy Need', score: 84, confidence: 'High', evidenceCount: 1, itemsExpected: 1, behavioralEvidenceCount: 0, internalConsistency: 100, contradictionCount: 0, ...overrides }
}

const agreeing = (n: number, value = 90): number[] => Array(n).fill(value)

function resp(value: Response['value']): Response {
  return { itemId: 'x', value, firstAnsweredAt: 1, lastAnsweredAt: 1, responseTimeMs: 2000, revisitCount: 0 }
}

describe('computeConfidenceFromEvidence — the worked AUTONOMY example', () => {
  it('11 direct + 5 forced-choice + 3 behavioral, all agreeing, reads Very High', () => {
    const buckets: EvidenceBuckets = { direct: agreeing(11), forcedChoice: agreeing(5), behavioral: agreeing(3) }
    const result = computeConfidenceFromEvidence(facet({ evidenceCount: 19, itemsExpected: 19 }), buckets)
    expect(result.directItems).toBe(11)
    expect(result.forcedChoiceItems).toBe(5)
    expect(result.behavioralItems).toBe(3)
    expect(result.level).toBe('Very High')
    expect(result.crossMethodAgreement).not.toBeNull()
    expect(result.crossMethodAgreement).toBeGreaterThanOrEqual(80)
    expect(result.reason).toMatch(/^Broad evidence across self-report, forced-choice, and behavioral/)
    expect(result.reason).toMatch(/high cross-method agreement/)
  })
})

describe('computeConfidenceFromEvidence — the worked CREATIVE ORIENTATION example', () => {
  it('strong self-report + limited (one-item) behavioral evidence reads Moderate, with that exact reasoning', () => {
    const buckets: EvidenceBuckets = { direct: agreeing(8), forcedChoice: [], behavioral: [90] } // one behavioral item = "limited"
    const result = computeConfidenceFromEvidence(facet({ score: 72, evidenceCount: 8, itemsExpected: 8 }), buckets)
    expect(result.level).toBe('Moderate')
    expect(result.reason).toBe('Strong self-report, limited behavioral evidence.')
  })
})

describe('computeConfidenceFromEvidence — confidence is independent of score magnitude', () => {
  it('identical evidence profiles produce identical confidence regardless of the score value', () => {
    const buckets: EvidenceBuckets = { direct: agreeing(11), forcedChoice: agreeing(5), behavioral: agreeing(3) }
    const low = computeConfidenceFromEvidence(facet({ score: 4, evidenceCount: 19, itemsExpected: 19 }), buckets)
    const high = computeConfidenceFromEvidence(facet({ score: 96, evidenceCount: 19, itemsExpected: 19 }), buckets)
    expect(low.level).toBe(high.level)
    expect(low.reason).toBe(high.reason)
    expect(low.crossMethodAgreement).toBe(high.crossMethodAgreement)
  })
  it('a thin, single-method facet stays Low confidence whether its score is near 0 or near 100', () => {
    const buckets: EvidenceBuckets = { direct: [10], forcedChoice: [], behavioral: [] }
    const nearZero = computeConfidenceFromEvidence(facet({ score: 3, evidenceCount: 1, itemsExpected: 3 }), buckets)
    const nearMax = computeConfidenceFromEvidence(facet({ score: 98, evidenceCount: 1, itemsExpected: 3 }), buckets)
    expect(nearZero.level).toBe(nearMax.level)
  })
  it('the computation never reads facet.score at all — sweeping the score from 0 to 100 changes nothing but the score field itself', () => {
    const buckets: EvidenceBuckets = { direct: agreeing(4), forcedChoice: agreeing(2), behavioral: [] }
    const results = Array.from({ length: 11 }, (_, i) => computeConfidenceFromEvidence(facet({ score: i * 10, evidenceCount: 6, itemsExpected: 6 }), buckets))
    const levels = new Set(results.map((r) => r.level))
    const reasons = new Set(results.map((r) => r.reason))
    expect(levels.size).toBe(1)
    expect(reasons.size).toBe(1)
  })
})

describe('computeConfidenceFromEvidence — cross-method agreement specifically', () => {
  it('is null when fewer than two methods are well-represented — "not enough evidence to assess," not a fabricated number', () => {
    const oneMethod = computeConfidenceFromEvidence(facet(), { direct: agreeing(6), forcedChoice: [], behavioral: [] })
    expect(oneMethod.crossMethodAgreement).toBeNull()
  })
  it('a single item in a second method is not enough to make agreement assessable either', () => {
    const thin = computeConfidenceFromEvidence(facet(), { direct: agreeing(6), forcedChoice: [90], behavioral: [] })
    expect(thin.crossMethodAgreement).toBeNull()
  })
  it('drops when two well-represented methods disagree sharply', () => {
    const disagreeing: EvidenceBuckets = { direct: agreeing(4, 90), forcedChoice: agreeing(4, 10), behavioral: [] }
    const result = computeConfidenceFromEvidence(facet(), disagreeing)
    expect(result.crossMethodAgreement).not.toBeNull()
    expect(result.crossMethodAgreement).toBeLessThan(50)
    expect(result.reason).toMatch(/don.t fully agree/)
  })
  it('is computed from METHOD AVERAGES, not raw item spread — a noisy-but-converging method still agrees with another', () => {
    // direct items individually vary (70, 90, 110→clamped irrelevant here,
    // just 70/90) but their average (80) is close to forcedChoice's single value (85)
    const converging: EvidenceBuckets = { direct: [70, 90], forcedChoice: agreeing(3, 85), behavioral: [] }
    const result = computeConfidenceFromEvidence(facet(), converging)
    expect(result.crossMethodAgreement).toBeGreaterThanOrEqual(90)
  })
})

describe('computeConfidenceFromEvidence — contradictions penalize confidence directly', () => {
  it('a flagged contradiction lowers the level relative to an otherwise-identical, contradiction-free facet', () => {
    const buckets: EvidenceBuckets = { direct: agreeing(11), forcedChoice: agreeing(5), behavioral: agreeing(3) }
    const clean = computeConfidenceFromEvidence(facet({ contradictionCount: 0 }), buckets)
    const flagged = computeConfidenceFromEvidence(facet({ contradictionCount: 1 }), buckets)
    const rank: Record<string, number> = { 'Very Low': 0, Low: 1, Moderate: 2, High: 3, 'Very High': 4 }
    expect(rank[flagged.level]).toBeLessThan(rank[clean.level])
    expect(flagged.reason).toMatch(/1 flagged contradiction/)
  })
})

describe('computeConfidenceFromEvidence — the full five-tier scale is reachable', () => {
  it('a completely unanswered facet reads Very Low', () => {
    const empty = computeConfidenceFromEvidence(facet({ evidenceCount: 0, itemsExpected: 5 }), { direct: [], forcedChoice: [], behavioral: [] })
    expect(empty.level).toBe('Very Low')
  })
  it('a single, mostly-incomplete item reads Very Low, not a middling tier — sparse evidence deserves the floor', () => {
    const result = computeConfidenceFromEvidence(facet({ evidenceCount: 1, itemsExpected: 5 }), { direct: [50], forcedChoice: [], behavioral: [] })
    expect(result.level).toBe('Very Low')
  })
  it('reasonable partial coverage from one method, with nothing else to earn points, reads Low', () => {
    // ratio 0.6 (3 of 5 expected) earns 1 volume point; a single
    // well-represented method still earns 0 diversity points on its own —
    // exactly 1 total point is the Low tier, distinct from Very Low above.
    const result = computeConfidenceFromEvidence(facet({ evidenceCount: 3, itemsExpected: 5 }), { direct: agreeing(3), forcedChoice: [], behavioral: [] })
    expect(result.level).toBe('Low')
  })
})

describe('computeConstructConfidence — wired to real content end to end', () => {
  it('produces a confidence entry for every scored facet, using real items', () => {
    const responses: Record<string, Response> = {
      'tmp-ic-1': resp(5), 'tmp-ic-2': resp(1), 'tmp-ic-3': resp(5),
    }
    const { facetScores } = scoreAssessment(responses)
    const confidences = computeConstructConfidence(facetScores, responses)
    expect(confidences.intellectual_curiosity).toBeDefined()
    expect(confidences.intellectual_curiosity.directItems).toBe(3)
    expect(confidences.intellectual_curiosity.forcedChoiceItems).toBe(0)
    expect(confidences.intellectual_curiosity.behavioralItems).toBe(0)
  })
  it('classifies a real behavioralHistory item as behavioral evidence, not direct', () => {
    const responses: Record<string, Response> = { 'str-an-ability': resp(5) }
    const { facetScores } = scoreAssessment(responses)
    const confidences = computeConstructConfidence(facetScores, responses)
    expect(confidences.strength_analytical_ability.behavioralItems).toBe(1)
    expect(confidences.strength_analytical_ability.directItems).toBe(0)
  })
  it('classifies a real tradeoff item as forced-choice evidence', () => {
    const responses: Record<string, Response> = { 'anc-tr-tm-gm': resp('A') }
    const { facetScores } = scoreAssessment(responses)
    const confidences = computeConstructConfidence(facetScores, responses)
    expect(confidences.anchor_general_management.forcedChoiceItems).toBe(1)
  })
  it('is deterministic', () => {
    const responses: Record<string, Response> = { 'tmp-ic-1': resp(5), 'anc-tr-tm-gm': resp('A') }
    const { facetScores } = scoreAssessment(responses)
    expect(computeConstructConfidence(facetScores, responses)).toEqual(computeConstructConfidence(facetScores, responses))
  })
})
