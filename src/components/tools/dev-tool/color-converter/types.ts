export interface NormalizedRgba {
  r: number; // 0 ~ 255
  g: number; // 0 ~ 255
  b: number; // 0 ~ 255
  a: number; // 0 ~ 1
}

export interface HslColor {
  h: number; // 0 ~ 360
  s: number; // 0 ~ 100
  l: number; // 0 ~ 100
  a: number; // 0 ~ 1
}

export interface HsvColor {
  h: number; // 0 ~ 360
  s: number; // 0 ~ 100
  v: number; // 0 ~ 100
  a: number; // 0 ~ 1
}

export interface CmykColor {
  c: number; // 0 ~ 100
  m: number; // 0 ~ 100
  y: number; // 0 ~ 100
  k: number; // 0 ~ 100
}

export interface OklchColor {
  l: number; // 0 ~ 1
  c: number; // 0 ~ 0.4+
  h: number; // 0 ~ 360
  a: number; // 0 ~ 1
}

export interface LabColor {
  l: number; // 0 ~ 100
  a: number; // -128 ~ 127
  b: number; // -128 ~ 127
}

export interface ColorSpaceValues {
  hex: string;
  hex8: string;
  rgb: string;
  rgba: string;
  hsl: string;
  hsla: string;
  hsv: string;
  cmyk: string;
  oklch: string;
  lab: string;
}

export interface ColorSpaceItemData {
  id: keyof ColorSpaceValues;
  label: string;
  value: string;
  subText?: string;
}

export type WcagRating = 'AAA' | 'AA' | 'Fail';

export interface ContrastResult {
  ratio: number;
  normalText: WcagRating;
  largeText: WcagRating;
}

export interface ColorHarmonySwatch {
  name: string;
  hex: string;
  role: string;
}
