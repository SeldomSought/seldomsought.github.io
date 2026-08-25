import { useMemo, useEffect, useRef, useState, useCallback, useContext, createContext, type ReactNode } from 'react'
import { track } from '../../engine/analytics'
import { useAssessment } from '../../engine/state'
import { scoreAssessment } from '../../engine/scoring'
import { matchCareers } from '../../engine/scoring/careerMatch'
import { evaluatePoorFits } from '../../engine/scoring/poorFitArchetypes'
import { detectUnconventionalPaths } from '../../engine/scoring/unconventionalPaths'
import { identifyCoreDrivers } from '../../engine/scoring/coreDrivers'
import { buildEnergyMap, summarizeEnergyMap } from '../../engine/scoring/energyMap'
import { classifyStrengthQuadrants, quadrantByFacetId } from '../../engine/scoring/strengthQuadrant'
import { buildEnvironmentSpec } from '../../engine/scoring/environmentSpec'
import { buildCareerHypotheses, planExperiments } from '../../engine/scoring/careerExperiments'
import { compareSnapshots } from '../../engine/scoring/stability'
import { loadHistory } from '../../engine/persistence'
import { computeValuesEvidenceBreakdown } from '../../engine/scoring/valuesEvidence'
import { classifyStrengths } from '../../engine/scoring/strengthsClassification'
import { computeFutureSelfStability } from '../../engine/scoring/futureSelfStability'
import { detectContradictions } from '../../engine/scoring/contradictions'
import { analyzeProfileRelationships } from '../../engine/scoring/synthesis'
import { computeAspirationGaps } from '../../engine/scoring/aspirationalGaps'
import { computeResponseQuality } from '../../engine/scoring/responseQuality'
import { computeConstructConfidence } from '../../engine/scoring/constructConfidence'
import { getLocalCareersSync } from '../../content/careers/occupationDataSource'
import { PERSONALITY_DOMAINS } from '../../content/facets'
import { ITEMS_BY_ID } from '../../content/instruments'
import type { EvidencePromptItem } from '../../engine/types'
import { buildFutureSelfNarrative } from '../../content/copy/synthesize'
import { ContourLines } from '../motifs/ContourLines'
import { EmergingMap } from '../motifs/EmergingMap'
import { coordinateSignature } from '../motifs/emergingMapGraph'
import { Continuum } from './Continuum'
import { RadarDiagram } from './RadarDiagram'
import { CareerFitCard } from './CareerFitCard'
import { CareerExplorer } from './CareerExplorer'
import { PoorFitCard } from './PoorFitCard'
import { UnconventionalPathCard } from './UnconventionalPathCard'
import { CoreDriverCard } from './CoreDriverCard'
import { ValuesAgreementPanel } from './ValuesAgreementPanel'
import { StrengthCard } from './StrengthCard'
import { EnergyMapPanel } from './EnergyMapPanel'
import { StrengthQuadrantMap } from './StrengthQuadrantMap'
import { EnvironmentSpecPanel } from './EnvironmentSpecPanel'
import { CareerExperimentsPanel } from './CareerExperimentsPanel'
import { RetestingComparisonPanel } from './RetestingComparisonPanel'
import { ContradictionCard } from './ContradictionCard'
import { ConvergenceCard } from './ConvergenceCard'
import { TensionCard } from './TensionCard'
import { AspirationGapCard } from './AspirationGapCard'
import { ResponseQualityReport } from './ResponseQualityReport'
import { ConstructConfidenceTable } from './ConstructConfidenceTable'
import { ProfilePortrait } from './ProfilePortrait'
import styles from './results.module.css'

const DESIRE_ORDER = [
  'desire_freedom_certainty', 'desire_mastery_ease', 'desire_status_privacy', 'desire_wealth_leisure',
  'desire_novelty_stability', 'desire_impact_comfort', 'desire_belonging_independence', 'desire_creation_consumption',
  'desire_competition_harmony', 'desire_influence_anonymity', 'desire_adventure_predictability', 'desire_depth_variety',
]
const VALUES_ORDER = ['self_direction', 'achievement', 'benevolence', 'security', 'stimulation', 'universalism', 'power', 'conformity']
const INTERESTS_ORDER = ['riasec_realistic', 'riasec_investigative', 'riasec_artistic', 'riasec_social', 'riasec_enterprising', 'riasec_conventional']
const PERSONALITY_FACET_ORDER = ['intellectual_curiosity', 'aesthetic_openness', 'novelty_seeking', 'orderliness', 'industriousness', 'self_discipline', 'sociability', 'assertiveness', 'enthusiasm', 'compassion', 'trust', 'cooperativeness', 'anxiety', 'emotional_volatility', 'self_consciousness']
const NEEDS_ORDER = ['autonomy_need', 'structure_need', 'risk_tolerance', 'ambiguity_tolerance']
const WORK_ORDER = [
  'work_pace', 'work_competition', 'work_collaboration', 'work_solitude_social',
  'work_hierarchy', 'work_bureaucracy', 'work_ownership', 'work_feedback_frequency',
  'work_task_variety', 'work_physical_activity', 'work_remote', 'work_travel',
  'work_public_interaction', 'work_creative_freedom', 'work_measurable_outcomes',
  'work_long_projects', 'work_short_feedback_loops', 'work_predictability', 'work_mission_orientation',
]
const CAREER_ANCHOR_ORDER = [
  'anchor_technical_mastery', 'anchor_general_management', 'anchor_autonomy', 'anchor_security',
  'anchor_entrepreneurship', 'anchor_service_mission', 'anchor_challenge', 'anchor_lifestyle_integration',
]
const RISK_ORDER = ['risk_financial', 'risk_career', 'risk_social', 'risk_physical', 'risk_reputational', 'uncertainty_tolerance']
const RISK_RELATED_ORDER = ['ambiguity_tolerance', 'novelty_seeking']
const FUTURE_SELF_ORDER = [
  'future_where_live', 'future_ownership', 'future_schedule', 'future_wealth', 'future_community',
  'future_family', 'future_prestige', 'future_creative_output', 'future_physical_activity', 'future_social_density',
  'future_travel', 'future_leadership', 'future_freedom', 'future_responsibility', 'future_expertise',
]

interface TocEntry {
  id: string
  eyebrow: string
}

// Sections self-register into this rather than the page hand-maintaining a
// second, parallel list of "every section, in order" — several of the 28
// below are conditionally omitted (no career data, no prior snapshot to
// retest against, etc.), and a hand-authored table of contents would
// silently drift out of sync with what actually rendered, showing dead
// links. This way the jump-menu can only ever list a section that's
// actually on the page.
const ResultsNavContext = createContext<((entry: TocEntry) => void) | null>(null)

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '')
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  const viewed = useRef(false)
  const id = useMemo(() => slugify(eyebrow), [eyebrow])
  const register = useContext(ResultsNavContext)

  useEffect(() => {
    register?.({ id, eyebrow })
  }, [register, id, eyebrow])

  // "Results exploration" only means something if it reflects what a
  // reader actually scrolled to, not what merely got rendered — every
  // section mounts at once on this page, so a mount-time event here would
  // just be a slower way of re-stating "the results page loaded."
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !viewed.current) {
          viewed.current = true
          track({ type: 'results_section_view', section: eyebrow })
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [eyebrow])

  return (
    <section ref={ref} id={id} className={styles.section}>
      <div className={styles.sectionLabel}>{eyebrow}</div>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.sectionRule}><ContourLines seed={eyebrow} /></div>
      {children}
    </section>
  )
}

/** A collapsed-by-default jump-menu, sticky just below JourneyShell's own
 *  header, so any of the 28 sections below — Career Fit included, which
 *  otherwise sits 24 sections deep in one unbroken scroll — is reachable
 *  in two taps from anywhere on the page. */
function ResultsSectionNav({ entries }: { entries: TocEntry[] }) {
  const [open, setOpen] = useState(false)
  if (entries.length === 0) return null

  return (
    <div className={styles.resultsNav}>
      <button type="button" className={styles.resultsNavTrigger} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        Jump to section <span className={styles.resultsNavCaret} aria-hidden="true">▾</span>
      </button>
      {open && (
        <nav className={styles.resultsNavPanel} aria-label="Jump to a report section">
          {entries.map((entry) => (
            <a key={entry.id} href={`#${entry.id}`} className={styles.resultsNavRow} onClick={() => setOpen(false)}>
              {entry.eyebrow}
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}

export function ResultsReport() {
  const { state } = useAssessment()
  const { responses } = state

  const [tocEntries, setTocEntries] = useState<TocEntry[]>([])
  const registeredIds = useRef<Set<string>>(new Set())
  const registerSection = useCallback((entry: TocEntry) => {
    if (registeredIds.current.has(entry.id)) return
    registeredIds.current.add(entry.id)
    setTocEntries((prev) => [...prev, entry])
  }, [])

  const report = useMemo(() => scoreAssessment(responses), [responses])
  const { facetScores } = report
  const responseQuality = useMemo(() => computeResponseQuality(responses, facetScores), [responses, facetScores])
  const constructConfidences = useMemo(() => Object.values(computeConstructConfidence(facetScores, responses)), [facetScores, responses])

  // Same session seed used on the region map — the completed map is the
  // same one that was forming the whole way through, not a new shape swapped in.
  const signatureSeed = String(state.startedAt)

  // RETESTING ARCHITECTURE: the most recent PRIOR completed profile this
  // device has archived, excluding the one this very completion just
  // wrote (see App.tsx's archive-on-completion effect) — null for every
  // first-time completion, which is most of them; this section only ever
  // renders once a respondent has genuinely retaken.
  const priorSnapshot = useMemo(
    () => loadHistory().filter((s) => s.completedAt !== state.completedAt).at(-1) ?? null,
    [state.completedAt],
  )
  const stabilityComparison = useMemo(
    () => (priorSnapshot ? compareSnapshots(priorSnapshot.facetScores, facetScores) : null),
    [priorSnapshot, facetScores],
  )

  const careerResults = useMemo(() => matchCareers(facetScores, getLocalCareersSync()), [facetScores])
  const strongFits = careerResults.slice(0, 5)
  const strongIds = new Set(strongFits.map((r) => r.career.id))
  // Mid-range real occupations from the same database, decent-not-top
  // fits worth a second look — deliberately NOT called "unconventional"
  // anymore, so that name is free for the dedicated engine below, which is
  // about something categorically different (career structures, not titles).
  const secondLookFits = careerResults.filter(
    (r) => !strongIds.has(r.career.id) && r.fitScore >= 40 && r.fitScore <= 64 && r.strengths.length >= 2,
  ).slice(0, 2)

  // Environment ARCHETYPES the profile's own responses point away from —
  // deliberately separate from the real-occupation fit list above: a poor
  // match here names a recognizable pattern of friction (highly procedural
  // compliance work, very low autonomy, and so on), not a specific job
  // title penalized for a low score.
  const poorFitArchetypes = useMemo(() => evaluatePoorFits(facetScores), [facetScores])

  // CAREER STRUCTURES (portfolio career, consulting, independent operator,
  // and so on) detected from trait convergence — not job titles, and not
  // limited to what's in the occupation database above. Standard
  // assessments overrecommend known titles because titles are what
  // occupational data indexes; this is the other axis entirely.
  const unconventionalPaths = useMemo(() => detectUnconventionalPaths(facetScores), [facetScores])

  const contradictions = useMemo(() => detectContradictions(facetScores, responses), [facetScores, responses])
  const profileRelationships = useMemo(() => analyzeProfileRelationships(facetScores), [facetScores])

  // The 3-6 strongest motivational forces — a named vocabulary (Autonomy,
  // Mastery, Influence, and so on), each surfaced only on real convergence
  // across several independently scored facets, never from one strong trait.
  const coreDrivers = useMemo(() => identifyCoreDrivers(facetScores, responses), [facetScores, responses])

  const desireScores = DESIRE_ORDER.map((id) => facetScores[id]).filter(Boolean)
  const valueScores = VALUES_ORDER.map((id) => facetScores[id]).filter(Boolean)
  const interestScores = INTERESTS_ORDER.map((id) => facetScores[id]).filter(Boolean)
  const valuesEvidence = useMemo(() => computeValuesEvidenceBreakdown(VALUES_ORDER, responses), [responses])
  const personalityFacets = PERSONALITY_FACET_ORDER.map((id) => facetScores[id]).filter(Boolean)
  const personalityDomains = PERSONALITY_DOMAINS.map((d) => facetScores[d.id]).filter(Boolean)
  const personalityFacetsByDomain = PERSONALITY_DOMAINS.map((d) => ({
    domain: d,
    facets: d.facetIds.map((id) => facetScores[id]).filter(Boolean),
  })).filter((g) => g.facets.length > 0)
  const needScores = NEEDS_ORDER.map((id) => facetScores[id]).filter(Boolean)
  const workScores = WORK_ORDER.map((id) => facetScores[id]).filter(Boolean)
  const strengthResults = useMemo(() => classifyStrengths(facetScores), [facetScores])
  const strengthQuadrantMap = useMemo(() => classifyStrengthQuadrants(strengthResults), [strengthResults])
  const strengthQuadrantLookup = useMemo(() => quadrantByFacetId(strengthQuadrantMap), [strengthQuadrantMap])
  const energyMap = useMemo(() => buildEnergyMap(facetScores), [facetScores])
  const environmentSpec = useMemo(() => buildEnvironmentSpec(facetScores), [facetScores])

  // Introspection can only produce hypotheses, never verdicts — this is
  // where the report proposes cheap, real-world tests for its own
  // strongest claims instead of asking the respondent to just trust them.
  const experimentPlans = useMemo(
    () => planExperiments(buildCareerHypotheses(strongFits.slice(0, 3), unconventionalPaths.slice(0, 2))),
    [strongFits, unconventionalPaths],
  )
  const energyMapSummary = summarizeEnergyMap(energyMap)
  // Ipsative — ranked by relative score, not the fixed canonical order the
  // other sections use, since rank order is the whole point of the measure.
  const anchorScores = CAREER_ANCHOR_ORDER.map((id) => facetScores[id]).filter(Boolean).sort((a, b) => b.score - a.score)
  const riskScores = RISK_ORDER.map((id) => facetScores[id]).filter(Boolean)
  const riskRelatedScores = RISK_RELATED_ORDER.map((id) => facetScores[id]).filter(Boolean)
  const futureSelfScores = FUTURE_SELF_ORDER.map((id) => facetScores[id]).filter(Boolean).sort((a, b) => b.score - a.score)
  const futureSelfStability = useMemo(() => computeFutureSelfStability(responses, facetScores), [responses, facetScores])
  const futureSelfNarrative = buildFutureSelfNarrative(futureSelfStability)
  const aspirationGaps = useMemo(() => computeAspirationGaps(responses), [responses])

  const ownWords = ['ori-open-1', 'ori-evi-1', 'str-open-1', 'wk-open-1', 'anc-open-1', 'risk-open-1', 'fut-open-1']
    .map((id) => ({ item: ITEMS_BY_ID[id] as EvidencePromptItem | undefined, response: responses[id] }))
    .filter((x): x is { item: EvidencePromptItem; response: NonNullable<typeof x.response> } => Boolean(x.item && x.response))

  return (
    <ResultsNavContext.Provider value={registerSection}>
    <main className={styles.page}>
      <header className={styles.reportHeader}>
        <div className={styles.reportHeaderText}>
          <div className="sc-eyebrow">Synthesis</div>
          <h1 className={styles.reportTitle}>Your Map, So Far</h1>
          <p className={styles.reportDate}>Generated {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} · scored entirely in this browser</p>
        </div>
        <div className={styles.signatureWrap}>
          <EmergingMap seed={signatureSeed} progress={1} size={140} variant="signature" />
          <span className={styles.signatureCoordinate}>{coordinateSignature(signatureSeed)}</span>
        </div>
      </header>

      <ResultsSectionNav entries={tocEntries} />

      <Section eyebrow="Portrait" title="What Kind of Person Does This Data Describe?">
        <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
          Six compact reads, not forty charts — every sentence below is generated deterministically from the scored
          facets it names, never written per person. Everything past this point is the same data explored in more
          depth: full facet breakdowns, career fit, unconventional paths, and where this profile pulls against itself.
        </p>
        <ProfilePortrait
          facetScores={facetScores}
          strengthResults={strengthResults}
          tensions={profileRelationships.tensions}
          anchorScores={anchorScores}
          futureSelfStability={futureSelfStability}
          topCareerFit={careerResults[0] ?? null}
          topUnconventionalPath={unconventionalPaths[0] ?? null}
          coreDrivers={coreDrivers}
        />
      </Section>

      {stabilityComparison && priorSnapshot && (
        <Section eyebrow="Retesting" title={`Compared to Your ${new Date(priorSnapshot.completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} Profile`}>
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            Not every number in a profile like this should be expected to hold still. Stable groups this apart from
            Changing on purpose — personality, interests, career anchors, strengths, and values are treated as
            trait-like and expected to hold up; desire, work environment, risk tolerance, needs, future self, and
            aspiration are treated as preference- or circumstance-like and expected to move. A number here
            reads as Uncertain whenever either measurement was itself too thin to trust the comparison, regardless
            of which bucket the construct theoretically belongs to.
          </p>
          <RetestingComparisonPanel comparison={stabilityComparison} />
        </Section>
      )}

      {coreDrivers.length > 0 && (
        <Section eyebrow="Core Drivers" title="What's Behind the Pattern">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            Ten named motivational forces are checked against this profile; a driver only appears below when a real
            majority of its own independently-scored facets converge — never from one strong trait alone. Importance
            is the average strength across those facets; Evidence is a separate read of how well-measured this
            specific driver is, capped by its single weakest contributing facet, never by the score itself. "When
            excessive" names a plausible cost of leaning on this driver too hard — not a prediction, a pattern worth
            watching for.
          </p>
          <div className={styles.careerList}>
            {coreDrivers.map((d) => <CoreDriverCard key={d.id} result={d} />)}
          </div>
        </Section>
      )}

      {contradictions.length > 0 && (
        <Section eyebrow="Contradictions" title="Where Your Answers Pull Against Each Other">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            Not lies — nobody is being deceptive here, including with themselves. These are places where a claim
            you made and a choice you made, measured independently and often in entirely different sections, point
            in different directions. That gap is usually more informative than either signal alone: it's where a
            self-image and an actual pattern haven't caught up with each other yet.
          </p>
          <div className={styles.careerList}>
            {contradictions.map((c) => <ContradictionCard key={c.id} contradiction={c} />)}
          </div>
        </Section>
      )}

      {profileRelationships.convergences.length > 0 && (
        <Section eyebrow="Synthesis" title="Where Your Answers Agree With Each Other">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            No score here is read alone, and none of these are an average of unrelated traits — each combination
            below is specific and hand-picked, chosen because that exact pairing means something a single number
            doesn't. Several independent scales pointing the same direction at once is a stronger signal together
            than any one of them is alone.
          </p>
          <div className={styles.careerList}>
            {profileRelationships.convergences.map((c) => <ConvergenceCard key={c.id} signal={c} />)}
          </div>
        </Section>
      )}

      {profileRelationships.tensions.length > 0 && (
        <Section eyebrow="Tensions" title="Where This Profile Pulls Against Itself">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            This may be one of the most useful things in this whole report. Each pair below is two priorities, each
            real and independently well-supported by separate parts of the assessment, that practically constrain
            each other — different from a contradiction elsewhere in this report, where one signal is probably the
            more accurate one. Here, neither side is wrong, and there's nothing to resolve by picking one.
          </p>
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            <strong>Tensions are not flaws.</strong> They're constraints — the kind any good career architecture has
            to actually solve for, the same way an engineer designs around a real physical constraint instead of
            wishing it away. Someone who wants both freedom and financial predictability doesn't have a character
            problem; they have a design problem, and design problems have design solutions.
          </p>
          <div className={styles.careerList}>
            {profileRelationships.tensions.map((t) => <TensionCard key={t.id} signal={t} />)}
          </div>
        </Section>
      )}

      {desireScores.length > 0 && (
        <Section eyebrow="Desire" title="What Kind of Life You Keep Choosing">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            Each line below is one tension, not two separate traits — a higher score leans toward the first-named
            side, a lower score toward the second, and a score near the middle means the tradeoff didn't
            consistently pull one way for you.
          </p>
          <div className={styles.barGrid2}>
            {desireScores.map((f) => <Continuum key={f.facetId} facetScore={f} />)}
          </div>
        </Section>
      )}

      {personalityFacets.length > 0 && (
        <Section eyebrow="Personality" title="Temperament">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            Five broad domains, each built from three narrower facets — the domain score is the average of its
            facets, not a separate measurement of its own.
          </p>
          <div className={styles.barGrid2}>
            {personalityDomains.map((f) => <Continuum key={f.facetId} facetScore={f} />)}
          </div>

          {personalityFacetsByDomain.map(({ domain, facets }) => (
            <div key={domain.id}>
              <div className={styles.careerGroupLabel}>{domain.label} facets</div>
              <div className={styles.barGrid2}>
                {facets.map((f) => <Continuum key={f.facetId} facetScore={f} />)}
              </div>
            </div>
          ))}
        </Section>
      )}

      {valueScores.length > 0 && (
        <Section eyebrow="Values" title="What Matters, Under Pressure">
          <div className={styles.barGrid2}>
            {valueScores.map((f) => <Continuum key={f.facetId} facetScore={f} />)}
          </div>

          <div className={styles.careerGroupLabel}>Professed vs. revealed vs. behavioral</div>
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            The score above blends everything you answered. These three columns don't — professed is what you said
            when asked directly, revealed is what emerged when a tradeoff forced a choice, behavioral is what your
            own recent history shows. Disagreement between them is a finding, not noise.
          </p>
          <ValuesAgreementPanel rows={valuesEvidence} />
        </Section>
      )}

      {interestScores.length > 0 && (
        <Section eyebrow="Interests" title="What You'd Rather Actually Be Doing">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            Built almost entirely from head-to-head choices between concrete activities, not ratings of abstract
            career categories — so a high score here means activities of that kind consistently won out over
            others, not that you rated them favorably in isolation. Career fit doesn't factor these in yet.
          </p>
          <div className={styles.twoCol}>
            <div className={styles.barGrid2}>
              {interestScores.map((f) => <Continuum key={f.facetId} facetScore={f} />)}
            </div>
            {/* RIASEC is the one place a radar earns its keep: unlike an
                arbitrary bundle of unrelated traits, Holland's hexagon is
                the field's own standard way to see these six interests as
                one shape, not six separate reads — a real, compelling
                reason, not the default. */}
            <RadarDiagram facets={interestScores.map((f) => ({ label: f.label, score: f.score }))} />
          </div>
        </Section>
      )}

      {strengthResults.length > 0 && (
        <Section eyebrow="Strengths" title="What You're Actually Good At">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            Four separate signals per domain, not one blended "talent" score: how fast it came to you, what your
            actual history shows, how much deliberate training you've put in, and whether it energizes or drains
            you. Someone can be excellent at something they hate, or love something they haven't yet proven — the
            label below names which situation this looks like, but the four numbers underneath are what it's built from.
          </p>
          <div className={styles.careerList}>
            {strengthResults.map((r) => <StrengthCard key={r.domainId} result={r} />)}
          </div>
        </Section>
      )}

      {strengthQuadrantMap.placed.length > 0 && (
        <Section eyebrow="Strength Map" title="Ability × Energy">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            The same six strength domains above, placed on two axes instead of sorted into one label: Ability
            (demonstrated ability and trained skill — never raw self-perceived ease unless nothing else was
            answered) on one axis, Energy (energizes vs. drains, the same read Energy Map below uses) on the other.
            The four regions this creates matter more than any single score: a Utilitarian Skill and a Signature
            Strength can carry the identical ability number and still be a very different bet to build a career on
            — this distinction feeds directly into how career recommendations below are explained, not just this page.
          </p>
          <StrengthQuadrantMap map={strengthQuadrantMap} />
        </Section>
      )}

      {(energyMap.energizes.length + energyMap.neutral.length + energyMap.drains.length) > 0 && (
        <Section eyebrow="Energy Map" title="What You’ll Still Tolerate Once the Novelty Wears Off">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            Sixteen concrete kinds of work, sorted by the same energizes-vs-drains signal Strengths measures above —
            not whether you're good at something, but whether doing it repeatedly costs you or restores you. Several
            activities below share the exact same underlying facet, and say so directly, rather than implying more
            independent measurement than six energy domains actually provide.
          </p>
          {energyMapSummary && <p className={styles.contradictionDetail} style={{ marginBottom: 'var(--sc-space-3)' }}>{energyMapSummary}</p>}
          <EnergyMapPanel map={energyMap} />
        </Section>
      )}

      {needScores.length > 0 && (
        <Section eyebrow="Autonomy · Structure · Risk · Ambiguity" title="How You Need to Operate">
          <div className={styles.barGrid2}>
            {needScores.map((f) => <Continuum key={f.facetId} facetScore={f} />)}
          </div>
        </Section>
      )}

      {workScores.length > 0 && (
        <Section eyebrow="Work Environment" title="The Conditions That Actually Work">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            Nineteen more concrete tensions, mostly built from "which would frustrate you more" forced choices
            between two specific situations, rather than asking directly whether you like something. Autonomy,
            structure, and ambiguity aren't repeated here — they're already measured above, in How You Need to
            Operate. As with Desire, each line is one tension: a higher score leans toward the first-named side.
          </p>
          <div className={styles.barGrid2}>
            {workScores.map((f) => <Continuum key={f.facetId} facetScore={f} />)}
          </div>
        </Section>
      )}

      {anchorScores.length > 0 && (
        <Section eyebrow="Career Anchors" title="What You Wouldn't Trade Away">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            This isn't a single verdict — it's eight durable priorities, ranked against each other rather than
            rated in isolation, because everyone rates every priority "important" when nothing forces a choice
            between them. Read the order, not just the numbers: {anchorScores[0]?.label} and {anchorScores[1]?.label} came
            out ahead of the rest most consistently{anchorScores.length > 2 && `, with ${anchorScores[anchorScores.length - 1]?.label} giving way most often`}.
          </p>
          <div className={styles.barGrid2}>
            {anchorScores.map((f) => <Continuum key={f.facetId} facetScore={f} />)}
          </div>
        </Section>
      )}

      {riskScores.length > 0 && (
        <Section eyebrow="Risk & Uncertainty" title="What Kind of Risk You Actually Tolerate">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            Risk isn't one dial. Someone can bet their income on commission and still never speak up in a meeting;
            someone else will happily admit a mistake in public but wouldn't take a physically risky trip. Each
            line below is a separate domain, built from realistic scenarios — income variance, startup employment,
            relocation, public accountability — not a single "how risk-tolerant are you" rating.
          </p>
          <div className={styles.barGrid2}>
            {riskScores.map((f) => <Continuum key={f.facetId} facetScore={f} />)}
          </div>

          {riskRelatedScores.length > 0 && (
            <>
              <div className={styles.careerGroupLabel}>Related, measured elsewhere</div>
              <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
                Ambiguity tolerance and novelty seeking belong in this picture too, but they're already measured in
                Temperament above — shown here again only for reference, not re-asked.
              </p>
              <div className={styles.barGrid2}>
                {riskRelatedScores.map((f) => <Continuum key={f.facetId} facetScore={f} />)}
              </div>
            </>
          )}
        </Section>
      )}

      {futureSelfScores.length > 0 && (
        <Section eyebrow="Future Self" title="The Life a Career Would Need to Support">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            Not a job title — fifteen elements of an imagined life, tested at two horizons, five years and ten
            years out, under real scarcity: at each distance, only four of the fifteen could be preserved. What
            survived both cuts is below the ranked list.
          </p>
          <div className={styles.barGrid2}>
            {futureSelfScores.map((f) => <Continuum key={f.facetId} facetScore={f} />)}
          </div>
          {futureSelfNarrative && (
            <>
              <div className={styles.careerGroupLabel}>What a career needs to support</div>
              <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body-lg)' }}>{futureSelfNarrative}</p>
            </>
          )}
        </Section>
      )}

      {aspirationGaps.length > 0 && (
        <Section eyebrow="Aspiration" title="Who You Are, and Who You'd Like to Be">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            A handful of statements, asked twice each — how much they describe you now, and separately, how much
            you'd like them to. The gap between those two numbers is the actual finding: not a flaw to fix, but a
            growth edge worth naming honestly. Kept short on purpose — this format costs two answers per statement.
          </p>
          <div className={styles.careerList}>
            {aspirationGaps.map((g) => <AspirationGapCard key={g.facetId} gap={g} />)}
          </div>
        </Section>
      )}

      <Section eyebrow="Response Quality" title="How Reliable These Answers Are">
        <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
          A different check than the contradictions above: this is about how the questions themselves were
          answered — too fast to have been read, the same point on every scale, that kind of thing — not about
          what the answers say. None of this is a lie detector; it's a read on how much weight to put on which parts.
        </p>
        <ResponseQualityReport model={responseQuality} />
      </Section>

      {constructConfidences.length > 0 && (
        <Section eyebrow="Construct Confidence" title="How Much to Trust Each Number">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            Two constructs can land on the same 0-100 score and deserve very different trust. Confidence here is
            built entirely from how much and what kind of evidence backs each number — how many direct items,
            forced-choice tradeoffs, and behavioral indicators contributed, and how well those different methods
            agree with each other — never from the score itself. Sorted least-confident first, on purpose: those
            are the numbers most worth reading as a hypothesis rather than a fact.
          </p>
          <ConstructConfidenceTable confidences={constructConfidences} />
        </Section>
      )}

      {(environmentSpec.required.length > 0 || environmentSpec.friction.length > 0) && (
        <Section eyebrow="Environment Specification" title="The Environment This Profile Is Built For">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            Before any job title: what the work itself needs to look like. Every line below traces to one
            specific, already-scored facet — nothing here is invented for the occasion, and nothing recommends a
            specific role. Career Fit, Unconventional Paths, and Likely Poor Fits below all follow from this, not
            the other way around.
          </p>
          <EnvironmentSpecPanel spec={environmentSpec} />
        </Section>
      )}

      {careerResults.some((r) => r.dimensionsScored > 0) && (
        <Section eyebrow="Career Fit" title="Where This Points">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            Not a single correlation against your personality — each score below is a weighted blend across up to
            ten independent categories (interests, strengths, work environment, values, risk tolerance, and more),
            minus explicit penalties where this career treats a dimension as close to a requirement and your score
            misses it badly. When that happens it's named directly, not averaged away — a career can show
            excellent fit on the dimensions that matter most to it and still take a real penalty for one severe
            mismatch elsewhere. Every bar and every point traces back to a dimension actually measured above.
          </p>
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-small)', color: 'var(--sc-ink-faint)', marginBottom: 'var(--sc-space-3)' }}>
            Ranked against the {careerResults.length} careers currently in this build's catalog, not the full
            working world — read this as which of those {careerResults.length} fit best, not as your single best
            possible career.
          </p>

          <div className={styles.careerGroupLabel}>Strong fits</div>
          <div className={styles.careerList}>
            {strongFits.map((r) => <CareerFitCard key={r.career.id} result={r} strengthQuadrants={strengthQuadrantLookup} />)}
          </div>

          {secondLookFits.length > 0 && (
            <>
              <div className={styles.careerGroupLabel}>Also worth a look</div>
              <div className={styles.careerList}>
                {secondLookFits.map((r) => <CareerFitCard key={r.career.id} result={r} strengthQuadrants={strengthQuadrantLookup} />)}
              </div>
            </>
          )}
        </Section>
      )}

      {careerResults.some((r) => r.dimensionsScored > 0) && (
        <Section eyebrow="Career Explorer" title="Browse Every Career, Your Own Way">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            The curated picks above are a starting point, not the full picture. All {careerResults.length} careers
            this build's catalog scores are here — sort by overall fit or any single dimension, filter by what a
            role actually has to offer (income orientation, autonomy, education required, and more), and open any
            card for the same full analysis Career Fit above shows. If a career you're considering isn't in this
            list, that's a gap in the catalog, not a signal it's a poor fit.
          </p>
          <CareerExplorer results={careerResults} strengthQuadrants={strengthQuadrantLookup} />
        </Section>
      )}

      {unconventionalPaths.length > 0 && (
        <Section eyebrow="Unconventional Paths" title="Other Shapes This Could Take">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            Standard assessments overrecommend known occupations, because job titles are what occupational databases
            index — not because they're actually the best-fitting shape for every profile. This is the other axis:
            CAREER STRUCTURES — portfolio work, consulting, independent operation, acquisition, fractional roles, and
            more — surfaced from the same kind of trait convergence as the relationships above, never from a single
            strong trait alone. Each one names concrete roles it shows up as, but the recommendation is the structure
            itself, not a title.
          </p>
          <div className={styles.careerList}>
            {unconventionalPaths.map((r) => <UnconventionalPathCard key={r.id} result={r} />)}
          </div>
        </Section>
      )}

      {experimentPlans.length > 0 && (
        <Section eyebrow="Career Experiments" title="Small Ways to Find Out">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            Nothing above is a verdict — introspection, however careful, can only produce a hypothesis about what
            would actually suit you. It can't substitute for what happens when you do the work. Below are cheap,
            time-boxed, real-world tests for this report's own strongest claims, classified by time, cost, and how
            much signal the result would carry — the point is behavioral evidence, not more speculation.
          </p>
          <CareerExperimentsPanel plans={experimentPlans} />
        </Section>
      )}

      {poorFitArchetypes.length > 0 && (
        <Section eyebrow="Likely Poor Fits" title="Where This Points Away From">
          <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
            As potentially useful as the recommendations above: not specific job titles, but recognizable kinds of
            environments your own responses converge on avoiding. An environment only appears here when a real
            majority of its defining characteristics independently show a severe gap against what you scored — never
            from a single outlier dimension averaged in with the rest. This is never a claim about what you're
            capable of, only about what would likely wear on you.
          </p>
          <div className={styles.careerList}>
            {poorFitArchetypes.map((r) => <PoorFitCard key={r.id} result={r} />)}
          </div>
        </Section>
      )}

      {ownWords.length > 0 && (
        <Section eyebrow="Reflection" title="In Your Own Words">
          {ownWords.map(({ item, response }) => (
            <div key={item.id} style={{ marginBottom: 'var(--sc-space-3)' }}>
              <p className={styles.barConfidence} style={{ marginBottom: '0.4rem' }}>{item.prompt}</p>
              <p className={styles.quote}>“{response.value as string}”</p>
            </div>
          ))}
        </Section>
      )}

      <Section eyebrow="What's Next" title="The Rest of the Map">
        <p className={styles.deferredNote}>
          This build charts Orientation, Desire, Values, Interests, Strengths, Work Environment, Career Anchors,
          Risk & Uncertainty, Future Self, Aspiration, and a slice of Temperament — enough to prove the instrument
          honestly, not enough to call it complete. Relationships and Constraints are still uncharted; sections
          like Social Style and Energy Profile aren't shown above because there's no real measurement behind them
          yet. Career Fit above now draws on Interests, Strengths, Work Environment, Career Anchors, Risk &
          Uncertainty, and Future Self, alongside Values and a slice of Temperament — Aspiration isn't factored in
          yet. Nothing here fakes a score for a domain that hasn't actually been measured.
        </p>
      </Section>
    </main>
    </ResultsNavContext.Provider>
  )
}
