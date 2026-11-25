'use client';

import { TextAlignStart } from 'lucide-react';
import { isEmpty, isNull } from 'lodash';

import {
  CopyAction,
  DeleteAction,
  PasteAction,
} from '@/components/shared/action-button';
import HeaderBlock from '@/components/tools/common/header-block';
import LabelBar from '@/components/tools/common/label-bar';
import SectionGap from '@/components/tools/common/section-gap';
import { Textarea } from '@/components/ui/textarea';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import { cn } from '@/utils/cn';
import toast from '@/utils/toast';

import useWordCounter from './hooks/use-word-counter';
import useWordCounterAi from './hooks/use-word-counter-ai';
import Metrics from './metrics';
import Tools from './tools';
import WordCounterAiBar from './word-counter-ai-bar';

export default function WordCounter() {
  const { text, setText, inputRef, onInputChange, onClear, onTransform } =
    useWordCounter();

  const {
    capabilities,
    isRunning,
    downloadProgress,
    aiResult,
    clearAiResult,
    isActionAvailable,
    runAiAction,
  } = useWordCounterAi();

  const handleApplyAiResult = (mode: 'replace' | 'insert-below') => {
    if (!aiResult) return;
    if (mode === 'replace') {
      setText(aiResult.output);
      toast.success('Replaced editor text with AI output');
    } else {
      const separator = text.trimEnd() ? '\n\n' : '';
      setText(`${text.trimEnd()}${separator}${aiResult.output}`);
      toast.success('Inserted AI output below');
    }
    clearAiResult();
  };

  return (
    <>
      <HeaderBlock
        customShortcuts={[
          TOOL_HOTKEYS.paste,
          { ...TOOL_HOTKEYS.copy, label: 'Copy Text' },
          { ...TOOL_HOTKEYS.clear, label: 'Clear' },
          { ...TOOL_HOTKEYS.save, label: 'Save Draft' },
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap />

      {/* Responsive Layout:
          - Mobile (< lg): Natural flow (1. Input + Tools -> 2. Metrics)
          - Desktop (lg:): 2-Column Split Dashboard (Left: Col 1-7 Input & Text Tools, Right: Col 8-12 Sticky Live Analytics)
      */}
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-start">
        {/* 1. Input Section & Tools (Desktop: Col 1-7) */}
        <div className="order-1 space-y-0 text-left lg:order-none lg:col-span-7">
          <LabelBar
            label="Content Input"
            icon={TextAlignStart}
            htmlFor="input-textarea"
          >
            <PasteAction onClick={setText} />
            <CopyAction content={text} disabled={isEmpty(text)} />
            <DeleteAction
              onClick={onClear}
              disabled={isNull(text) || isEmpty(text)}
            />
          </LabelBar>

          <div
            className={cn(
              'w-full overflow-hidden rounded-xl border transition-all duration-200',
              'shadow-2xs border-neutral-200/90 bg-white/80 backdrop-blur-md',
              'dark:border-neutral-700/80 dark:bg-neutral-900/80',
              'focus-within:shadow-xs focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/20',
              'dark:focus-within:border-sky-400 dark:focus-within:bg-neutral-900 dark:focus-within:ring-sky-400/40'
            )}
          >
            <Textarea
              ref={inputRef}
              id="input-textarea"
              placeholder="Paste or type your content here for live word counts, SEO keyword density, platform limits, and text transforms..."
              onChange={onInputChange}
              value={text}
              rows={14}
              className="rounded-none border-0 bg-transparent shadow-none backdrop-blur-none focus:border-transparent focus:bg-transparent focus:ring-0 dark:border-transparent dark:bg-transparent dark:focus:border-transparent dark:focus:bg-transparent dark:focus:ring-0"
            />

            <WordCounterAiBar
              capabilities={capabilities}
              isRunning={isRunning}
              downloadProgress={downloadProgress}
              aiResult={aiResult}
              disabled={isEmpty(text)}
              isActionAvailable={isActionAvailable}
              onTriggerAction={(action) => void runAiAction(action, text)}
              onApplyResult={handleApplyAiResult}
              onDiscardResult={clearAiResult}
            />

            <Tools onTransform={onTransform} disabled={isEmpty(text)} />
          </div>
        </div>

        {/* 2. Live Analytics & SEO Metrics (Desktop: Col 8-12 Sticky) */}
        <div className="order-2 lg:sticky lg:top-24 lg:order-none lg:col-span-5">
          <Metrics text={text} />
        </div>
      </div>
    </>
  );
}
