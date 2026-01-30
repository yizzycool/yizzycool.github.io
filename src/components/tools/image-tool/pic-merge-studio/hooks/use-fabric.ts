'use client';

import type { FabricHelper } from '../types/fabric-helper';
import type { ConfigHelper } from '../types/config-helper';
import type { GridTemplate } from '../types/grid-layout';
import type { SupportedFabricFilterType } from '../types/fabric-filter';

import * as fabric from 'fabric';
import { useEffect, useRef, useState } from 'react';

import useCanvasUpdater from './use-canvas-updater';
import useImageUpdater from './use-image-updater';
import useImagesUpdater from './use-images-updater';
import useCommon from './use-common';
import useGridUpdater from './use-grid-updater';
import colorUtils from '@/utils/color-utils';
import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';
import { DefaultCanvasConfig } from '..';

// let fabric = null;

export const FabricControlConfig = {
  strokeUniform: true,
  borderColor: '#12a29282',
  cornerColor: '#12a29282',
  cornerStyle: 'circle',
  cornerStrokeColor: '#ffffff7f',
  transparentCorners: false,
  cornerSize: 20,
  borderScaleFactor: 5,
  touchCornerSize: 40,
};

export const FabricImageConfig = {
  lockScalingFlip: true,
  lockSkewingX: true,
  lockSkewingY: true,
  centeredScaling: true,
  strokeWidth: 0,
  _strokeWidthRatio: 0,
  stroke: '',
  ...FabricControlConfig,
};

export type FabricInternalStates = {
  isFabricReady: boolean;
  setIsFabricReady: React.Dispatch<React.SetStateAction<boolean>>;

  isExporting: boolean;
  setIsExporting: React.Dispatch<React.SetStateAction<boolean>>;

  hasImageSelection: boolean;
  setHasImageSelection: React.Dispatch<React.SetStateAction<boolean>>;
};

type Props = {
  refs: {
    containerRef: React.MutableRefObject<HTMLDivElement | null>;
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  };
  configHelper: ConfigHelper;
};

export default function useFabric({ refs, configHelper }: Props): FabricHelper {
  const { containerRef, canvasRef } = refs;
  const {
    canvasConfig,
    // setCanvasConfig,

    // globalImageConfig,
    // setGlobalImageConfig,

    // imageConfig,
    setImageConfig,
  } = configHelper;

  const [isFabricReady, setIsFabricReady] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasImageSelection, setHasImageSelection] = useState(false);
  const [hasImageSrc, setHasImageSrc] = useState(false);

  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const fabricCanvasBorderRectRef = useRef<fabric.Rect | null>(null);
  const gridRef = useRef<GridTemplate | null>(null);

  const fabricHelper = {
    isFabricReady,
    setIsFabricReady,

    isExporting,
    setIsExporting,

    hasImageSelection,
    setHasImageSelection,
  };

  const canvasUpdater = useCanvasUpdater({
    refs: { ...refs, fabricCanvasRef, fabricCanvasBorderRectRef },
    configHelper,
    fabricHelper,
  });

  const imageUpdater = useImageUpdater({
    refs: { ...refs, fabricCanvasRef, fabricCanvasBorderRectRef },
    configHelper,
    fabricHelper,
  });

  const imagesUpdater = useImagesUpdater({
    refs: { ...refs, fabricCanvasRef, fabricCanvasBorderRectRef, gridRef },
    configHelper,
    fabricHelper,
  });

  const gridUpdater = useGridUpdater({
    refs: { ...refs, fabricCanvasRef, fabricCanvasBorderRectRef, gridRef },
    configHelper,
    fabricHelper,
  });

  const { getSelectedImage } = useCommon({ refs: { fabricCanvasRef } });

  // Init Fabric.js
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create a Canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: DefaultCanvasConfig.background.color?.color,
      selection: false,
      enableRetinaScaling: true,
    });
    fabricCanvasRef.current = canvas;
    fabricCanvasRef.current.setDimensions({
      width: DefaultCanvasConfig.size.width,
      height: DefaultCanvasConfig.size.height,
    });

    // Create border rect
    fabricCanvasBorderRectRef.current = new fabric.Rect({
      selectable: false,
      evented: false,
      fill: 'transparent',
      _customKey: 'border-rect',
    });
    fabricCanvasRef.current.add(fabricCanvasBorderRectRef.current);
    bindBorderZIndexGuard();

    // Init all monitors
    initHasImageSelectionMonitor();
    initSelectedImageMonitor();
    initHammerPinch();

    // Custom event to update image selection status
    const unsubscriber = customEventUtils.on(
      CustomEvents.tools.fabricRecalcSelection,
      recalcSelection
    );

    // Render all
    fabricCanvasRef.current.requestRenderAll();

    // Init Fabric completely
    setIsFabricReady(true);

    return () => {
      canvas.dispose();
      unsubscriber();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update canvas while window size changed
  useEffect(() => {
    if (!isFabricReady) return;

    resizeDisplay();
    window.addEventListener('resize', resizeDisplay);

    return () => {
      window.removeEventListener('resize', resizeDisplay);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFabricReady, canvasConfig.size]);

  // To resize canvas element when window resized
  const resizeDisplay = () => {
    if (!containerRef.current || !fabricCanvasRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const canvasSize = canvasConfig.size;

    const scale = Math.min(
      containerWidth / canvasSize.width,
      containerHeight / canvasSize.height,
      1
    );

    // Update canvas wrapper
    const wrapper = document.querySelector('.canvas-container') as HTMLElement;
    if (wrapper) {
      wrapper.style.width = `${canvasSize.width * scale}px`;
      wrapper.style.height = `${canvasSize.height * scale}px`;
    }

    // Update lower canvas
    const lowerCanvas = document.querySelector('.lower-canvas') as HTMLElement;
    if (lowerCanvas) {
      lowerCanvas.style.width = `${canvasSize.width * scale}px`;
      lowerCanvas.style.height = `${canvasSize.height * scale}px`;
    }

    // Update upper canvas
    const upperCanvas = document.querySelector('.upper-canvas') as HTMLElement;
    if (upperCanvas) {
      upperCanvas.style.width = `${canvasSize.width * scale}px`;
      upperCanvas.style.height = `${canvasSize.height * scale}px`;
    }

    // Update fabricCanvas key
    fabricCanvasRef.current.set('_scale', scale);
  };

  // Handler to update if any selection exists in Fabric Canvas
  const recalcSelection = () => {
    if (!fabricCanvasRef.current) return;

    const selectedImage = getSelectedImage();

    setHasImageSelection(!!selectedImage);
    setHasImageSrc(!!selectedImage?.getSrc?.());

    // Trigger to switch to 'Image' tab
    if (!!selectedImage) {
      customEventUtils.emit(CustomEvents.common.switchTab, { tab: 'Image' });
    }

    // Recalculate control storke
    if (!!selectedImage) {
      const _scale = fabricCanvasRef.current.get('_scale');
      selectedImage.set({
        cornerSize: 10 / _scale,
        touchCornerSize: 40 / _scale,
        borderScaleFactor: (selectedImage.getSrc() ? 2 : 5) / _scale,
      });
      selectedImage.controls.mtr.offsetY = -20 / _scale;
      selectedImage.setCoords();
      fabricCanvasRef.current.requestRenderAll();
    }
  };

  // Monitor to update if any selection exists in Fabric Canvas
  const initHasImageSelectionMonitor = () => {
    if (!fabricCanvasRef.current) return;

    fabricCanvasRef.current.on('selection:created', recalcSelection);
    fabricCanvasRef.current.on('selection:updated', recalcSelection);
    fabricCanvasRef.current.on('selection:cleared', recalcSelection);
  };

  // Monitor to update imageConfig if selection changed in Fabric Canvas
  const initSelectedImageMonitor = () => {
    if (!fabricCanvasRef.current) return;

    const syncSelectedImageConfig = () => {
      if (!fabricCanvasRef.current) return;
      const selectedImage = getSelectedImage();
      if (!selectedImage) return;

      // Only sync with the first selected image
      const rgbaHex = (selectedImage.stroke || '') as string;
      const { color, opacity } = colorUtils.hexToColorOpacity(rgbaHex);

      setImageConfig((prev) => ({
        ...prev,
        opacity: selectedImage.opacity,
        border: {
          width: selectedImage.get('_strokeWidthRatio') || 0,
          color: color.toUpperCase(),
          opacity,
        },
        angle: selectedImage.angle,
        scaleX: selectedImage.scaleX,
        scaleY: selectedImage.scaleY,
        lockMovementX: selectedImage.lockMovementX,
        lockMovementY: selectedImage.lockMovementY,
        flipX: selectedImage.flipX,
        flipY: selectedImage.flipY,
        filters:
          selectedImage.filters as InstanceType<SupportedFabricFilterType>[],
      }));
    };

    const syncSelectedImageGeometry = (type: 'rotating' | 'scaling') => {
      if (!fabricCanvasRef.current) return;
      const selectedImage = getSelectedImage();
      if (!selectedImage) return;

      if (type === 'rotating') {
        setImageConfig((prev) => ({
          ...prev,
          angle: selectedImage.angle,
        }));
      } else if (type === 'scaling') {
        setImageConfig((prev) => ({
          ...prev,
          scaleX: selectedImage.scaleX,
          scaleY: selectedImage.scaleY,
        }));
      }
    };

    fabricCanvasRef.current.on('selection:created', syncSelectedImageConfig);
    fabricCanvasRef.current.on('selection:updated', syncSelectedImageConfig);
    fabricCanvasRef.current.on('selection:cleared', syncSelectedImageConfig);
    fabricCanvasRef.current.on('object:rotating', () =>
      syncSelectedImageGeometry('rotating')
    );
    fabricCanvasRef.current.on('object:scaling', () =>
      syncSelectedImageGeometry('scaling')
    );
  };

  const initHammerPinch = async () => {
    if (!fabricCanvasRef.current) return;

    // Ned to import Hammer dynamically or `window` issue will occur while running `yarn build`
    const Hammer = (await import('hammerjs')).default;

    const el = fabricCanvasRef.current.upperCanvasEl;
    const hammer = new Hammer.Manager(el, {
      recognizers: [
        // RecognizerClass, [options], [recognizeWith, ...], [requireFailure, ...]
        [Hammer.Rotate],
        [Hammer.Pinch, { enable: true }, ['rotate']],
      ],
    });

    const fabricStates = {
      initScale: 1,
      initAngle: 0,
      lockMovementX: false,
      lockMovementY: false,
    };

    const hammerStates = {
      initScale: 1,
      initAngle: 0,
    };

    let target: fabric.FabricObject | null = null;

    hammer.on('pinchstart', (e) => {
      if (!fabricCanvasRef.current) return;
      const activeObject = fabricCanvasRef.current.getActiveObject();
      if (!activeObject) return;

      target = activeObject;

      fabricStates.lockMovementX = activeObject.lockMovementX;
      fabricStates.lockMovementY = activeObject.lockMovementY;
      fabricStates.initScale = activeObject.scaleX ?? 1;
      fabricStates.initAngle = activeObject.angle ?? 0;
      activeObject.set({
        lockMovementX: true,
        lockMovementY: true,
      });
      fabricCanvasRef.current.requestRenderAll();

      hammerStates.initScale = e.scale ?? 1;
      hammerStates.initAngle = e.rotation ?? 0;
    });

    hammer.on('pinchmove', (e) => {
      if (!fabricCanvasRef.current || !target) return;

      const scale = fabricStates.initScale * (e.scale / hammerStates.initScale);
      target.scale(scale);
      target.setCoords();
      fabricCanvasRef.current.requestRenderAll();
    });

    hammer.on('rotatemove', (e) => {
      if (!fabricCanvasRef.current || !target) return;

      target.rotate(
        fabricStates.initAngle + (e.rotation - hammerStates.initAngle)
      );
      target.setCoords();
      fabricCanvasRef.current.requestRenderAll();
    });

    hammer.on('pinchend pinchcancel rotateend', () => {
      if (!fabricCanvasRef.current || !target) return;
      target.set({
        lockMovementX: fabricStates.lockMovementX,
        lockMovementY: fabricStates.lockMovementY,
      });
      fabricCanvasRef.current.requestRenderAll();
      target = null;
    });
  };

  // Monitor to ensure border is always on the top
  const bindBorderZIndexGuard = () => {
    if (!fabricCanvasRef.current || !fabricCanvasBorderRectRef.current) return;

    const ensure = () => {
      if (!fabricCanvasRef.current || !fabricCanvasBorderRectRef.current)
        return;
      fabricCanvasRef.current.bringObjectToFront(
        fabricCanvasBorderRectRef.current
      );
    };

    fabricCanvasRef.current.on('object:added', ensure);
    fabricCanvasRef.current.on('object:modified', ensure);
    fabricCanvasRef.current.on('object:moving', ensure);
    fabricCanvasRef.current.on('object:scaling', ensure);
    fabricCanvasRef.current.on('object:rotating', ensure);
    fabricCanvasRef.current.on('selection:created', ensure);
    fabricCanvasRef.current.on('selection:updated', ensure);
    ensure();
  };

  return {
    states: {
      isFabricReady,
      isExporting,
      hasImageSelection,
      hasImageSrc,
    },

    canvasUpdater,
    imageUpdater,
    imagesUpdater,
    gridUpdater,
  };
}
