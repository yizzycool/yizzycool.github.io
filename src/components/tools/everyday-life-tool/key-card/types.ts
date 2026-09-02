// Data model for KeyCard items
export interface ContentVersion {
  label: string; // Label of this version (e.g. Detailed, Summary, English)
  text: string; // Content text
}

export interface CardData {
  id: string;
  key: string; // Bound shortcut key, stored in lowercase
  title: string; // Card Title
  tags: string; // Comma-separated tags
  contents: ContentVersion[]; // Dynamic content versions
  createdAt?: number;
  updatedAt?: number;
}

export type SortOrderOption =
  | 'asc'
  | 'desc'
  | 'title'
  | 'title-asc'
  | 'title-desc'
  | 'hotkey'
  | 'hotkey-asc'
  | 'hotkey-desc';

export interface KeyCardSettings {
  mode: 'dashboard' | 'management';
  isCompact: boolean;
  sortOrder: SortOrderOption;
  selectedTag: string | null;
  collapsedCards: string[]; // List of card IDs that are collapsed in management view
}
