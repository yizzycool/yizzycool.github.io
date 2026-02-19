'use client';

import clsx from 'clsx';
import { ExtraProps } from 'react-markdown';
import CodeBlock from './components/code-block';
import ReactLive from './components/react-live';

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
  const match = /language-([\w?=&]+)/.exec(className || '');

  return match && match[1].startsWith('live') ? (
    // ```live?lang=<lang>&lockMode=<mode>
    <ReactLive code={children as string} metadata={match[1]} />
  ) : match ? (
    <CodeBlock match={match} code={children as string} rest={rest} />
  ) : (
    <code {...rest} className={clsx(className, InlineCodeProseClass)}>
      {children}
    </code>
  );
}
