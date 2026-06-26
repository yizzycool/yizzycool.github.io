import 'katex/dist/katex.min.css'; // Katex

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math'; // Katex
import rehypeRaw from 'rehype-raw'; // Render HTML tag without sanatizing
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex'; // Katex

import { cn } from '@/utils/cn';
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
  'prose-blockquote:px-4',
  'prose-blockquote:rounded-r-xl',
  'prose-blockquote:border',
  'prose-blockquote:border-l-4',
  'prose-blockquote:border-neutral-200/50',
  'dark:prose-blockquote:border-neutral-800/50',
  'prose-blockquote:border-l-indigo-500',
  'dark:prose-blockquote:border-l-indigo-900',
  'prose-blockquote:bg-indigo-50/30',
  'dark:prose-blockquote:bg-indigo-50/10',
  'prose-blockquote:backdrop-blur-md',
  'prose-blockquote:shadow-sm',
  'prose-blockquote:text-neutral-500',
  'dark:prose-blockquote:text-neutral-200',

  // customize headings (h1 ~ h4, th)
  'dark:prose-heading:text-neutral-200',

  // customize <h2>
  'prose-h2:mt-16',
  'prose-h2:font-semibold',

  // customize <h3>
  'prose-h3:mt-12',
  'prose-h3:font-semibold',

  // customize <strong>
  'dark:prose-strong:text-neutral-200',

  // customize <table>
  'prose-table:block',
  'prose-table:overflow-x-auto',
  'prose-th:px-4',
  'prose-th:py-3',
  'prose-th:tracking-wider',
  'prose-th:text-neutral-500',
  'dark:prose-th:text-neutral-400',
  'prose-td:min-w-[200px]',
  'prose-td:px-4',
  'prose-td:py-3',
  'prose-tr:transition-colors',
  'hover:[&_tbody_tr]:bg-neutral-300/10',
  'dark:hover:[&_tbody_tr]:bg-neutral-700/10',

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
      rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeKatex, rehypeSlug]}
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
