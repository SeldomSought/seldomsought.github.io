/**
 * ENERGY MAP — pure content. Sixteen concrete activity verbs, each mapped
 * to the one facet in this instrument that actually measures whether that
 * kind of work energizes or drains someone under sustained exposure — the
 * six strength-domain "energy" facets (see STRENGTH_DOMAINS in
 * content/facets.ts), plus work_task_variety for repetition, which none of
 * the strength domains cover. Several activities intentionally share a
 * facet: this instrument measures six domains, not sixteen independent
 * energy axes, and pretending otherwise would fabricate precision that
 * isn't there. engine/scoring/energyMap.ts is what turns this mapping into
 * the actual ENERGIZES / NEUTRAL / DRAINS classification.
 */

export interface EnergyActivityDefinition {
  id: string
  label: string
  /** The one facet this activity's energize/drain read comes from. */
  facetId: string
  /** true when a HIGH score on that facet means DRAINS rather than
   *  energizes — only work_task_variety needs this (low variety tolerance
   *  is what makes repetition sustainable, not draining). */
  invert?: boolean
}

export const ENERGY_ACTIVITIES: EnergyActivityDefinition[] = [
  { id: 'persuading', label: 'Persuading', facetId: 'strength_persuasive_energy' },
  { id: 'teaching', label: 'Teaching', facetId: 'strength_interpersonal_energy' },
  { id: 'building', label: 'Building', facetId: 'strength_mechanical_energy' },
  { id: 'analyzing', label: 'Analyzing', facetId: 'strength_analytical_energy' },
  { id: 'organizing', label: 'Organizing', facetId: 'strength_organizational_energy' },
  { id: 'competing', label: 'Competing', facetId: 'strength_persuasive_energy' },
  { id: 'supporting', label: 'Supporting', facetId: 'strength_interpersonal_energy' },
  { id: 'designing', label: 'Designing', facetId: 'strength_creative_energy' },
  { id: 'maintaining', label: 'Maintaining', facetId: 'strength_organizational_energy' },
  { id: 'leading', label: 'Leading', facetId: 'strength_persuasive_energy' },
  { id: 'negotiating', label: 'Negotiating', facetId: 'strength_persuasive_energy' },
  { id: 'researching', label: 'Researching', facetId: 'strength_analytical_energy' },
  { id: 'performing', label: 'Performing', facetId: 'strength_creative_energy' },
  { id: 'problem-solving', label: 'Problem-Solving', facetId: 'strength_analytical_energy' },
  { id: 'repetition', label: 'Repetition', facetId: 'work_task_variety', invert: true },
  { id: 'planning', label: 'Planning', facetId: 'strength_organizational_energy' },
]
