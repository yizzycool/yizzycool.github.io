import type {
  FabricHelperImageUpdater,
  FabricFilterValuesMap,
} from '../types/fabric-helper';
import type { ConfigHelper } from '../types/config-helper';

import { useCallback } from 'react';
import * as fabric from 'fabric'; // v6
import { find, fromPairs, get, keys } from 'lodash';

import useCommon from './use-common';
import colorUtils from '@/utils/color-utils';
import { FABRIC_FILTER_MAP } from '../data/fabric-filters';

type Props = {
  refs: {
    containerRef: React.MutableRefObject<HTMLDivElement | null>;
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
    fabricCanvasRef: React.MutableRefObject<fabric.Canvas | null>;
  };
  configHelper: ConfigHelper;
};

// Functions to update selected-image-related config and update Fabric canvas
export default function useImageUpdater({
  refs,
  configHelper,
}: Props): FabricHelperImageUpdater {
  const { fabricCanvasRef } = refs;

  const { setImageConfig } = configHelper;

  const { getSelectedImage, getNormStrokeWidth } = useCommon({
    refs: { fabricCanvasRef },
  });

  const replaceImage = useCallback(
    async (file: File) => {
      if (!fabricCanvasRef.current) return;

      // Get selected images
      const image = getSelectedImage();
      if (!image) return;

      const objectUrl = window.URL.createObjectURL(file);
      await image.setSrc(objectUrl, { crossOrigin: 'anonymous' });
      (
        image as unknown as { _fileName: string; _layerName: string }
      )._fileName = file.name;
      (
        image as unknown as { _fileName: string; _layerName: string }
      )._layerName = file.name;
      const scale = Math.min(300 / image.width, 300 / image.height);
      image.set({
        scaleX: scale,
        scaleY: scale,
      });
      image.setCoords();

      fabricCanvasRef.current.requestRenderAll();
      fabricCanvasRef.current.fire('object:modified', { target: image });
    },
    [fabricCanvasRef, getSelectedImage]
  );

  const deleteImage = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    // Get selected images
    const image = getSelectedImage();
    if (!image) return;

    fabricCanvasRef.current.remove(image);
    fabricCanvasRef.current.discardActiveObject();
    fabricCanvasRef.current.requestRenderAll();
  }, [fabricCanvasRef, getSelectedImage]);

  const setOpacity = useCallback(
    (opacity: number) => {
      if (!fabricCanvasRef.current) return;

      // Update states
      setImageConfig((prev) => ({
        ...prev,
        opacity,
      }));

      // Get selected images
      const image = getSelectedImage();
      if (!image) return;

      image.set({
        opacity,
      });
      fabricCanvasRef.current.requestRenderAll();
    },
    [fabricCanvasRef, setImageConfig, getSelectedImage]
  );

  const setBorderWidth = useCallback(
    (strokeWidth: number) => {
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
    },
    [fabricCanvasRef, setImageConfig, getSelectedImage, getNormStrokeWidth]
  );

  const setBorderColor = useCallback(
    (color: string, opacity: number) => {
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
    },
    [fabricCanvasRef, setImageConfig, getSelectedImage]
  );

  const resetBorder = useCallback(() => {
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
  }, [fabricCanvasRef, setImageConfig, getSelectedImage]);

  // Function to update angle/rotateX/rotateY/flipX/flipY/lockMovementX/lockMovementY
  const setGeometry = useCallback(
    (key: string, value: number | boolean) => {
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
      if (key === 'snapAngle') {
        const snapVal = Number(value);
        image.set({
          snapAngle: snapVal,
          snapThreshold: snapVal > 0 ? 5 : 0,
        });
      } else {
        image.set({
          [key]: value,
        });
      }
      image.setCoords(); // to recalc transform matrix and align controls
      fabricCanvasRef.current.requestRenderAll();
    },
    [fabricCanvasRef, setImageConfig, getSelectedImage]
  );

  const setSize = useCallback(
    (width: number, height: number) => {
      if (!fabricCanvasRef.current) return;
      const image = getSelectedImage();
      if (!image || !image.width || !image.height) return;

      const scaleX = width / image.width;
      const scaleY = height / image.height;

      image.set({ scaleX, scaleY });
      image.setCoords();
      fabricCanvasRef.current.requestRenderAll();

      setImageConfig((prev) => ({
        ...prev,
        scaleX,
        scaleY,
        width: Math.round(width),
        height: Math.round(height),
      }));
    },
    [fabricCanvasRef, setImageConfig, getSelectedImage]
  );

  const resetOriginalSize = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    const image = getSelectedImage();
    if (!image || !image.width || !image.height) return;

    image.set({ scaleX: 1, scaleY: 1 });
    image.setCoords();
    fabricCanvasRef.current.requestRenderAll();

    setImageConfig((prev) => ({
      ...prev,
      scaleX: 1,
      scaleY: 1,
      width: image.width,
      height: image.height,
    }));
  }, [fabricCanvasRef, setImageConfig, getSelectedImage]);

  const resetAspectRatio = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    const image = getSelectedImage();
    if (!image || !image.width || !image.height) return;

    const uniformScale = image.scaleX;
    image.set({ scaleX: uniformScale, scaleY: uniformScale });
    image.setCoords();
    fabricCanvasRef.current.requestRenderAll();

    setImageConfig((prev) => ({
      ...prev,
      scaleX: uniformScale,
      scaleY: uniformScale,
      width: Math.round(image.width * uniformScale),
      height: Math.round(image.height * uniformScale),
    }));
  }, [fabricCanvasRef, setImageConfig, getSelectedImage]);

  const setFilters = useCallback(
    (filters: string[], params?: FabricFilterValuesMap) => {
      if (!fabricCanvasRef.current) return;

      // Get selected images
      const image = getSelectedImage();
      if (!image) return;

      const extractParams = (filterType: string) => {
        const filter = find(image.filters, (f) => f.type === filterType);
        const filterConfig = FABRIC_FILTER_MAP[filterType];
        if (!filterConfig?.params) return undefined;

        const filterKeys = keys(filterConfig.params);
        return fromPairs(
          filterKeys.map((key) => {
            const valFromParams =
              get(params, [filterType, key]) ?? get(params, key);
            const valFromFilter = get(filter, key);
            const valFromDefault = get(filterConfig, [
              'params',
              key,
              'default',
            ]);
            const value = valFromParams ?? valFromFilter ?? valFromDefault;
            return [key, value];
          })
        );
      };

      // Create Fabric Filters
      const fabricFilters = filters.map((filterType) => {
        const p = extractParams(filterType);
        return new FABRIC_FILTER_MAP[filterType].filter(p);
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
    },
    [fabricCanvasRef, setImageConfig, getSelectedImage]
  );

  const setLayer = useCallback(
    (type: 'front' | 'back' | 'forward' | 'backward') => {
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
    },
    [fabricCanvasRef, getSelectedImage]
  );

  const setAlignment = useCallback(
    (horizontal: string, vertical: string) => {
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
    },
    [fabricCanvasRef, getSelectedImage]
  );

  const setObjectFit = useCallback(
    (type: string) => {
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
    },
    [fabricCanvasRef, getSelectedImage, setImageConfig]
  );

  const nudge = useCallback(
    (dx: number, dy: number) => {
      if (!fabricCanvasRef.current) return;
      const img = getSelectedImage();
      if (!img) return;

      img.set({
        left: (img.left || 0) + dx,
        top: (img.top || 0) + dy,
      });
      img.setCoords();
      fabricCanvasRef.current.requestRenderAll();
    },
    [fabricCanvasRef, getSelectedImage]
  );

  return {
    replaceImage,
    deleteImage,
    setOpacity,

    setBorderWidth,
    setBorderColor,
    resetBorder,

    setGeometry,
    setSize,
    resetOriginalSize,
    resetAspectRatio,
    setFilters,

    setLayer,

    setAlignment,
    setObjectFit,
    nudge,
  };
}
