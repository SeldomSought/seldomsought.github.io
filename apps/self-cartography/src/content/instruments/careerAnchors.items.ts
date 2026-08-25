import type { Instrument, Item } from '../../engine/types'
import { FREQUENCY_5 } from './scales'

/**
 * Career Anchors region — Schein's eight durable career priorities:
 * technical mastery, general management, autonomy, security,
 * entrepreneurship, service/mission, challenge, lifestyle integration.
 *
 * Deliberately ipsative throughout: every scored item is a ranking or a
 * forced choice among anchors, never a "how important is X to you" rating
 * in isolation — rating each one alone is exactly what lets everyone score
 * every anchor "very important," which defeats the point of an anchor
 * model (the whole idea is what someone would NOT give up, which only
 * shows up under a real tradeoff). The eight statements below are reused
 * across every item so the same claim keeps getting tested in different
 * company, not restated eight different ways.
 *
 * classifyStrengths-style "don't just label people" applies here too: the
 * results report shows all eight as ranked relative-priority scores, never
 * a single "you are a Technical Mastery person" verdict.
 */

const STATEMENTS: Record<string, string> = {
  anchor_technical_mastery: 'Being the most technically skilled person in the room matters more to me than being the one in charge of it.',
  anchor_general_management: 'I’d rather be responsible for the whole operation than be the top expert in one narrow piece of it.',
  anchor_autonomy: 'I need to set my own methods and schedule far more than most people seem to.',
  anchor_security: 'A stable, predictable position matters more to me than a shot at something bigger.',
  anchor_entrepreneurship: 'I’d rather build something of my own from nothing than take a strong role inside something already built.',
  anchor_service_mission: 'The work has to be in service of something I believe matters, or it doesn’t feel worth doing.',
  anchor_challenge: 'I need the work itself to be hard, or I lose interest no matter what else is good about it.',
  anchor_lifestyle_integration: 'How well the work fits around the rest of my life matters more to me than how far it could take me.',
}

function statement(id: string, facetId: string) {
  return { id, label: STATEMENTS[facetId], facetId }
}

export const CAREER_ANCHORS_INSTRUMENT: Instrument = {
  id: 'careerAnchors',
  label: 'Career Anchors',
  regionId: 'careerAnchors',
  facetIds: Object.keys(STATEMENTS),
}

export const CAREER_ANCHORS_ITEMS: Item[] = [
  // ── the whole set at once: a single full ranking forces relative order
  // across all eight in one task ──
  {
    id: 'anc-rank-all', format: 'ranking', instrumentId: 'careerAnchors', facetId: 'anchor_technical_mastery',
    prompt: 'Rank these eight from most essential to you (1) to least essential (8).',
    options: Object.keys(STATEMENTS).map((facetId) => ({ id: facetId, label: STATEMENTS[facetId], weight: 1, facetId })),
  },

  // ── six balanced quads: each of the eight anchors appears in exactly
  // three of these, always ranked against three different anchors each
  // time, so no anchor's score depends on a single comparison ──
  { id: 'anc-quad-1', format: 'forcedChoiceRank', instrumentId: 'careerAnchors',
    prompt: 'Rank these four from most true of you (1) to least true (4).',
    statements: [
      statement('q1-tm', 'anchor_technical_mastery'), statement('q1-gm', 'anchor_general_management'),
      statement('q1-au', 'anchor_autonomy'), statement('q1-se', 'anchor_security'),
    ] },
  { id: 'anc-quad-2', format: 'forcedChoiceRank', instrumentId: 'careerAnchors',
    prompt: 'Rank these four from most true of you (1) to least true (4).',
    statements: [
      statement('q2-en', 'anchor_entrepreneurship'), statement('q2-sm', 'anchor_service_mission'),
      statement('q2-ch', 'anchor_challenge'), statement('q2-li', 'anchor_lifestyle_integration'),
    ] },
  { id: 'anc-quad-3', format: 'forcedChoiceRank', instrumentId: 'careerAnchors',
    prompt: 'Rank these four from most true of you (1) to least true (4).',
    statements: [
      statement('q3-tm', 'anchor_technical_mastery'), statement('q3-en', 'anchor_entrepreneurship'),
      statement('q3-se', 'anchor_security'), statement('q3-li', 'anchor_lifestyle_integration'),
    ] },
  { id: 'anc-quad-4', format: 'forcedChoiceRank', instrumentId: 'careerAnchors',
    prompt: 'Rank these four from most true of you (1) to least true (4).',
    statements: [
      statement('q4-gm', 'anchor_general_management'), statement('q4-sm', 'anchor_service_mission'),
      statement('q4-au', 'anchor_autonomy'), statement('q4-ch', 'anchor_challenge'),
    ] },
  { id: 'anc-quad-5', format: 'forcedChoiceRank', instrumentId: 'careerAnchors',
    prompt: 'Rank these four from most true of you (1) to least true (4).',
    statements: [
      statement('q5-tm', 'anchor_technical_mastery'), statement('q5-sm', 'anchor_service_mission'),
      statement('q5-ch', 'anchor_challenge'), statement('q5-se', 'anchor_security'),
    ] },
  { id: 'anc-quad-6', format: 'forcedChoiceRank', instrumentId: 'careerAnchors',
    prompt: 'Rank these four from most true of you (1) to least true (4).',
    statements: [
      statement('q6-gm', 'anchor_general_management'), statement('q6-en', 'anchor_entrepreneurship'),
      statement('q6-au', 'anchor_autonomy'), statement('q6-li', 'anchor_lifestyle_integration'),
    ] },

  // ── classic Schein "distinguishing" tradeoffs: the anchor pairs people
  // most often mix up in practice, tested with a concrete scenario each ──
  { id: 'anc-tr-tm-gm', format: 'tradeoff', instrumentId: 'careerAnchors',
    prompt: 'You’re offered a promotion into management. It would roughly double your influence and pay, but you’d stop doing the hands-on technical work you’re best at. Which is closer to how you’d actually feel?',
    optionA: { label: 'Relief — finally out of the weeds and into a role that shapes the whole operation.', facetId: 'anchor_general_management' },
    optionB: { label: 'Loss — you’d miss being the one who actually does the work, no matter the title or pay.', facetId: 'anchor_technical_mastery' } },

  { id: 'anc-tr-au-en', format: 'tradeoff', instrumentId: 'careerAnchors',
    prompt: 'Which is closer to true?',
    optionA: { label: 'I want to set my own hours and methods — I don’t need to own the thing to feel free.', facetId: 'anchor_autonomy' },
    optionB: { label: 'I want to build and own something of my own — the freedom matters less than what I’m building.', facetId: 'anchor_entrepreneurship' } },

  { id: 'anc-tr-se-li', format: 'tradeoff', instrumentId: 'careerAnchors',
    prompt: 'Which is closer to true?',
    optionA: { label: 'A financially unstable role that fit perfectly around the rest of my life would bother me less than a stable one that didn’t.', facetId: 'anchor_lifestyle_integration' },
    optionB: { label: 'A role that didn’t fit my life well would bother me less than one that felt financially shaky.', facetId: 'anchor_security' } },

  { id: 'anc-tr-ch-sm', format: 'tradeoff', instrumentId: 'careerAnchors',
    prompt: 'Which is closer to true?',
    optionA: { label: 'I need the problem itself to be hard — the cause behind it matters less to me.', facetId: 'anchor_challenge' },
    optionB: { label: 'I need to believe in what the work is for — how hard it is matters less to me.', facetId: 'anchor_service_mission' } },

  // ── behavioral evidence for two anchors that show up cleanly in history ──
  { id: 'anc-bh-entrepreneurship', format: 'behavioralHistory', instrumentId: 'careerAnchors', facetId: 'anchor_entrepreneurship', evidenceStrength: 'behavioral',
    prompt: 'In the last five years, how often have you started something of your own — a project, a side business, an initiative — without anyone assigning it to you?', options: FREQUENCY_5 },

  { id: 'anc-bh-security', format: 'behavioralHistory', instrumentId: 'careerAnchors', facetId: 'anchor_security', evidenceStrength: 'behavioral',
    prompt: 'When you’ve had a real choice between a safer option and a riskier one with more upside, how often have you actually picked the safer one?', options: FREQUENCY_5 },

  // ── optional written elaboration, never required ──
  { id: 'anc-open-1', format: 'openText', instrumentId: 'careerAnchors', optional: true,
    prompt: 'Of the eight priorities above, which one would you protect even if it cost you at every one of the others?' },
]
