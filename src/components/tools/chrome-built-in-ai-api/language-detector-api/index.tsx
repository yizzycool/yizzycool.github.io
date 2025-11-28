'use client';

import clsx from 'clsx';
import { useRef, useState } from 'react';
import { ChartColumn, PenLine } from 'lucide-react';
import useAiLanguageDetector from '../hooks/use-ai-language-detector';
import Title from '../../components/title';
import BarChart from './components/bar-chart';
import Description from '../../components/description';
import Textarea from '@/components/common/textarea';
import PasteAction from '@/components/common/action-button/paste';
import DeleteAction from '@/components/common/action-button/delete';
import LoadingSkeleton from '../components/loading-skeleton';
import UnsupportedCard from '../components/unsupported-card';
import ModelDownloadCard from '../components/model-download-card';
import ErrorDialog from '@/components/common/dialog/error';
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
      <header>
        <Title>Language Detector</Title>
        <Description>
          Instantly detect the language of any text with Chrome’s built-in
          Gemini AI — fast, accurate, and reliable multilingual detection
          without setup or API key.
        </Description>
      </header>

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
          <div className="mt-16 text-left">
            <div className="mx-auto text-center">
              {/* Input */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center font-semibold">
                  <PenLine className="mr-2" size={16} />
                  Paste your text below
                </div>
                <div className="flex items-center gap-2">
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
              />
              {/* Char count block */}
              <div className="mt-3 w-full text-right text-xs text-neutral-400 dark:text-neutral-600">
                Length: {_size(text)} chars
              </div>
            </div>
            {/* Output */}
            <div
              className={clsx(
                'relative mt-10 flex min-h-[300px] w-full flex-col items-center rounded-lg border p-6',
                'border-neutral-200 dark:border-neutral-700',
                'bg-white dark:bg-neutral-800'
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
