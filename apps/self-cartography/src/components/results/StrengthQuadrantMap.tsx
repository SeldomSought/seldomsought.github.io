import type { StrengthQuadrant, StrengthQuadrantMap as StrengthQuadrantMapData, StrengthQuadrantResult } from '../../engine/scoring/strengthQuadrant'
import { QUADRANT_LABEL, QUADRANT_BLURB } from '../../engine/scoring/strengthQuadrant'
import styles from './results.module.css'

const SIZE = 320
const PAD = 36
const PLOT = SIZE - PAD * 2

const QUADRANT_CLASS: Record<StrengthQuadrant, string> = {
  signature: 'quadrantSignature',
  utilitarian: 'quadrantUtilitarian',
  development: 'quadrantDevelopment',
  lowReturn: 'quadrantLowReturn',
}

function toXY(r: StrengthQuadrantResult): { x: number; y: number } {
  return {
    x: PAD + (r.abilityScore / 100) * PLOT,
    y: PAD + (1 - r.energyScore / 100) * PLOT, // SVG y grows downward — energizing sits at the top
  }
}

/**
 * A real coordinate plot, not a radar and not four disconnected lists:
 * Ability on x, Energy on y, each strength domain placed at its own point.
 * The quadrant a domain lands in is read directly off position, the same
 * way the four named regions were defined — never a separate, inconsistent
 * classification layered on top of the picture.
 */
export function StrengthQuadrantMap({ map }: { map: StrengthQuadrantMapData }) {
  const mid = PAD + PLOT / 2

  return (
    <div>
      <div className={styles.quadrantPlotWrap}>
        <svg className={styles.quadrantSvg} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Ability by Energy strength map">
          <rect x={PAD} y={PAD} width={PLOT / 2} height={PLOT / 2} className={[styles.quadrantRegion, styles.quadrantDevelopment].join(' ')} />
          <rect x={mid} y={PAD} width={PLOT / 2} height={PLOT / 2} className={[styles.quadrantRegion, styles.quadrantSignature].join(' ')} />
          <rect x={PAD} y={mid} width={PLOT / 2} height={PLOT / 2} className={[styles.quadrantRegion, styles.quadrantLowReturn].join(' ')} />
          <rect x={mid} y={mid} width={PLOT / 2} height={PLOT / 2} className={[styles.quadrantRegion, styles.quadrantUtilitarian].join(' ')} />

          <line x1={mid} y1={PAD} x2={mid} y2={PAD + PLOT} className={styles.quadrantAxisLine} />
          <line x1={PAD} y1={mid} x2={PAD + PLOT} y2={mid} className={styles.quadrantAxisLine} />

          <text x={PAD} y={SIZE - 12} className={styles.quadrantAxisLabel}>Low ability</text>
          <text x={PAD + PLOT} y={SIZE - 12} textAnchor="end" className={styles.quadrantAxisLabel}>High ability</text>
          <text x={12} y={PAD + 4} className={styles.quadrantAxisLabel}>Energizing</text>
          <text x={12} y={PAD + PLOT} className={styles.quadrantAxisLabel}>Draining</text>

          {map.placed.map((r) => {
            const { x, y } = toXY(r)
            return (
              <g key={r.domainId}>
                <circle cx={x} cy={y} r={4.5} className={[styles.quadrantDot, styles[QUADRANT_CLASS[r.quadrant]]].join(' ')} />
                <text x={x} y={y - 9} textAnchor="middle" className={styles.quadrantDotLabel}>{r.label}</text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className={styles.quadrantGrid}>
        {(['signature', 'utilitarian', 'development', 'lowReturn'] as StrengthQuadrant[]).map((q) => {
          const domains = map.placed.filter((r) => r.quadrant === q)
          return (
            <div key={q} className={styles.quadrantListPanel}>
              <div className={[styles.quadrantHeading, styles[QUADRANT_CLASS[q]]].join(' ')}>{QUADRANT_LABEL[q].toUpperCase()}</div>
              <p className={styles.energyHint}>{QUADRANT_BLURB[q]}</p>
              {domains.length > 0 ? (
                <div className={styles.energyList}>
                  {domains.map((r) => (
                    <div key={r.domainId} className={styles.energyRow}>
                      <div className={styles.energyRowTop}>
                        <span className={styles.energyLabel}>{r.label}</span>
                        <span className={styles.energyScore}>ability {r.abilityScore} · energy {r.energyScore}</span>
                      </div>
                      <span className={styles.energyMeta}>Ability read from {r.abilitySource === 'ability+skill' ? 'demonstrated ability + trained skill' : r.abilitySource === 'ease' ? 'self-perceived ease (no ability/skill data yet)' : `demonstrated ${r.abilitySource}`} · {r.confidence} confidence</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyNote}>Nothing placed here.</p>
              )}
            </div>
          )
        })}
      </div>

      {map.unplaced.length > 0 && (
        <p className={styles.deferredNote} style={{ marginTop: 'var(--sc-space-3)' }}>
          Not yet placed — missing either ability or energy data: {map.unplaced.map((u) => u.label).join(', ')}.
        </p>
      )}
    </div>
  )
}
