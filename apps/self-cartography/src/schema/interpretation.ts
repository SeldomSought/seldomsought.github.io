/**
 * SCHEMA LAYER — INTERPRETATION
 * ─────────────────────────────
 * Turning a computed Score into human meaning: a band of the internal
 * composite scale (never a population percentile — see the guardrail in
 * scoring.ts's Score.rawScore), and a career-fit reading against
 * CareerFactor. Full instrument-level content (which bands, which careers)
 * is intentionally not populated here — this is the contract, not the data.
 */

import type { CareerFactor } from './content'
import type { Score } from './scoring'

export interface InterpretationBand {
  id: string
  /** A Construct or Subscale id this band applies to. */
  appliesTo: string
  min: number // 0–100, inclusive
  max: number // 0–100, inclusive
  label: string
  narrative: string
  /** Optional hook consumed by the Synthesis "Development" section. */
  developmentAngle?: string
}

export function findBand(bands: InterpretationBand[], targetId: string, score: number): InterpretationBand | null {
  return bands.find((b) => b.appliesTo === targetId && score >= b.min && score <= b.max) ?? null
}

export function interpretScore(score: Score, bands: InterpretationBand[]): InterpretationBand | null {
  return findBand(bands, score.targetId, score.rawScore)
}

export interface CareerFitDimension {
  factor: CareerFactor
  userScore: number
  desiredLevel: number
  alignment: number // 0–100
}

export interface CareerFitProfile {
  careerId: string
  fitScore: number
  dimensions: CareerFitDimension[]
}

/** Distance-based alignment between a measured score and a career's desired level for that factor. */
export function scoreCareerFactor(factor: CareerFactor, userScore: number, desiredLevel: number): CareerFitDimension {
  return {
    factor,
    userScore,
    desiredLevel,
    alignment: Math.max(0, 100 - Math.abs(userScore - desiredLevel)),
  }
}

export function summarizeFit(careerId: string, dimensions: CareerFitDimension[]): CareerFitProfile {
  const fitScore = dimensions.length
    ? Math.round(dimensions.reduce((sum, d) => sum + d.alignment, 0) / dimensions.length)
    : 0
  return { careerId, fitScore, dimensions }
}
