import { useEffect } from 'react'
import { REGION_BY_ID } from '../../content/regions'
import { getRegionItems } from '../../engine/navigation'
import { useAssessment } from '../../engine/state'
import { isEditingText } from '../../engine/keyboardGuard'
import { ItemRenderer } from '../items/ItemRenderer'
import { SavedIndicator } from '../shared/SavedIndicator'
import { PrivacyDisclosure } from '../shared/PrivacyDisclosure'
import { Button } from '../shared/Button'
import { SectionNavigator } from './SectionNavigator'
import styles from './AssessmentShell.module.css'

const OPTIONAL_FORMATS = new Set(['openText', 'evidencePrompt'])
const PROGRESS_SEGMENTS = 14

/**
 * The core question-answering experience — section framing, conceptual
 * progress, the question itself, and previous/next, all in one place so
 * none of it fights for attention. Deliberately shows a coarse progress
 * bar rather than "question 17 of 243": a handful of segments, not a
 * count, because knowing the exact remaining number doesn't help anyone
 * answer more honestly and mostly just adds pressure.
 */
export function AssessmentShell({ regionId, itemIndex, savedAt }: { regionId: string; itemIndex: number; savedAt: number | null }) {
  const { state, dispatch } = useAssessment()
  const region = REGION_BY_ID[regionId]
  const items = getRegionItems(regionId)
  const item = items[itemIndex]

  const answered = item ? Boolean(state.responses[item.id]) : false
  const optional = item ? OPTIONAL_FORMATS.has(item.format) : false
  const canAdvance = answered || optional
  const isLast = itemIndex === items.length - 1

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isEditingText(document.activeElement)) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        dispatch({ type: 'PREV_ITEM' })
      } else if ((e.key === 'ArrowRight' || e.key === 'Enter') && canAdvance) {
        e.preventDefault()
        dispatch({ type: 'NEXT_ITEM' })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dispatch, canAdvance])

  if (!region || !item) return null

  const filledSegments = Math.round((itemIndex / Math.max(1, items.length - 1)) * (PROGRESS_SEGMENTS - 1))

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.sectionTitle}>{region.label}</div>
        <div className={styles.progressBar} role="progressbar" aria-label={`Progress through ${region.label}`} aria-valuenow={itemIndex + 1} aria-valuemin={1} aria-valuemax={items.length}>
          {Array.from({ length: PROGRESS_SEGMENTS }, (_, i) => (
            <span
              key={i}
              className={[styles.segment, i < filledSegments ? styles.filled : '', i === filledSegments ? styles.current : ''].join(' ')}
            />
          ))}
        </div>
      </header>

      <div className={styles.savedRow}>
        <SectionNavigator activeRegionId={regionId} />
        <div className={styles.savedGroup}>
          <SavedIndicator savedAt={savedAt} />
          <PrivacyDisclosure />
        </div>
      </div>

      <div className={styles.itemArea}>
        <ItemRenderer key={item.id} item={item} />
      </div>

      <nav className={styles.nav} aria-label="Question navigation">
        <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_ITEM' })}>← Back</Button>
        <Button variant="primary" disabled={!canAdvance} onClick={() => dispatch({ type: 'NEXT_ITEM' })}>
          {isLast ? 'Finish region →' : 'Next →'}
        </Button>
      </nav>
    </div>
  )
}
