import type { FabricHelperImageUpdater } from '../types/fabric-helper';
import type { ConfigHelper } from '../types/config-helper';
import type { FabricInternalStates } from './use-fabric';
import type { FabricFilterParams } from '../types/fabric-filter';

import * as fabric from 'fabric'; // v6
import useCommon from './use-common';
import colorUtils from '@/utils/color-utils';
import { FabricFilterMap } from '../data/fabric-filters';

import _find from 'lodash/find';
import _fromPairs from 'lodash/fromPairs';
import _keys from 'lodash/keys';
import _get from 'lodash/get';

type Props = {
  refs: {
    containerRef: React.MutableRefObject<HTMLDivElement | null>;
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
    fabricCanvasRef: React.MutableRefObject<fabric.Canvas | null>;
    fabricCanvasBorderRectRef: React.MutableRefObject<fabric.Rect | null>;
  };
  configHelper: ConfigHelper;
  fabricHelper: FabricInternalStates;
};

// Functions to update selected-image-related config and update Fabric canvas
export default function useImageUpdater({
  refs,
  configHelper,
  // fabricHelper,
}: Props): FabricHelperImageUpdater {
  const {
    // containerRef,
    // canvasRef,
    fabricCanvasRef,
    // fabricCanvasBorderRectRef,
  } = refs;

  const {
    // canvasConfig,
    // setCanvasConfig,

    // globalImageConfig,
    // setGlobalImageConfig,

    // imageConfig,
    setImageConfig,
  } = configHelper;

  // const {
  //   isFabricReady,
  //   setIsFabricReady,

  //   isExporting,
  //   setIsExporting,

  //   hasImageSelection,
  //   setHasImageSelection,
  // } = fabricHelper;

  const { getSelectedImage, getNormStrokeWidth } = useCommon({
    refs: { fabricCanvasRef },
  });

  const replaceImage = async (file: File) => {
    if (!fabricCanvasRef.current) return;

    // Get selected images
    const image = getSelectedImage();
    if (!image) return;

    const objectUrl = window.URL.createObjectURL(file);
    await image.setSrc(objectUrl);
    const scale = Math.min(300 / image.width, 300 / image.height);
    image.set({
      scaleX: scale,
      scaleY: scale,
    });
    image.setCoords();

    fabricCanvasRef.current.requestRenderAll();
  };

  const deleteImage = () => {
    if (!fabricCanvasRef.current) return;

    // Get selected images
    const image = getSelectedImage();
    if (!image) return;

    fabricCanvasRef.current.remove(image);
    fabricCanvasRef.current.discardActiveObject();
    fabricCanvasRef.current.requestRenderAll();
  };

  const setBorderWidth = (strokeWidth: number) => {
    if (!fabricCanvasRef.current) return;

    // Update states
    setImageConfig((prev) => ({
      ...prev,
      border: { ...prev.border, width: strokeWidth },
    }));

    // Get selected images
    const image = getSelectedImage();
    if (!image) return;

    const normStrokeWidth = getNormStrokeWidth(strokeWidth) / 2;

    // Update Selected Fabric Images
    image.set({
      _strokeWidthRatio: strokeWidth,
      strokeWidth: normStrokeWidth,
    });
    image.setCoords(); // to recalc transform matrix and align controls
    fabricCanvasRef.current.requestRenderAll();
  };

  const setBorderColor = (color: string, opacity: number) => {
    if (!fabricCanvasRef.current) return;

    // Update states
    setImageConfig((prev) => ({
      ...prev,
      border: { ...prev.border, color, opacity },
    }));

    // Get selected images
    const image = getSelectedImage();
    if (!image) return;

    // Get new color
    const rgba = colorUtils.hexToRgba(color);
    const stroke = colorUtils.rgbaToHex({ ...rgba, a: opacity });

    // Update selected Fabric Images
    image.set({
      stroke,
    });
    image.setCoords(); // to recalc transform matrix and align controls
    fabricCanvasRef.current.requestRenderAll();
  };

  const resetBorder = () => {
    if (!fabricCanvasRef.current) return;

    // Update states
    setImageConfig((prev) => ({
      ...prev,
      border: { width: 0, color: '', opacity: 1 },
    }));

    // Get selected images
    const image = getSelectedImage();
    if (!image) return;

    // Update selected Fabric Images
    image.set({
      stroke: '',
      strokeWidth: 0,
    });
    image.setCoords(); // to recalc transform matrix and align controls
    fabricCanvasRef.current.requestRenderAll();
  };

  // Function to update angle/rotateX/rotateY/flipX/flipY/lockMovementX/lockMovementY
  const setGeometry = (key: string, value: number | boolean) => {
    if (!fabricCanvasRef.current) return;

    // Update states
    setImageConfig((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Get selected images
    const image = getSelectedImage();
    if (!image) return;

    // Update selected Fabric Images
    image.set({
      [key]: value,
    });
    image.setCoords(); // to recalc transform matrix and align controls
    fabricCanvasRef.current.requestRenderAll();
  };

  const setFilters = (
    filters: string[],
    params?: Record<string, FabricFilterParams>
  ) => {
    if (!fabricCanvasRef.current) return;

    // Get selected images
    const image = getSelectedImage();
    if (!image) return;

    const extractParams = (filterType: string) => {
      const filter = _find(image.filters, (f) => f.type === filterType);
      const keys = _keys(FabricFilterMap[filterType].params);
      return _fromPairs(
        keys.map((key) => {
          const value =
            _get(params, key) ||
            _get(FabricFilterMap, [filterType, 'params', key, 'default']) ||
            _get(filter, key);
          return [key, value];
        })
      );
    };

    // Create Fabric Filters
    const fabricFilters = filters.map((filterType) => {
      const params = extractParams(filterType);
      return new FabricFilterMap[filterType].filter(params);
    });

    // Update states
    setImageConfig((prev) => ({
      ...prev,
      filters: fabricFilters,
    }));

    // Update selected Fabric Images
    image.set({
      filters: fabricFilters,
    });
    image.applyFilters();
    fabricCanvasRef.current.requestRenderAll();
  };

  const setLayer = (type: 'front' | 'back' | 'forward' | 'backward') => {
    if (!fabricCanvasRef.current) return;

    // Get selected images
    const image = getSelectedImage();
    if (!image) return;

    if (type === 'front') {
      fabricCanvasRef.current.bringObjectToFront(image);
    } else if (type === 'forward') {
      fabricCanvasRef.current.bringObjectForward(image);
    } else if (type === 'back') {
      fabricCanvasRef.current.sendObjectToBack(image);
    } else if (type === 'backward') {
      fabricCanvasRef.current.sendObjectBackwards(image);
    }
  };

  const setAlignment = (horizontal: string, vertical: string) => {
    if (!fabricCanvasRef.current) return;

    const img = getSelectedImage();
    if (!img) return;

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
    fabricCanvasRef.current.requestRenderAll();
  };

  const setObjectFit = (type: string) => {
    if (!fabricCanvasRef.current) return;

    const img = getSelectedImage();
    if (!img) return;

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
    fabricCanvasRef.current.requestRenderAll();

    // Update image states
    setImageConfig((prev) => ({
      ...prev,
      scaleX: scale,
      scaleY: scale,
    }));
  };

  return {
    replaceImage,
    deleteImage,

    setBorderWidth,
    setBorderColor,
    resetBorder,

    setGeometry,
    setFilters,

    setLayer,

    setAlignment,
    setObjectFit,
  };
}
