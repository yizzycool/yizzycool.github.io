'use client';

import { ExtraProps } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function SyntaxHighlighterCode(
  props: React.ClassAttributes<HTMLElement> &
    React.HTMLAttributes<HTMLElement> &
    ExtraProps
) {
  const { ref, children, className, node, ...rest } = props;
  const match = /language-(\w+)/.exec(className || '');

  return match ? (
    // @ts-expect-error - known issue about react-syntax-highlighter
    <SyntaxHighlighter
      {...rest}
      PreTag="div"
      language={match[1]}
      style={vscDarkPlus}
      showLineNumbers={true}
    >
      {(children as string).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code {...rest} className={className}>
      {children}
    </code>
  );
}
