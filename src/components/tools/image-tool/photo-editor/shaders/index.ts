import * as fabric from 'fabric';

import { CinemaEffectsFilter } from './cinema-effects-filter';
import { CurvesLevelsFilter } from './curves-levels-filter';
import { Lut3dFilter } from './lut-3d-filter';
import { SelectiveHslFilter } from './selective-hsl-filter';

let registered = false;

/**
 * Register all custom GLSL filters with Fabric v7 classRegistry so JSON undo/redo
 * and .pes serialization restore custom shaders seamlessly.
 */
export function ensureCustomShadersRegistered(): void {
  if (registered) return;
  registered = true;

  fabric.classRegistry.setClass(CurvesLevelsFilter, CurvesLevelsFilter.type);
  fabric.classRegistry.setClass(SelectiveHslFilter, SelectiveHslFilter.type);
  fabric.classRegistry.setClass(CinemaEffectsFilter, CinemaEffectsFilter.type);
  fabric.classRegistry.setClass(Lut3dFilter, Lut3dFilter.type);
}

ensureCustomShadersRegistered();

export {
  CinemaEffectsFilter,
  CurvesLevelsFilter,
  Lut3dFilter,
  SelectiveHslFilter,
};
export {
  buildCombinedLutRgba,
  evaluateCurveSpline,
} from './curves-levels-filter';
