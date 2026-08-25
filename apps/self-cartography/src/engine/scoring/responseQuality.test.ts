import { describe, it, expect } from 'vitest'
import { summarize } from './responseQuality'
import type { QualitySignal } from './responseQuality'

function signal(severity: 'note' | 'flag', id = 'x'): QualitySignal {
  return { id, category: 'missingResponses', severity, label: id, detail: '' }
}

describe('summarize — profileConfidence tiering', () => {
  it('is High with no signals at all', () => {
    expect(summarize([]).profileConfidence).toBe('High')
  })

  it('a single note alone is not enough to leave High — matches the prior threshold exactly', () => {
    expect(summarize([signal('note')]).profileConfidence).toBe('High')
  })

  it('two or more notes together do nudge High to Moderate', () => {
    expect(summarize([signal('note', 'a'), signal('note', 'b')]).profileConfidence).toBe('Moderate')
  })

  it('a single real flag alone nudges High to Moderate', () => {
    expect(summarize([signal('flag')]).profileConfidence).toBe('Moderate')
  })

  it('two real flags alone reach Moderate, not Limited', () => {
    expect(summarize([signal('flag', 'a'), signal('flag', 'b')]).profileConfidence).toBe('Moderate')
  })

  it('three real flags alone reach Limited — flags alone can cross that boundary', () => {
    expect(summarize([signal('flag', 'a'), signal('flag', 'b'), signal('flag', 'c')]).profileConfidence).toBe('Limited')
  })

  it('REGRESSION: a benign note stacked onto two flags does NOT tip Moderate into Limited', () => {
    // The exact bug found in a real synthetic walkthrough: 2 flags (4 points under
    // the old flat point tally) sat right at the Moderate ceiling; adding one
    // ordinary note used to push the total to 5 and flip the verdict to Limited,
    // even though the note itself represents no real data-quality problem.
    const withoutNote = summarize([signal('flag', 'a'), signal('flag', 'b')])
    const withNote = summarize([signal('flag', 'a'), signal('flag', 'b'), signal('note', 'c')])
    expect(withoutNote.profileConfidence).toBe('Moderate')
    expect(withNote.profileConfidence).toBe('Moderate')
  })

  it('a pile of notes alone, with zero flags, still never reaches Limited', () => {
    const manyNotes = Array.from({ length: 10 }, (_, i) => signal('note', `n${i}`))
    expect(summarize(manyNotes).profileConfidence).not.toBe('Limited')
  })

  it('notes can still stack with flags within Moderate — the summary text lists every category involved', () => {
    const result = summarize([signal('flag', 'a'), signal('note', 'b')])
    expect(result.summary).toContain('Missing responses')
  })
})
