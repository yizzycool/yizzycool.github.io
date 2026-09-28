'use client';

import type { ChangeEvent, UIEvent } from 'react';

import { useRef } from 'react';

import { cn } from '@/utils/cn';

import JwtTokenHighlighter from './jwt-token-highlighter';

type JwtTokenEditorProps = {
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
};

export default function JwtTokenEditor({
  textareaRef,
  value,
  onChange,
  placeholder = 'Paste a JWT token here (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)',
  rows = 4,
  className,
}: JwtTokenEditorProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: UIEvent<HTMLTextAreaElement>) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.currentTarget.scrollTop;
      backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  return (
    <div
      className={cn(
        'shadow-2xs relative w-full overflow-hidden rounded-2xl border border-neutral-200/90 bg-white/80 backdrop-blur-md transition-all duration-200',
        'focus-within:shadow-xs focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/20',
        'dark:border-neutral-700/80 dark:bg-neutral-900/80 dark:focus-within:border-sky-400 dark:focus-within:bg-neutral-900 dark:focus-within:ring-sky-400/40',
        className
      )}
    >
      {/* Background layer: Formatted & colored tokens */}
      <div
        ref={backdropRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden whitespace-pre-wrap break-all px-4 py-3.5 font-mono text-xs leading-relaxed sm:text-sm"
      >
        <JwtTokenHighlighter value={value} placeholder={placeholder} />
      </div>

      {/* Foreground layer: Interactive native textarea with transparent text */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onScroll={handleScroll}
        rows={rows}
        spellCheck={false}
        className={cn(
          'relative z-10 block w-full resize-none bg-transparent px-4 py-3.5',
          'whitespace-pre-wrap break-all font-mono text-xs leading-relaxed outline-none sm:text-sm',
          'text-transparent caret-slate-900 dark:caret-slate-100',
          'selection:bg-sky-500/25 selection:text-transparent'
        )}
      />
    </div>
  );
}
