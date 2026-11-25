'use client';

import type { FabricHelper } from '../types/fabric-helper';
import type { ConfigHelper } from '../types/config-helper';
import type { GridCell, GridTemplate } from '../types/grid-layout';
import type { SupportedFabricFilterType } from '../types/fabric-filter';
import type { CaptionConfig } from '../types/config';
import type { AssetEntry } from './use-studio-history';

import * as fabric from 'fabric';
import { useCallback, useEffect, useRef, useState } from 'react';
import { clamp, head } from 'lodash';

import colorUtils from '@/utils/color-utils';
import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';

import useCanvasUpdater from './use-canvas-updater';
import useImageUpdater from './use-image-updater';
import useImagesUpdater from './use-images-updater';
import useCommon from './use-common';
import useGridUpdater from './use-grid-updater';
import useLayersUpdater from './use-layers-updater';
import useSnapGuides from './use-snap-guides';
import useStudioHistory from './use-studio-history';
import { applyAngleSnap, shortestAngleDelta } from '../utils/angle-snap';
import {
  extractImageShadowConfig,
  type ExtendedFabricImage,
} from '../utils/studio-snapshot';
import { DEFAULT_CANVAS_CONFIG } from '..';

export const FABRIC_CONTROL_CONFIG = {
  strokeUniform: true,
  borderColor: '#12a29282',
  cornerColor: '#12a29282',
  cornerStyle: 'circle' as const,
  cornerStrokeColor: '#ffffff7f',
  transparentCorners: false,
  cornerSize: 20,
  borderScaleFactor: 5,
  touchCornerSize: 40,
};

export const FABRIC_IMAGE_CONFIG = {
  lockScalingFlip: true,
  lockSkewingX: true,
  lockSkewingY: true,
  centeredScaling: true,
  strokeWidth: 0,
  _strokeWidthRatio: 0,
  stroke: '',
  snapAngle: 90,
  snapThreshold: 5,
  ...FABRIC_CONTROL_CONFIG,
};

export type FabricInternalStates = {
  isFabricReady: boolean;
  setIsFabricReady: React.Dispatch<React.SetStateAction<boolean>>;

  isExporting: boolean;
  setIsExporting: React.Dispatch<React.SetStateAction<boolean>>;

  hasImageSelection: boolean;
  setHasImageSelection: React.Dispatch<React.SetStateAction<boolean>>;
};

type Props = {
  refs: {
    containerRef: React.MutableRefObject<HTMLDivElement | null>;
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  };
  configHelper: ConfigHelper;
  snapGuidesEnabled?: boolean;
};

export default function useFabric({
  refs,
  configHelper,
  snapGuidesEnabled = true,
}: Props): FabricHelper {
  const { containerRef, canvasRef } = refs;
  const { canvasConfig, globalImageConfig, setImageConfig } = configHelper;

  const [isFabricReady, setIsFabricReady] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasImageSelection, setHasImageSelection] = useState(false);
  const [hasImageSrc, setHasImageSrc] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [viewportZoom, setViewportZoomState] = useState(1);
  const [editingCellId, setEditingCellId] = useState<number | null>(null);
  const [selectedCaption, setSelectedCaption] = useState<CaptionConfig | null>(
    null
  );
  const [hasCaptionSelection, setHasCaptionSelection] = useState(false);

  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const gridRef = useRef<GridTemplate | null>(null);

  const canvasConfigRef = useRef(canvasConfig);
  const globalImageConfigRef = useRef(globalImageConfig);
  const viewportZoomRef = useRef(1);
  const editingCellIdRef = useRef<number | null>(null);
  const swapCellsRef = useRef<
    ((cellA: GridCell, cellB: GridCell) => Promise<void>) | null
  >(null);
  const assetMapRef = useRef<Map<string, AssetEntry>>(new Map());
  const commitHistoryRef = useRef<(mode?: 'immediate' | 'debounced') => void>(
    () => {}
  );

  useEffect(() => {
    canvasConfigRef.current = canvasConfig;
  }, [canvasConfig]);

  useEffect(() => {
    globalImageConfigRef.current = globalImageConfig;
  }, [globalImageConfig]);

  const registerAssetBlob = useCallback((assetId: string, blob: Blob) => {
    const existing = assetMapRef.current.get(assetId);
    if (existing) {
      return existing.url;
    }
    const url = window.URL.createObjectURL(blob);
    assetMapRef.current.set(assetId, { blob, url });
    return url;
  }, []);

  const registerAssetFile = useCallback(
    (file: File) => {
      const assetId = `asset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const url = registerAssetBlob(assetId, file);
      return { assetId, url };
    },
    [registerAssetBlob]
  );

  const resolveAssetUrl = useCallback(
    (assetId: string, fallbackSrc: string): string | null => {
      const entry = assetMapRef.current.get(assetId);
      if (entry?.url) return entry.url;
      return fallbackSrc || null;
    },
    []
  );

  const onCommitHistory = useCallback((mode?: 'immediate' | 'debounced') => {
    commitHistoryRef.current(mode);
  }, []);

  const fabricHelper: FabricInternalStates = {
    isFabricReady,
    setIsFabricReady,

    isExporting,
    setIsExporting,

    hasImageSelection,
    setHasImageSelection,
  };

  const canvasUpdater = useCanvasUpdater({
    refs: { ...refs, fabricCanvasRef, canvasConfigRef, assetMapRef },
    configHelper,
    fabricHelper,
    registerAssetFile,
    onCommitHistory,
  });

  const imageUpdater = useImageUpdater({
    refs: { ...refs, fabricCanvasRef },
    configHelper,
    registerAssetFile,
    onCommitHistory,
  });

  const imagesUpdater = useImagesUpdater({
    refs: { ...refs, fabricCanvasRef, gridRef },
    configHelper,
    onCommitHistory,
  });

  const gridUpdater = useGridUpdater({
    refs: { ...refs, fabricCanvasRef, gridRef, canvasConfigRef },
    configHelper,
    fabricHelper,
    registerAssetFile,
    onCommitHistory,
  });

  useEffect(() => {
    swapCellsRef.current = gridUpdater.swapCells;
  }, [gridUpdater.swapCells]);

  const layersUpdater = useLayersUpdater({
    refs: { fabricCanvasRef },
    configHelper,
    isFabricReady,
    onCommitHistory,
  });

  const { getSelectedImage, getSelectedImages } = useCommon({
    refs: { fabricCanvasRef },
  });

  // To resize canvas element when container or window resized
  const resizeDisplay = useCallback(() => {
    if (!containerRef.current || !fabricCanvasRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    if (containerWidth <= 0 || containerHeight <= 0) return;

    const canvasSize = canvasConfigRef.current.size;

    // Provide comfortable breathing room around the artboard & bottom Zoom HUD
    const horizontalPadding = containerWidth < 640 ? 16 : 32;
    const paddingTop = containerWidth < 640 ? 16 : 24;
    const paddingBottom = containerWidth < 640 ? 48 : 56;
    const availableWidth = Math.max(containerWidth - horizontalPadding * 2, 80);
    const availableHeight = Math.max(
      containerHeight - paddingTop - paddingBottom,
      80
    );

    const baseScale = Math.min(
      availableWidth / canvasSize.width,
      availableHeight / canvasSize.height
    );
    const scale = baseScale * viewportZoomRef.current;

    // Update canvas wrapper
    const wrapper = container.querySelector('.canvas-container') as HTMLElement;
    if (wrapper) {
      wrapper.style.width = `${canvasSize.width * scale}px`;
      wrapper.style.height = `${canvasSize.height * scale}px`;
    }

    // Update lower canvas
    const lowerCanvas = container.querySelector('.lower-canvas') as HTMLElement;
    if (lowerCanvas) {
      lowerCanvas.style.width = `${canvasSize.width * scale}px`;
      lowerCanvas.style.height = `${canvasSize.height * scale}px`;
    }

    // Update upper canvas
    const upperCanvas = container.querySelector('.upper-canvas') as HTMLElement;
    if (upperCanvas) {
      upperCanvas.style.width = `${canvasSize.width * scale}px`;
      upperCanvas.style.height = `${canvasSize.height * scale}px`;
    }

    // Update fabricCanvas key
    fabricCanvasRef.current.set('_scale', scale);
  }, [containerRef, fabricCanvasRef]);

  const setViewportZoom = useCallback(
    (nextZoom: number) => {
      const clamped = clamp(Math.round(nextZoom * 100) / 100, 0.25, 2);
      viewportZoomRef.current = clamped;
      setViewportZoomState(clamped);
      resizeDisplay();
    },
    [resizeDisplay]
  );

  const exitCellFocus = useCallback(() => {
    editingCellIdRef.current = null;
    setEditingCellId(null);
  }, []);

  // Handler to update if any selection exists in Fabric Canvas
  const recalcSelection = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const selectedImages = getSelectedImages();
    const selectedImage = head(selectedImages);
    const activeObj = fabricCanvasRef.current.getActiveObject();

    if (activeObj instanceof fabric.Textbox) {
      setHasCaptionSelection(true);
      setSelectedCaption({
        text: activeObj.text || '',
        fontSize: activeObj.fontSize ?? 42,
        fill: typeof activeObj.fill === 'string' ? activeObj.fill : '#ffffff',
        fontWeight: activeObj.fontWeight === 'bold' ? 'bold' : 'normal',
        textAlign:
          activeObj.textAlign === 'left' || activeObj.textAlign === 'right'
            ? activeObj.textAlign
            : 'center',
        opacity: activeObj.opacity ?? 1,
      });
    } else {
      setHasCaptionSelection(false);
      setSelectedCaption(null);
    }

    setHasImageSelection(selectedImages.length > 0);
    setHasImageSrc(!!selectedImage?.getSrc?.());
    setSelectedCount(selectedImages.length);

    // Trigger to switch to 'Image' tab
    if (selectedImages.length > 0) {
      customEventUtils.emit(CustomEvents.common.switchTab, { tab: 'Image' });
    }

    // Recalculate control stroke
    const _scale = fabricCanvasRef.current.get('_scale') || 1;
    selectedImages.forEach((img) => {
      img.set({
        cornerSize: 10 / _scale,
        touchCornerSize: 40 / _scale,
        borderScaleFactor: (img.getSrc() ? 2 : 5) / _scale,
      });
      if (img.controls?.mtr) {
        img.controls.mtr.offsetY = -20 / _scale;
      }
      img.setCoords();
    });
    fabricCanvasRef.current.requestRenderAll();
  }, [fabricCanvasRef, getSelectedImages]);

  // Monitor to update if any selection exists in Fabric Canvas
  const initHasImageSelectionMonitor = () => {
    if (!fabricCanvasRef.current) return;

    fabricCanvasRef.current.on('selection:created', recalcSelection);
    fabricCanvasRef.current.on('selection:updated', recalcSelection);
    fabricCanvasRef.current.on('selection:cleared', recalcSelection);
  };

  // Monitor to update imageConfig if selection changed in Fabric Canvas
  const initSelectedImageMonitor = () => {
    if (!fabricCanvasRef.current) return;

    const syncSelectedImageConfig = () => {
      if (!fabricCanvasRef.current) return;
      const selectedImage = getSelectedImage();
      if (!selectedImage) return;

      // Only sync with the first selected image
      const rgbaHex = (selectedImage.stroke || '') as string;
      const { color, opacity } = colorUtils.hexToColorOpacity(rgbaHex);

      const selectedExt = selectedImage as ExtendedFabricImage;
      setImageConfig((prev) => ({
        ...prev,
        opacity: selectedImage.opacity,
        border: {
          width: selectedImage.get('_strokeWidthRatio') || 0,
          color: color.toUpperCase(),
          opacity,
        },
        angle: selectedImage.angle,
        scaleX: selectedImage.scaleX,
        scaleY: selectedImage.scaleY,
        width: Math.round(selectedImage.getScaledWidth()),
        height: Math.round(selectedImage.getScaledHeight()),
        originalWidth: selectedImage.width,
        originalHeight: selectedImage.height,
        lockMovementX: selectedImage.lockMovementX,
        lockMovementY: selectedImage.lockMovementY,
        flipX: selectedImage.flipX,
        flipY: selectedImage.flipY,
        snapAngle: selectedImage.snapAngle,
        cropAspect: selectedExt._cropAspect ?? 'none',
        maskShape: selectedExt._maskShape ?? 'none',
        shadow: extractImageShadowConfig(selectedImage),
        filters:
          selectedImage.filters as InstanceType<SupportedFabricFilterType>[],
      }));
    };

    const syncSelectedImageGeometry = (type: 'rotating' | 'scaling') => {
      if (!fabricCanvasRef.current) return;
      const selectedImage = getSelectedImage();
      if (!selectedImage) return;

      if (type === 'rotating') {
        setImageConfig((prev) => ({
          ...prev,
          angle: selectedImage.angle,
        }));
      } else if (type === 'scaling') {
        setImageConfig((prev) => ({
          ...prev,
          scaleX: selectedImage.scaleX,
          scaleY: selectedImage.scaleY,
          width: Math.round(selectedImage.getScaledWidth()),
          height: Math.round(selectedImage.getScaledHeight()),
        }));
      }
    };

    fabricCanvasRef.current.on('selection:created', syncSelectedImageConfig);
    fabricCanvasRef.current.on('selection:updated', syncSelectedImageConfig);
    fabricCanvasRef.current.on('selection:cleared', syncSelectedImageConfig);
    fabricCanvasRef.current.on('object:rotating', () =>
      syncSelectedImageGeometry('rotating')
    );
    fabricCanvasRef.current.on('object:scaling', () =>
      syncSelectedImageGeometry('scaling')
    );
  };

  const initHammerPinch = async (
    shouldAbort: () => boolean
  ): Promise<InstanceType<typeof import('hammerjs').Manager> | null> => {
    if (!fabricCanvasRef.current) return null;

    // Need to import Hammer dynamically or `window` issue will occur while running `yarn build`
    const Hammer = (await import('hammerjs')).default;
    if (shouldAbort() || !fabricCanvasRef.current) return null;

    const el = fabricCanvasRef.current.upperCanvasEl;
    const hammer = new Hammer.Manager(el, {
      recognizers: [
        // RecognizerClass, [options], [recognizeWith, ...], [requireFailure, ...]
        [Hammer.Rotate],
        [Hammer.Pinch, { enable: true }, ['rotate']],
      ],
    });

    const fabricStates = {
      initScale: 1,
      initAngle: 0,
      lockMovementX: false,
      lockMovementY: false,
    };

    const hammerStates = {
      initScale: 1,
      lastRotation: 0,
      accumulatedRotation: 0,
      didMutate: false,
    };

    let target: fabric.FabricObject | null = null;

    const beginGesture = (e: { scale?: number; rotation?: number }) => {
      if (!fabricCanvasRef.current || target) return;
      const activeObject = fabricCanvasRef.current.getActiveObject();
      if (!activeObject) return;

      target = activeObject;

      fabricStates.lockMovementX = activeObject.lockMovementX;
      fabricStates.lockMovementY = activeObject.lockMovementY;
      fabricStates.initScale = activeObject.scaleX ?? 1;
      fabricStates.initAngle = activeObject.angle ?? 0;

      activeObject.set({
        lockMovementX: true,
        lockMovementY: true,
      });
      fabricCanvasRef.current.requestRenderAll();

      hammerStates.initScale = e.scale || 1;
      hammerStates.lastRotation = e.rotation ?? 0;
      hammerStates.accumulatedRotation = 0;
      hammerStates.didMutate = false;
    };

    hammer.on('pinchstart rotatestart', beginGesture);

    hammer.on('pinchmove', (e) => {
      if (!fabricCanvasRef.current || !target) return;
      if (target.lockScalingX || target.lockScalingY) return;

      const scale = fabricStates.initScale * (e.scale / hammerStates.initScale);
      target.scale(scale);
      target.setCoords();
      hammerStates.didMutate = true;

      setImageConfig((prev) => ({
        ...prev,
        scaleX: target?.scaleX ?? prev.scaleX,
        scaleY: target?.scaleY ?? prev.scaleY,
        width: target ? Math.round(target.getScaledWidth()) : prev.width,
        height: target ? Math.round(target.getScaledHeight()) : prev.height,
      }));

      fabricCanvasRef.current.requestRenderAll();
    });

    hammer.on('rotatemove', (e) => {
      if (!fabricCanvasRef.current || !target) return;
      if (target.lockRotation) return;

      const currentRotation = e.rotation ?? 0;
      const stepDelta = shortestAngleDelta(
        hammerStates.lastRotation,
        currentRotation
      );
      hammerStates.lastRotation = currentRotation;
      hammerStates.accumulatedRotation += stepDelta;

      // Resolve snapAngle from the target (or first child when rotating an ActiveSelection)
      const primaryObject =
        target instanceof fabric.ActiveSelection
          ? target.getObjects()[0]
          : target;
      const effectiveSnapAngle = primaryObject?.snapAngle ?? 90;
      const rawThreshold = primaryObject?.snapThreshold ?? 5;
      const effectiveThreshold =
        effectiveSnapAngle > 0 ? Math.max(rawThreshold, 7) : 0;

      const rawAngle =
        fabricStates.initAngle + hammerStates.accumulatedRotation;
      const snappedAngle = applyAngleSnap(
        rawAngle,
        effectiveSnapAngle,
        effectiveThreshold
      );

      target.rotate(snappedAngle);
      target.setCoords();
      hammerStates.didMutate = true;

      setImageConfig((prev) => ({
        ...prev,
        angle: snappedAngle,
      }));

      fabricCanvasRef.current.requestRenderAll();
    });

    const finalizeGesture = () => {
      if (!fabricCanvasRef.current || !target) return;

      const modifiedTarget = target;
      const shouldCommit = hammerStates.didMutate;

      modifiedTarget.set({
        lockMovementX: fabricStates.lockMovementX,
        lockMovementY: fabricStates.lockMovementY,
      });
      modifiedTarget.setCoords();

      target = null;
      hammerStates.didMutate = false;

      fabricCanvasRef.current.requestRenderAll();
      if (shouldCommit) {
        fabricCanvasRef.current.fire('object:modified', {
          target: modifiedTarget,
        });
      }
    };

    hammer.on('pinchend pinchcancel rotateend rotatecancel', finalizeGesture);
    hammer.on('hammer.input', (e) => {
      if (e.isFinal && target) {
        finalizeGesture();
      }
    });

    return hammer;
  };

  // Init Fabric.js
  useEffect(() => {
    if (!canvasRef.current) return;

    let isDisposed = false;
    let hammerInstance: InstanceType<typeof import('hammerjs').Manager> | null =
      null;

    // Create a Canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: DEFAULT_CANVAS_CONFIG.background.color?.color,
      selection: true,
      selectionColor: 'rgba(14, 165, 233, 0.15)',
      selectionBorderColor: '#0ea5e9',
      selectionLineWidth: 1.5,
      enableRetinaScaling: true,
    });
    fabricCanvasRef.current = canvas;
    fabricCanvasRef.current.setDimensions({
      width: DEFAULT_CANVAS_CONFIG.size.width,
      height: DEFAULT_CANVAS_CONFIG.size.height,
    });

    // Draw canvas border & tiled watermark + swap highlight via after:render
    let hoverSwapCell: GridCell | null = null;
    let draggingSourceCell: GridCell | null = null;

    const findGridCellByImage = (obj: fabric.FabricObject): GridCell | null => {
      if (!gridRef.current) return null;
      for (const row of gridRef.current.cells) {
        for (const cell of row) {
          if (cell && cell.element === obj) return cell;
        }
      }
      return null;
    };

    const findGridCellAtPoint = (
      x: number,
      y: number,
      excludeCellId?: number
    ): GridCell | null => {
      if (!gridRef.current) return null;
      for (const row of gridRef.current.cells) {
        for (const cell of row) {
          if (!cell || cell.id === excludeCellId) continue;
          const clip = cell.element.clipPath;
          if (!clip) continue;
          const halfW = (clip.width ?? 0) / 2;
          const halfH = (clip.height ?? 0) / 2;
          if (
            Math.abs(x - (clip.left ?? 0)) <= halfW &&
            Math.abs(y - (clip.top ?? 0)) <= halfH
          ) {
            return cell;
          }
        }
      }
      return null;
    };

    canvas.on('mouse:dblclick', (opt) => {
      if (canvasConfigRef.current.layout !== 'grid' || !opt.target) return;
      const cell = findGridCellByImage(opt.target);
      if (cell && cell.element.getSrc?.()) {
        editingCellIdRef.current =
          editingCellIdRef.current === cell.id ? null : cell.id;
        setEditingCellId(editingCellIdRef.current);
      }
    });

    canvas.on('mouse:down', (opt) => {
      hoverSwapCell = null;
      draggingSourceCell = null;
      if (canvasConfigRef.current.layout !== 'grid' || !opt.target) {
        if (editingCellIdRef.current !== null) {
          editingCellIdRef.current = null;
          setEditingCellId(null);
        }
        return;
      }
      const cell = findGridCellByImage(opt.target);
      if (!cell) return;
      if (
        editingCellIdRef.current !== null &&
        editingCellIdRef.current !== cell.id
      ) {
        editingCellIdRef.current = null;
        setEditingCellId(null);
      }
      if (editingCellIdRef.current !== cell.id && cell.element.getSrc?.()) {
        draggingSourceCell = cell;
      }
    });

    canvas.on('object:moving', (opt) => {
      if (
        canvasConfigRef.current.layout !== 'grid' ||
        !draggingSourceCell ||
        opt.target !== draggingSourceCell.element
      ) {
        hoverSwapCell = null;
        return;
      }
      const pointer = canvas.getScenePoint(opt.e);
      hoverSwapCell = findGridCellAtPoint(
        pointer.x,
        pointer.y,
        draggingSourceCell.id
      );
    });

    canvas.on('mouse:up', () => {
      if (draggingSourceCell && hoverSwapCell && swapCellsRef.current) {
        const srcCell = draggingSourceCell;
        const dstCell = hoverSwapCell;
        draggingSourceCell = null;
        hoverSwapCell = null;
        void swapCellsRef.current(srcCell, dstCell);
        return;
      }
      draggingSourceCell = null;
      hoverSwapCell = null;
    });

    canvas.on('mouse:wheel', (opt) => {
      const e = opt.e;
      if (
        canvasConfigRef.current.layout === 'grid' &&
        editingCellIdRef.current !== null
      ) {
        e.preventDefault();
        e.stopPropagation();
        const focusedCell = gridRef.current?.cells
          .flat()
          .find((c) => c?.id === editingCellIdRef.current);
        if (focusedCell?.element) {
          const factor = 0.9985 ** e.deltaY;
          const nextScale = clamp(
            (focusedCell.element.scaleX ?? 1) * factor,
            0.1,
            8
          );
          focusedCell.element.scale(nextScale);
          focusedCell.element.setCoords();
          canvas.requestRenderAll();
        }
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        const factor = e.deltaY < 0 ? 1.08 : 0.92;
        setViewportZoom(viewportZoomRef.current * factor);
      }
    });

    canvas.on('after:render', (opt) => {
      const ctx = opt.ctx;
      if (!ctx) return;

      const currentConfig = canvasConfigRef.current;
      const isGrid = currentConfig.layout === 'grid';
      const borderConfig = isGrid
        ? currentConfig.gridConfig.border
        : currentConfig.border;

      const v = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];

      // 1) Tiled Diagonal Watermark Overlay
      const wm = currentConfig.watermark;
      if (wm?.enabled && wm.text.trim()) {
        const rgba = colorUtils.hexToRgba(wm.color || '#ffffff');
        const fillStyle = colorUtils.rgbaToHex({
          r: rgba.r,
          g: rgba.g,
          b: rgba.b,
          a: wm.opacity,
        });
        ctx.save();
        ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.clip();
        ctx.fillStyle = fillStyle;
        ctx.font = `600 ${Math.max(12, wm.fontSize)}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const stepX = Math.max(180, wm.text.length * wm.fontSize * 0.72 + 70);
        const stepY = Math.max(120, wm.fontSize * 3.4);
        const rad = ((wm.angle ?? -30) * Math.PI) / 180;
        const diag = Math.hypot(canvas.width, canvas.height);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        for (let y = -diag; y <= diag; y += stepY) {
          for (let x = -diag; x <= diag; x += stepX) {
            ctx.fillText(wm.text, x, y);
          }
        }
        ctx.restore();
      }

      // 2) Hover swap cell outline during Grid Drag-to-Swap
      if (hoverSwapCell?.element.clipPath) {
        const clip = hoverSwapCell.element.clipPath;
        ctx.save();
        ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 6;
        ctx.setLineDash([12, 8]);
        ctx.strokeRect(
          (clip.left ?? 0) - (clip.width ?? 0) / 2 + 4,
          (clip.top ?? 0) - (clip.height ?? 0) / 2 + 4,
          Math.max(8, (clip.width ?? 0) - 8),
          Math.max(8, (clip.height ?? 0) - 8)
        );
        ctx.restore();
      }

      if (isGrid && !currentConfig.gridConfig.border.showOuter) {
        return;
      }

      const { width: strokeWidth, color, opacity } = borderConfig;
      if (!strokeWidth || opacity === 0) return;

      const shortEdge = Math.min(canvas.width, canvas.height);
      const normStrokeWidth =
        ((strokeWidth / 100) * ((50 * shortEdge) / 1000)) / 2;
      if (normStrokeWidth <= 0) return;

      const rgba = colorUtils.hexToRgba(color);
      const strokeStyle = colorUtils.rgbaToHex({ ...rgba, a: opacity });

      ctx.save();
      ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = normStrokeWidth;
      ctx.strokeRect(
        normStrokeWidth / 2,
        normStrokeWidth / 2,
        canvas.width - normStrokeWidth,
        canvas.height - normStrokeWidth
      );
      ctx.restore();
    });

    // Init all monitors
    initHasImageSelectionMonitor();
    initSelectedImageMonitor();
    void initHammerPinch(() => isDisposed).then((instance) => {
      if (isDisposed) {
        instance?.destroy();
        return;
      }
      hammerInstance = instance;
    });

    // Custom event to update image selection status
    const unsubscriber = customEventUtils.on(
      CustomEvents.tools.fabricRecalcSelection,
      recalcSelection
    );

    // Render all
    fabricCanvasRef.current.requestRenderAll();

    // Init Fabric completely
    setIsFabricReady(true);

    const assetMapSnapshot = assetMapRef.current;

    return () => {
      isDisposed = true;
      hammerInstance?.destroy();
      canvas.dispose();
      unsubscriber();
      for (const entry of assetMapSnapshot.values()) {
        window.URL.revokeObjectURL(entry.url);
      }
      assetMapSnapshot.clear();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update canvas when container or window size changes (including mobile tray toggle)
  useEffect(() => {
    if (!isFabricReady) return;

    resizeDisplay();
    window.addEventListener('resize', resizeDisplay);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      observer = new ResizeObserver(() => {
        resizeDisplay();
      });
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', resizeDisplay);
      observer?.disconnect();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFabricReady, canvasConfig.size]);

  // Magnetic snap guides (Free layout)
  useSnapGuides({
    fabricCanvasRef,
    canvasConfigRef,
    isFabricReady,
    enabled: snapGuidesEnabled,
  });

  // Undo/Redo History + IndexedDB auto-save
  const historyUpdater = useStudioHistory({
    refs: {
      fabricCanvasRef,
      gridRef,
      canvasConfigRef,
      globalImageConfigRef,
      assetMapRef,
    },
    configHelper,
    isFabricReady,
    resizeDisplay,
    restoreGridFromSnapshot: gridUpdater.restoreGridFromSnapshot,
    registerAssetBlob,
    resolveAssetUrl,
  });

  useEffect(() => {
    commitHistoryRef.current = historyUpdater.commitHistory;
  }, [historyUpdater.commitHistory]);

  return {
    states: {
      isFabricReady,
      isExporting,
      hasImageSelection,
      hasImageSrc,
      selectedCount,
      viewportZoom,
      setViewportZoom,
      editingCellId,
      exitCellFocus,
      selectedCaption,
      hasCaptionSelection,
    },

    canvasUpdater,
    imageUpdater,
    imagesUpdater,
    gridUpdater,
    layersUpdater,
    historyUpdater,
  };
}
