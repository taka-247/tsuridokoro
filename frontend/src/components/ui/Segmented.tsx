type Props = {
  value: number
  onChange: (value: number) => void
  options: readonly number[]
  unit?: string
}

/** Segmented control (e.g. lookback period 1/3/5/7). Active = deep-sea fill; adapts to theme. */
export default function Segmented({ value, onChange, options, unit = '日' }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {options.map((opt) => {
        const active = opt === value
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={active}
            className={[
              'flex h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl border transition',
              active
                ? 'border-ink bg-gradient-to-b from-tide to-ink text-white'
                : 'border-line-strong bg-surface text-fg hover:border-aqua/50',
            ].join(' ')}
          >
            <span className="font-data text-xl font-bold leading-none">{opt}</span>
            <span className={`text-[10px] ${active ? 'text-white/70' : 'text-faint'}`}>{unit}</span>
          </button>
        )
      })}
    </div>
  )
}
