import type { ValuesEvidenceBreakdown } from '../../engine/scoring/valuesEvidence'
import { FACET_BY_ID } from '../../content/facets'
import styles from './EvidenceAlignment.module.css'

export function EvidenceAlignment({ rows }: { rows: ValuesEvidenceBreakdown[] }) {
  const observed = rows.filter((r) => r.professed !== null || r.revealedTradeoff !== null || r.behavioral !== null)
  if (!observed.length) return null
  return <div className={styles.panel}>
    <div className={styles.heading}><h3>What you say. What you choose. What you do.</h3><p>Read across each row. Wider separation means the evidence points in different directions.</p></div>
    <div className={styles.legend}><span>○ Professed</span><span>◇ Revealed by choices</span><span>■ Behavioral history</span></div>
    <div className={styles.scale}><span>0</span><span>50</span><span>100</span></div>
    {observed.map((row) => {
      const values = [row.professed, row.revealedTradeoff, row.behavioral]
      return <div key={row.facetId} className={styles.row}>
        <span className={styles.label}>{FACET_BY_ID[row.facetId]?.label ?? row.facetId}<small>{row.agreement === 'insufficient-evidence' ? 'More evidence needed' : row.agreement}</small></span>
        <svg viewBox="0 0 340 60" role="img" aria-label={`${FACET_BY_ID[row.facetId]?.label ?? row.facetId}: professed ${row.professed ?? 'unmeasured'}, choices ${row.revealedTradeoff ?? 'unmeasured'}, behavioral ${row.behavioral ?? 'unmeasured'}, on a 0 to 100 scale.`}>
          {[0, 25, 50, 75, 100].map((v) => <line key={v} x1={20 + v * 3} x2={20 + v * 3} y1="4" y2="56" stroke="currentColor" opacity=".12" />)}
          <polyline points={values.map((v, i) => v === null ? null : `${20 + v * 3},${12 + i * 18}`).filter(Boolean).join(' ')} fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".65" />
          {values.map((v, i) => {
            if (v === null) return null
            const x = 20 + v * 3, y = 12 + i * 18
            return i === 0 ? <circle key={i} cx={x} cy={y} r="4" stroke="currentColor" strokeWidth="1.5" fill="var(--sc-bg-raised)" />
              : i === 1 ? <path key={i} d={`M ${x} ${y - 5} l 5 5 -5 5 -5 -5 Z`} fill="var(--sc-bg-raised)" stroke="currentColor" strokeWidth="1.5" />
                : <rect key={i} x={x - 3.5} y={y - 3.5} width="7" height="7" fill="currentColor" />
          })}
        </svg>
      </div>
    })}
    <p className={styles.note}>Missing methods have no marker. These signals remain separate in this view.</p>
  </div>
}
