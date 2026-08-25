import type { StrengthDomainResult } from '../../engine/scoring/strengthsClassification'
import { STRENGTH_CATEGORY_BLURB, STRENGTH_CATEGORY_LABEL } from '../../engine/scoring/strengthsClassification'
import { Continuum } from './Continuum'
import styles from './results.module.css'

const CATEGORY_CLASS: Record<StrengthDomainResult['category'], string> = {
  naturalDeveloped: styles.agreementAligned,
  naturalUnderdeveloped: styles.strengthPromising,
  developedDraining: styles.agreementMixed,
  interestedUnproven: styles.strengthPromising,
  weak: styles.agreementUnknown,
}

export function StrengthCard({ result }: { result: StrengthDomainResult }) {
  const { label, ease, ability, skill, energy, category, axesAnswered } = result
  return (
    <div className={styles.careerCard}>
      <div className={styles.careerHeader}>
        <span className={styles.careerTitle}>{label}</span>
        <span className={[styles.agreementBadge, CATEGORY_CLASS[category]].join(' ')}>{STRENGTH_CATEGORY_LABEL[category]}</span>
      </div>
      <p className={styles.careerBlurb}>{STRENGTH_CATEGORY_BLURB[category]}</p>
      {axesAnswered < 4 && (
        <p className={styles.barConfidence} style={{ marginBottom: 'var(--sc-space-2)' }}>
          Partial: {axesAnswered} of 4 signals measured
        </p>
      )}
      <div className={styles.barGrid2}>
        {ease && <Continuum key="ease" facetScore={{ ...ease, label: 'Natural Ease' }} />}
        {ability && <Continuum key="ability" facetScore={{ ...ability, label: 'Demonstrated Ability' }} />}
        {skill && <Continuum key="skill" facetScore={{ ...skill, label: 'Trained Skill' }} />}
        {energy && <Continuum key="energy" facetScore={{ ...energy, label: 'Energy' }} />}
      </div>
    </div>
  )
}
