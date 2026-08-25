import { memo, useId, useMemo } from 'react'
import {
  MAP_VIEWBOX,
  buildContourPath,
  buildFrameTicks,
  generateMapGraph,
  hubClusterIndex,
} from './emergingMapGraph'
import styles from './EmergingMap.module.css'

interface EmergingMapProps {
  /** A stable digest of the current responses — same answers always produce the same map. */
  seed: string
  /** 0–1 overall completion. */
  progress: number
  size?: number
  /** 'inline' — ambient, during the journey. 'signature' — the completed report's mark. */
  variant?: 'inline' | 'signature'
}

const MIN_REVEALED = 3
const FRAME_TICKS = buildFrameTicks(MAP_VIEWBOX)

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}

function EmergingMapImpl({ seed, progress, size = 200, variant = 'inline' }: EmergingMapProps) {
  const patternId = useId()
  const graph = useMemo(() => generateMapGraph(seed), [seed])
  const contours = useMemo(
    () => graph.clusters.map((nodeIds, i) => ({ nodeIds, d: buildContourPath(nodeIds, graph.nodes, seed, i) })),
    [graph, seed],
  )
  const hubIndex = useMemo(() => hubClusterIndex(graph.clusters), [graph])

  const revealedCount = Math.max(MIN_REVEALED, Math.round(clamp01(progress) * graph.nodes.length))
  const revealed = new Set(graph.revealOrder.slice(0, revealedCount))
  const anchorId = graph.revealOrder[0]
  const anchor = graph.nodes[anchorId]

  const a11yProps =
    variant === 'signature'
      ? { role: 'img' as const, 'aria-label': 'A map assembled from your answers — the visual signature of this report' }
      : { 'aria-hidden': true as const }

  return (
    <svg
      className={[styles.map, variant === 'signature' ? styles.signature : ''].join(' ')}
      width={size}
      height={size}
      viewBox={`0 0 ${MAP_VIEWBOX} ${MAP_VIEWBOX}`}
      style={{ maxWidth: `${size}px` }}
      {...a11yProps}
    >
      <defs>
        <pattern id={patternId} width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.6" fill="currentColor" />
        </pattern>
      </defs>

      <g className={styles.frame} aria-hidden="true">
        {FRAME_TICKS.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
        ))}
      </g>

      {anchor &&
        graph.bearingAngles.map((angle, i) => {
          const len = MAP_VIEWBOX * 0.16
          return (
            <line
              key={i}
              className={styles.bearing}
              x1={anchor.x}
              y1={anchor.y}
              x2={anchor.x + Math.cos(angle) * len}
              y2={anchor.y + Math.sin(angle) * len}
            />
          )
        })}

      {contours.map((c, i) => {
        const visible = c.nodeIds.every((id) => revealed.has(id))
        const isHub = i === hubIndex
        return (
          <path
            key={i}
            d={c.d}
            className={[styles.contour, visible ? styles.visible : '', isHub ? styles.hub : ''].join(' ')}
            fill={isHub ? undefined : `url(#${patternId})`}
          />
        )
      })}

      {graph.edges.map((e, i) => {
        const visible = revealed.has(e.a) && revealed.has(e.b)
        return (
          <line
            key={i}
            className={[styles.edge, visible ? styles.visible : ''].join(' ')}
            x1={graph.nodes[e.a].x}
            y1={graph.nodes[e.a].y}
            x2={graph.nodes[e.b].x}
            y2={graph.nodes[e.b].y}
          />
        )
      })}

      {graph.nodes.map((n) => {
        const visible = revealed.has(n.id)
        return (
          <circle
            key={n.id}
            cx={n.x}
            cy={n.y}
            className={[styles.node, visible ? styles.visible : '', n.id === anchorId ? styles.anchor : ''].join(' ')}
          />
        )
      })}
    </svg>
  )
}

/**
 * A recurring visual metaphor: as the assessment is answered, this map
 * fills in — sparse at the start, gradually gaining nodes, connections,
 * and rough contour regions, and settling into a stable, unique "signature"
 * once complete. Node positions never move once generated (see
 * emergingMapGraph.ts); only what's revealed changes, so the shape you end
 * up with is the same one you watched form, not a different image swapped
 * in at the end.
 *
 * Deliberately not a data visualization: no numbers, no labeled axes, no
 * claim of precision. It reads as a hand-surveyed sketch, not a scan.
 */
export const EmergingMap = memo(EmergingMapImpl)
