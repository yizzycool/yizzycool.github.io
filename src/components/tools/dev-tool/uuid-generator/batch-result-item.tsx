'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import toast from '@/utils/toast';

type BatchResultItemProps = {
  item: string;
  index: number;
  isClient: boolean;
};

export default function BatchResultItem({
  item,
  index,
  isClient,
}: BatchResultItemProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!isClient || !item) return;
    try {
      await navigator.clipboard.writeText(item);
      setIsCopied(true);
      toast.success('Copied identifier!');
      setTimeout(() => setIsCopied(false), 1500);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="group flex items-center justify-between gap-3 px-3.5 py-2 transition-colors hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40">
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="w-8 shrink-0 text-right font-mono text-xs text-neutral-400">
          {index + 1}.
        </span>
        <code
          onClick={handleCopy}
          className="flex min-h-[1.5rem] cursor-pointer select-all items-center break-all font-mono text-xs text-neutral-800 hover:text-blue-600 sm:text-sm dark:text-neutral-200 dark:hover:text-blue-400"
        >
          {isClient ? (
            item
          ) : (
            <span className="inline-block h-3.5 w-44 animate-pulse rounded bg-neutral-200/80 sm:w-60 dark:bg-neutral-700/80" />
          )}
        </code>
      </div>

      <Button
        variant="ghost"
        size="xs"
        rounded="md"
        disabled={!isClient}
        icon={isCopied ? Check : Copy}
        onClick={handleCopy}
        ariaLabel={`Copy item #${index + 1}`}
        className={cn(
          'shrink-0 opacity-60 group-hover:opacity-100',
          isCopied && 'text-emerald-600 opacity-100 dark:text-emerald-400'
        )}
      />
    </div>
  );
}
