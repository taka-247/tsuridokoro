/* ── inline icons (swap for @heroicons/react if you prefer) ── */
export default function FishMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M6 14q6-9 12 0" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <circle cx={12} cy={9} r={2.4} fill="currentColor" />
    </svg>
  )
}