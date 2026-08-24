import type { FacetScore } from '../../engine/types'
import type { FutureSelfStability } from '../../engine/scoring/futureSelfStability'
import type { StrengthDomainResult } from '../../engine/scoring/strengthsClassification'
import type { CareerFitResult } from '../../engine/scoring/careerMatch'
import type { UnconventionalPathResult } from '../../engine/scoring/unconventionalPaths'

/**
 * "The result should identify the LIFE a career needs to support" — built
 * only from what survived scarcity at BOTH imagined horizons (see
 * computeFutureSelfStability), never from a simple top-N read of the
 * blended scores. Surviving two separate scarcity cuts, five years apart
 * in framing, is a much stronger claim than "rated highly once."
 */
function joinList(items: string[]): string {
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')}${items.length > 2 ? ',' : ''} and ${items[items.length - 1]}`
}

export function buildFutureSelfNarrative(stability: FutureSelfStability | null): string | null {
  if (!stability || stability.durable.length === 0) return null

  const names = stability.durable.map((f) => f.label.toLowerCase())
  const list = joinList(names)

  let sentence = `Whatever else changed between the two horizons, ${names.length === 1 ? 'one thing' : 'these'} stayed protected at both five and ten years out: ${list}. That’s less a job description than a shape a career has to fit around.`

  if (stability.fiveYearOnly.length > 0 || stability.tenYearOnly.length > 0) {
    const dropped = stability.fiveYearOnly.map((f) => f.label.toLowerCase())
    const gained = stability.tenYearOnly.map((f) => f.label.toLowerCase())
    if (dropped.length > 0 && gained.length > 0) {
      const gainedVerb = gained.length === 1 ? 'was' : 'were'
      sentence += ` ${joinList(dropped)} mattered enough to protect at five years but not ten; ${joinList(gained)} ${gainedVerb} the reverse — worth noticing which of your priorities are durable and which are closer to a current phase of life.`
    } else if (dropped.length > 0) {
      sentence += ` ${joinList(dropped)} mattered enough to protect at five years, but gave way by ten — worth asking whether that’s a priority fading, or just further off than you can picture clearly yet.`
    } else if (gained.length > 0) {
      sentence += ` ${joinList(gained)} only showed up as essential at the ten-year distance — a priority that may take longer to matter than it does right now.`
    }
  }

  return sentence
}

/**
 * Every facet used below in a "lean toward" sentence is a bipolar tension
 * whose own label is literally "X vs. Y" (see content/facets.ts) — reading
 * the lean straight off that label, rather than a separately hand-written
 * phrase per facet, keeps the description locked to what the facet
 * actually is. Returns null well short of the poles: a near-midpoint score
 * means the tradeoff didn't consistently pull one way, which is not itself
 * worth a sentence.
 */
function leanTowardLabel(facet: FacetScore | undefined, threshold = 65): string | null {
  if (!facet) return null
  const parts = facet.label.split(' vs. ')
  if (parts.length !== 2) return null
  if (facet.score >= threshold) return parts[0]
  if (facet.score <= 100 - threshold) return parts[1]
  return null
}

/**
 * YOUR OPERATING STYLE — how work actually gets approached, not what's
 * wanted from it (that's Environment, below). Built from conscientiousness
 * facets and the two most approach-relevant work tensions.
 */
export function buildOperatingStyleNarrative(facetScores: Record<string, FacetScore>): string | null {
  const sentences: string[] = []

  const orderliness = facetScores.orderliness
  const industriousness = facetScores.industriousness
  if (orderliness && industriousness) {
    if (orderliness.score >= 60 && industriousness.score >= 60) {
      sentences.push('Orderliness and industriousness both scored high — you tend to work from a system, and you tend to actually finish what you start.')
    } else if (orderliness.score < 40 && industriousness.score < 40) {
      sentences.push('Orderliness and industriousness both scored low — imposed process is more likely to slow you down than help you, and unglamorous follow-through is where momentum is most likely to slip.')
    }
  }

  const pace = leanTowardLabel(facetScores.work_pace)
  if (pace) sentences.push(`On pace, you lean toward ${pace.toLowerCase()}.`)

  const process = leanTowardLabel(facetScores.work_creative_freedom)
  if (process) sentences.push(`On process, you lean toward ${process.toLowerCase()}.`)

  const assertiveness = facetScores.assertiveness
  if (assertiveness) {
    if (assertiveness.score >= 65) sentences.push('Assertiveness scored high — you tend to take a direct, visible stance rather than defer.')
    else if (assertiveness.score <= 35) sentences.push('Assertiveness scored low — you tend to hold back a direct, visible stance rather than push it.')
  }

  if (sentences.length === 0) return null
  return sentences.join(' ')
}

/**
 * ENERGY SOURCES — what replenishes versus drains, read from the one axis
 * in this whole instrument that measures that directly (the energy facet
 * inside each strength domain — see strengthsClassification.ts), plus two
 * social/novelty patterns that speak to the same question.
 */
export function buildEnergySourcesNarrative(
  facetScores: Record<string, FacetScore>,
  strengthResults: StrengthDomainResult[],
): string | null {
  const sentences: string[] = []

  const energizing = strengthResults.filter((r) => r.energy && r.energy.score >= 60).map((r) => r.label.toLowerCase())
  const draining = strengthResults.filter((r) => r.energy && r.energy.score < 40).map((r) => r.label.toLowerCase())
  if (energizing.length > 0) {
    sentences.push(`${joinList(energizing)} came back as genuinely energizing to you, not just something you're capable of.`)
  }
  if (draining.length > 0) {
    sentences.push(`${joinList(draining)} reads as draining regardless of how capable you are at it — worth weighing separately from raw ability.`)
  }

  const sociability = facetScores.sociability
  const solitude = facetScores.work_solitude_social
  if (sociability && solitude) {
    if (sociability.score >= 60 && solitude.score <= 40) {
      sentences.push('Sociability scored high, and your lean on the environment tension runs toward social contact over solitude — day-to-day social density is more likely to be fuel for you than friction.')
    } else if (sociability.score < 40 && solitude.score >= 60) {
      sentences.push('Sociability scored low, and your lean on the environment tension runs toward solitude over social contact — a role that surrounds you with people all day is more likely to cost you energy than supply it.')
    }
  }

  const stimulation = facetScores.stimulation
  const novelty = facetScores.novelty_seeking
  if (stimulation && novelty && stimulation.score >= 60 && novelty.score >= 60) {
    sentences.push('Stimulation as a value and novelty seeking as a trait both scored high — routine that stays the same too long is more likely to wear on you than steady you.')
  }

  if (sentences.length === 0) return null
  return sentences.join(' ')
}

const ENVIRONMENT_FACET_IDS = [
  'work_pace', 'work_competition', 'work_collaboration', 'work_solitude_social', 'work_hierarchy',
  'work_bureaucracy', 'work_ownership', 'work_feedback_frequency', 'work_task_variety',
  'work_public_interaction', 'work_creative_freedom', 'work_predictability',
]

/**
 * ENVIRONMENT — the conditions a role would actually need to have, read as
 * the most decisively-leaning work-environment tensions (farthest from the
 * midpoint), not an arbitrary top-N. A facet that landed near the middle
 * didn't consistently pull one way and doesn't belong in a confident
 * description of "the conditions that work."
 */
export function buildEnvironmentNarrative(facetScores: Record<string, FacetScore>): string | null {
  const candidates = ENVIRONMENT_FACET_IDS
    .map((id) => facetScores[id])
    .filter((f): f is FacetScore => Boolean(f))
    .map((f) => ({ lean: leanTowardLabel(f, 65), distance: Math.abs(f.score - 50) }))
    .filter((c): c is { lean: string; distance: number } => Boolean(c.lean))
    .sort((a, b) => b.distance - a.distance)
    .slice(0, 3)

  if (candidates.length === 0) return null
  return `The conditions your answers point toward most clearly: ${joinList(candidates.map((c) => c.lean.toLowerCase()))}.`
}

/**
 * DIRECTION — where the profile actually points, not a job title assigned
 * from personality alone. Leads with the one genuinely ipsative measure in
 * this instrument (career anchors, ranked against each other rather than
 * rated in isolation), then names whichever downstream signal is actually
 * strongest — a real occupation with a high fit score, or, failing that, a
 * career STRUCTURE with strong trait convergence — and closes with
 * whatever Future Self priorities survived scarcity at both horizons.
 */
export function buildDirectionNarrative(
  anchorScores: FacetScore[],
  futureSelfStability: FutureSelfStability | null,
  topCareerFit: CareerFitResult | null,
  topUnconventionalPath: UnconventionalPathResult | null,
): string | null {
  if (anchorScores.length === 0) return null
  const sentences: string[] = []

  sentences.push(`The career anchor that came out ahead most consistently, ranked against the others rather than rated in isolation, is ${anchorScores[0].label.toLowerCase()}.`)

  if (topCareerFit && topCareerFit.fitScore >= 70) {
    sentences.push(`Of everything scored against your profile, ${topCareerFit.career.title.toLowerCase()} shows the strongest overall fit, at ${topCareerFit.fitScore}.`)
  } else if (topUnconventionalPath && topUnconventionalPath.strength !== 'Emerging') {
    sentences.push(`The strongest signal isn't a job title but a shape of work: ${topUnconventionalPath.label.toLowerCase()}, with ${topUnconventionalPath.conditionsMet} of ${topUnconventionalPath.conditionsTotal} defining traits converging.`)
  }

  if (futureSelfStability && futureSelfStability.durable.length > 0) {
    const names = futureSelfStability.durable.map((f) => f.label.toLowerCase())
    sentences.push(`Whatever role that points toward, it has to leave room for ${joinList(names)} — the only Future Self priorities that survived scarcity at both five and ten years out.`)
  }

  return sentences.join(' ')
}
