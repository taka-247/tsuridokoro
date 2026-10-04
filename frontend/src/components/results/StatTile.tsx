/** サイズ表記（例 "40〜60cm"）を数値部と単位に分ける。 */
export function splitSize(value: string): { base: string; unit: string } {
  return value.endsWith('cm') ? { base: value.slice(0, -2), unit: 'cm' } : { base: value, unit: '' }
}

/**
 * 集計サマリの数値タイル。
 * tone="dark" … 濃色ヒーロー上（結果ページ） / tone="light" … 通常背景のカード（履歴ページ）
 */
export default function StatTile({
  label,
  value,
  unit,
  tone = 'dark',
}: {
  label: string
  value: string | number
  unit?: string
  tone?: 'dark' | 'light'
}) {
  const dark = tone === 'dark'
  return (
    <div
      className={
        dark
          ? 'rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3 sm:px-4 sm:py-3.5'
          : 'rounded-2xl border border-line bg-surface px-4 py-3.5 shadow-card sm:px-5 sm:py-4'
      }
    >
      <p
        className={`min-h-8 text-[11px] font-semibold leading-tight sm:min-h-0 sm:text-xs ${
          dark ? 'text-white/50' : 'text-muted'
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-1 whitespace-nowrap font-data text-xl font-black sm:text-2xl ${
          dark ? 'text-white' : 'text-fg'
        }`}
      >
        {value}
        {unit && (
          <span className={`ml-1 text-sm font-bold ${dark ? 'text-white/70' : 'text-muted'}`}>
            {unit}
          </span>
        )}
      </p>
    </div>
  )
}
