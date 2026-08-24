import type { FacetScore } from '../types'

/**
 * The synthesis engine: explicit, hand-curated relationships BETWEEN
 * scored constructs, in both directions —
 *
 *  CONVERGENCE — several independent scales pointing the same direction
 *  at once, which is a much stronger signal than any one of them alone
 *  (e.g. high Enterprising interest + high Assertiveness + high Autonomy
 *  need + high Competition + high variable-income tolerance, together,
 *  read as a real entrepreneurial/sales signal in a way no single score does).
 *
 *  TENSION — two independent, genuinely-held-high priorities that
 *  practically constrain each other (e.g. high entrepreneurial drive +
 *  high security need). This is deliberately NOT the same thing
 *  engine/scoring/contradictions.ts detects: a contradiction is a
 *  self-report claim disagreeing with revealed behavior (one signal is
 *  probably wrong). A tension here is two signals that are each
 *  independently well-supported and simply don't fully coexist in
 *  practice — neither one is "the wrong answer."
 *
 * Every rule is hand-written and theoretically motivated. There is no
 * generic "average N related-ish facets together" mechanism here on
 * purpose — that produces exactly the meaningless global blend this
 * module exists to avoid. A combination only exists if someone deliberately
 * wrote out why those specific scales, together, mean something.
 */

export interface RuleCondition {
  facetId: string
  direction: 'high' | 'low'
  /** 0-100, always expressed as distance toward the named pole — a 'low'
   *  condition with threshold 65 is met when score <= 35. */
  threshold: number
}

/** Exported for reuse by unconventionalPaths.ts, which detects the same
 *  kind of thing (a hand-curated trait combination) against a different
 *  named list — one rule for what "meeting a threshold condition" means,
 *  everywhere it's used. */
export function evaluateCondition(
  facetScores: Record<string, FacetScore>,
  cond: RuleCondition,
): { met: boolean; excess: number; facet: FacetScore | undefined } {
  const facet = facetScores[cond.facetId]
  if (!facet) return { met: false, excess: 0, facet: undefined }
  const met = cond.direction === 'high' ? facet.score >= cond.threshold : facet.score <= 100 - cond.threshold
  const excess = cond.direction === 'high' ? facet.score - cond.threshold : 100 - cond.threshold - facet.score
  return { met, excess: Math.max(0, excess), facet }
}

// ── convergence ──────────────────────────────────────────────────────

export type ConvergenceStrength = 'Emerging' | 'Notable' | 'Strong'

export interface ConvergenceContributor {
  facetId: string
  label: string
  score: number
  met: boolean
}

export interface ConvergenceSignal {
  id: string
  name: string
  strength: ConvergenceStrength
  conditionsMet: number
  conditionsTotal: number
  detail: string
  contributingFacets: ConvergenceContributor[]
}

interface ConvergenceRuleDef {
  id: string
  name: string
  conditions: RuleCondition[]
  /** How many conditions have to clear their threshold before this fires at all. */
  minimumMet: number
  detail: string
}

const CONVERGENCE_RULES: ConvergenceRuleDef[] = [
  {
    id: 'entrepreneurial-sales',
    name: 'Entrepreneurial / Sales Signal',
    minimumMet: 3,
    conditions: [
      { facetId: 'riasec_enterprising', direction: 'high', threshold: 65 },
      { facetId: 'assertiveness', direction: 'high', threshold: 65 },
      { facetId: 'autonomy_need', direction: 'high', threshold: 65 },
      { facetId: 'work_competition', direction: 'high', threshold: 65 },
      { facetId: 'risk_financial', direction: 'high', threshold: 65 },
    ],
    detail: 'Enterprising interest, assertiveness, a strong need for autonomy, a taste for competition, and real tolerance for variable income don’t individually prove much — plenty of people have one or two without the others. Together, they’re a much stronger signal than any one score alone: this exact combination shows up disproportionately often in people who end up building or selling something of their own.',
  },
  {
    id: 'technical-depth-ic',
    name: 'Technical Depth / Individual Contributor Signal',
    minimumMet: 3,
    conditions: [
      { facetId: 'anchor_technical_mastery', direction: 'high', threshold: 65 },
      { facetId: 'riasec_investigative', direction: 'high', threshold: 65 },
      { facetId: 'intellectual_curiosity', direction: 'high', threshold: 65 },
      { facetId: 'strength_analytical_ability', direction: 'high', threshold: 65 },
      { facetId: 'work_solitude_social', direction: 'high', threshold: 65 },
    ],
    detail: 'A career anchor in technical mastery, investigative interest, intellectual curiosity, demonstrated analytical ability, and a preference for solitude over social density all point the same direction: someone who does their best work going deep on hard problems alone, not managing the problems other people are having.',
  },
  {
    id: 'servant-leadership',
    name: 'Servant Leadership / People-Development Signal',
    minimumMet: 3,
    conditions: [
      { facetId: 'riasec_social', direction: 'high', threshold: 65 },
      { facetId: 'compassion', direction: 'high', threshold: 65 },
      { facetId: 'anchor_general_management', direction: 'high', threshold: 65 },
      { facetId: 'strength_interpersonal_ability', direction: 'high', threshold: 65 },
      { facetId: 'future_leadership', direction: 'high', threshold: 65 },
    ],
    detail: 'Social interest, compassion, a general-management career anchor, demonstrated interpersonal ability, and leadership that survived real scarcity in Future Self line up: not just someone who CAN lead, but someone whose whole profile points toward leading by developing people, not just directing them.',
  },
  {
    id: 'creative-independent',
    name: 'Creative Independent Signal',
    minimumMet: 3,
    conditions: [
      { facetId: 'riasec_artistic', direction: 'high', threshold: 65 },
      { facetId: 'aesthetic_openness', direction: 'high', threshold: 65 },
      { facetId: 'autonomy_need', direction: 'high', threshold: 65 },
      { facetId: 'strength_creative_ease', direction: 'high', threshold: 65 },
      { facetId: 'work_creative_freedom', direction: 'high', threshold: 65 },
    ],
    detail: 'Artistic interest, aesthetic openness, a strong need for autonomy, creative work that’s come naturally, and a preference for inventing your own approach over following a defined process converge on the same picture: original creative work done on your own terms, not to someone else’s brief.',
  },
  {
    id: 'high-stakes-operator',
    name: 'High-Stakes Operator Signal',
    minimumMet: 3,
    conditions: [
      { facetId: 'risk_reputational', direction: 'high', threshold: 65 },
      { facetId: 'anchor_challenge', direction: 'high', threshold: 65 },
      { facetId: 'aspire_responsibility', direction: 'high', threshold: 65 },
      { facetId: 'future_responsibility', direction: 'high', threshold: 65 },
      { facetId: 'uncertainty_tolerance', direction: 'high', threshold: 65 },
    ],
    detail: 'Willingness to be publicly accountable, a career anchor in pure challenge, comfort owning uncertain outcomes — both as a stated aspiration and as a protected priority in Future Self — and real tolerance for not knowing how things will turn out all point toward someone suited to high-stakes, high-responsibility roles, not just tolerant of that pressure but drawn to it.',
  },
  {
    id: 'steady-builder',
    name: 'Steady Builder / Institution Signal',
    minimumMet: 3,
    conditions: [
      { facetId: 'anchor_security', direction: 'high', threshold: 65 },
      { facetId: 'risk_financial', direction: 'low', threshold: 65 },
      { facetId: 'work_predictability', direction: 'low', threshold: 65 },
      { facetId: 'future_ownership', direction: 'high', threshold: 65 },
      { facetId: 'structure_need', direction: 'high', threshold: 65 },
    ],
    detail: 'Security as a career anchor, low tolerance for variable income, a strong preference for predictable days, ownership protected as a Future Self priority, and a real need for structure all reinforce each other: someone who does best building something durable under stable conditions, not chasing upside under uncertainty.',
  },
]

function detectConvergenceRule(def: ConvergenceRuleDef, facetScores: Record<string, FacetScore>): ConvergenceSignal | null {
  const evaluated = def.conditions.map((cond) => ({ cond, ...evaluateCondition(facetScores, cond) }))
  const conditionsMet = evaluated.filter((e) => e.met).length
  if (conditionsMet < def.minimumMet) return null

  const fraction = conditionsMet / def.conditions.length
  const strength: ConvergenceStrength = fraction >= 1 ? 'Strong' : fraction >= 0.75 ? 'Notable' : 'Emerging'

  return {
    id: def.id,
    name: def.name,
    strength,
    conditionsMet,
    conditionsTotal: def.conditions.length,
    detail: def.detail,
    contributingFacets: evaluated
      .filter((e): e is typeof e & { facet: FacetScore } => Boolean(e.facet))
      .map((e) => ({ facetId: e.cond.facetId, label: e.facet.label, score: e.facet.score, met: e.met })),
  }
}

export function detectConvergence(facetScores: Record<string, FacetScore>): ConvergenceSignal[] {
  return CONVERGENCE_RULES
    .map((rule) => detectConvergenceRule(rule, facetScores))
    .filter((s): s is ConvergenceSignal => s !== null)
    .sort((a, b) => b.conditionsMet - a.conditionsMet)
}

// ── tension ──────────────────────────────────────────────────────────

export interface TensionFacetRef {
  facetId: string
  label: string
  score: number
}

export interface TensionSignal {
  id: string
  name: string
  /** Short, evocative header words — "FREEDOM ↔ SECURITY," not the longer
   *  descriptive `name` above. What a reader scans first. */
  poleA: string
  poleB: string
  detail: string
  facetA: TensionFacetRef
  facetB: TensionFacetRef
}

interface TensionRuleDef {
  id: string
  name: string
  poleA: string
  poleB: string
  conditionA: RuleCondition
  conditionB: RuleCondition
  detail: string
}

const TENSION_RULES: TensionRuleDef[] = [
  {
    id: 'entrepreneurship-security',
    name: 'Entrepreneurial Drive vs. Security Preference',
    poleA: 'Entrepreneurship', poleB: 'Security',
    conditionA: { facetId: 'anchor_entrepreneurship', direction: 'high', threshold: 65 },
    conditionB: { facetId: 'anchor_security', direction: 'high', threshold: 65 },
    detail: 'Entrepreneurial drive constrained by security preference. Both showed up as real, independently measured priorities — not a contradiction to resolve, but a genuine tension: the kind of venture that satisfies the security side rarely satisfies the entrepreneurial side, and vice versa.',
  },
  {
    id: 'leadership-low-sociability',
    name: 'Leadership Pull vs. Low Social Battery',
    poleA: 'Leadership', poleB: 'Solitude',
    conditionA: { facetId: 'future_leadership', direction: 'high', threshold: 65 },
    conditionB: { facetId: 'sociability', direction: 'low', threshold: 65 },
    detail: 'Being looked to for direction survived real scarcity in Future Self, but sociability — energy drawn from social contact — scored low. Leadership doesn’t require high sociability, but it does require sustained social contact, which this combination suggests may come at a real cost rather than an energizing one.',
  },
  {
    id: 'mastery-novelty',
    name: 'Wants Depth and Wants Newness',
    poleA: 'Mastery', poleB: 'Novelty',
    conditionA: { facetId: 'desire_mastery_ease', direction: 'high', threshold: 65 },
    conditionB: { facetId: 'novelty_seeking', direction: 'high', threshold: 65 },
    detail: 'The Mastery vs. Ease tension leans toward mastery — going deep on one hard thing — while novelty seeking also runs high — wanting unfamiliar experience for its own sake. Depth usually asks for years on the same terrain; novelty seeking rarely tolerates that long on one terrain. Both are real; they don’t fully coexist in the same role.',
  },
  {
    id: 'career-risk-daily-predictability',
    name: 'Career Risk-Taking vs. Day-to-Day Predictability',
    poleA: 'Risk-Taking', poleB: 'Predictability',
    conditionA: { facetId: 'risk_career', direction: 'high', threshold: 65 },
    conditionB: { facetId: 'work_predictability', direction: 'low', threshold: 65 },
    detail: 'Willing to leave a stable job or field for something less certain, but wants each individual day to look like the last. Big-bet career risk and predictable daily structure aren’t opposites, but they’re rarely both available in the same role at the same time — the leap itself tends to make the days unpredictable for a while.',
  },
  {
    id: 'prestige-privacy',
    name: 'Wants Recognition, Wants Privacy',
    poleA: 'Recognition', poleB: 'Privacy',
    conditionA: { facetId: 'future_prestige', direction: 'high', threshold: 65 },
    conditionB: { facetId: 'desire_status_privacy', direction: 'low', threshold: 65 },
    detail: 'Being visibly respected survived real scarcity in Future Self, but the Status vs. Privacy tension leans toward keeping life mostly unseen. Recognition is hard to have without visibility — worth naming rather than assuming one of the two numbers is the "truer" one.',
  },
  {
    id: 'mastery-task-variety',
    name: 'Single-Domain Mastery vs. Task Variety',
    poleA: 'Mastery', poleB: 'Variety',
    conditionA: { facetId: 'anchor_technical_mastery', direction: 'high', threshold: 65 },
    conditionB: { facetId: 'work_task_variety', direction: 'high', threshold: 65 },
    detail: 'Technical mastery — depth in one specific thing — is a strong career anchor, but task variety, switching between genuinely different kinds of work, also scored high. Deep mastery is usually built through sustained repetition in one domain; high task variety usually prevents that repetition from accumulating.',
  },
  {
    id: 'freedom-security',
    name: 'Independence vs. Financial Predictability',
    poleA: 'Freedom', poleB: 'Security',
    conditionA: { facetId: 'autonomy_need', direction: 'high', threshold: 70 },
    conditionB: { facetId: 'risk_financial', direction: 'low', threshold: 65 },
    detail: 'You place very high value on independence, but also show a significant preference for financial predictability over variable income. Autonomy is usually bought with uncertainty — freelance, ownership, or unstructured roles rarely come with a guaranteed paycheck — so this pairing isn’t a flaw to resolve, it’s a real constraint: whatever role fits both sides has to protect self-direction without asking for much income risk in exchange.',
  },
  {
    id: 'impact-privacy',
    name: 'Wants Influence, Avoids Exposure',
    poleA: 'Impact', poleB: 'Privacy',
    conditionA: { facetId: 'desire_impact_comfort', direction: 'high', threshold: 65 },
    conditionB: { facetId: 'desire_status_privacy', direction: 'low', threshold: 65 },
    detail: 'You want influence — work that might genuinely change something — but show low appetite for the public exposure that usually comes with visible impact. Influence at any real scale is hard to have unseen; this isn’t proof one number is truer than the other, it’s a shape a role has to accommodate: impact exercised through the work itself, or through people who trust you, rather than through a public platform.',
  },
  {
    id: 'novelty-completion',
    name: 'Seeks New Ideas Over Prolonged Execution',
    poleA: 'Novelty', poleB: 'Completion',
    conditionA: { facetId: 'novelty_seeking', direction: 'high', threshold: 65 },
    conditionB: { facetId: 'industriousness', direction: 'low', threshold: 60 },
    detail: 'You seek new ideas more strongly than you sustain prolonged execution on any one of them. Neither half is a weakness by itself — novelty-seeking generates real options, and not every idea deserves years of follow-through — but the combination means a role built entirely around seeing one thing through to the end is likely to cost more than it should. This is a case for structure that hands off execution rather than a case for trying to want to finish things more.',
  },
]

function detectTensionRule(def: TensionRuleDef, facetScores: Record<string, FacetScore>): TensionSignal | null {
  const a = evaluateCondition(facetScores, def.conditionA)
  const b = evaluateCondition(facetScores, def.conditionB)
  if (!a.met || !b.met || !a.facet || !b.facet) return null
  return {
    id: def.id,
    name: def.name,
    poleA: def.poleA,
    poleB: def.poleB,
    detail: def.detail,
    facetA: { facetId: def.conditionA.facetId, label: a.facet.label, score: a.facet.score },
    facetB: { facetId: def.conditionB.facetId, label: b.facet.label, score: b.facet.score },
  }
}

export function detectTensions(facetScores: Record<string, FacetScore>): TensionSignal[] {
  return TENSION_RULES
    .map((rule) => detectTensionRule(rule, facetScores))
    .filter((s): s is TensionSignal => s !== null)
}

// ── entry point ──────────────────────────────────────────────────────

export interface ProfileRelationships {
  convergences: ConvergenceSignal[]
  tensions: TensionSignal[]
}

export function analyzeProfileRelationships(facetScores: Record<string, FacetScore>): ProfileRelationships {
  return {
    convergences: detectConvergence(facetScores),
    tensions: detectTensions(facetScores),
  }
}
