'use client';

import { LoaderCircle, PenLine, WandSparkles } from 'lucide-react';
import { ChangeEventHandler, useState } from 'react';

import useAiProofreader from '../hooks/use-ai-proofreader';
import browserUtils from '@/utils/browser-utils';
import HeaderBlock from '../../components/header-block';
import LoadingSkeleton from '../components/loading-skeleton';
import UnsupportedCard from '../components/unsupported-card';
import ModelDownloadCard from '../components/model-download-card';
import PasteAction from '@/components/common/action-button/paste';
import DeleteAction from '@/components/common/action-button/delete';
import Textarea from '@/components/common/textarea';
import Button from '@/components/common/button';
import SectionGap from '../../components/section-gap';
import Snackbar from '@/components/common/snackbar';
import Label from '@/components/common/label';
import Result from './components/result';
import { UnsupportedApiTypes } from '../data/unsupported-types';

import _isNull from 'lodash/isNull';
import _isEmpty from 'lodash/isEmpty';
import _size from 'lodash/size';
import _slice from 'lodash/slice';
import _last from 'lodash/last';
import _range from 'lodash/range';

export default function ProofreaderApi() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<ProofreadResult>();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    hasCheckedAIStatus,
    isApiSupported,
    // availability,
    error,
    errorMessage,
    // options,
    // isOptionUpdating,
    proofread,
    // proofreadStreaming,
    // updateProofreader,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
    resetError,
  } = useAiProofreader();

  const onPasteText = (value: string) => {
    setText(value as string);
  };

  const onClearClick = () => {
    setText('');
    setResult(undefined);
  };

  const onChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setText(e.target.value);
    updateTextareaHeight();
  };

  const updateTextareaHeight = () => {
    const ta = document.getElementById('proofreader-textarea');
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  };

  const onProcessClick = async () => {
    setIsProcessing(true);
    await browserUtils.sleep(100);
    scrollToResultBlock();
    setResult(undefined);
    const proofreadResults = await proofread(text);
    if (proofreadResults) {
      setResult(proofreadResults);
    }
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
        <UnsupportedCard apiType={UnsupportedApiTypes.chromeProofreaderApi} />
      ) : shouldDownloadModel ? (
        <ModelDownloadCard
          onClick={downloadModel}
          progress={downloadProgress}
        />
      ) : (
        <>
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
            id="proofreader-textarea"
            onChange={onChange}
            value={text}
            rows={10}
            placeholder="Enter your text for grammar and style check..."
            autoFocus
          />
          {/* Char count block */}
          <div className="mt-3 w-full text-right text-xs text-neutral-400 dark:text-neutral-600">
            {_size(text)} chars
          </div>

          <SectionGap size="sm" />

          {/* Action Button */}
          <div className="flex justify-end">
            <Button
              icon={isProcessing ? LoaderCircle : WandSparkles}
              size="sm"
              rounded="lg"
              onClick={onProcessClick}
              disabled={_isEmpty(text) || isProcessing}
              iconClassName={isProcessing ? 'animate-spin' : ''}
            >
              {isProcessing ? 'Proofreading...' : 'Proofread'}
            </Button>
          </div>

          <SectionGap size="sm" />

          <Result text={text} result={result} isProcessing={isProcessing} />
        </>
      )}

      <Snackbar
        variant="error"
        open={error}
        onClose={resetError}
        content={errorMessage}
      />
    </div>
  );
}
