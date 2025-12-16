import clsx from 'clsx';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import SyntaxHighlighterCode from '../syntax-highlighter-code';

const ProseClass = clsx(
  // prose - base setup
  'prose',
  'prose-neutral',
  'dark:prose-invert',

  // reset prose's default
  'max-w-none',

  // customize <a>
  'prose-a:text-blue-500',
  'dark:prose-a:text-sky-700',

  // code block
  'prose-pre:p-0',
  'prose-pre:bg-transparent'
);

type Props = {
  children?: string;
  className?: string;
};

export default function ProseMarkdown({ children, className = '' }: Props) {
  return (
    <Markdown
      className={clsx(ProseClass, className)}
      remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
      rehypePlugins={[rehypeRaw, rehypeSlug]}
      components={{
        code: SyntaxHighlighterCode,
      }}
    >
      {children}
    </Markdown>
  );
}
