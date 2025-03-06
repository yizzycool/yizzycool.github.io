'use client';

import useAiLanguageModel from '../hooks/use-ai-language-model';
import Title from '../../components/title';
import Chat from './components/chat';
import Unsupported from '../../components/unsupported';
import LoadingSkeleton from '../components/loading-skeleton';
import SettingsPanel from './components/settings-panel';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import _values from 'lodash/values';

export default function PromptApi() {
  const {
    isSupported,
    isPartialUnsupported,
    options,
    isOptionUpdating,
    // prompt: _prompt,
    promptStreaming,
    updateLanguageModel,
    clearLanguageModel,
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
          <div className="mx-auto mt-10 max-w-screen-sm border-neutral-700 px-5 py-20 text-left">
            <SettingsPanel
              options={options}
              isOptionUpdating={isOptionUpdating}
              updateLanguageModel={updateLanguageModel}
            />
            <div className="mt-20 flex items-center justify-center text-center">
              <Chat
                promptStreaming={promptStreaming}
                clearLanguageModel={clearLanguageModel}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
