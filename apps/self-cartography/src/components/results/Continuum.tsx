import type { FacetScore } from '../../engine/types'
import styles from './Continuum.module.css'

/**
 * Curated, evocative pole pairs for this app's headline unipolar traits —
 * the same [low, high] convention every auto-derived pair below follows,
 * just hand-picked instead of split off a formal "X vs. Y" label, because
 * these specific traits carry the report and deserve language sharper than
 * a generic Low/High.
 */
const POLE_OVERRIDES: Record<string, [string, string]> = {
  structure_need: ['Flexible', 'Defined'],
  autonomy_need: ['Directed', 'Autonomous'],
  risk_tolerance: ['Preservation', 'Upside'],
  ambiguity_tolerance: ['Clear-Cut', 'Open-Ended'],
  work_solitude_social: ['Solitary', 'Social'],
}

/**
 * [low pole, high pole]. Every bipolar facet's own label already documents
 * itself as "HighPole vs. LowPole" (see content/facets.ts, and the same
 * convention content/copy/synthesize.ts's leanTowardLabel relies on) — a
 * plain split just needs reversing to read left-to-right as low-to-high.
 * A facet with no natural opposite (most "how much X" measures) falls back
 * to a plain, honest Low/High — never a fabricated pole word standing in
 * for data that isn't there.
 */
function derivePoles(facet: FacetScore): [string, string] {
  const override = POLE_OVERRIDES[facet.facetId]
  if (override) return override
  // Every strength domain's own "energizes vs. drains" facet (see
  // content/facets.ts's STRENGTH_DOMAINS) shares this one suffix — a
  // pattern check here covers all of them without six near-duplicate entries.
  if (facet.facetId.endsWith('_energy')) return ['Draining', 'Energizing']
  const parts = facet.label.split(' vs. ')
  if (parts.length === 2) return [parts[1], parts[0]]
  return ['Low', 'High']
}

const TRACK_W = 100
const MARGIN = 6
const USABLE = TRACK_W - MARGIN * 2

/**
 * The visualization system's core unit: a horizontal continuum between two
 * human-labeled poles, with a single dot marking where this facet actually
 * landed — never a bare percentage bar, never a radar axis. Poles read
 * left-to-right as low to high, so the dot's own position is legible
 * before anyone reads a number. The number stays present — top-right,
 * subdued — for anyone who wants it; it's just deliberately not what
 * carries the read.
 */
export function Continuum({ facetScore }: { facetScore: FacetScore }) {
  const score = Math.max(0, Math.min(100, facetScore.score))
  const [lowLabel, highLabel] = derivePoles(facetScore)
  const cx = MARGIN + (score / 100) * USABLE
  const leaning = score > 55 ? 'high' : score < 45 ? 'low' : null

  return (
    <div className={styles.row}>
      <div className={styles.topRow}>
        <span className={styles.name}>{facetScore.label}</span>
        <span className={styles.score}>{facetScore.score}</span>
      </div>

      <div className={styles.track}>
        <span className={[styles.pole, leaning === 'low' ? styles.leaning : ''].join(' ')}>{lowLabel}</span>
        <svg className={styles.svg} viewBox={`0 0 ${TRACK_W} 12`} preserveAspectRatio="none" aria-hidden="true">
          <line x1={MARGIN} y1={6} x2={TRACK_W - MARGIN} y2={6} className={styles.line} />
          <circle cx={cx} cy={6} r={2.6} className={styles.dot} />
        </svg>
        <span className={[styles.pole, styles.poleRight, leaning === 'high' ? styles.leaning : ''].join(' ')}>{highLabel}</span>
      </div>

      <span className={styles.confidence}>
        Confidence: {facetScore.confidence}
        {facetScore.evidenceCount <= 1 && ' — from a single comparison, not a scale'}
      </span>
    </div>
  )
}
