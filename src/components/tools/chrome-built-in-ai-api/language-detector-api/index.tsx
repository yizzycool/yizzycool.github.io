'use client';

import type { ChangeEvent } from 'react';

import { useEffect, useRef, useState } from 'react';
import { ChartColumn, PenLine } from 'lucide-react';
import { isEmpty, isNull, size } from 'lodash';

import { DeleteAction, PasteAction } from '@/components/shared/action-button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import useToolHotkeys, { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import { cn } from '@/utils/cn';

import HeaderBlock from '../../common/header-block';
import LabelBar from '../../common/label-bar';
import SectionGap from '../../common/section-gap';
import AiStatusGate from '../ai-status-gate';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';
import useAiLanguageDetector from '../hooks/use-ai-language-detector';
import BarChart from './bar-chart';

export default function LanguageDetectorApi() {
  const [text, setText] = useState('');
  const [results, setResults] = useState<Array<LanguageDetectionResult> | null>(
    null
  );

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    hasCheckedAIStatus,
    isApiSupported,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
    detect,
  } = useAiLanguageDetector();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const detectString = async (input: string) => {
    if (isEmpty(input)) {
      setResults(null);
    } else {
      const detected = await detect(input);
      setResults(detected);
    }
  };

  const scheduleDetection = (nextValue: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => detectString(nextValue), 500);
  };

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value;
    setText(nextValue);
    scheduleDetection(nextValue);
  };

  const onPasteText = (value: string) => {
    setText(value);
    scheduleDetection(value);
  };

  const onClearClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setText('');
    setResults(null);
  };

  useToolHotkeys(
    {
      onPaste: async () => {
        try {
          const clipText = await navigator.clipboard.readText();
          onPasteText(clipText);
        } catch (_e) {
          // ignore
        }
      },
      onClear: onClearClick,
    },
    { target: textareaRef }
  );

  const candidateCount = results
    ? results.filter((item) => (item.confidence ?? 0) >= 0.001).length
    : 0;

  return (
    <>
      <HeaderBlock
        customShortcuts={[
          TOOL_HOTKEYS.paste,
          TOOL_HOTKEYS.clear,
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap />

      <AiStatusGate
        hasCheckedAIStatus={hasCheckedAIStatus}
        isApiSupported={isApiSupported}
        apiType={UNSUPPORTED_API_TYPES.chromeLanguageDetectorApi}
        shouldDownloadModel={shouldDownloadModel}
        downloadProgress={downloadProgress}
        downloadModel={downloadModel}
      />

      {/* Desktop 6:6 Split Workbench (Mobile Stacked) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <div className="flex flex-col lg:col-span-6">
          <LabelBar
            label="Source Text"
            icon={PenLine}
            htmlFor="language-detector-textarea"
            headerClassName="min-h-8"
          >
            <PasteAction onClick={onPasteText} />
            <DeleteAction onClick={onClearClick} disabled={isEmpty(text)} />
          </LabelBar>

          <Textarea
            ref={textareaRef}
            id="language-detector-textarea"
            onChange={onChange}
            value={text}
            rows={13}
            className="min-h-[320px] lg:h-[400px]"
            placeholder="Type or paste the text you want to identify here..."
          />

          <div className="mt-3 text-right text-xs text-slate-400 dark:text-slate-500">
            {size(text)} chars
          </div>
        </div>

        <div className="flex flex-col lg:col-span-6">
          <LabelBar
            label={<span className="whitespace-nowrap">Detection Results</span>}
            icon={ChartColumn}
            headerClassName="min-h-8"
            actionsClassName="shrink-0"
          >
            {candidateCount > 0 && (
              <Badge variant="neutral" size="xs" rounded="full">
                {candidateCount} {candidateCount === 1 ? 'match' : 'matches'}
              </Badge>
            )}
          </LabelBar>

          <div
            className={cn(
              'shadow-2xs flex min-h-[320px] w-full flex-col rounded-xl border p-5 backdrop-blur-md lg:h-[400px]',
              'border-neutral-200/90 bg-white/80',
              'dark:border-neutral-700/80 dark:bg-neutral-900/80'
            )}
          >
            {isNull(results) ? (
              <div className="m-auto flex flex-col items-center justify-center text-center text-sm font-medium text-slate-400 dark:text-slate-500">
                <ChartColumn
                  className="mx-auto mb-3 block opacity-50"
                  size={36}
                />
                <div>Waiting for input...</div>
              </div>
            ) : (
              <BarChart results={results} />
            )}
          </div>

          <div className="mt-3 text-right text-xs text-slate-400 dark:text-slate-500">
            Auto-detects as you type (500ms debounce)
          </div>
        </div>
      </div>
    </>
  );
}
