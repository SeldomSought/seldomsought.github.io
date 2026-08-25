import { PRIVACY_POINTS, PRIVACY_POSITIVE } from '../../content/copy/privacy'
import styles from './PrivacyList.module.css'

/**
 * The one rendering of the privacy explanation — used both as the landing
 * page's own dedicated section and, unchanged, inside PrivacyDisclosure's
 * inline reveal during the assessment. Same five short answers, same
 * wording, wherever it's read.
 */
export function PrivacyList() {
  return (
    <div className={styles.list}>
      {PRIVACY_POINTS.map((p) => (
        <div key={p.id} className={styles.row}>
          <div className={styles.label}>{p.label}</div>
          <p className={styles.body}>{p.body}</p>
        </div>
      ))}
      <p className={styles.positive}>{PRIVACY_POSITIVE}</p>
    </div>
  )
}
