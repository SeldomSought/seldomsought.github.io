import { describe, it, expect } from 'vitest'
import { PRIVACY_POINTS, PRIVACY_POSITIVE } from './privacy'

const REQUIRED_TOPICS = ['stored', 'where', 'leaves', 'analytics', 'delete']

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

describe('privacy copy — covers every required topic, stays concise', () => {
  it('covers exactly the five required topics, no more, no fewer', () => {
    expect(PRIVACY_POINTS.map((p) => p.id).sort()).toEqual([...REQUIRED_TOPICS].sort())
  })

  it('each point is a short, plain-English answer, not a paragraph', () => {
    for (const point of PRIVACY_POINTS) {
      expect(wordCount(point.body)).toBeLessThanOrEqual(40)
    }
  })

  it('the whole explanation stays well clear of "1,500 words of legal theater"', () => {
    const total = PRIVACY_POINTS.reduce((sum, p) => sum + wordCount(p.label) + wordCount(p.body), 0) + wordCount(PRIVACY_POSITIVE)
    expect(total).toBeLessThan(250)
  })

  it('answers "does this leave the device" and "does analytics see answers" unambiguously with a direct no', () => {
    const leaves = PRIVACY_POINTS.find((p) => p.id === 'leaves')!
    const analytics = PRIVACY_POINTS.find((p) => p.id === 'analytics')!
    expect(leaves.body).toMatch(/^No\b/)
    expect(analytics.body).toMatch(/^No\b/)
  })

  it('frames on-device storage as a positive characteristic, not just a caveat', () => {
    expect(PRIVACY_POSITIVE).toMatch(/isn.t a limitation/i)
  })
})
