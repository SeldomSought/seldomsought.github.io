import type { CareerFitDimensionDetail, CareerFitResult } from '../../engine/scoring/careerMatch'
import type { StrengthQuadrant } from '../../engine/scoring/strengthQuadrant'
import { QUADRANT_LABEL, QUADRANT_SHORT_LABEL, QUADRANT_BLURB, annotateCareerFitStrengths } from '../../engine/scoring/strengthQuadrant'
import { track } from '../../engine/analytics'
import styles from './results.module.css'

export const CONFIDENCE_CLASS: Record<CareerFitResult['confidence'], string> = {
  High: styles.agreementAligned,
  Moderate: styles.agreementMixed,
  Limited: styles.agreementDiverged,
}

const ROLE_CLASS: Record<CareerFitDimensionDetail['role'], string> = {
  strength: styles.roleStrength,
  friction: styles.roleFriction,
  neutral: styles.roleNeutral,
}

const ROLE_LABEL: Record<CareerFitDimensionDetail['role'], string> = {
  strength: 'Strength',
  friction: 'Friction',
  neutral: 'Neutral',
}

/**
 * Every number on this card is explained by what sits next to it: the fit
 * score by the compatibility/penalty line beneath it, each category bar by
 * its own label, each dimension row by its own desired/actual pair. Nothing
 * here is a bare percentage — see the "open the dimensions" table at the
 * bottom for the full, inspectable ledger behind the headline number.
 */
export function CareerFitCard({ result, strengthQuadrants = {} }: { result: CareerFitResult; strengthQuadrants?: Record<string, StrengthQuadrant> }) {
  const {
    career, fitScore, weightedCompatibility, penaltyTotal, frictionPenalty, categories, penalties,
    strengths, frictions, headline, confidence, confidenceReason, dimensions,
    dimensionsScored, dimensionsTotal,
  } = result

  // Every deduction stays visible in the same sentence the headline number
  // comes from — a friction penalty is exactly as much "shown work" as a
  // severe-mismatch one, just gentler, so it never quietly changes a score
  // without the arithmetic to back it up.
  const deductionParts: string[] = []
  if (penaltyTotal > 0) deductionParts.push(`${penaltyTotal} for ${penalties.length} severe mismatch${penalties.length > 1 ? 'es' : ''}`)
  if (frictionPenalty > 0) deductionParts.push(`${frictionPenalty} for ordinary friction elsewhere`)
  const compatNote = deductionParts.length > 0
    ? `${weightedCompatibility} weighted compatibility across ${dimensionsScored} of ${dimensionsTotal} scored dimensions − ${deductionParts.join(' − ')} = ${fitScore}`
    : `${fitScore} weighted compatibility across ${dimensionsScored} of ${dimensionsTotal} scored dimensions — no mismatches`

  // The fit score reads a strength dimension's ability alone — it can't
  // distinguish a Signature Strength from a Utilitarian Skill that scores
  // identically on ability but drains rather than energizes. This is where
  // that distinction actually reaches the recommendation.
  const strengthAnnotations = annotateCareerFitStrengths(result, strengthQuadrants)

  return (
    <div className={styles.careerCard}>
      <div className={styles.careerHeader}>
        <h3 className={styles.careerTitle}>{career.title}</h3>
        <span className={styles.careerFit}>Fit: {fitScore}</span>
      </div>
      <div className={styles.careerFamily}>{career.careerFamily}</div>
      <p className={styles.careerBlurb}>{career.description}</p>

      {headline && <p className={styles.careerHeadline}>{headline}</p>}

      <p className={styles.careerPenaltyNote}>{compatNote}</p>

      <div className={styles.careerGroupLabel}>By category</div>
      <div className={styles.categoryGrid}>
        {categories.map((c) => (
          <div key={c.category} className={styles.categoryRow}>
            <span className={styles.categoryLabel}>{c.label}</span>
            <span className={styles.categoryTrack}>
              <span className={styles.categoryFill} style={{ width: `${c.compatibility}%` }} />
            </span>
            <span className={styles.categoryValue}>
              {c.compatibility}
              {/* A 60% backed by one dimension and a 66% backed by six
                  otherwise render with identical visual weight — this is
                  the same "how many things actually agree" signal
                  per-facet confidence already shows, just for a category. */}
              <span className={styles.categoryDimCount}>{c.dimensionsScored}/{c.dimensionsTotal}</span>
            </span>
          </div>
        ))}
      </div>

      {penalties.length > 0 && (
        <div className={styles.penaltyList}>
          {penalties.map((p) => (
            <p key={p.facetId} className={styles.penaltyItem}>
              {p.points} pts — {p.label} (this career wants {p.desired}, you scored {p.actual})
            </p>
          ))}
        </div>
      )}

      {strengthAnnotations.length > 0 && (
        <div className={styles.careerWhyBlock}>
          <div className={styles.careerGroupLabel}>Strength sustainability</div>
          <div className={styles.bulletList}>
            {strengthAnnotations.map((a) => (
              <p key={a.dimensionId} className={a.quadrant === 'signature' ? styles.bulletPos : styles.bulletNeg}>
                {a.label} is a <strong>{QUADRANT_LABEL[a.quadrant]}</strong> for you — {QUADRANT_BLURB[a.quadrant]}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className={styles.careerWhyBlock}>
        <div className={styles.careerGroupLabel}>Why this fits you</div>
        {strengths.length > 0 ? (
          <div className={styles.bulletList}>
            {strengths.map((s) => <p key={s.dimensionId} className={styles.bulletPos}>{s.text}</p>)}
          </div>
        ) : (
          <p className={styles.emptyNote}>Nothing scored so far aligns strongly enough to call out.</p>
        )}
      </div>

      <div className={styles.careerWhyBlock}>
        <div className={styles.careerGroupLabel}>Why it might not</div>
        {frictions.length > 0 ? (
          <div className={styles.bulletList}>
            {frictions.map((f) => <p key={f.dimensionId} className={styles.bulletNeg}>{f.text}</p>)}
          </div>
        ) : (
          <p className={styles.emptyNote}>Nothing scored so far shows real friction with this career.</p>
        )}
      </div>

      <div className={styles.careerConfidenceRow}>
        <div className={styles.profileConfidenceRow}>
          <span className={styles.profileConfidenceLabel}>Confidence</span>
          <span className={[styles.profileConfidenceValue, CONFIDENCE_CLASS[confidence]].join(' ')}>{confidence}</span>
        </div>
        <p className={styles.careerConfidenceReason}>{confidenceReason}</p>
      </div>

      <details
        className={styles.careerDimensionsDetails}
        onToggle={(e) => {
          // Only the id of a public career-catalog entry — never the fit
          // score, dimensions, or anything derived from the respondent's
          // own answers. Fires on open only, not on close.
          if (e.currentTarget.open) track({ type: 'career_card_click', careerId: result.career.id, source: 'fit-card' })
        }}
      >
        <summary className={styles.careerDimensionsSummary}>
          Open the {dimensions.length} dimension{dimensions.length === 1 ? '' : 's'} behind this score
        </summary>
        <div className={styles.tableScroll}>
          <table className={styles.evidenceTable}>
            <thead>
              <tr>
                <th>Dimension</th>
                <th>Category</th>
                <th>Career wants</th>
                <th>You scored</th>
                <th>Alignment</th>
                <th>Evidence</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {dimensions.map((d) => (
                <tr key={d.facetId}>
                  <td className={styles.evidenceLabel} data-label="Dimension">
                    {d.label}
                    {d.dealbreaker && <span title="A severe gap here carries an explicit penalty, not just an averaged-in dip">*</span>}
                    {strengthQuadrants[d.facetId] && (
                      <span className={styles.quadrantTag} title="This strength domain's Ability × Energy quadrant for you">
                        {QUADRANT_SHORT_LABEL[strengthQuadrants[d.facetId]]}
                      </span>
                    )}
                  </td>
                  <td className={styles.evidenceScore} data-label="Category">{d.categoryLabel}</td>
                  <td className={styles.evidenceScore} data-label="Career wants">{d.desired}</td>
                  <td className={styles.evidenceScore} data-label="You scored">{d.actual}</td>
                  <td className={styles.evidenceScore} data-label="Alignment">{d.alignment}</td>
                  <td className={styles.evidenceScore} data-label="Evidence">{d.confidence}</td>
                  <td data-label="Role">
                    <span className={[styles.agreementBadge, ROLE_CLASS[d.role]].join(' ')}>{ROLE_LABEL[d.role]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
