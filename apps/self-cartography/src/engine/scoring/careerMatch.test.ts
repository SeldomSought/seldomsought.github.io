import { describe, it, expect } from 'vitest'
import { computeCareerFit, matchCareers } from './careerMatch'
import { deriveFitCategories } from './careerFitModel'
import { OCCUPATIONS } from '../../content/careers/occupationData'
import type { Career } from '../../content/careers/occupationData'
import type { FacetScore } from '../types'

/**
 * These tests exercise computeCareerFit/matchCareers — the OUR FIT MODEL
 * half of the pipeline — through synthetic OBJECTIVE Career fixtures. They
 * deliberately don't re-prove the objective->category mapping rules
 * (deriveFitCategories itself is covered directly in careerFitModel.test.ts);
 * they instead pick objective fields that are known, via that mapping, to
 * produce a specific single- or few-dimension category, so the arithmetic
 * here (averaging, weighting, penalties, headline, ranking) stays isolated
 * and readable.
 */

function fs(facetId: string, score: number): FacetScore {
  return { facetId, label: facetId, score, confidence: 'High', evidenceCount: 3, itemsExpected: 3, behavioralEvidenceCount: 0, internalConsistency: 100, contradictionCount: 0 }
}

function makeCareer(overrides: Partial<Career> = {}): Career {
  return {
    id: 'test', title: 'Test Career', description: 'A synthetic occupation for exercising the fit model directly.', careerFamily: 'Test',
    riasec: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 },
    workActivities: [], workContext: [], skills: [], knowledge: [], abilities: [],
    education: 'bachelors',
    independence: 50, socialOrientation: 50, leadership: 50, risk: 50, structure: 50, incomePotential: 50,
    source: { source: 'hand-authored-placeholder' },
    ...overrides,
  }
}

describe('computeCareerFit — category compatibility', () => {
  it('a category with one dimension scores 100 compatibility when the user matches exactly', () => {
    // "social" derives a single dimension (sociability) straight from socialOrientation.
    const career = makeCareer({ socialOrientation: 70 })
    const result = computeCareerFit(career, { sociability: fs('sociability', 70) })
    expect(result.categories.find((c) => c.category === 'social')?.compatibility).toBe(100)
  })
  it('a category averages compatibility across multiple dimensions, not just the first', () => {
    // "risk" derives two dimensions (uncertainty_tolerance, risk_career), both desired = career.risk.
    const career = makeCareer({ risk: 50 })
    // uncertainty_tolerance: diff 0 -> alignment 100; risk_career: diff 40 -> alignment 60. mean = 80.
    const result = computeCareerFit(career, { uncertainty_tolerance: fs('uncertainty_tolerance', 50), risk_career: fs('risk_career', 10) })
    expect(result.categories.find((c) => c.category === 'risk')?.compatibility).toBe(80)
  })
  it('omits a category entirely when none of its dimensions were scored — never fabricated', () => {
    const career = makeCareer({ socialOrientation: 70, risk: 80 })
    const result = computeCareerFit(career, { sociability: fs('sociability', 70) })
    expect(result.categories.map((c) => c.category)).toEqual(['social'])
    expect(result.categories.find((c) => c.category === 'risk')).toBeUndefined()
  })
  it('returns a zero-fit, category-less result for a career with nothing scored at all', () => {
    const result = computeCareerFit(makeCareer(), {})
    expect(result.fitScore).toBe(0)
    expect(result.categories).toEqual([])
    expect(result.penalties).toEqual([])
  })
})

describe('computeCareerFit — weighted compatibility across categories', () => {
  it('a heavier-weighted category pulls the overall compatibility toward its own value more than a lighter one', () => {
    // interest (base weight 3, +1 extremity boost since enterprising=95 is far from 50) vs.
    // social (base weight 1, no boost since socialOrientation stays at the neutral default 50).
    const career = makeCareer({ riasec: { realistic: 50, investigative: 50, artistic: 50, social: 50, enterprising: 95, conventional: 50 } })
    const scores = {
      riasec_realistic: fs('riasec_realistic', 50), riasec_investigative: fs('riasec_investigative', 50),
      riasec_artistic: fs('riasec_artistic', 50), riasec_social: fs('riasec_social', 50),
      riasec_enterprising: fs('riasec_enterprising', 95), riasec_conventional: fs('riasec_conventional', 50),
      sociability: fs('sociability', 0), // career wants 50 -> diff 50 -> alignment 50, a weak category
    }
    const result = computeCareerFit(career, scores)
    const interest = result.categories.find((c) => c.category === 'interest')
    const social = result.categories.find((c) => c.category === 'social')
    expect(interest?.compatibility).toBe(100)
    expect(social?.compatibility).toBe(50)
    expect(interest!.weight).toBeGreaterThan(social!.weight)
    // unweighted average would be 75; the heavier interest category should pull well past that
    expect(result.weightedCompatibility).toBeGreaterThan(80)
  })
})

describe('computeCareerFit — the worked example: excellent interest fit, severe risk mismatch', () => {
  const RIASEC = { realistic: 20, investigative: 20, artistic: 20, social: 20, enterprising: 85, conventional: 20 }
  function scoredRiasec(overrides: Partial<Record<string, number>> = {}) {
    return {
      riasec_realistic: fs('riasec_realistic', overrides.riasec_realistic ?? RIASEC.realistic),
      riasec_investigative: fs('riasec_investigative', overrides.riasec_investigative ?? RIASEC.investigative),
      riasec_artistic: fs('riasec_artistic', overrides.riasec_artistic ?? RIASEC.artistic),
      riasec_social: fs('riasec_social', overrides.riasec_social ?? RIASEC.social),
      riasec_enterprising: fs('riasec_enterprising', overrides.riasec_enterprising ?? RIASEC.enterprising),
      riasec_conventional: fs('riasec_conventional', overrides.riasec_conventional ?? RIASEC.conventional),
    }
  }

  it('penalizes and explicitly surfaces a severe dealbreaker gap even alongside a strong, unrelated category', () => {
    const career = makeCareer({ riasec: RIASEC, risk: 80, independence: 85 }) // risk >=75 and independence >=85 both trip their dealbreaker flags
    const scores = {
      ...scoredRiasec(), // excellent interest fit — an exact match, unambiguously the strongest category
      uncertainty_tolerance: fs('uncertainty_tolerance', 15), // severe mismatch: wants 80, scores 15 (gap 65)
      risk_career: fs('risk_career', 80), // the career's OTHER risk dimension matches exactly — only one of the two is actually severe
      autonomy_need: fs('autonomy_need', 60), // present, but clearly weaker than the interest match, and short of "severe"
    }
    const result = computeCareerFit(career, scores)

    expect(result.categories.find((c) => c.category === 'interest')?.compatibility).toBe(100)
    expect(result.penalties).toHaveLength(1)
    expect(result.penalties[0].facetId).toBe('uncertainty_tolerance')
    expect(result.penalties[0].points).toBeGreaterThan(0)

    // the subtraction is visible, not hidden inside one blended number
    expect(result.fitScore).toBe(Math.max(0, result.weightedCompatibility - result.penaltyTotal))
    expect(result.fitScore).toBeLessThan(result.weightedCompatibility)

    // and it's named explicitly, in almost the requested phrasing
    expect(result.headline).toMatch(/^Excellent interest fit, but severe mismatch on uncertainty tolerance\.$/)
  })

  it('does NOT penalize a dealbreaker gap that falls short of "severe"', () => {
    const career = makeCareer({ riasec: RIASEC, risk: 80, independence: 85 })
    const scores = {
      ...scoredRiasec({ riasec_enterprising: 90 }),
      uncertainty_tolerance: fs('uncertainty_tolerance', 50), // gap 30 — real, but not severe
      risk_career: fs('risk_career', 80),
      autonomy_need: fs('autonomy_need', 85),
    }
    const result = computeCareerFit(career, scores)
    expect(result.penalties).toEqual([])
    expect(result.fitScore).toBe(result.weightedCompatibility)
    expect(result.headline).toBeNull()
  })

  it('a non-dealbreaker dimension never generates a penalty, no matter how large the gap', () => {
    // "social" never carries a dealbreaker flag at all, regardless of how extreme the occupation's own value is.
    const career = makeCareer({ socialOrientation: 100 })
    const result = computeCareerFit(career, { sociability: fs('sociability', 0) }) // maximum possible gap
    expect(result.penalties).toEqual([])
  })

  it('does not raise a headline when the strong category and the mismatched category are the same one', () => {
    const career = makeCareer({ risk: 80 }) // both risk dimensions desired = 80, both dealbreaker-eligible
    // uncertainty_tolerance aligns almost perfectly; risk_career misses by just past the severe threshold.
    // category compatibility ends up (100 + 54) / 2 = 77 — high enough to read as "strong" on its own,
    // even though the mismatch that generated the penalty lives inside that very same category.
    const result = computeCareerFit(career, {
      uncertainty_tolerance: fs('uncertainty_tolerance', 80),
      risk_career: fs('risk_career', 34),
    })
    expect(result.categories[0].compatibility).toBeGreaterThanOrEqual(75)
    expect(result.penalties).toHaveLength(1)
    expect(result.headline).toBeNull()
  })
})

describe('computeCareerFit — determinism and bounds', () => {
  it('never returns a fitScore outside 0-100, even with multiple stacked severe penalties', () => {
    const career = makeCareer({ risk: 100, independence: 100 }) // maximally dealbreaker-eligible on every dimension
    const result = computeCareerFit(career, {
      uncertainty_tolerance: fs('uncertainty_tolerance', 0),
      risk_career: fs('risk_career', 0),
      autonomy_need: fs('autonomy_need', 0),
    })
    expect(result.penalties.length).toBeGreaterThan(0)
    expect(result.fitScore).toBeGreaterThanOrEqual(0)
    expect(result.fitScore).toBeLessThanOrEqual(100)
  })
  it('is a pure, deterministic function', () => {
    const career = makeCareer({ riasec: { realistic: 20, investigative: 20, artistic: 20, social: 20, enterprising: 85, conventional: 20 }, risk: 80, independence: 85 })
    const scores = {
      riasec_realistic: fs('riasec_realistic', 20), riasec_investigative: fs('riasec_investigative', 20),
      riasec_artistic: fs('riasec_artistic', 20), riasec_social: fs('riasec_social', 20),
      riasec_enterprising: fs('riasec_enterprising', 90), riasec_conventional: fs('riasec_conventional', 20),
      uncertainty_tolerance: fs('uncertainty_tolerance', 15), risk_career: fs('risk_career', 80), autonomy_need: fs('autonomy_need', 85),
    }
    expect(computeCareerFit(career, scores)).toEqual(computeCareerFit(career, scores))
  })
})

describe('matchCareers — ranks by fitScore, penalties included', () => {
  it('sorts a career with a severe penalty below an otherwise-comparable career without one', () => {
    const severe = makeCareer({ id: 'severe', risk: 80, independence: 85 }) // dealbreaker-eligible
    const clean = makeCareer({ id: 'clean', risk: 50, independence: 50 }) // same objective shape, but nothing extreme enough to be a dealbreaker
    const scores = {
      uncertainty_tolerance: fs('uncertainty_tolerance', 15), // severe gap against `severe`'s desired 80, ordinary gap against `clean`'s desired 50
      risk_career: fs('risk_career', 80),
      autonomy_need: fs('autonomy_need', 60),
    }
    const results = matchCareers(scores, [severe, clean])
    const ranked = results.map((r) => r.career.id)
    expect(ranked.indexOf('clean')).toBeLessThan(ranked.indexOf('severe'))
    expect(results.find((r) => r.career.id === 'severe')?.penalties.length).toBeGreaterThan(0)
    expect(results.find((r) => r.career.id === 'clean')?.penalties).toEqual([])
  })
})

describe('computeCareerFit — confidence: how much to trust this specific recommendation, independent of fitScore', () => {
  const HIGH_CONF = { confidence: 'High' as const, evidenceCount: 6, itemsExpected: 6, behavioralEvidenceCount: 2, internalConsistency: 95, contradictionCount: 0 }
  const LOW_CONF = { confidence: 'Low' as const, evidenceCount: 1, itemsExpected: 6, behavioralEvidenceCount: 0, internalConsistency: 100, contradictionCount: 0 }

  // makeCareer()'s defaults always derive interest(6) + personality(2) + lifestyle(1)
  // + risk(2) + autonomy(1) + social(1) + leadership(2) = 15 dimensions, regardless of
  // overrides — strength/environment/values are the only conditionally-omitted
  // categories. Scoring all 15 gives full coverage, isolating per-dimension
  // confidence and contradiction effects from the separate coverage effect below.
  const ALL_DEFAULT_FACET_IDS = [
    'riasec_realistic', 'riasec_investigative', 'riasec_artistic', 'riasec_social', 'riasec_enterprising', 'riasec_conventional',
    'orderliness', 'assertiveness', 'anchor_security', 'uncertainty_tolerance', 'risk_career', 'autonomy_need',
    'sociability', 'anchor_general_management', 'future_leadership',
  ]
  function fullyScored(overrides: Record<string, Partial<FacetScore>> = {}) {
    return Object.fromEntries(ALL_DEFAULT_FACET_IDS.map((id) => [
      id,
      { facetId: id, label: id, score: 50, ...HIGH_CONF, ...overrides[id] },
    ]))
  }

  it('is High when every relevant dimension is scored and well-measured', () => {
    const career = makeCareer()
    const scores = fullyScored()
    const result = computeCareerFit(career, scores)
    expect(result.dimensionsScored).toBe(result.dimensionsTotal)
    expect(result.confidence).toBe('High')
    expect(result.confidenceReason).toMatch(new RegExp(`Built from ${result.dimensionsTotal} of ${result.dimensionsTotal} relevant dimensions`))
  })

  it('is capped by its single weakest contributing dimension — one thin facet downgrades the whole recommendation, even with full coverage', () => {
    const career = makeCareer()
    const scores = fullyScored({ assertiveness: LOW_CONF })
    const result = computeCareerFit(career, scores)
    expect(result.dimensionsScored).toBe(result.dimensionsTotal) // coverage isn't the confound here
    expect(result.confidence).not.toBe('High')
  })

  it('downgrades when coverage of the career’s relevant dimensions is thin, even if what was scored is well-measured', () => {
    const career = makeCareer()
    const result = computeCareerFit(career, {
      uncertainty_tolerance: { facetId: 'uncertainty_tolerance', label: 'Uncertainty Tolerance', score: 50, ...HIGH_CONF },
    })
    expect(result.dimensionsScored / result.dimensionsTotal).toBeLessThan(0.5)
    expect(result.confidence).not.toBe('High')
    expect(result.confidenceReason).toMatch(/haven.t been scored yet/)
  })

  it('downgrades when a contributing facet carries an unresolved contradiction elsewhere in the profile, even with full coverage', () => {
    const career = makeCareer()
    const scores = fullyScored({ sociability: { contradictionCount: 1 } })
    const result = computeCareerFit(career, scores)
    expect(result.dimensionsScored).toBe(result.dimensionsTotal)
    expect(result.confidence).not.toBe('High')
    expect(result.confidenceReason).toMatch(/conflicting signals/)
  })

  it('is Limited for a career with nothing scored at all', () => {
    const result = computeCareerFit(makeCareer(), {})
    expect(result.confidence).toBe('Limited')
  })
})

describe('computeCareerFit — dimensions: the open, inspectable ledger behind the score', () => {
  it('lists every contributing dimension with its own desired/actual/alignment and role, never just the summary bullets', () => {
    const career = makeCareer({ socialOrientation: 70, risk: 80 })
    const result = computeCareerFit(career, {
      sociability: fs('sociability', 68), // small gap, high desired -> strength
      uncertainty_tolerance: fs('uncertainty_tolerance', 10), // huge gap -> friction
      risk_career: fs('risk_career', 80), // exact match -> strength
    })
    expect(result.dimensions).toHaveLength(3)
    const soc = result.dimensions.find((d) => d.facetId === 'sociability')
    expect(soc).toMatchObject({ category: 'social', categoryLabel: 'Social Fit', desired: 70, actual: 68, role: 'strength' })
    const uncertainty = result.dimensions.find((d) => d.facetId === 'uncertainty_tolerance')
    expect(uncertainty).toMatchObject({ desired: 80, actual: 10, role: 'friction', dealbreaker: true })
  })
  it('is empty for a career with nothing scored, matching dimensionsScored', () => {
    const result = computeCareerFit(makeCareer(), {})
    expect(result.dimensions).toEqual([])
    expect(result.dimensionsScored).toBe(0)
  })
})

describe('the real OCCUPATIONS database — does not simply correlate personality with occupation', () => {
  it('every occupation draws on at least one non-personality category', () => {
    for (const career of OCCUPATIONS) {
      const nonPersonality = deriveFitCategories(career).filter((c) => c.category !== 'personality')
      expect(nonPersonality.length).toBeGreaterThan(0)
    }
  })
  it('personality is never the highest-weighted category for any real occupation — it is one input among several, never the primary one', () => {
    for (const career of OCCUPATIONS) {
      const categories = deriveFitCategories(career)
      const personality = categories.find((c) => c.category === 'personality')
      if (!personality) continue
      const maxOtherWeight = Math.max(...categories.filter((c) => c.category !== 'personality').map((c) => c.weight))
      expect(personality.weight).toBeLessThanOrEqual(maxOtherWeight)
    }
  })
  it('across the whole database, more categories are drawn from the newer behaviorally-grounded modules than from raw personality', () => {
    const allCategories = OCCUPATIONS.flatMap((career) => deriveFitCategories(career))
    const personalityCount = allCategories.filter((c) => c.category === 'personality').length
    const behavioralCount = allCategories.filter((c) => ['interest', 'strength', 'risk'].includes(c.category)).length
    expect(behavioralCount).toBeGreaterThan(personalityCount)
  })
})
