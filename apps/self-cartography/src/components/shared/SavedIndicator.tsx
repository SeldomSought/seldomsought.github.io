import styles from './SavedIndicator.module.css'

/**
 * Quiet confirmation that autosave happened — the dot replays its pulse
 * animation whenever `savedAt` changes, driven by remounting on a changed
 * `key` rather than effect-driven setState (CSS handles the animation).
 */
export function SavedIndicator({ savedAt }: { savedAt: number | null }) {
  return (
    <span className={styles.wrap}>
      <span key={savedAt} className={[styles.dot, savedAt !== null ? styles.pulse : ''].join(' ')} />
      {savedAt ? 'Saved locally' : 'Not yet saved'}
    </span>
  )
}
