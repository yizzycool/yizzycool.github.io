'use client';

import type {
  CanvasConfig,
  GlobalImageConfig,
  ImageConfig,
} from './types/config';
import type { ConfigHelper } from './types/config-helper';
import type { MobileStudioDrawerId } from './mobile-studio-sheet';

import { useMemo, useRef, useState } from 'react';

import { ConfirmDialog, useConfirmDialog } from '@/components/ui/dialog';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';

import {
  PRESET_BACKGROUND_COLORS,
  PRESET_BORDER_COLORS,
} from './config-panel/data/background';
import useFabric from './hooks/use-fabric';
import useStudioHotkeys from './hooks/use-studio-hotkeys';
import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import CanvasStage from './canvas-stage';
import ConfigPanelDesktop from './config-panel/desktop';
import ExportModal from './export-modal';
import MobileStudioBar from './mobile-studio-bar';
import MobileStudioSheet from './mobile-studio-sheet';
import StudioHeaderBar from './studio-header-bar';

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
  const [mobileDrawer, setMobileDrawer] = useState<MobileStudioDrawerId>(null);

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

  const isGridLayout = canvasConfig.layout === 'grid';
  const { hasImageSelection, hasImageSrc, selectedCount } = fabricHelper.states;

  // Derive valid mobile drawer without cascading setState inside useEffect
  const effectiveMobileDrawer = useMemo<MobileStudioDrawerId>(() => {
    if (!mobileDrawer) return null;
    if (!hasImageSelection) {
      return mobileDrawer.startsWith('canvas-') ? mobileDrawer : null;
    }
    if (selectedCount > 1) {
      if (!mobileDrawer.startsWith('batch-')) return null;
      if (
        isGridLayout &&
        (mobileDrawer === 'batch-border' || mobileDrawer === 'batch-order')
      ) {
        return null;
      }
      return mobileDrawer;
    }
    if (!hasImageSrc || !mobileDrawer.startsWith('image-')) return null;
    if (
      isGridLayout &&
      (mobileDrawer === 'image-border' || mobileDrawer === 'image-order')
    ) {
      return null;
    }
    return mobileDrawer;
  }, [
    mobileDrawer,
    hasImageSelection,
    selectedCount,
    hasImageSrc,
    isGridLayout,
  ]);

  const handleAddImages = (files: FileList) => {
    if (isGridLayout) {
      fabricHelper.gridUpdater.handleImagesUpload(files);
    } else {
      fabricHelper.canvasUpdater.handleImagesUpload(files);
    }
  };

  const handleReplaceImage = (file: File) => {
    if (isGridLayout) {
      fabricHelper.gridUpdater.replaceImage(file);
    } else {
      fabricHelper.imageUpdater.replaceImage(file);
    }
  };

  const handleDeleteSingle = () => {
    if (isGridLayout) {
      fabricHelper.gridUpdater.deleteImage();
    } else {
      fabricHelper.imageUpdater.deleteImage();
    }
  };

  const handleSwitchLayout = (nextLayout: CanvasConfig['layout']) => {
    if (nextLayout === canvasConfig.layout) return;
    if (nextLayout === 'free') {
      void fabricHelper.canvasUpdater.switchToFreeLayout();
    } else {
      fabricHelper.gridUpdater.switchToGridLayout(
        canvasConfig.gridConfig.rows,
        canvasConfig.gridConfig.cols
      );
    }
  };

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

  const handleRequestSendToPhotoEditor = () => {
    void confirm({
      title: 'Open in Photo Editor Studio',
      message:
        'Transfer your current collage to Photo Editor Studio for advanced layers, masks, curves, and local AI tools? This will replace the current canvas in Photo Editor Studio, while your PicMerge draft remains saved locally.',
      confirmText: 'Continue to Photo Editor',
      cancelText: 'Cancel',
      confirmVariant: 'primary',
      onConfirm: () => {
        void fabricHelper.canvasUpdater.sendToPhotoEditor();
      },
    });
  };

  // Global Hotkeys & Keyboard Navigation (Export, Undo/Redo, Paste, Deselect, Delete, Arrow Nudge)
  useStudioHotkeys({
    fabricHelper,
    configHelper,
    onOpenExport: () => setIsExportModalOpen(true),
    onRequestBatchDelete: () => handleRequestBatchDelete(),
    suppressHotkeys: isConfirmDialogOpen || isExportModalOpen,
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

      {/* Unified Studio Shell matching Photo Editor Studio */}
      <div className="relative flex h-[calc(100dvh_-_156px)] min-h-[540px] flex-col overflow-hidden rounded-2xl border border-neutral-200/90 shadow-lg lg:h-[calc(100dvh_-_176px)] lg:min-h-[620px] dark:border-neutral-800/90">
        <StudioHeaderBar
          width={canvasConfig.size.width}
          height={canvasConfig.size.height}
          layout={canvasConfig.layout}
          snapGuidesEnabled={snapGuidesEnabled}
          canUndo={fabricHelper.historyUpdater.canUndo}
          canRedo={fabricHelper.historyUpdater.canRedo}
          canReset={fabricHelper.historyUpdater.canReset}
          onToggleSnapGuides={setSnapGuidesEnabled}
          onAddImages={handleAddImages}
          onSwitchLayout={handleSwitchLayout}
          onUndo={() => void fabricHelper.historyUpdater.undo()}
          onRedo={() => void fabricHelper.historyUpdater.redo()}
          onRequestReset={handleRequestResetStudio}
          onRequestSendToPhotoEditor={handleRequestSendToPhotoEditor}
          onOpenExport={() => setIsExportModalOpen(true)}
        />

        <div className="flex min-h-0 flex-1">
          <CanvasStage
            containerRef={containerRef}
            canvasRef={canvasRef}
            viewportZoom={fabricHelper.states.viewportZoom}
            editingCellId={fabricHelper.states.editingCellId}
            hasLayers={fabricHelper.layersUpdater.layers.length > 0}
            onChangeViewportZoom={fabricHelper.states.setViewportZoom}
            onExitCellFocus={fabricHelper.states.exitCellFocus}
            onDropImages={handleAddImages}
          />

          <ConfigPanelDesktop
            fabricHelper={fabricHelper}
            configHelper={configHelper}
            onRequestBatchDelete={handleRequestBatchDelete}
          />
        </div>

        <MobileStudioSheet
          activeDrawer={effectiveMobileDrawer}
          fabricHelper={fabricHelper}
          configHelper={configHelper}
          onClose={() => setMobileDrawer(null)}
        />

        <MobileStudioBar
          activeDrawer={effectiveMobileDrawer}
          isGridLayout={isGridLayout}
          hasImageSelection={hasImageSelection}
          hasImageSrc={hasImageSrc}
          selectedCount={selectedCount}
          onSelectDrawer={setMobileDrawer}
          onAddImages={handleAddImages}
          onReplaceImage={handleReplaceImage}
          onDeselect={fabricHelper.canvasUpdater.discardActiveObject}
          onDeleteSingle={handleDeleteSingle}
          onRequestBatchDelete={() =>
            handleRequestBatchDelete(() => setMobileDrawer(null))
          }
          onOpenExport={() => setIsExportModalOpen(true)}
        />
      </div>

      {/* Modern Export Dialog */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        fabricHelper={fabricHelper}
        configHelper={configHelper}
        onRequestSendToPhotoEditor={handleRequestSendToPhotoEditor}
      />

      {/* Shared Confirmation Dialog (Reset, Batch Delete, Pro Edit Handoff) */}
      <ConfirmDialog {...confirmDialogProps} />
    </>
  );
}
