'use client';

import { UnsupportedApiTypes } from '../data/unsupported-types';
import useAiLanguageModel from '../hooks/use-ai-language-model';
import HeaderBlock from '../../components/header-block';
import LoadingSkeleton from '../components/loading-skeleton';
import Config from './components/config';
import Chat from './components/chat';
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
    // resetModelWithCustomOptions,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
    resetError,
  } = useAiLanguageModel();

  return (
    <div className="relative flex h-full flex-col text-left">
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
          <div className="absolute right-0 top-0">
            <Config
              options={options}
              isOptionUpdating={isOptionUpdating}
              updateOption={updateLanguageModel}
            />
          </div>
          <Chat
            placeholder="You can ask me anything!"
            promptStreaming={promptStreaming}
            session={session}
          />
        </>
      )}

      <ErrorDialog
        errorString="Something went wrong while processing! Please try again later."
        open={error}
        onClose={resetError}
      />
    </div>
  );
}
