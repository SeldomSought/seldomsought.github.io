import type { Instrument, Item, RankingOption } from '../../engine/types'

/**
 * Future Self region — the purpose is discovering desired life
 * architecture, not a job title. Fifteen concrete elements of an imagined
 * life, tested at two horizons (five years and ten years out) under real
 * scarcity: "you may preserve only four." What survives both horizons is
 * what a career actually needs to be built around; what only survives one
 * is a shorter-lived priority, not a permanent fixture — see
 * engine/scoring/futureSelfStability.ts, which reads the two cascades
 * directly to tell them apart. A handful of concrete two-way tradeoffs add
 * a second, independent read on the tensions people trade off most in
 * practice (wealth vs. freedom, ownership vs. travel, and so on).
 */

const STATEMENTS: Record<string, string> = {
  future_where_live: 'Living somewhere I actively chose for how it fits me — not just where the job or the money happened to put me.',
  future_ownership: 'Owning something real and lasting — property, a business, a body of work — not just earning a paycheck against it.',
  future_schedule: 'Setting my own days, largely on my own terms, rather than answering to someone else’s calendar.',
  future_wealth: 'Having enough real financial cushion that money stops being something I have to think about day to day.',
  future_community: 'Being known and rooted in one place, among people who’d notice if I disappeared.',
  future_family: 'Having built the family life I actually want, whatever shape that takes, and having protected time for it.',
  future_prestige: 'Being visibly respected and recognized for what I’ve done, by people whose opinion matters to me.',
  future_creative_output: 'Having made something — written, built, designed — that’s mine and that outlasts the job that paid for it.',
  future_physical_activity: 'Being physically capable and active, not just healthy enough to get by.',
  future_social_density: 'Having a full, busy social world — a lot of people in my life.',
  future_travel: 'Having seen and lived in more of the world than most people around me.',
  future_leadership: 'Being the person other people look to and depend on for direction.',
  future_freedom: 'Being able to walk away from any given commitment without it wrecking my life.',
  future_responsibility: 'Carrying real weight — people, decisions, consequences — that others are counting on me for.',
  future_expertise: 'Being deeply expert at something specific, known for that one thing.',
}

/** id deliberately equals facetId — the horizon-stability analysis reads
 *  the cascade's final ranked array directly as a list of facet ids. */
const OPTIONS: RankingOption[] = Object.keys(STATEMENTS).map((facetId) => ({
  id: facetId, label: STATEMENTS[facetId], weight: 1, facetId,
}))

export const FUTURE_SELF_INSTRUMENT: Instrument = {
  id: 'futureSelf',
  label: 'Future Self',
  regionId: 'future',
  facetIds: Object.keys(STATEMENTS),
}

export const FUTURE_SELF_ITEMS: Item[] = [
  // ── the two horizon cascades: the primary measurement ──
  {
    id: 'fut-cascade-5', format: 'ranking', instrumentId: 'futureSelf', facetId: 'future_where_live',
    prompt: 'Imagine your life five years from now — not your job title, your actual day-to-day life. Of everything below, you may preserve only four.',
    options: OPTIONS,
    selectCascade: [4],
  },
  {
    id: 'fut-cascade-10', format: 'ranking', instrumentId: 'futureSelf', facetId: 'future_where_live',
    prompt: 'Now imagine ten years from now. Priorities can shift with distance — of everything below, which four would you preserve at this range?',
    options: OPTIONS,
    selectCascade: [4],
  },

  // ── concrete tradeoffs: a second, independent read on the tensions
  // people actually trade off in practice ──
  { id: 'fut-tr-wealth-freedom', format: 'tradeoff', instrumentId: 'futureSelf',
    prompt: 'Picture both, ten years out. Which would you actually choose?',
    optionA: { label: 'Financially secure, but locked into obligations you can’t easily walk away from.', facetId: 'future_wealth' },
    optionB: { label: 'Able to walk away from anything at any time, even if it means having less financial cushion.', facetId: 'future_freedom' } },

  { id: 'fut-tr-ownership-travel', format: 'tradeoff', instrumentId: 'futureSelf',
    prompt: 'Picture both, ten years out. Which would you actually choose?',
    optionA: { label: 'Rooted in one place you own and have built up over years.', facetId: 'future_ownership' },
    optionB: { label: 'Unattached enough to have lived in and seen far more of the world.', facetId: 'future_travel' } },

  { id: 'fut-tr-family-prestige', format: 'tradeoff', instrumentId: 'futureSelf',
    prompt: 'Picture both, ten years out. Which would you actually choose?',
    optionA: { label: 'A rich, protected family life that mostly happens outside anyone else’s view.', facetId: 'future_family' },
    optionB: { label: 'Visible recognition for your work, even if it costs time you’d otherwise spend at home.', facetId: 'future_prestige' } },

  { id: 'fut-tr-leadership-expertise', format: 'tradeoff', instrumentId: 'futureSelf',
    prompt: 'Picture both, ten years out. Which would you actually choose?',
    optionA: { label: 'The person others look to for direction, even in areas outside your deepest skill.', facetId: 'future_leadership' },
    optionB: { label: 'Genuinely, deeply expert at one specific thing, even if you never manage anyone.', facetId: 'future_expertise' } },

  { id: 'fut-tr-community-social', format: 'tradeoff', instrumentId: 'futureSelf',
    prompt: 'Picture both, ten years out. Which would you actually choose?',
    optionA: { label: 'Deeply known in one place, by a smaller number of people who’ve known you for years.', facetId: 'future_community' },
    optionB: { label: 'A large, active social world, even if it’s spread thin across a lot of people.', facetId: 'future_social_density' } },

  { id: 'fut-tr-responsibility-schedule', format: 'tradeoff', instrumentId: 'futureSelf',
    prompt: 'Picture both, ten years out. Which would you actually choose?',
    optionA: { label: 'Carrying real weight — people and decisions depending on you.', facetId: 'future_responsibility' },
    optionB: { label: 'Setting your own days, mostly free of anyone else’s demands on your time.', facetId: 'future_schedule' } },

  { id: 'fut-tr-live-wealth', format: 'tradeoff', instrumentId: 'futureSelf',
    prompt: 'Picture both, ten years out. Which would you actually choose?',
    optionA: { label: 'Living somewhere that actually fits you, even if it caps your income potential.', facetId: 'future_where_live' },
    optionB: { label: 'Living wherever the biggest financial opportunity happens to be.', facetId: 'future_wealth' } },

  { id: 'fut-tr-physical-creative', format: 'tradeoff', instrumentId: 'futureSelf',
    prompt: 'Picture both, ten years out. Which would you actually choose?',
    optionA: { label: 'Physically strong and active, as a real, protected part of your life.', facetId: 'future_physical_activity' },
    optionB: { label: 'Having made something lasting — even if it meant years spent sitting still to build it.', facetId: 'future_creative_output' } },

  // ── optional written elaboration, never required ──
  { id: 'fut-open-1', format: 'openText', instrumentId: 'futureSelf', optional: true,
    prompt: 'Describe an ordinary Tuesday in the life you’re picturing ten years from now — not the highlight reel, just the day.' },
]
