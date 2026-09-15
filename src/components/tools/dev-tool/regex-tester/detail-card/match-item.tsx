import { cn } from '@/utils/cn';
import { CopyAction } from '@/components/shared/action-button';

import CaptureGroupRow from './capture-group-row';

type Props = {
  match: RegExpExecArray;
  index: number;
};

export default function MatchItem({ match, index }: Props) {
  const hasIndexedGroups = match.length > 1;

  return (
    <div
      className={cn(
        'shadow-2xs rounded-xl border p-3.5 backdrop-blur-md transition-all duration-200',
        'border-neutral-200/90 bg-white/80 dark:border-neutral-800 dark:bg-neutral-900/60'
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
        <div className="mt-3 space-y-2 border-t border-neutral-200/80 pt-3 dark:border-neutral-800">
          {/* Indexed Groups */}
          {hasIndexedGroups && (
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
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
          )}
        </div>
      )}
    </div>
  );
}
