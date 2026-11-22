'use client';

import type { ChangeEvent, KeyboardEvent, Ref } from 'react';
import type { CreateNoteInput } from './hooks/use-markdown-notes';
import type { NoteColor } from './types';

import { CheckSquare, EyeOff, Hash, Palette, Pin, Plus } from 'lucide-react';
import { useImperativeHandle, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import { NOTE_COLOR_STYLES } from './constants';
import NoteColorPicker from './note-color-picker';
import NoteLabelEditor from './note-label-editor';
import { autoExpandChecklistShortcut } from './utils/markdown-helpers';

export interface QuickCaptureBarHandle {
  expandAndFocus: () => void;
}

type Props = {
  ref?: Ref<QuickCaptureBarHandle>;
  existingLabels: string[];
  onCreateNote: (input: CreateNoteInput) => unknown;
};

export default function QuickCaptureBar({
  ref,
  existingLabels,
  onCreateNote,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [color, setColor] = useState<NoteColor>('default');
  const [isPinned, setIsPinned] = useState(false);
  const [showColorTray, setShowColorTray] = useState(false);
  const [showLabelTray, setShowLabelTray] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      expandAndFocus: () => {
        setIsExpanded(true);
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 20);
      },
    }),
    []
  );

  const resetAndCollapse = () => {
    setTitle('');
    setContent('');
    setLabels([]);
    setColor('default');
    setIsPinned(false);
    setShowColorTray(false);
    setShowLabelTray(false);
    setIsExpanded(false);
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      resetAndCollapse();
      return;
    }
    onCreateNote({
      title,
      content,
      labels,
      color,
      isPinned,
    });
    resetAndCollapse();
  };

  const expandWithChecklist = () => {
    setIsExpanded(true);
    if (!content.trim()) {
      setContent('- [ ] ');
    }
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 20);
  };

  const insertSnippet = (snippet: string) => {
    const el = textareaRef.current;
    if (!el) {
      setContent((prev) => `${prev}${prev ? '\n' : ''}${snippet}`);
      return;
    }
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const selected = content.slice(start, end);

    if (snippet === '||') {
      const wrapped = selected ? `||${selected}||` : '||answer||';
      const next = `${content.slice(0, start)}${wrapped}${content.slice(end)}`;
      setContent(next);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(
          start + 2,
          start + (selected ? selected.length + 2 : 8)
        );
      }, 0);
      return;
    }

    const prefix =
      start > 0 && content[start - 1] !== '\n' ? `\n${snippet}` : snippet;
    const next = `${content.slice(0, start)}${prefix}${content.slice(end)}`;
    setContent(next);
    setTimeout(() => {
      el.focus();
      const pos = start + prefix.length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      resetAndCollapse();
    }
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const cursor =
      el.selectionStart === el.selectionEnd ? el.selectionStart : null;
    const { value, nextCursor } = autoExpandChecklistShortcut(
      content,
      el.value,
      cursor
    );
    setContent(value);

    if (nextCursor !== null) {
      requestAnimationFrame(() => {
        el.setSelectionRange(nextCursor, nextCursor);
      });
    }
  };

  const colorStyle = NOTE_COLOR_STYLES[color];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div
        className={cn(
          'rounded-2xl border shadow-sm backdrop-blur-md transition-all duration-200',
          colorStyle.card,
          isExpanded && 'shadow-md'
        )}
      >
        {!isExpanded ? (
          <div className="flex items-center justify-between gap-2 px-4 py-2.5">
            <button
              type="button"
              onClick={() => {
                setIsExpanded(true);
                setTimeout(() => textareaRef.current?.focus(), 20);
              }}
              className="flex-1 cursor-text text-left text-sm font-medium text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              Take a note in Markdown...
            </button>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="xs"
                rounded="lg"
                icon={CheckSquare}
                ariaLabel="New checklist note"
                title="New checklist note"
                onClick={expandWithChecklist}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 p-4">
            {/* Title + Pin Row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    textareaRef.current?.focus();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    resetAndCollapse();
                  }
                }}
                placeholder="Title"
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <Button
                variant="ghost"
                size="xs"
                rounded="full"
                icon={Pin}
                ariaLabel={isPinned ? 'Unpin note' : 'Pin note'}
                title={isPinned ? 'Unpin note' : 'Pin note'}
                onClick={() => setIsPinned((prev) => !prev)}
                className={cn(
                  isPinned &&
                    'bg-amber-500/15 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400'
                )}
              />
            </div>

            {/* Markdown Content Input */}
            <textarea
              ref={textareaRef}
              rows={4}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="Write in Markdown... (supports tables, [ ] checklists, ||spoilers||, and Mod+Enter to save)"
              className="w-full resize-y bg-transparent font-mono text-xs leading-relaxed text-slate-700 outline-none placeholder:font-sans placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
            />

            {/* Optional Color Picker Tray */}
            {showColorTray && (
              <div className="rounded-xl bg-black/[0.04] p-2.5 dark:bg-white/[0.05]">
                <NoteColorPicker value={color} onChange={setColor} />
              </div>
            )}

            {/* Optional Label Editor Tray */}
            {(showLabelTray || labels.length > 0) && (
              <div className="rounded-xl bg-black/[0.04] p-2.5 dark:bg-white/[0.05]">
                <NoteLabelEditor
                  labels={labels}
                  existingLabels={existingLabels}
                  onChange={setLabels}
                />
              </div>
            )}

            {/* Bottom Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-1">
                <Button
                  variant="ghost"
                  size="xs"
                  rounded="lg"
                  icon={CheckSquare}
                  title="Insert checklist item"
                  onClick={() => insertSnippet('- [ ] ')}
                >
                  Checklist
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  rounded="lg"
                  icon={EyeOff}
                  title="Insert or wrap selection with ||spoiler|| blur"
                  onClick={() => insertSnippet('||')}
                >
                  Spoiler
                </Button>
                <Button
                  variant={showColorTray ? 'primary' : 'ghost'}
                  size="xs"
                  rounded="lg"
                  icon={Palette}
                  ariaLabel="Note color"
                  title="Pick note color"
                  onClick={() => setShowColorTray((prev) => !prev)}
                />
                <Button
                  variant={showLabelTray ? 'primary' : 'ghost'}
                  size="xs"
                  rounded="lg"
                  icon={Hash}
                  ariaLabel="Add labels"
                  title="Manage labels"
                  onClick={() => setShowLabelTray((prev) => !prev)}
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="xs"
                  rounded="lg"
                  onClick={resetAndCollapse}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="xs"
                  rounded="lg"
                  icon={Plus}
                  disabled={!title.trim() && !content.trim()}
                  onClick={handleSave}
                >
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
