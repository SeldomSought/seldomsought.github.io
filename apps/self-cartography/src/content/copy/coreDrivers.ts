import type { RuleCondition } from '../../engine/scoring/synthesis'

/**
 * CORE DRIVERS — pure content. Ten named motivational forces, each defined
 * by a small, theoretically-motivated combination of independently scored
 * facets (the same convergence philosophy as synthesis.ts's convergence
 * rules and unconventionalPaths.ts's career structures — reused here
 * rather than reinvented). A driver only ever surfaces when a real
 * majority of its own conditions independently clear their threshold; the
 * description, "when healthy," and "when excessive" copy are all written
 * once per driver, never per respondent, and only ever shown once the
 * evidence actually earns it. See engine/scoring/coreDrivers.ts for how
 * that gating and the accompanying evidence (importance, confidence,
 * behavioral count, supporting facets) get computed.
 */

export interface CoreDriverDefinition {
  id: string
  label: string
  /** "You consistently ..." — a plain description of what high scores on
   *  this driver's conditions actually look like, grounded in the specific
   *  facets below, never a personality-quiz generality. */
  description: string
  /** 2-4 short words/phrases — what this driver looks like well-regulated. */
  whenHealthy: string[]
  /** One short phrase — the specific, plausible cost of over-indexing on this driver. */
  whenExcessive: string
  conditions: RuleCondition[]
  minimumMet: number
}

export const CORE_DRIVER_DEFINITIONS: CoreDriverDefinition[] = [
  {
    id: 'autonomy',
    label: 'Autonomy',
    description: 'You consistently prefer control over method, schedule, and execution.',
    whenHealthy: ['ownership', 'initiative', 'independence'],
    whenExcessive: 'resistance to useful structure',
    conditions: [
      { facetId: 'autonomy_need', direction: 'high', threshold: 65 },
      { facetId: 'self_direction', direction: 'high', threshold: 65 },
      { facetId: 'work_creative_freedom', direction: 'high', threshold: 60 },
      { facetId: 'desire_belonging_independence', direction: 'low', threshold: 60 },
    ],
    minimumMet: 3,
  },
  {
    id: 'mastery',
    label: 'Mastery',
    description: 'You consistently choose depth on one hard thing over staying in what already comes easily.',
    whenHealthy: ['deep expertise', 'craftsmanship', 'patience with difficulty'],
    whenExcessive: 'perfectionism, or reluctance to ship and delegate',
    conditions: [
      { facetId: 'anchor_technical_mastery', direction: 'high', threshold: 65 },
      { facetId: 'desire_mastery_ease', direction: 'high', threshold: 60 },
      { facetId: 'intellectual_curiosity', direction: 'high', threshold: 60 },
      { facetId: 'industriousness', direction: 'high', threshold: 55 },
    ],
    minimumMet: 3,
  },
  {
    id: 'influence',
    label: 'Influence',
    description: 'You consistently want to be the person a decision actually hinges on.',
    whenHealthy: ['persuasion', 'leadership', 'decisive action'],
    whenExcessive: 'steamrolling other people’s input',
    conditions: [
      { facetId: 'desire_influence_anonymity', direction: 'high', threshold: 60 },
      { facetId: 'power', direction: 'high', threshold: 60 },
      { facetId: 'anchor_general_management', direction: 'high', threshold: 60 },
      { facetId: 'assertiveness', direction: 'high', threshold: 55 },
    ],
    minimumMet: 3,
  },
  {
    id: 'security',
    label: 'Security',
    description: 'You consistently favor a known, stable downside over an open-ended bet.',
    whenHealthy: ['stability', 'reliability', 'prudent planning'],
    whenExcessive: 'passing on worthwhile risk out of caution',
    conditions: [
      { facetId: 'security', direction: 'high', threshold: 60 },
      { facetId: 'anchor_security', direction: 'high', threshold: 60 },
      { facetId: 'risk_financial', direction: 'low', threshold: 60 },
      { facetId: 'desire_freedom_certainty', direction: 'low', threshold: 60 },
    ],
    minimumMet: 3,
  },
  {
    id: 'novelty',
    label: 'Novelty',
    description: 'You consistently gravitate toward what’s changing over what’s already settled.',
    whenHealthy: ['adaptability', 'fresh thinking', 'quick to explore'],
    whenExcessive: 'losing interest before finishing what’s started',
    conditions: [
      { facetId: 'stimulation', direction: 'high', threshold: 60 },
      { facetId: 'novelty_seeking', direction: 'high', threshold: 60 },
      { facetId: 'work_task_variety', direction: 'high', threshold: 60 },
      { facetId: 'desire_novelty_stability', direction: 'high', threshold: 60 },
    ],
    minimumMet: 3,
  },
  {
    id: 'belonging',
    label: 'Belonging',
    description: 'You consistently value being embedded in a group you answer to over operating alone.',
    whenHealthy: ['loyalty', 'collaboration', 'real investment in a group'],
    whenExcessive: 'difficulty acting against the group’s consensus',
    conditions: [
      { facetId: 'benevolence', direction: 'high', threshold: 60 },
      { facetId: 'sociability', direction: 'high', threshold: 60 },
      { facetId: 'desire_belonging_independence', direction: 'high', threshold: 60 },
      { facetId: 'riasec_social', direction: 'high', threshold: 55 },
    ],
    minimumMet: 3,
  },
  {
    id: 'creation',
    label: 'Creation',
    description: 'You consistently prefer making something new over refining or consuming what already exists.',
    whenHealthy: ['original output', 'initiative', 'a real body of work'],
    whenExcessive: 'difficulty finishing or shipping something merely “good enough”',
    conditions: [
      { facetId: 'riasec_artistic', direction: 'high', threshold: 60 },
      { facetId: 'work_creative_freedom', direction: 'high', threshold: 60 },
      { facetId: 'strength_creative_ability', direction: 'high', threshold: 55 },
      { facetId: 'desire_creation_consumption', direction: 'high', threshold: 60 },
    ],
    minimumMet: 3,
  },
  {
    id: 'status',
    label: 'Status',
    description: 'You consistently want to be known for what you do, not just to have done it.',
    whenHealthy: ['ambition', 'visible ownership', 'raising the bar publicly'],
    whenExcessive: 'decisions driven by appearance over substance',
    conditions: [
      { facetId: 'desire_status_privacy', direction: 'high', threshold: 60 },
      { facetId: 'future_prestige', direction: 'high', threshold: 60 },
      { facetId: 'power', direction: 'high', threshold: 55 },
      { facetId: 'risk_reputational', direction: 'high', threshold: 55 },
    ],
    minimumMet: 3,
  },
  {
    id: 'impact',
    label: 'Impact',
    description: 'You consistently choose work that might change something over work that’s just steady and manageable.',
    whenHealthy: ['mission-driven effort', 'follow-through on causes'],
    whenExcessive: 'burnout from treating every tradeoff as a moral one',
    conditions: [
      { facetId: 'universalism', direction: 'high', threshold: 60 },
      { facetId: 'anchor_service_mission', direction: 'high', threshold: 60 },
      { facetId: 'desire_impact_comfort', direction: 'high', threshold: 60 },
      { facetId: 'work_mission_orientation', direction: 'high', threshold: 55 },
    ],
    minimumMet: 3,
  },
  {
    id: 'competition',
    label: 'Competition',
    description: 'You consistently do better work when there’s a clear winner than when no one’s keeping score.',
    whenHealthy: ['drive', 'benchmarking', 'performing well under comparison'],
    whenExcessive: 'turning collaborative situations into contests',
    conditions: [
      { facetId: 'work_competition', direction: 'high', threshold: 60 },
      { facetId: 'desire_competition_harmony', direction: 'high', threshold: 60 },
      { facetId: 'risk_career', direction: 'high', threshold: 55 },
      { facetId: 'assertiveness', direction: 'high', threshold: 55 },
    ],
    minimumMet: 3,
  },
]
