import type { ConfidenceLevel, FacetScore, Item, Response } from '../types'
import { ALL_ITEMS } from '../../content/instruments'
import { describeResponse } from './describeResponse'

/**
 * Cross-construct contradiction detection. Deliberately distinct from
 * engine/validity.ts, which flags response-QUALITY issues (straightlining,
 * fast completion) and same-facet forward/reverse disagreement. This
 * module compares two INDEPENDENT, conceptually-linked constructs —
 * usually a self-report or ranked claim against a concretely-revealed
 * behavior from a different region entirely — which is a different, and
 * generally more interesting, kind of finding. Never call a contradiction
 * "lying": people are genuinely inconsistent, or measuring two related but
 * distinct things, far more often than they're being dishonest, and the
 * copy here should read that way.
 */

export type ContradictionType =
  /** A self-report or general claim vs. a concretely-revealed choice elsewhere. */
  | 'statedVsRevealed'
  /** A self-identification (trait, taste) vs. behavioral-evidence track record. */
  | 'identityVsEvidence'
  /** "X doesn't matter to me" vs. repeatedly choosing outcomes that require X. */
  | 'professedVsChosen'

export type ContradictionSeverity = 'Low' | 'Medium' | 'High'

export interface SupportingResponse {
  facetId: string
  text: string
}

export interface Contradiction {
  id: string
  type: ContradictionType
  title: string
  relatedConstructs: string[]
  severity: ContradictionSeverity
  confidence: ConfidenceLevel
  detail: string
  supportingResponses: SupportingResponse[]
}

const CONFIDENCE_RANK: Record<ConfidenceLevel, number> = { Low: 0, Medium: 1, High: 2 }

function combineConfidence(...levels: ConfidenceLevel[]): ConfidenceLevel {
  return levels.reduce((worst, level) => (CONFIDENCE_RANK[level] < CONFIDENCE_RANK[worst] ? level : worst))
}

/** Buckets "how far past each side's threshold" into a plain severity — a
 *  contradiction that just barely clears both bars reads as Low; one where
 *  both sides are extreme reads as High. */
function severityFromExcess(excess: number): ContradictionSeverity {
  if (excess >= 35) return 'High'
  if (excess >= 15) return 'Medium'
  return 'Low'
}

function itemTouchesFacet(item: Item, facetId: string): boolean {
  switch (item.format) {
    case 'tradeoff':
      return item.optionA.facetId === facetId || item.optionB.facetId === facetId
    case 'ranking':
      return item.options.some((o) => (o.facetId ?? item.facetId) === facetId)
    case 'forcedChoiceRank':
      return item.statements.some((s) => s.facetId === facetId)
    case 'evidencePrompt':
    case 'openText':
      return false
    default:
      return 'facetId' in item && item.facetId === facetId
  }
}

function supportingResponsesFor(facetId: string, responses: Record<string, Response>, max: number): SupportingResponse[] {
  const out: SupportingResponse[] = []
  for (const item of ALL_ITEMS) {
    if (out.length >= max) break
    if (!itemTouchesFacet(item, facetId)) continue
    const response = responses[item.id]
    if (!response) continue
    out.push({ facetId, text: describeResponse(item, response, facetId) })
  }
  return out
}

type Rule = (facetScores: Record<string, FacetScore>, responses: Record<string, Response>) => Contradiction | null

// ── Rule 1: "claims high autonomy preference, but repeatedly chooses
// highly structured scenarios" ──
const ruleAutonomyStructure: Rule = (fs, responses) => {
  const claim = fs.autonomy_need
  const candidates = [fs.work_hierarchy, fs.work_bureaucracy].filter((f): f is FacetScore => Boolean(f) && f.score >= 60)
  if (!claim || claim.score < 65 || candidates.length === 0) return null
  const strongest = candidates.reduce((a, b) => (b.score > a.score ? b : a))
  const excess = (claim.score - 65) + (strongest.score - 60)
  return {
    id: 'contradiction-autonomy-structure',
    type: 'statedVsRevealed',
    title: 'Says autonomy matters, but leans toward structure in concrete scenarios',
    relatedConstructs: [claim.label, ...candidates.map((f) => f.label)],
    severity: severityFromExcess(excess),
    confidence: combineConfidence(claim.confidence, strongest.confidence),
    detail: `You rated your need for self-direction highly (${claim.score}/100), but when the choice got concrete — a manager’s sign-off, a formal process to follow — you leaned toward the structured side (${strongest.label.toLowerCase()}: ${strongest.score}/100). That’s not a flaw in either answer; it suggests the autonomy you want may be about which decisions you control, not freedom from structure altogether.`,
    supportingResponses: [...supportingResponsesFor('autonomy_need', responses, 1), ...supportingResponsesFor(strongest.facetId, responses, 2)],
  }
}

// ── Rule 2: "claims entrepreneurship is important, but consistently
// favors stability over upside" ──
const ruleEntrepreneurshipStability: Rule = (fs, responses) => {
  const claim = fs.anchor_entrepreneurship
  const financial = fs.risk_financial
  const career = fs.risk_career
  if (!claim || !financial || !career) return null
  if (claim.score < 65 || financial.score >= 40 || career.score >= 40) return null
  const avgRisk = (financial.score + career.score) / 2
  const excess = (claim.score - 65) + (40 - avgRisk)
  return {
    id: 'contradiction-entrepreneurship-stability',
    type: 'statedVsRevealed',
    title: 'Ranks entrepreneurship high, but consistently favors stability over upside',
    relatedConstructs: [claim.label, financial.label, career.label],
    severity: severityFromExcess(excess),
    confidence: combineConfidence(claim.confidence, financial.confidence, career.confidence),
    detail: `Entrepreneurship came out as one of your stronger career priorities (${claim.score}/100), but in concrete financial and career scenarios — variable income, an early-stage employer, switching fields — you consistently chose the safer, more certain option (financial risk: ${financial.score}/100, career risk: ${career.score}/100). Building something of your own almost always means living with exactly the kind of uncertainty these scenarios showed you avoiding — worth sitting with which picture is more accurate.`,
    supportingResponses: [...supportingResponsesFor('anchor_entrepreneurship', responses, 1), ...supportingResponsesFor('risk_financial', responses, 1), ...supportingResponsesFor('risk_career', responses, 1)],
  }
}

// ── Rule 3: "identifies as creative, but reports almost no creative
// behavior" ──
const ruleCreativeIdentityEvidence: Rule = (fs, responses) => {
  const ability = fs.strength_creative_ability
  const identitySignals = [fs.strength_creative_ease, fs.aesthetic_openness].filter((f): f is FacetScore => Boolean(f) && f.score >= 65)
  if (!ability || ability.score >= 35 || identitySignals.length === 0) return null
  const strongestIdentity = identitySignals.reduce((a, b) => (b.score > a.score ? b : a))
  const excess = (strongestIdentity.score - 65) + (35 - ability.score)
  return {
    id: 'contradiction-creative-identity-evidence',
    type: 'identityVsEvidence',
    title: 'Identifies as creative, but reports little demonstrated creative output',
    relatedConstructs: [strongestIdentity.label, ability.label],
    severity: severityFromExcess(excess),
    confidence: combineConfidence(strongestIdentity.confidence, ability.confidence),
    detail: `${strongestIdentity.label} came back high (${strongestIdentity.score}/100) — creative work feels natural or appealing to you. But the behavioral question — how often people have actually sought out or used something you made — came back low (${ability.score}/100). A self-image and a track record are two different kinds of evidence; it’s worth asking whether the creative work is genuinely happening, or is mostly still a self-image for now.`,
    supportingResponses: [...supportingResponsesFor(strongestIdentity.facetId, responses, 1), ...supportingResponsesFor('strength_creative_ability', responses, 2)],
  }
}

// ── Rule 4: "says status does not matter, but repeatedly chooses
// prestigious outcomes" ──
const ruleStatusPrestige: Rule = (fs, responses) => {
  const claim = fs.power
  const prestige = fs.future_prestige
  if (!claim || !prestige) return null
  if (claim.score >= 40 || prestige.score < 60) return null
  const excess = (40 - claim.score) + (prestige.score - 60)
  return {
    id: 'contradiction-status-prestige',
    type: 'professedVsChosen',
    title: 'Says status doesn’t matter much, but protects prestige when forced to choose',
    relatedConstructs: [claim.label, prestige.label],
    severity: severityFromExcess(excess),
    confidence: combineConfidence(claim.confidence, prestige.confidence),
    detail: `Power and status scored low among your professed values (${claim.score}/100). But when your imagined future life had to be cut down to just four things you’d protect, being visibly respected and recognized survived the cut (${prestige.score}/100). What people say they value and what they protect under real constraint don’t always match — the second is usually the more reliable signal.`,
    supportingResponses: [...supportingResponsesFor('power', responses, 1), ...supportingResponsesFor('future_prestige', responses, 2)],
  }
}

// ── Rule 5: ranks Security highly, but chooses variable income anyway ──
const ruleSecurityFinancialRisk: Rule = (fs, responses) => {
  const claim = fs.anchor_security
  const financial = fs.risk_financial
  if (!claim || !financial) return null
  if (claim.score < 65 || financial.score < 60) return null
  const excess = (claim.score - 65) + (financial.score - 60)
  return {
    id: 'contradiction-security-financial-risk',
    type: 'statedVsRevealed',
    title: 'Ranks security high, but repeatedly chooses variable income over a guarantee',
    relatedConstructs: [claim.label, financial.label],
    severity: severityFromExcess(excess),
    confidence: combineConfidence(claim.confidence, financial.confidence),
    detail: `Security ranked as one of your stronger career anchors (${claim.score}/100), but in concrete pay scenarios you leaned toward variable or commission-based income over a flat guarantee (financial risk tolerance: ${financial.score}/100). It’s possible “security” means something more specific to you than income stability — worth clarifying which kind of stability you’re actually protecting.`,
    supportingResponses: [...supportingResponsesFor('anchor_security', responses, 1), ...supportingResponsesFor('risk_financial', responses, 2)],
  }
}

// ── Rule 6: ranks Service/Mission highly, but chooses comfort over impact ──
const ruleMissionComfort: Rule = (fs, responses) => {
  const claim = fs.anchor_service_mission
  const impactComfort = fs.desire_impact_comfort
  if (!claim || !impactComfort) return null
  if (claim.score < 65 || impactComfort.score >= 40) return null
  const excess = (claim.score - 65) + (40 - impactComfort.score)
  return {
    id: 'contradiction-mission-comfort',
    type: 'statedVsRevealed',
    title: 'Ranks service/mission high, but consistently chooses comfort over impact',
    relatedConstructs: [claim.label, impactComfort.label],
    severity: severityFromExcess(excess),
    confidence: combineConfidence(claim.confidence, impactComfort.confidence),
    detail: `Service and mission came out as one of your stronger career anchors (${claim.score}/100), but on the Impact vs. Comfort tension you leaned toward comfort (${impactComfort.score}/100) — genuinely mission-driven work tends to ask for exactly the kind of sacrifice that tension is measuring. Less a contradiction to resolve than a real tradeoff worth naming honestly.`,
    supportingResponses: [...supportingResponsesFor('anchor_service_mission', responses, 1), ...supportingResponsesFor('desire_impact_comfort', responses, 2)],
  }
}

// ── Rule 7: low self-reported sociability, but chooses socially dense scenarios ──
const ruleSociabilitySocialChoice: Rule = (fs, responses) => {
  const claim = fs.sociability
  const workSocial = fs.work_solitude_social
  if (!claim || !workSocial) return null
  if (claim.score >= 40 || workSocial.score >= 35) return null
  const excess = (40 - claim.score) + (35 - workSocial.score)
  return {
    id: 'contradiction-sociability-social-choice',
    type: 'statedVsRevealed',
    title: 'Reports low need for social contact, but chooses socially dense scenarios',
    relatedConstructs: [claim.label, workSocial.label],
    severity: severityFromExcess(excess),
    confidence: combineConfidence(claim.confidence, workSocial.confidence),
    detail: `Sociability scored low in self-report (${claim.score}/100) — being around people for long stretches doesn’t sound especially energizing to you, on paper. But in concrete work-environment tradeoffs, you leaned toward the socially dense option over solitude (${workSocial.label.toLowerCase()}: ${workSocial.score}/100). Worth distinguishing what drains you from what you’d actually choose once the alternative is made real.`,
    supportingResponses: [...supportingResponsesFor('sociability', responses, 1), ...supportingResponsesFor('work_solitude_social', responses, 2)],
  }
}

// ── Rule 8: general self-reported risk tolerance vs. domain-specific caution ──
const ruleGeneralVsConcreteRisk: Rule = (fs, responses) => {
  const claim = fs.risk_tolerance
  const financial = fs.risk_financial
  const career = fs.risk_career
  if (!claim || !financial || !career) return null
  if (claim.score < 65 || financial.score >= 40 || career.score >= 40) return null
  const avg = (financial.score + career.score) / 2
  const excess = (claim.score - 65) + (40 - avg)
  return {
    id: 'contradiction-general-concrete-risk',
    type: 'statedVsRevealed',
    title: 'Self-reports high risk tolerance, but concrete scenarios reveal a preference for safety',
    relatedConstructs: [claim.label, financial.label, career.label],
    severity: severityFromExcess(excess),
    confidence: combineConfidence(claim.confidence, financial.confidence, career.confidence),
    detail: `General risk tolerance scored high (${claim.score}/100) — as a self-description, you see yourself as willing to bet on a bigger outcome. But once the risk got specific — real income variance, an unstable employer — you consistently picked the safer path (financial: ${financial.score}/100, career: ${career.score}/100). Abstract risk tolerance and domain-specific risk tolerance often diverge; this looks like one of those cases.`,
    supportingResponses: [...supportingResponsesFor('risk_tolerance', responses, 1), ...supportingResponsesFor('risk_financial', responses, 1), ...supportingResponsesFor('risk_career', responses, 1)],
  }
}

const RULES: Rule[] = [
  ruleAutonomyStructure,
  ruleEntrepreneurshipStability,
  ruleCreativeIdentityEvidence,
  ruleStatusPrestige,
  ruleSecurityFinancialRisk,
  ruleMissionComfort,
  ruleSociabilitySocialChoice,
  ruleGeneralVsConcreteRisk,
]

export function detectContradictions(
  facetScores: Record<string, FacetScore>,
  responses: Record<string, Response>,
): Contradiction[] {
  return RULES
    .map((rule) => rule(facetScores, responses))
    .filter((c): c is Contradiction => c !== null)
    .sort((a, b) => CONFIDENCE_RANK[b.confidence] - CONFIDENCE_RANK[a.confidence] || severityRank(b.severity) - severityRank(a.severity))
}

function severityRank(s: ContradictionSeverity): number {
  return s === 'High' ? 2 : s === 'Medium' ? 1 : 0
}
