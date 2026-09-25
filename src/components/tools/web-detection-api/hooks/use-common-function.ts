import type { Param, WebDetectionFileType } from '../result-canvas';

import { useCallback, useEffect, useRef, useState } from 'react';

import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';

import useWebcam from './use-webcam';

type Props = {
  detect: (
    image: HTMLImageElement | HTMLCanvasElement
  ) => Promise<
    FaceDetectionResults | BarcodeDetectionResults | TextDetectionResults | null
  >;
  getCopyText?: (
    results:
      | FaceDetectionResults
      | BarcodeDetectionResults
      | TextDetectionResults
      | null
  ) => string | null;
};

export const defaultParam: Param = {
  type: '',
  blob: null,
  stream: null,
};

const defaultGetCopyText = (res: unknown): string | null => {
  if (!res || !Array.isArray(res) || res.length === 0) return null;
  // If barcode or text detector result contains rawValue
  if ('rawValue' in res[0] && typeof res[0].rawValue === 'string') {
    return res
      .map((r: { rawValue: string; format?: string }) =>
        r.format ? `[${r.format}] ${r.rawValue}` : r.rawValue
      )
      .join('\n');
  }
  // Face detector or other complex structure
  if ('boundingBox' in res[0]) {
    return `Detected ${res.length} face(s)\n` + JSON.stringify(res, null, 2);
  }
  return JSON.stringify(res, null, 2);
};

export default function useCommonFunction({ detect, getCopyText }: Props) {
  const [param, setParam] = useState<Param>(defaultParam);
  const [results, setResults] = useState<
    FaceDetectionResults | BarcodeDetectionResults | TextDetectionResults | null
  >(null);
  const [tab, setTabState] = useState<WebDetectionFileType>('image');

  const resultRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { isCameraOpened, startCamera, stopCamera, flipCamera } = useWebcam();

  const onClear = useCallback(() => {
    if (param.type === 'webcam') {
      stopCamera();
    }
    setParam(defaultParam);
    setResults(null);
  }, [param.type, stopCamera]);

  const setTab = useCallback(
    (newTab: WebDetectionFileType) => {
      setTabState(newTab);
      if (param.type && param.type !== newTab) {
        onClear();
      }
    },
    [param.type, onClear]
  );

  const processImage = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      stopCamera();
      setParam({ type: 'image', blob: file, stream: null });
    },
    [stopCamera]
  );

  const processVideo = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      stopCamera();
      setParam({ type: 'video', blob: file, stream: null });
    },
    [stopCamera]
  );

  const processWebcam = useCallback(async () => {
    if (isCameraOpened) {
      setParam(defaultParam);
      stopCamera();
    } else {
      stopCamera();
      const stream = await startCamera('environment');
      setParam({ type: 'webcam', blob: null, stream: stream });
    }
  }, [isCameraOpened, startCamera, stopCamera]);

  const flipWebcam = useCallback(async () => {
    const stream = await flipCamera();
    setParam({ type: 'webcam', blob: null, stream: stream });
  }, [flipCamera]);

  const onCanvasDraw = useCallback(
    async (canvas: HTMLCanvasElement) => {
      setResults(null);
      const detectionResults = await detect(canvas);
      setResults(detectionResults);
    },
    [detect]
  );

  const handleCopyResults = useCallback(async () => {
    const textToCopy = (getCopyText || defaultGetCopyText)(results);
    if (!textToCopy) {
      toast.info('No detection results to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Detection results copied to clipboard!');
    } catch {
      toast.error('Failed to copy results to clipboard');
    }
  }, [getCopyText, results]);

  const handleClipboardPaste = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], 'clipboard-image.png', {
            type: imageType,
          });
          setTab('image');
          await processImage(file);
          toast.success('Image pasted from clipboard!');
          return;
        }
      }
      toast.info('No image found in clipboard');
    } catch {
      // Handled silently or by native paste event
    }
  }, [processImage, setTab]);

  // Global hotkeys (Clear, Copy, Paste via useToolHotkeys)
  useToolHotkeys({
    onClear: () => {
      if (param.type) {
        onClear();
      }
    },
    onCopy: handleCopyResults,
    onPaste: handleClipboardPaste,
  });

  // Native window paste event listener (Ctrl/Cmd + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            setTab('image');
            processImage(file);
            toast.success('Image pasted from clipboard!');
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [processImage, setTab]);

  // Mode switching (1: Image, 2: Video, 3: Webcam) and Camera Flip (F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);
      if (isInput) return;

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '1') {
        e.preventDefault();
        setTab('image');
        return;
      }
      if (e.key === '2') {
        e.preventDefault();
        setTab('video');
        return;
      }
      if (e.key === '3') {
        e.preventDefault();
        setTab('webcam');
        return;
      }
      if ((e.key === 'f' || e.key === 'F') && param.type === 'webcam') {
        e.preventDefault();
        flipWebcam();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [flipWebcam, param.type, setTab]);

  return {
    param,
    setParam,
    results,
    setResults,
    tab,
    setTab,
    resultRef,
    canvasRef,
    isEmpty: !param.type,
    processImage,
    processVideo,
    processWebcam,
    flipWebcam,
    onCanvasDraw,
    onClear,
    handleCopyResults,
  };
}
