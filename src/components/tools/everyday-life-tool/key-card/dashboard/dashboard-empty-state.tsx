import { Keyboard, Settings, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

type DashboardEmptyStateProps = {
  hasFilters: boolean;
  onClearFilters: () => void;
  onGoToManagement: () => void;
};

export function DashboardEmptyState({
  hasFilters,
  onClearFilters,
  onGoToManagement,
}: DashboardEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border-2 border-dashed py-20 text-center',
        'border-neutral-200/80 bg-white/40 dark:border-neutral-800/80 dark:bg-neutral-900/20'
      )}
    >
      <div className="mb-4 rounded-2xl bg-neutral-100 p-4 text-slate-400 dark:bg-neutral-800 dark:text-slate-500">
        <Keyboard size={36} />
      </div>
      <p className="text-base font-bold text-slate-700 dark:text-slate-300">
        {hasFilters
          ? 'No matching cheat sheets found'
          : 'Your card library is currently empty'}
      </p>
      <p className="mt-1 max-w-sm text-xs text-slate-400 dark:text-slate-500">
        {hasFilters
          ? 'Try changing keywords or clearing your active tag filter.'
          : 'Switch to management mode to create your custom snippet cards.'}
      </p>

      <div className="mt-5 flex items-center gap-3">
        {hasFilters ? (
          <Button
            variant="outline"
            size="sm"
            rounded="xl"
            icon={RotateCcw}
            className="text-xs font-medium"
            onClick={onClearFilters}
          >
            Clear All Filters
          </Button>
        ) : (
          <Button
            size="sm"
            rounded="xl"
            icon={Settings}
            className="shadow-xs font-semibold"
            onClick={onGoToManagement}
          >
            Go to Management to Add Cards
          </Button>
        )}
      </div>
    </div>
  );
}
