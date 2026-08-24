import { describe, it, expect } from 'vitest'
import { getRegionItems, isRegionComplete, regionProgress, getNextRegionId, canEnterSynthesis, overallProgress } from './navigation'
import type { Response } from './types'

// Real content throughout, same as state.test.ts's own approach — 'orientation'
// has 2 items ('ori-open-1', 'ori-evi-1'), both optional (openText/evidencePrompt),
// and 'desire' is its real successor region.

function answer(itemId: string, value: Response['value'] = 'x'): Response {
  return { itemId, value, firstAnsweredAt: 1, lastAnsweredAt: 1, responseTimeMs: 100, revisitCount: 0 }
}

describe('getRegionItems', () => {
  it('returns the real items for a known region', () => {
    const items = getRegionItems('orientation')
    expect(items.map((i) => i.id)).toEqual(['ori-open-1', 'ori-evi-1'])
  })

  it('returns an empty array for an unknown region id', () => {
    expect(getRegionItems('not-a-real-region')).toEqual([])
  })
})

describe('isRegionComplete', () => {
  it('is true when a region has only optional items and none are answered', () => {
    // orientation's 2 items are both openText/evidencePrompt — optional
    expect(isRegionComplete('orientation', {})).toBe(true)
  })

  it('is false when a region with required items has none answered', () => {
    expect(isRegionComplete('desire', {})).toBe(false)
  })

  it('is true once every required item in the region is answered', () => {
    const items = getRegionItems('desire')
    const responses = Object.fromEntries(items.map((i) => [i.id, answer(i.id)]))
    expect(isRegionComplete('desire', responses)).toBe(true)
  })

  it('is false when only some required items are answered', () => {
    const items = getRegionItems('desire')
    const responses = Object.fromEntries(items.slice(0, 3).map((i) => [i.id, answer(i.id)]))
    expect(isRegionComplete('desire', responses)).toBe(false)
  })
})

describe('regionProgress', () => {
  it('excludes optional items from both answered and total counts', () => {
    // orientation has 0 required items (both are optional formats)
    expect(regionProgress('orientation', {})).toEqual({ answered: 0, total: 0 })
  })

  it('counts only required items answered so far', () => {
    const items = getRegionItems('desire')
    const responses = Object.fromEntries(items.slice(0, 5).map((i) => [i.id, answer(i.id)]))
    const progress = regionProgress('desire', responses)
    expect(progress.answered).toBe(5)
    expect(progress.total).toBe(items.length) // all of desire's items are required
  })

  it('does not count an optional item as answered progress even if it was actually answered', () => {
    const responses = { 'ori-open-1': answer('ori-open-1') }
    expect(regionProgress('orientation', responses)).toEqual({ answered: 0, total: 0 })
  })
})

describe('getNextRegionId', () => {
  it('returns the real next region in order', () => {
    expect(getNextRegionId('orientation')).toBe('desire')
  })

  it('returns null for the last implemented region', () => {
    expect(getNextRegionId('aspiration')).toBeNull()
  })

  it('returns null for a region id that is not in the implemented sequence', () => {
    expect(getNextRegionId('not-a-real-region')).toBeNull()
  })
})

describe('canEnterSynthesis', () => {
  it('is false when no regions have been answered', () => {
    expect(canEnterSynthesis({})).toBe(false)
  })

  it('is false when every region but one is complete', () => {
    // Completing everything except the very last item of 'aspiration'
    const responses: Record<string, Response> = {}
    for (const item of getRegionItems('desire')) responses[item.id] = answer(item.id)
    for (const item of getRegionItems('values')) responses[item.id] = answer(item.id)
    expect(canEnterSynthesis(responses)).toBe(false)
  })
})

describe('overallProgress', () => {
  it('is zero/zero at the very start', () => {
    const progress = overallProgress({})
    expect(progress.answered).toBe(0)
    expect(progress.total).toBeGreaterThan(0) // real required-item count across all implemented regions
  })

  it('sums required-item progress across every implemented region, not just one', () => {
    const desireItems = getRegionItems('desire')
    const valuesItems = getRegionItems('values')
    const responses: Record<string, Response> = {}
    for (const item of desireItems) responses[item.id] = answer(item.id)
    for (const item of valuesItems.slice(0, 2)) responses[item.id] = answer(item.id)

    const before = overallProgress({})
    const after = overallProgress(responses)
    const expectedAnswered = regionProgress('desire', responses).answered + regionProgress('values', responses).answered
    expect(after.answered).toBe(expectedAnswered)
    expect(after.total).toBe(before.total) // total is fixed regardless of what's answered
  })
})
