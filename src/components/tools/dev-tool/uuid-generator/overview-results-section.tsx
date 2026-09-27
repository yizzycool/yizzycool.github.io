'use client';

import type { OverviewItem } from './types';

import { Fingerprint } from 'lucide-react';

import useIsClient from '@/hooks/lifecycle/use-is-client';

import LabelBar from '@/components/tools/common/label-bar';

import OverviewResultItem from './overview-result-item';

type OverviewResultsSectionProps = {
  items: OverviewItem[];
  onRegenerateSingle: (id: OverviewItem['id']) => void;
};

export default function OverviewResultsSection({
  items,
  onRegenerateSingle,
}: OverviewResultsSectionProps) {
  const isClient = useIsClient();

  return (
    <section className="w-full text-left">
      <LabelBar
        icon={Fingerprint}
        label="All Identifier Formats"
        description="Instant live samples of 9 modern unique identifier formats (CSPRNG secure)"
      />

      <div className="divide-y divide-neutral-200/70 overflow-hidden rounded-xl border border-neutral-200/80 bg-white/70 backdrop-blur-md dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900/40">
        {items.map((item) => (
          <OverviewResultItem
            key={item.id}
            item={item}
            isClient={isClient}
            onRegenerateSingle={onRegenerateSingle}
          />
        ))}
      </div>
    </section>
  );
}
