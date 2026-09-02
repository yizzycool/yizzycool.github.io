import { useState } from 'react';
import { Pencil, Check, X, FileCode, Eye, Copy, Trash2 } from 'lucide-react';
import type { ContentVersion } from '../../types';
import { cn } from '@/utils/cn';
import ProseMarkdown from '@/components/common/markdown/prose-markdown';

type ManagementVersionItemProps = {
  version: ContentVersion;
  versionIdx: number;
  totalVersions: number;
  currentMode: 'edit' | 'preview';
  onToggleMode: (mode: 'edit' | 'preview') => void;
  onUpdateLabel: (val: string) => void;
  onUpdateText: (val: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export function ManagementVersionItem({
  version,
  versionIdx,
  totalVersions,
  currentMode,
  onToggleMode,
  onUpdateLabel,
  onUpdateText,
  onDuplicate,
  onDelete,
}: ManagementVersionItemProps) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState(version.label);

  const defaultPlaceholder = `Version ${String.fromCharCode(65 + versionIdx)}`;

  const handleStartEdit = () => {
    setTempLabel(version.label);
    setIsEditingLabel(true);
  };

  const handleSaveEdit = () => {
    const trimmed = tempLabel.trim();
    onUpdateLabel(trimmed || defaultPlaceholder);
    setIsEditingLabel(false);
  };

  const handleCancelEdit = () => {
    setTempLabel(version.label);
    setIsEditingLabel(false);
  };

  return (
    <div
      className={cn(
        'group/version flex flex-col justify-between rounded-xl border p-3.5 transition-all',
        'border-neutral-200/80 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/40'
      )}
    >
      {/* Version Header: Label, Mode Switch (Edit / Preview), Duplicate, Delete */}
      <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-neutral-100 pb-2 dark:border-neutral-800/60">
        {/* Label View or Edit */}
        {isEditingLabel ? (
          <div className="flex max-w-[220px] flex-1 items-center gap-1">
            <input
              type="text"
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              onBlur={handleSaveEdit}
              placeholder={defaultPlaceholder}
              autoFocus
              className="w-full rounded-md border border-sky-500/80 bg-white px-2 py-0.5 text-xs font-bold text-slate-800 outline-none ring-2 ring-sky-500/20 dark:border-sky-500/80 dark:bg-neutral-800 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={handleSaveEdit}
              className="rounded p-0.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              title="Save label"
              aria-label="Save label"
            >
              <Check size={13} />
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded p-0.5 text-slate-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Cancel"
              aria-label="Cancel editing"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <div className="group/label flex max-w-[200px] items-center gap-1 overflow-hidden">
            <span
              onClick={handleStartEdit}
              className="cursor-pointer truncate text-xs font-bold text-slate-800 transition-colors hover:text-sky-600 dark:text-slate-200 dark:hover:text-sky-400"
              title="Click to rename"
            >
              {version.label || defaultPlaceholder}
            </span>
            <button
              type="button"
              onClick={handleStartEdit}
              className="rounded p-0.5 text-slate-400 opacity-0 transition-opacity hover:bg-neutral-100 hover:text-slate-700 group-hover/label:opacity-100 dark:hover:bg-neutral-800 dark:hover:text-slate-200"
              title="Rename version"
              aria-label="Rename version"
            >
              <Pencil size={11} />
            </button>
          </div>
        )}

        {/* Edit vs Preview Toggle */}
        <div className="flex items-center rounded-lg border border-neutral-200/80 bg-white p-0.5 dark:border-neutral-700/80 dark:bg-neutral-800">
          <button
            type="button"
            onClick={() => onToggleMode('edit')}
            className={cn(
              'flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold transition-all',
              currentMode === 'edit'
                ? 'bg-neutral-100 text-sky-600 dark:bg-neutral-700 dark:text-sky-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            )}
            title="Edit Markdown"
          >
            <FileCode size={11} />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleMode('preview')}
            className={cn(
              'flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold transition-all',
              currentMode === 'preview'
                ? 'bg-neutral-100 text-sky-600 dark:bg-neutral-700 dark:text-sky-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            )}
            title="Live Markdown Preview"
          >
            <Eye size={11} />
            <span>Preview</span>
          </button>
        </div>

        {/* Version Actions: Duplicate & Delete */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded p-1 text-slate-400 transition-all hover:bg-neutral-100 hover:text-slate-700 dark:hover:bg-neutral-800 dark:hover:text-slate-200"
            title="Duplicate version"
            aria-label="Duplicate version"
          >
            <Copy size={12} />
          </button>

          {totalVersions > 1 && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded p-1 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              title="Delete this version"
              aria-label="Delete this version"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Content Body: Edit Textarea or Markdown Preview */}
      {currentMode === 'edit' ? (
        <textarea
          value={version.text}
          onChange={(e) => onUpdateText(e.target.value)}
          placeholder="Write Markdown content here..."
          rows={8}
          className={cn(
            'w-full resize-y rounded-xl border px-3 py-2 font-mono text-xs leading-relaxed outline-none transition-all duration-200',
            'border-neutral-200/90 bg-white/80 text-slate-800 dark:border-neutral-700/80 dark:bg-neutral-900/80 dark:text-slate-100',
            'focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20',
            'dark:focus:border-sky-400 dark:focus:bg-neutral-900 dark:focus:ring-sky-400/40'
          )}
        />
      ) : (
        <div className="h-[180px] overflow-y-auto rounded-xl border border-neutral-200/80 bg-white/60 p-3 text-xs dark:border-neutral-700/80 dark:bg-neutral-900/50">
          <ProseMarkdown className="select-text text-left text-xs leading-relaxed text-slate-800 dark:text-slate-200">
            {version.text || '*(Empty content)*'}
          </ProseMarkdown>
        </div>
      )}
    </div>
  );
}
