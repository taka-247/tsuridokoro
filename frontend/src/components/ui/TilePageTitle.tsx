import type { ReactNode } from 'react';

type Props = React.ComponentProps<'p'> & {
  title: string;
  subTitle?: string;
  children?: ReactNode;
  className?: string;
};

export default function TilePageTitle({ title, subTitle, children, className = '', ...props }: Props) {
  return (
    <div className={"flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between" + ' ' + className} {...props}>
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">{title}</h1>
          {
            subTitle && (
              <p className="mt-1 text-sm font-semibold text-aqua">
                {subTitle}
              </p>
            )
          }
        </div>
      </div>

      {children}
    </div>
  );
}