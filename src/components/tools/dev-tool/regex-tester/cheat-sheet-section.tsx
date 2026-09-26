'use client';

import { BookOpen } from 'lucide-react';

import LabelBar from '@/components/tools/common/label-bar';

import { CHEAT_SHEET_CATEGORIES } from './constants';

export default function CheatSheetSection() {
  return (
    <div className="w-full text-left">
      <LabelBar
        icon={BookOpen}
        label="Regex Cheat Sheet"
        description="Quick syntax reference for common regular expression tokens, character classes, and quantifiers."
      />

      <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white/70 p-5 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {CHEAT_SHEET_CATEGORIES.map((category) => (
            <div key={category.title} className="flex flex-col">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {category.title}
              </h4>
              <div className="divide-y divide-neutral-200/60 overflow-hidden rounded-lg border border-neutral-200/70 bg-white/60 dark:divide-neutral-800 dark:border-neutral-800/80 dark:bg-neutral-900/50">
                {category.items.map((item) => (
                  <div
                    key={item.token}
                    className="flex items-center justify-between px-3 py-2 transition-colors hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40"
                  >
                    <code className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {item.label}
                    </code>
                    <span className="ml-2 truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {item.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
