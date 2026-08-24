import { describe, it, expect } from 'vitest'
import { buildEnergyMap, summarizeEnergyMap } from './energyMap'
import { ENERGY_ACTIVITIES } from '../../content/copy/energyMap'
import { FACET_BY_ID } from '../../content/facets'
import type { EnergyActivityDefinition } from '../../content/copy/energyMap'
import type { FacetScore } from '../types'

function fs(facetId: string, score: number, confidence: FacetScore['confidence'] = 'High'): FacetScore {
  return { facetId, label: facetId, score, confidence, evidenceCount: 4, itemsExpected: 4, behavioralEvidenceCount: 0, internalConsistency: 90, contradictionCount: 0 }
}

describe('buildEnergyMap — every activity lands in exactly one bucket', () => {
  const activities: EnergyActivityDefinition[] = [
    { id: 'a', label: 'A', facetId: 'facet_a' },
    { id: 'b', label: 'B', facetId: 'facet_b' },
    { id: 'c', label: 'C', facetId: 'facet_c' },
  ]

  it('classifies >=60 as energizes, <=40 as drains, and the middle as neutral', () => {
    const facetScores = { facet_a: fs('facet_a', 75), facet_b: fs('facet_b', 50), facet_c: fs('facet_c', 20) }
    const map = buildEnergyMap(facetScores, activities)
    expect(map.energizes.map((r) => r.id)).toEqual(['a'])
    expect(map.neutral.map((r) => r.id)).toEqual(['b'])
    expect(map.drains.map((r) => r.id)).toEqual(['c'])
  })

  it('treats the boundary values themselves as energizes/drains, not neutral', () => {
    const facetScores = { facet_a: fs('facet_a', 60), facet_b: fs('facet_b', 50), facet_c: fs('facet_c', 40) }
    const map = buildEnergyMap(facetScores, activities)
    expect(map.energizes.map((r) => r.id)).toEqual(['a'])
    expect(map.drains.map((r) => r.id)).toEqual(['c'])
  })

  it('marks an activity unscored, never guessed, when its facet has no data', () => {
    const facetScores = { facet_a: fs('facet_a', 75) }
    const map = buildEnergyMap(facetScores, activities)
    expect(map.unscored.map((u) => u.id)).toEqual(['b', 'c'])
    expect(map.energizes.map((r) => r.id)).toEqual(['a'])
  })
})

describe('buildEnergyMap — inverted activities flip the read, since a high source score means the opposite for them', () => {
  it('a low work_task_variety score means repetition ENERGIZES (or is at least tolerated), not drains', () => {
    const activities: EnergyActivityDefinition[] = [{ id: 'repetition', label: 'Repetition', facetId: 'work_task_variety', invert: true }]
    const lowVariety = buildEnergyMap({ work_task_variety: fs('work_task_variety', 10) }, activities)
    expect(lowVariety.energizes[0]?.id).toBe('repetition')
    expect(lowVariety.energizes[0]?.score).toBe(90) // 100 - 10

    const highVariety = buildEnergyMap({ work_task_variety: fs('work_task_variety', 90) }, activities)
    expect(highVariety.drains[0]?.id).toBe('repetition')
    expect(highVariety.drains[0]?.score).toBe(10)
  })
})

describe('buildEnergyMap — is honest about which activities share a single underlying signal', () => {
  it('lists sibling activities that read off the same facet, and none for a facet used only once', () => {
    const activities: EnergyActivityDefinition[] = [
      { id: 'persuading', label: 'Persuading', facetId: 'shared_energy' },
      { id: 'negotiating', label: 'Negotiating', facetId: 'shared_energy' },
      { id: 'leading', label: 'Leading', facetId: 'shared_energy' },
      { id: 'building', label: 'Building', facetId: 'solo_energy' },
    ]
    const map = buildEnergyMap({ shared_energy: fs('shared_energy', 80), solo_energy: fs('solo_energy', 80) }, activities)
    const persuading = map.energizes.find((r) => r.id === 'persuading')
    const building = map.energizes.find((r) => r.id === 'building')
    expect(persuading?.sharesSignalWith.sort()).toEqual(['Leading', 'Negotiating'])
    expect(building?.sharesSignalWith).toEqual([])
  })
})

describe('buildEnergyMap — sort order puts the most decisive entries first in each bucket', () => {
  it('energizes sorts highest score first; drains sorts most-draining (lowest score) first', () => {
    const activities: EnergyActivityDefinition[] = [
      { id: 'a', label: 'A', facetId: 'fa' }, { id: 'b', label: 'B', facetId: 'fb' },
      { id: 'c', label: 'C', facetId: 'fc' }, { id: 'd', label: 'D', facetId: 'fd' },
    ]
    const map = buildEnergyMap({ fa: fs('fa', 65), fb: fs('fb', 95), fc: fs('fc', 5), fd: fs('fd', 35) }, activities)
    expect(map.energizes.map((r) => r.id)).toEqual(['b', 'a'])
    expect(map.drains.map((r) => r.id)).toEqual(['c', 'd'])
  })
})

describe('summarizeEnergyMap — names the two ends, never the whole map', () => {
  it('names both the top energizer and the top drainer when both exist', () => {
    const map = buildEnergyMap(
      { fa: fs('fa', 90), fb: fs('fb', 10) },
      [{ id: 'a', label: 'Alpha', facetId: 'fa' }, { id: 'b', label: 'Beta', facetId: 'fb' }],
    )
    const summary = summarizeEnergyMap(map)
    expect(summary).toMatch(/alpha/i)
    expect(summary).toMatch(/beta/i)
  })
  it('returns null when nothing at all is scored', () => {
    const map = buildEnergyMap({}, [{ id: 'a', label: 'Alpha', facetId: 'fa' }])
    expect(summarizeEnergyMap(map)).toBeNull()
  })
})

describe('the real ENERGY_ACTIVITIES content — auditable and matches the requested vocabulary', () => {
  it('every activity names a facet that actually exists', () => {
    for (const a of ENERGY_ACTIVITIES) {
      expect(FACET_BY_ID[a.facetId], `${a.id} references unknown facet ${a.facetId}`).toBeTruthy()
    }
  })
  it('has no duplicate activity ids', () => {
    const ids = ENERGY_ACTIVITIES.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('covers the requested activity vocabulary', () => {
    const ids = new Set(ENERGY_ACTIVITIES.map((a) => a.id))
    for (const expected of [
      'persuading', 'teaching', 'building', 'analyzing', 'organizing', 'competing', 'supporting', 'designing',
      'maintaining', 'leading', 'negotiating', 'researching', 'performing', 'problem-solving', 'repetition', 'planning',
    ]) {
      expect(ids.has(expected), `missing activity: ${expected}`).toBe(true)
    }
  })
})
