import { ALL_ITEMS } from '../../content/instruments'
import type { Response } from '../../engine/types'

/** A fictional, deterministic respondent for the explicitly labeled example.
 *  Runs through the real scoring engine. Never reads or writes user storage. */
export function createExampleResponses(): Record<string, Response> {
  const preferred: Record<string, number> = {
    riasec_realistic: 32, riasec_investigative: 73, riasec_artistic: 92,
    riasec_social: 57, riasec_enterprising: 84, riasec_conventional: 22,
    autonomy_need: 92, self_direction: 88, desire_freedom_certainty: 88,
    anchor_autonomy: 92, anchor_entrepreneurship: 84, security: 86,
    anchor_security: 80, intellectual_curiosity: 90, aesthetic_openness: 92,
    novelty_seeking: 78, assertiveness: 86, sociability: 68, enthusiasm: 75,
    industriousness: 56, self_discipline: 48, orderliness: 65,
  }
  const target = (id: string) => preferred[id] ?? 25 + [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 61
  const result: Record<string, Response> = {}
  ALL_ITEMS.forEach((item, index) => {
    let value: Response['value']
    switch (item.format) {
      case 'openText': case 'evidencePrompt': return
      case 'likert5': case 'likertFrequency': case 'confidence': {
        let fraction = target(item.facetId) / 100
        if (item.format === 'likert5' && item.reverseScored) fraction = 1 - fraction
        value = item.options[Math.round(fraction * (item.options.length - 1))].value
        break
      }
      case 'behavioralHistory': {
        const option = item.options[Math.round(target(item.facetId) / 100 * (item.options.length - 1))]
        value = 'value' in option ? option.value : option.id
        break
      }
      case 'tradeoff':
        value = item.optionA.facetId === item.optionB.facetId
          ? (Math.abs((item.optionA.poleValue ?? 100) - target(item.optionA.facetId)) <= Math.abs((item.optionB.poleValue ?? 0) - target(item.optionB.facetId)) ? 'A' : 'B')
          : (target(item.optionA.facetId) >= target(item.optionB.facetId) ? 'A' : 'B')
        break
      case 'forcedChoiceRank': value = [...item.statements].sort((a, b) => target(b.facetId) - target(a.facetId)).map((o) => o.id); break
      case 'ranking': {
        const count = item.selectCascade?.at(-1) ?? item.selectCount ?? item.options.length
        value = [...item.options].sort((a, b) => target(b.facetId ?? b.id) - target(a.facetId ?? a.id)).slice(0, count).map((o) => o.id)
        break
      }
      case 'scenario': {
        const choice = [...item.choices].sort((a, b) => Math.abs(a.weight - target(item.facetId)) - Math.abs(b.weight - target(item.facetId)))[0]
        value = { choiceId: choice.id, confidence: 4 }; break
      }
      case 'aspirationalPair': {
        const current = Math.round(target(item.facetId) / 100 * (item.options.length - 1))
        value = { current: item.options[current].value, desired: item.options[Math.min(current + 2, item.options.length - 1)].value }; break
      }
    }
    result[item.id] = { itemId: item.id, value, firstAnsweredAt: 1788220800000 + index * 14000, lastAnsweredAt: 1788220800000 + index * 14000, responseTimeMs: 9000 + index % 7 * 1500, revisitCount: 0 }
  })
  return result
}
