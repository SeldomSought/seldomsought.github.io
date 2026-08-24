import { describe, it, expect } from 'vitest'
import { computeRawScore, transformToScale, clamp } from './rawScore'
import type { Contribution } from './contributions'

describe('computeRawScore — stage one, raw construct scores', () => {
  it('returns null for an empty contribution list — no data, not a fabricated zero', () => {
    expect(computeRawScore('f', [])).toBeNull()
  })
  it('returns null when total weight is zero, even with contributions present', () => {
    const contributions: Contribution[] = [{ facetId: 'f', points: 80, weight: 0 }]
    expect(computeRawScore('f', contributions)).toBeNull()
  })
  it('sums points × weight and weight separately for a single contribution', () => {
    const contributions: Contribution[] = [{ facetId: 'f', points: 80, weight: 2 }]
    expect(computeRawScore('f', contributions)).toEqual({ facetId: 'f', rawSum: 160, rawWeight: 2, contributionCount: 1 })
  })
  it('accumulates multiple contributions with different weights', () => {
    const contributions: Contribution[] = [
      { facetId: 'f', points: 100, weight: 1 },
      { facetId: 'f', points: 0, weight: 3 },
    ]
    const raw = computeRawScore('f', contributions)
    expect(raw).toEqual({ facetId: 'f', rawSum: 100, rawWeight: 4, contributionCount: 2 })
  })
  it('carries the facetId through untouched', () => {
    expect(computeRawScore('some-facet', [{ facetId: 'some-facet', points: 50, weight: 1 }])?.facetId).toBe('some-facet')
  })
})

describe('transformToScale — stage two, the ONLY place raw becomes 0-100', () => {
  it('transforms an unweighted mean correctly', () => {
    expect(transformToScale({ facetId: 'f', rawSum: 300, rawWeight: 4, contributionCount: 2 })).toBe(75)
  })
  it('rounds to the nearest whole number', () => {
    // 200/3 = 66.666...
    expect(transformToScale({ facetId: 'f', rawSum: 200, rawWeight: 3, contributionCount: 1 })).toBe(67)
  })
  it('a heavily-weighted low contribution pulls the transformed score down', () => {
    // one contribution at 100pts×weight1, one at 0pts×weight3 — rawSum is just their sum
    const raw = { facetId: 'f', rawSum: 100, rawWeight: 4, contributionCount: 2 }
    expect(transformToScale(raw)).toBe(25)
  })
  it('clamps a raw mean above 100 down to 100 — a defensive bound, never a claim about what data implies', () => {
    expect(transformToScale({ facetId: 'f', rawSum: 150, rawWeight: 1, contributionCount: 1 })).toBe(100)
  })
  it('clamps a raw mean below 0 up to 0', () => {
    expect(transformToScale({ facetId: 'f', rawSum: -50, rawWeight: 1, contributionCount: 1 })).toBe(0)
  })
  it('is a pure, deterministic function of its input', () => {
    const raw = { facetId: 'f', rawSum: 137, rawWeight: 3, contributionCount: 2 }
    const first = transformToScale(raw)
    const second = transformToScale(raw)
    expect(first).toBe(second)
  })
})

describe('clamp', () => {
  it('passes values already inside the range through unchanged', () => {
    expect(clamp(50, 0, 100)).toBe(50)
  })
  it('caps at the maximum', () => {
    expect(clamp(150, 0, 100)).toBe(100)
  })
  it('floors at the minimum', () => {
    expect(clamp(-10, 0, 100)).toBe(0)
  })
})
