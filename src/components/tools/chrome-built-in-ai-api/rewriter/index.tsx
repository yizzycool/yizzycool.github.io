'use client';

import useAiRewriter from '../hooks/use-ai-rewriter';
import Title from '../../components/title';
import Unsupported, {
  UnsupportedApiTypes,
  UnsupportedTypes,
} from '../../components/unsupported';
import SettingsPanel from './components/settings-panel';
import LoadingSkeleton from '../components/loading-skeleton';
import Chat from '../components/chat';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';

export default function RewriterApi() {
  const {
    isSupported,
    isPartialUnsupported,
    options,
    isOptionUpdating,
    rewrite: _rewrite,
    rewriteStreaming,
    updateRewriter,
  } = useAiRewriter();

  const isLoading =
    _isNull(isSupported) || (isSupported && _isNull(isPartialUnsupported));

  return (
    <div className="mx-auto text-center">
      <Title>Rewriter</Title>
      {/* Summarizer */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : !isSupported ? (
        <Unsupported
          apiType={UnsupportedApiTypes.chromeRewriter}
          type={UnsupportedTypes.unsupported}
        />
      ) : isPartialUnsupported ? (
        <Unsupported type={UnsupportedTypes.partialUnsupported} />
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
    </div>
  );
}
