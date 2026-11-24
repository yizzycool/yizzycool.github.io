'use client';

import type * as fabricTypes from 'fabric';
import type {
  DocumentConfig,
  HistoryEntry,
  PersistedPhotoEditorDraft,
} from '../types/studio';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useToolsDB } from '@/hooks/tools/use-tools-db';
import toast from '@/utils/toast';

import {
  CUSTOM_SERIALIZATION_PROPS,
  DEFAULT_DOCUMENT_CONFIG,
  MAX_HISTORY_ENTRIES,
} from '../constants';
import { generateUid } from '../utils/fabric-layer-mapper';
import {
  collectAssetIdsFromJson,
  rewriteAssetUrlsInJson,
} from '../utils/pes-archive';

const DRAFT_STORAGE_KEY = 'photo-editor:draft';
const NUDGE_DEBOUNCE_MS = 450;
const AUTOSAVE_DEBOUNCE_MS = 900;

export type AssetBlobEntry = {
  blob: Blob;
  url: string;
};

type Props = {
  fabricCanvasRef: React.MutableRefObject<fabricTypes.Canvas | null>;
  docConfigRef: React.MutableRefObject<DocumentConfig>;
  setDocConfig: React.Dispatch<React.SetStateAction<DocumentConfig>>;
  assetMapRef: React.MutableRefObject<Map<string, AssetBlobEntry>>;
  registerAssetBlob: (assetId: string, blob: Blob) => string;
  resolveAssetUrl: (assetId: string, fallbackSrc: string) => string;
  isFabricReady: boolean;
  fitToScreen: () => void;
  onSyncCanvasUi: () => void;
  onAfterRestore?: () => Promise<void> | void;
};

function hasDocumentContent(
  docConfig: DocumentConfig,
  canvasJson: Record<string, unknown>
): boolean {
  const objects = canvasJson.objects;
  if (Array.isArray(objects) && objects.length > 0) return true;
  if (
    docConfig.width !== DEFAULT_DOCUMENT_CONFIG.width ||
    docConfig.height !== DEFAULT_DOCUMENT_CONFIG.height ||
    docConfig.backgroundType !== DEFAULT_DOCUMENT_CONFIG.backgroundType ||
    docConfig.backgroundColor !== DEFAULT_DOCUMENT_CONFIG.backgroundColor ||
    docConfig.backgroundOpacity !== DEFAULT_DOCUMENT_CONFIG.backgroundOpacity
  ) {
    return true;
  }
  return false;
}

/**
 * Manages labeled Undo/Redo history entries, time-travel jump,
 * and IndexedDB workspace auto-save & recovery.
 */
export default function useHistoryStack({
  fabricCanvasRef,
  docConfigRef,
  setDocConfig,
  assetMapRef,
  registerAssetBlob,
  resolveAssetUrl,
  isFabricReady,
  fitToScreen,
  onSyncCanvasUi,
  onAfterRestore,
}: Props) {
  const {
    isSupported: isDbSupported,
    getValue,
    setValue,
    deleteValue,
  } = useToolsDB();

  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [canReset, setCanReset] = useState<boolean>(false);

  const stackRef = useRef<HistoryEntry[]>([]);
  const indexRef = useRef<number>(-1);
  const serializedTopRef = useRef<string>('');
  const isRestoringRef = useRef<boolean>(false);
  const hasHydratedRef = useRef<boolean>(false);

  const nudgeTimerRef = useRef<number | null>(null);
  const autosaveTimerRef = useRef<number | null>(null);

  const syncUiMeta = useCallback(() => {
    const stack = stackRef.current;
    const idx = indexRef.current;
    const current = idx >= 0 ? stack[idx] : null;
    setEntries([...stack]);
    setActiveIndex(idx);
    setCanReset(
      current
        ? hasDocumentContent(current.docConfig, current.canvasJson)
        : false
    );
  }, []);

  const persistDraftNow = useCallback(
    async (docConfig: DocumentConfig, canvasJson: Record<string, unknown>) => {
      if (!isDbSupported) return;

      if (!hasDocumentContent(docConfig, canvasJson)) {
        try {
          await deleteValue('drafts', DRAFT_STORAGE_KEY);
        } catch {
          // Ignore storage errors silently
        }
        return;
      }

      const referencedIds = collectAssetIdsFromJson(canvasJson);
      const assets: Record<string, Blob> = {};

      for (const assetId of referencedIds) {
        const entry = assetMapRef.current.get(assetId);
        if (entry?.blob) {
          assets[assetId] = entry.blob;
        }
      }

      try {
        const draft: PersistedPhotoEditorDraft = {
          version: 1,
          savedAt: Date.now(),
          docConfig: structuredClone(docConfig),
          canvasJson,
          assets,
        };
        await setValue<PersistedPhotoEditorDraft>(
          'drafts',
          DRAFT_STORAGE_KEY,
          draft
        );
      } catch {
        // Ignore quota / structured-clone errors cleanly
      }
    },
    [assetMapRef, deleteValue, isDbSupported, setValue]
  );

  const scheduleAutosave = useCallback(
    (docConfig: DocumentConfig, canvasJson: Record<string, unknown>) => {
      if (autosaveTimerRef.current !== null) {
        window.clearTimeout(autosaveTimerRef.current);
      }
      autosaveTimerRef.current = window.setTimeout(() => {
        autosaveTimerRef.current = null;
        void persistDraftNow(docConfig, canvasJson);
      }, AUTOSAVE_DEBOUNCE_MS);
    },
    [persistDraftNow]
  );

  const captureCurrentState = useCallback((): {
    docConfig: DocumentConfig;
    canvasJson: Record<string, unknown>;
  } | null => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return null;

    const canvasJson = canvas.toObject(CUSTOM_SERIALIZATION_PROPS) as Record<
      string,
      unknown
    >;
    const docConfig = structuredClone(docConfigRef.current);
    return { docConfig, canvasJson };
  }, [docConfigRef, fabricCanvasRef]);

  const applySnapshot = useCallback(
    async (
      docConfig: DocumentConfig,
      canvasJson: Record<string, unknown>,
      options?: { refit?: boolean }
    ) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      isRestoringRef.current = true;
      try {
        const nextDoc = structuredClone(docConfig);
        const prevW = docConfigRef.current.width;
        const prevH = docConfigRef.current.height;

        docConfigRef.current = nextDoc;
        setDocConfig(nextDoc);

        canvas.discardActiveObject();
        const hydratedJson = rewriteAssetUrlsInJson(
          canvasJson,
          resolveAssetUrl
        );
        await canvas.loadFromJSON(hydratedJson);

        if (onAfterRestore) {
          await onAfterRestore();
        }

        if (
          options?.refit ||
          prevW !== nextDoc.width ||
          prevH !== nextDoc.height
        ) {
          fitToScreen();
        }

        canvas.requestRenderAll();
        onSyncCanvasUi();
      } finally {
        isRestoringRef.current = false;
      }
    },
    [
      docConfigRef,
      fabricCanvasRef,
      fitToScreen,
      onAfterRestore,
      onSyncCanvasUi,
      resolveAssetUrl,
      setDocConfig,
    ]
  );

  const pushEntry = useCallback(
    (label: string) => {
      if (!isFabricReady || isRestoringRef.current) return;
      const state = captureCurrentState();
      if (!state) return;

      const serialized = JSON.stringify(state);
      if (serialized === serializedTopRef.current) return;

      const nextStack = stackRef.current.slice(0, indexRef.current + 1);
      nextStack.push({
        id: generateUid('hist'),
        label,
        timestamp: Date.now(),
        docConfig: state.docConfig,
        canvasJson: state.canvasJson,
      });

      if (nextStack.length > MAX_HISTORY_ENTRIES) {
        nextStack.shift();
      }

      stackRef.current = nextStack;
      indexRef.current = nextStack.length - 1;
      serializedTopRef.current = serialized;

      syncUiMeta();
      scheduleAutosave(state.docConfig, state.canvasJson);
    },
    [captureCurrentState, isFabricReady, scheduleAutosave, syncUiMeta]
  );

  const commitHistory = useCallback(
    (label: string, mode: 'immediate' | 'debounced' = 'immediate') => {
      if (!isFabricReady || isRestoringRef.current) return;

      if (nudgeTimerRef.current !== null) {
        window.clearTimeout(nudgeTimerRef.current);
        nudgeTimerRef.current = null;
      }

      if (mode === 'immediate') {
        pushEntry(label);
        return;
      }

      nudgeTimerRef.current = window.setTimeout(() => {
        nudgeTimerRef.current = null;
        pushEntry(label);
      }, NUDGE_DEBOUNCE_MS);
    },
    [isFabricReady, pushEntry]
  );

  const jumpToHistory = useCallback(
    async (targetIndex: number) => {
      if (isRestoringRef.current) return;
      if (targetIndex < 0 || targetIndex >= stackRef.current.length) return;
      if (targetIndex === indexRef.current) return;

      const entry = stackRef.current[targetIndex];
      if (!entry) return;

      indexRef.current = targetIndex;
      serializedTopRef.current = JSON.stringify({
        docConfig: entry.docConfig,
        canvasJson: entry.canvasJson,
      });

      await applySnapshot(entry.docConfig, entry.canvasJson);
      syncUiMeta();
      scheduleAutosave(entry.docConfig, entry.canvasJson);
    },
    [applySnapshot, scheduleAutosave, syncUiMeta]
  );

  const undo = useCallback(async () => {
    if (indexRef.current <= 0) return;
    await jumpToHistory(indexRef.current - 1);
  }, [jumpToHistory]);

  const redo = useCallback(async () => {
    if (indexRef.current >= stackRef.current.length - 1) return;
    await jumpToHistory(indexRef.current + 1);
  }, [jumpToHistory]);

  const loadExternalDocument = useCallback(
    async (
      docConfig: DocumentConfig,
      canvasJson: Record<string, unknown>,
      assets: Record<string, Blob>,
      label = 'Open .pes Project'
    ) => {
      for (const [assetId, blob] of Object.entries(assets)) {
        registerAssetBlob(assetId, blob);
      }

      await applySnapshot(docConfig, canvasJson, { refit: true });
      const freshState = captureCurrentState();
      if (!freshState) return;

      const entry: HistoryEntry = {
        id: generateUid('hist'),
        label,
        timestamp: Date.now(),
        docConfig: freshState.docConfig,
        canvasJson: freshState.canvasJson,
      };
      stackRef.current = [entry];
      indexRef.current = 0;
      serializedTopRef.current = JSON.stringify(freshState);
      syncUiMeta();
      scheduleAutosave(freshState.docConfig, freshState.canvasJson);
    },
    [
      applySnapshot,
      captureCurrentState,
      registerAssetBlob,
      scheduleAutosave,
      syncUiMeta,
    ]
  );

  const resetStudio = useCallback(async () => {
    const emptyJson: Record<string, unknown> = {
      version: '7.1.0',
      objects: [],
    };
    const defaultDoc = structuredClone(DEFAULT_DOCUMENT_CONFIG);

    await applySnapshot(defaultDoc, emptyJson, { refit: true });

    const entry: HistoryEntry = {
      id: generateUid('hist'),
      label: 'New Document',
      timestamp: Date.now(),
      docConfig: defaultDoc,
      canvasJson: emptyJson,
    };

    stackRef.current = [entry];
    indexRef.current = 0;
    serializedTopRef.current = JSON.stringify({
      docConfig: defaultDoc,
      canvasJson: emptyJson,
    });
    syncUiMeta();

    if (isDbSupported) {
      try {
        await deleteValue('drafts', DRAFT_STORAGE_KEY);
      } catch {
        // Ignore delete errors silently
      }
    }

    toast.success('Studio workspace reset');
  }, [applySnapshot, deleteValue, isDbSupported, syncUiMeta]);

  // Hydrate saved draft once when Fabric finishes initializing
  useEffect(() => {
    if (!isFabricReady || !fabricCanvasRef.current || hasHydratedRef.current) {
      return;
    }
    hasHydratedRef.current = true;

    const hydrate = async () => {
      if (isDbSupported) {
        try {
          const draft = await getValue<PersistedPhotoEditorDraft>(
            'drafts',
            DRAFT_STORAGE_KEY
          );

          if (
            draft?.version === 1 &&
            draft.docConfig &&
            draft.canvasJson &&
            hasDocumentContent(draft.docConfig, draft.canvasJson)
          ) {
            for (const [assetId, blob] of Object.entries(draft.assets || {})) {
              if (blob instanceof Blob) {
                registerAssetBlob(assetId, blob);
              }
            }

            await applySnapshot(draft.docConfig, draft.canvasJson, {
              refit: true,
            });
            const entry: HistoryEntry = {
              id: generateUid('hist'),
              label: 'Restored Draft',
              timestamp: draft.savedAt || Date.now(),
              docConfig: draft.docConfig,
              canvasJson: draft.canvasJson,
            };
            stackRef.current = [entry];
            indexRef.current = 0;
            serializedTopRef.current = JSON.stringify({
              docConfig: draft.docConfig,
              canvasJson: draft.canvasJson,
            });
            syncUiMeta();
            toast.info('Restored your last studio project');
            return;
          }
        } catch {
          // Ignore corrupted draft and start fresh
        }
      }

      const initialState = captureCurrentState();
      if (initialState) {
        stackRef.current = [
          {
            id: generateUid('hist'),
            label: 'New Document',
            timestamp: Date.now(),
            docConfig: initialState.docConfig,
            canvasJson: initialState.canvasJson,
          },
        ];
        indexRef.current = 0;
        serializedTopRef.current = JSON.stringify(initialState);
        syncUiMeta();
      }
    };

    void hydrate();
  }, [
    applySnapshot,
    captureCurrentState,
    fabricCanvasRef,
    getValue,
    isDbSupported,
    isFabricReady,
    registerAssetBlob,
    syncUiMeta,
  ]);

  useEffect(() => {
    return () => {
      if (nudgeTimerRef.current !== null) {
        window.clearTimeout(nudgeTimerRef.current);
      }
      if (autosaveTimerRef.current !== null) {
        window.clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  return {
    entries,
    activeIndex,
    canUndo: activeIndex > 0,
    canRedo: activeIndex >= 0 && activeIndex < entries.length - 1,
    canReset,
    isRestoringRef,
    commitHistory,
    undo,
    redo,
    jumpToHistory,
    resetStudio,
    loadExternalDocument,
  };
}
