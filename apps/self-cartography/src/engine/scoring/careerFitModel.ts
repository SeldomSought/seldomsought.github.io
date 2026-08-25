import type { Career } from '../../content/careers/occupationData'

/**
 * OUR FIT MODEL — the (deliberately separate) transformation from
 * objective occupation data (content/careers/occupationData.ts) into what
 * this app actually compares against a respondent's scored facets. This
 * file is the entire bridge: every rule below names the exact objective
 * field it reads and the exact internal facet id it produces, so a
 * recommendation is always traceable back to a specific, inspectable
 * mapping rule — not a black box, and not hand-tuned numbers that could
 * silently drift from what the occupation data actually says.
 *
 * Changing how much RIASEC, risk, or leadership matter for fit means
 * editing a rule HERE, in one place — never touching occupationData.ts,
 * which stays pure fact about the occupation.
 */

export type CareerFitCategory =
  | 'interest' | 'personality' | 'strength' | 'environment' | 'values'
  | 'lifestyle' | 'risk' | 'autonomy' | 'social' | 'leadership'

export const CATEGORY_LABEL: Record<CareerFitCategory, string> = {
  interest: 'Interest Fit',
  personality: 'Personality Fit',
  strength: 'Strength Fit',
  environment: 'Environment Fit',
  values: 'Values Fit',
  lifestyle: 'Lifestyle Fit',
  risk: 'Risk Fit',
  autonomy: 'Autonomy Fit',
  social: 'Social Fit',
  leadership: 'Leadership Fit',
}

export interface CareerDimension {
  facetId: string
  /** Desired level 0-100 on that facet's own scale. */
  desired: number
  /** A severe gap here costs an explicit penalty on top of the ordinary
   *  averaged-in alignment — see engine/scoring/careerMatch.ts. */
  dealbreaker?: boolean
}

export interface CareerCategoryProfile {
  category: CareerFitCategory
  weight: number
  dimensions: CareerDimension[]
}

// ── base weight per category: a fixed, documented prior for how much
// this KIND of factor generally matters for fit, before anything
// occupation-specific is considered. Interest leads because how much
// someone wants to do the actual work is the single best-evidenced
// predictor of satisfaction; personality trails because "do not simply
// correlate personality with occupation" is a design constraint here,
// not just a caption. ──
const BASE_WEIGHT: Record<CareerFitCategory, number> = {
  interest: 3, risk: 2, autonomy: 2, environment: 2, strength: 2,
  values: 1, lifestyle: 1, social: 1, leadership: 1, personality: 1,
}

/** An occupation's own value on a dimension being extreme (far from the
 *  middle) means that dimension is unusually DEFINING for the occupation
 *  — worth weighting up, by the same fixed rule every time. */
function extremityBoost(objectiveValue: number): number {
  return Math.abs(objectiveValue - 50) >= 35 ? 1 : 0
}

// ── name-keyed lookup tables: exactly how a specific O*NET-style Skill,
// Ability, or Work Context name is read, so the mapping is auditable by
// name, not by a hidden per-career judgment call. ──

const SKILL_OR_ABILITY_TO_STRENGTH: Record<string, string> = {
  'Complex Problem Solving': 'strength_analytical_ability',
  'Critical Thinking': 'strength_analytical_ability',
  'Systems Analysis': 'strength_analytical_ability',
  'Deductive Reasoning': 'strength_analytical_ability',
  'Originality': 'strength_creative_ability',
  'Fluency of Ideas': 'strength_creative_ability',
  'Social Perceptiveness': 'strength_interpersonal_ability',
  'Coordination': 'strength_interpersonal_ability',
  'Time Management': 'strength_organizational_ability',
  'Management of Personnel Resources': 'strength_organizational_ability',
}

const WORK_CONTEXT_TO_ENVIRONMENT: Record<string, { facetId: string; invert?: boolean }> = {
  'Time Pressure': { facetId: 'work_pace' },
  // O*NET's "structured" runs opposite our work_predictability scale
  // (ours: 100 = unpredictable) — inverted here, once, by name.
  'Structured versus Unstructured Work': { facetId: 'work_predictability', invert: true },
  'Freedom to Make Decisions': { facetId: 'work_creative_freedom' },
  // ours: 100 = solitude — high O*NET "contact" inverts to low solitude.
  'Contact With Others': { facetId: 'work_solitude_social', invert: true },
  'Deal With External Customers': { facetId: 'work_public_interaction' },
  'Public Speaking': { facetId: 'work_public_interaction' },
  'Level of Competition': { facetId: 'work_competition' },
}

/** Averages every work-context/skill entry whose name maps to the same
 *  facet id, rather than letting whichever entry happens to come last win. */
function averageMappedValues(entries: { name: string; value: number }[], lookup: (name: string) => { facetId: string; invert?: boolean } | undefined): Record<string, number> {
  const sums: Record<string, { total: number; count: number }> = {}
  for (const entry of entries) {
    const mapped = lookup(entry.name)
    if (!mapped) continue
    const value = mapped.invert ? 100 - entry.value : entry.value
    const bucket = (sums[mapped.facetId] ??= { total: 0, count: 0 })
    bucket.total += value
    bucket.count += 1
  }
  return Object.fromEntries(Object.entries(sums).map(([facetId, { total, count }]) => [facetId, Math.round(total / count)]))
}

function category(cat: CareerFitCategory, weightSignal: number, dimensions: CareerDimension[]): CareerCategoryProfile | null {
  if (dimensions.length === 0) return null
  return { category: cat, weight: BASE_WEIGHT[cat] + extremityBoost(weightSignal), dimensions }
}

/**
 * The entry point: read an occupation's objective fields and produce the
 * category profiles engine/scoring/careerMatch.ts scores a respondent
 * against. Every category is OMITTED (never fabricated with a made-up
 * desired value) when the occupation simply doesn't carry the objective
 * signal that category would need.
 */
export function deriveFitCategories(career: Career): CareerCategoryProfile[] {
  const categories: (CareerCategoryProfile | null)[] = []

  // Interest — every RIASEC axis, straight from the occupation's own profile.
  categories.push(category('interest', Math.max(...Object.values(career.riasec)), [
    { facetId: 'riasec_realistic', desired: career.riasec.realistic },
    { facetId: 'riasec_investigative', desired: career.riasec.investigative },
    { facetId: 'riasec_artistic', desired: career.riasec.artistic },
    { facetId: 'riasec_social', desired: career.riasec.social },
    { facetId: 'riasec_enterprising', desired: career.riasec.enterprising },
    { facetId: 'riasec_conventional', desired: career.riasec.conventional },
  ]))

  // Personality — deliberately light: only two facets, each derived from
  // a structural/behavioral field rather than treated as its own primary signal.
  categories.push(category('personality', 0, [
    { facetId: 'orderliness', desired: career.structure },
    { facetId: 'assertiveness', desired: career.leadership },
  ]))

  // Strength — averaged from any Skill/Ability entries this occupation
  // happens to list that match the lookup table; occupations that don't
  // list a matching skill simply don't get a strength category.
  {
    const mapped = averageMappedValues(
      [...career.skills, ...career.abilities].map((s) => ({ name: s.name, value: s.level })),
      (name) => { const facetId = SKILL_OR_ABILITY_TO_STRENGTH[name]; return facetId ? { facetId } : undefined },
    )
    const dims = Object.entries(mapped).map(([facetId, desired]) => ({ facetId, desired }))
    categories.push(category('strength', Math.max(0, ...dims.map((d) => d.desired)), dims))
  }

  // Environment — averaged from Work Context entries that match the lookup table.
  {
    const mapped = averageMappedValues(
      career.workContext.map((w) => ({ name: w.name, value: w.level })),
      (name) => WORK_CONTEXT_TO_ENVIRONMENT[name],
    )
    const dims = Object.entries(mapped).map(([facetId, desired]) => ({ facetId, desired }))
    categories.push(category('environment', Math.max(0, ...dims.map((d) => d.desired)), dims))
  }

  // Values — only when a workActivity actually speaks to it; never invented.
  {
    const caring = career.workActivities.find((a) => a.name === 'Assisting and Caring for Others')
    const dims = caring ? [{ facetId: 'benevolence', desired: caring.importance }] : []
    categories.push(category('values', caring?.importance ?? 0, dims))
  }

  // Lifestyle — anchor_security reads inversely from objective risk (a
  // low-risk, high-structure occupation is exactly what a security anchor wants).
  categories.push(category('lifestyle', career.risk, [
    { facetId: 'anchor_security', desired: Math.round((100 - career.risk) * 0.6 + career.structure * 0.4) },
  ]))

  // Risk — both derived from the single objective risk field. Only one
  // real signal exists here, so both dimensions honestly share it rather
  // than inventing false precision.
  categories.push(category('risk', career.risk, [
    { facetId: 'uncertainty_tolerance', desired: career.risk, dealbreaker: career.risk >= 75 || career.risk <= 25 },
    { facetId: 'risk_career', desired: career.risk, dealbreaker: career.risk >= 75 || career.risk <= 25 },
  ]))

  // Autonomy — directly from the occupation's own independence rating.
  categories.push(category('autonomy', career.independence, [
    { facetId: 'autonomy_need', desired: career.independence, dealbreaker: career.independence >= 85 },
  ]))

  // Social — sociability from socialOrientation, riasec_social already
  // covered under Interest but repeated here against a different internal
  // facet (temperament, not interest) on purpose — they measure different things.
  categories.push(category('social', career.socialOrientation, [
    { facetId: 'sociability', desired: career.socialOrientation },
  ]))

  // Leadership — directly from the occupation's own leadership rating.
  categories.push(category('leadership', career.leadership, [
    { facetId: 'anchor_general_management', desired: career.leadership },
    { facetId: 'future_leadership', desired: career.leadership },
  ]))

  return categories.filter((c): c is CareerCategoryProfile => c !== null)
}
