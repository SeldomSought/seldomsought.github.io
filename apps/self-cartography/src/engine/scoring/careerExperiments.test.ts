import { describe, it, expect } from 'vitest'
import { buildCareerHypotheses, planExperiments } from './careerExperiments'
import { EXPERIMENT_TEMPLATES } from '../../content/copy/careerExperiments'
import type { CareerHypothesis } from './careerExperiments'
import type { ExperimentTemplate } from '../../content/copy/careerExperiments'
import type { CareerFitResult, CategoryFitResult } from './careerMatch'
import type { UnconventionalPathResult } from './unconventionalPaths'
import type { Career } from '../../content/careers/occupationData'

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

function category(cat: CategoryFitResult['category'], compatibility: number): CategoryFitResult {
  return { category: cat, label: cat, weight: 1, compatibility, dimensionsScored: 1, dimensionsTotal: 1 }
}

function makeResult(overrides: Partial<CareerFitResult> = {}): CareerFitResult {
  return {
    career: makeCareer(), fitScore: 80, weightedCompatibility: 80, penaltyTotal: 0, frictionPenalty: 0,
    categories: [category('interest', 85)], penalties: [], strengths: [], frictions: [],
    dimensionsScored: 1, dimensionsTotal: 1, headline: null,
    confidence: 'High', confidenceReason: '', dimensions: [],
    ...overrides,
  }
}

function makePath(overrides: Partial<UnconventionalPathResult> = {}): UnconventionalPathResult {
  return {
    id: 'test-path', label: 'Test Path', description: 'test', exampleRoles: [],
    strength: 'Strong', conditionsMet: 4, conditionsTotal: 4, detail: 'test detail',
    confidence: 'High', confidenceReason: '', dimensions: [],
    ...overrides,
  }
}

describe('buildCareerHypotheses — derives tags from the career’s own dominant RIASEC letters and objective fields', () => {
  it('tags an investigative/analytical career appropriately', () => {
    const result = makeResult({ career: makeCareer({ riasec: { realistic: 10, investigative: 90, artistic: 10, social: 10, enterprising: 10, conventional: 10 } }) })
    const [hypothesis] = buildCareerHypotheses([result], [])
    expect(hypothesis.tags).toEqual(expect.arrayContaining(['analytical', 'investigative']))
  })
  it('adds autonomy/portfolio tags when the career’s independence is high, leadership tag when leadership is high', () => {
    const result = makeResult({ career: makeCareer({ independence: 90, leadership: 90 }) })
    const [hypothesis] = buildCareerHypotheses([result], [])
    expect(hypothesis.tags).toEqual(expect.arrayContaining(['autonomy', 'portfolio', 'leadership']))
  })
  it('reuses summarizePrimaryReason for the rationale — no separate copy invented', () => {
    const result = makeResult({ categories: [category('interest', 90), category('autonomy', 85)] })
    const [hypothesis] = buildCareerHypotheses([result], [])
    expect(hypothesis.rationale).toBe('Strong interest + autonomy fit')
  })
  it('a career structure hypothesis uses its own detail text as the rationale and its hand-tagged tags', () => {
    const path = makePath({ id: 'entrepreneurship', label: 'Entrepreneurship', detail: 'the detail text' })
    const [hypothesis] = buildCareerHypotheses([], [path])
    expect(hypothesis.rationale).toBe('the detail text')
    expect(hypothesis.tags).toEqual(expect.arrayContaining(['enterprising', 'persuasion', 'autonomy']))
  })
})

describe('planExperiments — only suggests experiments whose tags actually overlap the hypothesis', () => {
  const templates: ExperimentTemplate[] = [
    { id: 'analytical-only', label: 'Analytical Only', description: '', time: '', cost: '', signalQuality: 'High', tags: ['analytical'] },
    { id: 'social-only', label: 'Social Only', description: '', time: '', cost: '', signalQuality: 'Moderate', tags: ['social'] },
    { id: 'generic-one', label: 'Generic One', description: '', time: '', cost: '', signalQuality: 'Low', tags: ['generic'] },
  ]

  it('matches a hypothesis to the template sharing its tag, and includes the always-eligible generic template', () => {
    const hypothesis: CareerHypothesis = { id: 'h1', label: 'H1', rationale: '', tags: ['analytical'] }
    const plans = planExperiments([hypothesis], templates)
    const ids = plans[0].experiments.map((e) => e.id)
    expect(ids).toContain('analytical-only')
    expect(ids).toContain('generic-one')
    expect(ids).not.toContain('social-only')
  })
  it('ranks a template with more matched tags above one with fewer', () => {
    const richTemplates: ExperimentTemplate[] = [
      { id: 'one-tag', label: 'One Tag', description: '', time: '', cost: '', signalQuality: 'High', tags: ['analytical'] },
      { id: 'two-tag', label: 'Two Tag', description: '', time: '', cost: '', signalQuality: 'High', tags: ['analytical', 'investigative'] },
    ]
    const hypothesis: CareerHypothesis = { id: 'h1', label: 'H1', rationale: '', tags: ['analytical', 'investigative'] }
    const plans = planExperiments([hypothesis], richTemplates)
    expect(plans[0].experiments[0].id).toBe('two-tag')
  })
  it('caps the number of experiments per hypothesis', () => {
    const many: ExperimentTemplate[] = Array.from({ length: 10 }, (_, i) => ({
      id: `t${i}`, label: `T${i}`, description: '', time: '', cost: '', signalQuality: 'Moderate' as const, tags: ['generic' as const],
    }))
    const hypothesis: CareerHypothesis = { id: 'h1', label: 'H1', rationale: '', tags: [] }
    const plans = planExperiments([hypothesis], many, 3)
    expect(plans[0].experiments).toHaveLength(3)
  })
  it('drops a hypothesis entirely when nothing matches — never forces an irrelevant suggestion', () => {
    const hypothesis: CareerHypothesis = { id: 'h1', label: 'H1', rationale: '', tags: ['social'] }
    const plans = planExperiments([hypothesis], [{ id: 'a', label: 'A', description: '', time: '', cost: '', signalQuality: 'High', tags: ['analytical'] }])
    expect(plans).toEqual([])
  })
})

describe('the real EXPERIMENT_TEMPLATES content — matches the requested vocabulary and every field is filled in', () => {
  it('covers every requested experiment', () => {
    const labels = new Set(EXPERIMENT_TEMPLATES.map((t) => t.label))
    for (const expected of [
      'Shadow someone', 'Complete a simulated task', 'Interview three practitioners', 'Take a weekend course',
      'Freelance one project', 'Volunteer', 'Build a prototype', 'Sell something', 'Teach something',
      'Analyze a dataset', 'Work alongside a tradesperson',
    ]) {
      expect(labels.has(expected), `missing experiment: ${expected}`).toBe(true)
    }
  })
  it('every template declares time, cost, and signal quality — the three classifications requested', () => {
    for (const t of EXPERIMENT_TEMPLATES) {
      expect(t.time.length).toBeGreaterThan(0)
      expect(t.cost.length).toBeGreaterThan(0)
      expect(['Low', 'Moderate', 'High']).toContain(t.signalQuality)
      expect(t.tags.length).toBeGreaterThan(0)
    }
  })
  it('has no duplicate template ids', () => {
    const ids = EXPERIMENT_TEMPLATES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
