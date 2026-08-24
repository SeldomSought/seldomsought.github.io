import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  scoreAssessment, computeCompositeConstruct, computeInternalConsistency, confidenceForRatio,
} from './index'
import { PERSONALITY_DOMAINS } from '../../content/facets'
import type { Response, FacetScore } from '../types'

const HERE = dirname(fileURLToPath(import.meta.url))

function resp(value: Response['value'], overrides: Partial<Response> = {}): Response {
  return { itemId: 'x', value, firstAnsweredAt: 1, lastAnsweredAt: 1, responseTimeMs: 2000, revisitCount: 0, ...overrides }
}

describe('scoreAssessment — positive and reverse scoring, end to end', () => {
  it('scoring a forward-keyed item high scores the facet high', () => {
    const { facetScores } = scoreAssessment({ 'tmp-ic-1': resp(5) })
    expect(facetScores.intellectual_curiosity.score).toBe(100)
  })
  it('agreeing with a reverse-keyed item scores the facet LOW, not high', () => {
    const { facetScores } = scoreAssessment({ 'tmp-ic-2': resp(5) }) // tmp-ic-2 is reverse-scored
    expect(facetScores.intellectual_curiosity.score).toBe(0)
  })
  it('blends a forward and a reverse item on the same facet into one coherent score', () => {
    // Both "agree" (5) — forward says high curiosity, reverse (agreeing with
    // the tedium statement) says low curiosity — a genuinely mixed signal
    // should land near the middle, not at either extreme.
    const { facetScores } = scoreAssessment({ 'tmp-ic-1': resp(5), 'tmp-ic-2': resp(5) })
    expect(facetScores.intellectual_curiosity.score).toBeGreaterThan(30)
    expect(facetScores.intellectual_curiosity.score).toBeLessThan(70)
  })
})

describe('scoreAssessment — forced-choice contribution (a non-bipolar tradeoff)', () => {
  it('choosing a side scores that side\'s facet high and the other low', () => {
    const { facetScores } = scoreAssessment({ 'anc-tr-tm-gm': resp('A') }) // A = general management
    expect(facetScores.anchor_general_management.score).toBe(100)
    expect(facetScores.anchor_technical_mastery.score).toBe(0)
  })
})

describe('scoreAssessment — rank contribution and weighted items (a full 8-way ranking)', () => {
  it('the top-ranked facet scores 100 and the bottom-ranked facet scores 0', () => {
    const order = [
      'anchor_technical_mastery', 'anchor_general_management', 'anchor_autonomy', 'anchor_security',
      'anchor_entrepreneurship', 'anchor_service_mission', 'anchor_challenge', 'anchor_lifestyle_integration',
    ]
    const { facetScores } = scoreAssessment({ 'anc-rank-all': resp(order) })
    expect(facetScores.anchor_technical_mastery.score).toBe(100)
    expect(facetScores.anchor_lifestyle_integration.score).toBe(0)
  })
})

describe('scoreAssessment — scenario contribution', () => {
  it('the chosen scenario choice\'s weight becomes the facet\'s score', () => {
    const { facetScores } = scoreAssessment({ 'wk-scn-pace': resp({ choiceId: 'a', confidence: 4 }) })
    expect(facetScores.work_pace.score).toBe(90)
  })
})

describe('scoreAssessment — behavioral evidence weighting', () => {
  it('counts an answered behavioral item toward behavioralEvidenceCount', () => {
    const { facetScores } = scoreAssessment({ 'str-an-ability': resp(5) })
    expect(facetScores.strength_analytical_ability.behavioralEvidenceCount).toBe(1)
  })
  it('upgrades Medium confidence to High when behavioral evidence backs the facet', () => {
    // risk_financial has 4 expected items; answering 2 (one of them the
    // behavioral one) gives a 0.5 ratio — Medium on its own — so this
    // actually exercises the upgrade path, unlike answering everything or
    // answering just the one-item facets above (those hit High/Low on
    // ratio alone, with nothing left for the upgrade to do).
    const withBehavioral = scoreAssessment({
      'risk-fin-bh': resp(5),
      'risk-fin-scn-commission': resp({ choiceId: 'a', confidence: 3 }),
    }).facetScores.risk_financial
    expect(withBehavioral.behavioralEvidenceCount).toBe(1)
    expect(withBehavioral.confidence).toBe('High')

    // Same ratio (0.5), same score inputs in spirit, but neither answered
    // item is behavioral — should stay at the Medium base, un-upgraded.
    const withoutBehavioral = scoreAssessment({
      'risk-fin-scn-savings': resp({ choiceId: 'a', confidence: 3 }),
      'risk-fin-scn-commission': resp({ choiceId: 'a', confidence: 3 }),
    }).facetScores.risk_financial
    expect(withoutBehavioral.behavioralEvidenceCount).toBe(0)
    expect(withoutBehavioral.confidence).toBe('Medium')
  })
  it('a facet with zero behavioral answers has behavioralEvidenceCount 0', () => {
    const { facetScores } = scoreAssessment({ 'tmp-ic-1': resp(5) })
    expect(facetScores.intellectual_curiosity.behavioralEvidenceCount).toBe(0)
  })
})

describe('scoreAssessment — confidence weighting from answered ratio', () => {
  it('confidenceForRatio matches the documented thresholds, given enough answered items for High', () => {
    expect(confidenceForRatio(1, 2)).toBe('High')
    expect(confidenceForRatio(0.8, 2)).toBe('High')
    expect(confidenceForRatio(0.79, 2)).toBe('Medium')
    expect(confidenceForRatio(0.4, 2)).toBe('Medium')
    expect(confidenceForRatio(0.39, 2)).toBe('Low')
    expect(confidenceForRatio(0, 0)).toBe('Low')
  })
  it('a 100%-complete ratio from a single answered item caps at Medium, never High', () => {
    // ratio=1.0 alone used to be sufficient for High — a facet backed by
    // exactly one item could look fully trustworthy on coverage alone
    expect(confidenceForRatio(1, 1)).toBe('Medium')
  })
  it('two or more answered items is enough evidence volume for High, at full ratio', () => {
    expect(confidenceForRatio(1, 2)).toBe('High')
    expect(confidenceForRatio(1, 5)).toBe('High')
  })
  it('a real single-item facet in this content reaches only Medium, not High', () => {
    // des-tr-freedom is the sole item backing desire_freedom_certainty
    const { facetScores } = scoreAssessment({ 'des-tr-freedom': resp('A') })
    expect(facetScores.desire_freedom_certainty.confidence).toBe('Medium')
  })
  it('answering only one of a multi-item facet\'s items yields a lower confidence than answering all of them', () => {
    const partial = scoreAssessment({ 'tmp-ic-1': resp(5) }).facetScores.intellectual_curiosity
    const full = scoreAssessment({ 'tmp-ic-1': resp(5), 'tmp-ic-2': resp(1), 'tmp-ic-3': resp(5) }).facetScores.intellectual_curiosity
    const rank: Record<string, number> = { Low: 0, Medium: 1, High: 2 }
    expect(rank[full.confidence]).toBeGreaterThanOrEqual(rank[partial.confidence])
  })
})

describe('scoreAssessment — subscales rolling up into a composite construct', () => {
  it('the registry this whole describe block exercises still matches what facets.ts actually defines for Openness', () => {
    const openness = PERSONALITY_DOMAINS.find((d) => d.id === 'openness')
    expect(openness?.facetIds.sort()).toEqual(['aesthetic_openness', 'intellectual_curiosity', 'novelty_seeking'].sort())
  })
  it('a fully-answered domain (Openness) is the mean of its three facets', () => {
    const responses = {
      'tmp-ic-1': resp(5), 'tmp-ic-2': resp(1), 'tmp-ic-3': resp(5), // intellectual_curiosity — strong
      'tmp-as-1': resp(1), 'tmp-as-2': resp(5), 'tmp-as-3': resp(1), // aesthetic_openness — weak
      'tmp-nov-1': resp(3), 'tmp-nov-2': resp(3), // novelty_seeking — middling
    }
    const { facetScores } = scoreAssessment(responses)
    const domain = facetScores.openness
    expect(domain).toBeDefined()
    const expectedMean = Math.round((facetScores.intellectual_curiosity.score + facetScores.aesthetic_openness.score + facetScores.novelty_seeking.score) / 3)
    expect(domain.score).toBe(expectedMean)
  })
  it('a composite\'s confidence is the WEAKEST of its constituent facets, never higher', () => {
    // Only fully answer one of the three constituent facets — the other
    // two are unanswered and simply absent from facetScores, so the
    // composite should still form from whatever IS present.
    const { facetScores } = scoreAssessment({ 'tmp-ic-1': resp(5), 'tmp-ic-2': resp(1), 'tmp-ic-3': resp(5) })
    expect(facetScores.openness).toBeDefined()
    expect(facetScores.openness.confidence).toBe(facetScores.intellectual_curiosity.confidence)
  })
  it('omits the composite entirely when none of its constituent facets were answered', () => {
    const { facetScores } = scoreAssessment({})
    expect(facetScores.openness).toBeUndefined()
  })
})

describe('computeCompositeConstruct — as a standalone, independently testable pure function', () => {
  function fs(score: number, confidence: FacetScore['confidence'], overrides: Partial<FacetScore> = {}): FacetScore {
    return { facetId: 'x', label: 'X', score, confidence, evidenceCount: 1, itemsExpected: 1, behavioralEvidenceCount: 0, internalConsistency: 100, contradictionCount: 0, ...overrides }
  }

  it('returns null when none of the named facetIds are present in facetScores', () => {
    expect(computeCompositeConstruct({ id: 'c', label: 'C', facetIds: ['a', 'b'] }, {})).toBeNull()
  })
  it('averages the scores of whichever constituents ARE present', () => {
    const result = computeCompositeConstruct({ id: 'c', label: 'C', facetIds: ['a', 'b'] }, { a: fs(80, 'High'), b: fs(40, 'High') })
    expect(result?.score).toBe(60)
  })
  it('confidence is the weakest constituent, not an average or the first one', () => {
    const result = computeCompositeConstruct(
      { id: 'c', label: 'C', facetIds: ['a', 'b', 'z'] },
      { a: fs(80, 'High'), b: fs(40, 'Low'), z: fs(60, 'Medium') },
    )
    expect(result?.confidence).toBe('Low')
  })
  it('sums evidenceCount, behavioralEvidenceCount, and contradictionCount across constituents', () => {
    const result = computeCompositeConstruct(
      { id: 'c', label: 'C', facetIds: ['a', 'b'] },
      { a: fs(80, 'High', { evidenceCount: 3, behavioralEvidenceCount: 1, contradictionCount: 1 }), b: fs(40, 'High', { evidenceCount: 2, behavioralEvidenceCount: 0, contradictionCount: 2 }) },
    )
    expect(result?.evidenceCount).toBe(5)
    expect(result?.behavioralEvidenceCount).toBe(1)
    expect(result?.contradictionCount).toBe(3)
  })
})

describe('internal consistency', () => {
  it('is defined as 100 with zero contributing points — nothing to disagree about', () => {
    expect(computeInternalConsistency([])).toBe(100)
  })
  it('is defined as 100 with exactly one contributing point', () => {
    expect(computeInternalConsistency([73])).toBe(100)
  })
  it('is 100 when multiple contributions agree exactly', () => {
    expect(computeInternalConsistency([80, 80, 80])).toBe(100)
  })
  it('drops as contributions spread further apart', () => {
    expect(computeInternalConsistency([100, 0])).toBe(0)
    expect(computeInternalConsistency([80, 60])).toBe(80)
  })
  it('is driven by the widest spread, not the average distance between points', () => {
    expect(computeInternalConsistency([50, 50, 50, 100])).toBe(50)
  })
  it('flows through scoreAssessment: a facet with two flatly contradicting reverse/forward answers has low internal consistency', () => {
    // Agreeing with BOTH the forward and reverse statement is the
    // clearest possible self-contradiction on one construct.
    const { facetScores } = scoreAssessment({ 'tmp-ic-1': resp(5), 'tmp-ic-2': resp(5) })
    expect(facetScores.intellectual_curiosity.internalConsistency).toBeLessThan(50)
  })
})

describe('contradictionCount', () => {
  it('is zero for a facet with no flagged contradictions', () => {
    const { facetScores } = scoreAssessment({ 'tmp-ic-1': resp(5) })
    expect(facetScores.intellectual_curiosity.contradictionCount).toBe(0)
  })
  it('increments when a forward/reverse contradiction is actually flagged for that facet', () => {
    const { facetScores, validityFlags } = scoreAssessment({ 'tmp-ic-1': resp(5), 'tmp-ic-2': resp(5) })
    expect(validityFlags.some((f) => f.id === 'contradiction-intellectual_curiosity')).toBe(true)
    expect(facetScores.intellectual_curiosity.contradictionCount).toBe(1)
  })
  it('does NOT count a straightlining/response-style flag as a contradiction, even though it also downgrades confidence', () => {
    // 10 forward-keyed items across 5 different facets, every one answered
    // with the same value — enough to trip validity.ts's straightlining
    // check (relatedFacetIds: every facet in the report). If
    // contradictionCount conflated "confidence downgraded" with
    // "contradicted," this would wrongly inflate every facet's count.
    const responses: Record<string, Response> = {}
    for (const id of ['tmp-ic-1', 'tmp-ic-3', 'tmp-as-1', 'tmp-as-3', 'tmp-org-1', 'tmp-org-3', 'tmp-dil-1', 'tmp-dil-3', 'tmp-soc-1', 'tmp-soc-3']) {
      responses[id] = resp(3)
    }
    const { facetScores, validityFlags } = scoreAssessment(responses)
    expect(validityFlags.some((f) => f.id === 'straightlining')).toBe(true)
    for (const facetId of ['intellectual_curiosity', 'aesthetic_openness', 'orderliness', 'industriousness', 'sociability']) {
      expect(facetScores[facetId].confidence).toBe('Low') // downgraded, as expected
      expect(facetScores[facetId].contradictionCount).toBe(0) // but not counted as a contradiction
    }
  })
})

describe('metadata contract — every scored facet exposes the full set', () => {
  it('has score, confidence, evidenceCount, behavioralEvidenceCount, internalConsistency, and contradictionCount', () => {
    const { facetScores } = scoreAssessment({ 'tmp-ic-1': resp(5) })
    const f = facetScores.intellectual_curiosity
    expect(f).toMatchObject({
      facetId: 'intellectual_curiosity',
      label: expect.any(String),
      score: expect.any(Number),
      confidence: expect.stringMatching(/^(High|Medium|Low)$/),
      evidenceCount: expect.any(Number),
      itemsExpected: expect.any(Number),
      behavioralEvidenceCount: expect.any(Number),
      internalConsistency: expect.any(Number),
      contradictionCount: expect.any(Number),
    })
  })
  it('never fabricates a score for an unanswered facet — it is simply absent', () => {
    const { facetScores } = scoreAssessment({})
    expect(Object.keys(facetScores)).toHaveLength(0)
  })
})

describe('determinism — a UI change must never affect scoring', () => {
  it('the same responses produce byte-identical output on repeated calls', () => {
    const responses = { 'tmp-ic-1': resp(4), 'anc-tr-tm-gm': resp('B'), 'wk-scn-pace': resp({ choiceId: 'c', confidence: 2 }) }
    const first = scoreAssessment(responses)
    const second = scoreAssessment(responses)
    expect(second).toEqual(first)
  })
  it('is independent of the incidental key order of the responses object', () => {
    const forward = { 'tmp-ic-1': resp(4), 'tmp-as-1': resp(2), 'anc-tr-tm-gm': resp('A') }
    const reversed = { 'anc-tr-tm-gm': resp('A'), 'tmp-as-1': resp(2), 'tmp-ic-1': resp(4) }
    expect(scoreAssessment(reversed)).toEqual(scoreAssessment(forward))
  })
  it('score depends only on the final answer value — never on how many times it was revisited, how long it took, or when', () => {
    const quick = { 'tmp-ic-1': resp(5, { revisitCount: 0, responseTimeMs: 400, firstAnsweredAt: 1000, lastAnsweredAt: 1000 }) }
    const agonized = { 'tmp-ic-1': resp(5, { revisitCount: 9, responseTimeMs: 45000, firstAnsweredAt: 1000, lastAnsweredAt: 999999 }) }
    const quickResult = scoreAssessment(quick)
    const agonizedResult = scoreAssessment(agonized)
    expect(quickResult.facetScores.intellectual_curiosity.score).toBe(agonizedResult.facetScores.intellectual_curiosity.score)
    expect(quickResult.facetScores.intellectual_curiosity.confidence).toBe(agonizedResult.facetScores.intellectual_curiosity.confidence)
  })
})

describe('language guardrail — never calls the 0-100 score a population percentile', () => {
  it('FacetScore\'s own doc comments say so explicitly', () => {
    const typesSrc = readFileSync(join(HERE, '../types.ts'), 'utf-8')
    expect(typesSrc).toMatch(/never a claimed population percentile/i)
  })
})

describe('architectural guardrail — the scoring engine has zero UI dependency', () => {
  const files = ['index.ts', 'contributions.ts', 'rawScore.ts']
  it.each(files)('%s imports nothing from react or any component', (file) => {
    const src = readFileSync(join(HERE, file), 'utf-8')
    expect(src).not.toMatch(/from ['"]react/i)
    expect(src).not.toMatch(/from ['"]\.\.\/\.\.\/components/)
  })
})
