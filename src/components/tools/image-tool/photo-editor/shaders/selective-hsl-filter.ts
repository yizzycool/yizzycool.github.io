import type { T2DPipelineState, TWebGLUniformLocationMap } from 'fabric';
import type { HslBandId, SelectiveHslConfig } from '../types/studio';

import * as fabric from 'fabric';

import { DEFAULT_SELECTIVE_HSL } from '../constants';

export type SelectiveHslOwnProps = {
  bands: SelectiveHslConfig;
};

const BAND_ORDER: HslBandId[] = [
  'reds',
  'oranges',
  'yellows',
  'greens',
  'cyans',
  'blues',
  'purples',
];

const BAND_CENTERS_DEG = [0, 30, 60, 120, 180, 240, 295];
const BAND_RADIUS_DEG = 38;

const FRAGMENT_SOURCE = `
  precision highp float;
  uniform sampler2D uTexture;
  uniform float uHueShift[7];
  uniform float uSatShift[7];
  uniform float uLumShift[7];
  varying vec2 vTexCoord;

  vec3 rgb2hsl(vec3 c) {
    float maxC = max(c.r, max(c.g, c.b));
    float minC = min(c.r, min(c.g, c.b));
    float l = (maxC + minC) * 0.5;
    float s = 0.0;
    float h = 0.0;
    float d = maxC - minC;
    if (d > 0.0001) {
      s = d / (1.0 - abs(2.0 * l - 1.0));
      if (maxC == c.r) {
        h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);
      } else if (maxC == c.g) {
        h = (c.b - c.r) / d + 2.0;
      } else {
        h = (c.r - c.g) / d + 4.0;
      }
      h /= 6.0;
    }
    return vec3(h, s, l);
  }

  float hue2rgb(float p, float q, float t) {
    if (t < 0.0) t += 1.0;
    if (t > 1.0) t -= 1.0;
    if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
    if (t < 0.5) return q;
    if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
    return p;
  }

  vec3 hsl2rgb(vec3 hsl) {
    if (hsl.y <= 0.0001) {
      return vec3(hsl.z);
    }
    float q = hsl.z < 0.5
      ? hsl.z * (1.0 + hsl.y)
      : hsl.z + hsl.y - hsl.z * hsl.y;
    float p = 2.0 * hsl.z - q;
    return vec3(
      hue2rgb(p, q, hsl.x + 1.0 / 3.0),
      hue2rgb(p, q, hsl.x),
      hue2rgb(p, q, hsl.x - 1.0 / 3.0)
    );
  }

  float bandWeight(float hueDeg, float centerDeg) {
    float diff = abs(hueDeg - centerDeg);
    diff = min(diff, 360.0 - diff);
    float t = clamp(1.0 - diff / 38.0, 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
  }

  void main() {
    vec4 color = texture2D(uTexture, vTexCoord);
    vec3 hsl = rgb2hsl(clamp(color.rgb, 0.0, 1.0));
    float hueDeg = hsl.x * 360.0;

    float dH = 0.0;
    float dS = 0.0;
    float dL = 0.0;
    float totalW = 0.0;

    float centers[7];
    centers[0] = 0.0;
    centers[1] = 30.0;
    centers[2] = 60.0;
    centers[3] = 120.0;
    centers[4] = 180.0;
    centers[5] = 240.0;
    centers[6] = 295.0;

    for (int i = 0; i < 7; i++) {
      float w = bandWeight(hueDeg, centers[i]);
      dH += uHueShift[i] * w;
      dS += uSatShift[i] * w;
      dL += uLumShift[i] * w;
      totalW += w;
    }

    float chromaGate = smoothstep(0.02, 0.12, hsl.y);
    float normW = totalW > 1.0 ? 1.0 / totalW : 1.0;

    hsl.x = fract(hsl.x + (dH * normW) * chromaGate);
    hsl.y = clamp(hsl.y * (1.0 + (dS * normW) * chromaGate), 0.0, 1.0);
    hsl.z = clamp(hsl.z + (dL * normW) * 0.45 * chromaGate, 0.0, 1.0);

    gl_FragColor = vec4(hsl2rgb(hsl), color.a);
  }
`;

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) * 0.5;
  const d = max - min;
  if (d < 1e-4) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
}

function hue2rgb(p: number, q: number, t: number): number {
  let nt = t;
  if (nt < 0) nt += 1;
  if (nt > 1) nt -= 1;
  if (nt < 1 / 6) return p + (q - p) * 6 * nt;
  if (nt < 0.5) return q;
  if (nt < 2 / 3) return p + (q - p) * (2 / 3 - nt) * 6;
  return p;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s <= 1e-4) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
}

/**
 * 7-band Selective HSL WebGL Shader matching Lightroom/Photoshop color mixer workflow.
 */
export class SelectiveHslFilter extends fabric.filters.BaseFilter<
  'PhotoEditorSelectiveHsl',
  SelectiveHslOwnProps
> {
  declare bands: SelectiveHslConfig;

  static type = 'PhotoEditorSelectiveHsl';
  static uniformLocations = ['uHueShift', 'uSatShift', 'uLumShift'];
  static defaults: SelectiveHslOwnProps = {
    bands: DEFAULT_SELECTIVE_HSL,
  };

  protected getFragmentSource(): string {
    return FRAGMENT_SOURCE;
  }

  isNeutralState(): boolean {
    const bands = this.bands ?? DEFAULT_SELECTIVE_HSL;
    return BAND_ORDER.every((id) => {
      const b = bands[id];
      return (
        !b ||
        (Math.abs(b.hue) < 0.5 &&
          Math.abs(b.sat) < 0.5 &&
          Math.abs(b.lum) < 0.5)
      );
    });
  }

  sendUniformData(
    gl: WebGLRenderingContext,
    uniformLocations: TWebGLUniformLocationMap
  ): void {
    const bands = this.bands ?? DEFAULT_SELECTIVE_HSL;
    const hArr = new Float32Array(7);
    const sArr = new Float32Array(7);
    const lArr = new Float32Array(7);

    for (let i = 0; i < 7; i++) {
      const b = bands[BAND_ORDER[i]] ?? { hue: 0, sat: 0, lum: 0 };
      hArr[i] = b.hue / 360;
      sArr[i] = b.sat / 100;
      lArr[i] = b.lum / 100;
    }

    gl.uniform1fv(uniformLocations.uHueShift ?? null, hArr);
    gl.uniform1fv(uniformLocations.uSatShift ?? null, sArr);
    gl.uniform1fv(uniformLocations.uLumShift ?? null, lArr);
  }

  applyTo2d(options: T2DPipelineState): void {
    const bands = this.bands ?? DEFAULT_SELECTIVE_HSL;
    const data = options.imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      const [h, s, l] = rgbToHsl(r, g, b);
      const chromaGate = Math.max(0, Math.min(1, (s - 0.02) / 0.1));
      if (chromaGate <= 0) continue;

      const hueDeg = h * 360;
      let dH = 0;
      let dS = 0;
      let dL = 0;
      let totalW = 0;

      for (let k = 0; k < 7; k++) {
        let diff = Math.abs(hueDeg - BAND_CENTERS_DEG[k]);
        diff = Math.min(diff, 360 - diff);
        const t = Math.max(0, Math.min(1, 1 - diff / BAND_RADIUS_DEG));
        const w = t * t * (3 - 2 * t);
        if (w <= 0) continue;

        const adj = bands[BAND_ORDER[k]];
        dH += (adj.hue / 360) * w;
        dS += (adj.sat / 100) * w;
        dL += (adj.lum / 100) * w;
        totalW += w;
      }

      const norm = totalW > 1 ? 1 / totalW : 1;
      const nh = (((h + dH * norm * chromaGate) % 1) + 1) % 1;
      const ns = Math.max(0, Math.min(1, s * (1 + dS * norm * chromaGate)));
      const nl = Math.max(0, Math.min(1, l + dL * norm * 0.45 * chromaGate));
      const [nr, ng, nb] = hslToRgb(nh, ns, nl);

      data[i] = Math.round(nr * 255);
      data[i + 1] = Math.round(ng * 255);
      data[i + 2] = Math.round(nb * 255);
    }
  }
}
