import type { ReactNode } from 'react'
import type { FacetScore } from '../../engine/types'
import type { StrengthDomainResult } from '../../engine/scoring/strengthsClassification'
import type { CareerFitResult } from '../../engine/scoring/careerMatch'
import type { UnconventionalPathResult } from '../../engine/scoring/unconventionalPaths'
import type { TensionSignal } from '../../engine/scoring/synthesis'
import type { FutureSelfStability } from '../../engine/scoring/futureSelfStability'
import type { CoreDriverResult } from '../../engine/scoring/coreDrivers'
import {
  buildOperatingStyleNarrative,
  buildEnergySourcesNarrative,
  buildEnvironmentNarrative,
  buildDirectionNarrative,
} from '../../content/copy/synthesize'
import styles from './ProfilePortrait.module.css'

const NOT_ENOUGH_SIGNAL = 'Nothing here pulled clearly in one direction yet — this section will sharpen as more of the assessment fills in.'

/** The quick version of the full Core Drivers page below (see
 *  CoreDriverCard.tsx) — same underlying analysis, just the headline
 *  instead of the full evidence packet per driver. */
function summarizeCoreDrivers(drivers: CoreDriverResult[]): string | null {
  if (drivers.length === 0) return null
  const names = drivers.map((d) => d.label.toLowerCase())
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')}${names.length > 2 ? ',' : ''} and ${names[names.length - 1]}`
  return `${drivers[0].description} The strongest motivational forces detected across the whole profile: ${list}.`
}

function Panel({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelEyebrow}>{eyebrow}</div>
      <h3 className={styles.panelTitle}>{title}</h3>
      <div className={styles.panelBody}>{children}</div>
    </div>
  )
}

/**
 * The first screen: "what kind of person does this data describe," in six
 * compact panels, not forty charts. Every sentence in every panel is
 * produced deterministically by content/copy/synthesize.ts from actual
 * scored facets — nothing here is written per respondent, and nothing
 * asserts a pattern the data didn't actually show (a panel with no clear
 * signal says so plainly rather than manufacturing a horoscope-style read).
 * Everything below this — the full facet breakdowns, career fit, poor
 * fits, unconventional paths, and so on — is the "deeper exploration"
 * this portrait exists to summarize, not replace.
 */
export function ProfilePortrait({
  facetScores,
  strengthResults,
  tensions,
  anchorScores,
  futureSelfStability,
  topCareerFit,
  topUnconventionalPath,
  coreDrivers,
}: {
  facetScores: Record<string, FacetScore>
  strengthResults: StrengthDomainResult[]
  tensions: TensionSignal[]
  anchorScores: FacetScore[]
  futureSelfStability: FutureSelfStability | null
  topCareerFit: CareerFitResult | null
  topUnconventionalPath: UnconventionalPathResult | null
  coreDrivers: CoreDriverResult[]
}) {
  const coreDriversSummary = summarizeCoreDrivers(coreDrivers)
  const operatingStyle = buildOperatingStyleNarrative(facetScores)
  const energySources = buildEnergySourcesNarrative(facetScores, strengthResults)
  const environment = buildEnvironmentNarrative(facetScores)
  const direction = buildDirectionNarrative(anchorScores, futureSelfStability, topCareerFit, topUnconventionalPath)
  const topTensions = tensions.slice(0, 2)

  return (
    <div className={styles.grid}>
      <Panel eyebrow="Core Drivers" title="What Seems to Move You">
        <p>{coreDriversSummary ?? NOT_ENOUGH_SIGNAL}</p>
      </Panel>

      <Panel eyebrow="Your Operating Style" title="How You Actually Work">
        <p>{operatingStyle ?? NOT_ENOUGH_SIGNAL}</p>
      </Panel>

      <Panel eyebrow="Energy Sources" title="What Fuels vs. Drains You">
        <p>{energySources ?? NOT_ENOUGH_SIGNAL}</p>
      </Panel>

      <Panel eyebrow="Primary Tensions" title="What Pulls Against Itself">
        {topTensions.length > 0 ? (
          <div className={styles.tensionList}>
            {topTensions.map((t) => (
              <p key={t.id}><strong>{t.name}.</strong> {t.detail}</p>
            ))}
          </div>
        ) : (
          <p>No strong tension emerged between independently measured priorities in this profile.</p>
        )}
      </Panel>

      <Panel eyebrow="Environment" title="The Conditions That Actually Work">
        <p>{environment ?? NOT_ENOUGH_SIGNAL}</p>
      </Panel>

      <Panel eyebrow="Direction" title="Where This Points">
        <p>{direction ?? NOT_ENOUGH_SIGNAL}</p>
      </Panel>
    </div>
  )
}
