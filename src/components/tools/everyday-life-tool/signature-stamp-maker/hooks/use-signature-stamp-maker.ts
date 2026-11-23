'use client';

import type {
  BoundingBox,
  ExportScale,
  PhotoExtractSettings,
  PhotoViewMode,
  SignatureSettings,
  StampSettings,
  Stroke,
  StudioMode,
} from '../types';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useConfirmDialog } from '@/components/ui/dialog';
import useToolHotkeys, {
  hasOpenModalDialog,
} from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';

import {
  DEFAULT_PHOTO_EXTRACT_SETTINGS,
  DEFAULT_SIGNATURE_SETTINGS,
  DEFAULT_STAMP_SETTINGS,
} from '../constants';
import {
  createSampleSignaturePhotoCanvas,
  exportExtractedPhotoToPngBlob,
  getPhotoExportBox,
  loadPhotoToCanvas,
} from '../utils/photo-extractor';
import {
  exportStampToPngBlob,
  exportStampToSvg,
  getStampLogicalDimensions,
} from '../utils/stamp-renderer';
import {
  exportSignatureToPngBlob,
  exportSignatureToSvg,
  getSignatureExportBox,
} from '../utils/stroke-engine';

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function isTextInputFocused(): boolean {
  if (typeof document === 'undefined') return false;
  const active = document.activeElement as HTMLElement | null;
  if (!active || active === document.body) return false;
  if (active.isContentEditable) return true;

  const tag = active.tagName;
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag === 'INPUT') {
    const type = (active as HTMLInputElement).type;
    return (
      type !== 'range' &&
      type !== 'color' &&
      type !== 'checkbox' &&
      type !== 'radio' &&
      type !== 'button'
    );
  }
  return false;
}

export default function useSignatureStampMaker() {
  const [mode, setMode] = useState<StudioMode>('signature');

  // Signature state
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [sigSettings, setSigSettings] = useState<SignatureSettings>(
    DEFAULT_SIGNATURE_SETTINGS
  );
  const [isTrackpadDrawing, setIsTrackpadDrawing] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);

  // Stamp state
  const [stampSettings, setStampSettings] = useState<StampSettings>(
    DEFAULT_STAMP_SETTINGS
  );

  // Photo extract state
  const [photoSource, setPhotoSource] = useState<HTMLCanvasElement | null>(
    null
  );
  const [photoFileName, setPhotoFileName] = useState('');
  const [photoSettings, setPhotoSettings] = useState<PhotoExtractSettings>(
    DEFAULT_PHOTO_EXTRACT_SETTINGS
  );
  const [photoViewMode, setPhotoViewMode] =
    useState<PhotoViewMode>('extracted');
  const [photoMeta, setPhotoMeta] = useState<{
    bounds: BoundingBox | null;
    width: number;
    height: number;
  }>({ bounds: null, width: 0, height: 0 });

  const processedPhotoCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Shared export scale
  const [exportScale, setExportScale] = useState<ExportScale>(2);

  const { confirm, dialogProps } = useConfirmDialog();

  const handleCommitStroke = useCallback((stroke: Stroke) => {
    setStrokes((prev) => [...prev, stroke]);
    setRedoStack([]);
  }, []);

  const handleUndo = useCallback(() => {
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const popped = prev[prev.length - 1];
      setRedoStack((redo) => [...redo, popped]);
      return prev.slice(0, -1);
    });
  }, []);

  const handleRedo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const restored = prev[prev.length - 1];
      setStrokes((s) => [...s, restored]);
      return prev.slice(0, -1);
    });
  }, []);

  const handleRequestClearSignature = useCallback(() => {
    if (strokes.length === 0) return;
    void confirm({
      title: 'Clear signature canvas?',
      message:
        'This will erase all handwritten strokes currently on the canvas. You cannot undo after clearing.',
      confirmText: 'Clear Canvas',
      confirmVariant: 'error',
      onConfirm: () => {
        setStrokes([]);
        setRedoStack([]);
        toast.success('Canvas cleared');
      },
    });
  }, [confirm, strokes.length]);

  const handleUpdateSigSettings = useCallback(
    (patch: Partial<SignatureSettings>) => {
      if (patch.trackpadMode === false) {
        setIsTrackpadDrawing(false);
      }
      setSigSettings((prev) => {
        const next = { ...prev, ...patch };
        if (
          patch.color?.toLowerCase() === '#ffffff' &&
          prev.backdrop === 'paper' &&
          !patch.backdrop
        ) {
          next.backdrop = 'dark';
        }
        return next;
      });
    },
    []
  );

  const handleUpdateStampSettings = useCallback(
    (patch: Partial<StampSettings>) => {
      setStampSettings((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const handleUpdatePhotoSettings = useCallback(
    (patch: Partial<PhotoExtractSettings>) => {
      setPhotoSettings((prev) => {
        const next = { ...prev, ...patch };
        if (
          patch.colorMode === 'recolor' &&
          patch.recolorHex?.toLowerCase() === '#ffffff' &&
          prev.backdrop === 'paper' &&
          !patch.backdrop
        ) {
          next.backdrop = 'dark';
        } else if (
          patch.recolorHex?.toLowerCase() === '#ffffff' &&
          prev.colorMode === 'recolor' &&
          prev.backdrop === 'paper' &&
          !patch.backdrop
        ) {
          next.backdrop = 'dark';
        }
        return next;
      });
    },
    []
  );

  const handleSelectPhotoFile = useCallback(async (file: File | Blob) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WebP, HEIC)');
      return;
    }

    try {
      const loaded = await loadPhotoToCanvas(file);
      setPhotoSource(loaded.canvas);
      setPhotoFileName(file instanceof File ? file.name : 'pasted-photo.png');
      setPhotoViewMode('extracted');
      setPhotoMeta({
        bounds: null,
        width: loaded.width,
        height: loaded.height,
      });
      toast.success('Photo loaded for local extraction');
    } catch {
      toast.error('Failed to decode image file');
    }
  }, []);

  const handleLoadSamplePhoto = useCallback(() => {
    const sampleCanvas = createSampleSignaturePhotoCanvas();
    setPhotoSource(sampleCanvas);
    setPhotoFileName('sample-paper-signature.jpg');
    setPhotoSettings(DEFAULT_PHOTO_EXTRACT_SETTINGS);
    setPhotoViewMode('extracted');
    setPhotoMeta({
      bounds: null,
      width: sampleCanvas.width,
      height: sampleCanvas.height,
    });
    toast.success('Loaded sample paper signature');
  }, []);

  const handleClearPhoto = useCallback(() => {
    setPhotoSource(null);
    setPhotoFileName('');
    setPhotoMeta({ bounds: null, width: 0, height: 0 });
    toast.success('Photo cleared');
  }, []);

  const hasExportableContent =
    mode === 'signature'
      ? strokes.length > 0
      : mode === 'stamp'
        ? stampSettings.text.trim().length > 0 ||
          stampSettings.subtitle.trim().length > 0
        : photoSource !== null && photoMeta.bounds !== null;

  const outputDimensions = useMemo(() => {
    if (mode === 'signature') {
      const box = getSignatureExportBox(strokes, trimWhitespace);
      return { width: box.width, height: box.height };
    }
    if (mode === 'stamp') {
      return getStampLogicalDimensions(stampSettings.shape);
    }
    if (photoSource && photoMeta.width > 0 && photoMeta.height > 0) {
      const box = getPhotoExportBox(
        photoMeta.width,
        photoMeta.height,
        photoMeta.bounds,
        trimWhitespace
      );
      return { width: box.width, height: box.height };
    }
    return { width: 900, height: 400 };
  }, [
    mode,
    photoMeta.bounds,
    photoMeta.height,
    photoMeta.width,
    photoSource,
    stampSettings.shape,
    strokes,
    trimWhitespace,
  ]);

  const renderActivePngBlob = useCallback(async () => {
    if (mode === 'signature') {
      return exportSignatureToPngBlob(strokes, {
        trimWhitespace,
        scale: exportScale,
      });
    }
    if (mode === 'stamp') {
      return exportStampToPngBlob(stampSettings, exportScale);
    }
    if (!processedPhotoCanvasRef.current) return null;
    return exportExtractedPhotoToPngBlob(
      processedPhotoCanvasRef.current,
      photoMeta.bounds,
      {
        trimWhitespace,
        scale: exportScale,
      }
    );
  }, [
    exportScale,
    mode,
    photoMeta.bounds,
    stampSettings,
    strokes,
    trimWhitespace,
  ]);

  const handleDownloadPng = useCallback(async () => {
    if (!hasExportableContent) return;

    const result = await renderActivePngBlob();
    if (!result) {
      toast.error('Failed to export PNG image');
      return;
    }

    const fileName =
      mode === 'signature'
        ? `signature-${exportScale}x.png`
        : mode === 'stamp'
          ? `stamp-${stampSettings.shape}-${exportScale}x.png`
          : `extracted-signature-${exportScale}x.png`;

    triggerBlobDownload(result.blob, fileName);
    toast.success(
      `Downloaded ${fileName} (${result.width} × ${result.height} px)`
    );
  }, [
    exportScale,
    hasExportableContent,
    mode,
    renderActivePngBlob,
    stampSettings.shape,
  ]);

  const handleDownloadSvg = useCallback(() => {
    if (!hasExportableContent || mode === 'photo') return;

    const { svg } =
      mode === 'signature'
        ? exportSignatureToSvg(strokes, { trimWhitespace })
        : exportStampToSvg(stampSettings);

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const fileName =
      mode === 'signature'
        ? 'signature.svg'
        : `stamp-${stampSettings.shape}.svg`;

    triggerBlobDownload(blob, fileName);
    toast.success(`Downloaded ${fileName}`);
  }, [hasExportableContent, mode, stampSettings, strokes, trimWhitespace]);

  const handleCopyPng = useCallback(async () => {
    if (!hasExportableContent) return;

    if (
      typeof navigator === 'undefined' ||
      !navigator.clipboard?.write ||
      typeof ClipboardItem === 'undefined'
    ) {
      toast.error(
        'Direct image clipboard copy is not supported in this browser. Please download PNG instead.'
      );
      return;
    }

    const result = await renderActivePngBlob();
    if (!result) {
      toast.error('Failed to render PNG for clipboard');
      return;
    }

    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': result.blob }),
      ]);
      toast.success('Transparent PNG copied to clipboard');
    } catch {
      toast.error('Clipboard permission denied. Please download PNG instead.');
    }
  }, [hasExportableContent, renderActivePngBlob]);

  // Clipboard image paste support when in Photo Extract mode
  useEffect(() => {
    if (mode !== 'photo' || typeof window === 'undefined') return;

    const handlePasteEvent = (e: ClipboardEvent) => {
      if (hasOpenModalDialog() || isTextInputFocused()) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) {
            e.preventDefault();
            void handleSelectPhotoFile(blob);
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handlePasteEvent);
    return () => window.removeEventListener('paste', handlePasteEvent);
  }, [handleSelectPhotoFile, mode]);

  // Modal-aware Undo / Redo shortcuts (Mod+Z / Mod+Shift+Z)
  useEffect(() => {
    if (mode !== 'signature' || typeof window === 'undefined') return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || hasOpenModalDialog()) return;
      if (isTextInputFocused()) return;

      const isMod = e.metaKey || e.ctrlKey;
      if (!isMod) return;

      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (e.key.toLowerCase() === 'y' && !e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleRedo, handleUndo, mode]);

  useToolHotkeys({
    onSave: () => void handleDownloadPng(),
    onCopy: () => void handleCopyPng(),
    onClear: () => {
      if (mode === 'signature' && strokes.length > 0) {
        handleRequestClearSignature();
      } else if (mode === 'photo' && photoSource) {
        handleClearPhoto();
      }
    },
  });

  return {
    mode,
    setMode,
    strokes,
    canUndo: strokes.length > 0,
    canRedo: redoStack.length > 0,
    sigSettings,
    isTrackpadDrawing,
    setIsTrackpadDrawing,
    trimWhitespace,
    setTrimWhitespace,
    stampSettings,
    photoSource,
    photoFileName,
    photoSettings,
    photoViewMode,
    setPhotoViewMode,
    processedPhotoCanvasRef,
    setPhotoMeta,
    exportScale,
    setExportScale,
    hasExportableContent,
    outputDimensions,
    dialogProps,
    handleCommitStroke,
    handleUndo,
    handleRedo,
    handleRequestClearSignature,
    handleUpdateSigSettings,
    handleUpdateStampSettings,
    handleResetStamp: () => setStampSettings(DEFAULT_STAMP_SETTINGS),
    handleUpdatePhotoSettings,
    handleSelectPhotoFile,
    handleLoadSamplePhoto,
    handleClearPhoto,
    handleCopyPng,
    handleDownloadPng,
    handleDownloadSvg,
  };
}
