import { useState } from 'react'
import styles from './items.module.css'

interface ClickRankerProps {
  eyebrow: string
  /** Construct-specific framing only — the click-to-rank mechanic itself is
   * explained once by rankHint below, so a prompt that would only restate
   * "rank these N" is better left empty than repeated on every screen. */
  prompt?: string
  entries: { id: string; label: string }[]
  value: string[] | undefined
  onComplete: (order: string[]) => void
}

/**
 * Shared click-to-rank control behind both forcedChoiceRank and ranking.
 * Click entries in order from most-like-you to least — clicking a ranked
 * entry again removes it. Deliberately not drag-and-drop: more reliable on
 * touch, and fully keyboard/screen-reader operable as plain buttons.
 */
export function ClickRanker({ eyebrow, prompt, entries, value, onComplete }: ClickRankerProps) {
  const [order, setOrder] = useState<string[]>(value ?? [])

  function handleClick(id: string) {
    setOrder((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      if (next.length === entries.length) onComplete(next)
      return next
    })
  }

  return (
    <div className={styles.frame}>
      <div className={styles.eyebrow}>{eyebrow}</div>
      {prompt && <p className={styles.prompt}>{prompt}</p>}
      <p className={styles.rankHint}>Click in order, most like you first — {order.length} / {entries.length} ranked. Click again to undo.</p>
      <div className={styles.rankList} role="list">
        {entries.map((entry) => {
          const rank = order.indexOf(entry.id)
          return (
            <button
              key={entry.id}
              type="button"
              className={[styles.rankRow, rank >= 0 ? styles.ranked : ''].join(' ')}
              onClick={() => handleClick(entry.id)}
            >
              <span className={styles.rankBadge}>{rank >= 0 ? rank + 1 : ''}</span>
              <span className={styles.rankLabel}>{entry.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
