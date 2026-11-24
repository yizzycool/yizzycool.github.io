import type {
  CanvasConfig,
  GlobalImageConfig,
  ImageCropAspect,
  ImageMaskShape,
  ImageShadowConfig,
} from '../types/config';
import type { GridTemplate } from '../types/grid-layout';

import * as fabric from 'fabric';

import colorUtils from '@/utils/color-utils';

import { FABRIC_FILTER_MAP } from '../data/fabric-filters';

export type SerializedFilter = {
  type: string;
  params: Record<string, number | string | boolean | number[]>;
};

export type SerializedImageLayer = {
  assetId: string;
  layerId: string;
  fileName: string;
  layerName: string;
  src: string;
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  opacity: number;
  visible: boolean;
  flipX: boolean;
  flipY: boolean;
  lockMovementX: boolean;
  lockMovementY: boolean;
  snapAngle: number;
  snapThreshold: number;
  stroke: string;
  strokeWidth: number;
  strokeWidthRatio: number;
  cropAspect?: ImageCropAspect;
  maskShape?: ImageMaskShape;
  shadow?: ImageShadowConfig;
  filters: SerializedFilter[];
};

export type SerializedCaptionLayer = {
  id: string;
  text: string;
  left: number;
  top: number;
  width: number;
  fontSize: number;
  fill: string;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
  angle: number;
  opacity: number;
  scaleX: number;
  scaleY: number;
};

export type SerializedGridCell = {
  row: number;
  col: number;
  hasSrc: boolean;
  layer: SerializedImageLayer | null;
  clipPath: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
};

export type SerializedGridEdge = {
  direction: 'horizontal' | 'vertical';
  index: number;
  left: number;
  top: number;
  width: number;
  height: number;
};

export type StudioSnapshot = {
  canvasConfig: CanvasConfig;
  globalImageConfig: GlobalImageConfig;
  freeLayers: SerializedImageLayer[];
  captions?: SerializedCaptionLayer[];
  gridData: {
    rows: number;
    cols: number;
    cells: SerializedGridCell[];
    edges: SerializedGridEdge[];
  } | null;
};

export type PersistedStudioDraft = {
  version: 1;
  savedAt: number;
  snapshot: StudioSnapshot;
  assets: Record<string, Blob>;
};

export type ExtendedFabricImage = fabric.FabricImage & {
  _assetId?: string;
  _layerId?: string;
  _fileName?: string;
  _layerName?: string;
  _strokeWidthRatio?: number;
  _cropAspect?: ImageCropAspect;
  _maskShape?: ImageMaskShape;
};

export type ExtendedCaptionTextbox = fabric.Textbox & {
  _customKey?: string;
  _captionId?: string;
};

/**
 * Build a relative non-destructive Fabric clipPath implementing both
 * optional crop aspect ratio and geometric mask shape (circle, rounded, squircle, polaroid).
 */
export function buildImageClipPath(
  img: fabric.FabricImage,
  maskShape: ImageMaskShape = 'none',
  cropAspect: ImageCropAspect = 'none'
): fabric.FabricObject | undefined {
  const rawW = img.width || 100;
  const rawH = img.height || 100;
  if (maskShape === 'none' && cropAspect === 'none') {
    return undefined;
  }

  let boxW = rawW;
  let boxH = rawH;

  if (cropAspect !== 'none') {
    const [arW, arH] = cropAspect.split(':').map(Number);
    const targetRatio = arW && arH ? arW / arH : rawW / rawH;
    const currentRatio = rawW / rawH;
    if (currentRatio > targetRatio) {
      boxW = rawH * targetRatio;
    } else {
      boxH = rawW / targetRatio;
    }
  }

  if (maskShape === 'circle') {
    const radius = Math.min(boxW, boxH) / 2;
    return new fabric.Circle({
      radius,
      originX: 'center',
      originY: 'center',
    });
  }

  if (maskShape === 'polaroid') {
    return new fabric.Rect({
      width: boxW * 0.88,
      height: boxH * 0.78,
      top: -boxH * 0.05,
      left: 0,
      rx: Math.min(boxW, boxH) * 0.02,
      ry: Math.min(boxW, boxH) * 0.02,
      originX: 'center',
      originY: 'center',
    });
  }

  if (maskShape === 'squircle') {
    const rx = boxW * 0.5;
    const ry = boxH * 0.5;
    const c = 0.82;
    const d = [
      `M 0 ${-ry}`,
      `C ${rx * c} ${-ry}, ${rx} ${-ry * c}, ${rx} 0`,
      `C ${rx} ${ry * c}, ${rx * c} ${ry}, 0 ${ry}`,
      `C ${-rx * c} ${ry}, ${-rx} ${ry * c}, ${-rx} 0`,
      `C ${-rx} ${-ry * c}, ${-rx * c} ${-ry}, 0 ${-ry} Z`,
    ].join(' ');
    return new fabric.Path(d, {
      originX: 'center',
      originY: 'center',
    });
  }

  if (maskShape === 'rounded') {
    const radius = Math.min(boxW, boxH) * 0.14;
    return new fabric.Rect({
      width: boxW,
      height: boxH,
      rx: radius,
      ry: radius,
      originX: 'center',
      originY: 'center',
    });
  }

  return new fabric.Rect({
    width: boxW,
    height: boxH,
    originX: 'center',
    originY: 'center',
  });
}

/**
 * Extract normalized ImageShadowConfig from a Fabric object's shadow.
 */
export function extractImageShadowConfig(
  img: fabric.FabricObject
): ImageShadowConfig {
  const s = img.shadow as fabric.Shadow | null | undefined;
  if (!s) {
    return {
      enabled: false,
      blur: 18,
      offsetX: 0,
      offsetY: 8,
      opacity: 0.35,
      color: '#000000',
    };
  }
  const rgba = colorUtils.hexToRgba(s.color || '#000000');
  const hex = colorUtils.rgbaToHex({
    r: rgba.r,
    g: rgba.g,
    b: rgba.b,
    a: 1,
  });
  return {
    enabled: true,
    blur: s.blur ?? 18,
    offsetX: s.offsetX ?? 0,
    offsetY: s.offsetY ?? 8,
    opacity: typeof rgba.a === 'number' ? Math.round(rgba.a * 100) / 100 : 0.35,
    color: hex.slice(0, 7).toUpperCase(),
  };
}

/**
 * Stamp internal asset and layer identifiers onto a FabricImage instance.
 */
export function attachImageAssetMeta(
  img: fabric.FabricImage,
  meta: {
    assetId?: string;
    fileName?: string;
    layerName?: string;
    layerId?: string;
  }
): string {
  const extImg = img as ExtendedFabricImage;
  const assetId =
    meta.assetId ||
    extImg._assetId ||
    `asset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  extImg._assetId = assetId;
  if (meta.fileName !== undefined) extImg._fileName = meta.fileName;
  if (meta.layerName !== undefined) extImg._layerName = meta.layerName;
  if (meta.layerId !== undefined) extImg._layerId = meta.layerId;

  return assetId;
}

/**
 * Serialize active Fabric filters into plain JSON-friendly objects.
 */
export function serializeFilters(
  filters: fabric.FabricImage['filters'] | undefined
): SerializedFilter[] {
  if (!filters || filters.length === 0) return [];

  const result: SerializedFilter[] = [];
  for (const filter of filters) {
    if (!filter) continue;
    const filterType = filter.type;
    const filterDef = FABRIC_FILTER_MAP[filterType];
    if (!filterDef) continue;

    const params: Record<string, number | string | boolean | number[]> = {};
    if (filterDef.params) {
      const record = filter as unknown as Record<string, unknown>;
      for (const paramKey of Object.keys(filterDef.params)) {
        const val = record[paramKey];
        if (
          typeof val === 'number' ||
          typeof val === 'string' ||
          typeof val === 'boolean' ||
          (Array.isArray(val) && val.every((n) => typeof n === 'number'))
        ) {
          params[paramKey] = val;
        }
      }
      if (typeof record._sharpenAmount === 'number') {
        params._sharpenAmount = record._sharpenAmount;
      }
    }

    result.push({ type: filterType, params });
  }

  return result;
}

/**
 * Reconstruct Fabric filter instances from serialized descriptors.
 */
export function deserializeFilters(
  serialized: SerializedFilter[]
): fabric.filters.BaseFilter<string>[] {
  const filters: fabric.filters.BaseFilter<string>[] = [];

  for (const item of serialized) {
    const filterDef = FABRIC_FILTER_MAP[item.type];
    if (!filterDef) continue;
    const instance = new filterDef.filter(
      item.params as Record<string, unknown>
    );
    if (typeof item.params._sharpenAmount === 'number') {
      (instance as unknown as { _sharpenAmount?: number })._sharpenAmount =
        item.params._sharpenAmount;
    }
    filters.push(instance as fabric.filters.BaseFilter<string>);
  }

  return filters;
}

function serializeImageObject(
  img: fabric.FabricImage,
  fallbackIndex: number
): SerializedImageLayer {
  const extImg = img as ExtendedFabricImage;

  // Resolve canvas-space transform even if object is inside an ActiveSelection
  let left = img.left ?? 0;
  let top = img.top ?? 0;
  let scaleX = img.scaleX ?? 1;
  let scaleY = img.scaleY ?? 1;
  let angle = img.angle ?? 0;

  if (img.group) {
    const center = fabric.util.transformPoint(
      new fabric.Point(0, 0),
      img.calcTransformMatrix()
    );
    left = center.x;
    top = center.y;
    scaleX = (img.scaleX ?? 1) * (img.group.scaleX ?? 1);
    scaleY = (img.scaleY ?? 1) * (img.group.scaleY ?? 1);
    angle = (img.angle ?? 0) + (img.group.angle ?? 0);
  }

  const assetId = attachImageAssetMeta(img, {});
  const layerId = extImg._layerId || `layer_${fallbackIndex}_${Date.now()}`;
  extImg._layerId = layerId;

  const fileName = extImg._fileName || '';
  const layerName =
    extImg._layerName || fileName || `Layer ${fallbackIndex + 1}`;
  extImg._layerName = layerName;

  return {
    assetId,
    layerId,
    fileName,
    layerName,
    src: img.getSrc?.() || '',
    left,
    top,
    scaleX,
    scaleY,
    angle,
    opacity: img.opacity ?? 1,
    visible: img.visible !== false,
    flipX: Boolean(img.flipX),
    flipY: Boolean(img.flipY),
    lockMovementX: Boolean(img.lockMovementX),
    lockMovementY: Boolean(img.lockMovementY),
    snapAngle: img.snapAngle ?? 90,
    snapThreshold: img.snapThreshold ?? 5,
    stroke: typeof img.stroke === 'string' ? img.stroke : '',
    strokeWidth: img.strokeWidth ?? 0,
    strokeWidthRatio: extImg._strokeWidthRatio ?? 0,
    cropAspect: extImg._cropAspect ?? 'none',
    maskShape: extImg._maskShape ?? 'none',
    shadow: extractImageShadowConfig(img),
    filters: serializeFilters(img.filters),
  };
}

function serializeCaptions(canvas: fabric.Canvas): SerializedCaptionLayer[] {
  const captions: SerializedCaptionLayer[] = [];
  for (const obj of canvas.getObjects()) {
    const ext = obj as ExtendedCaptionTextbox;
    if (obj instanceof fabric.Textbox && ext._customKey === 'studio-caption') {
      captions.push({
        id: ext._captionId || `cap_${Date.now()}`,
        text: obj.text || '',
        left: obj.left ?? 0,
        top: obj.top ?? 0,
        width: obj.width ?? 360,
        fontSize: obj.fontSize ?? 42,
        fill: typeof obj.fill === 'string' ? obj.fill : '#ffffff',
        fontWeight: obj.fontWeight === 'bold' ? 'bold' : 'normal',
        textAlign:
          obj.textAlign === 'left' || obj.textAlign === 'right'
            ? obj.textAlign
            : 'center',
        angle: obj.angle ?? 0,
        opacity: obj.opacity ?? 1,
        scaleX: obj.scaleX ?? 1,
        scaleY: obj.scaleY ?? 1,
      });
    }
  }
  return captions;
}

/**
 * Capture a lossless snapshot of the current Fabric canvas, layout configuration,
 * and image layers for Undo/Redo and IndexedDB auto-save.
 */
export function captureStudioSnapshot(
  canvas: fabric.Canvas,
  grid: GridTemplate | null,
  canvasConfig: CanvasConfig,
  globalImageConfig: GlobalImageConfig
): StudioSnapshot {
  const clonedCanvasConfig: CanvasConfig = structuredClone(canvasConfig);
  const clonedGlobalConfig: GlobalImageConfig =
    structuredClone(globalImageConfig);

  if (clonedCanvasConfig.layout === 'grid' && grid) {
    const rows = grid.cells.length;
    const cols = rows > 0 ? grid.cells[0].length : 0;
    const cells: SerializedGridCell[] = [];
    let cellCounter = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid.cells[r]?.[c];
        if (!cell) continue;
        const img = cell.element;
        const clip = img.clipPath;
        const hasSrc = Boolean(img.getSrc?.());

        cells.push({
          row: r,
          col: c,
          hasSrc,
          layer: hasSrc ? serializeImageObject(img, cellCounter) : null,
          clipPath: {
            left: clip?.left ?? 0,
            top: clip?.top ?? 0,
            width: clip?.width ?? 0,
            height: clip?.height ?? 0,
          },
        });
        cellCounter += 1;
      }
    }

    const edges: SerializedGridEdge[] = [];
    const seenEdgeIds = new Set<number>();

    for (const row of grid.edges.horizontal) {
      for (const edge of row) {
        if (!edge || seenEdgeIds.has(edge.id)) continue;
        seenEdgeIds.add(edge.id);
        const edgeMeta = edge.element as fabric.Rect & { _edgeIndex?: number };
        edges.push({
          direction: 'horizontal',
          index: edgeMeta._edgeIndex ?? 1,
          left: edge.element.left ?? 0,
          top: edge.element.top ?? 0,
          width: edge.element.width ?? 0,
          height: edge.element.height ?? 0,
        });
      }
    }

    for (const row of grid.edges.vertical) {
      for (const edge of row) {
        if (!edge || seenEdgeIds.has(edge.id)) continue;
        seenEdgeIds.add(edge.id);
        const edgeMeta = edge.element as fabric.Rect & { _edgeIndex?: number };
        edges.push({
          direction: 'vertical',
          index: edgeMeta._edgeIndex ?? 1,
          left: edge.element.left ?? 0,
          top: edge.element.top ?? 0,
          width: edge.element.width ?? 0,
          height: edge.element.height ?? 0,
        });
      }
    }

    return {
      canvasConfig: clonedCanvasConfig,
      globalImageConfig: clonedGlobalConfig,
      freeLayers: [],
      captions: serializeCaptions(canvas),
      gridData: { rows, cols, cells, edges },
    };
  }

  // Free layout: walk canvas objects in exact z-order
  const freeLayers: SerializedImageLayer[] = [];
  const objects = canvas.getObjects();
  let layerIdx = 0;

  for (const obj of objects) {
    if (obj instanceof fabric.FabricImage) {
      freeLayers.push(serializeImageObject(obj, layerIdx));
      layerIdx += 1;
    } else if (obj instanceof fabric.ActiveSelection) {
      for (const subObj of obj.getObjects()) {
        if (subObj instanceof fabric.FabricImage) {
          freeLayers.push(serializeImageObject(subObj, layerIdx));
          layerIdx += 1;
        }
      }
    }
  }

  return {
    canvasConfig: clonedCanvasConfig,
    globalImageConfig: clonedGlobalConfig,
    freeLayers,
    captions: serializeCaptions(canvas),
    gridData: null,
  };
}

/**
 * Return all assetIds referenced by a snapshot so unused blobs can be pruned.
 */
export function collectSnapshotAssetIds(snapshot: StudioSnapshot): Set<string> {
  const ids = new Set<string>();
  for (const layer of snapshot.freeLayers) {
    if (layer.assetId) ids.add(layer.assetId);
  }
  if (snapshot.gridData) {
    for (const cell of snapshot.gridData.cells) {
      if (cell.layer?.assetId) ids.add(cell.layer.assetId);
    }
  }
  return ids;
}

/**
 * Determine whether a snapshot contains user edits worth persisting or resetting.
 */
export function hasStudioContent(
  snapshot: StudioSnapshot,
  defaultCanvasConfig: CanvasConfig
): boolean {
  if (snapshot.freeLayers.length > 0) return true;
  if ((snapshot.captions?.length ?? 0) > 0) return true;
  if (snapshot.canvasConfig.watermark?.enabled) return true;
  if (snapshot.canvasConfig.layout !== defaultCanvasConfig.layout) return true;
  if (
    snapshot.gridData?.cells.some((cell) => cell.hasSrc && cell.layer !== null)
  ) {
    return true;
  }
  if (
    snapshot.canvasConfig.size.width !== defaultCanvasConfig.size.width ||
    snapshot.canvasConfig.size.height !== defaultCanvasConfig.size.height
  ) {
    return true;
  }
  if (
    snapshot.canvasConfig.background.color?.color !==
      defaultCanvasConfig.background.color?.color ||
    snapshot.canvasConfig.background.color?.opacity !==
      defaultCanvasConfig.background.color?.opacity
  ) {
    return true;
  }
  if (snapshot.canvasConfig.border.width > 0) return true;
  return false;
}
