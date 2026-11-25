'use client';

import type { TransformedResults } from './types';

import { ExternalLink, KeyRound, Mail, Phone, Wifi } from 'lucide-react';

import { CopyAction } from '@/components/shared/action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import toast from '@/utils/toast';

import { parseBarcodePayload } from './utils/barcode-payload';

type DetectionItem = TransformedResults[number];

type DetectionResultItemProps = {
  item: DetectionItem;
  index: number;
  isActive: boolean;
  enableBarcodeActions?: boolean;
  onHoverIndex?: (index: number | null) => void;
};

export function DetectionResultItem({
  item,
  index,
  isActive,
  enableBarcodeActions = false,
  onHoverIndex,
}: DetectionResultItemProps) {
  const parsedBarcode =
    enableBarcodeActions && item.text ? parseBarcodePayload(item.text) : null;

  const handleCopyWifiPassword = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      toast.success('Copied Wi-Fi password');
    } catch {
      toast.error('Failed to copy Wi-Fi password');
    }
  };

  return (
    <div
      onMouseEnter={() => onHoverIndex?.(index)}
      onMouseLeave={() => onHoverIndex?.(null)}
      className={cn(
        'flex items-start justify-between gap-3 px-3.5 py-2.5 transition-colors',
        isActive
          ? 'bg-sky-50/90 ring-1 ring-inset ring-sky-500/35 dark:bg-sky-950/35 dark:ring-sky-400/35'
          : 'hover:bg-neutral-50/80 dark:hover:bg-neutral-800/35'
      )}
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded bg-sky-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-sky-700 dark:bg-sky-400/15 dark:text-sky-300">
            #{index + 1}
          </span>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {item.label || 'Detected Object'}
          </span>
          {item.confidence ? (
            <Badge variant="success" size="xs">
              {Math.round(item.confidence * 100)}%
            </Badge>
          ) : null}
        </div>

        {item.text && (
          <p className="break-all font-mono text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {item.text}
          </p>
        )}

        {parsedBarcode?.kind === 'url' && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <a
              href={parsedBarcode.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="xs"
                rounded="lg"
                icon={ExternalLink}
              >
                Open Link
              </Button>
            </a>
          </div>
        )}

        {parsedBarcode?.kind === 'wifi' && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-lg bg-neutral-100/80 px-2.5 py-1.5 dark:bg-neutral-800/60">
            <Badge variant="primary" size="xs" icon={Wifi}>
              {parsedBarcode.ssid}
            </Badge>
            <Badge variant="neutral" size="xs">
              {parsedBarcode.security}
            </Badge>
            {parsedBarcode.password && (
              <Button
                variant="outline"
                size="xs"
                rounded="lg"
                icon={KeyRound}
                onClick={() =>
                  void handleCopyWifiPassword(parsedBarcode.password)
                }
              >
                Copy Password
              </Button>
            )}
          </div>
        )}

        {parsedBarcode?.kind === 'email' && (
          <div className="pt-0.5">
            <a href={parsedBarcode.href}>
              <Button variant="outline" size="xs" rounded="lg" icon={Mail}>
                Email {parsedBarcode.address}
              </Button>
            </a>
          </div>
        )}

        {parsedBarcode?.kind === 'phone' && (
          <div className="pt-0.5">
            <a href={parsedBarcode.href}>
              <Button variant="outline" size="xs" rounded="lg" icon={Phone}>
                Call {parsedBarcode.number}
              </Button>
            </a>
          </div>
        )}
      </div>

      <CopyAction
        display="icon"
        variant="ghost"
        size="xs"
        rounded="lg"
        content={item.text || item.label || ''}
        title="Copy detected value"
        successToast="Copied detection value"
        className="shrink-0"
      />
    </div>
  );
}
