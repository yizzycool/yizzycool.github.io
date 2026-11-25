'use client';

import type { CanvasExportFormat } from '../types/config';
import type { FabricHelper } from '../types/fabric-helper';
import type { ConfigHelper } from '../types/config-helper';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, ImageDown, Sparkles } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { motion } from 'motion/react';

import { BaseDialog, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getFormattedDate } from '@/utils/time-utils';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  fabricHelper: FabricHelper;
  configHelper: ConfigHelper;
  onRequestSendToPhotoEditor: () => void;
};

export default function ExportModal({
  isOpen,
  onClose,
  fabricHelper,
  configHelper,
  onRequestSendToPhotoEditor,
}: Props) {
  const [format, setFormat] = useState<CanvasExportFormat>(
    configHelper.canvasConfig.exportFormat || 'png'
  );
  const [multiplier, setMultiplier] = useState<1 | 2 | 3>(1);
  const [quality, setQuality] = useState<number>(0.92);
  const [filename, setFilename] = useState<string>(
    () => `pic-merge-${getFormattedDate()}`
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  const { width, height } = configHelper.canvasConfig.size;

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => {
      setFilename(`pic-merge-${getFormattedDate()}`);
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

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      fabricHelper.canvasUpdater.export({
        format,
        quality,
        multiplier,
        filename,
      });
      onClose();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyPng = async () => {
    setIsCopying(true);
    try {
      const ok = await fabricHelper.canvasUpdater.copyToClipboard();
      if (ok) {
        setCopied(true);
        if (copyTimerRef.current !== null) {
          window.clearTimeout(copyTimerRef.current);
        }
        copyTimerRef.current = window.setTimeout(() => {
          setCopied(false);
        }, 2000);
      }
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <BaseDialog isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md space-y-6 p-6 text-left">
        {/* Header */}
        <DialogHeader
          icon={ImageDown}
          title="Export Image"
          description="Choose format and export your merged canvas"
          onClose={onClose}
          closeAriaLabel="Close export modal"
        />

        {/* Canvas Dimension Badge */}
        <div className="flex items-center justify-between rounded-xl border border-neutral-200/60 bg-neutral-50/70 px-4 py-2.5 text-xs dark:border-neutral-800/60 dark:bg-neutral-900/50">
          <span className="font-semibold text-slate-600 dark:text-slate-400">
            Output Dimensions
          </span>
          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
            {width * multiplier} × {height * multiplier} px
          </span>
        </div>

        {/* Resolution Multiplier */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Resolution Scale
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {([1, 2, 3] as const).map((m) => (
              <Button
                key={m}
                size="xs"
                variant={multiplier === m ? 'primary' : 'secondary'}
                bordered={multiplier !== m}
                onClick={() => setMultiplier(m)}
              >
                {m}x
              </Button>
            ))}
          </div>
        </div>

        {/* Output Format Tabs */}
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Output Format
          </Label>
          <Tabs
            tabs={['png', 'jpeg', 'webp']}
            tabLabels={{
              png: 'PNG',
              jpeg: 'JPEG',
              webp: 'WEBP',
            }}
            activeTab={format}
            onChange={(tab) => setFormat(tab as CanvasExportFormat)}
            size="sm"
            className="grid grid-cols-3 font-bold"
          />
        </div>

        {/* Quality Slider for JPEG / WEBP */}
        <AnimatePresence>
          {format !== 'png' && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <Slider
                title="Compression Quality"
                min={0.5}
                max={1.0}
                step={0.01}
                value={quality}
                showValueBadge
                unit=""
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                titleClassName="text-slate-600 dark:text-slate-400"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Name Input */}
        <div className="space-y-2">
          <Label
            htmlFor="export-filename"
            className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
          >
            File Name
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="export-filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Filename"
              className="flex-1 font-mono text-sm"
            />
            <span className="font-mono text-xs font-bold text-slate-400">
              .{format === 'jpeg' ? 'jpg' : format}
            </span>
          </div>
        </div>

        {/* Handoff Bridge to Photo Editor Studio */}
        <Button
          size="xs"
          variant="outline"
          rounded="xl"
          icon={Sparkles}
          onClick={() => {
            onClose();
            onRequestSendToPhotoEditor();
          }}
          className="w-full font-semibold text-sky-600 dark:text-sky-400"
        >
          Send to Photo Editor Studio (Layers, Pen &amp; AI)
        </Button>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5 pt-2 sm:flex-nowrap">
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
            disabled={isCopying || isDownloading}
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
            disabled={isDownloading || isCopying}
            onClick={handleDownload}
            className="flex-1 font-bold shadow-md"
          >
            {isDownloading ? 'Exporting...' : 'Download'}
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}
