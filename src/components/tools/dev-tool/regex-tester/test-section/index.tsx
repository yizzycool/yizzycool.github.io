'use client';

import type {
  ChangeEventHandler,
  Dispatch,
  RefObject,
  SetStateAction,
} from 'react';

import { Type } from 'lucide-react';

import { DeleteAction, PasteAction } from '@/components/shared/action-button';
import LabelBar from '@/components/tools/common/label-bar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

import HighlightMark from './highlight-mark';

type Props = {
  pattern: string;
  flags: string;
  testString: string;
  setTestString: Dispatch<SetStateAction<string>>;
  matches: Array<RegExpExecArray>;
  error: string | null;
  testTextareaRef?: RefObject<HTMLTextAreaElement | null>;
  onPaste?: () => void;
  onClear?: () => void;
};

export default function TestSection({
  pattern,
  flags,
  testString,
  setTestString,
  matches,
  error,
  testTextareaRef,
  onPaste,
  onClear,
}: Props) {
  const onChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setTestString(e.target.value);
    updateTextareaHeight();
  };

  const updateTextareaHeight = () => {
    const ta = document.getElementById('regex-tester-textarea');
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  };

  return (
    <div className="w-full text-left">
      <LabelBar
        icon={Type}
        label={
          <div className="flex items-center gap-2.5">
            <span>Test String</span>
            <Badge
              variant={matches.length > 0 ? 'secondary' : 'surface'}
              className="font-mono text-xs font-semibold"
            >
              {matches.length} {matches.length === 1 ? 'Match' : 'Matches'}
            </Badge>
          </div>
        }
        htmlFor="regex-tester-textarea"
      >
        <div className="flex items-center gap-2">
          {onPaste && <PasteAction onClick={onPaste} />}
          {onClear && <DeleteAction onClick={onClear} disabled={!testString} />}
        </div>
      </LabelBar>

      {/* Textarea + Highlighting Overlay */}
      <div
        className={cn(
          'shadow-2xs relative h-[300px] overflow-auto rounded-xl border backdrop-blur-md transition-all duration-200',
          'border-neutral-200/90 bg-white/80 dark:border-neutral-700/80 dark:bg-neutral-900/80',
          'has-[:focus]:border-sky-500 has-[:focus]:bg-white has-[:focus]:ring-2 has-[:focus]:ring-sky-500/20',
          'dark:has-[:focus]:border-sky-400 dark:has-[:focus]:bg-neutral-900 dark:has-[:focus]:ring-sky-400/40'
        )}
      >
        <HighlightMark
          pattern={pattern}
          flags={flags}
          matches={matches}
          testString={testString}
          error={error}
        />

        <textarea
          ref={testTextareaRef}
          id="regex-tester-textarea"
          className={cn(
            'block min-h-full w-full bg-transparent px-4 py-3',
            'resize-none font-mono text-base leading-loose outline-none',
            'text-slate-700 dark:text-slate-200',
            'placeholder-neutral-400 dark:placeholder-neutral-500'
          )}
          value={testString}
          placeholder="Insert test text here..."
          onChange={onChange}
          aria-label="Test string"
        />
      </div>
    </div>
  );
}
