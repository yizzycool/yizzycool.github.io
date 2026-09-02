import { Type } from 'lucide-react';

import { cn } from '@/utils/cn';
import { Badge } from '@/components/common/badge';
import Card from '@/components/common/card';
import HighlightMark from './highlight-mark';
import CardTitle from '@/components/common/card/title';

type Props = {
  pattern: string;
  flags: string;
  testString: string;
  setTestString: React.Dispatch<React.SetStateAction<string>>;
  matches: Array<RegExpExecArray>;
  error: string | null;
};

export default function TestCard({
  pattern,
  flags,
  testString,
  setTestString,
  matches,
  error,
}: Props) {
  const onChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
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
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <CardTitle icon={Type}>Test String</CardTitle>
        <Badge>{matches.length} Matches</Badge>
      </div>

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
          id="regex-tester-textarea"
          className={cn(
            'block min-h-full w-full bg-transparent px-4 py-3',
            'resize-none text-base leading-loose outline-none',
            'text-slate-700 dark:text-slate-200',
            'placeholder-neutral-400 dark:placeholder-neutral-500',
            'bg-transparent'
          )}
          value={testString}
          placeholder="Insert test text here..."
          onChange={onChange}
          aria-label="Test string"
        />
      </div>
    </Card>
  );
}
