import type { NoteColor, NoteItem, ParsedKeepNote } from '../types';

import * as fflate from 'fflate';

import { KEEP_COLOR_MAP, NOTE_COLOR_ORDER } from '../constants';

function createTempId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseTimestampMs(raw: unknown, divisor: number): number {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
    return Math.floor(raw / divisor);
  }
  if (typeof raw === 'string' && raw.trim()) {
    const parsedNum = Number(raw);
    if (Number.isFinite(parsedNum) && parsedNum > 0) {
      return Math.floor(parsedNum / divisor);
    }
    const parsedDate = Date.parse(raw);
    if (Number.isFinite(parsedDate) && parsedDate > 0) {
      return parsedDate;
    }
  }
  return Date.now();
}

function isValidNoteColor(value: unknown): value is NoteColor {
  return (
    typeof value === 'string' && NOTE_COLOR_ORDER.includes(value as NoteColor)
  );
}

/**
 * Parses a single Google Keep Takeout JSON note object or a serialized NoteItem object.
 */
export function parseKeepJsonObject(
  raw: Record<string, unknown>,
  sourceFile: string
): ParsedKeepNote | null {
  // Support native Markdown Notes backup items directly
  if (
    typeof raw.content === 'string' &&
    typeof raw.title === 'string' &&
    typeof raw.id === 'string'
  ) {
    const labels = Array.isArray(raw.labels)
      ? raw.labels.filter((l): l is string => typeof l === 'string')
      : [];
    return {
      tempId: createTempId('imp'),
      title: raw.title,
      content: raw.content,
      labels,
      color: isValidNoteColor(raw.color) ? raw.color : 'default',
      isPinned: Boolean(raw.isPinned),
      isArchived: Boolean(raw.isArchived),
      isTrashed: Boolean(raw.isTrashed),
      createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
      updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
      sourceFile,
    };
  }

  // Validate Google Takeout Keep JSON structure
  const hasKeepShape =
    'textContent' in raw ||
    'listContent' in raw ||
    ('title' in raw && 'userEditedTimestampUsec' in raw);
  if (!hasKeepShape) {
    return null;
  }

  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  const textContent =
    typeof raw.textContent === 'string' ? raw.textContent : '';

  let listMarkdown = '';
  if (Array.isArray(raw.listContent)) {
    listMarkdown = raw.listContent
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null;
        const item = entry as Record<string, unknown>;
        const text = typeof item.text === 'string' ? item.text.trim() : '';
        if (!text) return null;
        return `- [${item.isChecked ? 'x' : ' '}] ${text}`;
      })
      .filter((line): line is string => Boolean(line))
      .join('\n');
  }

  const contentParts = [textContent.trim(), listMarkdown].filter(Boolean);
  const content = contentParts.join('\n\n');

  const labels: string[] = [];
  if (Array.isArray(raw.labels)) {
    for (const labelObj of raw.labels) {
      if (labelObj && typeof labelObj === 'object') {
        const name = (labelObj as Record<string, unknown>).name;
        if (typeof name === 'string' && name.trim()) {
          labels.push(name.trim());
        }
      }
    }
  }

  const rawColor =
    typeof raw.color === 'string' ? raw.color.toUpperCase() : 'DEFAULT';
  const color: NoteColor = KEEP_COLOR_MAP[rawColor] ?? 'default';

  const createdAt = parseTimestampMs(raw.createdTimestampUsec, 1000);
  const updatedAt = parseTimestampMs(raw.userEditedTimestampUsec, 1000);

  return {
    tempId: createTempId('keep'),
    title,
    content,
    labels,
    color,
    isPinned: Boolean(raw.isPinned),
    isArchived: Boolean(raw.isArchived),
    isTrashed: Boolean(raw.isTrashed),
    createdAt,
    updatedAt,
    sourceFile,
  };
}

/**
 * Parses a Markdown file (with optional YAML frontmatter) into a ParsedKeepNote.
 */
export function parseMarkdownNoteFile(
  rawText: string,
  fileName: string
): ParsedKeepNote {
  let id: string | undefined;
  let order: number | undefined;
  let title = fileName
    .replace(/\.(md|markdown|txt)$/i, '')
    .replace(/[-_]/g, ' ');
  let content = rawText;
  let labels: string[] = [];
  let color: NoteColor = 'default';
  let isPinned = false;
  let isArchived = false;
  let createdAt = Date.now();
  let updatedAt = Date.now();

  const fmMatch = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(rawText);
  if (fmMatch) {
    const yamlBlock = fmMatch[1];
    content = fmMatch[2];

    for (const line of yamlBlock.split(/\r?\n/)) {
      const idMatch = /^id:\s*"?(.+?)"?\s*$/.exec(line);
      if (idMatch) {
        id = idMatch[1].replace(/\\"/g, '"').trim() || undefined;
      }

      const titleMatch = /^title:\s*"?(.+?)"?\s*$/.exec(line);
      if (titleMatch) {
        title = titleMatch[1].replace(/\\"/g, '"');
      }

      const labelsMatch = /^labels:\s*\[(.*)\]\s*$/.exec(line);
      if (labelsMatch) {
        labels = labelsMatch[1]
          .split(',')
          .map((item) => item.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      }

      const colorMatch = /^color:\s*(\S+)\s*$/.exec(line);
      if (colorMatch && isValidNoteColor(colorMatch[1])) {
        color = colorMatch[1];
      }

      const pinnedMatch = /^pinned:\s*(true|false)\s*$/i.exec(line);
      if (pinnedMatch) {
        isPinned = pinnedMatch[1].toLowerCase() === 'true';
      }

      const archivedMatch = /^archived:\s*(true|false)\s*$/i.exec(line);
      if (archivedMatch) {
        isArchived = archivedMatch[1].toLowerCase() === 'true';
      }

      const orderMatch = /^order:\s*(-?\d+)\s*$/.exec(line);
      if (orderMatch) {
        const parsedOrder = Number(orderMatch[1]);
        if (Number.isFinite(parsedOrder)) {
          order = parsedOrder;
        }
      }

      const createdAtMatch = /^createdAt:\s*"?(.+?)"?\s*$/.exec(line);
      if (createdAtMatch) {
        createdAt = parseTimestampMs(createdAtMatch[1], 1);
      }

      const updatedAtMatch = /^updatedAt:\s*"?(.+?)"?\s*$/.exec(line);
      if (updatedAtMatch) {
        updatedAt = parseTimestampMs(updatedAtMatch[1], 1);
      }
    }
  }

  return {
    tempId: createTempId('md'),
    id,
    order,
    title: title.trim(),
    content: content.trim(),
    labels,
    color,
    isPinned,
    isArchived,
    isTrashed: false,
    createdAt,
    updatedAt,
    sourceFile: fileName,
  };
}

function parseJsonStringContent(
  text: string,
  fileName: string
): { notes: ParsedKeepNote[]; skipped: number } {
  const parsedJson = JSON.parse(text) as unknown;
  const notes: ParsedKeepNote[] = [];
  let skipped = 0;

  if (Array.isArray(parsedJson)) {
    for (const entry of parsedJson) {
      if (entry && typeof entry === 'object') {
        const note = parseKeepJsonObject(
          entry as Record<string, unknown>,
          fileName
        );
        if (note) {
          if (note.isTrashed) {
            skipped += 1;
          } else {
            notes.push(note);
          }
        }
      }
    }
  } else if (parsedJson && typeof parsedJson === 'object') {
    const note = parseKeepJsonObject(
      parsedJson as Record<string, unknown>,
      fileName
    );
    if (note) {
      if (note.isTrashed) {
        skipped += 1;
      } else {
        notes.push(note);
      }
    }
  }

  return { notes, skipped };
}

/**
 * Parses uploaded Google Keep Takeout `.zip` / `.json` files or `.md` notes entirely in memory.
 */
export async function parseImportFiles(
  files: FileList | File[]
): Promise<{ parsed: ParsedKeepNote[]; skippedCount: number }> {
  const fileArray = Array.from(files);
  const parsed: ParsedKeepNote[] = [];
  let skippedCount = 0;

  for (const file of fileArray) {
    const lowerName = file.name.toLowerCase();

    if (lowerName.endsWith('.zip')) {
      const buffer = await file.arrayBuffer();
      const entries = fflate.unzipSync(new Uint8Array(buffer));

      for (const [entryPath, bytes] of Object.entries(entries)) {
        if (
          entryPath.endsWith('/') ||
          entryPath.includes('__MACOSX') ||
          bytes.length === 0
        ) {
          continue;
        }

        const lowerEntry = entryPath.toLowerCase();
        const text = fflate.strFromU8(bytes);

        if (lowerEntry.endsWith('.json')) {
          try {
            const res = parseJsonStringContent(text, entryPath);
            parsed.push(...res.notes);
            skippedCount += res.skipped;
          } catch {
            // Skip malformed or unrelated Takeout metadata JSON
          }
        } else if (
          lowerEntry.endsWith('.md') ||
          lowerEntry.endsWith('.markdown')
        ) {
          const mdNote = parseMarkdownNoteFile(
            text,
            entryPath.split('/').pop() || entryPath
          );
          if (mdNote.title || mdNote.content) {
            parsed.push(mdNote);
          }
        }
      }
    } else if (lowerName.endsWith('.json')) {
      try {
        const text = await file.text();
        const res = parseJsonStringContent(text, file.name);
        parsed.push(...res.notes);
        skippedCount += res.skipped;
      } catch {
        skippedCount += 1;
      }
    } else if (
      lowerName.endsWith('.md') ||
      lowerName.endsWith('.markdown') ||
      lowerName.endsWith('.txt')
    ) {
      const text = await file.text();
      const mdNote = parseMarkdownNoteFile(text, file.name);
      if (mdNote.title || mdNote.content) {
        parsed.push(mdNote);
      }
    }
  }

  return { parsed, skippedCount };
}

/**
 * Converts a ParsedKeepNote into a persistent NoteItem ready for IndexedDB storage.
 */
export function convertParsedNoteToNoteItem(
  parsed: ParsedKeepNote,
  suffixIndex: number
): NoteItem {
  return {
    id: `note-${Date.now()}-${suffixIndex}-${Math.random().toString(36).slice(2, 6)}`,
    title: parsed.title,
    content: parsed.content,
    labels: parsed.labels,
    color: parsed.color,
    isPinned: parsed.isPinned,
    isArchived: parsed.isArchived,
    isTrashed: false,
    createdAt: parsed.createdAt,
    updatedAt: parsed.updatedAt,
  };
}
