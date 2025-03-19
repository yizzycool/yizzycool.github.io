'use client';

import useAiSummarizer from '../hooks/use-ai-summarizer';
import Title from '../../components/title';
import Unsupported from '../../components/unsupported';
import SettingsPanel from './components/settings-panel';
import LoadingSkeleton from '../components/loading-skeleton';
import Chat from '../components/chat';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';

export default function SummarizerApi() {
  const {
    isSupported,
    isPartialUnsupported,
    options,
    isOptionUpdating,
    summarize: _summarize,
    summarizeStreaming,
    updateSummarizer,
  } = useAiSummarizer();

  const isLoading =
    _isNull(isSupported) || (isSupported && _isNull(isPartialUnsupported));

  return (
    <div className="mx-auto pt-[68px] text-center">
      <Title>Summarizer</Title>
      {/* Summarizer */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : !isSupported ? (
        <Unsupported type="unsupported" />
      ) : isPartialUnsupported ? (
        <Unsupported type="partialUnsupported" />
      ) : (
        <>
          <div className="mx-auto mt-10 max-w-screen-sm px-5 pb-40 pt-20 text-left">
            <div className="mx-auto max-w-screen-sm">
              <SettingsPanel
                options={options}
                isOptionUpdating={isOptionUpdating}
                updateSummarizer={updateSummarizer}
              />
              <Chat
                buttonText="Start"
                placeholder="type some text to be summarized"
                promptStreaming={summarizeStreaming}
                isOptionUpdating={isOptionUpdating}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
