/**
 * SCHEMA LAYER — VERSIONING
 * ─────────────────────────
 * Three independent semver axes, one manifest, one comparison function.
 * No database, no migration server, no per-question version history — a
 * hand-maintained constant, stamped onto results at the moment they're
 * generated, compared with plain arithmetic. That's the whole system.
 *
 * instrumentVersion  — sourced from Assessment.version (content.ts). Bumps
 *                       when the question set changes.
 * scoringVersion     — bumps when scoring rules, weights, reverse-keying,
 *                       or rollup logic change. Independent of the
 *                       question set — a scoring bug fix doesn't touch a
 *                       single prompt.
 * careerModelVersion — bumps when the career database or fit-matching
 *                       algorithm changes. Independent of both of the above.
 *
 * Finer-grained than this file: individual Question.version, already in
 * content.ts, recorded per-answer via Response.questionVersion (scoring.ts).
 * That's for auditing *one* answer against the exact question it answered.
 * VersionManifest is coarser, on purpose — it answers the product question
 * ("can I compare these two results at all?"), not the forensic one.
 */

import type { SemVer } from './content'

// ── the current build's versions — the single source of truth, bumped by hand ──

export const CURRENT_VERSIONS: VersionManifest = {
  instrumentVersion: '0.1.0',
  scoringVersion: '0.1.0',
  careerModelVersion: '0.1.0',
}

export interface VersionManifest {
  instrumentVersion: SemVer
  scoringVersion: SemVer
  careerModelVersion: SemVer
}

export function stampCurrentVersions(): VersionManifest {
  return { ...CURRENT_VERSIONS }
}

// ── plain semver comparison — no library ──

export type VersionDelta = 'none' | 'patch' | 'minor' | 'major'

function parts(v: SemVer): [number, number, number] {
  const [major, minor, patch] = v.split('.').map(Number)
  return [major, minor, patch]
}

export function compareSemVer(a: SemVer, b: SemVer): VersionDelta {
  const [aMaj, aMin, aPat] = parts(a)
  const [bMaj, bMin, bPat] = parts(b)
  if (aMaj !== bMaj) return 'major'
  if (aMin !== bMin) return 'minor'
  if (aPat !== bPat) return 'patch'
  return 'none'
}

// ── what a delta on each axis actually implies ──

export type ComparabilityVerdict = 'identical' | 'comparable' | 'partially-comparable' | 'not-comparable'

const VERDICT_SEVERITY: Record<ComparabilityVerdict, number> = {
  identical: 0,
  comparable: 1,
  'partially-comparable': 2,
  'not-comparable': 3,
}

export interface AxisComparison {
  axis: 'instrumentVersion' | 'scoringVersion' | 'careerModelVersion'
  stored: SemVer
  current: SemVer
  delta: VersionDelta
  verdict: ComparabilityVerdict
  note: string
}

type AxisPolicy = (delta: VersionDelta) => { verdict: ComparabilityVerdict; note: string }

const instrumentPolicy: AxisPolicy = (delta) => {
  switch (delta) {
    case 'none':
      return { verdict: 'identical', note: 'Same question set.' }
    case 'patch':
      return { verdict: 'comparable', note: 'Wording-level fixes only — same questions, same meaning.' }
    case 'minor':
      return {
        verdict: 'partially-comparable',
        note: 'Questions were added without changing or removing existing ones. Subscales that existed before are still comparable; anything new has no prior data to compare against.',
      }
    case 'major':
      return {
        verdict: 'not-comparable',
        note: 'Questions were removed, reworded, or restructured. Subscale meaning may have shifted — treat this as a different instrument.',
      }
  }
}

const scoringPolicy: AxisPolicy = (delta) => {
  switch (delta) {
    case 'none':
      return { verdict: 'identical', note: 'Same scoring rules.' }
    case 'patch':
      return {
        verdict: 'partially-comparable',
        note: 'A scoring formula or bug fix occurred. Raw scores may shift slightly even though nothing about the instrument or intent changed.',
      }
    case 'minor':
      return {
        verdict: 'partially-comparable',
        note: 'New scoring rules were added (a new question format, most likely) without changing how existing subscales are computed.',
      }
    case 'major':
      return {
        verdict: 'not-comparable',
        note: 'The scoring model changed in a way that redefines what a raw score means. Old and new scores are not on the same scale — do not diff them.',
      }
  }
}

const careerModelPolicy: AxisPolicy = (delta) => {
  switch (delta) {
    case 'none':
      return { verdict: 'identical', note: 'Same career database and matching algorithm.' }
    case 'patch':
      return { verdict: 'comparable', note: 'Copy or description fixes to existing careers only.' }
    case 'minor':
      return {
        verdict: 'partially-comparable',
        note: 'Careers were added to the database. Existing fit scores are still valid; a re-run would surface options that didn’t exist before.',
      }
    case 'major':
      return {
        verdict: 'not-comparable',
        note: 'The fit-scoring algorithm or factor weights changed. Old fit percentages are not on the same scale as a fresh run.',
      }
  }
}

// ── the actual comparison ──

export interface VersionComparisonReport {
  overall: ComparabilityVerdict
  axes: AxisComparison[]
  recommendation: string
}

export function compareVersionManifests(stored: VersionManifest, current: VersionManifest): VersionComparisonReport {
  const axes: AxisComparison[] = [
    axisComparison('instrumentVersion', stored.instrumentVersion, current.instrumentVersion, instrumentPolicy),
    axisComparison('scoringVersion', stored.scoringVersion, current.scoringVersion, scoringPolicy),
    axisComparison('careerModelVersion', stored.careerModelVersion, current.careerModelVersion, careerModelPolicy),
  ]

  const overall = axes.reduce<ComparabilityVerdict>(
    (worst, axis) => (VERDICT_SEVERITY[axis.verdict] > VERDICT_SEVERITY[worst] ? axis.verdict : worst),
    'identical',
  )

  return { overall, axes, recommendation: recommendationFor(overall, axes) }
}

function axisComparison(
  axis: AxisComparison['axis'],
  stored: SemVer,
  current: SemVer,
  policy: AxisPolicy,
): AxisComparison {
  const delta = compareSemVer(stored, current)
  const { verdict, note } = policy(delta)
  return { axis, stored, current, delta, verdict, note }
}

function recommendationFor(overall: ComparabilityVerdict, axes: AxisComparison[]): string {
  if (overall === 'identical') return 'This result was generated under the exact versions in use today — directly comparable to a fresh run.'
  if (overall === 'comparable') return 'Only cosmetic changes since this result was generated — still directly comparable.'

  const drivers = axes.filter((a) => a.verdict === overall).map((a) => a.axis)
  if (overall === 'not-comparable') {
    return `Not directly comparable — ${drivers.join(' and ')} changed enough to redefine what the numbers mean. Recommend a fresh retake rather than diffing against this result.`
  }
  return `Partially comparable — ${drivers.join(' and ')} changed in a way that adds coverage without invalidating what was already measured.`
}
