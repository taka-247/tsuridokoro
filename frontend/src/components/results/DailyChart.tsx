type Daily = { date: string; count: number }

function fmtDate(iso: string): string {
  const m = iso.match(/^\d{4}-(\d{2})-(\d{2})$/)
  if (!m) return iso
  return `${Number(m[1])}/${Number(m[2])}`
}

/** 日別の釣果数の棒グラフ（design: aqua→tide のグラデ縦棒、上に値・下に日付）。 */
export default function DailyChart({ data }: { data: Daily[] }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <div>
      <div className="flex h-40 items-end justify-around gap-3 border-b border-line">
        {data.map((d) => (
          <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end">
            <span className="mb-1.5 font-data text-sm font-bold text-fg">{d.count}</span>
            <div
              className="w-8 rounded-t-md bg-gradient-to-b from-aqua to-tide sm:w-10"
              style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? 4 : 0 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-around gap-3">
        {data.map((d) => (
          <span key={d.date} className="flex-1 text-center font-data text-xs text-faint">
            {fmtDate(d.date)}
          </span>
        ))}
      </div>
    </div>
  )
}
