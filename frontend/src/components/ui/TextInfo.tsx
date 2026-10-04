import { InformationCircleIcon } from '@heroicons/react/24/outline'

type Props = React.ComponentProps<'p'> & {
  children: string;
  className?: string;
};

export default function TextInfo({ children = '', className = '', ...props }: Props) {
  return (
    <p className={"flex items-center gap-1.5 text-xs text-faint" + ' ' + className} {...props}>
      <InformationCircleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {children}
    </p>
  );
}