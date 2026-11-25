import type { ToolsStoreName } from '@/hooks/tools/use-tools-db';

export const HANDOFF_TO_MARKDOWN_NOTES_KEY = 'text-handoff:to-markdown-notes';
export const HANDOFF_TO_WORD_COUNTER_KEY = 'text-handoff:to-word-counter';

export type TextHandoffTarget = 'markdown-notes' | 'word-counter';

export type TextHandoffPayload = {
  version: 1;
  createdAt: number;
  title?: string;
  text: string;
  labels?: string[];
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

function getTextHandoffKey(target: TextHandoffTarget): string {
  return target === 'markdown-notes'
    ? HANDOFF_TO_MARKDOWN_NOTES_KEY
    : HANDOFF_TO_WORD_COUNTER_KEY;
}

/**
 * Persist a cross-tool text handoff payload in the shared IndexedDB `drafts` store.
 */
export async function writeTextHandoff(
  setValue: DbSetFn,
  target: TextHandoffTarget,
  payload: TextHandoffPayload
): Promise<void> {
  await setValue<TextHandoffPayload>(
    'drafts',
    getTextHandoffKey(target),
    payload
  );
}

/**
 * Read and consume any pending text handoff payload for the target tool.
 * Ignores stale payloads older than 15 minutes.
 */
export async function consumeTextHandoff(
  getValue: DbGetFn,
  deleteValue: DbDeleteFn,
  target: TextHandoffTarget
): Promise<TextHandoffPayload | null> {
  const key = getTextHandoffKey(target);
  try {
    const payload = await getValue<TextHandoffPayload>('drafts', key);
    await deleteValue('drafts', key).catch(() => {});
    if (!payload || payload.version !== 1 || !payload.text.trim()) {
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
export function hasTextHandoffQueryParam(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('handoff') === '1';
}

/**
 * Strip `?handoff=1` from the browser URL without triggering navigation.
 */
export function clearTextHandoffQueryParam(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has('handoff')) return;
  url.searchParams.delete('handoff');
  window.history.replaceState(null, '', url.toString());
}
