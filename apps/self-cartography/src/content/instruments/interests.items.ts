import type { Instrument, Item } from '../../engine/types'

/**
 * Interests region — RIASEC (Holland hexagon): Realistic, Investigative,
 * Artistic, Social, Enterprising, Conventional. Every item is a concrete
 * activity, never an abstract "would you enjoy an Investigative career?"
 * question — the six types are never named to the respondent (see
 * facets.ts's labels, which only ever surface in the results report).
 *
 * The instrument is built almost entirely from two-way forced choices
 * between activities drawn from two different types, covering all 15
 * pairs of the hexagon twice with different activities each round — an
 * ipsative design, so what comes out is relative preference among types,
 * not six independent "how much do you like this" ratings that could all
 * land high or all land low. A handful of three-way rank items add a
 * second, structurally different form of the same signal. Career mapping
 * (careerMatch.ts) does not yet weight these facets — see results copy.
 */

export const INTERESTS_INSTRUMENT: Instrument = {
  id: 'riasec',
  label: 'Interests',
  regionId: 'interests',
  facetIds: [
    'riasec_realistic',
    'riasec_investigative',
    'riasec_artistic',
    'riasec_social',
    'riasec_enterprising',
    'riasec_conventional',
  ],
}

const PAIR_PROMPT = 'Which would you rather actually spend an afternoon doing?'

export const INTERESTS_ITEMS: Item[] = [
  // ── round 1: all 15 hexagon pairs, first-round activities ──
  { id: 'int-p-ri-1', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Repair a mechanical system.', facetId: 'riasec_realistic' },
    optionB: { label: 'Analyze why customer behavior changed.', facetId: 'riasec_investigative' } },
  { id: 'int-p-ra-1', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Repair a mechanical system.', facetId: 'riasec_realistic' },
    optionB: { label: 'Create the visual identity for a new product.', facetId: 'riasec_artistic' } },
  { id: 'int-p-rs-1', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Repair a mechanical system.', facetId: 'riasec_realistic' },
    optionB: { label: 'Teach someone a difficult skill.', facetId: 'riasec_social' } },
  { id: 'int-p-re-1', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Repair a mechanical system.', facetId: 'riasec_realistic' },
    optionB: { label: 'Negotiate an agreement.', facetId: 'riasec_enterprising' } },
  { id: 'int-p-rc-1', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Repair a mechanical system.', facetId: 'riasec_realistic' },
    optionB: { label: 'Organize financial records.', facetId: 'riasec_conventional' } },
  { id: 'int-p-ia-1', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Analyze why customer behavior changed.', facetId: 'riasec_investigative' },
    optionB: { label: 'Create the visual identity for a new product.', facetId: 'riasec_artistic' } },
  { id: 'int-p-is-1', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Analyze why customer behavior changed.', facetId: 'riasec_investigative' },
    optionB: { label: 'Teach someone a difficult skill.', facetId: 'riasec_social' } },
  { id: 'int-p-ie-1', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Analyze why customer behavior changed.', facetId: 'riasec_investigative' },
    optionB: { label: 'Negotiate an agreement.', facetId: 'riasec_enterprising' } },
  { id: 'int-p-ic-1', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Analyze why customer behavior changed.', facetId: 'riasec_investigative' },
    optionB: { label: 'Organize financial records.', facetId: 'riasec_conventional' } },
  { id: 'int-p-as-1', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Create the visual identity for a new product.', facetId: 'riasec_artistic' },
    optionB: { label: 'Teach someone a difficult skill.', facetId: 'riasec_social' } },
  { id: 'int-p-ae-1', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Create the visual identity for a new product.', facetId: 'riasec_artistic' },
    optionB: { label: 'Negotiate an agreement.', facetId: 'riasec_enterprising' } },
  { id: 'int-p-ac-1', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Create the visual identity for a new product.', facetId: 'riasec_artistic' },
    optionB: { label: 'Organize financial records.', facetId: 'riasec_conventional' } },
  { id: 'int-p-se-1', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Teach someone a difficult skill.', facetId: 'riasec_social' },
    optionB: { label: 'Negotiate an agreement.', facetId: 'riasec_enterprising' } },
  { id: 'int-p-sc-1', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Teach someone a difficult skill.', facetId: 'riasec_social' },
    optionB: { label: 'Organize financial records.', facetId: 'riasec_conventional' } },
  { id: 'int-p-ec-1', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Negotiate an agreement.', facetId: 'riasec_enterprising' },
    optionB: { label: 'Organize financial records.', facetId: 'riasec_conventional' } },

  // ── round 2: all 15 hexagon pairs again, second-round activities ──
  { id: 'int-p-ri-2', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Build a piece of furniture from raw materials.', facetId: 'riasec_realistic' },
    optionB: { label: 'Design an experiment to test a hypothesis.', facetId: 'riasec_investigative' } },
  { id: 'int-p-ra-2', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Build a piece of furniture from raw materials.', facetId: 'riasec_realistic' },
    optionB: { label: 'Write a short story with no obligation to show anyone.', facetId: 'riasec_artistic' } },
  { id: 'int-p-rs-2', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Build a piece of furniture from raw materials.', facetId: 'riasec_realistic' },
    optionB: { label: 'Mediate a disagreement between two people.', facetId: 'riasec_social' } },
  { id: 'int-p-re-2', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Build a piece of furniture from raw materials.', facetId: 'riasec_realistic' },
    optionB: { label: 'Pitch a new idea to people who could fund it.', facetId: 'riasec_enterprising' } },
  { id: 'int-p-rc-2', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Build a piece of furniture from raw materials.', facetId: 'riasec_realistic' },
    optionB: { label: 'Build a spreadsheet that tracks a process end-to-end.', facetId: 'riasec_conventional' } },
  { id: 'int-p-ia-2', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Design an experiment to test a hypothesis.', facetId: 'riasec_investigative' },
    optionB: { label: 'Write a short story with no obligation to show anyone.', facetId: 'riasec_artistic' } },
  { id: 'int-p-is-2', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Design an experiment to test a hypothesis.', facetId: 'riasec_investigative' },
    optionB: { label: 'Mediate a disagreement between two people.', facetId: 'riasec_social' } },
  { id: 'int-p-ie-2', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Design an experiment to test a hypothesis.', facetId: 'riasec_investigative' },
    optionB: { label: 'Pitch a new idea to people who could fund it.', facetId: 'riasec_enterprising' } },
  { id: 'int-p-ic-2', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Design an experiment to test a hypothesis.', facetId: 'riasec_investigative' },
    optionB: { label: 'Build a spreadsheet that tracks a process end-to-end.', facetId: 'riasec_conventional' } },
  { id: 'int-p-as-2', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Write a short story with no obligation to show anyone.', facetId: 'riasec_artistic' },
    optionB: { label: 'Mediate a disagreement between two people.', facetId: 'riasec_social' } },
  { id: 'int-p-ae-2', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Write a short story with no obligation to show anyone.', facetId: 'riasec_artistic' },
    optionB: { label: 'Pitch a new idea to people who could fund it.', facetId: 'riasec_enterprising' } },
  { id: 'int-p-ac-2', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Write a short story with no obligation to show anyone.', facetId: 'riasec_artistic' },
    optionB: { label: 'Build a spreadsheet that tracks a process end-to-end.', facetId: 'riasec_conventional' } },
  { id: 'int-p-se-2', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Mediate a disagreement between two people.', facetId: 'riasec_social' },
    optionB: { label: 'Pitch a new idea to people who could fund it.', facetId: 'riasec_enterprising' } },
  { id: 'int-p-sc-2', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Mediate a disagreement between two people.', facetId: 'riasec_social' },
    optionB: { label: 'Build a spreadsheet that tracks a process end-to-end.', facetId: 'riasec_conventional' } },
  { id: 'int-p-ec-2', format: 'tradeoff', instrumentId: 'riasec', prompt: PAIR_PROMPT,
    optionA: { label: 'Pitch a new idea to people who could fund it.', facetId: 'riasec_enterprising' },
    optionB: { label: 'Build a spreadsheet that tracks a process end-to-end.', facetId: 'riasec_conventional' } },

  // ── three-way rank items: a structurally different form of the same signal ──
  { id: 'int-fc-1', format: 'forcedChoiceRank', instrumentId: 'riasec',
    prompt: 'Rank these three from most like something you’d choose (1) to least (3).',
    statements: [
      { id: 'int-fc-1-r', label: 'Troubleshoot a malfunctioning piece of hardware.', facetId: 'riasec_realistic' },
      { id: 'int-fc-1-i', label: 'Work through a complex logic puzzle just to see if you can solve it.', facetId: 'riasec_investigative' },
      { id: 'int-fc-1-a', label: 'Improvise a piece of music with other musicians.', facetId: 'riasec_artistic' },
    ] },
  { id: 'int-fc-2', format: 'forcedChoiceRank', instrumentId: 'riasec',
    prompt: 'Rank these three from most like something you’d choose (1) to least (3).',
    statements: [
      { id: 'int-fc-2-s', label: 'Mentor someone through a hard personal decision.', facetId: 'riasec_social' },
      { id: 'int-fc-2-e', label: 'Lead a team through a decision under time pressure.', facetId: 'riasec_enterprising' },
      { id: 'int-fc-2-c', label: 'Proofread a document for consistency and error.', facetId: 'riasec_conventional' },
    ] },
  { id: 'int-fc-3', format: 'forcedChoiceRank', instrumentId: 'riasec',
    prompt: 'Rank these three from most like something you’d choose (1) to least (3).',
    statements: [
      { id: 'int-fc-3-r', label: 'Operate heavy equipment on a job site.', facetId: 'riasec_realistic' },
      { id: 'int-fc-3-a', label: 'Redesign a room’s layout for how it feels, not just how it functions.', facetId: 'riasec_artistic' },
      { id: 'int-fc-3-e', label: 'Convince a skeptical room to back a plan.', facetId: 'riasec_enterprising' },
    ] },
  { id: 'int-fc-4', format: 'forcedChoiceRank', instrumentId: 'riasec',
    prompt: 'Rank these three from most like something you’d choose (1) to least (3).',
    statements: [
      { id: 'int-fc-4-i', label: 'Read a technical paper to understand how something actually works.', facetId: 'riasec_investigative' },
      { id: 'int-fc-4-s', label: 'Organize a gathering to bring a group of people together.', facetId: 'riasec_social' },
      { id: 'int-fc-4-c', label: 'Follow a detailed procedure exactly as written, step by step.', facetId: 'riasec_conventional' },
    ] },
]
