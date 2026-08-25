import { describe, it, expect } from 'vitest'
import { computeValidityFlags } from './validity'
import { ALL_ITEMS } from '../content/instruments'
import type { FacetScore, Response } from './types'

function respond(itemId: string, value: Response['value'], responseTimeMs = 5000): Response {
  return { itemId, value, firstAnsweredAt: 0, lastAnsweredAt: 0, responseTimeMs, revisitCount: 0 }
}

function fs(facetId: string, score = 50, confidence: FacetScore['confidence'] = 'High'): FacetScore {
  return { facetId, label: facetId, score, confidence, evidenceCount: 3, itemsExpected: 3, behavioralEvidenceCount: 0, internalConsistency: 100, contradictionCount: 0 }
}

const LIKERT5_IDS = ALL_ITEMS.filter((i) => i.format === 'likert5').map((i) => i.id)

function flagIds(responses: Record<string, Response>, facetScores: Record<string, FacetScore> = {}): string[] {
  return computeValidityFlags(responses, facetScores).map((f) => f.id)
}

describe('computeValidityFlags — straightlining', () => {
  it('flags when 12+ rating-scale answers all land on the same point', () => {
    const responses = Object.fromEntries(LIKERT5_IDS.slice(0, 12).map((id) => [id, respond(id, 3)]))
    expect(flagIds(responses)).toContain('straightlining')
  })

  it('does not flag when responses vary normally', () => {
    const values = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2]
    const responses = Object.fromEntries(LIKERT5_IDS.slice(0, 12).map((id, i) => [id, respond(id, values[i])]))
    expect(flagIds(responses)).not.toContain('straightlining')
  })

  it('does not evaluate straightlining below the 10-response minimum', () => {
    const responses = Object.fromEntries(LIKERT5_IDS.slice(0, 5).map((id) => [id, respond(id, 3)]))
    expect(flagIds(responses)).not.toContain('straightlining')
  })
})

describe('computeValidityFlags — extreme response style', () => {
  it('flags when over 75% of answers land at the scale extremes', () => {
    const values = [1, 5, 1, 5, 1, 5, 1, 5, 1, 5, 3, 3]
    const responses = Object.fromEntries(LIKERT5_IDS.slice(0, 12).map((id, i) => [id, respond(id, values[i])]))
    expect(flagIds(responses)).toContain('extreme-response')
  })

  it('does not flag when most answers land in the middle of the scale', () => {
    const values = [2, 3, 3, 4, 2, 3, 3, 4, 2, 3, 3, 4]
    const responses = Object.fromEntries(LIKERT5_IDS.slice(0, 12).map((id, i) => [id, respond(id, values[i])]))
    expect(flagIds(responses)).not.toContain('extreme-response')
  })
})

describe('computeValidityFlags — acquiescence', () => {
  it('flags when over 80% of answers are 4 or 5', () => {
    const values = [4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5]
    const responses = Object.fromEntries(LIKERT5_IDS.slice(0, 12).map((id, i) => [id, respond(id, values[i])]))
    expect(flagIds(responses)).toContain('acquiescence')
  })

  it('does not flag when agreement is roughly balanced', () => {
    const values = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2]
    const responses = Object.fromEntries(LIKERT5_IDS.slice(0, 12).map((id, i) => [id, respond(id, values[i])]))
    expect(flagIds(responses)).not.toContain('acquiescence')
  })
})

describe('computeValidityFlags — fast completion', () => {
  const values = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5]

  it('flags when 15+ rating-scale answers average under 1200ms', () => {
    const responses = Object.fromEntries(LIKERT5_IDS.slice(0, 15).map((id, i) => [id, respond(id, values[i], 500)]))
    expect(flagIds(responses)).toContain('fast-completion')
  })

  it('does not flag the same answers at a normal pace', () => {
    const responses = Object.fromEntries(LIKERT5_IDS.slice(0, 15).map((id, i) => [id, respond(id, values[i], 5000)]))
    expect(flagIds(responses)).not.toContain('fast-completion')
  })

  it('does not evaluate fast-completion below the 15-response minimum', () => {
    const responses = Object.fromEntries(LIKERT5_IDS.slice(0, 12).map((id, i) => [id, respond(id, values[i], 200)]))
    expect(flagIds(responses)).not.toContain('fast-completion')
  })
})

describe('computeValidityFlags — forward/reverse item contradiction', () => {
  // tmp-ic-1 (forward) and tmp-ic-2 (reverse) both measure intellectual_curiosity
  it('flags agreeing with both a statement and its near-opposite', () => {
    const responses = { 'tmp-ic-1': respond('tmp-ic-1', 5), 'tmp-ic-2': respond('tmp-ic-2', 5) }
    expect(flagIds(responses)).toContain('contradiction-intellectual_curiosity')
  })

  it('does not flag a consistent forward/reverse pair', () => {
    const responses = { 'tmp-ic-1': respond('tmp-ic-1', 5), 'tmp-ic-2': respond('tmp-ic-2', 1) }
    expect(flagIds(responses)).not.toContain('contradiction-intellectual_curiosity')
  })

  it('does not flag when only one side of the pair was answered', () => {
    const responses = { 'tmp-ic-1': respond('tmp-ic-1', 5) }
    expect(flagIds(responses)).not.toContain('contradiction-intellectual_curiosity')
  })
})

describe('computeValidityFlags — self-report vs. behavioral-evidence gap', () => {
  // str-an-ease (self-report, likert5) contrasts with str-an-ability (behavioralHistory)
  it('flags a large gap between self-report and behavioral evidence', () => {
    const responses = { 'str-an-ease': respond('str-an-ease', 1), 'str-an-ability': respond('str-an-ability', 5) }
    expect(flagIds(responses)).toContain('self-behavior-gap-strength_analytical_ability')
  })

  it('does not flag when self-report and behavior roughly agree', () => {
    const responses = { 'str-an-ease': respond('str-an-ease', 3), 'str-an-ability': respond('str-an-ability', 3) }
    expect(flagIds(responses)).not.toContain('self-behavior-gap-strength_analytical_ability')
  })
})

describe('computeValidityFlags — respondent-flagged uncertainty', () => {
  it('flags when the respondent rated their own confidence at 2 or below', () => {
    const responses = { 'tmp-conf-1': respond('tmp-conf-1', 2) }
    expect(flagIds(responses)).toContain('respondent-flagged-uncertainty')
  })

  it('does not flag when the respondent rated their own confidence highly', () => {
    const responses = { 'tmp-conf-1': respond('tmp-conf-1', 5) }
    expect(flagIds(responses)).not.toContain('respondent-flagged-uncertainty')
  })

  it('limits relatedFacetIds to personality-group facets actually present in facetScores', () => {
    const facetScores = { intellectual_curiosity: fs('intellectual_curiosity'), self_direction: fs('self_direction') }
    const flags = computeValidityFlags({ 'tmp-conf-1': respond('tmp-conf-1', 1) }, facetScores)
    const flag = flags.find((f) => f.id === 'respondent-flagged-uncertainty')
    expect(flag?.relatedFacetIds).toContain('intellectual_curiosity')
    expect(flag?.relatedFacetIds).not.toContain('self_direction')
  })
})

describe('computeValidityFlags — a clean, unremarkable response set', () => {
  it('produces zero flags for a small set of varied, unhurried, non-contradictory answers', () => {
    const values = [1, 2, 3, 4, 5, 2, 3, 4]
    const responses = Object.fromEntries(LIKERT5_IDS.slice(0, 8).map((id, i) => [id, respond(id, values[i], 4000)]))
    expect(computeValidityFlags(responses, {})).toEqual([])
  })
})
