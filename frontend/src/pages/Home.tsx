import { useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import type { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Shared } from '@app/shared'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import Select from '../components/ui/Select'
import Segmented from '../components/ui/Segmented'
import { FISH, LOOKBACK_DAYS } from '../data/regions'
import { useRegions } from '../hooks/useRegions'
import myAxios from '../api/myAxios'

type FormData = z.infer<typeof Shared.validation.aggregateSchema>

export default function Home() {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(Shared.validation.aggregateSchema),
    mode: 'onChange',
    defaultValues: { fish: 'ブリ', prefecture: '静岡県', city: '伊東市', lookbackDays: 3 },
  })

  const regions = useRegions()
  const prefecture = watch('prefecture')
  const prefectures = useMemo(() => (regions ? Object.keys(regions) : []), [regions])
  const cities = useMemo(
    () => (regions && prefecture ? regions[prefecture] ?? [] : []),
    [regions, prefecture],
  )

  async function onSubmit(data: FormData) {
    const apiData = await myAxios.post(Shared.api.aggregate.url, data);
    const aggregated = apiData.data
    console.dir('aggregated')
    console.dir(aggregated)
    // TODO: save to SessionStorage → navigate to results
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-abyss to-ink">
      {/* Sonar arcs (decorative) */}
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px]">
        {[420, 300, 190, 100].map((s) => (
          <span
            key={s}
            className="absolute rounded-full border border-aqua/25"
            style={{ width: s, height: s, top: (420 - s) / 2, left: (420 - s) / 2 }}
          />
        ))}
      </div>

      <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-14 lg:p-14">
        {/* ── Hero copy ── */}
        <div>
          <p className="font-data text-xs font-semibold uppercase tracking-[0.18em] text-aqua">
            釣りドコロ · AI釣果集計
          </p>
          <h1 className="mt-4 text-4xl font-black leading-[1.15] text-white sm:text-5xl">
            どこで、何が
            <br />
            <span className="text-aqua">釣れてる</span>？
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/70">
            エリアと魚種を選ぶだけ。AIが最新の釣果を集めて、いま期待できる釣り場をランキングで教えます。
          </p>
          <div className="mt-7 flex max-w-md items-start gap-3 rounded-2xl border border-aqua/25 bg-aqua/10 px-4 py-3.5">
            <InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-aqua" aria-hidden />
            <p className="text-[13px] leading-relaxed text-white/80">
              <span className="font-bold text-white">ANGLERS・X・Instagram・釣具店のブログ</span>
              など、公開の釣果情報をまとめて分析します。
            </p>
          </div>
        </div>

        {/* ── Form card (theme-adaptive) ── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8"
        >
          <h2 className="text-lg font-bold text-fg">条件を選ぶ</h2>
          <p className="mt-1 text-[13px] text-muted">3つ選んで「集計する」を押すだけ。</p>

          <div className="mt-6 space-y-5">
            <Controller
              name="fish"
              control={control}
              render={({ field }) => (
                <Select label="狙う魚種" value={field.value} onChange={field.onChange} options={FISH} />
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="prefecture"
                control={control}
                render={({ field }) => (
                  <Select
                    label="都道府県"
                    value={field.value}
                    onChange={(v) => {
                      field.onChange(v)
                      setValue('city', '', { shouldValidate: true }) // cascade: reset city
                    }}
                    options={prefectures}
                    placeholder={regions ? '選択' : '読み込み中…'}
                    disabled={!regions}
                  />
                )}
              />
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <Select
                    label="市町村"
                    value={field.value}
                    onChange={field.onChange}
                    options={cities}
                    placeholder={prefecture ? '選択' : '先に都道府県'}
                    disabled={!prefecture}
                  />
                )}
              />
            </div>

            <p className="flex items-center gap-1.5 text-xs text-faint">
              <InformationCircleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              市町村は選んだ都道府県に応じて切り替わります
            </p>

            <div>
              <span className="mb-2 block text-sm font-bold text-muted">集計する期間</span>
              <Controller
                name="lookbackDays"
                control={control}
                render={({ field }) => (
                  <Segmented value={field.value} onChange={field.onChange} options={LOOKBACK_DAYS} />
                )}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="mt-7 flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-aqua to-tide text-[17px] font-bold text-white shadow-lg shadow-tide/40 transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <DropIcon className="h-5 w-5" aria-hidden />
            集計する
          </button>
        </form>
      </div>
    </div>
  )
}

function DropIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M10 2C7 6 4 7 4 11a6 6 0 0 0 12 0c0-4-3-5-6-9z" opacity={0.95} />
    </svg>
  )
}
