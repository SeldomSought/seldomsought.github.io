/**
 * LIKELY POOR FITS — pure content. Each archetype describes a recognizable
 * kind of work ENVIRONMENT (not a specific job title from occupationData.ts)
 * defined by a small handful of its most defining characteristics, on the
 * same internal facet scale everywhere else in this app already uses.
 * engine/scoring/poorFitArchetypes.ts is the (separate, auditable) logic
 * that decides whether a given profile actually conflicts with one of
 * these — nothing here knows how that decision gets made.
 */

export interface ArchetypeDimension {
  facetId: string
  /** 0-100 — how characteristic this trait is of the environment itself,
   *  on the same scale as the respondent's own scored facet. */
  characteristic: number
}

export interface EnvironmentArchetype {
  id: string
  label: string
  /** One line, plain-language: what this environment actually involves day to day. */
  description: string
  dimensions: ArchetypeDimension[]
}

export const ENVIRONMENT_ARCHETYPES: EnvironmentArchetype[] = [
  {
    id: 'procedural-compliance',
    label: 'Highly Procedural Compliance Work',
    description: 'Work built almost entirely around following fixed rules, checklists, and regulatory procedure — accuracy against a script matters far more than judgment or invention.',
    dimensions: [
      { facetId: 'orderliness', characteristic: 90 },
      { facetId: 'work_creative_freedom', characteristic: 10 },
      { facetId: 'conformity', characteristic: 85 },
      { facetId: 'autonomy_need', characteristic: 15 },
    ],
  },
  {
    id: 'clerical-processing',
    label: 'Repeated Clerical Processing',
    description: 'High-volume, repetitive administrative processing — the same handful of steps, over and over, with speed and accuracy as the whole measure of success.',
    dimensions: [
      { facetId: 'work_task_variety', characteristic: 10 },
      { facetId: 'riasec_conventional', characteristic: 85 },
      { facetId: 'work_creative_freedom', characteristic: 15 },
      { facetId: 'industriousness', characteristic: 75 },
    ],
  },
  {
    id: 'low-autonomy',
    label: 'Very Low-Autonomy Environments',
    description: 'Work where nearly every decision, however small, needs sign-off from someone else — little room to choose your own approach or move without checking first.',
    dimensions: [
      { facetId: 'autonomy_need', characteristic: 10 },
      { facetId: 'work_creative_freedom', characteristic: 15 },
      { facetId: 'structure_need', characteristic: 85 },
      { facetId: 'power', characteristic: 15 },
    ],
  },
  {
    id: 'high-conflict-sales',
    label: 'High-Conflict, Combative Sales',
    description: 'Adversarial, quota-driven selling where every interaction is a contest to be won — constant pushback, and constant visible comparison against other closers.',
    dimensions: [
      { facetId: 'work_competition', characteristic: 90 },
      { facetId: 'compassion', characteristic: 20 },
      { facetId: 'assertiveness', characteristic: 90 },
    ],
  },
  {
    id: 'rigid-bureaucracy',
    label: 'Rigid Hierarchical Bureaucracy',
    description: 'Formal chains of approval where nearly every action routes through several layers of sign-off before anything actually happens.',
    dimensions: [
      { facetId: 'work_bureaucracy', characteristic: 90 },
      { facetId: 'autonomy_need', characteristic: 15 },
      { facetId: 'power', characteristic: 20 },
    ],
  },
  {
    id: 'nonstop-public-service',
    label: 'Nonstop, High-Pressure Public-Facing Service',
    description: 'Constant, fast-paced contact with a stream of strangers under time pressure — little control over the pace, and almost no solitude.',
    dimensions: [
      { facetId: 'work_pace', characteristic: 90 },
      { facetId: 'work_public_interaction', characteristic: 90 },
      { facetId: 'work_solitude_social', characteristic: 10 },
    ],
  },
]
