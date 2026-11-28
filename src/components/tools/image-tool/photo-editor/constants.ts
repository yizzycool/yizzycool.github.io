import type { SelectorOptionItem } from '@/components/ui/selector';
import type {
  AiModelKey,
  AiModelSpec,
  BlendMode,
  BrushSettings,
  CinemaEffectsConfig,
  CropAspectRatio,
  CurvesConfig,
  DocumentConfig,
  HslBandId,
  ImageFilterValues,
  LevelsConfig,
  LutConfig,
  MaskBrushSettings,
  SelectiveHslConfig,
  ShapeSettings,
  StarterTemplateSpec,
  StudioToolId,
  TextCurveKind,
} from './types/studio';

export const DEFAULT_DOCUMENT_CONFIG: DocumentConfig = {
  width: 1280,
  height: 720,
  backgroundType: 'transparent',
  backgroundColor: '#ffffff',
  backgroundOpacity: 1,
};

export const DEFAULT_BRUSH_SETTINGS: BrushSettings = {
  type: 'pencil',
  size: 14,
  color: '#0ea5e9',
  opacity: 1,
  shadowBlur: 0,
};

export const DEFAULT_MASK_BRUSH_SETTINGS: MaskBrushSettings = {
  mode: 'hide',
  size: 42,
  feather: 0.45,
};

export const DEFAULT_SHAPE_SETTINGS: ShapeSettings = {
  kind: 'rect',
  fill: '#0ea5e9',
  stroke: '#0284c7',
  strokeWidth: 0,
  cornerRadius: 16,
};

export const DEFAULT_LEVELS_CONFIG: LevelsConfig = {
  black: 0,
  midtone: 1,
  white: 1,
};

export const DEFAULT_CURVES_CONFIG: CurvesConfig = {
  master: [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
  ],
  red: [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
  ],
  green: [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
  ],
  blue: [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
  ],
};

export const DEFAULT_SELECTIVE_HSL: SelectiveHslConfig = {
  reds: { hue: 0, sat: 0, lum: 0 },
  oranges: { hue: 0, sat: 0, lum: 0 },
  yellows: { hue: 0, sat: 0, lum: 0 },
  greens: { hue: 0, sat: 0, lum: 0 },
  cyans: { hue: 0, sat: 0, lum: 0 },
  blues: { hue: 0, sat: 0, lum: 0 },
  purples: { hue: 0, sat: 0, lum: 0 },
};

export const DEFAULT_CINEMA_EFFECTS: CinemaEffectsConfig = {
  clarity: 0,
  vignette: 0,
  vignetteFeather: 0.55,
  grain: 0,
  chromatic: 0,
};

export const DEFAULT_LUT_CONFIG: LutConfig = {
  id: 'none',
  name: 'None',
  size: 0,
  intensity: 1,
  customDataBase64: '',
};

export const DEFAULT_FILTER_VALUES: ImageFilterValues = {
  presets: [],
  brightness: 0,
  contrast: 0,
  saturation: 0,
  vibrance: 0,
  hue: 0,
  blur: 0,
  sharpen: 0,
  noise: 0,
  pixelate: 0,
  gamma: 1,
  levels: DEFAULT_LEVELS_CONFIG,
  curves: DEFAULT_CURVES_CONFIG,
  selectiveHsl: DEFAULT_SELECTIVE_HSL,
  cinema: DEFAULT_CINEMA_EFFECTS,
  lut: DEFAULT_LUT_CONFIG,
};

export const STUDIO_TOOLS: Array<{
  id: StudioToolId;
  label: string;
  hotkey: string;
}> = [
  { id: 'select', label: 'Select & Transform', hotkey: 'V' },
  { id: 'hand', label: 'Hand / Pan Canvas', hotkey: 'H' },
  { id: 'crop', label: 'Crop Image', hotkey: 'C' },
  { id: 'brush', label: 'Brush Draw', hotkey: 'B' },
  { id: 'eraser', label: 'Eraser Brush', hotkey: 'E' },
  { id: 'mask', label: 'Layer Mask Brush', hotkey: 'K' },
  { id: 'mosaic', label: 'Mosaic Brush', hotkey: 'G' },
  { id: 'pen', label: 'Bezier Pen Path', hotkey: 'P' },
  { id: 'text', label: 'Text Layer', hotkey: 'T' },
  { id: 'shape', label: 'Vector Shape', hotkey: 'U' },
  { id: 'eyedropper', label: 'Color Eyedropper', hotkey: 'I' },
  { id: 'magic-select', label: 'AI Magic Select', hotkey: 'M' },
  { id: 'magic-eraser', label: 'AI Magic Eraser', hotkey: 'J' },
];

export const AI_MODEL_CATALOG: Record<AiModelKey, AiModelSpec> = {
  'rmbg-fast': {
    key: 'rmbg-fast',
    label: 'RMBG-1.4 Fast',
    shortLabel: 'Fast (42 MB)',
    repoId: 'briaai/RMBG-1.4',
    dtype: 'q8',
    estimatedMb: 42.3,
    description:
      'Lightweight quantized subject segmentation model ideal for quick background cutouts and 4 GB RAM devices.',
    taskLabel: 'AI Background Cutout',
  },
  'rmbg-hd': {
    key: 'rmbg-hd',
    label: 'ORMBG Studio HD',
    shortLabel: 'Studio HD (84 MB)',
    repoId: 'onnx-community/ormbg-ONNX',
    dtype: 'fp16',
    estimatedMb: 84.0,
    description:
      'High-precision FP16 matting model capturing fine hair strands, fur, and complex edges.',
    taskLabel: 'AI Background Cutout',
  },
  'sam-select': {
    key: 'sam-select',
    label: 'SlimSAM Magic Select',
    shortLabel: 'SlimSAM (20 MB)',
    repoId: 'Xenova/slimsam-77-uniform',
    dtype: 'fp16',
    estimatedMb: 19.8,
    description:
      'Interactive point-prompt Segment Anything encoder & mask decoder for click-to-select object extraction.',
    taskLabel: 'Interactive Magic Select',
  },
  'depth-v2': {
    key: 'depth-v2',
    label: 'Depth Anything V2',
    shortLabel: 'Depth V2 (26 MB)',
    repoId: 'onnx-community/depth-anything-v2-small',
    dtype: 'q8',
    estimatedMb: 26.0,
    description:
      'Monocular 3D depth estimation engine powering realistic Portrait Bokeh and Text Behind Subject layering.',
    taskLabel: '3D Depth Estimation',
  },
  'upscale-2x': {
    key: 'upscale-2x',
    label: 'Swin2SR 2x Upscale',
    shortLabel: 'Swin2SR (7 MB)',
    repoId: 'Xenova/swin2SR-lightweight-x2-64',
    dtype: 'fp16',
    estimatedMb: 7.2,
    description:
      'Transformer super-resolution network doubling sharpness and texture detail locally on your GPU.',
    taskLabel: '2x Super-Resolution',
  },
  'lama-inpaint': {
    key: 'lama-inpaint',
    label: 'LaMa High-Res Inpaint',
    shortLabel: 'LaMa (198 MB)',
    repoId: 'Carve/LaMa-ONNX',
    dtype: 'fp32',
    estimatedMb: 198.4,
    description:
      'Large Mask Inpainting Fourier-convolution model for seamless removal of people, wires, and blemishes.',
    taskLabel: 'AI Magic Eraser Inpaint',
  },
};

export const HSL_BAND_META: Array<{
  id: HslBandId;
  label: string;
  color: string;
}> = [
  { id: 'reds', label: 'Reds', color: '#ef4444' },
  { id: 'oranges', label: 'Oranges', color: '#f97316' },
  { id: 'yellows', label: 'Yellows', color: '#eab308' },
  { id: 'greens', label: 'Greens', color: '#22c55e' },
  { id: 'cyans', label: 'Cyans', color: '#06b6d4' },
  { id: 'blues', label: 'Blues', color: '#3b82f6' },
  { id: 'purples', label: 'Purples', color: '#a855f7' },
];

export const BUILTIN_LUT_PRESETS: SelectorOptionItem[] = [
  { label: 'No 3D LUT Applied', value: 'none' },
  { label: 'Cinema Teal & Orange', value: 'teal-orange' },
  { label: 'Fuji Classic Chrome', value: 'fuji-classic' },
  { label: 'Warm Indie Matte', value: 'warm-matte' },
  { label: 'Noir High Contrast', value: 'noir-contrast' },
];

export const TEXT_CURVE_OPTIONS: Array<{
  label: string;
  value: TextCurveKind;
}> = [
  { label: 'Straight Text', value: 'none' },
  { label: 'Arch Up', value: 'arc-up' },
  { label: 'Arch Down', value: 'arc-down' },
  { label: 'Wave Path', value: 'wave' },
  { label: 'Circle Ring', value: 'circle' },
];

export const CROP_ASPECT_OPTIONS: Array<{
  label: string;
  value: CropAspectRatio;
}> = [
  { label: 'Free', value: 'free' },
  { label: '1:1', value: '1:1' },
  { label: '4:3', value: '4:3' },
  { label: '16:9', value: '16:9' },
  { label: '4:5', value: '4:5' },
  { label: '9:16', value: '9:16' },
];

export const CANVAS_SIZE_PRESETS: SelectorOptionItem[] = [
  { label: 'Custom Dimensions', value: 'custom' },
  { label: '16:9 Web HD (1280 × 720)', value: '1280x720' },
  { label: '16:9 Full HD (1920 × 1080)', value: '1920x1080' },
  { label: '1:1 Square (1080 × 1080)', value: '1080x1080' },
  { label: '4:5 IG Portrait (1080 × 1350)', value: '1080x1350' },
  { label: '9:16 Story / Reel (1080 × 1920)', value: '1080x1920' },
  { label: 'OG Social Banner (1200 × 630)', value: '1200x630' },
  { label: 'A4 Print 300dpi (2480 × 3508)', value: '2480x3508' },
];

export const BLEND_MODE_OPTIONS: Array<{
  label: string;
  value: BlendMode;
}> = [
  { label: 'Normal', value: 'source-over' },
  { label: 'Multiply', value: 'multiply' },
  { label: 'Screen', value: 'screen' },
  { label: 'Overlay', value: 'overlay' },
  { label: 'Darken', value: 'darken' },
  { label: 'Lighten', value: 'lighten' },
  { label: 'Color Dodge', value: 'color-dodge' },
  { label: 'Color Burn', value: 'color-burn' },
  { label: 'Hard Light', value: 'hard-light' },
  { label: 'Soft Light', value: 'soft-light' },
  { label: 'Difference', value: 'difference' },
  { label: 'Exclusion', value: 'exclusion' },
  { label: 'Hue', value: 'hue' },
  { label: 'Saturation', value: 'saturation' },
  { label: 'Color', value: 'color' },
  { label: 'Luminosity', value: 'luminosity' },
];

export const FONT_FAMILY_OPTIONS: SelectorOptionItem[] = [
  { label: 'Inter / System Sans', value: 'Inter, system-ui, sans-serif' },
  { label: 'Georgia Serif', value: 'Georgia, serif' },
  { label: 'JetBrains Mono', value: 'ui-monospace, SFMono-Regular, monospace' },
  { label: 'Impact Display', value: 'Impact, Charcoal, sans-serif' },
  { label: 'Noto Sans TC', value: '"Noto Sans TC", sans-serif' },
];

export const FILTER_PRESETS = [
  { id: 'BlackWhite', label: 'B&W' },
  { id: 'Sepia', label: 'Sepia' },
  { id: 'Vintage', label: 'Vintage' },
  { id: 'Kodachrome', label: 'Kodachrome' },
  { id: 'Polaroid', label: 'Polaroid' },
  { id: 'Technicolor', label: 'Technicolor' },
  { id: 'Brownie', label: 'Brownie' },
  { id: 'Invert', label: 'Invert' },
] as const;

export const CUSTOM_SERIALIZATION_PROPS = [
  '_layerId',
  '_layerName',
  '_layerType',
  '_assetId',
  '_clipShape',
  '_maskDataUrl',
  '_clipToLayerId',
  '_textCurveKind',
  '_textCurveStrength',
  '_isEraser',
  'globalCompositeOperation',
  'lockMovementX',
  'lockMovementY',
  'lockRotation',
  'lockScalingX',
  'lockScalingY',
  'selectable',
  'evented',
];

export const FABRIC_OBJECT_CONTROLS_STYLE = {
  transparentCorners: false,
  cornerColor: '#ffffff',
  cornerStrokeColor: '#0ea5e9',
  borderColor: '#0ea5e9',
  cornerSize: 9,
  cornerStyle: 'circle' as const,
  borderScaleFactor: 1.5,
  padding: 2,
};

export const MIN_ZOOM = 0.05;
export const MAX_ZOOM = 16;
export const MAX_HISTORY_ENTRIES = 40;
export const MOBILE_MAX_IMPORT_EDGE = 1600;
export const MOBILE_MAX_EXPORT_EDGE = 2048;

export const STARTER_TEMPLATES: StarterTemplateSpec[] = [
  {
    id: 'youtube-thumb',
    title: 'YouTube Thumbnail',
    subtitle: 'Bold headline badge & hero cutout frame',
    category: 'Social',
    width: 1280,
    height: 720,
    accentColor: '#f43f5e',
    bgColor: '#0f172a',
  },
  {
    id: 'ig-carousel',
    title: 'IG Carousel Slide',
    subtitle: 'Editorial 4:5 portrait typography card',
    category: 'Social',
    width: 1080,
    height: 1350,
    accentColor: '#0ea5e9',
    bgColor: '#f8fafc',
  },
  {
    id: 'og-banner',
    title: 'Blog OG Banner',
    subtitle: 'Clean article cover with tag pill & URL badge',
    category: 'Blog',
    width: 1200,
    height: 630,
    accentColor: '#6366f1',
    bgColor: '#1e1b4b',
  },
  {
    id: 'ig-story',
    title: 'IG Story / Reel',
    subtitle: 'Vertical 9:16 promo card with CTA bar',
    category: 'Social',
    width: 1080,
    height: 1920,
    accentColor: '#10b981',
    bgColor: '#064e3b',
  },
  {
    id: 'product-spotlight',
    title: 'Product Spotlight',
    subtitle: 'Square 1:1 studio showcase with discount pill',
    category: 'Promo',
    width: 1080,
    height: 1080,
    accentColor: '#f59e0b',
    bgColor: '#fffbeb',
  },
];
