import { useEffect, useRef, useState } from 'react'
import { useAssessment } from '../../engine/state'
import { REGIONS } from '../../content/regions'
import { regionProgress, isRegionComplete, canEnterSynthesis } from '../../engine/navigation'
import styles from './SectionNavigator.module.css'

/**
 * The compact alternative to a survey sidebar: one small "Map" trigger,
 * a light anchored panel on click, nothing persistent taking up space the
 * rest of the time. Every implemented region is listed and — except
 * Synthesis before it's unlocked — directly clickable, so revisiting a
 * finished region or jumping ahead to one you haven't started never
 * requires detouring through the full region-map page. Regions that
 * aren't open in this build yet are listed (the full shape of the project
 * stays visible) but visually recede and can't be clicked. A separate
 * top row still reaches the full map page itself (the emerging-map
 * visualization, "start over") for whoever wants that, not just a jump
 * straight into a region.
 */
export function SectionNavigator({ activeRegionId }: { activeRegionId?: string }) {
  const { state, dispatch } = useAssessment()
  const { responses } = state
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const canSynthesize = canEnterSynthesis(responses)

  function go(regionId: string) {
    setOpen(false)
    if (regionId === 'synthesis') dispatch({ type: 'GOTO_SYNTHESIS' })
    else dispatch({ type: 'START_REGION', regionId })
  }

  function goToOverview() {
    setOpen(false)
    dispatch({ type: 'GOTO_MAP' })
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button type="button" className={styles.trigger} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Map <span className={styles.caret} aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className={styles.panel} role="menu" aria-label="Jump to a section">
          <button type="button" role="menuitem" className={[styles.row, styles.rowOverview].join(' ')} onClick={goToOverview}>
            <span className={styles.rowLabel}>Full map, overview →</span>
          </button>
          <div className={styles.divider} />
          {REGIONS.map((region) => {
            const progress = regionProgress(region.id, responses)
            const isSynthesis = region.id === 'synthesis'
            // isRegionComplete('synthesis', …) is vacuously true — no
            // instrument targets the synthesis region, so an empty
            // required-items list trivially satisfies .every(). Whether
            // Synthesis reads as "complete" has to come from canSynthesize
            // instead, or it would show as reachable before it actually is.
            const complete = region.implemented && (isSynthesis ? canSynthesize : isRegionComplete(region.id, responses))
            const started = progress.answered > 0
            const disabled = !region.implemented || (isSynthesis && !canSynthesize)
            const isActive = region.id === activeRegionId
            const pct = progress.total > 0 ? Math.round((progress.answered / progress.total) * 100) : null

            return (
              <button
                key={region.id}
                type="button"
                role="menuitem"
                className={[
                  styles.row,
                  disabled ? styles.rowDisabled : '',
                  !disabled && !started && !complete ? styles.rowSubdued : '',
                  isActive ? styles.rowActive : '',
                ].join(' ')}
                disabled={disabled}
                onClick={() => go(region.id)}
              >
                <span className={styles.rowLabel}>{region.label}</span>
                {region.implemented ? (
                  <span className={[styles.badge, complete ? styles.badgeComplete : ''].join(' ')}>
                    {complete ? '✓' : started ? `${pct}%` : isSynthesis && !canSynthesize ? 'locked' : ''}
                  </span>
                ) : (
                  <span className={styles.badge}>not open yet</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
