'use client';

import { Info, TextAlignStart } from 'lucide-react';
import { isNull, isEmpty } from 'lodash';

import { cn } from '@/utils/cn';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import useWordCounter from './hooks/use-word-counter';
import Snackbar from '@/components/common/snackbar';
import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import PasteAction from '@/components/common/action-button/paste';
import DeleteAction from '@/components/common/action-button/delete';
import Textarea from '@/components/common/textarea';
import LabelBar from '../../common/label-bar';
import Tools from './tools';
import Metrics from './metrics';

export default function WordCounter() {
  const {
    text,
    setText,
    inputRef,
    success,
    setSuccess,
    error,
    setError,
    onInputChange,
    onClear,
    onTransform,
  } = useWordCounter();

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
          - Desktop (lg:): 2-Column Split Dashboard (Left: Col 1-7 Input & Text Tools, Right: Col 8-12 Sticky Detailed Metrics)
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
              placeholder="Paste your text here to start analysis..."
              onChange={onInputChange}
              value={text}
              rows={14}
              className="rounded-none border-0 bg-transparent shadow-none backdrop-blur-none focus:border-transparent focus:bg-transparent focus:ring-0 dark:border-transparent dark:bg-transparent dark:focus:border-transparent dark:focus:bg-transparent dark:focus:ring-0"
            />
            <Tools onTransform={onTransform} disabled={isEmpty(text)} />
          </div>
        </div>

        {/* 2. Detailed Metrics (Desktop: Col 8-12 Sticky with Scrollable max-height) */}
        <div className="order-2 lg:sticky lg:top-24 lg:order-none lg:col-span-5">
          <Metrics text={text} />
        </div>
      </div>

      {/* Success Notification */}
      <Snackbar
        variant="success"
        open={!!success}
        icon={Info}
        onClose={() => setSuccess(null)}
        content={success || ''}
      />

      {/* Error Notification */}
      <Snackbar
        variant="error"
        open={!!error}
        icon={Info}
        onClose={() => setError(null)}
        content={error || ''}
      />
    </>
  );
}
