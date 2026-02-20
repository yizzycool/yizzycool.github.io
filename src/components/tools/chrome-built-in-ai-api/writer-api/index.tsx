'use client';

import { UnsupportedApiTypes } from '../data/unsupported-types';
import { LoaderCircle, PencilLine, PenLine } from 'lucide-react';
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
import SectionGap from '../../components/section-gap';
import Snackbar from '@/components/common/snackbar';
import Label from '@/components/common/label';

import _isEmpty from 'lodash/isEmpty';
import _size from 'lodash/size';
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
    setIsProcessing(true);
    await browserUtils.sleep(100);
    scrollToResultBlock();
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

      <SectionGap />

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
          <div className="absolute right-0 top-0">
            <Config
              options={options}
              isOptionUpdating={isOptionUpdating}
              updateOption={updateWriter}
            />
          </div>
          {/* Input */}
          <div className="mb-3 flex flex-col-reverse items-start justify-between gap-2 sm:flex-row sm:items-center">
            <Label htmlFor="text-textarea" icon={PenLine}>
              Start by adding your text
            </Label>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <PasteAction onClick={onPasteText} />
              <DeleteAction onClick={onClearClick} disabled={_isEmpty(text)} />
            </div>
          </div>
          <Textarea
            id="text-textarea"
            onChange={onChange}
            value={text}
            rows={10}
            placeholder="e.g. Draft a friendly email asking a coworker for a project update"
          />
          {/* Char count block */}
          <div className="mt-3 w-full text-right text-xs text-neutral-400 dark:text-neutral-600">
            {_size(text)} chars
          </div>

          <SectionGap size="sm" />

          {/* Action Button */}
          <div className="flex justify-end">
            <Button
              icon={isProcessing ? LoaderCircle : PencilLine}
              size="sm"
              rounded="lg"
              onClick={onProcessClick}
              disabled={_isEmpty(text) || isProcessing}
              iconClassName={isProcessing ? 'animate-spin' : ''}
            >
              {isProcessing ? 'Writing...' : 'Write'}
            </Button>
          </div>

          <SectionGap size="sm" />

          {/* Result */}
          <PromptResult results={results} isProcessing={isProcessing} />
        </>
      )}

      <Snackbar variant="error" open={error} onClose={resetError} />
    </div>
  );
}
