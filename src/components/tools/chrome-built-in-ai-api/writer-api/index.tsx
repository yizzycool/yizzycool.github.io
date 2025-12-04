'use client';

import { UnsupportedApiTypes } from '../data/unsupported-types';
import { PencilLine, PenLine } from 'lucide-react';
import { ChangeEventHandler, useState } from 'react';
import useAiWriter from '../hooks/use-ai-writer';
import browserUtils from '@/utils/browser-utils';
import HeaderBlock from '../../components/header-block';
import LoadingSkeleton from '../components/loading-skeleton';
import UnsupportedCard from '../components/unsupported-card';
import ModelDownloadCard from '../components/model-download-card';
import PasteAction from '@/components/common/action-button/paste';
import DeleteAction from '@/components/common/action-button/delete';
import Textarea from '@/components/common/textarea';
import Config from './components/config';
import Button from '@/components/common/button';
import PromptResult from '../components/prompt-result';
import ErrorDialog from '@/components/common/dialog/error';
import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import _size from 'lodash/size';
import _slice from 'lodash/slice';
import _last from 'lodash/last';
import _range from 'lodash/range';

export default function WriterApi() {
  const [text, setText] = useState('');
  const [results, setResults] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

  const onPasteText = (value: string) => {
    setText(value as string);
  };

  const onClearClick = () => {
    setText('');
    setResults('');
  };

  const onChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setText(e.target.value);
  };

  const onProcessClick = async () => {
    scrollToResultBlock();
    await browserUtils.sleep(500);
    setIsProcessing(true);
    setResults('');
    await writeStreaming(text, (chunk) => {
      setResults((prev) => prev + chunk);
    });
    setIsProcessing(false);
  };

  const scrollToResultBlock = () => {
    const result = document.getElementById('result');
    if (!result) return;
    result.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'start',
    });
  };

  return (
    <div className="relative">
      <HeaderBlock />

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
        <div className="mt-8 text-left sm:mt-16">
          <div className="absolute right-0 top-0">
            <Config
              options={options}
              isOptionUpdating={isOptionUpdating}
              updateOption={updateWriter}
            />
          </div>
          {/* Input */}
          <div className="mb-3 flex flex-col-reverse items-center justify-between gap-2 sm:flex-row">
            <div className="flex items-center self-start font-semibold sm:self-auto">
              <PenLine className="mr-2" size={16} />
              Paste your text below
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <PasteAction onClick={onPasteText} />
              <DeleteAction onClick={onClearClick} disabled={_isEmpty(text)} />
            </div>
          </div>
          <Textarea
            onChange={onChange}
            value={text}
            rows={10}
            placeholder="e.g. Draft a friendly email asking a coworker for a project update"
          />
          {/* Char count block */}
          <div className="mt-3 w-full text-right text-xs text-neutral-400 dark:text-neutral-600">
            {_size(text)} chars
          </div>

          {/* Action Button */}
          <div className="mt-10 flex justify-end">
            <Button
              icon={PencilLine}
              rounded="lg"
              onClick={onProcessClick}
              disabled={_isEmpty(text) || isProcessing}
            >
              {isProcessing ? (
                <>
                  Writing
                  {_range(3).map((t) => (
                    <span
                      key={t}
                      className={`inline-block animate-bounce delay-${t * 100}`}
                    >
                      .
                    </span>
                  ))}
                </>
              ) : (
                'Write'
              )}
            </Button>
          </div>

          {/* Result */}
          <PromptResult results={results} isProcessing={isProcessing} />
        </div>
      )}

      <ErrorDialog
        errorString="Something went wrong while processing! Please try again later."
        open={error}
        onClose={resetError}
      />
    </div>
  );
}
