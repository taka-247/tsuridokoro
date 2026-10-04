type Props = React.ComponentProps<'div'> & {
  title: string;
  text?: string;
  className?: string;
};

export default function TitleSection({ title, text, className = '', ...props }: Props) {
  return (
    <div className={"flex items-baseline justify-between" + ' ' + className} {...props}>
      <h2 className="text-xl font-black text-fg">{title}</h2>

      {
        text && (
          <span className="font-data text-xs font-semibold tracking-widest text-faint">{text}</span>
        )
      }
    </div>
  );
}