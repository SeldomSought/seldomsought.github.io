import { useState } from 'react'
import { ORIENTATION_PRINCIPLES, ORIENTATION_INTRO, ORIENTATION_CLOSING } from '../../content/copy/orientationPrinciples'
import { ContourLines } from '../motifs/ContourLines'
import { Button } from '../shared/Button'
import styles from './OrientationScreen.module.css'

const TOTAL = ORIENTATION_PRINCIPLES.length

/**
 * Principles revealed one at a time, on request — never as a wall of text.
 * Earlier ones stay visible but settle to a dimmer color once a newer one
 * arrives, so there's always exactly one thing asking for full attention.
 * Ends on "Map the person you actually are." as its own held beat before
 * the actual assessment begins.
 */
export function OrientationScreen({ onComplete }: { onComplete: () => void }) {
  const [revealed, setRevealed] = useState(1) // 1..TOTAL while reading; TOTAL+1 = closing shown

  const isClosing = revealed > TOTAL
  const shown = ORIENTATION_PRINCIPLES.slice(0, Math.min(revealed, TOTAL))

  function advance() {
    setRevealed((r) => Math.min(r + 1, TOTAL + 1))
  }

  if (isClosing) {
    return (
      <main className={styles.page}>
        <div className={styles.closing}>
          <div className={styles.closingRule}>
            <ContourLines />
          </div>
          <p className={styles.closingText}>{ORIENTATION_CLOSING}</p>
          <div className={styles.closingNav}>
            <Button variant="primary" onClick={onComplete}>Begin →</Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <div className={[styles.eyebrow, 'sc-eyebrow'].join(' ')}>Before you begin</div>
      <h1 className={styles.intro}>{ORIENTATION_INTRO}</h1>

      <div className={styles.dots} aria-hidden="true">
        {ORIENTATION_PRINCIPLES.map((_, i) => (
          <span key={i} className={[styles.dot, i < revealed ? styles.done : ''].join(' ')} />
        ))}
      </div>

      <div className={styles.list} aria-live="polite">
        {shown.map((principle, i) => {
          const isCurrent = i === revealed - 1
          return (
            <div key={principle} className={[styles.principle, isCurrent ? styles.current : ''].join(' ')}>
              <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
              <p className={styles.text}>{principle}</p>
            </div>
          )
        })}
      </div>

      <div className={styles.nav}>
        <Button variant="primary" onClick={advance}>
          {revealed === TOTAL ? 'Continue' : 'Next'}
        </Button>
        <Button variant="ghost" onClick={onComplete}>Skip intro →</Button>
      </div>
    </main>
  )
}
