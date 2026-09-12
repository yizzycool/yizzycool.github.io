'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  RotateCcw,
  X,
  FileText,
  Image as ImageIcon,
  Pencil,
  Check,
  ShieldCheck,
  PauseCircle,
} from 'lucide-react';

import { cn } from '@/utils/cn';
import { toast } from '@/utils/toast';
import { HistoryItem } from '@/hooks/tools/use-tool-history';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { DeleteAction } from '@/components/shared/action-button';

export interface ToolHistoryDrawerProps<T = unknown> {
  isOpen: boolean;
  onClose: () => void;
  historyList: HistoryItem<T>[];
  isLoading?: boolean;
  isHistoryEnabled?: boolean;
  onToggleHistoryEnabled?: (enabled: boolean) => void;
  onRestore: (data: T) => void;
  onRename?: (id: string, newTitle: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onClearAll?: () => void;
}

export function ToolHistoryDrawer<T>({
  isOpen,
  onClose,
  historyList,
  isLoading = false,
  isHistoryEnabled = true,
  onToggleHistoryEnabled,
  onRestore,
  onRename,
  onRemove,
  onClear,
  onClearAll,
}: ToolHistoryDrawerProps<T>) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isWipeAllConfirmOpen, setIsWipeAllConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleStartEdit = (item: HistoryItem<T>) => {
    setEditingId(item.id);
    setEditTitle(item.title || '');
  };

  const handleSaveEdit = (id: string) => {
    if (onRename) {
      onRename(id, editTitle);
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleWipeAll = () => {
    if (onClearAll) {
      onClearAll();
      toast.success('All tool history snapshots have been wiped');
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      side="right"
      drawerClassName="flex h-full w-[380px] max-w-[90vw] flex-col border-l border-slate-200 bg-white p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              History
            </h3>
            <span className="text-xs text-slate-400">
              {historyList.length} snapshot{historyList.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="base"
          rounded="full"
          icon={X}
          iconClassName="transition-transform duration-300 group-hover:rotate-90"
          onClick={onClose}
          ariaLabel="Close history"
        />
      </div>

      {/* Sub-bar: Record switch */}
      {onToggleHistoryEnabled && (
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Record History
          </span>
          <Switch
            size="xs"
            checked={isHistoryEnabled}
            onChange={(checked) => onToggleHistoryEnabled(checked)}
            aria-label="Toggle history recording"
          />
        </div>
      )}

      {/* Paused alert banner if disabled */}
      {!isHistoryEnabled && (
        <div className="flex items-center gap-2 border-b border-amber-200/60 bg-amber-50/80 px-4 py-2 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          <PauseCircle
            size={14}
            className="shrink-0 text-amber-600 dark:text-amber-400"
          />
          <span>
            History recording is paused. New actions will not be saved.
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading ? (
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/60"
              />
            ))}
          </div>
        ) : historyList.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center text-slate-400">
            <div className="mb-3 rounded-full bg-slate-100 p-3 dark:bg-slate-800">
              {!isHistoryEnabled ? (
                <PauseCircle size={28} className="text-amber-500/70" />
              ) : (
                <Clock size={28} className="opacity-40" />
              )}
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {!isHistoryEnabled
                ? 'Recording is paused'
                : 'No history records yet'}
            </p>
            <p className="mt-1 max-w-[240px] text-xs text-slate-400">
              {!isHistoryEnabled
                ? 'New snapshots are not being saved. Switch "Record History" back on anytime.'
                : 'Snapshots will be saved automatically when you process or convert'}
            </p>
          </div>
        ) : (
          historyList.map((item) => (
            <div
              key={item.id}
              className="shadow-2xs hover:shadow-xs group relative rounded-xl border border-neutral-200/90 bg-white/80 p-3.5 backdrop-blur-md transition-all hover:border-sky-500/50 hover:bg-white dark:border-neutral-800 dark:bg-neutral-900/60 dark:hover:border-sky-500/50 dark:hover:bg-neutral-900"
            >
              {/* Card Title & Edit Row */}
              {editingId === item.id ? (
                <div className="mb-2 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(item.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    placeholder="Enter snapshot name..."
                    autoFocus
                    className="w-full rounded-lg border border-sky-500/80 bg-white px-2.5 py-1 text-xs text-slate-800 outline-none ring-2 ring-sky-500/20 dark:border-sky-500/80 dark:bg-neutral-800 dark:text-slate-100"
                  />
                  <button
                    onClick={() => handleSaveEdit(item.id)}
                    className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    title="Save name"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Cancel"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span
                      className={cn(
                        'truncate text-sm font-semibold text-slate-800 dark:text-slate-200',
                        !item.title && 'opacity-50'
                      )}
                    >
                      {item.title || 'Untitled'}
                    </span>
                    {onRename && (
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="rounded p-1 opacity-0 transition hover:bg-slate-200 hover:text-slate-700 group-hover:opacity-100 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                        title={
                          item.title ? 'Rename snapshot' : 'Name this snapshot'
                        }
                      >
                        <Pencil size={11} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <DeleteAction
                      size="xs"
                      display="icon"
                      variant="ghost"
                      rounded="full"
                      onClick={() => onRemove(item.id)}
                    />
                  </div>
                </div>
              )}

              {/* Preview image thumbnail if available */}
              {item.previewImage && (
                <div className="mb-2 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewImage}
                    alt="Thumbnail"
                    className="max-h-24 w-full rounded object-contain"
                  />
                </div>
              )}

              {/* Preview text */}
              <div className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                {item.previewImage ? (
                  <ImageIcon
                    size={13}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />
                ) : (
                  <FileText
                    size={13}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />
                )}
                <p className="line-clamp-2 break-all font-mono leading-relaxed">
                  {item.preview}
                </p>
              </div>

              {/* Restore button */}
              <button
                onClick={() => {
                  onRestore(item.data);
                  onClose();
                }}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-medium text-blue-600 shadow-sm transition hover:border-blue-500 hover:bg-blue-600 hover:text-white dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400 dark:hover:border-blue-500 dark:hover:bg-blue-600 dark:hover:text-white"
              >
                <RotateCcw size={13} />
                Restore Snapshot
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-1.5 border-t border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800/80 dark:bg-slate-900/60">
        {historyList.length > 0 && (
          <DeleteAction
            variant="error"
            size="base"
            rounded="xl"
            bordered
            onClick={() => setIsConfirmOpen(true)}
            className="text-xs"
            label="Clear This Tool's History"
          />
        )}

        {onClearAll && (
          <Button
            variant="ghost"
            size="base"
            rounded="xl"
            onClick={() => setIsWipeAllConfirmOpen(true)}
            className={cn(
              'underline underline-offset-4',
              'w-full border-transparent py-1 text-[11px] font-normal transition-colors',
              'text-slate-400 hover:bg-rose-50/50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-rose-950/20 dark:hover:text-rose-400'
            )}
          >
            Wipe All Tools History
          </Button>
        )}

        {/* Privacy Note */}
        <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-400 dark:text-slate-500">
          <ShieldCheck
            size={13}
            className="shrink-0 text-slate-400 dark:text-slate-500"
          />
          <span>All data is stored locally and never sent to any server</span>
        </div>
      </div>

      {/* Confirm Clear All for current tool */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onClear}
        title="Clear This Tool's History"
        message="Are you sure you want to delete all history snapshots for this tool? This action cannot be undone."
        confirmText="Clear History"
        confirmVariant="error"
      />

      {/* Confirm Wipe All Tools History */}
      <ConfirmDialog
        isOpen={isWipeAllConfirmOpen}
        onClose={() => setIsWipeAllConfirmOpen(false)}
        onConfirm={handleWipeAll}
        title="Wipe All Tools History"
        message="Are you sure you want to permanently delete history snapshots across ALL tools in the database? This action cannot be undone."
        confirmText="Wipe All History"
        confirmVariant="error"
      />
    </Drawer>
  );
}

export default ToolHistoryDrawer;
