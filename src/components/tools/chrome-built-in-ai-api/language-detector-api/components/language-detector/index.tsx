'use client';

import { ChangeEvent, useRef, useState } from 'react';
import useAiLanguageDetector from '../../../hooks/use-ai-language-detector';
import { LanguageDetectResults } from '../../../types/types';
import BarChart from './components/bar-chart';
import OtherFeatures from '../../../components/other-features';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import _values from 'lodash/values';

export default function LanguageDetector() {
  const [text, setText] = useState('');
  const [results, setResults] = useState<Array<LanguageDetectResults> | null>(
    null
  );

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isSupported, isPartialUnsupported, detect } = useAiLanguageDetector();

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
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

  if (_isNull(isSupported)) return null;

  if (!isSupported) {
    return <OtherFeatures type="unsupported" />;
  }

  if (_isNull(isPartialUnsupported)) return null;

  if (isPartialUnsupported) {
    return <OtherFeatures type="partialUnsupported" />;
  }

  return (
    <>
      <div className="mt-10 border-t border-neutral-700 px-10 pb-40 pt-10 text-left">
        <div className="mx-auto max-w-screen-sm text-center">
          {/* Input */}
          <div className="mb-4 text-xl font-bold">
            Type some text to detect the language
          </div>
          <textarea
            autoFocus
            className="block min-h-60 w-full flex-1 resize-none rounded-md border-none bg-transparent px-6 py-4 text-xl outline outline-neutral-400 focus:outline-sky-500"
            onChange={onChange}
            value={text}
          />
        </div>
        {/* Output */}
        <BarChart results={results} />
      </div>
      <OtherFeatures type="discoverMore" />
    </>
  );
}
