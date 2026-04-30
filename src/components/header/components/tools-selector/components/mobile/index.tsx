'use client';

import { cn } from '@/utils/cn';
import { ChevronDown, PenTool } from 'lucide-react';
import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

import { Tools } from '@/data/tools';

export default function ToolsSelectorMobile({
  closeSidePanel,
}: {
  closeSidePanel: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const pathname = usePathname();

  return (
    <li className="group" data-open={isOpen}>
      <button
        className={cn(
          'flex w-full items-center justify-between rounded-lg px-3 py-4',
          'transition-all duration-300',
          'hover:bg-neutral-200 dark:hover:bg-neutral-800/50'
        )}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <PenTool size={20} />
          <span className="font-medium">Tools</span>
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
        <ul className="ml-4 overflow-hidden border-l border-neutral-400/50">
          {Tools.map((tool) => (
            <li key={tool.name} className="space-y-4 p-4">
              <span className="text-sm font-bold tracking-wide text-neutral-500 dark:text-neutral-400">
                {tool.name}
              </span>
              <ul>
                {tool.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      className={cn(
                        'mt-2 flex items-center text-sm',
                        'transition-all duration-300',
                        'hover:text-sky-500 dark:hover:text-sky-500',
                        'data-[active=true]:text-sky-500'
                      )}
                      href={item.href}
                      onClick={closeSidePanel}
                      data-active={pathname === item.href}
                    >
                      <div className="mr-3 h-8 w-8 p-1.5 dark:border-gray-500/50">
                        <item.icon.component className="h-full w-full" />
                      </div>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </motion.div>
    </li>
  );
}
