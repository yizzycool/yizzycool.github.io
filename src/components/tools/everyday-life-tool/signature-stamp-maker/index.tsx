'use client';

import type { ReactNode } from 'react';
import type { StudioMode } from './types';

import { PenLine, ScanLine, Stamp } from 'lucide-react';

import HeaderBlock from '@/components/tools/common/header-block';
import SectionGap from '@/components/tools/common/section-gap';
import { ConfirmDialog } from '@/components/ui/dialog';
import { Tabs } from '@/components/ui/tabs';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';

import { STUDIO_MODES, STUDIO_MODE_LABELS } from './constants';
import useSignatureStampMaker from './hooks/use-signature-stamp-maker';

import ExportControlBar from './export-control-bar';
import PhotoExtractCanvas from './photo-extract-canvas';
import PhotoExtractControls from './photo-extract-controls';
import SignatureCanvas from './signature-canvas';
import SignatureControls from './signature-controls';
import StampCanvas from './stamp-canvas';
import StampControls from './stamp-controls';

const MODE_TAB_LABELS: Record<StudioMode, ReactNode> = {
  signature: (
    <span className="flex items-center gap-1.5">
      <PenLine className="h-3.5 w-3.5" />
      <span>{STUDIO_MODE_LABELS.signature}</span>
    </span>
  ),
  stamp: (
    <span className="flex items-center gap-1.5">
      <Stamp className="h-3.5 w-3.5" />
      <span>{STUDIO_MODE_LABELS.stamp}</span>
    </span>
  ),
  photo: (
    <span className="flex items-center gap-1.5">
      <ScanLine className="h-3.5 w-3.5" />
      <span>{STUDIO_MODE_LABELS.photo}</span>
    </span>
  ),
};

export default function SignatureStampMaker() {
  const {
    mode,
    setMode,
    strokes,
    canUndo,
    canRedo,
    sigSettings,
    isTrackpadDrawing,
    setIsTrackpadDrawing,
    trimWhitespace,
    setTrimWhitespace,
    stampSettings,
    photoSource,
    photoFileName,
    photoSettings,
    photoViewMode,
    setPhotoViewMode,
    processedPhotoCanvasRef,
    setPhotoMeta,
    exportScale,
    setExportScale,
    hasExportableContent,
    outputDimensions,
    dialogProps,
    handleCommitStroke,
    handleUndo,
    handleRedo,
    handleRequestClearSignature,
    handleUpdateSigSettings,
    handleUpdateStampSettings,
    handleResetStamp,
    handleUpdatePhotoSettings,
    handleSelectPhotoFile,
    handleLoadSamplePhoto,
    handleClearPhoto,
    handleCopyPng,
    handleDownloadPng,
    handleDownloadSvg,
  } = useSignatureStampMaker();

  return (
    <>
      <HeaderBlock
        customShortcuts={[
          { symbol: 'Shift', label: 'Hold to Draw (Trackpad Mode)' },
          { symbol: 'Mod + Z', label: 'Undo Last Stroke' },
          { symbol: 'Mod + Shift + Z', label: 'Redo Stroke' },
          { ...TOOL_HOTKEYS.save, label: 'Download PNG' },
          { ...TOOL_HOTKEYS.copy, label: 'Copy PNG' },
          { ...TOOL_HOTKEYS.clear, label: 'Clear Canvas', hint: '' },
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap size="sm" />

      {/* Studio Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs<StudioMode>
          tabs={STUDIO_MODES}
          activeTab={mode}
          onChange={setMode}
          tabLabels={MODE_TAB_LABELS}
          variant="segment"
          size="sm"
          rounded="lg"
        />
      </div>

      <SectionGap size="sm" />

      {/* Archetype C: Visual Stage (65%) + Compact Control Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-8">
          {mode === 'signature' && (
            <SignatureCanvas
              strokes={strokes}
              settings={sigSettings}
              canUndo={canUndo}
              canRedo={canRedo}
              onCommitStroke={handleCommitStroke}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onRequestClear={handleRequestClearSignature}
              onUpdateSettings={handleUpdateSigSettings}
              onTrackpadDrawingChange={setIsTrackpadDrawing}
            />
          )}

          {mode === 'stamp' && (
            <StampCanvas
              settings={stampSettings}
              onUpdateSettings={handleUpdateStampSettings}
              onReset={handleResetStamp}
            />
          )}

          {mode === 'photo' && (
            <PhotoExtractCanvas
              sourceCanvas={photoSource}
              fileName={photoFileName}
              settings={photoSettings}
              viewMode={photoViewMode}
              processedCanvasRef={processedPhotoCanvasRef}
              onViewModeChange={setPhotoViewMode}
              onUpdateSettings={handleUpdatePhotoSettings}
              onSelectFile={(file) => void handleSelectPhotoFile(file)}
              onLoadSample={handleLoadSamplePhoto}
              onClear={handleClearPhoto}
              onProcessedMeta={setPhotoMeta}
            />
          )}

          <ExportControlBar
            hasContent={hasExportableContent}
            scale={exportScale}
            onScaleChange={setExportScale}
            showTrimToggle={mode === 'signature' || mode === 'photo'}
            showSvgExport={mode !== 'photo'}
            trimWhitespace={trimWhitespace}
            onToggleTrim={() => setTrimWhitespace((prev) => !prev)}
            outputDimensions={outputDimensions}
            onCopyPng={() => void handleCopyPng()}
            onDownloadPng={() => void handleDownloadPng()}
            onDownloadSvg={handleDownloadSvg}
          />
        </div>

        <div className="lg:col-span-4">
          {mode === 'signature' && (
            <SignatureControls
              settings={sigSettings}
              isTrackpadDrawing={isTrackpadDrawing}
              onUpdateSettings={handleUpdateSigSettings}
            />
          )}

          {mode === 'stamp' && (
            <StampControls
              settings={stampSettings}
              onUpdateSettings={handleUpdateStampSettings}
            />
          )}

          {mode === 'photo' && (
            <PhotoExtractControls
              settings={photoSettings}
              onUpdateSettings={handleUpdatePhotoSettings}
            />
          )}
        </div>
      </div>

      <ConfirmDialog {...dialogProps} />
    </>
  );
}
