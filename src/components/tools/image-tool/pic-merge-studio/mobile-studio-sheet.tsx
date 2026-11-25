'use client';

import type { ConfigHelper } from './types/config-helper';
import type { FabricHelper } from './types/fabric-helper';

import { CheckCheck, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

import Alignment from './config-panel/desktop/alignment';
import Arrangement from './config-panel/desktop/arrangement';
import AspectRatio from './config-panel/desktop/aspect-ratio';
import Background from './config-panel/desktop/background';
import Border from './config-panel/desktop/border';
import CanvasLayout from './config-panel/desktop/canvas-layout';
import CaptionWatermark from './config-panel/desktop/caption-watermark';
import Filters from './config-panel/desktop/filters';
import Geometry from './config-panel/desktop/geometry';
import LayerStack from './config-panel/desktop/layers-panel/layer-stack';
import Opacity from './config-panel/desktop/opacity';

export type MobileStudioDrawerId =
  | 'canvas-layout'
  | 'canvas-size'
  | 'canvas-text'
  | 'canvas-background'
  | 'canvas-border'
  | 'canvas-layers'
  | 'image-filters'
  | 'image-geometry'
  | 'image-align'
  | 'image-opacity'
  | 'image-border'
  | 'image-order'
  | 'batch-align'
  | 'batch-opacity'
  | 'batch-border'
  | 'batch-order'
  | null;

const DRAWER_TITLES: Record<Exclude<MobileStudioDrawerId, null>, string> = {
  'canvas-layout': 'Canvas Layout & Grids',
  'canvas-size': 'Canvas Size & Ratio',
  'canvas-text': 'Captions & Watermark',
  'canvas-background': 'Canvas Background',
  'canvas-border': 'Canvas Border',
  'canvas-layers': 'Layers',
  'image-filters': 'Filters & Adjustments',
  'image-geometry': 'Geometry, Crop & Mask',
  'image-align': 'Alignment & Fit',
  'image-opacity': 'Image Opacity',
  'image-border': 'Border & Drop Shadow',
  'image-order': 'Layer Order',
  'batch-align': 'Batch Alignment & Distribute',
  'batch-opacity': 'Batch Opacity',
  'batch-border': 'Batch Border',
  'batch-order': 'Batch Layer Order',
};

type Props = {
  activeDrawer: MobileStudioDrawerId;
  fabricHelper: FabricHelper;
  configHelper: ConfigHelper;
  onClose: () => void;
};

/**
 * Collapsible in-shell control tray for Mobile (`< lg`), styled identically to
 * Photo Editor Studio's MobileLiteSheet so it never floats over or clips the canvas.
 */
export default function MobileStudioSheet({
  activeDrawer,
  fabricHelper,
  configHelper,
  onClose,
}: Props) {
  if (!activeDrawer) return null;

  const isGridLayout = configHelper.canvasConfig.layout === 'grid';
  const { layers, selectedCount } = fabricHelper.layersUpdater;

  const handleCommitHistory = () => {
    fabricHelper.historyUpdater.commitHistory('immediate');
  };

  return (
    <div className="absolute inset-x-0 bottom-14 z-30 border-t border-neutral-200/80 bg-white/95 shadow-[0_-8px_28px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden dark:border-neutral-800/80 dark:bg-neutral-900/95 dark:shadow-[0_-8px_28px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between border-b border-neutral-200/60 px-3 py-2 dark:border-neutral-800/60">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {DRAWER_TITLES[activeDrawer]}
          </span>
          {activeDrawer === 'canvas-layers' && (
            <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {layers.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {activeDrawer === 'canvas-layers' && layers.length > 0 && (
            <Button
              variant={selectedCount === layers.length ? 'ghost-sky' : 'ghost'}
              size="xs"
              icon={CheckCheck}
              onClick={() => {
                if (selectedCount === layers.length) {
                  fabricHelper.layersUpdater.selectBackground();
                } else {
                  fabricHelper.layersUpdater.selectAll();
                }
              }}
              className="!h-6 !min-h-6 !px-2 text-[10px]"
            >
              {selectedCount === layers.length ? 'Deselect' : 'Select All'}
            </Button>
          )}
          <Button
            variant="ghost"
            size="xs"
            icon={X}
            onClick={onClose}
            aria-label="Close panel"
            className="!h-6 !min-h-6 !w-6 !min-w-6 !p-0"
          />
        </div>
      </div>

      <div className="scrollbar-thin max-h-[220px] overflow-y-auto px-3 py-2.5">
        {activeDrawer === 'canvas-layout' && (
          <CanvasLayout
            configHelper={configHelper}
            switchToGridLayout={fabricHelper.gridUpdater.switchToGridLayout}
            switchToBentoTemplate={
              fabricHelper.gridUpdater.switchToBentoTemplate
            }
            switchToFreeLayout={fabricHelper.canvasUpdater.switchToFreeLayout}
          />
        )}

        {activeDrawer === 'canvas-size' && (
          <AspectRatio
            size={configHelper.canvasConfig.size}
            setSize={
              isGridLayout
                ? fabricHelper.gridUpdater.setSize
                : fabricHelper.canvasUpdater.setSize
            }
          />
        )}

        {activeDrawer === 'canvas-text' && (
          <CaptionWatermark
            selectedCaption={fabricHelper.states.selectedCaption}
            watermark={
              configHelper.canvasConfig.watermark ?? {
                enabled: false,
                text: '© PicMerge Studio',
                color: '#ffffff',
                opacity: 0.28,
                fontSize: 32,
                angle: -30,
              }
            }
            onAddCaption={fabricHelper.canvasUpdater.addCaption}
            onUpdateCaption={fabricHelper.canvasUpdater.updateSelectedCaption}
            onDeleteCaption={fabricHelper.canvasUpdater.deleteSelectedCaption}
            onUpdateWatermark={fabricHelper.canvasUpdater.setWatermark}
            onChangeEnd={handleCommitHistory}
          />
        )}

        {activeDrawer === 'canvas-background' && (
          <Background
            background={configHelper.canvasConfig.background}
            setBackgroundColor={fabricHelper.canvasUpdater.setBackgroundColor}
            onChangeEnd={handleCommitHistory}
            horizontalSwatches
          />
        )}

        {activeDrawer === 'canvas-border' && (
          <Border
            border={
              isGridLayout
                ? configHelper.canvasConfig.gridConfig.border
                : configHelper.canvasConfig.border
            }
            setBorderWidth={
              isGridLayout
                ? fabricHelper.gridUpdater.setBorderWidth
                : fabricHelper.canvasUpdater.setBorderWidth
            }
            setBorderColor={
              isGridLayout
                ? fabricHelper.gridUpdater.setBorderColor
                : fabricHelper.canvasUpdater.setBorderColor
            }
            resetBorder={
              isGridLayout
                ? fabricHelper.gridUpdater.resetBorder
                : fabricHelper.canvasUpdater.resetBorder
            }
            setShowOuterBorder={
              isGridLayout
                ? fabricHelper.gridUpdater.setShowOuterBorder
                : undefined
            }
            onChangeEnd={handleCommitHistory}
            horizontalSwatches
          />
        )}

        {activeDrawer === 'canvas-layers' && (
          <LayerStack
            layers={layers}
            selectedCount={selectedCount}
            canvasSize={configHelper.canvasConfig.size}
            canvasBackground={configHelper.canvasConfig.background}
            onSelectLayer={(img, isToggle) =>
              fabricHelper.layersUpdater.selectLayer(img, isToggle)
            }
            onSelectBackground={() =>
              fabricHelper.layersUpdater.selectBackground()
            }
            onToggleVisibility={(img) =>
              fabricHelper.layersUpdater.toggleVisibility(img)
            }
            onReorderLayers={(newLayers) =>
              fabricHelper.layersUpdater.reorderLayers(newLayers)
            }
          />
        )}

        {activeDrawer === 'image-filters' && (
          <Filters
            filters={configHelper.imageConfig.filters}
            setFilters={fabricHelper.imageUpdater.setFilters}
            onChangeEnd={handleCommitHistory}
            horizontalPresets
          />
        )}

        {activeDrawer === 'image-geometry' && (
          <Geometry
            imageConfig={configHelper.imageConfig}
            isGridLayout={isGridLayout}
            setGeometry={fabricHelper.imageUpdater.setGeometry}
            setSize={fabricHelper.imageUpdater.setSize}
            setClipMask={fabricHelper.imageUpdater.setClipMask}
            resetOriginalSize={fabricHelper.imageUpdater.resetOriginalSize}
            resetAspectRatio={fabricHelper.imageUpdater.resetAspectRatio}
            onChangeEnd={handleCommitHistory}
          />
        )}

        {activeDrawer === 'image-align' && (
          <Alignment
            setAlignment={
              isGridLayout
                ? fabricHelper.gridUpdater.setAlignment
                : fabricHelper.imageUpdater.setAlignment
            }
            setObjectFit={
              isGridLayout
                ? fabricHelper.gridUpdater.setObjectFit
                : fabricHelper.imageUpdater.setObjectFit
            }
            selectedCount={1}
          />
        )}

        {activeDrawer === 'image-opacity' && (
          <Opacity
            opacity={configHelper.imageConfig.opacity}
            setImageOpacity={fabricHelper.imageUpdater.setOpacity}
            onChangeEnd={handleCommitHistory}
          />
        )}

        {activeDrawer === 'image-border' && (
          <Border
            border={configHelper.imageConfig.border}
            setBorderWidth={fabricHelper.imageUpdater.setBorderWidth}
            setBorderColor={fabricHelper.imageUpdater.setBorderColor}
            resetBorder={fabricHelper.imageUpdater.resetBorder}
            shadow={configHelper.imageConfig.shadow}
            setShadow={fabricHelper.imageUpdater.setShadow}
            onChangeEnd={handleCommitHistory}
            horizontalSwatches
          />
        )}

        {activeDrawer === 'image-order' && (
          <Arrangement setLayer={fabricHelper.imageUpdater.setLayer} />
        )}

        {activeDrawer === 'batch-align' && (
          <Alignment
            setAlignment={fabricHelper.imagesUpdater.setAlignment}
            setObjectFit={fabricHelper.imagesUpdater.setObjectFit}
            distributeSpacing={fabricHelper.imagesUpdater.distributeSpacing}
            selectedCount={selectedCount}
          />
        )}

        {activeDrawer === 'batch-opacity' && (
          <Opacity
            opacity={configHelper.imageConfig.opacity}
            setImageOpacity={fabricHelper.layersUpdater.batchSetOpacity}
            onChangeEnd={handleCommitHistory}
          />
        )}

        {activeDrawer === 'batch-border' && (
          <Border
            border={configHelper.imageConfig.border}
            setBorderWidth={fabricHelper.layersUpdater.batchSetBorderWidth}
            setBorderColor={fabricHelper.layersUpdater.batchSetBorderColor}
            resetBorder={fabricHelper.layersUpdater.batchResetBorder}
            onChangeEnd={handleCommitHistory}
            horizontalSwatches
          />
        )}

        {activeDrawer === 'batch-order' && (
          <Arrangement setLayer={fabricHelper.layersUpdater.batchSetLayer} />
        )}
      </div>
    </div>
  );
}
