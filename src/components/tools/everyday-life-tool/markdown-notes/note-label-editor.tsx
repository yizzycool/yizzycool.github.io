'use client';

import type { KeyboardEvent } from 'react';

import { Hash, Plus, X } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/utils/cn';

type Props = {
  labels: string[];
  existingLabels?: string[];
  onChange: (nextLabels: string[]) => void;
  className?: string;
};

export default function NoteLabelEditor({
  labels,
  existingLabels = [],
  onChange,
  className,
}: Props) {
  const [inputValue, setInputValue] = useState('');

  const addLabel = (raw: string) => {
    const trimmed = raw.trim().replace(/^#/, '');
    if (!trimmed) return;
    const exists = labels.some(
      (l) => l.toLowerCase() === trimmed.toLowerCase()
    );
    if (!exists) {
      onChange([...labels, trimmed]);
    }
    setInputValue('');
  };

  const removeLabel = (target: string) => {
    onChange(labels.filter((l) => l !== target));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addLabel(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && labels.length > 0) {
      removeLabel(labels[labels.length - 1]);
    }
  };

  const suggestions = existingLabels
    .filter(
      (candidate) =>
        !labels.some((l) => l.toLowerCase() === candidate.toLowerCase())
    )
    .slice(0, 5);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        {labels.map((label) => (
          <span
            key={label}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-200/80 bg-black/[0.04] px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-neutral-700/80 dark:bg-white/[0.07] dark:text-slate-200"
          >
            <Hash size={10} className="text-slate-400" />
            <span>{label}</span>
            <button
              type="button"
              onClick={() => removeLabel(label)}
              aria-label={`Remove label ${label}`}
              className="ml-0.5 rounded-full p-0.5 text-slate-400 transition-colors hover:bg-black/10 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-100"
            >
              <X size={10} />
            </button>
          </span>
        ))}

        <div className="inline-flex items-center gap-1 rounded-full border border-dashed border-neutral-300/90 px-2.5 py-0.5 dark:border-neutral-700">
          <Hash size={11} className="text-slate-400" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add label..."
            className="w-24 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
          {inputValue.trim() && (
            <button
              type="button"
              onClick={() => addLabel(inputValue)}
              aria-label="Add label"
              className="text-sky-600 hover:text-sky-700 dark:text-sky-400"
            >
              <Plus size={12} />
            </button>
          )}
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <span>Quick tags:</span>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addLabel(suggestion)}
              className="rounded-full border border-neutral-200/70 px-2 py-0.5 text-[11px] text-slate-500 transition-colors hover:border-sky-400/60 hover:bg-sky-50/60 hover:text-sky-600 dark:border-neutral-800 dark:text-slate-400 dark:hover:border-sky-500/40 dark:hover:bg-sky-950/30 dark:hover:text-sky-300"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
