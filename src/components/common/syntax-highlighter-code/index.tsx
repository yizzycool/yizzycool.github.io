'use client';

import clsx from 'clsx';
import { ExtraProps } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import useDarkModeObserver from '@/hooks/window/use-dark-mode-observer';
import CopyAction from '../action-button/copy';

// To customize `Prose` styles of '@tailwindcss/typography'
const InlineCodeProseClass = clsx(
  // customize <code> for inline code
  'rounded px-1 py-0.5',
  'bg-gray-200 dark:bg-gray-800',
  'text-sm font-mono',
  'before:content-none',
  'after:content-none'
);

export default function SyntaxHighlighterCode(
  props: React.ClassAttributes<HTMLElement> &
    React.HTMLAttributes<HTMLElement> &
    ExtraProps
) {
  const { ref, children, className, node, ...rest } = props;
  const match = /language-(\w+)/.exec(className || '');

  const { isDark } = useDarkModeObserver();

  return match ? (
    <div
      className={clsx(
        'rounded-md bg-neutral-100 dark:bg-neutral-800',
        'border border-neutral-200 dark:border-neutral-700'
      )}
    >
      {/* Header - language + copy button */}
      <div
        id="yizzyyy"
        className="flex items-center justify-between px-3 py-2 text-xs text-gray-600 dark:text-gray-300"
      >
        <span>{match[1]}</span>
        <CopyAction variant="ghost" content={children as string} />
      </div>
      {/* @ts-expect-error - known issue about react-syntax-highlighter */}
      <SyntaxHighlighter
        {...rest}
        PreTag="div"
        language={match[1]}
        style={isDark ? oneDark : oneLight}
        showLineNumbers={true}
        customStyle={{
          margin: 0,
        }}
      >
        {!!children && (children as string).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code {...rest} className={clsx(className, InlineCodeProseClass)}>
      {children}
    </code>
  );
}
