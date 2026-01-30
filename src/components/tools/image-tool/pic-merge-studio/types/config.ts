import type { ColorStop } from 'fabric';
import { SupportedFabricFilterType } from './fabric-filter';

export type CanvasExportFormat = 'png' | 'jpeg' | 'svg';

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
  border: CanvasBorder & { showOuter: boolean };
};

export type CanvasConfig = {
  layout: 'free' | 'grid';
  size: CanvasSize;
  background: CanvasBackground;
  border: CanvasBorder;
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
  scaleX: number;
  scaleY: number;
  lockMovementX: boolean;
  lockMovementY: boolean;
  flipX: boolean;
  flipY: boolean;
  filters: InstanceType<SupportedFabricFilterType>[];
  // filters: filters.BaseFilter<
  //   string,
  //   Record<string, object>,
  //   Record<string, object>
  // >[];
};
