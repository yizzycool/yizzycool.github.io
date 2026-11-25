'use client';

import type { RefObject } from 'react';
import type { QrCodeLevel } from './hooks/use-qr-code-generator';

import {
  Copy,
  Download,
  FileCode2,
  Layers,
  QrCode,
  QrCodeIcon,
  WandSparkles,
} from 'lucide-react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';

import { HotkeyBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import { cn } from '@/utils/cn';

type Props = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  svgContainerRef: RefObject<HTMLDivElement | null>;
  qrValue: string;
  size: number;
  fgColor: string;
  bgColor: string;
  margin: number;
  level: QrCodeLevel;
  logoDataUrl: string | null;
  logoSizeRatio: number;
  onDownloadPng: () => void;
  onDownloadSvg: () => void;
  onCopy: () => void;
  onRequestSendToStudio: (target: 'pic-merge-studio' | 'photo-editor') => void;
};

export default function Preview({
  canvasRef,
  svgContainerRef,
  qrValue,
  size,
  fgColor,
  bgColor,
  margin,
  level,
  logoDataUrl,
  logoSizeRatio,
  onDownloadPng,
  onDownloadSvg,
  onCopy,
  onRequestSendToStudio,
}: Props) {
  const hasContent = Boolean(qrValue.trim());
  const logoPx = Math.round(size * logoSizeRatio);
  const imageSettings = logoDataUrl
    ? {
        src: logoDataUrl,
        height: logoPx,
        width: logoPx,
        excavate: true,
      }
    : undefined;

  return (
    <div className="w-full space-y-4">
      <div className="relative flex flex-col items-center justify-center rounded-2xl border border-neutral-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md sm:p-6 dark:border-neutral-800/80 dark:bg-neutral-900/60">
        {/* Top Meta Bar */}
        <div className="mb-4 flex w-full items-center justify-between gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1.5">
            <QrCodeIcon size={14} className="text-sky-500" />
            <span>Studio Preview</span>
          </span>
          {hasContent && (
            <span className="rounded-full border border-neutral-200/80 bg-white/90 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-neutral-600 dark:border-neutral-700/80 dark:bg-neutral-800/90 dark:text-neutral-300">
              {size}×{size} · ECC {level}
            </span>
          )}
        </div>

        {/* Dot-Grid Studio Stage */}
        <div
          className={cn(
            'relative flex min-h-[268px] w-full items-center justify-center rounded-xl border p-5 transition-all duration-300',
            'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#262626_1px,transparent_1px)]',
            hasContent
              ? 'border-neutral-200/80 bg-neutral-50/70 dark:border-neutral-800/80 dark:bg-neutral-950/60'
              : 'border-dashed border-neutral-300/80 bg-neutral-50/40 dark:border-neutral-700/80 dark:bg-neutral-950/30'
          )}
        >
          {hasContent ? (
            <div className="flex flex-col items-center gap-3">
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-neutral-900/10 dark:ring-white/10">
                <QRCodeCanvas
                  ref={canvasRef}
                  value={qrValue}
                  size={size}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  marginSize={margin}
                  level={level}
                  imageSettings={imageSettings}
                  style={{
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '220px',
                    maxHeight: '220px',
                    display: 'block',
                  }}
                />
              </div>

              {/* Hidden SVG renderer used for crisp vector export */}
              <div ref={svgContainerRef} className="hidden" aria-hidden="true">
                <QRCodeSVG
                  value={qrValue}
                  size={size}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  marginSize={margin}
                  level={level}
                  imageSettings={imageSettings}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center text-neutral-400 dark:text-neutral-500">
              <div className="shadow-2xs mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-200/80 bg-white/90 dark:border-neutral-700/80 dark:bg-neutral-900/80">
                <QrCode
                  size={30}
                  strokeWidth={1.5}
                  className="text-sky-500/70"
                />
              </div>
              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                No QR Code Generated Yet
              </p>
              <p className="mt-1 max-w-[210px] text-[11px] text-neutral-400 dark:text-neutral-500">
                Fill any template on the left and click &ldquo;Generate QR
                Code&rdquo;.
              </p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-5 flex w-full flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="primary"
              size="sm"
              rounded="xl"
              icon={Download}
              onClick={onDownloadPng}
              disabled={!hasContent}
              className="shadow-xs w-full justify-center font-semibold"
              ariaLabel="Download QR Code PNG"
            >
              PNG
            </Button>
            <Button
              variant="secondary"
              size="sm"
              rounded="xl"
              bordered
              icon={FileCode2}
              onClick={onDownloadSvg}
              disabled={!hasContent}
              className="w-full justify-center font-semibold"
              ariaLabel="Download QR Code SVG"
            >
              SVG
            </Button>
          </div>

          <Button
            variant="secondary"
            size="xs"
            rounded="lg"
            icon={Copy}
            onClick={onCopy}
            disabled={!hasContent}
            className="w-full justify-center"
            ariaLabel="Copy QR Code Image"
          >
            Copy Image
          </Button>

          {/* Cross-Tool Handoff */}
          <div className="mt-1 space-y-2 border-t border-neutral-200/70 pt-3 dark:border-neutral-800/70">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Design &amp; Collage Handoff
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                size="xs"
                bordered
                icon={Layers}
                disabled={!hasContent}
                onClick={() => onRequestSendToStudio('pic-merge-studio')}
                className="justify-center text-[11px]"
              >
                PicMerge
              </Button>
              <Button
                variant="ghost"
                size="xs"
                bordered
                icon={WandSparkles}
                disabled={!hasContent}
                onClick={() => onRequestSendToStudio('photo-editor')}
                className="justify-center text-[11px] text-sky-600 dark:text-sky-400"
              >
                Photo Editor
              </Button>
            </div>
          </div>

          <div className="mt-2 hidden items-center gap-2 border-t border-neutral-200/70 pt-3 sm:flex dark:border-neutral-800/70">
            <HotkeyBadge
              items={[{ ...TOOL_HOTKEYS.save, label: 'Download PNG' }]}
            />
            <HotkeyBadge items={[{ ...TOOL_HOTKEYS.copy, label: 'Copy' }]} />
          </div>
        </div>
      </div>
    </div>
  );
}
