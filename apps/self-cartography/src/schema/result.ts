/**
 * SCHEMA LAYER — RESULT
 * ─────────────────────
 * Where "results should retain these values" actually lives. A
 * GeneratedProfile is an immutable snapshot: once created, its `versions`
 * never change, and it is never silently re-scored under a newer model.
 * If the versions in use today differ, that's surfaced via
 * compareVersionManifests — the stored numbers themselves are never touched.
 */

import type { CareerFitProfile } from './interpretation'
import type { Evidence, Score, ValidityResult } from './scoring'
import type { VersionManifest } from './versioning'
import { CURRENT_VERSIONS } from './versioning'

export interface GeneratedProfile {
  id: string
  assessmentId: string
  completedAt: number
  /** Stamped once, at creation, from CURRENT_VERSIONS — never mutated afterward. */
  versions: VersionManifest
  scores: Score[]
  evidence: Evidence[]
  validityResults: ValidityResult[]
  careerFitProfiles: CareerFitProfile[]
}

export function createProfile(
  input: Omit<GeneratedProfile, 'versions' | 'completedAt' | 'id'> & { id?: string },
): GeneratedProfile {
  return {
    id: input.id ?? `profile-${Date.now()}`,
    assessmentId: input.assessmentId,
    completedAt: Date.now(),
    versions: { ...CURRENT_VERSIONS },
    scores: input.scores,
    evidence: input.evidence,
    validityResults: input.validityResults,
    careerFitProfiles: input.careerFitProfiles,
  }
}
