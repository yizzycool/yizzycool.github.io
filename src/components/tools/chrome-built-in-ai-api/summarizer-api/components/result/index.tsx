import clsx from 'clsx';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Cpu, List, ScrollText } from 'lucide-react';
import CopyAction from '@/components/common/action-button/copy';
import SyntaxHighlighterCode from '@/components/common/syntax-highlighter-code';
import _isEmpty from 'lodash/isEmpty';
import _range from 'lodash/range';

type Props = {
  results: string;
  isProcessing: boolean;
};

export default function Result({ results, isProcessing }: Props) {
  return (
    <>
      <div
        id="result"
        className="mb-3 mt-10 flex w-full flex-col-reverse items-center justify-between gap-2 sm:flex-row"
      >
        <div className="flex items-center self-start font-semibold sm:self-auto">
          <List className="mr-2" size={16} />
          Result
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <CopyAction content={results} disabled={_isEmpty(results)} />
        </div>
      </div>
      <div
        className={clsx(
          'relative h-[300px] w-full overflow-y-auto rounded-lg border p-6',
          'border-neutral-200 dark:border-neutral-700',
          'bg-white dark:bg-neutral-800'
        )}
      >
        {_isEmpty(results) ? (
          <div className="m-auto flex h-full flex-col items-center justify-center text-center text-lg font-bold text-neutral-500">
            {isProcessing ? (
              <>
                <Cpu className="mx-auto mb-4 block" size={40} />
                <div>
                  Processing
                  {_range(3).map((t) => (
                    <span
                      key={t}
                      className={`inline-block animate-bounce delay-${t * 100}`}
                    >
                      .
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <ScrollText className="mx-auto mb-4 block" size={40} />
                <div>Waiting for input...</div>
              </>
            )}
          </div>
        ) : (
          <Markdown
            className="prose prose-neutral min-h-full min-w-full dark:prose-invert"
            remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
            components={{
              code(props) {
                return SyntaxHighlighterCode(props);
              },
            }}
          >
            {results}
          </Markdown>
        )}
      </div>
    </>
  );
}
