import { useState } from 'react'
import type { RankingItem } from '../../engine/types'
import { ClickRanker } from './ClickRanker'
import sharedStyles from './items.module.css'
import styles from './CascadeChoiceItemView.module.css'

interface CascadeChoiceItemViewProps {
  item: RankingItem
  value: string[] | undefined
  onAnswer: (order: string[]) => void
}

/**
 * "Choose 5 from 18. Now eliminate 2. Now rank the remaining 3." — a
 * multi-stage scarcity exercise, not a single select-then-rank. The first
 * narrowing is choose-framed (tap to keep); every stage after that is
 * eliminate-framed (tap to cut) — psychologically distinct acts, even
 * though "keep 3 of 5" and "cut 2 of 5" land on the same math. Only the
 * final ranking is ever recorded as the answer.
 */
export function CascadeChoiceItemView({ item, value, onAnswer }: CascadeChoiceItemViewProps) {
  const cascade = item.selectCascade ?? [item.options.length]
  const optionsById = Object.fromEntries(item.options.map((o) => [o.id, o]))

  const alreadyRanked = Boolean(value && value.length === cascade[cascade.length - 1])
  const [stageIndex, setStageIndex] = useState(() => (alreadyRanked ? cascade.length : 0))
  const [pool, setPool] = useState<string[]>(() => (alreadyRanked && value ? value : item.options.map((o) => o.id)))
  const [working, setWorking] = useState<string[]>([])

  const isFirstStage = stageIndex === 0
  const isRankingStage = stageIndex >= cascade.length
  const keepTarget = cascade[stageIndex]
  const eliminateTarget = !isFirstStage && !isRankingStage ? pool.length - keepTarget : 0

  function startOver() {
    setStageIndex(0)
    setPool(item.options.map((o) => o.id))
    setWorking([])
  }

  function toggle(id: string) {
    const targetCount = isFirstStage ? keepTarget : eliminateTarget
    let next: string[]
    if (working.includes(id)) {
      next = working.filter((x) => x !== id)
    } else if (working.length < targetCount) {
      next = [...working, id]
    } else {
      return
    }

    if (next.length === targetCount) {
      const nextPool = isFirstStage ? next : pool.filter((pid) => !next.includes(pid))
      setPool(nextPool)
      setStageIndex(stageIndex + 1)
      setWorking([])
    } else {
      setWorking(next)
    }
  }

  if (isRankingStage) {
    const entries = pool.map((id) => ({ id, label: optionsById[id].label }))
    return (
      <div>
        <button type="button" className={styles.startOverLink} onClick={startOver}>
          ← Start over
        </button>
        <ClickRanker
          eyebrow="Now rank them"
          prompt={`Order your final ${pool.length} — most important first.`}
          entries={entries}
          value={alreadyRanked ? value : undefined}
          onComplete={onAnswer}
        />
      </div>
    )
  }

  const visiblePool = isFirstStage ? item.options.map((o) => o.id) : pool
  const targetCount = isFirstStage ? keepTarget : eliminateTarget

  return (
    <div className={sharedStyles.frame}>
      <div className={sharedStyles.eyebrow}>{isFirstStage ? `Choose ${keepTarget}` : `Eliminate ${eliminateTarget}`}</div>
      <p className={sharedStyles.prompt}>{item.prompt}</p>

      <div className={styles.stageDots} aria-hidden="true">
        {[...cascade, 0].map((_, i) => (
          <span key={i} className={[styles.stageDot, i < stageIndex ? styles.done : '', i === stageIndex ? styles.current : ''].join(' ')} />
        ))}
      </div>

      <p className={styles.stageLabel}>
        {isFirstStage
          ? `${working.length} / ${targetCount} chosen`
          : `${working.length} / ${targetCount} marked to eliminate — ${pool.length - working.length} would remain`}
      </p>

      <div className={styles.chipGrid} role="group" aria-label={item.prompt}>
        {visiblePool.map((id) => {
          const opt = optionsById[id]
          const isWorking = working.includes(id)
          return (
            <button
              key={id}
              type="button"
              className={[styles.chip, isFirstStage && isWorking ? styles.chipChosen : '', !isFirstStage && isWorking ? styles.chipMarked : ''].join(' ')}
              aria-pressed={isWorking}
              onClick={() => toggle(id)}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {!isFirstStage && (
        <button type="button" className={styles.startOverLink} onClick={startOver}>
          ← Start over from all {item.options.length}
        </button>
      )}
    </div>
  )
}
