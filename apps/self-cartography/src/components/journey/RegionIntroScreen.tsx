import { REGION_BY_ID, REGIONS } from '../../content/regions'
import { getRegionItems, regionProgress } from '../../engine/navigation'
import { useAssessment } from '../../engine/state'
import type { Item } from '../../engine/types'
import { Button } from '../shared/Button'
import styles from './regionScreens.module.css'

const FORMAT_PHRASE: Partial<Record<Item['format'], string>> = {
  likert5: 'quick ratings',
  likertFrequency: 'quick ratings',
  confidence: 'quick ratings',
  tradeoff: 'this-or-that choices',
  behavioralHistory: 'questions about what you’ve actually done',
  scenario: 'short scenarios with a follow-up',
  ranking: 'ranking exercises',
  forcedChoiceRank: 'ranking exercises',
  aspirationalPair: 'paired now/later choices',
}

/**
 * The same generic sentence used to say "ratings, choices, and a couple of
 * short optional reflections" for every region — a 57-item region that's
 * 90% one repeated likert format and a scenario-heavy region with 2-phase
 * items read identically. Derives the real dominant format(s) from the
 * region's own content instead, so the description actually helps someone
 * calibrate effort before they start.
 */
function describeFormats(items: Item[]): string {
  const counts = new Map<string, number>()
  for (const item of items) {
    if (item.format === 'openText' || item.format === 'evidencePrompt') continue
    counts.set(item.format, (counts.get(item.format) ?? 0) + 1)
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1])
  if (ranked.length === 0) return 'a couple of short optional reflections'

  const scored = ranked.reduce((sum, [, n]) => sum + n, 0)
  const [topFormat, topCount] = ranked[0]
  const topPhrase = FORMAT_PHRASE[topFormat as Item['format']] ?? 'a mix of formats'

  if (topCount / scored >= 0.7) return `mostly ${topPhrase}`

  const secondPhrase = ranked[1] ? FORMAT_PHRASE[ranked[1][0] as Item['format']] : undefined
  return secondPhrase && secondPhrase !== topPhrase ? `a mix of ${topPhrase} and ${secondPhrase}` : `a mix of ${topPhrase}`
}

export function RegionIntroScreen({ regionId }: { regionId: string }) {
  const { state, dispatch } = useAssessment()
  const region = REGION_BY_ID[regionId]
  const items = getRegionItems(regionId)
  const hasOptionalReflection = items.some((i) => i.format === 'openText' || i.format === 'evidencePrompt')
  const formatDescription = describeFormats(items)

  // NEXT_ITEM otherwise jumps straight from a region's last answer to the
  // next region's intro with zero acknowledgment that anything just
  // finished — a real, honest momentum beat was simply missing. States
  // only facts already on the record (which region, how many answers) —
  // never a trait, score, or judgment, so it can't contaminate anything
  // measured after it.
  const priorRegion = [...REGIONS].filter((r) => r.implemented && r.order < region.order).sort((a, b) => b.order - a.order)[0]
  const priorComplete = Boolean(priorRegion && state.regionCompletedAt[priorRegion.id])
  const priorProgress = priorRegion ? regionProgress(priorRegion.id, state.responses) : null

  return (
    <main className={styles.page}>
      {priorComplete && priorProgress && (
        <p className={styles.priorComplete}>{priorRegion.label} charted — {priorProgress.answered} answers recorded.</p>
      )}
      <div className={[styles.introEyebrow, 'sc-eyebrow'].join(' ')}>{region.marginalia}</div>
      <h1 className={styles.introTitle}>{region.label}</h1>
      <p className={styles.introDesc}>{region.description}</p>
      <p className={styles.introMeta}>
        {items.length} questions — {formatDescription}{hasOptionalReflection ? ', plus a couple of short optional reflections' : ''}.
        Answer instinctively; there's no reward for overthinking any single one.
      </p>
      <div>
        <Button variant="primary" onClick={() => dispatch({ type: 'NEXT_ITEM' })}>Begin {region.label} →</Button>
      </div>
    </main>
  )
}
