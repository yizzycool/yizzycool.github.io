import type { RefObject } from 'react';

import { Search, LayoutGrid, Settings, Info } from 'lucide-react';

import {
  TooltipRoot,
  TooltipTrigger,
  TooltipPopup,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PillTabs } from '@/components/ui/tabs';
import { HotkeyBadge } from '@/components/ui/badge';

type ToolbarProps = {
  mode: 'dashboard' | 'management';
  setMode: (mode: 'dashboard' | 'management') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cardsCount: number;
  filteredCount: number;
  searchInputRef?: RefObject<HTMLInputElement | null>;
};

export default function Toolbar({
  mode,
  setMode,
  searchQuery,
  setSearchQuery,
  cardsCount,
  filteredCount,
  searchInputRef,
}: ToolbarProps) {
  return (
    <div className="mb-5 flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input in Dashboard mode */}
      {mode === 'dashboard' ? (
        <div className="relative w-full max-w-md">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search title, tags, or markdown content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            icon={Search}
            className="pr-12 text-xs sm:text-sm"
          />
          {!searchQuery && (
            <HotkeyBadge
              size="sm"
              symbol="/"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            />
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 border border-transparent py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <Settings size={20} />
          <span>Card Management ({cardsCount} Cards)</span>
          <TooltipRoot>
            <TooltipTrigger>
              <Button
                size="xs"
                variant="ghost"
                hoverEffect={false}
                icon={Info}
                rounded="full"
                className="cursor-help p-0"
              />
            </TooltipTrigger>
            <TooltipPopup
              showArrow
              placement="top"
              variant="dark"
              className="max-w-xs px-3.5 py-2.5 text-xs leading-relaxed"
            >
              Edit titles, tags, hotkey bindings, and multi-version content.
              Click the hotkey button on any card to register a new shortcut
              key.
            </TooltipPopup>
          </TooltipRoot>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-end">
        <PillTabs
          tabs={['dashboard', 'management']}
          activeTab={mode}
          tabIcons={[LayoutGrid, Settings]}
          tabLabels={{
            dashboard: 'Dashboard',
            management: 'Manage',
          }}
          tabBadges={{
            dashboard:
              mode === 'dashboard' && filteredCount !== cardsCount ? (
                <span className="rounded-full bg-sky-100 px-1.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  {filteredCount}
                </span>
              ) : null,
          }}
          variant="segment"
          size="xs"
          rounded="base"
          onChange={(tab) => setMode(tab as 'dashboard' | 'management')}
        />
      </div>
    </div>
  );
}
