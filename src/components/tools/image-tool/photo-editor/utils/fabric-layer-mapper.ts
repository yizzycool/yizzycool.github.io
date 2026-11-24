import type {
  BlendMode,
  CinemaEffectsConfig,
  ClipShapeKind,
  CurvesConfig,
  ExtendedFabricObject,
  ImageFilterValues,
  LayerKind,
  LayerSummary,
  LevelsConfig,
  SelectedObjectProps,
  SelectiveHslConfig,
} from '../types/studio';

import * as fabric from 'fabric';

import {
  DEFAULT_CINEMA_EFFECTS,
  DEFAULT_CURVES_CONFIG,
  DEFAULT_FILTER_VALUES,
  DEFAULT_LEVELS_CONFIG,
  DEFAULT_LUT_CONFIG,
  DEFAULT_SELECTIVE_HSL,
  FILTER_PRESETS,
} from '../constants';
import {
  CinemaEffectsFilter,
  CurvesLevelsFilter,
  Lut3dFilter,
  SelectiveHslFilter,
} from '../shaders';
import { isPathInNodeEditMode } from './bezier-pen';

const PRESET_FILTER_CLASSES: Record<
  string,
  new () => fabric.filters.BaseFilter<string>
> = {
  BlackWhite: fabric.filters.BlackWhite,
  Brownie: fabric.filters.Brownie,
  Invert: fabric.filters.Invert,
  Kodachrome: fabric.filters.Kodachrome,
  Polaroid: fabric.filters.Polaroid,
  Sepia: fabric.filters.Sepia,
  Technicolor: fabric.filters.Technicolor,
  Vintage: fabric.filters.Vintage,
};

export function generateUid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Determine layer kind from a Fabric object instance.
 */
export function inferLayerKind(obj: fabric.FabricObject): LayerKind {
  const ext = obj as ExtendedFabricObject;
  if (ext._layerType) return ext._layerType;
  if (obj instanceof fabric.FabricImage) return 'image';
  if (obj instanceof fabric.Textbox || obj instanceof fabric.IText) {
    return 'text';
  }
  if (obj instanceof fabric.Group && !(obj instanceof fabric.ActiveSelection)) {
    return 'group';
  }
  if (obj instanceof fabric.Path) return 'brush';
  return 'shape';
}

/**
 * Stamp internal layer tracking metadata onto a Fabric object.
 */
export function stampLayerMeta(
  obj: fabric.FabricObject,
  meta?: {
    id?: string;
    name?: string;
    kind?: LayerKind;
    assetId?: string;
    clipShape?: ClipShapeKind;
  }
): string {
  const ext = obj as ExtendedFabricObject;
  const kind = meta?.kind ?? inferLayerKind(obj);
  const id = meta?.id ?? ext._layerId ?? generateUid('layer');

  ext._layerId = id;
  ext._layerType = kind;
  if (meta?.name) {
    ext._layerName = meta.name;
  } else if (!ext._layerName) {
    const labelMap: Record<LayerKind, string> = {
      image: 'Image Layer',
      text: 'Text Layer',
      shape: 'Shape Layer',
      brush: 'Brush Stroke',
      group: 'Layer Group',
    };
    ext._layerName = labelMap[kind];
  }
  if (meta?.assetId) ext._assetId = meta.assetId;
  if (meta?.clipShape) ext._clipShape = meta.clipShape;

  return id;
}

/**
 * Generate polygon points for a 5-point star centered at (0, 0).
 */
export function createStarPoints(
  outerRadius: number,
  innerRadius: number,
  spikes = 5
): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;

  for (let i = 0; i < spikes; i++) {
    points.push({
      x: Math.cos(rot) * outerRadius,
      y: Math.sin(rot) * outerRadius,
    });
    rot += step;
    points.push({
      x: Math.cos(rot) * innerRadius,
      y: Math.sin(rot) * innerRadius,
    });
    rot += step;
  }
  return points;
}

/**
 * Apply or clear a non-destructive object-local geometric clipPath on an object.
 */
export function applyClipShapeToObject(
  obj: fabric.FabricObject,
  shape: ClipShapeKind
): void {
  const ext = obj as ExtendedFabricObject;
  ext._clipShape = shape;

  if (shape === 'none') {
    obj.set({ clipPath: undefined });
    obj.setCoords();
    return;
  }

  const w = obj.width ?? 100;
  const h = obj.height ?? 100;
  const minSide = Math.min(w, h);

  if (shape === 'circle') {
    obj.set({
      clipPath: new fabric.Circle({
        radius: minSide / 2,
        originX: 'center',
        originY: 'center',
      }),
    });
  } else if (shape === 'rounded') {
    const radius = Math.round(minSide * 0.14);
    obj.set({
      clipPath: new fabric.Rect({
        width: w,
        height: h,
        rx: radius,
        ry: radius,
        originX: 'center',
        originY: 'center',
      }),
    });
  } else if (shape === 'star') {
    const pts = createStarPoints(minSide / 2, minSide * 0.21, 5);
    obj.set({
      clipPath: new fabric.Polygon(pts, {
        originX: 'center',
        originY: 'center',
      }),
    });
  }

  obj.setCoords();
}

/**
 * Build top-to-bottom visual LayerSummary[] from canvas objects.
 */
export function buildLayerSummaries(canvas: fabric.Canvas): LayerSummary[] {
  const objects = canvas.getObjects();
  const activeSet = new Set(canvas.getActiveObjects());

  const summaries: LayerSummary[] = objects.map((obj, idx) => {
    const ext = obj as ExtendedFabricObject;
    const kind = inferLayerKind(obj);
    const id = stampLayerMeta(obj, { kind });
    const name = ext._layerName || `Layer ${idx + 1}`;
    const locked = Boolean(obj.lockMovementX && obj.lockMovementY);

    let thumbnail: string | undefined;
    if (obj instanceof fabric.FabricImage) {
      thumbnail = obj.getSrc?.() || undefined;
    }

    return {
      id,
      name,
      kind,
      visible: obj.visible !== false,
      locked,
      opacity: obj.opacity ?? 1,
      blendMode: (obj.globalCompositeOperation as BlendMode) || 'source-over',
      isSelected: activeSet.has(obj),
      hasMask: Boolean(ext._maskDataUrl),
      isClippedBelow: Boolean(ext._clipToLayerId),
      thumbnail,
    };
  });

  // Reverse so front-most object appears at index 0
  return summaries.reverse();
}

/**
 * Extract lightweight Inspector properties from the currently active canvas selection.
 */
export function extractSelectedObjectProps(
  canvas: fabric.Canvas
): SelectedObjectProps | null {
  const active = canvas.getActiveObject();
  if (!active) return null;

  const activeList = canvas.getActiveObjects();
  const primary =
    active instanceof fabric.ActiveSelection ? activeList[0] : active;
  if (!primary) return null;

  const ext = primary as ExtendedFabricObject;
  const kind = inferLayerKind(primary);
  const shadow =
    primary.shadow instanceof fabric.Shadow ? primary.shadow : null;
  const textObj =
    primary instanceof fabric.Textbox || primary instanceof fabric.IText
      ? primary
      : null;

  const isBooleanCandidate = (o: fabric.FabricObject): boolean =>
    o instanceof fabric.Path ||
    o instanceof fabric.Rect ||
    o instanceof fabric.Circle ||
    o instanceof fabric.Triangle ||
    o instanceof fabric.Polygon ||
    o instanceof fabric.Polyline ||
    o instanceof fabric.Ellipse;

  const allObjects = canvas.getObjects();
  const primaryIdx = allObjects.indexOf(primary);

  return {
    selectedCount: activeList.length,
    id: ext._layerId || '',
    name: ext._layerName || 'Selection',
    kind,
    left: Math.round(active.left ?? 0),
    top: Math.round(active.top ?? 0),
    width: Math.round(active.getScaledWidth()),
    height: Math.round(active.getScaledHeight()),
    angle: Math.round(active.angle ?? 0),
    opacity: Number((primary.opacity ?? 1).toFixed(2)),
    blendMode: (primary.globalCompositeOperation as BlendMode) || 'source-over',
    flipX: Boolean(primary.flipX),
    flipY: Boolean(primary.flipY),
    locked: Boolean(primary.lockMovementX && primary.lockMovementY),
    fill: typeof primary.fill === 'string' ? primary.fill : '#0ea5e9',
    stroke: typeof primary.stroke === 'string' ? primary.stroke : '#0284c7',
    strokeWidth: Math.round(primary.strokeWidth ?? 0),
    cornerRadius:
      primary instanceof fabric.Rect ? Math.round(primary.rx ?? 0) : 0,
    clipShape: ext._clipShape ?? 'none',
    hasShadow: Boolean(shadow),
    shadowBlur: Math.round(shadow?.blur ?? 16),
    shadowOffsetX: Math.round(shadow?.offsetX ?? 0),
    shadowOffsetY: Math.round(shadow?.offsetY ?? 6),
    shadowColor:
      typeof shadow?.color === 'string' ? shadow.color : 'rgba(0,0,0,0.35)',
    fontFamily: textObj?.fontFamily || 'Inter, system-ui, sans-serif',
    fontSize: Math.round(textObj?.fontSize ?? 42),
    fontWeight: textObj?.fontWeight === 'bold' ? 'bold' : 'normal',
    fontStyle: textObj?.fontStyle === 'italic' ? 'italic' : 'normal',
    underline: Boolean(textObj?.underline),
    textAlign:
      textObj?.textAlign === 'center' || textObj?.textAlign === 'right'
        ? textObj.textAlign
        : 'left',
    lineHeight: Number((textObj?.lineHeight ?? 1.2).toFixed(2)),
    charSpacing: Math.round(textObj?.charSpacing ?? 0),
    textCurveKind: ext._textCurveKind ?? 'none',
    textCurveStrength: ext._textCurveStrength ?? 45,
    isPath: primary instanceof fabric.Path && !ext._isEraser,
    isEditingPathNodes: isPathInNodeEditMode(primary),
    canBoolean: activeList.length >= 2 && activeList.every(isBooleanCandidate),
    hasLayerMask: Boolean(ext._maskDataUrl),
    canClipToBelow: activeList.length === 1 && primaryIdx > 0,
    isClippedBelow: Boolean(ext._clipToLayerId),
    canGroup: activeList.length >= 2,
    canUngroup:
      active instanceof fabric.Group &&
      !(active instanceof fabric.ActiveSelection),
  };
}

/**
 * Read active filter slider values & presets from a FabricImage.
 */
export function readImageFilterValues(
  img: fabric.FabricImage
): ImageFilterValues {
  const result: ImageFilterValues = structuredClone(DEFAULT_FILTER_VALUES);
  const filters = img.filters ?? [];
  const presetSet = new Set<string>(FILTER_PRESETS.map((p) => p.id));

  for (const f of filters) {
    if (!f) continue;
    if (presetSet.has(f.type)) {
      result.presets.push(f.type);
      continue;
    }

    const rec = f as unknown as Record<string, unknown>;
    switch (f.type) {
      case 'Brightness':
        result.brightness = Number(rec.brightness ?? 0);
        break;
      case 'Contrast':
        result.contrast = Number(rec.contrast ?? 0);
        break;
      case 'Saturation':
        result.saturation = Number(rec.saturation ?? 0);
        break;
      case 'Vibrance':
        result.vibrance = Number(rec.vibrance ?? 0);
        break;
      case 'HueRotation':
        result.hue = Math.round(Number(rec.rotation ?? 0) * 180);
        break;
      case 'Blur':
        result.blur = Number(rec.blur ?? 0);
        break;
      case 'Convolute': {
        const matrix = rec.matrix as number[] | undefined;
        if (matrix && matrix.length === 9) {
          const strength = Math.max(0, (matrix[4] - 1) / 4);
          result.sharpen = Number(strength.toFixed(2));
        }
        break;
      }
      case 'Noise':
        result.noise = Number(rec.noise ?? 0);
        break;
      case 'Pixelate':
        result.pixelate = Number(rec.blocksize ?? 0);
        break;
      case 'Gamma': {
        const gammaArr = rec.gamma as number[] | undefined;
        if (gammaArr && gammaArr.length > 0) {
          result.gamma = Number(gammaArr[0].toFixed(2));
        }
        break;
      }
      case 'PhotoEditorCurvesLevels': {
        if (rec.levels) {
          result.levels = structuredClone(rec.levels as LevelsConfig);
        }
        if (rec.curves) {
          result.curves = structuredClone(rec.curves as CurvesConfig);
        }
        break;
      }
      case 'PhotoEditorSelectiveHsl': {
        if (rec.bands) {
          result.selectiveHsl = structuredClone(
            rec.bands as SelectiveHslConfig
          );
        }
        break;
      }
      case 'PhotoEditorCinemaEffects': {
        const c = rec as unknown as CinemaEffectsConfig;
        result.cinema = {
          clarity: Number(c.clarity ?? 0),
          vignette: Number(c.vignette ?? 0),
          vignetteFeather: Number(
            c.vignetteFeather ?? DEFAULT_CINEMA_EFFECTS.vignetteFeather
          ),
          grain: Number(c.grain ?? 0),
          chromatic: Number(c.chromatic ?? 0),
        };
        break;
      }
      case 'PhotoEditorLut3d': {
        result.lut = {
          id: String(rec.lutId ?? DEFAULT_LUT_CONFIG.id),
          name: String(rec.lutName ?? DEFAULT_LUT_CONFIG.name),
          size: Number(rec.size ?? 0),
          intensity: Number(rec.intensity ?? 1),
          customDataBase64: String(rec.customDataBase64 ?? ''),
        };
        break;
      }
      default:
        break;
    }
  }

  return result;
}

/**
 * Rebuild and apply Fabric WebGL filters (including custom GLSL shaders) onto a FabricImage.
 */
export function applyImageFilterValues(
  img: fabric.FabricImage,
  values: ImageFilterValues
): void {
  const nextFilters: fabric.filters.BaseFilter<string>[] = [];

  for (const presetId of values.presets) {
    const FilterCls = PRESET_FILTER_CLASSES[presetId];
    if (FilterCls) {
      nextFilters.push(new FilterCls());
    }
  }

  if (Math.abs(values.brightness) > 0.005) {
    nextFilters.push(
      new fabric.filters.Brightness({ brightness: values.brightness })
    );
  }
  if (Math.abs(values.contrast) > 0.005) {
    nextFilters.push(
      new fabric.filters.Contrast({ contrast: values.contrast })
    );
  }
  if (Math.abs(values.saturation) > 0.005) {
    nextFilters.push(
      new fabric.filters.Saturation({ saturation: values.saturation })
    );
  }
  if (Math.abs(values.vibrance) > 0.005) {
    nextFilters.push(
      new fabric.filters.Vibrance({ vibrance: values.vibrance })
    );
  }
  if (Math.abs(values.hue) > 0.5) {
    nextFilters.push(
      new fabric.filters.HueRotation({ rotation: values.hue / 180 })
    );
  }
  if (values.blur > 0.005) {
    nextFilters.push(new fabric.filters.Blur({ blur: values.blur }));
  }
  if (values.sharpen > 0.005) {
    const s = values.sharpen;
    nextFilters.push(
      new fabric.filters.Convolute({
        matrix: [0, -s, 0, -s, 1 + 4 * s, -s, 0, -s, 0],
      })
    );
  }
  if (values.noise > 0.5) {
    nextFilters.push(new fabric.filters.Noise({ noise: values.noise }));
  }
  if (values.pixelate >= 2) {
    nextFilters.push(
      new fabric.filters.Pixelate({ blocksize: Math.round(values.pixelate) })
    );
  }
  if (Math.abs(values.gamma - 1) > 0.01) {
    const g = Math.max(0.2, Math.min(2.2, values.gamma));
    nextFilters.push(new fabric.filters.Gamma({ gamma: [g, g, g] }));
  }

  const curvesFilter = new CurvesLevelsFilter({
    levels: structuredClone(values.levels ?? DEFAULT_LEVELS_CONFIG),
    curves: structuredClone(values.curves ?? DEFAULT_CURVES_CONFIG),
  });
  if (!curvesFilter.isNeutralState()) {
    nextFilters.push(curvesFilter);
  }

  const hslFilter = new SelectiveHslFilter({
    bands: structuredClone(values.selectiveHsl ?? DEFAULT_SELECTIVE_HSL),
  });
  if (!hslFilter.isNeutralState()) {
    nextFilters.push(hslFilter);
  }

  const cinemaFilter = new CinemaEffectsFilter({
    ...(values.cinema ?? DEFAULT_CINEMA_EFFECTS),
  });
  if (!cinemaFilter.isNeutralState()) {
    nextFilters.push(cinemaFilter);
  }

  const lutFilter = new Lut3dFilter({
    lutId: values.lut?.id ?? 'none',
    lutName: values.lut?.name ?? 'None',
    size: values.lut?.size ?? 0,
    intensity: values.lut?.intensity ?? 1,
    customDataBase64: values.lut?.customDataBase64 ?? '',
  });
  if (!lutFilter.isNeutralState()) {
    nextFilters.push(lutFilter);
  }

  img.set({ filters: nextFilters });
  img.applyFilters();
}
