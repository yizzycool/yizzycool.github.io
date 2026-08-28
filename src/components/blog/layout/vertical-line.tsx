'use client';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { cn } from '@/utils/cn';

export default function VerticalLine() {
  const { getFadeUpClass } = useGetTransitionClass();

  return (
    <div
      className={cn(
        getFadeUpClass(),
        'sticky top-[68px] hidden h-[calc(100dvh_-_68px)] lg:block',
        'shrink-0 border-r border-neutral-400/20'
      )}
    />
  );
}
