import type { Instrument, Item } from '../../engine/types'
import { ORIENTATION_INSTRUMENT, ORIENTATION_ITEMS } from './orientation.items'
import { DESIRE_INSTRUMENT, DESIRE_ITEMS } from './desire.items'
import { VALUES_INSTRUMENT, VALUES_ITEMS } from './values.items'
import { INTERESTS_INSTRUMENT, INTERESTS_ITEMS } from './interests.items'
import { STRENGTHS_INSTRUMENT, STRENGTHS_ITEMS } from './strengths.items'
import { WORK_INSTRUMENT, WORK_ITEMS } from './work.items'
import { CAREER_ANCHORS_INSTRUMENT, CAREER_ANCHORS_ITEMS } from './careerAnchors.items'
import { RISK_UNCERTAINTY_INSTRUMENT, RISK_UNCERTAINTY_ITEMS } from './riskUncertainty.items'
import { FUTURE_SELF_INSTRUMENT, FUTURE_SELF_ITEMS } from './futureSelf.items'
import { ASPIRATION_INSTRUMENT, ASPIRATION_ITEMS } from './aspiration.items'
import {
  TEMPERAMENT_INSTRUMENT,
  AUTONOMY_INSTRUMENT,
  STRUCTURE_INSTRUMENT,
  RISK_INSTRUMENT,
  AMBIGUITY_INSTRUMENT,
  TEMPERAMENT_ITEMS,
} from './temperament.items'

export const INSTRUMENTS: Instrument[] = [
  ORIENTATION_INSTRUMENT,
  DESIRE_INSTRUMENT,
  VALUES_INSTRUMENT,
  INTERESTS_INSTRUMENT,
  TEMPERAMENT_INSTRUMENT,
  AUTONOMY_INSTRUMENT,
  STRUCTURE_INSTRUMENT,
  RISK_INSTRUMENT,
  AMBIGUITY_INSTRUMENT,
  STRENGTHS_INSTRUMENT,
  WORK_INSTRUMENT,
  CAREER_ANCHORS_INSTRUMENT,
  RISK_UNCERTAINTY_INSTRUMENT,
  FUTURE_SELF_INSTRUMENT,
  ASPIRATION_INSTRUMENT,
]

export const ALL_ITEMS: Item[] = [...ORIENTATION_ITEMS, ...DESIRE_ITEMS, ...VALUES_ITEMS, ...INTERESTS_ITEMS, ...TEMPERAMENT_ITEMS, ...STRENGTHS_ITEMS, ...WORK_ITEMS, ...CAREER_ANCHORS_ITEMS, ...RISK_UNCERTAINTY_ITEMS, ...FUTURE_SELF_ITEMS, ...ASPIRATION_ITEMS]

export const ITEMS_BY_ID: Record<string, Item> = Object.fromEntries(
  ALL_ITEMS.map((i) => [i.id, i]),
)

export const ITEMS_BY_REGION: Record<string, Item[]> = ALL_ITEMS.reduce(
  (acc, item) => {
    const instrument = INSTRUMENTS.find((i) => i.id === item.instrumentId)
    if (!instrument) return acc
    ;(acc[instrument.regionId] ??= []).push(item)
    return acc
  },
  {} as Record<string, Item[]>,
)
