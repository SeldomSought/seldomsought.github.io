import type { RankingItem } from '../../engine/types'
import { ClickRanker } from './ClickRanker'
import { SelectAndRankItemView } from './SelectAndRankItemView'
import { CascadeChoiceItemView } from './CascadeChoiceItemView'

interface RankingItemViewProps {
  item: RankingItem
  value: string[] | undefined
  onAnswer: (order: string[]) => void
}

export function RankingItemView({ item, value, onAnswer }: RankingItemViewProps) {
  if (item.selectCascade && item.selectCascade.length > 0) {
    return <CascadeChoiceItemView item={item} value={value} onAnswer={onAnswer} />
  }

  if (item.selectCount && item.selectCount < item.options.length) {
    return <SelectAndRankItemView item={item} value={value} onAnswer={onAnswer} />
  }

  // No `prompt` passed here: every plain ranking item's prompt text is
  // pure "rank these N" mechanic instruction — fully redundant with
  // ClickRanker's own rankHint, which explains it once, live, with a
  // running count. The real prompt strings still exist on the item data
  // (used to build results-report evidence text in describeResponse.ts);
  // they're just not worth re-reading on every ranking screen.
  return (
    <ClickRanker
      eyebrow="Ranking"
      entries={item.options.map((o) => ({ id: o.id, label: o.label }))}
      value={value}
      onComplete={onAnswer}
    />
  )
}
