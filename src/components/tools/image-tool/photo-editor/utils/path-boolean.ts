import type { BooleanOpKind } from '../types/studio';

import * as fabric from 'fabric';

type PaperCoreModule = typeof import('paper/dist/paper-core');
type PaperScopeInstance = InstanceType<PaperCoreModule['PaperScope']>;
type PaperItemInstance = InstanceType<PaperCoreModule['Item']>;
type PaperPathItemInstance = InstanceType<PaperCoreModule['PathItem']>;

let paperScopeInstance: PaperScopeInstance | null = null;

async function getPaperScope(): Promise<PaperScopeInstance> {
  if (paperScopeInstance) return paperScopeInstance;
  const paperModule = (await import('paper/dist/paper-core')) as unknown as {
    default?: PaperCoreModule;
    PaperScope?: PaperCoreModule['PaperScope'];
  };
  const PaperLib = paperModule.default ?? paperModule;
  const PaperScopeCtor = PaperLib.PaperScope;
  if (!PaperScopeCtor) {
    throw new Error('Failed to initialize Paper.js PaperScope.');
  }
  const scope = new PaperScopeCtor();
  scope.setup(new scope.Size(1, 1));
  paperScopeInstance = scope;
  return scope;
}

/**
 * Perform vector boolean operations (Union, Subtract, Intersect, Exclude) on >= 2 selected
 * Fabric vector/shape objects using headless Paper.js and return normalized SVG path data.
 */
export async function runVectorBooleanOperation(
  objects: fabric.FabricObject[],
  op: BooleanOpKind
): Promise<{
  pathData: string;
  left: number;
  top: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
} | null> {
  if (typeof window === 'undefined' || objects.length < 2) return null;

  const scope = await getPaperScope();
  scope.project.clear();

  const pathItems: PaperPathItemInstance[] = [];

  try {
    for (const obj of objects) {
      const svgMarkup = obj.toSVG();
      const wrapped = `<svg xmlns="http://www.w3.org/2000/svg">${svgMarkup}</svg>`;
      const imported = scope.project.importSVG(wrapped, {
        expandShapes: true,
        insert: false,
      });

      if (!imported) continue;

      const collectPathItems = (
        item: PaperItemInstance
      ): PaperPathItemInstance | null => {
        if (item instanceof scope.Path || item instanceof scope.CompoundPath) {
          return item;
        }
        if (item.children && item.children.length > 0) {
          const valid = item.children
            .map(collectPathItems)
            .filter((c): c is PaperPathItemInstance => c !== null);
          if (valid.length === 1) return valid[0];
          if (valid.length > 1) {
            let acc = valid[0];
            for (let i = 1; i < valid.length; i++) {
              acc = acc.unite(valid[i], { insert: false });
            }
            return acc;
          }
        }
        return null;
      };

      const extracted = collectPathItems(imported);
      if (extracted) {
        pathItems.push(extracted);
      }
    }

    if (pathItems.length < 2) return null;

    let result = pathItems[0];
    for (let i = 1; i < pathItems.length; i++) {
      const next = pathItems[i];
      if (op === 'union') {
        result = result.unite(next, { insert: false });
      } else if (op === 'subtract') {
        result = result.subtract(next, { insert: false });
      } else if (op === 'intersect') {
        result = result.intersect(next, { insert: false });
      } else {
        result = result.exclude(next, { insert: false });
      }
    }

    const pathData = result.pathData;
    if (!pathData || !result.bounds) return null;

    const primary = objects[0];
    return {
      pathData,
      left: result.bounds.center.x,
      top: result.bounds.center.y,
      fill: typeof primary.fill === 'string' ? primary.fill : '#0ea5e9',
      stroke: typeof primary.stroke === 'string' ? primary.stroke : '#0284c7',
      strokeWidth: primary.strokeWidth ?? 0,
    };
  } finally {
    scope.project.clear();
  }
}
