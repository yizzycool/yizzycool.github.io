'use client';

import type {
  AiBackendKind,
  AiCacheEntryStatus,
  AiDownloadProgress,
  AiModelKey,
  DepthMapData,
  SamPointPrompt,
} from '../types/studio';

import { useCallback, useEffect, useRef, useState } from 'react';

import toast from '@/utils/toast';

import { AI_MODEL_CATALOG } from '../constants';

export type PendingModalState =
  | {
      stage: 'confirm';
      modelKey: AiModelKey;
      allowQualityChoice: boolean;
      preferredBackend: AiBackendKind;
      lowMemoryWarning: boolean;
    }
  | {
      stage: 'downloading';
      progress: AiDownloadProgress;
    };

type WorkerResponse =
  | {
      type: 'cache-status';
      requestId: string;
      status: Record<AiModelKey, AiCacheEntryStatus>;
      totalBytes: number;
    }
  | {
      type: 'slot-changed';
      activeModel: AiModelKey | null;
      backend: AiBackendKind | null;
    }
  | { type: 'progress'; requestId: string; progress: AiDownloadProgress }
  | {
      type: 'rmbg-result';
      requestId: string;
      alpha: ArrayBuffer;
      width: number;
      height: number;
    }
  | { type: 'sam-encoded'; requestId: string; imageKey: string }
  | {
      type: 'sam-mask';
      requestId: string;
      alpha: ArrayBuffer;
      width: number;
      height: number;
      score: number;
    }
  | {
      type: 'depth-result';
      requestId: string;
      data: ArrayBuffer;
      width: number;
      height: number;
    }
  | {
      type: 'upscale-result';
      requestId: string;
      rgba: ArrayBuffer;
      width: number;
      height: number;
    }
  | {
      type: 'lama-result';
      requestId: string;
      rgba: ArrayBuffer;
      width: number;
      height: number;
    }
  | { type: 'done'; requestId: string }
  | { type: 'error'; requestId: string; message: string };

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (err: Error) => void;
};

const SAM_UNLOAD_DELAY_MS = 30_000;

async function detectPreferredBackend(): Promise<{
  backend: AiBackendKind;
  lowMemory: boolean;
}> {
  const nav = navigator as Navigator & {
    gpu?: { requestAdapter: () => Promise<unknown | null> };
    deviceMemory?: number;
  };
  const lowMemory =
    typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4;
  if (nav.gpu) {
    try {
      const adapter = await nav.gpu.requestAdapter();
      if (adapter) return { backend: 'webgpu', lowMemory };
    } catch {
      // Fallback cleanly to WASM
    }
  }
  return { backend: 'wasm', lowMemory };
}

/**
 * Coordinates the single-slot Anti-OOM AI inference worker, local cache inspection,
 * two-stage download consent/progress modal, and idle GPU VRAM cleanup.
 */
export default function useAiWorker() {
  const [cacheStatus, setCacheStatus] = useState<
    Partial<Record<AiModelKey, AiCacheEntryStatus>>
  >({});
  const [totalCachedBytes, setTotalCachedBytes] = useState(0);
  const [activeLoadedModel, setActiveLoadedModel] = useState<AiModelKey | null>(
    null
  );
  const [activeBackend, setActiveBackend] = useState<AiBackendKind | null>(
    null
  );
  const [preferredBackend, setPreferredBackend] =
    useState<AiBackendKind>('wasm');
  const [lowMemoryWarning, setLowMemoryWarning] = useState(false);
  const [modalState, setModalState] = useState<PendingModalState | null>(null);
  const [busyMessage, setBusyMessage] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const pendingMapRef = useRef<Map<string, PendingRequest>>(new Map());
  const confirmResolverRef = useRef<
    ((choice: AiModelKey | null) => void) | null
  >(null);
  const activeModalRequestIdRef = useRef<string | null>(null);
  const samUnloadTimerRef = useRef<number | null>(null);
  const reqCounterRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    void detectPreferredBackend().then(({ backend, lowMemory }) => {
      if (cancelled) return;
      setPreferredBackend(backend);
      setLowMemoryWarning(lowMemory);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const ensureWorker = useCallback((): Worker => {
    if (workerRef.current) return workerRef.current;

    const worker = new Worker(
      new URL('../workers/ai-inference.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (ev: MessageEvent<WorkerResponse>) => {
      const msg = ev.data;

      if (msg.type === 'slot-changed') {
        setActiveLoadedModel(msg.activeModel);
        setActiveBackend(msg.backend);
        return;
      }

      if (msg.type === 'progress') {
        if (activeModalRequestIdRef.current === msg.requestId) {
          setModalState({ stage: 'downloading', progress: msg.progress });
        }
        return;
      }

      const pending = pendingMapRef.current.get(msg.requestId);
      if (!pending) return;
      pendingMapRef.current.delete(msg.requestId);

      if (msg.type === 'error') {
        pending.reject(new Error(msg.message));
      } else {
        pending.resolve(msg);
      }
    };

    worker.onerror = (err) => {
      const failure = new Error(
        err.message || 'AI Worker crashed unexpectedly.'
      );
      for (const [, p] of pendingMapRef.current) {
        p.reject(failure);
      }
      pendingMapRef.current.clear();
      setBusyMessage(null);
      setModalState(null);
    };

    workerRef.current = worker;
    return worker;
  }, []);

  const postWorkerRequest = useCallback(
    <T extends WorkerResponse>(
      payload: Record<string, unknown>,
      transferables: Transferable[] = []
    ): { requestId: string; promise: Promise<T> } => {
      const worker = ensureWorker();
      const requestId = `ai_req_${++reqCounterRef.current}`;
      const promise = new Promise<T>((resolve, reject) => {
        pendingMapRef.current.set(requestId, {
          resolve: (v) => resolve(v as T),
          reject,
        });
      });
      worker.postMessage({ ...payload, requestId }, transferables);
      return { requestId, promise };
    },
    [ensureWorker]
  );

  const refreshCacheStatus = useCallback(async () => {
    try {
      const { promise } = postWorkerRequest<{
        type: 'cache-status';
        requestId: string;
        status: Record<AiModelKey, AiCacheEntryStatus>;
        totalBytes: number;
      }>({ type: 'check-cache' });
      const res = await promise;
      setCacheStatus(res.status);
      setTotalCachedBytes(res.totalBytes);
      return res.status;
    } catch {
      return null;
    }
  }, [postWorkerRequest]);

  const askDownloadConfirmation = useCallback(
    (
      modelKey: AiModelKey,
      allowQualityChoice: boolean
    ): Promise<AiModelKey | null> => {
      return new Promise((resolve) => {
        confirmResolverRef.current = resolve;
        setModalState({
          stage: 'confirm',
          modelKey,
          allowQualityChoice,
          preferredBackend,
          lowMemoryWarning,
        });
      });
    },
    [lowMemoryWarning, preferredBackend]
  );

  const confirmDownloadModal = useCallback((chosenModelKey: AiModelKey) => {
    const resolver = confirmResolverRef.current;
    confirmResolverRef.current = null;
    if (resolver) resolver(chosenModelKey);
  }, []);

  const cancelDownloadOrTask = useCallback(() => {
    const resolver = confirmResolverRef.current;
    confirmResolverRef.current = null;
    if (resolver) {
      resolver(null);
      setModalState(null);
      return;
    }

    const activeReq = activeModalRequestIdRef.current;
    activeModalRequestIdRef.current = null;
    setModalState(null);
    setBusyMessage(null);
    if (activeReq && workerRef.current) {
      workerRef.current.postMessage({ type: 'cancel', requestId: activeReq });
      const pending = pendingMapRef.current.get(activeReq);
      if (pending) {
        pendingMapRef.current.delete(activeReq);
        pending.reject(new Error('AI task cancelled.'));
      }
    }
  }, []);

  /**
   * Gate every AI model execution through Iron Law A & B:
   * - If already cached: zero confirmation modal; runs directly with lightweight top pill.
   * - If uncached: shows Stage 1 confirmation modal, then transitions in-place to Stage 2 progress.
   */
  const executeWithModelGate = useCallback(
    async <T extends WorkerResponse>(
      initialModelKey: AiModelKey,
      options: {
        allowQualityChoice?: boolean;
        buildMessage: (modelKey: AiModelKey) => {
          payload: Record<string, unknown>;
          transferables?: Transferable[];
        };
      }
    ): Promise<T | null> => {
      const latestCache = (await refreshCacheStatus()) ?? cacheStatus;
      const isCached = Boolean(latestCache[initialModelKey]?.cached);
      let targetKey = initialModelKey;

      if (!isCached) {
        const chosen = await askDownloadConfirmation(
          initialModelKey,
          Boolean(options.allowQualityChoice)
        );
        if (!chosen) return null;
        targetKey = chosen;
      }

      const spec = AI_MODEL_CATALOG[targetKey];
      const stillCached = Boolean(latestCache[targetKey]?.cached);
      const { payload, transferables } = options.buildMessage(targetKey);
      const { requestId, promise } = postWorkerRequest<T>(
        { ...payload, modelKey: targetKey, preferredBackend },
        transferables ?? []
      );

      if (!stillCached) {
        activeModalRequestIdRef.current = requestId;
        setModalState({
          stage: 'downloading',
          progress: {
            modelKey: targetKey,
            phase: 'downloading',
            percent: 0,
            loadedBytes: 0,
            totalBytes: Math.round(spec.estimatedMb * 1024 * 1024),
            speedBps: 0,
            fileName: spec.label,
          },
        });
      } else {
        setBusyMessage(`Running ${spec.label}...`);
      }

      try {
        const res = await promise;
        await refreshCacheStatus();
        return res;
      } finally {
        if (activeModalRequestIdRef.current === requestId) {
          activeModalRequestIdRef.current = null;
          setModalState(null);
        }
        setBusyMessage(null);
      }
    },
    [
      askDownloadConfirmation,
      cacheStatus,
      postWorkerRequest,
      preferredBackend,
      refreshCacheStatus,
    ]
  );

  const unloadGpuMemory = useCallback(async () => {
    if (!workerRef.current) return;
    try {
      const { promise } = postWorkerRequest<{
        type: 'done';
        requestId: string;
      }>({ type: 'unload' });
      await promise;
      toast.success('Released AI GPU memory');
    } catch {
      // Ignore
    }
  }, [postWorkerRequest]);

  const clearAllModelCaches = useCallback(async () => {
    try {
      const { promise } = postWorkerRequest<{
        type: 'done';
        requestId: string;
      }>({ type: 'clear-cache' });
      await promise;
      await refreshCacheStatus();
      toast.success('Cleared cached AI models');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to clear AI model cache'
      );
    }
  }, [postWorkerRequest, refreshCacheStatus]);

  const notifySamToolActive = useCallback(
    (active: boolean) => {
      if (samUnloadTimerRef.current !== null) {
        window.clearTimeout(samUnloadTimerRef.current);
        samUnloadTimerRef.current = null;
      }
      if (!active && activeLoadedModel === 'sam-select') {
        samUnloadTimerRef.current = window.setTimeout(() => {
          samUnloadTimerRef.current = null;
          void unloadGpuMemory();
        }, SAM_UNLOAD_DELAY_MS);
      }
    },
    [activeLoadedModel, unloadGpuMemory]
  );

  const runRemoveBackground = useCallback(
    async (
      rgba: Uint8ClampedArray,
      width: number,
      height: number,
      quality: 'fast' | 'hd'
    ): Promise<{
      alpha: Uint8ClampedArray;
      width: number;
      height: number;
    } | null> => {
      const res = await executeWithModelGate<{
        type: 'rmbg-result';
        requestId: string;
        alpha: ArrayBuffer;
        width: number;
        height: number;
      }>(quality === 'hd' ? 'rmbg-hd' : 'rmbg-fast', {
        allowQualityChoice: true,
        buildMessage: () => {
          const copy = new Uint8ClampedArray(rgba);
          return {
            payload: { type: 'run-rmbg', rgba: copy.buffer, width, height },
            transferables: [copy.buffer],
          };
        },
      });
      if (!res) return null;
      return {
        alpha: new Uint8ClampedArray(res.alpha),
        width: res.width,
        height: res.height,
      };
    },
    [executeWithModelGate]
  );

  const encodeSamImage = useCallback(
    async (
      rgba: Uint8ClampedArray,
      width: number,
      height: number,
      imageKey: string
    ): Promise<boolean> => {
      const res = await executeWithModelGate<{
        type: 'sam-encoded';
        requestId: string;
        imageKey: string;
      }>('sam-select', {
        buildMessage: () => {
          const copy = new Uint8ClampedArray(rgba);
          return {
            payload: {
              type: 'sam-encode',
              rgba: copy.buffer,
              width,
              height,
              imageKey,
            },
            transferables: [copy.buffer],
          };
        },
      });
      return Boolean(res);
    },
    [executeWithModelGate]
  );

  const decodeSamPoints = useCallback(
    async (
      points: SamPointPrompt[]
    ): Promise<{
      alpha: Uint8ClampedArray;
      width: number;
      height: number;
    } | null> => {
      if (points.length === 0) return null;
      const { promise } = postWorkerRequest<{
        type: 'sam-mask';
        requestId: string;
        alpha: ArrayBuffer;
        width: number;
        height: number;
        score: number;
      }>({
        type: 'sam-decode',
        points,
      });
      const res = await promise;
      return {
        alpha: new Uint8ClampedArray(res.alpha),
        width: res.width,
        height: res.height,
      };
    },
    [postWorkerRequest]
  );

  const runDepthEstimation = useCallback(
    async (
      rgba: Uint8ClampedArray,
      width: number,
      height: number,
      layerId: string
    ): Promise<DepthMapData | null> => {
      const res = await executeWithModelGate<{
        type: 'depth-result';
        requestId: string;
        data: ArrayBuffer;
        width: number;
        height: number;
      }>('depth-v2', {
        buildMessage: () => {
          const copy = new Uint8ClampedArray(rgba);
          return {
            payload: { type: 'run-depth', rgba: copy.buffer, width, height },
            transferables: [copy.buffer],
          };
        },
      });
      if (!res) return null;
      return {
        layerId,
        width: res.width,
        height: res.height,
        data: new Uint8Array(res.data),
      };
    },
    [executeWithModelGate]
  );

  const runUpscale2x = useCallback(
    async (
      rgba: Uint8ClampedArray,
      width: number,
      height: number
    ): Promise<{
      rgba: Uint8ClampedArray;
      width: number;
      height: number;
    } | null> => {
      const res = await executeWithModelGate<{
        type: 'upscale-result';
        requestId: string;
        rgba: ArrayBuffer;
        width: number;
        height: number;
      }>('upscale-2x', {
        buildMessage: () => {
          const copy = new Uint8ClampedArray(rgba);
          return {
            payload: { type: 'run-upscale', rgba: copy.buffer, width, height },
            transferables: [copy.buffer],
          };
        },
      });
      if (!res) return null;
      return {
        rgba: new Uint8ClampedArray(res.rgba),
        width: res.width,
        height: res.height,
      };
    },
    [executeWithModelGate]
  );

  const runLamaInpaint = useCallback(
    async (
      rgba: Uint8ClampedArray,
      maskGray: Uint8Array,
      size = 512
    ): Promise<{
      rgba: Uint8ClampedArray;
      width: number;
      height: number;
    } | null> => {
      const res = await executeWithModelGate<{
        type: 'lama-result';
        requestId: string;
        rgba: ArrayBuffer;
        width: number;
        height: number;
      }>('lama-inpaint', {
        buildMessage: () => {
          const imgCopy = new Uint8ClampedArray(rgba);
          const maskCopy = new Uint8Array(maskGray);
          return {
            payload: {
              type: 'run-lama',
              rgba: imgCopy.buffer,
              mask: maskCopy.buffer,
              size,
            },
            transferables: [imgCopy.buffer, maskCopy.buffer],
          };
        },
      });
      if (!res) return null;
      return {
        rgba: new Uint8ClampedArray(res.rgba),
        width: res.width,
        height: res.height,
      };
    },
    [executeWithModelGate]
  );

  useEffect(() => {
    const pendingMap = pendingMapRef.current;
    return () => {
      if (samUnloadTimerRef.current !== null) {
        window.clearTimeout(samUnloadTimerRef.current);
      }
      pendingMap.clear();
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  return {
    cacheStatus,
    totalCachedBytes,
    activeLoadedModel,
    activeBackend,
    preferredBackend,
    lowMemoryWarning,
    modalState,
    busyMessage,
    refreshCacheStatus,
    confirmDownloadModal,
    cancelDownloadOrTask,
    unloadGpuMemory,
    clearAllModelCaches,
    notifySamToolActive,
    runRemoveBackground,
    encodeSamImage,
    decodeSamPoints,
    runDepthEstimation,
    runUpscale2x,
    runLamaInpaint,
  };
}
