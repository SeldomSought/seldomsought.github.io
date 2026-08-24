import { describe, it, expect } from 'vitest'
import { deriveFitCategories, CATEGORY_LABEL } from './careerFitModel'
import type { Career } from '../../content/careers/occupationData'

function makeCareer(overrides: Partial<Career> = {}): Career {
  return {
    id: 'test', title: 'Test Career', description: 'A synthetic occupation for exercising the mapping rules.', careerFamily: 'Test',
    riasec: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 },
    workActivities: [], workContext: [], skills: [], knowledge: [], abilities: [],
    education: 'bachelors',
    independence: 50, socialOrientation: 50, leadership: 50, risk: 50, structure: 50, incomePotential: 50,
    source: { source: 'hand-authored-placeholder' },
    ...overrides,
  }
}

describe('deriveFitCategories — interest: a direct, unconditional read of the occupation’s RIASEC profile', () => {
  it('carries every one of the six RIASEC axes through untouched', () => {
    const career = makeCareer({ riasec: { realistic: 10, investigative: 20, artistic: 30, social: 40, enterprising: 50, conventional: 60 } })
    const interest = deriveFitCategories(career).find((c) => c.category === 'interest')
    expect(interest?.dimensions).toEqual(expect.arrayContaining([
      { facetId: 'riasec_realistic', desired: 10 },
      { facetId: 'riasec_investigative', desired: 20 },
      { facetId: 'riasec_artistic', desired: 30 },
      { facetId: 'riasec_social', desired: 40 },
      { facetId: 'riasec_enterprising', desired: 50 },
      { facetId: 'riasec_conventional', desired: 60 },
    ]))
  })
})

describe('deriveFitCategories — personality: deliberately light, derived from structural fields, never a primary signal', () => {
  it('derives orderliness from structure and assertiveness from leadership, and nothing else', () => {
    const career = makeCareer({ structure: 80, leadership: 30 })
    const personality = deriveFitCategories(career).find((c) => c.category === 'personality')
    expect(personality?.dimensions).toEqual([
      { facetId: 'orderliness', desired: 80 },
      { facetId: 'assertiveness', desired: 30 },
    ])
  })
})

describe('deriveFitCategories — strength: name-keyed lookup over skills and abilities', () => {
  it('maps a recognized skill name to its strength facet', () => {
    const career = makeCareer({ skills: [{ name: 'Complex Problem Solving', level: 77 }] })
    const strength = deriveFitCategories(career).find((c) => c.category === 'strength')
    expect(strength?.dimensions).toEqual([{ facetId: 'strength_analytical_ability', desired: 77 }])
  })
  it('averages multiple entries that map to the same strength facet, rather than letting the last one win', () => {
    const career = makeCareer({
      skills: [{ name: 'Complex Problem Solving', level: 80 }],
      abilities: [{ name: 'Deductive Reasoning', level: 60 }], // both map to strength_analytical_ability
    })
    const strength = deriveFitCategories(career).find((c) => c.category === 'strength')
    expect(strength?.dimensions).toEqual([{ facetId: 'strength_analytical_ability', desired: 70 }])
  })
  it('is entirely omitted — not fabricated at 0 — when no skill or ability name is recognized', () => {
    const career = makeCareer({ skills: [{ name: 'Some Unmapped Skill', level: 90 }] })
    expect(deriveFitCategories(career).find((c) => c.category === 'strength')).toBeUndefined()
  })
})

describe('deriveFitCategories — environment: name-keyed lookup over work context, with documented inversions', () => {
  it('maps Time Pressure directly to work_pace', () => {
    const career = makeCareer({ workContext: [{ name: 'Time Pressure', level: 70 }] })
    const env = deriveFitCategories(career).find((c) => c.category === 'environment')
    expect(env?.dimensions).toEqual([{ facetId: 'work_pace', desired: 70 }])
  })
  it('inverts "Structured versus Unstructured Work" onto work_predictability, since our scale runs the opposite direction', () => {
    const career = makeCareer({ workContext: [{ name: 'Structured versus Unstructured Work', level: 90 }] })
    const env = deriveFitCategories(career).find((c) => c.category === 'environment')
    expect(env?.dimensions).toEqual([{ facetId: 'work_predictability', desired: 10 }])
  })
  it('inverts "Contact With Others" onto work_solitude_social, since ours is a solitude scale', () => {
    const career = makeCareer({ workContext: [{ name: 'Contact With Others', level: 95 }] })
    const env = deriveFitCategories(career).find((c) => c.category === 'environment')
    expect(env?.dimensions).toEqual([{ facetId: 'work_solitude_social', desired: 5 }])
  })
  it('maps both "Deal With External Customers" and "Public Speaking" onto the same work_public_interaction facet, averaged', () => {
    const career = makeCareer({ workContext: [{ name: 'Deal With External Customers', level: 80 }, { name: 'Public Speaking', level: 60 }] })
    const env = deriveFitCategories(career).find((c) => c.category === 'environment')
    expect(env?.dimensions).toEqual([{ facetId: 'work_public_interaction', desired: 70 }])
  })
})

describe('deriveFitCategories — values: only present when the occupation data actually speaks to it', () => {
  it('derives benevolence from "Assisting and Caring for Others" when that work activity is listed', () => {
    const career = makeCareer({ workActivities: [{ name: 'Assisting and Caring for Others', importance: 88 }] })
    const values = deriveFitCategories(career).find((c) => c.category === 'values')
    expect(values?.dimensions).toEqual([{ facetId: 'benevolence', desired: 88 }])
  })
  it('is omitted entirely — never a fabricated middling score — for an occupation with no caring-related activity', () => {
    const career = makeCareer({ workActivities: [{ name: 'Selling or Influencing Others', importance: 90 }] })
    expect(deriveFitCategories(career).find((c) => c.category === 'values')).toBeUndefined()
  })
})

describe('deriveFitCategories — risk, autonomy, social, leadership: direct scalar reads', () => {
  it('risk derives both uncertainty_tolerance and risk_career from the single objective risk field', () => {
    const career = makeCareer({ risk: 62 })
    const risk = deriveFitCategories(career).find((c) => c.category === 'risk')
    expect(risk?.dimensions.find((d) => d.facetId === 'uncertainty_tolerance')?.desired).toBe(62)
    expect(risk?.dimensions.find((d) => d.facetId === 'risk_career')?.desired).toBe(62)
  })
  it('flags risk dimensions as dealbreakers only at the extremes (>=75 or <=25)', () => {
    const extreme = deriveFitCategories(makeCareer({ risk: 90 })).find((c) => c.category === 'risk')
    const moderate = deriveFitCategories(makeCareer({ risk: 50 })).find((c) => c.category === 'risk')
    expect(extreme?.dimensions.every((d) => d.dealbreaker)).toBe(true)
    expect(moderate?.dimensions.every((d) => !d.dealbreaker)).toBe(true)
  })
  it('autonomy_need is a dealbreaker only when independence is very high (>=85)', () => {
    const high = deriveFitCategories(makeCareer({ independence: 95 })).find((c) => c.category === 'autonomy')
    const moderate = deriveFitCategories(makeCareer({ independence: 60 })).find((c) => c.category === 'autonomy')
    expect(high?.dimensions[0].dealbreaker).toBe(true)
    expect(moderate?.dimensions[0].dealbreaker).toBeFalsy()
  })
  it('social reads sociability directly from socialOrientation', () => {
    const career = makeCareer({ socialOrientation: 33 })
    expect(deriveFitCategories(career).find((c) => c.category === 'social')?.dimensions).toEqual([{ facetId: 'sociability', desired: 33 }])
  })
  it('leadership reads both anchor_general_management and future_leadership from the same objective field', () => {
    const career = makeCareer({ leadership: 71 })
    const leadership = deriveFitCategories(career).find((c) => c.category === 'leadership')
    expect(leadership?.dimensions).toEqual(expect.arrayContaining([
      { facetId: 'anchor_general_management', desired: 71 },
      { facetId: 'future_leadership', desired: 71 },
    ]))
  })
})

describe('deriveFitCategories — lifestyle: anchor_security derived from the combination of risk and structure', () => {
  it('a low-risk, high-structure occupation produces a high desired security anchor', () => {
    const career = makeCareer({ risk: 10, structure: 90 })
    const lifestyle = deriveFitCategories(career).find((c) => c.category === 'lifestyle')
    expect(lifestyle?.dimensions[0].desired).toBeGreaterThan(70)
  })
  it('a high-risk, low-structure occupation produces a low desired security anchor', () => {
    const career = makeCareer({ risk: 90, structure: 10 })
    const lifestyle = deriveFitCategories(career).find((c) => c.category === 'lifestyle')
    expect(lifestyle?.dimensions[0].desired).toBeLessThan(30)
  })
})

describe('deriveFitCategories — category weight: a fixed base plus a documented extremity boost', () => {
  it('a moderate (near-50) objective signal gets the plain base weight', () => {
    const career = makeCareer({ independence: 50 })
    const autonomy = deriveFitCategories(career).find((c) => c.category === 'autonomy')
    expect(autonomy?.weight).toBe(2) // BASE_WEIGHT.autonomy, no boost
  })
  it('an extreme (far from 50) objective signal earns the +1 extremity boost', () => {
    const career = makeCareer({ independence: 95 })
    const autonomy = deriveFitCategories(career).find((c) => c.category === 'autonomy')
    expect(autonomy?.weight).toBe(3) // BASE_WEIGHT.autonomy + 1
  })
})

describe('deriveFitCategories — every produced category has a real, non-empty label', () => {
  it('CATEGORY_LABEL covers every category this function can ever emit', () => {
    const career = makeCareer({
      risk: 80, independence: 90, socialOrientation: 70, leadership: 65, structure: 30,
      riasec: { realistic: 10, investigative: 90, artistic: 20, social: 30, enterprising: 40, conventional: 50 },
      skills: [{ name: 'Critical Thinking', level: 70 }],
      workContext: [{ name: 'Time Pressure', level: 60 }],
      workActivities: [{ name: 'Assisting and Caring for Others', importance: 55 }],
    })
    for (const c of deriveFitCategories(career)) {
      expect(CATEGORY_LABEL[c.category]).toBeTruthy()
    }
  })
})
