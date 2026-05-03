import 'katex/dist/katex.min.css'; // Katex

import { cn } from '@/utils/cn';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math'; // Katex
import rehypeRaw from 'rehype-raw'; // Render HTML tag without sanatizing
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex'; // Katex

import SyntaxHighlighterCode from '../syntax-highlighter-code';
import LinkParser from '../link-parser';
import ImageParser from '../image-parser';

const ProseClass = cn(
  // prose - base setup
  'prose',
  'prose-neutral',
  'dark:prose-invert',

  // reset prose's default
  'max-w-none',

  // customize <a>
  'prose-a:text-blue-600',
  'dark:prose-a:text-blue-400',
  'prose-a:no-underline',

  // customize code block
  'prose-pre:p-0',
  'prose-pre:bg-transparent',

  // customize blockquote
  '[&_blockquote_*::before]:content-none',
  '[&_blockquote_*::after]:content-none',
  '[&_blockquote_*:not(i)]:not-italic',
  '[&_blockquote_*:not(strong)]:font-normal',

  // customize h3
  'prose-h2:mt-16',
  'prose-h3:mt-12',

  'leading-loose'
);

type Props = {
  children?: string;
  className?: string;
};

export default function ProseMarkdown({ children, className = '' }: Props) {
  return (
    <Markdown
      className={cn(ProseClass, className)}
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
