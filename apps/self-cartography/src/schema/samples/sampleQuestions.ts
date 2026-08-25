/**
 * One Question per QuestionType — demonstrating every format the schema
 * supports. This is NOT the assessment; see the file-level note in
 * registry.ts. Every field is realistic Self Cartography content, not
 * placeholder text, so the shapes read the way real content will.
 */

import type {
  BehavioralEvidenceQuestion,
  BinaryQuestion,
  ConfidenceQuestion,
  ForcedChoiceQuestion,
  FrequencyQuestion,
  LikertQuestion,
  MultiForcedChoiceQuestion,
  NumericQuestion,
  OpenResponseQuestion,
  Question,
  RankingQuestion,
  ScenarioQuestion,
} from '../content'

const AGREE_5 = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' },
]

const FREQ_5 = [
  { value: 1, label: 'Rarely' },
  { value: 2, label: 'Occasionally' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Often' },
  { value: 5, label: 'Almost always' },
]

export const sampleLikert: LikertQuestion = {
  id: 'sample-likert-01',
  version: '1.0.0',
  questionType: 'likert',
  section: 'values',
  construct: 'values',
  subscale: 'self_direction',
  prompt: 'It matters to me that I choose my own path, even if a more obvious one is available.',
  required: true,
  weight: 1,
  scoringKey: 'likert-linear',
  validityPurpose: 'primary-measurement',
  evidenceStrength: 'self-report',
  socialDesirabilityRisk: 'low',
  estimatedEffort: 'quick',
  options: AGREE_5,
}

export const sampleFrequency: FrequencyQuestion = {
  id: 'sample-frequency-01',
  version: '1.0.0',
  questionType: 'frequency',
  section: 'temperament',
  construct: 'openness',
  subscale: 'intellectual_curiosity',
  prompt: 'How often do you go down a research rabbit hole on something with no practical use to you?',
  description: 'Answer based on the last few months, not an ideal version of your week.',
  required: true,
  weight: 1,
  scoringKey: 'frequency-linear',
  validityPurpose: 'primary-measurement',
  evidenceStrength: 'self-report',
  socialDesirabilityRisk: 'low',
  estimatedEffort: 'quick',
  options: FREQ_5,
}

export const sampleForcedChoice: ForcedChoiceQuestion = {
  id: 'sample-forced-choice-01',
  version: '1.0.0',
  questionType: 'forced-choice',
  section: 'values',
  prompt: 'Which is closer to true?',
  required: true,
  scoringKey: 'forced-choice-binary',
  validityPurpose: 'social-desirability-probe',
  evidenceStrength: 'stated-preference',
  socialDesirabilityRisk: 'medium',
  estimatedEffort: 'quick',
  optionA: {
    id: 'A',
    label: 'I’d take a less impressive outcome I chose myself over a better one someone else designed for me.',
    construct: 'values',
    subscale: 'self_direction',
  },
  optionB: {
    id: 'B',
    label: 'I’d rather follow a method that’s proven to work than insist on doing it my own way.',
    construct: 'values',
    subscale: 'security',
  },
}

export const sampleMultiForcedChoice: MultiForcedChoiceQuestion = {
  id: 'sample-multi-forced-choice-01',
  version: '1.0.0',
  questionType: 'multi-forced-choice',
  section: 'temperament',
  prompt: 'Rank these three from most like you (1) to least like you (3).',
  required: true,
  scoringKey: 'multi-forced-choice-rank-linear',
  validityPurpose: 'social-desirability-probe',
  evidenceStrength: 'stated-preference',
  socialDesirabilityRisk: 'medium',
  estimatedEffort: 'moderate',
  statements: [
    { id: 'a', label: 'I’d rather have an open mandate and figure out the path myself.', construct: 'autonomy_need', subscale: 'autonomy_need' },
    { id: 'b', label: 'I’d rather take a real shot at a big outcome than lock in a safe one.', construct: 'risk_tolerance', subscale: 'risk_tolerance' },
    { id: 'c', label: 'I’d rather be the one everyone trusts to keep things steady.', construct: 'values', subscale: 'security' },
  ],
}

export const sampleRanking: RankingQuestion = {
  id: 'sample-ranking-01',
  version: '1.0.0',
  questionType: 'ranking',
  section: 'values',
  construct: 'values',
  subscale: 'self_direction',
  prompt: 'Rank these from most to least true of you.',
  required: true,
  scoringKey: 'ranking-weighted-position',
  validityPurpose: 'primary-measurement',
  evidenceStrength: 'stated-preference',
  socialDesirabilityRisk: 'low',
  estimatedEffort: 'moderate',
  options: [
    { id: 'a', label: 'I need room to figure things out my own way, not a prescribed method.', loading: 1.0 },
    { id: 'b', label: 'I’d rather ask for help than waste time reinventing something.', loading: 0.55 },
    { id: 'c', label: 'Being told exactly how to do something wears on me, even when I’m good at it.', loading: 0.9 },
  ],
}

export const sampleScenario: ScenarioQuestion = {
  id: 'sample-scenario-01',
  version: '1.0.0',
  questionType: 'scenario',
  section: 'temperament',
  construct: 'risk_tolerance',
  subscale: 'risk_tolerance',
  prompt: 'A situational decision',
  scenario:
    'You’re offered a role with a much higher ceiling but a real chance it doesn’t work out and you’re back to searching in a year. What do you actually tend to do in situations like this?',
  required: true,
  scoringKey: 'scenario-choice-points',
  validityPurpose: 'primary-measurement',
  evidenceStrength: 'stated-preference',
  socialDesirabilityRisk: 'low',
  estimatedEffort: 'moderate',
  choices: [
    { id: 'a', label: 'Take it — the ceiling is worth the risk.', points: 90 },
    { id: 'b', label: 'Negotiate for a middle path — some upside, less exposure.', points: 55 },
    { id: 'c', label: 'Pass, unless the downside is truly survivable.', points: 20 },
  ],
}

export const sampleBinary: BinaryQuestion = {
  id: 'sample-binary-01',
  version: '1.0.0',
  questionType: 'binary',
  section: 'temperament',
  construct: 'autonomy_need',
  subscale: 'autonomy_need',
  prompt: 'Have you ever left a role specifically because you had too little say over how you did your work?',
  required: true,
  scoringKey: 'binary-direct',
  validityPurpose: 'primary-measurement',
  evidenceStrength: 'behavioral',
  socialDesirabilityRisk: 'low',
  estimatedEffort: 'quick',
  trueLabel: 'Yes',
  falseLabel: 'No',
}

export const sampleNumeric: NumericQuestion = {
  id: 'sample-numeric-01',
  version: '1.0.0',
  questionType: 'numeric',
  section: 'temperament',
  construct: 'risk_tolerance',
  subscale: 'risk_tolerance',
  prompt: 'Of your last 10 major decisions, roughly how many involved a real chance of a bad outcome?',
  required: true,
  scoringKey: 'numeric-range-normalized',
  validityPurpose: 'primary-measurement',
  evidenceStrength: 'behavioral',
  socialDesirabilityRisk: 'low',
  estimatedEffort: 'moderate',
  range: { min: 0, max: 10, step: 1, unit: 'decisions' },
}

export const sampleConfidence: ConfidenceQuestion = {
  id: 'sample-confidence-01',
  version: '1.0.0',
  questionType: 'confidence',
  section: 'values',
  prompt: 'How confident are you that the last section describes who you actually are, rather than who you’d like to be?',
  required: true,
  validityPurpose: 'self-calibration',
  evidenceStrength: 'self-report',
  socialDesirabilityRisk: 'low',
  estimatedEffort: 'quick',
  target: { construct: 'values' },
  options: [
    { value: 1, label: 'Not very confident' },
    { value: 2, label: 'Somewhat unsure' },
    { value: 3, label: 'Fairly confident' },
    { value: 4, label: 'Confident' },
    { value: 5, label: 'Very confident' },
  ],
}

export const sampleBehavioralEvidence: BehavioralEvidenceQuestion = {
  id: 'sample-behavioral-evidence-01',
  version: '1.0.0',
  questionType: 'behavioral-evidence',
  section: 'temperament',
  construct: 'openness',
  subscale: 'intellectual_curiosity',
  prompt: 'In the past month, how many times did you actually spend an hour or more going deep on something with no practical use?',
  description: 'Count real instances, not the number of times you meant to.',
  required: true,
  scoringKey: 'behavioral-evidence-linear',
  validityPurpose: 'consistency-check',
  evidenceStrength: 'behavioral',
  socialDesirabilityRisk: 'low',
  estimatedEffort: 'moderate',
  contrastsWith: 'sample-frequency-01',
  options: FREQ_5,
}

export const sampleOpenResponse: OpenResponseQuestion = {
  id: 'sample-open-response-01',
  version: '1.0.0',
  questionType: 'open-response',
  section: 'values',
  prompt: 'What brought you here today — what are you hoping to understand better?',
  required: false,
  validityPurpose: 'primary-measurement',
  evidenceStrength: 'self-report',
  socialDesirabilityRisk: 'low',
  estimatedEffort: 'reflective',
  contributesEvidence: true,
  responseFormat: { maxLength: 600, placeholder: 'Optional — write as much or as little as you like.' },
}

export const SAMPLE_QUESTIONS: Question[] = [
  sampleLikert,
  sampleFrequency,
  sampleForcedChoice,
  sampleMultiForcedChoice,
  sampleRanking,
  sampleScenario,
  sampleBinary,
  sampleNumeric,
  sampleConfidence,
  sampleBehavioralEvidence,
  sampleOpenResponse,
]
