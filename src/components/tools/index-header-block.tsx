'use client';

import { useState } from 'react';
import { Lock, ShieldCheck, Zap, SlidersHorizontal } from 'lucide-react';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { ToolsSettingsModal } from './tools-settings-modal';

export default function HeaderBlock() {
  const { getFadeUpClass } = useGetTransitionClass();
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

        <Button
          variant="ghost"
          bordered
          size="xs"
          rounded="xl"
          icon={SlidersHorizontal}
          onClick={() => setIsSettingsOpen(true)}
          ariaLabel="Tools history and privacy settings"
          title="History & Privacy Settings"
          className={cn(
            'shrink-0 p-2 sm:px-3 sm:py-1.5',
            'backdrop-blur-xs bg-white/50 dark:bg-neutral-900/40',
            'hover:bg-white/80 dark:hover:bg-neutral-800/60'
          )}
        >
          <span className="hidden sm:inline">History & Privacy</span>
        </Button>
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
