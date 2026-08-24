import { useState } from 'react'
import type { RankingItem } from '../../engine/types'
import { ClickRanker } from './ClickRanker'
import sharedStyles from './items.module.css'
import styles from './SelectAndRankItemView.module.css'

interface SelectAndRankItemViewProps {
  item: RankingItem
  value: string[] | undefined
  onAnswer: (order: string[]) => void
}

/**
 * "Pick N of these, then rank the N you picked" — a distinct two-phase
 * flow, not just ClickRanker with fewer entries. Selecting is tap-to-toggle
 * chips (no drag, no tiny handles — the whole chip is the target, large
 * enough for a thumb); ranking reuses ClickRanker unchanged once the
 * subset is locked in. The response is only ever the final rank order —
 * the selection phase is purely how you get there, not a separate answer.
 */
export function SelectAndRankItemView({ item, value, onAnswer }: SelectAndRankItemViewProps) {
  const selectCount = item.selectCount ?? item.options.length
  const alreadyRanked = Boolean(value && value.length === selectCount)

  const [phase, setPhase] = useState<'select' | 'rank'>(alreadyRanked ? 'rank' : 'select')
  const [selected, setSelected] = useState<string[]>(value ?? [])

  function toggleSelect(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= selectCount) return prev
      const next = [...prev, id]
      if (next.length === selectCount) setPhase('rank')
      return next
    })
  }

  if (phase === 'rank') {
    const selectedSet = new Set(selected)
    const entries = selected
      .map((id) => item.options.find((o) => o.id === id))
      .filter((o): o is RankingItem['options'][number] => Boolean(o))
      .map((o) => ({ id: o.id, label: o.label }))

    // A previously stored order is only still valid if it's ranking the
    // exact same subset that's currently selected — otherwise the
    // selection changed since that order was recorded, and ClickRanker
    // should start the ranking fresh rather than seed itself with stale ids.
    const rankValue = value && value.length === selected.length && value.every((id) => selectedSet.has(id)) ? value : undefined

    return (
      <div>
        <button type="button" className={styles.changeLink} onClick={() => setPhase('select')}>
          ← Change your {selectCount}
        </button>
        <ClickRanker
          eyebrow="Now rank them"
          prompt={`Order your ${selectCount} — most important first.`}
          entries={entries}
          value={rankValue}
          onComplete={onAnswer}
        />
      </div>
    )
  }

  const selectedSet = new Set(selected)

  return (
    <div className={sharedStyles.frame}>
      <div className={sharedStyles.eyebrow}>Choose {selectCount}</div>
      <p className={sharedStyles.prompt}>{item.prompt}</p>
      <p className={styles.hint}>{selected.length} / {selectCount} selected</p>
      <div className={styles.chipGrid}>
        {item.options.map((opt) => {
          const isSelected = selectedSet.has(opt.id)
          const isFull = selected.length >= selectCount && !isSelected
          return (
            <button
              key={opt.id}
              type="button"
              className={[styles.chip, isSelected ? styles.chipSelected : '', isFull ? styles.chipDisabled : ''].join(' ')}
              disabled={isFull}
              aria-pressed={isSelected}
              onClick={() => toggleSelect(opt.id)}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
