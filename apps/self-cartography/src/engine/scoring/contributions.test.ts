import { describe, it, expect } from 'vitest'
import { computeContributions, likertToPoints } from './contributions'
import type {
  StatementItem, TradeoffItem, ForcedChoiceItem, RankingItem, ScenarioItem,
  BehavioralHistoryScaleItem, BehavioralHistoryCategoricalItem, AspirationalPairItem,
  EvidencePromptItem, Response, Item,
} from '../types'

const AGREE_5 = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' },
]

const AGREE_7 = Array.from({ length: 7 }, (_, i) => ({ value: i + 1, label: String(i + 1) }))

function mkResponse(value: Response['value']): Response {
  return { itemId: 'x', value, firstAnsweredAt: 1, lastAnsweredAt: 1, responseTimeMs: 1000, revisitCount: 0 }
}

describe('likertToPoints', () => {
  it('maps the bottom of a 5-point scale to 0', () => {
    expect(likertToPoints(1)).toBe(0)
  })
  it('maps the top of a 5-point scale to 100', () => {
    expect(likertToPoints(5)).toBe(100)
  })
  it('maps the midpoint of a 5-point scale to 50', () => {
    expect(likertToPoints(3)).toBe(50)
  })
  it('reverses the mapping when reverseScored is true', () => {
    expect(likertToPoints(5, true)).toBe(0)
    expect(likertToPoints(1, true)).toBe(100)
    expect(likertToPoints(3, true)).toBe(50)
  })
  it('honors a custom scale max (a 7-point scale)', () => {
    expect(likertToPoints(1, undefined, 7)).toBe(0)
    expect(likertToPoints(7, undefined, 7)).toBe(100)
    expect(likertToPoints(4, undefined, 7)).toBeCloseTo(50, 0)
  })
})

describe('computeContributions — positive and reverse scoring (likert5/likertFrequency/confidence)', () => {
  const forward: StatementItem = { id: 'a', format: 'likert5', instrumentId: 'i', facetId: 'f', prompt: 'p', options: AGREE_5 }
  const reverse: StatementItem = { id: 'b', format: 'likert5', instrumentId: 'i', facetId: 'f', prompt: 'p', options: AGREE_5, reverseScored: true }

  it('scores a forward-keyed item positively — high agreement, high points', () => {
    expect(computeContributions(forward, mkResponse(5))).toEqual([{ facetId: 'f', points: 100, weight: 1 }])
  })
  it('scores a reverse-keyed item inversely — high agreement, low points', () => {
    expect(computeContributions(reverse, mkResponse(5))).toEqual([{ facetId: 'f', points: 0, weight: 1 }])
  })
  it('scores a reverse-keyed item\'s low agreement as high points', () => {
    expect(computeContributions(reverse, mkResponse(1))).toEqual([{ facetId: 'f', points: 100, weight: 1 }])
  })
  it('scores a plain likertFrequency item forward — reverseScored isn\'t even a legal field on this format', () => {
    // StatementItem is a discriminated union now: `reverseScored` only
    // type-checks on format:'likert5'. A likertFrequency/confidence item
    // that tried to set it would fail to compile, not silently no-op at
    // runtime — this test just confirms the plain forward-scoring path.
    const freq: StatementItem = { id: 'c', format: 'likertFrequency', instrumentId: 'i', facetId: 'f', prompt: 'p', options: AGREE_5 }
    expect(computeContributions(freq, mkResponse(5))).toEqual([{ facetId: 'f', points: 100, weight: 1 }])
  })
  it('returns no contribution for a malformed (non-numeric) response value', () => {
    expect(computeContributions(forward, mkResponse('not a number'))).toEqual([])
  })
})

describe('computeContributions — behavioralHistory (scale and categorical)', () => {
  const scale: BehavioralHistoryScaleItem = { id: 'a', format: 'behavioralHistory', instrumentId: 'i', facetId: 'f', prompt: 'p', options: AGREE_5 }
  const categorical: BehavioralHistoryCategoricalItem = {
    id: 'b', format: 'behavioralHistory', answerMode: 'categorical', instrumentId: 'i', facetId: 'f', prompt: 'p',
    options: [{ id: 'none', label: 'None', weight: 0 }, { id: 'lots', label: 'Lots', weight: 100 }],
  }

  it('scores a scale-mode item the same way as a likert5 item', () => {
    expect(computeContributions(scale, mkResponse(5))).toEqual([{ facetId: 'f', points: 100, weight: 1 }])
  })
  it('scale mode never reverse-scores — the format has no reverseScored field at all', () => {
    expect(computeContributions(scale, mkResponse(1))).toEqual([{ facetId: 'f', points: 0, weight: 1 }])
  })
  it('scores a categorical item using the matched option\'s weight directly', () => {
    expect(computeContributions(categorical, mkResponse('lots'))).toEqual([{ facetId: 'f', points: 100, weight: 1 }])
    expect(computeContributions(categorical, mkResponse('none'))).toEqual([{ facetId: 'f', points: 0, weight: 1 }])
  })
  it('returns no contribution when a categorical answer matches no option', () => {
    expect(computeContributions(categorical, mkResponse('nonexistent'))).toEqual([])
  })
})

describe('computeContributions — tradeoff (forced-choice contribution)', () => {
  it('bipolar tradeoff: the chosen option\'s poleValue lands the shared facet there, with no competing 0-contribution', () => {
    const item: TradeoffItem = {
      id: 't', format: 'tradeoff', instrumentId: 'i', prompt: 'p',
      optionA: { label: 'A', facetId: 'tension', poleValue: 100 },
      optionB: { label: 'B', facetId: 'tension', poleValue: 0 },
    }
    expect(computeContributions(item, mkResponse('A'))).toEqual([{ facetId: 'tension', points: 100, weight: 1 }])
    expect(computeContributions(item, mkResponse('B'))).toEqual([{ facetId: 'tension', points: 0, weight: 1 }])
  })
  it('bipolar tradeoff without an explicit poleValue defaults the chosen side to 100', () => {
    const item: TradeoffItem = {
      id: 't', format: 'tradeoff', instrumentId: 'i', prompt: 'p',
      optionA: { label: 'A', facetId: 'tension' },
      optionB: { label: 'B', facetId: 'tension' },
    }
    expect(computeContributions(item, mkResponse('A'))).toEqual([{ facetId: 'tension', points: 100, weight: 1 }])
  })
  it('non-bipolar (two different facets): the chosen facet scores 100, the passed-over one scores 0', () => {
    const item: TradeoffItem = {
      id: 't', format: 'tradeoff', instrumentId: 'i', prompt: 'p',
      optionA: { label: 'A', facetId: 'facetA' },
      optionB: { label: 'B', facetId: 'facetB' },
    }
    expect(computeContributions(item, mkResponse('A'))).toEqual([
      { facetId: 'facetA', points: 100, weight: 1 },
      { facetId: 'facetB', points: 0, weight: 1 },
    ])
    expect(computeContributions(item, mkResponse('B'))).toEqual([
      { facetId: 'facetB', points: 100, weight: 1 },
      { facetId: 'facetA', points: 0, weight: 1 },
    ])
  })
  it('returns no contribution for a malformed response value', () => {
    const item: TradeoffItem = {
      id: 't', format: 'tradeoff', instrumentId: 'i', prompt: 'p',
      optionA: { label: 'A', facetId: 'facetA' }, optionB: { label: 'B', facetId: 'facetB' },
    }
    expect(computeContributions(item, mkResponse(42))).toEqual([])
  })
})

describe('computeContributions — forcedChoiceRank (rank contribution across statements)', () => {
  const item: ForcedChoiceItem = {
    id: 'r', format: 'forcedChoiceRank', instrumentId: 'i', prompt: 'p',
    statements: [
      { id: 's1', label: 'One', facetId: 'f1' },
      { id: 's2', label: 'Two', facetId: 'f2' },
      { id: 's3', label: 'Three', facetId: 'f3' },
    ],
  }

  it('spreads points 100 → 0 across rank position for a 3-item set', () => {
    expect(computeContributions(item, mkResponse(['s1', 's2', 's3']))).toEqual([
      { facetId: 'f1', points: 100, weight: 1 },
      { facetId: 'f2', points: 50, weight: 1 },
      { facetId: 'f3', points: 0, weight: 1 },
    ])
  })
  it('reordering the ranking changes which facet gets which position score', () => {
    expect(computeContributions(item, mkResponse(['s3', 's1', 's2']))).toEqual([
      { facetId: 'f3', points: 100, weight: 1 },
      { facetId: 'f1', points: 50, weight: 1 },
      { facetId: 'f2', points: 0, weight: 1 },
    ])
  })
  it('a single-statement rank (n=1) scores that one statement 100, avoiding a divide-by-zero', () => {
    const single: ForcedChoiceItem = { id: 'r2', format: 'forcedChoiceRank', instrumentId: 'i', prompt: 'p', statements: [{ id: 's1', label: 'One', facetId: 'f1' }] }
    expect(computeContributions(single, mkResponse(['s1']))).toEqual([{ facetId: 'f1', points: 100, weight: 1 }])
  })
  it('ignores an unknown statement id rather than throwing', () => {
    expect(computeContributions(item, mkResponse(['s1', 'unknown', 's3']))).toEqual([
      { facetId: 'f1', points: 100, weight: 1 },
      { facetId: 'f3', points: 0, weight: 1 },
    ])
  })
})

describe('computeContributions — ranking (weighted items, and a narrowed subset)', () => {
  it('honors each option\'s own weight, not just its rank position', () => {
    const item: RankingItem = {
      id: 'r', format: 'ranking', instrumentId: 'i', facetId: 'fallback', prompt: 'p',
      options: [
        { id: 'a', label: 'A', weight: 2, facetId: 'f1' },
        { id: 'b', label: 'B', weight: 1, facetId: 'f2' },
      ],
    }
    // both ranked, a first — weight multiplies the position-derived points
    const [a, b] = computeContributions(item, mkResponse(['a', 'b']))
    expect(a).toEqual({ facetId: 'f1', points: 100, weight: 2 })
    expect(b).toEqual({ facetId: 'f2', points: 0, weight: 1 })
  })
  it('falls back to the item\'s own facetId when an option doesn\'t set its own', () => {
    const item: RankingItem = {
      id: 'r', format: 'ranking', instrumentId: 'i', facetId: 'shared', prompt: 'p',
      options: [{ id: 'a', label: 'A', weight: 1 }, { id: 'b', label: 'B', weight: 1 }],
    }
    const [a] = computeContributions(item, mkResponse(['a', 'b']))
    expect(a.facetId).toBe('shared')
  })
  it('spreads position points across only what was actually ranked, not the full candidate pool (pick-3-of-9)', () => {
    const item: RankingItem = {
      id: 'r', format: 'ranking', instrumentId: 'i', facetId: 'fallback', prompt: 'p',
      options: Array.from({ length: 9 }, (_, i) => ({ id: `o${i}`, label: `O${i}`, weight: 1, facetId: `f${i}` })),
    }
    // Only 3 of the 9 were selected and ranked — n must be 3 (the ranked
    // count), not 9 (the pool size), or the position spread is wrong.
    const contributions = computeContributions(item, mkResponse(['o0', 'o4', 'o8']))
    expect(contributions).toEqual([
      { facetId: 'f0', points: 100, weight: 1 },
      { facetId: 'f4', points: 50, weight: 1 },
      { facetId: 'f8', points: 0, weight: 1 },
    ])
  })
})

describe('computeContributions — scenario contribution', () => {
  const item: ScenarioItem = {
    id: 's', format: 'scenario', instrumentId: 'i', facetId: 'f', scenario: 'Scenario text',
    choices: [
      { id: 'a', label: 'A', weight: 90 },
      { id: 'b', label: 'B', weight: 10 },
    ],
  }

  it('uses the chosen choice\'s weight directly as the facet\'s points', () => {
    expect(computeContributions(item, mkResponse({ choiceId: 'a', confidence: 3 }))).toEqual([{ facetId: 'f', points: 90, weight: 1 }])
    expect(computeContributions(item, mkResponse({ choiceId: 'b', confidence: 5 }))).toEqual([{ facetId: 'f', points: 10, weight: 1 }])
  })
  it('does not let stated confidence change the scoring formula', () => {
    const low = computeContributions(item, mkResponse({ choiceId: 'a', confidence: 1 }))
    const high = computeContributions(item, mkResponse({ choiceId: 'a', confidence: 5 }))
    expect(low).toEqual(high)
  })
  it('returns no contribution for a malformed scenario value', () => {
    expect(computeContributions(item, mkResponse('a'))).toEqual([])
    expect(computeContributions(item, mkResponse({ choiceId: 'does-not-exist', confidence: 3 }))).toEqual([])
  })
})

describe('computeContributions — aspirationalPair (only the "current" half scores)', () => {
  const item: AspirationalPairItem = { id: 'ap', format: 'aspirationalPair', instrumentId: 'i', facetId: 'f', prompt: 'p', options: AGREE_7 }

  it('scores only "current", ignoring "desired" entirely', () => {
    expect(computeContributions(item, mkResponse({ current: 4, desired: 7 }))).toEqual([{ facetId: 'f', points: 50, weight: 1 }])
  })
  it('uses the item\'s own option count as the scale max, not a hardcoded 5 or 7', () => {
    const shortScale: AspirationalPairItem = { id: 'ap2', format: 'aspirationalPair', instrumentId: 'i', facetId: 'f', prompt: 'p', options: AGREE_5 }
    expect(computeContributions(shortScale, mkResponse({ current: 3, desired: 1 }))).toEqual([{ facetId: 'f', points: 50, weight: 1 }])
  })
})

describe('computeContributions — never-scored formats', () => {
  it('evidencePrompt and openText never contribute a score', () => {
    const item: EvidencePromptItem = { id: 'e', format: 'evidencePrompt', instrumentId: 'i', prompt: 'p', optional: true }
    expect(computeContributions(item, mkResponse('anything the respondent typed'))).toEqual([])
  })
})

describe('computeContributions — unrecognized item format', () => {
  it('returns an empty array rather than throwing on a format the switch does not recognize', () => {
    const item = { id: 'x', format: 'not-a-real-format', instrumentId: 'i', prompt: 'p' } as unknown as Item
    expect(computeContributions(item, mkResponse('anything'))).toEqual([])
  })
})
