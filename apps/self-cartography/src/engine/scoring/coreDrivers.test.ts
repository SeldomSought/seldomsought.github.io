import { describe, it, expect } from 'vitest'
import { identifyCoreDrivers } from './coreDrivers'
import { CORE_DRIVER_DEFINITIONS } from '../../content/copy/coreDrivers'
import { FACET_BY_ID } from '../../content/facets'
import { ALL_ITEMS } from '../../content/instruments'
import type { CoreDriverDefinition } from '../../content/copy/coreDrivers'
import type { FacetScore, Response, Item } from '../types'

function fs(facetId: string, score: number, overrides: Partial<FacetScore> = {}): FacetScore {
  return { facetId, label: facetId, score, confidence: 'High', evidenceCount: 4, itemsExpected: 4, behavioralEvidenceCount: 0, internalConsistency: 90, contradictionCount: 0, ...overrides }
}

const CONFIDENCE_RANK: Record<string, number> = { 'Very Low': 0, Low: 1, Moderate: 2, High: 3, 'Very High': 4 }

function itemsForFacet(facetId: string): Item[] {
  return ALL_ITEMS.filter((i) => {
    if ('facetId' in i && i.facetId === facetId) return true
    if (i.format === 'tradeoff') return i.optionA.facetId === facetId || i.optionB.facetId === facetId
    return false
  })
}

function answer(item: Item): Response {
  const now = Date.now()
  const base = { itemId: item.id, firstAnsweredAt: now, lastAnsweredAt: now, responseTimeMs: 3000, revisitCount: 0 }
  switch (item.format) {
    case 'likert5': case 'likertFrequency': case 'confidence':
      return { ...base, value: item.options[item.options.length - 1].value }
    case 'tradeoff':
      return { ...base, value: item.optionA.facetId }
    case 'ranking':
      return { ...base, value: item.options.map((o) => o.id) }
    case 'forcedChoiceRank':
      return { ...base, value: item.statements.map((s) => s.id) }
    case 'scenario':
      return { ...base, value: { choiceId: item.choices[0].id, confidence: 80 } }
    case 'behavioralHistory':
      return { ...base, value: item.answerMode === 'categorical' ? item.options[item.options.length - 1].id : item.options[item.options.length - 1].value }
    case 'aspirationalPair':
      return { ...base, value: { current: 80, desired: 85 } }
    default:
      return { ...base, value: 'n/a' }
  }
}

function answerAll(facetId: string): Record<string, Response> {
  return Object.fromEntries(itemsForFacet(facetId).map((item) => [item.id, answer(item)]))
}

const TEST_DRIVER: CoreDriverDefinition = {
  id: 'test-driver', label: 'Test Driver', description: 'You consistently do the test thing.',
  whenHealthy: ['a', 'b'], whenExcessive: 'too much of the test thing',
  conditions: [
    { facetId: 'autonomy_need', direction: 'high', threshold: 65 },
    { facetId: 'self_direction', direction: 'high', threshold: 65 },
    { facetId: 'work_creative_freedom', direction: 'high', threshold: 60 },
    { facetId: 'desire_belonging_independence', direction: 'low', threshold: 60 },
  ],
  minimumMet: 3,
}

describe('identifyCoreDrivers — only surfaces a driver on real convergence', () => {
  it('surfaces when at least minimumMet conditions clear their threshold', () => {
    const facetScores = {
      autonomy_need: fs('autonomy_need', 80),
      self_direction: fs('self_direction', 75),
      work_creative_freedom: fs('work_creative_freedom', 70),
    }
    const result = identifyCoreDrivers(facetScores, {}, [TEST_DRIVER])
    expect(result).toHaveLength(1)
    expect(result[0].conditionsMet).toBe(3)
  })

  it('does not surface when fewer than minimumMet conditions clear their threshold', () => {
    const facetScores = {
      autonomy_need: fs('autonomy_need', 80),
      self_direction: fs('self_direction', 30),
      work_creative_freedom: fs('work_creative_freedom', 20),
    }
    expect(identifyCoreDrivers(facetScores, {}, [TEST_DRIVER])).toEqual([])
  })

  it('never surfaces from zero evidence', () => {
    expect(identifyCoreDrivers({}, {}, [TEST_DRIVER])).toEqual([])
  })
})

describe('identifyCoreDrivers — importance, confidence, and behavioral evidence are all honest reads of the underlying facets', () => {
  it('importance is the mean of only the facets that actually converged, not diluted by ones that were merely scored', () => {
    const facetScores = {
      autonomy_need: fs('autonomy_need', 90), // met
      self_direction: fs('self_direction', 70), // met
      work_creative_freedom: fs('work_creative_freedom', 62), // met
      desire_belonging_independence: fs('desire_belonging_independence', 50), // scored, NOT met (threshold needs <=40) — shown for context, doesn't drag importance down
    }
    const result = identifyCoreDrivers(facetScores, {}, [TEST_DRIVER])
    expect(result[0].importance).toBe(Math.round((90 + 70 + 62) / 3))
    expect(result[0].conditionsMet).toBe(3)
    expect(result[0].supportingFacets).toHaveLength(4) // still visible in the open ledger
    expect(result[0].supportingFacets.find((f) => f.facetId === 'desire_belonging_independence')?.met).toBe(false)
  })

  it('sums behavioralEvidenceCount only across facets that actually contributed', () => {
    const facetScores = {
      autonomy_need: fs('autonomy_need', 80, { behavioralEvidenceCount: 2 }),
      self_direction: fs('self_direction', 75, { behavioralEvidenceCount: 1 }),
      work_creative_freedom: fs('work_creative_freedom', 70, { behavioralEvidenceCount: 0 }),
    }
    const result = identifyCoreDrivers(facetScores, {}, [TEST_DRIVER])
    expect(result[0].behavioralEvidenceCount).toBe(3)
  })

  it('confidence is capped by the single weakest contributing facet’s own construct confidence', () => {
    // self_direction is held identically well-corroborated (every real item,
    // five different methods) in both cases — the only thing that varies
    // between the two calls is how much evidence backs autonomy_need.
    const twoConditionDriver: CoreDriverDefinition = {
      ...TEST_DRIVER, id: 'conf-test',
      conditions: [
        { facetId: 'autonomy_need', direction: 'high', threshold: 65 },
        { facetId: 'self_direction', direction: 'high', threshold: 65 },
      ],
      minimumMet: 2,
    }
    const autonomyItems = itemsForFacet('autonomy_need') // 5 real items behind this facet
    const selfDirectionResponses = answerAll('self_direction')

    // facetScore.evidenceCount/itemsExpected (the confidence engine's volume
    // read) has to agree with how many of the real items actually got
    // answered below, or the two aren't comparable — same score (still
    // clears the driver's threshold either way), only evidence depth differs.
    const thinScores = { autonomy_need: fs('autonomy_need', 80, { evidenceCount: 1, itemsExpected: 5 }), self_direction: fs('self_direction', 75) }
    const richScores = { autonomy_need: fs('autonomy_need', 80, { evidenceCount: 5, itemsExpected: 5 }), self_direction: fs('self_direction', 75) }
    const thinResponses: Record<string, Response> = { [autonomyItems[0].id]: answer(autonomyItems[0]), ...selfDirectionResponses }
    const richResponses: Record<string, Response> = { ...answerAll('autonomy_need'), ...selfDirectionResponses }

    const thinResult = identifyCoreDrivers(thinScores, thinResponses, [twoConditionDriver])
    const richResult = identifyCoreDrivers(richScores, richResponses, [twoConditionDriver])
    expect(CONFIDENCE_RANK[thinResult[0].confidence]).toBeLessThan(CONFIDENCE_RANK[richResult[0].confidence])
  })
})

describe('identifyCoreDrivers — ranks by importance and caps at 6', () => {
  it('sorts strongest driver first', () => {
    const weaker: CoreDriverDefinition = { ...TEST_DRIVER, id: 'weaker' }
    const stronger: CoreDriverDefinition = {
      ...TEST_DRIVER, id: 'stronger',
      conditions: [
        { facetId: 'stimulation', direction: 'high', threshold: 60 },
        { facetId: 'novelty_seeking', direction: 'high', threshold: 60 },
        { facetId: 'work_task_variety', direction: 'high', threshold: 60 },
      ],
      minimumMet: 3,
    }
    const facetScores = {
      autonomy_need: fs('autonomy_need', 66), self_direction: fs('self_direction', 66), work_creative_freedom: fs('work_creative_freedom', 61),
      stimulation: fs('stimulation', 95), novelty_seeking: fs('novelty_seeking', 95), work_task_variety: fs('work_task_variety', 95),
    }
    const result = identifyCoreDrivers(facetScores, {}, [weaker, stronger])
    expect(result.map((r) => r.id)).toEqual(['stronger', 'weaker'])
  })

  it('never returns more than 6 drivers even if every definition converges', () => {
    const facetScores: Record<string, FacetScore> = {}
    for (const def of CORE_DRIVER_DEFINITIONS) {
      for (const cond of def.conditions) {
        const score = cond.direction === 'high' ? 95 : 5
        facetScores[cond.facetId] = fs(cond.facetId, score)
      }
    }
    const result = identifyCoreDrivers(facetScores, {})
    expect(result.length).toBeLessThanOrEqual(6)
  })
})

describe('the real CORE_DRIVER_DEFINITIONS content — auditable and matches the requested vocabulary', () => {
  it('every condition names a facet that actually exists', () => {
    for (const def of CORE_DRIVER_DEFINITIONS) {
      for (const cond of def.conditions) {
        expect(FACET_BY_ID[cond.facetId], `${def.id} references unknown facet ${cond.facetId}`).toBeTruthy()
      }
    }
  })
  it('every driver has at least 3 conditions and a sensible minimumMet', () => {
    for (const def of CORE_DRIVER_DEFINITIONS) {
      expect(def.conditions.length).toBeGreaterThanOrEqual(3)
      expect(def.minimumMet).toBeGreaterThanOrEqual(2)
      expect(def.minimumMet).toBeLessThanOrEqual(def.conditions.length)
    }
  })
  it('every driver names at least 2 healthy expressions and exactly one excessive-expression phrase', () => {
    for (const def of CORE_DRIVER_DEFINITIONS) {
      expect(def.whenHealthy.length).toBeGreaterThanOrEqual(2)
      expect(def.whenExcessive.length).toBeGreaterThan(0)
    }
  })
  it('has no duplicate driver ids', () => {
    const ids = CORE_DRIVER_DEFINITIONS.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('covers the requested motivational vocabulary', () => {
    const labels = new Set(CORE_DRIVER_DEFINITIONS.map((d) => d.label))
    for (const expected of ['Autonomy', 'Mastery', 'Influence', 'Security', 'Novelty', 'Belonging', 'Creation', 'Status', 'Impact', 'Competition']) {
      expect(labels.has(expected), `missing driver: ${expected}`).toBe(true)
    }
  })
})
