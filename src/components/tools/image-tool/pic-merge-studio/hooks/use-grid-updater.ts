import type { ConfigHelper } from '../types/config-helper';
import type { GridCell, GridTemplate } from '../types/grid-layout';
import type { FabricInternalStates } from './use-fabric';
import type { FabricHelperGridUpdater } from '../types/fabric-helper';
import type { BentoTemplateId, CanvasConfig } from '../types/config';

import { useCallback } from 'react';
import * as fabric from 'fabric';
import { flatMap } from 'lodash';

import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';

import useCommon from './use-common';
import useGridLogic from './use-grid-logic';
import { DEFAULT_CANVAS_CONFIG } from '..';
import {
  attachImageAssetMeta,
  deserializeFilters,
  type ExtendedFabricImage,
  serializeFilters,
} from '../utils/studio-snapshot';

type Props = {
  refs: {
    containerRef: React.MutableRefObject<HTMLDivElement | null>;
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
    fabricCanvasRef: React.MutableRefObject<fabric.Canvas | null>;
    gridRef: React.MutableRefObject<GridTemplate | null>;
    canvasConfigRef?: React.MutableRefObject<CanvasConfig>;
  };
  configHelper: ConfigHelper;
  fabricHelper: FabricInternalStates;
  registerAssetFile?: (file: File) => { assetId: string; url: string };
  onCommitHistory?: (mode?: 'immediate' | 'debounced') => void;
};

// Functions to control grid system
export default function useGridUpdater({
  refs,
  configHelper,
  fabricHelper,
  registerAssetFile,
  onCommitHistory,
}: Props): FabricHelperGridUpdater & {
  restoreGridFromSnapshot: ReturnType<
    typeof useGridLogic
  >['restoreGridFromSnapshot'];
} {
  const { fabricCanvasRef, gridRef, canvasConfigRef } = refs;

  const { setCanvasConfig, setImageConfig } = configHelper;

  const { isFabricReady } = fabricHelper;

  const { getSelectedImage } = useCommon({ refs: { fabricCanvasRef } });

  const {
    createGridTemplate,
    createBentoGridTemplate,
    updateAfterResize,
    updateEdges,
    restoreGridFromSnapshot,
  } = useGridLogic({
    refs,
    configHelper,
    fabricHelper,
  });

  const switchToGridLayout = useCallback(
    async (rows: number, cols: number) => {
      if (!fabricCanvasRef.current) return;
      // Generate cells and edges
      gridRef.current = await createGridTemplate(rows, cols);
      // Update CanvasConfig
      if (canvasConfigRef) {
        canvasConfigRef.current = {
          ...canvasConfigRef.current,
          layout: 'grid',
          gridConfig: {
            ...canvasConfigRef.current.gridConfig,
            rows,
            cols,
            templateId: 'uniform',
          },
        };
      }
      setCanvasConfig((prev) => ({
        ...prev,
        layout: 'grid',
        gridConfig: { ...prev.gridConfig, rows, cols, templateId: 'uniform' },
      }));
      onCommitHistory?.('immediate');
    },
    [
      fabricCanvasRef,
      gridRef,
      createGridTemplate,
      canvasConfigRef,
      setCanvasConfig,
      onCommitHistory,
    ]
  );

  const switchToBentoTemplate = useCallback(
    async (templateId: BentoTemplateId) => {
      if (templateId === 'uniform') {
        await switchToGridLayout(
          canvasConfigRef?.current.gridConfig.rows ?? 2,
          canvasConfigRef?.current.gridConfig.cols ?? 2
        );
        return;
      }
      if (!fabricCanvasRef.current) return;
      const nextGrid = await createBentoGridTemplate(templateId);
      if (!nextGrid) return;
      gridRef.current = nextGrid;
      const cols = nextGrid.cells[0]?.length ?? 2;

      if (canvasConfigRef) {
        canvasConfigRef.current = {
          ...canvasConfigRef.current,
          layout: 'grid',
          gridConfig: {
            ...canvasConfigRef.current.gridConfig,
            rows: 1,
            cols,
            templateId,
          },
        };
      }
      setCanvasConfig((prev) => ({
        ...prev,
        layout: 'grid',
        gridConfig: { ...prev.gridConfig, rows: 1, cols, templateId },
      }));
      onCommitHistory?.('immediate');
    },
    [
      canvasConfigRef,
      createBentoGridTemplate,
      fabricCanvasRef,
      gridRef,
      onCommitHistory,
      setCanvasConfig,
      switchToGridLayout,
    ]
  );

  const handleImagesUpload = useCallback(
    async (files: FileList | File[]): Promise<number> => {
      if (
        !files ||
        files.length === 0 ||
        !fabricCanvasRef.current ||
        !isFabricReady ||
        !gridRef.current
      ) {
        return 0;
      }

      // To find empty image
      const emptyImagePosition = flatMap(gridRef.current.cells, (row, i) => {
        return row
          .map((cell, j) => {
            return [i, j, !cell.element.getSrc?.()];
          })
          .filter((cell) => cell[2])
          .map((cell) => cell.slice(0, 2));
      }) as number[][];
      const validSize = emptyImagePosition.length;

      // Add images to canvas if still some cells available
      let nowIdx = 0;
      for (let idx = 0; idx < files.length; idx++) {
        if (nowIdx >= validSize) break;

        const [i, j] = emptyImagePosition[nowIdx];
        const img = gridRef.current.cells[i][j].element;
        const clipPath = img.clipPath;

        const file = files[idx];
        const registered = registerAssetFile?.(file);
        const objectUrl = registered?.url ?? window.URL.createObjectURL(file);
        await img.setSrc(objectUrl, { crossOrigin: 'anonymous' });
        attachImageAssetMeta(img, {
          assetId: registered?.assetId,
          fileName: file.name,
          layerName: file.name,
        });

        const scale = Math.max(
          clipPath!.width / img.width,
          clipPath!.height / img.height
        );
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: clipPath!.left,
          top: clipPath!.top,
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          hasControls: true,
        });
        fabricCanvasRef.current.requestRenderAll();

        nowIdx += 1;
      }

      if (nowIdx > 0) {
        onCommitHistory?.('immediate');
      }

      return nowIdx;
    },
    [
      fabricCanvasRef,
      isFabricReady,
      gridRef,
      registerAssetFile,
      onCommitHistory,
    ]
  );

  const setSize = useCallback(
    (width: number, height: number) => {
      if (!fabricCanvasRef.current || !isFabricReady) return;

      // Update states
      if (canvasConfigRef) {
        canvasConfigRef.current = {
          ...canvasConfigRef.current,
          size: { width, height },
        };
      }
      setCanvasConfig((prev) => ({ ...prev, size: { width, height } }));

      // Update Fabric Canvas
      fabricCanvasRef.current.setDimensions({
        width,
        height,
      });
      fabricCanvasRef.current.requestRenderAll();

      // Update cells & edges
      updateAfterResize();
      onCommitHistory?.('immediate');
    },
    [
      fabricCanvasRef,
      isFabricReady,
      canvasConfigRef,
      setCanvasConfig,
      updateAfterResize,
      onCommitHistory,
    ]
  );

  const replaceImage = useCallback(
    async (file: File) => {
      if (!fabricCanvasRef.current) return;

      // Get selected images
      const image = getSelectedImage();
      const clipPath = image?.clipPath;
      if (!image || !clipPath) return;

      const registered = registerAssetFile?.(file);
      const objectUrl = registered?.url ?? window.URL.createObjectURL(file);
      await image.setSrc(objectUrl, { crossOrigin: 'anonymous' });
      attachImageAssetMeta(image, {
        assetId: registered?.assetId,
        fileName: file.name,
        layerName: file.name,
      });
      const scale = Math.max(
        clipPath.width / image.width,
        clipPath.height / image.height
      );
      image.set({
        scaleX: scale,
        scaleY: scale,
        top: clipPath.top,
        left: clipPath.left,
        lockMovementX: false,
        lockMovementY: false,
        lockRotation: false,
        lockScalingX: false,
        lockScalingY: false,
        hasControls: true,
      });
      image.setCoords();

      fabricCanvasRef.current.requestRenderAll();
      fabricCanvasRef.current.fire('object:modified', { target: image });

      // Update `hasImageSrc` state
      customEventUtils.emit(CustomEvents.tools.fabricRecalcSelection);
    },
    [fabricCanvasRef, getSelectedImage, registerAssetFile]
  );

  const deleteImage = useCallback(async () => {
    if (!fabricCanvasRef.current) return;

    // Get selected images
    const image = getSelectedImage();
    const clipPath = image?.clipPath;
    if (!image || !clipPath) return;

    await image.setSrc('');
    image.set({
      scaleX: 1,
      scaleY: 1,
      width: clipPath.width,
      height: clipPath.height,
      top: clipPath.top,
      left: clipPath.left,
      lockMovementX: true,
      lockMovementY: true,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
    });
    image.setCoords();

    fabricCanvasRef.current.requestRenderAll();
    fabricCanvasRef.current.fire('object:modified', { target: image });

    // Update `hasImageSrc` state
    customEventUtils.emit(CustomEvents.tools.fabricRecalcSelection);
  }, [fabricCanvasRef, getSelectedImage]);

  const setShowOuterBorder = useCallback(
    (showOuter: boolean) => {
      if (!fabricCanvasRef.current) return;

      if (canvasConfigRef) {
        canvasConfigRef.current = {
          ...canvasConfigRef.current,
          gridConfig: {
            ...canvasConfigRef.current.gridConfig,
            border: {
              ...canvasConfigRef.current.gridConfig.border,
              showOuter,
            },
          },
        };
      }

      // Update states
      setCanvasConfig((prev) => ({
        ...prev,
        gridConfig: {
          ...prev.gridConfig,
          border: {
            ...prev.gridConfig.border,
            showOuter,
          },
        },
      }));

      updateEdges({ showOuter });
      onCommitHistory?.('immediate');
    },
    [
      fabricCanvasRef,
      canvasConfigRef,
      setCanvasConfig,
      updateEdges,
      onCommitHistory,
    ]
  );

  const setBorderWidth = useCallback(
    (strokeWidth: number) => {
      if (!fabricCanvasRef.current) return;

      if (canvasConfigRef) {
        canvasConfigRef.current = {
          ...canvasConfigRef.current,
          gridConfig: {
            ...canvasConfigRef.current.gridConfig,
            border: {
              ...canvasConfigRef.current.gridConfig.border,
              width: strokeWidth,
            },
          },
        };
      }

      // Update states
      setCanvasConfig((prev) => ({
        ...prev,
        gridConfig: {
          ...prev.gridConfig,
          border: {
            ...prev.gridConfig.border,
            width: strokeWidth,
          },
        },
      }));

      updateEdges({ width: strokeWidth });
    },
    [fabricCanvasRef, canvasConfigRef, setCanvasConfig, updateEdges]
  );

  const setBorderColor = useCallback(
    (color: string, opacity: number) => {
      if (!fabricCanvasRef.current) return;

      if (canvasConfigRef) {
        canvasConfigRef.current = {
          ...canvasConfigRef.current,
          gridConfig: {
            ...canvasConfigRef.current.gridConfig,
            border: {
              ...canvasConfigRef.current.gridConfig.border,
              color,
              opacity,
            },
          },
        };
      }

      // Update states
      setCanvasConfig((prev) => ({
        ...prev,
        gridConfig: {
          ...prev.gridConfig,
          border: {
            ...prev.gridConfig.border,
            color,
            opacity,
          },
        },
      }));

      updateEdges({ color, opacity });
    },
    [fabricCanvasRef, canvasConfigRef, setCanvasConfig, updateEdges]
  );

  const resetBorder = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    if (canvasConfigRef) {
      canvasConfigRef.current = {
        ...canvasConfigRef.current,
        gridConfig: {
          ...canvasConfigRef.current.gridConfig,
          border: DEFAULT_CANVAS_CONFIG.gridConfig.border,
        },
      };
    }

    // Update states
    setCanvasConfig((prev) => ({
      ...prev,
      gridConfig: {
        ...prev.gridConfig,
        border: DEFAULT_CANVAS_CONFIG.gridConfig.border,
      },
    }));

    updateEdges(DEFAULT_CANVAS_CONFIG.gridConfig.border);
    onCommitHistory?.('immediate');
  }, [
    fabricCanvasRef,
    canvasConfigRef,
    setCanvasConfig,
    updateEdges,
    onCommitHistory,
  ]);

  const setAlignment = useCallback(
    (horizontal: string, vertical: string) => {
      if (!fabricCanvasRef.current || !gridRef.current) return;

      const img = getSelectedImage();
      const clipPath = img?.clipPath;
      if (!img?.getSrc() || !clipPath) return;

      const scaledWidth = img.width * img.scaleX;
      const scaledHeight = img.height * img.scaleY;

      // Deal with horizontal
      if (horizontal === 'left') {
        img.set({
          angle: 0,
          left: clipPath.left - clipPath.width / 2 + scaledWidth / 2,
        });
      } else if (horizontal === 'center') {
        img.set({
          angle: 0,
          left: clipPath.left,
        });
      } else if (horizontal === 'right') {
        img.set({
          angle: 0,
          left: clipPath.left + clipPath.width / 2 - scaledWidth / 2,
        });
      }

      // Deal with vertical
      if (vertical === 'top') {
        img.set({
          angle: 0,
          top: clipPath.top - clipPath.height / 2 + scaledHeight / 2,
        });
      } else if (vertical === 'center') {
        img.set({
          angle: 0,
          top: clipPath.top,
        });
      } else if (vertical === 'bottom') {
        img.set({
          angle: 0,
          top: clipPath.top + clipPath.height / 2 - scaledHeight / 2,
        });
      }

      img.setCoords();
      fabricCanvasRef.current.requestRenderAll();
      onCommitHistory?.('immediate');
    },
    [fabricCanvasRef, gridRef, getSelectedImage, onCommitHistory]
  );

  const setObjectFit = useCallback(
    (type: string) => {
      if (!fabricCanvasRef.current || !gridRef.current) return;

      const img = getSelectedImage();
      const clipPath = img?.clipPath;
      if (!img?.getSrc() || !clipPath) return;

      let scale = 1;
      if (type === 'contain') {
        scale = Math.min(
          clipPath.width / img.width,
          clipPath.height / img.height
        );
      } else if (type === 'cover') {
        scale = Math.max(
          clipPath.width / img.width,
          clipPath.height / img.height
        );
      }

      img.set({
        angle: 0,
        scaleX: scale,
        scaleY: scale,
        left: clipPath.left,
        top: clipPath.top,
      });

      img.setCoords();
      fabricCanvasRef.current.requestRenderAll();

      // Update image states
      setImageConfig((prev) => ({
        ...prev,
        scaleX: scale,
        scaleY: scale,
      }));
      onCommitHistory?.('immediate');
    },
    [
      fabricCanvasRef,
      gridRef,
      getSelectedImage,
      setImageConfig,
      onCommitHistory,
    ]
  );

  const swapCells = useCallback(
    async (cellA: GridCell, cellB: GridCell) => {
      if (!fabricCanvasRef.current || cellA.id === cellB.id) return;
      const imgA = cellA.element as ExtendedFabricImage;
      const imgB = cellB.element as ExtendedFabricImage;
      const clipA = imgA.clipPath;
      const clipB = imgB.clipPath;
      if (!clipA || !clipB) return;

      const metaA = {
        src: imgA.getSrc?.() || '',
        assetId: imgA._assetId,
        fileName: imgA._fileName,
        layerName: imgA._layerName,
        filters: serializeFilters(imgA.filters),
      };
      const metaB = {
        src: imgB.getSrc?.() || '',
        assetId: imgB._assetId,
        fileName: imgB._fileName,
        layerName: imgB._layerName,
        filters: serializeFilters(imgB.filters),
      };

      const applyCellPayload = async (
        img: ExtendedFabricImage,
        clip: NonNullable<fabric.FabricObject['clipPath']>,
        payload: typeof metaA
      ) => {
        if (!payload.src) {
          await img.setSrc('');
          img.set({
            scaleX: 1,
            scaleY: 1,
            width: clip.width,
            height: clip.height,
            left: clip.left,
            top: clip.top,
            angle: 0,
            filters: [],
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false,
          });
          img._assetId = undefined;
          img._fileName = undefined;
          img._layerName = undefined;
        } else {
          await img.setSrc(payload.src, { crossOrigin: 'anonymous' });
          attachImageAssetMeta(img, {
            assetId: payload.assetId,
            fileName: payload.fileName,
            layerName: payload.layerName,
          });
          const restoredFilters = deserializeFilters(payload.filters);
          img.set({ filters: restoredFilters });
          img.applyFilters();
          const scale = Math.max(
            clip.width / (img.width || 1),
            clip.height / (img.height || 1)
          );
          img.set({
            scaleX: scale,
            scaleY: scale,
            left: clip.left,
            top: clip.top,
            angle: 0,
            lockMovementX: false,
            lockMovementY: false,
            lockRotation: false,
            lockScalingX: false,
            lockScalingY: false,
            hasControls: true,
          });
        }
        img.setCoords();
      };

      await applyCellPayload(imgA, clipA, metaB);
      await applyCellPayload(imgB, clipB, metaA);
      fabricCanvasRef.current.requestRenderAll();
      customEventUtils.emit(CustomEvents.tools.fabricRecalcSelection);
      onCommitHistory?.('immediate');
    },
    [fabricCanvasRef, onCommitHistory]
  );

  return {
    handleImagesUpload,
    switchToGridLayout,
    switchToBentoTemplate,
    swapCells,
    setSize,

    setShowOuterBorder,
    setBorderWidth,
    setBorderColor,
    resetBorder,

    replaceImage,
    deleteImage,

    setAlignment,
    setObjectFit,
    restoreGridFromSnapshot,
  };
}
