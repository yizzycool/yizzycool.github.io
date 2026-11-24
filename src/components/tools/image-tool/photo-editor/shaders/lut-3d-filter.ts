import type {
  T2DPipelineState,
  TWebGLPipelineState,
  TWebGLUniformLocationMap,
} from 'fabric';

import * as fabric from 'fabric';

import {
  decodeLutBytesFromBase64,
  generateBuiltinLut,
} from '../utils/lut-parser';

export type Lut3dOwnProps = {
  lutId: string;
  lutName: string;
  size: number;
  intensity: number;
  customDataBase64: string;
};

const DECODED_CUSTOM_CACHE = new Map<string, Uint8Array>();

const FRAGMENT_SOURCE = `
  precision highp float;
  uniform sampler2D uTexture;
  uniform sampler2D uLut;
  uniform float uLutSize;
  uniform float uIntensity;
  varying vec2 vTexCoord;

  vec3 sampleLutStrip(vec3 rgb, float size) {
    float sliceWidth = 1.0 / size;
    float maxIdx = size - 1.0;

    float blueColor = clamp(rgb.b, 0.0, 1.0) * maxIdx;
    float slice0 = floor(blueColor);
    float slice1 = min(maxIdx, ceil(blueColor));
    float fracB = blueColor - slice0;

    float uOffset = (0.5 + clamp(rgb.r, 0.0, 1.0) * maxIdx) / (size * size);
    float vCoord = (0.5 + clamp(rgb.g, 0.0, 1.0) * maxIdx) / size;

    vec2 uv0 = vec2(slice0 * sliceWidth + uOffset, vCoord);
    vec2 uv1 = vec2(slice1 * sliceWidth + uOffset, vCoord);

    vec3 col0 = texture2D(uLut, uv0).rgb;
    vec3 col1 = texture2D(uLut, uv1).rgb;
    return mix(col0, col1, fracB);
  }

  void main() {
    vec4 color = texture2D(uTexture, vTexCoord);
    if (uLutSize < 2.0 || uIntensity <= 0.001) {
      gl_FragColor = color;
      return;
    }
    vec3 graded = sampleLutStrip(color.rgb, uLutSize);
    gl_FragColor = vec4(mix(color.rgb, graded, clamp(uIntensity, 0.0, 1.0)), color.a);
  }
`;

function resolveLutPayload(
  filter: Lut3dFilter
): { size: number; data: Uint8Array } | null {
  if (!filter.lutId || filter.lutId === 'none') return null;

  if (filter.customDataBase64 && filter.size >= 2) {
    const key = `${filter.lutId}_${filter.size}_${filter.customDataBase64.slice(0, 24)}`;
    let bytes = DECODED_CUSTOM_CACHE.get(key);
    if (!bytes) {
      bytes = decodeLutBytesFromBase64(filter.customDataBase64);
      DECODED_CUSTOM_CACHE.set(key, bytes);
    }
    return { size: filter.size, data: bytes };
  }

  const builtin = generateBuiltinLut(filter.lutId);
  if (!builtin) return null;
  return { size: builtin.size, data: builtin.data };
}

/**
 * Custom Fabric v7 3D `.cube` LUT WebGL Shader with trilinear interpolation.
 */
export class Lut3dFilter extends fabric.filters.BaseFilter<
  'PhotoEditorLut3d',
  Lut3dOwnProps
> {
  declare lutId: string;
  declare lutName: string;
  declare size: number;
  declare intensity: number;
  declare customDataBase64: string;

  static type = 'PhotoEditorLut3d';
  static uniformLocations = ['uLut', 'uLutSize', 'uIntensity'];
  static defaults: Lut3dOwnProps = {
    lutId: 'none',
    lutName: 'None',
    size: 0,
    intensity: 1,
    customDataBase64: '',
  };

  private activeResolvedSize = 0;

  protected getFragmentSource(): string {
    return FRAGMENT_SOURCE;
  }

  isNeutralState(): boolean {
    return (
      !this.lutId ||
      this.lutId === 'none' ||
      (this.intensity ?? 1) <= 0.005 ||
      !resolveLutPayload(this)
    );
  }

  applyToWebGL(options: TWebGLPipelineState): void {
    const payload = resolveLutPayload(this);
    if (!payload) {
      this.activeResolvedSize = 0;
      super.applyToWebGL(options);
      return;
    }

    const gl = options.context;
    const texture = gl.createTexture();
    if (!texture) {
      super.applyToWebGL(options);
      return;
    }

    this.activeResolvedSize = payload.size;
    const stripWidth = payload.size * payload.size;

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      stripWidth,
      payload.size,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      payload.data
    );
    gl.activeTexture(gl.TEXTURE0);

    try {
      super.applyToWebGL(options);
    } finally {
      this.unbindAdditionalTexture(gl, gl.TEXTURE1);
      gl.deleteTexture(texture);
    }
  }

  sendUniformData(
    gl: WebGLRenderingContext,
    uniformLocations: TWebGLUniformLocationMap
  ): void {
    gl.uniform1i(uniformLocations.uLut ?? null, 1);
    gl.uniform1f(uniformLocations.uLutSize ?? null, this.activeResolvedSize);
    gl.uniform1f(uniformLocations.uIntensity ?? null, this.intensity ?? 1);
  }

  applyTo2d(options: T2DPipelineState): void {
    const payload = resolveLutPayload(this);
    if (!payload) return;

    const intensity = Math.max(0, Math.min(1, this.intensity ?? 1));
    if (intensity <= 0.001) return;

    const { size, data: lut } = payload;
    const stripWidth = size * size;
    const maxIdx = size - 1;
    const pixels = options.imageData.data;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i] / 255;
      const g = pixels[i + 1] / 255;
      const b = pixels[i + 2] / 255;

      const rx = r * maxIdx;
      const gx = g * maxIdx;
      const bx = b * maxIdx;

      const r0 = Math.floor(rx);
      const g0 = Math.floor(gx);
      const b0 = Math.floor(bx);
      const r1 = Math.min(maxIdx, r0 + 1);
      const g1 = Math.min(maxIdx, g0 + 1);
      const b1 = Math.min(maxIdx, b0 + 1);

      const fr = rx - r0;
      const fg = gx - g0;
      const fb = bx - b0;

      const sample = (ri: number, gi: number, bi: number, ch: number) =>
        lut[(gi * stripWidth + bi * size + ri) * 4 + ch] / 255;

      const lerpCh = (ch: number) => {
        const c000 = sample(r0, g0, b0, ch);
        const c100 = sample(r1, g0, b0, ch);
        const c010 = sample(r0, g1, b0, ch);
        const c110 = sample(r1, g1, b0, ch);
        const c001 = sample(r0, g0, b1, ch);
        const c101 = sample(r1, g0, b1, ch);
        const c011 = sample(r0, g1, b1, ch);
        const c111 = sample(r1, g1, b1, ch);

        const c00 = c000 + (c100 - c000) * fr;
        const c10 = c010 + (c110 - c010) * fr;
        const c01 = c001 + (c101 - c001) * fr;
        const c11 = c011 + (c111 - c011) * fr;

        const c0 = c00 + (c10 - c00) * fg;
        const c1 = c01 + (c11 - c01) * fg;
        return c0 + (c1 - c0) * fb;
      };

      const lr = lerpCh(0);
      const lg = lerpCh(1);
      const lb = lerpCh(2);

      pixels[i] = Math.round((r + (lr - r) * intensity) * 255);
      pixels[i + 1] = Math.round((g + (lg - g) * intensity) * 255);
      pixels[i + 2] = Math.round((b + (lb - b) * intensity) * 255);
    }
  }
}
