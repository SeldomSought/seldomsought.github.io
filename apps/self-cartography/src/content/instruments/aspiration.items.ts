import type { Instrument, Item } from '../../engine/types'
import { AGREE_7 } from './scales'

/**
 * Aspiration region — the aspirational-self layer. Six statements,
 * deliberately few, each asked twice: how much it describes you now, and
 * how much you'd like it to. The gap between those two numbers is itself
 * the finding — see engine/scoring/aspirationalGaps.ts, which turns
 * {current, desired} pairs into demonstrated / desired / developmental
 * readouts, never blending "desired" into the facet's own score.
 *
 * Kept to six items on purpose: this format effectively costs two answers
 * per statement, so a large item bank here would meaningfully lengthen
 * the assessment for a technique meant to be used sparingly. Each
 * statement is chosen as a close proxy for a construct already measured
 * elsewhere (see relatedFacetId) — that pairing isn't scored, but it does
 * give the results copy something concrete to compare against.
 */

export const ASPIRATION_INSTRUMENT: Instrument = {
  id: 'aspiration',
  label: 'Aspiration',
  regionId: 'aspiration',
  facetIds: [
    'aspire_responsibility', 'aspire_creative_expression', 'aspire_leadership',
    'aspire_assertive_voice', 'aspire_expertise', 'aspire_financial_risk',
  ],
}

export const ASPIRATION_ITEMS: Item[] = [
  { id: 'asp-responsibility', format: 'aspirationalPair', instrumentId: 'aspiration', facetId: 'aspire_responsibility',
    relatedFacetId: 'risk_reputational', evidenceStrength: 'self-report',
    prompt: 'I am comfortable taking responsibility for uncertain outcomes.', options: AGREE_7 },

  { id: 'asp-creative', format: 'aspirationalPair', instrumentId: 'aspiration', facetId: 'aspire_creative_expression',
    relatedFacetId: 'strength_creative_ease', evidenceStrength: 'self-report',
    prompt: 'I create things — writing, art, music, projects — just because I want to, not because anyone asked.', options: AGREE_7 },

  { id: 'asp-leadership', format: 'aspirationalPair', instrumentId: 'aspiration', facetId: 'aspire_leadership',
    relatedFacetId: 'anchor_general_management', evidenceStrength: 'self-report',
    prompt: 'I’m the person others look to for direction when things get uncertain.', options: AGREE_7 },

  { id: 'asp-assertive', format: 'aspirationalPair', instrumentId: 'aspiration', facetId: 'aspire_assertive_voice',
    relatedFacetId: 'assertiveness', evidenceStrength: 'self-report',
    prompt: 'I speak up when I disagree with people whose opinion matters to me.', options: AGREE_7 },

  { id: 'asp-expertise', format: 'aspirationalPair', instrumentId: 'aspiration', facetId: 'aspire_expertise',
    relatedFacetId: 'anchor_technical_mastery', evidenceStrength: 'self-report',
    prompt: 'I’ve built deep, specific expertise that few people around me can match.', options: AGREE_7 },

  { id: 'asp-financial-risk', format: 'aspirationalPair', instrumentId: 'aspiration', facetId: 'aspire_financial_risk',
    relatedFacetId: 'risk_financial', evidenceStrength: 'self-report',
    prompt: 'I take real financial risks in pursuit of a bigger payoff.', options: AGREE_7 },
]
