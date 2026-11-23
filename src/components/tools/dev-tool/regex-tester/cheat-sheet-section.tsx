'use client';

import { BookOpen } from 'lucide-react';

import LabelBar from '@/components/tools/common/label-bar';
import { cn } from '@/utils/cn';

import { CHEAT_SHEET_CATEGORIES } from './constants';

type Props = {
  compact?: boolean;
  onInsertToken?: (token: string) => void;
};

export default function CheatSheetSection({
  compact = false,
  onInsertToken,
}: Props) {
  return (
    <div className="w-full text-left">
      {!compact && (
        <LabelBar
          icon={BookOpen}
          label="Regex Cheat Sheet"
          description="Quick syntax reference for common regular expression tokens, character classes, and quantifiers."
        />
      )}

      <div
        className={cn(
          'overflow-hidden rounded-xl border border-neutral-200/80 bg-white/70 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/40',
          compact ? 'max-h-[480px] overflow-y-auto p-3.5' : 'p-5'
        )}
      >
        <div
          className={cn(
            'grid grid-cols-1 gap-4',
            !compact && 'sm:grid-cols-2 sm:gap-6'
          )}
        >
          {CHEAT_SHEET_CATEGORIES.map((category) => (
            <div key={category.title} className="flex flex-col">
              <h4 className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {category.title}
              </h4>
              <div className="divide-y divide-neutral-200/60 overflow-hidden rounded-lg border border-neutral-200/70 bg-white/60 dark:divide-neutral-800 dark:border-neutral-800/80 dark:bg-neutral-900/50">
                {category.items.map((item) => (
                  <button
                    key={item.token}
                    type="button"
                    disabled={!onInsertToken}
                    onClick={() => onInsertToken?.(item.token)}
                    title={
                      onInsertToken
                        ? `Insert ${item.label} into pattern`
                        : item.description
                    }
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-2 text-left transition-colors',
                      onInsertToken
                        ? 'cursor-pointer hover:bg-sky-50/70 dark:hover:bg-sky-950/30'
                        : 'cursor-default hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40'
                    )}
                  >
                    <code className="shrink-0 font-mono text-xs font-semibold text-sky-700 dark:text-sky-300">
                      {item.label}
                    </code>
                    <span className="ml-3 truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {item.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
