'use client';

import { useState } from 'react';
import Title from '../../components/title';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import useAiSummarizer from '../hooks/use-ai-summarizer';
import OtherFeatures from '../components/other-features';
import SettingsPanel from './components/settings-panel';
import { Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';

export default function SummarizerApi() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const {
    isSupported,
    isPartialUnsupported,
    options,
    isOptionUpadting,
    summarize,
    updateSummarizer,
  } = useAiSummarizer();

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

  return (
    <div className="mx-auto max-w-screen-2xl pt-[68px] text-center">
      <Title>Summarizer</Title>
      {_isNull(isSupported) ? null : !isSupported ? (
        <OtherFeatures type="unsupported" />
      ) : _isNull(isPartialUnsupported) ? null : isPartialUnsupported ? (
        <OtherFeatures type="partialUnsupported" />
      ) : (
        <>
          <div className="mt-10 px-10 pb-40 pt-20 text-left">
            <div className="mx-auto max-w-screen-sm">
              <SettingsPanel
                options={options}
                isOptionUpadting={isOptionUpadting}
                updateSummarizer={updateSummarizer}
              />
              {/* Input */}
              <div className="mb-4 mt-20 text-lg font-bold">Prompt</div>
              <div className="relative">
                <textarea
                  className="block min-h-60 w-full flex-1 resize-none rounded-md border-none bg-transparent px-6 py-4 text-lg outline outline-neutral-400 focus:outline-sky-500"
                  onChange={onChange}
                  value={text}
                />
                {isOptionUpadting && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-md bg-sky-500/20 px-4 backdrop-blur">
                    Update Summarizer...
                  </div>
                )}
              </div>
              <div className="mt-8 text-right">
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
                      <Sparkles className="absolute h-4 w-4 animate-ping" />
                      <Sparkles className="h-4 w-4" />
                    </div>
                  ) : null}
                </button>
              </div>
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
      )}
    </div>
  );
}
