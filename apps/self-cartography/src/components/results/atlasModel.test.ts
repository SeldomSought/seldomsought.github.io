import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { ATLAS_LAYERS, REPORT_VIEWS, atlasDimensions } from './atlasModel'
import { createExampleResponses } from './exampleResponses'
import { scoreAssessment } from '../../engine/scoring'
import { ALL_ITEMS } from '../../content/instruments'
import { isItemAnswered } from '../../engine/navigation'

describe('atlas measurement integrity', () => {
  it('does not turn unanswered dimensions into neutral or zero scores', () => {
    const dimensions = atlasDimensions(ATLAS_LAYERS[0], {})
    expect(dimensions).toHaveLength(6)
    expect(dimensions.every((d) => d.facet === null)).toBe(true)
  })
  it('retains a real zero score and its confidence instead of treating it as missing', () => {
    const scored = scoreAssessment({ 'tmp-ic-2': { itemId: 'tmp-ic-2', value: 5, firstAnsweredAt: 1, lastAnsweredAt: 1, responseTimeMs: 9000, revisitCount: 0 } })
    const f = scored.facetScores.openness
    expect(f.score).toBe(0)
    const d = atlasDimensions(ATLAS_LAYERS[1], scored.facetScores)[0]
    expect(d.facet).toBe(f)
    expect(d.facet?.confidence).toBe(f.confidence)
  })
  it('assigns every report section to exactly one reading view', () => {
    const source = readFileSync(new URL('./ResultsReport.tsx', import.meta.url), 'utf8')
    const sections = [...source.matchAll(/<Section eyebrow="([^"]+)"/g)].map((m) => m[1])
    expect(sections.length).toBeGreaterThan(25)
    for (const section of sections) {
      expect(REPORT_VIEWS.filter((v) => (v.sections as readonly string[]).includes(section)), section).toHaveLength(1)
    }
  })
  it('creates reproducible, valid example answers for every required format', () => {
    const example = createExampleResponses()
    expect(example).toEqual(createExampleResponses())
    for (const item of ALL_ITEMS.filter((i) => !('optional' in i && i.optional))) {
      expect(isItemAnswered(item, example), item.id).toBe(true)
    }
    const scores = scoreAssessment(example).facetScores
    expect(Object.keys(scores).length).toBeGreaterThan(70)
    expect(ATLAS_LAYERS.every((layer) => atlasDimensions(layer, scores).every((d) => d.facet !== null))).toBe(true)
  })
})
