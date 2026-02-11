import clsx from 'clsx';
import { Type } from 'lucide-react';
import Badge from '@/components/common/badge';
import Card from '@/components/common/card';
import HighlightMark from './components/highlight-mark';

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
        <div className="flex items-center gap-2 text-neutral-500">
          <Type className="h-4 w-4" />
          <h2 className="text-sm font-semibold uppercase tracking-wider">
            Test String
          </h2>
        </div>
        <Badge>{matches.length} Matches</Badge>
      </div>

      {/* Textarea + Highlighting Overlay */}
      <div
        className={clsx(
          'relative h-[300px] overflow-auto',
          'rounded-lg border border-neutral-200 dark:border-neutral-700',
          'bg-white/80 dark:bg-neutral-900/80',
          'has-[:focus]:border-transparent has-[:focus]:ring-2 has-[:focus]:ring-blue-500',
          'backdrop-blur'
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
          className={clsx(
            'block min-h-full w-full bg-transparent px-4 py-3',
            'resize-none text-base leading-loose outline-none',
            'text-neutral-700 dark:text-neutral-200',
            'placeholder-neutral-400 dark:placeholder-neutral-500'
          )}
          value={testString}
          placeholder="Insert test text here..."
          onChange={onChange}
        />
      </div>
    </Card>
  );
}
