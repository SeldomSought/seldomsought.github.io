import type { FacetMeta } from './facets'

/**
 * RETESTING ARCHITECTURE — stability classification.
 *
 * Distinguishes relatively stable personality traits from preferences and
 * circumstances that can meaningfully change year to year. This is a
 * property of the CONSTRUCT itself (which report group it belongs to),
 * not of any single measurement — see engine/scoring/stability.ts for how
 * a facet's own construct confidence additionally downgrades this to
 * 'uncertain' when there isn't enough evidence to trust today's number at
 * all, independent of what the literature says about the construct's
 * theoretical stability.
 *
 * The classification below is a genuine claim about each group, not a
 * placeholder:
 *  - personality, interests, careerAnchors, strengths — the psychometric
 *    literature treats these as comparatively stable in adulthood (Big
 *    Five/HEXACO traits show high rank-order stability year over year;
 *    Holland's RIASEC interests are similarly durable; Schein's career
 *    anchors are explicitly theorized to stabilize once formed early in a
 *    career; demonstrated ability and ease are durable once built, even if
 *    the newest skill hasn't caught up yet).
 *  - values — moderately stable (Schwartz values shift more slowly than
 *    preferences, but do move with major life events), classified stable
 *    on balance.
 *  - desire, workEnvironment, riskUncertainty, needsAndTolerance,
 *    futureSelf, aspiration — these are explicitly preference/circumstance
 *    measures: risk tolerance is well-documented as life-stage and
 *    circumstance dependent; Future Self is by definition an imagined life
 *    tied to where someone is standing today; Aspiration is explicitly the
 *    current gap between self-image and desired self, which closes or
 *    moves by construction. Classified changing.
 *  - validityOnly — not a substantive trait at all (reverse-check items
 *    exist to catch inattentive responding, not to describe the person);
 *    never meaningfully "stable" or "changing" across retests.
 */
export type StabilityClass = 'stable' | 'changing' | 'uncertain'

export const STABILITY_LABEL: Record<StabilityClass, string> = {
  stable: 'Stable',
  changing: 'Changing',
  uncertain: 'Uncertain',
}

export const STABILITY_BLURB: Record<StabilityClass, string> = {
  stable: 'Trait-like — the literature and this instrument’s own design both expect this to hold up across years more than it drifts.',
  changing: 'Preference- or circumstance-like — expected to genuinely move with life stage, role, and context, not just measurement noise.',
  uncertain: 'Not enough evidence behind this specific number yet to say whether a future change would be real movement or just thin measurement.',
}

export const STABILITY_BY_GROUP: Record<FacetMeta['group'], StabilityClass> = {
  personality: 'stable',
  interests: 'stable',
  careerAnchors: 'stable',
  strengths: 'stable',
  values: 'stable',
  desire: 'changing',
  workEnvironment: 'changing',
  riskUncertainty: 'changing',
  needsAndTolerance: 'changing',
  futureSelf: 'changing',
  aspiration: 'changing',
  validityOnly: 'uncertain',
}
