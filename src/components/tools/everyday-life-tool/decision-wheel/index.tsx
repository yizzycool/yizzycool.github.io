'use client';

import { RotateCw, Trophy } from 'lucide-react';

import { CopyAction } from '@/components/shared/action-button';
import HeaderBlock from '@/components/tools/common/header-block';
import SectionGap from '@/components/tools/common/section-gap';
import { HotkeyBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, useConfirmDialog } from '@/components/ui/dialog';

import { useDecisionWheel } from './hooks/use-decision-wheel';

import EntryListPanel from './entry-list-panel';
import SpinHistoryPanel from './spin-history-panel';
import WheelCanvas from './wheel-canvas';
import WheelSettingsBar from './wheel-settings-bar';
import WinnerDialog from './winner-dialog';

/**
 * Decision Wheel & Fair Random Picker page combining a 60 FPS weighted canvas wheel stage
 * with Web Audio ticks, no-repeat elimination mode, presets, and bulk editing.
 */
export default function DecisionWheel() {
  const { confirm, dialogProps } = useConfirmDialog();
  const {
    entries,
    activeEntries,
    eliminatedEntries,
    totalActivePercent,
    slices,
    prefs,
    history,
    rotationRad,
    isSpinning,
    pointerDeflection,
    winnerModalRecord,
    addInputRef,
    customShortcuts,
    setWinnerModalRecord,
    spin,
    addEntry,
    updateEntryLabel,
    updateEntryPercent,
    equalizePercentages,
    normalizePercentages,
    cycleEntryColor,
    removeEntry,
    applyBulkText,
    loadPreset,
    shuffleEntries,
    sortEntries,
    restoreEliminated,
    eliminateEntryById,
    clearAllEntries,
    clearHistory,
    updatePrefs,
    setSpinSpeed,
    applyPalette,
  } = useDecisionWheel(dialogProps.isOpen);

  const handleRequestClearAll = () => {
    if (entries.length === 0) return;
    confirm({
      title: 'Clear All Wheel Options?',
      message: `This will remove all ${entries.length} options from your current wheel.`,
      confirmText: 'Clear All',
      confirmVariant: 'error',
      onConfirm: clearAllEntries,
    });
  };

  const latestWinner = history[0] ?? null;

  return (
    <>
      <HeaderBlock customShortcuts={customShortcuts} />
      <SectionGap size="lg" />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Stage (60% / 7 cols): Interactive Canvas Wheel & Controls */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:col-span-7">
          <WheelCanvas
            slices={slices}
            rotationRad={rotationRad}
            isSpinning={isSpinning}
            pointerDeflection={pointerDeflection}
            eliminatedCount={eliminatedEntries.length}
            onSpin={spin}
            onRestoreEliminated={restoreEliminated}
          />

          {/* Primary Action & Latest Winner Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/60">
            <div className="flex items-center gap-2.5">
              <Button
                variant="primary"
                size="sm"
                rounded="xl"
                icon={RotateCw}
                disabled={isSpinning || slices.length < 2}
                onClick={spin}
                className="font-semibold"
              >
                {isSpinning ? 'Spinning...' : 'Spin Wheel'}
              </Button>
              <div className="hidden sm:block">
                <HotkeyBadge items={customShortcuts.slice(0, 1)} />
              </div>
            </div>

            {latestWinner ? (
              <div className="flex min-w-0 items-center gap-2 rounded-xl border border-neutral-200/70 bg-neutral-50/80 px-3 py-1.5 text-xs dark:border-neutral-800/70 dark:bg-neutral-950/60">
                <Trophy size={13} className="shrink-0 text-amber-500" />
                <span className="truncate font-semibold text-neutral-800 dark:text-neutral-100">
                  {latestWinner.label}
                </span>
                <CopyAction
                  display="icon"
                  size="xs"
                  rounded="md"
                  content={latestWinner.label}
                  successToast={`Copied "${latestWinner.label}"`}
                  ariaLabel="Copy latest winner"
                />
              </div>
            ) : (
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {activeEntries.length} active option
                {activeEntries.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          <WheelSettingsBar
            prefs={prefs}
            isSpinning={isSpinning}
            onUpdatePrefs={updatePrefs}
            onSelectSpeed={setSpinSpeed}
            onSelectPalette={applyPalette}
          />
        </div>

        {/* Right Panel (40% / 5 cols): Options, Weights, Presets & Spin History */}
        <div className="space-y-4 lg:col-span-5">
          <EntryListPanel
            entries={entries}
            activeCount={activeEntries.length}
            totalActivePercent={totalActivePercent}
            isSpinning={isSpinning}
            addInputRef={addInputRef}
            onAddEntry={addEntry}
            onUpdateLabel={updateEntryLabel}
            onUpdatePercent={updateEntryPercent}
            onEqualizePercentages={equalizePercentages}
            onNormalizePercentages={normalizePercentages}
            onCycleColor={cycleEntryColor}
            onRemoveEntry={removeEntry}
            onApplyBulkText={applyBulkText}
            onLoadPreset={loadPreset}
            onShuffle={shuffleEntries}
            onSort={sortEntries}
            onRequestClearAll={handleRequestClearAll}
          />

          <SpinHistoryPanel
            history={history}
            eliminatedEntries={eliminatedEntries}
            isSpinning={isSpinning}
            onRestoreEliminated={restoreEliminated}
            onClearHistory={clearHistory}
          />
        </div>
      </div>

      <WinnerDialog
        record={winnerModalRecord}
        eliminateOnWin={prefs.eliminateOnWin}
        canSpinAgain={slices.length >= 2}
        onClose={() => setWinnerModalRecord(null)}
        onSpinAgain={spin}
        onEliminateWinner={eliminateEntryById}
      />

      <ConfirmDialog {...dialogProps} />
    </>
  );
}
