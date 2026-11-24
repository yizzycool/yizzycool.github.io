import type { ToolsStoreName } from '@/hooks/tools/use-tools-db';

export const HANDOFF_TO_PHOTO_EDITOR_KEY = 'studio-handoff:to-photo-editor';
export const HANDOFF_TO_PIC_MERGE_KEY = 'studio-handoff:to-pic-merge';

export type StudioHandoffTarget = 'photo-editor' | 'pic-merge-studio';

export type StudioHandoffItem = {
  name: string;
  blob: Blob;
  left?: number;
  top?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  opacity?: number;
};

export type StudioHandoffPayload = {
  version: 1;
  createdAt: number;
  source: StudioHandoffTarget;
  width: number;
  height: number;
  backgroundColor?: string;
  items: StudioHandoffItem[];
};

type DbSetFn = <T>(
  storeName: ToolsStoreName,
  key: string,
  value: T
) => Promise<void>;

type DbGetFn = <T>(
  storeName: ToolsStoreName,
  key: string
) => Promise<T | null | undefined>;

type DbDeleteFn = (storeName: ToolsStoreName, key: string) => Promise<void>;

function getHandoffKey(target: StudioHandoffTarget): string {
  return target === 'photo-editor'
    ? HANDOFF_TO_PHOTO_EDITOR_KEY
    : HANDOFF_TO_PIC_MERGE_KEY;
}

/**
 * Persist a cross-tool handoff payload in the shared IndexedDB `files` store.
 */
export async function writeStudioHandoff(
  setValue: DbSetFn,
  target: StudioHandoffTarget,
  payload: StudioHandoffPayload
): Promise<void> {
  await setValue<StudioHandoffPayload>('files', getHandoffKey(target), payload);
}

/**
 * Read and consume any pending handoff payload for the current tool.
 * Ignores stale payloads older than 15 minutes.
 */
export async function consumeStudioHandoff(
  getValue: DbGetFn,
  deleteValue: DbDeleteFn,
  target: StudioHandoffTarget
): Promise<StudioHandoffPayload | null> {
  const key = getHandoffKey(target);
  try {
    const payload = await getValue<StudioHandoffPayload>('files', key);
    await deleteValue('files', key).catch(() => {});
    if (!payload || payload.version !== 1 || !payload.items?.length) {
      return null;
    }
    if (Date.now() - payload.createdAt > 15 * 60 * 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Check whether the URL carries `?handoff=1`.
 */
export function hasHandoffQueryParam(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('handoff') === '1';
}

/**
 * Strip `?handoff=1` from the browser URL without triggering navigation.
 */
export function clearHandoffQueryParam(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has('handoff')) return;
  url.searchParams.delete('handoff');
  window.history.replaceState(null, '', url.toString());
}
