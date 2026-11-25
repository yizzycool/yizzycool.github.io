'use client';

import { Copy, LogOut, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import toast from '@/utils/toast';

type DemoModeBannerProps = {
  toolName: string;
  onExitDemo?: () => void;
};

export default function DemoModeBanner({
  toolName,
  onExitDemo,
}: DemoModeBannerProps) {
  const handleCopyDesktopLink = async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Copied link for Chrome Desktop');
    } catch {
      toast.error('Failed to copy page URL');
    }
  };

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-200/80 bg-sky-50/75 px-4 py-3 text-left backdrop-blur-md dark:border-sky-900/60 dark:bg-sky-950/35">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
          <Sparkles size={16} />
        </div>
        <div className="min-w-0 space-y-0.5 text-xs">
          <div className="font-semibold text-sky-950 dark:text-sky-100">
            Interactive Demo Mode — Simulated {toolName} Output
          </div>
          <p className="leading-relaxed text-slate-600 dark:text-slate-300">
            Your browser does not currently expose Chrome Built-in Gemini Nano.
            Try the interactive presets below, or open this URL on Chrome
            Desktop 128+ for real local inference.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="xs"
          rounded="lg"
          icon={Copy}
          onClick={() => void handleCopyDesktopLink()}
        >
          Copy Link for Chrome Desktop
        </Button>
        {onExitDemo && (
          <Button
            variant="ghost"
            size="xs"
            rounded="lg"
            icon={LogOut}
            onClick={onExitDemo}
          >
            Requirements
          </Button>
        )}
      </div>
    </div>
  );
}
