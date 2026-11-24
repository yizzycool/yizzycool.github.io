'use client';

import { useState } from 'react';
import { Lock, Settings, ShieldCheck, Zap } from 'lucide-react';

import {
  TooltipPopup,
  TooltipRoot,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import useToolsPreferences from '@/hooks/tools/use-tools-preferences';
import { cn } from '@/utils/cn';
import { ToolsSettingsModal } from './tools-settings-modal';

export default function HeaderBlock() {
  const { getFadeUpClass } = useGetTransitionClass();
  const { isGlobalHistoryPaused } = useToolsPreferences();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const trustBadges = [
    { icon: Lock, label: '100% Client-side Privacy' },
    { icon: ShieldCheck, label: 'No Server Upload' },
    { icon: Zap, label: 'Free & Instant' },
  ];

  return (
    <div className="text-left">
      {/* Title & Action Row */}
      <div
        className={cn(
          'flex items-center justify-between gap-4',
          getFadeUpClass('animate-delay-100')
        )}
      >
        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl dark:text-white">
          Tools Directory
        </h1>

        <TooltipRoot delay={{ open: 200, close: 100 }}>
          <TooltipTrigger>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label={
                isGlobalHistoryPaused
                  ? 'History paused — open history and privacy settings'
                  : 'History and privacy settings'
              }
              className={cn(
                'group relative inline-flex size-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-200',
                'border-slate-200/90 bg-white/85 text-slate-600 shadow-sm shadow-slate-900/5 backdrop-blur-md',
                'hover:border-slate-300 hover:bg-white hover:text-slate-900 hover:shadow',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60',
                'dark:border-neutral-700/80 dark:bg-neutral-900/80 dark:text-slate-300 dark:shadow-black/30',
                'dark:hover:border-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-white'
              )}
            >
              <Settings
                size={18}
                strokeWidth={1.85}
                className="transition-transform duration-300 group-hover:rotate-45"
              />
              {isGlobalHistoryPaused && (
                <span
                  aria-hidden="true"
                  className="absolute right-1.5 top-1.5 size-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-neutral-900"
                />
              )}
            </button>
          </TooltipTrigger>
          <TooltipPopup
            placement="bottom-end"
            className="flex items-center gap-2 whitespace-nowrap px-2.5 py-1.5"
          >
            {isGlobalHistoryPaused ? (
              <>
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-amber-500"
                />
                <span>History Paused · Settings</span>
              </>
            ) : (
              <span>History &amp; Privacy</span>
            )}
          </TooltipPopup>
        </TooltipRoot>
      </div>

      {/* Description */}
      <p
        className={cn(
          'mt-3 max-w-2xl text-base font-light text-slate-500 sm:text-lg dark:text-slate-400',
          getFadeUpClass('animate-delay-200')
        )}
      >
        A completely free toolkit featuring everyday utilities, an image editor,
        developer tools, and a built-in Chrome AI assistant.
      </p>

      {/* Trust Badges Bar */}
      <div
        className={cn(
          'mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3',
          getFadeUpClass('animate-delay-300')
        )}
      >
        {trustBadges.map((badge) => (
          <div
            key={badge.label}
            className={cn(
              'shadow-xs inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              'border-slate-200 bg-white/70 text-slate-700',
              'dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-slate-300'
            )}
          >
            <badge.icon className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" />
            <span>{badge.label}</span>
          </div>
        ))}
      </div>

      {/* Preferences & Privacy Modal */}
      <ToolsSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
