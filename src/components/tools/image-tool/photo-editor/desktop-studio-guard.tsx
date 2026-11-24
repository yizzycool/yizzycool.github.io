'use client';

import Link from 'next/link';
import {
  Check,
  Copy,
  Layers,
  Monitor,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { ToolKeys, ToolUrls } from '@/data/tools';
import toast from '@/utils/toast';

/**
 * SEO-safe mobile and narrow-screen guard displayed below `lg`.
 * Keeps HeaderBlock and AboutBlock indexed while guiding users to Desktop Pro or mobile PicMerge Studio.
 */
export default function DesktopStudioGuard() {
  const [copied, setCopied] = useState(false);

  const handleCopyDesktopLink = async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Copied link to open on desktop');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Unable to copy link automatically');
    }
  };

  return (
    <div className="lg:hidden">
      <Surface
        variant="glass"
        className="flex flex-col items-center rounded-2xl border border-neutral-200/80 px-5 py-8 text-center dark:border-neutral-800/80"
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">
          <Monitor className="h-7 w-7" />
        </div>

        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          Desktop Workspace Recommended
        </h2>

        <p className="mt-2 max-w-md text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          Photo Editor Studio is engineered for desktop monitors with
          multi-layer compositing, 16 blend modes, WebGL color grading, vector
          shapes, and portable `.pes` projects.
        </p>

        <div className="mt-5 grid w-full max-w-sm grid-cols-1 gap-2.5 text-left text-xs text-neutral-600 dark:text-neutral-300">
          <div className="flex items-center gap-2.5 rounded-xl bg-white/80 px-3 py-2.5 dark:bg-neutral-900/70">
            <Layers className="h-4 w-4 shrink-0 text-sky-500" />
            <span>
              Full layer stack, blend modes, clipping masks &amp; groups
            </span>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-white/80 px-3 py-2.5 dark:bg-neutral-900/70">
            <Sparkles className="h-4 w-4 shrink-0 text-sky-500" />
            <span>100% private local WebGL filters &amp; high-DPI export</span>
          </div>
        </div>

        <div className="mt-6 flex w-full max-w-sm flex-col gap-2.5">
          <Button
            variant="primary"
            size="sm"
            rounded="xl"
            icon={copied ? Check : Copy}
            onClick={() => void handleCopyDesktopLink()}
            className="w-full font-semibold"
          >
            {copied
              ? 'Link Copied for Desktop'
              : 'Copy Link to Open on Desktop'}
          </Button>

          <Link
            href={
              ToolUrls[ToolKeys.picMergeStudio] ||
              '/tools/image-tool/pic-merge-studio'
            }
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Smartphone className="h-3.5 w-3.5 text-sky-500" />
            <span>Quick Mobile Edit &amp; Collage: PicMerge Studio</span>
          </Link>
        </div>
      </Surface>
    </div>
  );
}
