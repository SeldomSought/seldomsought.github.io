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
      <svg className={styles.aspirationPlot} viewBox="0 0 500 58" role="img" aria-label={`Current self-report ${gap.currentScore}, desired ${gap.desiredScore}, gap ${gap.gap} on a 0 to 100 scale`}>
        <line x1="22" x2="478" y1="23" y2="23" stroke="currentColor" opacity=".18" />
        {[0, 25, 50, 75, 100].map((v) => <g key={v}><line x1={22 + v * 4.56} x2={22 + v * 4.56} y1="19" y2="27" stroke="currentColor" opacity=".35" /><text x={22 + v * 4.56} y="49" textAnchor="middle" fill="currentColor" fontSize="12">{v}</text></g>)}
        <line x1={22 + gap.currentScore * 4.56} x2={22 + gap.desiredScore * 4.56} y1="23" y2="23" stroke="var(--sc-accent)" strokeWidth="3" />
        <circle cx={22 + gap.currentScore * 4.56} cy="23" r="6" fill="var(--sc-accent)" />
        <circle cx={22 + gap.desiredScore * 4.56} cy="23" r="9" fill="none" stroke="var(--sc-accent)" strokeWidth="2" />
      </svg>
      <div className={styles.aspirationNumbers}>
        <div className={styles.aspirationStat}>
          <span className={styles.aspirationStatLabel}>● Current self-report</span>
          <span className={styles.aspirationStatValue}>{gap.currentScore}</span>
        </div>
        <div className={styles.aspirationStat}>
          <span className={styles.aspirationStatLabel}>○ Desired identity</span>
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
