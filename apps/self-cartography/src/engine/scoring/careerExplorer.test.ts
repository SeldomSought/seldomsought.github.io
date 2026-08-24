import { describe, it, expect } from 'vitest'
import { dimensionValue, sortByDimension, filterResults, educationRank, DEFAULT_EXPLORER_FILTERS, EDUCATION_ORDER } from './careerExplorer'
import type { ExplorerFilters } from './careerExplorer'
import type { CareerFitResult, CategoryFitResult } from './careerMatch'
import type { Career, EducationLevel } from '../../content/careers/occupationData'

function makeCareer(overrides: Partial<Career> = {}): Career {
  return {
    id: 'test', title: 'Test Career', description: 'test', careerFamily: 'Test',
    riasec: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 },
    workActivities: [], workContext: [], skills: [], knowledge: [], abilities: [],
    education: 'bachelors',
    independence: 50, socialOrientation: 50, leadership: 50, risk: 50, structure: 50, incomePotential: 50,
    source: { source: 'hand-authored-placeholder' },
    ...overrides,
  }
}

function makeResult(overrides: Partial<CareerFitResult> = {}, categories: CategoryFitResult[] = []): CareerFitResult {
  return {
    career: makeCareer(), fitScore: 50, weightedCompatibility: 50, penaltyTotal: 0,
    categories, penalties: [], strengths: [], frictions: [],
    dimensionsScored: 0, dimensionsTotal: 0, headline: null,
    confidence: 'High', confidenceReason: '', dimensions: [],
    ...overrides,
  }
}

function category(cat: CategoryFitResult['category'], compatibility: number): CategoryFitResult {
  return { category: cat, label: cat, weight: 1, compatibility, dimensionsScored: 1, dimensionsTotal: 1 }
}

describe('dimensionValue — fit dimensions read compatibility, everything else reads the objective career field', () => {
  it('overallFit reads fitScore directly', () => {
    expect(dimensionValue(makeResult({ fitScore: 77 }), 'overallFit')).toBe(77)
  })
  it('interestFit and environment read the matching category compatibility', () => {
    const result = makeResult({}, [category('interest', 88), category('environment', 40)])
    expect(dimensionValue(result, 'interestFit')).toBe(88)
    expect(dimensionValue(result, 'environment')).toBe(40)
  })
  it('a fit dimension with no matching category returns null, never a fabricated 0', () => {
    expect(dimensionValue(makeResult({}, []), 'interestFit')).toBeNull()
  })
  it('income/autonomy/risk/socialIntensity/leadership/workStyle all read the career’s own objective fields', () => {
    const result = makeResult({ career: makeCareer({ incomePotential: 61, independence: 62, risk: 63, socialOrientation: 64, leadership: 65, structure: 66 }) })
    expect(dimensionValue(result, 'income')).toBe(61)
    expect(dimensionValue(result, 'autonomy')).toBe(62)
    expect(dimensionValue(result, 'risk')).toBe(63)
    expect(dimensionValue(result, 'socialIntensity')).toBe(64)
    expect(dimensionValue(result, 'leadership')).toBe(65)
    expect(dimensionValue(result, 'workStyle')).toBe(66)
  })
  it('education reads the ordinal rank of the career’s own education field, not a 0-100 score', () => {
    expect(dimensionValue(makeResult({ career: makeCareer({ education: 'no-formal-credential' }) }), 'education')).toBe(0)
    expect(dimensionValue(makeResult({ career: makeCareer({ education: 'doctoral-professional' }) }), 'education')).toBe(EDUCATION_ORDER.length - 1)
  })
})

describe('sortByDimension — unscored (null) values always sort last, in either direction', () => {
  it('sorts descending with nulls at the end', () => {
    const results = [
      makeResult({ career: makeCareer({ id: 'unscored' }) }, []),
      makeResult({ career: makeCareer({ id: 'high' }) }, [category('interest', 90)]),
      makeResult({ career: makeCareer({ id: 'low' }) }, [category('interest', 20)]),
    ]
    const sorted = sortByDimension(results, 'interestFit', 'desc')
    expect(sorted.map((r) => r.career.id)).toEqual(['high', 'low', 'unscored'])
  })
  it('sorts ascending with nulls STILL at the end, not the beginning', () => {
    const results = [
      makeResult({ career: makeCareer({ id: 'unscored' }) }, []),
      makeResult({ career: makeCareer({ id: 'high' }) }, [category('interest', 90)]),
      makeResult({ career: makeCareer({ id: 'low' }) }, [category('interest', 20)]),
    ]
    const sorted = sortByDimension(results, 'interestFit', 'asc')
    expect(sorted.map((r) => r.career.id)).toEqual(['low', 'high', 'unscored'])
  })
})

describe('filterResults — explicit minimums exclude unmeasured careers rather than guessing them in', () => {
  it('excludes a career below the minimum', () => {
    const results = [makeResult({ career: makeCareer({ incomePotential: 30 }) })]
    const filters: ExplorerFilters = { ...DEFAULT_EXPLORER_FILTERS, minValue: { income: 50 } }
    expect(filterResults(results, filters)).toEqual([])
  })
  it('includes a career at or above the minimum', () => {
    const results = [makeResult({ career: makeCareer({ incomePotential: 50 }) })]
    const filters: ExplorerFilters = { ...DEFAULT_EXPLORER_FILTERS, minValue: { income: 50 } }
    expect(filterResults(results, filters)).toHaveLength(1)
  })
  it('excludes a career with no data on a filtered fit dimension, even though the filter is about something else', () => {
    const results = [makeResult({}, [])] // no categories scored at all
    const filters: ExplorerFilters = { ...DEFAULT_EXPLORER_FILTERS, minValue: { interestFit: 1 } }
    expect(filterResults(results, filters)).toEqual([])
  })
  it('education filters by maximum acceptable rank, not minimum', () => {
    const results = [
      makeResult({ career: makeCareer({ id: 'phd', education: 'doctoral-professional' }) }),
      makeResult({ career: makeCareer({ id: 'hs', education: 'high-school' }) }),
    ]
    const filters: ExplorerFilters = { ...DEFAULT_EXPLORER_FILTERS, maxEducationRank: educationRank('bachelors') }
    expect(filterResults(results, filters).map((r) => r.career.id)).toEqual(['hs'])
  })
  it('the default filters exclude nothing', () => {
    const results = [makeResult({ career: makeCareer({ education: 'doctoral-professional', incomePotential: 0 }) })]
    expect(filterResults(results, DEFAULT_EXPLORER_FILTERS)).toHaveLength(1)
  })
})

describe('educationRank — a real ordinal scale, not an arbitrary mapping', () => {
  it('is monotonically increasing along EDUCATION_ORDER', () => {
    for (let i = 1; i < EDUCATION_ORDER.length; i++) {
      expect(educationRank(EDUCATION_ORDER[i] as EducationLevel)).toBeGreaterThan(educationRank(EDUCATION_ORDER[i - 1] as EducationLevel))
    }
  })
})
