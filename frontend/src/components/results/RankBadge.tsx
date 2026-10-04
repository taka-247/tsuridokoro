/** 順位バッジ。1位=signal / 2位=aqua / 3位以降=slate（design準拠）。 */
export default function RankBadge({ rank, size = 'md' }: { rank: number; size?: 'md' | 'lg' }) {
  const color =
    rank === 1
      ? 'bg-gradient-to-br from-signal to-signal-deep'
      : rank === 2
        ? 'bg-gradient-to-br from-aqua to-tide'
        : 'bg-slate-500'
  const dim = size === 'lg' ? 'h-11 w-11 text-lg' : 'h-9 w-9 text-base'
  return (
    <span className={`grid ${dim} shrink-0 place-items-center rounded-xl font-data font-black text-white ${color}`}>
      {rank}
    </span>
  )
}
