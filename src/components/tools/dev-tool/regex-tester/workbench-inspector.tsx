'use client';

import type { ReactNode } from 'react';

import { BookOpen, Hash, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { Tabs } from '@/components/ui/tabs';
import { cn } from '@/utils/cn';

import CheatSheetSection from './cheat-sheet-section';
import { REGEX_PRESETS } from './constants';
import DetailSection from './detail-section';

type InspectorTab = 'matches' | 'cheatsheet' | 'presets';

type Props = {
  matches: Array<RegExpExecArray>;
  hoveredMatchIndex: number | null;
  onHoverMatch: (index: number | null) => void;
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  onInsertToken: (token: string) => void;
};

const INSPECTOR_TABS: InspectorTab[] = ['matches', 'cheatsheet', 'presets'];

const TAB_LABELS: Record<InspectorTab, string> = {
  matches: 'Matches',
  cheatsheet: 'Cheat Sheet',
  presets: 'Presets',
};

const TAB_ICONS: Record<InspectorTab, typeof Hash> = {
  matches: Hash,
  cheatsheet: BookOpen,
  presets: Sparkles,
};

export default function WorkbenchInspector({
  matches,
  hoveredMatchIndex,
  onHoverMatch,
  selectedPresetId,
  onSelectPreset,
  onInsertToken,
}: Props) {
  const [activeTab, setActiveTab] = useState<InspectorTab>('matches');

  const renderTabBadge = (tab: InspectorTab): ReactNode => {
    if (tab !== 'matches' || matches.length === 0) return null;
    return (
      <span className="rounded-full bg-black/[0.06] px-1.5 py-px text-[10px] font-semibold tabular-nums leading-tight dark:bg-white/[0.09]">
        {matches.length}
      </span>
    );
  };

  return (
    <aside className="rounded-2xl border border-neutral-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/65">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Tabs<InspectorTab>
          tabs={INSPECTOR_TABS}
          activeTab={activeTab}
          tabLabels={TAB_LABELS}
          tabIcons={TAB_ICONS}
          tabBadges={renderTabBadge}
          onChange={setActiveTab}
          size="xs"
          rounded="lg"
          variant="segment"
          fullWidth
        />
      </div>

      {activeTab === 'matches' && (
        <div className="space-y-2.5">
          {matches.length > 0 && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Hover any match row to spotlight it in the test editor.
            </p>
          )}
          <DetailSection
            matches={matches}
            hoveredMatchIndex={hoveredMatchIndex}
            onHoverMatch={onHoverMatch}
            compact
          />
        </div>
      )}

      {activeTab === 'cheatsheet' && (
        <div className="space-y-2.5">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Click any token to insert it directly into your regex pattern.
          </p>
          <CheatSheetSection compact onInsertToken={onInsertToken} />
        </div>
      )}

      {activeTab === 'presets' && (
        <div className="max-h-[480px] space-y-2 overflow-y-auto pr-0.5">
          {REGEX_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              className={cn(
                'w-full rounded-xl border p-3 text-left transition-all',
                selectedPresetId === preset.id
                  ? 'border-sky-500/70 bg-sky-50/70 ring-1 ring-sky-500/20 dark:border-sky-400/70 dark:bg-sky-950/30'
                  : 'border-neutral-200/80 bg-white/65 hover:border-neutral-300 hover:bg-white dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {preset.name}
                </span>
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500 dark:bg-neutral-800 dark:text-slate-400">
                  /{preset.flags}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                {preset.description}
              </p>
              <code className="mt-2 block truncate rounded bg-black/[0.04] px-2 py-1 font-mono text-[11px] text-slate-700 dark:bg-white/[0.06] dark:text-slate-300">
                /{preset.pattern}/{preset.flags}
              </code>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
