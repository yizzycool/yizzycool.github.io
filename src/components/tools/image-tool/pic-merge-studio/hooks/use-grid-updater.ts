import type { ConfigHelper } from '../types/config-helper';
import type { GridTemplate } from '../types/grid-layout';
import type { FabricInternalStates } from './use-fabric';
import type { FabricHelperGridUpdater } from '../types/fabric-helper';

import * as fabric from 'fabric';

import useCommon from './use-common';
import useGridLogic from './use-grid-logic';
import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';
import { DefaultCanvasConfig } from '..';

import _range from 'lodash/range';
import _flatMap from 'lodash/flatMap';

type Props = {
  refs: {
    containerRef: React.MutableRefObject<HTMLDivElement | null>;
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
    fabricCanvasRef: React.MutableRefObject<fabric.Canvas | null>;
    fabricCanvasBorderRectRef: React.MutableRefObject<fabric.Rect | null>;
    gridRef: React.MutableRefObject<GridTemplate | null>;
  };
  configHelper: ConfigHelper;
  fabricHelper: FabricInternalStates;
};

// Functions to control grid system
export default function useGridUpdater({
  refs,
  configHelper,
  fabricHelper,
}: Props): FabricHelperGridUpdater {
  const {
    // containerRef,
    // canvasRef,
    fabricCanvasRef,
    fabricCanvasBorderRectRef,
    gridRef,
  } = refs;

  const {
    // canvasConfig,
    setCanvasConfig,

    // globalImageConfig,
    // setGlobalImageConfig,

    // imageConfig,
    setImageConfig,
  } = configHelper;

  const {
    isFabricReady,
    // setIsFabricReady,

    // isExporting,
    // setIsExporting,

    // hasImageSelection,
    // setHasImageSelection,
  } = fabricHelper;

  const { getSelectedImage } = useCommon({ refs: { fabricCanvasRef } });

  const { createGridTemplate, updateAfterResize, updateEdges } = useGridLogic({
    refs,
    configHelper,
    fabricHelper,
  });

  const switchToGridLayout = async (rows: number, cols: number) => {
    if (!fabricCanvasRef.current) return;
    // Generate cells and edges
    gridRef.current = await createGridTemplate(rows, cols);
    // Update CanvasConfig
    setCanvasConfig((prev) => ({
      ...prev,
      layout: 'grid',
      gridConfig: { ...prev.gridConfig, rows, cols },
    }));
  };

  const handleImagesUpload = async (files: FileList) => {
    if (
      !files ||
      !fabricCanvasRef.current ||
      !isFabricReady ||
      !gridRef.current
    )
      return;

    // To find empty image
    const emptyImagePosition = _flatMap(gridRef.current.cells, (row, i) => {
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

      const objectUrl = window.URL.createObjectURL(files[idx]);
      await img.setSrc(objectUrl);

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
  };

  const setSize = (width: number, height: number) => {
    if (!fabricCanvasRef.current || !isFabricReady) return;

    // Update states
    setCanvasConfig((prev) => ({ ...prev, size: { width, height } }));

    // Update Fabric Canvas
    fabricCanvasRef.current.setDimensions({
      width,
      height,
    });
    fabricCanvasRef.current.requestRenderAll();

    // Update cells & edges
    updateAfterResize();
  };

  const replaceImage = async (file: File) => {
    if (!fabricCanvasRef.current) return;

    // Get selected images
    const image = getSelectedImage();
    const clipPath = image?.clipPath;
    if (!image || !clipPath) return;

    const objectUrl = window.URL.createObjectURL(file);
    await image.setSrc(objectUrl);
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

    // Update `hasImageSrc` state
    customEventUtils.emit(CustomEvents.tools.fabricRecalcSelection);
  };

  const deleteImage = async () => {
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

    // Update `hasImageSrc` state
    customEventUtils.emit(CustomEvents.tools.fabricRecalcSelection);
  };

  const setShowOuterBorder = (showOuter: boolean) => {
    if (!fabricCanvasRef.current || !fabricCanvasBorderRectRef.current) return;

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
  };

  const setBorderWidth = (strokeWidth: number) => {
    if (!fabricCanvasRef.current || !fabricCanvasBorderRectRef.current) return;

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
  };

  const setBorderColor = (color: string, opacity: number) => {
    if (!fabricCanvasRef.current || !fabricCanvasBorderRectRef.current) return;

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
  };

  const resetBorder = () => {
    if (!fabricCanvasRef.current || !fabricCanvasBorderRectRef.current) return;

    // Update states
    setCanvasConfig((prev) => ({
      ...prev,
      gridConfig: {
        ...prev.gridConfig,
        border: DefaultCanvasConfig.gridConfig.border,
      },
    }));

    updateEdges(DefaultCanvasConfig.gridConfig.border);
  };

  const setAlignment = (horizontal: string, vertical: string) => {
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
  };

  const setObjectFit = (type: string) => {
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
  };

  return {
    handleImagesUpload,
    switchToGridLayout,
    setSize,

    setShowOuterBorder,
    setBorderWidth,
    setBorderColor,
    resetBorder,

    replaceImage,
    deleteImage,

    setAlignment,
    setObjectFit,
  };
}
