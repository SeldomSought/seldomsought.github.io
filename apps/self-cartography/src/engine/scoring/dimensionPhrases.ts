import { FACET_BY_ID } from '../../content/facets'

/**
 * Short, honest fragments — never bespoke prose per career or archetype.
 * The same dimension always produces the same kind of sentence everywhere
 * in the report (career fit, likely-poor-fit archetypes, and anything
 * added later), so a "why" is always traceable back to an actual scored
 * facet rather than hand-written per surface.
 */
export const DIMENSION_PHRASES: Record<string, { positive: string; frictionHigh: string; frictionLow: string }> = {
  self_direction: {
    positive: 'wants you to choose your own methods, which fits your self-direction',
    frictionHigh: 'offers less independence in how the work gets done than you tend to want',
    frictionLow: 'expects more independent judgment than you may naturally reach for',
  },
  achievement: {
    positive: 'rewards visible, measurable competence, which fits your achievement drive',
    frictionHigh: 'offers fewer clear markers of individual achievement than you tend to want',
    frictionLow: 'puts more weight on individual achievement than you may care to chase',
  },
  benevolence: {
    positive: 'centers on directly helping specific people, which fits your benevolence',
    frictionHigh: 'is more impersonal than your orientation toward helping people directly',
    frictionLow: 'asks for more direct caretaking of others than you may be drawn to',
  },
  security: {
    positive: 'offers the stability and predictability you tend to want',
    frictionHigh: 'is less stable or predictable than you typically prefer',
    frictionLow: 'is more stable and routine than you may find satisfying',
  },
  stimulation: {
    positive: 'offers the novelty and variety you tend to seek out',
    frictionHigh: 'is more repetitive and predictable than you typically enjoy',
    frictionLow: 'changes and varies more than you may find comfortable',
  },
  universalism: {
    positive: 'connects to broader, systemic impact, which fits your universalism',
    frictionHigh: 'has a narrower scope of impact than you tend to care about',
    frictionLow: 'asks for more big-picture, systemic focus than you may be drawn to',
  },
  power: {
    positive: 'offers real influence over outcomes, which fits your orientation toward power',
    frictionHigh: 'offers less formal influence or control than you tend to want',
    frictionLow: 'carries more responsibility for influence and control than you may want',
  },
  conformity: {
    positive: 'rewards working within an established structure, which fits your conformity',
    frictionHigh: 'expects more rule-following than you are naturally comfortable with',
    frictionLow: 'gives you more latitude to bend norms than you may be comfortable using',
  },
  intellectual_curiosity: {
    positive: 'rewards chasing ideas for their own sake, which fits your intellectual curiosity',
    frictionHigh: 'leaves less room for open-ended exploration than you tend to want',
    frictionLow: 'asks for more sustained intellectual exploration than may come naturally',
  },
  aesthetic_openness: {
    positive: 'puts craft and form front and center, which fits your aesthetic sensitivity',
    frictionHigh: 'cares less about aesthetics and form than you tend to notice',
    frictionLow: 'asks for a level of aesthetic judgment you may not naturally bring',
  },
  orderliness: {
    positive: 'rewards a tidy, systematic approach, which fits your orderliness',
    frictionHigh: 'is looser and less systematic than you tend to prefer',
    frictionLow: 'requires more systematic upkeep than may come naturally to you',
  },
  industriousness: {
    positive: 'rewards seeing things through to completion, which fits your industriousness',
    frictionHigh: 'has fewer long, unglamorous follow-through stretches than you tend to handle well',
    frictionLow: 'requires more sustained follow-through than may come naturally',
  },
  sociability: {
    positive: 'runs on frequent people-contact, which fits your sociability',
    frictionHigh: 'involves less day-to-day social contact than you tend to want',
    frictionLow: 'asks for more sustained social contact than may energize you',
  },
  assertiveness: {
    positive: 'rewards taking a direct, visible stance, which fits your assertiveness',
    frictionHigh: 'offers less room to take charge or push back than you tend to want',
    frictionLow: 'expects more direct pushback and visibility than may come naturally',
  },
  compassion: {
    positive: 'puts other people’s wellbeing directly in front of you, which fits your compassion',
    frictionHigh: 'is more emotionally arm’s-length than you may find satisfying',
    frictionLow: 'asks for more sustained emotional attunement to others than may come naturally',
  },
  openness: {
    positive: 'rewards new ideas and abstract thinking, which fits your openness',
    frictionHigh: 'leaves less room for exploring ideas than you tend to want',
    frictionLow: 'asks for more abstract or novel thinking than you may naturally gravitate to',
  },
  conscientiousness: {
    positive: 'rewards disciplined follow-through, which fits your conscientiousness',
    frictionHigh: 'has less structure and follow-through demand than you tend to bring',
    frictionLow: 'requires more sustained discipline than may come naturally',
  },
  extraversion: {
    positive: 'runs on frequent, active interaction with people, which fits your extraversion',
    frictionHigh: 'involves less social contact than you tend to want',
    frictionLow: 'asks for more sustained social engagement than may energize you',
  },
  autonomy_need: {
    positive: 'gives real latitude over how the work gets done, which matches your autonomy need',
    frictionHigh: 'offers less independence than you tend to require to do your best work',
    frictionLow: 'expects more self-direction than you may want without support',
  },
  structure_need: {
    positive: 'comes with clear process and expectations, which matches your structure need',
    frictionHigh: 'is looser and more improvisational than you tend to want',
    frictionLow: 'is more rigid and process-heavy than you may find comfortable',
  },
  risk_tolerance: {
    positive: 'involves real variance in outcomes, which matches your risk tolerance',
    frictionHigh: 'is lower-stakes and steadier than you may find satisfying',
    frictionLow: 'carries more real risk than you may be comfortable absorbing',
  },
  ambiguity_tolerance: {
    positive: 'regularly deals in unclear, unsettled problems, which matches your ambiguity tolerance',
    frictionHigh: 'is more open-ended and unresolved than you tend to prefer',
    frictionLow: 'is more clear-cut and well-defined than you may find engaging',
  },
  riasec_enterprising: {
    positive: 'runs on persuading, leading, and closing, which fits your enterprising interest',
    frictionHigh: 'offers less persuasion or deal-making than you tend to enjoy',
    frictionLow: 'asks for more selling and influencing than you may naturally gravitate to',
  },
  riasec_investigative: {
    positive: 'rewards figuring out why something is really happening, which fits your investigative interest',
    frictionHigh: 'offers less analytical depth than you tend to enjoy',
    frictionLow: 'asks for more sustained analysis than you may naturally gravitate to',
  },
  riasec_artistic: {
    positive: 'centers on original creative work, which fits your artistic interest',
    frictionHigh: 'leaves less room for original creative work than you tend to want',
    frictionLow: 'asks for more creative output than you may naturally gravitate to',
  },
  riasec_conventional: {
    positive: 'rewards accuracy and order within a system, which fits your conventional interest',
    frictionHigh: 'is less structured and orderly than you tend to enjoy',
    frictionLow: 'asks for more systematic, by-the-book work than you may naturally gravitate to',
  },
  riasec_realistic: {
    positive: 'involves real, hands-on, physical work, which fits your realistic interest',
    frictionHigh: 'is less hands-on than you tend to enjoy',
    frictionLow: 'asks for more hands-on physical work than you may naturally gravitate to',
  },
  riasec_social: {
    positive: 'runs on directly teaching or helping people, which fits your social interest',
    frictionHigh: 'offers less direct person-to-person work than you tend to enjoy',
    frictionLow: 'asks for more direct teaching or helping than you may naturally gravitate to',
  },
  strength_analytical_ability: {
    positive: 'draws on demonstrated analytical ability you’ve already shown',
    frictionHigh: 'asks for less analytical diagnosis than you’ve shown you’re good at',
    frictionLow: 'leans on analytical ability you haven’t yet demonstrated at this level',
  },
  strength_creative_ease: {
    positive: 'draws on creative work that’s come naturally to you',
    frictionHigh: 'asks for less original creative work than comes naturally to you',
    frictionLow: 'leans on creative fluency you haven’t yet shown comes naturally',
  },
  strength_creative_ability: {
    positive: 'draws on creative ability you’ve already demonstrated',
    frictionHigh: 'asks for less creative output than you’ve shown you can produce',
    frictionLow: 'leans on a creative track record you haven’t yet built',
  },
  strength_interpersonal_ability: {
    positive: 'draws on interpersonal ability you’ve already demonstrated',
    frictionHigh: 'asks for less direct people-support than you’ve shown you’re good at',
    frictionLow: 'leans on interpersonal ability you haven’t yet demonstrated at this level',
  },
  strength_organizational_ability: {
    positive: 'draws on organizational ability you’ve already demonstrated',
    frictionHigh: 'asks for less systems-building than you’ve shown you’re good at',
    frictionLow: 'leans on organizational ability you haven’t yet demonstrated at this level',
  },
  work_competition: {
    positive: 'measures you visibly against peers, which fits your appetite for competition',
    frictionHigh: 'compares you against peers less than you tend to want',
    frictionLow: 'compares you against peers more than you may find comfortable',
  },
  work_pace: {
    positive: 'moves fast and adapts on the fly, which fits your preferred pace',
    frictionHigh: 'moves slower and more deliberately than you tend to want',
    frictionLow: 'moves faster than you may find comfortable to sustain',
  },
  work_predictability: {
    positive: 'rarely looks the same two days running, which fits your appetite for the unpredictable',
    frictionHigh: 'is more routine and predictable than you tend to want',
    frictionLow: 'is less predictable day to day than you may find comfortable',
  },
  work_creative_freedom: {
    positive: 'lets you invent your own approach, which fits your need for creative freedom',
    frictionHigh: 'offers less latitude to invent your own approach than you tend to want',
    frictionLow: 'expects more of a defined process than you may naturally follow',
  },
  work_task_variety: {
    positive: 'switches between different work often, which fits your need for variety',
    frictionHigh: 'is more repetitive than you tend to want',
    frictionLow: 'varies more than you may find comfortable to track',
  },
  work_travel: {
    positive: 'has you away from home regularly, which fits your tolerance for travel',
    frictionHigh: 'keeps you in one place more than you tend to want',
    frictionLow: 'has you traveling more than you may find comfortable',
  },
  work_physical_activity: {
    positive: 'keeps you physically active, which fits your preference for physical work',
    frictionHigh: 'is more sedentary than you tend to want',
    frictionLow: 'is more physically demanding than you may find comfortable',
  },
  work_solitude_social: {
    positive: 'lets you do focused, largely solo work, which fits your preference for solitude',
    frictionHigh: 'surrounds you with more people than you tend to want',
    frictionLow: 'is more socially isolating than you may find comfortable',
  },
  work_public_interaction: {
    positive: 'puts you in front of a constant stream of new people, which fits your tolerance for that',
    frictionHigh: 'involves less public interaction than you tend to want',
    frictionLow: 'involves more public interaction than you may find comfortable',
  },
  work_bureaucracy: {
    positive: 'runs on formal process and approvals, which matches your comfort with that',
    frictionHigh: 'is looser and less process-driven than you tend to want',
    frictionLow: 'involves more approvals and process than you may find comfortable',
  },
  risk_financial: {
    positive: 'ties pay to outcomes, which matches your tolerance for financial risk',
    frictionHigh: 'offers a steadier paycheck than the upside you tend to want',
    frictionLow: 'carries more income variability than you may be comfortable absorbing',
  },
  risk_career: {
    positive: 'is the kind of move that fits your tolerance for career risk',
    frictionHigh: 'is a safer, more conventional path than you tend to want',
    frictionLow: 'is a bigger leap than you may be comfortable taking',
  },
  risk_physical: {
    positive: 'carries a level of physical risk that matches your tolerance for it',
    frictionHigh: 'is physically safer than the edge you tend to want',
    frictionLow: 'carries more physical risk than you may be comfortable with',
  },
  risk_reputational: {
    positive: 'puts your name visibly on the outcome, which matches your tolerance for that exposure',
    frictionHigh: 'keeps you more in the background than you tend to want',
    frictionLow: 'puts more public accountability on you than you may be comfortable with',
  },
  uncertainty_tolerance: {
    positive: 'rarely tells you in advance how things will turn out, which matches your tolerance for that',
    frictionHigh: 'offers more certainty about outcomes than you tend to want',
    frictionLow: 'leaves outcomes less certain than you may be comfortable with',
  },
  anchor_general_management: {
    positive: 'puts you in charge of the whole operation, which fits your management anchor',
    frictionHigh: 'offers less scope of responsibility than you tend to want',
    frictionLow: 'expects more managerial responsibility than you may be reaching for',
  },
  anchor_entrepreneurship: {
    positive: 'means building something of your own, which fits your entrepreneurial anchor',
    frictionHigh: 'offers less ownership of what you build than you tend to want',
    frictionLow: 'expects more founder-level ownership than you may be reaching for',
  },
  anchor_security: {
    positive: 'offers the stability your security anchor is looking for',
    frictionHigh: 'is less stable than your security anchor tends to want',
    frictionLow: 'is more stable and settled than you may find satisfying',
  },
  anchor_technical_mastery: {
    positive: 'rewards deep, single-domain expertise, which fits your technical-mastery anchor',
    frictionHigh: 'offers less depth in one domain than you tend to want',
    frictionLow: 'expects deeper single-domain mastery than you may have built yet',
  },
  anchor_service_mission: {
    positive: 'is justified by a mission, which fits your service anchor',
    frictionHigh: 'is justified less by mission and more by its own terms than you tend to want',
    frictionLow: 'leans on mission more than you may personally need to find it worthwhile',
  },
  future_travel: {
    positive: 'matches how much you’ve protected travel as a future priority',
    frictionHigh: 'involves less travel than you’ve protected as a priority',
    frictionLow: 'involves more travel than you’ve prioritized',
  },
  future_family: {
    positive: 'leaves room for the family life you’ve protected as a future priority',
    frictionHigh: 'may leave less room for family life than you’ve prioritized',
    frictionLow: 'asks less of your time than your other priorities might use well',
  },
  future_ownership: {
    positive: 'matches how much you’ve protected ownership as a future priority',
    frictionHigh: 'offers less ownership of something lasting than you’ve prioritized',
    frictionLow: 'offers more ownership than you’ve necessarily prioritized',
  },
  future_leadership: {
    positive: 'matches how much you’ve protected being looked to for direction',
    frictionHigh: 'offers less of a leadership role than you’ve prioritized',
    frictionLow: 'expects more of a leadership role than you’ve necessarily prioritized',
  },
}

export function phrase(dimensionId: string, kind: 'positive' | 'frictionHigh' | 'frictionLow'): string {
  return DIMENSION_PHRASES[dimensionId]?.[kind] ?? `${FACET_BY_ID[dimensionId]?.label ?? dimensionId}: ${kind}`
}
