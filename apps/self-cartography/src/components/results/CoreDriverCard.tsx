import type { CoreDriverResult } from '../../engine/scoring/coreDrivers'
import type { ConstructConfidenceLevel } from '../../engine/scoring/constructConfidence'
import styles from './results.module.css'

const CONFIDENCE_CLASS: Record<ConstructConfidenceLevel, string> = {
  'Very High': styles.agreementAligned,
  High: styles.strengthPromising,
  Moderate: styles.agreementMixed,
  Low: styles.agreementDiverged,
  'Very Low': styles.agreementUnknown,
}

/**
 * One motivational force, evidence attached: the description only ever
 * shown because the underlying facets actually converged (see
 * engine/scoring/coreDrivers.ts), a healthy/excessive pair naming both
 * sides of the same trait honestly, and the full supporting-facet ledger
 * open for anyone who wants to check the claim rather than take it on faith.
 */
// A driver can genuinely be one of the strongest things about someone
// (high importance — the underlying facets converged on it) while the
// evidence behind exactly how strong is still thin (low confidence) — two
// true, unrelated facts. Shown side by side with no connecting sentence,
// a reader has to reconcile "Importance 90" and "Evidence: Very Low"
// themselves; this only fires when they'd actually need to.
const LOW_CONFIDENCE: ConstructConfidenceLevel[] = ['Low', 'Very Low']
const HIGH_IMPORTANCE_THRESHOLD = 70

export function CoreDriverCard({ result }: { result: CoreDriverResult }) {
  const { label, description, whenHealthy, whenExcessive, importance, confidence, behavioralEvidenceCount, supportingFacets } = result
  const showReconciliation = importance >= HIGH_IMPORTANCE_THRESHOLD && LOW_CONFIDENCE.includes(confidence)

  return (
    <div className={styles.careerCard}>
      <div className={styles.careerHeader}>
        <span className={styles.careerTitle}>{label}</span>
        <span className={styles.careerFit}>Importance {importance}</span>
      </div>

      <p className={styles.contradictionDetail}>{description}</p>

      <div className={styles.driverColumns}>
        <div>
          <div className={styles.careerGroupLabel}>When healthy</div>
          <p className={styles.driverPhrase}>{whenHealthy.join(' · ')}</p>
        </div>
        <div>
          <div className={styles.careerGroupLabel}>When excessive</div>
          <p className={styles.driverPhrase}>{whenExcessive}</p>
        </div>
      </div>

      <div className={styles.careerConfidenceRow}>
        <div className={styles.profileConfidenceRow}>
          <span className={styles.profileConfidenceLabel}>Evidence</span>
          <span className={[styles.profileConfidenceValue, CONFIDENCE_CLASS[confidence]].join(' ')}>{confidence}</span>
        </div>
        <p className={styles.careerConfidenceReason}>
          {behavioralEvidenceCount > 0
            ? `Includes ${behavioralEvidenceCount} behavioral indicator${behavioralEvidenceCount === 1 ? '' : 's'} — not just what you said about yourself.`
            : 'Built from self-report so far — no behavioral indicators have weighed in on this one yet.'}
          {showReconciliation && ' This one’s a real pattern in your answers, but it’s early — the importance score and the confidence label are measuring two different things, not disagreeing with each other.'}
        </p>
      </div>

      <details className={styles.careerDimensionsDetails}>
        <summary className={styles.careerDimensionsSummary}>
          Open the {supportingFacets.length} supporting answer{supportingFacets.length === 1 ? '' : 's'}
        </summary>
        <div className={styles.tableScroll}>
          <table className={styles.evidenceTable}>
            <thead>
              <tr>
                <th>Facet</th>
                <th>Score</th>
                <th>Contributed</th>
              </tr>
            </thead>
            <tbody>
              {supportingFacets.map((f) => (
                <tr key={f.facetId}>
                  <td className={styles.evidenceLabel} data-label="Facet">{f.label}</td>
                  <td className={styles.evidenceScore} data-label="Score">{f.score}</td>
                  <td data-label="Contributed">
                    <span className={[styles.agreementBadge, f.met ? styles.roleStrength : styles.roleNeutral].join(' ')}>
                      {f.met ? 'Yes' : 'Context'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
