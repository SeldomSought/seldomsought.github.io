import type { AssessmentState } from './state'
import type { AssessmentSnapshot } from './snapshot'

const STORAGE_KEY = 'selfCartography.v1'
// Bumped alongside AssessmentState's shape (version/completedAt, then
// regionCompletedAt, added) — an older stored payload is simply treated as
// absent rather than crashing on missing fields; nothing tries to migrate
// it in place.
const SCHEMA_VERSION = 3

interface StoredPayload {
  schemaVersion: number
  savedAt: number
  state: AssessmentState
}

export function loadSavedState(): { state: AssessmentState; savedAt: number } | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredPayload
    if (parsed.schemaVersion !== SCHEMA_VERSION) return null
    return { state: parsed.state, savedAt: parsed.savedAt }
  } catch {
    return null
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null
let pendingState: AssessmentState | null = null
let pendingOnSaved: ((savedAt: number) => void) | null = null

function writeNow(state: AssessmentState): number {
  const savedAt = Date.now()
  const payload: StoredPayload = { schemaVersion: SCHEMA_VERSION, savedAt, state }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // localStorage unavailable (private browsing, quota) — fail silently, session still works
  }
  return savedAt
}

/** Debounced write — `onSaved` fires with the real write timestamp once the
 *  write actually happens, whether that's after the debounce settles or via
 *  flushPendingSave(). */
export function saveStateDebounced(state: AssessmentState, onSaved: (savedAt: number) => void, delayMs = 400): void {
  pendingState = state
  pendingOnSaved = onSaved
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveTimer = null
    const saved = writeNow(state)
    pendingState = null
    onSaved(saved)
  }, delayMs)
}

/**
 * Writes immediately, bypassing whatever's left of the debounce window —
 * call this on pagehide/visibilitychange so a save that hasn't settled yet
 * is never silently dropped by a refresh or tab close.
 */
export function flushPendingSave(): void {
  if (!saveTimer || !pendingState) return
  clearTimeout(saveTimer)
  saveTimer = null
  const saved = writeNow(pendingState)
  const onSaved = pendingOnSaved
  pendingState = null
  onSaved?.(saved)
}

export function clearSavedState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function hasAnyResponses(state: AssessmentState): boolean {
  return Object.keys(state.responses).length > 0
}

// ── RETESTING ARCHITECTURE: historical profiles ──────────────────────────
//
// A completely separate storage slot from the in-progress state above, on
// purpose — the same "different, unrelated concern" split schema/README.md
// already calls for between SCHEMA_VERSION (can this JSON blob even be
// parsed) and VersionManifest (does the saved content still mean the same
// thing today). History has its own schema version so a shape change here
// never invalidates the live in-progress session, and vice versa.

const HISTORY_KEY = 'selfCartography.history.v1'
const HISTORY_SCHEMA_VERSION = 1

interface StoredHistory {
  schemaVersion: number
  snapshots: AssessmentSnapshot[]
}

function readHistory(): AssessmentSnapshot[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredHistory
    if (parsed.schemaVersion !== HISTORY_SCHEMA_VERSION) return []
    return parsed.snapshots
  } catch {
    return []
  }
}

/** Every completed profile this device has ever produced, oldest first —
 *  "2026," "2027," "2028," and so on, are just whatever completedAt values
 *  actually accumulate here over time; nothing about the storage format
 *  is year-specific. */
export function loadHistory(): AssessmentSnapshot[] {
  return [...readHistory()].sort((a, b) => a.completedAt - b.completedAt)
}

/** Appends one snapshot, keyed by id so calling this twice for the same
 *  completion (e.g. a re-render) never duplicates an entry. Call this once,
 *  the moment a respondent actually completes an assessment — never on
 *  every save, and never for an in-progress session. */
export function archiveSnapshot(snapshot: AssessmentSnapshot): void {
  try {
    const existing = readHistory().filter((s) => s.id !== snapshot.id)
    const payload: StoredHistory = { schemaVersion: HISTORY_SCHEMA_VERSION, snapshots: [...existing, snapshot] }
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(payload))
  } catch {
    // localStorage unavailable — fail silently, same as the in-progress save above
  }
}

export function clearHistory(): void {
  try {
    window.localStorage.removeItem(HISTORY_KEY)
  } catch {
    // ignore
  }
}
