import type { Contradiction } from '../../engine/scoring/contradictions'
import styles from './results.module.css'

const SEVERITY_CLASS: Record<Contradiction['severity'], string> = {
  Low: styles.severityLow,
  Medium: styles.severityMedium,
  High: styles.severityHigh,
}

const CONFIDENCE_CLASS: Record<Contradiction['confidence'], string> = {
  High: styles.agreementAligned,
  Medium: styles.agreementMixed,
  Low: styles.agreementDiverged,
}

const TYPE_LABEL: Record<Contradiction['type'], string> = {
  statedVsRevealed: 'Stated vs. revealed',
  identityVsEvidence: 'Identity vs. evidence',
  professedVsChosen: 'Professed vs. chosen',
}

export function ContradictionCard({ contradiction }: { contradiction: Contradiction }) {
  const { title, type, severity, confidence, detail, relatedConstructs, supportingResponses } = contradiction
  return (
    <div className={styles.contradictionCard}>
      <div className={styles.contradictionHeader}>
        <span className={styles.contradictionTitle}>{title}</span>
        <div className={styles.contradictionBadges}>
          <span className={[styles.agreementBadge, SEVERITY_CLASS[severity]].join(' ')}>{severity} severity</span>
          <span className={[styles.agreementBadge, CONFIDENCE_CLASS[confidence]].join(' ')}>{confidence} confidence</span>
        </div>
      </div>
      <div className={styles.contradictionType}>{TYPE_LABEL[type]}</div>
      <p className={styles.contradictionDetail}>{detail}</p>
      <div className={styles.constructTags}>
        {relatedConstructs.map((c) => <span key={c} className={styles.constructTag}>{c}</span>)}
      </div>
      {supportingResponses.length > 0 && (
        <>
          <div className={styles.supportingLabel}>Supporting responses</div>
          <div className={styles.supportingList}>
            {supportingResponses.map((s, i) => <div key={`${s.facetId}-${i}`} className={styles.supportingItem}>{s.text}</div>)}
          </div>
        </>
      )}
    </div>
  )
}
