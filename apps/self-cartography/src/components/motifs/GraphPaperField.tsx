import styles from './GraphPaperField.module.css'

/**
 * Very low-opacity graph-paper grid + a couple of coordinate tick marks in
 * the corners. Fixed backdrop, never competes with content for attention.
 */
export function GraphPaperField() {
  return (
    <svg className={styles.field} aria-hidden="true" focusable="false">
      <defs>
        <pattern id="sc-grid" width="42" height="42" patternUnits="userSpaceOnUse">
          <path d="M 42 0 L 0 0 0 42" fill="none" stroke="rgba(233,226,211,0.05)" strokeWidth="1" />
        </pattern>
        <radialGradient id="sc-vignette" cx="50%" cy="18%" r="75%">
          <stop offset="0%" stopColor="rgba(201,154,83,0.05)" />
          <stop offset="100%" stopColor="rgba(201,154,83,0)" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#sc-grid)" />
      <rect width="100%" height="100%" fill="url(#sc-vignette)" />
    </svg>
  )
}
