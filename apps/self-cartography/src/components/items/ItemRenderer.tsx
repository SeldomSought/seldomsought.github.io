import { useEffect, useState } from 'react'
import type { AspirationalResponseValue, Item, Response, ScenarioResponseValue } from '../../engine/types'
import { useAssessment } from '../../engine/state'
import { isEditingText } from '../../engine/keyboardGuard'
import { track } from '../../engine/analytics'
import { LikertItem } from './LikertItem'
import { RatingScaleItem } from './RatingScaleItem'
import { CategoricalHistoryItemView } from './CategoricalHistoryItemView'
import { TradeoffItemView } from './TradeoffItemView'
import { ForcedChoiceItemView } from './ForcedChoiceItemView'
import { RankingItemView } from './RankingItemView'
import { ScenarioItemView } from './ScenarioItemView'
import { OpenTextItemView } from './OpenTextItemView'
import { AspirationalPairItemView } from './AspirationalPairItemView'

const RATING_FORMATS = new Set(['likert5', 'likertFrequency', 'confidence', 'behavioralHistory'])

/**
 * Dispatches on item.format to the right presentational component and
 * handles the two pieces of cross-cutting logic every format needs: timing
 * capture for validity.ts, and — for rating-scale formats only — keyboard
 * shortcuts. Plain number keys answer; holding Shift while pressing a
 * number answers *and* advances to the next item — an opt-in, keyboard-only
 * rapid path, off by default, so nobody skips a question by fat-fingering
 * a digit. `key={item.id}` on the caller's side guarantees a fresh mount,
 * and a fresh shown-at timestamp, per item.
 */
// DELIBERATELY NOT auto-advancing on a single-select answer, even though it
// would roughly halve the click count across the ~178/250 items that are
// likert5/tradeoff/behavioralHistory (a real completion-likelihood cost,
// flagged in a UX audit). A short delayed auto-advance is the standard fix
// — but `onClick` fires identically for a real pointer tap and a keyboard
// Enter/Space activation, so it can't reliably tell them apart without a
// pointer-events-based rewrite touching every item-format component. Doing
// that safely means: not yanking a screen-reader/keyboard user's focus
// forward a few hundred ms after they activate an option, not double-firing
// alongside the existing Shift+digit rapid-advance path, and not advancing
// while someone is revisiting an answer via Back to review it rather than
// change it. That's real surface area across the app's core interaction,
// untestable live this session (no browser/device access) — worth its own
// focused pass with real device testing, not a bolt-on here.
export function ItemRenderer({ item }: { item: Item }) {
  const { state, dispatch } = useAssessment()
  const [shownAt] = useState(() => Date.now())
  const response = state.responses[item.id]

  function answer(value: Response['value']) {
    const responseTimeMs = Date.now() - shownAt
    dispatch({ type: 'ANSWER', itemId: item.id, value, responseTimeMs })
    // itemId/format/timing only — never the value itself, which is exactly
    // the response content this event exists to stay separate from.
    track({ type: 'item_answered', itemId: item.id, format: item.format, responseTimeMs, isRevision: Boolean(response) })
  }

  useEffect(() => {
    if (!RATING_FORMATS.has(item.format) || !('options' in item)) return
    // Categorical behavioral-evidence options aren't a scale — no natural
    // "press 3" mapping when the choices aren't ordered.
    if (item.format === 'behavioralHistory' && item.answerMode === 'categorical') return
    function onKeyDown(e: KeyboardEvent) {
      if (isEditingText(document.activeElement)) return
      const digit = Number(e.key)
      if (!Number.isInteger(digit) || digit < 1) return
      const option = (item as { options: { value: number }[] }).options.find((o) => o.value === digit)
      if (option) {
        e.preventDefault()
        answer(option.value)
        // Rapid path: only ever reachable via a deliberate Shift+digit
        // chord, and only after a real answer was just recorded — never
        // an accidental double-advance from a single keystroke.
        if (e.shiftKey) dispatch({ type: 'NEXT_ITEM' })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item])

  switch (item.format) {
    case 'likert5':
      return <LikertItem item={item} value={response?.value as number | undefined} onAnswer={answer} />

    case 'likertFrequency':
    case 'confidence':
      return <RatingScaleItem item={item} value={response?.value as number | undefined} onAnswer={answer} />

    case 'behavioralHistory':
      if (item.answerMode === 'categorical') {
        return <CategoricalHistoryItemView item={item} value={response?.value as string | undefined} onAnswer={answer} />
      }
      return <RatingScaleItem item={item} value={response?.value as number | undefined} onAnswer={answer} />

    case 'tradeoff':
      return <TradeoffItemView item={item} value={response?.value as string | undefined} onAnswer={answer} />

    case 'forcedChoiceRank':
      return <ForcedChoiceItemView item={item} value={response?.value as string[] | undefined} onAnswer={answer} />

    case 'ranking':
      return <RankingItemView item={item} value={response?.value as string[] | undefined} onAnswer={answer} />

    case 'scenario':
      return <ScenarioItemView item={item} value={response?.value as ScenarioResponseValue | undefined} onAnswer={answer} />

    case 'evidencePrompt':
    case 'openText':
      return <OpenTextItemView item={item} value={response?.value as string | undefined} onAnswer={answer} />

    case 'aspirationalPair':
      return <AspirationalPairItemView item={item} value={response?.value as AspirationalResponseValue | undefined} onAnswer={answer} />

    default:
      return null
  }
}
