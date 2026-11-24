import type { ColorStop } from 'fabric';
import { SupportedFabricFilterType } from './fabric-filter';

export type CanvasExportFormat = 'png' | 'jpeg' | 'webp';

export type BentoTemplateId =
  | 'uniform'
  | 'bento-1-2'
  | 'bento-2-1'
  | 'focus-1-3'
  | 'hero-top-2'
  | 'polaroid-strip';

export type ImageCropAspect = 'none' | '1:1' | '4:3' | '16:9' | '4:5';

export type ImageMaskShape =
  | 'none'
  | 'circle'
  | 'rounded'
  | 'squircle'
  | 'polaroid';

export type ImageShadowConfig = {
  enabled: boolean;
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
  color: string;
};

export type CanvasWatermarkConfig = {
  enabled: boolean;
  text: string;
  color: string;
  opacity: number;
  fontSize: number;
  angle: number;
};

export type CaptionConfig = {
  text: string;
  fontSize: number;
  fill: string;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
  opacity: number;
};

export type CanvasSize = { width: number; height: number };

export type CanvasBackgroundType = 'color' | 'gradient' | 'image';

export type CanvasBackgroundColor = {
  color: string;
  opacity: number;
};

export type CanvasBackgroundGradient = {
  type: 'linear' | 'radial';
  coords: {
    x1: number;
    y1: number;
    r1?: number;
    x2: number;
    y2: number;
    r2?: number;
  };
  colorStops: ColorStop[];
};

export type CanvasBackgroundImage = {
  url: string;
};

export type CanvasBackground = {
  type: CanvasBackgroundType;
  color?: CanvasBackgroundColor;
  gradient?: CanvasBackgroundGradient;
  image?: CanvasBackgroundImage;
};

export type CanvasBorder = { width: number; color: string; opacity: number };

export type CanvasGridConfig = {
  rows: number;
  cols: number;
  templateId?: BentoTemplateId;
  border: CanvasBorder & { showOuter: boolean };
};

export type CanvasConfig = {
  layout: 'free' | 'grid';
  size: CanvasSize;
  background: CanvasBackground;
  border: CanvasBorder;
  watermark?: CanvasWatermarkConfig;
  exportFormat: CanvasExportFormat;
  gridConfig: CanvasGridConfig;
};

export type GlobalImageConfig = {
  border: CanvasBorder;
  radius: number;
};

export type ImageConfig = {
  opacity: number;
  border: CanvasBorder;
  angle: number;
  snapAngle?: number;
  scaleX: number;
  scaleY: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  lockMovementX: boolean;
  lockMovementY: boolean;
  flipX: boolean;
  flipY: boolean;
  cropAspect?: ImageCropAspect;
  maskShape?: ImageMaskShape;
  shadow?: ImageShadowConfig;
  filters: InstanceType<SupportedFabricFilterType>[];
};
