'use client';

import type { ConfigHelper } from '../../types/config-helper';
import type { FabricHelper } from '../../types/fabric-helper';

import { useRef } from 'react';
import { ChevronLeft, Replace, Trash2, Upload } from 'lucide-react';

import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

import UploadBlock from './upload-block';
import GroupTitle from './group-title';
import CanvasLayout from './canvas-layout';
import AspectRatio from './aspect-ratio';
import Background from './background';
import Border from './border';
import Alignment from './alignment';
import OutputFormat from './output-format';
import Arrangement from './arrangement';
import Geometry from './geometry';
import Filters from './filters';
import Opacity from './opacity';
import IconTextButton from './icon-text-button';

type Props = {
  fabricHelper: FabricHelper;
  configHelper: ConfigHelper;
  onOpenExport?: () => void;
};

export default function ConfigPanelMobile({
  fabricHelper,
  configHelper,
  onOpenExport,
}: Props) {
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const isGridLayout = configHelper.canvasConfig.layout === 'grid';
  const { hasImageSelection, selectedCount, hasImageSrc } = fabricHelper.states;

  const handleOpenReplace = () => {
    if (!replaceInputRef.current) return;
    replaceInputRef.current.value = '';
    replaceInputRef.current.click();
  };

  const handleReplaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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

  return (
    <div
      className={cn(
        'sticky bottom-0 border-t border-neutral-200 dark:border-neutral-700',
        'w-[100vw] min-w-[100vw] max-w-[100vw]',
        '-mx-5 -mb-20 mt-20 sm:-mx-6',
        'bg-white dark:bg-neutral-900'
      )}
    >
      <div className="relative flex w-full items-end space-x-2 overflow-x-auto overflow-y-hidden p-4">
        {!hasImageSelection ? (
          /* Canvas Settings (when selectedCount === 0) */
          <>
            <UploadBlock
              handleImagesUpload={
                isGridLayout
                  ? fabricHelper.gridUpdater.handleImagesUpload
                  : fabricHelper.canvasUpdater.handleImagesUpload
              }
            />

            {/* Divide */}
            <div className="mb-4 h-[30px] self-end border-l border-neutral-700" />

            {/* Canvas Config */}
            <div className="space-y-2">
              <GroupTitle text="Canvas" className="px-4" />
              <div className="flex space-x-2">
                <AspectRatio
                  size={configHelper.canvasConfig.size}
                  setSize={
                    isGridLayout
                      ? fabricHelper.gridUpdater.setSize
                      : fabricHelper.canvasUpdater.setSize
                  }
                />
                <CanvasLayout
                  configHelper={configHelper}
                  switchToGridLayout={
                    fabricHelper.gridUpdater.switchToGridLayout
                  }
                  switchToFreeLayout={
                    fabricHelper.canvasUpdater.switchToFreeLayout
                  }
                />
                <Background
                  background={configHelper.canvasConfig.background}
                  setBackgroundColor={
                    fabricHelper.canvasUpdater.setBackgroundColor
                  }
                />
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
              </div>
            </div>

            {/* Divide */}
            <div className="mb-4 h-[30px] self-end border-l border-neutral-700" />

            {/* Export Config */}
            <OutputFormat
              configHelper={configHelper}
              exportCanvas={fabricHelper.canvasUpdater.export}
              onOpenExport={onOpenExport}
            />
          </>
        ) : selectedCount > 1 ? (
          /* Batch Selection (when selectedCount > 1) */
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 px-4">
              <GroupTitle
                text={`Selected (${selectedCount})`}
                className="flex-1 !px-0"
              />
              <Button
                variant="ghost"
                size="xs"
                icon={ChevronLeft}
                onClick={fabricHelper.canvasUpdater.discardActiveObject}
                className="!h-6 shrink-0 !px-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                Canvas
              </Button>
            </div>
            <div className="flex space-x-2">
              <IconTextButton
                icon={Trash2}
                text="Delete"
                onClick={fabricHelper.layersUpdater.batchDelete}
              />
              {!isGridLayout && (
                <Arrangement
                  setLayer={fabricHelper.layersUpdater.batchSetLayer}
                />
              )}
              <Alignment
                setAlignment={fabricHelper.imagesUpdater.setAlignment}
                setObjectFit={fabricHelper.imagesUpdater.setObjectFit}
              />
              <Opacity
                opacity={configHelper.imageConfig.opacity}
                setImageOpacity={fabricHelper.layersUpdater.batchSetOpacity}
              />
              {!isGridLayout && (
                <Border
                  border={configHelper.imageConfig.border}
                  setBorderWidth={
                    fabricHelper.layersUpdater.batchSetBorderWidth
                  }
                  setBorderColor={
                    fabricHelper.layersUpdater.batchSetBorderColor
                  }
                  resetBorder={fabricHelper.layersUpdater.batchResetBorder}
                />
              )}
            </div>
          </div>
        ) : (
          /* Single Image (when selectedCount === 1) */
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 px-4">
              <GroupTitle text="Selected Image" className="flex-1 !px-0" />
              <Button
                variant="ghost"
                size="xs"
                icon={ChevronLeft}
                onClick={fabricHelper.canvasUpdater.discardActiveObject}
                className="!h-6 shrink-0 !px-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                Canvas
              </Button>
            </div>
            <div className="flex space-x-2">
              {hasImageSrc ? (
                <>
                  <IconTextButton
                    icon={Replace}
                    text="Replace"
                    onClick={handleOpenReplace}
                  />
                  <IconTextButton
                    icon={Trash2}
                    text="Delete"
                    onClick={handleDeleteSingle}
                  />
                </>
              ) : (
                <IconTextButton
                  icon={Upload}
                  text="Upload"
                  onClick={handleOpenReplace}
                />
              )}
              {hasImageSrc && (
                <>
                  {!isGridLayout && (
                    <Arrangement
                      setLayer={fabricHelper.imageUpdater.setLayer}
                    />
                  )}
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
                  />
                  <Geometry
                    imageConfig={configHelper.imageConfig}
                    setGeometry={fabricHelper.imageUpdater.setGeometry}
                    setSize={fabricHelper.imageUpdater.setSize}
                    resetOriginalSize={
                      fabricHelper.imageUpdater.resetOriginalSize
                    }
                    resetAspectRatio={
                      fabricHelper.imageUpdater.resetAspectRatio
                    }
                  />
                  <Opacity
                    opacity={configHelper.imageConfig.opacity}
                    setImageOpacity={fabricHelper.imageUpdater.setOpacity}
                  />
                  {!isGridLayout && (
                    <Border
                      border={configHelper.imageConfig.border}
                      setBorderWidth={fabricHelper.imageUpdater.setBorderWidth}
                      setBorderColor={fabricHelper.imageUpdater.setBorderColor}
                      resetBorder={fabricHelper.imageUpdater.resetBorder}
                    />
                  )}
                  <Filters
                    filters={configHelper.imageConfig.filters}
                    setFilters={fabricHelper.imageUpdater.setFilters}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input for Replace/Upload */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceFileChange}
      />

      {/* Drawer Mount Portal */}
      <div id="pic-merge-studio-mobile-config-drawer" />
    </div>
  );
}
