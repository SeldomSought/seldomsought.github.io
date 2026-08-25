// @vitest-environment jsdom
import { useEffect } from 'react'
import { describe, it, expect, afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { AssessmentProvider, useAssessment } from '../../engine/state'
import { AssessmentShell } from './AssessmentShell'

// This project's vitest config doesn't run in `globals` mode (see
// vitest.config.ts), so React Testing Library's own auto-cleanup — which
// detects a global `afterEach` — never registers. Without this, every
// render() in this file stacks up in the same jsdom document instead of
// unmounting between tests, and queries start matching leftover elements
// from earlier tests.
afterEach(cleanup)

/**
 * Real components, real content, real reducer — the only thing simulated is
 * the keydown event itself. Drives the assessment from the map view into a
 * given region's first item via the actual START_REGION/NEXT_ITEM actions
 * (not injected state), so this exercises the same path a respondent does.
 */
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

describe('AssessmentShell keyboard navigation — ArrowLeft/ArrowRight', () => {
  it('ArrowRight advances to the next item once the current one is answerable (orientation\'s items are optional)', async () => {
    renderRegion('orientation')
    // ori-open-1 is an optional openText item — canAdvance is true immediately
    expect(await screen.findByPlaceholderText(/Optional/i)).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    // ori-evi-1, the second orientation item, is also an optional reflection
    expect(await screen.findByText(/Optional evidence/i)).toBeInTheDocument()
  })

  it('ArrowLeft returns to the previous item', async () => {
    renderRegion('orientation')
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    await screen.findByText(/Optional evidence/i)
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(await screen.findByText(/Optional reflection/i)).toBeInTheDocument()
  })

  it('does not navigate on ArrowRight while typing in a text field (isEditingText guard)', async () => {
    renderRegion('orientation')
    const textarea = await screen.findByPlaceholderText(/Optional/i)
    textarea.focus()
    fireEvent.keyDown(textarea, { key: 'ArrowRight' })
    // still on the first item — its own optional-reflection copy is still on screen
    expect(screen.getByText(/Optional reflection/i)).toBeInTheDocument()
  })
})

describe('ItemRenderer keyboard shortcuts — rating-scale number keys', () => {
  it('a plain digit press answers the item without advancing', async () => {
    renderRegion('temperament')
    // tmp-ic-1, temperament's first item, is a likert5 (AGREE_5) item
    await screen.findByRole('radiogroup')
    fireEvent.keyDown(window, { key: '4' })
    // "4" and "Agree" together — not just /Agree$/, which also matches "Strongly agree"
    const pressed = screen.getByRole('radio', { name: /4\s*Agree/i })
    expect(pressed).toHaveAttribute('aria-checked', 'true')
    // still the same item — the radiogroup for this item is still mounted
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })

  it('Shift+digit answers AND advances to the next item in one step', async () => {
    renderRegion('temperament')
    await screen.findByRole('radiogroup')
    fireEvent.keyDown(window, { key: '5', shiftKey: true })
    // tmp-ic-2 (the next item) is the reverse-scored "tedious" statement —
    // its prompt text is distinct enough to confirm real advancement
    expect(await screen.findByText(/tedious rather than interesting/i)).toBeInTheDocument()
  })
})
