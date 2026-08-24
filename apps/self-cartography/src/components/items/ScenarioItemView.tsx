import { useState, type CSSProperties } from 'react'
import type { ScenarioItem, ScenarioResponseValue } from '../../engine/types'
import sharedStyles from './items.module.css'
import styles from './ScenarioItemView.module.css'

interface ScenarioItemViewProps {
  item: ScenarioItem
  value: ScenarioResponseValue | undefined
  onAnswer: (value: ScenarioResponseValue) => void
}

const CONFIDENCE_POINTS = [1, 2, 3, 4, 5]

/** Fills in {{key}} placeholders from item.variables; a missing key is left visible rather than throwing. */
function interpolate(text: string, variables: Record<string, string> | undefined): string {
  if (!variables) return text
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => variables[key] ?? match)
}

/**
 * A concrete tradeoff, not a direct self-rating — the whole point is to
 * reveal a preference indirectly. Two (or more) options laid out as lean
 * typographic columns, separated by a single hairline rather than boxed
 * into cards — deliberately not "enormous," since a comparison with real
 * attribute lists gets heavy fast if each side is a padded, bordered card.
 * Choosing leads straight into a compact confidence follow-up; nothing is
 * recorded until that's answered too.
 */
export function ScenarioItemView({ item, value, onAnswer }: ScenarioItemViewProps) {
  const [phase, setPhase] = useState<'choose' | 'confidence'>(value ? 'confidence' : 'choose')
  const [choiceId, setChoiceId] = useState<string | undefined>(value?.choiceId)

  function pickChoice(id: string) {
    setChoiceId(id)
    setPhase('confidence')
  }

  function submitConfidence(confidence: number) {
    if (!choiceId) return
    onAnswer({ choiceId, confidence })
  }

  if (phase === 'confidence' && choiceId) {
    const chosen = item.choices.find((c) => c.id === choiceId)
    return (
      <div className={sharedStyles.frame}>
        <button type="button" className={styles.changeLink} onClick={() => setPhase('choose')}>
          ← Change your answer
        </button>

        {chosen && (
          <div className={styles.chosenSummary}>
            <span className={styles.chosenLabel}>You chose</span>
            <span className={styles.chosenTitle}>{chosen.label}</span>
          </div>
        )}

        <p className={sharedStyles.prompt}>How confident are you?</p>

        <div className={styles.confidenceRow} role="radiogroup" aria-label="How confident are you?">
          {CONFIDENCE_POINTS.map((n) => (
            <button
              key={n}
              type="button"
              className={[styles.confDot, value?.confidence === n ? styles.confDotActive : ''].join(' ')}
              role="radio"
              aria-checked={value?.confidence === n}
              onClick={() => submitConfidence(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <div className={styles.confidenceLabels}>
          <span>Not very confident</span>
          <span>Very confident</span>
        </div>
      </div>
    )
  }

  return (
    <div className={sharedStyles.frame}>
      <div className={sharedStyles.eyebrow}>Scenario</div>
      <p className={sharedStyles.scenarioText}>{interpolate(item.scenario, item.variables)}</p>
      <p className={styles.question}>Which do you choose?</p>

      <div
        className={styles.comparison}
        style={{ '--sc-scenario-count': item.choices.length } as CSSProperties}
        role="radiogroup"
        aria-label="Which do you choose?"
      >
        {item.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className={[styles.option, choiceId === choice.id ? styles.selected : ''].join(' ')}
            role="radio"
            aria-checked={choiceId === choice.id}
            onClick={() => pickChoice(choice.id)}
          >
            {choice.attributes ? (
              <>
                <span className={styles.optionTitle}>{interpolate(choice.label, item.variables)}</span>
                <ul className={styles.attributeList}>
                  {choice.attributes.map((attr) => (
                    <li key={attr}>{interpolate(attr, item.variables)}</li>
                  ))}
                </ul>
              </>
            ) : (
              <span className={styles.sentence}>{interpolate(choice.label, item.variables)}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
