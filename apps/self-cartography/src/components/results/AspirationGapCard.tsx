import type { AspirationGap } from '../../engine/scoring/aspirationalGaps'
import styles from './results.module.css'

const CATEGORY_LABEL: Record<AspirationGap['category'], string> = {
  aligned: 'Demonstrated & desired align',
  developmentalAspiration: 'Developmental aspiration',
  exceedsDesired: 'Exceeds what’s actually desired',
}

const CATEGORY_CLASS: Record<AspirationGap['category'], string> = {
  aligned: styles.categoryAligned,
  developmentalAspiration: styles.categoryDevelopmental,
  exceedsDesired: styles.categoryExceeds,
}

function gapClass(gap: number): string {
  if (gap > 0) return styles.aspirationGapPositive
  if (gap < 0) return styles.aspirationGapNegative
  return styles.aspirationGapNone
}

/**
 * Three numbers, never blended into one: demonstrated identity (now),
 * desired identity (wanted), and the gap between them — labeled as three
 * distinct things because they are, not stages of the same measurement.
 */
export function AspirationGapCard({ gap }: { gap: AspirationGap }) {
  return (
    <div className={styles.aspirationCard}>
      <div className={styles.aspirationHeader}>
        <span className={styles.aspirationLabel}>{gap.label}</span>
        <span className={[styles.agreementBadge, CATEGORY_CLASS[gap.category]].join(' ')}>{CATEGORY_LABEL[gap.category]}</span>
      </div>
      <p className={styles.aspirationStatement}>“{gap.prompt}”</p>
      <div className={styles.aspirationNumbers}>
        <div className={styles.aspirationStat}>
          <span className={styles.aspirationStatLabel}>Demonstrated identity</span>
          <span className={styles.aspirationStatValue}>{gap.currentScore}</span>
        </div>
        <div className={styles.aspirationStat}>
          <span className={styles.aspirationStatLabel}>Desired identity</span>
          <span className={styles.aspirationStatValue}>{gap.desiredScore}</span>
        </div>
        <div className={styles.aspirationStat}>
          <span className={styles.aspirationStatLabel}>Developmental aspiration</span>
          <span className={[styles.aspirationStatValue, gapClass(gap.gap)].join(' ')}>
            {gap.gap > 0 ? '+' : ''}{gap.gap}
          </span>
        </div>
      </div>
    </div>
  )
}
