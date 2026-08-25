import type { CSSProperties } from 'react'
import type { StatementItem } from '../../engine/types'
import sharedStyles from './items.module.css'
import styles from './LikertItem.module.css'

interface LikertItemProps {
  item: StatementItem
  value: number | undefined
  onAnswer: (value: number) => void
}

/**
 * A gauge with labeled stops, not a row of survey radio buttons. Desktop
 * shows every point across one row (a CSS grid, never wraps); mobile swaps
 * to a stacked list of full-width, generously padded rows. Selection is
 * signaled four ways at once — track thickness, tick size, and both text
 * weight and color — so "unmistakable" doesn't rely on color alone.
 *
 * Keyboard: number keys 1–N answer directly (wired in ItemRenderer, which
 * knows the option set generically). Holding Shift while pressing a number
 * answers *and* advances — opt-in, keyboard-only, off by default, so nobody
 * accidentally skips a question by fat-fingering a digit. Undocumented on
 * screen deliberately: repeating the same hint under every likert item in
 * a region added up to real, low-value clutter for the mouse-only majority.
 *
 * No eyebrow label either, for the same reason and at even higher stakes:
 * likert5 is by far the most common format (80 items app-wide, 42 of them
 * back to back in Temperament alone) — a static "Rate how true this is"
 * repeated that many times stops being read at all, and the five-point
 * gauge with agree/disagree labels already makes the format self-evident
 * from the first item onward. Every other item-format component keeps its
 * eyebrow (it's the one honest signal that the format itself just
 * changed) — this is the one case where the eyebrow would never change.
 */
export function LikertItem({ item, value, onAnswer }: LikertItemProps) {
  return (
    <div className={[sharedStyles.frame, styles.wrap].join(' ')}>
      <p className={sharedStyles.prompt}>{item.prompt}</p>

      <div
        className={styles.grid}
        style={{ '--sc-likert-count': item.options.length } as CSSProperties}
        role="radiogroup"
        aria-label={item.prompt}
      >
        {item.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={styles.post}
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onAnswer(opt.value)}
          >
            <span className={styles.tick} aria-hidden="true" />
            <span className={styles.numeral}>{opt.value}</span>
            <span className={styles.label}>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
