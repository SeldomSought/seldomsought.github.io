/**
 * Core data model for the assessment engine.
 *
 * Nothing in this file renders anything. Regions/instruments/items are pure
 * content; components read them, they never define them. Adding a question
 * means adding a row in content/instruments/*.items.ts — never touching a
 * component.
 */

/**
 * How direct a piece of evidence is. Matches schema/content.ts's vocabulary
 * exactly (this is the first real piece of that forward-looking schema
 * migrating into the active engine) — 'behavioral' evidence is what
 * BehavioralHistoryItem produces, and is what engine/scoring/index.ts uses
 * to boost a facet's confidence beyond what item-count alone would justify.
 */
export type EvidenceStrength = 'self-report' | 'behavioral' | 'inferred' | 'stated-preference'

export type RegionId =
  | 'orientation'
  | 'desire'
  | 'values'
  | 'interests'
  | 'temperament'
  | 'strengths'
  | 'work'
  | 'careerAnchors'
  | 'riskUncertainty'
  | 'relationships'
  | 'constraints'
  | 'future'
  | 'aspiration'
  | 'synthesis'

export interface Region {
  id: RegionId
  order: number
  label: string
  /** One line, shown on the region map. Never a raw item count. */
  description: string
  /** Short field-notebook-style marginal note, e.g. a bearing or coordinate label. */
  marginalia: string
  /** Whether this region has any real content wired up yet (Phase 1 vs deferred). */
  implemented: boolean
}

export type ItemFormat =
  | 'likert5'
  | 'likertFrequency'
  | 'forcedChoiceRank'
  | 'tradeoff'
  | 'ranking'
  | 'scenario'
  | 'behavioralHistory'
  | 'confidence'
  | 'evidencePrompt'
  | 'openText'
  | 'aspirationalPair'

export interface LikertOption {
  value: number
  label: string
}

interface StatementItemBase {
  id: string
  instrumentId: string
  facetId: string
  prompt: string
  options: LikertOption[]
  evidenceStrength?: EvidenceStrength
}

/**
 * A single scoreable statement — used by likert5, likertFrequency,
 * confidence. `reverseScored` is only ever type-valid on a likert5 item —
 * contributions.ts's scoring only ever applies it there (reversing a
 * frequency or self-rated-confidence scale isn't the same well-understood
 * operation as reversing an agreement scale, so it's never been
 * implemented for those two formats). This used to be a single flat
 * interface where `reverseScored?: boolean` was type-legal on all three
 * formats — inviting a content author to set it on a likertFrequency or
 * confidence item and have it silently no-op, corrupting that facet with
 * no warning. Narrowed to a discriminated union so that's now a compile
 * error instead of a latent trap.
 */
export type StatementItem =
  | (StatementItemBase & { format: 'likert5'; reverseScored?: boolean })
  | (StatementItemBase & { format: 'likertFrequency' | 'confidence' })

export interface TradeoffOption {
  label: string
  facetId: string
  /** Only meaningful when both options share one facetId (a bipolar tension,
   *  e.g. freedom vs. certainty as one "desire_freedom_certainty" scale) —
   *  where this option lands on that facet's 0–100 range if chosen. Omitted
   *  for the ordinary case of two options on two different facets, where
   *  the chosen one simply scores 100 and the other 0. */
  poleValue?: number
}

/** Two-way tradeoff — forces a choice between two facet-linked statements. */
export interface TradeoffItem {
  id: string
  format: 'tradeoff'
  instrumentId: string
  prompt: string
  optionA: TradeoffOption
  optionB: TradeoffOption
  evidenceStrength?: EvidenceStrength
}

/** Rank 3 (or more) statements from most to least like the respondent. */
export interface ForcedChoiceItem {
  id: string
  format: 'forcedChoiceRank'
  instrumentId: string
  prompt: string
  statements: { id: string; label: string; facetId: string }[]
  evidenceStrength?: EvidenceStrength
}

export interface RankingOption {
  id: string
  label: string
  weight: number
  /** Per-option override — when a ranking pool spans several facets (a
   *  values card-sort, not a single-construct ranking), each option names
   *  its own target. Falls back to the item's own facetId when omitted. */
  facetId?: string
}

/** Free ranking of a set of items, not necessarily facet-scored 1:1. */
export interface RankingItem {
  id: string
  format: 'ranking'
  instrumentId: string
  /** Fallback target for options that don't set their own facetId. */
  facetId: string
  prompt: string
  options: RankingOption[]
  /** When set (and less than options.length), the respondent first picks
   *  exactly this many options, then ranks only that subset — e.g. "pick 3
   *  of these 9, then order them." Omitted or absent: rank every option.
   *  Ignored when selectCascade is set. */
  selectCount?: number
  /** Multi-stage narrowing before ranking — e.g. [5, 3] means "choose 5
   *  from the full pool, then narrow to 3 (framed as eliminating 2), then
   *  rank the final 3." The first stage is choose-framed; every stage after
   *  the first is eliminate-framed, which surfaces different information
   *  than "just pick your top 3" would (loss aversion isn't symmetric with
   *  selection). Takes precedence over selectCount. */
  selectCascade?: number[]
  evidenceStrength?: EvidenceStrength
}

export interface ScenarioChoice {
  id: string
  /** Short title when `attributes` is used (e.g. "Job A"); the full sentence otherwise. */
  label: string
  /** Optional bullet points, for a structured side-by-side comparison rather than a plain sentence choice. */
  attributes?: string[]
  weight: number
}

/**
 * Scenario / situational-judgment decision. Reveals a preference
 * indirectly — through a concrete tradeoff, not a direct self-rating.
 * `variables` lets a scenario or attribute string reference `{{key}}`
 * placeholders for optional contextual substitution (see interpolate() in
 * ScenarioItemView.tsx); a missing key just leaves the placeholder visible
 * rather than throwing.
 */
export interface ScenarioItem {
  id: string
  format: 'scenario'
  instrumentId: string
  facetId: string
  scenario: string
  choices: ScenarioChoice[]
  variables?: Record<string, string>
  evidenceStrength?: EvidenceStrength
}

/** What a scenario item actually stores: the pick, and how sure they were about it. */
export interface ScenarioResponseValue {
  choiceId: string
  confidence: number
}

/**
 * A question about demonstrated behavior, not self-image — designed to
 * separate identity narratives ("I'm the kind of person who...") from what
 * actually happened. Two answer shapes:
 *
 *  'scale'       (default) — an ordered frequency/count-bucket scale,
 *                rendered as a gauge (RatingScaleItem). Use for anything
 *                genuinely ordinal: "how many," "how often."
 *  'categorical' — an unordered pick-one, rendered as plain chips with no
 *                implied ranking (CategoricalHistoryItemView). Use for
 *                "which of these," where the options aren't a scale.
 *
 * Both carry an optional written elaboration as a *separate*, immediately
 * following EvidencePromptItem in content order — never a mandatory field
 * on this item, and never blocking advancement, per "optional written
 * elaboration should never be mandatory unless essential."
 */
export interface BehavioralHistoryScaleItem {
  id: string
  format: 'behavioralHistory'
  answerMode?: 'scale'
  instrumentId: string
  facetId: string
  prompt: string
  options: LikertOption[]
  /** Optional: id of a StatementItem this can be checked against for self/behavior gaps. */
  contrastsWithItemId?: string
  evidenceStrength?: EvidenceStrength
}

export interface BehavioralHistoryCategoricalItem {
  id: string
  format: 'behavioralHistory'
  answerMode: 'categorical'
  instrumentId: string
  facetId: string
  prompt: string
  options: { id: string; label: string; weight: number }[]
  contrastsWithItemId?: string
  evidenceStrength?: EvidenceStrength
}

export type BehavioralHistoryItem = BehavioralHistoryScaleItem | BehavioralHistoryCategoricalItem

/** Optional short written response — never scored, only ever shown back to the user. */
export interface EvidencePromptItem {
  id: string
  /** When this is the optional elaboration for a preceding behavioral-evidence
   *  item, the id of that item — documentation only, not required for the
   *  navigation flow (which already treats this format as optional/skippable). */
  relatedItemId?: string
  format: 'evidencePrompt' | 'openText'
  instrumentId: string
  prompt: string
  optional: true
}

/**
 * Aspirational-self layer: one statement, asked twice — how much it
 * describes you now, and how much you'd like it to. Only the "current"
 * half feeds the item's own facetId through the normal scoring pipeline
 * (an ordinary self-report contribution); the "desired" half and the gap
 * between them are never blended into that facet's score — see
 * engine/scoring/aspirationalGaps.ts, which reads the raw response
 * directly rather than through contributions.ts. Use sparingly: this
 * doubles the answering effort for whatever it's applied to.
 */
export interface AspirationalPairItem {
  id: string
  format: 'aspirationalPair'
  instrumentId: string
  facetId: string
  prompt: string
  options: LikertOption[]
  /** What this statement is a close proxy for elsewhere in the
   *  assessment, shown in the results copy — documentation only, not
   *  used by any scoring logic. */
  relatedFacetId?: string
  evidenceStrength?: EvidenceStrength
}

/** What an aspirationalPair item stores: both ratings of the same statement. */
export interface AspirationalResponseValue {
  current: number
  desired: number
}

export type Item =
  | StatementItem
  | TradeoffItem
  | ForcedChoiceItem
  | RankingItem
  | ScenarioItem
  | BehavioralHistoryItem
  | EvidencePromptItem
  | AspirationalPairItem

export interface Instrument {
  id: string
  label: string
  regionId: RegionId
  /** Facet ids this instrument produces scores for, in report display order. */
  facetIds: string[]
}

/** One saved answer. Timing/revisit data feeds validity.ts. */
export interface Response {
  itemId: string
  /** Shape depends on format: number (likert/confidence), string (tradeoff/ranking choice id),
   *  string[] (forcedChoiceRank/ranking order, most→least), string (openText/evidencePrompt),
   *  ScenarioResponseValue (scenario — choice plus confidence),
   *  AspirationalResponseValue (aspirationalPair — current plus desired). */
  value: number | string | string[] | ScenarioResponseValue | AspirationalResponseValue
  firstAnsweredAt: number
  lastAnsweredAt: number
  responseTimeMs: number
  revisitCount: number
}

export type ConfidenceLevel = 'High' | 'Medium' | 'Low'

/**
 * The full metadata contract every scored construct carries — never just a
 * bare number. `score` is internally interpretable (0-100), not a claimed
 * population percentile: nothing in this codebase has ever seen enough
 * respondents to support one, and the UI must never phrase it as one.
 */
export interface FacetScore {
  facetId: string
  label: string
  /** 0-100, internally interpretable — never a claimed population percentile. */
  score: number
  confidence: ConfidenceLevel
  /** How many answered items contributed to this score. */
  evidenceCount: number
  /** How many items COULD have contributed, answered or not — evidenceCount / itemsExpected is what confidence is based on. */
  itemsExpected: number
  /** Of evidenceCount, how many came from evidenceStrength: 'behavioral' items rather than self-report. */
  behavioralEvidenceCount: number
  /** 0-100 — agreement among this construct's own contributing evidence
   *  (100 minus the spread between its highest- and lowest-pointing
   *  contributions). Defined as 100 when there's 0 or 1 data point:
   *  nothing to disagree about yet, not "verified consistent." */
  internalConsistency: number
  /** How many validity-flagged contradictions (reverse-item disagreement,
   *  self-report-vs-behavioral gap) name this construct specifically. */
  contradictionCount: number
}

export interface ValidityFlag {
  id: string
  severity: 'note' | 'flag'
  label: string
  detail: string
  /** Facet ids whose confidence should be dampened because of this flag. */
  relatedFacetIds?: string[]
}

export interface DomainReport {
  facetScores: Record<string, FacetScore>
  validityFlags: ValidityFlag[]
}
