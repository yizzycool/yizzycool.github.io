'use client';

import { AlertCircle, Settings2 } from 'lucide-react';

import { cn } from '@/utils/cn';
import { CopyAction } from '@/components/shared/action-button';
import { Card } from '@/components/ui/card';
import PatternVisualizer from './pattern-visualizer';
import FlagSelector from './flag-selector';
import { CardTitle } from '@/components/ui/card';

type Props = {
  pattern: string;
  flags: string;
  setPattern: React.Dispatch<React.SetStateAction<string>>;
  setFlags: React.Dispatch<React.SetStateAction<string>>;
  error: string | null;
};

export default function PatternCard({
  pattern,
  flags,
  setPattern,
  setFlags,
  error,
}: Props) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <CardTitle icon={Settings2}>Regular Expression</CardTitle>
        <CopyAction variant="ghost" content={pattern} />
      </div>

      <div
        className={cn(
          'shadow-2xs rounded-xl border p-4 backdrop-blur-md transition-all duration-200',
          'border-neutral-200/90 bg-white/80 dark:border-neutral-700/80 dark:bg-neutral-900/80',
          'focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/20',
          'dark:focus-within:border-sky-400 dark:focus-within:bg-neutral-900 dark:focus-within:ring-sky-400/40'
        )}
      >
        <div className="mb-2 flex items-center gap-2 font-mono text-lg">
          <span className="text-slate-400">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="flex-1 border-none bg-transparent tracking-widest text-slate-900 outline-none dark:text-slate-100"
            placeholder="e.g. ([A-Z])\w+"
            aria-label="Patern of regular expression"
          />
          <span className="text-slate-400">/</span>
          <span className="text-slate-600 dark:text-slate-400">{flags}</span>
        </div>
        <div className="overflow-x-auto whitespace-nowrap border-t border-neutral-200 pt-2 font-mono text-xs tracking-widest dark:border-neutral-800">
          <span className="mr-2 select-none font-sans text-slate-400">
            Preview:
          </span>
          <PatternVisualizer pattern={pattern} />
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-500 animate-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}

      <FlagSelector flags={flags} setFlags={setFlags} />
    </Card>
  );
}
