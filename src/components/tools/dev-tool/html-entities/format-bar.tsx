'use client';

import type { ReactNode } from 'react';
import type { EntityScope } from './types';

import { PillTabs } from '@/components/ui/tabs';

type Props = {
  scope: EntityScope;
  onChangeScope: (scope: EntityScope) => void;
};

const SCOPE_TABS: EntityScope[] = ['special', 'nonAscii'];

const SCOPE_TAB_LABELS: Record<EntityScope, ReactNode> = {
  special: 'Special Characters',
  nonAscii: 'All Non-ASCII',
};

export default function FormatBar({ scope, onChangeScope }: Props) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
        Scope:
      </span>
      <PillTabs<EntityScope>
        tabs={SCOPE_TABS}
        activeTab={scope}
        onChange={onChangeScope}
        tabLabels={SCOPE_TAB_LABELS}
        variant="segment"
        size="xs"
        rounded="md"
      />
    </div>
  );
}
