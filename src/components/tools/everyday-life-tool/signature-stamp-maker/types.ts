export type StudioMode = 'signature' | 'stamp' | 'photo';

export type StageBackdrop = 'paper' | 'checkerboard' | 'dark';

export type PaperGuide = 'baseline' | 'grid' | 'blank';

export type ExportScale = 1 | 2 | 3;

export interface StrokePoint {
  x: number;
  y: number;
  t: number;
  pressure: number;
}

export interface Stroke {
  id: string;
  points: StrokePoint[];
  color: string;
  baseWidth: number;
  smoothing: number;
}

export interface SignatureSettings {
  color: string;
  baseWidth: number;
  smoothing: number;
  backdrop: StageBackdrop;
  guide: PaperGuide;
  trackpadMode: boolean;
}

export type StampShape = 'round' | 'square' | 'oval';

export type StampFontStyle = 'serif' | 'calligraphy' | 'sans' | 'seal';

export type StampBorderStyle = 'single' | 'double';

export interface StampSettings {
  text: string;
  subtitle: string;
  shape: StampShape;
  fontStyle: StampFontStyle;
  color: string;
  borderStyle: StampBorderStyle;
  borderWidth: number;
  distress: number;
  backdrop: StageBackdrop;
}

export type PhotoColorMode = 'recolor' | 'original';

export type PhotoViewMode = 'extracted' | 'original';

export interface PhotoCrop {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PhotoExtractSettings {
  normalizeLighting: boolean;
  threshold: number;
  softness: number;
  inkStrength: number;
  colorMode: PhotoColorMode;
  recolorHex: string;
  crop: PhotoCrop;
  backdrop: StageBackdrop;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}
