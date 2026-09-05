'use client';

import { useRef, useState } from 'react';
import { ChartColumn, PenLine } from 'lucide-react';
import { isNull, isEmpty, size } from 'lodash';

import useAiLanguageDetector from '../hooks/use-ai-language-detector';
import { cn } from '@/utils/cn';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';
import HeaderBlock from '../../common/header-block';
import BarChart from './bar-chart';
import { Textarea } from '@/components/ui/textarea';
import { PasteAction } from '@/components/shared/action-button';
import { DeleteAction } from '@/components/shared/action-button';
import SystemChecking from '../system-checking';
import UnsupportedCard from '../unsupported-card';
import ModelDownloadCard from '../model-download-card';
import SectionGap from '../../common/section-gap';
import LabelBar from '../../common/label-bar';

export default function LanguageDetectorApi() {
  const [text, setText] = useState('');
  const [results, setResults] = useState<Array<LanguageDetectionResult> | null>(
    null
  );

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    hasCheckedAIStatus,
    isApiSupported,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
    detect,
  } = useAiLanguageDetector();

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setText(text);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => detectString(text), 500);
  };

  const onPasteText = (value: string) => {
    setText(value as string);
    timerRef.current = setTimeout(() => detectString(value as string), 500);
  };

  const onClearClick = () => {
    setText('');
    setResults(null);
  };

  const detectString = async (text: string) => {
    if (isEmpty(text)) {
      setResults(null);
    } else {
      const results = await detect(text);
      setResults(results);
    }
  };

  return (
    <>
      <HeaderBlock />

      <SectionGap />

      {/* Language Detector */}
      {!hasCheckedAIStatus ? (
        <SystemChecking />
      ) : !isApiSupported ? (
        <UnsupportedCard
          apiType={UNSUPPORTED_API_TYPES.chromeLanguageDetectorApi}
        />
      ) : shouldDownloadModel ? (
        <ModelDownloadCard
          onClick={downloadModel}
          progress={downloadProgress}
        />
      ) : null}

      <div className="mx-auto text-center">
        {/* Input */}
        <LabelBar
          label="Paste your text below"
          icon={PenLine}
          htmlFor="text-textarea"
        >
          <PasteAction onClick={onPasteText} />
          <DeleteAction onClick={onClearClick} disabled={isEmpty(text)} />
        </LabelBar>
        <Textarea
          id="text-textarea"
          onChange={onChange}
          value={text}
          rows={10}
          placeholder="Type or paste the text you want to detect here..."
        />
        {/* Char count block */}
        <div className="mt-3 w-full text-right text-xs text-slate-400 dark:text-slate-600">
          {size(text)} chars
        </div>
      </div>

      <SectionGap />

      {/* Output */}
      <div
        className={cn(
          'relative flex min-h-[300px] w-full flex-col items-center rounded-lg border p-6',
          'border-neutral-200 dark:border-neutral-700',
          'bg-white/40 dark:bg-neutral-900/40'
        )}
      >
        {isNull(results) ? (
          <div className="m-auto text-center text-lg font-bold text-slate-500">
            <ChartColumn className="mx-auto mb-4 block" size={40} />
            <div>Waiting for input...</div>
          </div>
        ) : (
          <BarChart results={results} />
        )}
      </div>
    </>
  );
}
