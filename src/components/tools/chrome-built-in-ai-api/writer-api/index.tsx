'use client';

import type { ChangeEventHandler } from 'react';

import { useState } from 'react';
import { LoaderCircle, PencilLine, PenLine } from 'lucide-react';
import { isEmpty } from 'lodash';

import browserUtils from '@/utils/browser-utils';
import useToolHotkeys, { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import { PasteAction } from '@/components/shared/action-button';
import { DeleteAction } from '@/components/shared/action-button';
import { Textarea } from '@/components/ui/textarea';

import useAiWriter from '../hooks/use-ai-writer';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';
import HeaderBlock from '../../common/header-block';
import ExecuteBar from '../../common/execute-bar';
import SectionGap from '../../common/section-gap';
import LabelBar from '../../common/label-bar';
import AiStatusGate from '../ai-status-gate';
import TextTabs from '../text-tabs';
import PromptResult from '../prompt-result';
import Config from './config';

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

  const scrollToResultBlock = () => {
    const result = document.getElementById('result');
    if (!result) return;
    result.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'start',
    });
  };

  useToolHotkeys({
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
  });

  return (
    <>
      <HeaderBlock
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

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <TextTabs />
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

      {/* Execute Bar */}
      <ExecuteBar
        label={isProcessing ? 'Writing...' : 'Write'}
        icon={isProcessing ? LoaderCircle : PencilLine}
        iconClassName={isProcessing ? 'animate-spin' : ''}
        disabled={isEmpty(text) || isProcessing}
        onClick={onProcessClick}
        text={text}
        hotkeyLabel="Write"
      />

      <SectionGap size="sm" />

      {/* Result */}
      <PromptResult results={results} isProcessing={isProcessing} />
    </>
  );
}
