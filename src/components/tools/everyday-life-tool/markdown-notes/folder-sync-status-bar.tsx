'use client';

import type { LocalFolderSyncSummary } from './types';

import {
  FolderCheck,
  FolderSync,
  LoaderCircle,
  RefreshCw,
  Unplug,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import { formatRelativeTime } from './utils/markdown-helpers';

type Props = {
  syncState: LocalFolderSyncSummary;
  onReconnect: () => void;
  onSyncNow: () => void;
  onDisconnect: () => void;
};

export default function FolderSyncStatusBar({
  syncState,
  onReconnect,
  onSyncNow,
  onDisconnect,
}: Props) {
  if (
    syncState.status !== 'connected' &&
    syncState.status !== 'needs-permission' &&
    syncState.status !== 'syncing'
  ) {
    return null;
  }

  const isSyncing = syncState.status === 'syncing';
  const needsPermission = syncState.status === 'needs-permission';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-xs backdrop-blur-sm',
        needsPermission
          ? 'border-amber-300/70 bg-amber-50/80 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/35 dark:text-amber-200'
          : 'border-emerald-300/60 bg-emerald-50/75 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-200'
      )}
    >
      {isSyncing ? (
        <LoaderCircle size={13} className="shrink-0 animate-spin" />
      ) : needsPermission ? (
        <FolderSync size={13} className="shrink-0" />
      ) : (
        <FolderCheck size={13} className="shrink-0" />
      )}

      <span className="max-w-[160px] truncate font-medium">
        {syncState.folderName || 'Local Folder'}
      </span>

      {syncState.lastSyncedAt && !needsPermission && (
        <span className="hidden text-[11px] opacity-70 sm:inline">
          · {formatRelativeTime(syncState.lastSyncedAt)}
        </span>
      )}

      {needsPermission ? (
        <Button
          variant="outline"
          size="xs"
          rounded="full"
          onClick={onReconnect}
          className="h-6 px-2 text-[11px]"
        >
          Reconnect
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="xs"
          rounded="full"
          icon={RefreshCw}
          disabled={isSyncing}
          ariaLabel="Sync folder now"
          title="Sync folder now"
          onClick={onSyncNow}
          className="size-6 p-0"
        />
      )}

      <Button
        variant="ghost"
        size="xs"
        rounded="full"
        icon={Unplug}
        ariaLabel="Disconnect sync folder"
        title="Disconnect local folder"
        onClick={onDisconnect}
        className="size-6 p-0 opacity-75 hover:opacity-100"
      />
    </div>
  );
}
