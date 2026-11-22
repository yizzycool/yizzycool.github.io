'use client';

import type { NoteLabelSummary } from './types';

import { Hash } from 'lucide-react';

import { Chip } from '@/components/ui/chip';

type Props = {
  summary: NoteLabelSummary;
  selected: boolean;
  onSelect: (label: string) => void;
};

export default function LabelFilterChip({
  summary,
  selected,
  onSelect,
}: Props) {
  return (
    <Chip
      size="xs"
      icon={Hash}
      selected={selected}
      onClick={() => onSelect(summary.name)}
      className="shrink-0"
    >
      <span>{summary.name}</span>
      <span className="ml-1 opacity-60">{summary.count}</span>
    </Chip>
  );
}
