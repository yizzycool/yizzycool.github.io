import type { FabricHelperCanvasUpdater } from '../types/fabric-helper';
import type { ConfigHelper } from '../types/config-helper';

import * as fabric from 'fabric'; // v6

import useCommon from './use-common';
import colorUtils from '@/utils/color-utils';
import { FabricImageConfig, type FabricInternalStates } from './use-fabric';
import { DefaultCanvasConfig } from '..';

import _forEach from 'lodash/forEach';
import _hasIn from 'lodash/hasIn';
import _isArray from 'lodash/isArray';
import _flatMap from 'lodash/flatMap';
import _filter from 'lodash/filter';

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
  const {
    // containerRef,
    // canvasRef,
    fabricCanvasRef,
    fabricCanvasBorderRectRef,
  } = refs;

  const {
    canvasConfig,
    setCanvasConfig,

    // globalImageConfig,
    // setGlobalImageConfig,

    // imageConfig,
    // setImageConfig,
  } = configHelper;

  const {
    isFabricReady,
    // setIsFabricReady,

    // isExporting,
    setIsExporting,

    // hasImageSelection,
    // setHasImageSelection,
  } = fabricHelper;

  const { getAllImages, getNormStrokeWidth } = useCommon({
    refs: { fabricCanvasRef },
  });

  const switchToFreeLayout = async () => {
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
        ...FabricImageConfig,
        clipPath: null,
      });
    });

    // Update border rect of Fabric Canvas
    _canvasUpdater.updateBorderRect();

    fabricCanvasRef.current.requestRenderAll();

    // Update CanvasConfig
    setCanvasConfig((prev) => ({
      ...prev,
      layout: 'free',
    }));
  };

  const handleImagesUpload = async (files: FileList) => {
    if (!files || !fabricCanvasRef.current || !isFabricReady) return;

    const shortEdge = Math.min(
      fabricCanvasRef.current.width,
      fabricCanvasRef.current.height
    );
    const shiftOffset = 25 * (shortEdge / 1080);

    for (let idx = 0; idx < files.length; idx++) {
      const objectUrl = window.URL.createObjectURL(files[idx]);
      const img = await fabric.FabricImage.fromURL(objectUrl);

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
        ...FabricImageConfig,
      });
      fabricCanvasRef.current.add(img);
      if (idx === files.length - 1) {
        fabricCanvasRef.current.setActiveObject(img);
      }
      fabricCanvasRef.current.requestRenderAll();
    }
  };

  const exportCanvas = () => {
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
    let dataUrl = '';
    const filename = `picmerge-${Date.now()}`;
    if (canvasConfig.exportFormat === 'svg') {
      dataUrl = fabricCanvasRef.current.toSVG();
      const blob = new Blob([dataUrl], { type: 'image/svg+xml' });
      download(blob, `${filename}.svg`);
    } else {
      dataUrl = fabricCanvasRef.current.toDataURL({
        format: canvasConfig.exportFormat,
        quality: 0.9,
        multiplier: 2,
      });
      download(dataUrl, `${filename}.${canvasConfig.exportFormat}`);
    }
    setIsExporting(false);
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
    // Update border of Fabric Canvas
    _canvasUpdater.updateBorderRect();
    // Update stroke width of all images
    _canvasUpdater.updateAllImagesBorderWidth();
  };

  const setBackgroundColor = (color: string, opacity: number) => {
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
  };

  const setBorderWidth = (strokeWidth: number) => {
    _canvasUpdater.updateBorderRect();
    if (!fabricCanvasRef.current || !fabricCanvasBorderRectRef.current) return;

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
  };

  const setBorderColor = (color: string, opacity: number) => {
    _canvasUpdater.updateBorderRect();
    if (!fabricCanvasRef.current || !fabricCanvasBorderRectRef.current) return;

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
  };

  const resetBorder = () => {
    _canvasUpdater.updateBorderRect();
    if (!fabricCanvasRef.current || !fabricCanvasBorderRectRef.current) return;

    // Update states
    setCanvasConfig((prev) => ({
      ...prev,
      border: DefaultCanvasConfig.border,
    }));

    // Update Fabric Canvas
    fabricCanvasBorderRectRef.current.set({ stroke: '', strokeWidth: 0 });
    fabricCanvasRef.current.requestRenderAll();
  };

  const discardActiveObject = () => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.discardActiveObject();
    fabricCanvasRef.current.requestRenderAll();
  };

  // Interal Functions of canvasUpdater
  const _canvasUpdater = {
    // For border of Fabric Canvas
    updateBorderRect: () => {
      if (!fabricCanvasRef.current || !fabricCanvasBorderRectRef.current)
        return;
      // Update Fabric Canvas
      const { width: strokeWidth, color, opacity } = canvasConfig.border;
      // Get normalized stroke width
      const normStrokeWidth = getNormStrokeWidth(strokeWidth);
      // Get rgba hex string
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
    },
    updateAllImagesBorderWidth: () => {
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
    },
  };

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
