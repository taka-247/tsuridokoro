import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SpotCardLarge from '../components/results/SpotCardLarge'
import SpotCardCompact from '../components/results/SpotCardCompact'
import StatTile, { splitSize } from '../components/results/StatTile'
import { loadResultAt } from '../storage/results'
import TilePageTitle from '../components/ui/TilePageTitle'
import ScreenNotFound from '../components/ui/ScreenNotFound'
import LabelItem from '../components/ui/LabelItem'
import TitleSection from '../components/ui/TitleSection'

export default function Results() {
  const [searchParams] = useSearchParams()
  // 履歴から開いた場合は ?i=<index>。既定は最新（0番目）。
  const index = Number(searchParams.get('i') ?? 0)
  const result = useMemo(() => loadResultAt(Number.isInteger(index) && index >= 0 ? index : 0), [index])
  // 選択中の釣り場（タブ的に切り替える）。既定は1位。
  const [selectedRank, setSelectedRank] = useState<number | null>(null)

  if (!result) {
    return (
      <ScreenNotFound title='まだ集計結果がありません' text='トップで条件を選んで集計してください。' navigateTo='/' buttonText="集計する" />
    )
  }

  const { meta, spots, otherSpots } = result
  const selected = spots.find((s) => s.rank === selectedRank) ?? spots[0]
  const rest = spots.filter((s) => s.rank !== selected?.rank)
  const size = splitSize(meta.sizeRange)

  return (
    <div className="space-y-8 pb-4">
      {/* ── Hero: 集計結果サマリ ── */}
      <section className="rounded-3xl bg-gradient-to-br from-ink via-abyss to-ink p-5 text-white sm:p-8">
        <TilePageTitle title='集計結果' subTitle={`${meta.targetFish}・${meta.city}・過去${meta.lookbackDays}日`}>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:min-w-[520px]">
            <StatTile label={`${meta.targetFish}の釣果`} value={meta.totalCatchCount} unit="匹" />
            <StatTile label="釣り場" value={meta.spotCount} unit="ヶ所" />
            <StatTile label="サイズ" value={size.base} unit={size.unit} />
          </div>
        </TilePageTitle>
      </section>

      {/* ── オススメ上位5ヶ所 ── */}
      <section>
        <TitleSection title='期待できる釣り場' text='TOP 5' />
        <div className="mt-5 space-y-4">
          {selected && <SpotCardLarge key={selected.rank} spot={selected} meta={meta} />}
          {rest.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-2">
              {rest.map((s) => (
                <SpotCardCompact key={s.rank} spot={s} onSelect={() => setSelectedRank(s.rank)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 可能性のある釣り場（名前のみ） ── */}
      {otherSpots.length > 0 && (
        <section>
          <TitleSection title='可能性のある釣り場' text='NAMES ONLY' />
          <div className="mt-4 flex flex-wrap gap-3">
            {otherSpots.map((name, i) => (
              <div key={i}>
                <LabelItem text={name} />
              </div>
            ))}
          </div>
          {meta.dataConfidence === 'low' && (
            <p className="mt-4 text-xs text-faint">
              釣果は少なめですが、可能性のある釣り場。名前のみ表示しています。
            </p>
          )}
        </section>
      )}
    </div>
  )
}
