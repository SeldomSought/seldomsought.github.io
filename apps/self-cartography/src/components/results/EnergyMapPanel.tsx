import type { EnergyActivityResult, EnergyMapResult } from '../../engine/scoring/energyMap'
import styles from './results.module.css'

const COLUMN: { key: 'energizes' | 'neutral' | 'drains'; heading: string; hint: string; className: string }[] = [
  { key: 'energizes', heading: 'Energizes', hint: 'Work you’re likely to keep choosing once it’s no longer new.', className: 'energyEnergizes' },
  { key: 'neutral', heading: 'Neutral', hint: 'Tolerable — neither a draw nor a cost on its own.', className: 'energyNeutral' },
  { key: 'drains', heading: 'Drains', hint: 'Work that’s likely to wear on you with sustained exposure.', className: 'energyDrains' },
]

function ActivityRow({ activity }: { activity: EnergyActivityResult }) {
  return (
    <div className={styles.energyRow}>
      <div className={styles.energyRowTop}>
        <span className={styles.energyLabel}>{activity.label}</span>
        <span className={styles.energyScore}>{activity.score}</span>
      </div>
      <span className={styles.energyMeta}>
        {activity.facetLabel} · {activity.confidence} confidence
        {activity.sharesSignalWith.length > 0 && ` · same signal as ${activity.sharesSignalWith.join(', ')}`}
      </span>
    </div>
  )
}

/**
 * Sixteen concrete activities sorted into exactly one of three buckets —
 * never a bare percentage bar, never a chart wall. The three-column split
 * IS the answer to "what will I still tolerate after the novelty wears
 * off": Drains names what to expect to start avoiding, Energizes names
 * what's likely to hold up. Several activities read off the same six
 * underlying "energizes vs. drains" signals this instrument actually
 * measures (see content/copy/energyMap.ts) — shown explicitly per row
 * rather than implying sixteen independent measurements that don't exist.
 */
export function EnergyMapPanel({ map }: { map: EnergyMapResult }) {
  return (
    <div>
      <div className={styles.energyGrid}>
        {COLUMN.map((col) => {
          const activities = map[col.key]
          return (
            <div key={col.key} className={styles.energyColumn}>
              <div className={[styles.energyHeading, styles[col.className]].join(' ')}>{col.heading}</div>
              <p className={styles.energyHint}>{col.hint}</p>
              {activities.length > 0 ? (
                <div className={styles.energyList}>
                  {activities.map((a) => <ActivityRow key={a.id} activity={a} />)}
                </div>
              ) : (
                <p className={styles.emptyNote}>Nothing landed here.</p>
              )}
            </div>
          )
        })}
      </div>

      {map.unscored.length > 0 && (
        <p className={styles.deferredNote} style={{ marginTop: 'var(--sc-space-3)' }}>
          Not yet placed — the facet behind {map.unscored.length === 1 ? 'this activity hasn’t' : 'these activities haven’t'} been
          scored yet: {map.unscored.map((u) => u.label).join(', ')}.
        </p>
      )}
    </div>
  )
}
