import type { FabricHelperImagesUpdater } from '../types/fabric-helper';
import type { ConfigHelper } from '../types/config-helper';
import type { FabricInternalStates } from './use-fabric';
import type { GridTemplate } from '../types/grid-layout';

import * as fabric from 'fabric'; // v6

import useCommon from './use-common';
import colorUtils from '@/utils/color-utils';

import _forEach from 'lodash/forEach';

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

// Functions to update selected-image(s)-related config and update Fabric canvas
export default function useImagesUpdater({
  refs,
  configHelper,
  // fabricHelper,
}: Props): FabricHelperImagesUpdater {
  const {
    // containerRef,
    // canvasRef,
    fabricCanvasRef,
    // fabricCanvasBorderRectRef,
    gridRef,
  } = refs;

  const {
    canvasConfig,
    // setCanvasConfig,

    // globalImageConfig,
    setGlobalImageConfig,

    // imageConfig,
    // setImageConfig,
  } = configHelper;

  // const {
  //   isFabricReady,
  //   setIsFabricReady,

  //   isExporting,
  //   setIsExporting,

  //   hasImageSelection,
  //   setHasImageSelection,
  // } = fabricHelper;

  const { getAllImages, getNormStrokeWidth } = useCommon({
    refs: { fabricCanvasRef },
  });

  const isGridLayout = canvasConfig.layout === 'grid';

  const setBorderWidth = (strokeWidth: number) => {
    if (!fabricCanvasRef.current) return;

    // Discard selected image
    _imagesUpdater.discardActiveObejct();

    // Update states
    setGlobalImageConfig((prev) => ({
      ...prev,
      border: { ...prev.border, width: strokeWidth },
    }));

    // Get selected images
    const images = getAllImages();
    if (!images.length) return;

    const normStrokeWidth = getNormStrokeWidth(strokeWidth) / 2;

    // Update Selected Fabric Images
    _forEach(images, (img: fabric.FabricImage) => {
      img.set({
        _strokeWidthRatio: strokeWidth,
        strokeWidth: normStrokeWidth,
      });
      img.setCoords(); // to recalc transform matrix and align controls
    });
    fabricCanvasRef.current.requestRenderAll();
  };

  const setBorderColor = (color: string, opacity: number) => {
    if (!fabricCanvasRef.current) return;

    // Discard selected image
    _imagesUpdater.discardActiveObejct();

    // Update states
    setGlobalImageConfig((prev) => ({
      ...prev,
      border: { ...prev.border, color, opacity },
    }));

    // Get selected images
    const images = getAllImages();
    if (!images.length) return;

    // Get new color
    const rgba = colorUtils.hexToRgba(color);
    const stroke = colorUtils.rgbaToHex({ ...rgba, a: opacity });

    // Update selected Fabric Images
    _forEach(images, (img: fabric.FabricImage) => {
      img.set({
        stroke,
      });
      img.setCoords(); // to recalc transform matrix and align controls
    });
    fabricCanvasRef.current.requestRenderAll();
  };

  const resetBorder = () => {
    if (!fabricCanvasRef.current) return;

    // Discard selected image
    _imagesUpdater.discardActiveObejct();

    // Update states
    setGlobalImageConfig((prev) => ({
      ...prev,
      border: { width: 0, color: '', opacity: 1 },
    }));

    // Get selected images
    const images = getAllImages();
    if (!images.length) return;

    // Update selected Fabric Images
    _forEach(images, (img: fabric.FabricImage) => {
      img.set({
        stroke: '',
        strokeWidth: 0,
      });
      img.setCoords(); // to recalc transform matrix and align controls
    });
    fabricCanvasRef.current.requestRenderAll();
  };

  const setAlignment = (horizontal: string, vertical: string) => {
    const setGridImagesAlignment = () => {
      if (!fabricCanvasRef.current || !gridRef.current) return;

      const imgs = getAllImages();
      imgs.forEach((img) => {
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
      });

      fabricCanvasRef.current.requestRenderAll();
    };

    const setCanvasImagesAlignment = () => {
      if (!fabricCanvasRef.current) return;

      const imgs = getAllImages();
      imgs.forEach((img) => {
        if (!fabricCanvasRef.current || !img) return;

        const scaledWidth = img.width * img.scaleX;
        const scaledHeight = img.height * img.scaleY;

        // Deal with horizontal
        if (horizontal === 'left') {
          img.set({
            angle: 0,
            left: scaledWidth / 2,
          });
        } else if (horizontal === 'center') {
          img.set({
            angle: 0,
            left: fabricCanvasRef.current.width / 2,
          });
        } else if (horizontal === 'right') {
          img.set({
            angle: 0,
            left: fabricCanvasRef.current.width - scaledWidth / 2,
          });
        }

        // Deal with vertical
        if (vertical === 'top') {
          img.set({
            angle: 0,
            top: scaledHeight / 2,
          });
        } else if (vertical === 'center') {
          img.set({
            angle: 0,
            top: fabricCanvasRef.current.height / 2,
          });
        } else if (vertical === 'bottom') {
          img.set({
            angle: 0,
            top: fabricCanvasRef.current.height - scaledHeight / 2,
          });
        }

        img.setCoords();
      });

      fabricCanvasRef.current.requestRenderAll();
    };

    // Discard selected image
    _imagesUpdater.discardActiveObejct();

    if (isGridLayout) {
      setGridImagesAlignment();
    } else {
      setCanvasImagesAlignment();
    }
  };

  const setObjectFit = (type: string) => {
    const setGridObjectFit = () => {
      if (!fabricCanvasRef.current || !gridRef.current) return;

      const imgs = getAllImages();
      imgs.forEach((img) => {
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
      });

      fabricCanvasRef.current.requestRenderAll();
    };

    const setCanvasObjectFit = () => {
      if (!fabricCanvasRef.current) return;

      const imgs = getAllImages();
      imgs.forEach((img) => {
        if (!fabricCanvasRef.current || !img) return;

        let scale = 1;
        if (type === 'contain') {
          scale = Math.min(
            fabricCanvasRef.current.width / img.width,
            fabricCanvasRef.current.height / img.height
          );
        } else if (type === 'cover') {
          scale = Math.max(
            fabricCanvasRef.current.width / img.width,
            fabricCanvasRef.current.height / img.height
          );
        }

        img.set({
          angle: 0,
          scaleX: scale,
          scaleY: scale,
          left: fabricCanvasRef.current.width / 2,
          top: fabricCanvasRef.current.height / 2,
        });

        img.setCoords();
      });

      fabricCanvasRef.current.requestRenderAll();
    };

    // Discard selected image
    _imagesUpdater.discardActiveObejct();

    if (isGridLayout) {
      setGridObjectFit();
    } else {
      setCanvasObjectFit();
    }
  };

  const _imagesUpdater = {
    discardActiveObejct: () => {
      if (!fabricCanvasRef.current) return;
      fabricCanvasRef.current.discardActiveObject();
      fabricCanvasRef.current.requestRenderAll();
    },
  };

  return {
    setBorderWidth,
    setBorderColor,
    resetBorder,

    setAlignment,
    setObjectFit,
  };
}
