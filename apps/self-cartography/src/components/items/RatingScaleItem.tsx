import type { BehavioralHistoryScaleItem, StatementItem } from '../../engine/types'
import styles from './items.module.css'

const FORMAT_EYEBROW: Record<string, string> = {
  likert5: 'Rate how true this is',
  likertFrequency: 'How often',
  confidence: 'Confidence check',
  behavioralHistory: 'Based on recent behavior',
}

interface RatingScaleItemProps {
  item: StatementItem | BehavioralHistoryScaleItem
  value: number | undefined
  onAnswer: (value: number) => void
}

/**
 * Handles likert5, likertFrequency, confidence, and behavioralHistory in its
 * 'scale' mode — all share the same shape (a prompt plus a small set of
 * labeled points). Categorical-mode behavioralHistory items use
 * CategoricalHistoryItemView instead, since their options aren't ordered.
 * behavioralHistory gets a distinct eyebrow so it visually reads as
 * evidence, not self-image, even though the control is identical.
 */
export function RatingScaleItem({ item, value, onAnswer }: RatingScaleItemProps) {
  return (
    <div className={styles.frame}>
      <div className={[styles.eyebrow, item.format === 'behavioralHistory' ? styles.eyebrowEvidence : ''].join(' ')}>
        {FORMAT_EYEBROW[item.format]}
      </div>
      <p className={styles.prompt}>{item.prompt}</p>
      <div className={styles.ratingRow} role="radiogroup" aria-label={item.prompt}>
        {item.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={styles.ratingBtn}
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onAnswer(opt.value)}
          >
            <span className={styles.ratingValue}>{opt.value}</span>
            <span className={styles.ratingLabel}>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
