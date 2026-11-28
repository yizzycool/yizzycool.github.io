'use client';

import type { MobileLiteDrawerId } from './mobile-lite-sheet';
import type { InspectorTabId } from './types/studio';

import { Monitor, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog, useConfirmDialog } from '@/components/ui/dialog';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';

import HeaderBlock from '../../common/header-block';
import SectionGap from '../../common/section-gap';
import AiModelDownloadDialog from './ai-model-download-dialog';
import CanvasStage from './canvas-stage';
import CompanionRail from './companion-rail';
import ExportDialog from './export-dialog';
import usePhotoEditorEngine from './hooks/use-photo-editor-engine';
import useStudioHotkeys from './hooks/use-studio-hotkeys';
import InspectorPanel from './inspector-panel';
import MobileLiteBar from './mobile-lite-bar';
import MobileLiteSheet from './mobile-lite-sheet';
import StudioHeaderBar from './studio-header-bar';
import TemplatesDialog from './templates-dialog';
import ToolRail from './tool-rail';

/**
 * Photo Editor Studio — Desktop Pro Archetype C workbench (`>= lg`) paired with
 * OOM-safe Mobile Lite mode (`< lg`) sharing the unified Fabric v7 engine.
 */
export default function PhotoEditorStudio() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const layerSearchRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<InspectorTabId>('design');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState<MobileLiteDrawerId>(null);
  const [isLiteBannerDismissed, setIsLiteBannerDismissed] = useState(false);

  const engine = usePhotoEditorEngine({ stageRef, canvasElRef });

  const {
    isOpen: isConfirmOpen,
    confirm,
    dialogProps: confirmDialogProps,
  } = useConfirmDialog();

  const handleRequestReset = () => {
    void confirm({
      title: 'Reset Photo Editor Document',
      message:
        'Clear all layers, reset artboard size, and remove your saved local draft? This cannot be undone.',
      confirmText: 'Reset Document',
      cancelText: 'Cancel',
      confirmVariant: 'error',
      onConfirm: async () => {
        await engine.history.resetStudio();
      },
    });
  };

  const handleRequestClearAiCache = () => {
    void confirm({
      title: 'Clear Cached AI Models',
      message:
        'Remove all locally downloaded ONNX AI weights from your browser cache? You can re-download any model whenever needed.',
      confirmText: 'Clear Cache',
      cancelText: 'Cancel',
      confirmVariant: 'error',
      onConfirm: async () => {
        await engine.ai.clearAllModelCaches();
      },
    });
  };

  const handleRequestSendToPicMerge = (
    scope: 'canvas' | 'selected' = 'canvas'
  ) => {
    const isSelectedScope = scope === 'selected';
    void confirm({
      title: isSelectedScope
        ? 'Add Layer to PicMerge Studio'
        : 'Open in PicMerge Studio',
      message: isSelectedScope
        ? 'Add the selected layer to your PicMerge Studio collage? Your current Photo Editor document remains saved locally.'
        : 'Transfer your current artwork to PicMerge Studio for quick grids and photo collages? This will replace the current canvas in PicMerge Studio, while your Photo Editor document remains saved locally.',
      confirmText: isSelectedScope
        ? 'Send to PicMerge'
        : 'Continue to PicMerge',
      cancelText: 'Cancel',
      confirmVariant: 'primary',
      onConfirm: () => {
        void engine.sendToPicMerge(scope);
      },
    });
  };

  const handleFocusLayerSearch = () => {
    setActiveTab('layers');
    window.setTimeout(() => {
      layerSearchRef.current?.focus();
    }, 50);
  };

  const handleCopyDesktopLink = async () => {
    if (typeof window === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Copied link to open full studio on desktop');
    } catch {
      toast.error('Unable to copy link');
    }
  };

  const canResetCrop = Boolean(
    engine.states.cropRect &&
      engine.states.cropImageBounds &&
      (engine.states.cropRect.x !== 0 ||
        engine.states.cropRect.y !== 0 ||
        engine.states.cropRect.width !== engine.states.cropImageBounds.width ||
        engine.states.cropRect.height !== engine.states.cropImageBounds.height)
  );

  const hasFaceDetector =
    typeof window !== 'undefined' && 'FaceDetector' in window;

  useStudioHotkeys({
    engine,
    onOpenExport: () => setIsExportOpen(true),
    onFocusLayerSearch: handleFocusLayerSearch,
    suppressHotkeys:
      isConfirmOpen ||
      isExportOpen ||
      isTemplatesOpen ||
      Boolean(engine.ai.modalState),
  });

  return (
    <>
      <HeaderBlock
        customShortcuts={[
          { ...TOOL_HOTKEYS.save, label: 'Export Artwork' },
          { symbol: 'Ctrl + Z', label: 'Undo' },
          { symbol: 'Ctrl + Shift + Z', label: 'Redo' },
          { symbol: 'Ctrl + V', label: 'Paste Image Layer' },
          { symbol: 'Ctrl + G', label: 'Group Selected Layers' },
          { symbol: 'Ctrl + Shift + G', label: 'Ungroup Layers' },
          { symbol: 'Ctrl + D', label: 'Duplicate Selected' },
          { symbol: 'Ctrl + 0 / 1', label: 'Fit Artboard / 100% Zoom' },
          { symbol: '/', label: 'Search Layers' },
          { symbol: 'Shift + R', label: 'Toggle Canvas Rulers' },
          {
            symbol: 'M / J / G',
            label: 'AI Magic Select / AI Magic Eraser / Mosaic Brush',
          },
          {
            symbol: 'V / H / C / B / E / K / P / T / U / I',
            label: 'Switch Editor Tool',
          },
          { symbol: 'Space + Drag', label: 'Pan Canvas' },
          TOOL_HOTKEYS.help,
        ]}
      />

      <SectionGap />

      {/* Dismissible Mobile Lite Notice outside studio shell (< lg) */}
      {!isLiteBannerDismissed && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-sky-200/80 bg-sky-50/85 px-3 py-1.5 text-[11px] text-sky-800 lg:hidden dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-200">
          <div className="flex min-w-0 items-center gap-1.5">
            <Monitor className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
            <span className="truncate font-medium">
              Mobile Lite · Desktop for full Layers &amp; HD AI
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => void handleCopyDesktopLink()}
              className="!h-6 !px-1.5 text-[10px] font-semibold text-sky-700 hover:bg-sky-100 dark:text-sky-300 dark:hover:bg-sky-900/50"
            >
              Copy Link
            </Button>
            <Button
              variant="ghost"
              size="xs"
              icon={X}
              onClick={() => setIsLiteBannerDismissed(true)}
              aria-label="Dismiss notice"
              className="!h-6 !min-h-6 !w-6 !min-w-6 !p-0 text-sky-600 hover:bg-sky-100 dark:text-sky-400 dark:hover:bg-sky-900/50"
            />
          </div>
        </div>
      )}

      {/* Unified Studio Shell: Desktop Pro (>= lg) & Mobile Lite (< lg) */}
      <div className="flex h-[calc(100dvh_-_156px)] min-h-[540px] flex-col overflow-hidden rounded-2xl border border-neutral-200/90 shadow-lg lg:h-[calc(100dvh_-_176px)] lg:min-h-[620px] dark:border-neutral-800/90">
        <StudioHeaderBar
          docConfig={engine.states.docConfig}
          snapGuidesEnabled={engine.states.snapGuidesEnabled}
          rulersVisible={engine.states.rulersVisible}
          isComparingOriginal={engine.states.isComparingOriginal}
          canUndo={engine.history.canUndo}
          canRedo={engine.history.canRedo}
          canReset={engine.history.canReset}
          onToggleSnapGuides={engine.setSnapGuidesEnabled}
          onToggleRulers={engine.toggleRulers}
          onAddImages={(files) => void engine.addImages(files)}
          onOpenProjectFile={(file) => {
            if (file.name.toLowerCase().endsWith('.psd')) {
              void engine.openPsdFile(file);
            } else {
              void engine.openPesFile(file);
            }
          }}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
          onSendToPicMerge={() => handleRequestSendToPicMerge('canvas')}
          onSavePes={() => void engine.savePesProject()}
          onOpenExport={() => setIsExportOpen(true)}
          onUndo={() => void engine.history.undo()}
          onRedo={() => void engine.history.redo()}
          onToggleCompare={engine.toggleCompareOriginal}
          onRequestReset={handleRequestReset}
          onOpenMobileCanvas={() =>
            setMobileDrawer((prev) => (prev === 'canvas' ? null : 'canvas'))
          }
        />

        <div className="flex min-h-0 flex-1">
          <ToolRail
            activeTool={engine.states.activeTool}
            canGroup={Boolean(engine.states.selectedProps?.canGroup)}
            canUngroup={Boolean(engine.states.selectedProps?.canUngroup)}
            onSelectTool={engine.setActiveTool}
            onGroup={engine.groupSelected}
            onUngroup={engine.ungroupSelected}
          />

          <CanvasStage
            stageRef={stageRef}
            canvasElRef={canvasElRef}
            zoom={engine.states.zoom}
            viewportTransform={engine.states.viewportTransform}
            stageSize={engine.states.stageSize}
            rulersVisible={engine.states.rulersVisible}
            guidesCount={engine.states.userGuides.length}
            aiBusyMessage={engine.ai.busyMessage}
            beforeSnapshotUrl={engine.states.beforeSnapshotUrl}
            compareSplitPercent={engine.states.compareSplitPercent}
            cursorPos={engine.states.cursorPos}
            hasLayers={engine.states.layers.length > 0}
            selectedKind={engine.states.selectedProps?.kind ?? null}
            selectedCount={engine.states.selectedProps?.selectedCount ?? 0}
            activeTool={engine.states.activeTool}
            onZoomIn={engine.zoomIn}
            onZoomOut={engine.zoomOut}
            onFitToScreen={engine.fitToScreen}
            onZoom100={engine.zoomTo100}
            onStartDragGuide={engine.addOrDragUserGuide}
            onClearGuides={engine.clearUserGuides}
            onChangeCompareSplit={engine.setCompareSplitPercent}
            onDropFiles={(files) => void engine.addImages(files)}
            onDropPesFile={(file) => void engine.openPesFile(file)}
            onDropLutFile={(file) => void engine.loadCubeLutFile(file)}
            onOpenTemplates={() => setIsTemplatesOpen(true)}
            onQuickReplaceImage={(file) =>
              void engine.replaceSelectedImage(file)
            }
            onQuickCropImage={() => {
              engine.setActiveTool('crop');
              setMobileDrawer('crop');
            }}
            onQuickAlign={engine.alignSelected}
            onQuickDuplicate={() => void engine.duplicateSelected()}
            onQuickDelete={engine.deleteSelected}
          />

          <InspectorPanel
            activeTab={activeTab}
            onTabChange={setActiveTab}
            engine={engine}
            layerSearchRef={layerSearchRef}
            onRequestClearAiCache={handleRequestClearAiCache}
          />

          <CompanionRail
            hasSelection={Boolean(engine.states.selectedProps)}
            onSendToPicMerge={handleRequestSendToPicMerge}
          />
        </div>

        <MobileLiteSheet
          activeDrawer={mobileDrawer}
          onClose={() => {
            if (
              engine.states.activeTool === 'crop' ||
              engine.states.activeTool === 'mosaic'
            ) {
              engine.setActiveTool('select');
            }
            setMobileDrawer(null);
          }}
          docConfig={engine.states.docConfig}
          selectedProps={engine.states.selectedProps}
          layers={engine.states.layers}
          filterValues={engine.states.filterValues}
          cropAspect={engine.states.cropAspect}
          cropRect={engine.states.cropRect}
          canResetCrop={canResetCrop}
          mosaicBrushSize={engine.states.mosaicBrushSize}
          hasFaceDetector={hasFaceDetector}
          onUpdateDocument={engine.updateDocumentConfig}
          onUpdateProp={engine.updateSelectedProp}
          onUpdateBlendMode={engine.updateSelectedBlendMode}
          onUpdateClipShape={engine.updateSelectedClipShape}
          onAlign={engine.alignSelected}
          onReplaceImage={(file) => void engine.replaceSelectedImage(file)}
          onStartCrop={() => {
            engine.setActiveTool('crop');
            setMobileDrawer('crop');
          }}
          onDuplicate={() => void engine.duplicateSelected()}
          onDelete={engine.deleteSelected}
          onSelectLayer={engine.selectLayerById}
          onToggleVisibility={engine.toggleLayerVisibility}
          onDeleteLayer={engine.deleteLayerById}
          onOrderSelected={engine.reorderSelectedOrder}
          onSetCropAspect={engine.setCropAspect}
          onApplyCrop={engine.applyCrop}
          onResetCrop={engine.resetImageCrop}
          onCancelCrop={engine.cancelCrop}
          onUpdateFilters={engine.updateSelectedFilters}
          onAddQuickText={(text) => engine.addTextLayer(text)}
          onSetMosaicBrushSize={engine.setMosaicBrushSize}
          onFacePrivacyMosaic={() => void engine.applyFacePrivacyMosaic()}
        />

        <MobileLiteBar
          activeDrawer={mobileDrawer}
          onSelectDrawer={(drawer) => {
            if (drawer !== 'crop' && engine.states.activeTool === 'crop') {
              engine.cancelCrop();
            }
            if (drawer !== 'mosaic' && engine.states.activeTool === 'mosaic') {
              engine.setActiveTool('select');
            }
            setMobileDrawer(drawer);
          }}
          onAddImages={(files) => void engine.addImages(files)}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
          onStartCrop={() => engine.setActiveTool('crop')}
          onActivateMosaic={() => engine.setActiveTool('mosaic')}
          onRunFastCutout={() => void engine.applyRemoveBackground('fast')}
        />
      </div>

      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        docConfig={engine.states.docConfig}
        hasSelection={Boolean(engine.states.selectedProps)}
        onExport={engine.exportDocument}
        onCopyPng={engine.copyPngToClipboard}
        onSendToPicMerge={handleRequestSendToPicMerge}
      />

      <TemplatesDialog
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={engine.applyStarterTemplate}
      />

      <AiModelDownloadDialog
        modalState={engine.ai.modalState}
        onConfirm={engine.ai.confirmDownloadModal}
        onCancel={engine.ai.cancelDownloadOrTask}
      />

      <ConfirmDialog {...confirmDialogProps} />
    </>
  );
}
