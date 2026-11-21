import type { ReactNode } from "react";

type Props = React.ComponentProps<'div'> & {
  text: ReactNode;
  Icon?: React.ComponentType<React.ComponentProps<'svg'>>;
};

export default function BoxInfo({ text, Icon, className = '', ...props }: Props) {
  return (
    <div className={"mt-4 flex items-start gap-2.5 rounded-xl bg-foam px-4 py-3 text-muted" + ' ' + className} {...props}>
      {Icon && <Icon className="h-5 w-5 shrink-0" aria-hidden />}
      <p className="text-sm">{text}</p>
    </div>
  );
}
