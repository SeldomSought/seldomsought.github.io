import type { ForcedChoiceItem } from '../../engine/types'
import { ClickRanker } from './ClickRanker'

interface ForcedChoiceItemViewProps {
  item: ForcedChoiceItem
  value: string[] | undefined
  onAnswer: (order: string[]) => void
}

// No `prompt` passed here: every forcedChoiceRank item's prompt text is
// pure "rank these N" mechanic instruction — fully redundant with
// ClickRanker's own rankHint, which explains it once, live, with a
// running count. The real prompt strings still exist on the item data
// (used to build results-report evidence text in describeResponse.ts);
// they're just not worth re-reading on every forced-choice screen.
export function ForcedChoiceItemView({ item, value, onAnswer }: ForcedChoiceItemViewProps) {
  return (
    <ClickRanker
      eyebrow="Forced choice"
      entries={item.statements.map((s) => ({ id: s.id, label: s.label }))}
      value={value}
      onComplete={onAnswer}
    />
  )
}
