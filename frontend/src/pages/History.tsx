import { useMemo, useState } from 'react'
import type { AggregateResult } from '@app/shared'
import {
  CalendarDaysIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import SpotCardLarge from '../components/results/SpotCardLarge'
import StatTile, { splitSize } from '../components/results/StatTile'
import { loadResults } from '../storage/results'
import TilePageTitle from '../components/ui/TilePageTitle'
import ScreenNotFound from '../components/ui/ScreenNotFound'

/** 集計の見出し（例 "ブリ・伊東市・過去3日"）。 */
function entryLabel(meta: AggregateResult['meta']): string {
  return `${meta.targetFish}・${meta.city}・過去${meta.lookbackDays}日`
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** "2026-08-01 12:34" 形式。 */
function fmtFull(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** "08-01 12:34" 形式（モバイルの一覧用）。 */
function fmtShort(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function History() {
  const results = useMemo(() => loadResults(), [])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [pickerOpen, setPickerOpen] = useState(false)

  const selected = results[selectedIndex]

  if (!selected) {
    return (
      <ScreenNotFound title='履歴はまだありません' text='トップで条件を選んで集計すると、ここに履歴が残ります。' Icon={ClockIcon} navigateTo='/' buttonText="集計する" />
    )
  }

  const { meta, spots } = selected
  const top = spots[0]
  const size = splitSize(meta.sizeRange)

  function pick(index: number) {
    setSelectedIndex(index)
    setPickerOpen(false)
  }

  return (
    <div className="space-y-6 pb-4">
      {/* ── ヒーロー：ページ見出し ── */}
      <section className="rounded-3xl bg-gradient-to-br from-ink via-abyss to-ink p-5 text-white sm:p-8">
        <TilePageTitle title='集計結果' subTitle='過去の集計を見返す' />
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        {/* ── 集計ピッカー（モバイル：開閉式） ── */}
        <div className="space-y-3 lg:hidden">
          <p className="text-sm font-semibold text-muted">見たい集計を選ぶ</p>

          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            aria-expanded={pickerOpen}
            className="flex w-full items-center gap-3.5 rounded-2xl border-2 border-aqua bg-surface px-4 py-3.5 text-left shadow-card"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-aqua/10">
              <CalendarDaysIcon className="h-5 w-5 text-aqua" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[17px] font-black text-fg">
                {entryLabel(meta)}
              </span>
              <span className="mt-0.5 block font-data text-xs font-semibold text-faint">
                {fmtFull(meta.aggregatedAt)}
              </span>
            </span>
            <ChevronDownIcon
              className={`h-5 w-5 shrink-0 text-muted transition-transform ${pickerOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>

          {pickerOpen && (
            <ul className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
              {results.map((r, i) => {
                const active = i === selectedIndex
                return (
                  <li key={`${r.meta.aggregatedAt}-${i}`} className="border-b border-line last:border-b-0">
                    <button
                      type="button"
                      onClick={() => pick(i)}
                      aria-current={active}
                      className={`flex w-full items-center gap-3 px-4 py-4 text-left transition ${active ? 'bg-aqua/10' : 'hover:bg-foam'
                        }`}
                    >
                      <span
                        className={`shrink-0 font-data text-xs font-semibold ${active ? 'text-aqua/70' : 'text-faint'}`}
                      >
                        {fmtShort(r.meta.aggregatedAt)}
                      </span>
                      <span
                        className={`truncate font-black ${active ? 'text-aqua' : 'text-fg'}`}
                      >
                        {entryLabel(r.meta)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* ── 集計ピッカー（デスクトップ：常時展開） ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-3xl border border-line bg-surface p-5 shadow-card">
            <h2 className="px-1 text-sm font-bold text-muted">見たい集計を選ぶ</h2>
            <ul className="mt-4 space-y-1">
              {results.map((r, i) => {
                const active = i === selectedIndex
                return (
                  <li key={`${r.meta.aggregatedAt}-${i}`}>
                    <button
                      type="button"
                      onClick={() => pick(i)}
                      aria-current={active}
                      className={`w-full rounded-2xl border px-4 py-3.5 text-left transition ${active
                        ? 'border-aqua/40 bg-aqua/10'
                        : 'border-transparent hover:bg-foam'
                        }`}
                    >
                      <span
                        className={`block font-data text-xs font-semibold ${active ? 'text-aqua/70' : 'text-faint'}`}
                      >
                        {fmtFull(r.meta.aggregatedAt)}
                      </span>
                      <span
                        className={`mt-1 block font-black ${active ? 'text-aqua' : 'text-fg'}`}
                      >
                        {entryLabel(r.meta)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>

        {/* ── 選択中の集計結果（結果ページと同じ UI を再利用） ── */}
        <div className="space-y-5">
          <p className="hidden items-center gap-2 text-sm text-faint lg:flex">
            <CheckIcon className="h-4 w-4 shrink-0" aria-hidden />
            選択中の集計結果 — トップページと同じ結果UIを表示します
          </p>
          <div className="flex items-baseline justify-between lg:hidden">
            <h2 className="text-xl font-black text-fg">選択中の集計結果</h2>
            <span className="text-xs text-faint">同じ結果UIを再表示</span>
          </div>

          <div className="hidden grid-cols-3 gap-4 lg:grid">
            <StatTile
              tone="light"
              label={`${meta.targetFish}の釣果`}
              value={meta.totalCatchCount}
              unit="匹"
            />
            <StatTile tone="light" label="釣り場" value={meta.spotCount} unit="ヶ所" />
            <StatTile tone="light" label="サイズ" value={size.base} unit={size.unit} />
          </div>

          {top && <SpotCardLarge spot={top} meta={meta} />}
        </div>
      </div>
    </div>
  )
}
