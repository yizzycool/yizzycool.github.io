'use client';

import type {
  CanvasConfig,
  GlobalImageConfig,
  ImageConfig,
} from './types/config';
import type { ConfigHelper } from './types/config-helper';

import { useRef, useState } from 'react';

import { cn } from '@/utils/cn';
import { ConfirmDialog, useConfirmDialog } from '@/components/ui/dialog';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';

import useFabric from './hooks/use-fabric';
import useStudioHotkeys from './hooks/use-studio-hotkeys';
import {
  PRESET_BACKGROUND_COLORS,
  PRESET_BORDER_COLORS,
} from './config-panel/data/background';
import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import CanvasHudBar from './canvas-hud-bar';
import Config from './config-panel';
import ExportModal from './export-modal';

export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  layout: 'free',
  size: { width: 1080, height: 1080 },
  background: {
    type: 'color',
    color: { color: PRESET_BACKGROUND_COLORS[0], opacity: 1 },
  },
  border: { width: 0, color: '', opacity: 1 },
  watermark: {
    enabled: false,
    text: '© PicMerge Studio',
    color: '#ffffff',
    opacity: 0.28,
    fontSize: 32,
    angle: -30,
  },
  exportFormat: 'png',

  gridConfig: {
    rows: 2,
    cols: 2,
    templateId: 'uniform',
    border: {
      showOuter: false,
      width: 25,
      color: PRESET_BORDER_COLORS[0],
      opacity: 1,
    },
  },
};

export const DEFAULT_GLOBAL_IMAGE_CONFIG: GlobalImageConfig = {
  border: { width: 0, color: '', opacity: 1 },
  radius: 0,
};

const defaultImageConfig: ImageConfig = {
  opacity: 1,
  border: { width: 0, color: '', opacity: 1 },
  angle: 0,
  snapAngle: 90,
  scaleX: 0,
  scaleY: 0,
  width: 0,
  height: 0,
  originalWidth: 0,
  originalHeight: 0,
  lockMovementX: false,
  lockMovementY: false,
  flipX: false,
  flipY: false,
  cropAspect: 'none',
  maskShape: 'none',
  shadow: {
    enabled: false,
    blur: 18,
    offsetX: 0,
    offsetY: 8,
    opacity: 0.35,
    color: '#000000',
  },
  filters: [],
};

export default function PicMergeStudio() {
  const [canvasConfig, setCanvasConfig] = useState(DEFAULT_CANVAS_CONFIG);
  const [globalImageConfig, setGlobalImageConfig] = useState(
    DEFAULT_GLOBAL_IMAGE_CONFIG
  );
  const [imageConfig, setImageConfig] = useState(defaultImageConfig);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [snapGuidesEnabled, setSnapGuidesEnabled] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const configHelper: ConfigHelper = {
    canvasConfig,
    setCanvasConfig,

    globalImageConfig,
    setGlobalImageConfig,

    imageConfig,
    setImageConfig,
  };

  const {
    isOpen: isConfirmDialogOpen,
    confirm,
    dialogProps: confirmDialogProps,
  } = useConfirmDialog();

  const fabricHelper = useFabric({
    refs: {
      containerRef,
      canvasRef,
    },
    configHelper,
    snapGuidesEnabled,
  });

  const handleRequestBatchDelete = (onAfterConfirm?: () => void) => {
    const count =
      fabricHelper.layersUpdater?.selectedCount ??
      fabricHelper.states.selectedCount;
    if (count < 2) return;

    void confirm({
      title: `Delete ${count} Images`,
      message: `Remove ${count} selected images from the canvas? This action cannot be undone.`,
      confirmText: `Delete ${count} Images`,
      cancelText: 'Cancel',
      confirmVariant: 'error',
      onConfirm: () => {
        fabricHelper.layersUpdater.batchDelete();
        onAfterConfirm?.();
      },
    });
  };

  const handleRequestResetStudio = () => {
    void confirm({
      title: 'Reset Studio Canvas',
      message:
        'Clear all images and reset canvas settings to defaults? Your saved local draft will also be removed.',
      confirmText: 'Reset Studio',
      cancelText: 'Cancel',
      confirmVariant: 'error',
      onConfirm: async () => {
        await fabricHelper.historyUpdater.resetStudio();
      },
    });
  };

  // Global Hotkeys & Keyboard Navigation (Export, Undo/Redo, Paste, Deselect, Delete, Arrow Nudge)
  useStudioHotkeys({
    fabricHelper,
    configHelper,
    onOpenExport: () => setIsExportModalOpen(true),
    onRequestBatchDelete: () => handleRequestBatchDelete(),
    suppressHotkeys: isConfirmDialogOpen,
  });

  return (
    <>
      <HeaderBlock
        customShortcuts={[
          { ...TOOL_HOTKEYS.save, label: 'Export Image' },
          { symbol: 'Ctrl + Z', label: 'Undo' },
          { symbol: 'Ctrl + Shift + Z', label: 'Redo' },
          { symbol: 'Ctrl + V', label: 'Paste Image from Clipboard' },
          { symbol: 'Ctrl + A', label: 'Select All Layers' },
          { symbol: 'Delete', label: 'Delete Selected Image' },
          { symbol: 'Esc', label: 'Deselect Active Object' },
          { symbol: '↑ ↓ ← →', label: 'Nudge Image (Shift for 10px)' },
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap />

      <div
        className={cn(
          'lg:relative lg:overflow-hidden',
          'lg:rounded-3xl lg:border lg:border-neutral-200/80 lg:dark:border-neutral-800/80',
          'lg:bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] lg:[background-size:28px_28px] lg:dark:bg-[radial-gradient(#262626_1.5px,transparent_1.5px)]',
          'lg:bg-neutral-50/40 lg:dark:bg-neutral-950/40'
        )}
      >
        {/* Main Canvas Workspace Card */}
        <div className="w-full min-w-0">
          <div
            ref={containerRef}
            className="group relative h-[calc(100dvh_-_320px)] w-full overflow-hidden transition-all duration-300 lg:h-[calc(100dvh_-_200px)]"
          >
            {/* Canvas Mounting Node: Perfectly Centered with Artboard styling on desktop, top-aligned on mobile */}
            <div className="absolute inset-0 flex items-start justify-center px-4 pb-4 pt-10 sm:px-6 sm:pb-6 sm:pt-12 lg:items-center lg:p-8">
              <canvas ref={canvasRef} />
            </div>

            <CanvasHudBar
              width={configHelper.canvasConfig.size.width}
              height={configHelper.canvasConfig.size.height}
              isFreeLayout={configHelper.canvasConfig.layout === 'free'}
              snapGuidesEnabled={snapGuidesEnabled}
              onToggleSnapGuides={setSnapGuidesEnabled}
              viewportZoom={fabricHelper.states.viewportZoom}
              onChangeViewportZoom={fabricHelper.states.setViewportZoom}
              editingCellId={fabricHelper.states.editingCellId}
              onExitCellFocus={fabricHelper.states.exitCellFocus}
              onSendToPhotoEditor={() =>
                void fabricHelper.canvasUpdater.sendToPhotoEditor()
              }
              canUndo={fabricHelper.historyUpdater.canUndo}
              canRedo={fabricHelper.historyUpdater.canRedo}
              canReset={fabricHelper.historyUpdater.canReset}
              onUndo={() => void fabricHelper.historyUpdater.undo()}
              onRedo={() => void fabricHelper.historyUpdater.redo()}
              onRequestReset={handleRequestResetStudio}
            />
          </div>
        </div>

        {/* Studio Inspector Floating Card / Mobile Drawer Panel */}
        <Config
          fabricHelper={fabricHelper}
          configHelper={configHelper}
          onOpenExport={() => setIsExportModalOpen(true)}
          onRequestBatchDelete={handleRequestBatchDelete}
        />
      </div>

      {/* Modern Export Dialog */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        fabricHelper={fabricHelper}
        configHelper={configHelper}
      />

      {/* Batch Delete Confirmation */}
      <ConfirmDialog {...confirmDialogProps} />
    </>
  );
}
