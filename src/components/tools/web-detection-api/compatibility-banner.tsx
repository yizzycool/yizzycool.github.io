'use client';

import type { UnsupportedApiType } from './data/unsupported-types';

import {
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import { WEB_DETECT_API_NAMES } from './data/unsupported-types';

type CompatibilityBannerProps = {
  apiType: UnsupportedApiType;
  usingJsFallback?: boolean;
  usingOcrFallback?: boolean;
  onTrySample?: () => void;
};

export default function CompatibilityBanner({
  apiType,
  usingJsFallback = false,
  usingOcrFallback = false,
  onTrySample,
}: CompatibilityBannerProps) {
  const apiName = WEB_DETECT_API_NAMES[apiType];
  const hasFallbackEngine = usingJsFallback || usingOcrFallback;

  const title = usingOcrFallback
    ? 'On-Device OCR Active (Tesseract.js WASM) — Full Text Extraction Enabled'
    : usingJsFallback
      ? 'Compatibility Mode Active — Built-in JS QR Decoder Enabled'
      : `Native ${apiName} API Unavailable in This Browser`;

  const description = usingOcrFallback
    ? 'Native browser TextDetector is unavailable or omits decoded text on desktop macOS (CoreImage). Tesseract.js extracts readable text 100% locally in your browser; the first run caches language data on-device.'
    : usingJsFallback
      ? 'Your browser lacks native BarcodeDetector hardware acceleration. QR Code scanning works locally across images, video, and webcam via our pure-JS fallback.'
      : 'Shape Detection API requires Chrome on macOS, ChromeOS, or Android with experimental web platform features. Use an interactive sample below to preview the full workflow.';

  return (
    <div
      className={cn(
        'mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left backdrop-blur-md',
        hasFallbackEngine
          ? 'border-sky-200/80 bg-sky-50/75 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/35 dark:text-sky-100'
          : 'border-amber-200/80 bg-amber-50/80 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/35 dark:text-amber-100'
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div
          className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
            hasFallbackEngine
              ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
          )}
        >
          {hasFallbackEngine ? (
            <ShieldCheck size={17} />
          ) : (
            <AlertTriangle size={17} />
          )}
        </div>

        <div className="min-w-0 space-y-0.5 text-xs">
          <div className="font-semibold">{title}</div>
          <p className="leading-relaxed text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {onTrySample && (
          <Button
            variant="primary"
            size="xs"
            rounded="lg"
            icon={Sparkles}
            onClick={onTrySample}
          >
            Load Sample
          </Button>
        )}

        <a
          href="https://developer.chrome.com/docs/capabilities/shape-detection"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="xs" rounded="lg" icon={ExternalLink}>
            API Docs
          </Button>
        </a>
      </div>
    </div>
  );
}
