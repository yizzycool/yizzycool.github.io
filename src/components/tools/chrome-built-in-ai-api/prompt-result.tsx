'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, Cpu, List, ScrollText } from 'lucide-react';
import { isEmpty } from 'lodash';

import { ProseMarkdown } from '@/components/shared/markdown';
import { CopyAction } from '@/components/shared/action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { cn } from '@/utils/cn';

import LabelBar from '../common/label-bar';
import { computeWordDiff } from './utils/word-diff';

type ViewMode = 'result' | 'diff';

const VIEW_MODE_TABS: ViewMode[] = ['result', 'diff'];

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  result: 'Formatted',
  diff: 'Diff',
};

type Props = {
  results: string;
  isProcessing: boolean;
  label?: string;
  originalText?: string;
  enableDiff?: boolean;
  onAcceptToInput?: (value: string) => void;
  showCharCount?: boolean;
  showCompressionRatio?: boolean;
  panelClassName?: string;
};

export default function PromptResult({
  results,
  isProcessing,
  label = 'Result',
  originalText = '',
  enableDiff = false,
  onAcceptToInput,
  showCharCount = false,
  showCompressionRatio = false,
  panelClassName,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('result');
  const activeMode: ViewMode =
    enableDiff && !isProcessing && viewMode === 'diff' ? 'diff' : 'result';

  const diffData = useMemo(() => {
    if (activeMode !== 'diff' || isEmpty(results)) return null;
    return computeWordDiff(originalText, results);
  }, [activeMode, originalText, results]);

  const trimmedResult = results.trim();
  const charCount = results.length;
  const originalLen = originalText.trim().length;
  const resultLen = trimmedResult.length;
  const reductionPct =
    showCompressionRatio && originalLen > 0 && resultLen > 0
      ? Math.round(((originalLen - resultLen) / originalLen) * 100)
      : null;

  const showFooter =
    Boolean(onAcceptToInput) || showCharCount || showCompressionRatio;

  return (
    <div className="flex flex-col">
      <LabelBar
        id="result"
        className="scroll-mt-20"
        label={<span className="whitespace-nowrap">{label}</span>}
        icon={List}
        actionsClassName="shrink-0"
      >
        <div className="flex items-center gap-2">
          {enableDiff && (
            <Tabs<ViewMode>
              tabs={VIEW_MODE_TABS}
              activeTab={activeMode}
              onChange={setViewMode}
              tabLabels={VIEW_MODE_LABELS}
              variant="segment"
              size="xs"
              rounded="md"
              className="p-0.5"
              tabClassName="px-2 py-0.5"
            />
          )}
          <CopyAction content={results} disabled={isEmpty(results)} />
        </div>
      </LabelBar>

      <div
        className={cn(
          'relative h-[300px] w-full overflow-y-auto rounded-xl border p-5 transition-all duration-200',
          'shadow-2xs border-neutral-200/90 bg-white/80 backdrop-blur-md',
          'dark:border-neutral-700/80 dark:bg-neutral-900/80',
          panelClassName
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
        ) : activeMode === 'diff' && diffData ? (
          <div className="space-y-3 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/70 pb-2.5 text-xs dark:border-neutral-800">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                Word-level comparison against source text
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <Badge variant="error" size="xs" rounded="md">
                  -{diffData.stats.removed} removed
                </Badge>
                <Badge variant="success" size="xs" rounded="md">
                  +{diffData.stats.added} added
                </Badge>
              </div>
            </div>

            <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              {diffData.segments.map((segment, index) => {
                if (segment.type === 'delete') {
                  return (
                    <del
                      key={index}
                      className="rounded bg-rose-500/15 px-0.5 text-rose-700 line-through decoration-rose-400/80 dark:bg-rose-500/20 dark:text-rose-300"
                    >
                      {segment.value}
                    </del>
                  );
                }
                if (segment.type === 'insert') {
                  return (
                    <ins
                      key={index}
                      className="rounded bg-emerald-500/15 px-0.5 font-medium text-emerald-700 no-underline dark:bg-emerald-500/20 dark:text-emerald-300"
                    >
                      {segment.value}
                    </ins>
                  );
                }
                return <span key={index}>{segment.value}</span>;
              })}
            </div>
          </div>
        ) : (
          <ProseMarkdown className="cursor-text text-left">
            {results}
          </ProseMarkdown>
        )}
      </div>

      {showFooter && (
        <div className="mt-4 flex min-h-[36px] flex-wrap items-center justify-between gap-3">
          {onAcceptToInput ? (
            <Button
              variant="outline"
              size="sm"
              rounded="lg"
              icon={ArrowLeft}
              disabled={isEmpty(results) || isProcessing}
              onClick={() => onAcceptToInput(results)}
              title="Replace the input editor with this result for another pass"
            >
              Accept to Input
            </Button>
          ) : showCompressionRatio &&
            reductionPct !== null &&
            reductionPct > 0 ? (
            <Badge variant="success" size="xs" rounded="full">
              {reductionPct}% shorter
            </Badge>
          ) : (
            <div />
          )}

          <div className="text-right text-xs text-slate-400 dark:text-slate-500">
            {charCount} chars
          </div>
        </div>
      )}
    </div>
  );
}
