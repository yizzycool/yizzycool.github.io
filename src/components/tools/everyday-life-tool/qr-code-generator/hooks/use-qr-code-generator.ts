'use client';

import type { ChangeEvent } from 'react';
import { useRef, useState, useCallback } from 'react';
import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import { useToolHistory } from '@/hooks/tools/use-tool-history';
import toast from '@/utils/toast';

export type QrCodeLevel = 'L' | 'M' | 'Q' | 'H';

export type QrCodeHistoryData = {
  text: string;
  size: number;
  fgColor: string;
  bgColor: string;
  margin: number;
  level: QrCodeLevel;
};

export default function useQrCodeGenerator() {
  const [inputText, setInputText] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [size, setSize] = useState(512);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [margin, setMargin] = useState(2);
  const [level, setLevel] = useState<QrCodeLevel>('M');

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hook into tool history store
  const {
    historyList,
    isLoading: isLoadingHistory,
    addHistory,
    renameHistory,
    removeHistory,
    clearHistory,
  } = useToolHistory<QrCodeHistoryData>('qr-code-generator');

  const onInputChange = useCallback(
    (
      e:
        | React.ChangeEvent<HTMLTextAreaElement>
        | ChangeEvent<HTMLTextAreaElement>
    ) => {
      setInputText(e.target.value);
    },
    []
  );

  const onClear = useCallback(() => {
    setInputText('');
  }, []);

  const onGenerate = useCallback(
    (shouldSaveHistory = true) => {
      const trimmed = inputText.trim();
      if (!trimmed) return;
      setQrValue(trimmed);

      if (shouldSaveHistory) {
        addHistory(trimmed, {
          text: trimmed,
          size,
          fgColor,
          bgColor,
          margin,
          level,
        });
      }

      toast.success('QR Code generated successfully');
    },
    [inputText, size, fgColor, bgColor, margin, level, addHistory]
  );

  const onRestoreHistory = useCallback((data: QrCodeHistoryData) => {
    if (!data) return;
    setInputText(data.text);
    setQrValue(data.text);
    if (typeof data.size === 'number') setSize(data.size);
    if (data.fgColor) setFgColor(data.fgColor);
    if (data.bgColor) setBgColor(data.bgColor);
    if (typeof data.margin === 'number') setMargin(data.margin);
    if (data.level) setLevel(data.level);
    toast.success('QR Code restored from history');
  }, []);

  const onDownload = useCallback(() => {
    if (!qrValue) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('QR Code downloaded successfully');
    } catch (err) {
      console.error('Failed to download QR code:', err);
    }
  }, [qrValue]);

  const onCopy = useCallback(async () => {
    if (!qrValue) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (
          blob &&
          navigator.clipboard &&
          typeof window.ClipboardItem !== 'undefined'
        ) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            toast.success('QR Code image copied to clipboard');
            return;
          } catch (writeErr) {
            console.warn(
              'ClipboardItem write failed, fallback to text:',
              writeErr
            );
          }
        }
        await navigator.clipboard.writeText(qrValue);
        toast.success('QR Code content copied to clipboard');
      });
    } catch (err) {
      console.error('Failed to copy QR code:', err);
      try {
        await navigator.clipboard.writeText(qrValue);
        toast.success('QR Code text copied to clipboard');
      } catch (_e) {}
    }
  }, [qrValue]);

  const onGlobalPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  }, []);

  useToolHotkeys(
    {
      onExecute: () => onGenerate(true),
      onSave: onDownload,
      onCopy: onCopy,
      onPaste: onGlobalPaste,
      onClear: onClear,
    },
    { target: inputRef }
  );

  return {
    inputText,
    setInputText,
    qrValue,
    size,
    setSize,
    fgColor,
    setFgColor,
    bgColor,
    setBgColor,
    margin,
    setMargin,
    level,
    setLevel,
    inputRef,
    canvasRef,
    historyList,
    isLoadingHistory,
    onRestoreHistory,
    renameHistory,
    removeHistory,
    clearHistory,
    onInputChange,
    onClear,
    onGenerate,
    onDownload,
    onCopy,
  };
}
