import type { Instrument, Item } from '../../engine/types'
import { AGREE_5, FREQUENCY_5 } from './scales'

/**
 * Strengths region — six concrete domains, each measured on four
 * independent axes rather than one blended "talent" score:
 *
 *   EASE    — self-report: did this come unusually fast, the first times
 *             you tried it? (likert5, evidenceStrength 'self-report')
 *   ABILITY — behavioral: has your actual history shown it, i.e. have
 *             other people sought you out for it? (behavioralHistory,
 *             evidenceStrength 'behavioral', contrastsWithItemId → that
 *             domain's ease item — this is what lets validity.ts's existing
 *             self-report-vs-behavior-gap check catch someone who believes
 *             they're naturally strong at something with no evidence for it,
 *             with zero new engine code)
 *   SKILL   — self-report: how much deliberate practice/training has gone
 *             in, independent of whether it came easily or is evidenced yet
 *   ENERGY  — mostly ipsative: which of two demanding activities would
 *             leave you energized rather than drained, so someone can't
 *             just rate every domain "energizing" (plus one direct item
 *             per domain as a baseline)
 *
 * classifyStrengths() in engine/scoring/strengthsClassification.ts is what
 * turns these four independent 0–100 scores into one of five plain labels
 * per domain — nothing here decides the classification itself.
 */

const SKILL_OPTIONS = [
  { id: 'none', label: 'None — I’ve never deliberately practiced this', weight: 0 },
  { id: 'casual', label: 'Some casual practice, nothing structured', weight: 33 },
  { id: 'regular', label: 'Regular, ongoing practice', weight: 66 },
  { id: 'formal', label: 'Formal training, or years of deliberate practice', weight: 100 },
]

export const STRENGTHS_INSTRUMENT: Instrument = {
  id: 'strengths',
  label: 'Strengths',
  regionId: 'strengths',
  facetIds: [
    'strength_analytical_ease', 'strength_analytical_ability', 'strength_analytical_skill', 'strength_analytical_energy',
    'strength_mechanical_ease', 'strength_mechanical_ability', 'strength_mechanical_skill', 'strength_mechanical_energy',
    'strength_creative_ease', 'strength_creative_ability', 'strength_creative_skill', 'strength_creative_energy',
    'strength_interpersonal_ease', 'strength_interpersonal_ability', 'strength_interpersonal_skill', 'strength_interpersonal_energy',
    'strength_persuasive_ease', 'strength_persuasive_ability', 'strength_persuasive_skill', 'strength_persuasive_energy',
    'strength_organizational_ease', 'strength_organizational_ability', 'strength_organizational_skill', 'strength_organizational_energy',
  ],
}

export const STRENGTHS_ITEMS: Item[] = [
  // ── analytical ──
  { id: 'str-an-ease', format: 'likert5', instrumentId: 'strengths', facetId: 'strength_analytical_ease', evidenceStrength: 'self-report',
    prompt: 'The first few times I tried to figure out why something wasn’t working, I got to the real cause noticeably faster than the people around me.', options: AGREE_5 },
  { id: 'str-an-ability', format: 'behavioralHistory', instrumentId: 'strengths', facetId: 'strength_analytical_ability', evidenceStrength: 'behavioral',
    prompt: 'In the last two years, how often have people brought you a confusing problem specifically because they trusted you to find out what was actually going on?',
    options: FREQUENCY_5, contrastsWithItemId: 'str-an-ease' },
  { id: 'str-an-skill', format: 'behavioralHistory', instrumentId: 'strengths', facetId: 'strength_analytical_skill', answerMode: 'categorical',
    prompt: 'How much deliberate practice or training have you put into diagnosing and analyzing problems, beyond what your day-to-day required?', options: SKILL_OPTIONS },
  { id: 'str-an-nrg', format: 'likert5', instrumentId: 'strengths', facetId: 'strength_analytical_energy',
    prompt: 'A full day spent digging into why something is going wrong tends to leave me energized rather than drained.', options: AGREE_5 },

  // ── mechanical ──
  { id: 'str-me-ease', format: 'likert5', instrumentId: 'strengths', facetId: 'strength_mechanical_ease', evidenceStrength: 'self-report',
    prompt: 'The first few times I tried to fix or build something physical, I picked it up noticeably faster than the people around me.', options: AGREE_5 },
  { id: 'str-me-ability', format: 'behavioralHistory', instrumentId: 'strengths', facetId: 'strength_mechanical_ability', evidenceStrength: 'behavioral',
    prompt: 'In the last two years, how often have people asked you to fix or build something physical specifically because they trust you’re good at it?',
    options: FREQUENCY_5, contrastsWithItemId: 'str-me-ease' },
  { id: 'str-me-skill', format: 'behavioralHistory', instrumentId: 'strengths', facetId: 'strength_mechanical_skill', answerMode: 'categorical',
    prompt: 'How much deliberate practice or training have you put into hands-on mechanical or building work, beyond what your day-to-day required?', options: SKILL_OPTIONS },
  { id: 'str-me-nrg', format: 'likert5', instrumentId: 'strengths', facetId: 'strength_mechanical_energy',
    prompt: 'A full day of hands-on physical work tends to leave me energized rather than drained.', options: AGREE_5 },

  // ── creative ──
  { id: 'str-cr-ease', format: 'likert5', instrumentId: 'strengths', facetId: 'strength_creative_ease', evidenceStrength: 'self-report',
    prompt: 'The first few times I tried making something creative, I picked it up noticeably faster than most people I know.', options: AGREE_5 },
  { id: 'str-cr-ability', format: 'behavioralHistory', instrumentId: 'strengths', facetId: 'strength_creative_ability', evidenceStrength: 'behavioral',
    prompt: 'In the last two years, how often have people sought out or actually used something you made — writing, design, music, visual work — because they valued it?',
    options: FREQUENCY_5, contrastsWithItemId: 'str-cr-ease' },
  { id: 'str-cr-skill', format: 'behavioralHistory', instrumentId: 'strengths', facetId: 'strength_creative_skill', answerMode: 'categorical',
    prompt: 'How much deliberate practice or training have you put into a creative craft, beyond what your day-to-day required?', options: SKILL_OPTIONS },
  { id: 'str-cr-nrg', format: 'likert5', instrumentId: 'strengths', facetId: 'strength_creative_energy',
    prompt: 'A full day spent making something creative tends to leave me energized rather than drained.', options: AGREE_5 },

  // ── interpersonal ──
  { id: 'str-in-ease', format: 'likert5', instrumentId: 'strengths', facetId: 'strength_interpersonal_ease', evidenceStrength: 'self-report',
    prompt: 'The first few times someone came to me with something difficult, I seemed to know what to say or do noticeably faster than most people would.', options: AGREE_5 },
  { id: 'str-in-ability', format: 'behavioralHistory', instrumentId: 'strengths', facetId: 'strength_interpersonal_ability', evidenceStrength: 'behavioral',
    prompt: 'In the last two years, how often have people specifically sought you out — over other people available to them — when something difficult was going on?',
    options: FREQUENCY_5, contrastsWithItemId: 'str-in-ease' },
  { id: 'str-in-skill', format: 'behavioralHistory', instrumentId: 'strengths', facetId: 'strength_interpersonal_skill', answerMode: 'categorical',
    prompt: 'How much deliberate practice or training have you put into teaching, coaching, or counseling, beyond what your day-to-day required?', options: SKILL_OPTIONS },
  { id: 'str-in-nrg', format: 'likert5', instrumentId: 'strengths', facetId: 'strength_interpersonal_energy',
    prompt: 'A full day spent helping people work through difficult things tends to leave me energized rather than drained.', options: AGREE_5 },

  // ── persuasive ──
  { id: 'str-pe-ease', format: 'likert5', instrumentId: 'strengths', facetId: 'strength_persuasive_ease', evidenceStrength: 'self-report',
    prompt: 'The first few times I tried to bring a group around to my position, it went noticeably better than it does for most people.', options: AGREE_5 },
  { id: 'str-pe-ability', format: 'behavioralHistory', instrumentId: 'strengths', facetId: 'strength_persuasive_ability', evidenceStrength: 'behavioral',
    prompt: 'In the last two years, how often has a real decision actually gone the way you argued for, because you made the case yourself?',
    options: FREQUENCY_5, contrastsWithItemId: 'str-pe-ease' },
  { id: 'str-pe-skill', format: 'behavioralHistory', instrumentId: 'strengths', facetId: 'strength_persuasive_skill', answerMode: 'categorical',
    prompt: 'How much deliberate practice or training have you put into negotiation, sales, or public persuasion, beyond what your day-to-day required?', options: SKILL_OPTIONS },
  { id: 'str-pe-nrg', format: 'likert5', instrumentId: 'strengths', facetId: 'strength_persuasive_energy',
    prompt: 'A full day of negotiating or trying to convince people tends to leave me energized rather than drained.', options: AGREE_5 },

  // ── organizational ──
  { id: 'str-or-ease', format: 'likert5', instrumentId: 'strengths', facetId: 'strength_organizational_ease', evidenceStrength: 'self-report',
    prompt: 'The first few times I tried to bring order to a messy system, I picked it up noticeably faster than most people I know.', options: AGREE_5 },
  { id: 'str-or-ability', format: 'behavioralHistory', instrumentId: 'strengths', facetId: 'strength_organizational_ability', evidenceStrength: 'behavioral',
    prompt: 'In the last two years, how often have people handed you a disorganized process or set of records specifically because they trust you to fix it?',
    options: FREQUENCY_5, contrastsWithItemId: 'str-or-ease' },
  { id: 'str-or-skill', format: 'behavioralHistory', instrumentId: 'strengths', facetId: 'strength_organizational_skill', answerMode: 'categorical',
    prompt: 'How much deliberate practice or training have you put into building or maintaining organizational systems, beyond what your day-to-day required?', options: SKILL_OPTIONS },
  { id: 'str-or-nrg', format: 'likert5', instrumentId: 'strengths', facetId: 'strength_organizational_energy',
    prompt: 'A full day spent organizing systems or information tends to leave me energized rather than drained.', options: AGREE_5 },

  // ── energy, ipsative: 9 head-to-head pairs, each domain appearing in
  // exactly 3, so a domain can't score high on energy just because someone
  // rates everything favorably ──
  { id: 'str-en-an-me', format: 'tradeoff', instrumentId: 'strengths', prompt: 'After a full, demanding day, which would leave you more energized rather than drained?',
    optionA: { label: 'Digging into why something is going wrong until you find the real cause.', facetId: 'strength_analytical_energy' },
    optionB: { label: 'Working hands-on with tools or machines to fix or build something physical.', facetId: 'strength_mechanical_energy' } },
  { id: 'str-en-me-cr', format: 'tradeoff', instrumentId: 'strengths', prompt: 'After a full, demanding day, which would leave you more energized rather than drained?',
    optionA: { label: 'Working hands-on with tools or machines to fix or build something physical.', facetId: 'strength_mechanical_energy' },
    optionB: { label: 'Producing original creative work — writing, design, music, or visual work.', facetId: 'strength_creative_energy' } },
  { id: 'str-en-cr-in', format: 'tradeoff', instrumentId: 'strengths', prompt: 'After a full, demanding day, which would leave you more energized rather than drained?',
    optionA: { label: 'Producing original creative work — writing, design, music, or visual work.', facetId: 'strength_creative_energy' },
    optionB: { label: 'Helping someone work through something difficult.', facetId: 'strength_interpersonal_energy' } },
  { id: 'str-en-in-pe', format: 'tradeoff', instrumentId: 'strengths', prompt: 'After a full, demanding day, which would leave you more energized rather than drained?',
    optionA: { label: 'Helping someone work through something difficult.', facetId: 'strength_interpersonal_energy' },
    optionB: { label: 'Negotiating or making the case for a decision to people who could say no.', facetId: 'strength_persuasive_energy' } },
  { id: 'str-en-pe-or', format: 'tradeoff', instrumentId: 'strengths', prompt: 'After a full, demanding day, which would leave you more energized rather than drained?',
    optionA: { label: 'Negotiating or making the case for a decision to people who could say no.', facetId: 'strength_persuasive_energy' },
    optionB: { label: 'Turning a messy system or set of records into something usable.', facetId: 'strength_organizational_energy' } },
  { id: 'str-en-or-an', format: 'tradeoff', instrumentId: 'strengths', prompt: 'After a full, demanding day, which would leave you more energized rather than drained?',
    optionA: { label: 'Turning a messy system or set of records into something usable.', facetId: 'strength_organizational_energy' },
    optionB: { label: 'Digging into why something is going wrong until you find the real cause.', facetId: 'strength_analytical_energy' } },
  { id: 'str-en-an-in', format: 'tradeoff', instrumentId: 'strengths', prompt: 'After a full, demanding day, which would leave you more energized rather than drained?',
    optionA: { label: 'Digging into why something is going wrong until you find the real cause.', facetId: 'strength_analytical_energy' },
    optionB: { label: 'Helping someone work through something difficult.', facetId: 'strength_interpersonal_energy' } },
  { id: 'str-en-me-pe', format: 'tradeoff', instrumentId: 'strengths', prompt: 'After a full, demanding day, which would leave you more energized rather than drained?',
    optionA: { label: 'Working hands-on with tools or machines to fix or build something physical.', facetId: 'strength_mechanical_energy' },
    optionB: { label: 'Negotiating or making the case for a decision to people who could say no.', facetId: 'strength_persuasive_energy' } },
  { id: 'str-en-cr-or', format: 'tradeoff', instrumentId: 'strengths', prompt: 'After a full, demanding day, which would leave you more energized rather than drained?',
    optionA: { label: 'Producing original creative work — writing, design, music, or visual work.', facetId: 'strength_creative_energy' },
    optionB: { label: 'Turning a messy system or set of records into something usable.', facetId: 'strength_organizational_energy' } },

  // ── optional written elaboration, never required ──
  { id: 'str-open-1', format: 'openText', instrumentId: 'strengths', optional: true,
    prompt: 'Of everything above, which one would you keep doing even if no one paid or thanked you for it?' },
]
