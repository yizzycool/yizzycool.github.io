'use client';

import type { JsonPathEntry } from './utils/json-telemetry';

import { CopyAction } from '@/components/shared/action-button';
import { InsetGroupRow } from '@/components/tools/common/inset-group';
import { Badge } from '@/components/ui/badge';

type JsonPathMatchItemProps = {
  entry: JsonPathEntry;
};

export function JsonPathMatchItem({ entry }: JsonPathMatchItemProps) {
  return (
    <InsetGroupRow className="flex items-center justify-between gap-2 px-3 py-2">
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-1.5">
          <code className="truncate font-mono text-[11px] font-semibold text-sky-700 dark:text-sky-300">
            {entry.path}
          </code>
          <Badge variant="neutral" size="xs">
            {entry.type}
          </Badge>
        </div>
        <div className="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
          {entry.preview}
        </div>
      </div>

      <CopyAction
        display="icon"
        variant="ghost"
        size="xs"
        rounded="lg"
        content={entry.path}
        title="Copy JSONPath"
        successToast={`Copied ${entry.path}`}
        className="shrink-0"
      />
    </InsetGroupRow>
  );
}
