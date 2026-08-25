/**
 * A completed profile stamped with the versions in effect when it was
 * generated, then compared against three later states of the world —
 * showing all four comparability verdicts the system can produce.
 */

import { createProfile } from '../result'
import { compareVersionManifests, type VersionManifest } from '../versioning'
import {
  sampleBehavioralEvidenceEntry,
  sampleCareerFitProfile,
  sampleScore,
  sampleSelfReportEvidenceEntry,
  sampleValidityResult,
  sampleWrittenEvidenceEntry,
} from './sampleDerived'

/** A respondent completed the assessment under these versions, six months ago. */
const STORED_VERSIONS: VersionManifest = {
  instrumentVersion: '0.1.0',
  scoringVersion: '0.1.0',
  careerModelVersion: '0.1.0',
}

export const sampleGeneratedProfile = {
  ...createProfile({
    assessmentId: 'self-cartography-demo',
    scores: [sampleScore],
    evidence: [sampleBehavioralEvidenceEntry, sampleSelfReportEvidenceEntry, sampleWrittenEvidenceEntry],
    validityResults: sampleValidityResult ? [sampleValidityResult] : [],
    careerFitProfiles: [sampleCareerFitProfile],
  }),
  versions: STORED_VERSIONS, // pinned for this demo, rather than "whatever CURRENT_VERSIONS happens to be right now"
}

/** Scenario 1 — nothing has changed since. */
export const comparisonUnchanged = compareVersionManifests(STORED_VERSIONS, {
  instrumentVersion: '0.1.0',
  scoringVersion: '0.1.0',
  careerModelVersion: '0.1.0',
})
// → overall: 'identical'

/** Scenario 2 — a scoring bug got patched; a few careers were added. Nothing about the instrument changed. */
export const comparisonMinorDrift = compareVersionManifests(STORED_VERSIONS, {
  instrumentVersion: '0.1.0',
  scoringVersion: '0.1.1',
  careerModelVersion: '0.2.0',
})
// → overall: 'partially-comparable' — scores may have shifted slightly, career list grew

/** Scenario 3 — the instrument itself was restructured (e.g. Values split into two constructs). */
export const comparisonMajorDrift = compareVersionManifests(STORED_VERSIONS, {
  instrumentVersion: '1.0.0',
  scoringVersion: '0.1.0',
  careerModelVersion: '0.1.0',
})
// → overall: 'not-comparable' — recommend a fresh retake, don't diff against the stored profile
