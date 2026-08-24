import { describe, it, expect } from 'vitest'
import { deriveRecommendationConfidence } from './recommendationConfidence'
import type { FacetScore } from '../types'

function fs(facetId: string, confidence: FacetScore['confidence'], contradictionCount = 0): FacetScore {
  return { facetId, label: facetId, score: 50, confidence, evidenceCount: 3, itemsExpected: 3, behavioralEvidenceCount: 0, internalConsistency: 100, contradictionCount }
}

describe('deriveRecommendationConfidence — no matching evidence', () => {
  it('returns Limited with the exact "no evidence" reason when no facets contribute', () => {
    const result = deriveRecommendationConfidence([], 0, 4)
    expect(result).toEqual({ level: 'Limited', reason: 'No matching evidence — none of the relevant dimensions have been scored yet.' })
  })
})

describe('deriveRecommendationConfidence — weakest-link capping', () => {
  it('is High only when every contributing facet is High-confidence and coverage/contradictions are clean', () => {
    const facets = [fs('a', 'High'), fs('b', 'High')]
    const result = deriveRecommendationConfidence(facets, 4, 4)
    expect(result.level).toBe('High')
    expect(result.reason).toContain('most backed by strong, consistent evidence')
  })

  it('caps at Moderate the moment any contributing facet is only Medium-confidence', () => {
    const facets = [fs('a', 'High'), fs('b', 'Medium')]
    const result = deriveRecommendationConfidence(facets, 4, 4)
    expect(result.level).toBe('Moderate')
  })

  it('caps at Limited the moment any contributing facet is only Low-confidence, even with full coverage', () => {
    const facets = [fs('a', 'High'), fs('b', 'Low')]
    const result = deriveRecommendationConfidence(facets, 4, 4)
    expect(result.level).toBe('Limited')
    expect(result.reason).toContain('1 of them still rest on thin, early evidence')
  })
})

describe('deriveRecommendationConfidence — thin-coverage penalty in isolation', () => {
  it('downgrades High to Moderate when fewer than half the relevant dimensions were scored', () => {
    const facets = [fs('a', 'High'), fs('b', 'High')]
    const result = deriveRecommendationConfidence(facets, 1, 4) // 25% coverage
    expect(result.level).toBe('Moderate')
    expect(result.reason).toContain('haven’t been scored yet')
  })

  it('does not downgrade when coverage is exactly at the 50% boundary', () => {
    const facets = [fs('a', 'High'), fs('b', 'High')]
    const result = deriveRecommendationConfidence(facets, 2, 4) // exactly 50%
    expect(result.level).toBe('High')
  })

  it('treats zero total dimensions as thin coverage (avoids a divide-by-zero false High)', () => {
    const facets = [fs('a', 'High')]
    const result = deriveRecommendationConfidence(facets, 0, 0)
    expect(result.level).toBe('Moderate')
  })
})

describe('deriveRecommendationConfidence — contradiction penalty in isolation', () => {
  it('downgrades High to Moderate when a contributing facet carries an unresolved contradiction', () => {
    const facets = [fs('a', 'High'), fs('b', 'High', 1)]
    const result = deriveRecommendationConfidence(facets, 4, 4)
    expect(result.level).toBe('Moderate')
    expect(result.reason).toContain('conflicting signals')
  })
})

describe('deriveRecommendationConfidence — both penalties simultaneously (double downgrade)', () => {
  it('drops High two full tiers to Limited when both thin coverage and a contradiction apply', () => {
    const facets = [fs('a', 'High'), fs('b', 'High', 1)]
    const result = deriveRecommendationConfidence(facets, 1, 4) // 25% coverage + contradiction
    expect(result.level).toBe('Limited')
  })

  it('current behavior: the reason text names only the contradiction, not the coverage gap, when both are true', () => {
    // Documents an existing, non-obvious priority in the if/else-if chain (contradicted is
    // checked before thinCoverage) — pinned here so a future change to that ordering is a
    // deliberate decision, not a silent behavior shift.
    const facets = [fs('a', 'High'), fs('b', 'High', 1)]
    const result = deriveRecommendationConfidence(facets, 1, 4)
    expect(result.reason).toContain('conflicting signals')
    expect(result.reason).not.toContain('scored yet')
  })
})

describe('deriveRecommendationConfidence — reason text branches', () => {
  it('falls back to the plain "moderate evidence" reason when Moderate but neither thin nor contradicted nor Low-count', () => {
    const facets = [fs('a', 'High'), fs('b', 'Medium')]
    const result = deriveRecommendationConfidence(facets, 4, 4)
    expect(result.level).toBe('Moderate')
    expect(result.reason).toBe('Built from 4 of 4 relevant dimensions, with moderate evidence behind most of them.')
  })

  it('reports the exact count of Low-confidence contributors in the lowCount branch', () => {
    const facets = [fs('a', 'Medium'), fs('b', 'Low'), fs('c', 'Low')]
    const result = deriveRecommendationConfidence(facets, 4, 4)
    expect(result.reason).toContain('2 of them still rest on thin, early evidence')
  })
})
