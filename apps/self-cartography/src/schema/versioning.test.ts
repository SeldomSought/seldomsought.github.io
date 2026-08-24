import { describe, it, expect } from 'vitest'
import { compareSemVer, compareVersionManifests, type VersionManifest } from './versioning'

function manifest(overrides: Partial<VersionManifest> = {}): VersionManifest {
  return { instrumentVersion: '1.0.0', scoringVersion: '1.0.0', careerModelVersion: '1.0.0', ...overrides }
}

describe('compareSemVer', () => {
  it('returns none for identical versions', () => {
    expect(compareSemVer('1.2.3', '1.2.3')).toBe('none')
  })

  it('returns patch when only the patch number differs', () => {
    expect(compareSemVer('1.2.3', '1.2.4')).toBe('patch')
  })

  it('returns minor when the minor number differs (patch ignored)', () => {
    expect(compareSemVer('1.2.3', '1.3.0')).toBe('minor')
  })

  it('returns major when the major number differs, even if minor/patch also differ', () => {
    expect(compareSemVer('1.9.9', '2.0.0')).toBe('major')
  })

  it('major takes precedence over minor/patch differences in the same comparison', () => {
    expect(compareSemVer('1.5.5', '2.1.1')).toBe('major')
  })
})

describe('compareVersionManifests — identical manifests', () => {
  it('reports identical overall and the fresh-run recommendation', () => {
    const report = compareVersionManifests(manifest(), manifest())
    expect(report.overall).toBe('identical')
    expect(report.recommendation).toBe('This result was generated under the exact versions in use today — directly comparable to a fresh run.')
    expect(report.axes.every((a) => a.verdict === 'identical')).toBe(true)
  })
})

describe('compareVersionManifests — single-axis changes', () => {
  it('an instrument minor bump alone yields partially-comparable overall, driven by that axis', () => {
    const stored = manifest({ instrumentVersion: '1.0.0' })
    const current = manifest({ instrumentVersion: '1.1.0' })
    const report = compareVersionManifests(stored, current)
    expect(report.overall).toBe('partially-comparable')
    expect(report.recommendation).toContain('instrumentVersion')
    expect(report.recommendation).toContain('adds coverage without invalidating')
  })

  it('a scoring major bump alone yields not-comparable overall with the do-not-diff recommendation', () => {
    const stored = manifest({ scoringVersion: '1.0.0' })
    const current = manifest({ scoringVersion: '2.0.0' })
    const report = compareVersionManifests(stored, current)
    expect(report.overall).toBe('not-comparable')
    expect(report.recommendation).toContain('scoringVersion')
    expect(report.recommendation).toContain('Recommend a fresh retake')
  })

  it('a career-model patch alone is merely comparable (cosmetic), not partially-comparable', () => {
    const stored = manifest({ careerModelVersion: '1.0.0' })
    const current = manifest({ careerModelVersion: '1.0.1' })
    const report = compareVersionManifests(stored, current)
    expect(report.overall).toBe('comparable')
    expect(report.recommendation).toBe('Only cosmetic changes since this result was generated — still directly comparable.')
  })
})

describe('compareVersionManifests — overall verdict is the worst axis, not an average', () => {
  it('one not-comparable axis drags the overall verdict down even when the others are identical', () => {
    const stored = manifest()
    const current = manifest({ instrumentVersion: '2.0.0' })
    const report = compareVersionManifests(stored, current)
    expect(report.overall).toBe('not-comparable')
    const scoringAxis = report.axes.find((a) => a.axis === 'scoringVersion')
    expect(scoringAxis?.verdict).toBe('identical')
  })

  it('names every axis tied for worst in the recommendation, joined with "and"', () => {
    const stored = manifest()
    const current = manifest({ instrumentVersion: '2.0.0', careerModelVersion: '2.0.0' })
    const report = compareVersionManifests(stored, current)
    expect(report.overall).toBe('not-comparable')
    expect(report.recommendation).toContain('instrumentVersion and careerModelVersion')
  })
})

describe('compareVersionManifests — a scoring patch is NOT merely cosmetic (unlike instrument/career patches)', () => {
  it('flags scoring patches as partially-comparable, since raw scores may shift', () => {
    const stored = manifest({ scoringVersion: '1.0.0' })
    const current = manifest({ scoringVersion: '1.0.1' })
    const report = compareVersionManifests(stored, current)
    const scoringAxis = report.axes.find((a) => a.axis === 'scoringVersion')
    expect(scoringAxis?.verdict).toBe('partially-comparable')
    expect(report.overall).toBe('partially-comparable')
  })
})
