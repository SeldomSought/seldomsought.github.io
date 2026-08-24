import { useMemo, useState } from 'react'
import type { CareerFitResult } from '../../engine/scoring/careerMatch'
import type { StrengthQuadrant } from '../../engine/scoring/strengthQuadrant'
import type { ExplorerDimension, ExplorerFilters, SortDirection } from '../../engine/scoring/careerExplorer'
import {
  EXPLORER_DIMENSIONS, DIMENSION_LABEL, EDUCATION_ORDER, EDUCATION_LABEL,
  DEFAULT_EXPLORER_FILTERS, sortByDimension, filterResults,
} from '../../engine/scoring/careerExplorer'
import { CareerExplorerCard } from './CareerExplorerCard'
import { track } from '../../engine/analytics'
import styles from './results.module.css'

const NUMERIC_FILTER_DIMENSIONS = EXPLORER_DIMENSIONS.filter((d) => d !== 'education')

export function CareerExplorer({
  results,
  strengthQuadrants,
}: {
  results: CareerFitResult[]
  strengthQuadrants: Record<string, StrengthQuadrant>
}) {
  const [sortDimension, setSortDimension] = useState<ExplorerDimension>('overallFit')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filters, setFilters] = useState<ExplorerFilters>(DEFAULT_EXPLORER_FILTERS)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filtered = useMemo(() => filterResults(results, filters), [results, filters])
  const sorted = useMemo(() => sortByDimension(filtered, sortDimension, sortDirection), [filtered, sortDimension, sortDirection])

  const filtersActive = filters.maxEducationRank < EDUCATION_ORDER.length - 1 || Object.values(filters.minValue).some((v) => v)

  function setMinValue(dimension: ExplorerDimension, value: number) {
    setFilters((f) => ({ ...f, minValue: { ...f.minValue, [dimension]: value } }))
  }

  return (
    <div>
      <div className={styles.explorerControls}>
        <label className={styles.explorerSortLabel}>
          Sort by
          <select
            className={styles.explorerSelect}
            value={sortDimension}
            onChange={(e) => setSortDimension(e.target.value as ExplorerDimension)}
          >
            {EXPLORER_DIMENSIONS.map((d) => <option key={d} value={d}>{DIMENSION_LABEL[d]}</option>)}
          </select>
        </label>
        <button
          type="button"
          className={styles.explorerDirButton}
          onClick={() => setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'))}
          title={sortDirection === 'desc' ? 'Highest first' : 'Lowest first'}
        >
          {sortDirection === 'desc' ? '↓ High → Low' : '↑ Low → High'}
        </button>
        <button type="button" className={styles.explorerFilterToggle} onClick={() => setFiltersOpen((o) => !o)}>
          Filters{filtersActive ? ' ●' : ''}
        </button>
      </div>

      {filtersOpen && (
        <div className={styles.explorerFilterPanel}>
          <div className={styles.explorerFilterGrid}>
            <label className={styles.explorerFilterRow}>
              <span className={styles.explorerFilterLabel}>{DIMENSION_LABEL.education} — at most</span>
              <select
                className={styles.explorerSelect}
                value={filters.maxEducationRank}
                onChange={(e) => setFilters((f) => ({ ...f, maxEducationRank: Number(e.target.value) }))}
              >
                {EDUCATION_ORDER.map((level, i) => <option key={level} value={i}>{EDUCATION_LABEL[level]}</option>)}
              </select>
            </label>
            {NUMERIC_FILTER_DIMENSIONS.map((d) => (
              <label key={d} className={styles.explorerFilterRow}>
                <span className={styles.explorerFilterLabel}>{DIMENSION_LABEL[d]} — at least {filters.minValue[d] ?? 0}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={filters.minValue[d] ?? 0}
                  onChange={(e) => setMinValue(d, Number(e.target.value))}
                  className={styles.explorerRange}
                />
              </label>
            ))}
          </div>
          {filtersActive && (
            <button type="button" className={styles.explorerResetButton} onClick={() => setFilters(DEFAULT_EXPLORER_FILTERS)}>
              Reset filters
            </button>
          )}
        </div>
      )}

      <p className={styles.explorerCount}>
        {sorted.length} of {results.length} career{results.length === 1 ? '' : 's'} shown
      </p>

      {sorted.length > 0 ? (
        <div className={styles.explorerList}>
          {sorted.map((r) => (
            <CareerExplorerCard
              key={r.career.id}
              result={r}
              expanded={expandedId === r.career.id}
              onToggle={() => {
                setExpandedId((id) => (id === r.career.id ? null : r.career.id))
                // Fires on open only, not close — id from the public career
                // catalog, never the fit score or anything derived from
                // the respondent's own answers.
                if (expandedId !== r.career.id) track({ type: 'career_card_click', careerId: r.career.id, source: 'explorer' })
              }}
              strengthQuadrants={strengthQuadrants}
            />
          ))}
        </div>
      ) : (
        <p className={styles.emptyNote}>No careers match the current filters.</p>
      )}
    </div>
  )
}
