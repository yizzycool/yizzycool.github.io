'use client';

import useAiRewriter from '../hooks/use-ai-rewriter';
import Title from '../../components/title';
import Description from '../../components/description';
import SettingsPanel from './components/settings-panel';
import LoadingSkeleton from '../components/loading-skeleton';
import Chat from '../components/chat';
import UnsupportedCard from '../components/unsupported-card';
import ModelDownloadCard from '../components/model-download-card';
import ErrorDialog from '@/components/common/dialog/error';
import { UnsupportedApiTypes } from '../data/unsupported-types';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';

export default function RewriterApi() {
  const {
    hasCheckedAIStatus,
    isApiSupported,
    // availability,
    error,
    options,
    isOptionUpdating,
    // rewrite,
    rewriteStreaming,
    updateRewriter,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
    resetError,
  } = useAiRewriter();

  return (
    <>
      <header>
        <Title>Rewriter</Title>
        <Description>
          Rewrite and improve any text instantly with Chrome’s built-in Gemini
          AI — enhance clarity, style, and tone while keeping meaning intact,
          all in seconds.
        </Description>
      </header>

      {/* Summarizer */}
      {!hasCheckedAIStatus ? (
        <LoadingSkeleton />
      ) : !isApiSupported ? (
        <UnsupportedCard apiType={UnsupportedApiTypes.chromeRewriter} />
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
                updateRewriter={updateRewriter}
              />
              <Chat
                buttonText="Open Rewriter"
                placeholder="enter some text to be rewritten"
                promptStreaming={rewriteStreaming}
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
