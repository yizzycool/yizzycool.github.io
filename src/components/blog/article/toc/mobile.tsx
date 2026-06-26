'use client';

import { ChevronDown, List } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { cn } from '@/utils/cn';

type Props = {
  toc: string;
};

export default function TocMobile({ toc }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  const { getFadeUpClass } = useGetTransitionClass();

  return (
    <section
      className={cn(
        'mx-auto my-12 block lg:hidden',
        getFadeUpClass('animate-delay-200')
      )}
    >
      <nav
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          'bg-neutral-50/50 backdrop-blur-md dark:bg-neutral-900/50',
          'rounded-2xl border-2 border-neutral-200 dark:border-neutral-700'
        )}
        aria-label="table of content"
      >
        {/* TOC Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between p-4 text-left focus:outline-none"
          aria-label="table of content"
        >
          <div className="flex items-center gap-3 text-neutral-800 dark:text-neutral-300">
            <List size={18} className="mx-2" />
            <div className="flex flex-col items-start">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Table of Contents
              </span>
              <span className="mt-1 text-sm font-medium">文章章節目錄</span>
            </div>
          </div>
          <ChevronDown
            size={20}
            className={cn(
              'text-neutral-400 transition-all duration-300',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* TOC Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-neutral-200 dark:border-neutral-700"
            >
              <div
                className={cn(
                  'p-4 text-sm leading-normal',
                  '[&_*]:space-y-4 [&_*]:transition-all [&_*]:duration-300',
                  '[&_a:hover]:brightness-200 [&_a]:block',
                  '[&_ol]:pl-2 [&_ul]:pl-2',
                  '[&_ol_ol]:pl-5 [&_ul_ul]:pl-5',
                  '[&_ol_ol]:border-l [&_ol_ol]:border-neutral-400/50',
                  '[&_ul_ul]:border-l [&_ul_ul]:border-neutral-400/50'
                )}
              >
                <div dangerouslySetInnerHTML={{ __html: toc }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </section>
  );
}
