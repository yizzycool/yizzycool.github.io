'use client';

import type { HotkeyItem } from '@/components/common/badge/hotkey';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { get, invert } from 'lodash';
import { Star, Clock, Keyboard, ShieldCheck, LucideIcon } from 'lucide-react';

import useToolHotkeys from '@/hooks/tools/use-tool-hotkeys';
import useToolsPreferences from '@/hooks/tools/use-tools-preferences';
import { TOOLS_WITH_HISTORY } from './constants';
import Badge from '@/components/common/badge';
import Button from '@/components/common/button';
import {
  ToolDescriptions,
  ToolIcons,
  ToolTitles,
  ToolUrls,
} from '@/data/tools';
import { HistoryItem } from '@/hooks/tools/use-tool-history';
import { ToolHistoryDrawer } from './tool-history-drawer';
import { ToolHotkeysModal } from './tool-hotkeys-modal';

const InvertToolUrls = invert(ToolUrls);

type HeaderBlockProps<T = unknown> = {
  historyList?: HistoryItem<T>[];
  isLoadingHistory?: boolean;
  onRestoreHistory?: (data: T) => void;
  onRenameHistory?: (id: string, newTitle: string) => void;
  onRemoveHistory?: (id: string) => void;
  onClearHistory?: () => void;
  customShortcuts?: HotkeyItem[];
  showPrivacyBadge?: boolean;
};

export default function HeaderBlock<T = unknown>({
  historyList = [],
  isLoadingHistory = false,
  onRestoreHistory,
  onRenameHistory,
  onRemoveHistory,
  onClearHistory,
  customShortcuts,
  showPrivacyBadge = true,
}: HeaderBlockProps<T>) {
  const pathname = usePathname();
  const resolvedToolKey = get(InvertToolUrls, pathname, '');

  const title = get(ToolTitles, resolvedToolKey);
  const desc = get(ToolDescriptions, resolvedToolKey);

  const { isFavorite, toggleFavorite } = useToolsPreferences();
  const favorite = resolvedToolKey ? isFavorite(resolvedToolKey) : false;

  const showHistory = TOOLS_WITH_HISTORY.includes(resolvedToolKey);
  const showHotkey = TOOLS_WITH_HISTORY.includes(resolvedToolKey);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHotkeysOpen, setIsHotkeysOpen] = useState(false);

  useToolHotkeys({
    onHistory: () => {
      if (!showHistory) return;

      setIsHistoryOpen((prev) => !prev);
    },
    onHelp: () => {
      if (!showHotkey) return;

      setIsHotkeysOpen(true);
    },
  });

  return (
    <header className="mb-6">
      <div className="flex flex-col gap-4">
        {/* Top: Icon, Title, Privacy Badge, Description */}
        <div className="flex items-start gap-3.5 text-left text-slate-900 dark:text-slate-200">
          <HeaderIcon toolKey={resolvedToolKey} />
          <div className="space-y-1">
            <div className="flex flex-col flex-wrap gap-2 sm:flex-row sm:items-center">
              {!!title && (
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {title}
                </h1>
              )}
              {showPrivacyBadge && (
                <Badge
                  variant="blue"
                  size="xs"
                  rounded="full"
                  bordered
                  icon={ShieldCheck}
                >
                  100% Private
                </Badge>
              )}
            </div>
            {/* Description for large device */}
            {!!desc && (
              <h2 className="hidden text-xs text-gray-500 sm:block sm:text-sm dark:text-slate-400">
                {desc}
              </h2>
            )}
          </div>
        </div>
        {/* Description for small device */}
        {!!desc && (
          <h2 className="block text-xs text-gray-500 sm:hidden sm:text-sm dark:text-slate-400">
            {desc}
          </h2>
        )}

        {/* Bottom: Universal Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Favorite Button */}
          <Button
            variant={favorite ? 'amber' : 'surface'}
            size="xs"
            rounded="xl"
            icon={Star}
            iconClassName={
              favorite
                ? 'fill-amber-400 text-amber-500 dark:fill-amber-400 dark:text-amber-400'
                : ''
            }
            onClick={() => resolvedToolKey && toggleFavorite(resolvedToolKey)}
            ariaLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {favorite ? 'Favorited' : 'Favorite'}
          </Button>

          {/* 2. History Button with count badge */}
          {showHistory && (
            <Button
              variant="surface"
              size="xs"
              rounded="xl"
              icon={Clock}
              onClick={() => setIsHistoryOpen(true)}
              ariaLabel="View history"
            >
              <span>History</span>
              {historyList.length > 0 && (
                <span className="ml-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                  {historyList.length}
                </span>
              )}
            </Button>
          )}

          {/* 3. Keyboard Shortcuts Button */}
          {showHotkey && (
            <Button
              variant="surface"
              size="xs"
              rounded="xl"
              icon={Keyboard}
              onClick={() => setIsHotkeysOpen(true)}
              ariaLabel="Keyboard shortcuts"
              className="hidden sm:inline-flex"
            >
              Shortcuts
            </Button>
          )}
        </div>
      </div>

      {/* History Drawer */}
      <ToolHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyList={historyList}
        isLoading={isLoadingHistory}
        onRestore={(data) => {
          if (onRestoreHistory) onRestoreHistory(data);
        }}
        onRename={(id, newTitle) => {
          if (onRenameHistory) onRenameHistory(id, newTitle);
        }}
        onRemove={(id) => {
          if (onRemoveHistory) onRemoveHistory(id);
        }}
        onClear={() => {
          if (onClearHistory) onClearHistory();
        }}
      />

      {/* Hotkeys Modal */}
      <ToolHotkeysModal
        isOpen={isHotkeysOpen}
        onClose={() => setIsHotkeysOpen(false)}
        customShortcuts={customShortcuts}
      />
    </header>
  );
}

function HeaderIcon({ toolKey }: { toolKey: string }) {
  const Icon = get(ToolIcons, toolKey) as LucideIcon;

  if (!Icon) return null;

  return (
    <div className="mt-1 shrink-0 rounded-xl bg-blue-600 p-2.5 text-white shadow-lg shadow-blue-600/20">
      <Icon size={24} />
    </div>
  );
}
