import { PrivacyList } from './PrivacyList'
import styles from './PrivacyDisclosure.module.css'

/**
 * A collapsed-by-default "Privacy" reveal — reachable from wherever this
 * renders, without adding a screen or a navigation decision. Same content
 * as the landing page's own privacy section (PrivacyList), so it's never a
 * different, shorter, or vaguer story than what was already promised
 * before the assessment began.
 */
export function PrivacyDisclosure() {
  return (
    <details className={styles.disclosure}>
      <summary className={styles.summary}>Privacy</summary>
      <div className={styles.panel}>
        <PrivacyList />
      </div>
    </details>
  )
}
