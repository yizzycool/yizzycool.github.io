'use client';

import { BookOpen } from 'lucide-react';
import { BaseDialog, DialogHeader } from '@/components/ui/dialog';
import { CHEAT_SHEET_CATEGORIES } from './constants';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CheatSheetModal({ isOpen, onClose }: Props) {
  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      dialogClassName="flex max-h-[85vh] w-full max-w-2xl flex-col"
    >
      <DialogHeader
        icon={BookOpen}
        title="Regex Cheat Sheet"
        description="Quick syntax reference for regular expressions"
        onClose={onClose}
        closeAriaLabel="Close cheat sheet modal"
        className="mx-6 pt-6"
      />

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto p-6 pt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CHEAT_SHEET_CATEGORIES.map((category) => (
            <div
              key={category.title}
              className="flex flex-col rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-3.5 dark:border-neutral-800/80 dark:bg-neutral-900/40"
            >
              <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {category.title}
              </h4>
              <div className="flex flex-col gap-1.5">
                {category.items.map((item) => (
                  <div
                    key={item.token}
                    className="flex items-center justify-between rounded-lg px-2 py-1 text-xs"
                  >
                    <code className="rounded bg-neutral-200/60 px-1.5 py-0.5 font-mono font-semibold text-slate-800 dark:bg-neutral-800 dark:text-slate-200">
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
    </BaseDialog>
  );
}
