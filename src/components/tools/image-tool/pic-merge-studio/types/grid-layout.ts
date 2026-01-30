import type * as fabric from 'fabric';

export type GridTemplate = {
  cellIds: Set<number>;
  edgeIds: Set<number>;
  edges: {
    horizontal: GridEdge[][];
    vertical: GridEdge[][];
  };
  cells: GridCell[][];
};

export type GridCell = {
  id: number;
  adjacentEdges: GridEdge[];
  element: fabric.FabricImage;
};

export type GridEdge = {
  id: number;
  direction: 'horizontal' | 'vertical';
  adjacentCells: {
    prev: GridCell[];
    next: GridCell[];
  };
  element: fabric.Rect;
};
