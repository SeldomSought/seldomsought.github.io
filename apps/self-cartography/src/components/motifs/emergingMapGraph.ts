/**
 * Pure, deterministic graph generation behind EmergingMap — no React, no
 * DOM. The same seed always produces the same node layout, connections,
 * and clusters; `progress` (in the component) only changes how much of
 * this fixed graph is currently revealed. Positions never move once
 * generated, so revealing more of the map never re-shuffles what's
 * already there — it fills in, like a photograph developing.
 */

export interface MapNode {
  id: number
  x: number
  y: number
}

export interface MapEdge {
  a: number
  b: number
}

export interface EmergingMapGraph {
  nodes: MapNode[]
  /** Node ids in reveal order — index 0 is the "anchor," revealed first. */
  revealOrder: number[]
  edges: MapEdge[]
  /** Connected components of size >= 3 — small enough to read as a region, not a mesh. */
  clusters: number[][]
  /** 2–3 angles (radians) for short orientation rays from the anchor. */
  bearingAngles: number[]
}

export const MAP_MAX_NODES = 13
export const MAP_VIEWBOX = 200

function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0 // FNV-1a
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function distance(a: MapNode, b: MapNode): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function generateMapGraph(seed: string): EmergingMapGraph {
  const rand = mulberry32(hashSeed(seed) || 1)
  const margin = MAP_VIEWBOX * 0.14
  const span = MAP_VIEWBOX - margin * 2

  // 1 — organic scatter, not a grid: jittered placement with a minimum-
  // distance rejection pass so nodes don't clump into an unreadable knot.
  const nodes: MapNode[] = []
  for (let i = 0; i < MAP_MAX_NODES; i++) {
    let placed: MapNode | null = null
    for (let attempt = 0; attempt < 24 && !placed; attempt++) {
      const candidate: MapNode = { id: i, x: margin + rand() * span, y: margin + rand() * span }
      if (!nodes.some((n) => distance(n, candidate) < MAP_VIEWBOX * 0.14)) placed = candidate
    }
    nodes.push(placed ?? { id: i, x: margin + rand() * span, y: margin + rand() * span })
  }

  // 2 — a shuffled reveal order (Fisher–Yates), so structure appears
  // scattered across the canvas as progress increases, not swept left-to-right.
  const revealOrder = nodes.map((n) => n.id)
  for (let i = revealOrder.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[revealOrder[i], revealOrder[j]] = [revealOrder[j], revealOrder[i]]
  }

  // 3 — sparse edges: each node (after the first) connects to its nearest
  // already-revealed neighbor ONLY if that neighbor is close enough — a
  // node with nothing nearby stays its own unconnected point rather than
  // forcing a long link across the map. This is what lets several distinct
  // regions form instead of one guaranteed spanning tree. Never fully
  // meshed either way — a survey sketch, not a network diagram.
  const connectThreshold = MAP_VIEWBOX * 0.3
  const edges: MapEdge[] = []
  for (let i = 1; i < revealOrder.length; i++) {
    const id = revealOrder[i]
    const ranked = revealOrder
      .slice(0, i)
      .map((eid) => ({ eid, d: distance(nodes[id], nodes[eid]) }))
      .sort((a, b) => a.d - b.d)
    if (ranked[0].d > connectThreshold) continue
    edges.push({ a: id, b: ranked[0].eid })
    if (ranked.length > 1 && ranked[1].d < ranked[0].d * 1.3 && ranked[1].d <= connectThreshold && rand() < 0.35) {
      edges.push({ a: id, b: ranked[1].eid })
    }
  }

  // 4 — clusters via union–find over the edges
  const parent = nodes.map((n) => n.id)
  function find(x: number): number {
    return parent[x] === x ? x : (parent[x] = find(parent[x]))
  }
  edges.forEach((e) => {
    const ra = find(e.a)
    const rb = find(e.b)
    if (ra !== rb) parent[ra] = rb
  })
  const groups = new Map<number, number[]>()
  nodes.forEach((n) => {
    const root = find(n.id)
    const list = groups.get(root) ?? []
    list.push(n.id)
    groups.set(root, list)
  })
  const clusters = [...groups.values()].filter((g) => g.length >= 3)

  // 5 — 2–3 bearing rays from the anchor, evoking an orientation taken
  // before anything else was known.
  const bearingCount = 2 + Math.floor(rand() * 2)
  const bearingAngles = Array.from({ length: bearingCount }, () => rand() * Math.PI * 2)

  return { nodes, revealOrder, edges, clusters, bearingAngles }
}

/** A loose, hand-drawn-feeling closed contour around a cluster — not a precise hull. */
export function buildContourPath(nodeIds: number[], nodes: MapNode[], seed: string, clusterIndex: number): string {
  if (nodeIds.length < 3) return ''
  const rand = mulberry32(hashSeed(`${seed}:contour:${clusterIndex}`) || 1)
  const points = nodeIds.map((id) => nodes[id])
  const cx = points.reduce((s, p) => s + p.x, 0) / points.length
  const cy = points.reduce((s, p) => s + p.y, 0) / points.length

  const expanded = points
    .map((p) => ({ x: p.x, y: p.y, angle: Math.atan2(p.y - cy, p.x - cx) }))
    .sort((a, b) => a.angle - b.angle)
    .map((p) => {
      const push = 1.5 + rand() * 0.5 // 1.5–2.0x outward, jittered per point
      const jitter = (rand() - 0.5) * 6
      return { x: cx + (p.x - cx) * push + jitter, y: cy + (p.y - cy) * push + jitter }
    })

  // smooth closed blob: a quadratic curve through each vertex to the
  // midpoint of the next — a well-known cheap trick for a soft polygon.
  const mid = (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
  const start = mid(expanded[expanded.length - 1], expanded[0])
  let d = `M ${start.x} ${start.y} `
  for (let i = 0; i < expanded.length; i++) {
    const next = expanded[(i + 1) % expanded.length]
    const m = mid(expanded[i], next)
    d += `Q ${expanded[i].x} ${expanded[i].y} ${m.x} ${m.y} `
  }
  return `${d}Z`
}

export function hubClusterIndex(clusters: number[][]): number {
  if (clusters.length === 0) return -1
  let best = 0
  for (let i = 1; i < clusters.length; i++) {
    if (clusters[i].length > clusters[best].length) best = i
  }
  return best
}

/**
 * A small cartographic flourish, not a claim: every map needs coordinates,
 * so this map gets some — deterministic from the same seed as everything
 * else about it (no two respondents' maps share a signature, the same
 * respondent's never changes), never meant to correspond to anywhere real.
 * Salted independently of the node layout's own random stream so this
 * reads as a separate fact about the map, not a byproduct of its shape.
 */
export function coordinateSignature(seed: string): string {
  const rand = mulberry32(hashSeed(`${seed}:coordinate`) || 1)
  const lat = rand() * 180 - 90
  const lon = rand() * 360 - 180
  const latDir = lat >= 0 ? 'N' : 'S'
  const lonDir = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(2)}° ${latDir}, ${Math.abs(lon).toFixed(2)}° ${lonDir}`
}

export function buildFrameTicks(vb: number): { x1: number; y1: number; x2: number; y2: number }[] {
  const ticks: { x1: number; y1: number; x2: number; y2: number }[] = []
  const count = 6
  const len = vb * 0.02
  for (let i = 1; i < count; i++) {
    const p = (i / count) * vb
    ticks.push({ x1: p, y1: 0, x2: p, y2: len })
    ticks.push({ x1: p, y1: vb, x2: p, y2: vb - len })
    ticks.push({ x1: 0, y1: p, x2: len, y2: p })
    ticks.push({ x1: vb, y1: p, x2: vb - len, y2: p })
  }
  return ticks
}
