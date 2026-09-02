'use client';

import { Badge } from '@/components/common/badge';
import { Button } from '../common/button';

type CategoryChipProps = {
  name: string;
  count: number;
  isSelected: boolean;
  onClick: () => void;
};

export default function CategoryChip({
  name,
  count,
  isSelected,
  onClick,
}: CategoryChipProps) {
  return (
    <Button
      onClick={onClick}
      variant={isSelected ? 'blue' : 'neutral'}
      size="xs"
      rounded="lg"
      bordered
      className="gap-2"
    >
      <span>{name}</span>
      <Badge variant={isSelected ? 'dark-sky' : 'neutral'}>{count}</Badge>
    </Button>
  );
}
