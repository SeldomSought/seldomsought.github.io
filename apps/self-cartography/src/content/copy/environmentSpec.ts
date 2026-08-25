/**
 * ENVIRONMENT SPECIFICATION — pure content. Before any job title, this is
 * the environment the profile actually appears built for: a short list of
 * required conditions, and a short list of recognizable friction — read
 * almost like a datasheet, not a personality-quiz paragraph. Every phrase
 * below is tied to exactly one real scored facet and a specific score band
 * ([min, max)); it only ever appears when this respondent's own score for
 * that facet actually falls in that band. Several spec/friction pairs
 * deliberately share a facet (autonomy_need powers both "High autonomy" and
 * "Micromanagement," for instance) — wanting a condition and being worn
 * down by its absence are two honest readings of the same real preference,
 * not two independent claims.
 */

export interface EnvironmentSpecItem {
  id: string
  facetId: string
  /** Inclusive lower bound. */
  min: number
  /** Exclusive upper bound — 100.01 reads as "and above," used so bands on
   *  the same facet (e.g. competition's Moderate/High) never overlap. */
  max: number
  phrase: string
}

export const ENVIRONMENT_SPEC_ITEMS: EnvironmentSpecItem[] = [
  { id: 'autonomy', facetId: 'autonomy_need', min: 65, max: 100.01, phrase: 'High autonomy' },
  { id: 'visible-consequences', facetId: 'work_measurable_outcomes', min: 60, max: 100.01, phrase: 'Visible consequences' },
  { id: 'competition-high', facetId: 'work_competition', min: 70, max: 100.01, phrase: 'High competition' },
  { id: 'competition-moderate', facetId: 'work_competition', min: 45, max: 70, phrase: 'Moderate competition' },
  { id: 'low-bureaucracy', facetId: 'work_bureaucracy', min: 0, max: 35, phrase: 'Low bureaucracy' },
  { id: 'interpersonal-variety', facetId: 'work_public_interaction', min: 60, max: 100.01, phrase: 'Frequent interpersonal variety' },
  { id: 'clear-objectives', facetId: 'structure_need', min: 60, max: 100.01, phrase: 'Clear objectives' },
  { id: 'flexible-method', facetId: 'work_creative_freedom', min: 60, max: 100.01, phrase: 'Flexible method' },
  { id: 'ownership', facetId: 'future_ownership', min: 60, max: 100.01, phrase: 'Opportunity for ownership' },
  { id: 'feedback-loops', facetId: 'work_short_feedback_loops', min: 55, max: 100.01, phrase: 'Short-to-medium feedback loops' },
]

export const ENVIRONMENT_FRICTION_ITEMS: EnvironmentSpecItem[] = [
  { id: 'micromanagement', facetId: 'autonomy_need', min: 65, max: 100.01, phrase: 'Micromanagement' },
  { id: 'repetitive-maintenance', facetId: 'work_task_variety', min: 65, max: 100.01, phrase: 'Repetitive maintenance' },
  { id: 'low-accountability', facetId: 'work_measurable_outcomes', min: 60, max: 100.01, phrase: 'Low accountability' },
  { id: 'political-hierarchy', facetId: 'work_bureaucracy', min: 0, max: 35, phrase: 'Highly political hierarchy' },
]
