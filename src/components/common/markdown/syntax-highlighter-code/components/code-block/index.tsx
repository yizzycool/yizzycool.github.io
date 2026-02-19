'use client';

import clsx from 'clsx';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';

import useDarkModeObserver from '@/hooks/window/use-dark-mode-observer';
import CopyAction from '@/components/common/action-button/copy';

type Props = {
  match: RegExpExecArray;
  code: string;
  rest: object;
};

export default function CodeBlock({ match, code, rest }: Props) {
  const { isDark } = useDarkModeObserver();

  return (
    <div
      className={clsx(
        'rounded-md bg-neutral-100 dark:bg-neutral-800',
        'border border-neutral-200 dark:border-neutral-700'
      )}
    >
      {/* Header - language + copy button */}
      <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-600 dark:text-gray-300">
        <span>{match[1]}</span>
        <CopyAction variant="secondary" content={code as string} />
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
        {!!code && code.replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
}
