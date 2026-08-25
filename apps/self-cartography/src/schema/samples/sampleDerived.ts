/**
 * Worked examples of the "downstream" objects — Response, Evidence, Score,
 * ValidityCheck, InterpretationBand, and a CareerFitProfile — showing the
 * schema's data actually flows end to end, not just that the Question
 * shapes type-check.
 */

import type { Evidence, Response, Score, ValidityCheck, ValidityCheckContext, ValidityResult } from '../scoring'
import { interpretScore, scoreCareerFactor, summarizeFit } from '../interpretation'
import { SAMPLE_CAREER_FACTORS, SAMPLE_INTERPRETATION_BANDS } from './registry'

export const sampleResponse: Response = {
  questionId: 'sample-likert-01',
  questionVersion: '1.0.0',
  value: 4,
  firstAnsweredAt: 1_734_000_000_000,
  lastAnsweredAt: 1_734_000_000_000,
  responseTimeMs: 3_200,
  revisitCount: 0,
}

export const sampleBehavioralEvidenceEntry: Evidence = {
  id: 'evidence-01',
  subscaleId: 'intellectual_curiosity',
  strength: 'behavioral',
  sourceQuestionId: 'sample-behavioral-evidence-01',
  sourceResponseValue: 2, // "occasionally" — much less than the self-report below
  collectedAt: 1_734_000_120_000,
}

export const sampleSelfReportEvidenceEntry: Evidence = {
  id: 'evidence-02',
  subscaleId: 'intellectual_curiosity',
  strength: 'self-report',
  sourceQuestionId: 'sample-frequency-01',
  sourceResponseValue: 5, // "almost always" — self-image outpaces the behavioral count
  collectedAt: 1_734_000_060_000,
}

export const sampleWrittenEvidenceEntry: Evidence = {
  id: 'evidence-03',
  subscaleId: 'self_direction',
  strength: 'self-report',
  sourceQuestionId: 'sample-open-response-01',
  sourceResponseValue: 'I want to understand why I keep choosing the harder, self-directed option even when it costs me.',
  quote: 'I want to understand why I keep choosing the harder, self-directed option even when it costs me.',
  collectedAt: 1_734_000_030_000,
}

export const sampleScore: Score = {
  level: 'subscale',
  targetId: 'self_direction',
  label: 'Self-Direction',
  rawScore: 82,
  confidence: 'High',
  itemsAnswered: 4,
  itemsExpected: 4,
  computedAt: 1_734_000_400_000,
  evidenceIds: ['evidence-03'],
}

export const sampleInterpretedBand = interpretScore(sampleScore, SAMPLE_INTERPRETATION_BANDS)
// → the "Higher" self-direction band, since sampleScore.rawScore (82) falls in its 50–100 range

/**
 * Generalizes what the shipped app hardcodes as one pairwise check into a
 * reusable pattern: any two Evidence entries on the same subscale with
 * different strengths, far enough apart, is a self/behavior gap — this one
 * check definition covers every subscale that ever gets both kinds of
 * evidence, not just diligence.
 */
export const selfReportVsBehaviorGapCheck: ValidityCheck = {
  id: 'self-report-vs-behavior-gap',
  label: 'Self-report vs. behavior gap',
  scope: 'subscale',
  description: 'Flags a subscale where self-reported and behavioral evidence diverge by more than 40 points.',
  evaluate: (context: ValidityCheckContext): ValidityResult | null => {
    const bySubscale = new Map<string, Evidence[]>()
    for (const e of context.evidence) {
      const list = bySubscale.get(e.subscaleId) ?? []
      list.push(e)
      bySubscale.set(e.subscaleId, list)
    }

    for (const [subscaleId, entries] of bySubscale) {
      const behavioral = entries.find((e) => e.strength === 'behavioral' && typeof e.sourceResponseValue === 'number')
      const selfReport = entries.find((e) => e.strength === 'self-report' && typeof e.sourceResponseValue === 'number')
      if (!behavioral || !selfReport) continue

      const gap = Math.abs((selfReport.sourceResponseValue as number) - (behavioral.sourceResponseValue as number))
      const normalizedGap = (gap / 4) * 100 // both sampled on a 1–5 scale here
      if (normalizedGap > 40) {
        return {
          checkId: 'self-report-vs-behavior-gap',
          severity: 'flag',
          detail: `How you described yourself and what your recent behavior shows point in different directions for ${subscaleId}.`,
          affectedTargetIds: [subscaleId],
        }
      }
    }
    return null
  },
}

export const sampleValidityResult = selfReportVsBehaviorGapCheck.evaluate({
  responses: [],
  evidence: [sampleBehavioralEvidenceEntry, sampleSelfReportEvidenceEntry],
  scores: [],
})

export const sampleCareerFitProfile = summarizeFit(
  'startup-founder',
  SAMPLE_CAREER_FACTORS.map((factor) =>
    scoreCareerFactor(factor, factor.id === 'autonomy' ? 88 : 74, factor.id === 'autonomy' ? 90 : 90),
  ),
)
