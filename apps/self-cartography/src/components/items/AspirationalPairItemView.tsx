import { useState, type CSSProperties } from 'react'
import type { AspirationalPairItem, AspirationalResponseValue } from '../../engine/types'
import sharedStyles from './items.module.css'
import likertStyles from './LikertItem.module.css'
import styles from './AspirationalPairItemView.module.css'

interface AspirationalPairItemViewProps {
  item: AspirationalPairItem
  value: AspirationalResponseValue | undefined
  onAnswer: (value: AspirationalResponseValue) => void
}

/**
 * One statement, the same gauge shown twice in sequence — current self,
 * then desired self — never side by side, so the second answer is a real
 * independent judgment and not just a glance-over at the first. Reuses
 * LikertItem's gauge styling directly rather than inventing a second
 * rating control.
 */
export function AspirationalPairItemView({ item, value, onAnswer }: AspirationalPairItemViewProps) {
  const [phase, setPhase] = useState<'current' | 'desired'>(value ? 'desired' : 'current')
  const [current, setCurrent] = useState<number | undefined>(value?.current)

  function pickCurrent(v: number) {
    setCurrent(v)
    setPhase('desired')
  }

  function pickDesired(v: number) {
    if (current === undefined) return
    onAnswer({ current, desired: v })
  }

  const isDesiredPhase = phase === 'desired'
  const eyebrow = isDesiredPhase ? 'How much would you LIKE this to describe you?' : 'How much does this describe you now?'
  const activeValue = isDesiredPhase ? value?.desired : current

  return (
    <div className={[sharedStyles.frame, likertStyles.wrap].join(' ')}>
      {isDesiredPhase && (
        <button type="button" className={styles.changeLink} onClick={() => setPhase('current')}>
          ← Change your "now" answer
        </button>
      )}

      <div className={styles.progressRow}>
        <span className={[styles.stage, !isDesiredPhase ? styles.stageActive : styles.stageDone].join(' ')}>Now</span>
        <span className={styles.stageDivider} aria-hidden="true">→</span>
        <span className={[styles.stage, isDesiredPhase ? styles.stageActive : ''].join(' ')}>Desired</span>
      </div>

      <div className={sharedStyles.eyebrow}>{eyebrow}</div>
      <p className={sharedStyles.prompt}>{item.prompt}</p>

      <div
        className={likertStyles.grid}
        style={{ '--sc-likert-count': item.options.length } as CSSProperties}
        role="radiogroup"
        aria-label={eyebrow}
      >
        {item.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={likertStyles.post}
            role="radio"
            aria-checked={activeValue === opt.value}
            onClick={() => (isDesiredPhase ? pickDesired(opt.value) : pickCurrent(opt.value))}
          >
            <span className={likertStyles.tick} aria-hidden="true" />
            <span className={likertStyles.numeral}>{opt.value}</span>
            <span className={likertStyles.label}>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
