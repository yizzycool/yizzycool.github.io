'use client';

import type { QrCodeLevel } from './hooks/use-qr-code-generator';
import type { RefObject } from 'react';

import { Download, Copy, QrCode, QrCodeIcon } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

import { cn } from '@/utils/cn';
import { TOOL_HOTKEYS } from '@/hooks/tools/use-tool-hotkeys';
import { Button } from '@/components/ui/button';
import { HotkeyBadge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

type Props = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  qrValue: string;
  size: number;
  fgColor: string;
  bgColor: string;
  margin: number;
  level: QrCodeLevel;
  onDownload: () => void;
  onCopy: () => void;
};

export default function Preview({
  canvasRef,
  qrValue,
  size,
  fgColor,
  bgColor,
  margin,
  level,
  onDownload,
  onCopy,
}: Props) {
  const hasContent = !!qrValue.trim();

  return (
    <div className="w-full space-y-4">
      {/* Studio Showcase Card */}
      <Card className="relative flex flex-col items-center justify-center p-6 sm:p-8">
        {/* Top Meta Bar */}
        <div className="mb-4 flex w-full gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
          <QrCodeIcon size={14} className="text-sky-500" />
          <span>Live Preview</span>
        </div>

        {/* QR Code Canvas Hub */}
        <div
          className={cn(
            'relative flex min-h-[260px] w-full items-center justify-center',
            'rounded-xl p-4 transition-all duration-300',
            hasContent
              ? 'bg-neutral-100/50 dark:bg-neutral-800/30'
              : 'border border-dashed border-neutral-300/80 bg-neutral-50/50 dark:border-neutral-700/80 dark:bg-neutral-900/20'
          )}
        >
          {hasContent ? (
            <div className="flex flex-col items-center gap-3">
              <div className="overflow-hidden shadow-md">
                <QRCodeCanvas
                  ref={canvasRef}
                  value={qrValue}
                  size={size}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  marginSize={margin}
                  level={level}
                  style={{
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '220px',
                    maxHeight: '220px',
                    display: 'block',
                  }}
                />
              </div>

              {/* Resolution & Level Pill */}
              <div className="shadow-2xs flex items-center gap-2 rounded-full border border-neutral-200/60 bg-white/80 px-3 py-1 font-mono text-[11px] text-slate-500 dark:border-neutral-700/60 dark:bg-neutral-800/80 dark:text-slate-400">
                <span>
                  {size} × {size} px
                </span>
                <span>•</span>
                <span>ECC {level}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400 dark:text-slate-500">
              <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800/60">
                <QrCode size={36} strokeWidth={1.4} className="opacity-50" />
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                No QR Code Generated Yet
              </p>
              <p className="mt-1 max-w-[200px] text-[11px] text-slate-400 dark:text-slate-500">
                Enter your text and click &ldquo;Generate QR Code&rdquo; to
                preview.
              </p>
            </div>
          )}
        </div>

        {/* Action Controls: Compact prominent Download & Copy buttons */}
        <div className="mt-6 flex w-full flex-col gap-2.5">
          <Button
            variant="blue"
            size="base"
            rounded="xl"
            icon={Download}
            onClick={onDownload}
            disabled={!hasContent}
            className="shadow-xs w-full justify-center font-medium"
            ariaLabel="Download QR Code PNG"
          >
            Download PNG
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="xs"
              rounded="lg"
              icon={Copy}
              onClick={onCopy}
              disabled={!hasContent}
              className="flex-1 justify-center"
              ariaLabel="Copy QR Code Image"
            >
              Copy Image
            </Button>
          </div>

          <div className="mt-4 hidden items-center gap-2 border-t border-slate-200/80 pt-6 sm:flex dark:border-neutral-800">
            <HotkeyBadge
              items={[{ ...TOOL_HOTKEYS.save, label: 'Download' }]}
            />
            <HotkeyBadge items={[{ ...TOOL_HOTKEYS.copy, label: 'Copy' }]} />
          </div>
        </div>
      </Card>
    </div>
  );
}
