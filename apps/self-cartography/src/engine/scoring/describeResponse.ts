import type { Item, Response } from '../types'

/**
 * Renders one answered item as a short, human-readable line of what the
 * respondent actually chose — the raw material "supporting responses" are
 * built from, so a contradiction is backed by real evidence a reader can
 * check, not just an assertion. `facetId` says which side of a
 * multi-facet item (a tradeoff between two different facets, a ranking
 * pool) we're describing — for single-facet items it's unused.
 */
export function describeResponse(item: Item, response: Response, facetId: string): string {
  switch (item.format) {
    case 'likert5':
    case 'likertFrequency':
    case 'confidence': {
      const opt = item.options.find((o) => o.value === response.value)
      return opt ? `“${item.prompt}” — ${opt.label}` : item.prompt
    }

    case 'behavioralHistory': {
      if (item.answerMode === 'categorical') {
        const opt = item.options.find((o) => o.id === response.value)
        return opt ? `“${item.prompt}” — ${opt.label}` : item.prompt
      }
      const opt = item.options.find((o) => o.value === response.value)
      return opt ? `“${item.prompt}” — ${opt.label}` : item.prompt
    }

    case 'tradeoff': {
      if (typeof response.value !== 'string') return item.prompt
      const chosen = response.value === 'A' ? item.optionA : item.optionB
      const other = response.value === 'A' ? item.optionB : item.optionA
      if (item.optionA.facetId === item.optionB.facetId) {
        // bipolar: both options are the same facet, so the actual pick is
        // relevant regardless of which "side" of a contradiction it's used for
        return `“${item.prompt}” — chose: “${chosen.label}”`
      }
      if (chosen.facetId === facetId) return `“${item.prompt}” — chose: “${chosen.label}”`
      if (other.facetId === facetId) return `“${item.prompt}” — passed over “${other.label}” in favor of the alternative`
      return item.prompt
    }

    case 'scenario': {
      const value = response.value
      const isScenarioValue = typeof value === 'object' && value !== null && !Array.isArray(value) && 'choiceId' in value
      if (!isScenarioValue) return item.scenario
      const choice = item.choices.find((c) => c.id === (value as { choiceId: string }).choiceId)
      return choice ? `“${item.scenario}” — chose: “${choice.label}”` : item.scenario
    }

    case 'ranking': {
      if (!Array.isArray(response.value)) return item.prompt
      const order = response.value
      const option = item.options.find((o) => (o.facetId ?? item.facetId) === facetId)
      if (!option) return item.prompt
      const pos = order.indexOf(option.id)
      if (pos === -1) return `“${item.prompt}” — not among the ${order.length} preserved`
      return `“${item.prompt}” — ranked #${pos + 1} of ${order.length}`
    }

    case 'forcedChoiceRank': {
      if (!Array.isArray(response.value)) return item.prompt
      const order = response.value
      const statement = item.statements.find((s) => s.facetId === facetId)
      if (!statement) return item.prompt
      const pos = order.indexOf(statement.id)
      if (pos === -1) return item.prompt
      return `“${item.prompt}” — ranked #${pos + 1} of ${order.length}`
    }

    case 'evidencePrompt':
    case 'openText':
      return typeof response.value === 'string' ? `“${response.value}”` : item.prompt

    case 'aspirationalPair': {
      const value = response.value
      const isPair = typeof value === 'object' && value !== null && !Array.isArray(value) && 'current' in value && 'desired' in value
      if (!isPair) return item.prompt
      const { current, desired } = value as { current: number; desired: number }
      return `“${item.prompt}” — now: ${current}/${item.options.length}, desired: ${desired}/${item.options.length}`
    }
  }
}
