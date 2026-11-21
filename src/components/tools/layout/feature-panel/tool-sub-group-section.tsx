'use client';

import type { FeaturePanelSide, FeaturePanelSubGroup } from './types';

import { cn } from '@/utils/cn';

import ToolNavItem from './tool-nav-item';

type ToolSubGroupSectionProps = {
  subGroup: FeaturePanelSubGroup;
  isFirst: boolean;
  pathname: string;
  side: FeaturePanelSide;
  onClick: () => void;
};

export default function ToolSubGroupSection({
  subGroup,
  isFirst,
  pathname,
  side,
  onClick,
}: ToolSubGroupSectionProps) {
  return (
    <li>
      <div
        className={cn(
          'px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500',
          isFirst ? 'pt-1.5' : 'pt-3'
        )}
      >
        {subGroup.label}
      </div>
      <ul>
        {subGroup.items.map((item) => (
          <ToolNavItem
            key={item.key}
            item={item}
            isActive={pathname === item.href}
            side={side}
            onClick={onClick}
          />
        ))}
      </ul>
    </li>
  );
}
