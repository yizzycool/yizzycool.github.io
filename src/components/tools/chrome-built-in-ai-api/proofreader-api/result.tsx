import { useMemo, useState } from 'react';
import {
  BookCheck,
  Check,
  Cpu,
  ScrollText,
  SpellCheck,
  SpellCheck2,
  X,
} from 'lucide-react';
import { forEach, map, isEmpty, join } from 'lodash';

import { cn } from '@/utils/cn';
import Label from '@/components/common/label';
import CopyAction from '@/components/common/action-button/copy';
import Button from '@/components/common/button';
import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/common/tooltip';

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
};

export default function Result({ text, result, isProcessing }: Props) {
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
      map(highlightList, ({ applySuggestion, text, correction }) => {
        if (applySuggestion) return correction;
        else return text;
      })
    );
  }, [highlightList]);

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
    <>
      <div
        id="result"
        className="mb-3 flex w-full scroll-mt-20 flex-col-reverse items-start justify-between gap-2 sm:flex-row sm:items-center"
      >
        <Label icon={SpellCheck}>Proofreader Suggestions</Label>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Apply all suggestions */}
          <Button
            variant="success"
            size="xs"
            icon={BookCheck}
            onClick={onApplyAll}
          >
            Apply All
          </Button>
          <CopyAction content={copyText} disabled={isEmpty(copyText)} />
        </div>
      </div>

      <div
        className={cn(
          'relative h-[300px] w-full overflow-y-auto rounded-lg border px-4 py-3',
          'border-neutral-200 dark:border-neutral-700',
          'bg-white/40 dark:bg-neutral-900/40'
        )}
      >
        {isEmpty(result) ? (
          <div className="m-auto flex h-full flex-col items-center justify-center text-center text-lg font-bold text-slate-500">
            {isProcessing ? (
              <>
                <Cpu
                  className="mx-auto mb-4 block animate-bounce animate-duration-[2000ms] animate-infinite"
                  size={40}
                />
                <div className="flex items-center gap-2">Processing...</div>
              </>
            ) : (
              <>
                <ScrollText className="mx-auto mb-4 block" size={40} />
                <div>Waiting for input...</div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full whitespace-pre-wrap break-words text-left text-base leading-loose">
            {highlightList.map(
              (
                { text, error, correction, type, color, applySuggestion },
                idx
              ) =>
                error && !applySuggestion ? (
                  <span key={idx} className="group relative">
                    <TooltipRoot>
                      <TooltipTrigger>
                        <span
                          key={idx}
                          className={cn(
                            'transition-colors duration-300',
                            color?.hoverBg,
                            'border-b-2',
                            color?.border
                          )}
                        >
                          {text}
                        </span>
                      </TooltipTrigger>
                      <TooltipPopup showArrow variant="card" className="p-3.5">
                        <div
                          key={idx}
                          className="min-w-[min(90vw,_240px)] max-w-[min(90vw,_280px)] space-y-3 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                              <SpellCheck2 size={15} className={color?.text} />
                              <span>{type}</span>
                            </div>
                          </div>

                          <div
                            className={cn(
                              'space-y-2 overflow-hidden rounded-lg',
                              'border border-slate-100 bg-slate-50/80 p-2.5 dark:border-neutral-800/60 dark:bg-neutral-950/50'
                            )}
                          >
                            {!!text && (
                              <div className="flex items-center gap-2 text-rose-600/90 dark:text-rose-400">
                                <X
                                  size={14}
                                  className="shrink-0 text-rose-500"
                                />
                                <span className="line-through decoration-rose-400/60">
                                  {text}
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

                          {/* Apply suggestion */}
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
                ) : applySuggestion ? (
                  correction
                ) : (
                  text
                )
            )}
          </div>
        )}
      </div>
    </>
  );
}
