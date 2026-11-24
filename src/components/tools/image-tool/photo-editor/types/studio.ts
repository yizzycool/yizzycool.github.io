import type * as fabric from 'fabric';

export type StudioToolId =
  | 'select'
  | 'hand'
  | 'crop'
  | 'brush'
  | 'eraser'
  | 'mask'
  | 'mosaic'
  | 'pen'
  | 'text'
  | 'shape'
  | 'eyedropper'
  | 'magic-select'
  | 'magic-eraser';

export type BrushType = 'pencil' | 'spray' | 'circle';

export type ShapeKind = 'rect' | 'circle' | 'triangle' | 'line' | 'star';

export type BlendMode =
  | 'source-over'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export type ClipShapeKind = 'none' | 'circle' | 'rounded' | 'star';

export type TextCurveKind = 'none' | 'arc-up' | 'arc-down' | 'wave' | 'circle';

export type BooleanOpKind = 'union' | 'subtract' | 'intersect' | 'exclude';

export type LayerKind = 'image' | 'text' | 'shape' | 'brush' | 'group';

export type InspectorTabId = 'design' | 'layers' | 'adjust' | 'ai' | 'history';

export type AiModelKey =
  | 'rmbg-fast'
  | 'rmbg-hd'
  | 'sam-select'
  | 'depth-v2'
  | 'upscale-2x'
  | 'lama-inpaint';

export type AiBackendKind = 'webgpu' | 'wasm';

export type AiModelSpec = {
  key: AiModelKey;
  label: string;
  shortLabel: string;
  repoId: string;
  dtype: 'q8' | 'fp16' | 'fp32';
  estimatedMb: number;
  description: string;
  taskLabel: string;
};

export type AiCacheEntryStatus = {
  cached: boolean;
  sizeBytes: number;
};

export type AiDownloadProgress = {
  modelKey: AiModelKey;
  phase: 'downloading' | 'warming' | 'running';
  percent: number;
  loadedBytes: number;
  totalBytes: number;
  speedBps: number;
  fileName: string;
};

export type SamPointPrompt = {
  x: number;
  y: number;
  label: 0 | 1;
};

export type DepthMapData = {
  layerId: string;
  width: number;
  height: number;
  data: Uint8Array;
};

export type ChromeAiActionId = 'headline' | 'shorter' | 'translate' | 'grammar';

export type ChromeAiPreview = {
  actionLabel: string;
  text: string;
};

export type ExportFormat =
  | 'png'
  | 'jpeg'
  | 'webp'
  | 'gif'
  | 'svg'
  | 'psd'
  | 'pes';

export type GifMotionPreset =
  | 'layers'
  | 'pulse'
  | 'spin'
  | 'bounce'
  | 'fade'
  | 'slide';

export type GifExportSettings = {
  mode: GifMotionPreset;
  fps: number;
  durationSec: number;
};

export type StarterTemplateId =
  | 'youtube-thumb'
  | 'ig-carousel'
  | 'og-banner'
  | 'ig-story'
  | 'product-spotlight';

export type StarterTemplateSpec = {
  id: StarterTemplateId;
  title: string;
  subtitle: string;
  category: 'Social' | 'Blog' | 'Promo';
  width: number;
  height: number;
  accentColor: string;
  bgColor: string;
};

export type CurveChannel = 'master' | 'red' | 'green' | 'blue';

export type CurvePoint = {
  x: number;
  y: number;
};

export type CurvesConfig = Record<CurveChannel, CurvePoint[]>;

export type LevelsConfig = {
  black: number;
  midtone: number;
  white: number;
};

export type HslBandId =
  | 'reds'
  | 'oranges'
  | 'yellows'
  | 'greens'
  | 'cyans'
  | 'blues'
  | 'purples';

export type HslBandAdjustment = {
  hue: number;
  sat: number;
  lum: number;
};

export type SelectiveHslConfig = Record<HslBandId, HslBandAdjustment>;

export type CinemaEffectsConfig = {
  clarity: number;
  vignette: number;
  vignetteFeather: number;
  grain: number;
  chromatic: number;
};

export type LutConfig = {
  id: string;
  name: string;
  size: number;
  intensity: number;
  customDataBase64?: string;
};

export type MaskBrushSettings = {
  mode: 'hide' | 'reveal';
  size: number;
  feather: number;
};

export type CropAspectRatio = 'free' | '1:1' | '4:3' | '16:9' | '4:5' | '9:16';

export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type UserGuide = {
  id: string;
  orientation: 'h' | 'v';
  position: number;
};

export type AlignmentEdge =
  | 'left'
  | 'center-h'
  | 'right'
  | 'top'
  | 'center-v'
  | 'bottom';

export type LayerOrderAction = 'front' | 'forward' | 'backward' | 'back';

export type DocumentConfig = {
  width: number;
  height: number;
  backgroundType: 'transparent' | 'color';
  backgroundColor: string;
  backgroundOpacity: number;
};

export type BrushSettings = {
  type: BrushType;
  size: number;
  color: string;
  opacity: number;
  shadowBlur: number;
};

export type ShapeSettings = {
  kind: ShapeKind;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
};

export type LayerSummary = {
  id: string;
  name: string;
  kind: LayerKind;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  isSelected: boolean;
  hasMask: boolean;
  isClippedBelow: boolean;
  thumbnail?: string;
};

export type SelectedObjectProps = {
  selectedCount: number;
  id: string;
  name: string;
  kind: LayerKind;
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  opacity: number;
  blendMode: BlendMode;
  flipX: boolean;
  flipY: boolean;
  locked: boolean;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
  clipShape: ClipShapeKind;
  hasShadow: boolean;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowColor: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  underline: boolean;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  charSpacing: number;
  textCurveKind: TextCurveKind;
  textCurveStrength: number;
  isPath: boolean;
  isEditingPathNodes: boolean;
  canBoolean: boolean;
  hasLayerMask: boolean;
  canClipToBelow: boolean;
  isClippedBelow: boolean;
  canGroup: boolean;
  canUngroup: boolean;
};

export type ImageFilterValues = {
  presets: string[];
  brightness: number;
  contrast: number;
  saturation: number;
  vibrance: number;
  hue: number;
  blur: number;
  sharpen: number;
  noise: number;
  pixelate: number;
  gamma: number;
  levels: LevelsConfig;
  curves: CurvesConfig;
  selectiveHsl: SelectiveHslConfig;
  cinema: CinemaEffectsConfig;
  lut: LutConfig;
};

export type HistoryEntry = {
  id: string;
  label: string;
  timestamp: number;
  docConfig: DocumentConfig;
  canvasJson: Record<string, unknown>;
};

export type PersistedPhotoEditorDraft = {
  version: 1;
  savedAt: number;
  docConfig: DocumentConfig;
  canvasJson: Record<string, unknown>;
  assets: Record<string, Blob>;
};

export type ExtendedFabricObject = fabric.FabricObject & {
  _layerId?: string;
  _layerName?: string;
  _layerType?: LayerKind;
  _assetId?: string;
  _clipShape?: ClipShapeKind;
  _maskDataUrl?: string;
  _clipToLayerId?: string;
  _textCurveKind?: TextCurveKind;
  _textCurveStrength?: number;
  _isEraser?: boolean;
};

export type ExportOptions = {
  format: ExportFormat;
  quality: number;
  multiplier: 1 | 2 | 3;
  filename: string;
  gif?: GifExportSettings;
};
