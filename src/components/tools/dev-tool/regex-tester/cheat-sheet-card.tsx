'use client';

import { BookOpen } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';

import { CHEAT_SHEET_CATEGORIES } from './constants';

export default function CheatSheetCard() {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <CardTitle icon={BookOpen}>Regex Cheat Sheet</CardTitle>
        <span className="text-xs text-slate-400">Quick syntax reference</span>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {CHEAT_SHEET_CATEGORIES.map((category) => (
          <div
            key={category.title}
            className="backdrop-blur-xs flex flex-col rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-3.5 dark:border-neutral-800/80 dark:bg-neutral-900/40"
          >
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {category.title}
            </h4>
            <div className="flex flex-col gap-1.5">
              {category.items.map((item) => (
                <div
                  key={item.token}
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors"
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
    </Card>
  );
}
