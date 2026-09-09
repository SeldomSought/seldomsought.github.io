// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from '../../App'
import { createExampleResponses } from './exampleResponses'
import { scoreAssessment } from '../../engine/scoring'
import { ProfileAtlas } from './ProfileAtlas'

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  window.history.replaceState(null, '', '/')
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); localStorage.clear() })

describe('atlas interaction and sample isolation', () => {
  it('automatically provides the readable flat chart when canvas is unavailable', async () => {
    render(<ProfileAtlas facetScores={{}} onExplore={vi.fn()} />)
    expect(await screen.findByRole('img', { name: /Flat profile/ })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /not yet measured/ })).toHaveLength(6)
    fireEvent.click(screen.getByRole('button', { name: 'Temperament' }))
    expect(screen.getAllByRole('button', { name: /not yet measured/ })).toHaveLength(5)
  })
  it('draws finite 3D coordinates and responds to keyboard rotation', () => {
    const context = Object.fromEntries(['beginPath', 'moveTo', 'lineTo', 'setLineDash', 'stroke', 'clearRect', 'arc', 'fill', 'fillText', 'setTransform'].map((key) => [key, vi.fn()]))
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
    vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 640, height: 460, left: 0, top: 0, right: 640, bottom: 460, x: 0, y: 0, toJSON: () => ({}) })
    render(<ProfileAtlas facetScores={scoreAssessment(createExampleResponses()).facetScores} onExplore={vi.fn()} />)
    const plot = screen.getByRole('img', { name: /Rotatable 3D profile/ })
    expect(context.moveTo).toHaveBeenCalled()
    expect(context.lineTo.mock.calls.every((call: number[]) => call.every(Number.isFinite))).toBe(true)
    const frames = context.clearRect.mock.calls.length
    fireEvent.keyDown(plot, { key: 'ArrowRight' })
    expect(context.clearRect.mock.calls.length).toBeGreaterThan(frames)
    fireEvent.click(screen.getByRole('button', { name: 'Switch to flat view' }))
    expect(screen.getByRole('img', { name: /Flat profile/ })).toBeInTheDocument()
  })
  it('shows all report views without overwriting an existing saved assessment', async () => {
    const saved = '{"this":"existing respondent data"}'
    localStorage.setItem('selfCartography.v1', saved)
    window.history.replaceState(null, '', '/?example=1')
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    render(<App />)
    expect(await screen.findByText('Example profile', {}, { timeout: 5000 })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'The person behind the pattern.' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: /Inner landscape/ }))
    expect(await screen.findByRole('heading', { name: 'Temperament' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'The person behind the pattern.' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Energy & environment/ }))
    expect(await screen.findByRole('heading', { name: 'Ability × Energy' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: /Possible directions/ }))
    expect(await screen.findByRole('heading', { name: 'Where This Points', level: 2 })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: /Evidence & reflection/ }))
    expect(await screen.findByRole('heading', { name: 'How Much to Trust Each Number' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Full report' }))
    expect(await screen.findByRole('heading', { name: 'The person behind the pattern.' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Where This Points', level: 2 })).toBeVisible()
    await waitFor(() => expect(localStorage.getItem('selfCartography.v1')).toBe(saved))
    expect(writes).not.toHaveBeenCalled()
  })
})
