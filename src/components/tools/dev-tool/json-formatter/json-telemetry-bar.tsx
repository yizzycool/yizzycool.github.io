'use client';

import type { JsonTelemetry } from './utils/json-telemetry';

import { AlertCircle, CheckCircle2, Layers } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

type JsonTelemetryBarProps = {
  telemetry: JsonTelemetry;
  hasInput: boolean;
  error: string | null;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function JsonTelemetryBar({
  telemetry,
  hasInput,
  error,
}: JsonTelemetryBarProps) {
  return (
    <div className="shadow-2xs flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200/80 bg-white/70 px-3 py-2 text-xs backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/50">
      <div className="flex items-center gap-2">
        {!hasInput ? (
          <Badge variant="neutral" size="xs">
            Waiting
          </Badge>
        ) : error ? (
          <Badge variant="error" size="xs" icon={AlertCircle}>
            Invalid JSON
          </Badge>
        ) : (
          <Badge variant="success" size="xs" icon={CheckCircle2}>
            Valid {telemetry.rootType !== 'none' ? telemetry.rootType : 'JSON'}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
        <span>{formatBytes(telemetry.bytes)}</span>
        <span className="inline-flex items-center gap-1">
          <Layers size={11} />
          {telemetry.nodeCount} nodes
        </span>
        <span>Depth {telemetry.maxDepth}</span>
      </div>
    </div>
  );
}
