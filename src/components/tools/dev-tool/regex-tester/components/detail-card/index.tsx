import clsx from 'clsx';
import Card from '@/components/common/card';
import { Hash, Info } from 'lucide-react';
import { RegexColors } from '../..';

type Props = {
  matches: Array<RegExpExecArray>;
};

export default function DetailCard({ matches }: Props) {
  return (
    <Card>
      <div className="mb-6 flex items-center gap-2 text-neutral-500">
        <Hash className="h-4 w-4" />
        <h2 className="text-sm font-semibold uppercase tracking-wider">
          Match Details
        </h2>
      </div>

      {matches.length > 0 ? (
        <div className="custom-scrollbar space-y-6 overflow-y-auto pr-2">
          {matches.slice(0, 50).map((match, i) => (
            <div
              key={i}
              className={clsx(
                'rounded-lg border p-3 transition-all animate-in slide-in-from-right-4',
                'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900',
                'hover:shadow-md'
              )}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neutral-400"># {i + 1}</span>
                </div>
                <span className="font-mono text-[10px] text-neutral-400">
                  Pos: {match.index}-{match.index + match[0].length}
                </span>
              </div>
              <div className="break-all font-mono text-sm">
                {match[0] || (
                  <span className="text-xs italic text-neutral-500">
                    Zero-width match
                  </span>
                )}
              </div>

              {match.length > 1 && (
                <div className="mt-4 space-y-1 border-t border-neutral-200 pt-4 dark:border-neutral-700">
                  {match.slice(1).map((group, gi) => (
                    <div key={gi} className="flex gap-2 font-mono text-sm">
                      <span
                        className={clsx(
                          'font-bold opacity-70',
                          RegexColors[gi % RegexColors.length].text
                        )}
                      >
                        G{gi + 1}:
                      </span>
                      <span className="truncate text-neutral-500 dark:text-neutral-400">
                        {group || 'null'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {matches.length > 50 && (
            <p className="py-2 text-center text-xs italic text-neutral-400">
              Showing first 50 matches...
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center space-y-4 py-12 text-neutral-400">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-100 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
            <Info className="h-8 w-8 opacity-20" />
          </div>
          <p className="text-sm font-medium">Waiting for match...</p>
        </div>
      )}
    </Card>
  );
}
