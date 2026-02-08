'use client';

import clsx from 'clsx';
import { ChevronDown, List } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';

type Props = {
  toc: string;
};

export default function TocMobile({ toc }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  const { getSlideUpClass } = useGetTransitionClass();

  return (
    <section
      className={clsx(
        'mx-auto my-20 block lg:hidden',
        getSlideUpClass('[transition-delay:250ms]')
      )}
    >
      <div
        className={clsx(
          'relative transition-all duration-300',
          'bg-neutral-50/50 backdrop-blur-md dark:bg-neutral-900/50',
          'rounded-2xl border-2 border-neutral-200 dark:border-neutral-800'
        )}
      >
        {/* TOC Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            'flex w-full items-center justify-between p-4 focus:outline-none'
          )}
          aria-label="table of content"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-neutral-200 p-2 dark:bg-neutral-800">
              <List
                size={18}
                className="text-neutral-600 dark:text-neutral-400"
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Table of Contents
              </span>
              <span className="text-sm font-medium">文章章節目錄</span>
            </div>
          </div>
          <ChevronDown
            size={20}
            className={clsx(
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
              className="overflow-hidden"
            >
              <div
                className={clsx(
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
      </div>
    </section>
  );
}
