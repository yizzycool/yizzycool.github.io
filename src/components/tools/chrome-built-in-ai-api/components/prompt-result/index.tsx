import clsx from 'clsx';
import { Cpu, List, ScrollText } from 'lucide-react';
import ProseMarkdown from '@/components/common/markdown/prose-markdown';
import CopyAction from '@/components/common/action-button/copy';
import _isEmpty from 'lodash/isEmpty';
import _range from 'lodash/range';

type Props = {
  results: string;
  isProcessing: boolean;
};

export default function PromptResult({ results, isProcessing }: Props) {
  return (
    <>
      <div
        id="result"
        className="mb-3 flex w-full flex-col-reverse items-center justify-between gap-2 sm:flex-row"
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
          'bg-white/80 dark:bg-neutral-900/80',
          'backdrop-blur'
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
          <ProseMarkdown className="cursor-text text-left">
            {results}
          </ProseMarkdown>
        )}
      </div>
    </>
  );
}
