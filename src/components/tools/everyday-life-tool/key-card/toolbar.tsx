import { Search, LayoutGrid, Settings, Info } from 'lucide-react';

import { cn } from '@/utils/cn';
import {
  TooltipRoot,
  TooltipTrigger,
  TooltipPopup,
} from '@/components/common/tooltip';
import Input from '@/components/common/input';

type ToolbarProps = {
  mode: 'dashboard' | 'management';
  setMode: (mode: 'dashboard' | 'management') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cardsCount: number;
};

export default function Toolbar({
  mode,
  setMode,
  searchQuery,
  setSearchQuery,
  cardsCount,
}: ToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input in Dashboard mode */}
      {mode === 'dashboard' ? (
        <div className="w-full max-w-md">
          <Input
            type="text"
            placeholder="Search title, tags, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            icon={Search}
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 border border-transparent py-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
          <Settings size={16} />
          <span>Management ({cardsCount} Cards)</span>
          <TooltipRoot>
            <TooltipTrigger>
              <button className="opacity-50">
                <Info size={14} strokeWidth={3} />
              </button>
            </TooltipTrigger>
            <TooltipPopup
              showArrow
              placement="top"
              variant="dark"
              className="max-w-xs px-3.5 py-2.5 leading-relaxed"
            >
              In this mode, you can edit titles, customize comma-separated tags,
              and dynamically manage content versions for each card. Click the
              keyboard button to re-register hotkeys.
            </TooltipPopup>
          </TooltipRoot>
        </div>
      )}

      {/* Action Toggle buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Mode Switcher Tabs */}
        <div className="inline-flex w-full rounded-xl border border-neutral-200/50 bg-neutral-100 p-1 dark:border-neutral-700/50 dark:bg-neutral-800">
          <button
            onClick={() => setMode('dashboard')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 sm:py-1.5',
              mode === 'dashboard'
                ? 'bg-white text-sky-600 shadow-sm dark:bg-neutral-900 dark:text-sky-500'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <LayoutGrid size={14} />
            Dashboard
          </button>
          <button
            onClick={() => setMode('management')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 sm:py-1.5',
              mode === 'management'
                ? 'bg-white text-sky-600 shadow-sm dark:bg-neutral-900 dark:text-sky-500'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <Settings size={14} />
            Management
          </button>
        </div>
      </div>
    </div>
  );
}
