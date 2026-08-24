import { useState } from 'react'
import { LANDING_DIMENSIONS, DIMENSION_CONNECTIONS } from '../../content/copy/dimensions'
import styles from './DimensionsMap.module.css'

/**
 * The eight signals, introduced. Real HTML buttons layered over a
 * decorative SVG line-backdrop — not floating tooltips on raw SVG shapes —
 * so touch targets, focus order, and screen readers all work without
 * special-casing. One shared description readout below the diagram,
 * rather than eight things trying to position themselves near a finger.
 */
export function DimensionsMap() {
  const [activeId, setActiveId] = useState(LANDING_DIMENSIONS[0].id)
  const active = LANDING_DIMENSIONS.find((d) => d.id === activeId) ?? LANDING_DIMENSIONS[0]
  const byId = Object.fromEntries(LANDING_DIMENSIONS.map((d) => [d.id, d]))

  return (
    <div className={styles.wrap}>
      <div className={styles.diagram}>
        <svg className={styles.lines} aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 100 100">
          {DIMENSION_CONNECTIONS.map(([aId, bId]) => {
            const a = byId[aId]
            const b = byId[bId]
            const isActive = aId === activeId || bId === activeId
            return (
              <line
                key={`${aId}-${bId}`}
                className={isActive ? styles.lineActive : styles.line}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
              />
            )
          })}
        </svg>

        {LANDING_DIMENSIONS.map((d) => (
          <button
            key={d.id}
            type="button"
            className={[styles.node, d.id === activeId ? styles.nodeActive : ''].join(' ')}
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
            onMouseEnter={() => setActiveId(d.id)}
            onFocus={() => setActiveId(d.id)}
            onClick={() => setActiveId(d.id)}
            aria-pressed={d.id === activeId}
          >
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.label}>{d.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.detail} aria-live="polite">
        <div className={styles.detailLabel}>{active.label}</div>
        <p className={styles.detailText}>{active.description}</p>
      </div>
    </div>
  )
}
