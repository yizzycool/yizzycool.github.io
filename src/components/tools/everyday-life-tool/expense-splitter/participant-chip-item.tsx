'use client';

import type { ExpenseMember } from './types';

import { Chip } from '@/components/ui/chip';

type Props = {
  member: ExpenseMember;
  selected: boolean;
  onToggle: (id: string) => void;
};

export default function ParticipantChipItem({
  member,
  selected,
  onToggle,
}: Props) {
  return (
    <Chip
      size="sm"
      selected={selected}
      showCheck
      onClick={() => onToggle(member.id)}
      title={
        selected
          ? `Exclude ${member.name} from this expense`
          : `Include ${member.name} in this expense`
      }
    >
      {member.name}
    </Chip>
  );
}
