import { useEffect, useRef, useState } from 'react'
import { useAssessment } from '../../engine/state'
import { EmergingMap } from '../motifs/EmergingMap'
import { Button } from '../shared/Button'
import { COMPLETION_COPY } from '../../content/copy/completion'
import styles from './CompletionTransition.module.css'

type Stage = 'arriving' | 'resolved' | 'thesis' | 'reveal' | 'ready'

// Normal-motion pacing (ms) — tuned so the whole sequence lands well under
// "several seconds" even before anyone acts on it. Reduced-motion divides
// every one of these down to a brief, near-immediate beat instead of
// skipping the sequence outright — the copy still arrives in order, just
// without asking anyone to sit through motion they've opted out of.
const TIMING = {
  resolve: 200,   // the map settles into its bolder, final "signature" form
  thesis: 1600,   // "The map is not the territory." — after the resolve settles
  reveal: 2200,   // "But patterns have emerged."
  ready: 2700,    // the CTA appears, screen becomes fully interactive
  autoAdvance: 4400, // proceeds on its own if no one acts — never a dead end
}
const REDUCED_MOTION_DIVISOR = 8

/**
 * The completion transition: a quiet synthesis moment between the last
 * answered item and the results report, not a celebration. Reaching this
 * screen at all requires every required item across every implemented
 * region answered (see engine/navigation.ts's canEnterSynthesis), so the
 * map that accumulated throughout the journey is already fully revealed by
 * the time someone arrives here — there's nothing left to fill in. What
 * DOES visibly change is the map's own form: it mounts as the same modest
 * 'inline' rendering seen throughout the journey, then settles into the
 * bolder 'signature' variant (larger nodes, deeper contour fill — see
 * EmergingMap.module.css) a beat later, via the transitions those elements
 * already declare. That settle is the "resolves into its final structure"
 * moment — an honest one, not a reveal manufactured for the occasion.
 *
 * Fully skippable at every stage — a persistent Skip control, the CTA
 * itself, and Escape all finish it immediately — and self-advancing
 * besides, so no one is ever stuck waiting on it.
 */
export function CompletionTransition() {
  const { state, dispatch } = useAssessment()
  const finishedRef = useRef(false)
  const [stage, setStage] = useState<Stage>('arriving')

  const seed = String(state.startedAt)

  function finish() {
    if (finishedRef.current) return
    finishedRef.current = true
    dispatch({ type: 'GOTO_SYNTHESIS' })
  }

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scale = reduced ? 1 / REDUCED_MOTION_DIVISOR : 1
    const timers = [
      setTimeout(() => setStage('resolved'), TIMING.resolve * scale),
      setTimeout(() => setStage('thesis'), TIMING.thesis * scale),
      setTimeout(() => setStage('reveal'), TIMING.reveal * scale),
      setTimeout(() => setStage('ready'), TIMING.ready * scale),
      setTimeout(finish, TIMING.autoAdvance * scale),
    ]
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') finish()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('keydown', onKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resolved = stage !== 'arriving'
  const showThesis = stage === 'thesis' || stage === 'reveal' || stage === 'ready'
  const showReveal = stage === 'reveal' || stage === 'ready'
  const showCta = stage === 'ready'

  return (
    <main className={styles.page}>
      <button type="button" className={styles.skip} onClick={finish}>
        {COMPLETION_COPY.skip}
      </button>

      <div className={[styles.mapWrap, resolved ? styles.resolved : ''].join(' ')}>
        <EmergingMap seed={seed} progress={1} size={220} variant={resolved ? 'signature' : 'inline'} />
      </div>

      <div className={styles.textStack}>
        <p className={[styles.thesis, showThesis ? styles.visible : ''].join(' ')}>{COMPLETION_COPY.thesis}</p>
        <p className={[styles.attribution, showThesis ? styles.visible : ''].join(' ')}>{COMPLETION_COPY.thesisAttribution}</p>
        <p className={[styles.reveal, showReveal ? styles.visible : ''].join(' ')}>{COMPLETION_COPY.reveal}</p>
      </div>

      <div className={[styles.ctaRow, showCta ? styles.visible : ''].join(' ')}>
        <Button variant="primary" onClick={finish}>{COMPLETION_COPY.cta} →</Button>
      </div>
    </main>
  )
}
