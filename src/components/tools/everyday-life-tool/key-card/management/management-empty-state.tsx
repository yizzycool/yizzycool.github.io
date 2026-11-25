import { Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

export function ManagementEmptyState() {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border-2 border-dashed py-20 text-center',
        'border-neutral-200/80 bg-white/40 dark:border-neutral-800/80 dark:bg-neutral-900/20'
      )}
    >
      <div className="mb-4 rounded-2xl bg-neutral-100 p-4 text-slate-400 dark:bg-neutral-800 dark:text-slate-500">
        <Plus size={36} />
      </div>
      <p className="text-base font-bold text-slate-700 dark:text-slate-300">
        No cards in management
      </p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
        Click &ldquo;Add Card&rdquo; above to create your first cheat sheet!
      </p>
    </div>
  );
}
