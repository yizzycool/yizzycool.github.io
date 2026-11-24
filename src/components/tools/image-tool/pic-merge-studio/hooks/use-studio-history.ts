'use client';

import type * as fabricTypes from 'fabric';
import type { CanvasConfig, GlobalImageConfig } from '../types/config';
import type { ConfigHelper } from '../types/config-helper';
import type { FabricHelperHistoryUpdater } from '../types/fabric-helper';
import type { GridTemplate } from '../types/grid-layout';
import type {
  PersistedStudioDraft,
  StudioSnapshot,
} from '../utils/studio-snapshot';

import * as fabric from 'fabric';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useToolsDB } from '@/hooks/tools/use-tools-db';
import colorUtils from '@/utils/color-utils';
import customEventUtils, { CustomEvents } from '@/utils/custom-event-utils';
import toast from '@/utils/toast';

import {
  clearHandoffQueryParam,
  consumeStudioHandoff,
  hasHandoffQueryParam,
} from '../../studio-handoff';
import { DEFAULT_CANVAS_CONFIG, DEFAULT_GLOBAL_IMAGE_CONFIG } from '..';
import {
  attachImageAssetMeta,
  buildImageClipPath,
  captureStudioSnapshot,
  collectSnapshotAssetIds,
  deserializeFilters,
  type ExtendedCaptionTextbox,
  type ExtendedFabricImage,
  hasStudioContent,
} from '../utils/studio-snapshot';
import { FABRIC_CONTROL_CONFIG, FABRIC_IMAGE_CONFIG } from './use-fabric';

const DRAFT_STORAGE_KEY = 'pic-merge-studio:draft';
const MAX_HISTORY_STEPS = 30;
const HISTORY_DEBOUNCE_MS = 450;
const AUTOSAVE_DEBOUNCE_MS = 800;

export type AssetEntry = {
  blob: Blob;
  url: string;
};

type Props = {
  refs: {
    fabricCanvasRef: React.MutableRefObject<fabricTypes.Canvas | null>;
    gridRef: React.MutableRefObject<GridTemplate | null>;
    canvasConfigRef: React.MutableRefObject<CanvasConfig>;
    globalImageConfigRef: React.MutableRefObject<GlobalImageConfig>;
    assetMapRef: React.MutableRefObject<Map<string, AssetEntry>>;
  };
  configHelper: ConfigHelper;
  isFabricReady: boolean;
  resizeDisplay: () => void;
  restoreGridFromSnapshot: (
    gridData: NonNullable<StudioSnapshot['gridData']>,
    gridBorder: CanvasConfig['gridConfig']['border'],
    resolveAssetUrl: (assetId: string, fallbackSrc: string) => string | null
  ) => Promise<GridTemplate | null>;
  registerAssetBlob: (assetId: string, blob: Blob) => string;
  resolveAssetUrl: (assetId: string, fallbackSrc: string) => string | null;
};

/**
 * Manages Undo/Redo history snapshots (30 steps) and IndexedDB draft auto-save/recovery.
 */
export default function useStudioHistory({
  refs,
  configHelper,
  isFabricReady,
  resizeDisplay,
  restoreGridFromSnapshot,
  registerAssetBlob,
  resolveAssetUrl,
}: Props): FabricHelperHistoryUpdater {
  const {
    fabricCanvasRef,
    gridRef,
    canvasConfigRef,
    globalImageConfigRef,
    assetMapRef,
  } = refs;
  const { setCanvasConfig, setGlobalImageConfig } = configHelper;

  const {
    isSupported: isDbSupported,
    getValue,
    setValue,
    deleteValue,
  } = useToolsDB();

  const [historyMeta, setHistoryMeta] = useState({
    canUndo: false,
    canRedo: false,
    canReset: false,
  });

  const historyStackRef = useRef<StudioSnapshot[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const serializedTopRef = useRef<string>('');
  const isRestoringRef = useRef<boolean>(false);
  const hasHydratedRef = useRef<boolean>(false);

  const historyDebounceTimerRef = useRef<number | null>(null);
  const autosaveTimerRef = useRef<number | null>(null);

  const syncHistoryMeta = useCallback(() => {
    const stack = historyStackRef.current;
    const index = historyIndexRef.current;
    const currentSnapshot = index >= 0 ? stack[index] : null;

    setHistoryMeta({
      canUndo: index > 0,
      canRedo: index >= 0 && index < stack.length - 1,
      canReset: currentSnapshot
        ? hasStudioContent(currentSnapshot, DEFAULT_CANVAS_CONFIG)
        : false,
    });
  }, []);

  const persistDraftNow = useCallback(
    async (snapshot: StudioSnapshot) => {
      if (!isDbSupported) return;

      if (!hasStudioContent(snapshot, DEFAULT_CANVAS_CONFIG)) {
        try {
          await deleteValue('drafts', DRAFT_STORAGE_KEY);
        } catch {
          // Ignore storage delete errors in private/restricted browsing modes
        }
        return;
      }

      const referencedIds = collectSnapshotAssetIds(snapshot);
      const assets: Record<string, Blob> = {};

      for (const assetId of referencedIds) {
        const existing = assetMapRef.current.get(assetId);
        if (existing?.blob) {
          assets[assetId] = existing.blob;
        }
      }

      // Backfill any image without a cached blob from its current URL if needed
      const fallbackLayers = [
        ...snapshot.freeLayers,
        ...(snapshot.gridData?.cells
          .map((cell) => cell.layer)
          .filter((layer): layer is NonNullable<typeof layer> =>
            Boolean(layer)
          ) ?? []),
      ];

      for (const layer of fallbackLayers) {
        if (!assets[layer.assetId] && layer.src) {
          try {
            const response = await fetch(layer.src);
            const blob = await response.blob();
            registerAssetBlob(layer.assetId, blob);
            assets[layer.assetId] = blob;
          } catch {
            // Skip unreachable URLs cleanly
          }
        }
      }

      try {
        const draft: PersistedStudioDraft = {
          version: 1,
          savedAt: Date.now(),
          snapshot,
          assets,
        };
        await setValue<PersistedStudioDraft>(
          'drafts',
          DRAFT_STORAGE_KEY,
          draft
        );
      } catch {
        // Ignore quota / structured-clone errors silently so editing never breaks
      }
    },
    [assetMapRef, deleteValue, isDbSupported, registerAssetBlob, setValue]
  );

  const scheduleDraftPersist = useCallback(
    (snapshot: StudioSnapshot) => {
      if (autosaveTimerRef.current !== null) {
        window.clearTimeout(autosaveTimerRef.current);
      }
      autosaveTimerRef.current = window.setTimeout(() => {
        autosaveTimerRef.current = null;
        void persistDraftNow(snapshot);
      }, AUTOSAVE_DEBOUNCE_MS);
    },
    [persistDraftNow]
  );

  const restoreSnapshot = useCallback(
    async (snapshot: StudioSnapshot) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      isRestoringRef.current = true;
      try {
        const nextCanvasConfig = structuredClone(snapshot.canvasConfig);
        const nextGlobalConfig = structuredClone(snapshot.globalImageConfig);

        canvasConfigRef.current = nextCanvasConfig;
        globalImageConfigRef.current = nextGlobalConfig;
        setCanvasConfig(nextCanvasConfig);
        setGlobalImageConfig(nextGlobalConfig);

        canvas.discardActiveObject();
        canvas.setDimensions({
          width: nextCanvasConfig.size.width,
          height: nextCanvasConfig.size.height,
        });

        const bgColor = nextCanvasConfig.background.color;
        if (bgColor) {
          const rgba = colorUtils.hexToRgba(bgColor.color);
          canvas.set({
            backgroundColor: colorUtils.rgbaToHex({
              ...rgba,
              a: bgColor.opacity,
            }),
          });
        }

        if (nextCanvasConfig.layout === 'grid' && snapshot.gridData) {
          await restoreGridFromSnapshot(
            snapshot.gridData,
            nextCanvasConfig.gridConfig.border,
            resolveAssetUrl
          );
        } else {
          gridRef.current = null;
          canvas.remove(...canvas.getObjects());

          for (const layer of snapshot.freeLayers) {
            const url = resolveAssetUrl(layer.assetId, layer.src);
            if (!url) continue;

            try {
              const img = await fabric.FabricImage.fromURL(url, {
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

              const extImg = img as ExtendedFabricImage;
              extImg._cropAspect = layer.cropAspect ?? 'none';
              extImg._maskShape = layer.maskShape ?? 'none';
              if (
                (extImg._cropAspect && extImg._cropAspect !== 'none') ||
                (extImg._maskShape && extImg._maskShape !== 'none')
              ) {
                img.clipPath = buildImageClipPath(
                  img,
                  extImg._maskShape,
                  extImg._cropAspect
                );
              }
              if (layer.shadow?.enabled) {
                const rgba = colorUtils.hexToRgba(
                  layer.shadow.color || '#000000'
                );
                img.set({
                  shadow: new fabric.Shadow({
                    color: colorUtils.rgbaToHex({
                      r: rgba.r,
                      g: rgba.g,
                      b: rgba.b,
                      a: layer.shadow.opacity,
                    }),
                    blur: layer.shadow.blur,
                    offsetX: layer.shadow.offsetX,
                    offsetY: layer.shadow.offsetY,
                  }),
                });
              }

              img.setCoords();
              canvas.add(img);
            } catch {
              // Skip broken asset gracefully while restoring remaining layers
            }
          }
        }

        // Restore Quick Captions
        for (const cap of snapshot.captions ?? []) {
          const textbox = new fabric.Textbox(cap.text, {
            left: cap.left,
            top: cap.top,
            width: cap.width,
            fontSize: cap.fontSize,
            fill: cap.fill,
            fontWeight: cap.fontWeight,
            textAlign: cap.textAlign,
            angle: cap.angle,
            opacity: cap.opacity,
            scaleX: cap.scaleX,
            scaleY: cap.scaleY,
            originX: 'center',
            originY: 'center',
            fontFamily: 'Inter, system-ui, sans-serif',
            stroke: '#0f172a',
            strokeWidth: 1,
            ...FABRIC_CONTROL_CONFIG,
          }) as ExtendedCaptionTextbox;
          textbox._customKey = 'studio-caption';
          textbox._captionId = cap.id;
          textbox.setCoords();
          canvas.add(textbox);
        }

        resizeDisplay();
        canvas.requestRenderAll();
        customEventUtils.emit(CustomEvents.tools.fabricRecalcSelection);
      } finally {
        isRestoringRef.current = false;
      }
    },
    [
      canvasConfigRef,
      fabricCanvasRef,
      globalImageConfigRef,
      gridRef,
      resizeDisplay,
      resolveAssetUrl,
      restoreGridFromSnapshot,
      setCanvasConfig,
      setGlobalImageConfig,
    ]
  );

  const pushSnapshot = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !isFabricReady || isRestoringRef.current) return;

    const snapshot = captureStudioSnapshot(
      canvas,
      gridRef.current,
      canvasConfigRef.current,
      globalImageConfigRef.current
    );

    const serialized = JSON.stringify(snapshot);
    if (serialized === serializedTopRef.current) return;

    // Truncate redo tail if user branched after undo
    const nextStack = historyStackRef.current.slice(
      0,
      historyIndexRef.current + 1
    );
    nextStack.push(snapshot);

    if (nextStack.length > MAX_HISTORY_STEPS) {
      nextStack.shift();
    }

    historyStackRef.current = nextStack;
    historyIndexRef.current = nextStack.length - 1;
    serializedTopRef.current = serialized;

    syncHistoryMeta();
    scheduleDraftPersist(snapshot);
  }, [
    canvasConfigRef,
    fabricCanvasRef,
    globalImageConfigRef,
    gridRef,
    isFabricReady,
    scheduleDraftPersist,
    syncHistoryMeta,
  ]);

  const commitHistory = useCallback(
    (mode: 'immediate' | 'debounced' = 'immediate') => {
      if (!isFabricReady || isRestoringRef.current) return;

      if (historyDebounceTimerRef.current !== null) {
        window.clearTimeout(historyDebounceTimerRef.current);
        historyDebounceTimerRef.current = null;
      }

      if (mode === 'immediate') {
        pushSnapshot();
        return;
      }

      historyDebounceTimerRef.current = window.setTimeout(() => {
        historyDebounceTimerRef.current = null;
        pushSnapshot();
      }, HISTORY_DEBOUNCE_MS);
    },
    [isFabricReady, pushSnapshot]
  );

  const undo = useCallback(async () => {
    if (isRestoringRef.current || historyIndexRef.current <= 0) return;

    if (historyDebounceTimerRef.current !== null) {
      window.clearTimeout(historyDebounceTimerRef.current);
      historyDebounceTimerRef.current = null;
    }

    const nextIndex = historyIndexRef.current - 1;
    const targetSnapshot = historyStackRef.current[nextIndex];
    if (!targetSnapshot) return;

    historyIndexRef.current = nextIndex;
    serializedTopRef.current = JSON.stringify(targetSnapshot);

    await restoreSnapshot(targetSnapshot);
    syncHistoryMeta();
    scheduleDraftPersist(targetSnapshot);
  }, [restoreSnapshot, scheduleDraftPersist, syncHistoryMeta]);

  const redo = useCallback(async () => {
    if (
      isRestoringRef.current ||
      historyIndexRef.current >= historyStackRef.current.length - 1
    ) {
      return;
    }

    if (historyDebounceTimerRef.current !== null) {
      window.clearTimeout(historyDebounceTimerRef.current);
      historyDebounceTimerRef.current = null;
    }

    const nextIndex = historyIndexRef.current + 1;
    const targetSnapshot = historyStackRef.current[nextIndex];
    if (!targetSnapshot) return;

    historyIndexRef.current = nextIndex;
    serializedTopRef.current = JSON.stringify(targetSnapshot);

    await restoreSnapshot(targetSnapshot);
    syncHistoryMeta();
    scheduleDraftPersist(targetSnapshot);
  }, [restoreSnapshot, scheduleDraftPersist, syncHistoryMeta]);

  const resetStudio = useCallback(async () => {
    if (!fabricCanvasRef.current) return;

    if (historyDebounceTimerRef.current !== null) {
      window.clearTimeout(historyDebounceTimerRef.current);
      historyDebounceTimerRef.current = null;
    }
    if (autosaveTimerRef.current !== null) {
      window.clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    const defaultSnapshot: StudioSnapshot = {
      canvasConfig: structuredClone(DEFAULT_CANVAS_CONFIG),
      globalImageConfig: structuredClone(DEFAULT_GLOBAL_IMAGE_CONFIG),
      freeLayers: [],
      gridData: null,
    };

    await restoreSnapshot(defaultSnapshot);

    historyStackRef.current = [defaultSnapshot];
    historyIndexRef.current = 0;
    serializedTopRef.current = JSON.stringify(defaultSnapshot);
    syncHistoryMeta();

    if (isDbSupported) {
      try {
        await deleteValue('drafts', DRAFT_STORAGE_KEY);
      } catch {
        // Ignore delete errors silently
      }
    }

    toast.success('Studio canvas reset');
  }, [
    deleteValue,
    fabricCanvasRef,
    isDbSupported,
    restoreSnapshot,
    syncHistoryMeta,
  ]);

  // Hydrate initial draft from IndexedDB (once when Fabric finishes initializing)
  useEffect(() => {
    if (!isFabricReady || !fabricCanvasRef.current || hasHydratedRef.current) {
      return;
    }
    hasHydratedRef.current = true;

    const hydrate = async () => {
      if (isDbSupported) {
        try {
          const draft = await getValue<PersistedStudioDraft>(
            'drafts',
            DRAFT_STORAGE_KEY
          );

          if (
            draft?.version === 1 &&
            draft.snapshot &&
            hasStudioContent(draft.snapshot, DEFAULT_CANVAS_CONFIG)
          ) {
            for (const [assetId, blob] of Object.entries(draft.assets || {})) {
              if (blob instanceof Blob) {
                registerAssetBlob(assetId, blob);
              }
            }

            await restoreSnapshot(draft.snapshot);
            historyStackRef.current = [draft.snapshot];
            historyIndexRef.current = 0;
            serializedTopRef.current = JSON.stringify(draft.snapshot);
            syncHistoryMeta();
            toast.info('Restored your last studio draft');
            return;
          }
        } catch {
          // Fall back cleanly to fresh canvas if IndexedDB read fails
        }
      }

      if (fabricCanvasRef.current) {
        if (isDbSupported && hasHandoffQueryParam()) {
          const payload = await consumeStudioHandoff(
            getValue,
            deleteValue,
            'pic-merge-studio'
          );
          clearHandoffQueryParam();
          if (payload && payload.items.length > 0) {
            const canvas = fabricCanvasRef.current;
            const nextSize = { width: payload.width, height: payload.height };
            canvasConfigRef.current = {
              ...canvasConfigRef.current,
              layout: 'free',
              size: nextSize,
              ...(payload.backgroundColor
                ? {
                    background: {
                      type: 'color',
                      color: { color: payload.backgroundColor, opacity: 1 },
                    },
                  }
                : {}),
            };
            setCanvasConfig(canvasConfigRef.current);
            canvas.setDimensions(nextSize);
            if (payload.backgroundColor) {
              canvas.set({ backgroundColor: payload.backgroundColor });
            }

            const shortEdge = Math.min(nextSize.width, nextSize.height);
            for (const item of payload.items) {
              const assetId = `asset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
              const url = registerAssetBlob(assetId, item.blob);
              const img = await fabric.FabricImage.fromURL(url, {
                crossOrigin: 'anonymous',
              });
              attachImageAssetMeta(img, {
                assetId,
                fileName: item.name,
                layerName: item.name,
              });
              const scale = Math.min(
                (shortEdge * 0.78) / (img.width || 1),
                (shortEdge * 0.78) / (img.height || 1),
                1
              );
              img.set({
                left: nextSize.width / 2,
                top: nextSize.height / 2,
                originX: 'center',
                originY: 'center',
                scaleX: scale,
                scaleY: scale,
                ...FABRIC_IMAGE_CONFIG,
              });
              img.setCoords();
              canvas.add(img);
              canvas.setActiveObject(img);
            }

            resizeDisplay();
            canvas.requestRenderAll();
            const handoffSnap = captureStudioSnapshot(
              canvas,
              gridRef.current,
              canvasConfigRef.current,
              globalImageConfigRef.current
            );
            historyStackRef.current = [handoffSnap];
            historyIndexRef.current = 0;
            serializedTopRef.current = JSON.stringify(handoffSnap);
            syncHistoryMeta();
            customEventUtils.emit(CustomEvents.tools.fabricRecalcSelection);
            toast.success('Imported artwork from Photo Editor Studio');
            return;
          }
        }

        const initialSnapshot = captureStudioSnapshot(
          fabricCanvasRef.current,
          gridRef.current,
          canvasConfigRef.current,
          globalImageConfigRef.current
        );
        historyStackRef.current = [initialSnapshot];
        historyIndexRef.current = 0;
        serializedTopRef.current = JSON.stringify(initialSnapshot);
        syncHistoryMeta();
      }
    };

    void hydrate();
  }, [
    canvasConfigRef,
    deleteValue,
    fabricCanvasRef,
    getValue,
    globalImageConfigRef,
    gridRef,
    isDbSupported,
    isFabricReady,
    registerAssetBlob,
    resizeDisplay,
    restoreSnapshot,
    setCanvasConfig,
    syncHistoryMeta,
  ]);

  // Capture interactive canvas mutations (drag, scale, rotate, border edge resize)
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !isFabricReady) return;

    const handleObjectModified = () => {
      commitHistory('immediate');
    };

    canvas.on('object:modified', handleObjectModified);
    return () => {
      canvas.off('object:modified', handleObjectModified);
    };
  }, [commitHistory, fabricCanvasRef, isFabricReady]);

  // Cleanup pending debounce timers on unmount
  useEffect(() => {
    return () => {
      if (historyDebounceTimerRef.current !== null) {
        window.clearTimeout(historyDebounceTimerRef.current);
      }
      if (autosaveTimerRef.current !== null) {
        window.clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  return {
    canUndo: historyMeta.canUndo,
    canRedo: historyMeta.canRedo,
    canReset: historyMeta.canReset,
    undo,
    redo,
    resetStudio,
    commitHistory,
  };
}
