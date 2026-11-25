'use client';

import type { ChangeEventHandler } from 'react';

import { useRef, useState } from 'react';
import { LoaderCircle, PencilLine, PenLine } from 'lucide-react';
import { isEmpty } from 'lodash';

import browserUtils from '@/utils/browser-utils';
import useToolHotkeys, { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import { DeleteAction, PasteAction } from '@/components/shared/action-button';
import { Textarea } from '@/components/ui/textarea';

import useAiWriter from '../hooks/use-ai-writer';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';
import HeaderBlock from '../../common/header-block';
import ExecuteBar from '../../common/execute-bar';
import SectionGap from '../../common/section-gap';
import LabelBar from '../../common/label-bar';
import AiStatusGate from '../ai-status-gate';
import PromptResult from '../prompt-result';
import Config from './config';

export default function WriterApi() {
  const [text, setText] = useState('');
  const [results, setResults] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    setText(value);
  };

  const onClearClick = () => {
    setText('');
    setResults('');
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
    await browserUtils.sleep(100);
    scrollToResultBlock();
    setResults('');
    await writeStreaming(text, (chunk) => {
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
        headerAction={
          <Config
            options={options}
            isOptionUpdating={isOptionUpdating}
            updateOption={updateWriter}
          />
        }
        customShortcuts={[
          { ...TOOL_HOTKEYS.process, label: 'Write' },
          TOOL_HOTKEYS.paste,
          TOOL_HOTKEYS.clear,
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap />

      <AiStatusGate
        hasCheckedAIStatus={hasCheckedAIStatus}
        isApiSupported={isApiSupported}
        apiType={UNSUPPORTED_API_TYPES.chromeWriter}
        shouldDownloadModel={shouldDownloadModel}
        downloadProgress={downloadProgress}
        downloadModel={downloadModel}
      />

      {/* Editorial Split Editor (Desktop 6:6, Mobile Stacked) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <div className="flex flex-col lg:col-span-6">
          <LabelBar
            label="Prompt & Outline"
            icon={PenLine}
            htmlFor="writer-textarea"
          >
            <PasteAction onClick={onPasteText} />
            <DeleteAction onClick={onClearClick} disabled={isEmpty(text)} />
          </LabelBar>
          <Textarea
            ref={textareaRef}
            id="writer-textarea"
            onChange={onChange}
            value={text}
            rows={14}
            className="min-h-[340px] lg:h-[420px]"
            placeholder="e.g. Draft a friendly email asking a coworker for a project update"
          />
          <ExecuteBar
            label={isProcessing ? 'Writing...' : 'Write'}
            icon={isProcessing ? LoaderCircle : PencilLine}
            iconClassName={isProcessing ? 'animate-spin' : ''}
            disabled={isEmpty(text) || isProcessing}
            onClick={onProcessClick}
            text={text}
          />
        </div>

        <div className="lg:col-span-6">
          <PromptResult
            label="Generated Draft"
            results={results}
            isProcessing={isProcessing}
            showCharCount
            panelClassName="min-h-[340px] lg:h-[420px]"
          />
        </div>
      </div>
    </>
  );
}
