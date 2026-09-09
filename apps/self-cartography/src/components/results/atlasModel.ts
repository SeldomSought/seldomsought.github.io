import type { FacetScore } from '../../engine/types'

export const ATLAS_LAYERS = [
  { id: 'interests', label: 'Interests', section: 'Interests', description: 'The activities you keep choosing.', dimensions: [
    ['riasec_realistic', 'Realistic', 'Making, repairing, and working with tangible things.'],
    ['riasec_investigative', 'Investigative', 'Understanding, researching, and solving unfamiliar problems.'],
    ['riasec_artistic', 'Artistic', 'Creating, expressing, and finding an original approach.'],
    ['riasec_social', 'Social', 'Teaching, supporting, and developing other people.'],
    ['riasec_enterprising', 'Enterprising', 'Initiating, persuading, and taking responsibility for outcomes.'],
    ['riasec_conventional', 'Conventional', 'Organizing information and working with clear systems.'],
  ] },
  { id: 'personality', label: 'Temperament', section: 'Personality', description: 'Your characteristic ways of responding.', dimensions: [
    ['openness', 'Openness', 'Curiosity, aesthetic openness, and appetite for novelty.'],
    ['conscientiousness', 'Conscientiousness', 'Orderliness, industriousness, and self-discipline.'],
    ['extraversion', 'Extraversion', 'Sociability, assertiveness, and enthusiasm.'],
    ['agreeableness', 'Agreeableness', 'Compassion, trust, and cooperativeness.'],
    ['negativeEmotionality', 'Negative emotionality', 'Anxiety, emotional volatility, and self-consciousness.'],
  ] },
  { id: 'values', label: 'Values', section: 'Values', description: 'What matters when something has to give.', dimensions: [
    ['self_direction', 'Self-direction', 'Independence in thought and action.'],
    ['achievement', 'Achievement', 'Accomplishment and the pursuit of competence.'],
    ['benevolence', 'Benevolence', 'Caring for the people close to you.'],
    ['security', 'Security', 'Stability, safety, and predictability.'],
    ['stimulation', 'Stimulation', 'Novelty, challenge, and variety.'],
    ['universalism', 'Universalism', 'Concern for people and the world beyond your immediate circle.'],
    ['power', 'Power', 'Influence over resources and decisions.'],
    ['conformity', 'Conformity', 'Respecting shared rules and expectations.'],
  ] },
] as const

export type AtlasLayer = typeof ATLAS_LAYERS[number]
export interface AtlasDimension { id: string; label: string; description: string; facet: FacetScore | null }

/** Missing evidence stays missing. Never impute a neutral score to complete a shape. */
export function atlasDimensions(layer: AtlasLayer, scores: Record<string, FacetScore>): AtlasDimension[] {
  return layer.dimensions.map(([id, label, description]) => ({
    id, label, description,
    facet: scores[id] && scores[id].evidenceCount > 0 && Number.isFinite(scores[id].score) ? scores[id] : null,
  }))
}

export const REPORT_VIEWS = [
  { id: 'overview', label: 'Your atlas', sections: ['Portrait', 'Core Drivers', 'Synthesis', 'Tensions'] },
  { id: 'makeup', label: 'Inner landscape', sections: ['Desire', 'Personality', 'Values', 'Interests', 'Career Anchors', 'Risk & Uncertainty', 'Future Self', 'Aspiration'] },
  { id: 'energy', label: 'Energy & environment', sections: ['Strength Map', 'Strengths', 'Energy Map', 'Autonomy · Structure · Risk · Ambiguity', 'Work Environment', 'Environment Specification'] },
  { id: 'directions', label: 'Possible directions', sections: ['Career Fit', 'Career Explorer', 'Unconventional Paths', 'Career Experiments', 'Likely Poor Fits'] },
  { id: 'evidence', label: 'Evidence & reflection', sections: ['Retesting', 'Contradictions', 'Response Quality', 'Construct Confidence', 'Reflection', "What's Next"] },
] as const
export type ReportView = typeof REPORT_VIEWS[number]['id'] | 'all'
export function sectionView(eyebrow: string): ReportView {
  return REPORT_VIEWS.find((v) => (v.sections as readonly string[]).includes(eyebrow))?.id ?? 'evidence'
}
export function sectionSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '')
}
