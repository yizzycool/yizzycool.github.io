'use client';

import { Lock, ShieldCheck, Zap } from 'lucide-react';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { cn } from '@/utils/cn';

export default function HeaderBlock() {
  const { getFadeUpClass } = useGetTransitionClass();

  const trustBadges = [
    { icon: Lock, label: '100% Client-side Privacy' },
    { icon: ShieldCheck, label: 'No Server Upload' },
    { icon: Zap, label: 'Free & Instant' },
  ];

  return (
    <div className="text-center md:text-left">
      <h1
        className={cn(
          'text-3xl font-black tracking-tight md:text-4xl',
          'text-slate-900 dark:text-white',
          getFadeUpClass('animate-delay-100')
        )}
      >
        Tools Directory
      </h1>
      <p
        className={cn(
          'mt-3 text-lg font-light text-slate-500 dark:text-slate-400',
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
    </div>
  );
}
