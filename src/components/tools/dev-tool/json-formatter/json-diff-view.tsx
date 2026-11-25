'use client';

import type { JsonDiffEntry } from './utils/json-diff';

import { CheckCircle2, GitCompareArrows } from 'lucide-react';

import { InsetGroup } from '@/components/tools/common/inset-group';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

import { JsonDiffItem } from './json-diff-item';

type JsonDiffViewProps = {
  entries: JsonDiffEntry[];
  compareReady: boolean;
  compareError: string | null;
};

export function JsonDiffView({
  entries,
  compareReady,
  compareError,
}: JsonDiffViewProps) {
  if (compareError) {
    return (
      <InsetGroup rounded="xl">
        <EmptyState
          icon={GitCompareArrows}
          title="Invalid comparison JSON"
          description={compareError}
        />
      </InsetGroup>
    );
  }

  if (!compareReady) {
    return (
      <InsetGroup rounded="xl">
        <EmptyState
          icon={GitCompareArrows}
          title="Provide both JSON payloads"
          description="Paste a baseline JSON on the left and a target JSON above (or click Sample Diff) to compare fields."
        />
      </InsetGroup>
    );
  }

  if (entries.length === 0) {
    return (
      <InsetGroup rounded="xl">
        <EmptyState
          icon={CheckCircle2}
          title="No differences found"
          description="Both JSON documents are structurally identical."
        />
      </InsetGroup>
    );
  }

  const addedCount = entries.filter((e) => e.kind === 'added').length;
  const removedCount = entries.filter((e) => e.kind === 'removed').length;
  const changedCount = entries.filter((e) => e.kind === 'changed').length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="success" size="xs">
          +{addedCount} Added
        </Badge>
        <Badge variant="error" size="xs">
          -{removedCount} Removed
        </Badge>
        <Badge variant="amber" size="xs">
          ~{changedCount} Changed
        </Badge>
      </div>

      <InsetGroup rounded="xl" className="max-h-[340px] overflow-y-auto">
        {entries.map((entry, idx) => (
          <JsonDiffItem key={`${entry.path}-${idx}`} entry={entry} />
        ))}
      </InsetGroup>
    </div>
  );
}
