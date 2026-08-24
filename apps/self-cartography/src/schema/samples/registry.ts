/**
 * A deliberately small registry — just enough Sections/Constructs/Subscales
 * to make the sample questions in sampleQuestions.ts valid and meaningful.
 * This is NOT the assessment content; see apps/self-cartography/src/content/
 * for what's actually shipped, and schema/README.md for how the two relate.
 */

import type { Assessment, CareerFactor, Construct, Section, Subscale } from '../content'
import type { InterpretationBand } from '../interpretation'
import { SAMPLE_QUESTIONS } from './sampleQuestions'

export const SAMPLE_SECTIONS: Section[] = [
  {
    id: 'values',
    order: 0,
    label: 'Values',
    description: 'What matters to you when two good things are in tension.',
    constructIds: ['values'],
  },
  {
    id: 'temperament',
    order: 1,
    label: 'Temperament',
    description: 'Your steady patterns of thought, feeling, and behavior.',
    constructIds: ['openness', 'conscientiousness', 'autonomy_need', 'risk_tolerance'],
  },
]

export const SAMPLE_CONSTRUCTS: Construct[] = [
  {
    id: 'values',
    label: 'Values',
    description: 'A Schwartz-inspired subset of basic human values.',
    sectionId: 'values',
    framework: 'Schwartz Basic Human Values (subset)',
    subscaleIds: ['self_direction', 'security'],
  },
  {
    id: 'openness',
    label: 'Openness',
    description: 'Appetite for ideas, novelty, and abstraction.',
    sectionId: 'temperament',
    framework: 'Big-Five-lite',
    subscaleIds: ['intellectual_curiosity'],
  },
  {
    id: 'conscientiousness',
    label: 'Conscientiousness',
    description: 'Discipline and follow-through.',
    sectionId: 'temperament',
    framework: 'Big-Five-lite',
    subscaleIds: ['diligence'],
  },
  {
    id: 'autonomy_need',
    label: 'Autonomy Need',
    description: 'How much self-direction is required to function well.',
    sectionId: 'temperament',
    framework: 'Self-Determination Theory (informed)',
    subscaleIds: ['autonomy_need'],
  },
  {
    id: 'risk_tolerance',
    label: 'Risk Tolerance',
    description: 'Willingness to accept a chance of a bad outcome for a shot at a better one.',
    sectionId: 'temperament',
    framework: 'Risk/ambiguity tolerance literature (informed)',
    subscaleIds: ['risk_tolerance'],
  },
]

export const SAMPLE_SUBSCALES: Subscale[] = [
  { id: 'self_direction', constructId: 'values', label: 'Self-Direction', description: 'Independent thought and choice of one’s own path.' },
  { id: 'security', constructId: 'values', label: 'Security', description: 'Safety, stability, and predictability.' },
  { id: 'intellectual_curiosity', constructId: 'openness', label: 'Intellectual Curiosity', description: 'Appetite for ideas for their own sake.' },
  { id: 'diligence', constructId: 'conscientiousness', label: 'Diligence', description: 'Follow-through on commitments.' },
  { id: 'autonomy_need', constructId: 'autonomy_need', label: 'Autonomy Need', description: 'Single-facet construct — the subscale mirrors the construct.' },
  { id: 'risk_tolerance', constructId: 'risk_tolerance', label: 'Risk Tolerance', description: 'Single-facet construct — the subscale mirrors the construct.' },
]

export const SAMPLE_CAREER_FACTORS: CareerFactor[] = [
  {
    id: 'autonomy',
    label: 'Autonomy',
    description: 'How much independence a role grants over how the work gets done.',
    sourceConstruct: 'autonomy_need',
    sourceSubscale: 'autonomy_need',
  },
  {
    id: 'risk',
    label: 'Risk',
    description: 'How much real variance in outcome a role carries.',
    sourceConstruct: 'risk_tolerance',
    sourceSubscale: 'risk_tolerance',
  },
]

/**
 * Interpretation and validity registries are deliberately NOT nested inside
 * Assessment below — they belong to the scoring/interpretation layer, not
 * content, per the requested separation. They're looked up alongside an
 * Assessment, not owned by it.
 */
export const SAMPLE_INTERPRETATION_BANDS: InterpretationBand[] = [
  {
    id: 'self-direction-low',
    appliesTo: 'self_direction',
    min: 0,
    max: 49,
    label: 'Lower',
    narrative: 'You tend to be comfortable working within a path someone else has already laid out.',
    developmentAngle: 'Notice one decision this week where you could set the method, not just the goal.',
  },
  {
    id: 'self-direction-high',
    appliesTo: 'self_direction',
    min: 50,
    max: 100,
    label: 'Higher',
    narrative: 'You tend to need real say over how you get to an outcome, not just what the outcome is.',
    developmentAngle: 'Name the one recurring situation where you don’t currently get that say.',
  },
]

export const SAMPLE_ASSESSMENT: Assessment = {
  id: 'self-cartography-demo',
  version: '0.1.0',
  title: 'The Self Cartography Project — schema demo',
  description: 'A minimal, valid Assessment instance assembled from the sample registry — not the real content.',
  sections: SAMPLE_SECTIONS,
  constructs: SAMPLE_CONSTRUCTS,
  subscales: SAMPLE_SUBSCALES,
  questions: SAMPLE_QUESTIONS,
  careerFactors: SAMPLE_CAREER_FACTORS,
}
