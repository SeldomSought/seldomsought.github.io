/**
 * SCHEMA LAYER — SCORING RULES
 * ────────────────────────────
 * How a captured answer becomes points, and how points become a Score.
 * Nothing here knows what a score *means* (interpretation.ts) or how it's
 * drawn (ui.ts) — only how to get from a Response to a number, honestly.
 */

import type { EvidenceStrength, Question, ScoringRuleKey, SemVer } from './content'

// ── responses ──

export type ResponseValue = number | boolean | string | string[]

export interface Response {
  questionId: string
  /** Which version of the question was answered — required for longitudinal retesting integrity. */
  questionVersion: SemVer
  value: ResponseValue
  firstAnsweredAt: number
  lastAnsweredAt: number
  responseTimeMs: number
  revisitCount: number
}

// ── scoring rules ──

export interface ScoreContribution {
  subscaleId: string
  points: number // 0–100
  weight: number
}

/** One named, testable rule — referenced by Question.scoringKey, never inlined into content. */
export interface ScoringRule {
  key: ScoringRuleKey
  description: string
  computeContribution: (question: Question, response: Response) => ScoreContribution[]
}

// ── scores ──

export type ConfidenceLevel = 'High' | 'Medium' | 'Low'

export interface Score {
  level: 'subscale' | 'construct'
  targetId: string // a Subscale id, or a Construct id
  label: string
  rawScore: number // 0–100 internal composite — never a claimed population percentile
  confidence: ConfidenceLevel
  itemsAnswered: number
  itemsExpected: number
  computedAt: number
  evidenceIds: string[]
}

// ── evidence ──

/**
 * A single collected data point tied to a subscale — a self-report answer,
 * a behavioral-frequency answer, or a respondent's own written reflection.
 * Generalizes what used to be an ad hoc "contrastsWith" string match into a
 * first-class record that ValidityCheck can compare across.
 */
export interface Evidence {
  id: string
  subscaleId: string
  strength: EvidenceStrength
  sourceQuestionId: string
  sourceResponseValue: ResponseValue
  /** Present only for open-response evidence — shown back to the respondent verbatim, never paraphrased. */
  quote?: string
  collectedAt: number
}

// ── validity ──

export type ValidityScope = 'assessment' | 'section' | 'construct' | 'subscale'

export interface ValidityCheckContext {
  responses: Response[]
  evidence: Evidence[]
  scores: Score[]
}

export interface ValidityResult {
  checkId: string
  severity: 'note' | 'flag'
  detail: string
  /** Subscale/construct ids whose confidence should be dampened because of this finding. */
  affectedTargetIds: string[]
}

/** The definition of a check — a pure function over everything collected so far. */
export interface ValidityCheck {
  id: string
  label: string
  scope: ValidityScope
  description: string
  evaluate: (context: ValidityCheckContext) => ValidityResult | null
}
