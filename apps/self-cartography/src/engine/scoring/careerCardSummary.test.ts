import { describe, it, expect } from 'vitest'
import { summarizePrimaryReason, summarizeLargestFriction } from './careerCardSummary'
import type { CareerFitResult, CategoryFitResult, IncompatibilityPenalty, CareerAlignmentBullet } from './careerMatch'
import type { Career } from '../../content/careers/occupationData'

function makeCareer(): Career {
  return {
    id: 'test', title: 'Test Career', description: 'test', careerFamily: 'Test',
    riasec: { realistic: 0, investigative: 0, artistic: 0, social: 0, enterprising: 0, conventional: 0 },
    workActivities: [], workContext: [], skills: [], knowledge: [], abilities: [],
    education: 'bachelors',
    independence: 50, socialOrientation: 50, leadership: 50, risk: 50, structure: 50, incomePotential: 50,
    source: { source: 'hand-authored-placeholder' },
  }
}

function makeResult(overrides: Partial<CareerFitResult> = {}): CareerFitResult {
  return {
    career: makeCareer(), fitScore: 50, weightedCompatibility: 50, penaltyTotal: 0, frictionPenalty: 0,
    categories: [], penalties: [], strengths: [], frictions: [],
    dimensionsScored: 0, dimensionsTotal: 0, headline: null,
    confidence: 'High', confidenceReason: '', dimensions: [],
    ...overrides,
  }
}

function category(cat: CategoryFitResult['category'], compatibility: number): CategoryFitResult {
  return { category: cat, label: cat, weight: 1, compatibility, dimensionsScored: 1, dimensionsTotal: 1 }
}

describe('summarizePrimaryReason — names the 1-2 strongest categories plainly, qualified by how strong', () => {
  it('names two categories with "Strong" when both clear 80', () => {
    const result = makeResult({ categories: [category('interest', 90), category('autonomy', 85), category('risk', 30)] })
    expect(summarizePrimaryReason(result)).toBe('Strong interest + autonomy fit')
  })
  it('names one category when only one clears 60', () => {
    const result = makeResult({ categories: [category('interest', 70), category('risk', 30)] })
    expect(summarizePrimaryReason(result)).toBe('Solid interest fit')
  })
  it('falls back to "Best available" and the single top category when nothing clears 60', () => {
    const result = makeResult({ categories: [category('interest', 45), category('risk', 30)] })
    expect(summarizePrimaryReason(result)).toBe('Best available interest fit')
  })
  it('returns null when nothing at all was scored', () => {
    expect(summarizePrimaryReason(makeResult({ categories: [] }))).toBeNull()
  })
})

describe('summarizeLargestFriction — prefers an explicit dealbreaker-level penalty over an ordinary friction', () => {
  const penalty = (label: string, points: number): IncompatibilityPenalty => ({
    facetId: label, label, category: 'risk', desired: 80, actual: 10, gap: 70, points, detail: '',
  })
  const friction = (dimensionId: string): CareerAlignmentBullet => ({ dimensionId, category: 'environment', text: '' })

  it('picks the highest-point penalty when penalties exist', () => {
    const result = makeResult({ penalties: [penalty('Career Risk Tolerance', 10), penalty('Uncertainty Tolerance', 25)] })
    expect(summarizeLargestFriction(result)).toBe('Friction: uncertainty tolerance')
  })
  it('falls back to the top-listed ordinary friction when there are no penalties', () => {
    const result = makeResult({ frictions: [friction('work_bureaucracy')] })
    expect(summarizeLargestFriction(result)).toBe('Friction: formal process vs. minimal process')
  })
  it('returns null when there is no friction at all to report', () => {
    expect(summarizeLargestFriction(makeResult())).toBeNull()
  })
})
