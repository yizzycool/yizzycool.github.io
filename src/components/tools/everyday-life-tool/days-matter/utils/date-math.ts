import type {
  CountdownBreakdown,
  MilestoneState,
  PosterAspectRatio,
  PosterThemeId,
} from '../types';

import {
  MAX_NOTE_LENGTH,
  MAX_TITLE_LENGTH,
  POSTER_RATIO_TABS,
  POSTER_THEMES,
} from '../constants';

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = MS_PER_SECOND * 60;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

/**
 * Formats a Date into local `YYYY-MM-DD` string suitable for HTML date inputs.
 */
export function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRelativeDateValue(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return formatDateInputValue(date);
}

export function getNextNewYearDateValue(): string {
  const now = new Date();
  return `${now.getFullYear() + 1}-01-01`;
}

function parseLocalDate(dateStr: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const parsed = new Date(year, monthIndex, day, 0, 0, 0, 0);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== monthIndex ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
}

/**
 * Calculates calendar day delta + sub-day live clock breakdown for future, past, or today targets.
 */
export function computeCountdown(
  dateStr: string,
  nowMs: number
): CountdownBreakdown {
  const targetMidnight = parseLocalDate(dateStr);
  if (!targetMidnight) {
    return {
      mode: 'future',
      totalDays: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formattedDate: 'Select a valid date',
      weekday: '---',
      totalWeeks: '0 weeks',
      isValid: false,
    };
  }

  const now = new Date(nowMs);
  const todayMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );

  const dayDiff = Math.round(
    (targetMidnight.getTime() - todayMidnight.getTime()) / MS_PER_DAY
  );

  let mode: CountdownBreakdown['mode'] = 'today';
  if (dayDiff > 0) mode = 'future';
  else if (dayDiff < 0) mode = 'past';

  const absDays = Math.abs(dayDiff);

  let diffMs = 0;
  if (mode === 'future') {
    diffMs = Math.max(0, targetMidnight.getTime() - nowMs);
  } else if (mode === 'past') {
    diffMs = Math.max(0, nowMs - targetMidnight.getTime());
  }

  const remainderMs = diffMs % MS_PER_DAY;
  const hours = Math.floor(remainderMs / MS_PER_HOUR);
  const minutes = Math.floor((remainderMs % MS_PER_HOUR) / MS_PER_MINUTE);
  const seconds = Math.floor((remainderMs % MS_PER_MINUTE) / MS_PER_SECOND);

  const formattedDate = targetMidnight.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const weekday = targetMidnight.toLocaleDateString('en-US', {
    weekday: 'long',
  });

  const weeks = absDays / 7;
  const totalWeeks = `${Number.isInteger(weeks) ? weeks : weeks.toFixed(1)} ${weeks === 1 ? 'week' : 'weeks'}`;

  return {
    mode,
    totalDays: absDays,
    hours,
    minutes,
    seconds,
    formattedDate,
    weekday,
    totalWeeks,
    isValid: true,
  };
}

/**
 * Strips ASCII control characters and Unicode BiDi override/isolate controls, and enforces max code-point length.
 */
export function sanitizeUserText(value: string, maxLength: number): string {
  const cleaned = Array.from(value)
    .filter((ch) => {
      const cp = ch.codePointAt(0) ?? 0;
      if (cp < 0x20 || cp === 0x7f) return false;
      if (cp >= 0x202a && cp <= 0x202e) return false;
      if (cp >= 0x2066 && cp <= 0x2069) return false;
      return true;
    })
    .join('');
  return Array.from(cleaned).slice(0, maxLength).join('');
}

/**
 * Encodes current milestone poster configuration into URL query parameters for zero-backend sharing.
 */
export function buildShareUrl(state: MilestoneState): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  url.search = '';
  const params = url.searchParams;
  const safeTitle = sanitizeUserText(state.title.trim(), MAX_TITLE_LENGTH);
  const safeNote = sanitizeUserText(state.note.trim(), MAX_NOTE_LENGTH);
  if (safeTitle) params.set('title', safeTitle);
  if (state.date) params.set('date', state.date);
  params.set('theme', state.themeId);
  params.set('ratio', state.ratio);
  if (safeNote) params.set('note', safeNote);
  return url.toString();
}

/**
 * Extracts validated and sanitized milestone parameters from URL search string when present.
 */
export function parseShareParams(
  search: string
): Partial<MilestoneState> | null {
  const params = new URLSearchParams(search);
  const title = params.get('title');
  const date = params.get('date');
  const theme = params.get('theme');
  const ratio = params.get('ratio');
  const note = params.get('note');

  if (!title && !date && !theme && !ratio && !note) {
    return null;
  }

  const validThemeIds = new Set<string>(POSTER_THEMES.map((t) => t.id));
  const validRatios = new Set<string>(POSTER_RATIO_TABS);

  return {
    title: title !== null ? sanitizeUserText(title, MAX_TITLE_LENGTH) : '',
    ...(date !== null && parseLocalDate(date) ? { date } : {}),
    ...(theme && validThemeIds.has(theme)
      ? { themeId: theme as PosterThemeId }
      : {}),
    ...(ratio && validRatios.has(ratio)
      ? { ratio: ratio as PosterAspectRatio }
      : {}),
    note: note !== null ? sanitizeUserText(note, MAX_NOTE_LENGTH) : '',
  };
}
