'use client';

import type { DragEndEvent } from '@dnd-kit/react';
import type {
  NoteColor,
  NoteItem,
  NotesLayoutMode,
  NotesViewScope,
} from './types';

import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import { Archive, SearchX, StickyNote, Trash2, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/utils/cn';

import NoteCard from './note-card';

type Props = {
  isLoaded: boolean;
  viewScope: NotesViewScope;
  layout: NotesLayoutMode;
  searchQuery: string;
  selectedLabel: string | null;
  pinnedNotes: NoteItem[];
  otherNotes: NoteItem[];
  isReorderEnabled: boolean;
  revealAllSpoilers: boolean;
  ttsSupported: boolean;
  speakingNoteId: string | null;
  existingNoteTitles: Set<string>;
  onOpenNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onChangeColor: (id: string, color: NoteColor) => void;
  onToggleArchive: (id: string) => void;
  onMoveToTrash: (id: string) => void;
  onRestoreFromTrash: (id: string) => void;
  onDeletePermanently: (id: string) => void;
  onDuplicate: (id: string) => void;
  onReorderNotes: (reorderedIds: string[]) => void;
  onToggleCheckbox: (noteId: string, lineNumber: number) => void;
  onNavigateWikiLink: (title: string) => void;
  onSelectLabel: (label: string | null) => void;
  onClearFilters: () => void;
  onOpenImportModal: () => void;
  onRequestEmptyTrash: () => void;
  onSpeakNote: (noteId: string, text: string) => void;
  onStopSpeech: () => void;
};

export default function NotesGrid({
  isLoaded,
  viewScope,
  layout,
  searchQuery,
  selectedLabel,
  pinnedNotes,
  otherNotes,
  isReorderEnabled,
  revealAllSpoilers,
  ttsSupported,
  speakingNoteId,
  existingNoteTitles,
  onOpenNote,
  onTogglePin,
  onChangeColor,
  onToggleArchive,
  onMoveToTrash,
  onRestoreFromTrash,
  onDeletePermanently,
  onDuplicate,
  onReorderNotes,
  onToggleCheckbox,
  onNavigateWikiLink,
  onSelectLabel,
  onClearFilters,
  onOpenImportModal,
  onRequestEmptyTrash,
  onSpeakNote,
  onStopSpeech,
}: Props) {
  if (!isLoaded) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((slot) => (
          <div
            key={slot}
            className="h-44 animate-pulse rounded-2xl border border-neutral-200/70 bg-neutral-100/60 dark:border-neutral-800 dark:bg-neutral-900/50"
          />
        ))}
      </div>
    );
  }

  const totalVisible = pinnedNotes.length + otherNotes.length;
  const hasActiveFilter = Boolean(searchQuery.trim() || selectedLabel);

  if (totalVisible === 0) {
    if (hasActiveFilter) {
      return (
        <EmptyState
          variant="dashed"
          size="lg"
          icon={SearchX}
          title="No matching notes found"
          description="Try a different keyword or clear the active label filter."
          action={
            <Button
              variant="outline"
              size="xs"
              rounded="lg"
              onClick={onClearFilters}
            >
              Clear Filters
            </Button>
          }
        />
      );
    }

    if (viewScope === 'archived') {
      return (
        <EmptyState
          variant="dashed"
          size="lg"
          icon={Archive}
          title="No archived notes"
          description="Notes you archive appear here so your main workspace stays focused."
        />
      );
    }

    if (viewScope === 'trash') {
      return (
        <EmptyState
          variant="dashed"
          size="lg"
          icon={Trash2}
          title="Trash is empty"
          description="Deleted notes wait here until you restore them or clear the Trash."
        />
      );
    }

    return (
      <EmptyState
        variant="dashed"
        size="lg"
        icon={StickyNote}
        title="Your Markdown note board is empty"
        description="Write a new note above or import notebooks directly from Google Keep Takeout (.zip / .json)."
        action={
          <Button
            variant="primary"
            size="sm"
            rounded="xl"
            icon={Upload}
            onClick={onOpenImportModal}
          >
            Import from Google Keep
          </Button>
        }
      />
    );
  }

  const containerClassName =
    layout === 'masonry'
      ? 'grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-3'
      : 'mx-auto flex max-w-2xl flex-col gap-4';

  const handlePinnedDragEnd = (event: DragEndEvent) => {
    if (!isReorderEnabled) return;
    const updated = move(pinnedNotes, event);
    if (updated !== pinnedNotes) {
      onReorderNotes(updated.map((n) => n.id));
    }
  };

  const handleOtherDragEnd = (event: DragEndEvent) => {
    if (!isReorderEnabled) return;
    const updated = move(otherNotes, event);
    if (updated !== otherNotes) {
      onReorderNotes(updated.map((n) => n.id));
    }
  };

  return (
    <div className="space-y-8">
      {/* Trash Empty Action Banner */}
      {viewScope === 'trash' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-4 py-2.5 text-xs text-slate-600 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-slate-300">
          <span>
            Notes in Trash are stored locally until permanently deleted.
          </span>
          <Button
            variant="error"
            size="xs"
            rounded="lg"
            icon={Trash2}
            onClick={onRequestEmptyTrash}
          >
            Empty Trash
          </Button>
        </div>
      )}

      {/* Pinned Section */}
      {pinnedNotes.length > 0 && (
        <section className="space-y-3">
          <h2 className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Pinned ({pinnedNotes.length})
          </h2>
          <DragDropProvider onDragEnd={handlePinnedDragEnd}>
            <div className={containerClassName}>
              {pinnedNotes.map((note, index) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  index={index}
                  isDragEnabled={isReorderEnabled}
                  revealAllSpoilers={revealAllSpoilers}
                  ttsSupported={ttsSupported}
                  isTtsSpeaking={speakingNoteId === note.id}
                  existingNoteTitles={existingNoteTitles}
                  onOpen={onOpenNote}
                  onTogglePin={onTogglePin}
                  onChangeColor={onChangeColor}
                  onToggleArchive={onToggleArchive}
                  onMoveToTrash={onMoveToTrash}
                  onRestoreFromTrash={onRestoreFromTrash}
                  onDeletePermanently={onDeletePermanently}
                  onDuplicate={onDuplicate}
                  onToggleCheckbox={onToggleCheckbox}
                  onNavigateWikiLink={onNavigateWikiLink}
                  onSelectLabel={(label) => onSelectLabel(label)}
                  onSpeakText={(text) => onSpeakNote(note.id, text)}
                  onStopSpeech={onStopSpeech}
                />
              ))}
            </div>
          </DragDropProvider>
        </section>
      )}

      {/* Others / Main Section */}
      {otherNotes.length > 0 && (
        <section className="space-y-3">
          {pinnedNotes.length > 0 && (
            <h2 className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Others ({otherNotes.length})
            </h2>
          )}
          <DragDropProvider onDragEnd={handleOtherDragEnd}>
            <div className={cn(containerClassName)}>
              {otherNotes.map((note, index) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  index={index}
                  isDragEnabled={isReorderEnabled}
                  revealAllSpoilers={revealAllSpoilers}
                  ttsSupported={ttsSupported}
                  isTtsSpeaking={speakingNoteId === note.id}
                  existingNoteTitles={existingNoteTitles}
                  onOpen={onOpenNote}
                  onTogglePin={onTogglePin}
                  onChangeColor={onChangeColor}
                  onToggleArchive={onToggleArchive}
                  onMoveToTrash={onMoveToTrash}
                  onRestoreFromTrash={onRestoreFromTrash}
                  onDeletePermanently={onDeletePermanently}
                  onDuplicate={onDuplicate}
                  onToggleCheckbox={onToggleCheckbox}
                  onNavigateWikiLink={onNavigateWikiLink}
                  onSelectLabel={(label) => onSelectLabel(label)}
                  onSpeakText={(text) => onSpeakNote(note.id, text)}
                  onStopSpeech={onStopSpeech}
                />
              ))}
            </div>
          </DragDropProvider>
        </section>
      )}
    </div>
  );
}
