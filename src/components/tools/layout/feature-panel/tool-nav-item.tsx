'use client';

import type { FeaturePanelSide, FeaturePanelToolItem } from './types';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

import { cn } from '@/utils/cn';

import ToolNavBadge from './tool-nav-badge';

type ToolNavItemProps = {
  item: FeaturePanelToolItem;
  isActive: boolean;
  side: FeaturePanelSide;
  showDivider?: boolean;
  onClick: () => void;
};

export default function ToolNavItem({
  item,
  isActive,
  side,
  showDivider = false,
  onClick,
}: ToolNavItemProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const Icon = item.icon.component;

  useEffect(() => {
    if (isActive && side === 'featurePanel') {
      linkRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [isActive, side]);

  return (
    <li>
      {showDivider && item.dividerBefore && (
        <div
          aria-hidden="true"
          className="my-2 border-t border-neutral-200/70 dark:border-neutral-800/70"
        />
      )}
      <Link
        ref={linkRef}
        href={item.href}
        data-active={isActive}
        onClick={onClick}
        className={cn(
          'my-1 flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm transition-colors',
          'hover:bg-sky-600/10',
          'data-[active=true]:bg-sky-600/10 data-[active=true]:font-medium data-[active=true]:text-sky-500',
          'data-[active=true]:dark:bg-sky-600/20'
        )}
      >
        <Icon className="mr-1 h-4 w-4 shrink-0" />
        <span className="truncate">{item.name}</span>
        <ToolNavBadge badge={item.badge} side={side} />
      </Link>
    </li>
  );
}
