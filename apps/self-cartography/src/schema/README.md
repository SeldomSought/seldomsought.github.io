# Schema

The canonical, next-generation data schema for the assessment: `content.ts`
(Assessment / Section / Construct / Subscale / Question / CareerFactor),
`scoring.ts` (Response / ScoringRule / Score / Evidence / ValidityCheck),
`interpretation.ts` (InterpretationBand / CareerFitProfile), `ui.ts` (the
structural contract that keeps question rendering generic), `versioning.ts`
(the three-axis semver system), and `result.ts` (GeneratedProfile — where a
completed result actually retains its versions).

## Versioning

Three independent semver strings, one manifest, no backend:

- **instrumentVersion** — sourced from `Assessment.version`. Bumps when the question set changes.
- **scoringVersion** — bumps when scoring rules, weights, reverse-keying, or rollup logic change.
- **careerModelVersion** — bumps when the career database or fit-matching algorithm changes.

`CURRENT_VERSIONS` in `versioning.ts` is the single source of truth — a
hand-maintained constant, bumped in the same commit as whatever content/
scoring/career change prompted it. There is no version table, no migration
runner, no server: `GeneratedProfile.versions` is stamped once from
`CURRENT_VERSIONS` at creation (`result.ts#createProfile`) and never
mutated afterward — a completed result is an immutable snapshot, not a live
view that silently re-scores itself when the model changes later.

**Comparability, not correctness, is what gets checked.** `compareSemVer`
is plain arithmetic (major/minor/patch, no library). `compareVersionManifests`
runs it per axis and applies an explicit policy per axis — a scoring PATCH
is `partially-comparable` (numbers may have shifted slightly), a scoring
MAJOR is `not-comparable` (different scale, don't diff); an instrument MINOR
(questions added, nothing removed) is `partially-comparable`, an instrument
MAJOR (questions removed/restructured) is `not-comparable`. See
`samples/sampleVersioning.ts` for all four verdicts produced end to end
(`identical` / `comparable` / `partially-comparable` / `not-comparable`),
verified to actually run, not just type-check.

**Where this plugs into the shipped app, when it's wired in:** the running
app's `engine/persistence.ts` already has its own `SCHEMA_VERSION` — that's
a *different*, unrelated concern (can the reducer even parse this saved
JSON blob) and should stay separate from `VersionManifest` (does this
saved *content* still mean the same thing today). The integration point is
narrow: stamp `CURRENT_VERSIONS` onto a `GeneratedProfile` when Synthesis is
reached, store it alongside the existing autosaved state, and on load, if a
completed profile is found, run `compareVersionManifests` before displaying
it — surfacing `recommendation` as a quiet note if it's not `identical`,
never silently recomputing the stored scores.

## Status

**Not wired into the running app yet.** `engine/types.ts` and everything
built against it (`engine/scoring/`, `engine/validity.ts`, `content/*`,
every component under `components/items/`) are untouched and still what
actually ships. This directory is additive — it type-checks on its own
(`npm run build` includes it) but nothing imports it at runtime.

Migrating the real build onto this schema is follow-up work, not done here.
`samples/` demonstrates every question format and the full Question →
Response → Evidence → Score → ValidityCheck → CareerFitProfile pipeline
shape with a handful of representative objects — it is deliberately not the
real content, which still lives in `content/instruments/*.items.ts`.

## What changed vs. `engine/types.ts`, and why

- **Construct/Subscale is new.** The old schema had one flat `facetId`
  string per item, with a separate `content/facets.ts` registry doing double
  duty as both "what this measures" and "how to roll it up for display."
  Construct/Subscale makes the rollup structural: every construct scores
  through its subscales, even single-facet ones, so there's one code path
  instead of the old special-cased `PERSONALITY_DOMAINS` rollup that only
  applied to personality.
- **Evidence is new and first-class.** The old self-report-vs-behavior check
  was one hardcoded pairwise comparison (`contrastsWithItemId`) in
  `engine/validity.ts`. Evidence generalizes it into typed records any
  ValidityCheck can compare across — see
  `samples/sampleDerived.ts#selfReportVsBehaviorGapCheck` for the same
  mechanism working over arbitrary subscales, not one hardcoded pair.
- **CareerFactor is new.** The old career database keyed dimension weights
  directly off facet-id strings (`careerDatabase.ts`'s `Record<string,
  number>`). CareerFactor is an explicit, typed registry entry with its own
  id and a `sourceConstruct`/`sourceSubscale` link — the connection between
  "what's measured" and "what a career cares about" is a real reference,
  not a hoped-for string match.
- **InterpretationBand is new.** The old schema never mapped a raw score to
  a descriptive label — results always showed the raw 0–100 + confidence
  and nothing else. InterpretationBand adds an explicit band/narrative
  layer without weakening the original honesty guardrail: `Score.rawScore`
  is still documented as "never a claimed population percentile," and bands
  describe the internal composite scale only.
- **`ui.ts`'s `QuestionRendererMap` is new.** The old app already kept
  question rendering generic (one component per format, dispatched by
  `item.format` in `ItemRenderer.tsx`) — but that was a convention.
  `QuestionRendererMap` makes it a type error to ship a `QuestionType`
  without a matching generic renderer.
- **Question types expanded from 7 formats to 11**, splitting what used to
  be overloaded: `binary` and `numeric` are new; `frequency` and
  `behavioral-evidence` are now distinct from a generic `likert` rather than
  both riding on `StatementItem`; `open-response` replaces the old
  `evidencePrompt`/`openText` split with one type plus a
  `contributesEvidence` flag.
