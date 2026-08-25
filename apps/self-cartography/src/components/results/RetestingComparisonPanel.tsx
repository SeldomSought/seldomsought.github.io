import type { StabilityComparison, StabilityComparisonResult } from '../../engine/scoring/stability'
import { STABILITY_LABEL, STABILITY_BLURB } from '../../content/stability'
import styles from './results.module.css'

const COLUMN_CLASS = { stable: 'energyEnergizes', changing: 'energyDrains', uncertain: 'energyNeutral' } as const

function DeltaRow({ comparison }: { comparison: StabilityComparison }) {
  const sign = comparison.delta > 0 ? '+' : ''
  return (
    <div className={styles.energyRow}>
      <div className={styles.energyRowTop}>
        <span className={styles.energyLabel}>{comparison.label}</span>
        <span className={styles.energyScore}>{comparison.previousScore} → {comparison.currentScore} ({sign}{comparison.delta})</span>
      </div>
    </div>
  )
}

/**
 * Only ever rendered once a real prior snapshot exists (see
 * ResultsReport.tsx) — this is the actual "2026 vs. 2027" comparison the
 * retesting architecture exists for, not a mock-up. STABLE / CHANGING /
 * UNCERTAIN blends each facet's theoretical class (content/stability.ts)
 * with how much it actually moved this time, and with whether either
 * snapshot's own evidence was too thin to trust the comparison at all.
 */
export function RetestingComparisonPanel({ comparison }: { comparison: StabilityComparisonResult }) {
  return (
    <div className={styles.energyGrid}>
      {(['stable', 'changing', 'uncertain'] as const).map((bucket) => {
        const items = comparison[bucket]
        return (
          <div key={bucket} className={styles.energyColumn}>
            <div className={[styles.energyHeading, styles[COLUMN_CLASS[bucket]]].join(' ')}>{STABILITY_LABEL[bucket].toUpperCase()}</div>
            <p className={styles.energyHint}>{STABILITY_BLURB[bucket]}</p>
            {items.length > 0 ? (
              <div className={styles.energyList}>
                {items.map((c) => <DeltaRow key={c.facetId} comparison={c} />)}
              </div>
            ) : (
              <p className={styles.emptyNote}>Nothing landed here.</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
