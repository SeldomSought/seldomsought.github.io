import { FACET_BY_ID } from '../../content/facets'
import type { ValuesEvidenceBreakdown } from '../../engine/scoring/valuesEvidence'
import { EvidenceAlignment } from './EvidenceAlignment'
import styles from './results.module.css'

const AGREEMENT_COPY: Record<ValuesEvidenceBreakdown['agreement'], string> = {
  aligned: 'Aligned',
  mixed: 'Mixed',
  diverged: 'Diverged',
  'insufficient-evidence': 'Not enough evidence',
}

const AGREEMENT_CLASS: Record<ValuesEvidenceBreakdown['agreement'], string> = {
  aligned: styles.agreementAligned,
  mixed: styles.agreementMixed,
  diverged: styles.agreementDiverged,
  'insufficient-evidence': styles.agreementUnknown,
}

function cell(value: number | null): string {
  return value === null ? '—' : String(value)
}

/**
 * The point isn't to declare a "true" score — it's to show where saying,
 * choosing, and doing line up, and where they don't. A value that scores
 * high when asked directly but low under a forced tradeoff is itself a
 * finding, not noise to average away.
 */
export function ValuesAgreementPanel({ rows }: { rows: ValuesEvidenceBreakdown[] }) {
  const withEvidence = rows.filter((r) => r.professed !== null || r.revealedTradeoff !== null || r.behavioral !== null)
  if (withEvidence.length === 0) return null

  return (
    <div><EvidenceAlignment rows={withEvidence} /><details className={styles.readingNotes}><summary>Exact evidence scores</summary><div className={styles.tableScroll}>
      <table className={styles.evidenceTable}>
        <thead>
          <tr>
            <th>Value</th>
            <th>Professed</th>
            <th>Revealed</th>
            <th>Behavioral</th>
            <th>Agreement</th>
          </tr>
        </thead>
        <tbody>
          {withEvidence.map((row) => (
            <tr key={row.facetId}>
              <td className={styles.evidenceLabel}>{FACET_BY_ID[row.facetId]?.label ?? row.facetId}</td>
              <td className={styles.evidenceScore}>{cell(row.professed)}</td>
              <td className={styles.evidenceScore}>{cell(row.revealedTradeoff)}</td>
              <td className={styles.evidenceScore}>{cell(row.behavioral)}</td>
              <td>
                <span className={[styles.agreementBadge, AGREEMENT_CLASS[row.agreement]].join(' ')}>
                  {AGREEMENT_COPY[row.agreement]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div></details></div>
  )
}
