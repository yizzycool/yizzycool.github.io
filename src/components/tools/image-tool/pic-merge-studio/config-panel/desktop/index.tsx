'use client';

import type { FabricHelper } from '../../types/fabric-helper';
import type { ConfigHelper } from '../../types/config-helper';

import { CheckCheck, Layers, Minimize2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

import AspectRatio from './aspect-ratio';
import CanvasLayout from './canvas-layout';
import Background from './background';
import Border from './border';
import Geometry from './geometry';
import Filters from './filters';
import Arrangement from './arrangement';
import Alignment from './alignment';
import Opacity from './opacity';
import ActionToolbar, { type ActionToolId } from './action-toolbar';
import LayerStack from './layers-panel/layer-stack';

type ConfigPanelDesktopProps = {
  fabricHelper: FabricHelper;
  configHelper: ConfigHelper;
  onOpenExport?: () => void;
};

export default function ConfigPanelDesktop({
  fabricHelper,
  configHelper,
  onOpenExport,
}: ConfigPanelDesktopProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeToolId, setActiveToolId] = useState<ActionToolId | null>(null);

  const isGridLayout = configHelper.canvasConfig.layout === 'grid';
  const { layers, selectedCount } = fabricHelper.layersUpdater;

  // Derive effective active tool cleanly without cascading setState in effects
  const effectiveActiveToolId = useMemo(() => {
    if (selectedCount === 0) {
      if (activeToolId && !activeToolId.startsWith('canvas-')) {
        return null;
      }
    } else if (selectedCount === 1) {
      if (activeToolId && !activeToolId.startsWith('image-')) {
        return null;
      }
    } else if (selectedCount >= 2) {
      if (activeToolId && !activeToolId.startsWith('batch-')) {
        return null;
      }
    }
    return activeToolId;
  }, [selectedCount, activeToolId]);

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
    setActiveToolId(null);
  };

  const handleDeleteBatch = () => {
    fabricHelper.layersUpdater.batchDelete();
    setActiveToolId(null);
  };

  const handleExport = () => {
    if (onOpenExport) {
      onOpenExport();
    } else {
      fabricHelper.canvasUpdater.export();
    }
  };

  if (!isOpen) {
    return (
      <div className="absolute right-4 top-4 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            'flex items-center gap-2 rounded-full border px-3.5 py-2 shadow-xl backdrop-blur-xl transition-colors duration-200',
            'bg-white/90 dark:bg-neutral-900/90',
            'hover:bg-neutral-50 dark:hover:bg-neutral-800',
            'border-neutral-200/90 dark:border-neutral-800/90',
            'text-neutral-800 dark:text-neutral-200'
          )}
        >
          <Layers className="h-4 w-4" />
          <span className="text-xs font-bold">Layers</span>
        </button>
      </div>
    );
  }

  const getToolTitle = (toolId: ActionToolId | null) => {
    switch (toolId) {
      case 'canvas-aspect-ratio':
        return 'Canvas Size & Ratio';
      case 'canvas-layout':
        return 'Canvas Layout';
      case 'canvas-background':
        return 'Canvas Background';
      case 'canvas-border':
        return 'Canvas Border';
      case 'image-geometry':
        return 'Geometry & Transform';
      case 'image-arrangement':
      case 'batch-arrangement':
        return 'Layer Order';
      case 'image-border':
        return 'Image Border';
      case 'batch-border':
        return 'Batch Border';
      case 'image-opacity':
      case 'batch-opacity':
        return 'Opacity';
      case 'image-filters':
        return 'Filters';
      case 'image-align':
      case 'batch-align':
        return 'Alignment & Fit';
      default:
        return 'Layers';
    }
  };

  return (
    <aside
      aria-label="Studio Layers & Inspector"
      className={cn(
        'absolute right-4 top-4 z-40 flex max-h-80 w-60 min-w-60 max-w-60 shrink-0 flex-col overflow-hidden',
        'rounded-xl border border-neutral-200/90 bg-white/90 shadow-2xl backdrop-blur-2xl',
        'dark:border-neutral-800/90 dark:bg-neutral-900/90 dark:shadow-black/40'
      )}
    >
      {/* Panel Header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-neutral-200/80 px-3.5 dark:border-neutral-800/80">
        {effectiveActiveToolId === null ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Layers
            </span>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              {layers.length}
            </span>
          </div>
        ) : (
          <span className="max-w-[150px] truncate text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            {getToolTitle(effectiveActiveToolId)}
          </span>
        )}

        {/* Header Right Actions */}
        <div className="flex items-center gap-1">
          {layers.length > 0 && (
            <Button
              variant={selectedCount === layers.length ? 'ghost-sky' : 'ghost'}
              size="sm"
              icon={CheckCheck}
              iconClassName="h-4 w-4"
              title={
                selectedCount === layers.length ? 'Deselect All' : 'Select All'
              }
              onClick={() => {
                if (selectedCount === layers.length) {
                  fabricHelper.layersUpdater.selectBackground();
                } else {
                  fabricHelper.layersUpdater.selectAll();
                }
              }}
              className={cn(
                '!h-7 !min-h-7 !w-7 !min-w-7 !p-0 transition-colors',
                selectedCount === layers.length
                  ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400'
                  : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
              )}
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={Minimize2}
            iconClassName="h-4 w-4"
            title="Minimize Panel"
            onClick={() => setIsOpen(false)}
            className="!h-7 !min-h-7 !w-7 !min-w-7 !p-0 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          />
        </div>
      </div>

      {/* Contextual Action Toolbar */}
      <ActionToolbar
        selectedCount={selectedCount}
        activeToolId={effectiveActiveToolId}
        onSelectTool={setActiveToolId}
        onAddImages={handleAddImages}
        onReplaceImage={selectedCount === 1 ? handleReplaceImage : undefined}
        onDeleteSingle={selectedCount === 1 ? handleDeleteSingle : undefined}
        onDeleteBatch={selectedCount >= 2 ? handleDeleteBatch : undefined}
        onExport={handleExport}
      />

      {/* Separator */}
      <div className="border-b border-neutral-200/80 dark:border-neutral-800/80" />

      {/* Inspector / Content Area */}
      <div className="scrollbar-thin flex-1 overflow-y-auto px-2 py-3.5">
        {effectiveActiveToolId === null ? (
          /* Layer Stack */
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
        ) : (
          /* Tool View */
          <div className="space-y-4">
            {effectiveActiveToolId === 'canvas-aspect-ratio' && (
              <AspectRatio
                size={configHelper.canvasConfig.size}
                setSize={
                  isGridLayout
                    ? fabricHelper.gridUpdater.setSize
                    : fabricHelper.canvasUpdater.setSize
                }
              />
            )}

            {effectiveActiveToolId === 'canvas-layout' && (
              <CanvasLayout
                configHelper={configHelper}
                switchToGridLayout={fabricHelper.gridUpdater.switchToGridLayout}
                switchToFreeLayout={
                  fabricHelper.canvasUpdater.switchToFreeLayout
                }
              />
            )}

            {effectiveActiveToolId === 'canvas-background' && (
              <Background
                background={configHelper.canvasConfig.background}
                setBackgroundColor={
                  fabricHelper.canvasUpdater.setBackgroundColor
                }
              />
            )}

            {effectiveActiveToolId === 'canvas-border' && (
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
              />
            )}

            {/* Image Tools */}

            {effectiveActiveToolId === 'image-align' && (
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

            {effectiveActiveToolId === 'image-arrangement' && (
              <Arrangement setLayer={fabricHelper.imageUpdater.setLayer} />
            )}

            {effectiveActiveToolId === 'image-geometry' && (
              <Geometry
                imageConfig={configHelper.imageConfig}
                setGeometry={fabricHelper.imageUpdater.setGeometry}
                setSize={fabricHelper.imageUpdater.setSize}
                resetOriginalSize={fabricHelper.imageUpdater.resetOriginalSize}
                resetAspectRatio={fabricHelper.imageUpdater.resetAspectRatio}
              />
            )}

            {effectiveActiveToolId === 'image-opacity' && (
              <Opacity
                opacity={configHelper.imageConfig.opacity}
                setImageOpacity={fabricHelper.imageUpdater.setOpacity}
              />
            )}

            {effectiveActiveToolId === 'image-border' && (
              <Border
                border={configHelper.imageConfig.border}
                setBorderWidth={fabricHelper.imageUpdater.setBorderWidth}
                setBorderColor={fabricHelper.imageUpdater.setBorderColor}
                resetBorder={fabricHelper.imageUpdater.resetBorder}
              />
            )}

            {effectiveActiveToolId === 'image-filters' && (
              <Filters
                filters={configHelper.imageConfig.filters}
                setFilters={fabricHelper.imageUpdater.setFilters}
              />
            )}

            {/* Batch Tools */}
            {effectiveActiveToolId === 'batch-align' && (
              <Alignment
                setAlignment={fabricHelper.imagesUpdater.setAlignment}
                setObjectFit={fabricHelper.imagesUpdater.setObjectFit}
                selectedCount={selectedCount}
              />
            )}

            {effectiveActiveToolId === 'batch-arrangement' && (
              <Arrangement
                setLayer={fabricHelper.layersUpdater.batchSetLayer}
              />
            )}

            {effectiveActiveToolId === 'batch-opacity' && (
              <Opacity
                opacity={configHelper.imageConfig.opacity}
                setImageOpacity={fabricHelper.layersUpdater.batchSetOpacity}
              />
            )}

            {effectiveActiveToolId === 'batch-border' && (
              <Border
                border={configHelper.imageConfig.border}
                setBorderWidth={fabricHelper.layersUpdater.batchSetBorderWidth}
                setBorderColor={fabricHelper.layersUpdater.batchSetBorderColor}
                resetBorder={fabricHelper.layersUpdater.batchResetBorder}
              />
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
