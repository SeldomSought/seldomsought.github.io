import type { CareerFitResult } from '../../engine/scoring/careerMatch'
import type { StrengthQuadrant } from '../../engine/scoring/strengthQuadrant'
import { summarizePrimaryReason, summarizeLargestFriction } from '../../engine/scoring/careerCardSummary'
import { CareerFitCard, CONFIDENCE_CLASS } from './CareerFitCard'
import styles from './results.module.css'

/**
 * Restrained by design: career, fit, one reason, one friction — click opens
 * the full CareerFitCard (already built, already carries the entire
 * dimension ledger) in place. Nothing here is new copy; both lines are
 * derived from the exact same CareerFitResult the deep analysis reads.
 */
export function CareerExplorerCard({
  result,
  expanded,
  onToggle,
  strengthQuadrants,
}: {
  result: CareerFitResult
  expanded: boolean
  onToggle: () => void
  strengthQuadrants: Record<string, StrengthQuadrant>
}) {
  const reason = summarizePrimaryReason(result)
  const friction = summarizeLargestFriction(result)

  return (
    <div className={styles.explorerCard}>
      <button type="button" className={styles.explorerCardHeader} onClick={onToggle} aria-expanded={expanded}>
        <span className={styles.explorerCardTitle}>{result.career.title}</span>
        <span className={styles.explorerCardFitWrap}>
          <span className={styles.explorerCardFit}>{result.fitScore}</span>
          {/* A bare number here reads like a validated match percentage —
              it isn't. Same confidence this career's deep-dive card shows,
              just compact, so a skimmed list never implies more certainty
              than the underlying evidence actually supports. */}
          <span className={[styles.explorerCardConfidence, CONFIDENCE_CLASS[result.confidence]].join(' ')}>
            {result.confidence}
          </span>
        </span>
      </button>
      <p className={styles.explorerCardReason}>{reason ?? 'Not enough data scored yet to name a primary reason.'}</p>
      {friction && <p className={styles.explorerCardFriction}>{friction}</p>}

      {expanded && (
        <div className={styles.explorerCardDeep}>
          <CareerFitCard result={result} strengthQuadrants={strengthQuadrants} />
        </div>
      )}
    </div>
  )
}
