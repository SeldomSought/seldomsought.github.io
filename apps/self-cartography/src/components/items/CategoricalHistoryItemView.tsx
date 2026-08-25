import type { BehavioralHistoryCategoricalItem } from '../../engine/types'
import sharedStyles from './items.module.css'
import styles from './CategoricalHistoryItemView.module.css'

interface CategoricalHistoryItemViewProps {
  item: BehavioralHistoryCategoricalItem
  value: string | undefined
  onAnswer: (choiceId: string) => void
}

/**
 * Behavioral-evidence questions whose answers aren't a scale — "what do you
 * usually end up doing," not "how often." Plain chips, single-select, no
 * numbering: an ordered gauge here would imply a ranking these options
 * don't actually have.
 */
export function CategoricalHistoryItemView({ item, value, onAnswer }: CategoricalHistoryItemViewProps) {
  return (
    <div className={sharedStyles.frame}>
      <div className={[sharedStyles.eyebrow, sharedStyles.eyebrowEvidence].join(' ')}>Based on recent behavior</div>
      <p className={sharedStyles.prompt}>{item.prompt}</p>
      <div className={styles.grid} role="radiogroup" aria-label={item.prompt}>
        {item.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={[styles.chip, value === opt.id ? styles.chipSelected : ''].join(' ')}
            role="radio"
            aria-checked={value === opt.id}
            onClick={() => onAnswer(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
