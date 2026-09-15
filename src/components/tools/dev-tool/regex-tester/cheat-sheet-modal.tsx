'use client';

import { BookOpen, X } from 'lucide-react';
import { BaseDialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
      {/* Header */}
      <div className="mx-6 flex shrink-0 items-center justify-between border-b border-neutral-200 pb-4 pt-6 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-neutral-800 dark:text-slate-300">
            <BookOpen size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Regex Cheat Sheet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quick syntax reference for regular expressions
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="base"
          rounded="full"
          icon={X}
          onClick={onClose}
          ariaLabel="Close cheat sheet modal"
          className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
        />
      </div>

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
