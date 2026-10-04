import { ArrowUpRightIcon } from "@heroicons/react/24/outline";

type Anchor = React.ComponentProps<'a'>

type Props = {
  text: string;
  anchor?: Anchor;
  className?: string;
}

const baseClass = "inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-bold text-fg shadow-card"

export default function LabelItem({ text, anchor, className = '' }: Props) {
  if (anchor) {
    return (
      <a className={baseClass + ' ' + 'transition duration-300 hover:border-aqua hover:text-aqua' + ' ' + className} {...anchor}>
        {text}
        <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden />
      </a>
    )
  }
  return (
    <span
      className={baseClass + ' ' + className}>
      {text}
    </span>
  );
}