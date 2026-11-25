'use client';

import type { ExportScale } from './types';

import { Copy, Crop, Download, FileCode } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { Switch } from '@/components/ui/switch';
import { Tabs } from '@/components/ui/tabs';

import { EXPORT_SCALES, EXPORT_SCALE_LABELS } from './constants';

interface Props {
  hasContent: boolean;
  scale: ExportScale;
  onScaleChange: (scale: ExportScale) => void;
  showTrimToggle?: boolean;
  showSvgExport?: boolean;
  trimWhitespace?: boolean;
  onToggleTrim?: () => void;
  outputDimensions: { width: number; height: number };
  onCopyPng: () => void;
  onDownloadPng: () => void;
  onDownloadSvg?: () => void;
}

export default function ExportControlBar({
  hasContent,
  scale,
  onScaleChange,
  showTrimToggle = false,
  showSvgExport = true,
  trimWhitespace = true,
  onToggleTrim,
  outputDimensions,
  onCopyPng,
  onDownloadPng,
  onDownloadSvg,
}: Props) {
  return (
    <Surface
      rounded="2xl"
      className="mt-4 flex flex-wrap items-center justify-between gap-3 px-4 py-3"
    >
      {/* Left: Trim & Resolution Scale */}
      <div className="flex flex-wrap items-center gap-3">
        {showTrimToggle && onToggleTrim && (
          <Switch
            checked={trimWhitespace}
            onChange={() => onToggleTrim()}
            label="Auto-Trim"
            icon={Crop}
            highlightIconOnChecked
            size="xs"
          />
        )}

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span>Scale:</span>
          <Tabs<ExportScale>
            tabs={EXPORT_SCALES}
            activeTab={scale}
            onChange={onScaleChange}
            tabLabels={EXPORT_SCALE_LABELS}
            variant="segment"
            size="xs"
            rounded="md"
            className="p-0.5"
            tabClassName="px-2 py-0.5"
          />
        </div>

        <Badge variant="neutral" size="xs" rounded="md">
          {Math.round(outputDimensions.width * scale)} ×{' '}
          {Math.round(outputDimensions.height * scale)} px
        </Badge>
      </div>

      {/* Right: Clipboard & File Exports */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="xs"
          rounded="lg"
          icon={Copy}
          disabled={!hasContent}
          onClick={onCopyPng}
          title="Copy transparent PNG to clipboard (Mod+Shift+C)"
        >
          Copy PNG
        </Button>

        <Button
          variant="primary"
          size="xs"
          rounded="lg"
          icon={Download}
          disabled={!hasContent}
          onClick={onDownloadPng}
          title="Download transparent PNG (Mod+S)"
        >
          Download PNG
        </Button>

        {showSvgExport && onDownloadSvg && (
          <Button
            variant="outline"
            size="xs"
            rounded="lg"
            icon={FileCode}
            disabled={!hasContent}
            onClick={onDownloadSvg}
            title="Download scalable vector SVG"
          >
            SVG
          </Button>
        )}
      </div>
    </Surface>
  );
}
