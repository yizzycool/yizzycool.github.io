import type { T2DPipelineState, TWebGLUniformLocationMap } from 'fabric';
import type { CinemaEffectsConfig } from '../types/studio';

import * as fabric from 'fabric';

import { DEFAULT_CINEMA_EFFECTS } from '../constants';

export type CinemaEffectsOwnProps = CinemaEffectsConfig;

const FRAGMENT_SOURCE = `
  precision highp float;
  uniform sampler2D uTexture;
  uniform float uStepW;
  uniform float uStepH;
  uniform float uClarity;
  uniform float uVignette;
  uniform float uVignetteFeather;
  uniform float uGrain;
  uniform float uChromatic;
  varying vec2 vTexCoord;

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float getLuma(vec3 c) {
    return dot(c, vec3(0.299, 0.587, 0.114));
  }

  void main() {
    vec2 centered = vTexCoord - vec2(0.5);
    float dist = length(centered);

    // 1. Radial Chromatic Aberration
    vec4 centerSample = texture2D(uTexture, vTexCoord);
    vec3 rgb = centerSample.rgb;
    if (uChromatic > 0.001) {
      vec2 shift = centered * uChromatic * 0.025;
      float rShift = texture2D(uTexture, clamp(vTexCoord + shift, 0.0, 1.0)).r;
      float bShift = texture2D(uTexture, clamp(vTexCoord - shift, 0.0, 1.0)).b;
      rgb = vec3(rShift, rgb.g, bShift);
    }

    // 2. Local Midtone Contrast (Clarity)
    if (abs(uClarity) > 0.005) {
      vec2 d = vec2(uStepW * 2.0, uStepH * 2.0);
      vec3 blur = (
        texture2D(uTexture, clamp(vTexCoord + vec2(-d.x, 0.0), 0.0, 1.0)).rgb +
        texture2D(uTexture, clamp(vTexCoord + vec2(d.x, 0.0), 0.0, 1.0)).rgb +
        texture2D(uTexture, clamp(vTexCoord + vec2(0.0, -d.y), 0.0, 1.0)).rgb +
        texture2D(uTexture, clamp(vTexCoord + vec2(0.0, d.y), 0.0, 1.0)).rgb +
        rgb
      ) * 0.2;
      float luma = getLuma(rgb);
      float midtoneMask = 4.0 * luma * (1.0 - luma);
      rgb = clamp(rgb + (rgb - blur) * uClarity * 1.45 * midtoneMask, 0.0, 1.0);
    }

    // 3. Smooth Radial Vignette
    if (uVignette > 0.005) {
      float inner = 0.28;
      float outer = mix(0.65, 1.15, clamp(uVignetteFeather, 0.1, 1.0));
      float vig = smoothstep(inner, outer, dist);
      rgb *= mix(1.0, 1.0 - uVignette * 0.88, vig);
    }

    // 4. Analog Film Grain
    if (uGrain > 0.005) {
      float n = hash12(vTexCoord * vec2(1280.0, 720.0)) - 0.5;
      rgb = clamp(rgb + n * uGrain * 0.22, 0.0, 1.0);
    }

    gl_FragColor = vec4(rgb, centerSample.a);
  }
`;

/**
 * Single-pass WebGL Cinematic FX Shader combining Clarity, Vignette, Film Grain, and Chromatic Aberration.
 */
export class CinemaEffectsFilter extends fabric.filters.BaseFilter<
  'PhotoEditorCinemaEffects',
  CinemaEffectsOwnProps
> {
  declare clarity: number;
  declare vignette: number;
  declare vignetteFeather: number;
  declare grain: number;
  declare chromatic: number;

  static type = 'PhotoEditorCinemaEffects';
  static uniformLocations = [
    'uClarity',
    'uVignette',
    'uVignetteFeather',
    'uGrain',
    'uChromatic',
  ];
  static defaults: CinemaEffectsOwnProps = { ...DEFAULT_CINEMA_EFFECTS };

  protected getFragmentSource(): string {
    return FRAGMENT_SOURCE;
  }

  isNeutralState(): boolean {
    return (
      Math.abs(this.clarity ?? 0) < 0.005 &&
      Math.abs(this.vignette ?? 0) < 0.005 &&
      Math.abs(this.grain ?? 0) < 0.005 &&
      Math.abs(this.chromatic ?? 0) < 0.005
    );
  }

  sendUniformData(
    gl: WebGLRenderingContext,
    uniformLocations: TWebGLUniformLocationMap
  ): void {
    gl.uniform1f(uniformLocations.uClarity ?? null, this.clarity ?? 0);
    gl.uniform1f(uniformLocations.uVignette ?? null, this.vignette ?? 0);
    gl.uniform1f(
      uniformLocations.uVignetteFeather ?? null,
      this.vignetteFeather ?? 0.55
    );
    gl.uniform1f(uniformLocations.uGrain ?? null, this.grain ?? 0);
    gl.uniform1f(uniformLocations.uChromatic ?? null, this.chromatic ?? 0);
  }

  applyTo2d(options: T2DPipelineState): void {
    const { data, width, height } = options.imageData;
    const clarity = this.clarity ?? 0;
    const vignette = this.vignette ?? 0;
    const feather = Math.max(0.1, Math.min(1, this.vignetteFeather ?? 0.55));
    const grain = this.grain ?? 0;
    const outer = 0.65 + (1.15 - 0.65) * feather;

    for (let y = 0; y < height; y++) {
      const ny = y / Math.max(1, height - 1) - 0.5;
      for (let x = 0; x < width; x++) {
        const nx = x / Math.max(1, width - 1) - 0.5;
        const idx = (y * width + x) * 4;
        let r = data[idx] / 255;
        let g = data[idx + 1] / 255;
        let b = data[idx + 2] / 255;

        if (Math.abs(clarity) > 0.005) {
          const luma = r * 0.299 + g * 0.587 + b * 0.114;
          const mid = 4 * luma * (1 - luma);
          const factor = 1 + clarity * 0.35 * mid;
          r = luma + (r - luma) * factor;
          g = luma + (g - luma) * factor;
          b = luma + (b - luma) * factor;
        }

        if (vignette > 0.005) {
          const dist = Math.hypot(nx, ny);
          const t = Math.max(0, Math.min(1, (dist - 0.28) / (outer - 0.28)));
          const smooth = t * t * (3 - 2 * t);
          const shade = 1 - vignette * 0.88 * smooth;
          r *= shade;
          g *= shade;
          b *= shade;
        }

        if (grain > 0.005) {
          const seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
          const n = (seed - Math.floor(seed) - 0.5) * grain * 0.22;
          r += n;
          g += n;
          b += n;
        }

        data[idx] = Math.max(0, Math.min(255, Math.round(r * 255)));
        data[idx + 1] = Math.max(0, Math.min(255, Math.round(g * 255)));
        data[idx + 2] = Math.max(0, Math.min(255, Math.round(b * 255)));
      }
    }
  }
}
