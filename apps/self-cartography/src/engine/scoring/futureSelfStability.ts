import type { FacetScore, Response } from '../types'

export interface FutureSelfStability {
  /** Preserved under scarcity at both five and ten years — the load-bearing elements. */
  durable: FacetScore[]
  /** Preserved only at the five-year horizon. */
  fiveYearOnly: FacetScore[]
  /** Preserved only at the ten-year horizon. */
  tenYearOnly: FacetScore[]
}

const FIVE_YEAR_ITEM_ID = 'fut-cascade-5'
const TEN_YEAR_ITEM_ID = 'fut-cascade-10'

/**
 * Reads the two "preserve only 4 of 15" cascades directly — not the
 * blended facet scores — to find which elements of the imagined future
 * survived real scarcity at BOTH horizons. Those are what a career
 * actually needs to be built around; something that only survived one
 * horizon mattered, but isn't (yet) a permanent fixture.
 */
export function computeFutureSelfStability(
  responses: Record<string, Response>,
  facetScores: Record<string, FacetScore>,
): FutureSelfStability | null {
  const fiveYear = responses[FIVE_YEAR_ITEM_ID]?.value
  const tenYear = responses[TEN_YEAR_ITEM_ID]?.value
  if (!Array.isArray(fiveYear) || !Array.isArray(tenYear)) return null

  const fiveSet = new Set(fiveYear)
  const tenSet = new Set(tenYear)

  const toScores = (ids: string[]) =>
    ids.map((id) => facetScores[id]).filter((f): f is FacetScore => Boolean(f))

  return {
    durable: toScores([...fiveSet].filter((id) => tenSet.has(id))),
    fiveYearOnly: toScores([...fiveSet].filter((id) => !tenSet.has(id))),
    tenYearOnly: toScores([...tenSet].filter((id) => !fiveSet.has(id))),
  }
}
