type Anchor = React.ComponentProps<'a'>

type Props = React.ComponentProps<'div'> & {
  text: string;
  subText?: string;
  anchor?: Anchor;
};

export default function BoxComment({ text, subText, anchor }: Props) {

  if (anchor) {
    <a {...anchor}>
      <Blockquote text={text} subText={subText} />
    </a>
  }

  return (
    <Blockquote text={text} subText={subText} />
  );
}

type PropsBlockquote = React.ComponentProps<'div'> & {
  text: string;
  subText?: string;
};

function Blockquote({ text, subText }: PropsBlockquote) {
  return (
    <blockquote className="border-l-2 border-aqua pl-4">
      <p className="text-[15px] leading-relaxed text-fg">{text}</p>
      {
        subText && (
          <footer className="mt-1.5 text-xs text-faint">{subText}</footer>
        )
      }
    </blockquote>
  )
}