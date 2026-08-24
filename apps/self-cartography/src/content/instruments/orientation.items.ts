import type { Instrument, Item } from '../../engine/types'

/**
 * Orientation carries no scored instrument — it's framing, consent, and two
 * optional written reflections. Nothing here is scored; both prompts are
 * simply held and shown back to the respondent in Synthesis, verbatim, as
 * "in your own words" evidence alongside the scored profile.
 */

export const ORIENTATION_INSTRUMENT: Instrument = {
  id: 'orientationReflection',
  label: 'Orientation',
  regionId: 'orientation',
  facetIds: [],
}

export const ORIENTATION_ITEMS: Item[] = [
  {
    id: 'ori-open-1', format: 'openText', instrumentId: 'orientationReflection',
    prompt: 'What brought you here today — what are you hoping to understand better?',
    optional: true,
  },
  {
    id: 'ori-evi-1', format: 'evidencePrompt', instrumentId: 'orientationReflection',
    prompt: 'If this turned out to be accurate, what’s one true thing you’d want it to tell you?',
    optional: true,
  },
]
