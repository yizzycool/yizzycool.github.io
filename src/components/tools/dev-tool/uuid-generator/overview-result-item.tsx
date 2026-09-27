'use client';

import type { OverviewItem } from './types';

import { useState } from 'react';
import { Check, Copy, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { cn } from '@/utils/cn';
import toast from '@/utils/toast';

type OverviewResultItemProps = {
  item: OverviewItem;
  isClient: boolean;
  onRegenerateSingle: (id: OverviewItem['id']) => void;
};

export default function OverviewResultItem({
  item,
  isClient,
  onRegenerateSingle,
}: OverviewResultItemProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!isClient || !item.value) return;
    try {
      await navigator.clipboard.writeText(item.value);
      setIsCopied(true);
      toast.success(`Copied ${item.name}!`);
      setTimeout(() => setIsCopied(false), 1500);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="group flex flex-col gap-2 p-3 transition-colors hover:bg-neutral-100/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 dark:hover:bg-neutral-800/40">
      {/* Format Name + Info Icon with Tooltip */}
      <div className="flex min-w-[150px] items-center gap-1.5 sm:w-1/4">
        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          {item.name}
        </span>
        <InfoTooltip
          title={item.badge}
          content={item.description}
          ariaLabel={`${item.name} details`}
        />
      </div>

      {/* Value Display */}
      <div className="flex-1 overflow-hidden">
        <code
          onClick={handleCopy}
          title="Click to copy"
          className={cn(
            'flex min-h-[2.25rem] cursor-pointer items-center break-all rounded-lg px-2.5 py-1.5 font-mono text-xs transition-all sm:text-sm',
            'bg-neutral-100/70 text-neutral-800 hover:bg-neutral-200/60',
            'dark:bg-neutral-800/60 dark:text-neutral-100 dark:hover:bg-neutral-700/60'
          )}
        >
          {isClient ? (
            item.value
          ) : (
            <span className="inline-block h-4 w-44 animate-pulse rounded bg-neutral-200/80 sm:w-64 dark:bg-neutral-700/80" />
          )}
        </code>
      </div>

      {/* Actions (Icon-only) */}
      <div className="flex shrink-0 items-center justify-end gap-1.5">
        <Button
          variant="ghost"
          size="xs"
          rounded="lg"
          icon={RefreshCw}
          ariaLabel={`Regenerate ${item.name}`}
          title="Generate new value"
          className="opacity-70 hover:opacity-100"
          onClick={() => onRegenerateSingle(item.id)}
        />
        <Button
          variant={isCopied ? 'success' : 'ghost'}
          size="xs"
          rounded="lg"
          icon={isCopied ? Check : Copy}
          ariaLabel={isCopied ? 'Copied' : `Copy ${item.name}`}
          title={isCopied ? 'Copied' : 'Copy'}
          onClick={handleCopy}
        />
      </div>
    </div>
  );
}
