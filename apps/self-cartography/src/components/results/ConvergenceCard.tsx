import type { ConvergenceSignal } from '../../engine/scoring/synthesis'
import styles from './results.module.css'

const STRENGTH_CLASS: Record<ConvergenceSignal['strength'], string> = {
  Emerging: styles.strengthEmerging,
  Notable: styles.strengthNotable,
  Strong: styles.strengthStrong,
}

export function ConvergenceCard({ signal }: { signal: ConvergenceSignal }) {
  return (
    <div className={styles.contradictionCard}>
      <div className={styles.contradictionHeader}>
        <span className={styles.contradictionTitle}>{signal.name}</span>
        <div className={styles.contradictionBadges}>
          <span className={[styles.agreementBadge, STRENGTH_CLASS[signal.strength]].join(' ')}>{signal.strength}</span>
          <span className={styles.conditionsNote}>{signal.conditionsMet} of {signal.conditionsTotal} signals present</span>
        </div>
      </div>
      <p className={styles.contradictionDetail}>{signal.detail}</p>
      <div className={styles.contributorGrid}>
        {signal.contributingFacets.map((c) => (
          <div key={c.facetId} className={[styles.contributorRow, c.met ? styles.contributorMet : styles.contributorUnmet].join(' ')}>
            <span className={styles.contributorLabel}>{c.label}</span>
            <span className={styles.contributorScore}>{c.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
