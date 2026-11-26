'use client';

import { useCallback, useState } from 'react';

import { ConfirmDialog, useConfirmDialog } from '@/components/ui/dialog';

import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import EventForm from './event-form';
import FullscreenPosterModal from './fullscreen-poster-modal';
import { useDaysMatter } from './hooks/use-days-matter';
import PosterPreview from './poster-preview';
import PosterStyleControls from './poster-style-controls';
import SavedMilestones from './saved-milestones';

/**
 * Days Matter countdown & social poster workshop (Archetype C studio layout).
 */
export default function DaysMatter() {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const {
    isOpen: isConfirmOpen,
    confirm,
    dialogProps: confirmDialogProps,
  } = useConfirmDialog();

  const {
    state,
    theme,
    nowMs,
    breakdown,
    isClientClockReady,
    isCopyingImage,
    savedMilestones,
    titleInputRef,
    customShortcuts,
    updateState,
    handleLoadSample,
    handleReset,
    handleCopyShareLink,
    handleDownloadPng,
    handleCopyPng,
    handleSaveMilestone,
    handleLoadSavedMilestone,
    handleDeleteSavedMilestone,
    handleClearAllSaved,
  } = useDaysMatter(isConfirmOpen || isFullscreenOpen);

  const handleRequestClearAll = () => {
    void confirm({
      title: 'Clear All Saved Milestones',
      message: `Remove all ${savedMilestones.length} saved milestones from this browser?`,
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      confirmVariant: 'error',
      onConfirm: handleClearAllSaved,
    });
  };

  const handleCloseFullscreen = useCallback(() => {
    setIsFullscreenOpen(false);
  }, []);

  return (
    <>
      <HeaderBlock customShortcuts={customShortcuts} />

      <SectionGap />

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-start">
        <div className="order-1 space-y-6 text-left lg:order-none lg:col-span-5">
          <EventForm
            state={state}
            titleInputRef={titleInputRef}
            onUpdate={updateState}
            onLoadSample={handleLoadSample}
            onReset={handleReset}
          />

          <PosterStyleControls state={state} onUpdate={updateState} />

          <SavedMilestones
            items={savedMilestones}
            nowMs={nowMs}
            onLoad={handleLoadSavedMilestone}
            onDelete={handleDeleteSavedMilestone}
            onRequestClearAll={handleRequestClearAll}
          />
        </div>

        <div className="order-2 lg:sticky lg:top-24 lg:order-none lg:col-span-7">
          <PosterPreview
            state={state}
            theme={theme}
            breakdown={breakdown}
            isClientClockReady={isClientClockReady}
            isCopyingImage={isCopyingImage}
            customShortcuts={customShortcuts}
            onDownloadPng={handleDownloadPng}
            onCopyShareLink={handleCopyShareLink}
            onCopyPng={handleCopyPng}
            onSaveMilestone={handleSaveMilestone}
            onOpenFullscreen={() => setIsFullscreenOpen(true)}
          />
        </div>
      </div>

      <FullscreenPosterModal
        isOpen={isFullscreenOpen}
        onClose={handleCloseFullscreen}
        state={state}
        theme={theme}
        breakdown={breakdown}
        isClientClockReady={isClientClockReady}
      />

      <ConfirmDialog {...confirmDialogProps} />
    </>
  );
}
