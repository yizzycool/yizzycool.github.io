export type NoteColor =
  | 'default'
  | 'coral'
  | 'amber'
  | 'sage'
  | 'sky'
  | 'indigo'
  | 'lavender'
  | 'rose'
  | 'slate';

export type NotesViewScope = 'active' | 'archived' | 'trash';

export type NotesLayoutMode = 'masonry' | 'list';

export type NoteEditorMode = 'read' | 'edit' | 'split';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  labels: string[];
  color: NoteColor;
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  createdAt: number;
  updatedAt: number;
  order?: number;
  syncFileName?: string;
}

export interface NotesPreferences {
  layout: NotesLayoutMode;
  revealAllSpoilers: boolean;
  ttsRate: 0.7 | 1;
  ttsLang: 'en-US' | 'en-GB';
}

export interface ParsedKeepNote {
  tempId: string;
  id?: string;
  order?: number;
  title: string;
  content: string;
  labels: string[];
  color: NoteColor;
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  createdAt: number;
  updatedAt: number;
  sourceFile: string;
}

export type NoteAiActionId =
  | 'translate'
  | 'proofread'
  | 'rewrite-casual'
  | 'rewrite-formal'
  | 'rewrite-shorter'
  | 'summarize'
  | 'study-card'
  | 'connected-speech'
  | 'format-markdown'
  | 'suggest-labels';

export type NoteAiAvailability =
  | 'available'
  | 'downloadable'
  | 'downloading'
  | 'unavailable';

export interface NoteAiCapabilities {
  translator: NoteAiAvailability;
  languageDetector: NoteAiAvailability;
  proofreader: NoteAiAvailability;
  rewriter: NoteAiAvailability;
  summarizer: NoteAiAvailability;
  languageModel: NoteAiAvailability;
  hasAny: boolean;
}

export interface NoteAiResult {
  action: NoteAiActionId;
  title: string;
  output: string;
  details?: string;
  suggestedLabels?: string[];
  targetText: string;
  selectionStart: number | null;
  selectionEnd: number | null;
}

export interface NoteLabelSummary {
  name: string;
  count: number;
}

export interface NoteHeadingItem {
  level: 1 | 2 | 3;
  text: string;
  slug: string;
}

export type LocalFolderSyncStatus =
  | 'unsupported'
  | 'disconnected'
  | 'needs-permission'
  | 'connected'
  | 'syncing';

export interface LocalFolderSyncSummary {
  isSupported: boolean;
  status: LocalFolderSyncStatus;
  folderName: string | null;
  lastSyncedAt: number | null;
}
