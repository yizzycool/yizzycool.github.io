import type { NoteHeadingItem, NoteItem } from '../types';

import * as fflate from 'fflate';

export interface ChecklistAutoExpandResult {
  value: string;
  nextCursor: number | null;
}

/**
 * Automatically expands line-start checklist shorthands (`[ ] `, `[] `, `[x] `)
 * into standard GFM task items (`- [ ] ` / `- [x] `) on forward single-character typing.
 */
export function autoExpandChecklistShortcut(
  prevValue: string,
  nextValue: string,
  selectionStart: number | null
): ChecklistAutoExpandResult {
  if (
    selectionStart === null ||
    nextValue.length !== prevValue.length + 1 ||
    selectionStart < 3 ||
    nextValue[selectionStart - 1] !== ' '
  ) {
    return { value: nextValue, nextCursor: null };
  }

  const lineStart = nextValue.lastIndexOf('\n', selectionStart - 1) + 1;
  const lineBeforeCursor = nextValue.slice(lineStart, selectionStart);
  const match = /^(\s*)\[([ xX]?)\] $/.exec(lineBeforeCursor);
  if (!match) {
    return { value: nextValue, nextCursor: null };
  }

  let inCodeBlock = false;
  if (lineStart > 0) {
    const precedingLines = nextValue.slice(0, lineStart - 1).split(/\r?\n/);
    for (const line of precedingLines) {
      if (/^\s*(?:```|~~~)/.test(line)) {
        inCodeBlock = !inCodeBlock;
      }
    }
  }
  if (inCodeBlock) {
    return { value: nextValue, nextCursor: null };
  }

  const normalizedMark = match[2].toLowerCase() === 'x' ? 'x' : ' ';
  const expandedPrefix = `${match[1]}- [${normalizedMark}] `;
  const expandedValue = `${nextValue.slice(0, lineStart)}${expandedPrefix}${nextValue.slice(selectionStart)}`;

  return {
    value: expandedValue,
    nextCursor: lineStart + expandedPrefix.length,
  };
}

/**
 * Toggles a Markdown task-list checkbox (`- [ ]` <-> `- [x]`) at the given 1-based line number.
 */
export function toggleMarkdownCheckboxAtLine(
  markdown: string,
  lineNumber: number
): string {
  const lines = markdown.split('\n');
  const index = lineNumber - 1;
  if (index < 0 || index >= lines.length) {
    return markdown;
  }

  const target = lines[index];
  const updated = target.replace(
    /^(\s*(?:[-*+]|\d+\.)\s+\[)([ xX])(\])/,
    (_, prefix: string, mark: string, suffix: string) =>
      `${prefix}${mark.toLowerCase() === 'x' ? ' ' : 'x'}${suffix}`
  );

  if (updated === target) {
    return markdown;
  }

  lines[index] = updated;
  return lines.join('\n');
}

/**
 * Strips Markdown formatting tokens and spoiler delimiters so TTS reads natural plain prose.
 */
export function stripMarkdownForSpeech(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\|\|([\s\S]*?)\|\|/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+\[[ xX]\]\s+/gm, '')
    .replace(/^\s*[-*+>]\s+/gm, '')
    .replace(/\|/g, ' ')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Formats an epoch timestamp into a concise relative string or short calendar date.
 */
export function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Sanitizes a note title for safe downloads across OS filesystems.
 */
export function sanitizeFileName(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/\s+/g, '-');
  return cleaned.slice(0, 64) || 'untitled-note';
}

/**
 * Serializes a note into a portable Markdown file with YAML frontmatter.
 */
export function noteToMarkdownFile(note: NoteItem): string {
  const safeId = note.id.replace(/"/g, '\\"');
  const safeTitle = note.title.replace(/"/g, '\\"');
  const labelsYaml =
    note.labels.length > 0
      ? `[${note.labels.map((l) => `"${l.replace(/"/g, '\\"')}"`).join(', ')}]`
      : '[]';

  const frontmatter = [
    '---',
    `id: "${safeId}"`,
    `title: "${safeTitle}"`,
    `labels: ${labelsYaml}`,
    `color: ${note.color}`,
    `pinned: ${note.isPinned}`,
    `archived: ${note.isArchived}`,
    ...(typeof note.order === 'number' ? [`order: ${note.order}`] : []),
    `createdAt: ${new Date(note.createdAt).toISOString()}`,
    `updatedAt: ${new Date(note.updatedAt).toISOString()}`,
    '---',
    '',
  ].join('\n');

  return `${frontmatter}${note.content}`;
}

function stripInlineMarkdownFormatting(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[\[([^\]|\n]+)\|([^\]\n]+)\]\]/g, '$2')
    .replace(/\[\[([^\]\n]+)\]\]/g, '$1')
    .replace(/\|\|([^|\n]+)\|\|/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/[*_~]/g, '')
    .trim();
}

/**
 * Generates a URL-safe, Unicode-friendly slug from a Markdown heading string.
 */
export function slugifyHeading(text: string): string {
  const plain = stripInlineMarkdownFormatting(text).toLowerCase();
  const slug = plain
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/[\s-]+/g, '-');
  return slug || 'section';
}

/**
 * Creates a deterministic heading slugger that deduplicates identical heading slugs.
 */
export function createHeadingSlugger(): (rawText: string) => string {
  const seen = new Map<string, number>();
  return (rawText: string) => {
    const base = slugifyHeading(rawText);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}

/**
 * Extracts H1–H3 headings outside fenced code blocks with deduplicated anchor slugs.
 */
export function extractMarkdownHeadings(markdown: string): NoteHeadingItem[] {
  const lines = markdown.split(/\r?\n/);
  const nextSlug = createHeadingSlugger();
  const headings: NoteHeadingItem[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (/^\s*(?:```|~~~)/.test(line)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = /^(#{1,3})\s+(.+?)\s*#*$/.exec(line);
    if (!match) continue;

    const level = match[1].length as 1 | 2 | 3;
    const displayText = stripInlineMarkdownFormatting(match[2]);
    if (!displayText) continue;

    headings.push({
      level,
      text: displayText,
      slug: nextSlug(match[2]),
    });
  }

  return headings;
}

/**
 * Extracts unique bidirectional [[Wiki Link]] target note titles outside code blocks/spans.
 */
export function extractWikiLinks(markdown: string): string[] {
  const cleaned = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ');

  const seenLower = new Set<string>();
  const targets: string[] = [];
  const regex = /\[\[([^\]|\n]+)(?:\|[^\]\n]+)?\]\]/g;
  let match: RegExpExecArray | null = regex.exec(cleaned);

  while (match !== null) {
    const target = match[1].trim();
    if (target) {
      const lower = target.toLowerCase();
      if (!seenLower.has(lower)) {
        seenLower.add(lower);
        targets.push(target);
      }
    }
    match = regex.exec(cleaned);
  }

  return targets;
}

/**
 * Packages notes into a `.zip` archive of individual `.md` files (compatible with Obsidian / Notion).
 */
export function exportNotesAsMarkdownZip(notes: NoteItem[]): Blob {
  const files: Record<string, Uint8Array> = {};
  const usedNames = new Map<string, number>();

  for (const note of notes) {
    const baseName = sanitizeFileName(note.title || 'untitled-note');
    const count = usedNames.get(baseName) ?? 0;
    usedNames.set(baseName, count + 1);

    const fileName =
      count === 0 ? `${baseName}.md` : `${baseName}-${count + 1}.md`;
    const folder = note.isArchived ? 'archived/' : '';
    files[`${folder}${fileName}`] = fflate.strToU8(noteToMarkdownFile(note));
  }

  const zipped = fflate.zipSync(files, { level: 6 });
  return new Blob([new Uint8Array(zipped)], { type: 'application/zip' });
}

function formatIcsDateLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Builds an RFC 5545 calendar event (`.ics`) reminder scheduled at 9:00 AM next day.
 */
export function buildReviewReminderIcs(note: NoteItem, daysAhead = 1): string {
  const start = new Date();
  start.setDate(start.getDate() + daysAhead);
  start.setHours(9, 0, 0, 0);

  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const summary = `Review Note: ${note.title || 'Untitled Note'}`;
  const preview = stripMarkdownForSpeech(note.content).slice(0, 280);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Yizzy Peasy//Markdown Notes//EN',
    'BEGIN:VEVENT',
    `UID:${note.id}@yizzypeasy.com`,
    `DTSTAMP:${formatIcsDateLocal(new Date())}`,
    `DTSTART:${formatIcsDateLocal(start)}`,
    `DTEND:${formatIcsDateLocal(end)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(preview)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Triggers a client-side file download for any Blob without server round trips.
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
