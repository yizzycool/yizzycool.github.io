'use client';

import { useRef } from 'react';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import useTocActive from '@/hooks/dom/use-toc-active';
import { cn } from '@/utils/cn';

type Props = {
  toc: string;
};

export default function TocDesktop({ toc }: Props) {
  const { getFadeUpClass } = useGetTransitionClass();
  const tocRef = useRef<HTMLDivElement>(null);

  useTocActive(tocRef, toc);

  return (
    <aside
      className={cn(
        'sticky top-[68px] h-[calc(100dvh_-_68px)] w-[300px] shrink-0 overflow-y-auto',
        'hidden lg:block',
        'border-l border-neutral-400/20',
        'px-4 py-5 lg:py-10',
        getFadeUpClass()
      )}
    >
      <nav aria-label="table of content">
        <h2
          className={cn(
            'font-bold text-neutral-800 dark:text-neutral-300',
            getFadeUpClass('animate-delay-150')
          )}
        >
          Table of Contents
        </h2>
        <div
          ref={tocRef}
          className={cn(
            'mt-6 text-sm leading-normal',
            '[&_*]:space-y-3 [&_*]:transition-all [&_*]:duration-300',
            '[&_a:hover]:text-sky-500 [&_a]:block',
            '[&_ol]:pl-2 [&_ul]:pl-2',
            '[&_ol_ol]:pl-5 [&_ul_ul]:pl-5',
            '[&_ol_ol]:border-l [&_ol_ol]:border-neutral-400/50',
            '[&_ul_ul]:border-l [&_ul_ul]:border-neutral-400/50',
            getFadeUpClass('animate-delay-200')
          )}
        >
          <div dangerouslySetInnerHTML={{ __html: toc }} />
        </div>
      </nav>
    </aside>
  );
}
