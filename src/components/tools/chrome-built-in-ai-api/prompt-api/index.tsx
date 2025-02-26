'use client';

import useAiLanguageModel from '../hooks/use-ai-language-model';
import Title from '../../components/title';
import OtherFeatures from '../components/other-features';
import Chat from './components/chat';
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

  return (
    <div className="mx-auto max-w-screen-2xl pt-[68px] text-center">
      <Title>Gemini Nano (Prompt API)</Title>
      {_isNull(isSupported) ? null : !isSupported ? (
        <OtherFeatures type="unsupported" />
      ) : _isNull(isPartialUnsupported) ? null : isPartialUnsupported ? (
        <OtherFeatures type="partialUnsupported" />
      ) : (
        <>
          <div className="mt-10 border-neutral-700 px-10 py-20 text-left">
            <div className="mx-auto max-w-screen-sm text-center">
              <Chat promptStreaming={promptStreaming} />
            </div>
          </div>
          <OtherFeatures type="discoverMore" />
        </>
      )}
    </div>
  );
}
