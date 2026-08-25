/**
 * SCHEMA LAYER — UI CONTRACT
 * ──────────────────────────
 * This file intentionally defines almost nothing. "Questions must not be
 * hardcoded into UI components" is enforced structurally, not by
 * convention: QuestionRendererMap requires exactly one generic renderer per
 * QuestionType, and that renderer may only ever receive (question, value,
 * onAnswer) — never a component built for one specific question's wording.
 *
 * No color, spacing, icon, or layout property belongs on Question — those
 * are the renderer's job, driven by questionType alone.
 */

import type { ComponentType } from 'react'
import type { Question, QuestionType } from './content'
import type { Response } from './scoring'

export interface QuestionRendererProps<Q extends Question = Question> {
  question: Q
  value: Response['value'] | undefined
  onAnswer: (value: Response['value']) => void
}

/** TypeScript rejects this map if a QuestionType is missing a renderer, or a renderer's props don't match its type. */
export type QuestionRendererMap = {
  [T in QuestionType]: ComponentType<QuestionRendererProps<Extract<Question, { questionType: T }>>>
}
