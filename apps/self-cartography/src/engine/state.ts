import { createContext, useContext, useReducer, type Dispatch, type ReactNode, createElement } from 'react'
import type { RegionId, Response } from './types'
import { getRegionItems, getNextRegionId } from './navigation'
import { ASSESSMENT_VERSION, type AssessmentVersion } from './version'

export type View =
  | { type: 'map' }
  | { type: 'regionIntro'; regionId: string }
  | { type: 'item'; regionId: string; itemIndex: number }
  /** The one-time completion transition — see CompletionTransition.tsx.
   *  Never re-entered on resume (App.tsx normalizes a hydrated 'completion'
   *  view straight to 'synthesis'): it's a ceremonial moment, not a screen
   *  worth replaying every time someone reopens the tab. */
  | { type: 'completion' }
  | { type: 'synthesis' }

export interface AssessmentState {
  responses: Record<string, Response>
  view: View
  startedAt: number
  /** Stamped once at session start, carried through resume — which build of
   *  the instrument/scoring/career model this session's answers belong to. */
  version: AssessmentVersion
  /** Set the first time the respondent reaches Synthesis; null until then.
   *  Doubles as the "completion state" flag (null-check) and a timestamp. */
  completedAt: number | null
  /** RETESTING ARCHITECTURE: stamped once per region, the moment its last
   *  item is answered — the prerequisite data a future "retake this
   *  module" entry point needs (how stale is each region's data), and
   *  what RETAKE_REGION below clears. No UI surfaces this yet; the state
   *  layer is what's being made ready for it now. */
  regionCompletedAt: Partial<Record<RegionId, number>>
}

export type Action =
  | { type: 'HYDRATE'; state: AssessmentState }
  | { type: 'ANSWER'; itemId: string; value: Response['value']; responseTimeMs: number }
  | { type: 'GOTO_MAP' }
  | { type: 'START_REGION'; regionId: string }
  | { type: 'NEXT_ITEM' }
  | { type: 'PREV_ITEM' }
  | { type: 'GOTO_COMPLETION' }
  | { type: 'GOTO_SYNTHESIS' }
  /** RETESTING ARCHITECTURE: clears one region's responses and its
   *  regionCompletedAt stamp, then drops the respondent back at that
   *  region's intro — everything else in the profile is untouched. No UI
   *  dispatches this yet (see AssessmentState.regionCompletedAt); it
   *  exists so retaking a single module is already possible at the state
   *  layer whenever a real entry point is built. */
  | { type: 'RETAKE_REGION'; regionId: RegionId }
  | { type: 'RESET' }

export const initialState: AssessmentState = {
  responses: {},
  view: { type: 'map' },
  startedAt: Date.now(),
  version: ASSESSMENT_VERSION,
  completedAt: null,
  regionCompletedAt: {},
}

export function assessmentReducer(state: AssessmentState, action: Action): AssessmentState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state

    case 'ANSWER': {
      const existing = state.responses[action.itemId]
      const now = Date.now()
      const response: Response = {
        itemId: action.itemId,
        value: action.value,
        firstAnsweredAt: existing?.firstAnsweredAt ?? now,
        lastAnsweredAt: now,
        responseTimeMs: existing ? existing.responseTimeMs : action.responseTimeMs,
        revisitCount: existing ? existing.revisitCount + 1 : 0,
      }
      return { ...state, responses: { ...state.responses, [action.itemId]: response } }
    }

    case 'GOTO_MAP':
      return { ...state, view: { type: 'map' } }

    case 'START_REGION':
      return { ...state, view: { type: 'regionIntro', regionId: action.regionId } }

    // The actual moment of completion — stamped here, once, the first time
    // someone finishes. GOTO_SYNTHESIS (below) is just the ordinary forward
    // step out of the transition screen, and also out of the region map on
    // a repeat visit after completedAt is already set.
    case 'GOTO_COMPLETION':
      return { ...state, view: { type: 'completion' }, completedAt: state.completedAt ?? Date.now() }

    case 'GOTO_SYNTHESIS':
      return { ...state, view: { type: 'synthesis' }, completedAt: state.completedAt ?? Date.now() }

    case 'NEXT_ITEM': {
      if (state.view.type === 'regionIntro') {
        return { ...state, view: { type: 'item', regionId: state.view.regionId, itemIndex: 0 } }
      }
      if (state.view.type !== 'item') return state
      const { regionId, itemIndex } = state.view
      const items = getRegionItems(regionId)
      if (itemIndex + 1 < items.length) {
        return { ...state, view: { type: 'item', regionId, itemIndex: itemIndex + 1 } }
      }
      // The last item in the region was just answered — this is the one
      // place a region's own completion moment actually happens.
      const regionCompletedAt = { ...state.regionCompletedAt, [regionId]: Date.now() }
      const nextRegionId = getNextRegionId(regionId)
      return { ...state, regionCompletedAt, view: nextRegionId ? { type: 'regionIntro', regionId: nextRegionId } : { type: 'map' } }
    }

    case 'PREV_ITEM': {
      if (state.view.type !== 'item') return state
      const { regionId, itemIndex } = state.view
      if (itemIndex === 0) return { ...state, view: { type: 'regionIntro', regionId } }
      return { ...state, view: { type: 'item', regionId, itemIndex: itemIndex - 1 } }
    }

    case 'RETAKE_REGION': {
      const staleItemIds = new Set(getRegionItems(action.regionId).map((item) => item.id))
      const responses = Object.fromEntries(Object.entries(state.responses).filter(([itemId]) => !staleItemIds.has(itemId)))
      const regionCompletedAt = { ...state.regionCompletedAt }
      delete regionCompletedAt[action.regionId]
      return { ...state, responses, regionCompletedAt, view: { type: 'regionIntro', regionId: action.regionId } }
    }

    case 'RESET':
      return { ...initialState, startedAt: Date.now() }

    default:
      return state
  }
}

interface AssessmentContextValue {
  state: AssessmentState
  dispatch: Dispatch<Action>
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null)

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(assessmentReducer, initialState)
  return createElement(AssessmentContext.Provider, { value: { state, dispatch } }, children)
}

export function useAssessment(): AssessmentContextValue {
  const ctx = useContext(AssessmentContext)
  if (!ctx) throw new Error('useAssessment must be used within an AssessmentProvider')
  return ctx
}
