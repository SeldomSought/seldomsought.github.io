import { describe, it, expect } from 'vitest'
import { detectUnconventionalPaths } from './unconventionalPaths'
import { CAREER_STRUCTURES } from '../../content/careers/careerStructures'
import { FACET_BY_ID } from '../../content/facets'
import type { CareerStructure } from '../../content/careers/careerStructures'
import type { FacetScore } from '../types'

function fs(facetId: string, score: number, overrides: Partial<FacetScore> = {}): FacetScore {
  return { facetId, label: facetId, score, confidence: 'High', evidenceCount: 4, itemsExpected: 4, behavioralEvidenceCount: 1, internalConsistency: 90, contradictionCount: 0, ...overrides }
}

const TEST_STRUCTURE: CareerStructure = {
  id: 'test-structure', label: 'Test Structure', description: 'A synthetic structure for exercising the convergence gate.',
  exampleRoles: ['Example Role A', 'Example Role B'],
  conditions: [
    { facetId: 'autonomy_need', direction: 'high', threshold: 65 },
    { facetId: 'work_task_variety', direction: 'high', threshold: 65 },
    { facetId: 'structure_need', direction: 'low', threshold: 60 },
    { facetId: 'risk_financial', direction: 'high', threshold: 55 },
  ],
  minimumMet: 3,
  detail: 'test detail',
}

describe('detectUnconventionalPaths — only fires on real convergence, never a single strong trait', () => {
  it('fires when at least minimumMet conditions clear their threshold', () => {
    const scores = {
      autonomy_need: fs('autonomy_need', 80),
      work_task_variety: fs('work_task_variety', 75),
      structure_need: fs('structure_need', 20), // low direction, threshold 60 -> met when score <= 40
    }
    const result = detectUnconventionalPaths(scores, [TEST_STRUCTURE])
    expect(result).toHaveLength(1)
    expect(result[0].conditionsMet).toBe(3)
    expect(result[0].strength).toBe('Notable') // 3 of 4 = 0.75
  })

  it('does NOT fire when fewer than minimumMet conditions clear their threshold', () => {
    const scores = {
      autonomy_need: fs('autonomy_need', 80),
      work_task_variety: fs('work_task_variety', 30), // not met
      structure_need: fs('structure_need', 80), // not met (low direction, needs <=40)
    }
    expect(detectUnconventionalPaths(scores, [TEST_STRUCTURE])).toEqual([])
  })

  it('is Strong only when every condition clears its threshold', () => {
    const scores = {
      autonomy_need: fs('autonomy_need', 80),
      work_task_variety: fs('work_task_variety', 75),
      structure_need: fs('structure_need', 20),
      risk_financial: fs('risk_financial', 60),
    }
    const result = detectUnconventionalPaths(scores, [TEST_STRUCTURE])
    expect(result[0].strength).toBe('Strong')
    expect(result[0].conditionsMet).toBe(4)
  })

  it('a "low" direction condition is met when the score falls at or below (100 - threshold)', () => {
    const metLow: CareerStructure = { ...TEST_STRUCTURE, conditions: [{ facetId: 'structure_need', direction: 'low', threshold: 60 }], minimumMet: 1 }
    expect(detectUnconventionalPaths({ structure_need: fs('structure_need', 40) }, [metLow])).toHaveLength(1)
    expect(detectUnconventionalPaths({ structure_need: fs('structure_need', 41) }, [metLow])).toEqual([])
  })

  it('never fires from zero evidence', () => {
    expect(detectUnconventionalPaths({}, [TEST_STRUCTURE])).toEqual([])
  })
})

describe('detectUnconventionalPaths — the open dimensions ledger is honest about the whole rule, not just what matched', () => {
  it('lists every scored condition, met and unmet alike', () => {
    const scores = {
      autonomy_need: fs('autonomy_need', 80), // met
      work_task_variety: fs('work_task_variety', 75), // met
      structure_need: fs('structure_need', 20), // met
      risk_financial: fs('risk_financial', 10), // scored, but NOT met
    }
    const result = detectUnconventionalPaths(scores, [TEST_STRUCTURE])
    expect(result[0].dimensions).toHaveLength(4)
    expect(result[0].dimensions.find((d) => d.facetId === 'risk_financial')?.met).toBe(false)
    expect(result[0].dimensions.filter((d) => d.met)).toHaveLength(3)
  })

  it('omits an unscored condition from the ledger entirely, rather than fabricating a data point', () => {
    const scores = {
      autonomy_need: fs('autonomy_need', 80),
      work_task_variety: fs('work_task_variety', 75),
      structure_need: fs('structure_need', 20),
      // risk_financial never scored
    }
    const result = detectUnconventionalPaths(scores, [TEST_STRUCTURE])
    expect(result[0].dimensions).toHaveLength(3)
    expect(result[0].dimensions.find((d) => d.facetId === 'risk_financial')).toBeUndefined()
  })
})

describe('detectUnconventionalPaths — confidence follows the same shared rule as career fit and poor fits', () => {
  it('downgrades when a contributing condition is thinly measured', () => {
    const scores = {
      autonomy_need: fs('autonomy_need', 80, { confidence: 'Low' }),
      work_task_variety: fs('work_task_variety', 75),
      structure_need: fs('structure_need', 20),
      risk_financial: fs('risk_financial', 60),
    }
    const result = detectUnconventionalPaths(scores, [TEST_STRUCTURE])
    expect(result[0].confidence).not.toBe('High')
  })
})

describe('detectUnconventionalPaths — sorts strongest signal first', () => {
  it('ranks by conditionsMet, descending', () => {
    const twoOfThree: CareerStructure = { ...TEST_STRUCTURE, id: 'weaker', conditions: TEST_STRUCTURE.conditions.slice(0, 3), minimumMet: 2 }
    const scores = {
      autonomy_need: fs('autonomy_need', 80),
      work_task_variety: fs('work_task_variety', 75),
      structure_need: fs('structure_need', 20),
      risk_financial: fs('risk_financial', 60),
    }
    const result = detectUnconventionalPaths(scores, [twoOfThree, TEST_STRUCTURE])
    expect(result.map((r) => r.id)).toEqual(['test-structure', 'weaker']) // 4 met > 3 met
  })
})

describe('the real CAREER_STRUCTURES content — every structure is auditable and covers the requested list', () => {
  it('every condition names a facet that actually exists', () => {
    for (const structure of CAREER_STRUCTURES) {
      for (const cond of structure.conditions) {
        expect(FACET_BY_ID[cond.facetId], `${structure.id} references unknown facet ${cond.facetId}`).toBeTruthy()
      }
    }
  })
  it('every structure has at least 3 conditions and a sensible minimumMet', () => {
    for (const structure of CAREER_STRUCTURES) {
      expect(structure.conditions.length).toBeGreaterThanOrEqual(3)
      expect(structure.minimumMet).toBeGreaterThanOrEqual(2)
      expect(structure.minimumMet).toBeLessThanOrEqual(structure.conditions.length)
    }
  })
  it('every structure names at least one concrete example role — this recommends structures AS WELL AS job titles', () => {
    for (const structure of CAREER_STRUCTURES) {
      expect(structure.exampleRoles.length).toBeGreaterThan(0)
    }
  })
  it('has no duplicate structure ids', () => {
    const ids = CAREER_STRUCTURES.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('covers every structure explicitly requested', () => {
    const labels = new Set(CAREER_STRUCTURES.map((s) => s.label))
    for (const expected of [
      'Portfolio Career', 'Consulting', 'Independent Operator', 'Small-Business Acquisition',
      'Entrepreneurship', 'Fractional Work', 'Commission-Based Work', 'Technical Sales',
      'Craft / Business Hybrid', 'Creator / Operator', 'Research + Entrepreneurship', 'Trade + Ownership',
    ]) {
      expect(labels.has(expected), `missing structure: ${expected}`).toBe(true)
    }
  })
})
