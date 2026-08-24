export interface PrivacyPoint {
  id: string
  label: string
  body: string
}

/**
 * The single source of truth for this app's privacy explanation — shown in
 * full on the landing page and, verbatim, inside PrivacyDisclosure.tsx's
 * inline reveal during the assessment itself. One place to edit, so it can
 * never say something slightly different depending on where it's read.
 */
export const PRIVACY_POINTS: PrivacyPoint[] = [
  {
    id: 'stored',
    label: 'What is stored',
    body: 'Your answers, and the profile generated from them once you finish.',
  },
  {
    id: 'where',
    label: 'Where',
    body: 'In this browser only, on this device — no account, no server, no database. That also means clearing your browser data or switching devices mid-assessment loses it for good, with no way to recover it.',
  },
  {
    id: 'leaves',
    label: 'Does it leave this device',
    body: 'No. Every answer is scored right here in your browser. Nothing about what you answered is ever sent anywhere.',
  },
  {
    id: 'analytics',
    label: 'Does analytics see your answers',
    body: 'No. Usage analytics records things like which question you’re on and how long it took — never what you actually chose or wrote.',
  },
  {
    id: 'delete',
    label: 'How to delete it',
    body: '“Start over” clears your current answers instantly. To also remove a past completed profile, clear this site’s data in your browser.',
  },
]

/** The explicit positive framing this design leans on, not just a caveat. */
export const PRIVACY_POSITIVE =
  'Storing everything locally isn’t a limitation — it means there’s no account to compromise and no database that could ever leak your answers. The only computer that has ever seen them is yours.'
