import type { AnalyticsEvent, AnalyticsEventInput } from './types'
import type { AnalyticsSink } from './sinks'
import { localQueueSink } from './sinks'

const SESSION_KEY = 'selfCartography.analytics.sessionId.v1'

/**
 * One random id per browser TAB session (sessionStorage, not localStorage
 * — gone on tab close, never survives a resume-after-closing-the-tab the
 * way a saved assessment does). Generated once, reused for every event
 * this tab produces, so events can be grouped into "one visit" without
 * that id being able to identify a person or connect back to their saved
 * answers, which live under a completely different storage key
 * (persistence.ts's `selfCartography.v1`) that this module never touches.
 */
function getSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const fresh = crypto.randomUUID()
    window.sessionStorage.setItem(SESSION_KEY, fresh)
    return fresh
  } catch {
    // sessionStorage unavailable — fall back to a per-call random id rather
    // than throwing; events still work, they just won't group into one session
    return crypto.randomUUID()
  }
}

// Defaults to the local-only queue (see sinks.ts) — every event this app
// produces today stays on-device. registerAnalyticsSink is the one, single
// place transport could ever be swapped in later.
let activeSink: AnalyticsSink = localQueueSink

export function registerAnalyticsSink(sink: AnalyticsSink): void {
  activeSink = sink
}

export function track(input: AnalyticsEventInput): void {
  const event = { ...input, sessionId: getSessionId(), timestamp: Date.now() } as AnalyticsEvent
  activeSink.send(event)
}
