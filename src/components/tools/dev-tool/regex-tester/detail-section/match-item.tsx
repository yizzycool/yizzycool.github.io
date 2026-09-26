import { cn } from '@/utils/cn';
import { CopyAction } from '@/components/shared/action-button';

import CaptureGroupRow from './capture-group-row';

type Props = {
  match: RegExpExecArray;
  index: number;
  grouped?: boolean;
};

export default function MatchItem({ match, index, grouped = false }: Props) {
  const hasIndexedGroups = match.length > 1;

  return (
    <div
      className={cn(
        'p-3.5 transition-colors',
        grouped
          ? 'hover:bg-neutral-100/40 dark:hover:bg-neutral-800/30'
          : 'shadow-2xs rounded-xl border border-neutral-200/90 bg-white/80 dark:border-neutral-800 dark:bg-neutral-900/60'
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-500 dark:text-slate-400">
            #{index + 1}
          </span>
          <span className="font-mono text-xs text-slate-400">
            Pos: {match.index}–{match.index + match[0].length}
          </span>
        </div>
        <CopyAction
          variant="ghost"
          size="xs"
          content={match[0]}
          title="Copy this match"
        />
      </div>

      <div className="break-all font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
        {match[0] || (
          <span className="text-xs italic text-slate-500">
            Zero-width match
          </span>
        )}
      </div>

      {/* Indexed Groups */}
      {hasIndexedGroups && (
        <div className="mt-3 rounded-lg bg-neutral-100/70 p-2.5 dark:bg-neutral-800/50">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Capture Groups
            </span>
            <div className="grid grid-cols-[auto_1fr] gap-2 font-mono text-xs">
              {match.slice(1).map((group, gi) => (
                <CaptureGroupRow
                  key={gi}
                  group={group}
                  index={gi + 1}
                  indices={match.indices}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
