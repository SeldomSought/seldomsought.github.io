import type { TensionSignal } from '../../engine/scoring/synthesis'
import styles from './results.module.css'

/**
 * A tension isn't a flaw to fix — it's a constraint good career architecture
 * has to solve for. The pole header ("FREEDOM ↔ SECURITY") is what a reader
 * scans first; the longer name and paragraph explain the specific shape of
 * that constraint, grounded in the two facets shown beneath — never a
 * verdict on which side is "truer."
 */
export function TensionCard({ signal }: { signal: TensionSignal }) {
  return (
    <div className={styles.contradictionCard}>
      <div className={styles.tensionPoleHeader}>{signal.poleA.toUpperCase()} <span className={styles.tensionArrow}>↔</span> {signal.poleB.toUpperCase()}</div>
      <div className={styles.contradictionHeader}>
        <span className={styles.contradictionTitle}>{signal.name}</span>
      </div>
      <p className={styles.contradictionDetail}>{signal.detail}</p>
      <div className={styles.tensionPair}>
        <div className={styles.tensionSide}>
          <span className={styles.tensionLabel}>{signal.facetA.label}</span>
          <span className={styles.tensionScore}>{signal.facetA.score}</span>
        </div>
        <span className={styles.tensionVs}>↔</span>
        <div className={styles.tensionSide}>
          <span className={styles.tensionLabel}>{signal.facetB.label}</span>
          <span className={styles.tensionScore}>{signal.facetB.score}</span>
        </div>
      </div>
    </div>
  )
}
