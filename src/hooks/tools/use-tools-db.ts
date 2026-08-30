'use client';

import {
  useIndexedDB,
  type UseIndexedDBOptions,
} from '@/hooks/window/use-indexed-db';

export const TOOLS_DB_NAME = 'yizzypeasy-tools-db';
export const TOOLS_DB_VERSION = 1;

export const TOOLS_PRESET_STORES = [
  /** Tool execution history, snapshots, and recent conversions */
  'history',
  /** Tool-specific configurations, preferences, and custom cards */
  'settings',
  /** Auto-saved unsubmitted inputs and editor work-in-progress state */
  'drafts',
  /** User-saved reusable templates, code snippets, and prompts */
  'snippets',
  /** Large binary blobs, images, canvas project files, and file buffers */
  'files',
  /** Temporary computed results, offline caches, and AI response caches */
  'cache',
] as const;

export type ToolsStoreName = (typeof TOOLS_PRESET_STORES)[number];

const TOOLS_DB_OPTIONS: UseIndexedDBOptions = {
  version: TOOLS_DB_VERSION,
  stores: [...TOOLS_PRESET_STORES],
};

/**
 * Hook specifically configured for the YizzyPeasy Tools unified IndexedDB database.
 * Pre-initializes all 6 preset stores automatically and provides type-safe store operations.
 */
export function useToolsDB() {
  return useIndexedDB<ToolsStoreName>(TOOLS_DB_NAME, TOOLS_DB_OPTIONS);
}
