'use client';

import type { ConfigHelper } from '../../types/config-helper';
import type { FabricHelper } from '../../types/fabric-helper';

import { useRef, useState } from 'react';
import {
  CheckCheck,
  ChevronLeft,
  ImagePlus,
  Layers,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Type,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs } from '@/components/ui/tabs';

import Alignment from './alignment';
import Arrangement from './arrangement';
import AspectRatio from './aspect-ratio';
import Background from './background';
import Border from './border';
import CanvasLayout from './canvas-layout';
import CaptionWatermark from './caption-watermark';
import Filters from './filters';
import Geometry from './geometry';
import LayerStack from './layers-panel/layer-stack';
import Opacity from './opacity';

type InspectorTabId = 'design' | 'filters' | 'text' | 'layers';

const TABS: InspectorTabId[] = ['design', 'filters', 'text', 'layers'];

type ConfigPanelDesktopProps = {
  fabricHelper: FabricHelper;
  configHelper: ConfigHelper;
  onRequestBatchDelete: (onAfterConfirm?: () => void) => void;
};

/**
 * Right dockable studio inspector (>= lg) matching Photo Editor Studio's InspectorPanel:
 * houses contextual Design controls (Canvas / Image / Batch), Filters, Text/Watermark, and Layers.
 */
export default function ConfigPanelDesktop({
  fabricHelper,
  configHelper,
  onRequestBatchDelete,
}: ConfigPanelDesktopProps) {
  const [activeTab, setActiveTab] = useState<InspectorTabId>('design');
  const addInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const isGridLayout = configHelper.canvasConfig.layout === 'grid';
  const { layers, selectedCount } = fabricHelper.layersUpdater;
  const { hasCaptionSelection, selectedCaption, hasImageSrc } =
    fabricHelper.states;

  const effectiveTab: InspectorTabId = hasCaptionSelection ? 'text' : activeTab;

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

  const handleCommitHistory = () => {
    fabricHelper.historyUpdater.commitHistory('immediate');
  };

  return (
    <aside
      aria-label="Studio Inspector"
      className="hidden w-[320px] shrink-0 flex-col border-l border-neutral-200/80 bg-white/95 lg:flex dark:border-neutral-800/80 dark:bg-neutral-900/95"
    >
      <input
        ref={addInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleAddImages(e.target.files);
          }
          e.target.value = '';
        }}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReplaceImage(file);
          e.target.value = '';
        }}
      />

      {/* Top Tabs Bar */}
      <div className="border-b border-neutral-200/80 p-2 dark:border-neutral-800/80">
        <Tabs<InspectorTabId>
          tabs={TABS}
          activeTab={effectiveTab}
          onChange={(tab) => {
            if (hasCaptionSelection && tab !== 'text') {
              fabricHelper.canvasUpdater.discardActiveObject();
            }
            setActiveTab(tab);
          }}
          tabLabels={{
            design: 'Design',
            filters: 'Filters',
            text: 'Text',
            layers: 'Layers',
          }}
          tabIcons={{
            design: SlidersHorizontal,
            filters: Sparkles,
            text: Type,
            layers: Layers,
          }}
          size="xs"
          fullWidth
          className="w-full gap-1"
          tabClassName="shrink-0 whitespace-nowrap px-2"
        />
      </div>

      {/* Scrollable Inspector Body */}
      <div className="scrollbar-thin flex-1 overflow-y-auto p-3.5">
        {effectiveTab === 'design' && selectedCount === 0 && (
          <div className="space-y-5">
            <div>
              <CanvasLayout
                configHelper={configHelper}
                switchToGridLayout={fabricHelper.gridUpdater.switchToGridLayout}
                switchToBentoTemplate={
                  fabricHelper.gridUpdater.switchToBentoTemplate
                }
                switchToFreeLayout={
                  fabricHelper.canvasUpdater.switchToFreeLayout
                }
              />
            </div>

            <div className="space-y-2.5 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
              <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Canvas Dimensions
              </Label>
              <AspectRatio
                size={configHelper.canvasConfig.size}
                setSize={
                  isGridLayout
                    ? fabricHelper.gridUpdater.setSize
                    : fabricHelper.canvasUpdater.setSize
                }
              />
            </div>

            <div className="space-y-2.5 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
              <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Canvas Background
              </Label>
              <Background
                background={configHelper.canvasConfig.background}
                setBackgroundColor={
                  fabricHelper.canvasUpdater.setBackgroundColor
                }
                onChangeEnd={handleCommitHistory}
              />
            </div>

            <div className="space-y-2.5 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
              <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {isGridLayout ? 'Grid Spacing & Border' : 'Canvas Border'}
              </Label>
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
              />
            </div>
          </div>
        )}

        {effectiveTab === 'design' && selectedCount === 1 && (
          <div className="space-y-5">
            {/* Selection Action Strip */}
            <div className="flex items-center justify-between gap-2 rounded-xl border border-sky-200/80 bg-sky-50/60 px-2.5 py-2 dark:border-sky-800/60 dark:bg-sky-950/30">
              <Button
                variant="ghost"
                size="xs"
                icon={ChevronLeft}
                onClick={fabricHelper.canvasUpdater.discardActiveObject}
                className="!h-6 !min-h-6 !px-1.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300"
              >
                Canvas
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="xs"
                  bordered
                  icon={hasImageSrc ? RefreshCw : ImagePlus}
                  onClick={() => replaceInputRef.current?.click()}
                  className="!h-6 !min-h-6 !px-2 text-[11px]"
                >
                  {hasImageSrc ? 'Replace' : 'Upload'}
                </Button>
                {hasImageSrc && (
                  <Button
                    variant="ghost"
                    size="xs"
                    icon={Trash2}
                    onClick={handleDeleteSingle}
                    title="Delete Selected Image"
                    aria-label="Delete Selected Image"
                    className="!h-6 !min-h-6 !w-6 !min-w-6 !p-0 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  />
                )}
              </div>
            </div>

            {hasImageSrc ? (
              <>
                <div className="space-y-2.5">
                  <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Alignment &amp; Fit
                  </Label>
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
                </div>

                <div className="space-y-2.5 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
                  <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Geometry &amp; Crop
                  </Label>
                  <Geometry
                    imageConfig={configHelper.imageConfig}
                    isGridLayout={isGridLayout}
                    setGeometry={fabricHelper.imageUpdater.setGeometry}
                    setSize={fabricHelper.imageUpdater.setSize}
                    setClipMask={fabricHelper.imageUpdater.setClipMask}
                    resetOriginalSize={
                      fabricHelper.imageUpdater.resetOriginalSize
                    }
                    resetAspectRatio={
                      fabricHelper.imageUpdater.resetAspectRatio
                    }
                    onChangeEnd={handleCommitHistory}
                  />
                </div>

                <div className="space-y-2.5 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
                  <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Appearance
                  </Label>
                  <Opacity
                    opacity={configHelper.imageConfig.opacity}
                    setImageOpacity={fabricHelper.imageUpdater.setOpacity}
                    onChangeEnd={handleCommitHistory}
                  />
                </div>

                {!isGridLayout && (
                  <>
                    <div className="space-y-2.5 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
                      <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        Border &amp; Shadow
                      </Label>
                      <Border
                        border={configHelper.imageConfig.border}
                        setBorderWidth={
                          fabricHelper.imageUpdater.setBorderWidth
                        }
                        setBorderColor={
                          fabricHelper.imageUpdater.setBorderColor
                        }
                        resetBorder={fabricHelper.imageUpdater.resetBorder}
                        shadow={configHelper.imageConfig.shadow}
                        setShadow={fabricHelper.imageUpdater.setShadow}
                        onChangeEnd={handleCommitHistory}
                      />
                    </div>

                    <div className="space-y-2.5 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
                      <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        Layer Order
                      </Label>
                      <Arrangement
                        setLayer={fabricHelper.imageUpdater.setLayer}
                      />
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-neutral-300/80 bg-neutral-50/70 p-4 text-center text-xs text-neutral-500 dark:border-neutral-700/80 dark:bg-neutral-900/50 dark:text-neutral-400">
                Empty grid cell selected. Click{' '}
                <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                  Upload
                </span>{' '}
                above to place a photo in this slot.
              </div>
            )}
          </div>
        )}

        {effectiveTab === 'design' && selectedCount >= 2 && (
          <div className="space-y-5">
            {/* Batch Selection Strip */}
            <div className="flex items-center justify-between gap-2 rounded-xl border border-sky-200/80 bg-sky-50/60 px-2.5 py-2 dark:border-sky-800/60 dark:bg-sky-950/30">
              <Button
                variant="ghost"
                size="xs"
                icon={ChevronLeft}
                onClick={fabricHelper.canvasUpdater.discardActiveObject}
                className="!h-6 !min-h-6 !px-1.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300"
              >
                Canvas
              </Button>
              <Button
                variant="ghost"
                size="xs"
                icon={Trash2}
                onClick={() => onRequestBatchDelete()}
                className="!h-6 !min-h-6 !px-2 text-[11px] font-semibold text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                Delete ({selectedCount})
              </Button>
            </div>

            <div className="space-y-2.5">
              <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Batch Alignment
              </Label>
              <Alignment
                setAlignment={fabricHelper.imagesUpdater.setAlignment}
                setObjectFit={fabricHelper.imagesUpdater.setObjectFit}
                distributeSpacing={fabricHelper.imagesUpdater.distributeSpacing}
                selectedCount={selectedCount}
              />
            </div>

            <div className="space-y-2.5 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
              <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Batch Opacity
              </Label>
              <Opacity
                opacity={configHelper.imageConfig.opacity}
                setImageOpacity={fabricHelper.layersUpdater.batchSetOpacity}
                onChangeEnd={handleCommitHistory}
              />
            </div>

            {!isGridLayout && (
              <>
                <div className="space-y-2.5 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
                  <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Batch Border
                  </Label>
                  <Border
                    border={configHelper.imageConfig.border}
                    setBorderWidth={
                      fabricHelper.layersUpdater.batchSetBorderWidth
                    }
                    setBorderColor={
                      fabricHelper.layersUpdater.batchSetBorderColor
                    }
                    resetBorder={fabricHelper.layersUpdater.batchResetBorder}
                    onChangeEnd={handleCommitHistory}
                  />
                </div>

                <div className="space-y-2.5 border-t border-neutral-200/80 pt-4 dark:border-neutral-800/80">
                  <Label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Batch Layer Order
                  </Label>
                  <Arrangement
                    setLayer={fabricHelper.layersUpdater.batchSetLayer}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {effectiveTab === 'filters' &&
          (selectedCount === 1 && hasImageSrc ? (
            <Filters
              filters={configHelper.imageConfig.filters}
              setFilters={fabricHelper.imageUpdater.setFilters}
              onChangeEnd={handleCommitHistory}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-300/80 bg-neutral-50/70 p-4 text-center text-xs text-neutral-500 dark:border-neutral-700/80 dark:bg-neutral-900/50 dark:text-neutral-400">
              <Sparkles className="mx-auto mb-2 h-5 w-5 text-sky-500" />
              <p className="font-medium text-neutral-700 dark:text-neutral-300">
                Select a single image
              </p>
              <p className="mt-1 text-[11px] leading-relaxed">
                Click any photo on the canvas or in the Layers tab to apply
                filter presets and fine-tune color adjustments.
              </p>
            </div>
          ))}

        {effectiveTab === 'text' && (
          <CaptionWatermark
            selectedCaption={selectedCaption}
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

        {effectiveTab === 'layers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Photo Stack
                </Label>
                <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {layers.length}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {layers.length > 0 && (
                  <Button
                    variant={
                      selectedCount === layers.length ? 'ghost-sky' : 'ghost'
                    }
                    size="xs"
                    icon={CheckCheck}
                    onClick={() => {
                      if (selectedCount === layers.length) {
                        fabricHelper.layersUpdater.selectBackground();
                      } else {
                        fabricHelper.layersUpdater.selectAll();
                      }
                    }}
                    title={
                      selectedCount === layers.length
                        ? 'Deselect All'
                        : 'Select All Layers'
                    }
                    className="!h-6 !min-h-6 !px-1.5 text-[10px]"
                  >
                    {selectedCount === layers.length ? 'None' : 'All'}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="xs"
                  bordered
                  icon={ImagePlus}
                  onClick={() => addInputRef.current?.click()}
                  className="!h-6 !min-h-6 !px-2 text-[10px]"
                >
                  Add
                </Button>
              </div>
            </div>

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
          </div>
        )}
      </div>
    </aside>
  );
}
