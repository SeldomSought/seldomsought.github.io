import type { FacetScore, Response, ScenarioResponseValue } from '../types'
import { ALL_ITEMS } from '../../content/instruments'
import { likertToPoints } from './contributions'
import { computeValidityFlags } from '../validity'
import { overallProgress } from '../navigation'

/**
 * Internal response-quality model. Deliberately framed around measurement
 * reliability, never around the respondent's honesty — nothing here is a
 * lie detector, and no copy should ever imply one. A "flag" means "treat
 * this part of the profile as a hypothesis," not "this answer is false."
 */
export type QualityCategory =
  | 'missingResponses'
  | 'rapidResponses'
  | 'longStringResponding'
  | 'reverseItemContradictions'
  | 'nearDuplicateInconsistency'
  | 'improbablePatterns'
  | 'behavioralEvidenceDisagreement'
  | 'confidencePatterns'

export const QUALITY_CATEGORY_LABEL: Record<QualityCategory, string> = {
  missingResponses: 'Missing responses',
  rapidResponses: 'Response speed',
  longStringResponding: 'Long-string responding',
  reverseItemContradictions: 'Reverse-item contradictions',
  nearDuplicateInconsistency: 'Near-duplicate inconsistency',
  improbablePatterns: 'Improbable response patterns',
  behavioralEvidenceDisagreement: 'Behavioral evidence disagreement',
  confidencePatterns: 'Confidence patterns',
}

export interface QualitySignal {
  id: string
  category: QualityCategory
  severity: 'note' | 'flag'
  label: string
  detail: string
  relatedFacetIds?: string[]
}

export type ProfileConfidence = 'High' | 'Moderate' | 'Limited'

export interface ResponseQualityModel {
  profileConfidence: ProfileConfidence
  summary: string
  signals: QualitySignal[]
  /** Every category this model actually checks — shown so "no signals" reads as "checked, and clean," not "not checked." */
  categoriesChecked: QualityCategory[]
}

const STATEMENT_FORMATS = new Set(['likert5', 'likertFrequency', 'confidence', 'behavioralHistory'])

function mean(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function stdevOf(nums: number[]): number {
  const m = mean(nums)
  return Math.sqrt(mean(nums.map((n) => (n - m) ** 2)))
}

function joinList(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')}${items.length > 2 ? ',' : ''} and ${items[items.length - 1]}`
}

/** Statement-format responses in the order they were actually answered, not content order. */
function orderedStatementValues(responses: Record<string, Response>): number[] {
  const entries: { value: number; at: number }[] = []
  for (const item of ALL_ITEMS) {
    if (!STATEMENT_FORMATS.has(item.format)) continue
    if (item.format === 'behavioralHistory' && item.answerMode === 'categorical') continue
    const r = responses[item.id]
    if (!r || typeof r.value !== 'number') continue
    entries.push({ value: r.value, at: r.firstAnsweredAt })
  }
  entries.sort((a, b) => a.at - b.at)
  return entries.map((e) => e.value)
}

// ── missing responses ──
function checkMissingResponses(responses: Record<string, Response>): QualitySignal[] {
  const { answered, total } = overallProgress(responses)
  const missing = total - answered
  if (total === 0 || missing <= 0) return []
  const missingShare = missing / total
  return [{
    id: 'quality-missing-responses',
    category: 'missingResponses',
    severity: missingShare > 0.15 ? 'flag' : 'note',
    label: 'Incomplete responses',
    detail: `${missing} of ${total} questions weren’t answered. Facets built from those questions are scored only from what was actually answered, never filled in on their behalf — but with less behind them, they carry a wider margin of error than a fully-answered facet would.`,
  }]
}

// ── extremely rapid individual responses (distinct from the overall-pace check below) ──
function checkRapidIndividualResponses(responses: Record<string, Response>): QualitySignal[] {
  let veryFast = 0
  let considered = 0
  for (const item of ALL_ITEMS) {
    if (!STATEMENT_FORMATS.has(item.format)) continue
    if (item.format === 'behavioralHistory' && item.answerMode === 'categorical') continue
    const r = responses[item.id]
    if (!r) continue
    considered++
    if (r.responseTimeMs < 700) veryFast++
  }
  if (considered < 10) return []
  const share = veryFast / considered
  if (share < 0.15) return []
  return [{
    id: 'quality-rapid-individual',
    category: 'rapidResponses',
    severity: share >= 0.3 ? 'flag' : 'note',
    label: 'A number of unusually fast individual answers',
    detail: `${veryFast} of ${considered} rating-scale questions were answered in under a second — faster than most people can read the question and weigh it. Not necessarily a problem on its own, but it lowers confidence in whichever specific facets those fast answers touched.`,
  }]
}

// ── long-string responding: the actual longest run of identical consecutive answers ──
function checkLongStringResponding(responses: Record<string, Response>): QualitySignal[] {
  const values = orderedStatementValues(responses)
  if (values.length < 10) return []

  let longest = 1
  let current = 1
  for (let i = 1; i < values.length; i++) {
    if (values[i] === values[i - 1]) {
      current++
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }

  const threshold = Math.max(8, Math.round(values.length * 0.25))
  if (longest < threshold) return []
  return [{
    id: 'quality-long-string',
    category: 'longStringResponding',
    severity: longest >= threshold * 1.5 ? 'flag' : 'note',
    label: 'Long runs of identical answers',
    detail: `${longest} rating-scale answers in a row landed on exactly the same point on the scale. That can be a genuine, steady self-view, or a sign the scale wasn’t being read closely over that stretch — worth keeping in mind for whichever facets fall in that run.`,
  }]
}

// ── improbable response patterns: a short cycle repeating far more than chance would produce ──
function checkImprobablePatterns(responses: Record<string, Response>): QualitySignal[] {
  const values = orderedStatementValues(responses)
  if (values.length < 12 || new Set(values).size < 2) return []

  for (let cycleLen = 2; cycleLen <= 4; cycleLen++) {
    let streak = 0
    let bestStreak = 0
    for (let i = cycleLen; i < values.length; i++) {
      if (values[i] === values[i - cycleLen]) {
        streak++
        bestStreak = Math.max(bestStreak, streak)
      } else {
        streak = 0
      }
    }
    if (bestStreak >= cycleLen * 3) {
      return [{
        id: 'quality-improbable-pattern',
        category: 'improbablePatterns',
        severity: 'flag',
        label: 'A regular, repeating answer pattern',
        detail: `A stretch of your rating-scale answers moved in a fixed, repeating pattern — the same short cycle of values, used over and over — rather than varying with the content of each question. That’s a pattern genuinely considered answers rarely produce by chance.`,
      }]
    }
  }
  return []
}

// ── near-duplicate inconsistency: same-facet statements that should move together, but didn't ──
function checkNearDuplicateInconsistency(
  responses: Record<string, Response>,
  facetScores: Record<string, FacetScore>,
  excludeFacetIds: Set<string>,
): QualitySignal[] {
  const byFacet: Record<string, number[]> = {}
  for (const item of ALL_ITEMS) {
    if (item.format !== 'likert5') continue
    const r = responses[item.id]
    if (!r || typeof r.value !== 'number') continue
    ;(byFacet[item.facetId] ??= []).push(likertToPoints(r.value, item.reverseScored))
  }

  const signals: QualitySignal[] = []
  for (const [facetId, points] of Object.entries(byFacet)) {
    if (points.length < 2 || excludeFacetIds.has(facetId)) continue
    const spread = Math.max(...points) - Math.min(...points)
    if (spread < 60) continue
    signals.push({
      id: `quality-near-duplicate-${facetId}`,
      category: 'nearDuplicateInconsistency',
      severity: spread >= 80 ? 'flag' : 'note',
      label: `Inconsistent answers within one area — ${facetScores[facetId]?.label ?? facetId}`,
      detail: `Multiple statements measuring the same thing landed far apart from each other, once direction is accounted for. That facet’s score is still the average of everything you answered — just read it as a wider range than usual, not a precise point.`,
      relatedFacetIds: [facetId],
    })
  }
  return signals
}

// ── confidence patterns: aggregated across every scenario item's stated confidence ──
function checkConfidencePatterns(responses: Record<string, Response>): QualitySignal[] {
  const confidences: number[] = []
  for (const item of ALL_ITEMS) {
    if (item.format !== 'scenario') continue
    const r = responses[item.id]
    if (!r) continue
    const v = r.value
    const isScenarioValue = typeof v === 'object' && v !== null && !Array.isArray(v) && 'confidence' in v
    if (!isScenarioValue) continue
    confidences.push((v as ScenarioResponseValue).confidence)
  }
  if (confidences.length < 6) return []

  const avg = mean(confidences)
  const sd = stdevOf(confidences)
  const signals: QualitySignal[] = []

  if (avg <= 2.3) {
    signals.push({
      id: 'quality-low-scenario-confidence',
      category: 'confidencePatterns',
      severity: avg <= 2 ? 'flag' : 'note',
      label: 'Consistently low stated confidence',
      detail: `Across ${confidences.length} scenario questions, stated confidence ran low on average (${avg.toFixed(1)}/5). That’s useful on its own — it suggests these were closer calls than a typical answer, worth reading as directional rather than firm.`,
    })
  }

  if (sd === 0 && confidences.length >= 8) {
    signals.push({
      id: 'quality-invariant-scenario-confidence',
      category: 'confidencePatterns',
      severity: 'note',
      label: 'Confidence rated identically every time',
      detail: `Every scenario question got exactly the same confidence rating. That could be genuine, steady certainty — or it could mean the scale wasn’t distinguishing easier calls from harder ones.`,
    })
  }

  return signals
}

function categorizeLegacyFlag(id: string): QualityCategory | null {
  if (id === 'straightlining') return null // superseded by the proper long-string index above
  if (id === 'extreme-response' || id === 'acquiescence') return 'improbablePatterns'
  if (id === 'fast-completion') return 'rapidResponses'
  if (id.startsWith('contradiction-')) return 'reverseItemContradictions'
  if (id.startsWith('self-behavior-gap-')) return 'behavioralEvidenceDisagreement'
  if (id === 'respondent-flagged-uncertainty') return 'confidencePatterns'
  return null
}

export function summarize(signals: QualitySignal[]): { profileConfidence: ProfileConfidence; summary: string } {
  const flagPoints = signals.filter((s) => s.severity === 'flag').length * 2
  const notePoints = signals.filter((s) => s.severity === 'note').length

  // 'note' is explicitly documented above (QualitySignal) as short of a real
  // data-quality problem — several of the checks that produce one say so
  // directly in their own detail text ("not necessarily a problem," "that's
  // useful on its own," a respondent's own self-awareness "is noted", not
  // penalized). A note can still tip High to Moderate (worth a mention),
  // but "Limited" explicitly means "treat this as a hypothesis, not a
  // conclusion" — too strong a claim to reach on notes alone, or on notes
  // stacked onto flags that, by themselves, only reached Moderate. Only
  // real flags can cross that specific boundary.
  const profileConfidence: ProfileConfidence =
    flagPoints > 4 ? 'Limited' : flagPoints + notePoints > 1 ? 'Moderate' : 'High'
  const categories = joinList([...new Set(signals.map((s) => QUALITY_CATEGORY_LABEL[s.category]))])

  let summary: string
  if (profileConfidence === 'High') {
    summary = 'Nothing about how these questions were answered raises a quality concern. The usual caveats about self-report data still apply, but there’s no specific reason here to discount any part of this profile.'
  } else if (profileConfidence === 'Moderate') {
    summary = `A few parts of your profile show some inconsistency — ${categories}. Nothing here invalidates the overall picture, but those areas are worth treating as directional rather than settled.`
  } else {
    summary = `Several parts of your profile contain conflicting signals — ${categories}. Those areas should be treated as hypotheses rather than conclusions, not as settled facts about you.`
  }

  return { profileConfidence, summary }
}

/**
 * The single entry point. Reuses engine/validity.ts's existing checks
 * (re-categorized under the taxonomy below) and adds five more: missing
 * responses, a proper long-string index, a repeating-pattern detector,
 * same-facet near-duplicate inconsistency, and confidence aggregated
 * across every scenario item — the two systems together cover all eight
 * named categories.
 */
export function computeResponseQuality(
  responses: Record<string, Response>,
  facetScores: Record<string, FacetScore>,
): ResponseQualityModel {
  const legacyFlags = computeValidityFlags(responses, facetScores)
  const legacySignals: QualitySignal[] = legacyFlags
    .map((flag) => {
      const category = categorizeLegacyFlag(flag.id)
      if (!category) return null
      const signal: QualitySignal = { id: flag.id, category, severity: flag.severity, label: flag.label, detail: flag.detail }
      if (flag.relatedFacetIds) signal.relatedFacetIds = flag.relatedFacetIds
      return signal
    })
    .filter((s): s is QualitySignal => s !== null)

  // A facet already flagged for its designed forward/reverse contrast
  // doesn't also need the broader near-duplicate check re-flagging the
  // same underlying disagreement a second time.
  const reverseFlaggedFacets = new Set(
    legacySignals.filter((s) => s.category === 'reverseItemContradictions').flatMap((s) => s.relatedFacetIds ?? []),
  )

  const signals: QualitySignal[] = [
    ...checkMissingResponses(responses),
    ...checkRapidIndividualResponses(responses),
    ...legacySignals.filter((s) => s.category === 'rapidResponses'),
    ...checkLongStringResponding(responses),
    ...legacySignals.filter((s) => s.category === 'reverseItemContradictions'),
    ...checkNearDuplicateInconsistency(responses, facetScores, reverseFlaggedFacets),
    ...checkImprobablePatterns(responses),
    ...legacySignals.filter((s) => s.category === 'improbablePatterns'),
    ...legacySignals.filter((s) => s.category === 'behavioralEvidenceDisagreement'),
    ...checkConfidencePatterns(responses),
    ...legacySignals.filter((s) => s.category === 'confidencePatterns'),
  ]

  const { profileConfidence, summary } = summarize(signals)

  return {
    profileConfidence,
    summary,
    signals,
    categoriesChecked: [
      'missingResponses', 'rapidResponses', 'longStringResponding', 'reverseItemContradictions',
      'nearDuplicateInconsistency', 'improbablePatterns', 'behavioralEvidenceDisagreement', 'confidencePatterns',
    ],
  }
}
