import type { ConfigHelper } from '../types/config-helper';
import type { GridCell, GridEdge, GridTemplate } from '../types/grid-layout';
import type {
  BentoTemplateId,
  CanvasBorder,
  CanvasConfig,
} from '../types/config';
import type {
  ExtendedFabricImage,
  StudioSnapshot,
} from '../utils/studio-snapshot';

import * as fabric from 'fabric';
import { range } from 'lodash';

import colorUtils from '@/utils/color-utils';

import useCommon from './use-common';
import {
  FABRIC_CONTROL_CONFIG,
  FABRIC_IMAGE_CONFIG,
  type FabricInternalStates,
} from './use-fabric';
import { getBentoTemplateById } from '../data/bento-templates';
import {
  attachImageAssetMeta,
  deserializeFilters,
  serializeFilters,
} from '../utils/studio-snapshot';

type Props = {
  refs: {
    containerRef: React.MutableRefObject<HTMLDivElement | null>;
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
    fabricCanvasRef: React.MutableRefObject<fabric.Canvas | null>;
    gridRef: React.MutableRefObject<GridTemplate | null>;
  };
  configHelper: ConfigHelper;
  fabricHelper: FabricInternalStates;
};

export default function useGridLogic({
  refs,
  configHelper,
  // fabricHelper,
}: Props) {
  const {
    // containerRef,
    // canvasRef,
    fabricCanvasRef,
    gridRef,
  } = refs;

  const {
    canvasConfig,
    // setCanvasConfig,

    // globalImageConfig,
    // setGlobalImageConfig,

    // imageConfig,
    // setImageConfig,
  } = configHelper;

  // const {
  //   isFabricReady,
  //   setIsFabricReady,

  //   isExporting,
  //   setIsExporting,

  //   hasImageSelection,
  //   setHasImageSelection,
  // } = fabricHelper;

  const { getAllImages, getNormStrokeWidth } = useCommon({
    refs: { fabricCanvasRef },
  });

  const createGridCell = async (
    rows: number,
    cols: number,
    root: GridTemplate
  ) => {
    if (!fabricCanvasRef.current) return;

    const images = getAllImages();

    // Get canvas size / grid line width
    const canvasWidth = fabricCanvasRef.current.width;
    const canvasHeight = fabricCanvasRef.current.height;

    // Calculate size of each cell
    const cellWidth = canvasWidth / cols;
    const cellHeight = canvasHeight / rows;

    // generate each cell
    let id = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = cellWidth * j;
        const y = cellHeight * i;

        let img;
        if (id < images.length) {
          const sourceImg = images[id];
          const sourceExt = sourceImg as ExtendedFabricImage;
          const src = sourceImg.getSrc();
          // new image
          img = await fabric.FabricImage.fromURL(src, {
            crossOrigin: 'anonymous',
          });
          attachImageAssetMeta(img, {
            assetId: sourceExt._assetId,
            fileName: sourceExt._fileName,
            layerName: sourceExt._layerName,
            layerId: sourceExt._layerId,
          });
          const serializedFilters = serializeFilters(sourceImg.filters);
          if (serializedFilters.length > 0) {
            img.set({ filters: deserializeFilters(serializedFilters) });
            img.applyFilters();
          }

          const scale = Math.max(
            cellWidth / img.width,
            cellHeight / img.height
          );
          img.set({
            scaleX: scale,
            scaleY: scale,
            left: x + cellWidth / 2,
            top: y + cellHeight / 2,
            ...FABRIC_IMAGE_CONFIG,
          });
        } else {
          const imageEl = new Image();
          img = new fabric.FabricImage(imageEl, {
            width: cellWidth,
            height: cellHeight,
            left: x + cellWidth / 2,
            top: y + cellHeight / 2,
            ...FABRIC_IMAGE_CONFIG,
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false,
          } as fabric.ImageProps & { _strokeWidthRatio: number });
        }

        // clipPath
        const clipPath = new fabric.Rect({
          width: cellWidth,
          height: cellHeight,
          left: x + cellWidth / 2,
          top: y + cellHeight / 2,
          absolutePositioned: true,
        });
        img!.clipPath = clipPath;

        // Create new cell object
        const cell: GridCell = {
          id: id + 1,
          adjacentEdges: [],
          element: img,
        };
        root.cells[i][j] = cell;

        id += 1;
      }
    }
  };

  const bindEdgeListener = (edge: GridEdge) => {
    if (!fabricCanvasRef.current) return;

    let lastLeft: number;
    let lastTop: number;
    edge.element.on('moving', (e) => {
      const { transform } = e;
      const { original, target } = transform;
      if (lastLeft === undefined || lastTop === undefined) {
        lastLeft = original.left;
        lastTop = original.top;
      }
      const deltaX = target.left - lastLeft;
      const deltaY = target.top - lastTop;

      const updateObject = (
        cells: GridCell[],
        deltaX: number,
        deltaY: number,
        type: 'prev' | 'next'
      ) => {
        cells.forEach((cell) => {
          const img = cell.element;
          if (!img) return;

          const clipPath = img.clipPath;
          if (!clipPath) return;
          const widthOffset = type === 'next' ? -deltaX : deltaX;
          const heightOffset = type === 'next' ? -deltaY : deltaY;
          if (!img.getSrc()) {
            img.set({
              left: clipPath.left + deltaX / 2,
              top: clipPath.top + deltaY / 2,
              width: clipPath.width + widthOffset,
              height: clipPath.height + heightOffset,
            });
            img.setCoords();
          }
          clipPath.set({
            left: clipPath.left + deltaX / 2,
            top: clipPath.top + deltaY / 2,
            width: clipPath.width + widthOffset,
            height: clipPath.height + heightOffset,
          });
          clipPath.setCoords();
        });
      };

      const { prev, next } = edge.adjacentCells;
      updateObject(prev, deltaX, deltaY, 'prev');
      updateObject(next, deltaX, deltaY, 'next');

      lastLeft = target.left;
      lastTop = target.top;

      fabricCanvasRef.current!.requestRenderAll();
    });
  };

  const createGridEdge = (rows: number, cols: number, root: GridTemplate) => {
    if (!fabricCanvasRef.current) return;

    // Get canvas size / canvas border / grid line width
    const canvasWidth = fabricCanvasRef.current.getWidth();
    const canvasHeight = fabricCanvasRef.current.getHeight();
    const { width: gridBorderWidth } = canvasConfig.gridConfig.border;
    const innerBorderWidth = getNormStrokeWidth(gridBorderWidth) / 2;

    // Calculate size of each cell
    const cellWidth = canvasWidth / cols;
    const cellHeight = canvasHeight / rows;

    // Get border color
    const { color, opacity } = canvasConfig.gridConfig.border;
    const rgba = colorUtils.hexToRgba(color);
    const hex = colorUtils.rgbaToHex({ ...rgba, a: opacity });

    // Fabric common config
    const commonConfig = {
      fill: hex,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      lockSkewingX: true,
      lockSkewingY: true,
      hasControls: false,
      hasBorders: false,
      strokeWidth: 0,
    };

    let id = 1;

    // Generate horizontal edges
    for (let i = 1; i < rows; i++) {
      const y = cellHeight * i;
      const obj = new fabric.Rect({
        width: canvasWidth,
        height: innerBorderWidth,
        left: canvasWidth / 2,
        top: y,
        lockMovementX: true,
        hoverCursor: 'row-resize',
        moveCursor: 'row-resize',
        ...commonConfig,
      } as fabric.RectProps & { _customKey: string; _edgeIndex: number });
      (
        obj as unknown as { _customKey: string; _edgeIndex: number }
      )._customKey = 'grid-edge-h';
      (
        obj as unknown as { _customKey: string; _edgeIndex: number }
      )._edgeIndex = i;

      // Create new edge object
      const edge: GridEdge = {
        id,
        direction: 'horizontal',
        adjacentCells: {
          prev: root.cells[i - 1] as GridCell[],
          next: root.cells[i] as GridCell[],
        },
        element: obj,
      };
      // retrive adjacent cells and add edge into GridCell.adjacentEdges[]
      edge.adjacentCells.prev.forEach((cell) => cell.adjacentEdges.push(edge));
      edge.adjacentCells.next.forEach((cell) => cell.adjacentEdges.push(edge));

      bindEdgeListener(edge);
      for (let e = 1; e < cols; e++) {
        root.edges.horizontal[i][e] = edge;
      }
      id += 1;
    }

    // Generate vertical edges
    for (let j = 1; j < cols; j++) {
      const x = cellWidth * j;
      const obj = new fabric.Rect({
        width: innerBorderWidth,
        height: canvasHeight,
        left: x,
        top: canvasHeight / 2,
        lockMovementY: true,
        hoverCursor: 'col-resize',
        moveCursor: 'col-resize',
        ...commonConfig,
      } as fabric.RectProps & { _customKey: string; _edgeIndex: number });
      (
        obj as unknown as { _customKey: string; _edgeIndex: number }
      )._customKey = 'grid-edge-v';
      (
        obj as unknown as { _customKey: string; _edgeIndex: number }
      )._edgeIndex = j;

      // Create new edge object
      const edge: GridEdge = {
        id,
        direction: 'vertical',
        adjacentCells: {
          prev: range(rows).map((idx) => root.cells[idx][j - 1]) as GridCell[],
          next: range(rows).map((idx) => root.cells[idx][j]) as GridCell[],
        },
        element: obj,
      };
      // retrive adjacent cells and add edge into GridCell.adjacentEdges[]
      edge.adjacentCells.prev.forEach((cell) => cell.adjacentEdges.push(edge));
      edge.adjacentCells.next.forEach((cell) => cell.adjacentEdges.push(edge));

      bindEdgeListener(edge);
      for (let e = 1; e < rows; e++) {
        root.edges.vertical[e][j] = edge;
      }
      id += 1;
    }
  };

  // To update border rect of Fabric Canvas
  const updateGridOuterBorder = () => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.requestRenderAll();
  };

  // To add all objects into Fabric Canvas
  const addAllObjectsToCanvas = (root: GridTemplate) => {
    if (!fabricCanvasRef.current || !root) return;

    // Retrive cells
    root.cells.forEach((row) => {
      row.forEach((cell) => {
        fabricCanvasRef.current?.add(cell.element);
      });
    });

    // Retrive edges
    for (let i = 1; i < root.edges.horizontal.length; i++) {
      const edgeEl =
        root.edges.horizontal[i]?.[1]?.element ??
        root.edges.horizontal[i]?.[0]?.element;
      if (edgeEl) fabricCanvasRef.current?.add(edgeEl);
    }
    for (let j = 1; j < (root.edges.vertical[1]?.length ?? 0); j++) {
      const edgeEl =
        root.edges.vertical[1]?.[j]?.element ??
        root.edges.vertical[0]?.[j]?.element;
      if (edgeEl) fabricCanvasRef.current?.add(edgeEl);
    }
  };

  const createGridTemplate = async (rows: number, cols: number) => {
    if (!fabricCanvasRef.current) return null;

    // Generate root cell
    const root: GridTemplate = {
      cellIds: new Set(range(1, rows * cols + 1)),
      edgeIds: new Set(range(1, Math.max(1, (rows - 1) * (cols - 1)))),
      edges: {
        horizontal: Array.from({ length: rows }, () =>
          Array.from({ length: cols })
        ),
        vertical: Array.from({ length: rows }, () =>
          Array.from({ length: cols })
        ),
      },
      cells: Array.from({ length: rows }, () => Array.from({ length: cols })),
    };

    // Generate grid cells and grid edges
    await createGridCell(rows, cols, root);
    createGridEdge(rows, cols, root);
    updateGridOuterBorder();

    // Remove existed objects
    fabricCanvasRef.current.remove(...fabricCanvasRef.current.getObjects());
    // Add all objects into Fabric Canvas
    addAllObjectsToCanvas(root);
    fabricCanvasRef.current.requestRenderAll();

    return root;
  };

  const createBentoGridTemplate = async (
    templateId: BentoTemplateId
  ): Promise<GridTemplate | null> => {
    const spec = getBentoTemplateById(templateId);
    if (!fabricCanvasRef.current || !spec) return null;

    const existingImages = getAllImages();
    const canvasWidth = fabricCanvasRef.current.width;
    const canvasHeight = fabricCanvasRef.current.height;
    const { width: gridBorderWidth } = canvasConfig.gridConfig.border;
    const gutter = Math.max(4, getNormStrokeWidth(gridBorderWidth) / 2);

    const cellCount = spec.cells.length;
    const root: GridTemplate = {
      cellIds: new Set(range(1, cellCount + 1)),
      edgeIds: new Set(),
      edges: {
        horizontal: [[]],
        vertical: [[]],
      },
      cells: [Array.from({ length: cellCount })],
    };

    for (let idx = 0; idx < cellCount; idx++) {
      const box = spec.cells[idx];
      const rawW = box.w * canvasWidth;
      const rawH = box.h * canvasHeight;
      const cellW = Math.max(40, rawW - gutter);
      const cellH = Math.max(
        40,
        rawH - gutter - (box.polaroidBottom ? rawH * box.polaroidBottom : 0)
      );
      const centerX = box.x * canvasWidth + rawW / 2;
      const centerY =
        box.y * canvasHeight +
        (rawH - (box.polaroidBottom ? rawH * box.polaroidBottom : 0)) / 2;

      let img: fabric.FabricImage;
      if (idx < existingImages.length) {
        const sourceImg = existingImages[idx];
        const sourceExt = sourceImg as ExtendedFabricImage;
        img = await fabric.FabricImage.fromURL(sourceImg.getSrc(), {
          crossOrigin: 'anonymous',
        });
        attachImageAssetMeta(img, {
          assetId: sourceExt._assetId,
          fileName: sourceExt._fileName,
          layerName: sourceExt._layerName,
          layerId: sourceExt._layerId,
        });
        const serializedFilters = serializeFilters(sourceImg.filters);
        if (serializedFilters.length > 0) {
          img.set({ filters: deserializeFilters(serializedFilters) });
          img.applyFilters();
        }
        const scale = Math.max(cellW / img.width, cellH / img.height);
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: centerX,
          top: centerY,
          ...FABRIC_IMAGE_CONFIG,
        });
      } else {
        const imageEl = new Image();
        img = new fabric.FabricImage(imageEl, {
          width: cellW,
          height: cellH,
          left: centerX,
          top: centerY,
          ...FABRIC_IMAGE_CONFIG,
          lockMovementX: true,
          lockMovementY: true,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
          hasControls: false,
        } as fabric.ImageProps & { _strokeWidthRatio: number });
      }

      img.clipPath = new fabric.Rect({
        width: cellW,
        height: cellH,
        left: centerX,
        top: centerY,
        rx: box.polaroidBottom ? 4 : 12,
        ry: box.polaroidBottom ? 4 : 12,
        absolutePositioned: true,
      });

      root.cells[0][idx] = {
        id: idx + 1,
        adjacentEdges: [],
        element: img,
      };
    }

    fabricCanvasRef.current.remove(...fabricCanvasRef.current.getObjects());
    addAllObjectsToCanvas(root);
    fabricCanvasRef.current.requestRenderAll();
    return root;
  };

  const updateAfterResize = () => {
    if (!fabricCanvasRef.current || !gridRef.current) return;

    // Calculate ratio between new / old canvas size
    const { width, height } = canvasConfig.size;
    const newWidth = fabricCanvasRef.current.width;
    const newHeight = fabricCanvasRef.current.height;
    const ratioX = newWidth / width;
    const ratioY = newHeight / height;

    // Update cells
    const visitedCellsSet = new Set();
    gridRef.current.cells.forEach((row) => {
      row.forEach((cell) => {
        if (!cell || visitedCellsSet.has(cell.id)) return;
        visitedCellsSet.add(cell.id);
        // update each cell
        cell.element.clipPath?.set({
          width: cell.element.clipPath.width * ratioX,
          height: cell.element.clipPath.height * ratioY,
          left: cell.element.clipPath.left * ratioX,
          top: cell.element.clipPath.top * ratioY,
        });
        if (!cell.element.getSrc()) {
          // if src is empty
          cell.element.set({
            width: cell.element.width * ratioX,
            height: cell.element.height * ratioY,
            left: cell.element.left * ratioX,
            top: cell.element.top * ratioY,
          });
        } else {
          cell.element.set({
            left: cell.element.left * ratioX,
            top: cell.element.top * ratioY,
            scaleX: cell.element.scaleX * ratioX,
            scaleY: cell.element.scaleY * ratioX,
          });
        }
        cell.element.setCoords();
      });
    });

    // Calculate new border size
    const normStrokeWidth =
      getNormStrokeWidth(canvasConfig.gridConfig.border.width) / 2;

    // Update edges
    const visitedEdgesSet = new Set();
    gridRef.current.edges.horizontal.forEach((row) => {
      row.forEach((edge) => {
        if (!edge || visitedEdgesSet.has(edge.id)) return;
        visitedEdgesSet.add(edge.id);
        // update each edge
        edge.element.set({
          width: edge.element.width * ratioX,
          height: normStrokeWidth,
          left: edge.element.left * ratioX,
          top: edge.element.top * ratioY,
        });
      });
    });
    gridRef.current.edges.vertical.forEach((row) => {
      row.forEach((edge) => {
        if (!edge || visitedEdgesSet.has(edge.id)) return;
        visitedEdgesSet.add(edge.id);
        // update each edge
        edge.element.set({
          width: normStrokeWidth,
          height: edge.element.height * ratioY,
          left: edge.element.left * ratioX,
          top: edge.element.top * ratioY,
        });
      });
    });

    fabricCanvasRef.current.requestRenderAll();
  };

  // const updateEdges = (width: number, stroke: string, showOuter: boolean) => {
  const updateEdges = (
    gridBorder: Partial<CanvasBorder & { showOuter: boolean }>
  ) => {
    if (!fabricCanvasRef.current || !gridRef.current) return;

    const color = gridBorder.color ?? canvasConfig.gridConfig.border.color;
    const opacity =
      gridBorder.opacity ?? canvasConfig.gridConfig.border.opacity;
    const width = gridBorder.width ?? canvasConfig.gridConfig.border.width;

    // Calculate new border size
    const normStrokeWidth = getNormStrokeWidth(width) / 2;

    // Calculate new color hex
    const rgba = colorUtils.hexToRgba(color);
    const stroke = colorUtils.rgbaToHex({ ...rgba, a: opacity });

    // Update edges
    const visitedEdgesSet = new Set();
    gridRef.current.edges.horizontal.forEach((row) => {
      row.forEach((edge) => {
        if (!edge || visitedEdgesSet.has(edge.id)) return;
        visitedEdgesSet.add(edge.id);
        // update each edge
        edge.element.set({
          height: normStrokeWidth,
          fill: stroke,
        });
      });
    });
    gridRef.current.edges.vertical.forEach((row) => {
      row.forEach((edge) => {
        if (!edge || visitedEdgesSet.has(edge.id)) return;
        visitedEdgesSet.add(edge.id);
        // update each edge
        edge.element.set({
          width: normStrokeWidth,
          fill: stroke,
        });
      });
    });

    fabricCanvasRef.current.requestRenderAll();
  };

  const restoreGridFromSnapshot = async (
    gridData: NonNullable<StudioSnapshot['gridData']>,
    gridBorder: CanvasConfig['gridConfig']['border'],
    resolveAssetUrl: (assetId: string, fallbackSrc: string) => string | null
  ): Promise<GridTemplate | null> => {
    if (!fabricCanvasRef.current) return null;

    const { rows, cols, cells, edges } = gridData;
    const root: GridTemplate = {
      cellIds: new Set(range(1, rows * cols + 1)),
      edgeIds: new Set(range(1, Math.max(1, (rows - 1) * (cols - 1)))),
      edges: {
        horizontal: Array.from({ length: rows }, () =>
          Array.from({ length: cols })
        ),
        vertical: Array.from({ length: rows }, () =>
          Array.from({ length: cols })
        ),
      },
      cells: Array.from({ length: rows }, () => Array.from({ length: cols })),
    };

    let cellId = 1;
    for (const cellData of cells) {
      const { row, col, hasSrc, layer, clipPath: clip } = cellData;
      let img: fabric.FabricImage | null = null;

      if (hasSrc && layer) {
        const url = resolveAssetUrl(layer.assetId, layer.src);
        if (url) {
          try {
            img = await fabric.FabricImage.fromURL(url, {
              crossOrigin: 'anonymous',
            });
            attachImageAssetMeta(img, {
              assetId: layer.assetId,
              fileName: layer.fileName,
              layerName: layer.layerName,
              layerId: layer.layerId,
            });
            img.set({
              left: layer.left,
              top: layer.top,
              scaleX: layer.scaleX,
              scaleY: layer.scaleY,
              angle: layer.angle,
              opacity: layer.opacity,
              visible: layer.visible,
              flipX: layer.flipX,
              flipY: layer.flipY,
              lockMovementX: layer.lockMovementX,
              lockMovementY: layer.lockMovementY,
              snapAngle: layer.snapAngle,
              snapThreshold: layer.snapThreshold,
              stroke: layer.stroke,
              strokeWidth: layer.strokeWidth,
              _strokeWidthRatio: layer.strokeWidthRatio,
              lockScalingFlip: true,
              lockSkewingX: true,
              lockSkewingY: true,
              centeredScaling: true,
              ...FABRIC_CONTROL_CONFIG,
            });

            if (layer.filters.length > 0) {
              img.set({ filters: deserializeFilters(layer.filters) });
              img.applyFilters();
            }
          } catch {
            img = null;
          }
        }
      }

      if (!img) {
        const imageEl = new Image();
        img = new fabric.FabricImage(imageEl, {
          width: clip.width,
          height: clip.height,
          left: clip.left,
          top: clip.top,
          ...FABRIC_IMAGE_CONFIG,
          lockMovementX: true,
          lockMovementY: true,
          lockRotation: true,
          lockScalingX: true,
          lockScalingY: true,
          hasControls: false,
        } as fabric.ImageProps & { _strokeWidthRatio: number });
      }

      img.clipPath = new fabric.Rect({
        width: clip.width,
        height: clip.height,
        left: clip.left,
        top: clip.top,
        absolutePositioned: true,
      });

      root.cells[row][col] = {
        id: cellId,
        adjacentEdges: [],
        element: img,
      };
      cellId += 1;
    }

    const rgba = colorUtils.hexToRgba(gridBorder.color);
    const edgeFill = colorUtils.rgbaToHex({ ...rgba, a: gridBorder.opacity });
    const commonEdgeConfig = {
      fill: edgeFill,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      lockSkewingX: true,
      lockSkewingY: true,
      hasControls: false,
      hasBorders: false,
      strokeWidth: 0,
    };

    let edgeId = 1;
    for (const edgeData of edges) {
      if (edgeData.direction === 'horizontal') {
        const i = edgeData.index;
        const obj = new fabric.Rect({
          width: edgeData.width,
          height: edgeData.height,
          left: edgeData.left,
          top: edgeData.top,
          lockMovementX: true,
          hoverCursor: 'row-resize',
          moveCursor: 'row-resize',
          ...commonEdgeConfig,
        } as fabric.RectProps & { _customKey: string; _edgeIndex: number });
        (
          obj as unknown as { _customKey: string; _edgeIndex: number }
        )._customKey = 'grid-edge-h';
        (
          obj as unknown as { _customKey: string; _edgeIndex: number }
        )._edgeIndex = i;

        const edge: GridEdge = {
          id: edgeId,
          direction: 'horizontal',
          adjacentCells: {
            prev: (root.cells[i - 1] ?? []).filter(Boolean) as GridCell[],
            next: (root.cells[i] ?? []).filter(Boolean) as GridCell[],
          },
          element: obj,
        };
        edge.adjacentCells.prev.forEach((cell) =>
          cell.adjacentEdges.push(edge)
        );
        edge.adjacentCells.next.forEach((cell) =>
          cell.adjacentEdges.push(edge)
        );
        bindEdgeListener(edge);

        if (cols <= 1) {
          root.edges.horizontal[i][0] = edge;
        } else {
          for (let e = 1; e < cols; e++) {
            root.edges.horizontal[i][e] = edge;
          }
        }
      } else {
        const j = edgeData.index;
        const obj = new fabric.Rect({
          width: edgeData.width,
          height: edgeData.height,
          left: edgeData.left,
          top: edgeData.top,
          lockMovementY: true,
          hoverCursor: 'col-resize',
          moveCursor: 'col-resize',
          ...commonEdgeConfig,
        } as fabric.RectProps & { _customKey: string; _edgeIndex: number });
        (
          obj as unknown as { _customKey: string; _edgeIndex: number }
        )._customKey = 'grid-edge-v';
        (
          obj as unknown as { _customKey: string; _edgeIndex: number }
        )._edgeIndex = j;

        const edge: GridEdge = {
          id: edgeId,
          direction: 'vertical',
          adjacentCells: {
            prev: range(rows)
              .map((idx) => root.cells[idx]?.[j - 1])
              .filter(Boolean) as GridCell[],
            next: range(rows)
              .map((idx) => root.cells[idx]?.[j])
              .filter(Boolean) as GridCell[],
          },
          element: obj,
        };
        edge.adjacentCells.prev.forEach((cell) =>
          cell.adjacentEdges.push(edge)
        );
        edge.adjacentCells.next.forEach((cell) =>
          cell.adjacentEdges.push(edge)
        );
        bindEdgeListener(edge);

        if (rows <= 1) {
          root.edges.vertical[0][j] = edge;
        } else {
          for (let e = 1; e < rows; e++) {
            root.edges.vertical[e][j] = edge;
          }
        }
      }
      edgeId += 1;
    }

    fabricCanvasRef.current.remove(...fabricCanvasRef.current.getObjects());
    addAllObjectsToCanvas(root);
    gridRef.current = root;
    fabricCanvasRef.current.requestRenderAll();

    return root;
  };

  return {
    createGridTemplate,
    createBentoGridTemplate,
    updateAfterResize,
    updateEdges,
    restoreGridFromSnapshot,
  };
}
