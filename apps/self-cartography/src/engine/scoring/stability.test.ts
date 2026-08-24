import { describe, it, expect } from 'vitest'
import { classifyStability, compareSnapshots } from './stability'
import { FACET_BY_ID } from '../../content/facets'
import type { FacetScore } from '../types'

function fs(facetId: string, score: number, confidence: FacetScore['confidence'] = 'High'): FacetScore {
  return { facetId, label: facetId, score, confidence, evidenceCount: 3, itemsExpected: 3, behavioralEvidenceCount: 0, internalConsistency: 100, contradictionCount: 0 }
}

describe('classifyStability — reads the theoretical class off the facet’s own content group', () => {
  it('a personality facet reads stable', () => {
    expect(classifyStability('orderliness')).toBe('stable') // group: 'personality'
  })
  it('a risk facet reads changing', () => {
    expect(classifyStability('risk_financial')).toBe('changing') // group: 'riskUncertainty'
  })
  it('an unknown facet reads uncertain rather than guessing', () => {
    expect(classifyStability('not_a_real_facet')).toBe('uncertain')
  })
  it('thin construct confidence overrides the theoretical class to uncertain, even for an otherwise-stable trait', () => {
    expect(classifyStability('orderliness', 'Low')).toBe('uncertain')
    expect(classifyStability('orderliness', 'Very Low')).toBe('uncertain')
  })
  it('adequate construct confidence does not override the theoretical class', () => {
    expect(classifyStability('orderliness', 'High')).toBe('stable')
  })
})

describe('compareSnapshots — only compares facets present in BOTH snapshots', () => {
  it('skips a facet the current snapshot has but the prior one doesn’t', () => {
    const result = compareSnapshots({}, { orderliness: fs('orderliness', 80) })
    expect(result.stable).toEqual([])
    expect(result.changing).toEqual([])
    expect(result.uncertain).toEqual([])
  })
})

describe('compareSnapshots — buckets by theoretical class when movement is ordinary', () => {
  it('a stable-class facet with a small move lands in stable', () => {
    const result = compareSnapshots({ orderliness: fs('orderliness', 60) }, { orderliness: fs('orderliness', 65) })
    expect(result.stable.map((c) => c.facetId)).toEqual(['orderliness'])
  })
  it('a changing-class facet with a small move still lands in changing — that’s what the construct is', () => {
    const result = compareSnapshots({ risk_financial: fs('risk_financial', 60) }, { risk_financial: fs('risk_financial', 63) })
    expect(result.changing.map((c) => c.facetId)).toEqual(['risk_financial'])
  })
})

describe('compareSnapshots — a large move surfaces as changing even for a theoretically stable construct', () => {
  it('a personality facet that moved 30 points reads as changing, not stable', () => {
    const result = compareSnapshots({ orderliness: fs('orderliness', 40) }, { orderliness: fs('orderliness', 70) })
    expect(result.changing.map((c) => c.facetId)).toEqual(['orderliness'])
    expect(result.stable).toEqual([])
  })
})

describe('compareSnapshots — thin evidence on either side of the comparison reads as uncertain, regardless of movement size', () => {
  it('low confidence on the prior snapshot overrides everything else', () => {
    const result = compareSnapshots({ orderliness: fs('orderliness', 60, 'Low') }, { orderliness: fs('orderliness', 62) })
    expect(result.uncertain.map((c) => c.facetId)).toEqual(['orderliness'])
  })
  it('low confidence on the current snapshot overrides everything else', () => {
    const result = compareSnapshots({ orderliness: fs('orderliness', 60) }, { orderliness: fs('orderliness', 62, 'Low') })
    expect(result.uncertain.map((c) => c.facetId)).toEqual(['orderliness'])
  })
})

describe('compareSnapshots — real content sanity: every distinct facet group actually classifies to something', () => {
  it('never falls through to a silent default for a real, registered facet', () => {
    for (const facet of Object.values(FACET_BY_ID)) {
      expect(['stable', 'changing', 'uncertain']).toContain(classifyStability(facet.id))
    }
  })
})
