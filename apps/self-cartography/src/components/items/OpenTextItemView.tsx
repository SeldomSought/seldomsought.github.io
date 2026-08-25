import { useState } from 'react'
import type { EvidencePromptItem } from '../../engine/types'
import styles from './items.module.css'

interface OpenTextItemViewProps {
  item: EvidencePromptItem
  value: string | undefined
  onAnswer: (text: string) => void
}

/** Never scored — held as-is and shown back verbatim in Synthesis. */
export function OpenTextItemView({ item, value, onAnswer }: OpenTextItemViewProps) {
  const [draft, setDraft] = useState(value ?? '')

  return (
    <div className={styles.frame}>
      <div className={styles.eyebrow}>{item.format === 'evidencePrompt' ? 'Optional evidence' : 'Optional reflection'}</div>
      <p className={styles.prompt}>{item.prompt}</p>
      <textarea
        className={styles.textarea}
        value={draft}
        placeholder="Optional — write as much or as little as you like."
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft.trim().length > 0) onAnswer(draft.trim())
        }}
      />
      <p className={styles.optionalNote}>Optional — you can leave this blank and move on.</p>
    </div>
  )
}
