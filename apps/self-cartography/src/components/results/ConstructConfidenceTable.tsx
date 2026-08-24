import type { ConstructConfidence, ConstructConfidenceLevel } from '../../engine/scoring/constructConfidence'
import styles from './results.module.css'

const LEVEL_CLASS: Record<ConstructConfidenceLevel, string> = {
  'Very High': styles.agreementAligned,
  High: styles.strengthPromising,
  Moderate: styles.agreementMixed,
  Low: styles.agreementDiverged,
  'Very Low': styles.agreementUnknown,
}

const LEVEL_RANK: Record<ConstructConfidenceLevel, number> = { 'Very Low': 0, Low: 1, Moderate: 2, High: 3, 'Very High': 4 }

/**
 * Every scored construct, sorted least- to most-confident on purpose: the
 * whole point of construct-level confidence is to surface exactly which
 * numbers deserve scrutiny, so those lead rather than get buried under a
 * page of Very High rows.
 */
export function ConstructConfidenceTable({ confidences }: { confidences: ConstructConfidence[] }) {
  const sorted = [...confidences].sort((a, b) => LEVEL_RANK[a.level] - LEVEL_RANK[b.level] || a.label.localeCompare(b.label))

  return (
    <div className={styles.tableScroll}>
      <table className={styles.evidenceTable}>
        <thead>
          <tr>
            <th>Construct</th>
            <th>Score</th>
            <th>Confidence</th>
            <th>Evidence</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => (
            <tr key={c.facetId}>
              <td className={styles.evidenceLabel} data-label="Construct">{c.label}</td>
              <td className={styles.evidenceScore} data-label="Score">{c.score}</td>
              <td data-label="Confidence">
                <span className={[styles.agreementBadge, LEVEL_CLASS[c.level]].join(' ')}>{c.level}</span>
              </td>
              <td className={styles.evidenceScore} data-label="Evidence">
                {[
                  c.directItems > 0 ? `${c.directItems} direct` : null,
                  c.forcedChoiceItems > 0 ? `${c.forcedChoiceItems} forced-choice` : null,
                  c.behavioralItems > 0 ? `${c.behavioralItems} behavioral` : null,
                ].filter(Boolean).join(' · ')}
              </td>
              <td className={styles.flagDetail} data-label="Reason">{c.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
