import type { FabricHelperCanvasUpdater } from '../types/fabric-helper';
import type { ConfigHelper } from '../types/config-helper';
import type { FabricInternalStates } from './use-fabric';
import type { CanvasConfig } from '../types/config';

import { useCallback } from 'react';
import * as fabric from 'fabric';

import colorUtils from '@/utils/color-utils';
import toast from '@/utils/toast';

import useCommon from './use-common';
import { FABRIC_IMAGE_CONFIG } from './use-fabric';
import { DEFAULT_CANVAS_CONFIG } from '..';
import { attachImageAssetMeta } from '../utils/studio-snapshot';

type Props = {
  refs: {
    containerRef: React.MutableRefObject<HTMLDivElement | null>;
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
    fabricCanvasRef: React.MutableRefObject<fabric.Canvas | null>;
    canvasConfigRef?: React.MutableRefObject<CanvasConfig>;
  };
  configHelper: ConfigHelper;
  fabricHelper: FabricInternalStates;
  registerAssetFile?: (file: File) => { assetId: string; url: string };
  onCommitHistory?: (mode?: 'immediate' | 'debounced') => void;
};

// Functions to update canvas-related config and update Fabric canvas
export default function useCanvasUpdater({
  refs,
  configHelper,
  fabricHelper,
  registerAssetFile,
  onCommitHistory,
}: Props): FabricHelperCanvasUpdater {
  const { fabricCanvasRef, canvasConfigRef } = refs;

  const { canvasConfig, setCanvasConfig } = configHelper;

  const { isFabricReady, setIsExporting } = fabricHelper;

  const { getAllImages, getNormStrokeWidth } = useCommon({
    refs: { fabricCanvasRef },
  });

  // Internal helpers
  const updateBorderRect = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.requestRenderAll();
  }, [fabricCanvasRef]);

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

    // Remove existed objects except all images
    fabricCanvasRef.current.remove(
      ...fabricCanvasRef.current
        .getObjects()
        .filter(
          (object) =>
            !(object instanceof fabric.FabricImage) || !object?.getSrc?.()
        )
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
    if (canvasConfigRef) {
      canvasConfigRef.current = {
        ...canvasConfigRef.current,
        layout: 'free',
      };
    }
    setCanvasConfig((prev) => ({
      ...prev,
      layout: 'free',
    }));

    onCommitHistory?.('immediate');
  }, [
    fabricCanvasRef,
    getAllImages,
    updateBorderRect,
    canvasConfigRef,
    setCanvasConfig,
    onCommitHistory,
  ]);

  const handleImagesUpload = useCallback(
    async (files: FileList | File[]) => {
      if (
        !files ||
        files.length === 0 ||
        !fabricCanvasRef.current ||
        !isFabricReady
      ) {
        return;
      }

      const shortEdge = Math.min(
        fabricCanvasRef.current.width,
        fabricCanvasRef.current.height
      );
      const shiftOffset = 25 * (shortEdge / 1080);

      for (let idx = 0; idx < files.length; idx++) {
        const file = files[idx];
        const registered = registerAssetFile?.(file);
        const objectUrl = registered?.url ?? window.URL.createObjectURL(file);
        const img = await fabric.FabricImage.fromURL(objectUrl, {
          crossOrigin: 'anonymous',
        });

        attachImageAssetMeta(img, {
          assetId: registered?.assetId,
          fileName: file.name,
          layerName: file.name,
        });

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

      onCommitHistory?.('immediate');
    },
    [fabricCanvasRef, isFabricReady, registerAssetFile, onCommitHistory]
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

  const copyToClipboard = useCallback(async (): Promise<boolean> => {
    if (!fabricCanvasRef.current || !isFabricReady) return false;

    if (
      typeof navigator === 'undefined' ||
      !navigator.clipboard?.write ||
      typeof ClipboardItem === 'undefined'
    ) {
      toast.error('Clipboard image copy is not supported in this browser');
      return false;
    }

    try {
      const dataUrl = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1,
        enableRetinaScaling: false,
      });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      toast.success('PNG copied to clipboard');
      return true;
    } catch {
      toast.error(
        'Clipboard permission denied. Please download the image instead.'
      );
      return false;
    }
  }, [fabricCanvasRef, isFabricReady]);

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
      // Update border of Fabric Canvas
      updateBorderRect();
      // Update stroke width of all images
      updateAllImagesBorderWidth();

      onCommitHistory?.('immediate');
    },
    [
      fabricCanvasRef,
      isFabricReady,
      canvasConfigRef,
      setCanvasConfig,
      updateBorderRect,
      updateAllImagesBorderWidth,
      onCommitHistory,
    ]
  );

  const setBackgroundColor = useCallback(
    (color: string, opacity: number) => {
      if (!fabricCanvasRef.current || !isFabricReady) return;

      // Update states
      if (canvasConfigRef) {
        canvasConfigRef.current = {
          ...canvasConfigRef.current,
          background: { type: 'color', color: { color, opacity } },
        };
      }
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
    [fabricCanvasRef, isFabricReady, canvasConfigRef, setCanvasConfig]
  );

  const setBorderWidth = useCallback(
    (strokeWidth: number) => {
      if (!fabricCanvasRef.current) return;

      if (canvasConfigRef) {
        canvasConfigRef.current = {
          ...canvasConfigRef.current,
          border: { ...canvasConfigRef.current.border, width: strokeWidth },
        };
      }

      // Update states
      setCanvasConfig((prev) => ({
        ...prev,
        border: { ...prev.border, width: strokeWidth },
      }));

      fabricCanvasRef.current.requestRenderAll();
    },
    [fabricCanvasRef, canvasConfigRef, setCanvasConfig]
  );

  const setBorderColor = useCallback(
    (color: string, opacity: number) => {
      if (!fabricCanvasRef.current) return;

      if (canvasConfigRef) {
        canvasConfigRef.current = {
          ...canvasConfigRef.current,
          border: { ...canvasConfigRef.current.border, color, opacity },
        };
      }

      // Update states
      setCanvasConfig((prev) => ({
        ...prev,
        border: { ...prev.border, color, opacity },
      }));

      fabricCanvasRef.current.requestRenderAll();
    },
    [fabricCanvasRef, canvasConfigRef, setCanvasConfig]
  );

  const resetBorder = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    if (canvasConfigRef) {
      canvasConfigRef.current = {
        ...canvasConfigRef.current,
        border: DEFAULT_CANVAS_CONFIG.border,
      };
    }

    // Update states
    setCanvasConfig((prev) => ({
      ...prev,
      border: DEFAULT_CANVAS_CONFIG.border,
    }));

    fabricCanvasRef.current.requestRenderAll();
    onCommitHistory?.('immediate');
  }, [fabricCanvasRef, canvasConfigRef, setCanvasConfig, onCommitHistory]);

  const discardActiveObject = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.discardActiveObject();
    fabricCanvasRef.current.requestRenderAll();
  }, [fabricCanvasRef]);

  return {
    switchToFreeLayout,
    handleImagesUpload,
    export: exportCanvas,
    copyToClipboard,
    setSize,
    setBackgroundColor,
    setBorderWidth,
    setBorderColor,
    resetBorder,

    discardActiveObject,
  };
}
