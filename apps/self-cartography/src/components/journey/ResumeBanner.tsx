import { Button } from '../shared/Button'
import styles from './ResumeBanner.module.css'

function timeAgo(savedAt: number): string {
  const seconds = Math.max(0, Math.round((Date.now() - savedAt) / 1000))
  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

/**
 * Shown once per resumed session, regardless of which view the saved state
 * actually landed on — a returning visitor sees this whether they left off
 * on the region map, mid-question, or at Synthesis. Dismissing it doesn't
 * navigate anywhere; the already-hydrated view underneath is already the
 * right one.
 */
export function ResumeBanner({ savedAt, onContinue }: { savedAt: number | null; onContinue: () => void }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <span className={styles.text}>
          Picking up where you left off — saved locally{savedAt ? `, ${timeAgo(savedAt)}` : ''}.
        </span>
        <Button onClick={onContinue}>Continue assessment</Button>
      </div>
    </div>
  )
}
