'use client';

import { Hash, Info } from 'lucide-react';

import { Card, CardTitle } from '@/components/ui/card';

import MatchItem from './match-item';

type Props = {
  matches: Array<RegExpExecArray>;
};

export default function DetailCard({ matches }: Props) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <CardTitle icon={Hash}>Match Details</CardTitle>
        {matches.length > 0 && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {matches.length} {matches.length === 1 ? 'result' : 'results'} found
          </span>
        )}
      </div>

      {matches.length > 0 ? (
        <div className="max-h-[500px] space-y-4 overflow-y-auto pr-1">
          {matches.slice(0, 50).map((match, i) => (
            <MatchItem key={i} match={match} index={i} />
          ))}

          {matches.length > 50 && (
            <p className="py-2 text-center text-xs italic text-slate-400">
              Showing first 50 matches (total: {matches.length})...
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center space-y-4 py-12 text-slate-400">
          <Info className="h-8 w-8 opacity-20" />
          <p className="text-sm font-medium">Waiting for match...</p>
        </div>
      )}
    </Card>
  );
}
