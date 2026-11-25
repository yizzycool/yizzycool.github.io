'use client';

import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { InsetGroup } from '@/components/tools/common/inset-group';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs } from '@/components/ui/tabs';

import { computeKeywordDensity } from '../utils/text-analysis';

import { KeywordDensityItem } from './keyword-density-item';

type NGramMode = '1' | '2' | '3';

const NGRAM_MODES: NGramMode[] = ['1', '2', '3'];

const NGRAM_LABELS: Record<NGramMode, string> = {
  '1': '1-Word',
  '2': '2-Word',
  '3': '3-Word',
};

type KeywordDensityProps = {
  text: string;
};

export function KeywordDensity({ text }: KeywordDensityProps) {
  const [nGramMode, setNGramMode] = useState<NGramMode>('1');

  const items = useMemo(
    () => computeKeywordDensity(text, Number(nGramMode) as 1 | 2 | 3, 10),
    [text, nGramMode]
  );

  const maxCount = items[0]?.count ?? 0;

  return (
    <div className="space-y-3">
      <Tabs<NGramMode>
        tabs={NGRAM_MODES}
        activeTab={nGramMode}
        tabLabels={NGRAM_LABELS}
        onChange={setNGramMode}
        size="xs"
        rounded="lg"
        variant="segment"
        fullWidth
      />

      {items.length === 0 ? (
        <InsetGroup rounded="xl">
          <EmptyState
            icon={Search}
            title="No recurring keywords yet"
            description="Write or paste a longer paragraph to inspect 1-word, 2-word, and 3-word SEO density."
          />
        </InsetGroup>
      ) : (
        <InsetGroup rounded="xl" className="max-h-[340px] overflow-y-auto">
          {items.map((item, idx) => (
            <KeywordDensityItem
              key={item.term}
              item={item}
              rank={idx + 1}
              maxCount={maxCount}
            />
          ))}
        </InsetGroup>
      )}
    </div>
  );
}
