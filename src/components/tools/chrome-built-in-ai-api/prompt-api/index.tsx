'use client';

import useAiLanguageModel from '../hooks/use-ai-language-model';
import HeaderBlock from '../../header-block';
import LoadingSkeleton from '../loading-skeleton';
import Config from './config';
import Chat from './chat';
import UnsupportedCard from '../unsupported-card';
import ModelDownloadCard from '../model-download-card';
import SectionGap from '../../section-gap';
import Snackbar from '@/components/common/snackbar';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';

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
    <div className="relative flex h-full min-h-[calc(100dvh_-_68px)] flex-col text-left">
      <HeaderBlock />

      <SectionGap />

      {/* Prompt */}
      {!hasCheckedAIStatus ? (
        <LoadingSkeleton />
      ) : !isApiSupported ? (
        <UnsupportedCard apiType={UNSUPPORTED_API_TYPES.chromePromptApi} />
      ) : shouldDownloadModel ? (
        <ModelDownloadCard
          onClick={downloadModel}
          progress={downloadProgress}
        />
      ) : (
        <>
          <div className="absolute -top-4 right-0">
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

      <Snackbar variant="error" open={error} onClose={resetError} />
    </div>
  );
}
