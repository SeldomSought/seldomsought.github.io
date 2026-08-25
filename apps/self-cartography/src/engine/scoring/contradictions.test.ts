import { describe, it, expect } from 'vitest'
import { detectContradictions } from './contradictions'
import type { FacetScore, Response } from '../types'

function fs(facetId: string, score: number, confidence: FacetScore['confidence'] = 'High'): FacetScore {
  return { facetId, label: facetId, score, confidence, evidenceCount: 3, itemsExpected: 3, behavioralEvidenceCount: 0, internalConsistency: 100, contradictionCount: 0 }
}

const NO_RESPONSES: Record<string, Response> = {}

describe('detectContradictions — a neutral, internally-consistent profile', () => {
  it('fires nothing when every score sits at the midpoint', () => {
    const midpointFacets = [
      'autonomy_need', 'work_hierarchy', 'work_bureaucracy', 'anchor_entrepreneurship', 'risk_financial',
      'risk_career', 'strength_creative_ability', 'strength_creative_ease', 'aesthetic_openness', 'power',
      'future_prestige', 'anchor_security', 'anchor_service_mission', 'desire_impact_comfort', 'sociability',
      'work_solitude_social', 'risk_tolerance',
    ]
    const scores = Object.fromEntries(midpointFacets.map((id) => [id, fs(id, 50)]))
    expect(detectContradictions(scores, NO_RESPONSES)).toEqual([])
  })

  it('fires nothing when the relevant facets are simply missing (never throws)', () => {
    expect(detectContradictions({}, NO_RESPONSES)).toEqual([])
  })
})

describe('ruleAutonomyStructure — stated autonomy vs. chosen structure', () => {
  it('does not fire when autonomy is claimed but structure scores are also low', () => {
    const scores = { autonomy_need: fs('autonomy_need', 90), work_hierarchy: fs('work_hierarchy', 20), work_bureaucracy: fs('work_bureaucracy', 20) }
    expect(detectContradictions(scores, NO_RESPONSES)).toEqual([])
  })

  it('does not fire when structure is high but autonomy claim is not', () => {
    const scores = { autonomy_need: fs('autonomy_need', 50), work_hierarchy: fs('work_hierarchy', 90) }
    expect(detectContradictions(scores, NO_RESPONSES)).toEqual([])
  })

  it('fires when autonomy is claimed highly (>=65) and a structure facet clears 60', () => {
    const scores = { autonomy_need: fs('autonomy_need', 80), work_hierarchy: fs('work_hierarchy', 70) }
    const result = detectContradictions(scores, NO_RESPONSES)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('contradiction-autonomy-structure')
    expect(result[0].type).toBe('statedVsRevealed')
  })

  it('picks the stronger of two candidate structure facets for relatedConstructs/detail', () => {
    const scores = {
      autonomy_need: fs('autonomy_need', 80),
      work_hierarchy: fs('work_hierarchy', 65),
      work_bureaucracy: fs('work_bureaucracy', 90),
    }
    const [result] = detectContradictions(scores, NO_RESPONSES)
    expect(result.detail).toContain('90/100')
    expect(result.detail).not.toContain('65/100')
  })
})

describe('severity bucketing (severityFromExcess, exercised via ruleStatusPrestige)', () => {
  // excess = (40 - claim.score) + (prestige.score - 60); thresholds: >=35 High, >=15 Medium, else Low
  it('buckets a barely-over-threshold case as Low', () => {
    const scores = { power: fs('power', 39), future_prestige: fs('future_prestige', 61) } // excess = 1 + 1 = 2
    expect(detectContradictions(scores, NO_RESPONSES)[0].severity).toBe('Low')
  })

  it('buckets a moderate excess as Medium', () => {
    const scores = { power: fs('power', 30), future_prestige: fs('future_prestige', 70) } // excess = 10 + 10 = 20
    expect(detectContradictions(scores, NO_RESPONSES)[0].severity).toBe('Medium')
  })

  it('buckets a large excess as High', () => {
    const scores = { power: fs('power', 5), future_prestige: fs('future_prestige', 95) } // excess = 35 + 35 = 70
    expect(detectContradictions(scores, NO_RESPONSES)[0].severity).toBe('High')
  })
})

describe('confidence combination (combineConfidence — worst-of-inputs)', () => {
  it('reports the lowest confidence among the facets involved, not the highest or an average', () => {
    const scores = {
      power: fs('power', 5, 'High'),
      future_prestige: fs('future_prestige', 95, 'Low'),
    }
    expect(detectContradictions(scores, NO_RESPONSES)[0].confidence).toBe('Low')
  })
})

describe('detectContradictions — multiple simultaneous contradictions', () => {
  it('sorts by confidence first, then severity, both descending', () => {
    const scores = {
      // Low confidence, High severity
      power: fs('power', 5, 'Low'),
      future_prestige: fs('future_prestige', 95, 'Low'),
      // High confidence, Low severity
      autonomy_need: fs('autonomy_need', 66, 'High'),
      work_hierarchy: fs('work_hierarchy', 61, 'High'),
    }
    const result = detectContradictions(scores, NO_RESPONSES)
    expect(result).toHaveLength(2)
    // High confidence ranks above Low confidence regardless of severity
    expect(result[0].id).toBe('contradiction-autonomy-structure')
    expect(result[0].confidence).toBe('High')
    expect(result[1].id).toBe('contradiction-status-prestige')
    expect(result[1].confidence).toBe('Low')
  })
})
