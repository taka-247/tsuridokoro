import type { AggregateResult } from '@app/shared'
import RankBadge from './RankBadge'
import ExpectationMeter from './ExpectationMeter'
import DailyChart from './DailyChart'
import MapEmbed from './MapEmbed'
import BoxInfo from '../ui/BoxInfo'
import LabelItem from '../ui/LabelItem'
import BoxComment from '../ui/BoxComment'

type Spot = AggregateResult['spots'][number]
type Meta = AggregateResult['meta']

function fmtJpDate(iso: string): string {
  const m = iso.match(/^\d{4}-(\d{2})-(\d{2})$/)
  return m ? `${Number(m[1])}月${Number(m[2])}日` : iso
}

function FishIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M2 12c3-5 8-6 12-6 3 0 5 1 6 2l2-2v12l-2-2c-1 1-3 2-6 2-4 0-9-1-12-6zm14-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
    </svg>
  )
}

/** 選択中カード（詳細が展開されたカード）。 */
export default function SpotCardLarge({ spot, meta }: { spot: Spot; meta: Meta }) {
  return (
    <article className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
      {/* header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <RankBadge rank={spot.rank} size="lg" />
          <div>
            <h3 className="text-2xl font-black text-fg">{spot.name}</h3>
            <p className="mt-0.5 text-sm text-muted">{spot.location.query || `${meta.prefecture}${meta.city}`}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="mb-1 text-xs font-semibold text-faint">期待度</p>
          <ExpectationMeter level={spot.expectation} label={spot.expectationLabel} />
        </div>
      </header>

      {/* two columns */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">

        {/* left: daily chart + size */}
        <div>
          {/* highlight banner */}
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-signal/10 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface">
                <FishIcon className="h-5 w-5 text-signal" aria-hidden />
              </span>
              <p className="text-[15px] font-bold text-fg">
                過去{meta.lookbackDays}日間で釣れた「{meta.targetFish}」
              </p>
            </div>
            <p className="shrink-0 font-data text-3xl font-black text-signal">
              {spot.totalCatchCount}
              <span className="ml-1 text-base">匹</span>
            </p>
          </div>

          <div className="flex items-baseline justify-between mt-6">
            <h4 className="text-sm font-bold text-muted">日別の釣果数</h4>
            <span className="text-xs text-faint">この期間 {spot.totalCatchCount}匹</span>
          </div>
          <div className="mt-4">
            <DailyChart data={spot.dailyCatchCounts} />
          </div>
          {(spot.size || spot.maxSize) && (
            <BoxInfo text={`↔ 釣れているサイズ：${spot.size}${spot.maxSize && ` 最大 ${spot.maxSize}`}`} className='mt-7' />
          )}

        </div>

        {/* right: map + sources */}
        <div className="flex flex-col gap-5">
          <MapEmbed location={spot.location} name={spot.name} />
          {spot.sources.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-bold text-muted">出典</h4>
              <div className="flex flex-wrap gap-2">
                {spot.sources.map((s, i) => (
                  <LabelItem key={i} text={s.title} anchor={{
                    href: s.url,
                    target: "_blank",
                  }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* notes */}
      {spot.notes.length > 0 && (
        <div className="mt-6 border-t border-line pt-6">
          <h4 className="text-sm font-bold text-muted">特記事項・気になるコメント</h4>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {spot.notes.map((n, i) => (

              <BoxComment key={`comment-${i}`} text={`「${n.text}」`} subText={`— ${n.source}${n.date && ` / ${fmtJpDate(n.date)}`}`} className='mt-7' anchor={{
                href: n.url,
                target: '_blank',
              }} />
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
