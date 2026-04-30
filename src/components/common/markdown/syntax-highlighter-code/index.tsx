'use client';

import type { ExtraProps } from 'react-markdown';

import { cn } from '@/utils/cn';

import CodeBlock from './components/code-block';
import ReactLive from './components/react-live';
import MermaidChart from './components/mermaid-chart';

export default function SyntaxHighlighterCode(
  props: React.ClassAttributes<HTMLElement> &
    React.HTMLAttributes<HTMLElement> &
    ExtraProps
) {
  const { ref, children, className, node, ...rest } = props;
  const match = /language-([\w?=&]+)/.exec(className || '');

  return match ? (
    match[1].startsWith('live') ? (
      // ```live?lang=<lang>&lockMode=<mode>
      <ReactLive code={children as string} metadata={match[1]} />
    ) : match[1].startsWith('mermaid') ? (
      <MermaidChart code={children as string} metadata={match[1]} />
    ) : (
      <CodeBlock match={match} code={children as string} rest={rest} />
    )
  ) : (
    <code
      {...rest}
      className={cn(
        // To customize `Prose` styles of '@tailwindcss/typography'
        // customize <code> for inline code
        'rounded-sm px-1.5 py-0.5 font-mono text-sm font-normal',
        'bg-slate-200/50 dark:bg-slate-700/50',
        'text-slate-600 dark:text-slate-300',
        'ring-1 ring-inset ring-slate-900/5 dark:ring-white/10',
        'before:content-none after:content-none',
        className
      )}
    >
      {children}
    </code>
  );
}
