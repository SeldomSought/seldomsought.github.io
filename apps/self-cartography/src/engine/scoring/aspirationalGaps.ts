import type { Response } from '../types'
import { ASPIRATION_ITEMS } from '../../content/instruments/aspiration.items'
import { FACET_BY_ID } from '../../content/facets'
import { likertToPoints } from './contributions'

/**
 * How a current/desired pair reads, once both numbers are on the table:
 *  'aligned'               — the two are close; this already is them.
 *  'developmentalAspiration' — desired notably exceeds current: a real
 *                            growth edge, not yet demonstrated.
 *  'exceedsDesired'        — current notably exceeds desired: true of
 *                            them now, but more than they'd actually want.
 */
export type AspirationCategory = 'aligned' | 'developmentalAspiration' | 'exceedsDesired'

export interface AspirationGap {
  facetId: string
  label: string
  prompt: string
  relatedFacetId?: string
  /** "Demonstrated identity" — how much this describes them now, 0–100. */
  currentScore: number
  /** "Desired identity" — how much they'd like it to, 0–100. */
  desiredScore: number
  /** desiredScore − currentScore. Can be negative. */
  gap: number
  category: AspirationCategory
}

// Roughly one full point apart on a 7-point scale — small enough that
// scale-use noise alone can't manufacture an "aligned" reading purely by chance.
const ALIGNED_THRESHOLD = 15

function categorize(gap: number): AspirationCategory {
  if (gap >= ALIGNED_THRESHOLD) return 'developmentalAspiration'
  if (gap <= -ALIGNED_THRESHOLD) return 'exceedsDesired'
  return 'aligned'
}

/**
 * Reads the aspirationalPair responses directly, never through the main
 * contributions.ts pipeline — "desired" and the gap are never blended
 * into any facet's own score (see AspirationalPairItem's docstring in
 * engine/types.ts). This is the only place either number is computed.
 */
export function computeAspirationGaps(responses: Record<string, Response>): AspirationGap[] {
  const out: AspirationGap[] = []

  for (const item of ASPIRATION_ITEMS) {
    if (item.format !== 'aspirationalPair') continue
    const response = responses[item.id]
    if (!response) continue

    const value = response.value
    const isPair = typeof value === 'object' && value !== null && !Array.isArray(value) && 'current' in value && 'desired' in value
    if (!isPair) continue
    const { current, desired } = value as { current: number; desired: number }

    const max = item.options.length
    const currentScore = Math.round(likertToPoints(current, undefined, max))
    const desiredScore = Math.round(likertToPoints(desired, undefined, max))
    const gap = desiredScore - currentScore

    out.push({
      facetId: item.facetId,
      label: FACET_BY_ID[item.facetId]?.label ?? item.facetId,
      prompt: item.prompt,
      relatedFacetId: item.relatedFacetId,
      currentScore,
      desiredScore,
      gap,
      category: categorize(gap),
    })
  }

  return out
}
