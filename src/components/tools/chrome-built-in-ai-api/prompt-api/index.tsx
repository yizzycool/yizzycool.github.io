'use client';

import useAiLanguageModel from '../hooks/use-ai-language-model';
import Title from '../../components/title';
import Chat from './components/chat';
import Unsupported from '../../components/unsupported';
import LoadingSkeleton from '../components/loading-skeleton';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import _values from 'lodash/values';

export default function PromptApi() {
  const {
    isSupported,
    isPartialUnsupported,
    // prompt: _prompt,
    promptStreaming,
  } = useAiLanguageModel();

  const isLoading =
    _isNull(isSupported) || (isSupported && _isNull(isPartialUnsupported));

  return (
    <div className="mx-auto max-w-screen-2xl pt-[68px] text-center">
      <Title>Gemini Nano (Prompt API)</Title>
      {/* Prompt */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : !isSupported ? (
        <Unsupported type="unsupported" />
      ) : isPartialUnsupported ? (
        <Unsupported type="partialUnsupported" />
      ) : (
        <>
          <div className="mt-10 border-neutral-700 px-5 py-20 text-left">
            <div className="mx-auto max-w-screen-sm text-center">
              <Chat promptStreaming={promptStreaming} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
