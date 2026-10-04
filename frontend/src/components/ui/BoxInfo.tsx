type Props = React.ComponentProps<'div'> & {
  text: string;
};

export default function BoxInfo({ text }: Props) {
  return (
    <p className="mt-4 rounded-xl bg-foam px-4 py-3 text-sm text-muted">{text}</p>
  );
}