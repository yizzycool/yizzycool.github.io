'use client';

import type { LucideIcon } from 'lucide-react';
import type { TransformAction } from './hooks/use-word-counter';

import { Wand2, X } from 'lucide-react';

import BaseDialog from '@/components/common/dialog/base';
import { Button } from '@/components/common/button';

type ToolItem = {
  label: string;
  icon: LucideIcon;
  actionType: TransformAction;
  title: string;
  description: string;
  example?: string;
};

type ToolGroup = {
  name: string;
  items: ToolItem[];
};

type TextToolsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  groups: ToolGroup[];
};

export default function TextToolsModal({
  isOpen,
  onClose,
  groups,
}: TextToolsModalProps) {
  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      className="flex max-h-[85vh] w-full max-w-lg flex-col"
    >
      {/* Header */}
      <div className="mx-6 flex shrink-0 items-center justify-between border-b border-neutral-200 pb-4 pt-6 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-sky-50 p-2 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
            <Wand2 size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Text Tools Guide
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transform and format your text with ease
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="base"
          rounded="full"
          icon={X}
          onClick={onClose}
          ariaLabel="Close tools guide"
          className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
        />
      </div>

      {/* Content List */}
      <div className="flex-1 space-y-4 divide-y divide-neutral-100 overflow-y-auto p-6 pt-4 dark:divide-neutral-800/80">
        {groups.map((group) => (
          <div key={group.name} className="pt-3 first:pt-0">
            <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              <span>{group.name}</span>
            </div>

            <div className="space-y-2.5">
              {group.items.map((item) => (
                <div
                  key={item.actionType}
                  className="flex flex-col gap-1.5 rounded-xl border border-neutral-200/60 bg-neutral-50/50 p-3 transition hover:border-neutral-300 dark:border-neutral-800/60 dark:bg-neutral-900/40 dark:hover:border-neutral-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="shadow-2xs rounded-md bg-white p-1 text-slate-700 dark:bg-neutral-800 dark:text-slate-200">
                        <item.icon size={14} />
                      </div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {item.title}
                      </span>
                    </div>
                    <span className="rounded bg-neutral-200/60 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-neutral-800 dark:text-slate-400">
                      {item.label}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>

                  {item.example && (
                    <div className="rounded-lg border border-neutral-200/50 bg-neutral-100/80 px-2 py-1 font-mono text-[11px] text-slate-700 dark:border-neutral-800/50 dark:bg-neutral-950/70 dark:text-slate-300">
                      {item.example}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </BaseDialog>
  );
}
