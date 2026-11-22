'use client';

import 'katex/dist/katex.min.css';

import type { Components, ExtraProps } from 'react-markdown';
import type { ReactNode } from 'react';

import { Children, cloneElement, isValidElement, useMemo } from 'react';
import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { LinkParser } from '@/components/shared/markdown/link-parser';
import { proseMarkdownBaseStyles } from '@/components/shared/markdown/prose-markdown.variants';
import { SyntaxHighlighterCode } from '@/components/shared/markdown/syntax-highlighter-code';
import { cn } from '@/utils/cn';

import ClozeSpoilerChip from './cloze-spoiler-chip';
import { createHeadingSlugger } from './utils/markdown-helpers';
import WikiLinkChip from './wiki-link-chip';

const INLINE_TOKEN_SPLIT_REGEX = /(\|\|[^|\n]+\|\||\[\[[^\]\n]+\]\])/g;

function buildHeadingSlugByLine(markdown: string): Map<number, string> {
  const map = new Map<number, string>();
  const lines = markdown.split(/\r?\n/);
  const nextSlug = createHeadingSlugger();
  let inCodeBlock = false;

  lines.forEach((line, idx) => {
    if (/^\s*(?:```|~~~)/.test(line)) {
      inCodeBlock = !inCodeBlock;
      return;
    }
    if (inCodeBlock) return;

    const match = /^(#{1,3})\s+(.+?)\s*#*$/.exec(line);
    if (!match) return;

    map.set(idx + 1, nextSlug(match[2]));
  });

  return map;
}

function transformInlineNodes(
  children: ReactNode,
  revealAll: boolean,
  existingNoteTitles?: Set<string>,
  onNavigateWikiLink?: (title: string) => void
): ReactNode {
  return Children.map(children, (child, index) => {
    if (typeof child === 'string') {
      if (!child.includes('||') && !child.includes('[[')) {
        return child;
      }
      const parts = child.split(INLINE_TOKEN_SPLIT_REGEX);
      if (parts.length <= 1) {
        return child;
      }
      return parts.map((part, partIndex) => {
        if (part.startsWith('||') && part.endsWith('||') && part.length > 4) {
          return (
            <ClozeSpoilerChip
              key={`spoiler-${index}-${partIndex}`}
              text={part.slice(2, -2)}
              revealAll={revealAll}
            />
          );
        }

        if (part.startsWith('[[') && part.endsWith(']]') && part.length > 4) {
          const inner = part.slice(2, -2);
          const pipeIdx = inner.indexOf('|');
          const targetTitle = (
            pipeIdx >= 0 ? inner.slice(0, pipeIdx) : inner
          ).trim();
          const displayText =
            (pipeIdx >= 0 ? inner.slice(pipeIdx + 1) : inner).trim() ||
            targetTitle;

          if (!targetTitle) {
            return part;
          }

          return (
            <WikiLinkChip
              key={`wiki-${index}-${partIndex}`}
              targetTitle={targetTitle}
              displayText={displayText}
              exists={Boolean(
                existingNoteTitles?.has(targetTitle.toLowerCase())
              )}
              onNavigate={onNavigateWikiLink}
            />
          );
        }

        return part;
      });
    }

    if (isValidElement<{ children?: ReactNode }>(child)) {
      if (child.props.children === undefined) {
        return child;
      }
      return cloneElement(
        child,
        undefined,
        transformInlineNodes(
          child.props.children,
          revealAll,
          existingNoteTitles,
          onNavigateWikiLink
        )
      );
    }

    return child;
  });
}

type Props = {
  content: string;
  compact?: boolean;
  revealAllSpoilers?: boolean;
  onToggleCheckbox?: (lineNumber: number) => void;
  existingNoteTitles?: Set<string>;
  onNavigateWikiLink?: (title: string) => void;
  headingIdPrefix?: string;
  className?: string;
};

export default function NoteMarkdownView({
  content,
  compact = false,
  revealAllSpoilers = false,
  onToggleCheckbox,
  existingNoteTitles,
  onNavigateWikiLink,
  headingIdPrefix,
  className,
}: Props) {
  const headingSlugByLine = useMemo(
    () => (headingIdPrefix ? buildHeadingSlugByLine(content) : new Map()),
    [content, headingIdPrefix]
  );

  const components: Components = useMemo(() => {
    const getHeadingId = (line?: number) => {
      if (!headingIdPrefix || !line) return undefined;
      const slug = headingSlugByLine.get(line);
      return slug ? `${headingIdPrefix}${slug}` : undefined;
    };

    const renderInline = (children: ReactNode) =>
      transformInlineNodes(
        children,
        revealAllSpoilers,
        existingNoteTitles,
        onNavigateWikiLink
      );

    return {
      code: SyntaxHighlighterCode,
      a: LinkParser,
      h1: ({ children, node, className: headingClass, ...rest }) => (
        <h1
          id={getHeadingId(node?.position?.start?.line)}
          className={cn('scroll-mt-4', headingClass)}
          {...rest}
        >
          {renderInline(children)}
        </h1>
      ),
      h2: ({ children, node, className: headingClass, ...rest }) => (
        <h2
          id={getHeadingId(node?.position?.start?.line)}
          className={cn('scroll-mt-4', headingClass)}
          {...rest}
        >
          {renderInline(children)}
        </h2>
      ),
      h3: ({ children, node, className: headingClass, ...rest }) => (
        <h3
          id={getHeadingId(node?.position?.start?.line)}
          className={cn('scroll-mt-4', headingClass)}
          {...rest}
        >
          {renderInline(children)}
        </h3>
      ),
      p: ({ children, node: _node, ...rest }) => (
        <p {...rest}>{renderInline(children)}</p>
      ),
      li: ({ children, node: _node, ...rest }) => (
        <li {...rest}>{renderInline(children)}</li>
      ),
      td: ({ children, node: _node, ...rest }) => (
        <td {...rest}>{renderInline(children)}</td>
      ),
      th: ({ children, node: _node, ...rest }) => (
        <th {...rest}>{renderInline(children)}</th>
      ),
      blockquote: ({ children, node: _node, ...rest }) => (
        <blockquote {...rest}>{renderInline(children)}</blockquote>
      ),
      strong: ({ children, node: _node, ...rest }) => (
        <strong {...rest}>{renderInline(children)}</strong>
      ),
      em: ({ children, node: _node, ...rest }) => (
        <em {...rest}>{renderInline(children)}</em>
      ),
      input: (props: React.ComponentPropsWithoutRef<'input'> & ExtraProps) => {
        const { type, checked, node } = props;
        if (type !== 'checkbox') return null;
        const line = node?.position?.start?.line;
        return (
          <input
            type="checkbox"
            checked={Boolean(checked)}
            readOnly={!onToggleCheckbox}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              if (line && onToggleCheckbox) {
                onToggleCheckbox(line);
              }
            }}
            aria-label="Toggle task item"
            className="mr-1.5 mt-0.5 size-3.5 cursor-pointer rounded border-slate-300 align-text-bottom accent-sky-600 dark:border-neutral-600 dark:accent-sky-400"
          />
        );
      },
    };
  }, [
    revealAllSpoilers,
    onToggleCheckbox,
    existingNoteTitles,
    onNavigateWikiLink,
    headingIdPrefix,
    headingSlugByLine,
  ]);

  return (
    <div
      className={cn(
        proseMarkdownBaseStyles,
        compact
          ? 'prose-sm leading-snug prose-headings:my-1.5 prose-p:my-1 prose-blockquote:my-1.5 prose-ol:my-1 prose-ul:my-1 prose-li:my-0.5 prose-table:my-1.5 prose-th:px-2 prose-th:py-1.5 prose-td:min-w-0 prose-td:px-2 prose-td:py-1.5 prose-hr:my-2'
          : 'prose-sm leading-relaxed sm:prose-base prose-h2:mt-5 prose-h3:mt-4 prose-td:min-w-[110px]',
        className
      )}
    >
      <Markdown
        remarkPlugins={[remarkMath, [remarkGfm, { singleTilde: false }]]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </Markdown>
    </div>
  );
}
