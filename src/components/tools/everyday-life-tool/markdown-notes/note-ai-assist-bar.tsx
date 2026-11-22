'use client';

import type { ReactNode } from 'react';
import type { DropdownItemType } from '@/components/ui/dropdown';
import type { NoteAiActionId, NoteAiCapabilities, NoteAiResult } from './types';

import {
  BookOpenCheck,
  Check,
  ChevronDown,
  Hash,
  Languages,
  ListChecks,
  LoaderCircle,
  MessageCircle,
  Minimize2,
  Plus,
  Sparkles,
  Speech,
  Wand2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Dropdown } from '@/components/ui/dropdown';
import { cn } from '@/utils/cn';

import NoteMarkdownView from './note-markdown-view';

type Props = {
  leadingControls?: ReactNode;
  showAiTrigger?: boolean;
  capabilities: NoteAiCapabilities;
  isRunning: boolean;
  downloadProgress: number | null;
  aiResult: NoteAiResult | null;
  isActionAvailable: (action: NoteAiActionId) => boolean;
  onTriggerAction: (action: NoteAiActionId) => void;
  onApplyResult: (mode: 'replace' | 'insert-below' | 'insert-spoiler') => void;
  onApplySuggestedLabels?: (labels: string[]) => void;
  onDiscardResult: () => void;
};

export default function NoteAiAssistBar({
  leadingControls,
  showAiTrigger = true,
  capabilities,
  isRunning,
  downloadProgress,
  aiResult,
  isActionAvailable,
  onTriggerAction,
  onApplyResult,
  onApplySuggestedLabels,
  onDiscardResult,
}: Props) {
  const [showUnavailableHint, setShowUnavailableHint] = useState(false);

  const dropdownItems: DropdownItemType[] = [
    {
      id: 'translate',
      label: 'Translate (EN ↔ Traditional Chinese)',
      icon: Languages,
      disabled: !isActionAvailable('translate'),
      onClick: () => onTriggerAction('translate'),
    },
    {
      id: 'proofread',
      label: 'Proofread & Fix Grammar',
      icon: BookOpenCheck,
      disabled: !isActionAvailable('proofread'),
      onClick: () => onTriggerAction('proofread'),
    },
    {
      id: 'rewrite-casual',
      label: 'Rewrite: Natural / Casual',
      icon: MessageCircle,
      disabled: !isActionAvailable('rewrite-casual'),
      onClick: () => onTriggerAction('rewrite-casual'),
    },
    {
      id: 'rewrite-formal',
      label: 'Rewrite: Polished / Formal',
      icon: Wand2,
      disabled: !isActionAvailable('rewrite-formal'),
      onClick: () => onTriggerAction('rewrite-formal'),
    },
    {
      id: 'rewrite-shorter',
      label: 'Rewrite: Shorter / Concise',
      icon: Minimize2,
      disabled: !isActionAvailable('rewrite-shorter'),
      onClick: () => onTriggerAction('rewrite-shorter'),
    },
    {
      id: 'summarize',
      label: 'Summarize Key Points',
      icon: ListChecks,
      disabled: !isActionAvailable('summarize'),
      onClick: () => onTriggerAction('summarize'),
    },
    {
      id: 'study-card',
      label: 'Expand to Vocabulary Study Card',
      icon: Sparkles,
      disabled: !isActionAvailable('study-card'),
      onClick: () => onTriggerAction('study-card'),
    },
    {
      id: 'connected-speech',
      label: 'Analyze Connected Speech & Linking',
      icon: Speech,
      disabled: !isActionAvailable('connected-speech'),
      onClick: () => onTriggerAction('connected-speech'),
    },
    {
      id: 'format-markdown',
      label: 'Clean & Format Markdown',
      icon: Wand2,
      disabled: !isActionAvailable('format-markdown'),
      onClick: () => onTriggerAction('format-markdown'),
    },
    {
      id: 'suggest-labels',
      label: 'Suggest #Labels',
      icon: Hash,
      disabled: !isActionAvailable('suggest-labels'),
      onClick: () => onTriggerAction('suggest-labels'),
    },
  ];

  return (
    <div className="space-y-2.5 rounded-xl border border-black/[0.07] bg-black/[0.03] px-3 py-2 dark:border-white/[0.08] dark:bg-white/[0.04]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {leadingControls}
        </div>

        {showAiTrigger && (
          <div className="flex items-center gap-2">
            {capabilities.hasAny ? (
              <Dropdown
                placement="bottom end"
                menuClassName="z-[70] min-w-[260px]"
                items={dropdownItems}
                trigger={
                  <Button
                    variant="outline"
                    size="xs"
                    rounded="lg"
                    disabled={isRunning}
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
                title="Chrome Built-in On-Device AI info"
              >
                AI Assist
              </Button>
            )}
          </div>
        )}
      </div>

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

      {/* Non-blocking Progressive Enhancement Info Card */}
      {!capabilities.hasAny && showUnavailableHint && (
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/90 p-3 text-xs text-slate-600 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-slate-300">
          <div className="space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              Chrome On-Device AI (Optional Progressive Enhancement)
            </p>
            <p className="leading-relaxed text-slate-500 dark:text-slate-400">
              All core note-taking, Markdown rendering, Keep Takeout import,
              spoiler study mode, and speech playback work in every browser.
              Opening this page in a supported desktop Chrome unlocks free,
              offline Gemini Nano AI assistance.
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

      {/* Non-destructive AI Preview Bar */}
      {aiResult && (
        <div className="space-y-3 rounded-xl border border-sky-300/70 bg-sky-50/70 p-3.5 backdrop-blur-sm dark:border-sky-800/60 dark:bg-sky-950/30">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-sky-600 dark:text-sky-400" />
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

          {aiResult.suggestedLabels && aiResult.suggestedLabels.length > 0 ? (
            <>
              <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-neutral-200/70 bg-white/90 p-3 dark:border-neutral-800 dark:bg-neutral-900/80">
                {aiResult.suggestedLabels.map((suggested) => (
                  <Chip
                    key={suggested}
                    size="xs"
                    icon={Hash}
                    onClick={() => onApplySuggestedLabels?.([suggested])}
                    title={`Click to add #${suggested}`}
                  >
                    {suggested}
                  </Chip>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-1.5">
                <Button
                  variant="ghost"
                  size="xs"
                  rounded="lg"
                  onClick={onDiscardResult}
                >
                  Discard
                </Button>
                <Button
                  variant="primary"
                  size="xs"
                  rounded="lg"
                  icon={Check}
                  onClick={() =>
                    onApplySuggestedLabels?.(aiResult.suggestedLabels ?? [])
                  }
                >
                  Apply All Labels
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="max-h-56 overflow-y-auto rounded-lg border border-neutral-200/70 bg-white/90 p-3 dark:border-neutral-800 dark:bg-neutral-900/80">
                <NoteMarkdownView content={aiResult.output} compact />
              </div>

              {aiResult.details && (
                <div className="rounded-lg bg-white/60 px-3 py-2 text-xs text-slate-600 dark:bg-neutral-900/50 dark:text-slate-300">
                  <NoteMarkdownView content={aiResult.details} compact />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-1.5">
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
                  onClick={() => onApplyResult('insert-spoiler')}
                >
                  Insert as ||Spoiler||
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
                  Replace Target
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
