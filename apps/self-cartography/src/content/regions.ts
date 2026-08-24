import type { Region } from '../engine/types'

/**
 * The 14 conceptual regions of the journey. `implemented: false` regions are
 * shown on the map (so the full shape of the project is visible) but are
 * marked "not yet charted" rather than opened — see README for what's deferred
 * to a later pass.
 */
export const REGIONS: Region[] = [
  {
    id: 'orientation',
    order: 0,
    label: 'Orientation',
    description: 'What this is, how it works, and what it will never claim to know.',
    marginalia: '0°00′ — true north',
    implemented: true,
  },
  {
    id: 'desire',
    order: 1,
    label: 'Desire',
    description: 'What you actually want, versus what you have learned to want.',
    marginalia: '9°15′ — surveyed',
    implemented: true,
  },
  {
    id: 'values',
    order: 2,
    label: 'Values',
    description: 'What matters to you when two good things are in tension.',
    marginalia: '18°40′ — surveyed',
    implemented: true,
  },
  {
    id: 'interests',
    order: 3,
    label: 'Interests',
    description: 'The activities and subjects that hold your attention unprompted.',
    marginalia: '27°50′ — surveyed',
    implemented: true,
  },
  {
    id: 'temperament',
    order: 4,
    label: 'Temperament',
    description: 'Your steady patterns of thought, feeling, and behavior.',
    marginalia: '41°12′ — partially surveyed',
    implemented: true,
  },
  {
    id: 'strengths',
    order: 5,
    label: 'Strengths',
    description: 'What you do well, by your own account and by evidence.',
    marginalia: '54°05′ — surveyed',
    implemented: true,
  },
  {
    id: 'work',
    order: 6,
    label: 'Work',
    description: 'The conditions that let you do your best work — and the ones that don’t.',
    marginalia: '63°20′ — surveyed',
    implemented: true,
  },
  {
    id: 'careerAnchors',
    order: 7,
    label: 'Career Anchors',
    description: 'The durable priorities you would refuse to trade away, even for a better offer.',
    marginalia: '70°45′ — surveyed',
    implemented: true,
  },
  {
    id: 'riskUncertainty',
    order: 8,
    label: 'Risk & Uncertainty',
    description: 'What kind of risk you actually tolerate — it is rarely the same answer in every part of life.',
    marginalia: '78°10′ — surveyed',
    implemented: true,
  },
  {
    id: 'relationships',
    order: 9,
    label: 'Relationships',
    description: 'How you tend to operate with, near, and around other people.',
    marginalia: 'uncharted',
    implemented: false,
  },
  {
    id: 'constraints',
    order: 10,
    label: 'Constraints',
    description: 'The real-world boundaries any recommendation has to respect.',
    marginalia: 'uncharted',
    implemented: false,
  },
  {
    id: 'future',
    order: 11,
    label: 'Future',
    description: 'The life a career would need to support, five and ten years out — not a job title.',
    marginalia: '85°30′ — surveyed',
    implemented: true,
  },
  {
    id: 'aspiration',
    order: 12,
    label: 'Aspiration',
    description: 'A handful of questions, asked twice — who you are now, and who you’d like to be.',
    marginalia: '89°55′ — surveyed',
    implemented: true,
  },
  {
    id: 'synthesis',
    order: 13,
    label: 'Synthesis',
    description: 'Everything triangulated into one map — with its blind spots marked.',
    marginalia: 'destination',
    implemented: true,
  },
]

export const REGION_BY_ID: Record<string, Region> = Object.fromEntries(
  REGIONS.map((r) => [r.id, r]),
)
