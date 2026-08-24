import type { FacetScore } from './types'
import type { AssessmentVersion } from './version'
import { ASSESSMENT_VERSION } from './version'

/**
 * RETESTING ARCHITECTURE — the historical-profile shape.
 *
 * This is the narrow, versioning-only integration schema/README.md
 * describes as the eventual plug-in point ("stamp CURRENT_VERSIONS onto a
 * [profile] when Synthesis is reached, store it alongside the existing
 * autosaved state"). It deliberately does NOT adopt schema/result.ts's
 * `GeneratedProfile` wholesale: that type is built on schema/scoring.ts's
 * `Score`/`Evidence` and schema/interpretation.ts's `CareerFitProfile` — a
 * parallel, richer type system the running app never migrated onto (see
 * schema/README.md's own "Status" section: that migration is separate,
 * out-of-scope follow-up work). This snapshot instead uses the engine's
 * REAL, currently-shipping `FacetScore` — the actual thing scoreAssessment()
 * produces today — so it's something the live app can create and compare
 * against without a second scoring pipeline existing alongside the real one.
 *
 * Deliberately immutable and deliberately thin: a snapshot is the SCORED
 * result (facetScores), never the raw responses behind it. That keeps every
 * stored year small and matches schema/result.ts's own stated philosophy —
 * "a completed result is an immutable snapshot, not a live view" — even
 * though the concrete type differs from GeneratedProfile.
 */
export interface AssessmentSnapshot {
  /** Stable per-snapshot id — just the completion timestamp, stringified;
   *  good enough since only one snapshot can ever complete at a given
   *  millisecond on one device, and it's what naturally sorts by recency. */
  id: string
  completedAt: number
  version: AssessmentVersion
  facetScores: Record<string, FacetScore>
}

export function createSnapshot(facetScores: Record<string, FacetScore>, completedAt: number = Date.now()): AssessmentSnapshot {
  return {
    id: String(completedAt),
    completedAt,
    version: ASSESSMENT_VERSION,
    facetScores,
  }
}
