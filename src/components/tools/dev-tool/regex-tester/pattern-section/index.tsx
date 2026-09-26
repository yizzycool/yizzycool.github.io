'use client';

import type { Dispatch, RefObject, SetStateAction } from 'react';

import { useMemo, useState } from 'react';
import { AlertCircle, BookOpen, Settings2 } from 'lucide-react';

import { CopyAction } from '@/components/shared/action-button';
import LabelBar from '@/components/tools/common/label-bar';
import { Button } from '@/components/ui/button';
import { Selector } from '@/components/ui/selector';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/utils/cn';

import CheatSheetModal from '../cheat-sheet-modal';
import { CUSTOM_PRESET_ID, REGEX_PRESETS } from '../constants';
import FlagSelector from './flag-selector';
import PatternVisualizer from './pattern-visualizer';

type Props = {
  pattern: string;
  flags: string;
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
  setPattern,
  setFlags,
  error,
  patternInputRef,
  selectedPresetId = CUSTOM_PRESET_ID,
  onSelectPreset,
}: Props) {
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);

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

          <Button
            variant="ghost"
            rounded="full"
            size="xs"
            icon={BookOpen}
            onClick={() => setIsCheatSheetOpen(true)}
            title="Regex Cheat Sheet"
            ariaLabel="Open Regex Cheat Sheet"
          />
        </div>
      </LabelBar>

      <div className="space-y-3">
        <div
          className={cn(
            'shadow-2xs rounded-xl border p-4 pb-2 backdrop-blur-md transition-all duration-200',
            'border-neutral-200/90 bg-white/80 dark:border-neutral-700/80 dark:bg-neutral-900/80',
            'focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/20',
            'dark:focus-within:border-sky-400 dark:focus-within:bg-neutral-900 dark:focus-within:ring-sky-400/40'
          )}
        >
          <div className="mb-2 flex items-center gap-2 font-mono text-lg">
            <span className="text-slate-400">/</span>
            <input
              ref={patternInputRef}
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="flex-1 border-none bg-transparent tracking-widest text-slate-900 outline-none dark:text-slate-100"
              placeholder="e.g. ([A-Z])\w+"
              aria-label="Pattern of regular expression"
            />
            <span className="text-slate-400">/</span>
            <span className="text-slate-600 dark:text-slate-400">{flags}</span>
          </div>

          <Separator className="mb-2 mt-4" />

          <div className="flex items-center justify-between gap-2">
            <div className="no-scrollbar flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs tracking-widest">
              <span className="mr-2 select-none font-sans text-slate-400">
                Preview:
              </span>
              <PatternVisualizer pattern={pattern} />
            </div>

            <CopyAction
              display="icon"
              variant="ghost"
              size="xs"
              rounded="full"
              content={`/${pattern}/${flags}`}
              title="Copy Regex Pattern"
              className="shrink-0"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 animate-in slide-in-from-top-1">
            <AlertCircle className="h-4 w-4" />
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        <FlagSelector flags={flags} setFlags={setFlags} />
      </div>

      <CheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />
    </div>
  );
}
