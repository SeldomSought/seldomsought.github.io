import type { Instrument, Item, LikertOption } from '../../engine/types'

/**
 * Temperament region — a Big-Five-style personality slice (five domains,
 * three facets each) plus four short dedicated scales for constructs the
 * results report needs directly: autonomy need, structure need, risk
 * tolerance, ambiguity tolerance. Each facet carries at least one
 * reverse-scored item so validity.ts can check internal consistency. Items
 * are original, not drawn from any proprietary instrument.
 */

const AGREE_5: LikertOption[] = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' },
]

const FREQ_5: LikertOption[] = [
  { value: 1, label: 'Rarely' },
  { value: 2, label: 'Occasionally' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Often' },
  { value: 5, label: 'Almost always' },
]

export const TEMPERAMENT_INSTRUMENT: Instrument = {
  id: 'personalityLite',
  label: 'Personality',
  regionId: 'temperament',
  facetIds: [
    'intellectual_curiosity',
    'aesthetic_openness',
    'novelty_seeking',
    'orderliness',
    'industriousness',
    'self_discipline',
    'sociability',
    'assertiveness',
    'enthusiasm',
    'compassion',
    'trust',
    'cooperativeness',
    'anxiety',
    'emotional_volatility',
    'self_consciousness',
  ],
}

export const AUTONOMY_INSTRUMENT: Instrument = {
  id: 'autonomyNeed', label: 'Autonomy Need', regionId: 'temperament', facetIds: ['autonomy_need'],
}
export const STRUCTURE_INSTRUMENT: Instrument = {
  id: 'structureNeed', label: 'Structure Need', regionId: 'temperament', facetIds: ['structure_need'],
}
export const RISK_INSTRUMENT: Instrument = {
  id: 'riskTolerance', label: 'Risk Tolerance', regionId: 'temperament', facetIds: ['risk_tolerance'],
}
export const AMBIGUITY_INSTRUMENT: Instrument = {
  id: 'ambiguityTolerance', label: 'Ambiguity Tolerance', regionId: 'temperament', facetIds: ['ambiguity_tolerance'],
}

export const TEMPERAMENT_ITEMS: Item[] = [
  // ── intellectual_curiosity ──
  { id: 'tmp-ic-1', format: 'likert5', instrumentId: 'personalityLite', facetId: 'intellectual_curiosity',
    prompt: 'I’ll fall down a research hole on a topic with no practical use to me.', options: AGREE_5 },
  { id: 'tmp-ic-2', format: 'likert5', instrumentId: 'personalityLite', facetId: 'intellectual_curiosity',
    prompt: 'I find abstract or theoretical discussions tedious rather than interesting.', reverseScored: true, options: AGREE_5 },
  { id: 'tmp-ic-3', format: 'likert5', instrumentId: 'personalityLite', facetId: 'intellectual_curiosity',
    prompt: 'Learning something just because it’s interesting is a good use of my time.', options: AGREE_5 },

  // ── aesthetic_openness ──
  { id: 'tmp-as-1', format: 'likert5', instrumentId: 'personalityLite', facetId: 'aesthetic_openness',
    prompt: 'How something looks or sounds affects me more than most people I know.', options: AGREE_5 },
  { id: 'tmp-as-2', format: 'likert5', instrumentId: 'personalityLite', facetId: 'aesthetic_openness',
    prompt: 'I rarely notice design, composition, or craft unless it’s pointed out to me.', reverseScored: true, options: AGREE_5 },
  { id: 'tmp-as-3', format: 'likert5', instrumentId: 'personalityLite', facetId: 'aesthetic_openness',
    prompt: 'I’m drawn to art, music, or writing that most people find inaccessible.', options: AGREE_5 },

  // ── orderliness ──
  { id: 'tmp-org-1', format: 'likert5', instrumentId: 'personalityLite', facetId: 'orderliness',
    prompt: 'My physical and digital spaces tend to stay organized without much effort.', options: AGREE_5 },
  { id: 'tmp-org-2', format: 'likert5', instrumentId: 'personalityLite', facetId: 'orderliness',
    prompt: 'I regularly lose track of where I put things or where things stand.', reverseScored: true, options: AGREE_5 },
  { id: 'tmp-org-3', format: 'likert5', instrumentId: 'personalityLite', facetId: 'orderliness',
    prompt: 'I like having a system, even for small things.', options: AGREE_5 },

  // ── industriousness ──
  { id: 'tmp-dil-1', format: 'likert5', instrumentId: 'personalityLite', facetId: 'industriousness',
    prompt: 'I finish what I start, even once the interesting part is over.', options: AGREE_5 },
  { id: 'tmp-dil-2', format: 'likert5', instrumentId: 'personalityLite', facetId: 'industriousness',
    prompt: 'I have a string of unfinished projects I don’t plan to go back to.', reverseScored: true, options: AGREE_5 },
  { id: 'tmp-dil-3', format: 'likert5', instrumentId: 'personalityLite', facetId: 'industriousness',
    prompt: 'I hold myself to a standard whether or not anyone is checking.', options: AGREE_5 },

  // ── sociability ──
  { id: 'tmp-soc-1', format: 'likert5', instrumentId: 'personalityLite', facetId: 'sociability',
    prompt: 'Being around people for an extended stretch energizes me rather than draining me.', options: AGREE_5 },
  { id: 'tmp-soc-2', format: 'likert5', instrumentId: 'personalityLite', facetId: 'sociability',
    prompt: 'I need a lot of time alone to recover after socializing.', reverseScored: true, options: AGREE_5 },
  { id: 'tmp-soc-3', format: 'likert5', instrumentId: 'personalityLite', facetId: 'sociability',
    prompt: 'I’ll strike up conversation with strangers without much hesitation.', options: AGREE_5 },

  // ── assertiveness ──
  { id: 'tmp-asrt-1', format: 'likert5', instrumentId: 'personalityLite', facetId: 'assertiveness',
    prompt: 'In a group, I tend to end up steering the direction of things.', options: AGREE_5 },
  { id: 'tmp-asrt-2', format: 'likert5', instrumentId: 'personalityLite', facetId: 'assertiveness',
    prompt: 'I hold back my opinion rather than risk friction.', reverseScored: true, options: AGREE_5 },
  { id: 'tmp-asrt-3', format: 'likert5', instrumentId: 'personalityLite', facetId: 'assertiveness',
    prompt: 'I’ll push back directly when I disagree, rather than let it slide.', options: AGREE_5 },

  // ── novelty_seeking ──
  { id: 'tmp-nov-1', format: 'likert5', instrumentId: 'personalityLite', facetId: 'novelty_seeking',
    prompt: 'I actively seek out experiences I’ve never had before, just to have had them.', options: AGREE_5 },
  { id: 'tmp-nov-2', format: 'likert5', instrumentId: 'personalityLite', facetId: 'novelty_seeking',
    prompt: 'Once I find something that works for me, I feel little pull to try alternatives.', reverseScored: true, options: AGREE_5 },

  // ── self_discipline ──
  { id: 'tmp-sd-1', format: 'likert5', instrumentId: 'personalityLite', facetId: 'self_discipline',
    prompt: 'I can make myself do something unpleasant right now instead of putting it off.', options: AGREE_5 },
  { id: 'tmp-sd-2', format: 'likert5', instrumentId: 'personalityLite', facetId: 'self_discipline',
    prompt: 'When a task takes willpower rather than genuine interest, I tend to stall on it.', reverseScored: true, options: AGREE_5 },

  // ── enthusiasm ──
  { id: 'tmp-ent-1', format: 'likert5', instrumentId: 'personalityLite', facetId: 'enthusiasm',
    prompt: 'I bring visible energy into a room — people can tell when I’m into something.', options: AGREE_5 },
  { id: 'tmp-ent-2', format: 'likert5', instrumentId: 'personalityLite', facetId: 'enthusiasm',
    prompt: 'My mood stays fairly flat and even; I rarely show much outward excitement.', reverseScored: true, options: AGREE_5 },

  // ── compassion ──
  { id: 'tmp-cmp-1', format: 'likert5', instrumentId: 'personalityLite', facetId: 'compassion',
    prompt: 'A stranger’s visible distress affects me even when it has nothing to do with me.', options: AGREE_5 },
  { id: 'tmp-cmp-2', format: 'likert5', instrumentId: 'personalityLite', facetId: 'compassion',
    prompt: 'Other people’s problems generally don’t move me much unless they’re also mine.', reverseScored: true, options: AGREE_5 },

  // ── trust ──
  { id: 'tmp-trust-1', format: 'likert5', instrumentId: 'personalityLite', facetId: 'trust',
    prompt: 'My default assumption about someone I’ve just met is that they mean well.', options: AGREE_5 },
  { id: 'tmp-trust-2', format: 'likert5', instrumentId: 'personalityLite', facetId: 'trust',
    prompt: 'I assume people are mostly looking out for themselves until they prove otherwise.', reverseScored: true, options: AGREE_5 },

  // ── cooperativeness ──
  { id: 'tmp-coop-1', format: 'likert5', instrumentId: 'personalityLite', facetId: 'cooperativeness',
    prompt: 'In a disagreement, I’ll give ground to keep things amicable, even when I think I’m right.', options: AGREE_5 },
  { id: 'tmp-coop-2', format: 'likert5', instrumentId: 'personalityLite', facetId: 'cooperativeness',
    prompt: 'Once I’m sure I’m right, I keep pressing my case rather than smooth things over.', reverseScored: true, options: AGREE_5 },

  // ── anxiety ──
  { id: 'tmp-anx-1', format: 'likert5', instrumentId: 'personalityLite', facetId: 'anxiety',
    prompt: 'I find myself worrying about things that probably won’t happen.', options: AGREE_5 },
  { id: 'tmp-anx-2', format: 'likert5', instrumentId: 'personalityLite', facetId: 'anxiety',
    prompt: 'Even ahead of something genuinely stressful, I generally feel calm rather than on edge.', reverseScored: true, options: AGREE_5 },

  // ── emotional_volatility ──
  { id: 'tmp-vol-1', format: 'likert5', instrumentId: 'personalityLite', facetId: 'emotional_volatility',
    prompt: 'My mood can swing sharply within the same day depending on what happens.', options: AGREE_5 },
  { id: 'tmp-vol-2', format: 'likert5', instrumentId: 'personalityLite', facetId: 'emotional_volatility',
    prompt: 'My mood stays fairly steady regardless of what’s going on around me.', reverseScored: true, options: AGREE_5 },

  // ── self_consciousness ──
  { id: 'tmp-sc-1', format: 'likert5', instrumentId: 'personalityLite', facetId: 'self_consciousness',
    prompt: 'I replay how I came across in a conversation long after it’s over.', options: AGREE_5 },
  { id: 'tmp-sc-2', format: 'likert5', instrumentId: 'personalityLite', facetId: 'self_consciousness',
    prompt: 'I rarely spend much time wondering what other people thought of how I acted.', reverseScored: true, options: AGREE_5 },

  // ── autonomy_need ──
  { id: 'tmp-aut-1', format: 'likert5', instrumentId: 'autonomyNeed', facetId: 'autonomy_need',
    prompt: 'Being told exactly how to do something, even something I’m good at, wears on me.', options: AGREE_5 },
  { id: 'tmp-aut-2', format: 'likert5', instrumentId: 'autonomyNeed', facetId: 'autonomy_need',
    prompt: 'I work well within someone else’s process, as long as the goal is clear.', reverseScored: true, options: AGREE_5 },
  { id: 'tmp-aut-3', format: 'likert5', instrumentId: 'autonomyNeed', facetId: 'autonomy_need',
    prompt: 'I’d take a harder path I chose over an easier one someone assigned to me.', options: AGREE_5 },
  { id: 'tmp-aut-4', format: 'likert5', instrumentId: 'autonomyNeed', facetId: 'autonomy_need',
    prompt: 'Close oversight of my work — even well-intentioned — makes me perform worse, not better.', options: AGREE_5 },

  // ── structure_need ──
  { id: 'tmp-str-1', format: 'likert5', instrumentId: 'structureNeed', facetId: 'structure_need',
    prompt: 'I do better work when the expectations and format are spelled out clearly.', options: AGREE_5 },
  { id: 'tmp-str-2', format: 'likert5', instrumentId: 'structureNeed', facetId: 'structure_need',
    prompt: 'An open-ended “figure it out” assignment excites me more than it unsettles me.', reverseScored: true, options: AGREE_5 },
  { id: 'tmp-str-3', format: 'likertFrequency', instrumentId: 'structureNeed', facetId: 'structure_need',
    prompt: 'How often do you make a plan or checklist before starting something non-trivial?', options: FREQ_5 },
  { id: 'tmp-str-4', format: 'likert5', instrumentId: 'structureNeed', facetId: 'structure_need',
    prompt: 'Ambiguity about what’s expected of me is actively uncomfortable, not just inconvenient.', options: AGREE_5 },

  // ── risk_tolerance ──
  { id: 'tmp-risk-1', format: 'likert5', instrumentId: 'riskTolerance', facetId: 'risk_tolerance',
    prompt: 'I’d rather take a real shot at a big outcome than lock in a safe, modest one.', options: AGREE_5 },
  { id: 'tmp-risk-2', format: 'likert5', instrumentId: 'riskTolerance', facetId: 'risk_tolerance',
    prompt: 'Losing what I’ve already built bothers me more than missing a bigger opportunity.', reverseScored: true, options: AGREE_5 },
  { id: 'tmp-risk-3', format: 'likert5', instrumentId: 'riskTolerance', facetId: 'risk_tolerance',
    prompt: 'I’ve made a major decision knowing it could fail badly, because the upside justified it.', options: AGREE_5 },
  { id: 'tmp-risk-4', format: 'likert5', instrumentId: 'riskTolerance', facetId: 'risk_tolerance',
    prompt: 'I check for the downside so thoroughly that I sometimes talk myself out of good bets.', reverseScored: true, options: AGREE_5 },

  // ── ambiguity_tolerance ──
  { id: 'tmp-amb-1', format: 'likert5', instrumentId: 'ambiguityTolerance', facetId: 'ambiguity_tolerance',
    prompt: 'A problem with no clean answer interests me more than it frustrates me.', options: AGREE_5 },
  { id: 'tmp-amb-2', format: 'likert5', instrumentId: 'ambiguityTolerance', facetId: 'ambiguity_tolerance',
    prompt: 'I want a firm answer quickly, even an imperfect one, over sitting with “it depends.”', reverseScored: true, options: AGREE_5 },
  { id: 'tmp-amb-3', format: 'likert5', instrumentId: 'ambiguityTolerance', facetId: 'ambiguity_tolerance',
    prompt: 'I can hold two conflicting explanations in mind without needing to resolve them right away.', options: AGREE_5 },
  { id: 'tmp-amb-4', format: 'likert5', instrumentId: 'ambiguityTolerance', facetId: 'ambiguity_tolerance',
    prompt: 'Unclear situations make me anxious enough that I’ll force a premature decision just to end them.', reverseScored: true, options: AGREE_5 },

  // ── tradeoff: autonomy vs structure, cross-checks both dedicated scales ──
  { id: 'tmp-tr-1', format: 'tradeoff', instrumentId: 'personalityLite',
    prompt: 'Which is closer to true?',
    optionA: { label: 'I’d rather have an open mandate and figure out the path myself.', facetId: 'autonomy_need' },
    optionB: { label: 'I’d rather have a clear playbook and execute it well.', facetId: 'structure_need' },
  },

  // ── forced-choice triplet across three facets ──
  { id: 'tmp-fc-1', format: 'forcedChoiceRank', instrumentId: 'personalityLite',
    prompt: 'Rank these three from most like you (1) to least like you (3).',
    statements: [
      { id: 'tfc-a', label: 'I’m the one who notices when something’s aesthetically off.', facetId: 'aesthetic_openness' },
      { id: 'tfc-b', label: 'I’m the one who keeps the group on schedule.', facetId: 'orderliness' },
      { id: 'tfc-c', label: 'I’m the one who says the thing everyone’s avoiding.', facetId: 'assertiveness' },
    ],
  },

  // ── scenario (situational judgment, weighted choices) ──
  { id: 'tmp-scn-1', format: 'scenario', instrumentId: 'personalityLite', facetId: 'assertiveness',
    scenario: 'In a meeting, you’re fairly sure the team is about to commit to a plan with a serious flaw nobody else has raised. What do you actually tend to do?',
    choices: [
      { id: 'a', label: 'Raise it immediately, directly, in the room.', weight: 95 },
      { id: 'b', label: 'Ask a pointed question that steers people to notice it themselves.', weight: 70 },
      { id: 'c', label: 'Flag it privately to the lead afterward.', weight: 35 },
      { id: 'd', label: 'Let it go — it’s probably not my place, or it’ll work out.', weight: 5 },
    ],
  },

  // ── behavioral history (evidence, checked against the self-report industriousness items) ──
  { id: 'tmp-bh-1', format: 'behavioralHistory', instrumentId: 'personalityLite', facetId: 'industriousness',
    prompt: 'In the past month, how often did you finish a task well before its actual deadline?',
    options: FREQ_5, contrastsWithItemId: 'tmp-dil-1', evidenceStrength: 'behavioral',
  },

  // ── confidence check (used by validity.ts, not shown as its own report row) ──
  { id: 'tmp-conf-1', format: 'confidence', instrumentId: 'personalityLite', facetId: 'aspirational_gap_confidence',
    prompt: 'Looking back at how you answered the last section: how confident are you that it describes who you actually are, rather than who you’d like to be?',
    options: [
      { value: 1, label: 'Not very confident' },
      { value: 2, label: 'Somewhat unsure' },
      { value: 3, label: 'Fairly confident' },
      { value: 4, label: 'Confident' },
      { value: 5, label: 'Very confident' },
    ],
  },
]
