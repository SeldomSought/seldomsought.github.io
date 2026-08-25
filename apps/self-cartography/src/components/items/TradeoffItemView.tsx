import { useState } from 'react'
import type { TradeoffItem } from '../../engine/types'
import sharedStyles from './items.module.css'
import styles from './TradeoffItemView.module.css'

interface TradeoffItemViewProps {
  item: TradeoffItem
  value: string | undefined
  onAnswer: (value: 'A' | 'B') => void
}

// ~38 of this app's ~80 tradeoff items carry one of these five prompts,
// verbatim, purely restating the mechanic ("pick one of the two
// statements below") — the two option cards already make that obvious.
// 'Which is closer to true?' alone repeats 18 times; read in sequence
// (Desire's 12 items lean on it especially hard) it stops conveying
// anything and just sits above the actual signal, the two statements
// themselves. The other ~42 tradeoff items have real, construct-specific
// framing (a scenario, a concrete tradeoff) that stays exactly as shown —
// this only ever hides the content-free ones, never blanks item.prompt
// itself (describeResponse.ts still quotes the real string for
// results-report evidence text either way).
const GENERIC_PROMPTS = new Set([
  'Which is closer to true?',
  'Which would you actually choose?',
  'Which would you rather have?',
  'Which would you actually do?',
  'Picture both, ten years out. Which would you actually choose?',
])

/**
 * The two-option forced choice — "which describes you MORE?" — not to be
 * confused with ForcedChoiceItemView (format 'forcedChoiceRank'), which
 * ranks 3+ statements. This one is a single head-to-head pick.
 *
 * Deliberately not a list: two equal panels split by a real dividing line,
 * so the tension between the two statements is something you can see, not
 * just read. Both sides use identical styling regardless of which is
 * chosen — no color, icon, or ordering cue implies either option is the
 * "better" one to pick.
 */
export function TradeoffItemView({ item, value, onAnswer }: TradeoffItemViewProps) {
  // Randomized once per mount, not per item id: which content lands left
  // vs. right varies across respondents, so screen position itself never
  // systematically favors whichever facet a content author happened to
  // write as "optionA." The stored answer always tracks the logical
  // option (A/B), never the side it was rendered on.
  const [optionAOnLeft] = useState(() => Math.random() < 0.5)

  const slots: { key: 'A' | 'B'; label: string }[] = optionAOnLeft
    ? [{ key: 'A', label: item.optionA.label }, { key: 'B', label: item.optionB.label }]
    : [{ key: 'B', label: item.optionB.label }, { key: 'A', label: item.optionA.label }]

  const showPrompt = !GENERIC_PROMPTS.has(item.prompt)

  return (
    <div className={sharedStyles.frame}>
      <div className={sharedStyles.eyebrow}>Forced choice</div>
      {showPrompt && <p className={sharedStyles.prompt}>{item.prompt}</p>}

      <div className={styles.pair} role="radiogroup" aria-label={item.prompt}>
        <button
          type="button"
          className={[styles.side, value === slots[0].key ? styles.chosen : '', value && value !== slots[0].key ? styles.declined : ''].join(' ')}
          role="radio"
          aria-checked={value === slots[0].key}
          onClick={() => onAnswer(slots[0].key)}
        >
          <span className={styles.letter}>{slots[0].key}</span>
          <span className={styles.statement}>{slots[0].label}</span>
        </button>

        <span className={styles.divider} aria-hidden="true">or</span>

        <button
          type="button"
          className={[styles.side, value === slots[1].key ? styles.chosen : '', value && value !== slots[1].key ? styles.declined : ''].join(' ')}
          role="radio"
          aria-checked={value === slots[1].key}
          onClick={() => onAnswer(slots[1].key)}
        >
          <span className={styles.letter}>{slots[1].key}</span>
          <span className={styles.statement}>{slots[1].label}</span>
        </button>
      </div>
    </div>
  )
}
