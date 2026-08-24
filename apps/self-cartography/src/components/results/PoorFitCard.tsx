import type { PoorFitResult } from '../../engine/scoring/poorFitArchetypes'
import styles from './results.module.css'

const CONFIDENCE_CLASS: Record<PoorFitResult['confidence'], string> = {
  High: styles.agreementAligned,
  Moderate: styles.agreementMixed,
  Limited: styles.agreementDiverged,
}

/**
 * Deliberately not a mirror image of CareerFitCard's positive framing: no
 * bare "fit" number, no capability claim. The one fixed sentence below is
 * the honest claim this card exists to make — a pattern of friction in the
 * responses, never a verdict on what someone "can" or "can't" do. Everything
 * under it exists to make that sentence checkable, not just assertable.
 */
export function PoorFitCard({ result }: { result: PoorFitResult }) {
  const { label, description, reasons, confidence, confidenceReason, dimensions, dimensionsScored, dimensionsTotal } = result

  return (
    <div className={styles.careerCard}>
      <div className={styles.careerHeader}>
        <span className={styles.careerTitle}>{label}</span>
      </div>
      <p className={styles.careerBlurb}>{description}</p>

      <p className={styles.poorFitClaim}>
        This environment contains several characteristics your responses indicate would repeatedly drain or frustrate you.
      </p>

      <p className={styles.careerPenaltyNote}>
        Based on {dimensionsScored} of {dimensionsTotal} defining characteristics of this environment, scored so far
      </p>

      <div className={styles.careerGroupLabel}>Why it would likely wear on you</div>
      <div className={styles.bulletList}>
        {reasons.map((r) => <p key={r.dimensionId} className={styles.bulletNeg}>{r.text}</p>)}
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
          Open the {dimensions.length} dimension{dimensions.length === 1 ? '' : 's'} behind this flag
        </summary>
        <div className={styles.tableScroll}>
          <table className={styles.evidenceTable}>
            <thead>
              <tr>
                <th>Dimension</th>
                <th>This environment</th>
                <th>You scored</th>
                <th>Gap</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {dimensions.map((d) => (
                <tr key={d.facetId}>
                  <td className={styles.evidenceLabel} data-label="Dimension">{d.label}</td>
                  <td className={styles.evidenceScore} data-label="This environment">{d.characteristic}</td>
                  <td className={styles.evidenceScore} data-label="You scored">{d.actual}</td>
                  <td className={styles.evidenceScore} data-label="Gap">{d.gap}</td>
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
