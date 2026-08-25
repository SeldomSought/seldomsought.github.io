import { useAssessment } from '../../engine/state'
import { REGION_BY_ID } from '../../content/regions'
import { overallProgress } from '../../engine/navigation'
import { CompassMark } from '../motifs/CompassMark'
import { SavedIndicator } from '../shared/SavedIndicator'
import { PrivacyDisclosure } from '../shared/PrivacyDisclosure'
import { SectionNavigator } from './SectionNavigator'
import styles from './JourneyShell.module.css'

/**
 * The generic chrome for map/regionIntro/synthesis. Deliberately no
 * question-count anywhere — CompassMark's arc is the progress signal,
 * conceptual by construction. Suppressed on the map view specifically:
 * RegionMap already renders the same progress as its own large EmergingMap,
 * and showing it twice on one screen reads as inconsistent, not
 * reinforcing. The actual question-answering screen has its own richer
 * shell (AssessmentShell) and doesn't render this at all.
 */
export function JourneyShell({ savedAt }: { savedAt: number | null }) {
  const { state } = useAssessment()
  const { view, responses } = state

  const regionId = view.type === 'regionIntro' || view.type === 'item' ? view.regionId : null
  const region = regionId ? REGION_BY_ID[regionId] : null

  const overall = overallProgress(responses)
  const progress = overall.total ? overall.answered / overall.total : 0

  return (
    <header className={styles.shell}>
      <div className={styles.inner}>
        <div className={styles.left}>
          {view.type === 'map' ? (
            <span className={styles.wordmark}>The Self Cartography Project</span>
          ) : (
            <SectionNavigator activeRegionId={view.type === 'synthesis' ? 'synthesis' : regionId ?? undefined} />
          )}
          {region && <span className={styles.regionLabel}>{region.label}</span>}
          {view.type === 'synthesis' && <span className={styles.regionLabel}>Synthesis</span>}
        </div>
        <div className={styles.right}>
          {view.type !== 'map' && <CompassMark progress={progress} />}
          <span className={styles.savedWrap}>
            <SavedIndicator savedAt={savedAt} />
            <PrivacyDisclosure />
          </span>
        </div>
      </div>
    </header>
  )
}
