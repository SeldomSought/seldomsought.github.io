/**
 * Central registry of every scoreable facet: display label, which report
 * group it belongs under, and how many items content authors expect to
 * contribute to it (used for confidence calculation). This is the one place
 * that has to stay in sync when a new item is added for an existing facet —
 * everything else (scoring, results UI) reads from here.
 */
export interface FacetMeta {
  id: string
  label: string
  group: 'values' | 'personality' | 'needsAndTolerance' | 'desire' | 'interests' | 'strengths' | 'workEnvironment' | 'careerAnchors' | 'riskUncertainty' | 'futureSelf' | 'aspiration' | 'validityOnly'
  shortDescription: string
}

export const FACETS: FacetMeta[] = [
  // desire — bipolar tensions, each one facet on a 0–100 scale. 100 is
  // always the first-named pole, 0 the second (see content/instruments/desire.items.ts).
  { id: 'desire_freedom_certainty', label: 'Freedom vs. Certainty', group: 'desire', shortDescription: 'Designing your own path versus knowing what to expect.' },
  { id: 'desire_mastery_ease', label: 'Mastery vs. Ease', group: 'desire', shortDescription: 'Getting excellent at something hard versus staying in what already comes easily.' },
  { id: 'desire_status_privacy', label: 'Status vs. Privacy', group: 'desire', shortDescription: 'Being known for what you do versus keeping your life mostly unseen.' },
  { id: 'desire_wealth_leisure', label: 'Wealth vs. Leisure', group: 'desire', shortDescription: 'Greater income versus more time that’s actually your own.' },
  { id: 'desire_novelty_stability', label: 'Novelty vs. Stability', group: 'desire', shortDescription: 'Circumstances that keep changing versus circumstances that stay good once they’re good.' },
  { id: 'desire_impact_comfort', label: 'Impact vs. Comfort', group: 'desire', shortDescription: 'Taking on something that might change things versus steady, manageable work.' },
  { id: 'desire_belonging_independence', label: 'Belonging vs. Independence', group: 'desire', shortDescription: 'Being embedded in a group you answer to versus operating on your own.' },
  { id: 'desire_creation_consumption', label: 'Creation vs. Consumption', group: 'desire', shortDescription: 'Making things versus taking in what others have made.' },
  { id: 'desire_competition_harmony', label: 'Competition vs. Harmony', group: 'desire', shortDescription: 'Working best with a clear winner versus working best when no one’s keeping score.' },
  { id: 'desire_influence_anonymity', label: 'Influence vs. Anonymity', group: 'desire', shortDescription: 'Being the person decisions hinge on versus things running well without needing to point to you.' },
  { id: 'desire_adventure_predictability', label: 'Adventure vs. Predictability', group: 'desire', shortDescription: 'Unfamiliar and unplanned versus familiar and known.' },
  { id: 'desire_depth_variety', label: 'Depth vs. Variety', group: 'desire', shortDescription: 'Going deep on one or two things for years versus moving across many different things.' },

  // values
  { id: 'self_direction', label: 'Self-Direction', group: 'values', shortDescription: 'Independent thought and choice of one’s own path.' },
  { id: 'achievement', label: 'Achievement', group: 'values', shortDescription: 'Personal success through demonstrated competence.' },
  { id: 'benevolence', label: 'Benevolence', group: 'values', shortDescription: 'Concern for the welfare of people close to you.' },
  { id: 'security', label: 'Security', group: 'values', shortDescription: 'Safety, stability, and predictability.' },
  { id: 'stimulation', label: 'Stimulation', group: 'values', shortDescription: 'Novelty, excitement, and challenge.' },
  { id: 'universalism', label: 'Universalism', group: 'values', shortDescription: 'Understanding and welfare for people and the world broadly.' },
  { id: 'power', label: 'Power', group: 'values', shortDescription: 'Social status, influence, and control over resources.' },
  { id: 'conformity', label: 'Conformity', group: 'values', shortDescription: 'Restraint of actions that might upset or harm others or violate norms.' },

  // interests — RIASEC (Holland hexagon), each scored from relative
  // preference among concrete activities, never from "would you enjoy X career."
  { id: 'riasec_realistic', label: 'Realistic', group: 'interests', shortDescription: 'Drawn to hands-on, mechanical, physical activity over abstract or interpersonal work.' },
  { id: 'riasec_investigative', label: 'Investigative', group: 'interests', shortDescription: 'Drawn to analysis, research, and figuring out how things work.' },
  { id: 'riasec_artistic', label: 'Artistic', group: 'interests', shortDescription: 'Drawn to original creative expression over standardized procedure.' },
  { id: 'riasec_social', label: 'Social', group: 'interests', shortDescription: 'Drawn to teaching, helping, and working directly with people.' },
  { id: 'riasec_enterprising', label: 'Enterprising', group: 'interests', shortDescription: 'Drawn to persuading, leading, and taking on risk for influence or gain.' },
  { id: 'riasec_conventional', label: 'Conventional', group: 'interests', shortDescription: 'Drawn to order, structure, and working accurately within a system.' },

  // personality — Big Five, faceted (3 facets per domain)
  { id: 'intellectual_curiosity', label: 'Intellectual Curiosity', group: 'personality', shortDescription: 'Openness facet — appetite for ideas.' },
  { id: 'aesthetic_openness', label: 'Aesthetic Openness', group: 'personality', shortDescription: 'Openness facet — responsiveness to art, design, and form.' },
  { id: 'novelty_seeking', label: 'Novelty Seeking', group: 'personality', shortDescription: 'Openness facet — appetite for unfamiliar experiences, not just unfamiliar ideas.' },
  { id: 'orderliness', label: 'Orderliness', group: 'personality', shortDescription: 'Conscientiousness facet — orderliness of environment and process.' },
  { id: 'industriousness', label: 'Industriousness', group: 'personality', shortDescription: 'Conscientiousness facet — follow-through on commitments.' },
  { id: 'self_discipline', label: 'Self-Discipline', group: 'personality', shortDescription: 'Conscientiousness facet — sustaining effort against a pull toward something easier right now.' },
  { id: 'sociability', label: 'Sociability', group: 'personality', shortDescription: 'Extraversion facet — energy drawn from social contact.' },
  { id: 'assertiveness', label: 'Assertiveness', group: 'personality', shortDescription: 'Extraversion facet — directness in claiming space and voicing disagreement.' },
  { id: 'enthusiasm', label: 'Enthusiasm', group: 'personality', shortDescription: 'Extraversion facet — expressed positive energy, not just sociability.' },
  { id: 'compassion', label: 'Compassion', group: 'personality', shortDescription: 'Agreeableness facet — responsiveness to others’ distress or need.' },
  { id: 'trust', label: 'Trust', group: 'personality', shortDescription: 'Agreeableness facet — default assumption of good faith in others.' },
  { id: 'cooperativeness', label: 'Cooperativeness', group: 'personality', shortDescription: 'Agreeableness facet — willingness to yield in conflict rather than press an advantage.' },
  { id: 'anxiety', label: 'Anxiety', group: 'personality', shortDescription: 'Negative Emotionality facet — baseline worry and apprehension.' },
  { id: 'emotional_volatility', label: 'Emotional Volatility', group: 'personality', shortDescription: 'Negative Emotionality facet — how quickly and intensely mood shifts under stress.' },
  { id: 'self_consciousness', label: 'Self-Consciousness', group: 'personality', shortDescription: 'Negative Emotionality facet — sensitivity to perceived judgment from others.' },

  // strengths — four independent signals per domain (ease, ability, skill,
  // energy). Never collapsed into one "talent" number: see
  // engine/scoring/strengthsClassification.ts for how a domain's four
  // scores become one of five plain-language classifications.
  { id: 'strength_analytical_ease', label: 'Analytical — Natural Ease', group: 'strengths', shortDescription: 'How quickly diagnosing why something is going wrong came, relative to most people.' },
  { id: 'strength_analytical_ability', label: 'Analytical — Demonstrated Ability', group: 'strengths', shortDescription: 'How often others have actually sought you out to find out why something is going wrong.' },
  { id: 'strength_analytical_skill', label: 'Analytical — Trained Skill', group: 'strengths', shortDescription: 'Deliberate practice or training in diagnosis and analysis, beyond what was required.' },
  { id: 'strength_analytical_energy', label: 'Analytical — Energy', group: 'strengths', shortDescription: 'Whether a full day of analytical problem-solving tends to energize or drain you.' },

  { id: 'strength_mechanical_ease', label: 'Mechanical — Natural Ease', group: 'strengths', shortDescription: 'How quickly fixing or building physical things came, relative to most people.' },
  { id: 'strength_mechanical_ability', label: 'Mechanical — Demonstrated Ability', group: 'strengths', shortDescription: 'How often others have actually sought you out to fix or build something physical.' },
  { id: 'strength_mechanical_skill', label: 'Mechanical — Trained Skill', group: 'strengths', shortDescription: 'Deliberate practice or training in hands-on mechanical work, beyond what was required.' },
  { id: 'strength_mechanical_energy', label: 'Mechanical — Energy', group: 'strengths', shortDescription: 'Whether a full day of hands-on physical work tends to energize or drain you.' },

  { id: 'strength_creative_ease', label: 'Creative — Natural Ease', group: 'strengths', shortDescription: 'How quickly making original creative work came, relative to most people.' },
  { id: 'strength_creative_ability', label: 'Creative — Demonstrated Ability', group: 'strengths', shortDescription: 'How often others have actually sought out or used something you made because they valued it.' },
  { id: 'strength_creative_skill', label: 'Creative — Trained Skill', group: 'strengths', shortDescription: 'Deliberate practice or training in a creative craft, beyond what was required.' },
  { id: 'strength_creative_energy', label: 'Creative — Energy', group: 'strengths', shortDescription: 'Whether a full day of creative production tends to energize or drain you.' },

  { id: 'strength_interpersonal_ease', label: 'Interpersonal — Natural Ease', group: 'strengths', shortDescription: 'How quickly helping someone work through something difficult came, relative to most people.' },
  { id: 'strength_interpersonal_ability', label: 'Interpersonal — Demonstrated Ability', group: 'strengths', shortDescription: 'How often people have specifically sought you out, over others available, when something was difficult.' },
  { id: 'strength_interpersonal_skill', label: 'Interpersonal — Trained Skill', group: 'strengths', shortDescription: 'Deliberate practice or training in teaching, coaching, or counseling, beyond what was required.' },
  { id: 'strength_interpersonal_energy', label: 'Interpersonal — Energy', group: 'strengths', shortDescription: 'Whether a full day of helping people work through hard things tends to energize or drain you.' },

  { id: 'strength_persuasive_ease', label: 'Persuasive — Natural Ease', group: 'strengths', shortDescription: 'How quickly getting a room to agree with you came, relative to most people.' },
  { id: 'strength_persuasive_ability', label: 'Persuasive — Demonstrated Ability', group: 'strengths', shortDescription: 'How often you have actually changed a real decision by making the case yourself.' },
  { id: 'strength_persuasive_skill', label: 'Persuasive — Trained Skill', group: 'strengths', shortDescription: 'Deliberate practice or training in negotiation, sales, or public persuasion, beyond what was required.' },
  { id: 'strength_persuasive_energy', label: 'Persuasive — Energy', group: 'strengths', shortDescription: 'Whether a full day of negotiating or persuading tends to energize or drain you.' },

  { id: 'strength_organizational_ease', label: 'Organizational — Natural Ease', group: 'strengths', shortDescription: 'How quickly turning a messy system into something usable came, relative to most people.' },
  { id: 'strength_organizational_ability', label: 'Organizational — Demonstrated Ability', group: 'strengths', shortDescription: 'How often people have actually handed you a disorganized process because they trust you to fix it.' },
  { id: 'strength_organizational_skill', label: 'Organizational — Trained Skill', group: 'strengths', shortDescription: 'Deliberate practice or training in building organizational systems, beyond what was required.' },
  { id: 'strength_organizational_energy', label: 'Organizational — Energy', group: 'strengths', shortDescription: 'Whether a full day of organizing systems or information tends to energize or drain you.' },

  // work environment — 19 independent bipolar tensions, 100 is always the
  // first-named pole, 0 the second (see content/instruments/work.items.ts).
  // Autonomy, structure, and ambiguity are deliberately NOT re-measured here
  // — they're already covered by autonomy_need, structure_need, and
  // ambiguity_tolerance below, and asking near-identical questions twice
  // under a different label would just be worse data collection.
  { id: 'work_pace', label: 'Fast Pace vs. Steady Pace', group: 'workEnvironment', shortDescription: 'Moving quickly and adapting on the fly versus taking the time to get it right.' },
  { id: 'work_competition', label: 'Competition vs. No Comparison', group: 'workEnvironment', shortDescription: 'Being visibly ranked against peers versus never having your results compared to anyone else’s.' },
  { id: 'work_collaboration', label: 'Interdependent vs. Individually-Owned', group: 'workEnvironment', shortDescription: 'Making every real decision jointly versus owning a clearly defined piece on your own.' },
  { id: 'work_solitude_social', label: 'Solitude vs. Social Contact', group: 'workEnvironment', shortDescription: 'Spending most of the day working alone versus surrounded by people all day.' },
  { id: 'work_hierarchy', label: 'Clear Hierarchy vs. Flat Structure', group: 'workEnvironment', shortDescription: 'Needing sign-off from someone above you versus deciding things yourself with no one to defer to.' },
  { id: 'work_bureaucracy', label: 'Formal Process vs. Minimal Process', group: 'workEnvironment', shortDescription: 'Working through the approvals a decision technically requires versus just acting on it.' },
  { id: 'work_ownership', label: 'Sole Ownership vs. Shared Ownership', group: 'workEnvironment', shortDescription: 'Being the only name on an outcome versus sharing credit and blame with others.' },
  { id: 'work_feedback_frequency', label: 'Frequent Feedback vs. Infrequent Feedback', group: 'workEnvironment', shortDescription: 'Being evaluated on your work constantly versus going long stretches without knowing how you’re doing.' },
  { id: 'work_task_variety', label: 'Task Variety vs. Task Repetition', group: 'workEnvironment', shortDescription: 'Switching between different work versus doing the same core task for a long stretch.' },
  { id: 'work_physical_activity', label: 'Physically Active vs. Sedentary', group: 'workEnvironment', shortDescription: 'Being on your feet and moving versus sitting at a desk for the day.' },
  { id: 'work_remote', label: 'Remote vs. In-Person', group: 'workEnvironment', shortDescription: 'Never sharing a room with coworkers versus being physically present with the same people daily.' },
  { id: 'work_travel', label: 'Frequent Travel vs. Staying Put', group: 'workEnvironment', shortDescription: 'Regularly being away from home for work versus never leaving the same city for it.' },
  { id: 'work_public_interaction', label: 'Public Interaction vs. Known Group', group: 'workEnvironment', shortDescription: 'Dealing with a constant stream of strangers versus working with the same small, known group.' },
  { id: 'work_creative_freedom', label: 'Creative Freedom vs. Defined Process', group: 'workEnvironment', shortDescription: 'Inventing your own way to a goal versus following a process exactly as written.' },
  { id: 'work_measurable_outcomes', label: 'Measurable Outcomes vs. Hard-to-Quantify Value', group: 'workEnvironment', shortDescription: 'Work that produces a clean, countable number versus work whose value is real but hard to measure.' },
  { id: 'work_long_projects', label: 'Long Projects vs. Quick Turnaround', group: 'workEnvironment', shortDescription: 'Going deep on one thing for years versus wrapping things up completely within days or weeks.' },
  { id: 'work_short_feedback_loops', label: 'Short Feedback Loops vs. Long Feedback Loops', group: 'workEnvironment', shortDescription: 'Seeing the real outcome of a decision almost immediately versus not finding out for a long time.' },
  { id: 'work_predictability', label: 'Unpredictable Days vs. Predictable Days', group: 'workEnvironment', shortDescription: 'Not knowing what a day will actually involve versus every day looking much like the last.' },
  { id: 'work_mission_orientation', label: 'Mission-Driven vs. Work on Its Own Terms', group: 'workEnvironment', shortDescription: 'Work justified by a cause you believe in versus work justified by skill, craft, or pay alone.' },

  // career anchors — Schein's durable career priorities. Ipsative by
  // design (see content/instruments/careerAnchors.items.ts): every item is
  // a ranking or forced choice among anchors, never a rate-each-one-alone
  // question, so a respondent structurally cannot score maximally on all
  // eight. Read these as relative rank, not absolute magnitude.
  { id: 'anchor_technical_mastery', label: 'Technical Mastery', group: 'careerAnchors', shortDescription: 'Would rather be the most skilled person in the room than the one in charge of it.' },
  { id: 'anchor_general_management', label: 'General Management', group: 'careerAnchors', shortDescription: 'Would rather be responsible for the whole operation than the top expert in one piece of it.' },
  { id: 'anchor_autonomy', label: 'Autonomy', group: 'careerAnchors', shortDescription: 'Needs to set their own methods and schedule.' },
  { id: 'anchor_security', label: 'Security', group: 'careerAnchors', shortDescription: 'Values a stable, predictable position over a shot at something bigger.' },
  { id: 'anchor_entrepreneurship', label: 'Entrepreneurship', group: 'careerAnchors', shortDescription: 'Would rather build something of their own than take a strong role inside something already built.' },
  { id: 'anchor_service_mission', label: 'Service / Mission', group: 'careerAnchors', shortDescription: 'The work has to serve a cause they believe in, or it doesn’t feel worth doing.' },
  { id: 'anchor_challenge', label: 'Challenge', group: 'careerAnchors', shortDescription: 'Needs the problem itself to be hard, regardless of what else is good about the role.' },
  { id: 'anchor_lifestyle_integration', label: 'Lifestyle Integration', group: 'careerAnchors', shortDescription: 'How well work fits around the rest of life matters more than how far it could go.' },

  // risk & uncertainty — six newly-measured, domain-specific facets. Two
  // more appear in this region's results but are NOT re-measured here:
  // ambiguity_tolerance (below, under needs & tolerances) and
  // novelty_seeking (under personality) are already real, separately
  // measured constructs, and re-asking them under a "risk" label would
  // just be redundant — see content/instruments/riskUncertainty.items.ts.
  { id: 'risk_financial', label: 'Financial Risk Tolerance', group: 'riskUncertainty', shortDescription: 'Willingness to accept income variance or uncapped-but-uncertain pay over a flat guarantee.' },
  { id: 'risk_career', label: 'Career Risk Tolerance', group: 'riskUncertainty', shortDescription: 'Willingness to leave a stable job, field, or place for something less certain.' },
  { id: 'risk_social', label: 'Social Risk Tolerance', group: 'riskUncertainty', shortDescription: 'Willingness to say, ask, or admit something that might land badly.' },
  { id: 'risk_physical', label: 'Physical Risk Tolerance', group: 'riskUncertainty', shortDescription: 'Willingness to accept a real, if small, chance of physical harm.' },
  { id: 'risk_reputational', label: 'Reputational Risk', group: 'riskUncertainty', shortDescription: 'Willingness to be the visible, named person accountable if something goes publicly wrong.' },
  { id: 'uncertainty_tolerance', label: 'Uncertainty Tolerance', group: 'riskUncertainty', shortDescription: 'Comfort not knowing how something will actually turn out — distinct from ambiguity, which is about unclear structure rather than an unknown outcome.' },

  // future self — 15 elements of imagined life architecture, deliberately
  // never a job title. Scored ipsatively: the primary items are two
  // "preserve only 4 of 15" cascades (one imagining +5 years, one +10),
  // so the score reflects what someone would actually protect under real
  // scarcity, not what they'd rate "important" with nothing on the line —
  // see content/instruments/futureSelf.items.ts.
  { id: 'future_where_live', label: 'Where You Live', group: 'futureSelf', shortDescription: 'Living somewhere chosen for how it fits you, not just where a job put you.' },
  { id: 'future_ownership', label: 'Ownership', group: 'futureSelf', shortDescription: 'Owning something real and lasting, rather than only ever earning against it.' },
  { id: 'future_schedule', label: 'Control of Schedule', group: 'futureSelf', shortDescription: 'Setting your own days on your own terms.' },
  { id: 'future_wealth', label: 'Wealth', group: 'futureSelf', shortDescription: 'Enough real financial cushion that money stops being a daily concern.' },
  { id: 'future_community', label: 'Community', group: 'futureSelf', shortDescription: 'Being genuinely known and rooted among a fixed group of people.' },
  { id: 'future_family', label: 'Family', group: 'futureSelf', shortDescription: 'Having built and protected the family life you actually want.' },
  { id: 'future_prestige', label: 'Prestige', group: 'futureSelf', shortDescription: 'Being visibly respected and recognized by people whose opinion matters to you.' },
  { id: 'future_creative_output', label: 'Creative Output', group: 'futureSelf', shortDescription: 'Having made something that’s yours and outlasts the job that paid for it.' },
  { id: 'future_physical_activity', label: 'Physical Activity', group: 'futureSelf', shortDescription: 'Being physically capable and active, not just healthy enough to get by.' },
  { id: 'future_social_density', label: 'Social Density', group: 'futureSelf', shortDescription: 'A full, busy social world with a lot of people in your life.' },
  { id: 'future_travel', label: 'Travel', group: 'futureSelf', shortDescription: 'Having seen and lived in more of the world than most people around you.' },
  { id: 'future_leadership', label: 'Leadership', group: 'futureSelf', shortDescription: 'Being the person others look to and depend on for direction.' },
  { id: 'future_freedom', label: 'Freedom', group: 'futureSelf', shortDescription: 'Being able to walk away from any given commitment without it wrecking your life.' },
  { id: 'future_responsibility', label: 'Responsibility', group: 'futureSelf', shortDescription: 'Carrying real weight — people and decisions others are counting on you for.' },
  { id: 'future_expertise', label: 'Expertise', group: 'futureSelf', shortDescription: 'Being deeply expert at one specific thing.' },

  // aspiration — a deliberately small (6-item) current-vs-desired layer.
  // Only the CURRENT half is scored here, the same as any other self-report
  // item; DESIRED and the gap are never blended into this facet's score —
  // see engine/scoring/aspirationalGaps.ts, which reads the raw response
  // directly instead. This facet's score IS "demonstrated identity"; the
  // desired/gap readout lives entirely in that separate computation.
  { id: 'aspire_responsibility', label: 'Comfort Owning Uncertain Outcomes', group: 'aspiration', shortDescription: 'Comfortable taking responsibility for outcomes that weren’t certain to go well.' },
  { id: 'aspire_creative_expression', label: 'Unprompted Creative Expression', group: 'aspiration', shortDescription: 'Makes things for their own sake, not because anyone asked.' },
  { id: 'aspire_leadership', label: 'Sought-Out for Direction', group: 'aspiration', shortDescription: 'The person others look to for direction when things get uncertain.' },
  { id: 'aspire_assertive_voice', label: 'Speaking Up in Disagreement', group: 'aspiration', shortDescription: 'Speaks up when disagreeing with people whose opinion matters to them.' },
  { id: 'aspire_expertise', label: 'Depth of Specific Expertise', group: 'aspiration', shortDescription: 'Has built deep, specific expertise few people nearby can match.' },
  { id: 'aspire_financial_risk', label: 'Real Financial Risk-Taking', group: 'aspiration', shortDescription: 'Takes real financial risk in pursuit of a bigger payoff.' },

  // needs & tolerances
  { id: 'autonomy_need', label: 'Autonomy Need', group: 'needsAndTolerance', shortDescription: 'How much self-direction you require to function well.' },
  { id: 'structure_need', label: 'Structure Need', group: 'needsAndTolerance', shortDescription: 'How much explicit process and clarity you require to function well.' },
  { id: 'risk_tolerance', label: 'Risk Tolerance', group: 'needsAndTolerance', shortDescription: 'Willingness to accept a chance of a bad outcome for a shot at a better one.' },
  { id: 'ambiguity_tolerance', label: 'Ambiguity Tolerance', group: 'needsAndTolerance', shortDescription: 'Comfort operating without a clean, settled answer.' },

  // validity-only — never rendered as a report row
  { id: 'aspirational_gap_confidence', label: 'Self-Report Confidence', group: 'validityOnly', shortDescription: 'Respondent’s own confidence that prior answers were accurate rather than aspirational.' },
]

export const FACET_BY_ID: Record<string, FacetMeta> = Object.fromEntries(
  FACETS.map((f) => [f.id, f]),
)

/** Domain rollups computed from facet averages — not directly item-scored. */
export const PERSONALITY_DOMAINS: { id: string; label: string; facetIds: string[] }[] = [
  { id: 'openness', label: 'Openness', facetIds: ['intellectual_curiosity', 'aesthetic_openness', 'novelty_seeking'] },
  { id: 'conscientiousness', label: 'Conscientiousness', facetIds: ['orderliness', 'industriousness', 'self_discipline'] },
  { id: 'extraversion', label: 'Extraversion', facetIds: ['sociability', 'assertiveness', 'enthusiasm'] },
  { id: 'agreeableness', label: 'Agreeableness', facetIds: ['compassion', 'trust', 'cooperativeness'] },
  { id: 'negativeEmotionality', label: 'Negative Emotionality', facetIds: ['anxiety', 'emotional_volatility', 'self_consciousness'] },
]

/**
 * The six concrete strength domains, each carrying its own ease/ability/
 * skill/energy facet — the four axes classifyStrengths() reads to produce
 * one of five plain-language labels per domain.
 */
export const STRENGTH_DOMAINS: {
  id: string
  label: string
  easeFacetId: string
  abilityFacetId: string
  skillFacetId: string
  energyFacetId: string
}[] = [
  { id: 'analytical', label: 'Analytical Problem-Solving', easeFacetId: 'strength_analytical_ease', abilityFacetId: 'strength_analytical_ability', skillFacetId: 'strength_analytical_skill', energyFacetId: 'strength_analytical_energy' },
  { id: 'mechanical', label: 'Mechanical & Hands-On Work', easeFacetId: 'strength_mechanical_ease', abilityFacetId: 'strength_mechanical_ability', skillFacetId: 'strength_mechanical_skill', energyFacetId: 'strength_mechanical_energy' },
  { id: 'creative', label: 'Creative Production', easeFacetId: 'strength_creative_ease', abilityFacetId: 'strength_creative_ability', skillFacetId: 'strength_creative_skill', energyFacetId: 'strength_creative_energy' },
  { id: 'interpersonal', label: 'Teaching & Interpersonal Support', easeFacetId: 'strength_interpersonal_ease', abilityFacetId: 'strength_interpersonal_ability', skillFacetId: 'strength_interpersonal_skill', energyFacetId: 'strength_interpersonal_energy' },
  { id: 'persuasive', label: 'Persuasion & Negotiation', easeFacetId: 'strength_persuasive_ease', abilityFacetId: 'strength_persuasive_ability', skillFacetId: 'strength_persuasive_skill', energyFacetId: 'strength_persuasive_energy' },
  { id: 'organizational', label: 'Organizing & Systems', easeFacetId: 'strength_organizational_ease', abilityFacetId: 'strength_organizational_ability', skillFacetId: 'strength_organizational_skill', energyFacetId: 'strength_organizational_energy' },
]
