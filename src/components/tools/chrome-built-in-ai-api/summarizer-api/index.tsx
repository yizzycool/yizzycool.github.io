'use client';

import { LoaderCircle, PenLine, Sparkles } from 'lucide-react';
import { ChangeEventHandler, useState } from 'react';
import { isEmpty, size } from 'lodash';

import useAiSummarizer from '../hooks/use-ai-summarizer';
import browserUtils from '@/utils/browser-utils';
import HeaderBlock from '../../header-block';
import LoadingSkeleton from '../loading-skeleton';
import UnsupportedCard from '../unsupported-card';
import ModelDownloadCard from '../model-download-card';
import PasteAction from '@/components/common/action-button/paste';
import DeleteAction from '@/components/common/action-button/delete';
import Textarea from '@/components/common/textarea';
import Config from './config';
import Button from '@/components/common/button';
import PromptResult from '../prompt-result';
import SectionGap from '../../section-gap';
import Snackbar from '@/components/common/snackbar';
import Label from '@/components/common/label';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';

export default function SummarizerApi() {
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
    // summarize,
    summarizeStreaming,
    updateSummarizer,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
    resetError,
  } = useAiSummarizer();

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
    await summarizeStreaming(text, (chunk) => {
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
        <UnsupportedCard apiType={UNSUPPORTED_API_TYPES.chromeSummarizerApi} />
      ) : shouldDownloadModel ? (
        <ModelDownloadCard
          onClick={downloadModel}
          progress={downloadProgress}
        />
      ) : (
        <>
          {/* <div className="mb-6 flex items-center justify-end"> */}
          <div className="absolute right-0 top-0">
            <Config
              options={options}
              isOptionUpdating={isOptionUpdating}
              updateOption={updateSummarizer}
            />
          </div>
          {/* Input */}
          <div className="mb-3 flex flex-col-reverse items-start justify-between gap-2 sm:flex-row sm:items-center">
            <Label htmlFor="text-textarea" icon={PenLine}>
              Start by adding your text
            </Label>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <PasteAction onClick={onPasteText} />
              <DeleteAction onClick={onClearClick} disabled={isEmpty(text)} />
            </div>
          </div>
          <Textarea
            id="text-textarea"
            onChange={onChange}
            value={text}
            rows={10}
            placeholder="Type or paste the artice or text here to summarize..."
          />
          {/* Char count block */}
          <div className="mt-3 w-full text-right text-xs text-neutral-400 dark:text-neutral-600">
            {size(text)} chars
          </div>

          <SectionGap size="sm" />

          {/* Action Button */}
          <div className="flex justify-end">
            <Button
              icon={isProcessing ? LoaderCircle : Sparkles}
              size="sm"
              rounded="lg"
              onClick={onProcessClick}
              disabled={isEmpty(text) || isProcessing}
              iconClassName={isProcessing ? 'animate-spin' : ''}
            >
              {isProcessing ? 'Summarizing' : 'Summarize'}
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
