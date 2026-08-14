import { useState } from 'react'
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'

type Props = {
  label?: string
  value: string | null
  onChange: (value: string) => void
  options: readonly string[]
  placeholder?: string
  disabled?: boolean
}

/** Themed searchable single-select built on Headless UI Combobox. Adapts to light/dark via tokens. */
export default function Select({
  label,
  value,
  onChange,
  options,
  placeholder = '選択してください',
  disabled = false,
}: Props) {
  const [query, setQuery] = useState('')

  const filteredOptions =
    query === ''
      ? options
      : options.filter((opt) =>
          opt.toLowerCase().startsWith(query.toLowerCase())
        )

  return (
    <div>
      {label && <span className="mb-2 block text-sm font-bold text-muted">{label}</span>}
      <Combobox
        value={value ?? null}
        onChange={(val) => {
          if (val != null) onChange(val)
        }}
        onClose={() => setQuery('')}
        disabled={disabled}
      >
        <div className="relative">
          <ComboboxInput
            aria-label={label}
            className="flex h-[52px] w-full items-center justify-between rounded-xl border border-line-strong bg-surface px-4 text-left text-[15px] font-medium text-fg transition focus:border-aqua focus:outline-none focus:ring-4 focus:ring-aqua/15 data-[open]:border-aqua data-[open]:ring-4 data-[open]:ring-aqua/15 disabled:cursor-not-allowed disabled:opacity-50"
            displayValue={(val: string | null) => val ?? ''}
            placeholder={placeholder}
            onChange={(event) => setQuery(event.target.value)}
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-4">
            <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          </ComboboxButton>
        </div>

        <ComboboxOptions
          anchor="bottom start"
          transition
          className="z-50 max-h-72 w-[var(--input-width)] overflow-auto rounded-xl border border-line bg-surface p-1 shadow-card [--anchor-gap:8px] focus:outline-none data-[closed]:opacity-0 transition duration-100 ease-out empty:invisible"
        >
          {filteredOptions.map((opt) => (
            <ComboboxOption
              key={opt}
              value={opt}
              className="flex cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2.5 text-[15px] text-fg data-[focus]:bg-foam"
            >
              {({ selected }) => (
                <>
                  <span className={selected ? 'font-bold text-aqua-deep' : ''}>{opt}</span>
                  {selected && <CheckIcon className="h-4 w-4 text-aqua-deep" aria-hidden />}
                </>
              )}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  )
}