'use client';

import type {
  FabricHelperLayersUpdater,
  LayerItem,
} from '../types/fabric-helper';
import type { ConfigHelper } from '../types/config-helper';

import { useCallback, useEffect, useState } from 'react';
import * as fabric from 'fabric';
import { arrayMove } from '@dnd-kit/helpers';

import colorUtils from '@/utils/color-utils';

import useCommon from './use-common';
import { FABRIC_FILTER_MAP } from '../data/fabric-filters';

type Props = {
  refs: {
    fabricCanvasRef: React.MutableRefObject<fabric.Canvas | null>;
    fabricCanvasBorderRectRef: React.MutableRefObject<fabric.Rect | null>;
  };
  configHelper: ConfigHelper;
  isFabricReady: boolean;
};

export default function useLayersUpdater({
  refs,
  configHelper,
  isFabricReady,
}: Props): FabricHelperLayersUpdater & {
  layers: LayerItem[];
  selectedCount: number;
} {
  const { fabricCanvasRef, fabricCanvasBorderRectRef } = refs;
  const { getAllImages, getSelectedImages, getNormStrokeWidth } = useCommon({
    refs: { fabricCanvasRef },
  });

  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedCount, setSelectedCount] = useState<number>(0);

  // Sync layers list from Fabric canvas
  const syncLayers = useCallback(() => {
    if (!fabricCanvasRef.current) {
      setLayers([]);
      setSelectedCount(0);
      return;
    }

    const allImages = getAllImages();
    const activeObjects = fabricCanvasRef.current.getActiveObjects();

    const layerItems: LayerItem[] = allImages.map((img, idx) => {
      let layerId = (img as unknown as { _layerId?: string })._layerId;
      if (!layerId) {
        layerId = `layer_${idx}_${Date.now()}`;
        (img as unknown as { _layerId: string })._layerId = layerId;
      }

      let layerName =
        (img as unknown as { _fileName?: string })._fileName ||
        (img as unknown as { _layerName?: string })._layerName;
      if (!layerName) {
        layerName = `Layer ${idx + 1}`;
        (img as unknown as { _layerName: string })._layerName = layerName;
      }

      const isSelected = activeObjects.includes(img);
      const thumbnail =
        img.getSrc?.() ||
        (img as unknown as { _element?: HTMLImageElement })._element?.src ||
        '';

      return {
        id: layerId,
        name: layerName,
        image: img,
        visible: img.visible !== false,
        thumbnail,
        isSelected,
      };
    });

    // Reverse so top-most object in Fabric canvas appears at the top of the layer list
    const visualLayers = layerItems.slice().reverse();
    setLayers(visualLayers);
    setSelectedCount(visualLayers.filter((l) => l.isSelected).length);
  }, [fabricCanvasRef, getAllImages]);

  // Listen to Fabric canvas events to sync layers
  useEffect(() => {
    if (!fabricCanvasRef.current || !isFabricReady) return;

    const canvas = fabricCanvasRef.current;
    canvas.on('object:added', syncLayers);
    canvas.on('object:removed', syncLayers);
    canvas.on('object:modified', syncLayers);
    canvas.on('selection:created', syncLayers);
    canvas.on('selection:updated', syncLayers);
    canvas.on('selection:cleared', syncLayers);

    syncLayers();

    return () => {
      canvas.off('object:added', syncLayers);
      canvas.off('object:removed', syncLayers);
      canvas.off('object:modified', syncLayers);
      canvas.off('selection:created', syncLayers);
      canvas.off('selection:updated', syncLayers);
      canvas.off('selection:cleared', syncLayers);
    };
  }, [fabricCanvasRef, isFabricReady, syncLayers]);

  // Select a layer from the list
  const selectLayer = useCallback(
    (targetImage: fabric.FabricImage, isMulti = false) => {
      if (!fabricCanvasRef.current) return;
      const canvas = fabricCanvasRef.current;

      if (!isMulti) {
        canvas.setActiveObject(targetImage);
        canvas.requestRenderAll();
        return;
      }

      // Multi-select toggle
      const currentActive = canvas.getActiveObjects();
      let nextActive: fabric.FabricObject[];

      if (currentActive.includes(targetImage)) {
        nextActive = currentActive.filter((obj) => obj !== targetImage);
      } else {
        nextActive = [...currentActive, targetImage];
      }

      canvas.discardActiveObject();
      if (nextActive.length === 1) {
        canvas.setActiveObject(nextActive[0]);
      } else if (nextActive.length > 1) {
        const selection = new fabric.ActiveSelection(nextActive, { canvas });
        canvas.setActiveObject(selection);
      }
      canvas.requestRenderAll();
    },
    [fabricCanvasRef]
  );

  // Deselect all images to focus on background
  const selectBackground = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.discardActiveObject();
    fabricCanvasRef.current.requestRenderAll();
    syncLayers();
  }, [fabricCanvasRef, syncLayers]);

  // Select all images on canvas
  const selectAll = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const allImages = getAllImages();
    if (allImages.length === 0) return;

    canvas.discardActiveObject();
    if (allImages.length === 1) {
      canvas.setActiveObject(allImages[0]);
    } else {
      const selection = new fabric.ActiveSelection(allImages, { canvas });
      canvas.setActiveObject(selection);
    }
    canvas.requestRenderAll();
    syncLayers();
  }, [fabricCanvasRef, getAllImages, syncLayers]);

  // Toggle visibility of a layer
  const toggleVisibility = useCallback(
    (image: fabric.FabricImage) => {
      if (!fabricCanvasRef.current) return;
      image.set('visible', !image.visible);
      fabricCanvasRef.current.requestRenderAll();
      syncLayers();
    },
    [fabricCanvasRef, syncLayers]
  );

  // Drag & drop reorder layers
  const reorderLayers = useCallback(
    (newLayers: LayerItem[]) => {
      if (!fabricCanvasRef.current) return;
      const canvas = fabricCanvasRef.current;

      // newLayers is in visual order (index 0 is top-most layer).
      // In Fabric canvas, objects are rendered bottom-to-top.
      // Reversing gives bottom-to-top order so each can be brought to front sequentially.
      const bottomToTopImages = newLayers
        .slice()
        .reverse()
        .map((l) => l.image);

      bottomToTopImages.forEach((img) => {
        canvas.bringObjectToFront(img);
      });

      // Ensure border rect stays on top
      if (fabricCanvasBorderRectRef.current) {
        canvas.bringObjectToFront(fabricCanvasBorderRectRef.current);
      }

      canvas.requestRenderAll();
      syncLayers();
    },
    [fabricCanvasRef, fabricCanvasBorderRectRef, syncLayers]
  );

  const reorderLayer = useCallback(
    (fromVisualIndex: number, toVisualIndex: number) => {
      if (fromVisualIndex === toVisualIndex) return;
      if (fromVisualIndex < 0 || fromVisualIndex >= layers.length) return;
      if (toVisualIndex < 0 || toVisualIndex >= layers.length) return;

      const updated = arrayMove(layers, fromVisualIndex, toVisualIndex);
      reorderLayers(updated);
    },
    [layers, reorderLayers]
  );

  // Batch opacity
  const batchSetOpacity = useCallback(
    (opacity: number) => {
      if (!fabricCanvasRef.current) return;
      const selected = getSelectedImages();
      selected.forEach((img) => img.set('opacity', opacity));
      configHelper.setImageConfig((prev) => ({ ...prev, opacity }));
      fabricCanvasRef.current.requestRenderAll();
    },
    [fabricCanvasRef, getSelectedImages, configHelper]
  );

  // Batch border width
  const batchSetBorderWidth = useCallback(
    (strokeWidth: number) => {
      if (!fabricCanvasRef.current) return;
      const selected = getSelectedImages();
      const normWidth = getNormStrokeWidth(strokeWidth) / 2;
      selected.forEach((img) => {
        img.set({
          _strokeWidthRatio: strokeWidth,
          strokeWidth: normWidth,
        });
        img.setCoords();
      });
      configHelper.setImageConfig((prev) => ({
        ...prev,
        border: { ...prev.border, width: strokeWidth },
      }));
      fabricCanvasRef.current.requestRenderAll();
    },
    [fabricCanvasRef, getSelectedImages, getNormStrokeWidth, configHelper]
  );

  // Batch border color
  const batchSetBorderColor = useCallback(
    (color: string, opacity: number) => {
      if (!fabricCanvasRef.current) return;
      const selected = getSelectedImages();
      const rgba = colorUtils.hexToRgba(color);
      const stroke = colorUtils.rgbaToHex({ ...rgba, a: opacity });
      selected.forEach((img) => {
        img.set({ stroke });
        img.setCoords();
      });
      configHelper.setImageConfig((prev) => ({
        ...prev,
        border: { ...prev.border, color, opacity },
      }));
      fabricCanvasRef.current.requestRenderAll();
    },
    [fabricCanvasRef, getSelectedImages, configHelper]
  );

  // Batch reset border
  const batchResetBorder = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    const selected = getSelectedImages();
    selected.forEach((img) => {
      img.set({ stroke: '', strokeWidth: 0, _strokeWidthRatio: 0 });
      img.setCoords();
    });
    configHelper.setImageConfig((prev) => ({
      ...prev,
      border: { width: 0, color: '', opacity: 1 },
    }));
    fabricCanvasRef.current.requestRenderAll();
  }, [fabricCanvasRef, getSelectedImages, configHelper]);

  // Batch filters
  const batchSetFilters = useCallback(
    (filterTypes: string[]) => {
      if (!fabricCanvasRef.current) return;
      const selected = getSelectedImages();

      selected.forEach((img) => {
        const fabricFilters = filterTypes
          .map((type) => {
            const FilterClass = FABRIC_FILTER_MAP[type]?.filter;
            return FilterClass ? new FilterClass() : null;
          })
          .filter(Boolean) as fabric.filters.BaseFilter<string>[];

        img.set({ filters: fabricFilters });
        img.applyFilters();
      });

      fabricCanvasRef.current.requestRenderAll();
    },
    [fabricCanvasRef, getSelectedImages]
  );

  // Batch delete
  const batchDelete = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const selected = getSelectedImages();
    selected.forEach((img) => canvas.remove(img));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    syncLayers();
  }, [fabricCanvasRef, getSelectedImages, syncLayers]);

  // Batch order (front, back, forward, backward)
  const batchSetLayer = useCallback(
    (type: 'front' | 'back' | 'forward' | 'backward') => {
      if (!fabricCanvasRef.current) return;
      const canvas = fabricCanvasRef.current;
      const selected = getSelectedImages();

      if (type === 'front') {
        selected.forEach((img) => canvas.bringObjectToFront(img));
      } else if (type === 'back') {
        selected
          .slice()
          .reverse()
          .forEach((img) => canvas.sendObjectToBack(img));
      } else if (type === 'forward') {
        selected.forEach((img) => canvas.bringObjectForward(img));
      } else if (type === 'backward') {
        selected
          .slice()
          .reverse()
          .forEach((img) => canvas.sendObjectBackwards(img));
      }

      if (fabricCanvasBorderRectRef.current) {
        canvas.bringObjectToFront(fabricCanvasBorderRectRef.current);
      }

      canvas.requestRenderAll();
      syncLayers();
    },
    [fabricCanvasRef, fabricCanvasBorderRectRef, getSelectedImages, syncLayers]
  );

  return {
    layers,
    selectedCount,
    getLayers: () => layers,
    selectLayer,
    selectAll,
    selectBackground,
    toggleVisibility,
    reorderLayer,
    reorderLayers,
    batchSetOpacity,
    batchSetBorderWidth,
    batchSetBorderColor,
    batchResetBorder,
    batchSetFilters,
    batchDelete,
    batchSetLayer,
  };
}
