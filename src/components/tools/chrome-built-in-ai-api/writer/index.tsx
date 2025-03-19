'use client';

import useAiWriter from '../hooks/use-ai-writer';
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

export default function WriterApi() {
  const {
    isSupported,
    isPartialUnsupported,
    options,
    isOptionUpdating,
    write: _write,
    writeStreaming,
    updateWriter,
  } = useAiWriter();

  const isLoading =
    _isNull(isSupported) || (isSupported && _isNull(isPartialUnsupported));

  return (
    <div className="mx-auto pt-[68px] text-center">
      <Title>Writer</Title>
      {/* Summarizer */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : !isSupported ? (
        <Unsupported
          apiType={UnsupportedApiTypes.chromeWriter}
          type={UnsupportedTypes.unsupported}
        />
      ) : isPartialUnsupported ? (
        <Unsupported type={UnsupportedTypes.partialUnsupported} />
      ) : (
        <>
          <div className="mx-auto mt-10 max-w-screen-sm px-5 pb-40 pt-20 text-left">
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
    </div>
  );
}
