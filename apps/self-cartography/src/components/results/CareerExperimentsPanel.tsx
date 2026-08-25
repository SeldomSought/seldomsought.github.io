import type { ExperimentPlan, MatchedExperiment } from '../../engine/scoring/careerExperiments'
import styles from './results.module.css'

const SIGNAL_CLASS: Record<MatchedExperiment['signalQuality'], string> = {
  High: styles.agreementAligned,
  Moderate: styles.agreementMixed,
  Low: styles.agreementDiverged,
}

function ExperimentRow({ experiment }: { experiment: MatchedExperiment }) {
  return (
    <div className={styles.experimentRow}>
      <div className={styles.experimentTop}>
        <span className={styles.experimentLabel}>{experiment.label}</span>
        <span className={[styles.agreementBadge, SIGNAL_CLASS[experiment.signalQuality]].join(' ')}>
          {experiment.signalQuality} signal
        </span>
      </div>
      <p className={styles.experimentDescription}>{experiment.description}</p>
      <div className={styles.experimentMeta}>
        <span>Time: {experiment.time}</span>
        <span>Cost: {experiment.cost}</span>
      </div>
    </div>
  )
}

/**
 * No amount of self-report replaces what actually happens when someone
 * does the work — this is where the report stops asking questions and
 * starts proposing tests. Each hypothesis below is a real career fit or
 * career structure this profile pointed toward; each experiment is cheap,
 * time-boxed, and produces real behavioral evidence, not more speculation.
 */
export function CareerExperimentsPanel({ plans }: { plans: ExperimentPlan[] }) {
  return (
    <div className={styles.careerList}>
      {plans.map(({ hypothesis, experiments }) => (
        <div key={hypothesis.id} className={styles.careerCard}>
          <div className={styles.careerHeader}>
            <span className={styles.careerTitle}>{hypothesis.label}</span>
          </div>
          <p className={styles.contradictionDetail}>{hypothesis.rationale}</p>
          <div className={styles.careerGroupLabel}>Cheap ways to test this</div>
          <div className={styles.experimentList}>
            {experiments.map((e) => <ExperimentRow key={e.id} experiment={e} />)}
          </div>
        </div>
      ))}
    </div>
  )
}
