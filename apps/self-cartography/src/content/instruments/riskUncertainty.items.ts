import type { Instrument, Item } from '../../engine/types'
import { AGREE_5, FREQUENCY_5 } from './scales'

/**
 * Risk & Uncertainty region — risk is not one dial. Someone can bet their
 * savings on a variable-income job and still refuse to speak up in a
 * meeting; someone else will happily admit a mistake in public but would
 * never take a physically risky vacation. This region keeps six domains
 * separate rather than blending them into one "risk tolerance" score:
 * financial, career, social, physical, reputational, and uncertainty
 * tolerance (not knowing an OUTCOME, as distinct from ambiguity —
 * not knowing a STRUCTURE).
 *
 * Two more constructs the results report shows alongside these six are
 * deliberately NOT re-measured here: ambiguity_tolerance (Temperament,
 * already covers "incomplete instructions"-style situations) and
 * novelty_seeking (Temperament, already covers "new technologies"-style
 * situations). Re-asking either under a "risk" label would just be
 * redundant — see content/facets.ts.
 *
 * Every item is a concrete, realistic scenario or forced choice — never a
 * direct "how risk-tolerant are you" question.
 */

export const RISK_UNCERTAINTY_INSTRUMENT: Instrument = {
  id: 'riskUncertainty',
  label: 'Risk & Uncertainty',
  regionId: 'riskUncertainty',
  facetIds: [
    'risk_financial', 'risk_career', 'risk_social', 'risk_physical',
    'risk_reputational', 'uncertainty_tolerance',
  ],
}

export const RISK_UNCERTAINTY_ITEMS: Item[] = [
  // ── financial risk: income variance, commission compensation ──
  { id: 'risk-fin-scn-commission', format: 'scenario', instrumentId: 'riskUncertainty', facetId: 'risk_financial', evidenceStrength: 'stated-preference',
    scenario: 'Two job offers, otherwise similar.',
    choices: [
      { id: 'a', label: 'Offer A', attributes: ['A flat $70k salary, the same every year'], weight: 0 },
      { id: 'b', label: 'Offer B', attributes: ['A $50k base plus uncapped commission — realistically $40k to $120k depending on performance'], weight: 100 },
    ] },
  { id: 'risk-fin-tr-variance', format: 'tradeoff', instrumentId: 'riskUncertainty', prompt: 'Which would you actually choose?',
    optionA: { label: 'A steady paycheck that barely changes month to month, even if the ceiling is lower.', facetId: 'risk_financial', poleValue: 0 },
    optionB: { label: 'Income that swings a lot month to month — some months much more, some much less — with a higher average over the year.', facetId: 'risk_financial', poleValue: 100 } },
  { id: 'risk-fin-bh', format: 'behavioralHistory', instrumentId: 'riskUncertainty', facetId: 'risk_financial', evidenceStrength: 'behavioral',
    prompt: 'In the last five years, how often have you actually chosen variable or commission-based income over a safer guaranteed salary, when you had a real choice between them?', options: FREQUENCY_5 },
  { id: 'risk-fin-scn-savings', format: 'scenario', instrumentId: 'riskUncertainty', facetId: 'risk_financial', evidenceStrength: 'stated-preference',
    scenario: 'You have $10,000 in savings, beyond what you need for emergencies.',
    choices: [
      { id: 'a', label: 'Keep it all somewhere guaranteed not to lose value.', weight: 0 },
      { id: 'b', label: 'Split it — some safe, some with real upside and real risk.', weight: 45 },
      { id: 'c', label: 'Put a meaningful chunk into something with real upside and real risk of loss.', weight: 85 },
    ] },

  // ── career risk: startup employment, career switching, relocation ──
  { id: 'risk-car-scn-startup', format: 'scenario', instrumentId: 'riskUncertainty', facetId: 'risk_career', evidenceStrength: 'stated-preference',
    scenario: 'Two job offers, otherwise similar.',
    choices: [
      { id: 'a', label: 'Offer A', attributes: ['An established company, stable and unlikely to disappear'], weight: 0 },
      { id: 'b', label: 'Offer B', attributes: ['An early-stage startup that could grow fast — or fold within a year'], weight: 100 },
    ] },
  { id: 'risk-car-tr-switch', format: 'tradeoff', instrumentId: 'riskUncertainty', prompt: 'Which would you actually choose?',
    optionA: { label: 'Staying in a field you already know well, even if you’ve plateaued in it.', facetId: 'risk_career', poleValue: 0 },
    optionB: { label: 'Switching to a field you’d have to learn from scratch, even starting below where you are now.', facetId: 'risk_career', poleValue: 100 } },
  { id: 'risk-car-scn-relocate', format: 'scenario', instrumentId: 'riskUncertainty', facetId: 'risk_career', evidenceStrength: 'stated-preference',
    scenario: 'A good opportunity requires relocating somewhere you have no existing connections.',
    choices: [
      { id: 'a', label: 'Pass — staying where your life already is matters more.', weight: 10 },
      { id: 'b', label: 'Take it only if it’s temporary or reversible.', weight: 50 },
      { id: 'c', label: 'Take it.', weight: 90 },
    ] },
  { id: 'risk-car-bh', format: 'behavioralHistory', instrumentId: 'riskUncertainty', facetId: 'risk_career', answerMode: 'categorical', evidenceStrength: 'behavioral',
    prompt: 'In the last ten years, how many times have you actually left a stable job or field for something less certain?',
    options: [
      { id: 'none', label: 'Never', weight: 0 },
      { id: 'once', label: 'Once', weight: 40 },
      { id: 'twice', label: 'Twice', weight: 70 },
      { id: 'often', label: 'Three or more times', weight: 100 },
    ] },

  // ── social risk: saying, asking, admitting something that might land badly ──
  { id: 'risk-soc-tr-disagree', format: 'tradeoff', instrumentId: 'riskUncertainty', prompt: 'Which would you actually do?',
    optionA: { label: 'Stay quiet when you disagree with the group, to avoid friction.', facetId: 'risk_social', poleValue: 0 },
    optionB: { label: 'Voice the disagreement, even knowing it might not go over well.', facetId: 'risk_social', poleValue: 100 } },
  { id: 'risk-soc-scn-ask', format: 'scenario', instrumentId: 'riskUncertainty', facetId: 'risk_social', evidenceStrength: 'stated-preference',
    scenario: 'You want something from someone — a favor, a raise, a second date — and there’s a real chance they’ll say no in a way that’s a little embarrassing.',
    choices: [
      { id: 'a', label: 'Let it go rather than risk the awkwardness.', weight: 10 },
      { id: 'b', label: 'Find an indirect way to test the waters first.', weight: 50 },
      { id: 'c', label: 'Ask directly, and find out.', weight: 90 },
    ] },
  { id: 'risk-soc-tr-admit', format: 'tradeoff', instrumentId: 'riskUncertainty', prompt: 'Which would you actually do?',
    optionA: { label: 'Keep a mistake to yourself, if no one’s likely to notice it.', facetId: 'risk_social', poleValue: 0 },
    optionB: { label: 'Bring up your own mistake, even when staying quiet was a real option.', facetId: 'risk_social', poleValue: 100 } },
  { id: 'risk-soc-bh', format: 'behavioralHistory', instrumentId: 'riskUncertainty', facetId: 'risk_social', evidenceStrength: 'behavioral',
    prompt: 'In the past year, how often have you started an uncomfortable conversation rather than letting something go unsaid?', options: FREQUENCY_5 },

  // ── physical risk ──
  { id: 'risk-phy-tr-activity', format: 'tradeoff', instrumentId: 'riskUncertainty', prompt: 'Which would you actually choose?',
    optionA: { label: 'An activity with no real chance of physical injury.', facetId: 'risk_physical', poleValue: 0 },
    optionB: { label: 'An activity with a real, if small, chance of getting hurt — the kind serious hobbyists treat as normal.', facetId: 'risk_physical', poleValue: 100 } },
  { id: 'risk-phy-scn-travel', format: 'scenario', instrumentId: 'riskUncertainty', facetId: 'risk_physical', evidenceStrength: 'stated-preference',
    scenario: 'You’re planning a trip somewhere worth seeing, with a safety profile clearly worse than home.',
    choices: [
      { id: 'a', label: 'Pick somewhere safer instead.', weight: 10 },
      { id: 'b', label: 'Go, but plan carefully around the risk.', weight: 55 },
      { id: 'c', label: 'Go, and don’t think about it much more.', weight: 85 },
    ] },
  { id: 'risk-phy-bh', format: 'behavioralHistory', instrumentId: 'riskUncertainty', facetId: 'risk_physical', answerMode: 'categorical', evidenceStrength: 'behavioral',
    prompt: 'Which of these is closest to true of you?',
    options: [
      { id: 'avoid', label: 'I actively avoid activities with real injury risk.', weight: 0 },
      { id: 'ifneeded', label: 'I’ll accept that kind of risk if there’s a good reason, but not for its own sake.', weight: 45 },
      { id: 'seek', label: 'I’ve sought out physically risky activities for their own sake.', weight: 100 },
    ] },
  { id: 'risk-phy-tr-job', format: 'tradeoff', instrumentId: 'riskUncertainty', prompt: 'Which would you actually choose?',
    optionA: { label: 'A physically safe job, even if it’s less demanding or less interesting.', facetId: 'risk_physical', poleValue: 0 },
    optionB: { label: 'A physically demanding job with a real, if low, injury rate.', facetId: 'risk_physical', poleValue: 100 } },

  // ── reputational risk: public responsibility, high-accountability decisions ──
  { id: 'risk-rep-scn-visible', format: 'scenario', instrumentId: 'riskUncertainty', facetId: 'risk_reputational', evidenceStrength: 'stated-preference',
    scenario: 'You’re offered a role where you’d be the visible, named person accountable if something public goes wrong — even if you didn’t personally cause it.',
    choices: [
      { id: 'a', label: 'Pass — the exposure isn’t worth it.', weight: 10 },
      { id: 'b', label: 'Take it, but only with real authority to match the exposure.', weight: 55 },
      { id: 'c', label: 'Take it.', weight: 85 },
    ] },
  { id: 'risk-rep-tr-background', format: 'tradeoff', instrumentId: 'riskUncertainty', prompt: 'Which would you actually choose?',
    optionA: { label: 'Stay in the background, where your individual mistakes are unlikely to be publicly visible.', facetId: 'risk_reputational', poleValue: 0 },
    optionB: { label: 'Put your name and judgment on the line, where a wrong call would be visible to people who matter to you.', facetId: 'risk_reputational', poleValue: 100 } },
  { id: 'risk-rep-scn-accountable', format: 'scenario', instrumentId: 'riskUncertainty', facetId: 'risk_reputational', evidenceStrength: 'stated-preference',
    scenario: 'You have to make a real call on incomplete information — and if it goes badly, it’s your name on it, not a committee’s.',
    choices: [
      { id: 'a', label: 'Push to delay until there’s more certainty, even though that has its own cost.', weight: 20 },
      { id: 'b', label: 'Make the call, but document that you flagged the uncertainty.', weight: 60 },
      { id: 'c', label: 'Make the call and own it.', weight: 90 },
    ] },
  { id: 'risk-rep-bh', format: 'behavioralHistory', instrumentId: 'riskUncertainty', facetId: 'risk_reputational', evidenceStrength: 'behavioral',
    prompt: 'In your career, how often have you volunteered to be the person publicly responsible for a decision, when you could have let someone else take that role?', options: FREQUENCY_5 },

  // ── uncertainty tolerance: not knowing the OUTCOME, distinct from ambiguity ──
  { id: 'risk-unc-tr-outcome', format: 'tradeoff', instrumentId: 'riskUncertainty', prompt: 'Which would you actually choose?',
    optionA: { label: 'Knowing the outcome of a big decision well in advance, even if it’s not the outcome you wanted.', facetId: 'uncertainty_tolerance', poleValue: 0 },
    optionB: { label: 'Not knowing how a big decision will turn out for a long stretch of time, even though it might turn out great.', facetId: 'uncertainty_tolerance', poleValue: 100 } },
  { id: 'risk-unc-scn-tech', format: 'scenario', instrumentId: 'riskUncertainty', facetId: 'uncertainty_tolerance', evidenceStrength: 'stated-preference',
    scenario: 'A new tool or technology could change how you work, but it’s new enough that no one can tell you how it’ll actually turn out for you.',
    choices: [
      { id: 'a', label: 'Stick with what’s already proven to work.', weight: 5 },
      { id: 'b', label: 'Wait for others to test it first.', weight: 30 },
      { id: 'c', label: 'Adopt it early and find out.', weight: 90 },
    ] },
  { id: 'risk-unc-likert', format: 'likert5', instrumentId: 'riskUncertainty', facetId: 'uncertainty_tolerance',
    prompt: 'Not knowing how something is going to turn out is more exciting to me than it is stressful.', options: AGREE_5 },
  { id: 'risk-unc-bh', format: 'behavioralHistory', instrumentId: 'riskUncertainty', facetId: 'uncertainty_tolerance', evidenceStrength: 'behavioral',
    prompt: 'How often have you committed to something significant — a job, a relationship, a move — before you could know how it would actually turn out?', options: FREQUENCY_5 },

  // ── optional written elaboration, never required ──
  { id: 'risk-open-1', format: 'openText', instrumentId: 'riskUncertainty', optional: true,
    prompt: 'Is there a kind of risk everyone assumes you’re comfortable with, that you’re actually not? Or the reverse?' },
]
