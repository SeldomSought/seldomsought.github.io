import type { CareerFitResult } from './careerMatch'
import type { EducationLevel } from '../../content/careers/occupationData'

/**
 * The Career Explorer's sort/filter model. Two kinds of dimension, kept
 * honest about which is which: Overall fit, Interest fit, and Environment
 * read this respondent's own compatibility (from CareerFitResult.categories
 * — the exact same numbers the deep-analysis card already shows, never a
 * second, different measurement). Everything else — Income orientation,
 * Autonomy, Education required, Risk, Social intensity, Leadership, Work
 * style — reads a fact about the OCCUPATION ITSELF (Career's own objective
 * fields), independent of whether it happens to suit this respondent. That
 * split is deliberate: fit dimensions answer "how well does this match
 * me," the rest answer "what is this job actually like," and a browsing
 * tool needs both, not one dimension pretending to be the other.
 */
export type ExplorerDimension =
  | 'overallFit' | 'interestFit' | 'environment'
  | 'income' | 'autonomy' | 'education' | 'risk' | 'socialIntensity' | 'leadership' | 'workStyle'

export const DIMENSION_LABEL: Record<ExplorerDimension, string> = {
  overallFit: 'Overall fit',
  interestFit: 'Interest fit',
  environment: 'Environment',
  income: 'Income orientation',
  autonomy: 'Autonomy',
  education: 'Education required',
  risk: 'Risk',
  socialIntensity: 'Social intensity',
  leadership: 'Leadership',
  workStyle: 'Work style',
}

export const EXPLORER_DIMENSIONS: ExplorerDimension[] = [
  'overallFit', 'interestFit', 'environment', 'income', 'autonomy', 'education', 'risk', 'socialIntensity', 'leadership', 'workStyle',
]

/** Dimensions read from CareerFitResult.categories — this respondent's own compatibility. */
const FIT_DIMENSIONS: ReadonlySet<ExplorerDimension> = new Set(['interestFit', 'environment'])

export const EDUCATION_ORDER: EducationLevel[] = [
  'no-formal-credential', 'high-school', 'postsecondary-certificate', 'associates', 'bachelors', 'masters', 'doctoral-professional',
]

export const EDUCATION_LABEL: Record<EducationLevel, string> = {
  'no-formal-credential': 'No formal credential',
  'high-school': 'High school',
  'postsecondary-certificate': 'Certificate',
  associates: 'Associate’s degree',
  bachelors: 'Bachelor’s degree',
  masters: 'Master’s degree',
  'doctoral-professional': 'Doctoral / professional',
}

export function educationRank(level: EducationLevel): number {
  return EDUCATION_ORDER.indexOf(level)
}

/**
 * A single value for one dimension of one career — null when the
 * underlying fit category was never scored (never fabricated as 0, which
 * would silently outrank a career that's actually just unmeasured on that
 * axis). Education returns its ordinal rank (0-6), everything else 0-100.
 */
export function dimensionValue(result: CareerFitResult, dimension: ExplorerDimension): number | null {
  if (dimension === 'overallFit') return result.fitScore
  if (dimension === 'education') return educationRank(result.career.education)
  if (FIT_DIMENSIONS.has(dimension)) {
    const category = dimension === 'interestFit' ? 'interest' : 'environment'
    return result.categories.find((c) => c.category === category)?.compatibility ?? null
  }
  switch (dimension) {
    case 'income': return result.career.incomePotential
    case 'autonomy': return result.career.independence
    case 'risk': return result.career.risk
    case 'socialIntensity': return result.career.socialOrientation
    case 'leadership': return result.career.leadership
    case 'workStyle': return result.career.structure
    default: return null
  }
}

export type SortDirection = 'asc' | 'desc'

/** Unscored (null) dimension values always sort last, in either direction —
 *  "unmeasured" is never implicitly the best or worst score. */
export function sortByDimension(results: CareerFitResult[], dimension: ExplorerDimension, direction: SortDirection): CareerFitResult[] {
  return [...results].sort((a, b) => {
    const av = dimensionValue(a, dimension)
    const bv = dimensionValue(b, dimension)
    if (av === null && bv === null) return 0
    if (av === null) return 1
    if (bv === null) return -1
    return direction === 'desc' ? bv - av : av - bv
  })
}

export interface ExplorerFilters {
  /** Minimum required value, 0-100, for every dimension except education. 0 = no filter. */
  minValue: Partial<Record<ExplorerDimension, number>>
  /** Maximum acceptable education rank (0-6, see EDUCATION_ORDER). 6 = no filter. */
  maxEducationRank: number
}

export const DEFAULT_EXPLORER_FILTERS: ExplorerFilters = { minValue: {}, maxEducationRank: EDUCATION_ORDER.length - 1 }

/** A career failing a numeric filter it has no data for is excluded, not
 *  guessed into passing — an explicit minimum the respondent set is a real
 *  requirement, and "unmeasured" doesn't satisfy a requirement. */
export function filterResults(results: CareerFitResult[], filters: ExplorerFilters): CareerFitResult[] {
  return results.filter((r) => {
    if (educationRank(r.career.education) > filters.maxEducationRank) return false
    for (const [dim, min] of Object.entries(filters.minValue) as [ExplorerDimension, number][]) {
      if (!min) continue
      const value = dimensionValue(r, dim)
      if (value === null || value < min) return false
    }
    return true
  })
}
