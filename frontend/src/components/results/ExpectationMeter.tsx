export type Tier = 'high' | 'mid' | 'low'

/** expectationLabel（期待大/中/小）優先、無ければ数値からティアを決める。 */
export function tierOf(label: string, level: number): Tier {
  if (label.includes('大')) return 'high'
  if (label.includes('小')) return 'low'
  if (label.includes('中')) return 'mid'
  return level >= 4 ? 'high' : level === 3 ? 'mid' : 'low'
}

export const tierText: Record<Tier, string> = {
  high: 'text-signal',
  mid: 'text-aqua',
  low: 'text-faint',
}
const tierFill: Record<Tier, string> = {
  high: 'bg-signal',
  mid: 'bg-aqua',
  low: 'bg-aqua/40',
}

const BAR_HEIGHTS = [7, 10, 13, 16, 19] // 信号強度風に右肩上がり

/** 信号強度メーター（星評価に見えないよう、棒＋言葉ラベルで期待度を表現） */
export default function ExpectationMeter({ level, label }: { level: number; label: string }) {
  const tier = tierOf(label, level)
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-end gap-[3px]" aria-hidden>
        {BAR_HEIGHTS.map((h, i) => (
          <span
            key={i}
            className={`w-[5px] rounded-sm ${i < level ? tierFill[tier] : 'bg-line-strong'}`}
            style={{ height: h }}
          />
        ))}
      </div>
      <span className={`text-sm font-bold ${tierText[tier]}`}>{label}</span>
    </div>
  )
}
