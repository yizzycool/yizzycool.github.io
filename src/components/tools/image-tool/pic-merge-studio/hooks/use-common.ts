'use client';

import * as fabric from 'fabric';
import { isArray, filter, head, flatMap } from 'lodash';

type Props = {
  refs: {
    fabricCanvasRef: React.MutableRefObject<fabric.Canvas | null>;
  };
};

export default function useCommon({ refs }: Props) {
  const { fabricCanvasRef } = refs;

  // To get the first selected image
  const getSelectedImage = (): fabric.FabricImage | undefined => {
    if (!fabricCanvasRef.current) return;
    return head(
      flatMap<fabric.FabricObject, fabric.FabricImage>(
        fabricCanvasRef.current.getActiveObjects(),
        (
          obj: fabric.FabricObject & { _objects?: fabric.FabricObject[] }
        ): fabric.FabricImage | fabric.FabricImage[] => {
          if (obj instanceof fabric.FabricImage) return obj;
          else if (isArray(obj?._objects)) {
            return filter(obj._objects, (g) => g instanceof fabric.FabricImage);
          }
          return [];
        }
      )
    );
  };

  // To get all images
  const getAllImages = (): fabric.FabricImage[] => {
    if (!fabricCanvasRef.current) return [];
    return flatMap<fabric.FabricObject, fabric.FabricImage>(
      fabricCanvasRef.current.getObjects(),
      (
        obj: fabric.FabricObject & { _objects?: fabric.FabricObject[] }
      ): fabric.FabricImage | fabric.FabricImage[] => {
        if (obj instanceof fabric.FabricImage) return obj;
        else if (isArray(obj?._objects)) {
          return filter(obj._objects, (g) => g instanceof fabric.FabricImage);
        }
        return [];
      }
    );
  };

  // Normalize stokeWidth from [0, 100] to [0, 1/20] of short edge of Canvas
  const getNormStrokeWidth = (strokeWidth: number) => {
    if (!fabricCanvasRef.current) return 0;
    const shortEdge = Math.min(
      fabricCanvasRef.current.width,
      fabricCanvasRef.current.height
    );
    return (strokeWidth / 100) * ((50 * shortEdge) / 1000);
  };

  const getOriginalStrokeWidth = (normStrokeWidth: number) => {
    if (!fabricCanvasRef.current) return 0;
    const shortEdge = Math.min(
      fabricCanvasRef.current.width,
      fabricCanvasRef.current.height
    );
    // normStrokeWidth = (strokeWidth / 100) * ((50 * shortEdge) / 1000);
    // 10^5 * normStrokeWidth = strokeWidth * (50 * shortEdge)
    // strokeWidth = (10^5 * normStrokeWidth) / (50 * shortEdge)
    return (10 ** 5 * normStrokeWidth) / (50 * shortEdge);
  };

  return {
    getSelectedImage,
    getAllImages,
    getNormStrokeWidth,
    getOriginalStrokeWidth,
  };
}
