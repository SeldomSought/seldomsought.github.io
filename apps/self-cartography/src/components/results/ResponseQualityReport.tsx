import type { ResponseQualityModel } from '../../engine/scoring/responseQuality'
import { QUALITY_CATEGORY_LABEL } from '../../engine/scoring/responseQuality'
import styles from './results.module.css'

const CONFIDENCE_CLASS: Record<ResponseQualityModel['profileConfidence'], string> = {
  High: styles.agreementAligned,
  Moderate: styles.agreementMixed,
  Limited: styles.agreementDiverged,
}

/**
 * Never a lie detector: severity here describes measurement reliability
 * (how much weight to put on a given part of the profile), not the
 * respondent's honesty. The summary sentence is the main thing — the
 * signal list underneath is for anyone who wants the specifics.
 */
export function ResponseQualityReport({ model }: { model: ResponseQualityModel }) {
  return (
    <div>
      <div className={styles.profileConfidenceRow}>
        <span className={styles.profileConfidenceLabel}>Profile Confidence</span>
        <span className={[styles.profileConfidenceValue, CONFIDENCE_CLASS[model.profileConfidence]].join(' ')}>
          {model.profileConfidence}
        </span>
      </div>

      <p className={styles.narrative} style={{ fontSize: 'var(--sc-fs-body)', marginBottom: 'var(--sc-space-3)' }}>
        {model.summary}
      </p>

      {model.signals.length === 0 ? (
        <p className={styles.emptyNote}>No response-quality signals were detected across any of the eight checks this model runs.</p>
      ) : (
        <div className={styles.flagList}>
          {model.signals.map((s) => (
            <div key={s.id} className={[styles.flag, s.severity === 'flag' ? styles.severe : ''].join(' ')}>
              <div className={styles.qualityCategoryTag}>{QUALITY_CATEGORY_LABEL[s.category]}</div>
              <div className={styles.flagLabel}>{s.label}</div>
              <div className={styles.flagDetail}>{s.detail}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
