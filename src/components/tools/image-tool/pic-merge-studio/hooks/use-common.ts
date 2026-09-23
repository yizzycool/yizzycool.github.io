import { useCallback } from 'react';
import * as fabric from 'fabric';
import { isArray, filter, head, flatMap } from 'lodash';

type Props = {
  refs: {
    fabricCanvasRef: React.MutableRefObject<fabric.Canvas | null>;
  };
};

export default function useCommon({ refs }: Props) {
  const { fabricCanvasRef } = refs;

  // To get all selected images
  const getSelectedImages = useCallback((): fabric.FabricImage[] => {
    if (!fabricCanvasRef.current) return [];
    return flatMap<fabric.FabricObject, fabric.FabricImage>(
      fabricCanvasRef.current.getActiveObjects(),
      (
        obj: fabric.FabricObject & { _objects?: fabric.FabricObject[] }
      ): fabric.FabricImage | fabric.FabricImage[] => {
        if (obj instanceof fabric.FabricImage) return [obj];
        else if (isArray(obj?._objects)) {
          return filter(obj._objects, (g) => g instanceof fabric.FabricImage);
        }
        return [];
      }
    );
  }, [fabricCanvasRef]);

  // To get the first selected image
  const getSelectedImage = useCallback((): fabric.FabricImage | undefined => {
    return head(getSelectedImages());
  }, [getSelectedImages]);

  // To get all images
  const getAllImages = useCallback((): fabric.FabricImage[] => {
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
  }, [fabricCanvasRef]);

  // Normalize stokeWidth from [0, 100] to [0, 1/20] of short edge of Canvas
  const getNormStrokeWidth = useCallback(
    (strokeWidth: number) => {
      if (!fabricCanvasRef.current) return 0;
      const shortEdge = Math.min(
        fabricCanvasRef.current.width,
        fabricCanvasRef.current.height
      );
      return (strokeWidth / 100) * ((50 * shortEdge) / 1000);
    },
    [fabricCanvasRef]
  );

  const getOriginalStrokeWidth = useCallback(
    (normStrokeWidth: number) => {
      if (!fabricCanvasRef.current) return 0;
      const shortEdge = Math.min(
        fabricCanvasRef.current.width,
        fabricCanvasRef.current.height
      );
      return (10 ** 5 * normStrokeWidth) / (50 * shortEdge);
    },
    [fabricCanvasRef]
  );

  return {
    getSelectedImage,
    getSelectedImages,
    getAllImages,
    getNormStrokeWidth,
    getOriginalStrokeWidth,
  };
}
