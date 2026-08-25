export interface LandingDimension {
  id: string
  label: string
  description: string
  /** Percentage position within the interactive diagram's coordinate space. */
  x: number
  y: number
}

/**
 * The eight independent signals introduced on Landing — a curated,
 * public-facing framing distinct from the eleven internal journey regions
 * in content/regions.ts (e.g. "Environment" and "Direction" here roughly
 * correspond to facets of "Constraints" and "Future" there). Intentionally
 * not forced into a 1:1 mapping — the pitch taxonomy and the implementation
 * taxonomy are allowed to differ.
 */
export const LANDING_DIMENSIONS: LandingDimension[] = [
  { id: 'desire', label: 'Desire', description: 'What you actually want, versus what you’ve learned to want.', x: 18, y: 16 },
  { id: 'temperament', label: 'Temperament', description: 'Your steady patterns of thought, feeling, and behavior.', x: 50, y: 22 },
  { id: 'values', label: 'Values', description: 'What matters to you when two good things are in tension.', x: 82, y: 14 },
  { id: 'interests', label: 'Interests', description: 'The activities and subjects that hold your attention unprompted.', x: 30, y: 52 },
  { id: 'strengths', label: 'Strengths', description: 'What you do well, by your own account and by evidence.', x: 70, y: 48 },
  { id: 'work', label: 'Work', description: 'The conditions that let you do your best work.', x: 15, y: 86 },
  { id: 'environment', label: 'Environment', description: 'The setting — pace, people, structure — that tends to help you or cost you.', x: 50, y: 78 },
  { id: 'direction', label: 'Direction', description: 'The person you’re trying to become, in your own words.', x: 85, y: 88 },
]

/** Loose, sparse groupings drawn as connecting lines — suggestive, not a claimed taxonomy. */
export const DIMENSION_CONNECTIONS: [string, string][] = [
  ['desire', 'values'],
  ['values', 'direction'],
  ['temperament', 'strengths'],
  ['interests', 'work'],
  ['environment', 'direction'],
  ['environment', 'work'],
]
