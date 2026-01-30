'use client';

import type { ConfigHelper } from '../../../types/config-helper';
import type { FabricHelper } from '../../../types/fabric-helper';

import clsx from 'clsx';

import Tabs from './tabs';
import UploadBlock from './upload-block';
import GroupTitle from './group-title';
import CanvasLayout from './canvas-layout';
import AspectRatio from './aspect-ratio';
import Background from './background';
import Border from './border';
import ImageLayout from './image-layout';
import OutputFormat from './output-format';
import Basic from './basic';
import EmptyState from './empty-state';
import Arrangement from './arrangement';
import Geometry from './geometry';
import Filters from './filters';

type Props = {
  fabricHelper: FabricHelper;
  configHelper: ConfigHelper;
};

export default function ConfigPanelMobile({
  fabricHelper,
  configHelper,
}: Props) {
  const isGridLayout = configHelper.canvasConfig.layout === 'grid';

  return (
    <div
      className={clsx(
        'sticky bottom-0 border-t border-neutral-700',
        'w-[100vw] min-w-[100vw] max-w-[100vw]',
        '-mx-4 -mb-20 mt-20 sm:-mx-6',
        'bg-white/50 backdrop-blur dark:bg-neutral-900/50'
      )}
    >
      <Tabs
        discardActiveObject={fabricHelper.canvasUpdater.discardActiveObject}
      >
        <>
          {/* Settings Block */}
          <div className="relative flex w-full items-end space-x-2 overflow-x-auto overflow-y-hidden p-4">
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
                <CanvasLayout
                  configHelper={configHelper}
                  switchToGridLayout={
                    fabricHelper.gridUpdater.switchToGridLayout
                  }
                  switchToFreeLayout={
                    fabricHelper.canvasUpdater.switchToFreeLayout
                  }
                />
                <AspectRatio
                  size={configHelper.canvasConfig.size}
                  setSize={
                    isGridLayout
                      ? fabricHelper.gridUpdater.setSize
                      : fabricHelper.canvasUpdater.setSize
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

            {/* All Images Config */}
            <div className="space-y-2">
              <GroupTitle text="All Images" className="px-4" />
              <div className="flex space-x-2">
                <ImageLayout
                  setAlignment={fabricHelper.imagesUpdater.setAlignment}
                  setObjectFit={fabricHelper.imagesUpdater.setObjectFit}
                />
                {!isGridLayout && (
                  <Border
                    border={configHelper.globalImageConfig.border}
                    setBorderWidth={fabricHelper.imagesUpdater.setBorderWidth}
                    setBorderColor={fabricHelper.imagesUpdater.setBorderColor}
                    resetBorder={fabricHelper.imagesUpdater.resetBorder}
                  />
                )}
              </div>
            </div>

            {/* Divide */}
            <div className="mb-4 h-[30px] self-end border-l border-neutral-700" />

            {/* Export  Config */}
            <OutputFormat
              configHelper={configHelper}
              exportCanvas={fabricHelper.canvasUpdater.export}
            />
          </div>

          <div className="relative flex w-full items-end space-x-2 overflow-x-auto overflow-y-hidden p-4">
            {fabricHelper.states.hasImageSelection ? (
              <div className="space-y-2">
                {/* Selected Image Config */}
                <GroupTitle text="Selected Image" className="px-4" />
                <div className="flex space-x-2">
                  <Basic
                    hasImageSrc={fabricHelper.states.hasImageSrc}
                    replaceImage={
                      isGridLayout
                        ? fabricHelper.gridUpdater.replaceImage
                        : fabricHelper.imageUpdater.replaceImage
                    }
                    deleteImage={
                      isGridLayout
                        ? fabricHelper.gridUpdater.deleteImage
                        : fabricHelper.imageUpdater.deleteImage
                    }
                  />
                  {fabricHelper.states.hasImageSrc && (
                    <>
                      {!isGridLayout && (
                        <Arrangement
                          setLayer={fabricHelper.imageUpdater.setLayer}
                        />
                      )}
                      <ImageLayout
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
                      />
                      {!isGridLayout && (
                        <Border
                          border={configHelper.imageConfig.border}
                          setBorderWidth={
                            fabricHelper.imageUpdater.setBorderWidth
                          }
                          setBorderColor={
                            fabricHelper.imageUpdater.setBorderColor
                          }
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
            ) : (
              <EmptyState />
            )}
          </div>
        </>
      </Tabs>
    </div>
  );
}
