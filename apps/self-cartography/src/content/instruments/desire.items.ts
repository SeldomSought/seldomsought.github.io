import type { Instrument, Item, LikertOption } from '../../engine/types'

/**
 * Desire region — not "what career do you want," but what kind of lived
 * experience someone repeatedly wants. Twelve bipolar tensions, each
 * scored as one 0–100 facet (100 = the first-named pole, 0 = the second —
 * see content/facets.ts). Every item is written as a concrete, comparative
 * statement or scenario, never a direct "do you value X?" question — the
 * tension should be legible from the tradeoff itself, not named outright.
 */

const CREATION_CONSUMPTION_SCALE: LikertOption[] = [
  { value: 1, label: 'Almost entirely taking in' },
  { value: 2, label: 'Mostly taking in' },
  { value: 3, label: 'About even' },
  { value: 4, label: 'Mostly making' },
  { value: 5, label: 'Almost entirely making' },
]

export const DESIRE_INSTRUMENT: Instrument = {
  id: 'desireTensions',
  label: 'Desire',
  regionId: 'desire',
  facetIds: [
    'desire_freedom_certainty',
    'desire_mastery_ease',
    'desire_status_privacy',
    'desire_wealth_leisure',
    'desire_novelty_stability',
    'desire_impact_comfort',
    'desire_belonging_independence',
    'desire_creation_consumption',
    'desire_competition_harmony',
    'desire_influence_anonymity',
    'desire_adventure_predictability',
    'desire_depth_variety',
  ],
}

export const DESIRE_ITEMS: Item[] = [
  // ── 12 primary tradeoffs, one per tension ──
  {
    id: 'des-tr-freedom', format: 'tradeoff', instrumentId: 'desireTensions',
    prompt: 'Which is closer to true?',
    optionA: { label: 'I’d rather design my own week from scratch, even if some weeks are a mess.', facetId: 'desire_freedom_certainty', poleValue: 100 },
    optionB: { label: 'I’d rather know exactly what each week holds, even if I didn’t choose it.', facetId: 'desire_freedom_certainty', poleValue: 0 },
  },
  {
    id: 'des-tr-mastery', format: 'tradeoff', instrumentId: 'desireTensions',
    prompt: 'Which is closer to true?',
    optionA: { label: 'I’d rather spend a year getting excellent at one hard thing.', facetId: 'desire_mastery_ease', poleValue: 100 },
    optionB: { label: 'I’d rather spend that year doing several things I’m already good at.', facetId: 'desire_mastery_ease', poleValue: 0 },
  },
  {
    id: 'des-tr-status', format: 'tradeoff', instrumentId: 'desireTensions',
    prompt: 'Which is closer to true?',
    optionA: { label: 'I’d rather be well-known for what I do, even if it costs me some privacy.', facetId: 'desire_status_privacy', poleValue: 100 },
    optionB: { label: 'I’d rather keep my life mostly unseen, even if it costs me recognition.', facetId: 'desire_status_privacy', poleValue: 0 },
  },
  {
    id: 'des-tr-wealth', format: 'tradeoff', instrumentId: 'desireTensions',
    prompt: 'Which is closer to true?',
    optionA: { label: 'I’d take a demanding job that pays significantly more.', facetId: 'desire_wealth_leisure', poleValue: 100 },
    optionB: { label: 'I’d take a lighter job that leaves my evenings and weekends actually free.', facetId: 'desire_wealth_leisure', poleValue: 0 },
  },
  {
    id: 'des-tr-novelty', format: 'tradeoff', instrumentId: 'desireTensions',
    prompt: 'Which is closer to true?',
    optionA: { label: 'I’d rather my circumstances kept changing — new places, new problems, new people.', facetId: 'desire_novelty_stability', poleValue: 100 },
    optionB: { label: 'I’d rather my circumstances stayed mostly the same, once they were good.', facetId: 'desire_novelty_stability', poleValue: 0 },
  },
  {
    id: 'des-tr-impact', format: 'tradeoff', instrumentId: 'desireTensions',
    prompt: 'Which is closer to true?',
    optionA: { label: 'I’d take on something that might change things, even if it wears me down.', facetId: 'desire_impact_comfort', poleValue: 100 },
    optionB: { label: 'I’d rather do steady, manageable work than something that wears me down, even for a bigger outcome.', facetId: 'desire_impact_comfort', poleValue: 0 },
  },
  {
    id: 'des-tr-belonging', format: 'tradeoff', instrumentId: 'desireTensions',
    prompt: 'Which is closer to true?',
    optionA: { label: 'I’d rather be embedded in a tight group I answer to.', facetId: 'desire_belonging_independence', poleValue: 100 },
    optionB: { label: 'I’d rather operate on my own, even if it means fewer people have my back.', facetId: 'desire_belonging_independence', poleValue: 0 },
  },
  {
    id: 'des-tr-creation', format: 'tradeoff', instrumentId: 'desireTensions',
    prompt: 'Which is closer to true?',
    optionA: { label: 'On a free evening, I’m more likely to end up making something than taking something in.', facetId: 'desire_creation_consumption', poleValue: 100 },
    optionB: { label: 'On a free evening, I’m more likely to end up absorbed in something someone else made.', facetId: 'desire_creation_consumption', poleValue: 0 },
  },
  {
    id: 'des-tr-competition', format: 'tradeoff', instrumentId: 'desireTensions',
    prompt: 'Which is closer to true?',
    optionA: { label: 'I do better work when there’s a clear winner and I’m trying to be it.', facetId: 'desire_competition_harmony', poleValue: 100 },
    optionB: { label: 'I do better work when everyone’s cooperating and no one’s keeping score.', facetId: 'desire_competition_harmony', poleValue: 0 },
  },
  {
    id: 'des-tr-influence', format: 'tradeoff', instrumentId: 'desireTensions',
    prompt: 'Which is closer to true?',
    optionA: { label: 'I’d rather be the person whose decision things actually hinge on.', facetId: 'desire_influence_anonymity', poleValue: 100 },
    optionB: { label: 'I’d rather things ran well without anyone needing to point to me.', facetId: 'desire_influence_anonymity', poleValue: 0 },
  },
  {
    id: 'des-tr-adventure', format: 'tradeoff', instrumentId: 'desireTensions',
    prompt: 'Which is closer to true?',
    optionA: { label: 'Given a free month, I’d go somewhere I’ve never been with no fixed plan.', facetId: 'desire_adventure_predictability', poleValue: 100 },
    optionB: { label: 'Given a free month, I’d return somewhere familiar and know what I was getting.', facetId: 'desire_adventure_predictability', poleValue: 0 },
  },
  {
    id: 'des-tr-depth', format: 'tradeoff', instrumentId: 'desireTensions',
    prompt: 'Which is closer to true?',
    optionA: { label: 'I’d rather go deep on one or two things for years.', facetId: 'desire_depth_variety', poleValue: 100 },
    optionB: { label: 'I’d rather keep moving across many different things.', facetId: 'desire_depth_variety', poleValue: 0 },
  },

  // ── sacrifice question — wealth vs. leisure, corroborating des-tr-wealth ──
  {
    id: 'des-tr-wealth-sacrifice', format: 'tradeoff', instrumentId: 'desireTensions',
    prompt: 'Which would you actually give up the other for?',
    optionA: { label: 'I’d give up a meaningfully lighter schedule to keep the higher income.', facetId: 'desire_wealth_leisure', poleValue: 100 },
    optionB: { label: 'I’d give up a meaningfully higher income to keep the lighter schedule.', facetId: 'desire_wealth_leisure', poleValue: 0 },
  },

  // ── ranking — depth vs. variety, corroborating des-tr-depth ──
  {
    id: 'des-rank-depth', format: 'ranking', instrumentId: 'desireTensions', facetId: 'desire_depth_variety',
    prompt: 'Rank these from most to least true of you.',
    options: [
      { id: 'a', label: 'There’s a subject or skill I keep coming back to, years later.', weight: 1.0 },
      { id: 'b', label: 'I’d rather be the person people go to for one specific thing.', weight: 0.85 },
      { id: 'c', label: 'Once I’m good at something, I’d rather refine it further than move to something new.', weight: 0.75 },
      { id: 'd', label: 'I can imagine still caring about the same thing a decade from now.', weight: 0.65 },
    ],
  },

  // ── future scenarios ──
  {
    id: 'des-scn-novelty', format: 'scenario', instrumentId: 'desireTensions', facetId: 'desire_novelty_stability',
    scenario: 'Picture two versions of your life five years from now — pick whichever pulls at you more.',
    choices: [
      {
        id: 'a', weight: 90, label: 'Version A',
        attributes: [
          'A new city or role every couple of years',
          'Constantly meeting new people and situations',
          'No fixed sense of what "normal" looks like',
        ],
      },
      {
        id: 'b', weight: 10, label: 'Version B',
        attributes: [
          'The same core people and place, deepened over time',
          'A settled rhythm you’ve built and trust',
          'Few surprises, by design',
        ],
      },
    ],
  },
  {
    id: 'des-scn-influence', format: 'scenario', instrumentId: 'desireTensions', facetId: 'desire_influence_anonymity',
    scenario: 'Ten years from now, which of these would feel more like success to you?',
    choices: [
      { id: 'a', label: 'People who matter to you can name specific decisions you made that mattered.', weight: 85 },
      { id: 'b', label: 'Things around you run well, and most people involved couldn’t say exactly why.', weight: 15 },
    ],
  },

  // ── behavioral history — creation vs. consumption, corroborating des-tr-creation ──
  {
    id: 'des-bh-creation', format: 'behavioralHistory', instrumentId: 'desireTensions', facetId: 'desire_creation_consumption',
    prompt: 'In a typical week, how many hours do you spend actively making something — writing, building, cooking from scratch, art — versus taking something in?',
    evidenceStrength: 'behavioral',
    options: CREATION_CONSUMPTION_SCALE,
  },
]
