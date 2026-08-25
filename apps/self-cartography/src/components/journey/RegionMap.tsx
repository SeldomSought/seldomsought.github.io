import { useMemo } from 'react'
import { useAssessment } from '../../engine/state'
import { REGIONS } from '../../content/regions'
import { regionProgress, isRegionComplete, canEnterSynthesis, overallProgress } from '../../engine/navigation'
import { EmergingMap } from '../motifs/EmergingMap'
import { coordinateSignature } from '../motifs/emergingMapGraph'
import { Button } from '../shared/Button'
import styles from './RegionMap.module.css'

// regionCompletedAt (engine/state.ts) exists for the future "retake this
// module" flow and otherwise has no UI surface — this is a quiet, honest
// use of real data already being recorded: a completed region reads like
// a field notebook entry with its own survey date, not a generic checkmark.
function formatSurveyDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function RegionMap({ onStartOver }: { onStartOver: () => void }) {
  const { state, dispatch } = useAssessment()
  const { responses } = state
  const hasStarted = Object.keys(responses).length > 0
  const canSynthesize = canEnterSynthesis(responses)
  // The ceremonial transition only plays once, the first time someone
  // actually finishes — a repeat visit to Synthesis (to review results
  // already seen) jumps straight there.
  const gotoSynthesis = () => dispatch({ type: state.completedAt ? 'GOTO_SYNTHESIS' : 'GOTO_COMPLETION' })

  // Seeded from startedAt, not response content: the map's layout must stay
  // fixed for the whole session (only what's revealed should change), and
  // tying its exact shape to answer values would risk implying the shape
  // itself means something about the respondent — precision the map isn't
  // meant to claim.
  const seed = String(state.startedAt)
  const progress = useMemo(() => {
    const p = overallProgress(responses)
    return p.total ? p.answered / p.total : 0
  }, [responses])

  return (
    <main className={styles.page}>
      <div className={styles.mapWrap}>
        <EmergingMap seed={seed} progress={progress} size={168} variant="inline" />
        <span className={styles.mapCaption}>Your map, forming — fills in as you answer</span>
        <span className={styles.mapCoordinate}>{coordinateSignature(seed)}</span>
      </div>

      <div className={styles.sectionLabel}>The regions</div>
      <nav className={styles.trail} aria-label="Assessment regions">
        {REGIONS.map((region) => {
          const progress = regionProgress(region.id, responses)
          const isSynthesis = region.id === 'synthesis'
          // isRegionComplete('synthesis', …) is vacuously true (no
          // instrument targets the synthesis region, so an empty
          // required-items list trivially satisfies .every()) — Synthesis's
          // own "complete" node styling has to come from canSynthesize instead.
          const complete = region.implemented && (isSynthesis ? canSynthesize : isRegionComplete(region.id, responses))
          const inProgress = region.implemented && progress.answered > 0 && !complete
          const disabled = !region.implemented || (isSynthesis && !canSynthesize)

          return (
            <button
              key={region.id}
              type="button"
              className={styles.regionRow}
              disabled={disabled}
              onClick={() => {
                if (disabled) return
                if (region.id === 'synthesis') gotoSynthesis()
                else dispatch({ type: 'START_REGION', regionId: region.id })
              }}
            >
              <span className={[styles.node, complete ? styles.complete : '', inProgress ? styles.inProgress : ''].join(' ')} />
              <span className={styles.body}>
                <span className={styles.regionLabelRow}>
                  <span className={styles.regionTitle}>{region.label}</span>
                  <span className={styles.regionMarginalia}>{region.marginalia}</span>
                </span>
                <p className={styles.regionDesc}>{region.description}</p>
                {region.implemented && progress.total > 0 && (
                  <div className={styles.regionStatus}>
                    {complete
                      ? state.regionCompletedAt[region.id]
                        ? `Charted · ${formatSurveyDate(state.regionCompletedAt[region.id]!)}`
                        : 'Charted'
                      : `${progress.answered} / ${progress.total} answered`}
                  </div>
                )}
                {!region.implemented && <div className={styles.regionMarginalia}>not open in this build yet</div>}
              </span>
            </button>
          )
        })}
      </nav>

      {canSynthesize && (
        <div className={styles.synthesisCallout}>
          <span className={styles.synthesisText}>Everything charted so far is ready to read as one map.</span>
          <Button variant="primary" onClick={gotoSynthesis}>
            Go to Synthesis →
          </Button>
        </div>
      )}

      {hasStarted && (
        <div style={{ marginTop: '3.6rem' }}>
          <Button variant="ghost" onClick={onStartOver}>Start over</Button>
        </div>
      )}
    </main>
  )
}
