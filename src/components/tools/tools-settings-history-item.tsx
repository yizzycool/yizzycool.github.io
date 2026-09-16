'use client';

import type { LucideIcon } from 'lucide-react';

import { cn } from '@/utils/cn';
import { Switch } from '@/components/ui/switch';
import { ToolTitles, ToolIcons } from '@/data/tools';

export interface ToolsSettingsHistoryItemProps {
  toolKey: string;
  isGlobalHistoryPaused: boolean;
  isEnabled: boolean;
  onToggle: (checked: boolean) => void;
}

export function ToolsSettingsHistoryItem({
  toolKey,
  isGlobalHistoryPaused,
  isEnabled,
  onToggle,
}: ToolsSettingsHistoryItemProps) {
  const Icon = (ToolIcons as Record<string, LucideIcon | undefined>)[toolKey];
  const title =
    (ToolTitles as Record<string, string | undefined>)[toolKey] || toolKey;
  const switchChecked = !isGlobalHistoryPaused && isEnabled;

  return (
    <div
      className={cn(
        'flex items-center justify-between py-2 transition-colors',
        isGlobalHistoryPaused && 'opacity-50'
      )}
    >
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-md',
              'bg-slate-200/70 text-slate-700',
              'dark:bg-slate-800 dark:text-slate-300'
            )}
          >
            <Icon size={13} />
          </div>
        )}
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {title}
        </span>
      </div>
      <Switch
        size="sm"
        checked={switchChecked}
        disabled={isGlobalHistoryPaused}
        onChange={onToggle}
        aria-label={`Toggle history for ${title}`}
      />
    </div>
  );
}

export default ToolsSettingsHistoryItem;
