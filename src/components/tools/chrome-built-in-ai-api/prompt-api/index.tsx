'use client';

import useAiLanguageModel from '../hooks/use-ai-language-model';
import Title from '../../components/title';
import Unsupported, {
  UnsupportedApiTypes,
  UnsupportedTypes,
} from '../../components/unsupported';
import LoadingSkeleton from '../components/loading-skeleton';
import SettingsPanel from './components/settings-panel';
import Chat from '../components/chat';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import _values from 'lodash/values';

export default function PromptApi() {
  const {
    isSupported,
    isPartialUnsupported,
    options,
    isOptionUpdating,
    session,
    // prompt: _prompt,
    promptStreaming,
    updateLanguageModel,
    resetModelWithCustomOptions,
  } = useAiLanguageModel();

  const isLoading =
    _isNull(isSupported) || (isSupported && _isNull(isPartialUnsupported));

  return (
    <div className="mx-auto text-center">
      <Title>Gemini Nano (Prompt API)</Title>
      {/* Prompt */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : !isSupported ? (
        <Unsupported
          apiType={UnsupportedApiTypes.chromePromptApi}
          type={UnsupportedTypes.unsupported}
        />
      ) : isPartialUnsupported ? (
        <Unsupported type={UnsupportedTypes.partialUnsupported} />
      ) : (
        <>
          <div className="mx-auto max-w-screen-sm border-neutral-700 px-5 py-20 text-left">
            <SettingsPanel
              options={options}
              isOptionUpdating={isOptionUpdating}
              updateLanguageModel={updateLanguageModel}
            />
            <Chat
              buttonText="Start a Chat"
              placeholder="You can ask me anything!"
              promptStreaming={promptStreaming}
              resetModelWithCustomOptions={resetModelWithCustomOptions}
              session={session}
              isOptionUpdating={isOptionUpdating}
            />
          </div>
        </>
      )}
    </div>
  );
}
