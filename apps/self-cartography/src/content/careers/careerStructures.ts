import type { RuleCondition } from '../../engine/scoring/synthesis'

/**
 * UNCONVENTIONAL PATHS — pure content. Standard assessments overrecommend
 * known job titles because job titles are what occupational databases
 * index. This file is deliberately about something else: CAREER
 * STRUCTURES — how the work itself is organized (solo vs. embedded,
 * ownership vs. employment, single-client vs. portfolio, built-from-zero
 * vs. acquired) — surfaced from combinations of traits, the same way
 * engine/scoring/synthesis.ts surfaces trait convergences. A structure only
 * exists here if someone deliberately wrote out why that specific
 * combination points toward it; there is no generic "average some traits"
 * mechanism, on purpose.
 *
 * `exampleRoles` exist to ground the abstraction in recognizable titles —
 * this app recommends structures AS WELL AS job titles, not instead of them.
 */

export interface CareerStructure {
  id: string
  label: string
  /** One or two lines: what this structure actually looks like day to day. */
  description: string
  /** Concrete, recognizable titles this structure shows up as — never the
   *  recommendation itself, just enough to make the abstraction legible. */
  exampleRoles: string[]
  conditions: RuleCondition[]
  /** How many conditions have to clear their threshold before this fires at all. */
  minimumMet: number
  /** Hand-written: why this specific combination points toward this specific structure. */
  detail: string
}

export const CAREER_STRUCTURES: CareerStructure[] = [
  {
    id: 'portfolio-career',
    label: 'Portfolio Career',
    description: 'Several concurrent income streams or roles, deliberately kept separate, rather than one employer and one title.',
    exampleRoles: ['Part-time instructor + freelance writer + advisor', 'Multiple part-time clinical or teaching roles', 'Board seats + speaking + advisory work'],
    conditions: [
      { facetId: 'autonomy_need', direction: 'high', threshold: 65 },
      { facetId: 'work_task_variety', direction: 'high', threshold: 65 },
      { facetId: 'desire_depth_variety', direction: 'high', threshold: 60 },
      { facetId: 'risk_financial', direction: 'high', threshold: 55 },
    ],
    minimumMet: 3,
    detail: 'A strong need for autonomy, an appetite for task variety, a stated preference for breadth over single-domain depth, and tolerance for uneven income together describe someone who is likely to be worse off consolidated into one employer and one title than spread across several — not out of instability, but because variety and self-direction are what the rest of the profile is organized around.',
  },
  {
    id: 'consulting',
    label: 'Consulting',
    description: 'Applying deep, demonstrated expertise to a rotating set of client problems, project by project, rather than one employer’s ongoing operations.',
    exampleRoles: ['Independent strategy or ops consultant', 'Fractional technical advisor', 'Boutique consulting principal'],
    conditions: [
      { facetId: 'strength_analytical_ability', direction: 'high', threshold: 65 },
      { facetId: 'autonomy_need', direction: 'high', threshold: 65 },
      { facetId: 'riasec_enterprising', direction: 'high', threshold: 55 },
      { facetId: 'work_task_variety', direction: 'high', threshold: 60 },
    ],
    minimumMet: 3,
    detail: 'Demonstrated analytical ability, a strong need for autonomy, enterprising interest, and an appetite for switching between different problems converge on a specific shape: someone whose expertise is portable enough to sell repeatedly, and who would rather diagnose a new problem every few months than own one operation indefinitely.',
  },
  {
    id: 'independent-operator',
    label: 'Independent Operator',
    description: 'Running something solo end to end — no team to manage, no team dependency, full ownership of every decision.',
    exampleRoles: ['Solo SaaS or content-business owner', 'Independent tradesperson running their own book', 'Solo practitioner (design, law, accounting)'],
    conditions: [
      { facetId: 'autonomy_need', direction: 'high', threshold: 75 },
      { facetId: 'work_solitude_social', direction: 'high', threshold: 60 },
      { facetId: 'self_direction', direction: 'high', threshold: 65 },
      { facetId: 'structure_need', direction: 'low', threshold: 60 },
    ],
    minimumMet: 3,
    detail: 'A very high need for autonomy, a preference for solitude over social density, high self-direction, and comfort operating without much imposed structure describe someone who is likely to find both employment AND partnership constraining — not just a preference for independence, but a low tolerance for depending on anyone else’s pace or process.',
  },
  {
    id: 'small-business-acquisition',
    label: 'Small-Business Acquisition',
    description: 'Buying an existing, already-operating business rather than building one from zero — cash flow from day one, in exchange for less blank-slate creative control.',
    exampleRoles: ['Search-fund or self-funded searcher', 'Acquirer of an established local service business', 'Second-generation owner-operator via buyout'],
    conditions: [
      { facetId: 'future_ownership', direction: 'high', threshold: 65 },
      { facetId: 'anchor_general_management', direction: 'high', threshold: 60 },
      { facetId: 'risk_financial', direction: 'high', threshold: 55 },
      { facetId: 'uncertainty_tolerance', direction: 'low', threshold: 55 },
    ],
    minimumMet: 3,
    detail: 'Ownership protected as a Future Self priority, a general-management anchor, and tolerance for financial risk all point toward wanting to own and run something — but paired with LOWER tolerance for pure outcome uncertainty than founding typically demands. That specific combination is what acquiring a running, already-proven business is for: ownership and operating control, without betting on whether the thing works at all.',
  },
  {
    id: 'entrepreneurship',
    label: 'Entrepreneurship',
    description: 'Building something from nothing — no existing revenue, no existing playbook, full uncertainty in exchange for full upside and full ownership.',
    exampleRoles: ['Startup founder', 'Bootstrapped product founder', 'Venture-backed operator'],
    conditions: [
      { facetId: 'anchor_entrepreneurship', direction: 'high', threshold: 65 },
      { facetId: 'uncertainty_tolerance', direction: 'high', threshold: 65 },
      { facetId: 'autonomy_need', direction: 'high', threshold: 65 },
      { facetId: 'risk_financial', direction: 'high', threshold: 60 },
    ],
    minimumMet: 3,
    detail: 'An entrepreneurial career anchor, tolerance for not knowing how things will turn out, a strong need for autonomy, and tolerance for uneven income are the specific combination that from-zero building requires — distinct from acquisition above mainly in how much raw, unresolved uncertainty the profile can absorb without that reading as a cost.',
  },
  {
    id: 'fractional-work',
    label: 'Fractional Work',
    description: 'Senior, embedded responsibility inside several organizations at once, part-time in each — operating authority without full-time exclusivity to any one of them.',
    exampleRoles: ['Fractional CFO / CMO / Head of Ops', 'Part-time technical or design lead across several companies', 'Interim executive work'],
    conditions: [
      { facetId: 'anchor_general_management', direction: 'high', threshold: 60 },
      { facetId: 'autonomy_need', direction: 'high', threshold: 65 },
      { facetId: 'work_task_variety', direction: 'high', threshold: 55 },
      { facetId: 'structure_need', direction: 'low', threshold: 55 },
    ],
    minimumMet: 3,
    detail: 'A general-management anchor paired with a strong need for autonomy, an appetite for switching between different organizations’ problems, and comfort without one fixed structure describes someone suited to senior, embedded-but-part-time roles — enough operating seniority to matter inside each organization, without needing full-time exclusivity to any single one.',
  },
  {
    id: 'commission-based-work',
    label: 'Commission-Based Work',
    description: 'Pay tied directly to output or closed outcomes rather than a fixed salary — uncapped upside, and real downside if performance dips.',
    exampleRoles: ['Commission-based sales rep', 'Real estate or recruiting agent', 'Performance-based creative or media placement'],
    conditions: [
      { facetId: 'risk_financial', direction: 'high', threshold: 65 },
      { facetId: 'work_competition', direction: 'high', threshold: 60 },
      { facetId: 'riasec_enterprising', direction: 'high', threshold: 55 },
      { facetId: 'assertiveness', direction: 'high', threshold: 55 },
    ],
    minimumMet: 3,
    detail: 'Tolerance for variable income, an appetite for being visibly measured against peers, enterprising interest, and assertiveness together describe someone who is likely to find a flat salary actively demotivating rather than reassuring — pay that moves with performance is a fit, not just a tolerable tradeoff, for this specific combination.',
  },
  {
    id: 'technical-sales',
    label: 'Technical Sales',
    description: 'Selling complex, technical products or services — persuasion and relationship-building built on real technical credibility, not just rapport.',
    exampleRoles: ['Sales engineer', 'Technical account executive', 'Solutions consultant'],
    conditions: [
      { facetId: 'riasec_enterprising', direction: 'high', threshold: 65 },
      { facetId: 'riasec_investigative', direction: 'high', threshold: 55 },
      { facetId: 'strength_analytical_ability', direction: 'high', threshold: 55 },
      { facetId: 'assertiveness', direction: 'high', threshold: 55 },
    ],
    minimumMet: 3,
    detail: 'Enterprising interest usually points toward sales on its own, but paired here with investigative interest and demonstrated analytical ability, it points somewhere more specific: selling that leans on understanding how something works, not just on persuasion — the technical-credibility half of the job would likely feel like a strength rather than friction.',
  },
  {
    id: 'craft-business-hybrid',
    label: 'Craft / Business Hybrid',
    description: 'Making something real with a demonstrated hands-on or creative skill, and also owning and running the business around it.',
    exampleRoles: ['Owner-operator: woodworker, chef, tailor, jeweler', 'Studio owner (ceramics, print, fabrication)', 'Independent tradesperson who owns their shop'],
    conditions: [
      { facetId: 'riasec_realistic', direction: 'high', threshold: 60 },
      { facetId: 'future_ownership', direction: 'high', threshold: 60 },
      { facetId: 'autonomy_need', direction: 'high', threshold: 60 },
      { facetId: 'strength_creative_ability', direction: 'high', threshold: 55 },
    ],
    minimumMet: 3,
    detail: 'Realistic, hands-on interest, ownership protected as a Future Self priority, a strong need for autonomy, and demonstrated creative ability together describe someone unlikely to be satisfied EITHER purely making things for someone else’s business OR purely running a business with no hands-on craft in it — the combination points at owning the thing you personally make.',
  },
  {
    id: 'creator-operator',
    label: 'Creator / Operator',
    description: 'Building an audience, body of work, or content-driven following, and also operating the business (products, sponsorships, systems) built on top of it.',
    exampleRoles: ['Independent creator with a product or membership business', 'Newsletter or channel owner with paid offerings', 'Niche media operator'],
    conditions: [
      { facetId: 'riasec_artistic', direction: 'high', threshold: 55 },
      { facetId: 'autonomy_need', direction: 'high', threshold: 65 },
      { facetId: 'work_creative_freedom', direction: 'high', threshold: 65 },
      { facetId: 'future_ownership', direction: 'high', threshold: 55 },
    ],
    minimumMet: 3,
    detail: 'Artistic interest, a strong need for autonomy, a preference for inventing your own approach over following a defined process, and ownership protected as a Future Self priority together describe someone whose creative output is unlikely to feel complete just being made for someone else’s platform or payroll — the operating half (audience, product, revenue) is part of the same drive, not a separate concession to practicality.',
  },
  {
    id: 'research-entrepreneurship',
    label: 'Research + Entrepreneurship',
    description: 'Deep investigative or technical work, channeled into building something from it — a startup or venture that exists because of the research, not alongside it.',
    exampleRoles: ['Deep-tech or biotech founder', 'Academic-to-founder transition', 'Founder building directly on their own research or thesis'],
    conditions: [
      { facetId: 'riasec_investigative', direction: 'high', threshold: 65 },
      { facetId: 'intellectual_curiosity', direction: 'high', threshold: 60 },
      { facetId: 'anchor_entrepreneurship', direction: 'high', threshold: 55 },
      { facetId: 'uncertainty_tolerance', direction: 'high', threshold: 55 },
    ],
    minimumMet: 3,
    detail: 'Investigative interest and intellectual curiosity alone usually point toward research or an individual-contributor technical track. Paired with an entrepreneurial anchor and tolerance for uncertain outcomes, they point somewhere less obvious: someone whose depth is likely to be underused inside an existing institution’s roadmap, and who has the risk appetite to build a venture around what that depth produces.',
  },
  {
    id: 'trade-ownership',
    label: 'Trade + Ownership',
    description: 'Skilled trade or licensed-practice expertise, built toward eventually owning the business or practice rather than working inside someone else’s indefinitely.',
    exampleRoles: ['Electrician, plumber, or contractor who owns the company', 'Dentist, vet, or optometrist who owns the practice', 'Salon, garage, or workshop owner-operator'],
    conditions: [
      { facetId: 'riasec_realistic', direction: 'high', threshold: 55 },
      { facetId: 'future_ownership', direction: 'high', threshold: 65 },
      { facetId: 'anchor_general_management', direction: 'high', threshold: 55 },
      { facetId: 'risk_financial', direction: 'high', threshold: 50 },
    ],
    minimumMet: 3,
    detail: 'Hands-on realistic interest, ownership protected as a Future Self priority, a general-management anchor, and moderate tolerance for financial risk describe someone whose trade or practiced skill is likely to feel incomplete as an employee indefinitely — the combination points toward working the trade specifically as a path to eventually owning the operation built on it.',
  },
]
