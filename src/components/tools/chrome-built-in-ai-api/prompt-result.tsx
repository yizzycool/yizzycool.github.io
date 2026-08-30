import { cn } from '@/utils/cn';
import { Cpu, List, ScrollText } from 'lucide-react';
import { isEmpty } from 'lodash';

import ProseMarkdown from '@/components/common/markdown/prose-markdown';
import CopyAction from '@/components/common/action-button/copy';
import LabelBar from '../common/label-bar';

type Props = {
  results: string;
  isProcessing: boolean;
};

export default function PromptResult({ results, isProcessing }: Props) {
  return (
    <>
      <LabelBar id="result" className="scroll-mt-20" label="Result" icon={List}>
        <CopyAction content={results} disabled={isEmpty(results)} />
      </LabelBar>
      <div
        className={cn(
          'relative h-[300px] w-full overflow-y-auto rounded-xl border p-6 transition-all duration-200',
          'shadow-2xs border-neutral-200/90 bg-white/80 backdrop-blur-md',
          'dark:border-neutral-700/80 dark:bg-neutral-900/80'
        )}
      >
        {isEmpty(results) ? (
          <div className="m-auto flex h-full flex-col items-center justify-center text-center text-sm font-medium text-slate-400 dark:text-slate-500">
            {isProcessing ? (
              <>
                <Cpu
                  className="mx-auto mb-3 block animate-bounce text-sky-500 animate-duration-[2000ms] animate-infinite"
                  size={36}
                />
                <div className="font-semibold text-slate-700 dark:text-slate-200">
                  Processing...
                </div>
              </>
            ) : (
              <>
                <ScrollText
                  className="mx-auto mb-3 block opacity-50"
                  size={36}
                />
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
