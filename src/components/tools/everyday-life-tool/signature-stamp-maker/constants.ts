import type {
  ExportScale,
  PaperGuide,
  PhotoColorMode,
  PhotoCrop,
  PhotoExtractSettings,
  PhotoViewMode,
  SignatureSettings,
  StageBackdrop,
  StampBorderStyle,
  StampFontStyle,
  StampSettings,
  StampShape,
  StudioMode,
} from './types';

export const LOGICAL_CANVAS_WIDTH = 900;
export const LOGICAL_CANVAS_HEIGHT = 400;
export const TRIM_PADDING = 20;

export const STUDIO_MODES: StudioMode[] = ['signature', 'stamp', 'photo'];

export const STUDIO_MODE_LABELS: Record<StudioMode, string> = {
  signature: 'Signature Pad',
  stamp: 'Stamp Maker',
  photo: 'Photo Extract',
};

export const STAGE_BACKDROPS: StageBackdrop[] = [
  'paper',
  'checkerboard',
  'dark',
];

export const STAGE_BACKDROP_LABELS: Record<StageBackdrop, string> = {
  paper: 'Paper',
  checkerboard: 'Grid',
  dark: 'Dark',
};

export const PAPER_GUIDES: PaperGuide[] = ['baseline', 'grid', 'blank'];

export const PAPER_GUIDE_LABELS: Record<PaperGuide, string> = {
  baseline: 'Baseline',
  grid: 'Dot Grid',
  blank: 'Blank',
};

export const EXPORT_SCALES: ExportScale[] = [1, 2, 3];

export const EXPORT_SCALE_LABELS: Record<ExportScale, string> = {
  1: '1x',
  2: '2x',
  3: '3x',
};

export const SIGNATURE_INK_COLORS = [
  { label: 'Obsidian Black', value: '#111827' },
  { label: 'Executive Navy', value: '#1E3A8A' },
  { label: 'Royal Blue', value: '#1D4ED8' },
  { label: 'Vermilion Red', value: '#C8232C' },
  { label: 'Pure White', value: '#FFFFFF' },
];

export const STAMP_INK_COLORS = [
  { label: 'Vermilion Ink', value: '#C8232C' },
  { label: 'Cinnabar Red', value: '#B91C1C' },
  { label: 'Cobalt Blue', value: '#1D4ED8' },
  { label: 'Obsidian Ink', value: '#111827' },
];

export const STAMP_SHAPES: StampShape[] = ['round', 'square', 'oval'];

export const STAMP_SHAPE_LABELS: Record<StampShape, string> = {
  round: 'Round',
  square: 'Square',
  oval: 'Oval',
};

export const STAMP_FONT_STYLES: StampFontStyle[] = [
  'serif',
  'calligraphy',
  'sans',
  'seal',
];

export const STAMP_FONT_LABELS: Record<StampFontStyle, string> = {
  serif: 'Serif',
  calligraphy: 'Brush',
  sans: 'Modern',
  seal: 'Seal',
};

export const STAMP_FONT_FAMILIES: Record<StampFontStyle, string> = {
  serif:
    '"Noto Serif TC", "Songti TC", "PMingLiU", Georgia, "Times New Roman", serif',
  calligraphy:
    '"Kaiti TC", "DFKai-SB", "BiauKai", "STKaiti", Georgia, cursive, serif',
  sans: '"Noto Sans TC", "PingFang TC", system-ui, -apple-system, sans-serif',
  seal: '"Songti TC", "Noto Serif TC", "LiSong Pro", Georgia, serif',
};

export const STAMP_BORDER_STYLES: StampBorderStyle[] = ['single', 'double'];

export const STAMP_BORDER_LABELS: Record<StampBorderStyle, string> = {
  single: 'Single Ring',
  double: 'Double Ring',
};

export const PHOTO_COLOR_MODES: PhotoColorMode[] = ['recolor', 'original'];

export const PHOTO_COLOR_MODE_LABELS: Record<PhotoColorMode, string> = {
  recolor: 'Clean Ink',
  original: 'Original Color',
};

export const PHOTO_VIEW_MODES: PhotoViewMode[] = ['extracted', 'original'];

export const PHOTO_VIEW_MODE_LABELS: Record<PhotoViewMode, string> = {
  extracted: 'Extracted',
  original: 'Original',
};

export const DEFAULT_PHOTO_CROP: PhotoCrop = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

export const DEFAULT_SIGNATURE_SETTINGS: SignatureSettings = {
  color: '#111827',
  baseWidth: 5,
  smoothing: 60,
  backdrop: 'paper',
  guide: 'baseline',
  trackpadMode: false,
};

export const DEFAULT_STAMP_SETTINGS: StampSettings = {
  text: 'APPROVED',
  subtitle: '100% VERIFIED',
  shape: 'round',
  fontStyle: 'serif',
  color: '#C8232C',
  borderStyle: 'double',
  borderWidth: 6,
  distress: 22,
  backdrop: 'checkerboard',
};

export const DEFAULT_PHOTO_EXTRACT_SETTINGS: PhotoExtractSettings = {
  normalizeLighting: true,
  threshold: 205,
  softness: 24,
  inkStrength: 120,
  colorMode: 'recolor',
  recolorHex: '#111827',
  crop: DEFAULT_PHOTO_CROP,
  backdrop: 'checkerboard',
};
