'use client';

import type { ReactNode } from 'react';
import type { DropdownItemType } from '@/components/ui/dropdown';
import type {
  LocalFolderSyncSummary,
  NoteLabelSummary,
  NotesLayoutMode,
  NotesViewScope,
} from './types';

import {
  Archive,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  FileArchive,
  FileText,
  FolderInput,
  FolderSync,
  Info,
  LayoutGrid,
  RefreshCw,
  RotateCcw,
  Rows3,
  StickyNote,
  Trash2,
  Upload,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Dropdown } from '@/components/ui/dropdown';
import { SearchInput } from '@/components/ui/input';
import { PillTabs } from '@/components/ui/tabs';

import FolderSyncStatusBar from './folder-sync-status-bar';
import LabelFilterChip from './label-filter-chip';

type Props = {
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  viewScope: NotesViewScope;
  onViewScopeChange: (scope: NotesViewScope) => void;
  scopeCounts: {
    active: number;
    archived: number;
    trash: number;
  };
  layout: NotesLayoutMode;
  onToggleLayout: () => void;
  revealAllSpoilers: boolean;
  onToggleRevealAllSpoilers: () => void;
  allLabels: NoteLabelSummary[];
  selectedLabel: string | null;
  onSelectLabel: (label: string | null) => void;
  folderSync: LocalFolderSyncSummary;
  onConnectFolder: () => void;
  onReconnectFolder: () => void;
  onSyncFolderNow: () => void;
  onDisconnectFolder: () => void;
  onOpenGuideModal: () => void;
  onOpenImportModal: () => void;
  onExportMarkdownZip: () => void;
  onExportJsonBackup: () => void;
  onTriggerRestoreJson: () => void;
};

const SCOPE_TABS: NotesViewScope[] = ['active', 'archived', 'trash'];

export default function NotesToolbar({
  searchInputRef,
  searchQuery,
  onSearchChange,
  viewScope,
  onViewScopeChange,
  scopeCounts,
  layout,
  onToggleLayout,
  revealAllSpoilers,
  onToggleRevealAllSpoilers,
  allLabels,
  selectedLabel,
  onSelectLabel,
  folderSync,
  onConnectFolder,
  onReconnectFolder,
  onSyncFolderNow,
  onDisconnectFolder,
  onOpenGuideModal,
  onOpenImportModal,
  onExportMarkdownZip,
  onExportJsonBackup,
  onTriggerRestoreJson,
}: Props) {
  const scopeLabels: Record<NotesViewScope, string> = {
    active: 'Notes',
    archived: 'Archived',
    trash: 'Trash',
  };

  const renderScopeBadge = (scope: NotesViewScope): ReactNode => {
    const count = scopeCounts[scope];
    if (count <= 0) return null;
    return (
      <span className="rounded-full bg-black/[0.06] px-1.5 py-px text-[10px] font-semibold tabular-nums leading-tight dark:bg-white/[0.09]">
        {count}
      </span>
    );
  };

  const scopeIcons: Record<NotesViewScope, typeof StickyNote> = {
    active: StickyNote,
    archived: Archive,
    trash: Trash2,
  };

  const folderSyncItems: DropdownItemType[] = !folderSync.isSupported
    ? []
    : folderSync.status === 'connected' || folderSync.status === 'syncing'
      ? [
          {
            id: 'sync-folder-now',
            label: 'Sync Local Folder Now',
            icon: RefreshCw,
            onClick: onSyncFolderNow,
          },
          {
            id: 'switch-sync-folder',
            label: 'Switch Sync Folder...',
            icon: FolderSync,
            onClick: onConnectFolder,
          },
        ]
      : folderSync.status === 'needs-permission'
        ? [
            {
              id: 'reconnect-sync-folder',
              label: 'Reconnect Sync Folder',
              icon: RefreshCw,
              onClick: onReconnectFolder,
            },
            {
              id: 'switch-sync-folder',
              label: 'Choose Another Folder...',
              icon: FolderSync,
              onClick: onConnectFolder,
            },
          ]
        : [
            {
              id: 'connect-sync-folder',
              label: 'Sync Local Folder (.md)...',
              icon: FolderSync,
              onClick: onConnectFolder,
            },
          ];

  const hasSyncBar =
    folderSync.status === 'connected' ||
    folderSync.status === 'needs-permission' ||
    folderSync.status === 'syncing';
  const showLabelsStrip = viewScope === 'active' && allLabels.length > 0;

  return (
    <div className="space-y-3">
      {/* Unified Single-Row Glass Command Bar */}
      <div className="shadow-2xs flex flex-col gap-2 rounded-2xl border border-neutral-200/80 bg-white/75 p-1.5 backdrop-blur-md md:flex-row md:items-center md:gap-2 dark:border-neutral-800/90 dark:bg-neutral-900/65">
        {/* Zone 1: Scope Tabs */}
        <div className="shrink-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <PillTabs<NotesViewScope>
            tabs={SCOPE_TABS}
            activeTab={viewScope}
            tabLabels={scopeLabels}
            tabBadges={renderScopeBadge}
            tabIcons={scopeIcons}
            onChange={onViewScopeChange}
            size="xs"
            rounded="lg"
            variant="segment"
            className="border-0 bg-neutral-100/75 p-0.5 dark:bg-neutral-800/70"
            tabClassName="h-8 whitespace-nowrap px-2.5 py-0"
          />
        </div>

        <span
          aria-hidden="true"
          className="hidden h-5 w-px shrink-0 bg-neutral-200/80 md:block dark:bg-neutral-800"
        />

        {/* Zone 2: Seamless Flex Search Input */}
        <div className="min-w-0 flex-1">
          <SearchInput
            inputRef={searchInputRef}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange('')}
            hotkey="/"
            placeholder="Search notes or #labels..."
            className="h-9 rounded-xl border-transparent bg-transparent py-0 text-xs shadow-none focus:border-sky-500/40 focus:bg-white/90 dark:border-transparent dark:bg-transparent dark:focus:border-sky-400/40 dark:focus:bg-neutral-900/90"
          />
        </div>

        <span
          aria-hidden="true"
          className="hidden h-5 w-px shrink-0 bg-neutral-200/80 md:block dark:bg-neutral-800"
        />

        {/* Zone 3: Icon View Controls + Import/Export */}
        <div className="flex shrink-0 items-center justify-end gap-1">
          <Button
            variant={revealAllSpoilers ? 'primary' : 'ghost'}
            size="xs"
            rounded="xl"
            icon={revealAllSpoilers ? EyeOff : Eye}
            className="size-8 p-0"
            onClick={onToggleRevealAllSpoilers}
            ariaLabel={
              revealAllSpoilers
                ? 'Hide all spoiler answers'
                : 'Reveal all spoiler answers'
            }
            title={
              revealAllSpoilers
                ? 'Hide all spoiler answers'
                : 'Reveal all spoiler answers'
            }
          />

          <Button
            variant="ghost"
            size="xs"
            rounded="xl"
            icon={layout === 'masonry' ? Rows3 : LayoutGrid}
            className="size-8 p-0"
            onClick={onToggleLayout}
            ariaLabel={
              layout === 'masonry'
                ? 'Switch to single-column list'
                : 'Switch to masonry grid'
            }
            title={
              layout === 'masonry'
                ? 'Switch to single-column list'
                : 'Switch to masonry grid'
            }
          />

          <Button
            variant="ghost"
            size="xs"
            rounded="xl"
            icon={Info}
            className="size-8 p-0"
            onClick={onOpenGuideModal}
            ariaLabel="Markdown Notes guide and syntax"
            title="Usage guide & Markdown syntax"
          />

          <span
            aria-hidden="true"
            className="mx-0.5 h-4 w-px bg-neutral-200/80 dark:bg-neutral-800"
          />

          <Dropdown
            placement="bottom end"
            menuClassName="min-w-[235px]"
            items={[
              {
                id: 'import-keep',
                label: 'Import Google Keep (.zip / .json)',
                icon: Upload,
                onClick: onOpenImportModal,
              },
              {
                id: 'import-md',
                label: 'Import Markdown Files (.md)',
                icon: FileText,
                onClick: onOpenImportModal,
              },
              {
                id: 'export-md-zip',
                label: 'Export All as Markdown (.zip)',
                icon: FileArchive,
                onClick: onExportMarkdownZip,
              },
              {
                id: 'export-json',
                label: 'Download JSON Backup',
                icon: Download,
                onClick: onExportJsonBackup,
              },
              {
                id: 'restore-json',
                label: 'Restore JSON Backup',
                icon: RotateCcw,
                onClick: onTriggerRestoreJson,
              },
              ...folderSyncItems,
            ]}
            trigger={
              <Button
                variant="outline"
                size="xs"
                rounded="xl"
                icon={FolderInput}
                className="h-8 whitespace-nowrap border-neutral-200/80 bg-neutral-100/60 px-2.5 text-slate-700 hover:bg-neutral-200/60 dark:border-neutral-700/80 dark:bg-neutral-800/70 dark:text-slate-200 dark:hover:bg-neutral-800"
              >
                <span>Import / Export</span>
                <ChevronDown size={12} className="opacity-60" />
              </Button>
            }
          />
        </div>
      </div>

      {/* Single-Row Scrollable Label Filter Chips & Folder Sync Status */}
      {(showLabelsStrip || hasSyncBar) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {showLabelsStrip ? (
            <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Chip
                size="xs"
                selected={selectedLabel === null}
                onClick={() => onSelectLabel(null)}
                className="shrink-0"
              >
                All Notes
              </Chip>
              {allLabels.map((summary) => (
                <LabelFilterChip
                  key={summary.name}
                  summary={summary}
                  selected={selectedLabel === summary.name}
                  onSelect={(name) =>
                    onSelectLabel(selectedLabel === name ? null : name)
                  }
                />
              ))}
            </div>
          ) : (
            <div />
          )}

          <FolderSyncStatusBar
            syncState={folderSync}
            onReconnect={onReconnectFolder}
            onSyncNow={onSyncFolderNow}
            onDisconnect={onDisconnectFolder}
          />
        </div>
      )}
    </div>
  );
}
