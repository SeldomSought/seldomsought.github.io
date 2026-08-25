export interface HowItWorksBlock {
  id: string
  label: string
  body: string
}

/**
 * Below-the-fold Landing content. Plain-language labels on purpose — the
 * rigor lives in the body copy, not in the heading. Order matches the six
 * things a first-time visitor was told to expect: multiple measurement
 * approaches, behavioral evidence, contradictions, career translation,
 * uncertainty, limitations.
 */
export const HOW_IT_WORKS: HowItWorksBlock[] = [
  {
    id: 'formats',
    label: 'More than one way of asking',
    body: 'You’ll answer in several different formats on purpose — ratings, forced choices, tradeoffs, rankings, and a few questions about what you’ve actually done, not just how you see yourself. Comparing those against each other is most of what makes the result useful.',
  },
  {
    id: 'behavior',
    label: 'What you’ve actually done',
    body: 'Some questions ask about recent behavior, not self-image — how often you actually did something, not how you’d describe yourself. What you say about yourself and what your behavior shows don’t always agree, and that gap is itself useful information.',
  },
  {
    id: 'contradictions',
    label: 'Checking itself',
    body: 'The assessment checks its own answers against each other in the background. Agreeing with a statement and its near-opposite, or moving faster than anyone could consider each question, gets noted — not hidden, not penalized, just reported alongside the score it affects.',
  },
  {
    id: 'careers',
    label: 'Why a career, not just a score',
    body: 'Every career suggestion traces back to specific things that were actually measured. No unexplained algorithmic matches — every fit comes with the reasons for it, including the friction points, not just a percentage.',
  },
  {
    id: 'uncertainty',
    label: 'How sure, exactly',
    body: 'Every score is reported with a confidence level, not a false decimal of certainty. A dimension answered by four questions is reported differently than one answered by twenty — and neither is ever shown as a population percentile it isn’t.',
  },
  {
    id: 'limitations',
    label: 'What this isn’t',
    body: 'This doesn’t measure intelligence, diagnose anything, or claim clinical precision. It’s an evidence-informed instrument, not a lab test — treated, and reported, that way throughout. This build charts eleven of the thirteen planned regions in full — around 250 questions total, most a single tap — the rest are visible on the map so you can see the intended shape, but aren’t open to answer yet.',
  },
]
