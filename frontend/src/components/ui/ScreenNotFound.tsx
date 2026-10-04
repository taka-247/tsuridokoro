import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

type Props = React.ComponentProps<'p'> & {
  title: string;
  text?: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  navigateTo: string;
  buttonText: string;
  children?: ReactNode;
  className?: string;
};

export default function ScreenNotFound({ title, text, Icon, navigateTo, buttonText, children, className = '', ...props }: Props) {
  const navigate = useNavigate()

  return (
    <div className={"grid min-h-[50vh] place-items-center text-center" + ' ' + className} {...props}>
      <div>
        {
          Icon && (
            <Icon className="mx-auto h-10 w-10 text-faint" aria-hidden />
          )
        }
        <p className="mt-4 text-lg font-bold text-fg">{title}</p>
        {
          text && (
            <p className="mt-2 text-sm text-muted">
              {text}
            </p>
          )
        }
        <Button
          onClick={() => navigate(navigateTo)}
          className="mt-6 rounded-2xl bg-gradient-to-r from-aqua to-tide px-6 py-3 font-bold text-white shadow-card"
        >
          集計する
        </Button>
      </div>
    </div>
  );
}