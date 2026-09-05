import 'katex/dist/katex.min.css';

import type { ProseMarkdownProps } from './types';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex';

import { cn } from '@/utils/cn';
import { SyntaxHighlighterCode } from './syntax-highlighter-code';
import { LinkParser } from './link-parser';
import { ImageParser } from './image-parser';
import { proseMarkdownBaseStyles } from './prose-markdown.variants';

export function ProseMarkdown({
  children,
  className = '',
}: ProseMarkdownProps) {
  return (
    <Markdown
      className={cn(proseMarkdownBaseStyles, className)}
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
