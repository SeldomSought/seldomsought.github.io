import type { UnconventionalPathResult } from '../../engine/scoring/unconventionalPaths'
import styles from './results.module.css'

const CONFIDENCE_CLASS: Record<UnconventionalPathResult['confidence'], string> = {
  High: styles.agreementAligned,
  Moderate: styles.agreementMixed,
  Limited: styles.agreementDiverged,
}

const STRENGTH_CLASS: Record<UnconventionalPathResult['strength'], string> = {
  Strong: styles.agreementAligned,
  Notable: styles.strengthPromising,
  Emerging: styles.agreementMixed,
}

/**
 * A CAREER STRUCTURE, not a job title — see careerStructures.ts. exampleRoles
 * ground the abstraction in recognizable titles, but the recommendation
 * itself is the structure (how the work is organized), which is the whole
 * point of this surface existing separately from ordinary career fit.
 */
export function UnconventionalPathCard({ result }: { result: UnconventionalPathResult }) {
  const { label, description, exampleRoles, strength, conditionsMet, conditionsTotal, detail, confidence, confidenceReason, dimensions } = result

  return (
    <div className={styles.careerCard}>
      <div className={styles.careerHeader}>
        <span className={styles.careerTitle}>{label}</span>
        <span className={[styles.careerFit, STRENGTH_CLASS[strength]].join(' ')}>
          {strength} — {conditionsMet} of {conditionsTotal} traits converge
        </span>
      </div>
      <p className={styles.careerBlurb}>{description}</p>

      <p className={styles.contradictionDetail}>{detail}</p>

      <div className={styles.careerGroupLabel}>Shows up as</div>
      <div className={styles.constructTags}>
        {exampleRoles.map((role) => <span key={role} className={styles.constructTag}>{role}</span>)}
      </div>

      <div className={styles.careerConfidenceRow}>
        <div className={styles.profileConfidenceRow}>
          <span className={styles.profileConfidenceLabel}>Confidence</span>
          <span className={[styles.profileConfidenceValue, CONFIDENCE_CLASS[confidence]].join(' ')}>{confidence}</span>
        </div>
        <p className={styles.careerConfidenceReason}>{confidenceReason}</p>
      </div>

      <details className={styles.careerDimensionsDetails}>
        <summary className={styles.careerDimensionsSummary}>
          Open the {dimensions.length} dimension{dimensions.length === 1 ? '' : 's'} behind this signal
        </summary>
        <div className={styles.tableScroll}>
          <table className={styles.evidenceTable}>
            <thead>
              <tr>
                <th>Dimension</th>
                <th>Wanted</th>
                <th>You scored</th>
                <th>Met</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {dimensions.map((d) => (
                <tr key={d.facetId}>
                  <td className={styles.evidenceLabel} data-label="Dimension">{d.label}</td>
                  <td className={styles.evidenceScore} data-label="Wanted">{d.direction === 'high' ? `High (≥ ${d.threshold})` : `Low (≤ ${100 - d.threshold})`}</td>
                  <td className={styles.evidenceScore} data-label="You scored">{d.actual}</td>
                  <td data-label="Met">
                    <span className={[styles.agreementBadge, d.met ? styles.roleStrength : styles.roleNeutral].join(' ')}>
                      {d.met ? 'Met' : 'Not met'}
                    </span>
                  </td>
                  <td className={styles.evidenceScore} data-label="Evidence">{d.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
