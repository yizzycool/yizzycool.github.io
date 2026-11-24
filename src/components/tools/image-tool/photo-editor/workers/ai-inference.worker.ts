import type {
  AiBackendKind,
  AiCacheEntryStatus,
  AiDownloadProgress,
  AiModelKey,
  SamPointPrompt,
} from '../types/studio';

import {
  AutoProcessor,
  env,
  pipeline,
  RawImage,
  SamModel,
} from '@huggingface/transformers';

import { AI_MODEL_CATALOG } from '../constants';

env.allowLocalModels = false;
env.useBrowserCache = true;

const LAMA_MODEL_URL =
  'https://huggingface.co/Carve/LaMa-ONNX/resolve/main/lama_fp32.onnx';
const LAMA_CACHE_NAME = 'photo-editor-lama-v1';
const TRANSFORMERS_CACHE_NAME = 'transformers-cache';
const IDLE_TTL_MS = 150_000;

type ActiveSlot = {
  modelKey: AiModelKey;
  backend: AiBackendKind;
  runner: unknown;
  dispose: () => Promise<void>;
  samState?: {
    imageKey: string;
    imageEmbeddings: Record<string, unknown>;
    originalSizes: unknown;
    reshapedInputSizes: unknown;
  };
};

let activeSlot: ActiveSlot | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let activeAbortController: AbortController | null = null;
let activeRequestId: string | null = null;
const cancelledRequestIds = new Set<string>();

function postSlotState(): void {
  self.postMessage({
    type: 'slot-changed',
    activeModel: activeSlot?.modelKey ?? null,
    backend: activeSlot?.backend ?? null,
  });
}

async function releaseActiveSlot(): Promise<void> {
  if (idleTimer !== null) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
  if (!activeSlot) return;

  const prev = activeSlot;
  activeSlot = null;
  try {
    await prev.dispose();
  } catch {
    // Ignore disposal errors cleanly
  }
  // Micro-delay gives WebGPU/WASM runtime a tick to reclaim buffers cleanly
  await new Promise((resolve) => setTimeout(resolve, 30));
  postSlotState();
}

function resetIdleTimer(): void {
  if (idleTimer !== null) {
    clearTimeout(idleTimer);
  }
  idleTimer = setTimeout(() => {
    idleTimer = null;
    void releaseActiveSlot();
  }, IDLE_TTL_MS);
}

function makeProgressReporter(modelKey: AiModelKey, requestId: string) {
  const fileTotals = new Map<string, { loaded: number; total: number }>();
  const startMs = performance.now();

  return (info: {
    status?: string;
    file?: string;
    loaded?: number;
    total?: number;
  }) => {
    if (cancelledRequestIds.has(requestId)) return;
    const file = info.file || AI_MODEL_CATALOG[modelKey].label;

    if (info.status === 'progress' || info.status === 'done') {
      const existing = fileTotals.get(file) ?? { loaded: 0, total: 0 };
      const total = info.total ?? existing.total;
      const loaded =
        info.status === 'done'
          ? total || existing.loaded
          : (info.loaded ?? existing.loaded);
      fileTotals.set(file, { loaded, total });

      let sumLoaded = 0;
      let sumTotal = 0;
      for (const entry of fileTotals.values()) {
        sumLoaded += entry.loaded;
        sumTotal += entry.total;
      }

      const elapsedSec = Math.max(0.1, (performance.now() - startMs) / 1000);
      const estTotal =
        sumTotal > 0
          ? sumTotal
          : Math.round(AI_MODEL_CATALOG[modelKey].estimatedMb * 1024 * 1024);
      const percent = Math.min(98, Math.round((sumLoaded / estTotal) * 100));

      const progress: AiDownloadProgress = {
        modelKey,
        phase: 'downloading',
        percent,
        loadedBytes: sumLoaded,
        totalBytes: estTotal,
        speedBps: sumLoaded / elapsedSec,
        fileName: file,
      };
      self.postMessage({ type: 'progress', requestId, progress });
    }
  };
}

function emitWarming(modelKey: AiModelKey, requestId: string, label: string) {
  if (cancelledRequestIds.has(requestId)) return;
  const spec = AI_MODEL_CATALOG[modelKey];
  const progress: AiDownloadProgress = {
    modelKey,
    phase: 'warming',
    percent: 99,
    loadedBytes: Math.round(spec.estimatedMb * 1024 * 1024),
    totalBytes: Math.round(spec.estimatedMb * 1024 * 1024),
    speedBps: 0,
    fileName: label,
  };
  self.postMessage({ type: 'progress', requestId, progress });
}

async function inspectCacheStatus(): Promise<{
  status: Record<AiModelKey, AiCacheEntryStatus>;
  totalBytes: number;
}> {
  const keys = Object.keys(AI_MODEL_CATALOG) as AiModelKey[];
  const status = {} as Record<AiModelKey, AiCacheEntryStatus>;
  for (const k of keys) {
    status[k] = { cached: false, sizeBytes: 0 };
  }

  let totalBytes = 0;
  if (typeof caches === 'undefined') {
    return { status, totalBytes };
  }

  try {
    const tfCache = await caches.open(TRANSFORMERS_CACHE_NAME);
    const reqs = await tfCache.keys();
    for (const req of reqs) {
      const matchedKey = keys.find(
        (k) =>
          k !== 'lama-inpaint' && req.url.includes(AI_MODEL_CATALOG[k].repoId)
      );
      if (!matchedKey) continue;

      const res = await tfCache.match(req);
      const cl = Number(res?.headers.get('content-length') || '0');
      const sizeBytes =
        cl > 0 ? cl : res ? (await res.clone().arrayBuffer()).byteLength : 0;
      if (req.url.endsWith('.onnx') || sizeBytes > 512_000) {
        status[matchedKey].cached = true;
      }
      status[matchedKey].sizeBytes += sizeBytes;
      totalBytes += sizeBytes;
    }
  } catch {
    // Ignore cache inspect error
  }

  try {
    const lamaCache = await caches.open(LAMA_CACHE_NAME);
    const lamaRes = await lamaCache.match(LAMA_MODEL_URL);
    if (lamaRes) {
      const cl = Number(lamaRes.headers.get('content-length') || '0');
      const sizeBytes =
        cl > 0 ? cl : (await lamaRes.clone().arrayBuffer()).byteLength;
      status['lama-inpaint'] = { cached: true, sizeBytes };
      totalBytes += sizeBytes;
    }
  } catch {
    // Ignore cache inspect error
  }

  return { status, totalBytes };
}

async function loadPipelineWithFallback(
  task: 'background-removal' | 'depth-estimation' | 'image-to-image',
  modelKey: AiModelKey,
  preferredBackend: AiBackendKind,
  requestId: string
): Promise<{ pipe: unknown; backend: AiBackendKind }> {
  const spec = AI_MODEL_CATALOG[modelKey];
  const progressCb = makeProgressReporter(modelKey, requestId);

  const tryDevice = async (device: AiBackendKind) => {
    const p = await pipeline(task, spec.repoId, {
      device,
      dtype: spec.dtype,
      progress_callback: progressCb,
    });
    return p;
  };

  if (preferredBackend === 'webgpu') {
    try {
      const pipe = await tryDevice('webgpu');
      return { pipe, backend: 'webgpu' };
    } catch {
      // Fallback gracefully to WASM when WebGPU rejects dtype or adapter
    }
  }

  const pipe = await tryDevice('wasm');
  return { pipe, backend: 'wasm' };
}

async function runRmbg(msg: {
  requestId: string;
  modelKey: AiModelKey;
  preferredBackend: AiBackendKind;
  rgba: ArrayBuffer;
  width: number;
  height: number;
}) {
  const { requestId, modelKey, preferredBackend, rgba, width, height } = msg;
  if (activeSlot && activeSlot.modelKey !== modelKey) {
    await releaseActiveSlot();
  }

  if (!activeSlot) {
    const { pipe, backend } = await loadPipelineWithFallback(
      'background-removal',
      modelKey,
      preferredBackend,
      requestId
    );
    activeSlot = {
      modelKey,
      backend,
      runner: pipe,
      dispose: async () => {
        await (pipe as { dispose?: () => Promise<void> }).dispose?.();
      },
    };
    postSlotState();
  }

  emitWarming(modelKey, requestId, 'Running AI foreground matting...');
  const rawImg = new RawImage(new Uint8ClampedArray(rgba), width, height, 4);
  const runFn = activeSlot.runner as (img: RawImage) => Promise<RawImage>;
  const outRaw = await runFn(rawImg);

  const alpha = new Uint8ClampedArray(outRaw.width * outRaw.height);
  if (outRaw.channels === 1) {
    alpha.set(outRaw.data);
  } else {
    for (let i = 0; i < alpha.length; i++) {
      alpha[i] = outRaw.data[i * outRaw.channels + (outRaw.channels - 1)];
    }
  }

  resetIdleTimer();
  self.postMessage(
    {
      type: 'rmbg-result',
      requestId,
      alpha: alpha.buffer,
      width: outRaw.width,
      height: outRaw.height,
    },
    { transfer: [alpha.buffer] }
  );
}

async function ensureSamLoaded(
  preferredBackend: AiBackendKind,
  requestId: string
) {
  if (activeSlot && activeSlot.modelKey !== 'sam-select') {
    await releaseActiveSlot();
  }
  if (activeSlot && activeSlot.modelKey === 'sam-select') return;

  const spec = AI_MODEL_CATALOG['sam-select'];
  const progressCb = makeProgressReporter('sam-select', requestId);

  const loadWithDevice = async (device: AiBackendKind) => {
    const [model, processor] = await Promise.all([
      SamModel.from_pretrained(spec.repoId, {
        device,
        dtype: 'fp16',
        progress_callback: progressCb,
      }),
      AutoProcessor.from_pretrained(spec.repoId, {
        progress_callback: progressCb,
      }),
    ]);
    return { model, processor, device };
  };

  let loaded;
  if (preferredBackend === 'webgpu') {
    try {
      loaded = await loadWithDevice('webgpu');
    } catch {
      loaded = await loadWithDevice('wasm');
    }
  } else {
    loaded = await loadWithDevice('wasm');
  }

  const { model, processor, device } = loaded;
  activeSlot = {
    modelKey: 'sam-select',
    backend: device,
    runner: { model, processor },
    dispose: async () => {
      await model.dispose?.();
    },
  };
  postSlotState();
}

async function runSamEncode(msg: {
  requestId: string;
  preferredBackend: AiBackendKind;
  rgba: ArrayBuffer;
  width: number;
  height: number;
  imageKey: string;
}) {
  await ensureSamLoaded(msg.preferredBackend, msg.requestId);
  if (!activeSlot || activeSlot.modelKey !== 'sam-select') {
    throw new Error('SAM session unavailable.');
  }

  emitWarming(
    'sam-select',
    msg.requestId,
    'Encoding visual features (SlimSAM)...'
  );
  const { model, processor } = activeSlot.runner as {
    model: SamModel;
    processor: InstanceType<typeof AutoProcessor> & {
      (
        img: RawImage,
        opts?: Record<string, unknown>
      ): Promise<Record<string, unknown>>;
    };
  };

  const rawImg = new RawImage(
    new Uint8ClampedArray(msg.rgba),
    msg.width,
    msg.height,
    4
  );
  const encodedInputs = await processor(rawImg);
  const embeddings = await model.get_image_embeddings({
    pixel_values: encodedInputs.pixel_values as Parameters<
      SamModel['get_image_embeddings']
    >[0]['pixel_values'],
  });

  activeSlot.samState = {
    imageKey: msg.imageKey,
    imageEmbeddings: embeddings,
    originalSizes: encodedInputs.original_sizes,
    reshapedInputSizes: encodedInputs.reshaped_input_sizes,
  };

  resetIdleTimer();
  self.postMessage({
    type: 'sam-encoded',
    requestId: msg.requestId,
    imageKey: msg.imageKey,
  });
}

async function runSamDecode(msg: {
  requestId: string;
  points: SamPointPrompt[];
}) {
  if (
    !activeSlot ||
    activeSlot.modelKey !== 'sam-select' ||
    !activeSlot.samState
  ) {
    throw new Error('SAM image embeddings are not loaded yet.');
  }

  const { model, processor } = activeSlot.runner as {
    model: ((inputs: Record<string, unknown>) => Promise<{
      pred_masks: unknown;
      iou_scores: { data: Float32Array };
    }>) &
      SamModel;
    processor: {
      reshape_input_points: (
        points: number[][][],
        originalSizes: unknown,
        reshapedInputSizes: unknown
      ) => unknown;
      post_process_masks: (
        masks: unknown,
        originalSizes: unknown,
        reshapedInputSizes: unknown
      ) => Promise<Array<{ dims: number[]; data: Uint8Array }>>;
      image_processor?: unknown;
    };
  };

  const { imageEmbeddings, originalSizes, reshapedInputSizes } =
    activeSlot.samState;
  const origArr = (originalSizes as number[][])[0] ?? [512, 512];
  const imgH = origArr[0] || 512;
  const imgW = origArr[1] || 512;

  const pointsPx = [msg.points.map((p) => [p.x * imgW, p.y * imgH])];
  const labelsArr = [msg.points.map((p) => p.label)];

  // Use processor with dummy image-free call to build input_points + input_labels tensors
  const dummyImg = new RawImage(
    new Uint8ClampedArray(imgW * imgH * 4),
    imgW,
    imgH,
    4
  );
  const promptInputs = await (
    processor as unknown as (
      img: RawImage,
      opts: Record<string, unknown>
    ) => Promise<Record<string, unknown>>
  )(dummyImg, {
    input_points: pointsPx,
    input_labels: labelsArr,
  });

  const outputs = await model({
    ...imageEmbeddings,
    input_points: promptInputs.input_points,
    input_labels: promptInputs.input_labels,
  });

  const masks = await processor.post_process_masks(
    outputs.pred_masks,
    originalSizes,
    reshapedInputSizes
  );
  const maskTensor = masks[0];
  const scores = outputs.iou_scores.data;

  // Pick best IoU candidate mask (dims: [1, num_masks, H, W])
  const numCandidates = maskTensor.dims[1] || 3;
  const maskH = maskTensor.dims[maskTensor.dims.length - 2];
  const maskW = maskTensor.dims[maskTensor.dims.length - 1];
  let bestIdx = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < numCandidates; i++) {
    if ((scores[i] ?? 0) > bestScore) {
      bestScore = scores[i] ?? 0;
      bestIdx = i;
    }
  }

  const planeSize = maskW * maskH;
  const offset = bestIdx * planeSize;
  const alpha = new Uint8ClampedArray(planeSize);
  for (let i = 0; i < planeSize; i++) {
    alpha[i] = maskTensor.data[offset + i] ? 255 : 0;
  }

  resetIdleTimer();
  self.postMessage(
    {
      type: 'sam-mask',
      requestId: msg.requestId,
      alpha: alpha.buffer,
      width: maskW,
      height: maskH,
      score: bestScore,
    },
    { transfer: [alpha.buffer] }
  );
}

async function runDepth(msg: {
  requestId: string;
  preferredBackend: AiBackendKind;
  rgba: ArrayBuffer;
  width: number;
  height: number;
}) {
  const { requestId, preferredBackend, rgba, width, height } = msg;
  if (activeSlot && activeSlot.modelKey !== 'depth-v2') {
    await releaseActiveSlot();
  }

  if (!activeSlot) {
    const { pipe, backend } = await loadPipelineWithFallback(
      'depth-estimation',
      'depth-v2',
      preferredBackend,
      requestId
    );
    activeSlot = {
      modelKey: 'depth-v2',
      backend,
      runner: pipe,
      dispose: async () => {
        await (pipe as { dispose?: () => Promise<void> }).dispose?.();
      },
    };
    postSlotState();
  }

  emitWarming('depth-v2', requestId, 'Estimating 3D depth map...');
  const rawImg = new RawImage(new Uint8ClampedArray(rgba), width, height, 4);
  const runFn = activeSlot.runner as (
    img: RawImage
  ) => Promise<{ depth: RawImage }>;
  const { depth } = await runFn(rawImg);

  const depthData = new Uint8Array(depth.width * depth.height);
  if (depth.channels === 1) {
    depthData.set(depth.data);
  } else {
    for (let i = 0; i < depthData.length; i++) {
      depthData[i] = depth.data[i * depth.channels];
    }
  }

  resetIdleTimer();
  self.postMessage(
    {
      type: 'depth-result',
      requestId,
      data: depthData.buffer,
      width: depth.width,
      height: depth.height,
    },
    { transfer: [depthData.buffer] }
  );
}

async function runUpscale(msg: {
  requestId: string;
  preferredBackend: AiBackendKind;
  rgba: ArrayBuffer;
  width: number;
  height: number;
}) {
  const { requestId, preferredBackend, rgba, width, height } = msg;
  if (activeSlot && activeSlot.modelKey !== 'upscale-2x') {
    await releaseActiveSlot();
  }

  if (!activeSlot) {
    const { pipe, backend } = await loadPipelineWithFallback(
      'image-to-image',
      'upscale-2x',
      preferredBackend,
      requestId
    );
    activeSlot = {
      modelKey: 'upscale-2x',
      backend,
      runner: pipe,
      dispose: async () => {
        await (pipe as { dispose?: () => Promise<void> }).dispose?.();
      },
    };
    postSlotState();
  }

  emitWarming('upscale-2x', requestId, 'Running Swin2SR 2x reconstruction...');
  const rawImg = new RawImage(new Uint8ClampedArray(rgba), width, height, 4);
  const runFn = activeSlot.runner as (img: RawImage) => Promise<RawImage>;
  const outRaw = await runFn(rawImg);

  const rgbaOut = new Uint8ClampedArray(outRaw.width * outRaw.height * 4);
  const ch = outRaw.channels;
  for (let i = 0; i < outRaw.width * outRaw.height; i++) {
    rgbaOut[i * 4] = outRaw.data[i * ch];
    rgbaOut[i * 4 + 1] = outRaw.data[i * ch + (ch >= 2 ? 1 : 0)];
    rgbaOut[i * 4 + 2] = outRaw.data[i * ch + (ch >= 3 ? 2 : 0)];
    rgbaOut[i * 4 + 3] = ch === 4 ? outRaw.data[i * ch + 3] : 255;
  }

  resetIdleTimer();
  self.postMessage(
    {
      type: 'upscale-result',
      requestId,
      rgba: rgbaOut.buffer,
      width: outRaw.width,
      height: outRaw.height,
    },
    { transfer: [rgbaOut.buffer] }
  );
}

async function fetchLamaModelBuffer(
  requestId: string,
  signal: AbortSignal
): Promise<ArrayBuffer> {
  if (typeof caches !== 'undefined') {
    const cache = await caches.open(LAMA_CACHE_NAME);
    const cached = await cache.match(LAMA_MODEL_URL);
    if (cached) {
      return cached.arrayBuffer();
    }
  }

  const res = await fetch(LAMA_MODEL_URL, { signal });
  if (!res.ok) {
    throw new Error(`Failed to download LaMa ONNX model (${res.status}).`);
  }

  const totalBytes = Number(res.headers.get('content-length') || '208037478');
  const reader = res.body?.getReader();
  if (!reader) {
    const buf = await res.arrayBuffer();
    return buf;
  }

  const chunks: Uint8Array[] = [];
  let loadedBytes = 0;
  const startMs = performance.now();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (signal.aborted) throw new Error('Download cancelled.');
    if (value) {
      chunks.push(value);
      loadedBytes += value.byteLength;
      const elapsed = Math.max(0.1, (performance.now() - startMs) / 1000);
      const progress: AiDownloadProgress = {
        modelKey: 'lama-inpaint',
        phase: 'downloading',
        percent: Math.min(98, Math.round((loadedBytes / totalBytes) * 100)),
        loadedBytes,
        totalBytes,
        speedBps: loadedBytes / elapsed,
        fileName: 'lama_fp32.onnx',
      };
      self.postMessage({ type: 'progress', requestId, progress });
    }
  }

  const merged = new Uint8Array(loadedBytes);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.byteLength;
  }

  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(LAMA_CACHE_NAME);
      await cache.put(
        LAMA_MODEL_URL,
        new Response(merged.buffer, {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Length': String(merged.byteLength),
          },
        })
      );
    } catch {
      // Ignore storage quota errors cleanly
    }
  }

  return merged.buffer;
}

async function runLama(msg: {
  requestId: string;
  preferredBackend: AiBackendKind;
  rgba: ArrayBuffer;
  mask: ArrayBuffer;
  size: number;
  signal: AbortSignal;
}) {
  const { requestId, preferredBackend, rgba, mask, size, signal } = msg;
  if (activeSlot && activeSlot.modelKey !== 'lama-inpaint') {
    await releaseActiveSlot();
  }

  const ort = await import('onnxruntime-web');

  if (!activeSlot) {
    const modelBuffer = await fetchLamaModelBuffer(requestId, signal);
    emitWarming('lama-inpaint', requestId, 'Compiling LaMa ONNX session...');

    let session: import('onnxruntime-web').InferenceSession;
    let backend: AiBackendKind = 'wasm';
    if (preferredBackend === 'webgpu') {
      try {
        session = await ort.InferenceSession.create(modelBuffer, {
          executionProviders: ['webgpu'],
        });
        backend = 'webgpu';
      } catch {
        session = await ort.InferenceSession.create(modelBuffer, {
          executionProviders: ['wasm'],
        });
      }
    } else {
      session = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: ['wasm'],
      });
    }

    activeSlot = {
      modelKey: 'lama-inpaint',
      backend,
      runner: session,
      dispose: async () => {
        await session.release();
      },
    };
    postSlotState();
  }

  emitWarming('lama-inpaint', requestId, 'Running Fourier LaMa inpainting...');
  const session =
    activeSlot.runner as import('onnxruntime-web').InferenceSession;
  const pxCount = size * size;
  const rgbaArr = new Uint8ClampedArray(rgba);
  const maskArr = new Uint8Array(mask);

  const imgFloat = new Float32Array(3 * pxCount);
  const maskFloat = new Float32Array(pxCount);
  for (let i = 0; i < pxCount; i++) {
    imgFloat[i] = rgbaArr[i * 4] / 255;
    imgFloat[pxCount + i] = rgbaArr[i * 4 + 1] / 255;
    imgFloat[2 * pxCount + i] = rgbaArr[i * 4 + 2] / 255;
    maskFloat[i] = maskArr[i] > 127 ? 1 : 0;
  }

  const imageName = session.inputNames[0] || 'image';
  const maskName = session.inputNames[1] || 'mask';
  const results = await session.run({
    [imageName]: new ort.Tensor('float32', imgFloat, [1, 3, size, size]),
    [maskName]: new ort.Tensor('float32', maskFloat, [1, 1, size, size]),
  });

  const outTensor = results[session.outputNames[0]];
  const outData = outTensor.data as Float32Array;
  let maxSample = 0;
  for (let i = 0; i < Math.min(2000, outData.length); i++) {
    if (outData[i] > maxSample) maxSample = outData[i];
  }
  const scale = maxSample <= 1.5 ? 255 : 1;

  const outRgba = new Uint8ClampedArray(pxCount * 4);
  for (let i = 0; i < pxCount; i++) {
    outRgba[i * 4] = Math.max(0, Math.min(255, Math.round(outData[i] * scale)));
    outRgba[i * 4 + 1] = Math.max(
      0,
      Math.min(255, Math.round(outData[pxCount + i] * scale))
    );
    outRgba[i * 4 + 2] = Math.max(
      0,
      Math.min(255, Math.round(outData[2 * pxCount + i] * scale))
    );
    outRgba[i * 4 + 3] = 255;
  }

  resetIdleTimer();
  self.postMessage(
    {
      type: 'lama-result',
      requestId,
      rgba: outRgba.buffer,
      width: size,
      height: size,
    },
    { transfer: [outRgba.buffer] }
  );
}

self.onmessage = async (ev: MessageEvent<Record<string, unknown>>) => {
  const msg = ev.data;
  const type = String(msg.type || '');
  const requestId = String(msg.requestId || '');

  if (type === 'cancel') {
    if (requestId) cancelledRequestIds.add(requestId);
    if (activeRequestId === requestId && activeAbortController) {
      activeAbortController.abort();
    }
    return;
  }

  if (type === 'check-cache') {
    const info = await inspectCacheStatus();
    self.postMessage({ type: 'cache-status', requestId, ...info });
    return;
  }

  if (type === 'unload') {
    await releaseActiveSlot();
    self.postMessage({ type: 'done', requestId });
    return;
  }

  if (type === 'clear-cache') {
    await releaseActiveSlot();
    if (typeof caches !== 'undefined') {
      await Promise.all([
        caches.delete(TRANSFORMERS_CACHE_NAME),
        caches.delete(LAMA_CACHE_NAME),
      ]);
    }
    self.postMessage({ type: 'done', requestId });
    return;
  }

  activeRequestId = requestId;
  activeAbortController = new AbortController();

  try {
    if (type === 'run-rmbg') {
      await runRmbg({
        requestId,
        modelKey: msg.modelKey as AiModelKey,
        preferredBackend: msg.preferredBackend as AiBackendKind,
        rgba: msg.rgba as ArrayBuffer,
        width: msg.width as number,
        height: msg.height as number,
      });
    } else if (type === 'sam-encode') {
      await runSamEncode({
        requestId,
        preferredBackend: msg.preferredBackend as AiBackendKind,
        rgba: msg.rgba as ArrayBuffer,
        width: msg.width as number,
        height: msg.height as number,
        imageKey: msg.imageKey as string,
      });
    } else if (type === 'sam-decode') {
      await runSamDecode({
        requestId,
        points: msg.points as SamPointPrompt[],
      });
    } else if (type === 'run-depth') {
      await runDepth({
        requestId,
        preferredBackend: msg.preferredBackend as AiBackendKind,
        rgba: msg.rgba as ArrayBuffer,
        width: msg.width as number,
        height: msg.height as number,
      });
    } else if (type === 'run-upscale') {
      await runUpscale({
        requestId,
        preferredBackend: msg.preferredBackend as AiBackendKind,
        rgba: msg.rgba as ArrayBuffer,
        width: msg.width as number,
        height: msg.height as number,
      });
    } else if (type === 'run-lama') {
      await runLama({
        requestId,
        preferredBackend: msg.preferredBackend as AiBackendKind,
        rgba: msg.rgba as ArrayBuffer,
        mask: msg.mask as ArrayBuffer,
        size: (msg.size as number) || 512,
        signal: activeAbortController.signal,
      });
    }
  } catch (err) {
    if (!cancelledRequestIds.has(requestId)) {
      self.postMessage({
        type: 'error',
        requestId,
        message: err instanceof Error ? err.message : 'AI inference failed.',
      });
    }
  } finally {
    if (activeRequestId === requestId) {
      activeRequestId = null;
      activeAbortController = null;
    }
    cancelledRequestIds.delete(requestId);
  }
};
