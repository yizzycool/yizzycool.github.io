'use client';

import { LanguageDetectResults } from '../types/types';
import { useRef, useState } from 'react';
import useAiLanguageDetector from '../hooks/use-ai-language-detector';
import Title from '../../components/title';
import BarChart from './components/bar-chart';
import Unsupported from '../../components/unsupported';
import LoadingSkeleton from '../components/loading-skeleton';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import _values from 'lodash/values';

export default function LanguageDetectorApi() {
  const [text, setText] = useState('');
  const [results, setResults] = useState<Array<LanguageDetectResults> | null>(
    null
  );

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isSupported, isPartialUnsupported, detect } = useAiLanguageDetector();

  const isLoading =
    _isNull(isSupported) || (isSupported && _isNull(isPartialUnsupported));

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setText(text);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => detectString(text), 500);
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
    <div className="mx-auto max-w-screen-2xl pt-[68px] text-center">
      <Title>Language Detector</Title>
      {/* Language Detector */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : !isSupported ? (
        <Unsupported type="unsupported" />
      ) : isPartialUnsupported ? (
        <Unsupported type="partialUnsupported" />
      ) : (
        <>
          <div className="mt-10 px-5 pb-40 pt-20 text-left">
            <div className="mx-auto max-w-screen-sm text-center">
              {/* Input */}
              <div className="mb-4 text-lg font-bold">
                Type some text to detect the language
              </div>
              <textarea
                autoFocus
                className="block min-h-60 w-full flex-1 resize-none rounded-md border border-neutral-400/50 bg-transparent px-6 py-4 text-xl focus:outline-none"
                onChange={onChange}
                value={text}
              />
            </div>
            {/* Output */}
            <BarChart results={results} />
          </div>
        </>
      )}
    </div>
  );
}
