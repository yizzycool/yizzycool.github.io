import { Type } from 'lucide-react';
import Badge from '@/components/common/badge';
import Card from '@/components/common/card';
import Textarea from '@/components/common/textarea';
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
      <div className="relative">
        <HighlightMark
          pattern={pattern}
          flags={flags}
          matches={matches}
          testString={testString}
          error={error}
        />

        <Textarea
          value={testString}
          rows={10}
          placeholder="Insert test text here..."
          className="bg-neutral-50 !text-base !leading-loose dark:bg-neutral-950"
          onChange={(e) => setTestString(e.target.value)}
        />
      </div>
    </Card>
  );
}
