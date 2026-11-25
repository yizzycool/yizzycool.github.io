'use client';

import type {
  NoteColor,
  NoteItem,
  NoteLabelSummary,
  NotesLayoutMode,
  NotesPreferences,
  NotesViewScope,
  ParsedKeepNote,
} from '../types';

import Fuse from 'fuse.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  clearTextHandoffQueryParam,
  consumeTextHandoff,
  hasTextHandoffQueryParam,
} from '@/components/tools/common/text-handoff';
import { useToolsDB } from '@/hooks/tools/use-tools-db';
import useToolHotkeys, {
  hasOpenModalDialog,
} from '@/hooks/tools/use-tool-hotkeys';
import toast from '@/utils/toast';

import {
  DEFAULT_NOTES_PREFS,
  NOTES_DB_KEY,
  NOTES_DB_STORE,
  NOTES_PREFS_KEY,
  NOTES_PREFS_STORE,
} from '../constants';
import { convertParsedNoteToNoteItem } from '../utils/keep-takeout-parser';
import {
  exportNotesAsMarkdownZip,
  toggleMarkdownCheckboxAtLine,
  triggerBlobDownload,
} from '../utils/markdown-helpers';

function createNoteId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  labels: string[];
  color: NoteColor;
  isPinned: boolean;
}

export interface UseMarkdownNotesOptions {
  onTriggerNewNote?: () => void;
  suppressEscape?: boolean;
}

export default function useMarkdownNotes({
  onTriggerNewNote,
  suppressEscape = false,
}: UseMarkdownNotesOptions = {}) {
  const {
    isSupported: isDbSupported,
    getValue,
    setValue,
    deleteValue,
  } = useToolsDB();

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [prefs, setPrefs] = useState<NotesPreferences>(DEFAULT_NOTES_PREFS);
  const [isLoaded, setIsLoaded] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [viewScope, setViewScope] = useState<NotesViewScope>('active');

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const notesRef = useRef<NoteItem[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const onTriggerNewNoteRef = useRef(onTriggerNewNote);
  const suppressEscapeRef = useRef(suppressEscape);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    onTriggerNewNoteRef.current = onTriggerNewNote;
  }, [onTriggerNewNote]);

  useEffect(() => {
    suppressEscapeRef.current = suppressEscape;
  }, [suppressEscape]);

  useEffect(() => {
    let cancelled = false;

    async function loadFromDb() {
      if (!isDbSupported) {
        if (!cancelled) {
          notesRef.current = [];
          setNotes([]);
          setIsLoaded(true);
        }
        return;
      }

      try {
        const [storedNotes, storedPrefs] = await Promise.all([
          getValue<NoteItem[]>(NOTES_DB_STORE, NOTES_DB_KEY),
          getValue<NotesPreferences>(NOTES_PREFS_STORE, NOTES_PREFS_KEY),
        ]);

        if (cancelled) return;

        const validNotes = Array.isArray(storedNotes) ? storedNotes : [];
        let nextNotes = validNotes;

        if (hasTextHandoffQueryParam()) {
          clearTextHandoffQueryParam();
          const handoffPayload = await consumeTextHandoff(
            getValue,
            deleteValue,
            'markdown-notes'
          );
          if (!cancelled && handoffPayload) {
            const now = Date.now();
            const importedNote: NoteItem = {
              id: createNoteId(),
              title: handoffPayload.title || 'OCR Extract',
              content: handoffPayload.text,
              labels:
                handoffPayload.labels && handoffPayload.labels.length > 0
                  ? handoffPayload.labels
                  : ['OCR'],
              color: 'default',
              isPinned: false,
              isArchived: false,
              isTrashed: false,
              createdAt: now,
              updatedAt: now,
            };
            nextNotes = [importedNote, ...validNotes];
            await setValue(NOTES_DB_STORE, NOTES_DB_KEY, nextNotes).catch(
              () => {}
            );
            setEditingNoteId(importedNote.id);
            toast.success('Imported extracted text into a new note');
          }
        }

        if (cancelled) return;

        notesRef.current = nextNotes;
        setNotes(nextNotes);

        if (storedPrefs) {
          setPrefs({ ...DEFAULT_NOTES_PREFS, ...storedPrefs });
        }
      } catch {
        if (!cancelled) {
          toast.error('Failed to read local notes from IndexedDB');
        }
      } finally {
        if (!cancelled) {
          setIsLoaded(true);
        }
      }
    }

    void loadFromDb();

    return () => {
      cancelled = true;
    };
  }, [isDbSupported, getValue, setValue, deleteValue]);

  const commitNotes = useCallback(
    (nextNotes: NoteItem[]) => {
      notesRef.current = nextNotes;
      setNotes(nextNotes);
      if (isDbSupported) {
        void setValue(NOTES_DB_STORE, NOTES_DB_KEY, nextNotes).catch(() => {
          toast.error('Failed to save changes locally');
        });
      }
    },
    [isDbSupported, setValue]
  );

  const updatePrefs = useCallback(
    (partial: Partial<NotesPreferences>) => {
      const next = { ...prefs, ...partial };
      setPrefs(next);
      if (isDbSupported) {
        void setValue(NOTES_PREFS_STORE, NOTES_PREFS_KEY, next).catch(() => {});
      }
    },
    [prefs, isDbSupported, setValue]
  );

  const createNote = useCallback(
    (input: CreateNoteInput) => {
      const title = input.title.trim();
      const content = input.content.trimEnd();
      if (!title && !content.trim()) {
        return null;
      }

      const orderedValues = notesRef.current
        .map((n) => n.order)
        .filter((v): v is number => typeof v === 'number');
      const nextOrder =
        orderedValues.length > 0 ? Math.min(...orderedValues) - 1 : undefined;

      const now = Date.now();
      const newNote: NoteItem = {
        id: createNoteId(),
        title,
        content,
        labels: input.labels,
        color: input.color,
        isPinned: input.isPinned,
        isArchived: false,
        isTrashed: false,
        createdAt: now,
        updatedAt: now,
        ...(nextOrder !== undefined ? { order: nextOrder } : {}),
      };

      commitNotes([newNote, ...notesRef.current]);
      toast.success('Note added');
      return newNote;
    },
    [commitNotes]
  );

  const updateNote = useCallback(
    (
      noteId: string,
      patch: Partial<
        Pick<
          NoteItem,
          | 'title'
          | 'content'
          | 'labels'
          | 'color'
          | 'isPinned'
          | 'isArchived'
          | 'isTrashed'
        >
      >
    ) => {
      const next = notesRef.current.map((note) =>
        note.id === noteId
          ? {
              ...note,
              ...patch,
              updatedAt: Date.now(),
            }
          : note
      );
      commitNotes(next);
    },
    [commitNotes]
  );

  const togglePin = useCallback(
    (noteId: string) => {
      const target = notesRef.current.find((n) => n.id === noteId);
      if (!target) return;
      const nextPinned = !target.isPinned;
      updateNote(noteId, {
        isPinned: nextPinned,
        isArchived: nextPinned ? false : target.isArchived,
      });
    },
    [updateNote]
  );

  const changeColor = useCallback(
    (noteId: string, color: NoteColor) => {
      updateNote(noteId, { color });
    },
    [updateNote]
  );

  const toggleArchive = useCallback(
    (noteId: string) => {
      const target = notesRef.current.find((n) => n.id === noteId);
      if (!target) return;
      const nextArchived = !target.isArchived;
      updateNote(noteId, {
        isArchived: nextArchived,
        isPinned: nextArchived ? false : target.isPinned,
      });
      toast.info(nextArchived ? 'Note archived' : 'Note unarchived');
    },
    [updateNote]
  );

  const moveToTrash = useCallback(
    (noteId: string) => {
      updateNote(noteId, {
        isTrashed: true,
        isPinned: false,
      });
      if (editingNoteId === noteId) {
        setEditingNoteId(null);
      }
      toast.info('Moved note to Trash');
    },
    [updateNote, editingNoteId]
  );

  const restoreFromTrash = useCallback(
    (noteId: string) => {
      updateNote(noteId, { isTrashed: false });
      toast.success('Restored note from Trash');
    },
    [updateNote]
  );

  const deletePermanently = useCallback(
    (noteId: string) => {
      commitNotes(notesRef.current.filter((n) => n.id !== noteId));
      if (editingNoteId === noteId) {
        setEditingNoteId(null);
      }
      toast.info('Note deleted permanently');
    },
    [commitNotes, editingNoteId]
  );

  const emptyTrash = useCallback(() => {
    commitNotes(notesRef.current.filter((n) => !n.isTrashed));
    toast.info('Emptied Trash');
  }, [commitNotes]);

  const duplicateNote = useCallback(
    (noteId: string) => {
      const target = notesRef.current.find((n) => n.id === noteId);
      if (!target) return;
      const orderedValues = notesRef.current
        .map((n) => n.order)
        .filter((v): v is number => typeof v === 'number');
      const nextOrder =
        orderedValues.length > 0 ? Math.min(...orderedValues) - 1 : undefined;
      const now = Date.now();
      const copy: NoteItem = {
        ...target,
        id: createNoteId(),
        title: target.title ? `${target.title} (Copy)` : 'Copy',
        isPinned: false,
        isArchived: false,
        isTrashed: false,
        syncFileName: undefined,
        createdAt: now,
        updatedAt: now,
        ...(nextOrder !== undefined ? { order: nextOrder } : {}),
      };
      commitNotes([copy, ...notesRef.current]);
      toast.success('Note duplicated');
    },
    [commitNotes]
  );

  const reorderNotes = useCallback(
    (reorderedSectionIds: string[]) => {
      if (reorderedSectionIds.length === 0) return;
      const orderById = new Map<string, number>();
      reorderedSectionIds.forEach((id, index) => {
        orderById.set(id, index);
      });

      const next = notesRef.current.map((note) =>
        orderById.has(note.id)
          ? {
              ...note,
              order: orderById.get(note.id),
            }
          : note
      );
      commitNotes(next);
    },
    [commitNotes]
  );

  const findOrCreateNoteByTitle = useCallback(
    (targetTitle: string): NoteItem => {
      const cleanedTitle = targetTitle.trim();
      const normalized = cleanedTitle.toLowerCase();
      const existing = notesRef.current.find(
        (n) => !n.isTrashed && n.title.trim().toLowerCase() === normalized
      );

      if (existing) {
        setViewScope(existing.isArchived ? 'archived' : 'active');
        setEditingNoteId(existing.id);
        return existing;
      }

      const orderedValues = notesRef.current
        .map((n) => n.order)
        .filter((v): v is number => typeof v === 'number');
      const nextOrder =
        orderedValues.length > 0 ? Math.min(...orderedValues) - 1 : undefined;
      const now = Date.now();
      const created: NoteItem = {
        id: createNoteId(),
        title: cleanedTitle,
        content: '',
        labels: [],
        color: 'default',
        isPinned: false,
        isArchived: false,
        isTrashed: false,
        createdAt: now,
        updatedAt: now,
        ...(nextOrder !== undefined ? { order: nextOrder } : {}),
      };

      commitNotes([created, ...notesRef.current]);
      setViewScope('active');
      setEditingNoteId(created.id);
      toast.success(`Created linked note "${created.title}"`);
      return created;
    },
    [commitNotes]
  );

  const toggleNoteCheckbox = useCallback(
    (noteId: string, lineNumber: number) => {
      const target = notesRef.current.find((n) => n.id === noteId);
      if (!target) return;
      const nextContent = toggleMarkdownCheckboxAtLine(
        target.content,
        lineNumber
      );
      if (nextContent !== target.content) {
        updateNote(noteId, { content: nextContent });
      }
    },
    [updateNote]
  );

  const importParsedNotes = useCallback(
    (parsedItems: ParsedKeepNote[]) => {
      if (parsedItems.length === 0) return;
      const converted = parsedItems.map((item, idx) =>
        convertParsedNoteToNoteItem(item, idx)
      );
      commitNotes([...converted, ...notesRef.current]);
      toast.success(
        `Imported ${converted.length} ${converted.length === 1 ? 'note' : 'notes'}`
      );
    },
    [commitNotes]
  );

  const exportMarkdownZip = useCallback(() => {
    const exportable = notesRef.current.filter((n) => !n.isTrashed);
    if (exportable.length === 0) {
      toast.warning('No active or archived notes to export');
      return;
    }
    const zipBlob = exportNotesAsMarkdownZip(exportable);
    const dateStamp = new Date().toISOString().slice(0, 10);
    triggerBlobDownload(zipBlob, `markdown-notes-${dateStamp}.zip`);
    toast.success(`Exported ${exportable.length} notes as Markdown ZIP`);
  }, []);

  const exportJsonBackup = useCallback(() => {
    const payload = JSON.stringify(notesRef.current, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const dateStamp = new Date().toISOString().slice(0, 10);
    triggerBlobDownload(blob, `markdown-notes-backup-${dateStamp}.json`);
    toast.success('Downloaded JSON backup');
  }, []);

  const importJsonBackup = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text) as unknown;
        if (!Array.isArray(parsed)) {
          toast.error('Invalid backup format. Expected a JSON array.');
          return;
        }
        const existingIds = new Set(notesRef.current.map((n) => n.id));
        const validNew: NoteItem[] = [];
        for (const item of parsed) {
          if (
            item &&
            typeof item === 'object' &&
            typeof (item as NoteItem).content === 'string' &&
            typeof (item as NoteItem).title === 'string'
          ) {
            const candidate = item as NoteItem;
            validNew.push({
              ...candidate,
              id:
                candidate.id && !existingIds.has(candidate.id)
                  ? candidate.id
                  : createNoteId(),
              labels: Array.isArray(candidate.labels) ? candidate.labels : [],
              createdAt: candidate.createdAt || Date.now(),
              updatedAt: candidate.updatedAt || Date.now(),
            });
          }
        }
        if (validNew.length === 0) {
          toast.warning('No valid notes found in backup file');
          return;
        }
        commitNotes([...validNew, ...notesRef.current]);
        toast.success(
          `Restored ${validNew.length} ${validNew.length === 1 ? 'note' : 'notes'} from backup`
        );
      } catch {
        toast.error('Failed to parse JSON backup file');
      }
    },
    [commitNotes]
  );

  // Derived scope counts
  const scopeCounts = useMemo(() => {
    let active = 0;
    let archived = 0;
    let trash = 0;
    for (const note of notes) {
      if (note.isTrashed) trash += 1;
      else if (note.isArchived) archived += 1;
      else active += 1;
    }
    return { active, archived, trash };
  }, [notes]);

  // All unique labels from non-trashed notes sorted by count desc
  const allLabels: NoteLabelSummary[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const note of notes) {
      if (note.isTrashed || note.isArchived) continue;
      for (const label of note.labels) {
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [notes]);

  // Base notes for active scope
  const scopedNotes = useMemo(() => {
    return notes
      .filter((note) => {
        if (viewScope === 'trash') return note.isTrashed;
        if (viewScope === 'archived') return note.isArchived && !note.isTrashed;
        return !note.isArchived && !note.isTrashed;
      })
      .filter((note) => {
        if (viewScope !== 'active' || !selectedLabel) return true;
        return note.labels.includes(selectedLabel);
      })
      .sort((a, b) => {
        const aHasOrder = typeof a.order === 'number';
        const bHasOrder = typeof b.order === 'number';
        if (aHasOrder && bHasOrder) {
          return a.order !== b.order
            ? (a.order ?? 0) - (b.order ?? 0)
            : b.updatedAt - a.updatedAt;
        }
        if (aHasOrder !== bHasOrder) {
          return aHasOrder ? -1 : 1;
        }
        return b.updatedAt - a.updatedAt;
      });
  }, [notes, viewScope, selectedLabel]);

  const existingNoteTitles = useMemo(() => {
    const set = new Set<string>();
    for (const note of notes) {
      if (!note.isTrashed && note.title.trim()) {
        set.add(note.title.trim().toLowerCase());
      }
    }
    return set;
  }, [notes]);

  // Fuzzy search with Fuse.js
  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return scopedNotes;
    const fuse = new Fuse(scopedNotes, {
      keys: ['title', 'content', 'labels'],
      threshold: 0.35,
      ignoreLocation: true,
    });
    return fuse.search(query).map((res) => res.item);
  }, [scopedNotes, searchQuery]);

  const pinnedNotes = useMemo(() => {
    if (viewScope !== 'active') return [];
    return filteredNotes.filter((note) => note.isPinned);
  }, [filteredNotes, viewScope]);

  const otherNotes = useMemo(() => {
    if (viewScope !== 'active') return filteredNotes;
    return filteredNotes.filter((note) => !note.isPinned);
  }, [filteredNotes, viewScope]);

  const editingNote = useMemo(
    () => notes.find((n) => n.id === editingNoteId) ?? null,
    [notes, editingNoteId]
  );

  // Keyboard shortcuts
  useToolHotkeys({
    onClear: () => {
      if (suppressEscapeRef.current) return;
      if (editingNoteId) {
        setEditingNoteId(null);
      } else if (searchQuery) {
        setSearchQuery('');
      }
    },
  });

  // Focus search input ('/') and open Quick Capture ('N')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        editingNoteId ||
        isImportModalOpen ||
        suppressEscapeRef.current ||
        e.defaultPrevented ||
        hasOpenModalDialog()
      ) {
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (isTyping) return;

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (
        !e.shiftKey &&
        (e.key.toLowerCase() === 'n' || e.code === 'KeyN')
      ) {
        e.preventDefault();
        setViewScope('active');
        onTriggerNewNoteRef.current?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingNoteId, isImportModalOpen]);

  return {
    isLoaded,
    notes,
    existingNoteTitles,
    prefs,
    updatePrefs,
    setLayout: (layout: NotesLayoutMode) => updatePrefs({ layout }),
    toggleRevealAllSpoilers: () =>
      updatePrefs({ revealAllSpoilers: !prefs.revealAllSpoilers }),
    searchInputRef,
    searchQuery,
    setSearchQuery,
    selectedLabel,
    setSelectedLabel,
    viewScope,
    setViewScope: (scope: NotesViewScope) => {
      setViewScope(scope);
      if (scope !== 'active') {
        setSelectedLabel(null);
      }
    },
    scopeCounts,
    allLabels,
    filteredNotes,
    pinnedNotes,
    otherNotes,
    editingNote,
    editingNoteId,
    setEditingNoteId,
    isImportModalOpen,
    setIsImportModalOpen,
    createNote,
    updateNote,
    togglePin,
    changeColor,
    toggleArchive,
    moveToTrash,
    restoreFromTrash,
    deletePermanently,
    emptyTrash,
    duplicateNote,
    reorderNotes,
    findOrCreateNoteByTitle,
    applyExternalNotesUpdate: commitNotes,
    toggleNoteCheckbox,
    importParsedNotes,
    exportMarkdownZip,
    exportJsonBackup,
    importJsonBackup,
  };
}
