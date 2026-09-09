import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { FacetScore } from '../../engine/types'
import { ATLAS_LAYERS, atlasDimensions, type AtlasDimension } from './atlasModel'
import styles from './ProfileAtlas.module.css'

const TAU = Math.PI * 2
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

function FlatProfile({ dimensions, selected, onSelect }: { dimensions: AtlasDimension[]; selected: string; onSelect: (id: string) => void }) {
  const point = (i: number, value: number) => {
    const a = i / dimensions.length * TAU - Math.PI / 2
    return [240 + Math.cos(a) * value * 1.72, 220 + Math.sin(a) * value * 1.72]
  }
  return (
    <svg className={styles.flat} viewBox="0 0 480 440" role="img" aria-label="Flat profile. Each spoke is an independent score from 0 at the center to 100 at the edge. Exact scores follow the chart.">
      {[25, 50, 75, 100].map((r) => <g key={r}><circle cx="240" cy="220" r={r * 1.72} fill="none" stroke="currentColor" opacity=".16" /><text x="247" y={220 - r * 1.72 + 15} className={styles.plotLabel}>{r}</text></g>)}
      {dimensions.map((d, i) => {
        const [x, y] = point(i, 100)
        const [px, py] = point(i, d.facet?.score ?? 0)
        const [lx, ly] = point(i, 113)
        const next = dimensions[(i + 1) % dimensions.length]
        const [nx, ny] = point((i + 1) % dimensions.length, next.facet?.score ?? 0)
        return <g key={d.id}>
          <line x1="240" y1="220" x2={x} y2={y} stroke="currentColor" opacity=".14" />
          <text x={lx} y={ly + 5} textAnchor="middle" className={styles.plotLabel}>{String(i + 1).padStart(2, '0')}</text>
          {d.facet && next.facet && <line x1={px} y1={py} x2={nx} y2={ny} stroke="currentColor" strokeWidth="1.5" opacity=".55" strokeDasharray={d.facet.confidence === 'Low' || next.facet.confidence === 'Low' ? '3 5' : undefined} />}
          {d.facet && <g onClick={() => onSelect(d.id)} className={styles.point}>
            <circle cx={px} cy={py} r="16" fill="transparent" />
            <circle cx={px} cy={py} r={selected === d.id ? 6 : 3.5} fill={selected === d.id ? 'currentColor' : 'var(--sc-bg)'} stroke="currentColor" strokeWidth="1.5" />
          </g>}
        </g>
      })}
    </svg>
  )
}

function SpatialProfile({ dimensions, selected, paused, onSelect, onUnavailable }: {
  dimensions: AtlasDimension[]; selected: string; paused: boolean; onSelect: (id: string) => void; onUnavailable: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotation = useRef({ x: -.25, y: .45 })
  const drag = useRef<{ x: number; y: number; distance: number } | null>(null)
  const nodes = useRef<{ x: number; y: number; id: string }[]>([])
  const drawRef = useRef<() => void>(() => {})
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update(); media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let ctx: CanvasRenderingContext2D | null = null
    try { ctx = canvas.getContext('2d') } catch { /* Flat profile is the complete fallback. */ }
    if (!ctx) { onUnavailable(); return }
    const context = ctx
    let width = 600, height = 480, frame = 0, visible = true, last = 0
    const color = getComputedStyle(canvas).color

    function project(x: number, y: number, z: number) {
      const ry = rotation.current.y, rx = rotation.current.x
      const x1 = x * Math.cos(ry) + z * Math.sin(ry)
      const z1 = z * Math.cos(ry) - x * Math.sin(ry)
      const y1 = y * Math.cos(rx) - z1 * Math.sin(rx)
      const z2 = y * Math.sin(rx) + z1 * Math.cos(rx)
      const perspective = 3.8 / (3.8 - z2)
      const scale = Math.min(width * .34, height * .4)
      return { x: width / 2 + x1 * scale * perspective, y: height * .49 + y1 * scale * perspective, z: z2 }
    }

    function line(points: { x: number; y: number; z: number }[], alpha: number, lineWidth = .65, dashed = false) {
      context.beginPath()
      points.forEach((p, i) => { if (i === 0) context.moveTo(p.x, p.y); else context.lineTo(p.x, p.y) })
      context.globalAlpha = alpha; context.lineWidth = lineWidth
      context.setLineDash(dashed ? [2, 5] : []); context.strokeStyle = color; context.stroke()
    }

    function draw() {
      context.clearRect(0, 0, width, height)
      // A neutral reference cage at score 100. It carries no respondent data.
      for (const latitude of [-.65, 0, .65]) {
        const points = Array.from({ length: 97 }, (_, i) => {
          const angle = i / 96 * TAU
          return project(Math.cos(angle) * Math.cos(latitude), Math.sin(latitude), Math.sin(angle) * Math.cos(latitude))
        })
        line(points, .09, .6, true)
      }
      // Each strip connects adjacent observed spokes. A missing score leaves an open sector.
      dimensions.forEach((dimension, i) => {
        const next = dimensions[(i + 1) % dimensions.length]
        if (!dimension.facet || !next.facet) return
        for (let latitude = -12; latitude <= 12; latitude++) {
          const lat = latitude / 13 * Math.PI / 2
          const points = Array.from({ length: 19 }, (_, j) => {
            const t = j / 18, ease = (1 - Math.cos(t * Math.PI)) / 2
            const value = (dimension.facet!.score * (1 - ease) + next.facet!.score * ease) / 100
            const angle = (i + t) / dimensions.length * TAU
            return project(value * Math.cos(lat) * Math.cos(angle), .76 * Math.sin(lat), value * Math.cos(lat) * Math.sin(angle))
          })
          const depth = points.reduce((sum, p) => sum + p.z, 0) / points.length
          const selectedSector = dimension.id === selected || next.id === selected
          line(points, clamp(.14 + (depth + 1) * .15 + (selectedSector ? .1 : 0), .08, .58), latitude === 0 ? 1.4 : .65, dimension.facet.confidence === 'Low' || next.facet.confidence === 'Low')
        }
        for (let longitude = 0; longitude < 6; longitude++) {
          const t = longitude / 6, ease = (1 - Math.cos(t * Math.PI)) / 2
          const value = (dimension.facet.score * (1 - ease) + next.facet.score * ease) / 100
          const angle = (i + t) / dimensions.length * TAU
          line(Array.from({ length: 37 }, (_, k) => {
            const lat = (k / 36 - .5) * Math.PI
            return project(value * Math.cos(lat) * Math.cos(angle), .76 * Math.sin(lat), value * Math.cos(lat) * Math.sin(angle))
          }), .14, .55)
        }
      })
      nodes.current = []
      dimensions.forEach((d, i) => {
        if (!d.facet) return
        const a = i / dimensions.length * TAU, r = d.facet.score / 100
        const p = project(r * Math.cos(a), 0, r * Math.sin(a))
        const outside = project(1.12 * Math.cos(a), 0, 1.12 * Math.sin(a))
        const active = d.id === selected
        line([p, outside], active ? .6 : .2, .7, true)
        context.setLineDash([]); context.globalAlpha = active ? 1 : .65
        context.beginPath(); context.arc(p.x, p.y, active ? 5 : 3, 0, TAU)
        context.fillStyle = color; context.fill()
        if (active) { context.beginPath(); context.arc(p.x, p.y, 11, 0, TAU); context.globalAlpha = .3; context.stroke() }
        context.globalAlpha = .8; context.font = '13px monospace'; context.textAlign = 'center'
        context.fillText(String(i + 1).padStart(2, '0'), outside.x, outside.y - 9)
        nodes.current.push({ ...p, id: d.id })
      })
      context.globalAlpha = 1
    }
    drawRef.current = draw
    function resize() {
      if (!canvas) return
      const bounds = canvas.getBoundingClientRect()
      if (!bounds.width || !bounds.height) return
      width = bounds.width; height = bounds.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0); draw()
    }
    function animate(time: number) {
      if (!paused && !reducedMotion && visible && !document.hidden && !drag.current && time - last > 33) {
        rotation.current.y += .0022; draw(); last = time
      }
      if (!paused && !reducedMotion) frame = requestAnimationFrame(animate)
    }
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize)
    observer?.observe(canvas)
    const intersection = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    intersection?.observe(canvas)
    window.addEventListener('resize', resize)
    resize(); if (!paused && !reducedMotion) frame = requestAnimationFrame(animate)
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); intersection?.disconnect(); window.removeEventListener('resize', resize); drawRef.current = () => {} }
  }, [dimensions, selected, paused, reducedMotion, onUnavailable])

  return <canvas ref={canvasRef} className={styles.canvas} tabIndex={0} role="img"
    aria-label="Rotatable 3D profile. Arrow keys rotate; Home resets. The numbered buttons after this chart provide exact scores."
    onKeyDown={(e) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(e.key)) return
      e.preventDefault()
      if (e.key === 'Home') rotation.current = { x: -.25, y: .45 }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') rotation.current.y += e.key === 'ArrowLeft' ? -.12 : .12
      else rotation.current.x = clamp(rotation.current.x + (e.key === 'ArrowUp' ? -.12 : .12), -1, 1)
      drawRef.current()
    }}
    onPointerDown={(e) => { if (e.button !== 0) return; e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, distance: 0 } }}
    onPointerMove={(e) => {
      if (!drag.current) return
      const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y
      rotation.current.y += dx * .006; rotation.current.x = clamp(rotation.current.x + dy * .004, -1, 1)
      drag.current = { x: e.clientX, y: e.clientY, distance: drag.current.distance + Math.abs(dx) + Math.abs(dy) }; drawRef.current()
    }}
    onPointerUp={(e) => {
      if (drag.current && drag.current.distance < 6) {
        const bounds = e.currentTarget.getBoundingClientRect()
        const nearest = nodes.current.map((n) => ({ ...n, distance: Math.hypot(n.x - (e.clientX - bounds.left), n.y - (e.clientY - bounds.top)) })).sort((a, b) => a.distance - b.distance)[0]
        if (nearest && nearest.distance < 30) onSelect(nearest.id)
      }
      drag.current = null
    }}
    onPointerCancel={() => { drag.current = null }} onLostPointerCapture={() => { drag.current = null }} />
}

export function ProfileAtlas({ facetScores, onExplore }: { facetScores: Record<string, FacetScore>; onExplore: (section: string) => void }) {
  const [layerId, setLayerId] = useState<string>('interests')
  const [selectedId, setSelectedId] = useState<string>('')
  const [flat, setFlat] = useState(false)
  const [paused, setPaused] = useState(true)
  const id = useId()
  const layer = ATLAS_LAYERS.find((l) => l.id === layerId)!
  const dimensions = useMemo(() => atlasDimensions(layer, facetScores), [layer, facetScores])
  const selected = dimensions.find((d) => d.id === selectedId) ?? [...dimensions].sort((a, b) => (b.facet?.score ?? -1) - (a.facet?.score ?? -1))[0]
  // Stable callback avoids restarting canvas animation on unrelated renders.
  const unavailable = useRef(() => setFlat(true)).current
  const measured = dimensions.filter((d) => d.facet).length

  return <section className={styles.atlas} aria-label="Interactive profile atlas">
    <div className={styles.toolbar}>
      <div className={styles.layers} role="group" aria-label="Profile layer">
        {ATLAS_LAYERS.map((l) => <button key={l.id} type="button" aria-pressed={l.id === layerId} onClick={() => { setLayerId(l.id); setSelectedId('') }}>{l.label}</button>)}
      </div>
      <div className={styles.controls}>
        <button type="button" aria-pressed={!flat} onClick={() => setFlat((v) => !v)} aria-label={flat ? 'Switch to 3D view' : 'Switch to flat view'}>{flat ? '2D' : '3D'} <span aria-hidden="true">◇</span></button>
        {!flat && <button type="button" aria-pressed={!paused} onClick={() => setPaused((v) => !v)}>{paused ? 'Rotate' : 'Pause'}</button>}
      </div>
    </div>
    <div className={styles.workspace}>
      <figure className={styles.figure} aria-describedby={`${id}-caption`}>
        <div className={styles.figureMeta}><span>FIELD / {layer.label.toUpperCase()}</span><span>{measured} / {dimensions.length} OBSERVED</span></div>
        <div className={styles.visual}>
          {flat ? <FlatProfile dimensions={dimensions} selected={selected.id} onSelect={setSelectedId} /> : <SpatialProfile dimensions={dimensions} selected={selected.id} paused={paused} onSelect={setSelectedId} onUnavailable={unavailable} />}
          {!measured && <p className={styles.empty}>This part of your map is still uncharted.<br />Answer this region to reveal its shape.</p>}
        </div>
        <figcaption id={`${id}-caption`} className={styles.caption}>
          <span>{flat ? 'CENTER 0 / EDGE 100' : 'DRAG TO EXPLORE / ARROW KEYS TO ROTATE'}</span>
          <p>Each numbered spoke is one score. Radial distance on the middle ring runs from 0 to 100; depth and connecting lines only give the map its shape. Dotted sectors have Low confidence. Missing scores stay open.</p>
        </figcaption>
      </figure>
      <aside className={styles.reading}>
        <div className={styles.readingIntro}><span className={styles.eyebrow}>A closer reading</span><h2>{selected.label}</h2><p>{selected.description}</p></div>
        <div className={styles.scoreLine} aria-live="polite"><strong>{selected.facet ? Math.round(selected.facet.score) : '—'}</strong><span>{selected.facet ? <>/ 100<br /><b>{selected.facet.confidence} confidence</b></> : <>Not yet<br />measured</>}</span></div>
        <div className={styles.dimensions} aria-label={`${layer.label} scores`}>
          {dimensions.map((d, i) => <button type="button" key={d.id} aria-pressed={selected.id === d.id} onClick={() => setSelectedId(d.id)} aria-label={`${d.label}: ${d.facet ? `${Math.round(d.facet.score)} out of 100, ${d.facet.confidence} confidence` : 'not yet measured'}`}>
            <span className={styles.number}>{String(i + 1).padStart(2, '0')}</span><span className={styles.dimensionName}>{d.label}<span className={styles.track}><i style={{ width: `${d.facet?.score ?? 0}%` }} data-confidence={d.facet?.confidence} /></span></span><span>{d.facet ? Math.round(d.facet.score) : '—'}</span>
          </button>)}
        </div>
        <p className={styles.evidence}>{selected.facet ? `${selected.facet.evidenceCount} contributing answers · ${selected.facet.behavioralEvidenceCount} behavioral indicators` : 'No answers are filled in on your behalf.'}</p>
        <button type="button" className={styles.explore} onClick={() => onExplore(layer.section)}>Explore {layer.label.toLowerCase()} <span aria-hidden="true">↗</span></button>
      </aside>
    </div>
    <div className={styles.footnote}><span>YOUR SCORES, IN PERSPECTIVE</span><p>These are independent dimensions, not population percentiles. A larger shape is not a better personality.</p></div>
  </section>
}
