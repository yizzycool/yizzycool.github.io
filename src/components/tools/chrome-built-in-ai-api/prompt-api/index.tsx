'use client';

import { UnsupportedApiTypes } from '../data/unsupported-types';
import useAiLanguageModel from '../hooks/use-ai-language-model';
import HeaderBlock from '../../components/header-block';
import LoadingSkeleton from '../components/loading-skeleton';
import SettingsPanel from './components/settings-panel';
import Chat from '../components/chat';
import UnsupportedCard from '../components/unsupported-card';
import ModelDownloadCard from '../components/model-download-card';
import ErrorDialog from '@/components/common/dialog/error';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import _values from 'lodash/values';

export default function PromptApi() {
  const {
    hasCheckedAIStatus,
    isApiSupported,
    // availability,
    error,
    options,
    isOptionUpdating,
    session,
    // prompt,
    promptStreaming,
    updateLanguageModel,
    resetModelWithCustomOptions,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
    resetError,
  } = useAiLanguageModel();

  return (
    <>
      <HeaderBlock />

      {/* Prompt */}
      {!hasCheckedAIStatus ? (
        <LoadingSkeleton />
      ) : !isApiSupported ? (
        <UnsupportedCard apiType={UnsupportedApiTypes.chromePromptApi} />
      ) : shouldDownloadModel ? (
        <ModelDownloadCard
          onClick={downloadModel}
          progress={downloadProgress}
        />
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

      <ErrorDialog
        errorString="Something went wrong while processing! Please try again later."
        open={error}
        onClose={resetError}
      />
    </>
  );
}
