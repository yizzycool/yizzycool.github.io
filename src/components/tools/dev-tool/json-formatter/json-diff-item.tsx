'use client';

import type { DiffKind, JsonDiffEntry } from './utils/json-diff';

import { CopyAction } from '@/components/shared/action-button';
import { InsetGroupRow } from '@/components/tools/common/inset-group';
import { Badge } from '@/components/ui/badge';

const KIND_LABELS: Record<DiffKind, string> = {
  added: 'Added',
  removed: 'Removed',
  changed: 'Changed',
};

const KIND_VARIANTS: Record<DiffKind, 'success' | 'error' | 'amber'> = {
  added: 'success',
  removed: 'error',
  changed: 'amber',
};

function formatDiffVal(val: unknown): string {
  if (val === undefined) return '';
  if (typeof val === 'string') return JSON.stringify(val);
  try {
    const str = JSON.stringify(val);
    return str.length > 80 ? `${str.slice(0, 80)}…` : str;
  } catch {
    return String(val);
  }
}

type JsonDiffItemProps = {
  entry: JsonDiffEntry;
};

export function JsonDiffItem({ entry }: JsonDiffItemProps) {
  return (
    <InsetGroupRow className="space-y-1.5 px-3.5 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Badge variant={KIND_VARIANTS[entry.kind]} size="xs">
            {KIND_LABELS[entry.kind]}
          </Badge>
          <code className="truncate font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">
            {entry.path}
          </code>
        </div>

        <CopyAction
          display="icon"
          variant="ghost"
          size="xs"
          rounded="lg"
          content={entry.path}
          title="Copy JSONPath"
          successToast="Copied JSONPath"
          className="shrink-0"
        />
      </div>

      <div className="space-y-1 font-mono text-[11px] leading-relaxed">
        {entry.leftValue !== undefined && (
          <div className="truncate rounded bg-red-50/80 px-2 py-0.5 text-red-700 dark:bg-red-950/35 dark:text-red-300">
            - {formatDiffVal(entry.leftValue)}
          </div>
        )}
        {entry.rightValue !== undefined && (
          <div className="truncate rounded bg-emerald-50/80 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300">
            + {formatDiffVal(entry.rightValue)}
          </div>
        )}
      </div>
    </InsetGroupRow>
  );
}
