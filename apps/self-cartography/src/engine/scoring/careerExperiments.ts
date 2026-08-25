import type { CareerFitResult } from './careerMatch'
import type { UnconventionalPathResult } from './unconventionalPaths'
import type { Career, RiasecProfile } from '../../content/careers/occupationData'
import { summarizePrimaryReason } from './careerCardSummary'
import type { ExperimentTag, ExperimentTemplate } from '../../content/copy/careerExperiments'
import { EXPERIMENT_TEMPLATES } from '../../content/copy/careerExperiments'

/**
 * CAREER EXPERIMENTS — the engine half. This app's scores are hypotheses,
 * never verdicts — no amount of self-report and forced-choice tradeoffs
 * can substitute for what actually happens when someone does the work.
 * This module turns a respondent's strongest career hypotheses (real
 * occupations, career structures) into a short, cheap, real-world test
 * plan for each one, so the next step is behavioral evidence, not more
 * introspection.
 */

export interface CareerHypothesis {
  id: string
  label: string
  /** Why this is a hypothesis worth testing — reuses the exact same
   *  one-line reasoning Career Explorer's cards already show, never new copy. */
  rationale: string
  tags: ExperimentTag[]
}

export interface MatchedExperiment extends ExperimentTemplate {
  /** Which of the hypothesis's own tags this template actually matched on —
   *  shown so "why this experiment" is traceable, not asserted. */
  matchedTags: ExperimentTag[]
}

export interface ExperimentPlan {
  hypothesis: CareerHypothesis
  experiments: MatchedExperiment[]
}

const RIASEC_TAGS: Record<keyof RiasecProfile, ExperimentTag[]> = {
  realistic: ['realistic', 'mechanical', 'handson'],
  investigative: ['analytical', 'investigative'],
  artistic: ['creation', 'creative'],
  social: ['social', 'teaching', 'interpersonal', 'belonging'],
  enterprising: ['enterprising', 'persuasion', 'competition'],
  conventional: ['mastery', 'technical'],
}

/** Tags for a real occupation, derived from its own dominant RIASEC
 *  letters plus its objective independence/leadership fields — never
 *  hand-tagged per career, so this scales to any occupation added later. */
function tagsForCareer(career: Career): ExperimentTag[] {
  const ranked = (Object.entries(career.riasec) as [keyof RiasecProfile, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .filter(([, score]) => score >= 50)

  const tags = new Set<ExperimentTag>()
  for (const [letter] of ranked) for (const tag of RIASEC_TAGS[letter]) tags.add(tag)
  if (career.independence >= 65) { tags.add('autonomy'); tags.add('portfolio') }
  if (career.leadership >= 65) tags.add('leadership')
  return [...tags]
}

/** Career structures have no RIASEC data of their own — hand-tagged once,
 *  same discipline as every other hand-curated archetype list this session
 *  built (poorFitArchetypes, careerStructures itself). */
const STRUCTURE_TAGS: Record<string, ExperimentTag[]> = {
  'portfolio-career': ['autonomy', 'portfolio'],
  consulting: ['analytical', 'persuasion', 'autonomy'],
  'independent-operator': ['autonomy', 'portfolio', 'mechanical'],
  'small-business-acquisition': ['leadership', 'autonomy'],
  entrepreneurship: ['enterprising', 'persuasion', 'autonomy'],
  'fractional-work': ['leadership', 'autonomy', 'portfolio'],
  'commission-based-work': ['enterprising', 'persuasion', 'competition'],
  'technical-sales': ['enterprising', 'persuasion', 'analytical'],
  'craft-business-hybrid': ['creation', 'mechanical', 'handson'],
  'creator-operator': ['creation', 'creative', 'autonomy'],
  'research-entrepreneurship': ['analytical', 'investigative', 'enterprising'],
  'trade-ownership': ['realistic', 'mechanical', 'handson', 'leadership'],
}

/** Builds one hypothesis per real career fit and per career structure
 *  handed to it — callers decide which/how many count as "major" (see
 *  ResultsReport.tsx, which passes the same top picks Career Fit and
 *  Unconventional Paths already surface). */
export function buildCareerHypotheses(topCareerFits: CareerFitResult[], topPaths: UnconventionalPathResult[]): CareerHypothesis[] {
  const fromCareers: CareerHypothesis[] = topCareerFits.map((r) => ({
    id: `career-${r.career.id}`,
    label: r.career.title,
    rationale: summarizePrimaryReason(r) ?? `Fit score ${r.fitScore}.`,
    tags: tagsForCareer(r.career),
  }))
  const fromPaths: CareerHypothesis[] = topPaths.map((p) => ({
    id: `path-${p.id}`,
    label: p.label,
    rationale: p.detail,
    tags: STRUCTURE_TAGS[p.id] ?? [],
  }))
  return [...fromCareers, ...fromPaths]
}

/** For each hypothesis, the templates whose tags actually overlap with it,
 *  ranked by how many tags matched — "generic" templates (useful for any
 *  hypothesis) always qualify, but rank behind anything more specific. */
export function planExperiments(
  hypotheses: CareerHypothesis[],
  templates: ExperimentTemplate[] = EXPERIMENT_TEMPLATES,
  maxPerHypothesis = 3,
): ExperimentPlan[] {
  return hypotheses
    .map((hypothesis) => {
      const experiments: MatchedExperiment[] = templates
        .map((t) => ({ ...t, matchedTags: t.tags.filter((tag) => tag === 'generic' || hypothesis.tags.includes(tag)) }))
        .filter((t) => t.matchedTags.length > 0)
        .sort((a, b) => b.matchedTags.length - a.matchedTags.length)
        .slice(0, maxPerHypothesis)
      return { hypothesis, experiments }
    })
    .filter((plan) => plan.experiments.length > 0)
}
