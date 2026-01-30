'use client';

import type { FabricHelper } from '../../../types/fabric-helper';
import type { ConfigHelper } from '../../../types/config-helper';

import clsx from 'clsx';
import { Download } from 'lucide-react';

import Button from '@/components/common/button';
import Drawer from '@/components/common/drawer';
import UploadBlock from './upload-block';
import AspectRatio from './aspect-ratio';
import CanvasLayout from './canvas-layout';
import OutputFormat from './output-format';
import GroupTitle from './group-title';
import Background from './background';
import Border from './border';
import Tabs from './tabs';
import EmptyState from './empty-state';
import Geometry from './geometry';
import Filters from './filters';
import Arrangement from './arrangement';
import Basic from './basic';
import ImageLayout from './image-layout';

type Props = {
  fabricHelper: FabricHelper;
  configHelper: ConfigHelper;
};

export default function ConfigPanelDesktop({
  fabricHelper,
  configHelper,
}: Props) {
  const isGridLayout = configHelper.canvasConfig.layout === 'grid';

  return (
    <div
      className={clsx(
        'sticky top-[68px] h-[calc(100dvh_-_68px)]',
        '-mb-20 -mr-4 -mt-8 sm:-mr-6 lg:-mr-12 lg:-mt-12',
        'overflow-hidden'
      )}
    >
      <Drawer
        side="right"
        rounded="none"
        isOpen={true}
        onClose={() => {}}
        backdrop={false}
        usePortal={false}
        wrapperClassName="p-0 "
        className="max-w-full border-l border-neutral-400/20 !bg-transparent backdrop-blur-none dark:!bg-transparent"
      >
        <Tabs
          tabs={['Canvas', 'Image']}
          discardActiveObject={fabricHelper.canvasUpdater.discardActiveObject}
        >
          <>
            {/* Settings Block */}
            <div className="space-y-10 overflow-y-auto px-4 py-6 sm:px-6">
              <UploadBlock
                handleImagesUpload={
                  isGridLayout
                    ? fabricHelper.gridUpdater.handleImagesUpload
                    : fabricHelper.canvasUpdater.handleImagesUpload
                }
              />
              {/* Canvas Config */}
              <GroupTitle text="Canvas Setup" />
              <CanvasLayout
                configHelper={configHelper}
                switchToGridLayout={fabricHelper.gridUpdater.switchToGridLayout}
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

              {/* All Images Config */}
              <GroupTitle text="All Images" />
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

              {/* Export  Config */}
              <GroupTitle text="Export" />
              <OutputFormat configHelper={configHelper} />
              <Button
                icon={Download}
                className="w-full !font-black uppercase tracking-widest"
                rounded="full"
                iconStrokeWidth={3}
                onClick={fabricHelper.canvasUpdater.export}
              >
                Export
              </Button>
            </div>

            {/* Image  */}
            <div className="space-y-10 overflow-y-auto px-4 py-6 sm:px-6">
              {fabricHelper.states.hasImageSelection ? (
                <>
                  {/* Selected Image Config */}
                  <GroupTitle text="Selected Image" />
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
                </>
              ) : (
                <EmptyState />
              )}
            </div>
          </>
        </Tabs>
      </Drawer>
    </div>
  );
}
