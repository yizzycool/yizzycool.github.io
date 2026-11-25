'use client';

import type {
  DocumentConfig,
  ExportFormat,
  ExportOptions,
  GifMotionPreset,
} from './types/studio';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeftRight,
  Check,
  Copy,
  Download,
  ImageDown,
  ShieldCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { BaseDialog, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Selector } from '@/components/ui/selector';
import { Slider } from '@/components/ui/slider';
import { Tabs } from '@/components/ui/tabs';
import { getFormattedDate } from '@/utils/time-utils';

import { MOBILE_MAX_EXPORT_EDGE } from './constants';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  docConfig: DocumentConfig;
  hasSelection: boolean;
  onExport: (options: ExportOptions) => Promise<void>;
  onCopyPng: () => Promise<boolean>;
  onSendToPicMerge: (scope: 'canvas' | 'selected') => void;
};

const SCALE_OPTIONS: Array<{ label: string; value: 1 | 2 | 3 }> = [
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '3x', value: 3 },
];

const GIF_MOTION_OPTIONS = [
  { label: 'Layer Sequence', value: 'layers' },
  { label: 'Pulse Zoom', value: 'pulse' },
  { label: 'Rotate Spin', value: 'spin' },
  { label: 'Vertical Bounce', value: 'bounce' },
  { label: 'Cross Fade', value: 'fade' },
  { label: 'Slide Reveal', value: 'slide' },
];

/**
 * Multi-format export dialog supporting PNG, JPEG, WebP (1x-3x), Animated GIF,
 * Vector SVG, Photoshop PSD, portable .pes project archive, and PicMerge handoff.
 */
export default function ExportDialog({
  isOpen,
  onClose,
  docConfig,
  hasSelection,
  onExport,
  onCopyPng,
  onSendToPicMerge,
}: Props) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [multiplier, setMultiplier] = useState<1 | 2 | 3>(1);
  const [quality, setQuality] = useState<number>(0.92);
  const [gifMode, setGifMode] = useState<GifMotionPreset>('layers');
  const [gifFps, setGifFps] = useState<number>(10);
  const [gifDuration, setGifDuration] = useState<number>(2);
  const [filename, setFilename] = useState(
    () => `photo-editor-${getFormattedDate()}`
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => {
      setFilename(`photo-editor-${getFormattedDate()}`);
      setCopied(false);
    }, 0);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const isRaster = format === 'png' || format === 'jpeg' || format === 'webp';
  const isMobileViewport =
    typeof window !== 'undefined' && window.innerWidth < 1024;
  const maxSafeMultiplier: 1 | 2 | 3 = isMobileViewport
    ? Math.max(docConfig.width, docConfig.height) * 2 <= MOBILE_MAX_EXPORT_EDGE
      ? 2
      : 1
    : 3;
  const effectiveMultiplier: 1 | 2 | 3 =
    multiplier > maxSafeMultiplier ? maxSafeMultiplier : multiplier;

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await onExport({
        format,
        quality,
        multiplier: isRaster ? effectiveMultiplier : 1,
        filename,
        gif:
          format === 'gif'
            ? { mode: gifMode, fps: gifFps, durationSec: gifDuration }
            : undefined,
      });
      onClose();
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyPng = async () => {
    setIsCopying(true);
    try {
      const ok = await onCopyPng();
      if (ok) {
        setCopied(true);
        if (copyTimerRef.current !== null) {
          window.clearTimeout(copyTimerRef.current);
        }
        copyTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
      }
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <BaseDialog isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md space-y-4 p-6 text-left">
        <DialogHeader
          icon={ImageDown}
          title="Export Artwork"
          description="Download raster images, animated GIF, vector SVG, PSD, or .pes projects"
          onClose={onClose}
          closeAriaLabel="Close export dialog"
        />

        <div className="flex items-center justify-between rounded-xl border border-neutral-200/70 bg-neutral-50/70 px-4 py-2.5 text-xs dark:border-neutral-800/70 dark:bg-neutral-900/50">
          <span className="font-semibold text-neutral-600 dark:text-neutral-400">
            Output Dimensions
          </span>
          <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
            {docConfig.width * (isRaster ? effectiveMultiplier : 1)} ×{' '}
            {docConfig.height * (isRaster ? effectiveMultiplier : 1)} px
          </span>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            Format
          </Label>
          <Tabs
            tabs={['png', 'jpeg', 'webp', 'gif', 'svg', 'psd', 'pes']}
            tabLabels={{
              png: 'PNG',
              jpeg: 'JPG',
              webp: 'WEBP',
              gif: 'GIF',
              svg: 'SVG',
              psd: 'PSD',
              pes: '.PES',
            }}
            activeTab={format}
            onChange={(t) => setFormat(t as ExportFormat)}
            size="xs"
            className="grid grid-cols-7 font-bold"
            tabClassName="px-1"
          />
        </div>

        {isRaster && (
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Resolution Scale
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {SCALE_OPTIONS.map((opt) => {
                const disabled = opt.value > maxSafeMultiplier;
                return (
                  <Button
                    key={opt.value}
                    size="xs"
                    disabled={disabled}
                    variant={
                      effectiveMultiplier === opt.value
                        ? 'primary'
                        : 'secondary'
                    }
                    bordered={effectiveMultiplier !== opt.value}
                    onClick={() => setMultiplier(opt.value)}
                  >
                    {opt.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {(format === 'jpeg' || format === 'webp') && (
          <Slider
            title="Compression Quality"
            min={0.5}
            max={1}
            step={0.01}
            value={quality}
            showValueBadge
            onChange={(e) => setQuality(parseFloat(e.target.value))}
          />
        )}

        {format === 'gif' && (
          <div className="space-y-2.5 rounded-xl border border-neutral-200/70 bg-neutral-50/70 p-3 dark:border-neutral-800/70 dark:bg-neutral-900/50">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                Animation Motion
              </Label>
              <Selector
                size="xs"
                options={GIF_MOTION_OPTIONS}
                value={gifMode}
                onChange={(v) => setGifMode(v as GifMotionPreset)}
              />
            </div>
            <Slider
              title="Frame Rate (FPS)"
              min={4}
              max={24}
              step={1}
              value={gifFps}
              showValueBadge
              onChange={(e) => setGifFps(Number(e.target.value))}
            />
            {gifMode !== 'layers' && (
              <Slider
                title="Loop Duration (s)"
                min={1}
                max={4}
                step={0.5}
                value={gifDuration}
                showValueBadge
                onChange={(e) => setGifDuration(Number(e.target.value))}
              />
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="photo-editor-export-filename"
            className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400"
          >
            File Name
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="photo-editor-export-filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="photo-editor-export"
              className="flex-1 font-mono text-sm"
            />
            <span className="font-mono text-xs font-bold text-neutral-400">
              .{format === 'jpeg' ? 'jpg' : format}
            </span>
          </div>
        </div>

        {/* Dual-Tool Handoff to PicMerge Studio */}
        <div className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200/70 bg-neutral-50/60 px-3 py-2 dark:border-neutral-800/70 dark:bg-neutral-900/40">
          <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
            Continue in PicMerge Collage
          </span>
          <div className="flex gap-1.5">
            {hasSelection && (
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  onClose();
                  onSendToPicMerge('selected');
                }}
              >
                Layer
              </Button>
            )}
            <Button
              size="xs"
              variant="secondary"
              bordered
              icon={ArrowLeftRight}
              onClick={() => {
                onClose();
                onSendToPicMerge('canvas');
              }}
            >
              Send Canvas
            </Button>
          </div>
        </div>

        {/* Slot B: Reserved Natural Wait-Period Card (Zero CLS) */}
        <div
          data-ad-slot="studio-modal-wait"
          className="flex items-center gap-2.5 rounded-xl border border-dashed border-neutral-300/80 bg-neutral-50/70 px-3 py-2 text-[11px] text-neutral-500 dark:border-neutral-700/80 dark:bg-neutral-900/50 dark:text-neutral-400"
        >
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>
            100% browser-side rendering · No watermarks, uploads, or account
            required.
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1 sm:flex-nowrap">
          <Button
            size="xs"
            variant="surface"
            bordered
            rounded="xl"
            onClick={onClose}
            className="flex-1 font-bold"
          >
            Cancel
          </Button>
          <Button
            size="xs"
            variant="secondary"
            bordered
            rounded="xl"
            icon={copied ? Check : Copy}
            disabled={isCopying || isExporting}
            onClick={() => void handleCopyPng()}
            className="flex-1 font-bold"
          >
            {copied ? 'Copied' : isCopying ? 'Copying...' : 'Copy PNG'}
          </Button>
          <Button
            size="xs"
            variant="primary"
            rounded="xl"
            icon={Download}
            disabled={isExporting || isCopying}
            onClick={() => void handleDownload()}
            className="flex-1 font-bold shadow-md"
          >
            {isExporting ? 'Exporting...' : 'Download'}
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}
