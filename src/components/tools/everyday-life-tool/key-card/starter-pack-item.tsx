'use client';

import type { StarterPack } from './starter-packs';

import { PackagePlus } from 'lucide-react';

import { Button } from '@/components/ui/button';

type Props = {
  pack: StarterPack;
  onImport: (pack: StarterPack) => void;
};

/**
 * Single starter cheat-sheet pack row inside StarterPacksModal.
 */
export default function StarterPackItem({ pack, onImport }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3.5 transition-colors hover:border-sky-300/80 dark:border-neutral-800/80 dark:bg-neutral-900/50 dark:hover:border-sky-700/70">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            {pack.name}
          </span>
          <span className="shrink-0 rounded-full bg-sky-100/80 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
            {pack.badge}
          </span>
        </div>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {pack.description}
        </p>
      </div>

      <Button
        variant="secondary"
        size="xs"
        bordered
        icon={PackagePlus}
        onClick={() => onImport(pack)}
        className="shrink-0 whitespace-nowrap"
      >
        Import
      </Button>
    </div>
  );
}
