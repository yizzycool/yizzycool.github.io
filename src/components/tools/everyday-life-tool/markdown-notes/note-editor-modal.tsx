'use client';

import type { ChangeEvent } from 'react';
import type {
  NoteAiActionId,
  NoteEditorMode,
  NoteItem,
  NotesPreferences,
} from './types';

import {
  Archive,
  ArchiveRestore,
  Bold,
  BookOpen,
  CalendarPlus,
  CheckSquare,
  Code2,
  Columns2,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Hash,
  Heading2,
  Link2,
  Palette,
  Pin,
  RotateCcw,
  Square,
  Table2,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { BaseDialog } from '@/components/ui/dialog';
import { PillTabs } from '@/components/ui/tabs';
import { getOpenModalDialogCount } from '@/hooks/tools/use-tool-hotkeys';
import { cn } from '@/utils/cn';
import toast from '@/utils/toast';

import { NOTE_COLOR_STYLES } from './constants';
import useNoteAiCapabilities from './hooks/use-note-ai-capabilities';
import NoteAiAssistBar from './note-ai-assist-bar';
import NoteBacklinksSection from './note-backlinks-section';
import NoteColorPicker from './note-color-picker';
import NoteLabelEditor from './note-label-editor';
import NoteMarkdownView from './note-markdown-view';
import NoteOutlineBar from './note-outline-bar';
import {
  autoExpandChecklistShortcut,
  buildReviewReminderIcs,
  extractMarkdownHeadings,
  extractWikiLinks,
  formatRelativeTime,
  noteToMarkdownFile,
  sanitizeFileName,
  stripMarkdownForSpeech,
  triggerBlobDownload,
} from './utils/markdown-helpers';

type Props = {
  note: NoteItem;
  allNotes: NoteItem[];
  existingLabels: string[];
  existingNoteTitles: Set<string>;
  prefs: NotesPreferences;
  ttsSupported: boolean;
  isTtsSpeaking: boolean;
  onOpenNote: (id: string) => void;
  onNavigateWikiLink: (title: string) => void;
  onUpdatePrefs: (partial: Partial<NotesPreferences>) => void;
  onUpdateNote: (
    id: string,
    patch: Partial<Pick<NoteItem, 'title' | 'content' | 'labels' | 'color'>>
  ) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onMoveToTrash: (id: string) => void;
  onRestoreFromTrash: (id: string) => void;
  onDeletePermanently: (id: string) => void;
  onToggleCheckbox: (noteId: string, lineNumber: number) => void;
  onSpeakText: (text: string) => void;
  onStopSpeech: () => void;
  onClose: () => void;
};

const EDITOR_MODES: NoteEditorMode[] = ['read', 'edit', 'split'];

const EDITOR_MODE_LABELS: Record<NoteEditorMode, string> = {
  read: 'Read',
  edit: 'Edit',
  split: 'Split',
};

const EDITOR_MODE_ICONS: Record<NoteEditorMode, typeof Eye> = {
  read: Eye,
  edit: Edit3,
  split: Columns2,
};

export default function NoteEditorModal({
  note,
  allNotes,
  existingLabels,
  existingNoteTitles,
  prefs,
  ttsSupported,
  isTtsSpeaking,
  onOpenNote,
  onNavigateWikiLink,
  onUpdatePrefs,
  onUpdateNote,
  onTogglePin,
  onToggleArchive,
  onMoveToTrash,
  onRestoreFromTrash,
  onDeletePermanently,
  onToggleCheckbox,
  onSpeakText,
  onStopSpeech,
  onClose,
}: Props) {
  const [editorMode, setEditorMode] = useState<NoteEditorMode>('read');
  const [localRevealSpoilers, setLocalRevealSpoilers] = useState(false);
  const [showColorTray, setShowColorTray] = useState(false);
  const [showLabelTray, setShowLabelTray] = useState(note.labels.length > 0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (note.isTrashed) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || getOpenModalDialogCount() > 1) return;
      if (
        (e.metaKey || e.ctrlKey) &&
        !e.shiftKey &&
        !e.altKey &&
        (e.key.toLowerCase() === 'e' || e.code === 'KeyE')
      ) {
        e.preventDefault();
        setEditorMode((prev) => (prev === 'read' ? 'edit' : 'read'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [note.isTrashed]);

  const headings = useMemo(
    () => extractMarkdownHeadings(note.content),
    [note.content]
  );

  const backlinks = useMemo(() => {
    const normalizedSelfTitle = note.title.trim().toLowerCase();
    if (!normalizedSelfTitle) return [];
    return allNotes.filter(
      (candidate) =>
        !candidate.isTrashed &&
        candidate.id !== note.id &&
        extractWikiLinks(candidate.content).some(
          (target) => target.toLowerCase() === normalizedSelfTitle
        )
    );
  }, [allNotes, note.id, note.title]);

  const {
    capabilities,
    isRunning,
    downloadProgress,
    aiResult,
    clearAiResult,
    isActionAvailable,
    runAiAction,
  } = useNoteAiCapabilities();

  const colorStyle = NOTE_COLOR_STYLES[note.color];
  const effectiveRevealSpoilers =
    prefs.revealAllSpoilers || localRevealSpoilers;

  const getLookupPhrase = (): string => {
    const el = textareaRef.current;
    if (el && el.selectionStart !== el.selectionEnd) {
      return note.content.slice(el.selectionStart, el.selectionEnd).trim();
    }
    const winSelection =
      typeof window !== 'undefined'
        ? window.getSelection()?.toString().trim() || ''
        : '';
    if (winSelection) return winSelection;
    return note.title.trim();
  };

  const handleTriggerAi = (action: NoteAiActionId) => {
    const el = textareaRef.current;
    if (
      (editorMode === 'edit' || editorMode === 'split') &&
      el &&
      el.selectionStart !== el.selectionEnd
    ) {
      const selected = note.content.slice(el.selectionStart, el.selectionEnd);
      void runAiAction(action, selected, el.selectionStart, el.selectionEnd);
      return;
    }

    const winSelection =
      typeof window !== 'undefined'
        ? window.getSelection()?.toString().trim() || ''
        : '';
    if (winSelection) {
      void runAiAction(action, winSelection, null, null);
      return;
    }

    void runAiAction(action, note.content || note.title, null, null);
  };

  const handleApplyAiResult = (
    mode: 'replace' | 'insert-below' | 'insert-spoiler'
  ) => {
    if (!aiResult) return;

    const generated =
      mode === 'insert-spoiler'
        ? `||${aiResult.output.replace(/\s*\n\s*/g, ' ').trim()}||`
        : aiResult.output;

    const { selectionStart, selectionEnd } = aiResult;
    const hasExactSelection =
      selectionStart !== null &&
      selectionEnd !== null &&
      selectionEnd <= note.content.length;

    let nextContent = note.content;

    if (hasExactSelection) {
      if (mode === 'replace') {
        nextContent = `${note.content.slice(0, selectionStart)}${generated}${note.content.slice(selectionEnd)}`;
      } else {
        const spacer = mode === 'insert-spoiler' ? ' ' : '\n\n';
        nextContent = `${note.content.slice(0, selectionEnd)}${spacer}${generated}${note.content.slice(selectionEnd)}`;
      }
    } else if (mode === 'replace') {
      nextContent = generated;
    } else {
      nextContent = note.content
        ? `${note.content.trimEnd()}\n\n${generated}`
        : generated;
    }

    onUpdateNote(note.id, { content: nextContent });
    clearAiResult();
    toast.success('Updated note content');
  };

  const handleApplySuggestedLabels = (incoming: string[]) => {
    const existingLower = new Set(note.labels.map((l) => l.toLowerCase()));
    const added = incoming.filter(
      (label) => !existingLower.has(label.toLowerCase())
    );
    if (added.length > 0) {
      onUpdateNote(note.id, { labels: [...note.labels, ...added] });
      toast.success(
        `Added ${added.length} ${added.length === 1 ? 'label' : 'labels'}`
      );
    } else {
      toast.info('All suggested labels are already applied');
    }
    setShowLabelTray(true);
    clearAiResult();
  };

  const wrapSelection = (before: string, after: string, fallback: string) => {
    const el = textareaRef.current;
    if (!el) {
      onUpdateNote(note.id, {
        content: `${note.content}${note.content ? '\n' : ''}${before}${fallback}${after}`,
      });
      return;
    }

    const start = el.selectionStart ?? note.content.length;
    const end = el.selectionEnd ?? note.content.length;
    const selected = note.content.slice(start, end) || fallback;
    const next = `${note.content.slice(0, start)}${before}${selected}${after}${note.content.slice(end)}`;
    onUpdateNote(note.id, { content: next });

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    }, 0);
  };

  const insertBlock = (block: string) => {
    const el = textareaRef.current;
    if (!el) {
      onUpdateNote(note.id, {
        content: `${note.content}${note.content ? '\n' : ''}${block}`,
      });
      return;
    }
    const start = el.selectionStart ?? note.content.length;
    const end = el.selectionEnd ?? note.content.length;
    const prefix = start > 0 && note.content[start - 1] !== '\n' ? '\n' : '';
    const next = `${note.content.slice(0, start)}${prefix}${block}${note.content.slice(end)}`;
    onUpdateNote(note.id, { content: next });

    setTimeout(() => {
      el.focus();
      const cursor = start + prefix.length + block.length;
      el.setSelectionRange(cursor, cursor);
    }, 0);
  };

  const handleOpenLookup = (provider: 'cambridge' | 'youglish') => {
    const phrase = getLookupPhrase();
    if (!phrase) {
      toast.warning('Highlight a word or add a title to look up');
      return;
    }
    const encoded = encodeURIComponent(phrase);
    const url =
      provider === 'cambridge'
        ? `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(phrase.toLowerCase().replace(/\s+/g, '-'))}`
        : `https://youglish.com/pronounce/${encoded}/english`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyMarkdown = async () => {
    const text = note.title
      ? `# ${note.title}\n\n${note.content}`
      : note.content;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied Markdown to clipboard');
    } catch {
      toast.error('Failed to copy note');
    }
  };

  const handleExportSingleMarkdown = () => {
    const mdContent = noteToMarkdownFile(note);
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    triggerBlobDownload(blob, `${sanitizeFileName(note.title)}.md`);
    toast.success('Downloaded Markdown file');
  };

  const handleDownloadReminderIcs = () => {
    const ics = buildReviewReminderIcs(note, 1);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    triggerBlobDownload(
      blob,
      `${sanitizeFileName(note.title)}-review-reminder.ics`
    );
    toast.success('Downloaded calendar reminder (.ics)');
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const cursor =
      el.selectionStart === el.selectionEnd ? el.selectionStart : null;
    const { value, nextCursor } = autoExpandChecklistShortcut(
      note.content,
      el.value,
      cursor
    );
    onUpdateNote(note.id, { content: value });

    if (nextCursor !== null) {
      requestAnimationFrame(() => {
        el.setSelectionRange(nextCursor, nextCursor);
      });
    }
  };

  return (
    <BaseDialog
      isOpen
      onClose={onClose}
      dialogClassName={cn(
        'flex max-h-[90vh] w-full max-w-4xl flex-col transition-colors',
        colorStyle.modal
      )}
    >
      {/* Top Modal Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-6 py-4 dark:border-white/10">
        <input
          type="text"
          value={note.title}
          onChange={(e) => onUpdateNote(note.id, { title: e.target.value })}
          placeholder="Note Title"
          disabled={note.isTrashed}
          className="min-w-[180px] flex-1 bg-transparent text-base font-bold text-slate-900 outline-none placeholder:text-slate-400 sm:text-lg dark:text-slate-100 dark:placeholder:text-slate-500"
        />

        <div className="flex flex-wrap items-center gap-2">
          <PillTabs<NoteEditorMode>
            tabs={EDITOR_MODES}
            activeTab={editorMode}
            tabLabels={EDITOR_MODE_LABELS}
            tabIcons={EDITOR_MODE_ICONS}
            onChange={setEditorMode}
            size="xs"
            variant="segment"
          />

          {!note.isTrashed && (
            <Button
              variant="ghost"
              size="xs"
              rounded="full"
              icon={Pin}
              ariaLabel={note.isPinned ? 'Unpin note' : 'Pin note'}
              title={note.isPinned ? 'Unpin note' : 'Pin note'}
              onClick={() => onTogglePin(note.id)}
              className={cn(
                note.isPinned &&
                  'bg-amber-500/15 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400'
              )}
            />
          )}

          <Button
            variant="ghost"
            size="xs"
            rounded="full"
            icon={X}
            ariaLabel="Close note editor"
            onClick={onClose}
          />
        </div>
      </div>

      {/* Scrollable Editor + Study Toolbar Body */}
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {/* Universal Study, Formatting & Progressive AI Toolbar */}
        <NoteAiAssistBar
          showAiTrigger={!note.isTrashed}
          capabilities={capabilities}
          isRunning={isRunning}
          downloadProgress={downloadProgress}
          aiResult={aiResult}
          isActionAvailable={isActionAvailable}
          onTriggerAction={handleTriggerAi}
          onApplyResult={handleApplyAiResult}
          onApplySuggestedLabels={handleApplySuggestedLabels}
          onDiscardResult={clearAiResult}
          leadingControls={
            <>
              {editorMode !== 'read' && !note.isTrashed && (
                <>
                  <Button
                    variant="ghost"
                    size="xs"
                    rounded="lg"
                    icon={Heading2}
                    title="Insert heading"
                    onClick={() => insertBlock('### ')}
                  />
                  <Button
                    variant="ghost"
                    size="xs"
                    rounded="lg"
                    icon={Bold}
                    title="Bold text"
                    onClick={() => wrapSelection('**', '**', 'bold')}
                  />
                  <Button
                    variant="ghost"
                    size="xs"
                    rounded="lg"
                    icon={CheckSquare}
                    title="Insert checklist item"
                    onClick={() => insertBlock('- [ ] ')}
                  />
                  <Button
                    variant="ghost"
                    size="xs"
                    rounded="lg"
                    icon={Table2}
                    title="Insert Markdown table"
                    onClick={() =>
                      insertBlock(
                        '| Term | Meaning | Example |\n| :--- | :--- | :--- |\n|  |  |  |\n'
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="xs"
                    rounded="lg"
                    icon={Code2}
                    title="Inline code"
                    onClick={() => wrapSelection('`', '`', 'code')}
                  />
                  <Button
                    variant="ghost"
                    size="xs"
                    rounded="lg"
                    icon={EyeOff}
                    title="Wrap selection in ||spoiler|| blur"
                    onClick={() => wrapSelection('||', '||', 'hidden answer')}
                  >
                    Spoiler
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    rounded="lg"
                    icon={Link2}
                    title="Insert [[Wiki Link]] to another note"
                    onClick={() => wrapSelection('[[', ']]', 'Note Title')}
                  >
                    Link
                  </Button>
                  <span className="mx-1 h-4 w-px bg-black/10 dark:bg-white/10" />
                </>
              )}

              {/* Universal English Study Controls */}
              {ttsSupported && (
                <div className="flex items-center gap-1">
                  <Button
                    variant={isTtsSpeaking ? 'primary' : 'ghost'}
                    size="xs"
                    rounded="lg"
                    icon={isTtsSpeaking ? Square : Volume2}
                    onClick={() => {
                      if (isTtsSpeaking) {
                        onStopSpeech();
                      } else {
                        const selectionText = getLookupPhrase();
                        const fallbackPlain = stripMarkdownForSpeech(
                          `${note.title ? `${note.title}. ` : ''}${note.content}`
                        );
                        onSpeakText(
                          selectionText && selectionText !== note.title.trim()
                            ? stripMarkdownForSpeech(selectionText)
                            : fallbackPlain
                        );
                      }
                    }}
                  >
                    {isTtsSpeaking ? 'Stop' : 'Listen'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    rounded="lg"
                    onClick={() =>
                      onUpdatePrefs({
                        ttsRate: prefs.ttsRate === 1 ? 0.7 : 1,
                      })
                    }
                    title="Toggle normal (1.0x) vs slow connected-speech (0.7x) speed"
                    className="font-mono text-[11px]"
                  >
                    {prefs.ttsRate === 0.7 ? '0.7x' : '1.0x'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    rounded="lg"
                    onClick={() =>
                      onUpdatePrefs({
                        ttsLang: prefs.ttsLang === 'en-US' ? 'en-GB' : 'en-US',
                      })
                    }
                    title="Toggle American (US) vs British (UK) accent"
                    className="font-mono text-[11px]"
                  >
                    {prefs.ttsLang === 'en-US' ? 'US' : 'UK'}
                  </Button>
                </div>
              )}

              <Button
                variant={effectiveRevealSpoilers ? 'primary' : 'ghost'}
                size="xs"
                rounded="lg"
                icon={effectiveRevealSpoilers ? EyeOff : Eye}
                onClick={() => setLocalRevealSpoilers((prev) => !prev)}
                disabled={prefs.revealAllSpoilers}
                title="Toggle hidden ||spoiler|| answers inside this note"
              >
                {effectiveRevealSpoilers ? 'Revealed' : 'Spoilers'}
              </Button>

              <Button
                variant="ghost"
                size="xs"
                rounded="lg"
                icon={BookOpen}
                onClick={() => handleOpenLookup('cambridge')}
                title="Look up highlighted word or title on Cambridge Dictionary"
              >
                Dictionary
              </Button>

              <Button
                variant="ghost"
                size="xs"
                rounded="lg"
                icon={ExternalLink}
                onClick={() => handleOpenLookup('youglish')}
                title="Hear native examples of highlighted phrase or title on YouGlish"
              >
                YouGlish
              </Button>
            </>
          }
        />

        {/* Heading Outline Bar */}
        {editorMode !== 'edit' && (
          <NoteOutlineBar
            headings={headings}
            headingIdPrefix="editor-heading-"
          />
        )}

        {/* Main Content View: Read / Edit / Split */}
        <div
          className={cn(
            editorMode === 'split'
              ? 'grid grid-cols-1 gap-4 md:grid-cols-2'
              : 'block'
          )}
        >
          {(editorMode === 'edit' || editorMode === 'split') && (
            <div className="flex flex-col">
              <textarea
                ref={textareaRef}
                rows={14}
                disabled={note.isTrashed}
                value={note.content}
                onChange={handleContentChange}
                placeholder="Write Markdown notes here...&#10;&#10;Tips:&#10;- Use ||answer|| for blurred study answers&#10;- Use [[Note Title]] to link related notes&#10;- Type [ ] or - [ ] at line start for interactive checklists"
                className="min-h-[300px] w-full resize-y rounded-xl border border-black/10 bg-white/60 p-4 font-mono text-xs leading-relaxed text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-white/10 dark:bg-black/25 dark:text-slate-100 dark:focus:border-sky-400"
              />
            </div>
          )}

          {(editorMode === 'read' || editorMode === 'split') && (
            <div
              onDoubleClick={() => {
                if (!note.isTrashed && editorMode === 'read') {
                  setEditorMode('edit');
                }
              }}
              className={cn(
                'min-h-[260px] rounded-xl p-1',
                editorMode === 'split' &&
                  'max-h-[460px] overflow-y-auto border border-black/10 bg-white/45 p-4 dark:border-white/10 dark:bg-black/15'
              )}
            >
              {note.content.trim() ? (
                <NoteMarkdownView
                  content={note.content}
                  revealAllSpoilers={effectiveRevealSpoilers}
                  existingNoteTitles={existingNoteTitles}
                  onNavigateWikiLink={onNavigateWikiLink}
                  headingIdPrefix="editor-heading-"
                  onToggleCheckbox={(line) => onToggleCheckbox(note.id, line)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => !note.isTrashed && setEditorMode('edit')}
                  className="flex h-48 w-full items-center justify-center rounded-xl border border-dashed border-black/10 text-sm text-slate-400 hover:text-slate-600 dark:border-white/10 dark:text-slate-500"
                >
                  Empty note — click to start writing in Markdown
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bidirectional Wiki Backlinks */}
        <NoteBacklinksSection backlinks={backlinks} onOpenNote={onOpenNote} />

        {/* Color Picker Tray */}
        {showColorTray && !note.isTrashed && (
          <div className="rounded-xl bg-black/[0.04] p-3 dark:bg-white/[0.05]">
            <NoteColorPicker
              size="md"
              value={note.color}
              onChange={(c) => onUpdateNote(note.id, { color: c })}
            />
          </div>
        )}

        {/* Label Editor Tray */}
        {showLabelTray && !note.isTrashed && (
          <div className="rounded-xl bg-black/[0.04] p-3 dark:bg-white/[0.05]">
            <NoteLabelEditor
              labels={note.labels}
              existingLabels={existingLabels}
              onChange={(nextLabels) =>
                onUpdateNote(note.id, { labels: nextLabels })
              }
            />
          </div>
        )}
      </div>

      {/* Modal Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/10 px-6 py-3.5 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-1">
          {note.isTrashed ? (
            <>
              <Button
                variant="outline"
                size="xs"
                rounded="lg"
                icon={RotateCcw}
                onClick={() => onRestoreFromTrash(note.id)}
              >
                Restore
              </Button>
              <Button
                variant="error"
                size="xs"
                rounded="lg"
                icon={Trash2}
                onClick={() => onDeletePermanently(note.id)}
              >
                Delete Forever
              </Button>
            </>
          ) : (
            <>
              <Button
                variant={showColorTray ? 'primary' : 'ghost'}
                size="xs"
                rounded="lg"
                icon={Palette}
                ariaLabel="Note color"
                title="Change color"
                onClick={() => setShowColorTray((prev) => !prev)}
              />
              <Button
                variant={showLabelTray ? 'primary' : 'ghost'}
                size="xs"
                rounded="lg"
                icon={Hash}
                ariaLabel="Edit labels"
                title="Edit labels"
                onClick={() => setShowLabelTray((prev) => !prev)}
              />
              <Button
                variant="ghost"
                size="xs"
                rounded="lg"
                icon={Copy}
                title="Copy Markdown to clipboard"
                onClick={handleCopyMarkdown}
              />
              <Button
                variant="ghost"
                size="xs"
                rounded="lg"
                icon={Download}
                title="Download as .md file"
                onClick={handleExportSingleMarkdown}
              />
              <Button
                variant="ghost"
                size="xs"
                rounded="lg"
                icon={CalendarPlus}
                title="Download .ics calendar review reminder"
                onClick={handleDownloadReminderIcs}
              />
              <Button
                variant="ghost"
                size="xs"
                rounded="lg"
                icon={note.isArchived ? ArchiveRestore : Archive}
                title={note.isArchived ? 'Unarchive note' : 'Archive note'}
                onClick={() => onToggleArchive(note.id)}
              />
              <Button
                variant="ghost"
                size="xs"
                rounded="lg"
                icon={Trash2}
                title="Move to Trash"
                onClick={() => onMoveToTrash(note.id)}
                className="hover:text-rose-600 dark:hover:text-rose-400"
              />
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-400 sm:inline dark:text-slate-500">
            Edited {formatRelativeTime(note.updatedAt)}
          </span>
          <Button variant="primary" size="xs" rounded="lg" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}
