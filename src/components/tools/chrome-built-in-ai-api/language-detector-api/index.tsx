'use client';

import clsx from 'clsx';
import { useRef, useState } from 'react';
import { ChartColumn, PenLine } from 'lucide-react';
import useAiLanguageDetector from '../hooks/use-ai-language-detector';
import HeaderBlock from '../../components/header-block';
import BarChart from './components/bar-chart';
import Textarea from '@/components/common/textarea';
import PasteAction from '@/components/common/action-button/paste';
import DeleteAction from '@/components/common/action-button/delete';
import LoadingSkeleton from '../components/loading-skeleton';
import UnsupportedCard from '../components/unsupported-card';
import ModelDownloadCard from '../components/model-download-card';
import ErrorDialog from '@/components/common/dialog/error';
import SectionGap from '../../components/section-gap';
import { UnsupportedApiTypes } from '../data/unsupported-types';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import _values from 'lodash/values';
import _size from 'lodash/size';

export default function LanguageDetectorApi() {
  const [text, setText] = useState('');
  const [results, setResults] = useState<Array<LanguageDetectionResult> | null>(
    null
  );

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    hasCheckedAIStatus,
    isApiSupported,
    // availability,
    error,
    detect,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
    resetError,
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
    if (_isEmpty(text)) {
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
        <LoadingSkeleton />
      ) : !isApiSupported ? (
        <UnsupportedCard
          apiType={UnsupportedApiTypes.chromeLanguageDetectorApi}
        />
      ) : shouldDownloadModel ? (
        <ModelDownloadCard
          onClick={downloadModel}
          progress={downloadProgress}
        />
      ) : (
        <>
          <div className="mx-auto text-center">
            {/* Input */}
            <div className="mb-3 flex flex-col-reverse items-center justify-between gap-2 sm:flex-row">
              <div className="flex items-center self-start font-semibold sm:self-auto">
                <PenLine className="mr-2" size={16} />
                Paste your text below
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <PasteAction onClick={onPasteText} />
                <DeleteAction
                  onClick={onClearClick}
                  disabled={_isEmpty(text)}
                />
              </div>
            </div>
            <Textarea
              onChange={onChange}
              value={text}
              rows={10}
              placeholder="Type or paste the text you want to detect here..."
              autoFocus
            />
            {/* Char count block */}
            <div className="mt-3 w-full text-right text-xs text-neutral-400 dark:text-neutral-600">
              {_size(text)} chars
            </div>
          </div>

          <SectionGap />

          {/* Output */}
          <div
            className={clsx(
              'relative flex min-h-[300px] w-full flex-col items-center rounded-lg border p-6',
              'border-neutral-200 dark:border-neutral-700',
              'bg-white/80 dark:bg-neutral-900/80',
              'backdrop-blur'
            )}
          >
            {_isNull(results) ? (
              <div className="m-auto text-center text-lg font-bold text-neutral-500">
                <ChartColumn className="mx-auto mb-4 block" size={40} />
                <div>Waiting for input...</div>
              </div>
            ) : (
              <BarChart results={results} />
            )}
          </div>
        </>
      )}

      <ErrorDialog
        errorString="Something went wrong while detecting! Please try again later."
        open={error}
        onClose={resetError}
      />
    </>
  );
}
