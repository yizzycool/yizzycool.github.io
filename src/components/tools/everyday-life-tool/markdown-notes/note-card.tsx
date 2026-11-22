'use client';

import type { NoteColor, NoteItem } from './types';

import { useSortable } from '@dnd-kit/react/sortable';
import {
  Archive,
  ArchiveRestore,
  CopyPlus,
  GripVertical,
  Palette,
  Pin,
  RotateCcw,
  Square,
  Trash2,
  Volume2,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import { NOTE_COLOR_STYLES } from './constants';
import NoteColorPicker from './note-color-picker';
import NoteMarkdownView from './note-markdown-view';
import {
  formatRelativeTime,
  stripMarkdownForSpeech,
} from './utils/markdown-helpers';

type Props = {
  note: NoteItem;
  index: number;
  isDragEnabled: boolean;
  revealAllSpoilers: boolean;
  ttsSupported: boolean;
  isTtsSpeaking: boolean;
  existingNoteTitles: Set<string>;
  onOpen: (id: string) => void;
  onTogglePin: (id: string) => void;
  onChangeColor: (id: string, color: NoteColor) => void;
  onToggleArchive: (id: string) => void;
  onMoveToTrash: (id: string) => void;
  onRestoreFromTrash: (id: string) => void;
  onDeletePermanently: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleCheckbox: (noteId: string, lineNumber: number) => void;
  onNavigateWikiLink: (title: string) => void;
  onSelectLabel: (label: string) => void;
  onSpeakText: (text: string) => void;
  onStopSpeech: () => void;
};

export default function NoteCard({
  note,
  index,
  isDragEnabled,
  revealAllSpoilers,
  ttsSupported,
  isTtsSpeaking,
  existingNoteTitles,
  onOpen,
  onTogglePin,
  onChangeColor,
  onToggleArchive,
  onMoveToTrash,
  onRestoreFromTrash,
  onDeletePermanently,
  onDuplicate,
  onToggleCheckbox,
  onNavigateWikiLink,
  onSelectLabel,
  onSpeakText,
  onStopSpeech,
}: Props) {
  const [showColorTray, setShowColorTray] = useState(false);
  const [element, setElement] = useState<Element | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);

  const { isDragging } = useSortable({
    id: note.id,
    index,
    element,
    handle: handleRef,
    disabled: !isDragEnabled,
  });

  const colorStyle = NOTE_COLOR_STYLES[note.color];
  const isLongContent =
    note.content.length > 340 || note.content.split('\n').length > 10;

  return (
    <article
      ref={setElement}
      onClick={() => onOpen(note.id)}
      className={cn(
        'group relative flex cursor-pointer flex-col rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        colorStyle.card,
        isDragging &&
          'z-20 scale-[1.01] opacity-90 shadow-xl ring-2 ring-sky-500/40'
      )}
    >
      {/* Top-Right Reorder Handle + Pin Action */}
      {!note.isTrashed && (
        <div className="absolute right-2.5 top-2.5 flex items-center gap-0.5">
          {isDragEnabled && (
            <button
              ref={handleRef}
              type="button"
              onClick={(e) => e.stopPropagation()}
              aria-label="Drag to reorder note"
              title="Drag to reorder"
              className="flex size-7 cursor-grab touch-none items-center justify-center rounded-full text-slate-400 opacity-100 transition-all hover:bg-black/5 hover:text-slate-700 active:cursor-grabbing sm:opacity-0 sm:group-hover:opacity-100 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-200"
            >
              <GripVertical size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note.id);
            }}
            aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
            className={cn(
              'flex size-7 items-center justify-center rounded-full transition-all',
              note.isPinned
                ? 'bg-amber-500/15 text-amber-600 opacity-100 dark:bg-amber-400/15 dark:text-amber-400'
                : 'text-slate-400 opacity-100 hover:bg-black/5 hover:text-slate-700 sm:opacity-0 sm:group-hover:opacity-100 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-200'
            )}
          >
            <Pin size={14} className={cn(note.isPinned && 'fill-current')} />
          </button>
        </div>
      )}

      {/* Title */}
      {note.title && (
        <h3
          className={cn(
            'mb-2 line-clamp-2 text-sm font-bold leading-snug text-slate-800 sm:text-[15px] dark:text-slate-100',
            isDragEnabled ? 'pr-14' : 'pr-7'
          )}
        >
          {note.title}
        </h3>
      )}

      {/* Rendered Markdown Preview */}
      {note.content.trim() && (
        <div
          className={cn(
            'relative max-h-[270px] overflow-hidden',
            !note.title && (isDragEnabled ? 'pr-14' : 'pr-7')
          )}
        >
          <NoteMarkdownView
            content={note.content}
            compact
            revealAllSpoilers={revealAllSpoilers}
            existingNoteTitles={existingNoteTitles}
            onNavigateWikiLink={onNavigateWikiLink}
            onToggleCheckbox={(line) => onToggleCheckbox(note.id, line)}
          />
          {isLongContent && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/[0.04] to-transparent dark:from-black/25"
            />
          )}
        </div>
      )}

      {/* Label Badges */}
      {note.labels.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {note.labels.map((label) => (
            <button
              key={label}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectLabel(label);
              }}
              className="rounded-full border border-neutral-300/60 bg-black/[0.03] px-2 py-0.5 text-[11px] font-medium text-slate-600 transition-colors hover:border-sky-400/60 hover:text-sky-600 dark:border-neutral-700/70 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:border-sky-500/50 dark:hover:text-sky-300"
            >
              #{label}
            </button>
          ))}
        </div>
      )}

      {/* Color Swatch Tray */}
      {showColorTray && !note.isTrashed && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 rounded-xl bg-black/[0.04] p-2 dark:bg-white/[0.06]"
        >
          <NoteColorPicker
            value={note.color}
            onChange={(c) => {
              onChangeColor(note.id, c);
              setShowColorTray(false);
            }}
          />
        </div>
      )}

      {/* Footer Timestamp + Hover Actions */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="mt-3 flex items-center justify-between gap-2 pt-1"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {formatRelativeTime(note.updatedAt)}
          </span>
          {note.isArchived && !note.isTrashed && (
            <Badge variant="neutral" size="xs">
              Archived
            </Badge>
          )}
        </div>

        <div
          className={cn(
            'flex items-center gap-0.5 transition-opacity',
            showColorTray
              ? 'opacity-100'
              : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
          )}
        >
          {note.isTrashed ? (
            <>
              <Button
                variant="ghost"
                size="xs"
                rounded="lg"
                icon={RotateCcw}
                ariaLabel="Restore note"
                title="Restore note"
                onClick={() => onRestoreFromTrash(note.id)}
              />
              <Button
                variant="ghost"
                size="xs"
                rounded="lg"
                icon={Trash2}
                ariaLabel="Delete permanently"
                title="Delete permanently"
                onClick={() => onDeletePermanently(note.id)}
                className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
              />
            </>
          ) : (
            <>
              {ttsSupported && (
                <Button
                  variant="ghost"
                  size="xs"
                  rounded="lg"
                  icon={isTtsSpeaking ? Square : Volume2}
                  ariaLabel={isTtsSpeaking ? 'Stop speech' : 'Listen to note'}
                  title={isTtsSpeaking ? 'Stop speech' : 'Listen to note'}
                  onClick={() => {
                    if (isTtsSpeaking) {
                      onStopSpeech();
                    } else {
                      const plain = stripMarkdownForSpeech(
                        `${note.title ? `${note.title}. ` : ''}${note.content}`
                      );
                      onSpeakText(plain);
                    }
                  }}
                />
              )}
              <Button
                variant={showColorTray ? 'primary' : 'ghost'}
                size="xs"
                rounded="lg"
                icon={Palette}
                ariaLabel="Change note color"
                title="Change color"
                onClick={() => setShowColorTray((prev) => !prev)}
              />
              <Button
                variant="ghost"
                size="xs"
                rounded="lg"
                icon={CopyPlus}
                ariaLabel="Duplicate note"
                title="Duplicate note"
                onClick={() => onDuplicate(note.id)}
              />
              <Button
                variant="ghost"
                size="xs"
                rounded="lg"
                icon={note.isArchived ? ArchiveRestore : Archive}
                ariaLabel={note.isArchived ? 'Unarchive note' : 'Archive note'}
                title={note.isArchived ? 'Unarchive note' : 'Archive note'}
                onClick={() => onToggleArchive(note.id)}
              />
              <Button
                variant="ghost"
                size="xs"
                rounded="lg"
                icon={Trash2}
                ariaLabel="Move note to trash"
                title="Move to Trash"
                onClick={() => onMoveToTrash(note.id)}
                className="hover:text-rose-600 dark:hover:text-rose-400"
              />
            </>
          )}
        </div>
      </div>
    </article>
  );
}
