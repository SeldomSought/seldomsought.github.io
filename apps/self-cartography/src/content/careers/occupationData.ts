/**
 * OBJECTIVE OCCUPATION DATA — facts about an occupation, structured the
 * way a reputable external dataset (O*NET is the reference point
 * throughout this file) actually organizes them. Nothing in this file
 * knows this app exists: no facet ids, no fit weights, no dealbreakers.
 * That separation is the point — see engine/scoring/careerFitModel.ts for
 * the (separate, auditable) transformation from these objective fields
 * into what OUR fit model actually compares against a respondent.
 *
 * PROVENANCE: every entry below is `source: 'hand-authored-placeholder'`.
 * These are plausible, carefully-considered numbers written to prove the
 * data layer end to end — they are NOT pulled from O*NET's real database
 * (this build has no network access to O*NET's Web Services API). Treat
 * the shape as production-ready and the values as a seed set to replace,
 * not as verified occupational statistics. See occupationDataSource.ts
 * for exactly where a real O*NET-backed source would plug in instead.
 */

/** Holland Code — the same six RIASEC types this app already measures
 *  interest in, here representing how much each occupation itself involves. */
export interface RiasecProfile {
  realistic: number
  investigative: number
  artistic: number
  social: number
  enterprising: number
  conventional: number
}

/** O*NET "Work Activities" — generalized work behaviors, each with an
 *  importance rating. Names are drawn from O*NET's own Work Activities
 *  taxonomy so a real integration can match on name directly. */
export interface WorkActivity {
  name: string
  /** 0-100 — O*NET's own importance scale, normalized. */
  importance: number
}

/** O*NET "Work Context" — situational/structural properties of how the
 *  work actually happens (pace, structure, contact with others, and so on). */
export interface WorkContextFactor {
  name: string
  /** 0-100 — O*NET's own context rating, normalized. */
  level: number
}

/** Shared shape for O*NET's Skills, Knowledge, and Abilities taxonomies —
 *  structurally identical (a name plus a 0-100 level), kept as three
 *  separate arrays because O*NET treats them as three separate domains. */
export interface SkillRating {
  name: string
  level: number
}

/** O*NET "Job Zone" education levels, collapsed to their plain-language names. */
export type EducationLevel =
  | 'no-formal-credential'
  | 'high-school'
  | 'postsecondary-certificate'
  | 'associates'
  | 'bachelors'
  | 'masters'
  | 'doctoral-professional'

export interface OccupationProvenance {
  /** O*NET-SOC code, when this entry has been reconciled against a real
   *  O*NET occupation (e.g. "41-4012.00"). Absent for placeholder entries. */
  onetSocCode?: string
  source: 'onet' | 'hand-authored-placeholder'
  /** ISO date this entry's numbers were last reviewed against their source. */
  lastVerified?: string
}

/**
 * The normalized Career object. Every field here is an objective claim
 * about the OCCUPATION — never a claim about how well it fits any
 * particular respondent. If a field name wouldn't make sense as an answer
 * to "what does O*NET say about this job," it doesn't belong in this file.
 */
export interface Career {
  id: string
  title: string
  description: string
  careerFamily: string
  riasec: RiasecProfile
  workActivities: WorkActivity[]
  workContext: WorkContextFactor[]
  skills: SkillRating[]
  knowledge: SkillRating[]
  abilities: SkillRating[]
  education: EducationLevel
  /** 0-100 — O*NET Work Style "Independence": how much the role rewards
   *  making decisions and acting with little or no supervision. */
  independence: number
  /** 0-100 — O*NET Work Style "Social Orientation": how much the role
   *  involves working with or being around other people day to day. */
  socialOrientation: number
  /** 0-100 — O*NET Work Style "Leadership": how much the role involves
   *  guiding, directing, and motivating others. */
  leadership: number
  /** 0-100 — a composite of O*NET Work Context risk/consequence items
   *  (e.g. "Consequence of Error," "Frequency of Decision Making"). */
  risk: number
  /** 0-100 — O*NET Work Context "Structured versus Unstructured Work,"
   *  where 100 is highly structured/routine and 0 is highly unstructured. */
  structure: number
  /** 0-100 — this occupation's typical income normalized against the full
   *  wage distribution across occupations, deliberately never a raw
   *  dollar figure (which goes stale and varies enormously by region). */
  incomePotential: number
  source: OccupationProvenance
}

const PLACEHOLDER: OccupationProvenance = { source: 'hand-authored-placeholder' }

export const OCCUPATIONS: Career[] = [
  {
    id: 'industrial-sales', title: 'Industrial & B2B Sales', careerFamily: 'Sales & Business Development',
    description: 'Selling complex products or services directly to other businesses, usually against a quota.',
    riasec: { realistic: 25, investigative: 30, artistic: 15, social: 55, enterprising: 90, conventional: 35 },
    workActivities: [
      { name: 'Selling or Influencing Others', importance: 95 },
      { name: 'Establishing and Maintaining Interpersonal Relationships', importance: 80 },
      { name: 'Making Decisions and Solving Problems', importance: 60 },
      { name: 'Getting Information', importance: 55 },
    ],
    workContext: [
      { name: 'Level of Competition', level: 85 },
      { name: 'Deal With External Customers', level: 90 },
      { name: 'Time Pressure', level: 70 },
      { name: 'Freedom to Make Decisions', level: 65 },
    ],
    skills: [{ name: 'Persuasion', level: 90 }, { name: 'Negotiation', level: 85 }, { name: 'Social Perceptiveness', level: 65 }],
    knowledge: [{ name: 'Sales and Marketing', level: 90 }, { name: 'Customer and Personal Service', level: 75 }],
    abilities: [{ name: 'Oral Expression', level: 80 }],
    education: 'bachelors',
    independence: 65, socialOrientation: 80, leadership: 45, risk: 65, structure: 30, incomePotential: 65,
    source: PLACEHOLDER,
  },
  {
    id: 'data-analyst', title: 'Data Analyst', careerFamily: 'Analytics & Research',
    description: 'Turning raw data into decisions other people act on.',
    riasec: { realistic: 15, investigative: 85, artistic: 15, social: 20, enterprising: 25, conventional: 70 },
    workActivities: [
      { name: 'Analyzing Data or Information', importance: 95 },
      { name: 'Getting Information', importance: 70 },
      { name: 'Documenting/Recording Information', importance: 60 },
    ],
    workContext: [
      { name: 'Structured versus Unstructured Work', level: 75 },
      { name: 'Time Pressure', level: 50 },
      { name: 'Contact With Others', level: 25 },
    ],
    skills: [{ name: 'Complex Problem Solving', level: 80 }, { name: 'Critical Thinking', level: 85 }, { name: 'Systems Analysis', level: 70 }],
    knowledge: [{ name: 'Computers and Electronics', level: 70 }, { name: 'Economics and Accounting', level: 40 }],
    abilities: [{ name: 'Deductive Reasoning', level: 85 }, { name: 'Inductive Reasoning', level: 75 }],
    education: 'bachelors',
    independence: 55, socialOrientation: 25, leadership: 15, risk: 25, structure: 75, incomePotential: 62,
    source: PLACEHOLDER,
  },
  {
    id: 'product-designer', title: 'Product Designer (UX)', careerFamily: 'Design',
    description: 'Shaping how a digital product looks, feels, and works.',
    riasec: { realistic: 10, investigative: 55, artistic: 80, social: 30, enterprising: 25, conventional: 15 },
    workActivities: [
      { name: 'Thinking Creatively', importance: 90 },
      { name: 'Making Decisions and Solving Problems', importance: 65 },
      { name: 'Establishing and Maintaining Interpersonal Relationships', importance: 45 },
    ],
    workContext: [
      { name: 'Freedom to Make Decisions', level: 75 },
      { name: 'Structured versus Unstructured Work', level: 30 },
      { name: 'Time Pressure', level: 45 },
    ],
    skills: [{ name: 'Complex Problem Solving', level: 60 }, { name: 'Social Perceptiveness', level: 50 }],
    knowledge: [{ name: 'Design', level: 90 }, { name: 'Computers and Electronics', level: 55 }],
    abilities: [{ name: 'Originality', level: 80 }, { name: 'Fluency of Ideas', level: 70 }],
    education: 'bachelors',
    independence: 65, socialOrientation: 40, leadership: 20, risk: 30, structure: 30, incomePotential: 60,
    source: PLACEHOLDER,
  },
  {
    id: 'management-consultant', title: 'Management Consultant', careerFamily: 'Strategy & Consulting',
    description: 'Parachuting into unfamiliar problems for a living, on someone else’s timeline.',
    riasec: { realistic: 10, investigative: 65, artistic: 15, social: 35, enterprising: 75, conventional: 30 },
    workActivities: [
      { name: 'Analyzing Data or Information', importance: 75 },
      { name: 'Making Decisions and Solving Problems', importance: 80 },
      { name: 'Guiding, Directing, and Motivating Subordinates', importance: 55 },
    ],
    workContext: [
      { name: 'Time Pressure', level: 85 },
      { name: 'Structured versus Unstructured Work', level: 20 },
      { name: 'Deal With External Customers', level: 70 },
    ],
    skills: [{ name: 'Critical Thinking', level: 80 }, { name: 'Persuasion', level: 60 }],
    knowledge: [{ name: 'Economics and Accounting', level: 55 }],
    abilities: [{ name: 'Deductive Reasoning', level: 75 }, { name: 'Oral Expression', level: 70 }],
    education: 'masters',
    independence: 55, socialOrientation: 55, leadership: 55, risk: 60, structure: 20, incomePotential: 80,
    source: PLACEHOLDER,
  },
  {
    id: 'registered-nurse', title: 'Registered Nurse', careerFamily: 'Healthcare & Direct Care',
    description: 'Direct, hands-on responsibility for people’s wellbeing.',
    riasec: { realistic: 40, investigative: 45, artistic: 10, social: 85, enterprising: 15, conventional: 30 },
    workActivities: [
      { name: 'Assisting and Caring for Others', importance: 95 },
      { name: 'Making Decisions and Solving Problems', importance: 65 },
      { name: 'Documenting/Recording Information', importance: 55 },
    ],
    workContext: [
      { name: 'Contact With Others', level: 95 },
      { name: 'Structured versus Unstructured Work', level: 60 },
      { name: 'Time Pressure', level: 75 },
    ],
    skills: [{ name: 'Social Perceptiveness', level: 75 }, { name: 'Coordination', level: 65 }],
    knowledge: [{ name: 'Psychology', level: 55 }],
    abilities: [{ name: 'Manual Dexterity', level: 60 }, { name: 'Stamina', level: 65 }],
    education: 'associates',
    independence: 40, socialOrientation: 90, leadership: 25, risk: 55, structure: 65, incomePotential: 58,
    source: PLACEHOLDER,
  },
  {
    id: 'software-engineer', title: 'Software Engineer (Individual Contributor)', careerFamily: 'Engineering',
    description: 'Building and maintaining systems, mostly heads-down.',
    riasec: { realistic: 35, investigative: 85, artistic: 20, social: 15, enterprising: 15, conventional: 35 },
    workActivities: [
      { name: 'Analyzing Data or Information', importance: 70 },
      { name: 'Making Decisions and Solving Problems', importance: 75 },
      { name: 'Thinking Creatively', importance: 55 },
    ],
    workContext: [
      { name: 'Freedom to Make Decisions', level: 55 },
      { name: 'Contact With Others', level: 25 },
      { name: 'Structured versus Unstructured Work', level: 40 },
    ],
    skills: [{ name: 'Complex Problem Solving', level: 85 }, { name: 'Systems Analysis', level: 65 }],
    knowledge: [{ name: 'Computers and Electronics', level: 90 }, { name: 'Engineering and Technology', level: 55 }],
    abilities: [{ name: 'Deductive Reasoning', level: 80 }],
    education: 'bachelors',
    independence: 60, socialOrientation: 25, leadership: 15, risk: 30, structure: 45, incomePotential: 78,
    source: PLACEHOLDER,
  },
  {
    id: 'elementary-teacher', title: 'Elementary School Teacher', careerFamily: 'Education',
    description: 'Daily, structured responsibility for a room full of kids.',
    riasec: { realistic: 15, investigative: 25, artistic: 35, social: 90, enterprising: 30, conventional: 40 },
    workActivities: [
      { name: 'Coaching and Developing Others', importance: 90 },
      { name: 'Assisting and Caring for Others', importance: 70 },
      { name: 'Establishing and Maintaining Interpersonal Relationships', importance: 65 },
    ],
    workContext: [
      { name: 'Contact With Others', level: 90 },
      { name: 'Structured versus Unstructured Work', level: 65 },
      { name: 'Public Speaking', level: 80 },
    ],
    skills: [{ name: 'Social Perceptiveness', level: 70 }, { name: 'Coordination', level: 55 }],
    knowledge: [{ name: 'Education and Training', level: 85 }, { name: 'Psychology', level: 45 }],
    abilities: [{ name: 'Oral Expression', level: 70 }],
    education: 'bachelors',
    independence: 35, socialOrientation: 90, leadership: 45, risk: 25, structure: 65, incomePotential: 42,
    source: PLACEHOLDER,
  },
  {
    id: 'startup-founder', title: 'Founder / Early-Stage Startup Operator', careerFamily: 'Entrepreneurship',
    description: 'No org chart, no playbook, no floor under you.',
    riasec: { realistic: 25, investigative: 40, artistic: 25, social: 40, enterprising: 95, conventional: 10 },
    workActivities: [
      { name: 'Selling or Influencing Others', importance: 80 },
      { name: 'Making Decisions and Solving Problems', importance: 90 },
      { name: 'Guiding, Directing, and Motivating Subordinates', importance: 60 },
      { name: 'Thinking Creatively', importance: 65 },
    ],
    workContext: [
      { name: 'Freedom to Make Decisions', level: 95 },
      { name: 'Structured versus Unstructured Work', level: 5 },
      { name: 'Time Pressure', level: 85 },
      { name: 'Level of Competition', level: 80 },
    ],
    skills: [{ name: 'Persuasion', level: 75 }, { name: 'Management of Personnel Resources', level: 55 }],
    knowledge: [{ name: 'Sales and Marketing', level: 60 }],
    abilities: [{ name: 'Fluency of Ideas', level: 65 }],
    education: 'no-formal-credential',
    independence: 95, socialOrientation: 55, leadership: 80, risk: 90, structure: 5, incomePotential: 55,
    source: PLACEHOLDER,
  },
  {
    id: 'policy-analyst', title: 'Government Policy Analyst', careerFamily: 'Public Sector & Policy',
    description: 'Slow, systemic, high-stakes-in-aggregate work.',
    riasec: { realistic: 10, investigative: 70, artistic: 15, social: 35, enterprising: 30, conventional: 55 },
    workActivities: [
      { name: 'Analyzing Data or Information', importance: 80 },
      { name: 'Getting Information', importance: 65 },
      { name: 'Documenting/Recording Information', importance: 60 },
    ],
    workContext: [
      { name: 'Structured versus Unstructured Work', level: 65 },
      { name: 'Time Pressure', level: 35 },
      { name: 'Contact With Others', level: 45 },
    ],
    skills: [{ name: 'Critical Thinking', level: 75 }],
    knowledge: [{ name: 'Law and Government', level: 75 }, { name: 'Economics and Accounting', level: 45 }],
    abilities: [{ name: 'Written Expression', level: 65 }],
    education: 'masters',
    independence: 45, socialOrientation: 40, leadership: 25, risk: 25, structure: 65, incomePotential: 55,
    source: PLACEHOLDER,
  },
  {
    id: 'brand-designer', title: 'Graphic & Brand Designer', careerFamily: 'Design',
    description: 'Making an identity legible at a glance.',
    riasec: { realistic: 10, investigative: 25, artistic: 90, social: 20, enterprising: 30, conventional: 15 },
    workActivities: [{ name: 'Thinking Creatively', importance: 90 }, { name: 'Establishing and Maintaining Interpersonal Relationships', importance: 40 }],
    workContext: [{ name: 'Freedom to Make Decisions', level: 65 }, { name: 'Structured versus Unstructured Work', level: 25 }],
    skills: [{ name: 'Social Perceptiveness', level: 40 }],
    knowledge: [{ name: 'Design', level: 95 }, { name: 'Fine Arts', level: 60 }],
    abilities: [{ name: 'Originality', level: 85 }],
    education: 'bachelors',
    independence: 60, socialOrientation: 30, leadership: 15, risk: 35, structure: 25, incomePotential: 48,
    source: PLACEHOLDER,
  },
  {
    id: 'compliance-analyst', title: 'Financial / Compliance Analyst', careerFamily: 'Finance & Operations',
    description: 'Precision and process, with real consequences for getting it wrong.',
    riasec: { realistic: 10, investigative: 55, artistic: 5, social: 20, enterprising: 25, conventional: 85 },
    workActivities: [{ name: 'Analyzing Data or Information', importance: 85 }, { name: 'Documenting/Recording Information', importance: 75 }],
    workContext: [{ name: 'Structured versus Unstructured Work', level: 90 }, { name: 'Time Pressure', level: 55 }],
    skills: [{ name: 'Critical Thinking', level: 65 }],
    knowledge: [{ name: 'Economics and Accounting', level: 85 }, { name: 'Law and Government', level: 40 }],
    abilities: [{ name: 'Deductive Reasoning', level: 70 }],
    education: 'bachelors',
    independence: 40, socialOrientation: 25, leadership: 10, risk: 15, structure: 90, incomePotential: 60,
    source: PLACEHOLDER,
  },
  {
    id: 'nonprofit-director', title: 'Nonprofit Program Director', careerFamily: 'Nonprofit & Social Impact',
    description: 'Mission-driven work under permanent resource constraints.',
    riasec: { realistic: 10, investigative: 30, artistic: 15, social: 75, enterprising: 55, conventional: 30 },
    workActivities: [
      { name: 'Assisting and Caring for Others', importance: 70 },
      { name: 'Guiding, Directing, and Motivating Subordinates', importance: 65 },
      { name: 'Selling or Influencing Others', importance: 55 },
    ],
    workContext: [{ name: 'Contact With Others', level: 75 }, { name: 'Freedom to Make Decisions', level: 55 }],
    skills: [{ name: 'Management of Personnel Resources', level: 60 }, { name: 'Persuasion', level: 55 }],
    knowledge: [{ name: 'Customer and Personal Service', level: 45 }],
    abilities: [{ name: 'Oral Expression', level: 60 }],
    education: 'bachelors',
    independence: 55, socialOrientation: 75, leadership: 65, risk: 45, structure: 35, incomePotential: 38,
    source: PLACEHOLDER,
  },
  {
    id: 'research-scientist', title: 'Research Scientist (Academic)', careerFamily: 'Research & Academia',
    description: 'Years spent on questions with no guaranteed answer.',
    riasec: { realistic: 25, investigative: 95, artistic: 15, social: 15, enterprising: 15, conventional: 20 },
    workActivities: [{ name: 'Analyzing Data or Information', importance: 90 }, { name: 'Getting Information', importance: 65 }],
    workContext: [{ name: 'Structured versus Unstructured Work', level: 20 }, { name: 'Contact With Others', level: 20 }],
    skills: [{ name: 'Complex Problem Solving', level: 85 }, { name: 'Critical Thinking', level: 85 }],
    knowledge: [{ name: 'Biology', level: 70 }],
    abilities: [{ name: 'Inductive Reasoning', level: 85 }, { name: 'Written Expression', level: 60 }],
    education: 'doctoral-professional',
    independence: 70, socialOrientation: 20, leadership: 15, risk: 65, structure: 20, incomePotential: 45,
    source: PLACEHOLDER,
  },
  {
    id: 'operations-manager', title: 'Operations Manager', careerFamily: 'Operations & Logistics',
    description: 'Keeping a lot of moving parts running on schedule.',
    riasec: { realistic: 30, investigative: 20, artistic: 5, social: 40, enterprising: 55, conventional: 70 },
    workActivities: [{ name: 'Making Decisions and Solving Problems', importance: 75 }, { name: 'Guiding, Directing, and Motivating Subordinates', importance: 65 }],
    workContext: [{ name: 'Structured versus Unstructured Work', level: 75 }, { name: 'Time Pressure', level: 65 }],
    skills: [{ name: 'Time Management', level: 75 }, { name: 'Coordination', level: 65 }],
    knowledge: [{ name: 'Economics and Accounting', level: 35 }],
    abilities: [{ name: 'Deductive Reasoning', level: 55 }],
    education: 'bachelors',
    independence: 50, socialOrientation: 55, leadership: 60, risk: 30, structure: 75, incomePotential: 58,
    source: PLACEHOLDER,
  },
  {
    id: 'independent-artist', title: 'Freelance Creative / Independent Artist', careerFamily: 'Independent & Creative',
    description: 'No employer, no ceiling, no floor either.',
    riasec: { realistic: 20, investigative: 20, artistic: 95, social: 15, enterprising: 35, conventional: 5 },
    workActivities: [{ name: 'Thinking Creatively', importance: 95 }, { name: 'Selling or Influencing Others', importance: 40 }],
    workContext: [{ name: 'Freedom to Make Decisions', level: 95 }, { name: 'Structured versus Unstructured Work', level: 5 }],
    skills: [{ name: 'Persuasion', level: 30 }],
    knowledge: [{ name: 'Fine Arts', level: 85 }],
    abilities: [{ name: 'Originality', level: 90 }, { name: 'Fluency of Ideas', level: 80 }],
    education: 'no-formal-credential',
    independence: 90, socialOrientation: 20, leadership: 10, risk: 80, structure: 5, incomePotential: 30,
    source: PLACEHOLDER,
  },
  {
    id: 'corporate-attorney', title: 'Corporate Attorney', careerFamily: 'Law',
    description: 'High-stakes precision inside a rigid procedural frame.',
    riasec: { realistic: 5, investigative: 55, artistic: 10, social: 30, enterprising: 60, conventional: 55 },
    workActivities: [{ name: 'Analyzing Data or Information', importance: 75 }, { name: 'Making Decisions and Solving Problems', importance: 75 }],
    workContext: [{ name: 'Structured versus Unstructured Work', level: 75 }, { name: 'Time Pressure', level: 80 }],
    skills: [{ name: 'Critical Thinking', level: 80 }, { name: 'Persuasion', level: 60 }],
    knowledge: [{ name: 'Law and Government', level: 95 }],
    abilities: [{ name: 'Deductive Reasoning', level: 80 }, { name: 'Written Expression', level: 75 }],
    education: 'doctoral-professional',
    independence: 55, socialOrientation: 40, leadership: 35, risk: 55, structure: 70, incomePotential: 88,
    source: PLACEHOLDER,
  },
]
