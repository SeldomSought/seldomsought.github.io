import styles from './CompassMark.module.css'

interface CompassMarkProps {
  /** 0–1. Drawn as an arc around the ring plus the needle's bearing. */
  progress?: number
  size?: number
}

/**
 * A small compass rose that doubles as the progress indicator in the
 * journey header — the needle's bearing and the ring's arc both reflect
 * how far through the answerable regions the respondent has gotten.
 */
export function CompassMark({ progress = 0, size = 30 }: CompassMarkProps) {
  const r = 12
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)))
  const bearing = progress * 360

  return (
    <svg
      className={styles.compass}
      width={size}
      height={size}
      viewBox="0 0 30 30"
      role="img"
      aria-label={`Progress: ${Math.round(progress * 100)} percent`}
    >
      <circle className={styles.ring} cx="15" cy="15" r={r} />
      <circle
        className={styles.progressArc}
        cx="15"
        cy="15"
        r={r}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 15 15)"
      />
      <g className={styles.needle} style={{ transform: `rotate(${bearing}deg)` }}>
        <line x1="15" y1="15" x2="15" y2="6" stroke="var(--sc-accent-bright)" strokeWidth="1.25" />
        <line x1="15" y1="15" x2="15" y2="22" stroke="var(--sc-ink-faint)" strokeWidth="1" />
      </g>
      <circle cx="15" cy="15" r="1.4" fill="var(--sc-accent-bright)" />
    </svg>
  )
}
