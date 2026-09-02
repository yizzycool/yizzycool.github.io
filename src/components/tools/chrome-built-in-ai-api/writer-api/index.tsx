'use client';

import { LoaderCircle, PencilLine, PenLine } from 'lucide-react';
import { ChangeEventHandler, useState } from 'react';
import { isEmpty, size } from 'lodash';

import useAiWriter from '../hooks/use-ai-writer';
import browserUtils from '@/utils/browser-utils';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';
import HeaderBlock from '../../common/header-block';
import SystemChecking from '../system-checking';
import UnsupportedCard from '../unsupported-card';
import ModelDownloadCard from '../model-download-card';
import PasteAction from '@/components/common/action-button/paste';
import DeleteAction from '@/components/common/action-button/delete';
import Textarea from '@/components/common/textarea';
import Config from './config';
import { Button } from '@/components/common/button';
import PromptResult from '../prompt-result';
import SectionGap from '../../common/section-gap';
import LabelBar from '../../common/label-bar';

export default function WriterApi() {
  const [text, setText] = useState('');
  const [results, setResults] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    hasCheckedAIStatus,
    isApiSupported,
    shouldDownloadModel,
    downloadProgress,
    options,
    isOptionUpdating,
    writeStreaming,
    updateWriter,
    downloadModel,
  } = useAiWriter();

  const onChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setText(e.target.value);
  };

  const onPasteText = (value: string) => {
    setText(value as string);
  };

  const onClearClick = () => {
    setText('');
    setResults('');
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
    <>
      <HeaderBlock />

      <SectionGap />

      {!hasCheckedAIStatus ? (
        <SystemChecking />
      ) : !isApiSupported ? (
        <UnsupportedCard apiType={UNSUPPORTED_API_TYPES.chromeWriter} />
      ) : shouldDownloadModel ? (
        <ModelDownloadCard
          onClick={downloadModel}
          progress={downloadProgress}
        />
      ) : null}

      <div className="absolute right-4 top-24">
        <Config
          options={options}
          isOptionUpdating={isOptionUpdating}
          updateOption={updateWriter}
        />
      </div>
      {/* Input */}
      <LabelBar
        label="Start by adding your text"
        icon={PenLine}
        htmlFor="text-textarea"
      >
        <PasteAction onClick={onPasteText} />
        <DeleteAction onClick={onClearClick} disabled={isEmpty(text)} />
      </LabelBar>
      <Textarea
        id="text-textarea"
        onChange={onChange}
        value={text}
        rows={10}
        placeholder="e.g. Draft a friendly email asking a coworker for a project update"
      />
      {/* Char count block */}
      <div className="mt-3 w-full text-right text-xs text-slate-400 dark:text-slate-600">
        {size(text)} chars
      </div>

      <SectionGap size="sm" />

      {/* Action Button */}
      <div className="flex justify-end">
        <Button
          icon={isProcessing ? LoaderCircle : PencilLine}
          size="sm"
          rounded="lg"
          onClick={onProcessClick}
          disabled={isEmpty(text) || isProcessing}
          iconClassName={isProcessing ? 'animate-spin' : ''}
        >
          {isProcessing ? 'Writing...' : 'Write'}
        </Button>
      </div>

      <SectionGap size="sm" />

      {/* Result */}
      <PromptResult results={results} isProcessing={isProcessing} />
    </>
  );
}
