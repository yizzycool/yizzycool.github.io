'use client';

import type { BlogCategory } from '@/types/blog';

import clsx from 'clsx';
import { ChevronDown, Newspaper } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

import LeftPanel from '@/components/blog/layout/left-panel';

export default function BlogSelectorMobile({
  closeSidePanel,
  categoryArticles,
}: {
  closeSidePanel: () => void;
  categoryArticles: BlogCategory;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="group">
        <button
          className={clsx(
            'flex w-full items-center justify-between rounded-lg px-3 py-4',
            'transition-all duration-300',
            'data-[hover]:bg-neutral-200 dark:data-[hover]:bg-neutral-800/50'
          )}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <div className="flex items-center gap-3">
            <Newspaper size={20} />
            <span className="font-medium">Blog</span>
          </div>
          <ChevronDown className="size-5 transition-all duration-300 group-data-[open]:rotate-180" />
        </button>
        <motion.div
          initial={false}
          animate={{
            height: isOpen ? 'auto' : 0,
            opacity: 1,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{ overflow: 'hidden' }}
        >
          <div className="ml-4 overflow-hidden border-l border-neutral-400/50 pl-2">
            <LeftPanel
              categoryArticles={categoryArticles}
              side="headerBlogSelector"
              onClick={closeSidePanel}
            />
          </div>
        </motion.div>
      </div>
    </>
  );
}
