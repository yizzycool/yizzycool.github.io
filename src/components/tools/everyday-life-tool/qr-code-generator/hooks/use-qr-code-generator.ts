'use client';

import type {
  EmailPayload,
  QrPayloadType,
  VCardPayload,
  WifiPayload,
} from '../utils/qr-payload';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ToolKeys, ToolUrls } from '@/data/tools';
import { useToolHistory } from '@/hooks/tools/use-tool-history';
import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import { useToolsDB } from '@/hooks/tools/use-tools-db';
import toast from '@/utils/toast';

import { writeStudioHandoff } from '@/components/tools/image-tool/studio-handoff';
import {
  buildQrPayload,
  DEFAULT_EMAIL_PAYLOAD,
  DEFAULT_VCARD_PAYLOAD,
  DEFAULT_WIFI_PAYLOAD,
} from '../utils/qr-payload';

export type QrCodeLevel = 'L' | 'M' | 'Q' | 'H';

export type QrCodeHistoryData = {
  text: string;
  size: number;
  fgColor: string;
  bgColor: string;
  margin: number;
  level: QrCodeLevel;
};

export default function useQrCodeGenerator(suppressHotkeys = false) {
  const router = useRouter();
  const { isSupported: isDbSupported, setValue: dbSetValue } = useToolsDB();

  const [payloadType, setPayloadType] = useState<QrPayloadType>('text');
  const [inputText, setInputText] = useState('');
  const [wifi, setWifi] = useState<WifiPayload>(DEFAULT_WIFI_PAYLOAD);
  const [vcard, setVCard] = useState<VCardPayload>(DEFAULT_VCARD_PAYLOAD);
  const [email, setEmail] = useState<EmailPayload>(DEFAULT_EMAIL_PAYLOAD);

  const [qrValue, setQrValue] = useState('');
  const [size, setSize] = useState(512);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [margin, setMargin] = useState(2);
  const [level, setLevel] = useState<QrCodeLevel>('M');
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSizeRatio, setLogoSizeRatio] = useState(0.2);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const {
    historyList,
    isLoading: isLoadingHistory,
    addHistoryWithToast,
    renameHistory,
    removeHistory,
    clearHistory,
  } = useToolHistory<QrCodeHistoryData>('qr-code-generator');

  const computedContent = useMemo(
    () =>
      buildQrPayload(payloadType, {
        text: inputText,
        wifi,
        vcard,
        email,
      }),
    [payloadType, inputText, wifi, vcard, email]
  );

  const onClear = useCallback(() => {
    setInputText('');
    setWifi(DEFAULT_WIFI_PAYLOAD);
    setVCard(DEFAULT_VCARD_PAYLOAD);
    setEmail(DEFAULT_EMAIL_PAYLOAD);
  }, []);

  const onGenerate = useCallback(
    (shouldSaveHistory = true) => {
      if (!computedContent) return;
      setQrValue(computedContent);
      toast.success('QR Code generated successfully');

      if (shouldSaveHistory) {
        addHistoryWithToast(computedContent, {
          text: computedContent,
          size,
          fgColor,
          bgColor,
          margin,
          level,
        });
      }
    },
    [
      computedContent,
      size,
      fgColor,
      bgColor,
      margin,
      level,
      addHistoryWithToast,
    ]
  );

  const onRestoreHistory = useCallback((data: QrCodeHistoryData) => {
    if (!data) return;
    setPayloadType('text');
    setInputText(data.text);
    setQrValue(data.text);
    if (typeof data.size === 'number') setSize(data.size);
    if (data.fgColor) setFgColor(data.fgColor);
    if (data.bgColor) setBgColor(data.bgColor);
    if (typeof data.margin === 'number') setMargin(data.margin);
    if (data.level) setLevel(data.level);
    toast.success('QR Code restored from history');
  }, []);

  const onUploadLogo = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') return;
        setLogoDataUrl(reader.result);
        if (level !== 'H') {
          setLevel('H');
          toast.info(
            'ECC upgraded to High (H) for reliable center logo scanning'
          );
        } else {
          toast.success('Center logo added');
        }
      };
      reader.readAsDataURL(file);
    },
    [level]
  );

  const onRemoveLogo = useCallback(() => {
    setLogoDataUrl(null);
  }, []);

  const onDownloadPng = useCallback(() => {
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
      toast.success('QR Code PNG downloaded');
    } catch {
      toast.error('Failed to download QR Code PNG');
    }
  }, [qrValue]);

  const onDownloadSvg = useCallback(() => {
    if (!qrValue) return;
    const svgEl = svgContainerRef.current?.querySelector('svg');
    if (!svgEl) return;

    try {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgEl);
      const blob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode_${Date.now()}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('QR Code SVG downloaded');
    } catch {
      toast.error('Failed to export QR Code SVG');
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
          } catch {
            // Fall back to copying raw text payload
          }
        }
        await navigator.clipboard.writeText(qrValue);
        toast.success('QR Code content copied to clipboard');
      });
    } catch {
      try {
        await navigator.clipboard.writeText(qrValue);
        toast.success('QR Code text copied to clipboard');
      } catch {
        toast.error('Clipboard permission denied');
      }
    }
  }, [qrValue]);

  const onSendToStudio = useCallback(
    async (target: 'pic-merge-studio' | 'photo-editor') => {
      const canvas = canvasRef.current;
      if (!canvas || !qrValue) return;
      if (!isDbSupported) {
        toast.error('IndexedDB is unavailable in this browser session');
        return;
      }

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      );
      if (!blob) {
        toast.error('Unable to prepare QR Code image');
        return;
      }

      await writeStudioHandoff(dbSetValue, target, {
        version: 1,
        createdAt: Date.now(),
        source: target === 'photo-editor' ? 'pic-merge-studio' : 'photo-editor',
        mode: target === 'pic-merge-studio' ? 'append' : 'replace',
        width: size,
        height: size,
        backgroundColor: bgColor,
        items: [{ name: 'qr-code.png', blob }],
      });

      const targetUrl =
        target === 'photo-editor'
          ? ToolUrls[ToolKeys.photoEditorStudio] ||
            '/tools/image-tool/photo-editor'
          : ToolUrls[ToolKeys.picMergeStudio] ||
            '/tools/image-tool/pic-merge-studio';
      router.push(`${targetUrl}?handoff=1`);
    },
    [bgColor, dbSetValue, isDbSupported, qrValue, router, size]
  );

  const onGlobalPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setPayloadType('text');
        setInputText(text);
      }
    } catch {
      // Ignore clipboard permission errors
    }
  }, []);

  useToolHotkeys(
    {
      onExecute: () => onGenerate(true),
      onSave: onDownloadPng,
      onCopy,
      onPaste: onGlobalPaste,
      onClear,
    },
    { target: inputRef, enabled: !suppressHotkeys }
  );

  return {
    payloadType,
    setPayloadType,
    inputText,
    setInputText,
    wifi,
    updateWifi: (patch: Partial<WifiPayload>) =>
      setWifi((prev) => ({ ...prev, ...patch })),
    vcard,
    updateVCard: (patch: Partial<VCardPayload>) =>
      setVCard((prev) => ({ ...prev, ...patch })),
    email,
    updateEmail: (patch: Partial<EmailPayload>) =>
      setEmail((prev) => ({ ...prev, ...patch })),
    computedContent,
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
    logoDataUrl,
    logoSizeRatio,
    setLogoSizeRatio,
    onUploadLogo,
    onRemoveLogo,
    inputRef,
    canvasRef,
    svgContainerRef,
    historyList,
    isLoadingHistory,
    onRestoreHistory,
    renameHistory,
    removeHistory,
    clearHistory,
    onClear,
    onGenerate,
    onDownloadPng,
    onDownloadSvg,
    onCopy,
    onSendToStudio,
  };
}
