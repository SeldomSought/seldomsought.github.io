import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { AssessmentProvider, useAssessment } from './engine/state'
import { loadSavedState, saveStateDebounced, flushPendingSave, clearSavedState, hasAnyResponses, archiveSnapshot } from './engine/persistence'
import { createSnapshot } from './engine/snapshot'
import { scoreAssessment } from './engine/scoring'
import { GraphPaperField } from './components/motifs/GraphPaperField'
import { JourneyShell } from './components/journey/JourneyShell'
import { LandingPage } from './components/journey/LandingPage'
import { OrientationScreen } from './components/journey/OrientationScreen'
import { RegionMap } from './components/journey/RegionMap'
import { RegionIntroScreen } from './components/journey/RegionIntroScreen'
import { AssessmentShell } from './components/journey/AssessmentShell'
import { ResumeBanner } from './components/journey/ResumeBanner'
import { CompletionTransition } from './components/journey/CompletionTransition'
// The single biggest thing in this bundle — the entire scoring engine's
// import graph, every results component, the career database — and never
// needed until a respondent actually finishes. Lazy so a first-time
// visitor's initial download is everything up through the assessment
// itself, not the report they may not reach for 30-60+ minutes.
const ResultsReport = lazy(() => import('./components/results/ResultsReport').then((m) => ({ default: m.ResultsReport })))
import { track } from './engine/analytics'
import { REGION_BY_ID } from './content/regions'
import { getRegionItems } from './engine/navigation'

type PreAssessmentStage = 'landing' | 'orientation' | 'done'

// The top-level view switch — not to be confused with AssessmentShell
// (components/journey/AssessmentShell.tsx), which is specifically the
// question-answering screen's own chrome.
function AppShell() {
  const { state, dispatch } = useAssessment()
  const [hydrated, setHydrated] = useState(false)
  const [justResumed, setJustResumed] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  // 'done' only for a genuinely fresh session that's already been through
  // Landing and Orientation — a returning visitor with saved progress goes
  // straight back to wherever they left off (any view, with a resume
  // banner on top), never back through the marketing page or the instructions.
  const [stage, setStage] = useState<PreAssessmentStage>('landing')
  const skipNextSave = useRef(true)

  useEffect(() => {
    const saved = loadSavedState()
    if (saved && hasAnyResponses(saved.state)) {
      // The completion transition is a one-time ceremonial beat, not a
      // screen worth resuming into — reopening the tab mid-transition (or
      // any time after) should land straight on the results it was leading to.
      const restoredState =
        saved.state.view.type === 'completion' ? { ...saved.state, view: { type: 'synthesis' as const } } : saved.state
      dispatch({ type: 'HYDRATE', state: restoredState })
      setJustResumed(true)
      setStage('done')
      // The state actually on disk right now, not "not yet saved" — the
      // indicator should reflect the truth from the very first render
      // after a resume, before any new answer triggers another write.
      setSavedAt(saved.savedAt)
    }
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    saveStateDebounced(state, setSavedAt)
  }, [state, hydrated])

  // RETESTING ARCHITECTURE: the moment completedAt is first set (never on
  // a later resume of an already-completed session — completedAt won't
  // have changed then), archive a lightweight scored snapshot into history
  // alongside the in-progress state above. archiveSnapshot is idempotent
  // per completedAt, so this effect running again for the same value (a
  // re-render, a StrictMode double-invoke) never creates a duplicate entry.
  const archivedCompletedAt = useRef<number | null>(null)
  useEffect(() => {
    if (!hydrated || state.completedAt === null) return
    if (archivedCompletedAt.current === state.completedAt) return
    archivedCompletedAt.current = state.completedAt
    const { facetScores } = scoreAssessment(state.responses)
    archiveSnapshot(createSnapshot(facetScores, state.completedAt))
    track({
      type: 'assessment_complete',
      totalDurationMs: state.completedAt - state.startedAt,
      regionsCompleted: Object.keys(state.regionCompletedAt).length,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, state.completedAt])

  // ANALYTICS — section_enter / section_complete: reacts to real view/
  // regionCompletedAt transitions rather than living inside the reducer
  // (assessmentReducer stays a pure function, same as everywhere else in
  // this engine). Both refs start seeded from whatever's already true on
  // this render, so a resumed session with regions already complete from
  // a PRIOR visit never fires a spurious event for them — only actual,
  // in-this-tab transitions do.
  const regionEnterFired = useRef<Set<string>>(new Set())
  const regionEnterTimestamps = useRef<Record<string, number>>({})
  useEffect(() => {
    if (!hydrated || state.view.type !== 'item' || state.view.itemIndex !== 0) return
    const { regionId } = state.view
    if (regionEnterFired.current.has(regionId)) return
    regionEnterFired.current.add(regionId)
    regionEnterTimestamps.current[regionId] = Date.now()
    track({ type: 'section_enter', regionId, order: REGION_BY_ID[regionId]?.order ?? -1 })
  }, [hydrated, state.view])

  const prevRegionCompletedAt = useRef(state.regionCompletedAt)
  useEffect(() => {
    if (!hydrated) return
    const prevKeys = new Set(Object.keys(prevRegionCompletedAt.current))
    for (const regionId of Object.keys(state.regionCompletedAt)) {
      if (prevKeys.has(regionId)) continue
      const enteredAt = regionEnterTimestamps.current[regionId]
      track({
        type: 'section_complete',
        regionId,
        order: REGION_BY_ID[regionId]?.order ?? -1,
        itemCount: getRegionItems(regionId).length,
        // 0 when this region was already in progress before this tab
        // session started (no in-session enter timestamp to diff against)
        // rather than fabricating a duration that was never observed.
        durationMs: enteredAt ? Date.now() - enteredAt : 0,
      })
    }
    prevRegionCompletedAt.current = state.regionCompletedAt
  }, [hydrated, state.regionCompletedAt])

  // A refresh, tab close, or navigation away can land inside the debounce
  // window — flush whatever's pending so "never lose progress" holds even
  // then. visibilitychange (tab hidden) fires reliably on mobile, where
  // pagehide/beforeunload sometimes don't; both are wired for coverage.
  useEffect(() => {
    function flush() {
      flushPendingSave()
    }
    function onVisibilityChange() {
      if (document.hidden) flush()
    }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  if (!hydrated) return null

  function handleStartOver() {
    clearSavedState()
    dispatch({ type: 'RESET' })
    setJustResumed(false)
    setStage('landing')
  }

  // AssessmentShell (the 'item' case) is fully self-chromed — section
  // title, progress, save indicator, and its own nav — so it never shows
  // the generic JourneyShell underneath it, same as the pre-assessment stages.
  const usesOwnChrome =
    state.view.type === 'item' || state.view.type === 'completion' || (state.view.type === 'map' && stage !== 'done')

  function renderView() {
    switch (state.view.type) {
      case 'map':
        if (stage === 'landing') {
          return (
            <LandingPage
              onBeginMapping={() => {
                setStage('orientation')
                // Only reachable for a genuinely fresh session — a
                // returning visitor with saved progress never sees Landing
                // again (see the `stage` comment above), so this can't
                // double-fire for one real start.
                track({ type: 'assessment_start' })
              }}
            />
          )
        }
        if (stage === 'orientation') return <OrientationScreen onComplete={() => setStage('done')} />
        return <RegionMap onStartOver={handleStartOver} />
      case 'regionIntro':
        return <RegionIntroScreen regionId={state.view.regionId} />
      case 'item':
        return <AssessmentShell regionId={state.view.regionId} itemIndex={state.view.itemIndex} savedAt={savedAt} />
      case 'completion':
        return <CompletionTransition />
      case 'synthesis':
        return (
          <Suspense fallback={<div className="sc-loading-fallback">Assembling your map…</div>}>
            <ResultsReport />
          </Suspense>
        )
      default:
        return null
    }
  }

  return (
    <div className="sc-root">
      <GraphPaperField />
      {!usesOwnChrome && <JourneyShell savedAt={savedAt} />}
      {justResumed && (
        <ResumeBanner savedAt={savedAt} onContinue={() => setJustResumed(false)} />
      )}
      {renderView()}
    </div>
  )
}

export default function App() {
  return (
    <AssessmentProvider>
      <AppShell />
    </AssessmentProvider>
  )
}
