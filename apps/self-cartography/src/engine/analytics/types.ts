/**
 * ANALYTICS EVENT SCHEMA
 * ──────────────────────
 * Every event here is a closed, whitelisted shape — behavioral metadata
 * only, never assessment content. None of these fields, individually or
 * combined, reveal what a respondent actually answered:
 *
 *   - `itemId` / `regionId` / `careerId` / `section` name a public catalog
 *     entry (a question, a region, a career, a results section) — the same
 *     ids visible in this repo's own content files — never the response
 *     given to it.
 *   - Nothing here carries a rating value, a chosen option, a ranking
 *     order, free-text content, a facet score, or a career fit percentage.
 *
 * This file is deliberately the ONLY place the analytics event shapes are
 * defined, and it deliberately never imports the types that carry an
 * actual answer or a derived score from engine/types.ts — see
 * analytics.test.ts's architectural-guard check, which enforces that at
 * the source-file level, not just by convention.
 */

export interface AnalyticsEventBase {
  /** Random, generated once per browser tab session (sessionStorage-scoped
   *  — gone when the tab closes). Never the same value two sessions in a
   *  row, and never written to or derived from the response-content store,
   *  so events from one visit can be grouped together without being
   *  linkable to a person across visits or to their saved answers. */
  sessionId: string
  timestamp: number
}

/** The event-specific fields only — no sessionId/timestamp, those are
 *  stamped by track() (see track.ts) at the moment an event is recorded. */
export type AnalyticsEventInput =
  | { type: 'assessment_start' }
  | { type: 'section_enter'; regionId: string; order: number }
  | { type: 'section_complete'; regionId: string; order: number; itemCount: number; durationMs: number }
  | { type: 'item_answered'; itemId: string; format: string; responseTimeMs: number; isRevision: boolean }
  | { type: 'assessment_complete'; totalDurationMs: number; regionsCompleted: number }
  | { type: 'results_section_view'; section: string }
  | { type: 'career_card_click'; careerId: string; source: 'fit-card' | 'explorer' }

// Distributes the intersection over each union member individually (rather
// than `AnalyticsEventBase & AnalyticsEventInput`, which would collapse to
// only the fields every variant shares) so each event type keeps its own
// specific fields alongside sessionId/timestamp.
export type AnalyticsEvent = AnalyticsEventInput extends infer Payload ? Payload & AnalyticsEventBase : never
