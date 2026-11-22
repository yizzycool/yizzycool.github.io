'use client';

import type { ParsedKeepNote } from './types';

import { ArrowLeft, CheckSquare, FileUp, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { BaseDialog, DialogHeader } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { FilePicker } from '@/components/ui/file-picker';
import { SearchInput } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import toast from '@/utils/toast';

import KeepImportRow from './keep-import-row';
import { parseImportFiles } from './utils/keep-takeout-parser';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onImport: (selectedNotes: ParsedKeepNote[]) => void;
};

export default function KeepTakeoutImportModal({
  isOpen,
  onClose,
  onImport,
}: Props) {
  const [parsedNotes, setParsedNotes] = useState<ParsedKeepNote[]>([]);
  const [skippedTrashCount, setSkippedTrashCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterLabel, setFilterLabel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const resetState = () => {
    setParsedNotes([]);
    setSkippedTrashCount(0);
    setSelectedIds(new Set());
    setFilterLabel(null);
    setSearchQuery('');
    setIncludeArchived(false);
    setIsParsing(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFilesSelected = async (files: FileList | File[]) => {
    setIsParsing(true);
    try {
      const { parsed, skippedCount } = await parseImportFiles(files);
      if (parsed.length === 0) {
        toast.warning(
          'No valid Google Keep or Markdown notes found in selected file(s)'
        );
        return;
      }
      setParsedNotes(parsed);
      setSkippedTrashCount(skippedCount);
      setSelectedIds(
        new Set(parsed.filter((n) => !n.isArchived).map((n) => n.tempId))
      );
      setFilterLabel(null);
      setSearchQuery('');
    } catch {
      toast.error('Failed to read import file');
    } finally {
      setIsParsing(false);
    }
  };

  const extractedLabels = useMemo(() => {
    const counts = new Map<string, number>();
    for (const note of parsedNotes) {
      if (!includeArchived && note.isArchived) continue;
      for (const label of note.labels) {
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [parsedNotes, includeArchived]);

  const visibleNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return parsedNotes.filter((note) => {
      if (!includeArchived && note.isArchived) return false;
      if (filterLabel && !note.labels.includes(filterLabel)) return false;
      if (!q) return true;
      return (
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q) ||
        note.labels.some((l) => l.toLowerCase().includes(q))
      );
    });
  }, [parsedNotes, includeArchived, filterLabel, searchQuery]);

  const toggleNoteSelection = (tempId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(tempId)) {
        next.delete(tempId);
      } else {
        next.add(tempId);
      }
      return next;
    });
  };

  const handleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const note of visibleNotes) {
        next.add(note.tempId);
      }
      return next;
    });
  };

  const handleDeselectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const note of visibleNotes) {
        next.delete(note.tempId);
      }
      return next;
    });
  };

  const selectedNotesList = parsedNotes.filter((n) =>
    selectedIds.has(n.tempId)
  );

  const handleConfirmImport = () => {
    if (selectedNotesList.length === 0) return;
    onImport(selectedNotesList);
    handleClose();
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={handleClose}
      dialogClassName="flex max-h-[88vh] w-full max-w-2xl flex-col"
    >
      <DialogHeader
        icon={Upload}
        title="Import Notes (Google Keep Takeout / Markdown)"
        description="100% client-side file parsing — no Google sign-in or server upload required."
        onClose={handleClose}
        closeAriaLabel="Close import dialog"
        className="mx-6 pt-6"
      />

      <div className="flex-1 overflow-y-auto p-6 pt-4">
        {parsedNotes.length === 0 ? (
          <div className="space-y-4">
            <FilePicker
              icon={FileUp}
              title={
                isParsing
                  ? 'Reading files in browser memory...'
                  : 'Drop Takeout .zip, Keep .json, or .md files'
              }
              desc="Supports Google Takeout archives, individual Keep JSON notes, or Markdown (.md) files."
              buttonText={isParsing ? 'Parsing...' : 'Choose Files'}
              accept=".zip,.json,.md,.markdown,.txt"
              multiple
              onFileChange={(file) => void handleFilesSelected([file])}
              onFilesChange={(list) => void handleFilesSelected(list)}
            />

            <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-4 text-xs text-slate-600 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-slate-300">
              <p className="mb-1.5 font-bold text-slate-800 dark:text-slate-100">
                How to selectively import specific Google Keep notebooks:
              </p>
              <ol className="list-inside list-decimal space-y-1 text-slate-500 dark:text-slate-400">
                <li>
                  Visit{' '}
                  <a
                    href="https://takeout.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-sky-600 hover:underline dark:text-sky-400"
                  >
                    takeout.google.com
                  </a>
                  , click <strong>Deselect all</strong>, select only{' '}
                  <strong>Keep</strong>, and export a <code>.zip</code>.
                </li>
                <li>
                  Drop the downloaded <code>.zip</code> above without needing to
                  extract it first.
                </li>
                <li>
                  Filter by your Keep labels (e.g. Vocabulary, Phrases) and pick
                  exactly which notes to import.
                </li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Step 2 Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="xs"
                rounded="lg"
                icon={ArrowLeft}
                onClick={resetState}
              >
                Choose Another File
              </Button>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Found <strong>{parsedNotes.length}</strong> notes
                  {skippedTrashCount > 0 &&
                    ` (${skippedTrashCount} trashed skipped)`}
                </span>
                <Switch
                  size="xs"
                  label="Include Archived"
                  checked={includeArchived}
                  onChange={setIncludeArchived}
                />
              </div>
            </div>

            {/* Search & Label Filters */}
            <div className="space-y-2.5">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Filter parsed notes by keyword or label..."
              />

              {extractedLabels.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Chip
                    size="xs"
                    selected={filterLabel === null}
                    onClick={() => setFilterLabel(null)}
                  >
                    All Labels
                  </Chip>
                  {extractedLabels.map(([name, count]) => (
                    <Chip
                      key={name}
                      size="xs"
                      selected={filterLabel === name}
                      onClick={() =>
                        setFilterLabel(filterLabel === name ? null : name)
                      }
                    >
                      #{name} ({count})
                    </Chip>
                  ))}
                </div>
              )}
            </div>

            {/* Selection Batch Actions */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Showing {visibleNotes.length} notes ·{' '}
                <strong className="text-slate-700 dark:text-slate-200">
                  {selectedNotesList.length} selected
                </strong>
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="xs"
                  rounded="lg"
                  onClick={handleSelectAllVisible}
                >
                  Select Visible
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  rounded="lg"
                  onClick={handleDeselectAllVisible}
                >
                  Deselect Visible
                </Button>
              </div>
            </div>

            {/* Parsed Notes Preview List */}
            <div className="max-h-72 divide-y divide-neutral-200/70 overflow-y-auto rounded-2xl border border-neutral-200/80 bg-white/70 dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900/50">
              {visibleNotes.length === 0 ? (
                <EmptyState
                  size="sm"
                  title="No notes match current filter"
                  description="Try clearing the search query or enabling archived notes."
                />
              ) : (
                visibleNotes.map((note) => (
                  <KeepImportRow
                    key={note.tempId}
                    note={note}
                    selected={selectedIds.has(note.tempId)}
                    onToggle={toggleNoteSelection}
                  />
                ))
              )}
            </div>

            {/* Confirm Footer */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                rounded="lg"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                rounded="xl"
                icon={CheckSquare}
                disabled={selectedNotesList.length === 0}
                onClick={handleConfirmImport}
              >
                Import Selected ({selectedNotesList.length})
              </Button>
            </div>
          </div>
        )}
      </div>
    </BaseDialog>
  );
}
