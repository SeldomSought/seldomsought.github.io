/**
 * The active engine's own version stamp — now sourced directly from
 * schema/versioning.ts's `CURRENT_VERSIONS`/`VersionManifest`, the
 * deliberately unwired, more elaborate forward-looking design this file
 * used to just duplicate by hand. That file's own comparison machinery
 * (`compareVersionManifests`, `ComparabilityVerdict`) is re-exported here
 * too, so anything needing "is this saved profile still comparable to
 * today's model" has one place in the engine layer to import it from —
 * see engine/scoring/stability.ts and ResultsReport.tsx's retesting
 * section for where that actually gets used.
 */
import type { VersionManifest } from '../schema/versioning'
import { CURRENT_VERSIONS } from '../schema/versioning'

export type AssessmentVersion = VersionManifest

export const ASSESSMENT_VERSION: AssessmentVersion = CURRENT_VERSIONS

export type { ComparabilityVerdict, VersionComparisonReport, AxisComparison, VersionDelta } from '../schema/versioning'
export { compareVersionManifests, compareSemVer } from '../schema/versioning'
