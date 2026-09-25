'use client';

import type { ChangeEventHandler } from 'react';

import { useState } from 'react';
import { LoaderCircle, PenLine, WandSparkles } from 'lucide-react';
import { isEmpty } from 'lodash';

import browserUtils from '@/utils/browser-utils';
import useToolHotkeys, { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import { PasteAction } from '@/components/shared/action-button';
import { DeleteAction } from '@/components/shared/action-button';
import { Textarea } from '@/components/ui/textarea';

import useAiProofreader from '../hooks/use-ai-proofreader';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';
import HeaderBlock from '../../common/header-block';
import ExecuteBar from '../../common/execute-bar';
import SectionGap from '../../common/section-gap';
import LabelBar from '../../common/label-bar';
import AiStatusGate from '../ai-status-gate';
import TextTabs from '../text-tabs';
import Result from './result';

export default function ProofreaderApi() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<ProofreadResult>();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    hasCheckedAIStatus,
    isApiSupported,
    // availability,
    // options,
    // isOptionUpdating,
    proofread,
    // proofreadStreaming,
    // updateProofreader,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
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
    if (isEmpty(text) || isProcessing) return;
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
          { ...TOOL_HOTKEYS.process, label: 'Proofread' },
          TOOL_HOTKEYS.paste,
          TOOL_HOTKEYS.clear,
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap />

      <AiStatusGate
        hasCheckedAIStatus={hasCheckedAIStatus}
        isApiSupported={isApiSupported}
        apiType={UNSUPPORTED_API_TYPES.chromeProofreaderApi}
        shouldDownloadModel={shouldDownloadModel}
        downloadProgress={downloadProgress}
        downloadModel={downloadModel}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <TextTabs />
      </div>

      <SectionGap size="sm" />

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
        id="proofreader-textarea"
        onChange={onChange}
        value={text}
        rows={10}
        placeholder="Enter your text for grammar and style check..."
      />

      {/* Execute Bar */}
      <ExecuteBar
        label={isProcessing ? 'Proofreading...' : 'Proofread'}
        icon={isProcessing ? LoaderCircle : WandSparkles}
        iconClassName={isProcessing ? 'animate-spin' : ''}
        disabled={isEmpty(text) || isProcessing}
        onClick={onProcessClick}
        text={text}
        hotkeyLabel="Proofread"
      />

      <SectionGap size="sm" />

      <Result text={text} result={result} isProcessing={isProcessing} />
    </>
  );
}
