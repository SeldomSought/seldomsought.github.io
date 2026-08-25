import { describe, it, expect } from 'vitest'
import { classifyStrengthQuadrants, quadrantByFacetId, annotateCareerFitStrengths } from './strengthQuadrant'
import type { StrengthDomainResult } from './strengthsClassification'
import type { CareerFitResult } from './careerMatch'
import type { FacetScore } from '../types'

function fs(facetId: string, score: number, confidence: FacetScore['confidence'] = 'High'): FacetScore {
  return { facetId, label: facetId, score, confidence, evidenceCount: 3, itemsExpected: 3, behavioralEvidenceCount: 0, internalConsistency: 90, contradictionCount: 0 }
}

function domain(overrides: Partial<StrengthDomainResult> & { domainId: string }): StrengthDomainResult {
  return { label: overrides.domainId, category: 'weak', axesAnswered: 0, ...overrides }
}

describe('classifyStrengthQuadrants — places every domain into exactly one of the four named quadrants', () => {
  it('high ability + high energy -> signature', () => {
    const map = classifyStrengthQuadrants([domain({ domainId: 'a', ability: fs('a_ability', 80), energy: fs('a_energy', 80) })])
    expect(map.placed[0].quadrant).toBe('signature')
  })
  it('high ability + low energy -> utilitarian', () => {
    const map = classifyStrengthQuadrants([domain({ domainId: 'a', ability: fs('a_ability', 80), energy: fs('a_energy', 20) })])
    expect(map.placed[0].quadrant).toBe('utilitarian')
  })
  it('low ability + high energy -> development', () => {
    const map = classifyStrengthQuadrants([domain({ domainId: 'a', ability: fs('a_ability', 20), energy: fs('a_energy', 80) })])
    expect(map.placed[0].quadrant).toBe('development')
  })
  it('low ability + low energy -> lowReturn', () => {
    const map = classifyStrengthQuadrants([domain({ domainId: 'a', ability: fs('a_ability', 20), energy: fs('a_energy', 20) })])
    expect(map.placed[0].quadrant).toBe('lowReturn')
  })
  it('the midpoint itself (50/50) counts as high on both axes', () => {
    const map = classifyStrengthQuadrants([domain({ domainId: 'a', ability: fs('a_ability', 50), energy: fs('a_energy', 50) })])
    expect(map.placed[0].quadrant).toBe('signature')
  })
})

describe('classifyStrengthQuadrants — the Ability axis prefers demonstrated ability/skill over raw self-perceived ease', () => {
  it('averages ability and skill when both are present', () => {
    const map = classifyStrengthQuadrants([domain({ domainId: 'a', ability: fs('a_ability', 80), skill: fs('a_skill', 60), energy: fs('a_energy', 70) })])
    expect(map.placed[0].abilityScore).toBe(70)
    expect(map.placed[0].abilitySource).toBe('ability+skill')
  })
  it('falls back to ease only when neither ability nor skill was answered', () => {
    const map = classifyStrengthQuadrants([domain({ domainId: 'a', ease: fs('a_ease', 90), energy: fs('a_energy', 70) })])
    expect(map.placed[0].abilityScore).toBe(90)
    expect(map.placed[0].abilitySource).toBe('ease')
  })
  it('never uses ease when ability or skill is present, even if ease disagrees', () => {
    const map = classifyStrengthQuadrants([domain({ domainId: 'a', ease: fs('a_ease', 10), ability: fs('a_ability', 90), energy: fs('a_energy', 70) })])
    expect(map.placed[0].abilityScore).toBe(90)
    expect(map.placed[0].abilitySource).toBe('ability')
  })
})

describe('classifyStrengthQuadrants — never guesses a placement from thin data', () => {
  it('leaves a domain unplaced when there is no ability-ish axis at all', () => {
    const map = classifyStrengthQuadrants([domain({ domainId: 'a', energy: fs('a_energy', 70) })])
    expect(map.placed).toEqual([])
    expect(map.unplaced.map((u) => u.domainId)).toEqual(['a'])
  })
  it('leaves a domain unplaced when there is no energy axis, even with strong ability data', () => {
    const map = classifyStrengthQuadrants([domain({ domainId: 'a', ability: fs('a_ability', 90) })])
    expect(map.placed).toEqual([])
    expect(map.unplaced.map((u) => u.domainId)).toEqual(['a'])
  })
})

describe('quadrantByFacetId — a lookup keyed by every Ability-axis facet id behind a placement', () => {
  it('maps both the ability and skill facet ids to the same quadrant when both contributed', () => {
    const map = classifyStrengthQuadrants([domain({ domainId: 'a', ability: fs('strength_analytical_ability', 80), skill: fs('strength_analytical_skill', 80), energy: fs('strength_analytical_energy', 80) })])
    const lookup = quadrantByFacetId(map)
    expect(lookup.strength_analytical_ability).toBe('signature')
    expect(lookup.strength_analytical_skill).toBe('signature')
  })
})

describe('annotateCareerFitStrengths — the actual career-recommendation integration point', () => {
  const baseResult: CareerFitResult = {
    career: {} as CareerFitResult['career'],
    fitScore: 80, weightedCompatibility: 80, penaltyTotal: 0, frictionPenalty: 0,
    categories: [], penalties: [], strengths: [], frictions: [],
    dimensionsScored: 2, dimensionsTotal: 2, headline: null,
    confidence: 'High', confidenceReason: '',
    dimensions: [
      { facetId: 'strength_analytical_ability', label: 'Analytical', category: 'strength', categoryLabel: 'Strength Fit', desired: 70, actual: 80, alignment: 90, dealbreaker: false, confidence: 'High', role: 'strength' },
      { facetId: 'riasec_enterprising', label: 'Enterprising', category: 'interest', categoryLabel: 'Interest Fit', desired: 70, actual: 80, alignment: 90, dealbreaker: false, confidence: 'High', role: 'strength' },
    ],
  }

  it('only annotates strength-category dimensions with a known quadrant, leaving everything else untouched', () => {
    const quadrants = { strength_analytical_ability: 'utilitarian' as const }
    const annotations = annotateCareerFitStrengths(baseResult, quadrants)
    expect(annotations).toEqual([{ dimensionId: 'strength_analytical_ability', label: 'Analytical', quadrant: 'utilitarian' }])
  })

  it('produces nothing when no dimension has a known quadrant — never fabricates an annotation', () => {
    expect(annotateCareerFitStrengths(baseResult, {})).toEqual([])
  })
})
