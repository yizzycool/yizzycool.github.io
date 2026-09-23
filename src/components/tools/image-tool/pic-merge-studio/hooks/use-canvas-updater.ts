import type { FabricHelperCanvasUpdater } from '../types/fabric-helper';
import type { ConfigHelper } from '../types/config-helper';
import type { FabricInternalStates } from './use-fabric';

import { useCallback } from 'react';
import * as fabric from 'fabric'; // v6

import useCommon from './use-common';
import colorUtils from '@/utils/color-utils';
import { FABRIC_IMAGE_CONFIG } from './use-fabric';
import { DEFAULT_CANVAS_CONFIG } from '..';

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

// Functions to update canvas-related config and update Fabric canvas
export default function useCanvasUpdater({
  refs,
  configHelper,
  fabricHelper,
}: Props): FabricHelperCanvasUpdater {
  const { fabricCanvasRef, fabricCanvasBorderRectRef } = refs;

  const { canvasConfig, setCanvasConfig } = configHelper;

  const { isFabricReady, setIsExporting } = fabricHelper;

  const { getAllImages, getNormStrokeWidth } = useCommon({
    refs: { fabricCanvasRef },
  });

  // Internal helpers
  const updateBorderRect = useCallback(() => {
    if (!fabricCanvasRef.current || !fabricCanvasBorderRectRef.current) return;
    const { width: strokeWidth, color, opacity } = canvasConfig.border;
    const normStrokeWidth = getNormStrokeWidth(strokeWidth);
    const rgba = colorUtils.hexToRgba(color);
    const stroke = colorUtils.rgbaToHex({ ...rgba, a: opacity });

    fabricCanvasBorderRectRef.current.set({
      left: fabricCanvasRef.current.width / 2,
      top: fabricCanvasRef.current.height / 2,
      width: fabricCanvasRef.current.width,
      height: fabricCanvasRef.current.height,
      stroke,
      strokeWidth: normStrokeWidth,
    });

    fabricCanvasRef.current.requestRenderAll();
  }, [
    fabricCanvasRef,
    fabricCanvasBorderRectRef,
    canvasConfig.border,
    getNormStrokeWidth,
  ]);

  const updateAllImagesBorderWidth = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const imgs = getAllImages();

    imgs.forEach((img) => {
      if (!img) return;
      const strokeWidth = img.get('_strokeWidthRatio') || 0;
      const normStrokeWidth = getNormStrokeWidth(strokeWidth) / 2;

      img.set({
        strokeWidth: normStrokeWidth,
      });
      img.setCoords();
    });

    fabricCanvasRef.current.requestRenderAll();
  }, [fabricCanvasRef, getAllImages, getNormStrokeWidth]);

  const switchToFreeLayout = useCallback(async () => {
    if (!fabricCanvasRef.current) return;

    // Remove existed objects except all images and border-rect
    fabricCanvasRef.current.remove(
      ...fabricCanvasRef.current
        .getObjects()
        .filter((object: fabric.FabricObject & { _customKey?: string }) => {
          if (object === fabricCanvasBorderRectRef.current) return false;
          return !(object instanceof fabric.FabricImage) || !object?.getSrc?.();
        })
    );

    // Get all images
    const images = getAllImages();
    images.forEach((img, idx) => {
      const scale = Math.min(300 / img.width, 300 / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: scaledWidth / 2 + 100 + idx * 50,
        top: scaledHeight / 2 + 100 + idx * 50,
        ...FABRIC_IMAGE_CONFIG,
        clipPath: null,
      });
    });

    // Update border rect of Fabric Canvas
    updateBorderRect();

    fabricCanvasRef.current.requestRenderAll();

    // Update CanvasConfig
    setCanvasConfig((prev) => ({
      ...prev,
      layout: 'free',
    }));
  }, [
    fabricCanvasRef,
    fabricCanvasBorderRectRef,
    getAllImages,
    updateBorderRect,
    setCanvasConfig,
  ]);

  const handleImagesUpload = useCallback(
    async (files: FileList) => {
      if (!files || !fabricCanvasRef.current || !isFabricReady) return;

      const shortEdge = Math.min(
        fabricCanvasRef.current.width,
        fabricCanvasRef.current.height
      );
      const shiftOffset = 25 * (shortEdge / 1080);

      for (let idx = 0; idx < files.length; idx++) {
        const file = files[idx];
        const objectUrl = window.URL.createObjectURL(file);
        const img = await fabric.FabricImage.fromURL(objectUrl, {
          crossOrigin: 'anonymous',
        });
        (
          img as unknown as { _fileName: string; _layerName: string }
        )._fileName = file.name;
        (
          img as unknown as { _fileName: string; _layerName: string }
        )._layerName = file.name;

        const scale = Math.min(
          shortEdge / 2 / img.width,
          shortEdge / 2 / img.height
        );
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: scaledWidth / 2 + shiftOffset * 2 + shiftOffset * idx,
          top: scaledHeight / 2 + shiftOffset * 2 + shiftOffset * idx,
          ...FABRIC_IMAGE_CONFIG,
        });
        fabricCanvasRef.current.add(img);
        if (idx === files.length - 1) {
          fabricCanvasRef.current.setActiveObject(img);
        }
        fabricCanvasRef.current.requestRenderAll();
      }
    },
    [fabricCanvasRef, isFabricReady]
  );

  const exportCanvas = useCallback(
    (options?: {
      format?: 'png' | 'jpeg' | 'webp';
      quality?: number;
      filename?: string;
    }) => {
      if (!fabricCanvasRef.current || !isFabricReady) return;

      const download = (obj: Blob | string, filename: string) => {
        const url = typeof obj === 'string' ? obj : URL.createObjectURL(obj);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      setIsExporting(true);
      const format = options?.format || canvasConfig.exportFormat || 'png';
      const quality = options?.quality ?? 0.92;
      const filename = options?.filename?.trim() || `picmerge-${Date.now()}`;

      const dataUrl = fabricCanvasRef.current.toDataURL({
        format,
        quality,
        multiplier: 1,
        enableRetinaScaling: false, // to prevent wrong output canvas size
      });
      const extension = format === 'jpeg' ? 'jpg' : format;
      download(dataUrl, `${filename}.${extension}`);
      setIsExporting(false);
    },
    [fabricCanvasRef, isFabricReady, setIsExporting, canvasConfig.exportFormat]
  );

  const setSize = useCallback(
    (width: number, height: number) => {
      if (!fabricCanvasRef.current || !isFabricReady) return;

      // Update states
      setCanvasConfig((prev) => ({ ...prev, size: { width, height } }));

      // Update Fabric Canvas
      fabricCanvasRef.current.setDimensions({
        width,
        height,
      });
      fabricCanvasRef.current.requestRenderAll();
      // Update border of Fabric Canvas
      updateBorderRect();
      // Update stroke width of all images
      updateAllImagesBorderWidth();
    },
    [
      fabricCanvasRef,
      isFabricReady,
      setCanvasConfig,
      updateBorderRect,
      updateAllImagesBorderWidth,
    ]
  );

  const setBackgroundColor = useCallback(
    (color: string, opacity: number) => {
      if (!fabricCanvasRef.current || !isFabricReady) return;

      // Update states
      setCanvasConfig((prev) => ({
        ...prev,
        background: { type: 'color', color: { color, opacity } },
      }));

      // Update Fabric Canvas
      const rgba = colorUtils.hexToRgba(color);
      fabricCanvasRef.current.set({
        backgroundColor: colorUtils.rgbaToHex({ ...rgba, a: opacity }),
      });
      fabricCanvasRef.current.requestRenderAll();
    },
    [fabricCanvasRef, isFabricReady, setCanvasConfig]
  );

  const setBorderWidth = useCallback(
    (strokeWidth: number) => {
      updateBorderRect();
      if (!fabricCanvasRef.current || !fabricCanvasBorderRectRef.current)
        return;

      // Update states
      setCanvasConfig((prev) => ({
        ...prev,
        border: { ...prev.border, width: strokeWidth },
      }));

      // Get normalized stokeWidth
      const normStrokeWidth = getNormStrokeWidth(strokeWidth);

      // Update Fabric Canvas
      fabricCanvasBorderRectRef.current.set({
        width: fabricCanvasRef.current.width - normStrokeWidth / 2,
        height: fabricCanvasRef.current.height - normStrokeWidth / 2,
        strokeWidth: normStrokeWidth,
        _strokeWidthRatio: strokeWidth,
      });

      fabricCanvasRef.current.requestRenderAll();
    },
    [
      fabricCanvasRef,
      fabricCanvasBorderRectRef,
      updateBorderRect,
      setCanvasConfig,
      getNormStrokeWidth,
    ]
  );

  const setBorderColor = useCallback(
    (color: string, opacity: number) => {
      updateBorderRect();
      if (!fabricCanvasRef.current || !fabricCanvasBorderRectRef.current)
        return;

      // Update states
      setCanvasConfig((prev) => ({
        ...prev,
        border: { ...prev.border, color, opacity },
      }));

      // Update Fabric Canvas
      const rgba = colorUtils.hexToRgba(color);
      const stroke = colorUtils.rgbaToHex({ ...rgba, a: opacity });
      fabricCanvasBorderRectRef.current.set({ stroke });
      fabricCanvasRef.current.requestRenderAll();
    },
    [
      fabricCanvasRef,
      fabricCanvasBorderRectRef,
      updateBorderRect,
      setCanvasConfig,
    ]
  );

  const resetBorder = useCallback(() => {
    updateBorderRect();
    if (!fabricCanvasRef.current || !fabricCanvasBorderRectRef.current) return;

    // Update states
    setCanvasConfig((prev) => ({
      ...prev,
      border: DEFAULT_CANVAS_CONFIG.border,
    }));

    // Update Fabric Canvas
    fabricCanvasBorderRectRef.current.set({ stroke: '', strokeWidth: 0 });
    fabricCanvasRef.current.requestRenderAll();
  }, [
    fabricCanvasRef,
    fabricCanvasBorderRectRef,
    updateBorderRect,
    setCanvasConfig,
  ]);

  const discardActiveObject = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.discardActiveObject();
    fabricCanvasRef.current.requestRenderAll();
  }, [fabricCanvasRef]);

  return {
    switchToFreeLayout,
    handleImagesUpload,
    export: exportCanvas,
    setSize,
    setBackgroundColor,
    setBorderWidth,
    setBorderColor,
    resetBorder,

    discardActiveObject,
  };
}
