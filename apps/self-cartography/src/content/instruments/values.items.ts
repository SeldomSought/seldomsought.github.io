import type { Instrument, Item, LikertOption } from '../../engine/types'

/**
 * Values region — a Schwartz-inspired subset of 8 basic values. Not the
 * full circumplex, and not claimed to be a validated instrument — an
 * evidence-informed approximation, scored transparently (see engine/scoring).
 *
 * Deliberately not just "rate how important each value is" — nothing here
 * lets a respondent mark every value as important, because nothing about
 * that is falsifiable. Three kinds of evidence are collected, each tagged
 * via evidenceStrength, and their disagreement is itself reported (see
 * engine/scoring/valuesEvidence.ts):
 *   'self-report'       — professed: what they say when asked directly.
 *   'stated-preference'  — revealed: what emerges under a forced tradeoff.
 *   'behavioral'          — demonstrated: what their actual history shows.
 */

const AGREE_5: LikertOption[] = [
  { value: 1, label: 'Not like me' },
  { value: 2, label: 'A little like me' },
  { value: 3, label: 'Somewhat like me' },
  { value: 4, label: 'Like me' },
  { value: 5, label: 'Very much like me' },
]

const FREQ_5: LikertOption[] = [
  { value: 1, label: 'Rarely' },
  { value: 2, label: 'Occasionally' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Often' },
  { value: 5, label: 'Almost always' },
]

export const VALUES_INSTRUMENT: Instrument = {
  id: 'schwartzValues',
  label: 'Values',
  regionId: 'values',
  facetIds: [
    'self_direction',
    'achievement',
    'benevolence',
    'security',
    'stimulation',
    'universalism',
    'power',
    'conformity',
  ],
}

export const VALUES_ITEMS: Item[] = [
  // ── professed: self-report ratings, one instrument among three ──
  {
    id: 'val-sd-1', format: 'likert5', instrumentId: 'schwartzValues', facetId: 'self_direction',
    prompt: 'It matters to me that I choose my own path, even if a more obvious one is available.',
    options: AGREE_5, evidenceStrength: 'self-report',
  },
  {
    id: 'val-sd-2', format: 'likert5', instrumentId: 'schwartzValues', facetId: 'self_direction',
    prompt: 'I need room to figure things out my own way, not a prescribed method.',
    options: AGREE_5, evidenceStrength: 'self-report',
  },
  {
    id: 'val-ach-1', format: 'likert5', instrumentId: 'schwartzValues', facetId: 'achievement',
    prompt: 'Being visibly good at what I do matters to me more than most people admit.',
    options: AGREE_5, evidenceStrength: 'self-report',
  },
  {
    id: 'val-ach-2', format: 'likert5', instrumentId: 'schwartzValues', facetId: 'achievement',
    prompt: 'I want my competence to be recognized, not just privately true.',
    options: AGREE_5, evidenceStrength: 'self-report',
  },
  {
    id: 'val-ben-1', format: 'likert5', instrumentId: 'schwartzValues', facetId: 'benevolence',
    prompt: 'I go out of my way for people close to me, even at real cost to myself.',
    options: AGREE_5, evidenceStrength: 'self-report',
  },
  {
    id: 'val-ben-2', format: 'likert5', instrumentId: 'schwartzValues', facetId: 'benevolence',
    prompt: 'Being useful to the people I care about is one of my core motivations.',
    options: AGREE_5, evidenceStrength: 'self-report',
  },
  {
    id: 'val-sec-1', format: 'likert5', instrumentId: 'schwartzValues', facetId: 'security',
    prompt: 'I sleep better when I know what tomorrow looks like.',
    options: AGREE_5, evidenceStrength: 'self-report',
  },
  {
    id: 'val-sec-2', format: 'likert5', instrumentId: 'schwartzValues', facetId: 'security',
    prompt: 'A stable, predictable situation is worth more to me than an exciting, uncertain one.',
    options: AGREE_5, evidenceStrength: 'self-report',
  },
  {
    id: 'val-sti-1', format: 'likert5', instrumentId: 'schwartzValues', facetId: 'stimulation',
    prompt: 'A life with no novelty or risk in it would wear on me.',
    options: AGREE_5, evidenceStrength: 'self-report',
  },
  {
    id: 'val-sti-2', format: 'likert5', instrumentId: 'schwartzValues', facetId: 'stimulation',
    prompt: 'I actively seek out situations I haven’t handled before.',
    options: AGREE_5, evidenceStrength: 'self-report',
  },
  {
    id: 'val-uni-1', format: 'likert5', instrumentId: 'schwartzValues', facetId: 'universalism',
    prompt: 'I think about the wellbeing of people I’ll never meet more than most people do.',
    options: AGREE_5, evidenceStrength: 'self-report',
  },
  {
    id: 'val-uni-2', format: 'likert5', instrumentId: 'schwartzValues', facetId: 'universalism',
    prompt: 'Fairness at a systemic level matters to me, not just fairness to people I know.',
    options: AGREE_5, evidenceStrength: 'self-report',
  },
  {
    id: 'val-pow-1', format: 'likert5', instrumentId: 'schwartzValues', facetId: 'power',
    prompt: 'I want a real say over decisions that affect me, not just a seat at the table.',
    options: AGREE_5, evidenceStrength: 'self-report',
  },
  {
    id: 'val-pow-2', format: 'likert5', instrumentId: 'schwartzValues', facetId: 'power',
    prompt: 'Having influence over outcomes is something I actively pursue, not something I just accept if it comes.',
    options: AGREE_5, evidenceStrength: 'self-report',
  },
  {
    id: 'val-con-1', format: 'likert5', instrumentId: 'schwartzValues', facetId: 'conformity',
    prompt: 'I’d rather adjust myself to a group’s expectations than make everyone adjust to me.',
    options: AGREE_5, evidenceStrength: 'self-report',
  },
  {
    id: 'val-con-2', format: 'likert5', instrumentId: 'schwartzValues', facetId: 'conformity',
    prompt: 'Breaking an established norm bothers me even when no one would notice.',
    options: AGREE_5, evidenceStrength: 'self-report',
  },

  // ── revealed: tradeoffs ──
  {
    id: 'val-tr-1', format: 'tradeoff', instrumentId: 'schwartzValues', evidenceStrength: 'stated-preference',
    prompt: 'Which is closer to true?',
    optionA: { label: 'I’d take a less impressive outcome I chose myself over a better one someone else designed for me.', facetId: 'self_direction' },
    optionB: { label: 'I’d rather follow a method that’s proven to work than insist on doing it my own way.', facetId: 'conformity' },
  },
  {
    id: 'val-tr-2', format: 'tradeoff', instrumentId: 'schwartzValues', evidenceStrength: 'stated-preference',
    prompt: 'Which is closer to true?',
    optionA: { label: 'I’d choose the exciting, unproven option over the safe, known one.', facetId: 'stimulation' },
    optionB: { label: 'I’d choose the option I can count on, even if it’s less exciting.', facetId: 'security' },
  },

  // ── revealed: ranking (single-facet, weighted statements) ──
  {
    id: 'val-rank-1', format: 'ranking', instrumentId: 'schwartzValues', facetId: 'achievement', evidenceStrength: 'stated-preference',
    prompt: 'Rank these from most to least true of you.',
    options: [
      { id: 'a', label: 'I keep a private tally of how I’m doing relative to my own past performance.', weight: 1.0 },
      { id: 'b', label: 'I want other people to know when I’ve done something well.', weight: 0.7 },
      { id: 'c', label: 'I feel restless when I’m not improving at something.', weight: 0.85 },
      { id: 'd', label: 'Winning isn’t the point for me — doing it well is.', weight: 0.6 },
    ],
  },

  // ── revealed: forced-choice ranking blocks (Thurstonian triplets, matched desirability) ──
  {
    id: 'val-fc-1', format: 'forcedChoiceRank', instrumentId: 'schwartzValues', evidenceStrength: 'stated-preference',
    prompt: 'Rank these three from most like you (1) to least like you (3).',
    statements: [
      { id: 'fc1-a', label: 'I’d rather be the one who decides how something gets done.', facetId: 'self_direction' },
      { id: 'fc1-b', label: 'I’d rather be the one everyone trusts to keep things steady.', facetId: 'security' },
      { id: 'fc1-c', label: 'I’d rather be the one who pushes the group toward something new.', facetId: 'stimulation' },
    ],
  },
  {
    id: 'val-fc-2', format: 'forcedChoiceRank', instrumentId: 'schwartzValues', evidenceStrength: 'stated-preference',
    prompt: 'Rank these three from most like you (1) to least like you (3).',
    statements: [
      { id: 'fc2-a', label: 'I’d quietly help a struggling teammate even if it slowed me down.', facetId: 'benevolence' },
      { id: 'fc2-b', label: 'I’d speak up for a principle even if it cost me the room.', facetId: 'universalism' },
      { id: 'fc2-c', label: 'I’d take the lead if I thought I could do it better.', facetId: 'power' },
    ],
  },

  // ── revealed: scarcity cascade — choose 5 of 18, eliminate 2 (down to 3), rank the 3 ──
  {
    id: 'val-cascade-1', format: 'ranking', instrumentId: 'schwartzValues', facetId: 'self_direction', evidenceStrength: 'stated-preference',
    prompt: 'Which of these actually matter to you? You can’t keep them all.',
    selectCascade: [5, 3],
    options: [
      { id: 'independence', label: 'Independence', weight: 1, facetId: 'self_direction' },
      { id: 'creativity', label: 'Creativity', weight: 1, facetId: 'self_direction' },
      { id: 'achievement', label: 'Achievement', weight: 1, facetId: 'achievement' },
      { id: 'competence', label: 'Competence', weight: 1, facetId: 'achievement' },
      { id: 'ambition', label: 'Ambition', weight: 1, facetId: 'achievement' },
      { id: 'loyalty', label: 'Loyalty', weight: 1, facetId: 'benevolence' },
      { id: 'helpfulness', label: 'Helpfulness', weight: 1, facetId: 'benevolence' },
      { id: 'belonging', label: 'Belonging', weight: 1, facetId: 'benevolence' },
      { id: 'stability', label: 'Stability', weight: 1, facetId: 'security' },
      { id: 'safety', label: 'Safety', weight: 1, facetId: 'security' },
      { id: 'excitement', label: 'Excitement', weight: 1, facetId: 'stimulation' },
      { id: 'novelty', label: 'Novelty', weight: 1, facetId: 'stimulation' },
      { id: 'fairness', label: 'Fairness', weight: 1, facetId: 'universalism' },
      { id: 'sustainability', label: 'Sustainability', weight: 1, facetId: 'universalism' },
      { id: 'influence', label: 'Influence', weight: 1, facetId: 'power' },
      { id: 'recognition', label: 'Recognition', weight: 1, facetId: 'power' },
      { id: 'tradition', label: 'Tradition', weight: 1, facetId: 'conformity' },
      { id: 'politeness', label: 'Politeness', weight: 1, facetId: 'conformity' },
    ],
  },

  // ── revealed: scenarios where values conflict ──
  {
    id: 'val-scn-income', format: 'scenario', instrumentId: 'schwartzValues', facetId: 'self_direction', evidenceStrength: 'stated-preference',
    scenario: 'Two versions of the same opportunity are on the table.',
    choices: [
      {
        id: 'a', weight: 20, label: 'Option A',
        attributes: ['Meaningfully greater income', 'Less independence — decisions run through someone else', 'A defined role in an established structure'],
      },
      {
        id: 'b', weight: 85, label: 'Option B',
        attributes: ['Lower income, at least at first', 'Real ownership over decisions and direction', 'You set the structure, not someone else'],
      },
    ],
  },
  {
    id: 'val-scn-help', format: 'scenario', instrumentId: 'schwartzValues', facetId: 'benevolence', evidenceStrength: 'stated-preference',
    scenario: 'You have one evening free before a deadline you don’t strictly have to hit tonight.',
    choices: [
      { id: 'a', label: 'You spend it polishing your own work further — it’ll look better for you specifically.', weight: 15 },
      { id: 'b', label: 'You spend it helping a specific person who’s stuck, with nothing in it for your own work.', weight: 90 },
    ],
  },

  // ── behaviorally demonstrated ──
  {
    id: 'val-bh-selfdirection', format: 'behavioralHistory', instrumentId: 'schwartzValues', facetId: 'self_direction', evidenceStrength: 'behavioral',
    prompt: 'In the last year, how many times did you choose your own approach over clear, easier-to-follow instructions, even when it was riskier?',
    options: FREQ_5,
  },
  {
    id: 'val-bh-benevolence', format: 'behavioralHistory', instrumentId: 'schwartzValues', facetId: 'benevolence', evidenceStrength: 'behavioral',
    prompt: 'In the last month, how many times did you go out of your way for someone close to you at real cost to your own time?',
    options: FREQ_5,
  },
  {
    id: 'val-bh-achievement', format: 'behavioralHistory', instrumentId: 'schwartzValues', facetId: 'achievement', evidenceStrength: 'behavioral',
    prompt: 'In the last year, how many times did you seek out explicit feedback on your performance without being asked to?',
    options: FREQ_5,
  },
]
