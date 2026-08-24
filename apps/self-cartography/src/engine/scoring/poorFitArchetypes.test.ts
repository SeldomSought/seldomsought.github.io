import { describe, it, expect } from 'vitest'
import { evaluatePoorFits } from './poorFitArchetypes'
import { ENVIRONMENT_ARCHETYPES } from '../../content/careers/poorFitArchetypes'
import { FACET_BY_ID } from '../../content/facets'
import type { EnvironmentArchetype } from '../../content/careers/poorFitArchetypes'
import type { FacetScore } from '../types'

function fs(facetId: string, score: number, overrides: Partial<FacetScore> = {}): FacetScore {
  return { facetId, label: facetId, score, confidence: 'High', evidenceCount: 4, itemsExpected: 4, behavioralEvidenceCount: 1, internalConsistency: 90, contradictionCount: 0, ...overrides }
}

const RIGID: EnvironmentArchetype = {
  id: 'rigid-test', label: 'Rigid Test Environment', description: 'A synthetic archetype for exercising the convergence gate.',
  dimensions: [
    { facetId: 'orderliness', characteristic: 90 },
    { facetId: 'autonomy_need', characteristic: 10 },
    { facetId: 'work_creative_freedom', characteristic: 10 },
  ],
}

describe('evaluatePoorFits — only flags an archetype when a real majority of its dimensions converge on severe friction', () => {
  it('flags when every scored dimension shows a severe gap (gap > 40)', () => {
    const scores = {
      orderliness: fs('orderliness', 15), // desired 90, gap 75
      autonomy_need: fs('autonomy_need', 90), // desired 10, gap 80
      work_creative_freedom: fs('work_creative_freedom', 85), // desired 10, gap 75
    }
    const result = evaluatePoorFits(scores, [RIGID])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('rigid-test')
    expect(result[0].reasons).toHaveLength(3)
  })

  it('does NOT flag when only one outlier dimension is severe — one bad data point never fabricates a whole conflict', () => {
    const scores = {
      orderliness: fs('orderliness', 15), // severe, gap 75
      autonomy_need: fs('autonomy_need', 15), // aligned, gap 5
      work_creative_freedom: fs('work_creative_freedom', 20), // aligned, gap 10
    }
    const result = evaluatePoorFits(scores, [RIGID])
    expect(result).toEqual([])
  })

  it('does NOT flag when coverage of the archetype’s own dimensions is too thin, even if what was scored is severe', () => {
    const scores = { orderliness: fs('orderliness', 10) } // only 1 of 3 dims — below MIN_DIMENSIONS_SCORED and MIN_COVERAGE_RATIO
    const result = evaluatePoorFits(scores, [RIGID])
    expect(result).toEqual([])
  })

  it('never fabricates from zero evidence', () => {
    expect(evaluatePoorFits({}, [RIGID])).toEqual([])
  })

  it('does not flag a genuinely neutral profile just because a gap lands exactly on the threshold', () => {
    // a flat, uninformative 50 sits exactly 40 away from this archetype's 90/10/10 characteristics —
    // "friction" has to mean more than touching the boundary, or a truly neutral profile gets flagged.
    const scores = {
      orderliness: fs('orderliness', 50),
      autonomy_need: fs('autonomy_need', 50),
      work_creative_freedom: fs('work_creative_freedom', 50),
    }
    expect(evaluatePoorFits(scores, [RIGID])).toEqual([])
  })
})

describe('evaluatePoorFits — reasons and dimensions are honest about what actually drove the flag', () => {
  it('reasons only include dimensions that individually cleared the friction threshold, not every scored dimension', () => {
    const archetype: EnvironmentArchetype = {
      id: 'mixed', label: 'Mixed', description: 'test',
      dimensions: [
        { facetId: 'orderliness', characteristic: 90 },
        { facetId: 'autonomy_need', characteristic: 10 },
        { facetId: 'compassion', characteristic: 20 },
      ],
    }
    const scores = {
      orderliness: fs('orderliness', 10), // severe, gap 80
      autonomy_need: fs('autonomy_need', 90), // severe, gap 80
      compassion: fs('compassion', 45), // mild, gap 25 — below the friction threshold, still scored, still counted toward coverage/severity
    }
    const result = evaluatePoorFits(scores, [archetype])
    expect(result).toHaveLength(1) // 2 of 3 severe = 0.67 >= MIN_FRICTION_FRACTION
    expect(result[0].dimensions).toHaveLength(3) // every scored dimension is still visible in the open ledger
    expect(result[0].reasons).toHaveLength(2) // but only the two that actually cleared the threshold get a "why"
    expect(result[0].reasons.some((r) => r.dimensionId === 'compassion')).toBe(false)
  })

  it('conflictSeverity is the mean gap across scored dimensions, and reasons/dimensions are sorted worst-gap-first', () => {
    const scores = {
      orderliness: fs('orderliness', 10), // gap 80
      autonomy_need: fs('autonomy_need', 90), // gap 80
      work_creative_freedom: fs('work_creative_freedom', 60), // gap 50
    }
    const result = evaluatePoorFits(scores, [RIGID])
    expect(result[0].conflictSeverity).toBe(70) // (80+80+50)/3
    expect(result[0].dimensions.map((d) => d.gap)).toEqual([80, 80, 50])
  })
})

describe('evaluatePoorFits — confidence follows the same shared rule as career fit', () => {
  it('is High when contributing evidence is strong and coverage is full', () => {
    const scores = {
      orderliness: fs('orderliness', 10),
      autonomy_need: fs('autonomy_need', 90),
      work_creative_freedom: fs('work_creative_freedom', 85),
    }
    const result = evaluatePoorFits(scores, [RIGID])
    expect(result[0].confidence).toBe('High')
  })

  it('downgrades when a contributing dimension is thinly measured', () => {
    const scores = {
      orderliness: fs('orderliness', 10, { confidence: 'Low' }),
      autonomy_need: fs('autonomy_need', 90),
      work_creative_freedom: fs('work_creative_freedom', 85),
    }
    const result = evaluatePoorFits(scores, [RIGID])
    expect(result[0].confidence).not.toBe('High')
  })
})

describe('evaluatePoorFits — sorts strongest conflict first', () => {
  it('ranks archetypes by conflictSeverity, descending', () => {
    const mild: EnvironmentArchetype = {
      id: 'mild', label: 'Mild', description: 'test',
      dimensions: [{ facetId: 'orderliness', characteristic: 90 }, { facetId: 'autonomy_need', characteristic: 10 }],
    }
    const scoresRigid = {
      orderliness: fs('orderliness', 15), // gap 75 (desired 90) — shared by both archetypes
      autonomy_need: fs('autonomy_need', 85), // gap 75 (desired 10) — shared by both archetypes
      work_creative_freedom: fs('work_creative_freedom', 95), // gap 85 (desired 10) — only RIGID has this third dimension
    }
    // mild's severity is the mean of just the two shared dims (75); RIGID's third,
    // worse-gapped dimension pulls its mean above that — both flagged, RIGID stronger.
    const result = evaluatePoorFits(scoresRigid, [mild, RIGID])
    expect(result.map((r) => r.id)).toEqual(['rigid-test', 'mild'])
  })
})

describe('the real ENVIRONMENT_ARCHETYPES content — every archetype is auditable', () => {
  it('every dimension names a facet that actually exists', () => {
    for (const archetype of ENVIRONMENT_ARCHETYPES) {
      for (const dim of archetype.dimensions) {
        expect(FACET_BY_ID[dim.facetId], `${archetype.id} references unknown facet ${dim.facetId}`).toBeTruthy()
      }
    }
  })
  it('every archetype has enough dimensions to ever pass the convergence gate', () => {
    for (const archetype of ENVIRONMENT_ARCHETYPES) {
      expect(archetype.dimensions.length).toBeGreaterThanOrEqual(3)
    }
  })
  it('has no duplicate archetype ids', () => {
    const ids = ENVIRONMENT_ARCHETYPES.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
