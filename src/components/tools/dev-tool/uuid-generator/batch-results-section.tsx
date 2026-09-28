'use client';

import { useState } from 'react';
import { ListOrdered } from 'lucide-react';

import { CopyAction } from '@/components/shared/action-button';
import LabelBar from '@/components/tools/common/label-bar';
import { PillTabs } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import useIsClient from '@/hooks/lifecycle/use-is-client';

import BatchResultItem from './batch-result-item';

type BatchResultsSectionProps = {
  items: string[];
  formattedContent: string;
  onCopyAll?: () => void;
};

export default function BatchResultsSection({
  items,
  formattedContent,
}: BatchResultsSectionProps) {
  const isClient = useIsClient();
  const [viewMode, setViewMode] = useState<'text' | 'list'>('text');

  return (
    <section className="w-full text-left">
      <LabelBar
        icon={ListOrdered}
        label={`Generated Batch Output (${items.length} items)`}
        description="Formatted output ready for clipboard copy"
      >
        <div className="flex items-center gap-1.5">
          <PillTabs
            tabs={['text', 'list']}
            activeTab={viewMode}
            onChange={(m) => setViewMode(m as 'text' | 'list')}
            tabLabels={{ text: 'Raw Text', list: 'Row List' }}
            variant="segment"
            size="xs"
            rounded="md"
            className="mr-1 p-0.5"
            tabClassName="px-2 py-0.5 text-xs"
          />
          <CopyAction
            variant="primary"
            size="xs"
            rounded="lg"
            content={isClient ? formattedContent : ''}
            disabled={!isClient || !items.length}
            label="Copy All"
            title="Copy all items"
            ariaLabel="Copy all generated batch items"
            successToast={`Copied ${items.length} ${items.length === 1 ? 'item' : 'items'} to clipboard!`}
          />
        </div>
      </LabelBar>

      {viewMode === 'text' ? (
        <div className="relative">
          <Textarea
            readOnly
            value={isClient ? formattedContent : ''}
            placeholder={isClient ? '' : 'Generating batch output...'}
            rows={Math.min(Math.max(6, items.length), 16)}
            className="resize-none font-mono text-xs sm:text-sm"
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />
          <div className="mt-1 flex items-center justify-end px-1 text-xs text-neutral-400 dark:text-neutral-500">
            <span>
              {isClient ? items.length : 0}{' '}
              {items.length === 1 ? 'line' : 'lines'} •{' '}
              {isClient ? formattedContent.length : 0} chars
            </span>
          </div>
        </div>
      ) : (
        <div className="max-h-[460px] divide-y divide-neutral-200/70 overflow-y-auto overflow-x-hidden rounded-xl border border-neutral-200/80 bg-white/70 backdrop-blur-md dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900/40">
          {items.map((item, idx) => (
            <BatchResultItem
              key={isClient ? `${item}-${idx}` : `placeholder-${idx}`}
              item={item}
              index={idx}
              isClient={isClient}
            />
          ))}
        </div>
      )}
    </section>
  );
}
