import type { Instrument, Item, TradeoffItem } from '../../engine/types'
import { FREQUENCY_5 } from './scales'

/**
 * Work Environment region — 19 independent bipolar tensions (100 is always
 * the first-named pole in that facet's label, 0 the second — see
 * content/facets.ts). Deliberately excludes autonomy, structure, and
 * ambiguity: those are already measured as autonomy_need, structure_need,
 * and ambiguity_tolerance in the Temperament region, and re-asking the same
 * thing under a "work environment" label would just be redundant.
 *
 * Every tension leads with a concrete situational forced choice rather than
 * a "do you like X" question — see frustrationTradeoff() below.
 */

/**
 * The primary item for every tension: "Which would frustrate you more?"
 * between two concrete situations. This framing is inverted relative to an
 * ordinary tradeoff: picking a situation as MORE FRUSTRATING means the
 * respondent does NOT want what that situation embodies, so the option
 * describing the pole-0 situation is what scores pole 100 when chosen (and
 * vice versa) — the poleValue on each option is the opposite of what its
 * own text depicts. Get this backwards and every score in the region
 * inverts silently, so it's centralized here instead of hand-authored 19
 * times.
 */
function frustrationTradeoff(id: string, facetId: string, pole0Situation: string, pole100Situation: string): TradeoffItem {
  return {
    id,
    format: 'tradeoff',
    instrumentId: 'workEnvironment',
    prompt: 'Which would frustrate you more?',
    optionA: { label: pole0Situation, facetId, poleValue: 100 },
    optionB: { label: pole100Situation, facetId, poleValue: 0 },
  }
}

export const WORK_INSTRUMENT: Instrument = {
  id: 'workEnvironment',
  label: 'Work Environment',
  regionId: 'work',
  facetIds: [
    'work_pace', 'work_competition', 'work_collaboration', 'work_solitude_social',
    'work_hierarchy', 'work_bureaucracy', 'work_ownership', 'work_feedback_frequency',
    'work_task_variety', 'work_physical_activity', 'work_remote', 'work_travel',
    'work_public_interaction', 'work_creative_freedom', 'work_measurable_outcomes',
    'work_long_projects', 'work_short_feedback_loops', 'work_predictability', 'work_mission_orientation',
  ],
}

export const WORK_ITEMS: Item[] = [
  // ── 19 primary tensions, one concrete forced choice each ──
  frustrationTradeoff('wk-tr-pace', 'work_pace',
    'Being told to slow down and double-check everything, even when you’re confident and want to just move.',
    'Being handed something urgent with almost no time to prepare before you have to act.'),
  frustrationTradeoff('wk-tr-competition', 'work_competition',
    'Working somewhere your individual results are never compared to anyone else’s.',
    'Working somewhere your results are visibly ranked against your peers’.'),
  frustrationTradeoff('wk-tr-collaboration', 'work_collaboration',
    'Being handed a piece of a bigger project and left to execute your part on your own.',
    'Being expected to make every real decision jointly with other people, even on the small stuff.'),
  frustrationTradeoff('wk-tr-solitude', 'work_solitude_social',
    'Spending most of a workday with people talking, checking in, or working near you.',
    'Going most of a workday without meaningfully talking to anyone.'),
  frustrationTradeoff('wk-tr-hierarchy', 'work_hierarchy',
    'Being expected to just decide things yourself, with no one above you to defer to or check with.',
    'Needing sign-off from someone above you before you can act on your own judgment.'),
  frustrationTradeoff('wk-tr-bureaucracy', 'work_bureaucracy',
    'Being able to just make a decision and act on it, with no one to check with first.',
    'Filling out the forms and getting the approvals a decision technically requires before you can act.'),
  frustrationTradeoff('wk-tr-ownership', 'work_ownership',
    'Being one contributor among several people who all share credit and blame for the same outcome.',
    'Being the only person whose name is on an outcome, for better or worse.'),
  frustrationTradeoff('wk-tr-feedback', 'work_feedback_frequency',
    'Going months without any real sense of how you’re doing.',
    'Getting evaluated on your work almost every day.'),
  frustrationTradeoff('wk-tr-variety', 'work_task_variety',
    'Doing the same core task, day after day, for a long stretch.',
    'Switching between different kinds of work multiple times in a day.'),
  frustrationTradeoff('wk-tr-physical', 'work_physical_activity',
    'Sitting at a desk for the entire day.',
    'Being on your feet and physically active for most of the day.'),
  frustrationTradeoff('wk-tr-remote', 'work_remote',
    'Being physically present with the same people, in the same place, every day.',
    'Never being in the same room as the people you work with.'),
  frustrationTradeoff('wk-tr-travel', 'work_travel',
    'Never leaving the same city for work.',
    'Being away from home for work on a regular basis.'),
  frustrationTradeoff('wk-tr-public', 'work_public_interaction',
    'Working with the same small, known group of people, day in and day out.',
    'Dealing with a constant stream of strangers as part of the job.'),
  frustrationTradeoff('wk-tr-creative', 'work_creative_freedom',
    'Being handed a process you’re expected to follow exactly as written.',
    'Being handed a goal with no defined process, and having to invent your own way there.'),
  frustrationTradeoff('wk-tr-measurable', 'work_measurable_outcomes',
    'Doing work whose value is real, but hard to put a number on.',
    'Doing work where the outcome is a clean, countable number, and everyone can see it.'),
  frustrationTradeoff('wk-tr-longproj', 'work_long_projects',
    'Wrapping something up completely within a few days or weeks.',
    'Being nowhere near finished with something you started over a year ago.'),
  frustrationTradeoff('wk-tr-feedbackloop', 'work_short_feedback_loops',
    'Not finding out whether a decision you made actually worked for a very long time.',
    'Seeing the real outcome of a decision you made almost right away.'),
  frustrationTradeoff('wk-tr-predictability', 'work_predictability',
    'Every day looking a lot like the one before it.',
    'Not being able to predict what the day will actually involve.'),
  frustrationTradeoff('wk-tr-mission', 'work_mission_orientation',
    'Doing work you’re good at, for good pay, that isn’t in service of any larger cause.',
    'Doing work that pays less, in service of something you genuinely believe matters.'),

  // ── supplementary items: a second angle on a subset of tensions, mixing
  // direct-preference tradeoffs, scenarios, and behavioral evidence ──
  { id: 'wk-tr2-collaboration', format: 'tradeoff', instrumentId: 'workEnvironment', prompt: 'Which would you rather have?',
    optionA: { label: 'A teammate to think through decisions with in real time.', facetId: 'work_collaboration', poleValue: 100 },
    optionB: { label: 'A clearly defined lane that’s entirely yours to execute without needing to sync.', facetId: 'work_collaboration', poleValue: 0 } },

  { id: 'wk-tr2-hierarchy', format: 'tradeoff', instrumentId: 'workEnvironment', prompt: 'Which would you rather have?',
    optionA: { label: 'A manager who makes the final call, so tough decisions aren’t only yours to own.', facetId: 'work_hierarchy', poleValue: 100 },
    optionB: { label: 'No one above you whose sign-off you need before acting.', facetId: 'work_hierarchy', poleValue: 0 } },

  { id: 'wk-tr2-creative', format: 'tradeoff', instrumentId: 'workEnvironment', prompt: 'Which would you rather have?',
    optionA: { label: 'A blank page and total latitude in how you get there.', facetId: 'work_creative_freedom', poleValue: 100 },
    optionB: { label: 'A clear example of exactly what “good” looks like before you start.', facetId: 'work_creative_freedom', poleValue: 0 } },

  { id: 'wk-tr2-longproj', format: 'tradeoff', instrumentId: 'workEnvironment', prompt: 'Which would you rather have?',
    optionA: { label: 'Something to go deep on for as long as it actually takes, even years.', facetId: 'work_long_projects', poleValue: 100 },
    optionB: { label: 'Something you can finish completely on a predictable, short timeline.', facetId: 'work_long_projects', poleValue: 0 } },

  { id: 'wk-scn-pace', format: 'scenario', instrumentId: 'workEnvironment', facetId: 'work_pace', evidenceStrength: 'stated-preference',
    scenario: 'You’re two days from a deadline and realize the current approach probably needs to change. What do you actually tend to do?',
    choices: [
      { id: 'a', label: 'Change course immediately and move fast, even if it’s rougher, to still make the deadline.', weight: 90 },
      { id: 'b', label: 'Push the deadline back so it can be done right.', weight: 10 },
      { id: 'c', label: 'Work extra hours to change course and still hit the deadline.', weight: 60 },
      { id: 'd', label: 'Flag the risk to whoever’s responsible and let them decide.', weight: 40 },
    ] },

  { id: 'wk-scn-remote', format: 'scenario', instrumentId: 'workEnvironment', facetId: 'work_remote', evidenceStrength: 'stated-preference',
    scenario: 'Two otherwise similar job offers land on the same day.',
    choices: [
      { id: 'a', label: 'Offer A', attributes: ['Fully remote — work from wherever you want'], weight: 100 },
      { id: 'b', label: 'Offer B', attributes: ['In-person, same office, every day'], weight: 0 },
    ] },

  { id: 'wk-scn-mission', format: 'scenario', instrumentId: 'workEnvironment', facetId: 'work_mission_orientation', evidenceStrength: 'stated-preference',
    scenario: 'Two otherwise similar roles.',
    choices: [
      { id: 'a', label: 'Role A', attributes: ['Pays noticeably more', 'Isn’t in service of any particular cause'], weight: 0 },
      { id: 'b', label: 'Role B', attributes: ['Pays noticeably less', 'Directly serves a cause you believe in'], weight: 100 },
    ] },

  { id: 'wk-bh-solitude', format: 'behavioralHistory', instrumentId: 'workEnvironment', facetId: 'work_solitude_social', evidenceStrength: 'behavioral',
    prompt: 'In a typical week, how much of your best individual work happens when literally no one else is around or checking in?', options: FREQUENCY_5 },

  { id: 'wk-bh-feedback', format: 'behavioralHistory', instrumentId: 'workEnvironment', facetId: 'work_feedback_frequency', evidenceStrength: 'behavioral',
    prompt: 'In a typical month, how often do you proactively ask someone for feedback on your work, without being prompted?', options: FREQUENCY_5 },

  { id: 'wk-bh-travel', format: 'behavioralHistory', instrumentId: 'workEnvironment', facetId: 'work_travel', evidenceStrength: 'behavioral',
    prompt: 'In the last two years, how often have you chosen to travel for work — a trip, a conference, a client visit — when it wasn’t actually required of you?', options: FREQUENCY_5 },

  // ── optional written elaboration, never required ──
  { id: 'wk-open-1', format: 'openText', instrumentId: 'workEnvironment', optional: true,
    prompt: 'If money and prestige were both irrelevant, which part of a workday would you protect above all else?' },
]
