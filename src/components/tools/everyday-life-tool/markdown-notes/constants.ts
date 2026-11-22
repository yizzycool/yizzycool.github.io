import type { NoteColor, NotesPreferences } from './types';

export const NOTES_DB_STORE = 'snippets' as const;
export const NOTES_DB_KEY = 'markdown-notes-items';

export const NOTES_PREFS_STORE = 'settings' as const;
export const NOTES_PREFS_KEY = 'markdown-notes-prefs';

export const NOTES_SYNC_HANDLE_STORE = 'files' as const;
export const NOTES_SYNC_HANDLE_KEY = 'markdown-notes-sync-folder-handle';

export const NOTE_COLOR_ORDER: NoteColor[] = [
  'default',
  'coral',
  'amber',
  'sage',
  'sky',
  'indigo',
  'lavender',
  'rose',
  'slate',
];

export const NOTE_COLOR_STYLES: Record<
  NoteColor,
  {
    name: string;
    card: string;
    modal: string;
    swatch: string;
  }
> = {
  default: {
    name: 'Default',
    card: 'border-neutral-200/80 bg-white/80 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/75 dark:hover:border-neutral-700',
    modal:
      'border-neutral-200/90 bg-white dark:border-neutral-800 dark:bg-neutral-900',
    swatch:
      'bg-white border-neutral-300 dark:bg-neutral-800 dark:border-neutral-600',
  },
  coral: {
    name: 'Coral',
    card: 'border-orange-200/80 bg-orange-50/75 hover:border-orange-300 dark:border-orange-900/50 dark:bg-orange-950/30 dark:hover:border-orange-800/80',
    modal:
      'border-orange-200/90 bg-orange-50/95 dark:border-orange-900/60 dark:bg-[#231610]',
    swatch:
      'bg-orange-200 border-orange-300 dark:bg-orange-700/70 dark:border-orange-500',
  },
  amber: {
    name: 'Amber',
    card: 'border-amber-200/80 bg-amber-50/75 hover:border-amber-300 dark:border-amber-900/50 dark:bg-amber-950/30 dark:hover:border-amber-800/80',
    modal:
      'border-amber-200/90 bg-amber-50/95 dark:border-amber-900/60 dark:bg-[#211b0e]',
    swatch:
      'bg-amber-200 border-amber-300 dark:bg-amber-700/70 dark:border-amber-500',
  },
  sage: {
    name: 'Sage',
    card: 'border-emerald-200/80 bg-emerald-50/70 hover:border-emerald-300 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:hover:border-emerald-800/80',
    modal:
      'border-emerald-200/90 bg-emerald-50/95 dark:border-emerald-900/60 dark:bg-[#0f1f19]',
    swatch:
      'bg-emerald-200 border-emerald-300 dark:bg-emerald-700/70 dark:border-emerald-500',
  },
  sky: {
    name: 'Sky',
    card: 'border-sky-200/80 bg-sky-50/75 hover:border-sky-300 dark:border-sky-900/50 dark:bg-sky-950/30 dark:hover:border-sky-800/80',
    modal:
      'border-sky-200/90 bg-sky-50/95 dark:border-sky-900/60 dark:bg-[#0f1c26]',
    swatch: 'bg-sky-200 border-sky-300 dark:bg-sky-700/70 dark:border-sky-500',
  },
  indigo: {
    name: 'Indigo',
    card: 'border-indigo-200/80 bg-indigo-50/75 hover:border-indigo-300 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:hover:border-indigo-800/80',
    modal:
      'border-indigo-200/90 bg-indigo-50/95 dark:border-indigo-900/60 dark:bg-[#16172a]',
    swatch:
      'bg-indigo-200 border-indigo-300 dark:bg-indigo-700/70 dark:border-indigo-500',
  },
  lavender: {
    name: 'Lavender',
    card: 'border-purple-200/80 bg-purple-50/75 hover:border-purple-300 dark:border-purple-900/50 dark:bg-purple-950/30 dark:hover:border-purple-800/80',
    modal:
      'border-purple-200/90 bg-purple-50/95 dark:border-purple-900/60 dark:bg-[#1e1428]',
    swatch:
      'bg-purple-200 border-purple-300 dark:bg-purple-700/70 dark:border-purple-500',
  },
  rose: {
    name: 'Rose',
    card: 'border-rose-200/80 bg-rose-50/75 hover:border-rose-300 dark:border-rose-900/50 dark:bg-rose-950/30 dark:hover:border-rose-800/80',
    modal:
      'border-rose-200/90 bg-rose-50/95 dark:border-rose-900/60 dark:bg-[#241319]',
    swatch:
      'bg-rose-200 border-rose-300 dark:bg-rose-700/70 dark:border-rose-500',
  },
  slate: {
    name: 'Slate',
    card: 'border-slate-200/90 bg-slate-100/75 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700',
    modal:
      'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#141821]',
    swatch:
      'bg-slate-200 border-slate-300 dark:bg-slate-700/70 dark:border-slate-500',
  },
};

export const KEEP_COLOR_MAP: Record<string, NoteColor> = {
  DEFAULT: 'default',
  WHITE: 'default',
  RED: 'coral',
  ORANGE: 'coral',
  YELLOW: 'amber',
  GREEN: 'sage',
  TEAL: 'sky',
  BLUE: 'sky',
  DARK_BLUE: 'indigo',
  PURPLE: 'lavender',
  PINK: 'rose',
  BROWN: 'amber',
  GRAY: 'slate',
};

export const DEFAULT_NOTES_PREFS: NotesPreferences = {
  layout: 'masonry',
  revealAllSpoilers: false,
  ttsRate: 1,
  ttsLang: 'en-US',
};
