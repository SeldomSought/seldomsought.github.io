import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// vitest.config.ts runs under environment: 'node' on purpose (see its own
// comment) — there is no real `window`/localStorage here, so this is the
// minimal in-memory stand-in persistence.ts's own try/catch around every
// localStorage call is written to tolerate anyway.
function installLocalStorageStub() {
  const store = new Map<string, string>()
  ;(globalThis as unknown as { window: unknown }).window = {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key, value) },
      removeItem: (key: string) => { store.delete(key) },
    },
  }
}

installLocalStorageStub()

const { archiveSnapshot, loadHistory, clearHistory, loadSavedState, saveStateDebounced, flushPendingSave, clearSavedState, hasAnyResponses } =
  await import('./persistence')
const { createSnapshot } = await import('./snapshot')
const { initialState } = await import('./state')

const win = (globalThis as unknown as { window: { localStorage: { getItem: (k: string) => string | null; setItem: (k: string, v: string) => void; removeItem: (k: string) => void } } }).window

function fs(facetId: string, score: number) {
  return { facetId, label: facetId, score, confidence: 'High' as const, evidenceCount: 3, itemsExpected: 3, behavioralEvidenceCount: 0, internalConsistency: 100, contradictionCount: 0 }
}

beforeEach(() => {
  clearHistory()
})

describe('archiveSnapshot / loadHistory — the historical-profile store', () => {
  it('is empty until something is archived', () => {
    expect(loadHistory()).toEqual([])
  })

  it('round-trips a single snapshot', () => {
    const snapshot = createSnapshot({ autonomy_need: fs('autonomy_need', 80) }, 1000)
    archiveSnapshot(snapshot)
    const history = loadHistory()
    expect(history).toHaveLength(1)
    expect(history[0]).toEqual(snapshot)
  })

  it('accumulates multiple snapshots across separate completions — "2026," "2027," "2028" are just whatever real completedAt values show up', () => {
    archiveSnapshot(createSnapshot({}, 1000))
    archiveSnapshot(createSnapshot({}, 3000))
    archiveSnapshot(createSnapshot({}, 2000))
    expect(loadHistory().map((s) => s.completedAt)).toEqual([1000, 2000, 3000]) // sorted oldest-first regardless of archive order
  })

  it('archiving the same completedAt twice replaces rather than duplicates the entry', () => {
    archiveSnapshot(createSnapshot({ a: fs('a', 10) }, 1000))
    archiveSnapshot(createSnapshot({ a: fs('a', 90) }, 1000))
    const history = loadHistory()
    expect(history).toHaveLength(1)
    expect(history[0].facetScores.a.score).toBe(90)
  })

  it('clearHistory empties the store without touching anything else', () => {
    archiveSnapshot(createSnapshot({}, 1000))
    clearHistory()
    expect(loadHistory()).toEqual([])
  })
})

describe('createSnapshot — stamps the current version and a stable id', () => {
  it('uses the given completedAt as both the id and the timestamp', () => {
    const snapshot = createSnapshot({}, 4242)
    expect(snapshot.id).toBe('4242')
    expect(snapshot.completedAt).toBe(4242)
  })
  it('defaults completedAt to now when omitted', () => {
    const before = Date.now()
    const snapshot = createSnapshot({})
    expect(snapshot.completedAt).toBeGreaterThanOrEqual(before)
  })
})

describe('loadSavedState / saveStateDebounced / flushPendingSave — the in-progress session store', () => {
  beforeEach(() => {
    clearSavedState()
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns null when nothing has been saved yet', () => {
    expect(loadSavedState()).toBeNull()
  })

  it('round-trips a real state written through the debounced save', () => {
    const state = { ...initialState, responses: { a: { itemId: 'a', value: 3, firstAnsweredAt: 1, lastAnsweredAt: 1, responseTimeMs: 500, revisitCount: 0 } } }
    let savedAt: number | null = null
    saveStateDebounced(state, (t) => { savedAt = t })
    vi.advanceTimersByTime(400)
    expect(savedAt).not.toBeNull()
    const loaded = loadSavedState()
    expect(loaded?.state).toEqual(state)
    expect(loaded?.savedAt).toBe(savedAt)
  })

  it('collapses two rapid calls within the debounce window into a single write of the latest state', () => {
    const onSaved = vi.fn()
    const first = { ...initialState, responses: { a: { itemId: 'a', value: 1, firstAnsweredAt: 1, lastAnsweredAt: 1, responseTimeMs: 500, revisitCount: 0 } } }
    const second = { ...initialState, responses: { a: { itemId: 'a', value: 1, firstAnsweredAt: 1, lastAnsweredAt: 1, responseTimeMs: 500, revisitCount: 0 }, b: { itemId: 'b', value: 5, firstAnsweredAt: 2, lastAnsweredAt: 2, responseTimeMs: 500, revisitCount: 0 } } }
    saveStateDebounced(first, onSaved)
    vi.advanceTimersByTime(200) // well inside the 400ms window
    saveStateDebounced(second, onSaved)
    vi.advanceTimersByTime(400)
    expect(onSaved).toHaveBeenCalledTimes(1)
    expect(loadSavedState()?.state).toEqual(second)
  })

  it('flushPendingSave writes immediately and fires onSaved without waiting for the debounce', () => {
    const state = { ...initialState, responses: { a: { itemId: 'a', value: 4, firstAnsweredAt: 1, lastAnsweredAt: 1, responseTimeMs: 500, revisitCount: 0 } } }
    const onSaved = vi.fn()
    saveStateDebounced(state, onSaved, 10_000) // long delay — would not fire on its own within this test
    flushPendingSave()
    expect(onSaved).toHaveBeenCalledTimes(1)
    expect(loadSavedState()?.state).toEqual(state)
  })

  it('flushPendingSave is a no-op when nothing is pending', () => {
    expect(() => flushPendingSave()).not.toThrow()
    expect(loadSavedState()).toBeNull()
  })

  it('returns null when the stored schemaVersion does not match the current one', () => {
    const originalGetItem = win.localStorage.getItem
    win.localStorage.getItem = () => JSON.stringify({ schemaVersion: 1, savedAt: 123, state: initialState })
    expect(loadSavedState()).toBeNull()
    win.localStorage.getItem = originalGetItem
  })

  it('returns null (not a throw) when the stored value is malformed JSON', () => {
    const originalGetItem = win.localStorage.getItem
    win.localStorage.getItem = () => 'this is not valid JSON {'
    expect(() => loadSavedState()).not.toThrow()
    expect(loadSavedState()).toBeNull()
    win.localStorage.getItem = originalGetItem
  })

  it('clearSavedState removes the saved session without touching history', () => {
    const state = { ...initialState, responses: { a: { itemId: 'a', value: 2, firstAnsweredAt: 1, lastAnsweredAt: 1, responseTimeMs: 500, revisitCount: 0 } } }
    saveStateDebounced(state, () => {})
    vi.advanceTimersByTime(400)
    archiveSnapshot(createSnapshot({}, 999))
    clearSavedState()
    expect(loadSavedState()).toBeNull()
    expect(loadHistory()).toHaveLength(1)
  })
})

describe('hasAnyResponses', () => {
  it('is false for a fresh, unanswered state', () => {
    expect(hasAnyResponses(initialState)).toBe(false)
  })
  it('is true once at least one response exists', () => {
    const state = { ...initialState, responses: { a: { itemId: 'a', value: 1, firstAnsweredAt: 1, lastAnsweredAt: 1, responseTimeMs: 500, revisitCount: 0 } } }
    expect(hasAnyResponses(state)).toBe(true)
  })
})
