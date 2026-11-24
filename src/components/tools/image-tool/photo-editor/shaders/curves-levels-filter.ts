import type {
  T2DPipelineState,
  TWebGLPipelineState,
  TWebGLUniformLocationMap,
} from 'fabric';
import type { CurvePoint, CurvesConfig, LevelsConfig } from '../types/studio';

import * as fabric from 'fabric';

import { DEFAULT_CURVES_CONFIG, DEFAULT_LEVELS_CONFIG } from '../constants';

export type CurvesLevelsOwnProps = {
  levels: LevelsConfig;
  curves: CurvesConfig;
};

const FRAGMENT_SOURCE = `
  precision highp float;
  uniform sampler2D uTexture;
  uniform sampler2D uLut;
  varying vec2 vTexCoord;

  void main() {
    vec4 color = texture2D(uTexture, vTexCoord);
    float r = texture2D(uLut, vec2(clamp(color.r, 0.0, 1.0), 0.5)).r;
    float g = texture2D(uLut, vec2(clamp(color.g, 0.0, 1.0), 0.5)).g;
    float b = texture2D(uLut, vec2(clamp(color.b, 0.0, 1.0), 0.5)).b;
    gl_FragColor = vec4(r, g, b, color.a);
  }
`;

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function isIdentityCurve(points: CurvePoint[] | undefined): boolean {
  if (!points || points.length !== 2) return false;
  return (
    Math.abs(points[0].x) < 0.004 &&
    Math.abs(points[0].y) < 0.004 &&
    Math.abs(points[1].x - 1) < 0.004 &&
    Math.abs(points[1].y - 1) < 0.004
  );
}

/**
 * Evaluate a smooth monotonic cubic Hermite spline (Fritsch-Carlson) over 256 intensity steps [0..255].
 */
export function evaluateCurveSpline(points: CurvePoint[]): Uint8Array {
  const lut = new Uint8Array(256);
  const sorted = [...points]
    .map((p) => ({ x: clamp01(p.x), y: clamp01(p.y) }))
    .sort((a, b) => a.x - b.x);

  if (sorted.length === 0) {
    for (let i = 0; i < 256; i++) lut[i] = i;
    return lut;
  }

  // Deduplicate nearly coincident X points
  const pts: CurvePoint[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].x - pts[pts.length - 1].x > 0.002) {
      pts.push(sorted[i]);
    } else {
      pts[pts.length - 1] = sorted[i];
    }
  }

  const n = pts.length;
  if (n === 1) {
    const val = Math.round(pts[0].y * 255);
    lut.fill(val);
    return lut;
  }

  const dx: number[] = [];
  const dy: number[] = [];
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const h = pts[i + 1].x - pts[i].x;
    const d = pts[i + 1].y - pts[i].y;
    dx.push(h);
    dy.push(d);
    slopes.push(h > 0 ? d / h : 0);
  }

  const tangents = new Array<number>(n).fill(0);
  tangents[0] = slopes[0];
  tangents[n - 1] = slopes[n - 2];

  for (let i = 1; i < n - 1; i++) {
    if (slopes[i - 1] * slopes[i] <= 0) {
      tangents[i] = 0;
    } else {
      const h0 = dx[i - 1];
      const h1 = dx[i];
      const common = h0 + h1;
      tangents[i] =
        (3 * common) /
        ((common + h1) / slopes[i - 1] + (common + h0) / slopes[i]);
    }
  }

  let seg = 0;
  for (let i = 0; i < 256; i++) {
    const x = i / 255;
    if (x <= pts[0].x) {
      lut[i] = Math.round(pts[0].y * 255);
      continue;
    }
    if (x >= pts[n - 1].x) {
      lut[i] = Math.round(pts[n - 1].y * 255);
      continue;
    }
    while (seg < n - 2 && x > pts[seg + 1].x) {
      seg++;
    }
    const h = dx[seg] || 1e-5;
    const t = (x - pts[seg].x) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    const y = clamp01(
      h00 * pts[seg].y +
        h10 * h * tangents[seg] +
        h01 * pts[seg + 1].y +
        h11 * h * tangents[seg + 1]
    );
    lut[i] = Math.round(y * 255);
  }

  return lut;
}

/**
 * Compose Levels (Black / Midtone Gamma / White) + Master Curve + RGB Curves into a 256x1 RGBA LUT.
 */
export function buildCombinedLutRgba(
  levels: LevelsConfig,
  curves: CurvesConfig
): Uint8Array {
  const masterLut = evaluateCurveSpline(curves.master);
  const redLut = evaluateCurveSpline(curves.red);
  const greenLut = evaluateCurveSpline(curves.green);
  const blueLut = evaluateCurveSpline(curves.blue);

  const black = clamp01(levels.black);
  const white = Math.max(black + 0.02, clamp01(levels.white));
  const gammaInv = 1 / Math.max(0.1, Math.min(4, levels.midtone || 1));

  const rgba = new Uint8Array(256 * 4);
  for (let i = 0; i < 256; i++) {
    const norm = i / 255;
    const leveled = Math.pow(
      clamp01((norm - black) / (white - black)),
      gammaInv
    );
    const lIdx = Math.min(255, Math.max(0, Math.round(leveled * 255)));
    const m = masterLut[lIdx];

    rgba[i * 4] = redLut[m];
    rgba[i * 4 + 1] = greenLut[m];
    rgba[i * 4 + 2] = blueLut[m];
    rgba[i * 4 + 3] = 255;
  }
  return rgba;
}

/**
 * Custom Fabric v7 1D LUT WebGL filter combining Levels and 4-channel RGB Tone Curves.
 */
export class CurvesLevelsFilter extends fabric.filters.BaseFilter<
  'PhotoEditorCurvesLevels',
  CurvesLevelsOwnProps
> {
  declare levels: LevelsConfig;
  declare curves: CurvesConfig;

  static type = 'PhotoEditorCurvesLevels';
  static uniformLocations = ['uLut'];
  static defaults: CurvesLevelsOwnProps = {
    levels: DEFAULT_LEVELS_CONFIG,
    curves: DEFAULT_CURVES_CONFIG,
  };

  protected getFragmentSource(): string {
    return FRAGMENT_SOURCE;
  }

  isNeutralState(): boolean {
    const lvl = this.levels ?? DEFAULT_LEVELS_CONFIG;
    const crv = this.curves ?? DEFAULT_CURVES_CONFIG;
    return (
      Math.abs(lvl.black) < 0.004 &&
      Math.abs(lvl.midtone - 1) < 0.005 &&
      Math.abs(lvl.white - 1) < 0.004 &&
      isIdentityCurve(crv.master) &&
      isIdentityCurve(crv.red) &&
      isIdentityCurve(crv.green) &&
      isIdentityCurve(crv.blue)
    );
  }

  applyToWebGL(options: TWebGLPipelineState): void {
    const gl = options.context;
    const lutData = buildCombinedLutRgba(
      this.levels ?? DEFAULT_LEVELS_CONFIG,
      this.curves ?? DEFAULT_CURVES_CONFIG
    );

    const texture = gl.createTexture();
    if (!texture) {
      super.applyToWebGL(options);
      return;
    }

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
      256,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      lutData
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
  }

  applyTo2d(options: T2DPipelineState): void {
    const data = options.imageData.data;
    const lutData = buildCombinedLutRgba(
      this.levels ?? DEFAULT_LEVELS_CONFIG,
      this.curves ?? DEFAULT_CURVES_CONFIG
    );
    for (let i = 0; i < data.length; i += 4) {
      data[i] = lutData[data[i] * 4];
      data[i + 1] = lutData[data[i + 1] * 4 + 1];
      data[i + 2] = lutData[data[i + 2] * 4 + 2];
    }
  }
}
