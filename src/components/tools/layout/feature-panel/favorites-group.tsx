'use client';

import type { FeaturePanelSide, FeaturePanelToolItem } from './types';

import { useId, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Star } from 'lucide-react';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { cn } from '@/utils/cn';

import ToolNavItem from './tool-nav-item';

type FavoritesGroupProps = {
  items: FeaturePanelToolItem[];
  pathname: string;
  side: FeaturePanelSide;
  onClick: () => void;
};

export default function FavoritesGroup({
  items,
  pathname,
  side,
  onClick,
}: FavoritesGroupProps) {
  const { getFadeUpClass } = useGetTransitionClass();
  const panelId = useId();
  const [isOpen, setIsOpen] = useState(true);

  if (items.length === 0) {
    return null;
  }

  return (
    <li>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          getFadeUpClass('animate-delay-150'),
          'mt-2 flex w-full items-center justify-between gap-2 rounded-md p-2 text-left font-bold transition-colors',
          'text-slate-800 dark:text-slate-300',
          'hover:bg-sky-600/10'
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
          <span className="truncate">Favorites</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
            {items.length}
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
            'ml-3 border-l border-amber-300/60 pl-2 dark:border-amber-500/30',
            getFadeUpClass('animate-delay-200')
          )}
        >
          {items.map((item) => (
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
