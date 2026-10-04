import type { AggregateResult } from '@app/shared'
import RankBadge from './RankBadge'
import ExpectationMeter from './ExpectationMeter'

type Spot = AggregateResult['spots'][number]

/**
 * 未選択の釣り場カード（順位・名前・期待度メーター・釣果数）。
 * クリックすると選択され、上部の詳細カード（SpotCardLarge）に切り替わる。
 */
export default function SpotCardCompact({ spot, onSelect }: { spot: Spot; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${spot.name}の詳細を表示`}
      className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-aqua hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua active:translate-y-0"
    >
      <div className="flex items-center gap-3">
        <RankBadge rank={spot.rank} />
        <h3 className="text-lg font-black text-fg">{spot.name}</h3>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="mb-1 text-xs font-semibold text-faint">期待度</p>
          <ExpectationMeter level={spot.expectation} label={spot.expectationLabel} />
        </div>
        <p className="shrink-0 font-data text-xl font-black text-signal">
          {spot.totalCatchCount}
          <span className="ml-0.5 text-sm">匹</span>
        </p>
      </div>
    </button>
  )
}
