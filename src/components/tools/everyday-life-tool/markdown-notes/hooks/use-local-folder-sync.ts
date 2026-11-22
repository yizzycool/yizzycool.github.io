'use client';

import type {
  LocalFolderSyncStatus,
  LocalFolderSyncSummary,
  NoteItem,
} from '../types';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { useToolsDB } from '@/hooks/tools/use-tools-db';
import toast from '@/utils/toast';

import { NOTES_SYNC_HANDLE_KEY, NOTES_SYNC_HANDLE_STORE } from '../constants';
import { parseMarkdownNoteFile } from '../utils/keep-takeout-parser';
import {
  noteToMarkdownFile,
  sanitizeFileName,
} from '../utils/markdown-helpers';

interface SyncPermissionDescriptor {
  mode?: 'read' | 'readwrite';
}

type SyncPermissionState = 'granted' | 'denied' | 'prompt';

interface SyncFileHandle {
  kind: 'file';
  name: string;
  getFile: () => Promise<File>;
  createWritable: () => Promise<{
    write: (data: string) => Promise<void>;
    close: () => Promise<void>;
  }>;
}

interface SyncDirectoryHandle {
  kind: 'directory';
  name: string;
  entries: () => AsyncIterableIterator<
    [string, SyncFileHandle | { kind: string }]
  >;
  getFileHandle: (
    name: string,
    options?: { create?: boolean }
  ) => Promise<SyncFileHandle>;
  removeEntry: (name: string) => Promise<void>;
  queryPermission?: (
    desc?: SyncPermissionDescriptor
  ) => Promise<SyncPermissionState>;
  requestPermission?: (
    desc?: SyncPermissionDescriptor
  ) => Promise<SyncPermissionState>;
}

type DirectoryPickerWindow = Window & {
  showDirectoryPicker?: (options?: {
    id?: string;
    mode?: 'read' | 'readwrite';
  }) => Promise<SyncDirectoryHandle>;
};

interface DiskNoteEntry {
  fileName: string;
  parsed: ReturnType<typeof parseMarkdownNoteFile>;
  updatedAt: number;
  createdAt: number;
  hasFrontmatterId: boolean;
}

const TIMESTAMP_EPSILON_MS = 1500;

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

function getServerSnapshot() {
  return false;
}

function createSyncedNoteId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

async function writeNoteToDirectory(
  dirHandle: SyncDirectoryHandle,
  fileName: string,
  note: NoteItem
): Promise<void> {
  const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  try {
    await writable.write(noteToMarkdownFile(note));
  } finally {
    await writable.close();
  }
}

function allocateUniqueFileName(
  title: string,
  usedNames: Set<string>,
  preferredName?: string
): string {
  if (preferredName) {
    usedNames.add(preferredName);
    return preferredName;
  }

  const base = sanitizeFileName(title || 'untitled-note');
  let candidate = `${base}.md`;
  let counter = 2;

  while (usedNames.has(candidate)) {
    candidate = `${base}-${counter}.md`;
    counter += 1;
  }

  usedNames.add(candidate);
  return candidate;
}

type Params = {
  notes: NoteItem[];
  isLoaded: boolean;
  onCommitSyncedNotes: (nextNotes: NoteItem[]) => void;
};

/**
 * Progressive-enhancement bidirectional `.md` sync against a user-selected local folder
 * (e.g. Google Drive / iCloud Drive / Obsidian vault) via File System Access API.
 */
export default function useLocalFolderSync({
  notes,
  isLoaded,
  onCommitSyncedNotes,
}: Params) {
  const isSupported = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const {
    isSupported: isDbSupported,
    getValue,
    setValue,
    deleteValue,
  } = useToolsDB();

  const [status, setStatus] = useState<LocalFolderSyncStatus>('disconnected');
  const [folderName, setFolderName] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  const handleRef = useRef<SyncDirectoryHandle | null>(null);
  const notesRef = useRef<NoteItem[]>(notes);
  const isSyncingRef = useRef(false);
  const isApplyingSyncRef = useRef(false);
  const lastPushedUpdatedRef = useRef<Map<string, number>>(new Map());
  const onCommitRef = useRef(onCommitSyncedNotes);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    onCommitRef.current = onCommitSyncedNotes;
  }, [onCommitSyncedNotes]);

  const runBidirectionalSync = useCallback(
    async (
      dirHandle: SyncDirectoryHandle,
      silent = false
    ): Promise<boolean> => {
      if (isSyncingRef.current) return false;
      isSyncingRef.current = true;
      setStatus('syncing');

      try {
        const perm = await dirHandle.queryPermission?.({ mode: 'readwrite' });
        if (perm && perm !== 'granted') {
          setStatus('needs-permission');
          return false;
        }

        const diskEntries: DiskNoteEntry[] = [];
        const usedFileNames = new Set<string>();

        for await (const [entryName, entryHandle] of dirHandle.entries()) {
          if (
            entryHandle.kind !== 'file' ||
            entryName.startsWith('.') ||
            !/\.(md|markdown)$/i.test(entryName)
          ) {
            continue;
          }

          usedFileNames.add(entryName);
          const fileHandle = entryHandle as SyncFileHandle;
          const file = await fileHandle.getFile();
          const rawText = await file.text();
          const parsed = parseMarkdownNoteFile(rawText, entryName);

          const hasFrontmatterUpdated = /^updatedAt:/m.test(rawText);
          const hasFrontmatterCreated = /^createdAt:/m.test(rawText);
          const hasFrontmatterId = /^id:/m.test(rawText);

          diskEntries.push({
            fileName: entryName,
            parsed,
            updatedAt: hasFrontmatterUpdated
              ? parsed.updatedAt
              : file.lastModified || parsed.updatedAt,
            createdAt: hasFrontmatterCreated
              ? parsed.createdAt
              : file.lastModified || parsed.createdAt,
            hasFrontmatterId,
          });
        }

        const diskById = new Map<string, DiskNoteEntry>();
        const diskByName = new Map<string, DiskNoteEntry>();
        for (const entry of diskEntries) {
          if (entry.parsed.id) {
            diskById.set(entry.parsed.id, entry);
          }
          diskByName.set(entry.fileName, entry);
        }

        const currentNotes = notesRef.current;
        const matchedFileNames = new Set<string>();
        const existingIds = new Set(currentNotes.map((n) => n.id));
        const nextNotes: NoteItem[] = [];

        let pulledCount = 0;
        let pushedCount = 0;
        let mutatedState = false;

        for (const localNote of currentNotes) {
          const matched =
            diskById.get(localNote.id) ??
            (localNote.syncFileName
              ? diskByName.get(localNote.syncFileName)
              : undefined);

          if (matched) {
            matchedFileNames.add(matched.fileName);

            if (localNote.isTrashed) {
              if (
                localNote.updatedAt >
                matched.updatedAt + TIMESTAMP_EPSILON_MS
              ) {
                try {
                  await dirHandle.removeEntry(matched.fileName);
                  usedFileNames.delete(matched.fileName);
                  mutatedState = true;
                  nextNotes.push({ ...localNote, syncFileName: undefined });
                  pushedCount += 1;
                  continue;
                } catch {
                  // Ignore removal errors
                }
              } else if (
                matched.updatedAt >
                localNote.updatedAt + TIMESTAMP_EPSILON_MS
              ) {
                pulledCount += 1;
                mutatedState = true;
                const updated: NoteItem = {
                  ...localNote,
                  title: matched.parsed.title,
                  content: matched.parsed.content,
                  labels: matched.parsed.labels,
                  color: matched.parsed.color,
                  isPinned: matched.parsed.isPinned,
                  isArchived: matched.parsed.isArchived,
                  isTrashed: false,
                  updatedAt: matched.updatedAt,
                  order: matched.parsed.order ?? localNote.order,
                  syncFileName: matched.fileName,
                };
                nextNotes.push(updated);
                lastPushedUpdatedRef.current.set(updated.id, updated.updatedAt);
                continue;
              }
              nextNotes.push(localNote);
              continue;
            }

            if (
              matched.updatedAt >
              localNote.updatedAt + TIMESTAMP_EPSILON_MS
            ) {
              pulledCount += 1;
              mutatedState = true;
              const pulled: NoteItem = {
                ...localNote,
                title: matched.parsed.title,
                content: matched.parsed.content,
                labels: matched.parsed.labels,
                color: matched.parsed.color,
                isPinned: matched.parsed.isPinned,
                isArchived: matched.parsed.isArchived,
                order: matched.parsed.order ?? localNote.order,
                updatedAt: matched.updatedAt,
                syncFileName: matched.fileName,
              };
              nextNotes.push(pulled);
              lastPushedUpdatedRef.current.set(pulled.id, pulled.updatedAt);
              continue;
            }

            if (
              localNote.updatedAt > matched.updatedAt + TIMESTAMP_EPSILON_MS ||
              !matched.hasFrontmatterId
            ) {
              await writeNoteToDirectory(
                dirHandle,
                matched.fileName,
                localNote
              );
              pushedCount += 1;
            }

            const synced =
              localNote.syncFileName === matched.fileName
                ? localNote
                : { ...localNote, syncFileName: matched.fileName };
            if (synced !== localNote) {
              mutatedState = true;
            }
            nextNotes.push(synced);
            lastPushedUpdatedRef.current.set(synced.id, synced.updatedAt);
          } else {
            if (localNote.isTrashed) {
              nextNotes.push(localNote);
              continue;
            }

            const targetFileName = allocateUniqueFileName(
              localNote.title,
              usedFileNames,
              localNote.syncFileName
            );
            await writeNoteToDirectory(dirHandle, targetFileName, localNote);
            pushedCount += 1;
            mutatedState = true;

            const synced: NoteItem = {
              ...localNote,
              syncFileName: targetFileName,
            };
            nextNotes.push(synced);
            lastPushedUpdatedRef.current.set(synced.id, synced.updatedAt);
          }
        }

        // Import disk-only .md files into IndexedDB
        const importedFromDisk: NoteItem[] = [];
        for (const entry of diskEntries) {
          if (matchedFileNames.has(entry.fileName)) continue;

          const id =
            entry.parsed.id && !existingIds.has(entry.parsed.id)
              ? entry.parsed.id
              : createSyncedNoteId();
          existingIds.add(id);

          const item: NoteItem = {
            id,
            title: entry.parsed.title,
            content: entry.parsed.content,
            labels: entry.parsed.labels,
            color: entry.parsed.color,
            isPinned: entry.parsed.isPinned,
            isArchived: entry.parsed.isArchived,
            isTrashed: false,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
            syncFileName: entry.fileName,
            ...(typeof entry.parsed.order === 'number'
              ? { order: entry.parsed.order }
              : {}),
          };

          importedFromDisk.push(item);
          lastPushedUpdatedRef.current.set(item.id, item.updatedAt);
          pulledCount += 1;
          mutatedState = true;
        }

        if (mutatedState) {
          isApplyingSyncRef.current = true;
          onCommitRef.current([...importedFromDisk, ...nextNotes]);
          setTimeout(() => {
            isApplyingSyncRef.current = false;
          }, 0);
        }

        const syncedTime = Date.now();
        setLastSyncedAt(syncedTime);
        setStatus('connected');

        if (!silent) {
          if (pulledCount === 0 && pushedCount === 0) {
            toast.success(`Folder "${dirHandle.name}" is up to date`);
          } else {
            toast.success(
              `Synced with "${dirHandle.name}" (${pulledCount} pulled, ${pushedCount} pushed)`
            );
          }
        }

        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Folder sync failed';
        setStatus(handleRef.current ? 'needs-permission' : 'disconnected');
        if (!silent) {
          toast.error(message);
        }
        return false;
      } finally {
        isSyncingRef.current = false;
      }
    },
    []
  );

  // Restore saved folder handle from IndexedDB once initial notes load completes
  useEffect(() => {
    if (!isSupported || !isDbSupported || !isLoaded) return;

    let cancelled = false;
    async function restoreSavedFolder() {
      try {
        const saved = await getValue<SyncDirectoryHandle>(
          NOTES_SYNC_HANDLE_STORE,
          NOTES_SYNC_HANDLE_KEY
        );
        if (cancelled || !saved) return;

        handleRef.current = saved;
        setFolderName(saved.name);

        const perm = await saved.queryPermission?.({ mode: 'readwrite' });
        if (cancelled) return;

        if (perm === 'granted') {
          setStatus('connected');
          await runBidirectionalSync(saved, true);
        } else {
          setStatus('needs-permission');
        }
      } catch {
        if (!cancelled) {
          setStatus('disconnected');
        }
      }
    }

    void restoreSavedFolder();

    return () => {
      cancelled = true;
    };
  }, [isSupported, isDbSupported, isLoaded, getValue, runBidirectionalSync]);

  // Debounced auto-push to local folder on user edits while connected
  useEffect(() => {
    if (
      !isSupported ||
      status !== 'connected' ||
      !handleRef.current ||
      isApplyingSyncRef.current
    ) {
      return;
    }

    const dirHandle = handleRef.current;
    const dirtyNotes = notes.filter((note) => {
      const lastPushed = lastPushedUpdatedRef.current.get(note.id);
      return lastPushed === undefined || note.updatedAt > lastPushed;
    });

    if (dirtyNotes.length === 0) return;

    const timer = setTimeout(() => {
      void (async () => {
        if (isSyncingRef.current || !handleRef.current) return;

        let assignedFileName = false;
        const usedNames = new Set(
          notesRef.current
            .map((n) => n.syncFileName)
            .filter((v): v is string => Boolean(v))
        );
        const fileNameUpdates = new Map<string, string | undefined>();

        for (const note of dirtyNotes) {
          try {
            if (note.isTrashed) {
              if (note.syncFileName) {
                await dirHandle.removeEntry(note.syncFileName).catch(() => {});
                fileNameUpdates.set(note.id, undefined);
                assignedFileName = true;
              }
              lastPushedUpdatedRef.current.set(note.id, note.updatedAt);
              continue;
            }

            const targetName = allocateUniqueFileName(
              note.title,
              usedNames,
              note.syncFileName
            );
            await writeNoteToDirectory(dirHandle, targetName, note);
            lastPushedUpdatedRef.current.set(note.id, note.updatedAt);

            if (note.syncFileName !== targetName) {
              fileNameUpdates.set(note.id, targetName);
              assignedFileName = true;
            }
          } catch {
            // Stop silent auto-push failures without disrupting local IndexedDB editing
          }
        }

        if (assignedFileName) {
          isApplyingSyncRef.current = true;
          onCommitRef.current(
            notesRef.current.map((n) =>
              fileNameUpdates.has(n.id)
                ? { ...n, syncFileName: fileNameUpdates.get(n.id) }
                : n
            )
          );
          setTimeout(() => {
            isApplyingSyncRef.current = false;
          }, 0);
        }

        setLastSyncedAt(Date.now());
      })();
    }, 1200);

    return () => clearTimeout(timer);
  }, [notes, status, isSupported]);

  const connectFolder = useCallback(async () => {
    if (!isSupported) return;
    const picker = (window as DirectoryPickerWindow).showDirectoryPicker;
    if (!picker) return;

    try {
      const selectedHandle = await picker({
        id: 'yizzypeasy-markdown-notes',
        mode: 'readwrite',
      });

      handleRef.current = selectedHandle;
      setFolderName(selectedHandle.name);

      if (isDbSupported) {
        await setValue(
          NOTES_SYNC_HANDLE_STORE,
          NOTES_SYNC_HANDLE_KEY,
          selectedHandle
        ).catch(() => {});
      }

      await runBidirectionalSync(selectedHandle, false);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      toast.error('Unable to open selected folder');
    }
  }, [isSupported, isDbSupported, setValue, runBidirectionalSync]);

  const reconnectFolder = useCallback(async () => {
    const dirHandle = handleRef.current;
    if (!dirHandle) {
      await connectFolder();
      return;
    }

    try {
      const perm = await dirHandle.requestPermission?.({ mode: 'readwrite' });
      if (perm === 'granted') {
        await runBidirectionalSync(dirHandle, false);
      } else {
        toast.warning('Folder write permission was not granted');
      }
    } catch {
      await connectFolder();
    }
  }, [connectFolder, runBidirectionalSync]);

  const syncNow = useCallback(async () => {
    const dirHandle = handleRef.current;
    if (!dirHandle) return;
    await runBidirectionalSync(dirHandle, false);
  }, [runBidirectionalSync]);

  const disconnectFolder = useCallback(async () => {
    handleRef.current = null;
    lastPushedUpdatedRef.current.clear();
    setFolderName(null);
    setLastSyncedAt(null);
    setStatus('disconnected');

    if (isDbSupported) {
      await deleteValue(NOTES_SYNC_HANDLE_STORE, NOTES_SYNC_HANDLE_KEY).catch(
        () => {}
      );
    }
    toast.info('Disconnected local sync folder');
  }, [isDbSupported, deleteValue]);

  const syncState: LocalFolderSyncSummary = {
    isSupported,
    status: isSupported ? status : 'unsupported',
    folderName,
    lastSyncedAt,
  };

  return {
    syncState,
    connectFolder,
    reconnectFolder,
    syncNow,
    disconnectFolder,
  };
}
