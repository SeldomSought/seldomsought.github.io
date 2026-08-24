import type { Item, Response } from './types'
import { REGIONS } from '../content/regions'
import { ITEMS_BY_REGION } from '../content/instruments'

export function getRegionItems(regionId: string): Item[] {
  return ITEMS_BY_REGION[regionId] ?? []
}

function isOptional(item: Item): boolean {
  return item.format === 'openText' || item.format === 'evidencePrompt'
}

export function isItemAnswered(item: Item, responses: Record<string, Response>): boolean {
  return Boolean(responses[item.id])
}

export function isRegionComplete(regionId: string, responses: Record<string, Response>): boolean {
  const items = getRegionItems(regionId)
  return items.every((item) => isOptional(item) || isItemAnswered(item, responses))
}

export function regionProgress(regionId: string, responses: Record<string, Response>): { answered: number; total: number } {
  const items = getRegionItems(regionId)
  const required = items.filter((item) => !isOptional(item))
  const answered = required.filter((item) => isItemAnswered(item, responses)).length
  return { answered, total: required.length }
}

const IMPLEMENTED_REGIONS = REGIONS.filter((r) => r.implemented && r.id !== 'synthesis').sort((a, b) => a.order - b.order)

export function getNextRegionId(currentRegionId: string): string | null {
  const idx = IMPLEMENTED_REGIONS.findIndex((r) => r.id === currentRegionId)
  if (idx === -1 || idx === IMPLEMENTED_REGIONS.length - 1) return null
  return IMPLEMENTED_REGIONS[idx + 1].id
}

export function canEnterSynthesis(responses: Record<string, Response>): boolean {
  return IMPLEMENTED_REGIONS.every((r) => isRegionComplete(r.id, responses))
}

/** Overall progress across every implemented, answerable region (not counting Synthesis). */
export function overallProgress(responses: Record<string, Response>): { answered: number; total: number } {
  return IMPLEMENTED_REGIONS.reduce(
    (acc, r) => {
      const p = regionProgress(r.id, responses)
      return { answered: acc.answered + p.answered, total: acc.total + p.total }
    },
    { answered: 0, total: 0 },
  )
}
