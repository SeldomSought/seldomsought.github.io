/**
 * SCHEMA LAYER — CONTENT
 * ──────────────────────
 * What gets asked, and how it's organized: Assessment → Section → Construct
 * → Subscale → Question. No scoring formulas (scoring.ts), no interpretive
 * language (interpretation.ts), no rendering concerns (ui.ts) live here.
 *
 * A Construct is always scored through its Subscales — even a single-facet
 * construct (Autonomy Need) gets exactly one Subscale, so scoring has one
 * code path regardless of how many facets a construct has.
 *
 * The request's "options" field is realized as format-specific typed shapes
 * (ScalePoint[], ForcedChoiceOption, range, target, ...) rather than one
 * loosely-typed catchall — every question format gets real compile-time
 * safety instead of `options: unknown[]`.
 */

// ── identity & versioning ──

export type SemVer = `${number}.${number}.${number}`

export interface Assessment {
  id: string
  version: SemVer
  title: string
  description: string
  sections: Section[]
  constructs: Construct[]
  subscales: Subscale[]
  questions: Question[]
  careerFactors: CareerFactor[]
}

export interface Section {
  id: string
  order: number
  label: string
  description: string
  /** Construct ids organized under this section, in presentation order. */
  constructIds: string[]
}

/** A named theoretical dimension — a value, a personality domain, a need. */
export interface Construct {
  id: string
  label: string
  description: string
  sectionId: string
  /** Where this construct's theoretical grounding comes from — informational, not a validity claim. */
  framework: string
  subscaleIds: string[]
}

export interface Subscale {
  id: string
  constructId: string
  label: string
  description: string
}

// ── branching ──

export interface BranchingCondition {
  dependsOnQuestionId: string
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'includes'
  value: string | number | boolean
}

// ── shared vocabulary ──

export type ValidityPurpose =
  | 'primary-measurement'
  | 'reverse-check'
  | 'consistency-check'
  | 'social-desirability-probe'
  | 'careless-response-check'
  | 'self-calibration'

export type EvidenceStrength = 'self-report' | 'behavioral' | 'inferred' | 'stated-preference'

export type SocialDesirabilityRisk = 'low' | 'medium' | 'high'

export type EstimatedEffort = 'quick' | 'moderate' | 'reflective'

/** Which scoring.ts ScoringRule converts this question's response into subscale points. */
export type ScoringRuleKey =
  | 'likert-linear'
  | 'likert-linear-reverse'
  | 'frequency-linear'
  | 'forced-choice-binary'
  | 'multi-forced-choice-rank-linear'
  | 'ranking-weighted-position'
  | 'scenario-choice-points'
  | 'binary-direct'
  | 'numeric-range-normalized'
  | 'behavioral-evidence-linear'

// ── question types ──

export type QuestionType =
  | 'likert'
  | 'frequency'
  | 'forced-choice'
  | 'multi-forced-choice'
  | 'ranking'
  | 'scenario'
  | 'binary'
  | 'numeric'
  | 'confidence'
  | 'behavioral-evidence'
  | 'open-response'

export interface ScalePoint {
  value: number
  label: string
}

interface QuestionBase {
  id: string
  version: SemVer
  section: string
  /** Omitted only where a question doesn't target one construct — forced-choice pairs and open reflections. */
  construct?: string
  subscale?: string
  prompt: string
  description?: string
  required: boolean
  reverseScored?: boolean
  weight?: number
  scoringKey?: ScoringRuleKey
  branchingCondition?: BranchingCondition
  validityPurpose?: ValidityPurpose
  evidenceStrength?: EvidenceStrength
  socialDesirabilityRisk?: SocialDesirabilityRisk
  estimatedEffort?: EstimatedEffort
}

export interface LikertQuestion extends QuestionBase {
  questionType: 'likert'
  construct: string
  subscale: string
  options: ScalePoint[]
}

export interface FrequencyQuestion extends QuestionBase {
  questionType: 'frequency'
  construct: string
  subscale: string
  options: ScalePoint[]
}

export interface ForcedChoiceOption {
  id: string
  label: string
  construct: string
  subscale: string
}

/** A two-way tradeoff between statements that may belong to two different constructs. */
export interface ForcedChoiceQuestion extends QuestionBase {
  questionType: 'forced-choice'
  optionA: ForcedChoiceOption
  optionB: ForcedChoiceOption
}

/** A Thurstonian block — 3+ statements ranked most→least, each scored toward its own subscale. */
export interface MultiForcedChoiceQuestion extends QuestionBase {
  questionType: 'multi-forced-choice'
  statements: ForcedChoiceOption[]
}

export interface RankingOption {
  id: string
  label: string
  /** 0–1 — how strongly this specific statement loads on the subscale. */
  loading: number
}

/** Ranking a set of statements that all load on one subscale, at different strengths. */
export interface RankingQuestion extends QuestionBase {
  questionType: 'ranking'
  construct: string
  subscale: string
  options: RankingOption[]
}

export interface ScenarioChoice {
  id: string
  label: string
  points: number // 0–100
}

export interface ScenarioQuestion extends QuestionBase {
  questionType: 'scenario'
  construct: string
  subscale: string
  scenario: string
  choices: ScenarioChoice[]
}

export interface BinaryQuestion extends QuestionBase {
  questionType: 'binary'
  construct: string
  subscale: string
  trueLabel: string
  falseLabel: string
}

export interface NumericQuestion extends QuestionBase {
  questionType: 'numeric'
  construct: string
  subscale: string
  range: { min: number; max: number; step?: number; unit?: string }
}

/** Doesn't score a construct directly — feeds validity.ts as a self-calibration signal. */
export interface ConfidenceQuestion extends QuestionBase {
  questionType: 'confidence'
  options: ScalePoint[]
  target: { section?: string; construct?: string; questionIds?: string[] }
}

export interface BehavioralEvidenceQuestion extends QuestionBase {
  questionType: 'behavioral-evidence'
  construct: string
  subscale: string
  options: ScalePoint[]
  /** Id of a self-report question this can be checked against for a self/behavior gap. */
  contrastsWith?: string
}

/** Never scored — held as Evidence (if contributesEvidence) and shown back verbatim. */
export interface OpenResponseQuestion extends QuestionBase {
  questionType: 'open-response'
  responseFormat?: { minLength?: number; maxLength?: number; placeholder?: string }
  contributesEvidence: boolean
}

export type Question =
  | LikertQuestion
  | FrequencyQuestion
  | ForcedChoiceQuestion
  | MultiForcedChoiceQuestion
  | RankingQuestion
  | ScenarioQuestion
  | BinaryQuestion
  | NumericQuestion
  | ConfidenceQuestion
  | BehavioralEvidenceQuestion
  | OpenResponseQuestion

// ── career factors ──

/** A career-facing relabeling of a measured dimension — explicit, typed link instead of a bare string match. */
export interface CareerFactor {
  id: string
  label: string
  description: string
  sourceConstruct: string
  sourceSubscale?: string
}
