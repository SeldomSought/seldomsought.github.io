/**
 * CAREER EXPERIMENTS — pure content. This assessment never implies
 * introspection alone can determine someone's destiny; it can only
 * generate hypotheses. This file is the other half of that honesty: a
 * bank of cheap, real-world tests that replace speculation with
 * behavioral evidence, classified plainly by time, cost, and how much
 * signal the result would carry.
 */

export type ExperimentTag =
  | 'analytical' | 'investigative' | 'creation' | 'creative' | 'social' | 'teaching' | 'interpersonal'
  | 'belonging' | 'enterprising' | 'persuasion' | 'competition' | 'mechanical' | 'handson' | 'realistic'
  | 'mastery' | 'technical' | 'autonomy' | 'portfolio' | 'leadership' | 'impact'
  /** Matches every hypothesis, always eligible, always ranked behind anything more specific. */
  | 'generic'

export interface ExperimentTemplate {
  id: string
  label: string
  description: string
  time: string
  cost: string
  signalQuality: 'Low' | 'Moderate' | 'High'
  tags: ExperimentTag[]
}

export const EXPERIMENT_TEMPLATES: ExperimentTemplate[] = [
  {
    id: 'shadow',
    label: 'Shadow someone',
    description: 'Spend a full day next to someone actually doing the work — not a tour, the whole unglamorous day.',
    time: '1 day', cost: 'Free', signalQuality: 'Moderate',
    tags: ['social', 'leadership', 'interpersonal', 'generic'],
  },
  {
    id: 'simulated-task',
    label: 'Complete a simulated task',
    description: 'Do a practice exercise from the field — a case study, a sample brief, a mock diagnostic — under a time limit.',
    time: '2–4 hours', cost: 'Free', signalQuality: 'High',
    tags: ['analytical', 'technical'],
  },
  {
    id: 'interview-practitioners',
    label: 'Interview three practitioners',
    description: 'Three short calls with people actually doing this work now, asking what the job is really like day to day — not career advice, texture.',
    time: '1 week (3 short calls)', cost: 'Free', signalQuality: 'Low',
    tags: ['generic'],
  },
  {
    id: 'weekend-course',
    label: 'Take a weekend course',
    description: 'A short, structured intro — enough to find out whether the actual subject matter holds your attention past the novelty.',
    time: '1 weekend', cost: 'Low ($50–300)', signalQuality: 'Moderate',
    tags: ['mastery', 'technical', 'creative'],
  },
  {
    id: 'freelance-project',
    label: 'Freelance one project',
    description: 'Take on one paid (even if small) client engagement, start to finish, with a deadline and a deliverable.',
    time: '2–6 weeks', cost: 'Free (time only)', signalQuality: 'High',
    tags: ['autonomy', 'portfolio', 'creation'],
  },
  {
    id: 'volunteer',
    label: 'Volunteer',
    description: 'Do the work itself, just in a lower-stakes setting where a mistake costs less than it would on the job.',
    time: '1 day – 1 month', cost: 'Free', signalQuality: 'Moderate',
    tags: ['impact', 'social', 'belonging'],
  },
  {
    id: 'build-prototype',
    label: 'Build a prototype',
    description: 'Make a rough version of the thing — not a plan for it — and get it in front of at least one other person.',
    time: '1–3 weeks', cost: 'Low ($0–200)', signalQuality: 'High',
    tags: ['creation', 'mechanical', 'technical'],
  },
  {
    id: 'sell-something',
    label: 'Sell something',
    description: 'Actually ask someone for money in exchange for something — a product, a service, a pitch — and sit with the real answer, including "no."',
    time: '1–2 weeks', cost: 'Free', signalQuality: 'High',
    tags: ['enterprising', 'persuasion', 'competition'],
  },
  {
    id: 'teach-something',
    label: 'Teach something',
    description: 'Prepare and run one session teaching something you know to people who don’t — a class, a workshop, even one willing person.',
    time: '2–4 hours prep + 1 session', cost: 'Free', signalQuality: 'Moderate',
    tags: ['teaching', 'interpersonal', 'social'],
  },
  {
    id: 'analyze-dataset',
    label: 'Analyze a dataset',
    description: 'Pick a messy dataset with no clean answer key, and produce one finding from it.',
    time: '1 weekend', cost: 'Free', signalQuality: 'Moderate',
    tags: ['analytical', 'investigative'],
  },
  {
    id: 'work-alongside-tradesperson',
    label: 'Work alongside a tradesperson',
    description: 'Spend a working day as a hands-on second pair of hands, not an observer, for someone in a skilled trade.',
    time: '1 day', cost: 'Free – Low', signalQuality: 'Moderate',
    tags: ['realistic', 'mechanical', 'handson'],
  },
]
