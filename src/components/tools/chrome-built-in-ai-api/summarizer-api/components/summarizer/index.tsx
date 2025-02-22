'use client';

import { ChangeEvent, useState } from 'react';
import useAiSummarizer from '../../../hooks/use-ai-summarizer';
import OtherFeatures from '../../../components/other-features';
import Markdown from 'react-markdown';
import { SparklesIcon } from '@heroicons/react/20/solid';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';

export default function Summarizer() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { isSupported, isPartialUnsupported, summarize } = useAiSummarizer();

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setText(text);
  };

  const detectString = async (text: string) => {
    if (busy) return;
    if (_isEmpty(text)) {
      setResult(null);
    } else {
      setBusy(true);
      setResult(null);
      const result = await summarize(text);
      setResult(result);
      setBusy(false);
    }
  };

  if (_isNull(isSupported) || _isNull(isPartialUnsupported)) return null;

  if (!isSupported) {
    return <OtherFeatures type="unsupported" />;
  }

  if (isPartialUnsupported) {
    return <OtherFeatures type="partialUnsupported" />;
  }

  return (
    <>
      <div className="mt-10 border-t border-neutral-700 px-10 pb-40 pt-10 text-left">
        <div className="mx-auto max-w-screen-sm">
          {/* Input */}
          <div className="mb-4 flex items-center justify-between text-xl font-bold">
            Type some text to generate summarization
            <button
              className="relative ml-4 rounded-md bg-sky-700 p-4 py-2 text-base hover:bg-sky-700/80 disabled:bg-gray-500"
              onClick={() => detectString(text)}
              disabled={!text || busy}
            >
              <div className="data-[busy=true]:invisible" data-busy={busy}>
                Summarize
              </div>
              {/* Loading */}
              {busy ? (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <SparklesIcon className="absolute h-4 w-4 animate-ping" />
                  <SparklesIcon className="h-4 w-4" />
                </div>
              ) : null}
            </button>
          </div>
          <textarea
            autoFocus
            className="block min-h-60 w-full flex-1 resize-none rounded-md border-none bg-transparent px-6 py-4 text-lg outline outline-neutral-400 focus:outline-sky-500"
            onChange={onChange}
            value={text}
          />
          {/* Output */}
          {!_isNull(result) && (
            <>
              <div className="mb-4 mt-10 flex items-center justify-between text-xl font-bold">
                Summarization
              </div>
              <Markdown className="rounded-md border border-neutral-500 px-6 py-4 text-lg">
                {result}
              </Markdown>
            </>
          )}
        </div>
      </div>
      <OtherFeatures type="discoverMore" />
    </>
  );
}
