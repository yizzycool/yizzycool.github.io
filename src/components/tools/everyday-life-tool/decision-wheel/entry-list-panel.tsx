'use client';

import type { KeyboardEvent, RefObject } from 'react';
import type { WheelEntry } from './types';

import { useState } from 'react';
import {
  AlertTriangle,
  ArrowDownAZ,
  Check,
  CheckCircle2,
  Equal,
  ListChecks,
  Plus,
  Scale,
  Shuffle,
  Sparkles,
} from 'lucide-react';

import { DeleteAction } from '@/components/shared/action-button';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/cn';

import { MAX_LABEL_LENGTH, WHEEL_PRESETS } from './constants';

import EntryRowItem from './entry-row-item';

type PanelTab = 'entries' | 'bulk';

type Props = {
  entries: WheelEntry[];
  activeCount: number;
  totalActivePercent: number;
  isSpinning: boolean;
  addInputRef: RefObject<HTMLInputElement | null>;
  onAddEntry: (label: string) => boolean;
  onUpdateLabel: (id: string, label: string) => void;
  onUpdatePercent: (id: string, percent: number) => void;
  onEqualizePercentages: () => void;
  onNormalizePercentages: () => void;
  onCycleColor: (id: string) => void;
  onRemoveEntry: (id: string) => void;
  onApplyBulkText: (rawText: string) => void;
  onLoadPreset: (presetId: string) => void;
  onShuffle: () => void;
  onSort: () => void;
  onRequestClearAll: () => void;
};

/**
 * Right-column option manager featuring presets, manual percentage editing, total bar, and bulk import.
 */
export default function EntryListPanel({
  entries,
  activeCount,
  totalActivePercent,
  isSpinning,
  addInputRef,
  onAddEntry,
  onUpdateLabel,
  onUpdatePercent,
  onEqualizePercentages,
  onNormalizePercentages,
  onCycleColor,
  onRemoveEntry,
  onApplyBulkText,
  onLoadPreset,
  onShuffle,
  onSort,
  onRequestClearAll,
}: Props) {
  const [activeTab, setActiveTab] = useState<PanelTab>('entries');
  const [draftLabel, setDraftLabel] = useState('');
  const [bulkDraft, setBulkDraft] = useState('');

  const handleTabChange = (tab: PanelTab) => {
    if (tab === 'bulk') {
      setBulkDraft(entries.map((item) => item.label).join('\n'));
    }
    setActiveTab(tab);
  };

  const handleSubmitAdd = () => {
    if (!draftLabel.trim()) return;
    if (onAddEntry(draftLabel)) {
      setDraftLabel('');
    }
  };

  const handleAddKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitAdd();
    }
  };

  const handleApplyBulk = () => {
    onApplyBulkText(bulkDraft);
    setActiveTab('entries');
  };

  const isExact100 = Math.abs(totalActivePercent - 100) < 0.05;

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-md sm:p-5 dark:border-neutral-800/80 dark:bg-neutral-900/60">
      {/* Quick Presets Strip */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          <Sparkles size={13} className="text-sky-500" />
          <span>Quick Presets</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {WHEEL_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              variant="secondary"
              size="xs"
              rounded="full"
              bordered
              disabled={isSpinning}
              onClick={() => onLoadPreset(preset.id)}
              className="px-2.5 text-[11px]"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Mode Switch Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200/70 pt-3 dark:border-neutral-800/70">
        <Tabs<PanelTab>
          tabs={['entries', 'bulk']}
          activeTab={activeTab}
          onChange={handleTabChange}
          variant="segment"
          size="xs"
          rounded="lg"
          tabLabels={{
            entries: `Entries (${entries.length})`,
            bulk: 'Bulk Edit',
          }}
        />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            rounded="lg"
            icon={Shuffle}
            disabled={isSpinning || entries.length < 2}
            onClick={onShuffle}
            title="Shuffle options"
            ariaLabel="Shuffle wheel options"
          />
          <Button
            variant="ghost"
            size="xs"
            rounded="lg"
            icon={ArrowDownAZ}
            disabled={isSpinning || entries.length < 2}
            onClick={onSort}
            title="Sort A to Z"
            ariaLabel="Sort options alphabetically"
          />
          <DeleteAction
            display="icon"
            size="xs"
            rounded="lg"
            disabled={isSpinning || entries.length === 0}
            successToast={false}
            ariaLabel="Clear all wheel options"
            title="Clear all options"
            onClick={onRequestClearAll}
          />
        </div>
      </div>

      {activeTab === 'entries' ? (
        <div className="space-y-3">
          {/* Quick Add Input */}
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <Input
                ref={addInputRef}
                value={draftLabel}
                disabled={isSpinning}
                placeholder={`Add option (max ${MAX_LABEL_LENGTH} chars)...`}
                onChange={(e) => setDraftLabel(e.target.value)}
                onKeyDown={handleAddKeyDown}
                onClear={draftLabel ? () => setDraftLabel('') : undefined}
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              rounded="lg"
              icon={Plus}
              disabled={isSpinning || !draftLabel.trim()}
              onClick={handleSubmitAdd}
              ariaLabel="Add wheel option"
            >
              Add
            </Button>
          </div>

          {/* Scrollable Entries List */}
          {entries.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="No options yet"
              description="Add options above, paste a list in Bulk Edit, or tap a preset."
              size="sm"
              variant="plain"
            />
          ) : (
            <>
              <div className="max-h-[340px] space-y-1.5 overflow-y-auto pr-1">
                {entries.map((entry) => (
                  <EntryRowItem
                    key={entry.id}
                    entry={entry}
                    disabled={isSpinning}
                    onChangeLabel={onUpdateLabel}
                    onChangePercent={onUpdatePercent}
                    onCycleColor={onCycleColor}
                    onRemove={onRemoveEntry}
                  />
                ))}
              </div>

              {/* Total Percentage Status & Adjustment Bar */}
              {activeCount > 0 && (
                <div
                  className={cn(
                    'flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs',
                    isExact100
                      ? 'border-emerald-200/80 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
                      : 'border-amber-200/80 bg-amber-50/70 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300'
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    {isExact100 ? (
                      <CheckCircle2 size={14} className="shrink-0" />
                    ) : (
                      <AlertTriangle size={14} className="shrink-0" />
                    )}
                    <span className="font-mono font-semibold">
                      Total: {totalActivePercent}%
                    </span>
                    {!isExact100 && (
                      <span className="text-[11px] opacity-80">
                        · Scaled to 100% on wheel
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {!isExact100 && totalActivePercent > 0 && (
                      <Button
                        variant="ghost"
                        size="xs"
                        rounded="md"
                        bordered
                        icon={Scale}
                        disabled={isSpinning}
                        onClick={onNormalizePercentages}
                        title="Scale current percentages proportionally to sum to 100%"
                        className="h-6 px-2 text-[11px]"
                      >
                        Normalize 100%
                      </Button>
                    )}
                    {activeCount >= 2 && (
                      <Button
                        variant="ghost"
                        size="xs"
                        rounded="md"
                        bordered
                        icon={Equal}
                        disabled={isSpinning}
                        onClick={onEqualizePercentages}
                        title="Split 100% evenly across active options"
                        className="h-6 px-2 text-[11px]"
                      >
                        Equalize
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          <Textarea
            value={bulkDraft}
            rows={9}
            placeholder="Enter one option per line..."
            onChange={(e) => setBulkDraft(e.target.value)}
          />
          <div className="flex items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span>One item per line · blank lines ignored</span>
            <Button
              variant="primary"
              size="xs"
              rounded="lg"
              icon={Check}
              disabled={isSpinning}
              onClick={handleApplyBulk}
            >
              Apply List
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
