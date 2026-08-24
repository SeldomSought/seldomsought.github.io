import type { Item, Response } from '../types'

export interface Contribution {
  facetId: string
  points: number // 0-100
  weight: number // relative weight within the facet's average
}

export const likertToPoints = (value: number, reverseScored?: boolean, max = 5): number => {
  const pct = ((value - 1) / (max - 1)) * 100
  return reverseScored ? 100 - pct : pct
}

/**
 * Turns one answered item into 0+ facet contributions. This is the only
 * place format-specific scoring logic lives — every downstream consumer
 * (engine/scoring/index.ts) just aggregates {facetId, points, weight} triples.
 */
export function computeContributions(item: Item, response: Response): Contribution[] {
  switch (item.format) {
    case 'likert5':
    case 'likertFrequency':
    case 'confidence': {
      if (typeof response.value !== 'number') return []
      const reverseScored = item.format === 'likert5' ? item.reverseScored : undefined
      return [{ facetId: item.facetId, points: likertToPoints(response.value, reverseScored), weight: 1 }]
    }

    case 'behavioralHistory': {
      if (item.answerMode === 'categorical') {
        if (typeof response.value !== 'string') return []
        const option = item.options.find((o) => o.id === response.value)
        if (!option) return []
        return [{ facetId: item.facetId, points: option.weight, weight: 1 }]
      }
      if (typeof response.value !== 'number') return []
      return [{ facetId: item.facetId, points: likertToPoints(response.value), weight: 1 }]
    }

    case 'tradeoff': {
      if (typeof response.value !== 'string') return []
      const chosen = response.value === 'A' ? item.optionA : item.optionB
      const other = response.value === 'A' ? item.optionB : item.optionA
      if (chosen.facetId === other.facetId) {
        // Bipolar: one shared facet — the chosen option's poleValue is where
        // this answer lands on that facet's scale. No competing
        // contribution from "other," since it's the same facet, not a
        // second one — a 0-contribution here would just drag every answer
        // toward the midpoint regardless of what was actually chosen.
        return [{ facetId: chosen.facetId, points: chosen.poleValue ?? 100, weight: 1 }]
      }
      return [
        { facetId: chosen.facetId, points: 100, weight: 1 },
        { facetId: other.facetId, points: 0, weight: 1 },
      ]
    }

    case 'forcedChoiceRank': {
      if (!Array.isArray(response.value)) return []
      const order = response.value as string[]
      const n = item.statements.length
      return order
        .map((statementId, position) => {
          const statement = item.statements.find((s) => s.id === statementId)
          if (!statement) return null
          const positionFactor = n > 1 ? 1 - position / (n - 1) : 1
          return { facetId: statement.facetId, points: positionFactor * 100, weight: 1 }
        })
        .filter((c): c is Contribution => c !== null)
    }

    case 'ranking': {
      if (!Array.isArray(response.value)) return []
      const order = response.value as string[]
      // Position factor spreads across how many were actually ranked, not
      // the full candidate pool — correct whether this is a plain full
      // ranking or a "pick N of M, then rank those N" item, where
      // order.length (N) is smaller than item.options.length (M).
      const n = order.length
      return order
        .map((optionId, position) => {
          const option = item.options.find((o) => o.id === optionId)
          if (!option) return null
          const positionFactor = n > 1 ? 1 - position / (n - 1) : 1
          return { facetId: option.facetId ?? item.facetId, points: positionFactor * 100, weight: option.weight }
        })
        .filter((c): c is Contribution => c !== null)
    }

    case 'scenario': {
      const value = response.value
      const isScenarioValue = typeof value === 'object' && value !== null && !Array.isArray(value) && 'choiceId' in value
      if (!isScenarioValue) return []
      const choice = item.choices.find((c) => c.id === value.choiceId)
      if (!choice) return []
      // Confidence is stored (see ScenarioResponseValue) but doesn't change
      // the scoring formula here — that's a validity/interpretation
      // question for a later pass, not this item's job to decide.
      return [{ facetId: item.facetId, points: choice.weight, weight: 1 }]
    }

    case 'aspirationalPair': {
      const value = response.value
      const isAspirationalValue = typeof value === 'object' && value !== null && !Array.isArray(value) && 'current' in value
      if (!isAspirationalValue) return []
      // Only the "current" half is an ordinary self-report contribution to
      // this facet — "desired" and the gap are never blended in here, see
      // engine/scoring/aspirationalGaps.ts, which reads the raw response.
      return [{ facetId: item.facetId, points: likertToPoints((value as { current: number }).current, undefined, item.options.length), weight: 1 }]
    }

    case 'evidencePrompt':
    case 'openText':
      return []

    default:
      return []
  }
}
