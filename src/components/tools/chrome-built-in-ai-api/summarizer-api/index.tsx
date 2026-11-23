'use client';

import type { ChangeEventHandler } from 'react';

import { useRef, useState } from 'react';
import { LoaderCircle, PenLine, Sparkles } from 'lucide-react';
import { isEmpty } from 'lodash';

import browserUtils from '@/utils/browser-utils';
import useToolHotkeys, { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import { DeleteAction, PasteAction } from '@/components/shared/action-button';
import { Textarea } from '@/components/ui/textarea';

import useAiSummarizer from '../hooks/use-ai-summarizer';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';
import HeaderBlock from '../../common/header-block';
import ExecuteBar from '../../common/execute-bar';
import SectionGap from '../../common/section-gap';
import LabelBar from '../../common/label-bar';
import AiStatusGate from '../ai-status-gate';
import TextTabs from '../text-tabs';
import PromptResult from '../prompt-result';
import Config from './config';

export default function SummarizerApi() {
  const [text, setText] = useState('');
  const [sourceSnapshot, setSourceSnapshot] = useState('');
  const [results, setResults] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    hasCheckedAIStatus,
    isApiSupported,
    options,
    isOptionUpdating,
    summarizeStreaming,
    updateSummarizer,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
  } = useAiSummarizer();

  const onPasteText = (value: string) => {
    setText(value);
  };

  const onClearClick = () => {
    setText('');
    setSourceSnapshot('');
    setResults('');
  };

  const onChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setText(e.target.value);
  };

  const scrollToResultBlock = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) return;
    const result = document.getElementById('result');
    if (!result) return;
    result.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'start',
    });
  };

  const onProcessClick = async () => {
    if (isEmpty(text) || isProcessing) return;
    setIsProcessing(true);
    setSourceSnapshot(text);
    await browserUtils.sleep(100);
    scrollToResultBlock();
    setResults('');
    await summarizeStreaming(text, (chunk) => {
      setResults((prev) => prev + chunk);
    });
    setIsProcessing(false);
  };

  useToolHotkeys(
    {
      onExecute: onProcessClick,
      onPaste: async () => {
        try {
          const clipText = await navigator.clipboard.readText();
          setText(clipText);
        } catch (_e) {
          // ignore
        }
      },
      onClear: onClearClick,
    },
    { target: textareaRef }
  );

  return (
    <>
      <HeaderBlock
        customShortcuts={[
          { ...TOOL_HOTKEYS.process, label: 'Summarize' },
          TOOL_HOTKEYS.paste,
          TOOL_HOTKEYS.clear,
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap />

      <AiStatusGate
        hasCheckedAIStatus={hasCheckedAIStatus}
        isApiSupported={isApiSupported}
        apiType={UNSUPPORTED_API_TYPES.chromeSummarizerApi}
        shouldDownloadModel={shouldDownloadModel}
        downloadProgress={downloadProgress}
        downloadModel={downloadModel}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <TextTabs />
        <Config
          options={options}
          isOptionUpdating={isOptionUpdating}
          updateOption={updateSummarizer}
        />
      </div>

      <SectionGap size="sm" />

      {/* Editorial Split Editor (Desktop 7:5, Mobile Stacked) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <div className="flex flex-col lg:col-span-7">
          <LabelBar
            label="Source Article or Notes"
            icon={PenLine}
            htmlFor="summarizer-textarea"
          >
            <PasteAction onClick={onPasteText} />
            <DeleteAction onClick={onClearClick} disabled={isEmpty(text)} />
          </LabelBar>
          <Textarea
            ref={textareaRef}
            id="summarizer-textarea"
            onChange={onChange}
            value={text}
            rows={14}
            className="min-h-[340px] lg:h-[420px]"
            placeholder="Type or paste an article, meeting notes, or document here to summarize..."
          />
          <ExecuteBar
            label={isProcessing ? 'Summarizing...' : 'Summarize'}
            icon={isProcessing ? LoaderCircle : Sparkles}
            iconClassName={isProcessing ? 'animate-spin' : ''}
            disabled={isEmpty(text) || isProcessing}
            onClick={onProcessClick}
            text={text}
          />
        </div>

        <div className="lg:col-span-5">
          <PromptResult
            label="Summary"
            results={results}
            isProcessing={isProcessing}
            originalText={sourceSnapshot || text}
            showCharCount
            showCompressionRatio
            panelClassName="min-h-[340px] lg:h-[420px]"
          />
        </div>
      </div>
    </>
  );
}
