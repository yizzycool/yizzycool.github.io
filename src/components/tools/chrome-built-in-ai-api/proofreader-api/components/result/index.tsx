import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Cpu,
  ScrollText,
  SpellCheck,
  SpellCheck2,
  X,
} from 'lucide-react';

import Label from '@/components/common/label';
import CopyAction from '@/components/common/action-button/copy';
import Button from '@/components/common/button';
import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/common/tooltip';

import _forEach from 'lodash/forEach';
import _filter from 'lodash/filter';
import _map from 'lodash/map';
import _isEmpty from 'lodash/isEmpty';
import _join from 'lodash/join';

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
  const [highlightList, setHighlightList] = useState<HighlightList>([]);

  const copyText = useMemo(() => {
    return _join(
      _map(highlightList, ({ applySuggestion, text, correction }) => {
        if (applySuggestion) return correction;
        else return text;
      })
    );
  }, [highlightList]);

  useEffect(() => {
    try {
      const parts: HighlightList = [];

      let lastIndex = 0;

      _forEach(
        result?.corrections,
        ({ correction, startIndex, endIndex, type }) => {
          // Handle for input with no suggestion
          if (lastIndex < startIndex) {
            parts.push({
              text: text.substring(lastIndex, startIndex),
              error: false,
            });
          }
          // Handle for input with suggestion
          parts.push({
            text: text.substring(startIndex, endIndex),
            error: true,
            correction,
            type,
            color: Colors[type],
          });
          lastIndex = endIndex;
        }
      );

      // Handle for last substring
      if (lastIndex < text.length) {
        parts.push({
          text: text.substring(lastIndex, text.length),
          error: false,
        });
      }

      setHighlightList(parts);
    } catch (_e) {
      return setHighlightList([]);
    }
  }, [result]);

  const onApply = (idx: number) => {
    setHighlightList((prev) => [
      ...prev.slice(0, idx),
      { ...prev[idx], applySuggestion: true },
      ...prev.slice(idx + 1),
    ]);
  };

  return (
    <>
      <div
        id="result"
        className="mb-3 flex w-full scroll-mt-20 flex-col-reverse items-start justify-between gap-2 sm:flex-row sm:items-center"
      >
        <Label icon={SpellCheck}>Proofreader Suggestions</Label>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <CopyAction content={copyText} disabled={_isEmpty(copyText)} />
        </div>
      </div>

      <div
        className={clsx(
          'relative h-[300px] w-full overflow-y-auto rounded-lg border px-4 py-3',
          'border-neutral-200 dark:border-neutral-700',
          'bg-white/80 dark:bg-neutral-900/80',
          'backdrop-blur'
        )}
      >
        {_isEmpty(result) ? (
          <div className="m-auto flex h-full flex-col items-center justify-center text-center text-lg font-bold text-neutral-500">
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
                          className={clsx(
                            'transition-colors duration-300',
                            color?.hoverBg,
                            'border-b-2',
                            color?.border
                          )}
                        >
                          {text}
                        </span>
                      </TooltipTrigger>
                      <TooltipPopup>
                        <div
                          key={idx}
                          className={clsx(
                            'max-w-[min(90vw,_300px)] overflow-hidden',
                            'rounded-lg bg-blue-100 p-4 shadow-lg dark:bg-gray-800',
                            'text-xs text-neutral-700 dark:text-neutral-200',
                            'space-y-4'
                          )}
                        >
                          <div className="flex items-center gap-2 font-black uppercase">
                            <SpellCheck2 size={16} className={color?.text} />
                            {type}
                          </div>
                          <div
                            className={clsx(
                              'space-y-4 overflow-hidden rounded',
                              'bg-black/10 p-2 dark:bg-white/10'
                            )}
                          >
                            {!!text && (
                              <div className="flex gap-2">
                                <X
                                  size={16}
                                  className="min-w-[16px] text-red-500"
                                />
                                <div className="line-through">{text}</div>
                              </div>
                            )}
                            {!!correction && (
                              <div className="flex gap-2">
                                <Check
                                  size={16}
                                  className="min-w-[16px] text-green-500"
                                />
                                {correction}
                              </div>
                            )}
                          </div>
                          {/* Apply suggestion */}
                          <Button
                            size="xs"
                            className="ml-auto"
                            onClick={() => onApply(idx)}
                          >
                            Apply
                          </Button>
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
