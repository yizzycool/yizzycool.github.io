'use client';

import { Hash, Info } from 'lucide-react';

import LabelBar from '@/components/tools/common/label-bar';
import { Badge } from '@/components/ui/badge';

import MatchItem from './match-item';

type Props = {
  matches: Array<RegExpExecArray>;
};

export default function DetailSection({ matches }: Props) {
  return (
    <div className="w-full text-left">
      <LabelBar
        icon={Hash}
        label={
          <div className="flex items-center gap-2.5">
            <span>Match Details</span>
            {matches.length > 0 && (
              <Badge size="xs" variant="primary" rounded="full">
                {matches.length} {matches.length === 1 ? 'Result' : 'Results'}
              </Badge>
            )}
          </div>
        }
      >
        {matches.length > 0 && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {matches.length} {matches.length === 1 ? 'result' : 'results'} found
          </span>
        )}
      </LabelBar>

      {matches.length > 0 ? (
        <div className="max-h-[500px] divide-y divide-neutral-200/70 overflow-hidden overflow-y-auto rounded-xl border border-neutral-200/80 bg-white/70 backdrop-blur-md dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900/40">
          {matches.slice(0, 50).map((match, i) => (
            <MatchItem key={i} match={match} index={i} grouped />
          ))}

          {matches.length > 50 && (
            <p className="py-2.5 text-center text-xs italic text-slate-400">
              Showing first 50 matches (total: {matches.length})...
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center space-y-4 rounded-xl border border-dashed border-slate-200 py-12 text-slate-400 dark:border-neutral-800 dark:text-neutral-500">
          <Info className="h-8 w-8 opacity-20" />
          <p className="text-sm font-medium">Waiting for match...</p>
        </div>
      )}
    </div>
  );
}
