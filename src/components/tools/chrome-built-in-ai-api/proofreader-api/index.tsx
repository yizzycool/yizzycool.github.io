'use client';

import type { ChangeEventHandler } from 'react';

import { useRef, useState } from 'react';
import { LoaderCircle, PenLine, WandSparkles } from 'lucide-react';
import { isEmpty } from 'lodash';

import browserUtils from '@/utils/browser-utils';
import toast from '@/utils/toast';
import useToolHotkeys, { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import { DeleteAction, PasteAction } from '@/components/shared/action-button';
import { Textarea } from '@/components/ui/textarea';

import useAiProofreader from '../hooks/use-ai-proofreader';
import { UNSUPPORTED_API_TYPES } from '../data/unsupported-types';
import HeaderBlock from '../../common/header-block';
import ExecuteBar from '../../common/execute-bar';
import SectionGap from '../../common/section-gap';
import LabelBar from '../../common/label-bar';
import AiStatusGate from '../ai-status-gate';
import Result from './result';

export default function ProofreaderApi() {
  const [text, setText] = useState('');
  const [sourceSnapshot, setSourceSnapshot] = useState('');
  const [result, setResult] = useState<ProofreadResult>();
  const [isProcessing, setIsProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    hasCheckedAIStatus,
    isApiSupported,
    proofread,
    shouldDownloadModel,
    downloadModel,
    downloadProgress,
  } = useAiProofreader();

  const onPasteText = (value: string) => {
    setText(value);
  };

  const onClearClick = () => {
    setText('');
    setSourceSnapshot('');
    setResult(undefined);
  };

  const onChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setText(e.target.value);
  };

  const scrollToResultBlock = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) return;
    const el = document.getElementById('result');
    if (!el) return;
    el.scrollIntoView({
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
    setResult(undefined);
    const proofreadResults = await proofread(text);
    if (proofreadResults) {
      setResult(proofreadResults);
    }
    setIsProcessing(false);
  };

  const handleAcceptToInput = (nextText: string) => {
    setText(nextText);
    setSourceSnapshot('');
    setResult(undefined);
    toast.success('Replaced input with proofread text');
    textareaRef.current?.focus();
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

      {/* Editorial Split Editor (Desktop 6:6, Mobile Stacked) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <div className="flex flex-col lg:col-span-6">
          <LabelBar
            label="Source Draft"
            icon={PenLine}
            htmlFor="proofreader-textarea"
          >
            <PasteAction onClick={onPasteText} />
            <DeleteAction onClick={onClearClick} disabled={isEmpty(text)} />
          </LabelBar>
          <Textarea
            ref={textareaRef}
            id="proofreader-textarea"
            onChange={onChange}
            value={text}
            rows={14}
            className="min-h-[340px] lg:h-[420px]"
            placeholder="Enter your text for grammar, spelling, and punctuation proofreading..."
          />
          <ExecuteBar
            label={isProcessing ? 'Proofreading...' : 'Proofread'}
            icon={isProcessing ? LoaderCircle : WandSparkles}
            iconClassName={isProcessing ? 'animate-spin' : ''}
            disabled={isEmpty(text) || isProcessing}
            onClick={onProcessClick}
            text={text}
          />
        </div>

        <div className="lg:col-span-6">
          <Result
            text={sourceSnapshot || text}
            result={result}
            isProcessing={isProcessing}
            onAcceptToInput={handleAcceptToInput}
            panelClassName="min-h-[340px] lg:h-[420px]"
          />
        </div>
      </div>
    </>
  );
}
