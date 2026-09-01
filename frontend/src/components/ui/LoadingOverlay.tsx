/**
 * main 領域を覆うオーバーレイ + 回転ローディングアイコン。
 * 集計処理中に表示し、main 内の要素へのクリックを物理的にブロックする
 * （absolute inset-0 で main を覆う。ヘッダーは覆わない → 位置付き親は main）。
 */
export default function LoadingOverlay({ show }: { show: boolean }) {
  if (!show) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="absolute inset-0 z-50 grid place-items-center bg-ink/70 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <svg
          className="h-12 w-12 animate-spin text-aqua"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-90" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2z" />
        </svg>
        <p className="font-data text-sm font-semibold tracking-wide text-white/90">集計中…</p>
      </div>
    </div>
  )
}
