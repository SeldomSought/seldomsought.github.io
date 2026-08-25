// @vitest-environment jsdom
//
// "Mobile interactions" for this app are almost entirely CSS media-query
// driven (see the earlier mobile-redesign pass) — there's no JS viewport
// branching to unit-test. What IS real, testable JS behavior is the tap
// surface itself: a touch and a click resolve to the same synthetic click
// handler on these plain <button> elements, so exercising click here is a
// faithful stand-in for "does tapping this actually work," including the
// specific case a touch UI depends on most — Next staying disabled until
// there's a real answer, so a stray tap can't skip a question.
import { useEffect } from 'react'
import { describe, it, expect, afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { AssessmentProvider, useAssessment } from '../../engine/state'
import { AssessmentShell } from './AssessmentShell'

afterEach(cleanup)

function Harness({ regionId }: { regionId: string }) {
  const { state, dispatch } = useAssessment()
  useEffect(() => {
    if (state.view.type === 'map') dispatch({ type: 'START_REGION', regionId })
    else if (state.view.type === 'regionIntro') dispatch({ type: 'NEXT_ITEM' })
  }, [state.view, dispatch, regionId])

  if (state.view.type !== 'item') return null
  return <AssessmentShell regionId={state.view.regionId} itemIndex={state.view.itemIndex} savedAt={null} />
}

function renderRegion(regionId: string) {
  return render(
    <AssessmentProvider>
      <Harness regionId={regionId} />
    </AssessmentProvider>,
  )
}

describe('tapping a likert option', () => {
  it('selects the tapped option', async () => {
    renderRegion('temperament') // tmp-ic-1, a likert5 item
    await screen.findByRole('radiogroup')
    fireEvent.click(screen.getByRole('radio', { name: /Neutral/i }))
    expect(screen.getByRole('radio', { name: /Neutral/i })).toHaveAttribute('aria-checked', 'true')
  })

  it('re-tapping a different option moves the selection rather than adding to it', async () => {
    renderRegion('temperament')
    await screen.findByRole('radiogroup')
    fireEvent.click(screen.getByRole('radio', { name: /Neutral/i }))
    fireEvent.click(screen.getByRole('radio', { name: /4\s*Agree/i }))
    expect(screen.getByRole('radio', { name: /Neutral/i })).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('radio', { name: /4\s*Agree/i })).toHaveAttribute('aria-checked', 'true')
  })
})

describe('tapping Next/Back', () => {
  it('Next is disabled until the current item has an answer', async () => {
    renderRegion('temperament')
    await screen.findByRole('radiogroup')
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled()
    fireEvent.click(screen.getByRole('radio', { name: /Neutral/i }))
    expect(screen.getByRole('button', { name: /Next/i })).toBeEnabled()
  })

  it('tapping Next after answering advances to the next item', async () => {
    renderRegion('temperament')
    await screen.findByRole('radiogroup')
    fireEvent.click(screen.getByRole('radio', { name: /Neutral/i }))
    fireEvent.click(screen.getByRole('button', { name: /Next/i }))
    expect(await screen.findByText(/tedious rather than interesting/i)).toBeInTheDocument()
  })

  it('tapping Back returns to the previous item', async () => {
    renderRegion('orientation') // both items optional — Next is enabled immediately
    await screen.findByPlaceholderText(/Optional/i)
    fireEvent.click(screen.getByRole('button', { name: /Next/i }))
    await screen.findByText(/Optional evidence/i)
    fireEvent.click(screen.getByRole('button', { name: /Back/i }))
    expect(await screen.findByText(/Optional reflection/i)).toBeInTheDocument()
  })
})
