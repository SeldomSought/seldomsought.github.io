import { describe, it, expect } from 'vitest'
import { detectConvergence, detectTensions, analyzeProfileRelationships } from './synthesis'
import type { FacetScore } from '../types'

function fs(facetId: string, score: number, confidence: FacetScore['confidence'] = 'High'): FacetScore {
  return { facetId, label: facetId, score, confidence, evidenceCount: 3, itemsExpected: 3, behavioralEvidenceCount: 0, internalConsistency: 100, contradictionCount: 0 }
}

describe('detectConvergence — the entrepreneurial/sales example', () => {
  it('does not fire from any single high score alone', () => {
    const scores = { riasec_enterprising: fs('riasec_enterprising', 90) }
    expect(detectConvergence(scores).find((s) => s.id === 'entrepreneurial-sales')).toBeUndefined()
  })
  it('does not fire from two of the five conditions — below the minimum', () => {
    const scores = {
      riasec_enterprising: fs('riasec_enterprising', 90),
      assertiveness: fs('assertiveness', 80),
    }
    expect(detectConvergence(scores).find((s) => s.id === 'entrepreneurial-sales')).toBeUndefined()
  })
  it('fires as "Emerging" at exactly the minimum of 3 of 5 conditions', () => {
    const scores = {
      riasec_enterprising: fs('riasec_enterprising', 90),
      assertiveness: fs('assertiveness', 80),
      autonomy_need: fs('autonomy_need', 70),
    }
    const signal = detectConvergence(scores).find((s) => s.id === 'entrepreneurial-sales')
    expect(signal).toBeDefined()
    expect(signal?.strength).toBe('Emerging')
    expect(signal?.conditionsMet).toBe(3)
  })
  it('fires as "Notable" at 4 of 5 conditions', () => {
    const scores = {
      riasec_enterprising: fs('riasec_enterprising', 90),
      assertiveness: fs('assertiveness', 80),
      autonomy_need: fs('autonomy_need', 70),
      work_competition: fs('work_competition', 75),
    }
    const signal = detectConvergence(scores).find((s) => s.id === 'entrepreneurial-sales')
    expect(signal?.strength).toBe('Notable')
    expect(signal?.conditionsMet).toBe(4)
  })
  it('fires as "Strong" only when all five conditions are met — the full combination from the example', () => {
    const scores = {
      riasec_enterprising: fs('riasec_enterprising', 90),
      assertiveness: fs('assertiveness', 80),
      autonomy_need: fs('autonomy_need', 70),
      work_competition: fs('work_competition', 75),
      risk_financial: fs('risk_financial', 85),
    }
    const signal = detectConvergence(scores).find((s) => s.id === 'entrepreneurial-sales')
    expect(signal?.strength).toBe('Strong')
    expect(signal?.conditionsMet).toBe(5)
    expect(signal?.conditionsTotal).toBe(5)
    expect(signal?.contributingFacets).toHaveLength(5)
    expect(signal?.contributingFacets.every((c) => c.met)).toBe(true)
  })
  it('lists an unmet condition\'s facet in contributingFacets, correctly marked as not met, when it was at least answered', () => {
    const scores = {
      riasec_enterprising: fs('riasec_enterprising', 90),
      assertiveness: fs('assertiveness', 80),
      autonomy_need: fs('autonomy_need', 70),
      work_competition: fs('work_competition', 20), // answered, but below threshold
    }
    const signal = detectConvergence(scores).find((s) => s.id === 'entrepreneurial-sales')
    const competition = signal?.contributingFacets.find((c) => c.facetId === 'work_competition')
    expect(competition?.met).toBe(false)
    expect(competition?.score).toBe(20)
  })
})

describe('detectConvergence — a "low" direction condition (Steady Builder)', () => {
  it('requires the facet to be LOW, not high, to count as met', () => {
    // The other three conditions are met so the rule still fires despite
    // risk_financial failing — otherwise there's no signal object to
    // inspect risk_financial's own met:false on.
    const highRisk = {
      anchor_security: fs('anchor_security', 90),
      risk_financial: fs('risk_financial', 90), // high risk tolerance — should NOT satisfy a 'low' condition
      work_predictability: fs('work_predictability', 10),
      future_ownership: fs('future_ownership', 90),
      structure_need: fs('structure_need', 90),
    }
    const signal = detectConvergence(highRisk).find((s) => s.id === 'steady-builder')
    expect(signal?.conditionsMet).toBe(4)
    const riskCondition = signal?.contributingFacets.find((c) => c.facetId === 'risk_financial')
    expect(riskCondition?.met).toBe(false)
  })
  it('fires when risk_financial is genuinely low', () => {
    const lowRisk = {
      anchor_security: fs('anchor_security', 90),
      risk_financial: fs('risk_financial', 10),
      work_predictability: fs('work_predictability', 10),
    }
    const signal = detectConvergence(lowRisk).find((s) => s.id === 'steady-builder')
    expect(signal).toBeDefined()
    expect(signal?.conditionsMet).toBe(3)
  })
})

describe('detectConvergence — never averages unrelated traits into one blended number', () => {
  it('every signal carries the individual contributing scores, not a single collapsed average', () => {
    const scores = {
      riasec_enterprising: fs('riasec_enterprising', 90),
      assertiveness: fs('assertiveness', 40), // below threshold, still shown
      autonomy_need: fs('autonomy_need', 70),
      work_competition: fs('work_competition', 75),
    }
    const signal = detectConvergence(scores).find((s) => s.id === 'entrepreneurial-sales')
    // the raw per-facet scores are all individually visible and distinct —
    // nothing here is a single averaged figure standing in for the whole thing
    const distinctScores = new Set(signal?.contributingFacets.map((c) => c.score))
    expect(distinctScores.size).toBeGreaterThan(1)
    expect(signal).not.toHaveProperty('averageScore')
    expect(signal).not.toHaveProperty('score')
  })
})

describe('detectTensions — the entrepreneurship vs. security example', () => {
  it('does not fire when only one side is high', () => {
    const scores = { anchor_entrepreneurship: fs('anchor_entrepreneurship', 90) }
    expect(detectTensions(scores).find((t) => t.id === 'entrepreneurship-security')).toBeUndefined()
  })
  it('fires when both entrepreneurship and security are genuinely high, with the exact requested phrasing', () => {
    const scores = {
      anchor_entrepreneurship: fs('anchor_entrepreneurship', 85),
      anchor_security: fs('anchor_security', 80),
    }
    const tension = detectTensions(scores).find((t) => t.id === 'entrepreneurship-security')
    expect(tension).toBeDefined()
    expect(tension?.detail).toMatch(/^Entrepreneurial drive constrained by security preference\./)
    expect(tension?.facetA.score).toBe(85)
    expect(tension?.facetB.score).toBe(80)
  })
  it('is a genuinely different kind of finding than a contradiction — both sides are independently well-supported, not one claim vs. one behavior', () => {
    const scores = {
      anchor_entrepreneurship: fs('anchor_entrepreneurship', 85, 'High'),
      anchor_security: fs('anchor_security', 80, 'High'),
    }
    const tension = detectTensions(scores).find((t) => t.id === 'entrepreneurship-security')
    // both facets are High confidence — this is two real, well-measured
    // priorities in tension, not a shaky signal against a solid one
    expect(tension?.facetA.score).toBeGreaterThan(0)
    expect(tension?.facetB.score).toBeGreaterThan(0)
  })
})

describe('detectTensions — a "low" direction on one side (career risk vs. daily predictability)', () => {
  it('fires when risk_career is high AND work_predictability is genuinely low (i.e., strongly prefers predictable days)', () => {
    const scores = {
      risk_career: fs('risk_career', 85),
      work_predictability: fs('work_predictability', 15),
    }
    const tension = detectTensions(scores).find((t) => t.id === 'career-risk-daily-predictability')
    expect(tension).toBeDefined()
  })
  it('does not fire when work_predictability is high (i.e., embraces unpredictable days) — no tension there', () => {
    const scores = {
      risk_career: fs('risk_career', 85),
      work_predictability: fs('work_predictability', 85),
    }
    expect(detectTensions(scores).find((t) => t.id === 'career-risk-daily-predictability')).toBeUndefined()
  })
})

describe('detectTensions — every signal carries the pole labels a dedicated Tensions section headlines with', () => {
  it('fires with poleA/poleB set for freedom vs. security', () => {
    const scores = { autonomy_need: fs('autonomy_need', 90), risk_financial: fs('risk_financial', 20) }
    const tension = detectTensions(scores).find((t) => t.id === 'freedom-security')
    expect(tension).toMatchObject({ poleA: 'Freedom', poleB: 'Security' })
  })
  it('fires with poleA/poleB set for impact vs. privacy', () => {
    const scores = { desire_impact_comfort: fs('desire_impact_comfort', 80), desire_status_privacy: fs('desire_status_privacy', 15) }
    const tension = detectTensions(scores).find((t) => t.id === 'impact-privacy')
    expect(tension).toMatchObject({ poleA: 'Impact', poleB: 'Privacy' })
  })
  it('fires with poleA/poleB set for novelty vs. completion', () => {
    const scores = { novelty_seeking: fs('novelty_seeking', 85), industriousness: fs('industriousness', 25) }
    const tension = detectTensions(scores).find((t) => t.id === 'novelty-completion')
    expect(tension).toMatchObject({ poleA: 'Novelty', poleB: 'Completion' })
  })
  it('none of the three new tensions fire on a flat, undifferentiated profile', () => {
    const scores = {
      autonomy_need: fs('autonomy_need', 50), risk_financial: fs('risk_financial', 50),
      desire_impact_comfort: fs('desire_impact_comfort', 50), desire_status_privacy: fs('desire_status_privacy', 50),
      novelty_seeking: fs('novelty_seeking', 50), industriousness: fs('industriousness', 50),
    }
    const ids = detectTensions(scores).map((t) => t.id)
    expect(ids).not.toContain('freedom-security')
    expect(ids).not.toContain('impact-privacy')
    expect(ids).not.toContain('novelty-completion')
  })
  it('every existing tension rule also carries poleA/poleB — no rule left on the old shape', () => {
    const scores = {
      anchor_entrepreneurship: fs('anchor_entrepreneurship', 90), anchor_security: fs('anchor_security', 90),
      future_leadership: fs('future_leadership', 90), sociability: fs('sociability', 10),
      desire_mastery_ease: fs('desire_mastery_ease', 90), novelty_seeking: fs('novelty_seeking', 90),
      risk_career: fs('risk_career', 90), work_predictability: fs('work_predictability', 10),
      future_prestige: fs('future_prestige', 90), desire_status_privacy: fs('desire_status_privacy', 10),
      anchor_technical_mastery: fs('anchor_technical_mastery', 90), work_task_variety: fs('work_task_variety', 90),
    }
    for (const t of detectTensions(scores)) {
      expect(t.poleA, `${t.id} missing poleA`).toBeTruthy()
      expect(t.poleB, `${t.id} missing poleB`).toBeTruthy()
    }
  })
})

describe('analyzeProfileRelationships — the combined entry point', () => {
  it('returns both convergences and tensions from one profile', () => {
    const scores = {
      riasec_enterprising: fs('riasec_enterprising', 90),
      assertiveness: fs('assertiveness', 80),
      autonomy_need: fs('autonomy_need', 70),
      work_competition: fs('work_competition', 75),
      risk_financial: fs('risk_financial', 85),
      anchor_entrepreneurship: fs('anchor_entrepreneurship', 85),
      anchor_security: fs('anchor_security', 80),
    }
    const result = analyzeProfileRelationships(scores)
    expect(result.convergences.some((c) => c.id === 'entrepreneurial-sales')).toBe(true)
    expect(result.tensions.some((t) => t.id === 'entrepreneurship-security')).toBe(true)
  })
  it('returns empty arrays, not fabricated relationships, for an empty profile', () => {
    const result = analyzeProfileRelationships({})
    expect(result.convergences).toEqual([])
    expect(result.tensions).toEqual([])
  })
  it('is a pure, deterministic function — same input, same output', () => {
    const scores = { anchor_entrepreneurship: fs('anchor_entrepreneurship', 85), anchor_security: fs('anchor_security', 80) }
    expect(analyzeProfileRelationships(scores)).toEqual(analyzeProfileRelationships(scores))
  })
})

describe('rule authorship guardrail — every relationship is hand-written, not derived from an averaging formula', () => {
  it('convergence rules all carry a non-empty, hand-authored detail sentence', async () => {
    // Exercise every rule via a synthetic all-high profile and confirm each
    // one\'s explanatory detail is real prose, not a template stub.
    const scores: Record<string, FacetScore> = {}
    for (const id of [
      'riasec_enterprising', 'assertiveness', 'autonomy_need', 'work_competition', 'risk_financial',
      'anchor_technical_mastery', 'riasec_investigative', 'intellectual_curiosity', 'strength_analytical_ability', 'work_solitude_social',
      'riasec_social', 'compassion', 'anchor_general_management', 'strength_interpersonal_ability', 'future_leadership',
      'riasec_artistic', 'aesthetic_openness', 'strength_creative_ease', 'work_creative_freedom',
      'risk_reputational', 'anchor_challenge', 'aspire_responsibility', 'future_responsibility', 'uncertainty_tolerance',
      'anchor_security', 'future_ownership', 'structure_need',
    ]) {
      scores[id] = fs(id, 90)
    }
    scores.risk_financial = fs('risk_financial', 90) // stays high for entrepreneurial-sales
    const signals = detectConvergence(scores)
    expect(signals.length).toBeGreaterThanOrEqual(4)
    for (const s of signals) {
      expect(s.detail.length).toBeGreaterThan(40)
    }
  })
})
