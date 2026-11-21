'use client';

import type { FeaturePanelSide, FeaturePanelToolGroup } from './types';

import { useId, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

import ToolNavItem from './tool-nav-item';
import ToolSubGroupSection from './tool-sub-group-section';

type ToolGroupAccordionProps = {
  group: FeaturePanelToolGroup;
  pathname: string;
  side: FeaturePanelSide;
  onClick: () => void;
};

export default function ToolGroupAccordion({
  group,
  pathname,
  side,
  onClick,
}: ToolGroupAccordionProps) {
  const { getFadeUpClass } = useGetTransitionClass();
  const panelId = useId();

  const hasActiveItem = group.items.some((item) => item.href === pathname);
  const initialOpen =
    side === 'featurePanel'
      ? group.defaultExpanded || hasActiveItem
      : hasActiveItem;

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [prevHasActiveItem, setPrevHasActiveItem] = useState(hasActiveItem);

  if (prevHasActiveItem !== hasActiveItem) {
    setPrevHasActiveItem(hasActiveItem);
    if (hasActiveItem) {
      setIsOpen(true);
    }
  }

  return (
    <li>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        data-active-group={hasActiveItem}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          getFadeUpClass('animate-delay-150'),
          'mt-2 flex w-full items-center justify-between gap-2 rounded-md p-2 text-left font-bold transition-colors',
          'text-slate-800 dark:text-slate-300',
          'hover:bg-sky-600/10',
          hasActiveItem && !isOpen && 'text-sky-600 dark:text-sky-400'
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate">{group.name}</span>
          {group.badge && (
            <Badge
              variant="purple"
              size="xs"
              bordered
              className="shrink-0 px-1.5 py-0 text-[10px]"
            >
              {group.badge}
            </Badge>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
            {group.items.length}
          </span>
          <ChevronDown
            size={16}
            className={cn(
              'text-slate-400 transition-transform duration-300',
              isOpen && 'rotate-180'
            )}
          />
        </span>
      </button>

      <motion.div
        id={panelId}
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <ul
          inert={!isOpen}
          className={cn(
            'ml-3 border-l border-neutral-300/60 pl-2 dark:border-neutral-700/60',
            getFadeUpClass('animate-delay-200')
          )}
        >
          {group.subGroups?.length
            ? group.subGroups.map((subGroup, index) => (
                <ToolSubGroupSection
                  key={subGroup.id}
                  subGroup={subGroup}
                  isFirst={index === 0}
                  pathname={pathname}
                  side={side}
                  onClick={onClick}
                />
              ))
            : group.items.map((item) => (
                <ToolNavItem
                  key={item.key}
                  item={item}
                  isActive={pathname === item.href}
                  side={side}
                  onClick={onClick}
                />
              ))}
        </ul>
      </motion.div>
    </li>
  );
}
