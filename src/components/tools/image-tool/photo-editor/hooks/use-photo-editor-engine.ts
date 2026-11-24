'use client';

import type {
  AlignmentEdge,
  BlendMode,
  BooleanOpKind,
  BrushSettings,
  BrushType,
  ChromeAiActionId,
  ChromeAiPreview,
  ClipShapeKind,
  CropAspectRatio,
  CropRect,
  DepthMapData,
  DocumentConfig,
  ExportOptions,
  ExtendedFabricObject,
  ImageFilterValues,
  LayerOrderAction,
  LayerSummary,
  MaskBrushSettings,
  SamPointPrompt,
  SelectedObjectProps,
  ShapeSettings,
  StarterTemplateId,
  StudioToolId,
  TextCurveKind,
  UserGuide,
} from '../types/studio';
import type { PenAnchor } from '../utils/bezier-pen';
import type { CropHandleKind } from '../utils/crop-overlay';
import type { AssetBlobEntry } from './use-history-stack';

import * as fabric from 'fabric';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useToolsDB } from '@/hooks/tools/use-tools-db';
import { ToolKeys, ToolUrls } from '@/data/tools';
import colorUtils from '@/utils/color-utils';
import toast from '@/utils/toast';

import {
  clearHandoffQueryParam,
  consumeStudioHandoff,
  hasHandoffQueryParam,
  writeStudioHandoff,
} from '../../studio-handoff';
import {
  CUSTOM_SERIALIZATION_PROPS,
  DEFAULT_BRUSH_SETTINGS,
  DEFAULT_DOCUMENT_CONFIG,
  DEFAULT_FILTER_VALUES,
  DEFAULT_MASK_BRUSH_SETTINGS,
  DEFAULT_SHAPE_SETTINGS,
  FABRIC_OBJECT_CONTROLS_STYLE,
  MAX_ZOOM,
  MIN_ZOOM,
  MOBILE_MAX_IMPORT_EDGE,
} from '../constants';
import {
  buildSvgPathFromAnchors,
  disablePathNodeEditing,
  enablePathNodeEditing,
  isPathInNodeEditMode,
  renderPenOverlay,
} from '../utils/bezier-pen';
import {
  applyCropDrag,
  createInitialCropRect,
  hitTestCropHandle,
  renderCropOverlay,
} from '../utils/crop-overlay';
import {
  buildForegroundAlphaFromDepth,
  renderDepthBokehBlob,
} from '../utils/depth-compositor';
import {
  applyClipShapeToObject,
  applyImageFilterValues,
  buildLayerSummaries,
  createStarPoints,
  extractSelectedObjectProps,
  generateUid,
  readImageFilterValues,
  stampLayerMeta,
} from '../utils/fabric-layer-mapper';
import {
  compositeInpaintRoiToBlob,
  extractInpaintRoi,
  runFastPatchInpaintBlob,
} from '../utils/fast-inpaint';
import { exportCanvasToGif } from '../utils/gif-exporter';
import { decodeSpecialImageFile } from '../utils/image-format-decoder';
import {
  applyAlphaMatteToLayerMask,
  commitLayerMaskSnapshot,
  ensureLayerMaskCanvas,
  extractMaskedSubjectToBlob,
  hydrateLayerMasks,
  invertLayerMask,
  paintLayerMaskStroke,
  removeLayerMask,
  syncClippedLayers,
} from '../utils/layer-mask';
import { encodeLutBytesToBase64, parseCubeLut } from '../utils/lut-parser';
import { applyMosaicBrushToImageBlob } from '../utils/mosaic-brush';
import {
  createFaceMosaicLayerBlob,
  detectFacesOnImage,
  detectTextBlocksOnImage,
  runChromeAiCopyAction,
} from '../utils/native-ai';
import { runVectorBooleanOperation } from '../utils/path-boolean';
import { packPesArchive, unpackPesArchive } from '../utils/pes-archive';
import { exportCanvasToPsdBlob, importPsdToCanvas } from '../utils/psd-bridge';
import { buildStarterTemplateOnCanvas } from '../utils/starter-templates';
import {
  applyTextCurvePath,
  convertTextToOutlinePath,
  loadLocalFontFile,
} from '../utils/text-effects';
import useAiWorker from './use-ai-worker';
import useHistoryStack from './use-history-stack';
import useSnapGuides from './use-snap-guides';

type Props = {
  stageRef: React.RefObject<HTMLDivElement | null>;
  canvasElRef: React.RefObject<HTMLCanvasElement | null>;
};

function createCheckerboardPattern(
  ctx: CanvasRenderingContext2D
): CanvasPattern | null {
  const tile = document.createElement('canvas');
  tile.width = 20;
  tile.height = 20;
  const tCtx = tile.getContext('2d');
  if (!tCtx) return null;

  tCtx.fillStyle = '#f3f4f6';
  tCtx.fillRect(0, 0, 20, 20);
  tCtx.fillStyle = '#e5e7eb';
  tCtx.fillRect(0, 0, 10, 10);
  tCtx.fillRect(10, 10, 10, 10);

  return ctx.createPattern(tile, 'repeat');
}

function downloadBlobOrUrl(source: Blob | string, filename: string): void {
  const url = typeof source === 'string' ? source : URL.createObjectURL(source);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (typeof source !== 'string') {
    URL.revokeObjectURL(url);
  }
}

function applyControlsStyleRecursive(obj: fabric.FabricObject): void {
  if (!isPathInNodeEditMode(obj)) {
    obj.set({ ...FABRIC_OBJECT_CONTROLS_STYLE });
  }
  if (obj instanceof fabric.Group) {
    for (const child of obj.getObjects()) {
      applyControlsStyleRecursive(child);
    }
  }
}

function extractImageRgbaForAi(
  img: fabric.FabricImage,
  maxLongEdge = 1280
): { rgba: Uint8ClampedArray; width: number; height: number } | null {
  const el = img.getElement();
  if (!el || el instanceof HTMLVideoElement) return null;

  const natW =
    el instanceof HTMLImageElement ? el.naturalWidth || el.width : el.width;
  const natH =
    el instanceof HTMLImageElement ? el.naturalHeight || el.height : el.height;
  if (!natW || !natH) return null;

  const scale = Math.min(1, maxLongEdge / Math.max(natW, natH));
  const w = Math.max(16, Math.round(natW * scale));
  const h = Math.max(16, Math.round(natH * scale));

  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(el, 0, 0, w, h);
  return {
    rgba: ctx.getImageData(0, 0, w, h).data,
    width: w,
    height: h,
  };
}

function buildMaskTintCanvas(
  alpha: Uint8ClampedArray,
  width: number,
  height: number
): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d');
  if (!ctx) return c;

  const imgData = ctx.createImageData(width, height);
  const px = imgData.data;
  for (let i = 0; i < width * height; i++) {
    if ((alpha[i] ?? 0) > 127) {
      px[i * 4] = 14;
      px[i * 4 + 1] = 165;
      px[i * 4 + 2] = 233;
      px[i * 4 + 3] = 105;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return c;
}

async function downsampleFileIfNeeded(
  file: File,
  maxEdge: number
): Promise<{ file: File; resized: boolean }> {
  if (typeof window === 'undefined' || maxEdge <= 0) {
    return { file, resized: false };
  }
  const url = URL.createObjectURL(file);
  try {
    const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Image load failed'));
      el.src = url;
    });
    const natW = imgEl.naturalWidth || imgEl.width;
    const natH = imgEl.naturalHeight || imgEl.height;
    const longest = Math.max(natW, natH);
    if (longest <= maxEdge) {
      return { file, resized: false };
    }
    const scale = maxEdge / longest;
    const w = Math.max(1, Math.round(natW * scale));
    const h = Math.max(1, Math.round(natH * scale));
    const offscreen = document.createElement('canvas');
    offscreen.width = w;
    offscreen.height = h;
    const oCtx = offscreen.getContext('2d');
    if (!oCtx) return { file, resized: false };
    oCtx.drawImage(imgEl, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) =>
      offscreen.toBlob((b) => resolve(b), 'image/png')
    );
    if (!blob) return { file, resized: false };
    const resizedFile = new File(
      [blob],
      file.name.replace(/\.[^.]+$/, '.png'),
      { type: 'image/png' }
    );
    return { file: resizedFile, resized: true };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function usePhotoEditorEngine({ stageRef, canvasElRef }: Props) {
  const router = useRouter();
  const {
    isSupported: isDbSupported,
    getValue: dbGetValue,
    setValue: dbSetValue,
    deleteValue: dbDeleteValue,
  } = useToolsDB();
  const [canvasVersion, setCanvasVersion] = useState(0);
  const isFabricReady = canvasVersion > 0;
  const [activeTool, setActiveToolState] = useState<StudioToolId>('select');
  const [docConfig, setDocConfig] = useState<DocumentConfig>(
    DEFAULT_DOCUMENT_CONFIG
  );
  const [brushSettings, setBrushSettings] = useState<BrushSettings>(
    DEFAULT_BRUSH_SETTINGS
  );
  const [maskBrushSettings, setMaskBrushSettings] = useState<MaskBrushSettings>(
    DEFAULT_MASK_BRUSH_SETTINGS
  );
  const [shapeSettings, setShapeSettings] = useState<ShapeSettings>(
    DEFAULT_SHAPE_SETTINGS
  );
  const [snapGuidesEnabled, setSnapGuidesEnabled] = useState(true);
  const [rulersVisible, setRulersVisible] = useState(true);
  const [userGuides, setUserGuides] = useState<UserGuide[]>([]);
  const [zoom, setZoomState] = useState(1);
  const [viewportTransform, setViewportTransformState] = useState<number[]>([
    1, 0, 0, 1, 0, 0,
  ]);
  const [stageSize, setStageSize] = useState<{ width: number; height: number }>(
    { width: 0, height: 0 }
  );
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [layers, setLayers] = useState<LayerSummary[]>([]);
  const [selectedProps, setSelectedProps] =
    useState<SelectedObjectProps | null>(null);
  const [filterValues, setFilterValues] = useState<ImageFilterValues>(
    DEFAULT_FILTER_VALUES
  );
  const [activeImageEl, setActiveImageEl] = useState<
    HTMLCanvasElement | HTMLImageElement | null
  >(null);
  const [filterRevision, setFilterRevision] = useState(0);
  const [sampledColor, setSampledColor] = useState('#0ea5e9');
  const [isComparingOriginal, setIsComparingOriginal] = useState(false);
  const [beforeSnapshotUrl, setBeforeSnapshotUrl] = useState<string | null>(
    null
  );
  const [compareSplitPercent, setCompareSplitPercent] = useState(50);
  const [cropAspect, setCropAspectState] = useState<CropAspectRatio>('free');
  const [cropRect, setCropRectState] = useState<CropRect | null>(null);
  const [penAnchorCount, setPenAnchorCount] = useState(0);
  const [customFonts, setCustomFonts] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [samPointsCount, setSamPointsCount] = useState(0);
  const [samHasMask, setSamHasMask] = useState(false);
  const [magicEraserSize, setMagicEraserSize] = useState(28);
  const [magicEraserHasStrokes, setMagicEraserHasStrokes] = useState(false);
  const [mosaicBrushSize, setMosaicBrushSize] = useState(26);
  const [activeDepthMap, setActiveDepthMap] = useState<DepthMapData | null>(
    null
  );
  const [chromeAiPreview, setChromeAiPreview] =
    useState<ChromeAiPreview | null>(null);

  const ai = useAiWorker();
  const aiRef = useRef(ai);
  useEffect(() => {
    aiRef.current = ai;
  }, [ai]);

  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const docConfigRef = useRef<DocumentConfig>(docConfig);
  const brushRef = useRef<BrushSettings>(brushSettings);
  const maskBrushRef = useRef<MaskBrushSettings>(maskBrushSettings);
  const shapeRef = useRef<ShapeSettings>(shapeSettings);
  const userGuidesRef = useRef<UserGuide[]>(userGuides);
  const activeToolRef = useRef<StudioToolId>(activeTool);
  const isPanningRef = useRef(false);
  const isSpacePanRef = useRef(false);
  const lastPanPointRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isExportingRef = useRef(false);
  const checkerPatternRef = useRef<CanvasPattern | null>(null);
  const assetMapRef = useRef<Map<string, AssetBlobEntry>>(new Map());
  const fontBuffersRef = useRef<Map<string, ArrayBuffer>>(new Map());
  const depthMapsByLayerRef = useRef<Map<string, DepthMapData>>(new Map());
  const samTargetImgRef = useRef<fabric.FabricImage | null>(null);
  const samEncodedKeyRef = useRef<string | null>(null);
  const samPointsRef = useRef<SamPointPrompt[]>([]);
  const samRawMaskRef = useRef<{
    alpha: Uint8ClampedArray;
    width: number;
    height: number;
  } | null>(null);
  const samOverlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const magicEraserSizeRef = useRef(magicEraserSize);
  const magicEraserTargetRef = useRef<fabric.FabricImage | null>(null);
  const magicEraserCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastMagicEraserPtRef = useRef<{ x: number; y: number } | null>(null);
  const isPaintingMagicEraserRef = useRef(false);
  const mosaicBrushSizeRef = useRef(mosaicBrushSize);
  const mosaicTargetRef = useRef<fabric.FabricImage | null>(null);
  const mosaicCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastMosaicPtRef = useRef<{ x: number; y: number } | null>(null);
  const isPaintingMosaicRef = useRef(false);
  const replaceImageWithBlobRef = useRef<
    | ((
        targetImg: fabric.FabricImage,
        blob: Blob,
        options?: { scaleFactor?: number }
      ) => Promise<void>)
    | null
  >(null);

  useEffect(() => {
    mosaicBrushSizeRef.current = mosaicBrushSize;
  }, [mosaicBrushSize]);
  const penAnchorsRef = useRef<PenAnchor[]>([]);
  const penHoverPtRef = useRef<{ x: number; y: number } | null>(null);
  const isPenDraggingHandleRef = useRef(false);
  const cropAspectRef = useRef<CropAspectRatio>('free');
  const cropRectRef = useRef<CropRect | null>(null);
  const cropDragRef = useRef<{
    handle: Exclude<CropHandleKind, null>;
    startPt: { x: number; y: number };
    startRect: CropRect;
  } | null>(null);
  const maskPaintTargetRef = useRef<fabric.FabricImage | null>(null);
  const lastMaskPtRef = useRef<{ x: number; y: number } | null>(null);
  const cursorRafRef = useRef<number | null>(null);
  const pendingCursorRef = useRef<{ x: number; y: number } | null>(null);
  const commitHistoryRef = useRef<
    (label: string, mode?: 'immediate' | 'debounced') => void
  >(() => {});

  useEffect(() => {
    docConfigRef.current = docConfig;
  }, [docConfig]);

  useEffect(() => {
    brushRef.current = brushSettings;
  }, [brushSettings]);

  useEffect(() => {
    maskBrushRef.current = maskBrushSettings;
  }, [maskBrushSettings]);

  useEffect(() => {
    shapeRef.current = shapeSettings;
  }, [shapeSettings]);

  useEffect(() => {
    userGuidesRef.current = userGuides;
    fabricCanvasRef.current?.requestRenderAll();
  }, [userGuides]);

  useEffect(() => {
    magicEraserSizeRef.current = magicEraserSize;
  }, [magicEraserSize]);

  const registerAssetBlob = useCallback((assetId: string, blob: Blob) => {
    const existing = assetMapRef.current.get(assetId);
    if (existing) return existing.url;
    const url = window.URL.createObjectURL(blob);
    assetMapRef.current.set(assetId, { blob, url });
    return url;
  }, []);

  const registerAssetFile = useCallback(
    (file: File) => {
      const assetId = generateUid('asset');
      const url = registerAssetBlob(assetId, file);
      return { assetId, url };
    },
    [registerAssetBlob]
  );

  const resolveAssetUrl = useCallback(
    (assetId: string, fallbackSrc: string): string => {
      const entry = assetMapRef.current.get(assetId);
      return entry?.url || fallbackSrc;
    },
    []
  );

  const syncCanvasUi = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    for (const obj of canvas.getObjects()) {
      if (obj !== activeObj && isPathInNodeEditMode(obj)) {
        disablePathNodeEditing(obj as fabric.Path);
      }
    }

    setLayers(buildLayerSummaries(canvas));
    setSelectedProps(extractSelectedObjectProps(canvas));

    if (activeObj instanceof fabric.FabricImage) {
      setFilterValues(readImageFilterValues(activeObj));
      const el = activeObj.getElement();
      setActiveImageEl(el instanceof HTMLVideoElement ? null : (el ?? null));
      const layerId = (activeObj as ExtendedFabricObject)._layerId ?? '';
      setActiveDepthMap(depthMapsByLayerRef.current.get(layerId) ?? null);
    } else {
      setFilterValues(DEFAULT_FILTER_VALUES);
      setActiveImageEl(null);
      setActiveDepthMap(null);
    }
  }, []);

  const exitCompareIfNeeded = useCallback(() => {
    setBeforeSnapshotUrl((prev) => {
      if (prev) setIsComparingOriginal(false);
      return null;
    });
  }, []);

  const applyZoomToViewport = useCallback(
    (nextZoom: number, centerPoint?: fabric.Point) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      exitCompareIfNeeded();
      const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextZoom));
      const point =
        centerPoint ??
        new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);

      canvas.zoomToPoint(point, clamped);
      canvas.requestRenderAll();
      setZoomState(clamped);
      setViewportTransformState([
        ...(canvas.viewportTransform || [1, 0, 0, 1, 0, 0]),
      ]);
    },
    [exitCompareIfNeeded]
  );

  const fitToScreen = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const vw = canvas.getWidth();
    const vh = canvas.getHeight();
    if (vw <= 20 || vh <= 20) return;

    exitCompareIfNeeded();
    const { width: dw, height: dh } = docConfigRef.current;
    const padding = 64;
    const scale = Math.max(
      MIN_ZOOM,
      Math.min((vw - padding) / dw, (vh - padding) / dh, 1.5)
    );

    const tx = (vw - dw * scale) / 2;
    const ty = (vh - dh * scale) / 2;

    const nextVpt = [scale, 0, 0, scale, tx, ty] as fabric.TMat2D;
    canvas.setViewportTransform(nextVpt);
    canvas.requestRenderAll();
    setZoomState(scale);
    setViewportTransformState([...nextVpt]);
  }, [exitCompareIfNeeded]);

  const syncBrushToCanvas = useCallback(
    (toolId: StudioToolId, settings: BrushSettings) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const isDrawing = toolId === 'brush' || toolId === 'eraser';
      canvas.isDrawingMode = isDrawing;
      if (!isDrawing) return;

      let brush: fabric.BaseBrush;
      if (toolId === 'eraser') {
        brush = new fabric.PencilBrush(canvas);
        brush.color = '#ffffff';
        brush.width = settings.size;
      } else {
        const brushFactoryMap: Record<BrushType, () => fabric.BaseBrush> = {
          pencil: () => new fabric.PencilBrush(canvas),
          spray: () => new fabric.SprayBrush(canvas),
          circle: () => new fabric.CircleBrush(canvas),
        };
        brush = brushFactoryMap[settings.type]();
        const rgba = colorUtils.hexToRgba(settings.color);
        brush.color = colorUtils.rgbaToHex({ ...rgba, a: settings.opacity });
        brush.width = settings.size;
        if (settings.shadowBlur > 0) {
          brush.shadow = new fabric.Shadow({
            blur: settings.shadowBlur,
            color: brush.color,
            offsetX: 0,
            offsetY: 0,
          });
        }
      }

      canvas.freeDrawingBrush = brush;
    },
    []
  );

  const setActiveTool = useCallback(
    (tool: StudioToolId) => {
      if (activeToolRef.current === 'pen' && tool !== 'pen') {
        penAnchorsRef.current = [];
        penHoverPtRef.current = null;
        isPenDraggingHandleRef.current = false;
        setPenAnchorCount(0);
      }
      if (activeToolRef.current === 'crop' && tool !== 'crop') {
        cropRectRef.current = null;
        cropDragRef.current = null;
        setCropRectState(null);
      }
      if (activeToolRef.current === 'magic-select' && tool !== 'magic-select') {
        samPointsRef.current = [];
        samRawMaskRef.current = null;
        samOverlayCanvasRef.current = null;
        setSamPointsCount(0);
        setSamHasMask(false);
        aiRef.current.notifySamToolActive(false);
      }
      if (activeToolRef.current === 'magic-eraser' && tool !== 'magic-eraser') {
        magicEraserCanvasRef.current = null;
        magicEraserTargetRef.current = null;
        isPaintingMagicEraserRef.current = false;
        setMagicEraserHasStrokes(false);
      }
      if (activeToolRef.current === 'mosaic' && tool !== 'mosaic') {
        mosaicCanvasRef.current = null;
        mosaicTargetRef.current = null;
        isPaintingMosaicRef.current = false;
        lastMosaicPtRef.current = null;
      }

      activeToolRef.current = tool;
      setActiveToolState(tool);
      if (tool === 'magic-select') {
        aiRef.current.notifySamToolActive(true);
      }

      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      syncBrushToCanvas(tool, brushRef.current);

      const isInteractiveSelect = tool === 'select';
      canvas.selection = isInteractiveSelect;
      canvas.skipTargetFind = !isInteractiveSelect;

      const cursorMap: Record<StudioToolId, string> = {
        select: 'default',
        hand: 'grab',
        crop: 'crosshair',
        brush: 'crosshair',
        eraser: 'cell',
        mask: 'crosshair',
        mosaic: 'crosshair',
        pen: 'crosshair',
        text: 'text',
        shape: 'crosshair',
        eyedropper: 'copy',
        'magic-select': 'crosshair',
        'magic-eraser': 'crosshair',
      };
      canvas.defaultCursor = cursorMap[tool];
      canvas.setCursor(cursorMap[tool]);

      if (tool === 'crop') {
        const nextCrop = createInitialCropRect(
          docConfigRef.current.width,
          docConfigRef.current.height,
          cropAspectRef.current
        );
        cropRectRef.current = nextCrop;
        setCropRectState(nextCrop);
        canvas.discardActiveObject();
      } else if (
        !isInteractiveSelect &&
        tool !== 'mask' &&
        tool !== 'mosaic' &&
        tool !== 'magic-select' &&
        tool !== 'magic-eraser'
      ) {
        canvas.discardActiveObject();
      }

      canvas.requestRenderAll();
    },
    [syncBrushToCanvas]
  );

  const finishPenPath = useCallback(
    (closed: boolean) => {
      const canvas = fabricCanvasRef.current;
      const anchors = penAnchorsRef.current;
      if (!canvas || anchors.length < 2) {
        penAnchorsRef.current = [];
        penHoverPtRef.current = null;
        setPenAnchorCount(0);
        canvas?.requestRenderAll();
        return;
      }

      const d = buildSvgPathFromAnchors(anchors, closed);
      penAnchorsRef.current = [];
      penHoverPtRef.current = null;
      isPenDraggingHandleRef.current = false;
      setPenAnchorCount(0);

      const pathObj = new fabric.Path(d, {
        fill: closed ? shapeRef.current.fill : '',
        stroke: shapeRef.current.stroke || '#0ea5e9',
        strokeWidth: closed ? shapeRef.current.strokeWidth || 2 : 3,
        ...FABRIC_OBJECT_CONTROLS_STYLE,
      });
      stampLayerMeta(pathObj, {
        kind: 'shape',
        name: closed ? 'Pen Shape' : 'Bezier Path',
      });
      canvas.add(pathObj);
      canvas.setActiveObject(pathObj);
      setActiveTool('select');
      canvas.requestRenderAll();
      syncCanvasUi();
      commitHistoryRef.current(
        closed ? 'Create Pen Shape' : 'Create Bezier Path',
        'immediate'
      );
    },
    [setActiveTool, syncCanvasUi]
  );

  const finishPenPathRef = useRef(finishPenPath);
  useEffect(() => {
    finishPenPathRef.current = finishPenPath;
  }, [finishPenPath]);

  const updateBrushSettings = useCallback(
    (patch: Partial<BrushSettings>) => {
      setBrushSettings((prev) => {
        const next = { ...prev, ...patch };
        brushRef.current = next;
        syncBrushToCanvas(activeToolRef.current, next);
        return next;
      });
    },
    [syncBrushToCanvas]
  );

  const updateMaskBrushSettings = useCallback(
    (patch: Partial<MaskBrushSettings>) => {
      setMaskBrushSettings((prev) => {
        const next = { ...prev, ...patch };
        maskBrushRef.current = next;
        return next;
      });
    },
    []
  );

  const updateShapeSettings = useCallback((patch: Partial<ShapeSettings>) => {
    setShapeSettings((prev) => {
      const next = { ...prev, ...patch };
      shapeRef.current = next;
      return next;
    });
  }, []);

  // Initialize Fabric canvas, ResizeObserver, Artboard Renderer, Viewport Pan/Zoom
  useEffect(() => {
    const canvasEl = canvasElRef.current;
    const stageEl = stageRef.current;
    if (!canvasEl || !stageEl) return;

    fabric.config.textureSize = 4096;

    const initialW = Math.max(stageEl.clientWidth, 400);
    const initialH = Math.max(stageEl.clientHeight, 320);

    const canvas = new fabric.Canvas(canvasEl, {
      width: initialW,
      height: initialH,
      preserveObjectStacking: true,
      selection: true,
      selectionColor: 'rgba(14, 165, 233, 0.14)',
      selectionBorderColor: '#0ea5e9',
      selectionLineWidth: 1.5,
      enableRetinaScaling: true,
    });
    fabricCanvasRef.current = canvas;

    // Draw artboard background / transparency checkerboard BEHIND objects, and subtle artboard outline on top.
    // Fabric v7 renderTop() also emits 'after:render' with contextTop (upperCanvasEl); guard strictly to lowerCanvasEl
    // so the artboard backdrop stays at the very bottom layer instead of painting over all layers on deselection.
    canvas.on('after:render', (opt) => {
      const ctx = opt.ctx;
      if (!ctx || ctx !== canvas.getContext()) return;

      const v = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
      const {
        width: dw,
        height: dh,
        backgroundType,
        backgroundColor,
        backgroundOpacity,
      } = docConfigRef.current;

      // 1) Draw background inside artboard rect BEHIND objects using destination-over
      if (!isExportingRef.current) {
        ctx.save();
        ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
        ctx.globalCompositeOperation = 'destination-over';

        if (backgroundType === 'color' && backgroundOpacity > 0) {
          const rgba = colorUtils.hexToRgba(backgroundColor);
          ctx.fillStyle = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${backgroundOpacity})`;
          ctx.fillRect(0, 0, dw, dh);
        }

        if (backgroundType === 'transparent' || backgroundOpacity < 1) {
          if (!checkerPatternRef.current) {
            checkerPatternRef.current = createCheckerboardPattern(ctx);
          }
          ctx.fillStyle = checkerPatternRef.current ?? '#f3f4f6';
          ctx.fillRect(0, 0, dw, dh);
        }
        ctx.restore();

        // 2) Draw subtle artboard boundary outline on top
        ctx.save();
        ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
        ctx.lineWidth = 1 / (v[0] || 1);
        ctx.strokeRect(0, 0, dw, dh);
        ctx.restore();

        // 3) User-created cyan ruler guide lines
        if (userGuidesRef.current.length > 0) {
          const invZoom = 1 / (v[0] || 1);
          ctx.save();
          ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)';
          ctx.lineWidth = 1.2 * invZoom;
          ctx.setLineDash([5 * invZoom, 4 * invZoom]);
          for (const guide of userGuidesRef.current) {
            ctx.beginPath();
            if (guide.orientation === 'v') {
              ctx.moveTo(guide.position, -4000);
              ctx.lineTo(guide.position, dh + 4000);
            } else {
              ctx.moveTo(-4000, guide.position);
              ctx.lineTo(dw + 4000, guide.position);
            }
            ctx.stroke();
          }
          ctx.restore();
        }

        // 4) Interactive Pen & Crop tool overlays
        if (activeToolRef.current === 'pen') {
          renderPenOverlay(
            ctx,
            canvas,
            penAnchorsRef.current,
            penHoverPtRef.current
          );
        }
        if (activeToolRef.current === 'crop' && cropRectRef.current) {
          renderCropOverlay(
            ctx,
            canvas,
            cropRectRef.current,
            docConfigRef.current
          );
        }

        // 5) AI Magic Select (SAM) & Magic Eraser interactive overlays
        if (
          activeToolRef.current === 'magic-select' &&
          samTargetImgRef.current
        ) {
          const target = samTargetImgRef.current;
          const objW = target.width || 1;
          const objH = target.height || 1;
          const mat = fabric.util.multiplyTransformMatrices(
            v,
            target.calcTransformMatrix()
          );

          if (samOverlayCanvasRef.current) {
            ctx.save();
            ctx.transform(mat[0], mat[1], mat[2], mat[3], mat[4], mat[5]);
            ctx.drawImage(
              samOverlayCanvasRef.current,
              -objW / 2,
              -objH / 2,
              objW,
              objH
            );
            ctx.restore();
          }

          for (const p of samPointsRef.current) {
            const localX = (p.x - 0.5) * objW;
            const localY = (p.y - 0.5) * objH;
            const screenPt = new fabric.Point(localX, localY).transform(mat);
            ctx.save();
            ctx.fillStyle = p.label === 1 ? '#10b981' : '#f43f5e';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screenPt.x, screenPt.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
        }

        if (
          activeToolRef.current === 'magic-eraser' &&
          magicEraserTargetRef.current &&
          magicEraserCanvasRef.current
        ) {
          const target = magicEraserTargetRef.current;
          const objW = target.width || 1;
          const objH = target.height || 1;
          const mat = fabric.util.multiplyTransformMatrices(
            v,
            target.calcTransformMatrix()
          );
          ctx.save();
          ctx.globalAlpha = 0.55;
          ctx.transform(mat[0], mat[1], mat[2], mat[3], mat[4], mat[5]);
          ctx.drawImage(
            magicEraserCanvasRef.current,
            -objW / 2,
            -objH / 2,
            objW,
            objH
          );
          ctx.restore();
        }

        if (
          activeToolRef.current === 'mosaic' &&
          mosaicTargetRef.current &&
          mosaicCanvasRef.current
        ) {
          const target = mosaicTargetRef.current;
          const objW = target.width || 1;
          const objH = target.height || 1;
          const mat = fabric.util.multiplyTransformMatrices(
            v,
            target.calcTransformMatrix()
          );
          ctx.save();
          ctx.globalAlpha = 0.5;
          ctx.transform(mat[0], mat[1], mat[2], mat[3], mat[4], mat[5]);
          ctx.drawImage(
            mosaicCanvasRef.current,
            -objW / 2,
            -objH / 2,
            objW,
            objH
          );
          ctx.restore();
        }

        // 5) AI Magic Select (SAM) & Magic Eraser interactive overlays
        if (
          activeToolRef.current === 'magic-select' &&
          samTargetImgRef.current
        ) {
          const target = samTargetImgRef.current;
          const objW = target.width || 1;
          const objH = target.height || 1;
          const mat = fabric.util.multiplyTransformMatrices(
            v,
            target.calcTransformMatrix()
          );

          if (samOverlayCanvasRef.current) {
            ctx.save();
            ctx.transform(mat[0], mat[1], mat[2], mat[3], mat[4], mat[5]);
            ctx.drawImage(
              samOverlayCanvasRef.current,
              -objW / 2,
              -objH / 2,
              objW,
              objH
            );
            ctx.restore();
          }

          for (const p of samPointsRef.current) {
            const localX = (p.x - 0.5) * objW;
            const localY = (p.y - 0.5) * objH;
            const screenPt = new fabric.Point(localX, localY).transform(mat);
            ctx.save();
            ctx.fillStyle = p.label === 1 ? '#10b981' : '#f43f5e';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screenPt.x, screenPt.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
        }

        if (
          activeToolRef.current === 'magic-eraser' &&
          magicEraserTargetRef.current &&
          magicEraserCanvasRef.current
        ) {
          const target = magicEraserTargetRef.current;
          const objW = target.width || 1;
          const objH = target.height || 1;
          const mat = fabric.util.multiplyTransformMatrices(
            v,
            target.calcTransformMatrix()
          );
          ctx.save();
          ctx.globalAlpha = 0.55;
          ctx.transform(mat[0], mat[1], mat[2], mat[3], mat[4], mat[5]);
          ctx.drawImage(
            magicEraserCanvasRef.current,
            -objW / 2,
            -objH / 2,
            objW,
            objH
          );
          ctx.restore();
        }

        if (
          activeToolRef.current === 'mosaic' &&
          mosaicTargetRef.current &&
          mosaicCanvasRef.current
        ) {
          const target = mosaicTargetRef.current;
          const objW = target.width || 1;
          const objH = target.height || 1;
          const mat = fabric.util.multiplyTransformMatrices(
            v,
            target.calcTransformMatrix()
          );
          ctx.save();
          ctx.globalAlpha = 0.5;
          ctx.transform(mat[0], mat[1], mat[2], mat[3], mat[4], mat[5]);
          ctx.drawImage(
            mosaicCanvasRef.current,
            -objW / 2,
            -objH / 2,
            objW,
            objH
          );
          ctx.restore();
        }
      }
    });

    // Stamp metadata & handle Eraser destination-out strokes on free drawing
    canvas.on('path:created', (opt) => {
      const pathObj = opt.path as ExtendedFabricObject | undefined;
      if (!pathObj) return;

      const isEraser = activeToolRef.current === 'eraser';
      if (isEraser) {
        pathObj._isEraser = true;
        pathObj.set({
          globalCompositeOperation: 'destination-out',
          selectable: false,
          evented: false,
          _layerName: 'Eraser Stroke',
        });
      } else {
        pathObj.set({
          ...FABRIC_OBJECT_CONTROLS_STYLE,
        });
        stampLayerMeta(pathObj, {
          kind: 'brush',
          name: `${brushRef.current.type === 'spray' ? 'Spray' : 'Brush'} Stroke`,
        });
      }

      canvas.requestRenderAll();
      syncCanvasUi();
      commitHistoryRef.current(
        isEraser ? 'Eraser Stroke' : 'Brush Stroke',
        'immediate'
      );
    });

    // Interactive selection & object modification events
    const handleSelectionEvent = () => {
      const active = canvas.getActiveObject();
      if (active && !isPathInNodeEditMode(active)) {
        active.set({ ...FABRIC_OBJECT_CONTROLS_STYLE });
      }
      syncCanvasUi();
    };

    canvas.on('selection:created', handleSelectionEvent);
    canvas.on('selection:updated', handleSelectionEvent);
    canvas.on('selection:cleared', syncCanvasUi);
    canvas.on('object:added', (opt) => {
      if (opt.target) {
        applyControlsStyleRecursive(opt.target);
      }
      syncCanvasUi();
    });
    canvas.on('object:removed', syncCanvasUi);
    canvas.on('object:modified', () => {
      void syncClippedLayers(canvas).then(() => {
        canvas.requestRenderAll();
      });
      syncCanvasUi();
      commitHistoryRef.current('Transform Layer', 'immediate');
    });
    canvas.on('text:changed', () => {
      syncCanvasUi();
    });

    // Mouse wheel zoom centered at pointer
    canvas.on('mouse:wheel', (opt) => {
      const e = opt.e;
      e.preventDefault();
      e.stopPropagation();

      exitCompareIfNeeded();
      const factor = 0.9985 ** e.deltaY;
      const currentZoom = canvas.getZoom();
      const targetZoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, currentZoom * factor)
      );
      const point = canvas.getViewportPoint(e);
      canvas.zoomToPoint(point, targetZoom);
      canvas.requestRenderAll();
      setZoomState(targetZoom);
      setViewportTransformState([
        ...(canvas.viewportTransform || [1, 0, 0, 1, 0, 0]),
      ]);
    });

    // Pan, Crop, Pen, Mask Brush, Text placement, Shape creation, and Eyedropper click
    canvas.on('mouse:down', (opt) => {
      const pointerEvent = opt.e as MouseEvent;

      if (
        activeToolRef.current === 'hand' ||
        isSpacePanRef.current ||
        pointerEvent.button === 1
      ) {
        exitCompareIfNeeded();
        isPanningRef.current = true;
        lastPanPointRef.current = {
          x: pointerEvent.clientX,
          y: pointerEvent.clientY,
        };
        canvas.setCursor('grabbing');
        return;
      }

      const scenePt = canvas.getScenePoint(pointerEvent);

      if (activeToolRef.current === 'crop' && cropRectRef.current) {
        const handle = hitTestCropHandle(
          scenePt,
          cropRectRef.current,
          canvas.getZoom()
        );
        if (handle) {
          cropDragRef.current = {
            handle,
            startPt: { x: scenePt.x, y: scenePt.y },
            startRect: { ...cropRectRef.current },
          };
        }
        return;
      }

      if (activeToolRef.current === 'pen') {
        const anchors = penAnchorsRef.current;
        const closeThreshold = 10 / Math.max(0.1, canvas.getZoom());
        if (
          anchors.length >= 3 &&
          Math.hypot(scenePt.x - anchors[0].x, scenePt.y - anchors[0].y) <=
            closeThreshold
        ) {
          finishPenPathRef.current(true);
          return;
        }

        const nextAnchor: PenAnchor = {
          x: scenePt.x,
          y: scenePt.y,
          handleIn: { x: scenePt.x, y: scenePt.y },
          handleOut: { x: scenePt.x, y: scenePt.y },
        };
        penAnchorsRef.current = [...anchors, nextAnchor];
        setPenAnchorCount(penAnchorsRef.current.length);
        isPenDraggingHandleRef.current = true;
        canvas.requestRenderAll();
        return;
      }

      if (activeToolRef.current === 'magic-select') {
        const active = canvas.getActiveObject();
        const imgTarget =
          active instanceof fabric.FabricImage
            ? active
            : canvas
                .getObjects()
                .slice()
                .reverse()
                .find(
                  (o): o is fabric.FabricImage =>
                    o instanceof fabric.FabricImage
                );

        if (!imgTarget) {
          toast.info('Import an image layer first to use AI Magic Select.');
          return;
        }
        if (canvas.getActiveObject() !== imgTarget) {
          canvas.setActiveObject(imgTarget);
        }

        const inv = fabric.util.invertTransform(
          imgTarget.calcTransformMatrix()
        );
        const local = new fabric.Point(scenePt.x, scenePt.y).transform(inv);
        const w = imgTarget.width || 1;
        const h = imgTarget.height || 1;
        const normX = (local.x + w / 2) / w;
        const normY = (local.y + h / 2) / h;
        if (normX < 0 || normX > 1 || normY < 0 || normY > 1) return;

        const targetKey = `${(imgTarget as ExtendedFabricObject)._layerId || ''}_${imgTarget.getSrc?.() || ''}`;
        if (samTargetImgRef.current !== imgTarget) {
          samPointsRef.current = [];
          samRawMaskRef.current = null;
          samOverlayCanvasRef.current = null;
        }
        samTargetImgRef.current = imgTarget;

        const nextPrompt: SamPointPrompt = {
          x: normX,
          y: normY,
          label: pointerEvent.shiftKey ? 0 : 1,
        };
        const nextPoints = [...samPointsRef.current, nextPrompt];
        samPointsRef.current = nextPoints;
        setSamPointsCount(nextPoints.length);
        canvas.requestRenderAll();

        void (async () => {
          try {
            if (samEncodedKeyRef.current !== targetKey) {
              const extracted = extractImageRgbaForAi(imgTarget, 1024);
              if (!extracted) return;
              const ok = await aiRef.current.encodeSamImage(
                extracted.rgba,
                extracted.width,
                extracted.height,
                targetKey
              );
              if (!ok) {
                samPointsRef.current = [];
                setSamPointsCount(0);
                canvas.requestRenderAll();
                return;
              }
              samEncodedKeyRef.current = targetKey;
            }
            const maskRes = await aiRef.current.decodeSamPoints(nextPoints);
            if (!maskRes) return;
            samRawMaskRef.current = maskRes;
            samOverlayCanvasRef.current = buildMaskTintCanvas(
              maskRes.alpha,
              maskRes.width,
              maskRes.height
            );
            setSamHasMask(true);
            canvas.requestRenderAll();
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : 'Magic Select failed.'
            );
          }
        })();
        return;
      }

      if (activeToolRef.current === 'magic-eraser') {
        const active = canvas.getActiveObject();
        const imgTarget =
          active instanceof fabric.FabricImage
            ? active
            : canvas
                .getObjects()
                .slice()
                .reverse()
                .find(
                  (o): o is fabric.FabricImage =>
                    o instanceof fabric.FabricImage
                );

        if (!imgTarget) {
          toast.info('Import an image layer first to use Magic Eraser.');
          return;
        }
        if (canvas.getActiveObject() !== imgTarget) {
          canvas.setActiveObject(imgTarget);
        }

        const natW = Math.max(1, Math.round(imgTarget.width || 1));
        const natH = Math.max(1, Math.round(imgTarget.height || 1));
        if (
          magicEraserTargetRef.current !== imgTarget ||
          !magicEraserCanvasRef.current ||
          magicEraserCanvasRef.current.width !== natW ||
          magicEraserCanvasRef.current.height !== natH
        ) {
          const mc = document.createElement('canvas');
          mc.width = natW;
          mc.height = natH;
          magicEraserCanvasRef.current = mc;
          magicEraserTargetRef.current = imgTarget;
        }

        isPaintingMagicEraserRef.current = true;
        lastMagicEraserPtRef.current = { x: scenePt.x, y: scenePt.y };

        const paintStroke = (
          from: { x: number; y: number },
          to: { x: number; y: number }
        ) => {
          const mc = magicEraserCanvasRef.current;
          if (!mc) return;
          const mCtx = mc.getContext('2d');
          if (!mCtx) return;

          const inv = fabric.util.invertTransform(
            imgTarget.calcTransformMatrix()
          );
          const p0 = new fabric.Point(from.x, from.y).transform(inv);
          const p1 = new fabric.Point(to.x, to.y).transform(inv);
          const avgScale =
            (Math.abs(imgTarget.scaleX || 1) +
              Math.abs(imgTarget.scaleY || 1)) *
              0.5 || 1;
          mCtx.save();
          mCtx.strokeStyle = '#f43f5e';
          mCtx.lineWidth = Math.max(4, magicEraserSizeRef.current / avgScale);
          mCtx.lineCap = 'round';
          mCtx.lineJoin = 'round';
          mCtx.beginPath();
          mCtx.moveTo(p0.x + natW / 2, p0.y + natH / 2);
          mCtx.lineTo(p1.x + natW / 2, p1.y + natH / 2);
          mCtx.stroke();
          mCtx.restore();
        };

        paintStroke(scenePt, scenePt);
        setMagicEraserHasStrokes(true);
        canvas.requestRenderAll();
        return;
      }

      if (activeToolRef.current === 'mosaic') {
        const active = canvas.getActiveObject();
        const imgTarget =
          active instanceof fabric.FabricImage
            ? active
            : canvas
                .getObjects()
                .slice()
                .reverse()
                .find(
                  (o): o is fabric.FabricImage =>
                    o instanceof fabric.FabricImage
                );

        if (!imgTarget) {
          toast.info('Import an image layer first to paint Mosaic.');
          return;
        }
        if (canvas.getActiveObject() !== imgTarget) {
          canvas.setActiveObject(imgTarget);
        }

        const natW = Math.max(1, Math.round(imgTarget.width || 1));
        const natH = Math.max(1, Math.round(imgTarget.height || 1));
        const mc = document.createElement('canvas');
        mc.width = natW;
        mc.height = natH;
        mosaicCanvasRef.current = mc;
        mosaicTargetRef.current = imgTarget;
        isPaintingMosaicRef.current = true;
        lastMosaicPtRef.current = { x: scenePt.x, y: scenePt.y };

        const mCtx = mc.getContext('2d');
        if (mCtx) {
          const inv = fabric.util.invertTransform(
            imgTarget.calcTransformMatrix()
          );
          const p0 = new fabric.Point(scenePt.x, scenePt.y).transform(inv);
          const avgScale =
            (Math.abs(imgTarget.scaleX || 1) +
              Math.abs(imgTarget.scaleY || 1)) *
              0.5 || 1;
          mCtx.save();
          mCtx.strokeStyle = '#0ea5e9';
          mCtx.lineWidth = Math.max(6, mosaicBrushSizeRef.current / avgScale);
          mCtx.lineCap = 'round';
          mCtx.lineJoin = 'round';
          mCtx.beginPath();
          mCtx.moveTo(p0.x + natW / 2, p0.y + natH / 2);
          mCtx.lineTo(p0.x + natW / 2 + 0.01, p0.y + natH / 2 + 0.01);
          mCtx.stroke();
          mCtx.restore();
        }
        canvas.requestRenderAll();
        return;
      }

      if (activeToolRef.current === 'mask') {
        const active = canvas.getActiveObject();
        const imgTarget =
          active instanceof fabric.FabricImage
            ? active
            : canvas
                .getObjects()
                .slice()
                .reverse()
                .find(
                  (o): o is fabric.FabricImage =>
                    o instanceof fabric.FabricImage
                );

        if (!imgTarget) {
          toast.info('Import and select an image layer to paint a Layer Mask.');
          return;
        }

        if (canvas.getActiveObject() !== imgTarget) {
          canvas.setActiveObject(imgTarget);
        }
        void ensureLayerMaskCanvas(imgTarget).then(() => {
          maskPaintTargetRef.current = imgTarget;
          lastMaskPtRef.current = { x: scenePt.x, y: scenePt.y };
          paintLayerMaskStroke(
            imgTarget,
            scenePt,
            scenePt,
            maskBrushRef.current
          );
          canvas.requestRenderAll();
        });
        return;
      }

      if (activeToolRef.current === 'eyedropper') {
        const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        const retina = canvas.getRetinaScaling();
        const px = Math.round((scenePt.x * vpt[0] + vpt[4]) * retina);
        const py = Math.round((scenePt.y * vpt[3] + vpt[5]) * retina);
        const lowerCtx = canvas.lowerCanvasEl.getContext('2d');
        if (lowerCtx) {
          const safeX = Math.max(
            0,
            Math.min(canvas.lowerCanvasEl.width - 1, px)
          );
          const safeY = Math.max(
            0,
            Math.min(canvas.lowerCanvasEl.height - 1, py)
          );
          const pixel = lowerCtx.getImageData(safeX, safeY, 1, 1).data;
          const hex = colorUtils.rgbaToHex({
            r: pixel[0],
            g: pixel[1],
            b: pixel[2],
            a: 1,
          });
          setSampledColor(hex);
          setBrushSettings((prev) => {
            const next = { ...prev, color: hex };
            brushRef.current = next;
            return next;
          });
          void navigator.clipboard?.writeText?.(hex);
          toast.success(`Picked color ${hex}`);
        }
        return;
      }

      if (activeToolRef.current === 'text') {
        const textbox = new fabric.Textbox('Double-click to edit', {
          left: scenePt.x,
          top: scenePt.y,
          originX: 'center',
          originY: 'center',
          width: 320,
          fontSize: 44,
          fontFamily: 'Inter, system-ui, sans-serif',
          fill: '#0f172a',
          ...FABRIC_OBJECT_CONTROLS_STYLE,
        });
        stampLayerMeta(textbox, { kind: 'text', name: 'Text Layer' });
        canvas.add(textbox);
        canvas.setActiveObject(textbox);
        setActiveTool('select');
        textbox.enterEditing();
        textbox.selectAll();
        canvas.requestRenderAll();
        syncCanvasUi();
        commitHistoryRef.current('Add Text', 'immediate');
        return;
      }

      if (activeToolRef.current === 'shape') {
        const cfg = shapeRef.current;
        const size = Math.max(
          80,
          Math.round(
            Math.min(docConfigRef.current.width, docConfigRef.current.height) *
              0.18
          )
        );
        let shapeObj: fabric.FabricObject;

        if (cfg.kind === 'circle') {
          shapeObj = new fabric.Circle({
            left: scenePt.x,
            top: scenePt.y,
            originX: 'center',
            originY: 'center',
            radius: size / 2,
            fill: cfg.fill,
            stroke: cfg.stroke,
            strokeWidth: cfg.strokeWidth,
            ...FABRIC_OBJECT_CONTROLS_STYLE,
          });
        } else if (cfg.kind === 'triangle') {
          shapeObj = new fabric.Triangle({
            left: scenePt.x,
            top: scenePt.y,
            originX: 'center',
            originY: 'center',
            width: size,
            height: size,
            fill: cfg.fill,
            stroke: cfg.stroke,
            strokeWidth: cfg.strokeWidth,
            ...FABRIC_OBJECT_CONTROLS_STYLE,
          });
        } else if (cfg.kind === 'line') {
          shapeObj = new fabric.Line([-size / 2, 0, size / 2, 0], {
            left: scenePt.x,
            top: scenePt.y,
            originX: 'center',
            originY: 'center',
            stroke: cfg.fill,
            strokeWidth: Math.max(4, cfg.strokeWidth || 6),
            ...FABRIC_OBJECT_CONTROLS_STYLE,
          });
        } else if (cfg.kind === 'star') {
          shapeObj = new fabric.Polygon(
            createStarPoints(size / 2, size * 0.22, 5),
            {
              left: scenePt.x,
              top: scenePt.y,
              originX: 'center',
              originY: 'center',
              fill: cfg.fill,
              stroke: cfg.stroke,
              strokeWidth: cfg.strokeWidth,
              ...FABRIC_OBJECT_CONTROLS_STYLE,
            }
          );
        } else {
          shapeObj = new fabric.Rect({
            left: scenePt.x,
            top: scenePt.y,
            originX: 'center',
            originY: 'center',
            width: size,
            height: size,
            rx: cfg.cornerRadius,
            ry: cfg.cornerRadius,
            fill: cfg.fill,
            stroke: cfg.stroke,
            strokeWidth: cfg.strokeWidth,
            ...FABRIC_OBJECT_CONTROLS_STYLE,
          });
        }

        const shapeLabel = cfg.kind.charAt(0).toUpperCase() + cfg.kind.slice(1);
        stampLayerMeta(shapeObj, {
          kind: 'shape',
          name: `${shapeLabel} Shape`,
        });
        canvas.add(shapeObj);
        canvas.setActiveObject(shapeObj);
        setActiveTool('select');
        canvas.requestRenderAll();
        syncCanvasUi();
        commitHistoryRef.current(`Add ${shapeLabel}`, 'immediate');
      }
    });

    canvas.on('mouse:dblclick', () => {
      if (
        activeToolRef.current === 'pen' &&
        penAnchorsRef.current.length >= 2
      ) {
        finishPenPathRef.current(false);
      }
    });

    canvas.on('mouse:move', (opt) => {
      const pointerEvent = opt.e as MouseEvent;
      if (isPanningRef.current) {
        const dx = pointerEvent.clientX - lastPanPointRef.current.x;
        const dy = pointerEvent.clientY - lastPanPointRef.current.y;
        lastPanPointRef.current = {
          x: pointerEvent.clientX,
          y: pointerEvent.clientY,
        };
        const vpt = canvas.viewportTransform;
        if (vpt) {
          vpt[4] += dx;
          vpt[5] += dy;
          canvas.setViewportTransform(vpt);
          canvas.requestRenderAll();
          setViewportTransformState([...vpt]);
        }
        return;
      }

      const scenePt = canvas.getScenePoint(pointerEvent);

      if (activeToolRef.current === 'crop' && cropDragRef.current) {
        const drag = cropDragRef.current;
        const next = applyCropDrag(
          drag.startRect,
          drag.handle,
          scenePt.x - drag.startPt.x,
          scenePt.y - drag.startPt.y,
          cropAspectRef.current
        );
        cropRectRef.current = next;
        canvas.requestRenderAll();
        return;
      }

      if (activeToolRef.current === 'pen') {
        if (
          isPenDraggingHandleRef.current &&
          penAnchorsRef.current.length > 0
        ) {
          const anchors = [...penAnchorsRef.current];
          const last = { ...anchors[anchors.length - 1] };
          last.handleOut = { x: scenePt.x, y: scenePt.y };
          last.handleIn = {
            x: 2 * last.x - scenePt.x,
            y: 2 * last.y - scenePt.y,
          };
          anchors[anchors.length - 1] = last;
          penAnchorsRef.current = anchors;
        }
        penHoverPtRef.current = { x: scenePt.x, y: scenePt.y };
        canvas.requestRenderAll();
      }

      if (
        activeToolRef.current === 'mask' &&
        maskPaintTargetRef.current &&
        lastMaskPtRef.current
      ) {
        paintLayerMaskStroke(
          maskPaintTargetRef.current,
          lastMaskPtRef.current,
          scenePt,
          maskBrushRef.current
        );
        lastMaskPtRef.current = { x: scenePt.x, y: scenePt.y };
        canvas.requestRenderAll();
      }

      if (
        activeToolRef.current === 'magic-eraser' &&
        isPaintingMagicEraserRef.current &&
        magicEraserTargetRef.current &&
        magicEraserCanvasRef.current &&
        lastMagicEraserPtRef.current
      ) {
        const target = magicEraserTargetRef.current;
        const mc = magicEraserCanvasRef.current;
        const mCtx = mc.getContext('2d');
        if (mCtx) {
          const inv = fabric.util.invertTransform(target.calcTransformMatrix());
          const p0 = new fabric.Point(
            lastMagicEraserPtRef.current.x,
            lastMagicEraserPtRef.current.y
          ).transform(inv);
          const p1 = new fabric.Point(scenePt.x, scenePt.y).transform(inv);
          const avgScale =
            (Math.abs(target.scaleX || 1) + Math.abs(target.scaleY || 1)) *
              0.5 || 1;
          mCtx.save();
          mCtx.strokeStyle = '#f43f5e';
          mCtx.lineWidth = Math.max(4, magicEraserSizeRef.current / avgScale);
          mCtx.lineCap = 'round';
          mCtx.lineJoin = 'round';
          mCtx.beginPath();
          mCtx.moveTo(p0.x + mc.width / 2, p0.y + mc.height / 2);
          mCtx.lineTo(p1.x + mc.width / 2, p1.y + mc.height / 2);
          mCtx.stroke();
          mCtx.restore();
        }
        lastMagicEraserPtRef.current = { x: scenePt.x, y: scenePt.y };
        canvas.requestRenderAll();
      }

      if (
        activeToolRef.current === 'mosaic' &&
        isPaintingMosaicRef.current &&
        mosaicTargetRef.current &&
        mosaicCanvasRef.current &&
        lastMosaicPtRef.current
      ) {
        const target = mosaicTargetRef.current;
        const mc = mosaicCanvasRef.current;
        const mCtx = mc.getContext('2d');
        if (mCtx) {
          const inv = fabric.util.invertTransform(target.calcTransformMatrix());
          const p0 = new fabric.Point(
            lastMosaicPtRef.current.x,
            lastMosaicPtRef.current.y
          ).transform(inv);
          const p1 = new fabric.Point(scenePt.x, scenePt.y).transform(inv);
          const avgScale =
            (Math.abs(target.scaleX || 1) + Math.abs(target.scaleY || 1)) *
              0.5 || 1;
          mCtx.save();
          mCtx.strokeStyle = '#0ea5e9';
          mCtx.lineWidth = Math.max(6, mosaicBrushSizeRef.current / avgScale);
          mCtx.lineCap = 'round';
          mCtx.lineJoin = 'round';
          mCtx.beginPath();
          mCtx.moveTo(p0.x + mc.width / 2, p0.y + mc.height / 2);
          mCtx.lineTo(p1.x + mc.width / 2, p1.y + mc.height / 2);
          mCtx.stroke();
          mCtx.restore();
        }
        lastMosaicPtRef.current = { x: scenePt.x, y: scenePt.y };
        canvas.requestRenderAll();
      }

      pendingCursorRef.current = {
        x: Math.round(scenePt.x),
        y: Math.round(scenePt.y),
      };
      if (cursorRafRef.current === null) {
        cursorRafRef.current = window.requestAnimationFrame(() => {
          cursorRafRef.current = null;
          setCursorPos(pendingCursorRef.current);
        });
      }
    });

    canvas.on('mouse:up', () => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        canvas.setCursor(activeToolRef.current === 'hand' ? 'grab' : 'default');
      }
      if (cropDragRef.current) {
        cropDragRef.current = null;
        if (cropRectRef.current) {
          setCropRectState({ ...cropRectRef.current });
        }
      }
      if (isPenDraggingHandleRef.current) {
        isPenDraggingHandleRef.current = false;
      }
      if (isPaintingMagicEraserRef.current) {
        isPaintingMagicEraserRef.current = false;
        lastMagicEraserPtRef.current = null;
      }
      if (isPaintingMosaicRef.current) {
        isPaintingMosaicRef.current = false;
        lastMosaicPtRef.current = null;
        const targetImg = mosaicTargetRef.current;
        const mc = mosaicCanvasRef.current;
        mosaicTargetRef.current = null;
        mosaicCanvasRef.current = null;
        if (targetImg && mc) {
          void applyMosaicBrushToImageBlob(targetImg, mc, 18).then(
            async (blob) => {
              if (!blob || !replaceImageWithBlobRef.current) return;
              await replaceImageWithBlobRef.current(targetImg, blob);
              canvas.requestRenderAll();
              syncCanvasUi();
              commitHistoryRef.current('Mosaic Brush', 'immediate');
            }
          );
        }
      }
      if (maskPaintTargetRef.current) {
        commitLayerMaskSnapshot(maskPaintTargetRef.current);
        maskPaintTargetRef.current = null;
        lastMaskPtRef.current = null;
        syncCanvasUi();
        commitHistoryRef.current('Paint Layer Mask', 'immediate');
      }
    });

    // ResizeObserver keeps Fabric viewport sized cleanly to stage container
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.floor(entry.contentRect.width);
      const h = Math.floor(entry.contentRect.height);
      if (w < 40 || h < 40) return;
      if (w === canvas.getWidth() && h === canvas.getHeight()) return;
      canvas.setDimensions({ width: w, height: h });
      setStageSize({ width: w, height: h });
      setViewportTransformState([
        ...(canvas.viewportTransform || [1, 0, 0, 1, 0, 0]),
      ]);
      canvas.requestRenderAll();
    });
    resizeObserver.observe(stageEl);

    setStageSize({ width: initialW, height: initialH });
    fitToScreen();
    setCanvasVersion((v) => v + 1);

    const assetsSnapshot = assetMapRef.current;

    let hammerDisposed = false;
    let hammerInstance: InstanceType<typeof import('hammerjs').Manager> | null =
      null;
    void import('hammerjs')
      .then(({ default: Hammer }) => {
        if (hammerDisposed) return;
        const hammer = new Hammer.Manager(canvas.upperCanvasEl, {
          recognizers: [
            [Hammer.Rotate],
            [Hammer.Pinch, { enable: true }, ['rotate']],
          ],
        });
        let initScaleX = 1;
        let initScaleY = 1;
        let initAngle = 0;
        let baseScale = 1;
        let activeTarget: fabric.FabricObject | null = null;
        let mutated = false;

        hammer.on('pinchstart rotatestart', (ev: { scale?: number }) => {
          const obj = canvas.getActiveObject();
          if (!obj || activeToolRef.current !== 'select') return;
          activeTarget = obj;
          initScaleX = obj.scaleX ?? 1;
          initScaleY = obj.scaleY ?? 1;
          initAngle = obj.angle ?? 0;
          baseScale = ev.scale || 1;
          mutated = false;
        });

        hammer.on('pinchmove', (ev: { scale?: number }) => {
          if (!activeTarget) return;
          const factor = (ev.scale || 1) / (baseScale || 1);
          activeTarget.set({
            scaleX: initScaleX * factor,
            scaleY: initScaleY * factor,
          });
          activeTarget.setCoords();
          mutated = true;
          canvas.requestRenderAll();
        });

        hammer.on('rotatemove', (ev: { rotation?: number }) => {
          if (!activeTarget) return;
          const raw = initAngle + (ev.rotation ?? 0);
          const nearest90 = Math.round(raw / 90) * 90;
          const snapped = Math.abs(raw - nearest90) <= 6 ? nearest90 : raw;
          activeTarget.rotate(snapped);
          activeTarget.setCoords();
          mutated = true;
          canvas.requestRenderAll();
        });

        hammer.on('pinchend pinchcancel rotateend rotatecancel', () => {
          if (activeTarget && mutated) {
            syncCanvasUi();
            commitHistoryRef.current('Touch Transform', 'immediate');
          }
          activeTarget = null;
          mutated = false;
        });

        hammerInstance = hammer;
      })
      .catch(() => {});

    return () => {
      hammerDisposed = true;
      hammerInstance?.destroy();
      if (cursorRafRef.current !== null) {
        window.cancelAnimationFrame(cursorRafRef.current);
      }
      resizeObserver.disconnect();
      checkerPatternRef.current = null;
      canvas.dispose();
      fabricCanvasRef.current = null;
      for (const entry of assetsSnapshot.values()) {
        window.URL.revokeObjectURL(entry.url);
      }
      assetsSnapshot.clear();
    };
  }, [
    canvasElRef,
    exitCompareIfNeeded,
    fitToScreen,
    setActiveTool,
    stageRef,
    syncCanvasUi,
  ]);

  // Snap guides hook (including user ruler guides & 15° rotation snapping)
  useSnapGuides({
    fabricCanvasRef,
    docConfigRef,
    userGuidesRef,
    canvasVersion,
    enabled: snapGuidesEnabled,
  });

  const handleAfterHistoryRestore = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    for (const obj of canvas.getObjects()) {
      applyControlsStyleRecursive(obj);
    }
    await hydrateLayerMasks(canvas);
    await syncClippedLayers(canvas);
  }, []);

  // History + IndexedDB auto-save hook
  const history = useHistoryStack({
    fabricCanvasRef,
    docConfigRef,
    setDocConfig,
    assetMapRef,
    registerAssetBlob,
    resolveAssetUrl,
    isFabricReady,
    fitToScreen,
    onSyncCanvasUi: syncCanvasUi,
    onAfterRestore: handleAfterHistoryRestore,
  });

  useEffect(() => {
    commitHistoryRef.current = history.commitHistory;
  }, [history.commitHistory]);

  // Space temporary Hand-pan hold
  const setSpacePanMode = useCallback((isHolding: boolean) => {
    isSpacePanRef.current = isHolding;
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (isHolding) {
      canvas.selection = false;
      canvas.skipTargetFind = true;
      canvas.defaultCursor = 'grab';
      canvas.setCursor('grab');
    } else {
      const isSelect = activeToolRef.current === 'select';
      canvas.selection = isSelect;
      canvas.skipTargetFind = !isSelect;
      canvas.defaultCursor = isSelect ? 'default' : 'crosshair';
      canvas.setCursor(canvas.defaultCursor);
    }
  }, []);

  // Image / SVG / HEIC / TIFF / PSD / .pes Import Actions
  const openPsdFile = useCallback(
    async (file: File) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      try {
        toast.info(`Parsing ${file.name} layers...`);
        const { width, height, layerCount } = await importPsdToCanvas(
          file,
          canvas,
          registerAssetBlob
        );
        setDocConfig((prev) => {
          const next = { ...prev, width, height };
          docConfigRef.current = next;
          return next;
        });
        fitToScreen();
        setActiveTool('select');
        canvas.requestRenderAll();
        syncCanvasUi();
        commitHistoryRef.current(`Import ${file.name}`, 'immediate');
        toast.success(
          `Imported ${layerCount} PSD layer(s) (${width}×${height})`
        );
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to parse .psd file'
        );
      }
    },
    [fitToScreen, registerAssetBlob, setActiveTool, syncCanvasUi]
  );

  const addImages = useCallback(
    async (files: FileList | File[]) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || !files || files.length === 0) return;

      const { width: dw, height: dh } = docConfigRef.current;
      let addedCount = 0;

      for (let i = 0; i < files.length; i++) {
        const rawFile = files[i];
        const lower = rawFile.name.toLowerCase();

        if (lower.endsWith('.psd')) {
          await openPsdFile(rawFile);
          continue;
        }

        const isSpecialImage =
          lower.endsWith('.heic') ||
          lower.endsWith('.heif') ||
          lower.endsWith('.tif') ||
          lower.endsWith('.tiff');

        if (
          !rawFile.type.startsWith('image/') &&
          !lower.endsWith('.svg') &&
          !isSpecialImage
        ) {
          continue;
        }

        let file = rawFile;
        if (isSpecialImage) {
          try {
            toast.info(`Decoding ${rawFile.name}...`);
            file = await decodeSpecialImageFile(rawFile);
          } catch (err) {
            toast.error(
              err instanceof Error
                ? err.message
                : `Failed to decode ${rawFile.name}`
            );
            continue;
          }
        }

        if (file.name.toLowerCase().endsWith('.svg')) {
          const svgText = await file.text();
          const result = await fabric.loadSVGFromString(svgText);
          const validObjects = result.objects.filter(
            (o): o is fabric.FabricObject => o !== null
          );
          if (validObjects.length > 0) {
            const group = fabric.util.groupSVGElements(
              validObjects,
              result.options
            );
            const scale = Math.min(
              (dw * 0.65) / (group.width || 1),
              (dh * 0.65) / (group.height || 1),
              1
            );
            group.set({
              left: dw / 2 + i * 24,
              top: dh / 2 + i * 24,
              originX: 'center',
              originY: 'center',
              scaleX: scale,
              scaleY: scale,
              ...FABRIC_OBJECT_CONTROLS_STYLE,
            });
            stampLayerMeta(group, {
              kind: 'group',
              name: file.name.replace(/\.[^.]+$/, ''),
            });
            canvas.add(group);
            canvas.setActiveObject(group);
            addedCount += 1;
          }
          continue;
        }

        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
          const check = await downsampleFileIfNeeded(
            file,
            MOBILE_MAX_IMPORT_EDGE
          );
          file = check.file;
          if (check.resized) {
            toast.info(
              `Resized to ${MOBILE_MAX_IMPORT_EDGE}px max for smooth mobile editing`
            );
          }
        }

        const { assetId, url } = registerAssetFile(file);
        const img = await fabric.FabricImage.fromURL(url, {
          crossOrigin: 'anonymous',
        });

        const scale = Math.min(
          (dw * 0.8) / (img.width || 1),
          (dh * 0.8) / (img.height || 1),
          1
        );
        img.set({
          left: dw / 2 + i * 24,
          top: dh / 2 + i * 24,
          originX: 'center',
          originY: 'center',
          scaleX: scale,
          scaleY: scale,
          ...FABRIC_OBJECT_CONTROLS_STYLE,
        });
        stampLayerMeta(img, {
          kind: 'image',
          name: rawFile.name,
          assetId,
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        addedCount += 1;
      }

      if (addedCount > 0) {
        setActiveTool('select');
        canvas.requestRenderAll();
        syncCanvasUi();
        commitHistoryRef.current(
          addedCount === 1 ? 'Import Image' : `Import ${addedCount} Images`,
          'immediate'
        );
      }
    },
    [openPsdFile, registerAssetFile, setActiveTool, syncCanvasUi]
  );

  const openPesFile = useCallback(
    async (file: File) => {
      try {
        const {
          docConfig: loadedDoc,
          canvasJson,
          assets,
        } = await unpackPesArchive(file);
        await history.loadExternalDocument(
          loadedDoc,
          canvasJson,
          assets,
          `Open ${file.name}`
        );
        toast.success(`Opened ${file.name}`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to open .pes project'
        );
      }
    },
    [history]
  );

  const savePesProject = useCallback(async (filename?: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const canvasJson = canvas.toObject(CUSTOM_SERIALIZATION_PROPS) as Record<
      string,
      unknown
    >;
    const assets: Record<string, Blob> = {};
    for (const [id, entry] of assetMapRef.current.entries()) {
      assets[id] = entry.blob;
    }
    const blob = await packPesArchive(docConfigRef.current, canvasJson, assets);
    const baseName = filename?.trim() || 'photo-editor-project';
    downloadBlobOrUrl(blob, `${baseName}.pes`);
    toast.success(`Saved ${baseName}.pes`);
  }, []);

  const renderExportDataUrl = useCallback(
    (
      format: 'png' | 'jpeg' | 'webp',
      quality: number,
      multiplier: 1 | 2 | 3
    ) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return null;

      const prevVpt = [
        ...(canvas.viewportTransform || [1, 0, 0, 1, 0, 0]),
      ] as fabric.TMat2D;
      const prevBg = canvas.backgroundColor;
      const {
        width,
        height,
        backgroundType,
        backgroundColor,
        backgroundOpacity,
      } = docConfigRef.current;

      canvas.discardActiveObject();
      isExportingRef.current = true;
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

      if (backgroundType === 'color') {
        const rgba = colorUtils.hexToRgba(backgroundColor);
        canvas.backgroundColor = colorUtils.rgbaToHex({
          ...rgba,
          a: backgroundOpacity,
        });
      } else if (format === 'jpeg') {
        canvas.backgroundColor = '#ffffff';
      } else {
        canvas.backgroundColor = '';
      }

      try {
        return canvas.toDataURL({
          format,
          quality,
          multiplier,
          left: 0,
          top: 0,
          width,
          height,
          enableRetinaScaling: false,
        });
      } finally {
        canvas.backgroundColor = prevBg;
        isExportingRef.current = false;
        canvas.setViewportTransform(prevVpt);
        canvas.requestRenderAll();
      }
    },
    []
  );

  const exportDocument = useCallback(
    async (options: ExportOptions) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const { format, quality, multiplier, filename } = options;
      const safeName = filename.trim() || 'photo-editor-export';

      if (format === 'pes') {
        await savePesProject(safeName);
        return;
      }

      if (format === 'psd') {
        const psdBlob = await exportCanvasToPsdBlob(
          canvas,
          docConfigRef.current
        );
        downloadBlobOrUrl(psdBlob, `${safeName}.psd`);
        toast.success(`Exported ${safeName}.psd`);
        return;
      }

      if (format === 'gif') {
        toast.info('Encoding animated GIF...');
        const gifBlob = await exportCanvasToGif(
          canvas,
          docConfigRef.current,
          options.gif ?? { mode: 'layers', fps: 10, durationSec: 2 }
        );
        downloadBlobOrUrl(gifBlob, `${safeName}.gif`);
        toast.success(`Exported ${safeName}.gif`);
        return;
      }

      if (format === 'svg') {
        const prevVpt = [
          ...(canvas.viewportTransform || [1, 0, 0, 1, 0, 0]),
        ] as fabric.TMat2D;
        const {
          width,
          height,
          backgroundType,
          backgroundColor,
          backgroundOpacity,
        } = docConfigRef.current;
        const prevBg = canvas.backgroundColor;
        canvas.discardActiveObject();
        isExportingRef.current = true;
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        if (backgroundType === 'color') {
          const rgba = colorUtils.hexToRgba(backgroundColor);
          canvas.backgroundColor = colorUtils.rgbaToHex({
            ...rgba,
            a: backgroundOpacity,
          });
        }
        try {
          const svg = canvas.toSVG({
            width: `${width}`,
            height: `${height}`,
            viewBox: { x: 0, y: 0, width, height },
          });
          const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
          downloadBlobOrUrl(blob, `${safeName}.svg`);
          toast.success(`Exported ${safeName}.svg`);
        } finally {
          canvas.backgroundColor = prevBg;
          isExportingRef.current = false;
          canvas.setViewportTransform(prevVpt);
          canvas.requestRenderAll();
        }
        return;
      }

      const dataUrl = renderExportDataUrl(format, quality, multiplier);
      if (!dataUrl) return;
      const ext = format === 'jpeg' ? 'jpg' : format;
      downloadBlobOrUrl(dataUrl, `${safeName}.${ext}`);
      toast.success(`Exported ${safeName}.${ext}`);
    },
    [renderExportDataUrl, savePesProject]
  );

  const copyPngToClipboard = useCallback(async (): Promise<boolean> => {
    if (
      typeof navigator === 'undefined' ||
      !navigator.clipboard?.write ||
      typeof ClipboardItem === 'undefined'
    ) {
      toast.error('Clipboard image copy is not supported in this browser');
      return false;
    }

    try {
      const dataUrl = renderExportDataUrl('png', 1, 1);
      if (!dataUrl) return false;
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      toast.success('Copied PNG to clipboard');
      return true;
    } catch {
      toast.error('Clipboard permission denied. Please download PNG instead.');
      return false;
    }
  }, [renderExportDataUrl]);

  // Document Config Updates
  const updateDocumentConfig = useCallback(
    (patch: Partial<DocumentConfig>, commitLabel?: string, refit = false) => {
      setDocConfig((prev) => {
        const next = { ...prev, ...patch };
        docConfigRef.current = next;
        return next;
      });
      if (refit) {
        fitToScreen();
      } else {
        fabricCanvasRef.current?.requestRenderAll();
      }
      if (commitLabel) {
        commitHistoryRef.current(commitLabel, 'immediate');
      }
    },
    [fitToScreen]
  );

  // Selected Object Property Updaters
  const getPrimaryTargets = useCallback((): fabric.FabricObject[] => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return [];
    const active = canvas.getActiveObject();
    if (!active) return [];
    if (active instanceof fabric.ActiveSelection) {
      return active.getObjects();
    }
    return [active];
  }, []);

  const updateSelectedProp = useCallback(
    (patch: Record<string, unknown>, commitLabel?: string) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;

      const targets = getPrimaryTargets();
      if ('angle' in patch || 'left' in patch || 'top' in patch) {
        active.set(patch);
        active.setCoords();
      } else if ('width' in patch && targets.length === 1) {
        const t = targets[0];
        const w = Number(patch.width);
        if (t.width && w > 0) {
          t.set({ scaleX: w / t.width });
          t.setCoords();
        }
      } else if ('height' in patch && targets.length === 1) {
        const t = targets[0];
        const h = Number(patch.height);
        if (t.height && h > 0) {
          t.set({ scaleY: h / t.height });
          t.setCoords();
        }
      } else {
        for (const t of targets) {
          if ('cornerRadius' in patch && t instanceof fabric.Rect) {
            const r = Number(patch.cornerRadius);
            t.set({ rx: r, ry: r });
          } else {
            t.set(patch);
          }
          t.setCoords();
        }
      }

      canvas.requestRenderAll();
      syncCanvasUi();
      if (commitLabel) {
        commitHistoryRef.current(commitLabel, 'immediate');
      }
    },
    [getPrimaryTargets, syncCanvasUi]
  );

  const updateSelectedBlendMode = useCallback(
    (blendMode: BlendMode) => {
      updateSelectedProp(
        { globalCompositeOperation: blendMode },
        'Change Blend Mode'
      );
    },
    [updateSelectedProp]
  );

  const updateSelectedShadow = useCallback(
    (
      config: {
        enabled: boolean;
        blur: number;
        offsetX: number;
        offsetY: number;
        color: string;
      },
      commitLabel?: string
    ) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const targets = getPrimaryTargets();
      if (targets.length === 0) return;

      for (const t of targets) {
        t.set({
          shadow: config.enabled
            ? new fabric.Shadow({
                blur: config.blur,
                offsetX: config.offsetX,
                offsetY: config.offsetY,
                color: config.color,
              })
            : null,
        });
      }

      canvas.requestRenderAll();
      syncCanvasUi();
      if (commitLabel) {
        commitHistoryRef.current(commitLabel, 'immediate');
      }
    },
    [getPrimaryTargets, syncCanvasUi]
  );

  const updateSelectedClipShape = useCallback(
    (shape: ClipShapeKind) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const targets = getPrimaryTargets();
      if (targets.length === 0) return;

      for (const t of targets) {
        applyClipShapeToObject(t, shape);
      }

      canvas.requestRenderAll();
      syncCanvasUi();
      commitHistoryRef.current('Update Clipping Mask', 'immediate');
    },
    [getPrimaryTargets, syncCanvasUi]
  );

  const updateSelectedFilters = useCallback(
    (nextValues: ImageFilterValues, commitLabel?: string) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!(active instanceof fabric.FabricImage)) return;

      exitCompareIfNeeded();
      setFilterValues(nextValues);
      applyImageFilterValues(active, nextValues);
      const el = active.getElement();
      setActiveImageEl(el instanceof HTMLVideoElement ? null : (el ?? null));
      setFilterRevision((r) => r + 1);
      canvas.requestRenderAll();

      if (commitLabel) {
        commitHistoryRef.current(commitLabel, 'immediate');
      }
    },
    [exitCompareIfNeeded]
  );

  // Interactive Split-Screen Before / After Comparison Toggle
  const toggleCompareOriginal = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (beforeSnapshotUrl) {
      setBeforeSnapshotUrl(null);
      setIsComparingOriginal(false);
      return;
    }

    const images = canvas
      .getObjects()
      .filter((o): o is fabric.FabricImage => o instanceof fabric.FabricImage);

    const saved = new Map<
      fabric.FabricImage,
      fabric.filters.BaseFilter<string>[]
    >();
    for (const img of images) {
      saved.set(img, [...(img.filters ?? [])]);
      img.set({ filters: [] });
      img.applyFilters();
    }

    try {
      canvas.discardActiveObject();
      // Synchronous render required immediately before reading lowerCanvasEl pixels for SplitCompareOverlay
      canvas.renderAll();
      const snapshot = canvas.lowerCanvasEl.toDataURL('image/png');
      setBeforeSnapshotUrl(snapshot);
      setCompareSplitPercent(50);
      setIsComparingOriginal(true);
    } finally {
      for (const [img, filters] of saved.entries()) {
        img.set({ filters });
        img.applyFilters();
      }
      canvas.requestRenderAll();
      syncCanvasUi();
    }
  }, [beforeSnapshotUrl, syncCanvasUi]);

  // Phase 2 Actions: Crop, Path Node Editing, Boolean, Curves Text, Fonts, Masks, Clipping, LUT, Rulers & Guides
  const setCropAspect = useCallback((aspect: CropAspectRatio) => {
    cropAspectRef.current = aspect;
    setCropAspectState(aspect);
    const { width: dw, height: dh } = docConfigRef.current;
    const next = createInitialCropRect(dw, dh, aspect);
    cropRectRef.current = next;
    setCropRectState(next);
    fabricCanvasRef.current?.requestRenderAll();
  }, []);

  const applyCrop = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const crop = cropRectRef.current;
    if (!canvas || !crop) return;

    for (const obj of canvas.getObjects()) {
      obj.set({
        left: (obj.left ?? 0) - crop.x,
        top: (obj.top ?? 0) - crop.y,
      });
      obj.setCoords();
    }

    const nextW = Math.max(32, Math.round(crop.width));
    const nextH = Math.max(32, Math.round(crop.height));
    setDocConfig((prev) => {
      const next = { ...prev, width: nextW, height: nextH };
      docConfigRef.current = next;
      return next;
    });

    cropRectRef.current = null;
    cropDragRef.current = null;
    setCropRectState(null);
    setActiveTool('select');
    fitToScreen();
    syncCanvasUi();
    commitHistoryRef.current(`Crop Canvas (${nextW}×${nextH})`, 'immediate');
    toast.success(`Cropped artboard to ${nextW} × ${nextH} px`);
  }, [fitToScreen, setActiveTool, syncCanvasUi]);

  const cancelCrop = useCallback(() => {
    setActiveTool('select');
  }, [setActiveTool]);

  const cancelPenPath = useCallback(() => {
    penAnchorsRef.current = [];
    penHoverPtRef.current = null;
    isPenDraggingHandleRef.current = false;
    setPenAnchorCount(0);
    setActiveTool('select');
  }, [setActiveTool]);

  const togglePathNodeEditing = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!(active instanceof fabric.Path)) return;

    if (isPathInNodeEditMode(active)) {
      disablePathNodeEditing(active);
    } else {
      enablePathNodeEditing(active);
    }
    canvas.requestRenderAll();
    syncCanvasUi();
  }, [syncCanvasUi]);

  const runBooleanOp = useCallback(
    async (op: BooleanOpKind) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const targets = canvas.getActiveObjects();
      if (targets.length < 2) return;

      try {
        const res = await runVectorBooleanOperation(targets, op);
        if (!res) {
          toast.error('Boolean operation produced an empty shape.');
          return;
        }

        canvas.discardActiveObject();
        for (const obj of targets) {
          canvas.remove(obj);
        }

        const merged = new fabric.Path(res.pathData, {
          left: res.left,
          top: res.top,
          originX: 'center',
          originY: 'center',
          fill: res.fill,
          stroke: res.stroke,
          strokeWidth: res.strokeWidth,
          ...FABRIC_OBJECT_CONTROLS_STYLE,
        });
        const label = op.charAt(0).toUpperCase() + op.slice(1);
        stampLayerMeta(merged, { kind: 'shape', name: `Boolean ${label}` });
        canvas.add(merged);
        canvas.setActiveObject(merged);
        canvas.requestRenderAll();
        syncCanvasUi();
        commitHistoryRef.current(`Vector ${label}`, 'immediate');
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Vector Boolean failed.'
        );
      }
    },
    [syncCanvasUi]
  );

  const updateTextCurve = useCallback(
    (kind: TextCurveKind, strength?: number, commitLabel?: string) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (
        !(active instanceof fabric.Textbox || active instanceof fabric.IText)
      ) {
        return;
      }

      const ext = active as ExtendedFabricObject;
      const nextStrength = strength ?? ext._textCurveStrength ?? 45;
      applyTextCurvePath(active, kind, nextStrength);
      canvas.requestRenderAll();
      syncCanvasUi();
      if (commitLabel) {
        commitHistoryRef.current(commitLabel, 'immediate');
      }
    },
    [syncCanvasUi]
  );

  const loadCustomFont = useCallback(
    async (file: File) => {
      try {
        const { family, buffer } = await loadLocalFontFile(file);
        fontBuffersRef.current.set(family, buffer);
        setCustomFonts((prev) =>
          prev.some((f) => f.value === family)
            ? prev
            : [...prev, { label: `${family} (Custom)`, value: family }]
        );

        const canvas = fabricCanvasRef.current;
        const active = canvas?.getActiveObject();
        if (
          canvas &&
          active &&
          (active instanceof fabric.Textbox || active instanceof fabric.IText)
        ) {
          active.set({ fontFamily: family });
          active.initDimensions();
          active.setCoords();
          canvas.requestRenderAll();
          syncCanvasUi();
          commitHistoryRef.current(`Load Font ${family}`, 'immediate');
        }
        toast.success(`Loaded font "${family}"`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to load font file.'
        );
      }
    },
    [syncCanvasUi]
  );

  const convertSelectedTextToOutlines = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!(active instanceof fabric.Textbox || active instanceof fabric.IText)) {
      return;
    }

    const family = active.fontFamily || '';
    let fontBuffer = fontBuffersRef.current.get(family);
    if (!fontBuffer) {
      const firstEntry = fontBuffersRef.current.entries().next();
      if (!firstEntry.done) {
        fontBuffer = firstEntry.value[1];
      }
    }
    if (!fontBuffer) {
      toast.info(
        'Load a local .ttf / .otf / .woff2 font first so glyphs can be outlined accurately.'
      );
      return;
    }

    try {
      const pathObj = await convertTextToOutlinePath(active, fontBuffer);
      const ext = active as ExtendedFabricObject;
      stampLayerMeta(pathObj, {
        kind: 'shape',
        name: `${ext._layerName || 'Text'} Outlines`,
      });
      pathObj.set({ ...FABRIC_OBJECT_CONTROLS_STYLE });

      const idx = canvas.getObjects().indexOf(active);
      canvas.remove(active);
      canvas.insertAt(Math.max(0, idx), pathObj);
      canvas.setActiveObject(pathObj);
      canvas.requestRenderAll();
      syncCanvasUi();
      commitHistoryRef.current('Convert Text to Outlines', 'immediate');
      toast.success('Converted text to editable vector outlines');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to convert text outlines.'
      );
    }
  }, [syncCanvasUi]);

  const addLayerMask = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !(active instanceof fabric.FabricImage)) return;

    await ensureLayerMaskCanvas(active);
    setActiveTool('mask');
    canvas.requestRenderAll();
    syncCanvasUi();
    commitHistoryRef.current('Add Layer Mask', 'immediate');
  }, [setActiveTool, syncCanvasUi]);

  const invertSelectedMask = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !(active instanceof fabric.FabricImage)) return;

    await invertLayerMask(active);
    canvas.requestRenderAll();
    syncCanvasUi();
    commitHistoryRef.current('Invert Layer Mask', 'immediate');
  }, [syncCanvasUi]);

  const removeSelectedMask = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !(active instanceof fabric.FabricImage)) return;

    removeLayerMask(active);
    if (activeToolRef.current === 'mask') {
      setActiveTool('select');
    }
    canvas.requestRenderAll();
    syncCanvasUi();
    commitHistoryRef.current('Remove Layer Mask', 'immediate');
  }, [setActiveTool, syncCanvasUi]);

  const toggleClipToLayerBelow = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !active) return;

    const ext = active as ExtendedFabricObject;
    const objects = canvas.getObjects();
    const idx = objects.indexOf(active);

    if (ext._clipToLayerId) {
      ext._clipToLayerId = undefined;
      active.set({ clipPath: undefined, dirty: true });
      canvas.requestRenderAll();
      syncCanvasUi();
      commitHistoryRef.current('Release Clipping Mask', 'immediate');
      return;
    }

    if (idx <= 0) return;
    const base = objects[idx - 1];
    const baseId = stampLayerMeta(base);
    ext._clipToLayerId = baseId;
    await syncClippedLayers(canvas);
    canvas.requestRenderAll();
    syncCanvasUi();
    commitHistoryRef.current('Clip to Layer Below', 'immediate');
  }, [syncCanvasUi]);

  const loadCubeLutFile = useCallback(
    async (file: File) => {
      const canvas = fabricCanvasRef.current;
      const active = canvas?.getActiveObject();
      if (!canvas || !(active instanceof fabric.FabricImage)) {
        toast.info('Select an image layer before applying a 3D .cube LUT.');
        return;
      }

      try {
        const text = await file.text();
        const parsed = parseCubeLut(text, file.name);
        const base64 = encodeLutBytesToBase64(parsed.data);
        const nextValues: ImageFilterValues = {
          ...readImageFilterValues(active),
          lut: {
            id: parsed.id,
            name: parsed.name,
            size: parsed.size,
            intensity: 1,
            customDataBase64: base64,
          },
        };
        updateSelectedFilters(nextValues, `Apply LUT: ${parsed.name}`);
        toast.success(`Applied 3D LUT "${parsed.name}"`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Invalid .cube 3D LUT file.'
        );
      }
    },
    [updateSelectedFilters]
  );

  const toggleRulers = useCallback(() => {
    setRulersVisible((v) => !v);
  }, []);

  const addOrDragUserGuide = useCallback(
    (orientation: 'h' | 'v', startClientCoord: number) => {
      const stageEl = stageRef.current;
      const canvas = fabricCanvasRef.current;
      if (!stageEl || !canvas) return;

      const guideId = generateUid('guide');
      const clientToDocPos = (clientCoord: number) => {
        const rect = stageEl.getBoundingClientRect();
        const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        if (orientation === 'v') {
          return Math.round((clientCoord - rect.left - vpt[4]) / (vpt[0] || 1));
        }
        return Math.round((clientCoord - rect.top - vpt[5]) / (vpt[3] || 1));
      };

      const initialPos = clientToDocPos(startClientCoord);
      setUserGuides((prev) => [
        ...prev,
        { id: guideId, orientation, position: initialPos },
      ]);

      const onMove = (ev: PointerEvent) => {
        const pos = clientToDocPos(
          orientation === 'v' ? ev.clientX : ev.clientY
        );
        setUserGuides((prev) =>
          prev.map((g) => (g.id === guideId ? { ...g, position: pos } : g))
        );
      };

      const onUp = (ev: PointerEvent) => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        const rect = stageEl.getBoundingClientRect();
        const droppedOutsideRuler =
          orientation === 'v'
            ? ev.clientX - rect.left < 20
            : ev.clientY - rect.top < 20;
        if (droppedOutsideRuler) {
          setUserGuides((prev) => prev.filter((g) => g.id !== guideId));
        }
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [stageRef]
  );

  const clearUserGuides = useCallback(() => {
    setUserGuides([]);
    toast.success('Cleared ruler guides');
  }, []);

  // Layer Management Operations
  const findObjectByLayerId = useCallback(
    (id: string): fabric.FabricObject | undefined => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return undefined;
      return canvas
        .getObjects()
        .find((obj) => (obj as ExtendedFabricObject)._layerId === id);
    },
    []
  );

  const selectLayerById = useCallback(
    (id: string, isToggle = false) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const obj = findObjectByLayerId(id);
      if (!obj) return;

      setActiveTool('select');

      if (!isToggle) {
        canvas.setActiveObject(obj);
        canvas.requestRenderAll();
        syncCanvasUi();
        return;
      }

      const current = canvas.getActiveObjects();
      const next = current.includes(obj)
        ? current.filter((item) => item !== obj)
        : [...current, obj];

      canvas.discardActiveObject();
      if (next.length === 1) {
        canvas.setActiveObject(next[0]);
      } else if (next.length > 1) {
        canvas.setActiveObject(new fabric.ActiveSelection(next, { canvas }));
      }
      canvas.requestRenderAll();
      syncCanvasUi();
    },
    [findObjectByLayerId, setActiveTool, syncCanvasUi]
  );

  const selectAllLayers = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const objects = canvas
      .getObjects()
      .filter((obj) => obj.selectable !== false);
    if (objects.length === 0) return;

    setActiveTool('select');
    canvas.discardActiveObject();
    if (objects.length === 1) {
      canvas.setActiveObject(objects[0]);
    } else {
      canvas.setActiveObject(new fabric.ActiveSelection(objects, { canvas }));
    }
    canvas.requestRenderAll();
    syncCanvasUi();
  }, [setActiveTool, syncCanvasUi]);

  const discardSelection = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    syncCanvasUi();
  }, [syncCanvasUi]);

  const toggleLayerVisibility = useCallback(
    (id: string) => {
      const canvas = fabricCanvasRef.current;
      const obj = findObjectByLayerId(id);
      if (!canvas || !obj) return;

      obj.set({ visible: obj.visible === false });
      canvas.requestRenderAll();
      syncCanvasUi();
      commitHistoryRef.current('Toggle Visibility', 'immediate');
    },
    [findObjectByLayerId, syncCanvasUi]
  );

  const toggleLayerLock = useCallback(
    (id: string) => {
      const canvas = fabricCanvasRef.current;
      const obj = findObjectByLayerId(id);
      if (!canvas || !obj) return;

      const shouldLock = !(obj.lockMovementX && obj.lockMovementY);
      obj.set({
        lockMovementX: shouldLock,
        lockMovementY: shouldLock,
        lockRotation: shouldLock,
        lockScalingX: shouldLock,
        lockScalingY: shouldLock,
      });
      canvas.requestRenderAll();
      syncCanvasUi();
      commitHistoryRef.current(
        shouldLock ? 'Lock Layer' : 'Unlock Layer',
        'immediate'
      );
    },
    [findObjectByLayerId, syncCanvasUi]
  );

  const renameLayer = useCallback(
    (id: string, name: string) => {
      const obj = findObjectByLayerId(id);
      if (!obj) return;
      const trimmed = name.trim();
      if (!trimmed) return;
      (obj as ExtendedFabricObject)._layerName = trimmed;
      syncCanvasUi();
      commitHistoryRef.current('Rename Layer', 'immediate');
    },
    [findObjectByLayerId, syncCanvasUi]
  );

  const deleteLayerById = useCallback(
    (id: string) => {
      const canvas = fabricCanvasRef.current;
      const obj = findObjectByLayerId(id);
      if (!canvas || !obj) return;

      canvas.remove(obj);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      syncCanvasUi();
      commitHistoryRef.current('Delete Layer', 'immediate');
    },
    [findObjectByLayerId, syncCanvasUi]
  );

  const deleteSelected = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    if (active.length === 0) return;

    for (const obj of active) {
      canvas.remove(obj);
    }
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    syncCanvasUi();
    commitHistoryRef.current(
      active.length > 1 ? `Delete ${active.length} Layers` : 'Delete Layer',
      'immediate'
    );
  }, [syncCanvasUi]);

  const duplicateSelected = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;

    const cloned = await active.clone(CUSTOM_SERIALIZATION_PROPS);
    canvas.discardActiveObject();

    const assignOffsetAndId = (obj: fabric.FabricObject) => {
      const ext = obj as ExtendedFabricObject;
      stampLayerMeta(obj, {
        id: generateUid('layer'),
        name: `${ext._layerName || 'Layer'} Copy`,
        kind: ext._layerType,
        assetId: ext._assetId,
        clipShape: ext._clipShape,
      });
      obj.set({ ...FABRIC_OBJECT_CONTROLS_STYLE });
    };

    if (cloned instanceof fabric.ActiveSelection) {
      cloned.set({
        left: (cloned.left ?? 0) + 24,
        top: (cloned.top ?? 0) + 24,
        canvas,
      });
      for (const child of cloned.getObjects()) {
        assignOffsetAndId(child);
        canvas.add(child);
      }
      canvas.setActiveObject(cloned);
    } else {
      cloned.set({
        left: (cloned.left ?? 0) + 24,
        top: (cloned.top ?? 0) + 24,
      });
      assignOffsetAndId(cloned);
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
    }

    canvas.requestRenderAll();
    syncCanvasUi();
    commitHistoryRef.current('Duplicate Layer', 'immediate');
  }, [syncCanvasUi]);

  const groupSelected = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!(active instanceof fabric.ActiveSelection)) return;

    const items = active.removeAll();
    canvas.discardActiveObject();
    const group = new fabric.Group(items, {
      ...FABRIC_OBJECT_CONTROLS_STYLE,
    });
    stampLayerMeta(group, { kind: 'group', name: 'Layer Group' });
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
    syncCanvasUi();
    commitHistoryRef.current('Group Layers', 'immediate');
  }, [syncCanvasUi]);

  const ungroupSelected = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (
      !(active instanceof fabric.Group) ||
      active instanceof fabric.ActiveSelection
    ) {
      return;
    }

    const items = active.removeAll();
    canvas.remove(active);
    for (const item of items) {
      item.set({ ...FABRIC_OBJECT_CONTROLS_STYLE });
      canvas.add(item);
    }
    if (items.length > 0) {
      canvas.setActiveObject(new fabric.ActiveSelection(items, { canvas }));
    }
    canvas.requestRenderAll();
    syncCanvasUi();
    commitHistoryRef.current('Ungroup Layers', 'immediate');
  }, [syncCanvasUi]);

  const reorderVisualLayers = useCallback(
    (nextVisualIds: string[]) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const bottomToTop = nextVisualIds
        .slice()
        .reverse()
        .map((id) => findObjectByLayerId(id))
        .filter((obj): obj is fabric.FabricObject => Boolean(obj));

      for (const obj of bottomToTop) {
        canvas.bringObjectToFront(obj);
      }
      canvas.requestRenderAll();
      syncCanvasUi();
      commitHistoryRef.current('Reorder Layers', 'immediate');
    },
    [findObjectByLayerId, syncCanvasUi]
  );

  const reorderSelectedOrder = useCallback(
    (action: LayerOrderAction) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const targets = getPrimaryTargets();
      if (targets.length === 0) return;

      if (action === 'front') {
        targets.forEach((o) => canvas.bringObjectToFront(o));
      } else if (action === 'forward') {
        targets.forEach((o) => canvas.bringObjectForward(o));
      } else if (action === 'backward') {
        targets
          .slice()
          .reverse()
          .forEach((o) => canvas.sendObjectBackwards(o));
      } else {
        targets
          .slice()
          .reverse()
          .forEach((o) => canvas.sendObjectToBack(o));
      }

      canvas.requestRenderAll();
      syncCanvasUi();
      commitHistoryRef.current('Change Layer Order', 'immediate');
    },
    [getPrimaryTargets, syncCanvasUi]
  );

  const alignSelected = useCallback(
    (edge: AlignmentEdge) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;

      const { width: dw, height: dh } = docConfigRef.current;
      active.setCoords();
      const bounds = active.getBoundingRect();

      let dx = 0;
      let dy = 0;
      if (edge === 'left') dx = -bounds.left;
      if (edge === 'center-h') dx = dw / 2 - (bounds.left + bounds.width / 2);
      if (edge === 'right') dx = dw - (bounds.left + bounds.width);
      if (edge === 'top') dy = -bounds.top;
      if (edge === 'center-v') dy = dh / 2 - (bounds.top + bounds.height / 2);
      if (edge === 'bottom') dy = dh - (bounds.top + bounds.height);

      active.set({
        left: (active.left ?? 0) + dx,
        top: (active.top ?? 0) + dy,
      });
      active.setCoords();
      canvas.requestRenderAll();
      syncCanvasUi();
      commitHistoryRef.current('Align Layer', 'immediate');
    },
    [syncCanvasUi]
  );

  const nudgeSelected = useCallback(
    (dx: number, dy: number) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;

      active.set({
        left: (active.left ?? 0) + dx,
        top: (active.top ?? 0) + dy,
      });
      active.setCoords();
      canvas.requestRenderAll();
      syncCanvasUi();
      commitHistoryRef.current('Nudge Layer', 'debounced');
    },
    [syncCanvasUi]
  );

  // Phase 3 AI Actions: Cutout, Magic Select (SAM), Magic Eraser (LaMa), 3D Depth, 2x Upscale & Browser Native AI
  const replaceImageWithBlob = useCallback(
    async (
      targetImg: fabric.FabricImage,
      blob: Blob,
      options?: { scaleFactor?: number }
    ) => {
      const assetId = generateUid('asset');
      const url = registerAssetBlob(assetId, blob);
      await targetImg.setSrc(url, { crossOrigin: 'anonymous' });
      (targetImg as ExtendedFabricObject)._assetId = assetId;
      if (options?.scaleFactor && options.scaleFactor !== 1) {
        targetImg.set({
          scaleX: (targetImg.scaleX ?? 1) * options.scaleFactor,
          scaleY: (targetImg.scaleY ?? 1) * options.scaleFactor,
        });
      }
      targetImg.setCoords();
      targetImg.set({ dirty: true });
    },
    [registerAssetBlob]
  );

  useEffect(() => {
    replaceImageWithBlobRef.current = replaceImageWithBlob;
  }, [replaceImageWithBlob]);

  const applyRemoveBackground = useCallback(
    async (quality: 'fast' | 'hd') => {
      const canvas = fabricCanvasRef.current;
      const active = canvas?.getActiveObject();
      const targetImg =
        active instanceof fabric.FabricImage
          ? active
          : canvas
              ?.getObjects()
              .slice()
              .reverse()
              .find(
                (o): o is fabric.FabricImage => o instanceof fabric.FabricImage
              );
      if (!canvas || !targetImg) {
        toast.info('Import an image layer first.');
        return;
      }

      const isMobileLite =
        typeof window !== 'undefined' && window.innerWidth < 1024;
      const effectiveQuality: 'fast' | 'hd' = isMobileLite ? 'fast' : quality;
      const maxEdge = isMobileLite ? 1024 : 1280;

      const extracted = extractImageRgbaForAi(targetImg, maxEdge);
      if (!extracted) return;

      try {
        const res = await ai.runRemoveBackground(
          extracted.rgba,
          extracted.width,
          extracted.height,
          effectiveQuality
        );
        if (!res) return;

        await applyAlphaMatteToLayerMask(
          targetImg,
          res.alpha,
          res.width,
          res.height
        );
        canvas.setActiveObject(targetImg);
        canvas.requestRenderAll();
        syncCanvasUi();
        commitHistoryRef.current('AI Remove Background', 'immediate');
        toast.success('Applied non-destructive AI background mask');
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Background removal failed.'
        );
      }
    },
    [ai, syncCanvasUi]
  );

  const clearSamSelection = useCallback(() => {
    samPointsRef.current = [];
    samRawMaskRef.current = null;
    samOverlayCanvasRef.current = null;
    setSamPointsCount(0);
    setSamHasMask(false);
    fabricCanvasRef.current?.requestRenderAll();
  }, []);

  const applySamAsMask = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    const target = samTargetImgRef.current;
    const raw = samRawMaskRef.current;
    if (!canvas || !target || !raw) return;

    await applyAlphaMatteToLayerMask(target, raw.alpha, raw.width, raw.height);
    clearSamSelection();
    setActiveTool('select');
    canvas.setActiveObject(target);
    canvas.requestRenderAll();
    syncCanvasUi();
    commitHistoryRef.current('AI Magic Select Mask', 'immediate');
  }, [clearSamSelection, setActiveTool, syncCanvasUi]);

  const extractSamLayer = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    const target = samTargetImgRef.current;
    const raw = samRawMaskRef.current;
    if (!canvas || !target || !raw) return;

    const extracted = await extractMaskedSubjectToBlob(
      target,
      raw.alpha,
      raw.width,
      raw.height
    );
    if (!extracted) {
      toast.info('No foreground region found in selection.');
      return;
    }

    const assetId = generateUid('asset');
    const url = registerAssetBlob(assetId, extracted.blob);
    const cutoutImg = await fabric.FabricImage.fromURL(url, {
      crossOrigin: 'anonymous',
    });
    cutoutImg.set({
      left: extracted.centerSceneX,
      top: extracted.centerSceneY,
      originX: 'center',
      originY: 'center',
      scaleX: extracted.scaleX,
      scaleY: extracted.scaleY,
      ...FABRIC_OBJECT_CONTROLS_STYLE,
    });
    stampLayerMeta(cutoutImg, {
      kind: 'image',
      name: `${(target as ExtendedFabricObject)._layerName || 'Subject'} Cutout`,
      assetId,
    });

    canvas.add(cutoutImg);
    clearSamSelection();
    setActiveTool('select');
    canvas.setActiveObject(cutoutImg);
    canvas.requestRenderAll();
    syncCanvasUi();
    commitHistoryRef.current('AI Extract Selection', 'immediate');
    toast.success('Extracted selection as a new layer');
  }, [clearSamSelection, registerAssetBlob, setActiveTool, syncCanvasUi]);

  const clearMagicEraserMask = useCallback(() => {
    magicEraserCanvasRef.current = null;
    magicEraserTargetRef.current = null;
    setMagicEraserHasStrokes(false);
    fabricCanvasRef.current?.requestRenderAll();
  }, []);

  const runMagicErase = useCallback(
    async (mode: 'quick' | 'lama') => {
      const canvas = fabricCanvasRef.current;
      const target = magicEraserTargetRef.current;
      const maskCanvas = magicEraserCanvasRef.current;
      if (!canvas || !target || !maskCanvas) return;

      const el = target.getElement();
      if (!el || el instanceof HTMLVideoElement) return;

      try {
        let outBlob: Blob | null = null;
        if (mode === 'quick') {
          outBlob = await runFastPatchInpaintBlob(el, maskCanvas);
        } else {
          const roiData = extractInpaintRoi(el, maskCanvas, 512);
          if (!roiData) {
            toast.info('Brush over an area to erase first.');
            return;
          }
          const lamaRes = await ai.runLamaInpaint(
            roiData.imageRgba,
            roiData.maskGray,
            512
          );
          if (!lamaRes) return;
          outBlob = await compositeInpaintRoiToBlob(
            el,
            maskCanvas,
            roiData.roi,
            lamaRes.rgba,
            512
          );
        }

        if (!outBlob) return;
        await replaceImageWithBlob(target, outBlob);
        clearMagicEraserMask();
        setActiveTool('select');
        canvas.setActiveObject(target);
        canvas.requestRenderAll();
        syncCanvasUi();
        commitHistoryRef.current(
          mode === 'lama' ? 'AI LaMa Magic Erase' : 'Quick Magic Erase',
          'immediate'
        );
        toast.success('Magic Erase applied cleanly');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Magic Erase failed.');
      }
    },
    [
      ai,
      clearMagicEraserMask,
      replaceImageWithBlob,
      setActiveTool,
      syncCanvasUi,
    ]
  );

  const generateDepthMap = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !(active instanceof fabric.FabricImage)) {
      toast.info('Select an image layer first.');
      return;
    }

    const layerId = stampLayerMeta(active);
    const extracted = extractImageRgbaForAi(active, 1024);
    if (!extracted) return;

    try {
      const depth = await ai.runDepthEstimation(
        extracted.rgba,
        extracted.width,
        extracted.height,
        layerId
      );
      if (!depth) return;

      depthMapsByLayerRef.current.set(layerId, depth);
      setActiveDepthMap(depth);
      toast.success('3D depth map ready — adjust Focus Plane & Bokeh below');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Depth estimation failed.'
      );
    }
  }, [ai]);

  const applyDepthBokeh = useCallback(
    async (focusDepth01: number, blurRadiusPx: number) => {
      const canvas = fabricCanvasRef.current;
      const active = canvas?.getActiveObject();
      if (!canvas || !(active instanceof fabric.FabricImage)) return;

      const el = active.getElement();
      if (!el || el instanceof HTMLVideoElement) return;
      const layerId = (active as ExtendedFabricObject)._layerId || '';
      const depth = depthMapsByLayerRef.current.get(layerId);
      if (!depth) {
        toast.info('Estimate the 3D Depth Map first.');
        return;
      }

      try {
        const blob = await renderDepthBokehBlob(
          el,
          depth,
          focusDepth01,
          blurRadiusPx
        );
        await replaceImageWithBlob(active, blob);
        canvas.requestRenderAll();
        syncCanvasUi();
        commitHistoryRef.current('Apply 3D Depth Bokeh', 'immediate');
        toast.success('Rendered 3D Depth Bokeh');
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to render depth bokeh.'
        );
      }
    },
    [replaceImageWithBlob, syncCanvasUi]
  );

  const applyTextBehindSubject = useCallback(
    async (cutoff01: number) => {
      const canvas = fabricCanvasRef.current;
      const active = canvas?.getActiveObject();
      if (!canvas || !(active instanceof fabric.FabricImage)) return;

      const ext = active as ExtendedFabricObject;
      const layerId = ext._layerId || '';
      const depth = depthMapsByLayerRef.current.get(layerId);
      if (!depth) {
        toast.info('Estimate the 3D Depth Map first.');
        return;
      }

      const fgAlpha = buildForegroundAlphaFromDepth(depth, cutoff01);
      const idx = canvas.getObjects().indexOf(active);

      const textObj = new fabric.Textbox('FEATURE', {
        left: active.left ?? docConfigRef.current.width / 2,
        top: (active.top ?? docConfigRef.current.height / 2) - 40,
        originX: 'center',
        originY: 'center',
        width: Math.max(240, Math.round(active.getScaledWidth() * 0.85)),
        fontSize: Math.max(64, Math.round(active.getScaledHeight() * 0.22)),
        fontWeight: 'bold',
        fontFamily: 'Impact, Charcoal, sans-serif',
        textAlign: 'center',
        fill: '#ffffff',
        ...FABRIC_OBJECT_CONTROLS_STYLE,
      });
      stampLayerMeta(textObj, { kind: 'text', name: 'Behind Subject Text' });

      const fgClone = (await active.clone(
        CUSTOM_SERIALIZATION_PROPS
      )) as fabric.FabricImage;
      stampLayerMeta(fgClone, {
        id: generateUid('layer'),
        kind: 'image',
        name: `${ext._layerName || 'Subject'} Foreground`,
        assetId: ext._assetId,
      });
      fgClone.set({ ...FABRIC_OBJECT_CONTROLS_STYLE });
      await applyAlphaMatteToLayerMask(
        fgClone,
        fgAlpha,
        depth.width,
        depth.height
      );

      canvas.insertAt(idx + 1, textObj);
      canvas.insertAt(idx + 2, fgClone);
      canvas.setActiveObject(textObj);
      canvas.requestRenderAll();
      syncCanvasUi();
      commitHistoryRef.current('Create Text Behind Subject', 'immediate');
      toast.success('Sandwiched editable text behind subject');
    },
    [syncCanvasUi]
  );

  const applyAiUpscale2x = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !(active instanceof fabric.FabricImage)) return;

    const extracted = extractImageRgbaForAi(active, 768);
    if (!extracted) return;

    try {
      const up = await ai.runUpscale2x(
        extracted.rgba,
        extracted.width,
        extracted.height
      );
      if (!up) return;

      const c = document.createElement('canvas');
      c.width = up.width;
      c.height = up.height;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      const imgData = ctx.createImageData(up.width, up.height);
      imgData.data.set(up.rgba);
      ctx.putImageData(imgData, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) =>
        c.toBlob(resolve, 'image/png')
      );
      if (!blob) return;

      const prevNatW = active.width || extracted.width;
      const scaleFactor = prevNatW / up.width;
      await replaceImageWithBlob(active, blob, { scaleFactor });
      canvas.requestRenderAll();
      syncCanvasUi();
      commitHistoryRef.current('AI 2x Super-Resolution', 'immediate');
      toast.success(`Upscaled layer to ${up.width}×${up.height}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '2x Upscale failed.');
    }
  }, [ai, replaceImageWithBlob, syncCanvasUi]);

  const applyFacePrivacyMosaic = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !(active instanceof fabric.FabricImage)) return;
    const el = active.getElement();
    if (!el || el instanceof HTMLVideoElement) return;

    try {
      const faces = await detectFacesOnImage(el);
      if (faces.length === 0) {
        toast.info('No faces detected in the selected layer.');
        return;
      }
      const blob = await createFaceMosaicLayerBlob(el, faces, 20);
      if (!blob) return;

      const assetId = generateUid('asset');
      const url = registerAssetBlob(assetId, blob);
      const mosaicImg = await fabric.FabricImage.fromURL(url, {
        crossOrigin: 'anonymous',
      });
      mosaicImg.set({
        left: active.left,
        top: active.top,
        originX: active.originX,
        originY: active.originY,
        scaleX: active.scaleX,
        scaleY: active.scaleY,
        angle: active.angle,
        ...FABRIC_OBJECT_CONTROLS_STYLE,
      });
      stampLayerMeta(mosaicImg, {
        kind: 'image',
        name: `Face Privacy (${faces.length})`,
        assetId,
      });
      canvas.add(mosaicImg);
      canvas.setActiveObject(mosaicImg);
      canvas.requestRenderAll();
      syncCanvasUi();
      commitHistoryRef.current('Auto Face Privacy Mosaic', 'immediate');
      toast.success(`Blurred ${faces.length} detected face(s)`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Face detection failed.'
      );
    }
  }, [registerAssetBlob, syncCanvasUi]);

  const applySmartFaceCrop = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !(active instanceof fabric.FabricImage)) return;
    const el = active.getElement();
    if (!el || el instanceof HTMLVideoElement) return;

    try {
      const faces = await detectFacesOnImage(el);
      if (faces.length === 0) {
        toast.info('No faces detected to center around.');
        return;
      }

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const f of faces) {
        minX = Math.min(minX, f.x);
        minY = Math.min(minY, f.y);
        maxX = Math.max(maxX, f.x + f.width);
        maxY = Math.max(maxY, f.y + f.height);
      }

      const natW = active.width || 1;
      const natH = active.height || 1;
      const faceCx = (minX + maxX) / 2 - natW / 2;
      const faceCy = (minY + maxY) / 2 - natH / 2;
      const scenePt = new fabric.Point(faceCx, faceCy).transform(
        active.calcTransformMatrix()
      );
      const { width: dw, height: dh } = docConfigRef.current;

      active.set({
        left: (active.left ?? 0) + (dw / 2 - scenePt.x),
        top: (active.top ?? 0) + (dh / 2 - scenePt.y),
      });
      active.setCoords();
      canvas.requestRenderAll();
      syncCanvasUi();
      commitHistoryRef.current('Smart Face Center Align', 'immediate');
      toast.success('Centered portrait around detected face(s)');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Smart face crop failed.'
      );
    }
  }, [syncCanvasUi]);

  const extractOcrTextLayers = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !(active instanceof fabric.FabricImage)) return;
    const el = active.getElement();
    if (!el || el instanceof HTMLVideoElement) return;

    try {
      const blocks = await detectTextBlocksOnImage(el);
      if (blocks.length === 0) {
        toast.info('No readable text detected in the image.');
        return;
      }

      const natW = active.width || 1;
      const natH = active.height || 1;
      const mat = active.calcTransformMatrix();
      let created = 0;

      for (const b of blocks.slice(0, 12)) {
        const localPt = new fabric.Point(
          b.x - natW / 2,
          b.y - natH / 2
        ).transform(mat);
        const tb = new fabric.Textbox(b.text, {
          left: localPt.x,
          top: localPt.y,
          originX: 'left',
          originY: 'top',
          width: Math.max(80, Math.round(b.width * (active.scaleX || 1) * 1.1)),
          fontSize: Math.max(
            14,
            Math.round(b.height * (active.scaleY || 1) * 0.78)
          ),
          fill: '#0f172a',
          ...FABRIC_OBJECT_CONTROLS_STYLE,
        });
        stampLayerMeta(tb, {
          kind: 'text',
          name: `OCR: ${b.text.slice(0, 18)}`,
        });
        canvas.add(tb);
        created++;
      }

      if (created > 0) {
        canvas.requestRenderAll();
        syncCanvasUi();
        commitHistoryRef.current('OCR Extract Text Layers', 'immediate');
        toast.success(`Extracted ${created} editable text layer(s)`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'OCR failed.');
    }
  }, [syncCanvasUi]);

  const runChromeAiCopy = useCallback(async (action: ChromeAiActionId) => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    const sourceText =
      active &&
      (active instanceof fabric.Textbox || active instanceof fabric.IText)
        ? active.text || ''
        : 'Summer Design Collection';

    try {
      const generated = await runChromeAiCopyAction(sourceText, action);
      const labelMap: Record<ChromeAiActionId, string> = {
        headline: 'Poster Headline',
        shorter: 'Shorter Copy',
        translate: 'Translated Copy',
        grammar: 'Grammar Fixed',
      };
      setChromeAiPreview({ actionLabel: labelMap[action], text: generated });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Chrome Built-in AI request failed.'
      );
    }
  }, []);

  const applyChromeAiPreview = useCallback(
    (mode: 'replace' | 'new') => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || !chromeAiPreview) return;

      const active = canvas.getActiveObject();
      if (
        mode === 'replace' &&
        active &&
        (active instanceof fabric.Textbox || active instanceof fabric.IText)
      ) {
        active.set({ text: chromeAiPreview.text });
        active.initDimensions();
        active.setCoords();
        canvas.requestRenderAll();
        syncCanvasUi();
        commitHistoryRef.current('Apply AI Text Copy', 'immediate');
      } else {
        const tb = new fabric.Textbox(chromeAiPreview.text, {
          left: docConfigRef.current.width / 2,
          top: docConfigRef.current.height / 2,
          originX: 'center',
          originY: 'center',
          width: 420,
          fontSize: 48,
          fontWeight: 'bold',
          fill: '#0f172a',
          ...FABRIC_OBJECT_CONTROLS_STYLE,
        });
        stampLayerMeta(tb, { kind: 'text', name: 'AI Copy Layer' });
        canvas.add(tb);
        canvas.setActiveObject(tb);
        canvas.requestRenderAll();
        syncCanvasUi();
        commitHistoryRef.current('Add AI Text Layer', 'immediate');
      }
      setChromeAiPreview(null);
    },
    [chromeAiPreview, syncCanvasUi]
  );

  const discardChromeAiPreview = useCallback(() => {
    setChromeAiPreview(null);
  }, []);

  const isEditingTextOnCanvas = useCallback((): boolean => {
    const active = fabricCanvasRef.current?.getActiveObject();
    return Boolean(
      active &&
        (active instanceof fabric.Textbox || active instanceof fabric.IText) &&
        active.isEditing
    );
  }, []);

  const applyStarterTemplate = useCallback(
    (templateId: StarterTemplateId) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const nextDoc = buildStarterTemplateOnCanvas(
        canvas,
        templateId,
        stampLayerMeta,
        applyControlsStyleRecursive
      );
      docConfigRef.current = nextDoc;
      setDocConfig(nextDoc);
      setActiveTool('select');
      fitToScreen();
      canvas.requestRenderAll();
      syncCanvasUi();
      commitHistoryRef.current('Apply Starter Template', 'immediate');
      toast.success('Starter template applied');
    },
    [fitToScreen, setActiveTool, syncCanvasUi]
  );

  const addTextLayer = useCallback(
    (textContent = 'Double-click to edit') => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const { width: dw, height: dh } = docConfigRef.current;
      const fontSize = Math.max(24, Math.round(Math.min(dw, dh) * 0.055));
      const textbox = new fabric.Textbox(textContent, {
        left: dw / 2,
        top: dh / 2,
        width: Math.min(dw * 0.8, 540),
        originX: 'center',
        originY: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize,
        fontWeight: 'bold',
        fill: '#0f172a',
        textAlign: 'center',
        ...FABRIC_OBJECT_CONTROLS_STYLE,
      });
      stampLayerMeta(textbox, {
        kind: 'text',
        name: textContent.slice(0, 24) || 'Text Layer',
      });
      canvas.add(textbox);
      canvas.setActiveObject(textbox);
      setActiveTool('select');
      canvas.requestRenderAll();
      syncCanvasUi();
      commitHistoryRef.current('Add Text Layer', 'immediate');
    },
    [setActiveTool, syncCanvasUi]
  );

  const sendToPicMerge = useCallback(
    async (scope: 'canvas' | 'selected' = 'canvas') => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      if (!isDbSupported) {
        toast.error('IndexedDB is unavailable in this browser session.');
        return;
      }

      const active = canvas.getActiveObject();
      let blob: Blob | null = null;
      let width = docConfigRef.current.width;
      let height = docConfigRef.current.height;
      let itemName = 'photo-editor-export.png';

      if (scope === 'selected' && active) {
        const dataUrl = active.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 1,
        });
        blob = await (await fetch(dataUrl)).blob();
        width = Math.max(100, Math.round(active.getScaledWidth()));
        height = Math.max(100, Math.round(active.getScaledHeight()));
        itemName = `${(active as ExtendedFabricObject)._layerName || 'cutout'}.png`;
      } else {
        const dataUrl = renderExportDataUrl('png', 1, 1);
        if (dataUrl) {
          blob = await (await fetch(dataUrl)).blob();
        }
      }

      if (!blob) {
        toast.info('Nothing on canvas to send to PicMerge Studio.');
        return;
      }

      await writeStudioHandoff(dbSetValue, 'pic-merge-studio', {
        version: 1,
        createdAt: Date.now(),
        source: 'photo-editor',
        width,
        height,
        backgroundColor:
          docConfigRef.current.backgroundType === 'color'
            ? docConfigRef.current.backgroundColor
            : undefined,
        items: [{ name: itemName, blob }],
      });

      const baseUrl =
        ToolUrls[ToolKeys.picMergeStudio] ||
        '/tools/image-tool/pic-merge-studio';
      router.push(`${baseUrl}?handoff=1`);
    },
    [dbSetValue, isDbSupported, renderExportDataUrl, router]
  );

  const hasCheckedHandoffRef = useRef(false);
  useEffect(() => {
    if (!isFabricReady || !isDbSupported || hasCheckedHandoffRef.current)
      return;
    if (!hasHandoffQueryParam()) return;
    hasCheckedHandoffRef.current = true;

    const runHandoffImport = async () => {
      const payload = await consumeStudioHandoff(
        dbGetValue,
        dbDeleteValue,
        'photo-editor'
      );
      clearHandoffQueryParam();
      const canvas = fabricCanvasRef.current;
      if (!payload || !canvas) return;

      const isMobile =
        typeof window !== 'undefined' && window.innerWidth < 1024;
      const maxEdge = isMobile ? MOBILE_MAX_IMPORT_EDGE : 4096;
      const ratio = Math.min(
        1,
        maxEdge / Math.max(payload.width, payload.height, 1)
      );
      const nextDoc: DocumentConfig = {
        width: Math.max(100, Math.round(payload.width * ratio)),
        height: Math.max(100, Math.round(payload.height * ratio)),
        backgroundType: payload.backgroundColor ? 'color' : 'transparent',
        backgroundColor: payload.backgroundColor || '#ffffff',
        backgroundOpacity: 1,
      };
      docConfigRef.current = nextDoc;
      setDocConfig(nextDoc);

      for (const item of payload.items) {
        const assetId = generateUid('asset');
        const url = registerAssetBlob(assetId, item.blob);
        const img = await fabric.FabricImage.fromURL(url, {
          crossOrigin: 'anonymous',
        });
        const scaleX = (item.scaleX ?? 1) * ratio;
        const scaleY = (item.scaleY ?? 1) * ratio;
        img.set({
          left: (item.left ?? payload.width / 2) * ratio,
          top: (item.top ?? payload.height / 2) * ratio,
          originX: 'center',
          originY: 'center',
          scaleX,
          scaleY,
          angle: item.angle ?? 0,
          opacity: item.opacity ?? 1,
          ...FABRIC_OBJECT_CONTROLS_STYLE,
        });
        stampLayerMeta(img, {
          kind: 'image',
          name: item.name || 'Imported Collage Layer',
          assetId,
        });
        canvas.add(img);
        canvas.setActiveObject(img);
      }

      fitToScreen();
      canvas.requestRenderAll();
      syncCanvasUi();
      commitHistoryRef.current('Import from PicMerge Studio', 'immediate');
      toast.success('Imported layers from PicMerge Studio');
    };

    void runHandoffImport();
  }, [
    dbDeleteValue,
    dbGetValue,
    fitToScreen,
    isDbSupported,
    isFabricReady,
    registerAssetBlob,
    syncCanvasUi,
  ]);

  return {
    states: {
      isFabricReady,
      activeTool,
      docConfig,
      brushSettings,
      maskBrushSettings,
      shapeSettings,
      snapGuidesEnabled,
      rulersVisible,
      userGuides,
      zoom,
      viewportTransform,
      stageSize,
      cursorPos,
      layers,
      selectedProps,
      filterValues,
      activeImageEl,
      filterRevision,
      sampledColor,
      isComparingOriginal,
      beforeSnapshotUrl,
      compareSplitPercent,
      cropAspect,
      cropRect,
      penAnchorCount,
      customFonts,
      samPointsCount,
      samHasMask,
      magicEraserSize,
      magicEraserHasStrokes,
      mosaicBrushSize,
      activeDepthMap,
      chromeAiPreview,
    },
    setActiveTool,
    setSnapGuidesEnabled,
    toggleRulers,
    addOrDragUserGuide,
    clearUserGuides,
    setSpacePanMode,
    updateBrushSettings,
    updateMaskBrushSettings,
    updateShapeSettings,
    updateDocumentConfig,
    fitToScreen,
    zoomIn: () => applyZoomToViewport(zoom * 1.2),
    zoomOut: () => applyZoomToViewport(zoom / 1.2),
    zoomTo100: () => applyZoomToViewport(1),
    addImages,
    openPesFile,
    openPsdFile,
    savePesProject,
    exportDocument,
    copyPngToClipboard,
    updateSelectedProp,
    updateSelectedBlendMode,
    updateSelectedShadow,
    updateSelectedClipShape,
    updateSelectedFilters,
    toggleCompareOriginal,
    setCompareSplitPercent,
    setCropAspect,
    applyCrop,
    cancelCrop,
    finishPenPath,
    cancelPenPath,
    togglePathNodeEditing,
    runBooleanOp,
    updateTextCurve,
    loadCustomFont,
    convertSelectedTextToOutlines,
    addLayerMask,
    invertSelectedMask,
    removeSelectedMask,
    toggleClipToLayerBelow,
    loadCubeLutFile,
    applyRemoveBackground,
    applySamAsMask,
    extractSamLayer,
    clearSamSelection,
    setMagicEraserSize,
    setMosaicBrushSize,
    runMagicErase,
    clearMagicEraserMask,
    applyStarterTemplate,
    addTextLayer,
    sendToPicMerge,
    generateDepthMap,
    applyDepthBokeh,
    applyTextBehindSubject,
    applyAiUpscale2x,
    applyFacePrivacyMosaic,
    applySmartFaceCrop,
    extractOcrTextLayers,
    runChromeAiCopy,
    applyChromeAiPreview,
    discardChromeAiPreview,
    selectLayerById,
    selectAllLayers,
    discardSelection,
    toggleLayerVisibility,
    toggleLayerLock,
    renameLayer,
    deleteLayerById,
    deleteSelected,
    duplicateSelected,
    groupSelected,
    ungroupSelected,
    reorderVisualLayers,
    reorderSelectedOrder,
    alignSelected,
    nudgeSelected,
    isEditingTextOnCanvas,
    history,
    ai,
  };
}
