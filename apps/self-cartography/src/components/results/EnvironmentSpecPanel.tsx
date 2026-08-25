import type { EnvironmentSpecResult } from '../../engine/scoring/environmentSpec'
import styles from './results.module.css'

/**
 * A datasheet, not a paragraph — "elegant, concise, highly practical."
 * Two lists, each line traceable to exactly one scored facet (shown small,
 * on the right, for anyone who wants the number behind the requirement),
 * never a job title. This is deliberately the environment the profile
 * appears built for, presented before any specific role — see
 * ResultsReport.tsx for why it sits ahead of Career Fit.
 */
export function EnvironmentSpecPanel({ spec }: { spec: EnvironmentSpecResult }) {
  return (
    <div className={styles.specSheet}>
      <div className={styles.specColumn}>
        <div className={styles.specHeading}>Required conditions</div>
        <p className={styles.specLead}>You are likely to perform best when work provides:</p>
        {spec.required.length > 0 ? (
          <ul className={styles.specList}>
            {spec.required.map((line) => (
              <li key={line.id} className={styles.specLine}>
                <span className={styles.specMarker} aria-hidden="true">▪</span>
                <span className={styles.specPhrase}>{line.phrase}</span>
                <span className={styles.specValue}>{line.score}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyNote}>Not enough signal yet to specify required conditions.</p>
        )}
      </div>

      <div className={styles.specColumn}>
        <div className={[styles.specHeading, styles.specHeadingFriction].join(' ')}>Likely friction</div>
        <p className={styles.specLead}>Environments built around these are likely to cost you:</p>
        {spec.friction.length > 0 ? (
          <ul className={styles.specList}>
            {spec.friction.map((line) => (
              <li key={line.id} className={styles.specLine}>
                <span className={[styles.specMarker, styles.specMarkerFriction].join(' ')} aria-hidden="true">▪</span>
                <span className={styles.specPhrase}>{line.phrase}</span>
                <span className={styles.specValue}>{line.score}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyNote}>Not enough signal yet to specify likely friction.</p>
        )}
      </div>
    </div>
  )
}
