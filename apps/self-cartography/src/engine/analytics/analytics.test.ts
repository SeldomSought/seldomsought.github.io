import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// vitest.config.ts runs under environment: 'node' (see its own comment) —
// no real `window`/sessionStorage here, so this is the same minimal
// in-memory stand-in pattern persistence.test.ts uses for localStorage.
function installSessionStorageStub() {
  const store = new Map<string, string>()
  ;(globalThis as unknown as { window: unknown }).window = {
    sessionStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key, value) },
      removeItem: (key: string) => { store.delete(key) },
    },
  }
  return store
}

const sessionStore = installSessionStorageStub()

// crypto.randomUUID is available in the Node test runtime already; no stub needed.

const { track, registerAnalyticsSink } = await import('./track')
const { getQueuedAnalyticsEvents, clearQueuedAnalyticsEvents, noopSink } = await import('./sinks')

beforeEach(() => {
  clearQueuedAnalyticsEvents()
  sessionStore.clear()
})

describe('track — stamps sessionId and timestamp, defaults to the local queue', () => {
  it('records an event with the requested type and payload', () => {
    track({ type: 'assessment_start' })
    const [event] = getQueuedAnalyticsEvents()
    expect(event.type).toBe('assessment_start')
    expect(typeof event.timestamp).toBe('number')
    expect(typeof event.sessionId).toBe('string')
  })

  it('reuses the same sessionId across multiple events in the same session', () => {
    track({ type: 'assessment_start' })
    track({ type: 'section_enter', regionId: 'desire', order: 1 })
    const events = getQueuedAnalyticsEvents()
    expect(events[0].sessionId).toBe(events[1].sessionId)
  })

  it('never carries response content — only whitelisted, content-free fields per event type', () => {
    track({ type: 'item_answered', itemId: 'des-tr-freedom', format: 'tradeoff', responseTimeMs: 4200, isRevision: false })
    const [event] = getQueuedAnalyticsEvents()
    expect(Object.keys(event).sort()).toEqual(['format', 'isRevision', 'itemId', 'responseTimeMs', 'sessionId', 'timestamp', 'type'])
  })
})

describe('a fresh session (cleared sessionStorage) gets a new, unlinked sessionId', () => {
  it('does not reuse a previous session’s id once sessionStorage is cleared', () => {
    track({ type: 'assessment_start' })
    const [first] = getQueuedAnalyticsEvents()
    sessionStore.clear() // simulates a new tab / new visit
    clearQueuedAnalyticsEvents()
    track({ type: 'assessment_start' })
    const [second] = getQueuedAnalyticsEvents()
    expect(second.sessionId).not.toBe(first.sessionId)
  })
})

describe('registerAnalyticsSink — the one swap point for where events go', () => {
  it('routes subsequent events to a newly registered sink instead of the default queue', () => {
    const received: string[] = []
    registerAnalyticsSink({ send: (e) => received.push(e.type) })
    track({ type: 'assessment_complete', totalDurationMs: 1000, regionsCompleted: 5 })
    expect(received).toEqual(['assessment_complete'])
    expect(getQueuedAnalyticsEvents()).toEqual([]) // did not also land in the old default
    registerAnalyticsSink(noopSink) // restore a harmless sink for any later test
  })
})

describe('architectural guard — analytics never imports response-content types', () => {
  // Mirrors this codebase's existing content/engine/component boundary
  // tests: read the module's own source text and assert the import
  // boundary holds, rather than trusting a comment. If `Response` or
  // `FacetScore` (the types that carry what someone actually answered, or
  // what was derived from it) ever appear as identifiers in this folder,
  // that's the analytics layer starting to see assessment content, and
  // this test is designed to fail loudly the moment that happens.
  const here = dirname(fileURLToPath(import.meta.url))
  const files = ['types.ts', 'track.ts', 'sinks.ts', 'index.ts']

  it.each(files)('%s does not reference Response or FacetScore', (file) => {
    const source = readFileSync(join(here, file), 'utf-8')
    expect(source).not.toMatch(/\bResponse\b/)
    expect(source).not.toMatch(/\bFacetScore\b/)
  })

  it.each(files)('%s does not import from engine/types.ts or engine/scoring (only from ./types, its own content-free schema)', (file) => {
    const source = readFileSync(join(here, file), 'utf-8')
    expect(source).not.toMatch(/from ['"]\.\.\/types['"]/) // the real engine/types.ts, one level up — Response/FacetScore live there
    expect(source).not.toMatch(/from ['"]\.\.\/scoring/)
  })
})
