'use client';

import type { Dispatch, RefObject, SetStateAction } from 'react';

import { Settings2 } from 'lucide-react';
import { useMemo } from 'react';

import { CopyAction } from '@/components/shared/action-button';
import LabelBar from '@/components/tools/common/label-bar';
import { Badge } from '@/components/ui/badge';
import { ErrorMessage } from '@/components/ui/error-message';
import { Selector } from '@/components/ui/selector';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/utils/cn';

import { CUSTOM_PRESET_ID, REGEX_PRESETS } from '../constants';
import FlagSelector from './flag-selector';
import PatternVisualizer from './pattern-visualizer';

type Props = {
  pattern: string;
  flags: string;
  matchCount: number;
  setPattern: Dispatch<SetStateAction<string>>;
  setFlags: Dispatch<SetStateAction<string>>;
  error: string | null;
  patternInputRef?: RefObject<HTMLInputElement | null>;
  selectedPresetId?: string;
  onSelectPreset?: (presetId: string) => void;
};

export default function PatternSection({
  pattern,
  flags,
  matchCount,
  setPattern,
  setFlags,
  error,
  patternInputRef,
  selectedPresetId = CUSTOM_PRESET_ID,
  onSelectPreset,
}: Props) {
  const presetOptions = useMemo(
    () => [
      { label: 'Custom Pattern', value: CUSTOM_PRESET_ID },
      ...REGEX_PRESETS.map((p) => ({
        label: p.name,
        value: p.id,
      })),
    ],
    []
  );

  const activePreset = useMemo(
    () => REGEX_PRESETS.find((p) => p.id === selectedPresetId),
    [selectedPresetId]
  );

  const description = useMemo(() => {
    if (activePreset) {
      return activePreset.description;
    }
    if (pattern.trim()) {
      return 'Custom regular expression pattern';
    }
    return 'Enter a regular expression pattern to test matching text';
  }, [activePreset, pattern]);

  return (
    <div className="w-full text-left">
      <LabelBar
        icon={Settings2}
        label="Regular Expression"
        description={description}
      >
        <div className="flex items-center gap-2">
          {error ? (
            <Badge variant="error" size="xs" rounded="full">
              Invalid Pattern
            </Badge>
          ) : (
            <Badge
              variant={matchCount > 0 ? 'success' : 'neutral'}
              size="xs"
              rounded="full"
            >
              {matchCount} {matchCount === 1 ? 'Match' : 'Matches'}
            </Badge>
          )}

          {onSelectPreset && (
            <div className="w-40 sm:w-44">
              <Selector
                size="xs"
                value={selectedPresetId || CUSTOM_PRESET_ID}
                options={presetOptions}
                placeholder="Choose a preset..."
                onChange={(val) => onSelectPreset(String(val))}
              />
            </div>
          )}
        </div>
      </LabelBar>

      <div className="space-y-2.5">
        {/* RegExr-style Top Command Bar */}
        <div
          className={cn(
            'shadow-2xs rounded-xl border p-3.5 pb-2.5 backdrop-blur-md transition-all duration-200',
            'border-neutral-200/90 bg-white/80 dark:border-neutral-700/80 dark:bg-neutral-900/80',
            'focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/20',
            'dark:focus-within:border-sky-400 dark:focus-within:bg-neutral-900 dark:focus-within:ring-sky-400/40'
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex min-w-[200px] flex-1 items-center gap-1.5 font-mono text-base sm:text-lg">
              <span className="select-none font-bold text-slate-400">/</span>
              <input
                ref={patternInputRef}
                type="text"
                id="regexp-pattern-input"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="min-w-0 flex-1 border-none bg-transparent tracking-wider text-slate-900 outline-none dark:text-slate-100"
                placeholder="e.g. ([A-Z])\w+"
                aria-label="Pattern of regular expression"
                spellCheck="false"
              />
              <span className="select-none font-bold text-slate-400">/</span>
            </div>

            <div className="flex items-center gap-1.5">
              <FlagSelector flags={flags} setFlags={setFlags} inline />

              <span
                aria-hidden="true"
                className="mx-0.5 h-4 w-px bg-neutral-200 dark:bg-neutral-700"
              />

              <CopyAction
                display="icon"
                variant="ghost"
                size="xs"
                rounded="full"
                content={`/${pattern}/${flags}`}
                title="Copy Regex Pattern"
                successToast="Copied regex pattern"
                className="shrink-0"
              />
            </div>
          </div>

          <Separator className="my-2.5" />

          <div className="flex items-center justify-between gap-2">
            <div className="no-scrollbar flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs tracking-widest">
              <span className="mr-2 select-none font-sans text-slate-400">
                Tokens:
              </span>
              <PatternVisualizer pattern={pattern} />
            </div>
            <span className="hidden shrink-0 font-mono text-[11px] text-slate-400 sm:inline dark:text-slate-500">
              Flags: /{flags}
            </span>
          </div>
        </div>

        <ErrorMessage message={error} />
      </div>
    </div>
  );
}
