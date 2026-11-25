'use client';

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookCheck,
  Check,
  Cpu,
  ScrollText,
  SpellCheck,
  SpellCheck2,
  X,
} from 'lucide-react';
import { forEach, isEmpty, join, map } from 'lodash';

import { CopyAction } from '@/components/shared/action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/utils/cn';

import LabelBar from '../../common/label-bar';

type ViewMode = 'suggestions' | 'diff';

const VIEW_MODE_TABS: ViewMode[] = ['suggestions', 'diff'];

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  suggestions: 'Suggestions',
  diff: 'Inline Diff',
};

const Colors: Record<CorrectionType, ColorType> = {
  spelling: {
    bg: 'bg-red-500/30',
    text: 'text-red-500',
    hoverBg: 'group-hover:bg-red-500/30',
    border: 'border-red-500',
  },
  punctuation: {
    bg: 'bg-amber-500/30',
    text: 'text-amber-500',
    hoverBg: 'group-hover:bg-amber-500/30',
    border: 'border-amber-500',
  },
  capitalization: {
    bg: 'bg-yellow-500/30',
    text: 'text-yellow-500',
    hoverBg: 'group-hover:bg-yellow-500/30',
    border: 'border-yellow-500',
  },
  preposition: {
    bg: 'bg-blue-500/30',
    text: 'text-blue-500',
    hoverBg: 'group-hover:bg-blue-500/30',
    border: 'border-blue-500',
  },
  'missing-words': {
    bg: 'bg-red-600/30',
    text: 'text-red-600',
    hoverBg: 'group-hover:bg-red-600/30',
    border: 'border-red-600',
  },
  grammar: {
    bg: 'bg-purple-500/30',
    text: 'text-purple-500',
    hoverBg: 'group-hover:bg-purple-500/30',
    border: 'border-purple-500',
  },
};

type ColorType = {
  bg: string;
  text: string;
  hoverBg: string;
  border: string;
};

type HighlightList = Array<{
  text: string;
  error: boolean;
  correction?: string;
  type?: CorrectionType;
  color?: ColorType;
  applySuggestion?: boolean;
}>;

type Props = {
  text: string;
  result?: ProofreadResult;
  isProcessing: boolean;
  onAcceptToInput?: (value: string) => void;
  panelClassName?: string;
};

export default function Result({
  text,
  result,
  isProcessing,
  onAcceptToInput,
  panelClassName,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('diff');

  const initialHighlightList = useMemo(() => {
    try {
      const parts: HighlightList = [];
      let lastIndex = 0;

      forEach(
        result?.corrections,
        ({ correction, startIndex, endIndex, types }) => {
          if (lastIndex < startIndex) {
            parts.push({
              text: text.substring(lastIndex, startIndex),
              error: false,
            });
          }
          parts.push({
            text: text.substring(startIndex, endIndex),
            error: true,
            correction,
            type: types[0],
            color: Colors[types[0]],
          });
          lastIndex = endIndex;
        }
      );

      if (lastIndex < text.length) {
        parts.push({
          text: text.substring(lastIndex, text.length),
          error: false,
        });
      }

      return parts;
    } catch (_e) {
      return [];
    }
  }, [result, text]);

  const [prevResult, setPrevResult] = useState(result);
  const [highlightList, setHighlightList] =
    useState<HighlightList>(initialHighlightList);

  if (prevResult !== result) {
    setPrevResult(result);
    setHighlightList(initialHighlightList);
  }

  const copyText = useMemo(() => {
    return join(
      map(highlightList, ({ applySuggestion, text: partText, correction }) => {
        if (applySuggestion) return correction;
        return partText;
      }),
      ''
    );
  }, [highlightList]);

  const allCorrectedText = useMemo(() => {
    return join(
      map(highlightList, ({ error, text: partText, correction }) => {
        if (error && correction !== undefined) return correction;
        return partText;
      }),
      ''
    );
  }, [highlightList]);

  const pendingCount = useMemo(
    () =>
      highlightList.filter((item) => item.error && !item.applySuggestion)
        .length,
    [highlightList]
  );

  const hasAppliedAny = useMemo(
    () => highlightList.some((item) => item.applySuggestion),
    [highlightList]
  );

  const acceptedText = hasAppliedAny ? copyText : allCorrectedText;

  const onApply = (idx: number) => {
    setHighlightList((prev) => [
      ...prev.slice(0, idx),
      { ...prev[idx], applySuggestion: true },
      ...prev.slice(idx + 1),
    ]);
  };

  const onApplyAll = () => {
    setHighlightList((prev) =>
      map(prev, (chunk) => {
        if (!chunk.error) return chunk;
        return { ...chunk, applySuggestion: true };
      })
    );
  };

  return (
    <div className="flex flex-col">
      <LabelBar
        id="result"
        className="scroll-mt-20"
        label={<span className="whitespace-nowrap">Result</span>}
        icon={SpellCheck}
        actionsClassName="shrink-0"
      >
        <div className="flex items-center gap-2">
          <Tabs<ViewMode>
            tabs={VIEW_MODE_TABS}
            activeTab={viewMode}
            onChange={setViewMode}
            tabLabels={VIEW_MODE_LABELS}
            variant="segment"
            size="xs"
            rounded="md"
            className="p-0.5"
            tabClassName="px-2 py-0.5"
          />
          <CopyAction content={copyText} disabled={isEmpty(copyText)} />
        </div>
      </LabelBar>

      <div
        className={cn(
          'relative h-[300px] w-full overflow-y-auto rounded-xl border px-4 py-3.5 transition-all duration-200',
          'shadow-2xs border-neutral-200/90 bg-white/80 backdrop-blur-md',
          'dark:border-neutral-700/80 dark:bg-neutral-900/80',
          panelClassName
        )}
      >
        {isEmpty(result) ? (
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
          <div className="space-y-3 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200/70 pb-2 text-xs dark:border-neutral-800">
              <span className="text-slate-500 dark:text-slate-400">
                {pendingCount === 0
                  ? 'All suggestions applied'
                  : viewMode === 'diff'
                    ? 'Click any green suggestion to apply inline'
                    : 'Hover or tap underlined spans to inspect suggestions'}
              </span>
              <Badge
                variant={pendingCount === 0 ? 'success' : 'blue'}
                size="xs"
                rounded="full"
              >
                {pendingCount}{' '}
                {pendingCount === 1 ? 'pending fix' : 'pending fixes'}
              </Badge>
            </div>

            <div className="w-full whitespace-pre-wrap break-words text-sm leading-loose text-slate-800 dark:text-slate-200">
              {highlightList.map(
                (
                  {
                    text: partText,
                    error,
                    correction,
                    type,
                    color,
                    applySuggestion,
                  },
                  idx
                ) => {
                  if (!error) return partText;

                  if (applySuggestion) {
                    return (
                      <span
                        key={idx}
                        className="rounded bg-emerald-500/10 px-0.5 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      >
                        {correction}
                      </span>
                    );
                  }

                  if (viewMode === 'diff') {
                    return (
                      <span
                        key={idx}
                        className="inline-flex flex-wrap items-baseline gap-1 align-baseline"
                      >
                        {!!partText && (
                          <del className="rounded bg-rose-500/15 px-1 text-rose-700 line-through decoration-rose-400/80 dark:bg-rose-500/20 dark:text-rose-300">
                            {partText}
                          </del>
                        )}
                        {!!correction && (
                          <button
                            type="button"
                            onClick={() => onApply(idx)}
                            title={`Apply ${type ?? 'correction'}`}
                            className="cursor-pointer rounded bg-emerald-500/15 px-1 font-medium text-emerald-700 transition-colors hover:bg-emerald-500/25 dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/30"
                          >
                            {correction}
                          </button>
                        )}
                      </span>
                    );
                  }

                  return (
                    <span key={idx} className="group relative">
                      <TooltipRoot>
                        <TooltipTrigger>
                          <span
                            className={cn(
                              'transition-colors duration-300',
                              color?.hoverBg,
                              'border-b-2',
                              color?.border
                            )}
                          >
                            {partText}
                          </span>
                        </TooltipTrigger>
                        <TooltipPopup
                          showArrow
                          variant="card"
                          className="p-3.5"
                        >
                          <div className="min-w-[min(90vw,_240px)] max-w-[min(90vw,_280px)] space-y-3 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                <SpellCheck2
                                  size={15}
                                  className={color?.text}
                                />
                                <span>{type}</span>
                              </div>
                            </div>

                            <div
                              className={cn(
                                'space-y-2 overflow-hidden rounded-lg',
                                'border border-slate-100 bg-slate-50/80 p-2.5 dark:border-neutral-800/60 dark:bg-neutral-950/50'
                              )}
                            >
                              {!!partText && (
                                <div className="flex items-center gap-2 text-rose-600/90 dark:text-rose-400">
                                  <X
                                    size={14}
                                    className="shrink-0 text-rose-500"
                                  />
                                  <span className="line-through decoration-rose-400/60">
                                    {partText}
                                  </span>
                                </div>
                              )}
                              {!!correction && (
                                <div className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-400">
                                  <Check
                                    size={14}
                                    className="shrink-0 text-emerald-500"
                                  />
                                  <span>{correction}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-end">
                              <Button
                                size="xs"
                                variant="blue"
                                className="rounded-md px-3 font-medium"
                                onClick={() => onApply(idx)}
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                        </TooltipPopup>
                      </TooltipRoot>
                    </span>
                  );
                }
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="success"
            size="sm"
            rounded="lg"
            icon={BookCheck}
            disabled={pendingCount === 0}
            onClick={onApplyAll}
          >
            Apply All
          </Button>
          {onAcceptToInput && (
            <Button
              variant="outline"
              size="sm"
              rounded="lg"
              icon={ArrowLeft}
              disabled={isEmpty(result) || isProcessing}
              onClick={() => onAcceptToInput(acceptedText)}
              title="Replace the input editor with proofread text for another pass"
            >
              Accept to Input
            </Button>
          )}
        </div>
        <div className="text-right text-xs text-slate-400 dark:text-slate-500">
          {copyText.length} chars
        </div>
      </div>
    </div>
  );
}
