'use client';

import { cn } from '@/utils/cn';
import { ChevronDown, PenTool } from 'lucide-react';
import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import FeaturePanel from '@/components/tools/layout/feature-panel';

type ToolsSelectorMobileProps = {
  closeDrawer: () => void;
};

export default function ToolsSelectorMobile({
  closeDrawer,
}: ToolsSelectorMobileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isActive = pathname.startsWith('/tools');

  return (
    <li className="group" data-open={isOpen}>
      <button
        className={cn(
          'flex w-full items-center justify-between rounded-lg px-3 py-4 font-medium transition-all duration-300',
          isActive && !isOpen
            ? 'bg-neutral-100 font-semibold text-slate-950 dark:bg-neutral-800 dark:text-slate-50'
            : 'text-slate-600 hover:bg-neutral-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-neutral-800/50 dark:hover:text-slate-200'
        )}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <PenTool size={20} />
          <span>Tools</span>
        </div>
        <ChevronDown className="size-5 transition-all duration-300 group-data-[open=true]:rotate-180" />
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
          <FeaturePanel side="headerToolsSelector" onClick={closeDrawer} />
        </div>
      </motion.div>
    </li>
  );
}
