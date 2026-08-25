import styles from './RadarDiagram.module.css'

interface RadarDiagramProps {
  facets: { label: string; score: number }[]
  size?: number
}

/** Hand-rolled inline SVG — no charting library. */
export function RadarDiagram({ facets, size = 260 }: RadarDiagramProps) {
  const center = size / 2
  const maxRadius = size / 2 - 34
  const n = facets.length
  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2

  const pointFor = (i: number, radiusFraction: number) => {
    const angle = angleFor(i)
    return {
      x: center + Math.cos(angle) * maxRadius * radiusFraction,
      y: center + Math.sin(angle) * maxRadius * radiusFraction,
    }
  }

  const shapePoints = facets.map((f, i) => pointFor(i, Math.max(0.04, f.score / 100)))
  const shapePath = shapePoints.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className={styles.wrap}>
      <svg
        className={styles.svg}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ maxWidth: `${size}px` }}
        role="img"
        aria-label="Facet radar diagram"
      >
        {[0.33, 0.66, 1].map((frac) => (
          <polygon
            key={frac}
            className={styles.ring}
            points={facets.map((_, i) => { const p = pointFor(i, frac); return `${p.x},${p.y}` }).join(' ')}
          />
        ))}
        {facets.map((_, i) => {
          const p = pointFor(i, 1)
          return <line key={i} className={styles.axis} x1={center} y1={center} x2={p.x} y2={p.y} />
        })}
        <polygon className={styles.shape} points={shapePath} />
        {shapePoints.map((p, i) => (
          <circle key={i} className={styles.point} cx={p.x} cy={p.y} r="2.5" />
        ))}
        {facets.map((f, i) => {
          const p = pointFor(i, 1.22)
          return (
            <text key={f.label} className={styles.label} x={p.x} y={p.y}>
              {f.label.length > 16 ? `${f.label.slice(0, 14)}…` : f.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
