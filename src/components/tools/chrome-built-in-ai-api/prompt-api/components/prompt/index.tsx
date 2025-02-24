'use client';

import useAiLanguageModel from '../../../hooks/use-ai-language-model';
import OtherFeatures from '../../../components/other-features';
import Chat from '../chat';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import _values from 'lodash/values';

export default function Prompt() {
  const {
    isSupported,
    isPartialUnsupported,
    // prompt: _prompt,
    promptStreaming,
  } = useAiLanguageModel();

  if (_isNull(isSupported)) return null;

  if (!isSupported) {
    return <OtherFeatures type="unsupported" />;
  }

  if (_isNull(isPartialUnsupported)) return null;

  if (isPartialUnsupported) {
    return <OtherFeatures type="partialUnsupported" />;
  }

  return (
    <>
      <div className="mt-10 border-neutral-700 px-10 pt-20 text-left">
        <div className="mx-auto max-w-screen-sm text-center">
          <Chat promptStreaming={promptStreaming} />
        </div>
      </div>
      <OtherFeatures type="discoverMore" />
    </>
  );
}
