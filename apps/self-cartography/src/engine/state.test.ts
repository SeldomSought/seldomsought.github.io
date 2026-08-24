import { describe, it, expect } from 'vitest'
import { assessmentReducer, initialState } from './state'
import type { AssessmentState } from './state'

// 'orientation' (2 real items, 'ori-open-1' then 'ori-evi-1') and 'desire'
// (next region) are real content — using it directly rather than a fixture
// keeps this test honest about how getRegionItems/getNextRegionId actually
// behave, the same way the rest of this session's tests reach for real
// content wherever the module under test depends on it.

function withView(view: AssessmentState['view']): AssessmentState {
  return { ...initialState, view }
}

describe('assessmentReducer — NEXT_ITEM stamps regionCompletedAt exactly at a region’s own completion moment', () => {
  it('does NOT stamp when advancing between items within a region', () => {
    const state = withView({ type: 'item', regionId: 'orientation', itemIndex: 0 })
    const next = assessmentReducer(state, { type: 'NEXT_ITEM' })
    expect(next.view).toEqual({ type: 'item', regionId: 'orientation', itemIndex: 1 })
    expect(next.regionCompletedAt.orientation).toBeUndefined()
  })

  it('stamps regionCompletedAt for the region when its last item is answered and advances to the next region', () => {
    const state = withView({ type: 'item', regionId: 'orientation', itemIndex: 1 }) // the last of 2 items
    const before = Date.now()
    const next = assessmentReducer(state, { type: 'NEXT_ITEM' })
    expect(next.view).toEqual({ type: 'regionIntro', regionId: 'desire' })
    expect(next.regionCompletedAt.orientation).toBeGreaterThanOrEqual(before)
  })

  it('leaves other regions’ stamps untouched when a different region completes', () => {
    const state: AssessmentState = {
      ...withView({ type: 'item', regionId: 'orientation', itemIndex: 1 }),
      regionCompletedAt: { desire: 12345 },
    }
    const next = assessmentReducer(state, { type: 'NEXT_ITEM' })
    expect(next.regionCompletedAt.desire).toBe(12345)
    expect(next.regionCompletedAt.orientation).toBeDefined()
  })
})

describe('assessmentReducer — RETAKE_REGION clears exactly one region’s responses and stamp, nothing else', () => {
  it('removes only the responses belonging to the retaken region', () => {
    const state: AssessmentState = {
      ...initialState,
      responses: {
        'ori-open-1': { itemId: 'ori-open-1', value: 'a', firstAnsweredAt: 1, lastAnsweredAt: 1, responseTimeMs: 100, revisitCount: 0 },
        'ori-evi-1': { itemId: 'ori-evi-1', value: 'b', firstAnsweredAt: 1, lastAnsweredAt: 1, responseTimeMs: 100, revisitCount: 0 },
        'des-tr-freedom': { itemId: 'des-tr-freedom', value: 'c', firstAnsweredAt: 1, lastAnsweredAt: 1, responseTimeMs: 100, revisitCount: 0 },
      },
      regionCompletedAt: { orientation: 999, desire: 888 },
    }
    const next = assessmentReducer(state, { type: 'RETAKE_REGION', regionId: 'orientation' })
    expect(Object.keys(next.responses)).toEqual(['des-tr-freedom'])
    expect(next.regionCompletedAt.orientation).toBeUndefined()
    expect(next.regionCompletedAt.desire).toBe(888) // untouched
  })

  it('navigates back to that region’s intro screen', () => {
    const next = assessmentReducer(initialState, { type: 'RETAKE_REGION', regionId: 'desire' })
    expect(next.view).toEqual({ type: 'regionIntro', regionId: 'desire' })
  })

  it('is a no-op on responses when the region had none answered', () => {
    const state: AssessmentState = { ...initialState, responses: { 'des-tr-freedom': { itemId: 'des-tr-freedom', value: 'c', firstAnsweredAt: 1, lastAnsweredAt: 1, responseTimeMs: 100, revisitCount: 0 } } }
    const next = assessmentReducer(state, { type: 'RETAKE_REGION', regionId: 'orientation' })
    expect(next.responses).toEqual(state.responses)
  })
})

describe('assessmentReducer — GOTO_COMPLETION and GOTO_SYNTHESIS still stamp completedAt exactly once', () => {
  it('GOTO_COMPLETION sets completedAt on first arrival and does not overwrite it on a second one', () => {
    const first = assessmentReducer(initialState, { type: 'GOTO_COMPLETION' })
    expect(first.completedAt).not.toBeNull()
    const second = assessmentReducer(first, { type: 'GOTO_COMPLETION' })
    expect(second.completedAt).toBe(first.completedAt)
  })

  it('GOTO_SYNTHESIS sets view to synthesis and stamps completedAt on first arrival', () => {
    const before = Date.now()
    const next = assessmentReducer(initialState, { type: 'GOTO_SYNTHESIS' })
    expect(next.view).toEqual({ type: 'synthesis' })
    expect(next.completedAt).toBeGreaterThanOrEqual(before)
  })

  it('GOTO_SYNTHESIS does not overwrite a completedAt already stamped by GOTO_COMPLETION', () => {
    const completed = assessmentReducer(initialState, { type: 'GOTO_COMPLETION' })
    const next = assessmentReducer(completed, { type: 'GOTO_SYNTHESIS' })
    expect(next.completedAt).toBe(completed.completedAt)
    expect(next.view).toEqual({ type: 'synthesis' })
  })
})

describe('assessmentReducer — NEXT_ITEM at the last implemented region goes to the map, not a next regionIntro', () => {
  it('returns {type: "map"} when the last item of the last region (aspiration) is answered', () => {
    // aspiration has 6 items (indices 0-5) and is the last implemented,
    // non-synthesis region by order — getNextRegionId('aspiration') is null
    const state = withView({ type: 'item', regionId: 'aspiration', itemIndex: 5 })
    const next = assessmentReducer(state, { type: 'NEXT_ITEM' })
    expect(next.view).toEqual({ type: 'map' })
    expect(next.regionCompletedAt.aspiration).toBeDefined()
  })
})

describe('assessmentReducer — NEXT_ITEM is a no-op outside item/regionIntro views', () => {
  it('leaves state untouched when dispatched from the map view', () => {
    const next = assessmentReducer(initialState, { type: 'NEXT_ITEM' })
    expect(next).toBe(initialState)
  })
})

describe('assessmentReducer — PREV_ITEM', () => {
  it('steps back to the previous item within the same region', () => {
    const state = withView({ type: 'item', regionId: 'orientation', itemIndex: 1 })
    const next = assessmentReducer(state, { type: 'PREV_ITEM' })
    expect(next.view).toEqual({ type: 'item', regionId: 'orientation', itemIndex: 0 })
  })

  it('goes back to the region intro when already at the first item', () => {
    const state = withView({ type: 'item', regionId: 'orientation', itemIndex: 0 })
    const next = assessmentReducer(state, { type: 'PREV_ITEM' })
    expect(next.view).toEqual({ type: 'regionIntro', regionId: 'orientation' })
  })

  it('is a no-op outside the item view', () => {
    const next = assessmentReducer(initialState, { type: 'PREV_ITEM' })
    expect(next).toBe(initialState)
  })
})

describe('assessmentReducer — ANSWER', () => {
  it('records firstAnsweredAt/lastAnsweredAt/responseTimeMs and a zero revisitCount on a first answer', () => {
    const before = Date.now()
    const next = assessmentReducer(initialState, { type: 'ANSWER', itemId: 'ori-open-1', value: 'hello', responseTimeMs: 1500 })
    const response = next.responses['ori-open-1']
    expect(response.value).toBe('hello')
    expect(response.revisitCount).toBe(0)
    expect(response.responseTimeMs).toBe(1500)
    expect(response.firstAnsweredAt).toBeGreaterThanOrEqual(before)
    expect(response.lastAnsweredAt).toBe(response.firstAnsweredAt)
  })

  it('preserves firstAnsweredAt and the original responseTimeMs, but increments revisitCount, on a re-answer', () => {
    const first = assessmentReducer(initialState, { type: 'ANSWER', itemId: 'ori-open-1', value: 'first', responseTimeMs: 1500 })
    const second = assessmentReducer(first, { type: 'ANSWER', itemId: 'ori-open-1', value: 'revised', responseTimeMs: 9999 })
    expect(second.responses['ori-open-1'].value).toBe('revised')
    expect(second.responses['ori-open-1'].firstAnsweredAt).toBe(first.responses['ori-open-1'].firstAnsweredAt)
    expect(second.responses['ori-open-1'].responseTimeMs).toBe(1500) // original timing kept, not the re-answer's
    expect(second.responses['ori-open-1'].revisitCount).toBe(1)
  })

  it('does not disturb responses to other items', () => {
    const first = assessmentReducer(initialState, { type: 'ANSWER', itemId: 'ori-open-1', value: 'a', responseTimeMs: 100 })
    const second = assessmentReducer(first, { type: 'ANSWER', itemId: 'ori-evi-1', value: 'b', responseTimeMs: 100 })
    expect(second.responses['ori-open-1'].value).toBe('a')
    expect(second.responses['ori-evi-1'].value).toBe('b')
  })
})

describe('assessmentReducer — HYDRATE', () => {
  it('replaces the entire state with the hydrated one', () => {
    const hydrated: AssessmentState = { ...initialState, completedAt: 42, view: { type: 'synthesis' } }
    const next = assessmentReducer(initialState, { type: 'HYDRATE', state: hydrated })
    expect(next).toEqual(hydrated)
  })
})

describe('assessmentReducer — RESET', () => {
  it('discards all responses and progress, returning to a fresh map view', () => {
    const dirty: AssessmentState = {
      ...initialState,
      responses: { 'ori-open-1': { itemId: 'ori-open-1', value: 'a', firstAnsweredAt: 1, lastAnsweredAt: 1, responseTimeMs: 100, revisitCount: 0 } },
      completedAt: 12345,
      regionCompletedAt: { orientation: 999 },
      view: { type: 'synthesis' },
    }
    const next = assessmentReducer(dirty, { type: 'RESET' })
    expect(next.responses).toEqual({})
    expect(next.completedAt).toBeNull()
    expect(next.regionCompletedAt).toEqual({})
    expect(next.view).toEqual({ type: 'map' })
  })

  it('stamps a fresh startedAt rather than carrying the old one over', () => {
    const dirty: AssessmentState = { ...initialState, startedAt: 1 }
    const next = assessmentReducer(dirty, { type: 'RESET' })
    expect(next.startedAt).toBeGreaterThan(1)
  })
})
