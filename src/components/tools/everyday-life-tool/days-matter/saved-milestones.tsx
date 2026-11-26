'use client';

import type { SavedMilestone } from './types';

import { Bookmark } from 'lucide-react';

import { DeleteAction } from '@/components/shared/action-button';
import { InsetGroup } from '@/components/tools/common/inset-group';

import LabelBar from '../../common/label-bar';
import SavedMilestoneItem from './saved-milestone-item';

type Props = {
  items: SavedMilestone[];
  nowMs: number;
  onLoad: (item: SavedMilestone) => void;
  onDelete: (id: string) => void;
  onRequestClearAll: () => void;
};

/**
 * Persisted local milestone list rendered inside a glassmorphic InsetGroup.
 */
export default function SavedMilestones({
  items,
  nowMs,
  onLoad,
  onDelete,
  onRequestClearAll,
}: Props) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="days-matter-saved-heading" className="space-y-3">
      <LabelBar
        id="days-matter-saved-heading"
        label={`Saved Milestones (${items.length})`}
        icon={Bookmark}
      >
        <DeleteAction
          label="Clear All"
          successToast={false}
          onClick={onRequestClearAll}
        />
      </LabelBar>

      <InsetGroup>
        {items.map((item) => (
          <SavedMilestoneItem
            key={item.id}
            item={item}
            nowMs={nowMs}
            onLoad={onLoad}
            onDelete={onDelete}
          />
        ))}
      </InsetGroup>
    </section>
  );
}
