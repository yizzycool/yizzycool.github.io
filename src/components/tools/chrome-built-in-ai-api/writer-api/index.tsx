'use client';

import useAiWriter from '../hooks/use-ai-writer';
import Title from '../../components/title';
import Description from '../../components/description';
import SettingsPanel from './components/settings-panel';
import LoadingSkeleton from '../components/loading-skeleton';
import Chat from '../components/chat';
import ModelDownloadCard from '../components/model-download-card';
import UnsupportedCard from '../components/unsupported-card';
import ErrorDialog from '@/components/common/dialog/error';
import { UnsupportedApiTypes } from '../data/unsupported-types';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';

export default function WriterApi() {
  const {
    hasCheckedAIStatus,
    isApiSupported,
    // availability,
    error,
    options,
    isOptionUpdating,
    // write,
    writeStreaming,
    updateWriter,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
    resetError,
  } = useAiWriter();

  return (
    <>
      <header>
        <Title>Writer</Title>
        <Description>
          Generate high-quality text effortlessly using Chrome’s built-in Gemini
          AI - perfect for articles, emails, or creative writing with fast,
          natural, and accurate results.
        </Description>
      </header>

      {/* Summarizer */}
      {!hasCheckedAIStatus ? (
        <LoadingSkeleton />
      ) : !isApiSupported ? (
        <UnsupportedCard apiType={UnsupportedApiTypes.chromeTranslatorApi} />
      ) : shouldDownloadModel ? (
        <ModelDownloadCard
          onClick={downloadModel}
          progress={downloadProgress}
        />
      ) : (
        <>
          <div className="mx-auto max-w-screen-sm px-5 pb-40 pt-20 text-left">
            <div className="mx-auto max-w-screen-sm">
              <SettingsPanel
                options={options}
                isOptionUpdating={isOptionUpdating}
                updateWriter={updateWriter}
              />
              <Chat
                buttonText="Start"
                placeholder="enter a topic or idea"
                promptStreaming={writeStreaming}
                isOptionUpdating={isOptionUpdating}
              />
            </div>
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
