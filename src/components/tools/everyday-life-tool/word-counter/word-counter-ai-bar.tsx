'use client';

import type { DropdownItemType } from '@/components/ui/dropdown';
import type {
  WordCounterAiActionId,
  WordCounterAiCapabilities,
  WordCounterAiResult,
} from './hooks/use-word-counter-ai';

import {
  BookOpenCheck,
  Check,
  ChevronDown,
  ListChecks,
  LoaderCircle,
  Minimize2,
  Plus,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { CopyAction } from '@/components/shared/action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/dropdown';
import { cn } from '@/utils/cn';

type WordCounterAiBarProps = {
  capabilities: WordCounterAiCapabilities;
  isRunning: boolean;
  downloadProgress: number | null;
  aiResult: WordCounterAiResult | null;
  disabled?: boolean;
  isActionAvailable: (action: WordCounterAiActionId) => boolean;
  onTriggerAction: (action: WordCounterAiActionId) => void;
  onApplyResult: (mode: 'replace' | 'insert-below') => void;
  onDiscardResult: () => void;
};

export default function WordCounterAiBar({
  capabilities,
  isRunning,
  downloadProgress,
  aiResult,
  disabled = false,
  isActionAvailable,
  onTriggerAction,
  onApplyResult,
  onDiscardResult,
}: WordCounterAiBarProps) {
  const [showUnavailableHint, setShowUnavailableHint] = useState(false);

  const dropdownItems: DropdownItemType[] = [
    {
      id: 'proofread',
      label: 'Proofread & Fix Grammar',
      icon: BookOpenCheck,
      disabled: !isActionAvailable('proofread'),
      onClick: () => onTriggerAction('proofread'),
    },
    {
      id: 'summarize',
      label: 'Summarize Key Takeaways',
      icon: ListChecks,
      disabled: !isActionAvailable('summarize'),
      onClick: () => onTriggerAction('summarize'),
    },
    {
      id: 'rewrite-shorter',
      label: 'Make More Concise',
      icon: Minimize2,
      disabled: !isActionAvailable('rewrite-shorter'),
      onClick: () => onTriggerAction('rewrite-shorter'),
    },
    {
      id: 'rewrite-formal',
      label: 'Polish Tone (Formal)',
      icon: Wand2,
      disabled: !isActionAvailable('rewrite-formal'),
      onClick: () => onTriggerAction('rewrite-formal'),
    },
  ];

  const hasPanelContent =
    isRunning ||
    (!capabilities.hasAny && showUnavailableHint) ||
    Boolean(aiResult);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200/70 bg-neutral-50/50 px-4 py-2.5 dark:border-neutral-800/80 dark:bg-neutral-900/40">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Sparkles size={13} className="text-amber-500 dark:text-amber-400" />
          <span className="font-medium">Optional Chrome On-Device AI</span>
        </div>

        {capabilities.hasAny ? (
          <Dropdown
            placement="bottom end"
            menuClassName="z-[70] min-w-[230px]"
            items={dropdownItems}
            trigger={
              <Button
                variant="outline"
                size="xs"
                rounded="lg"
                disabled={disabled || isRunning}
                icon={isRunning ? LoaderCircle : Sparkles}
                iconClassName={cn(
                  isRunning
                    ? 'animate-spin text-sky-500'
                    : 'text-amber-500 dark:text-amber-400'
                )}
              >
                <span>AI Assist</span>
                <ChevronDown size={12} className="opacity-60" />
              </Button>
            }
          />
        ) : (
          <Button
            variant={showUnavailableHint ? 'primary' : 'ghost'}
            size="xs"
            rounded="lg"
            icon={Sparkles}
            onClick={() => setShowUnavailableHint((prev) => !prev)}
            className={cn(
              !showUnavailableHint && 'text-slate-500 dark:text-slate-400'
            )}
          >
            AI Assist
          </Button>
        )}
      </div>

      {hasPanelContent && (
        <div className="space-y-2.5 bg-neutral-50/50 px-4 pb-3 dark:bg-neutral-900/40">
          {isRunning && (
            <div className="flex items-center gap-2 rounded-lg bg-sky-50/80 px-3 py-2 text-xs text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
              <LoaderCircle size={13} className="animate-spin" />
              <span>
                {downloadProgress !== null
                  ? `Downloading Chrome on-device AI model... ${Math.round(downloadProgress * 100)}%`
                  : 'Running Chrome on-device AI locally...'}
              </span>
            </div>
          )}

          {!capabilities.hasAny && showUnavailableHint && (
            <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/90 p-3 text-xs text-slate-600 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-slate-300">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  Chrome On-Device AI (Optional Enhancement)
                </p>
                <p className="leading-relaxed text-slate-500 dark:text-slate-400">
                  Word counts, SEO keyword density, platform limits, and text
                  cleanup transforms work in every browser. Desktop Chrome with
                  Built-in AI enabled unlocks offline summaries and
                  proofreading.
                </p>
                <Link
                  href="/tools/chrome-built-in-ai-api/prompt"
                  className="inline-block font-medium text-sky-600 hover:underline dark:text-sky-400"
                >
                  Inspect Chrome AI Compatibility →
                </Link>
              </div>
              <Button
                variant="ghost"
                size="xs"
                rounded="lg"
                icon={X}
                ariaLabel="Close AI availability hint"
                onClick={() => setShowUnavailableHint(false)}
              />
            </div>
          )}

          {aiResult && (
            <div className="space-y-2.5 rounded-xl border border-sky-300/70 bg-sky-50/70 p-3.5 backdrop-blur-sm dark:border-sky-800/60 dark:bg-sky-950/30">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={14}
                    className="text-sky-600 dark:text-sky-400"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {aiResult.title}
                  </span>
                  <Badge variant="primary" size="xs">
                    On-Device AI
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  rounded="lg"
                  icon={X}
                  ariaLabel="Discard AI result"
                  onClick={onDiscardResult}
                />
              </div>

              <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-neutral-200/70 bg-white/90 p-3 font-sans text-xs leading-relaxed text-slate-700 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-slate-200">
                {aiResult.output}
              </pre>

              {aiResult.details && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {aiResult.details}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-end gap-1.5">
                <CopyAction
                  content={aiResult.output}
                  label="Copy"
                  variant="outline"
                  successToast="Copied AI suggestion"
                />
                <Button
                  variant="ghost"
                  size="xs"
                  rounded="lg"
                  onClick={onDiscardResult}
                >
                  Discard
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  rounded="lg"
                  icon={Plus}
                  onClick={() => onApplyResult('insert-below')}
                >
                  Insert Below
                </Button>
                <Button
                  variant="primary"
                  size="xs"
                  rounded="lg"
                  icon={Check}
                  onClick={() => onApplyResult('replace')}
                >
                  Replace Text
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
