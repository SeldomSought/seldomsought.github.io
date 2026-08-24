import type { AnalyticsEvent } from './types'

/**
 * A sink decides what happens to an already-built event — nothing about
 * *what's* in the event changes here, only *where it goes*. Swapping the
 * active sink (registerAnalyticsSink, in track.ts) is the ONLY thing that
 * would ever be needed to start sending events off-device; as of this
 * commit nothing in this app does, so the queue sink below never leaves
 * the browser.
 */
export interface AnalyticsSink {
  send(event: AnalyticsEvent): void
}

/** Does nothing. The safest possible default — an app that never registers
 *  a different sink produces zero observable analytics behavior. */
export const noopSink: AnalyticsSink = {
  send: () => {},
}

/** Logs to the console — for a developer watching instrumentation fire
 *  while working on this app, nothing else. Still fully local. */
export const consoleSink: AnalyticsSink = {
  send: (event) => {
    // eslint-disable-next-line no-console
    console.info('[analytics]', event.type, event)
  },
}

const QUEUE_LIMIT = 500
const DEBUG_KEY = 'selfCartography.analytics.debug.v1'

/**
 * An in-memory, capped buffer — the working default for this pass. Mirrors
 * to sessionStorage (NOT localStorage, and under a key namespaced away from
 * `selfCartography.v1`/`selfCartography.history.v1`, the response-content
 * keys in persistence.ts) purely so a developer can inspect what a real
 * network sink would have received, via getQueuedAnalyticsEvents() below.
 * sessionStorage clears itself when the tab closes — nothing here persists
 * like a saved assessment does, and nothing here is ever fetched/sent
 * anywhere. This is the entire "capture layer, no transport yet" system.
 */
function createLocalQueueSink(): AnalyticsSink & { getEvents(): AnalyticsEvent[]; clear(): void } {
  let queue: AnalyticsEvent[] = []

  function persist() {
    try {
      window.sessionStorage.setItem(DEBUG_KEY, JSON.stringify(queue))
    } catch {
      // sessionStorage unavailable — the in-memory queue below still works for this tab's lifetime
    }
  }

  return {
    send(event) {
      queue.push(event)
      if (queue.length > QUEUE_LIMIT) queue = queue.slice(-QUEUE_LIMIT)
      persist()
    },
    getEvents() {
      return [...queue]
    },
    clear() {
      queue = []
      try {
        window.sessionStorage.removeItem(DEBUG_KEY)
      } catch {
        // ignore
      }
    },
  }
}

export const localQueueSink = createLocalQueueSink()

/** Everything the local queue sink has captured this tab session — for a
 *  developer console, a future debug panel, or a test. Never sent anywhere. */
export function getQueuedAnalyticsEvents(): AnalyticsEvent[] {
  return localQueueSink.getEvents()
}

export function clearQueuedAnalyticsEvents(): void {
  localQueueSink.clear()
}
