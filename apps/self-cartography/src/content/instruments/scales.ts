import type { LikertOption } from '../../engine/types'

/**
 * Shared, reusable scale-point sets for content authors. Existing items
 * (values.items.ts, temperament.items.ts) define their own local 5-point
 * scales and are left as-is — this file exists so the next content pass
 * doesn't have to redefine a 7-point scale from scratch, and so
 * LikertItem.tsx has a real, exact scale to be built and reasoned about
 * against, not an invented example.
 */

export const AGREE_5: LikertOption[] = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' },
]

export const AGREE_7: LikertOption[] = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Slightly disagree' },
  { value: 4, label: 'Neutral / uncertain' },
  { value: 5, label: 'Slightly agree' },
  { value: 6, label: 'Agree' },
  { value: 7, label: 'Strongly agree' },
]

export const FREQUENCY_5: LikertOption[] = [
  { value: 1, label: 'Rarely' },
  { value: 2, label: 'Occasionally' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Often' },
  { value: 5, label: 'Almost always' },
]
