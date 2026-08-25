import type { CareerFitResult } from './careerMatch'
import { CATEGORY_LABEL } from './careerFitModel'
import { FACET_BY_ID } from '../../content/facets'

/**
 * The two one-line reads a restrained Career Explorer card needs — never
 * the full sentence-level "why" bullets the deep-analysis card already
 * shows, and never invented copy: both derive from the exact same
 * categories/penalties/frictions CareerFitResult already computed.
 */

/** "Strong interest + autonomy fit" — the 1-2 highest-compatibility
 *  categories, named plainly. Returns null only when nothing was scored at
 *  all (an unmeasured career has no reason to report). */
export function summarizePrimaryReason(result: CareerFitResult): string | null {
  const ranked = [...result.categories].sort((a, b) => b.compatibility - a.compatibility)
  if (ranked.length === 0) return null

  const top = ranked.filter((c) => c.compatibility >= 60).slice(0, 2)
  const chosen = top.length > 0 ? top : ranked.slice(0, 1)
  const qualifier = chosen[0].compatibility >= 80 ? 'Strong' : chosen[0].compatibility >= 60 ? 'Solid' : 'Best available'
  const names = chosen.map((c) => CATEGORY_LABEL[c.category].replace(/ Fit$/, '').toLowerCase())
  return `${qualifier} ${names.join(' + ')} fit`
}

/** "Friction: stakeholder coordination" — the single largest cost, an
 *  explicit dealbreaker-level penalty if one exists, otherwise the sharpest
 *  ordinary friction. Null when the career has no real friction to report. */
export function summarizeLargestFriction(result: CareerFitResult): string | null {
  if (result.penalties.length > 0) {
    const worst = [...result.penalties].sort((a, b) => b.points - a.points)[0]
    return `Friction: ${worst.label.toLowerCase()}`
  }
  if (result.frictions.length > 0) {
    const worst = result.frictions[0] // already sorted worst-first by computeCareerFit
    const label = FACET_BY_ID[worst.dimensionId]?.label ?? worst.dimensionId
    return `Friction: ${label.toLowerCase()}`
  }
  return null
}
