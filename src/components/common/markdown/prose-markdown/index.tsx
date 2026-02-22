import 'katex/dist/katex.min.css'; // Katex

import clsx from 'clsx';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math'; // Katex
import rehypeRaw from 'rehype-raw'; // Render HTML tag without sanatizing
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex'; // Katex

import SyntaxHighlighterCode from '../syntax-highlighter-code';
import LinkParser from '../link-parser';
import ImageParser from '../image-parser';

const ProseClass = clsx(
  // prose - base setup
  'prose',
  'prose-neutral',
  'dark:prose-invert',

  // reset prose's default
  'max-w-none',

  // customize <a>
  'prose-a:text-blue-500',
  'dark:prose-a:text-sky-600',
  'hover:prose-a:no-underline',

  // code block
  'prose-pre:p-0',
  'prose-pre:bg-transparent',

  // blockquote
  '[&_blockquote>p:first-of-type::before]:content-none',
  '[&_blockquote>p:first-of-type::after]:content-none',
  '[&_blockquote>p:first-of-type]:not-italic',
  '[&_blockquote>p:first-of-type]:font-normal',

  'leading-loose'
);

type Props = {
  children?: string;
  className?: string;
};

export default function ProseMarkdown({ children, className = '' }: Props) {
  return (
    <Markdown
      className={clsx(ProseClass, className)}
      remarkPlugins={[remarkMath, [remarkGfm, { singleTilde: false }]]}
      rehypePlugins={[rehypeKatex, rehypeRaw, rehypeSlug]}
      components={{
        code: SyntaxHighlighterCode,
        a: LinkParser,
        img: ImageParser,
      }}
    >
      {children}
    </Markdown>
  );
}
