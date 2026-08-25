import { describe, it, expect } from 'vitest'
import { buildEnvironmentSpec } from './environmentSpec'
import { ENVIRONMENT_SPEC_ITEMS, ENVIRONMENT_FRICTION_ITEMS } from '../../content/copy/environmentSpec'
import { FACET_BY_ID } from '../../content/facets'
import type { EnvironmentSpecItem } from '../../content/copy/environmentSpec'
import type { FacetScore } from '../types'

function fs(facetId: string, score: number, confidence: FacetScore['confidence'] = 'High'): FacetScore {
  return { facetId, label: facetId, score, confidence, evidenceCount: 3, itemsExpected: 3, behavioralEvidenceCount: 0, internalConsistency: 90, contradictionCount: 0 }
}

describe('buildEnvironmentSpec — each line is independently gated to its own facet and score band', () => {
  it('includes a line when the facet score falls inside [min, max)', () => {
    const items: EnvironmentSpecItem[] = [{ id: 'a', facetId: 'fa', min: 60, max: 100.01, phrase: 'High A' }]
    const result = buildEnvironmentSpec({ fa: fs('fa', 75) }, items, [])
    expect(result.required.map((r) => r.id)).toEqual(['a'])
  })
  it('excludes a line when the score falls outside the band', () => {
    const items: EnvironmentSpecItem[] = [{ id: 'a', facetId: 'fa', min: 60, max: 100.01, phrase: 'High A' }]
    const result = buildEnvironmentSpec({ fa: fs('fa', 40) }, items, [])
    expect(result.required).toEqual([])
  })
  it('never fabricates a line for a facet that was never scored', () => {
    const items: EnvironmentSpecItem[] = [{ id: 'a', facetId: 'fa', min: 60, max: 100.01, phrase: 'High A' }]
    expect(buildEnvironmentSpec({}, items, []).required).toEqual([])
  })
})

describe('buildEnvironmentSpec — required and friction are evaluated independently', () => {
  it('the same facet can power both a required line and a friction line at once', () => {
    const spec: EnvironmentSpecItem[] = [{ id: 'auto', facetId: 'autonomy_need', min: 65, max: 100.01, phrase: 'High autonomy' }]
    const friction: EnvironmentSpecItem[] = [{ id: 'micro', facetId: 'autonomy_need', min: 65, max: 100.01, phrase: 'Micromanagement' }]
    const result = buildEnvironmentSpec({ autonomy_need: fs('autonomy_need', 80) }, spec, friction)
    expect(result.required.map((r) => r.phrase)).toEqual(['High autonomy'])
    expect(result.friction.map((r) => r.phrase)).toEqual(['Micromanagement'])
  })
})

describe('buildEnvironmentSpec — adjacent bands on the same facet (e.g. competition) never overlap', () => {
  it('a score of 80 fires only the High Competition band, not Moderate', () => {
    const result = buildEnvironmentSpec({ work_competition: fs('work_competition', 80) })
    const fired = result.required.filter((r) => r.facetId === 'work_competition').map((r) => r.phrase)
    expect(fired).toEqual(['High competition'])
  })
  it('a score of 55 fires only the Moderate Competition band, not High', () => {
    const result = buildEnvironmentSpec({ work_competition: fs('work_competition', 55) })
    const fired = result.required.filter((r) => r.facetId === 'work_competition').map((r) => r.phrase)
    expect(fired).toEqual(['Moderate competition'])
  })
  it('a score of 30 fires neither competition band', () => {
    const result = buildEnvironmentSpec({ work_competition: fs('work_competition', 30) })
    expect(result.required.filter((r) => r.facetId === 'work_competition')).toEqual([])
  })
  it('every declared band is non-overlapping against other bands on the same facet WITHIN its own list — required and friction are evaluated independently, so a shared facet across the two lists is fine by design', () => {
    for (const items of [ENVIRONMENT_SPEC_ITEMS, ENVIRONMENT_FRICTION_ITEMS]) {
      const byFacet = new Map<string, EnvironmentSpecItem[]>()
      for (const item of items) byFacet.set(item.facetId, [...(byFacet.get(item.facetId) ?? []), item])
      for (const [facetId, group] of byFacet) {
        if (group.length < 2) continue
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const overlap = group[i].min < group[j].max && group[j].min < group[i].max
            expect(overlap, `${facetId}: "${group[i].phrase}" and "${group[j].phrase}" bands overlap`).toBe(false)
          }
        }
      }
    }
  })
})

describe('buildEnvironmentSpec — sorts each list by score, most decisive first', () => {
  it('required lines sort with the strongest score first', () => {
    const items: EnvironmentSpecItem[] = [
      { id: 'a', facetId: 'fa', min: 0, max: 100.01, phrase: 'A' },
      { id: 'b', facetId: 'fb', min: 0, max: 100.01, phrase: 'B' },
    ]
    const result = buildEnvironmentSpec({ fa: fs('fa', 40), fb: fs('fb', 90) }, items, [])
    expect(result.required.map((r) => r.id)).toEqual(['b', 'a'])
  })
})

describe('the real ENVIRONMENT_SPEC_ITEMS / ENVIRONMENT_FRICTION_ITEMS content — auditable and matches the example', () => {
  it('every item names a facet that actually exists', () => {
    for (const item of [...ENVIRONMENT_SPEC_ITEMS, ...ENVIRONMENT_FRICTION_ITEMS]) {
      expect(FACET_BY_ID[item.facetId], `${item.id} references unknown facet ${item.facetId}`).toBeTruthy()
    }
  })
  it('matches the exact requested spec vocabulary', () => {
    const phrases = new Set(ENVIRONMENT_SPEC_ITEMS.map((i) => i.phrase))
    for (const expected of [
      'High autonomy', 'Visible consequences', 'Moderate competition', 'Low bureaucracy',
      'Frequent interpersonal variety', 'Clear objectives', 'Flexible method',
      'Opportunity for ownership', 'Short-to-medium feedback loops',
    ]) {
      expect(phrases.has(expected), `missing spec phrase: ${expected}`).toBe(true)
    }
  })
  it('matches the exact requested friction vocabulary', () => {
    const phrases = new Set(ENVIRONMENT_FRICTION_ITEMS.map((i) => i.phrase))
    for (const expected of ['Micromanagement', 'Repetitive maintenance', 'Low accountability', 'Highly political hierarchy']) {
      expect(phrases.has(expected), `missing friction phrase: ${expected}`).toBe(true)
    }
  })
})
