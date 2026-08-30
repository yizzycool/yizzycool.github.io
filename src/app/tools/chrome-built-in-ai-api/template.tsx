'use client';

import useGetTransitionClass from '@/hooks/animation/use-get-transition-class';
import { cn } from '@/utils/cn';

export default function ToolsTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getFadeUpClass } = useGetTransitionClass();

  return (
    <div className={cn('w-full', getFadeUpClass('animate-delay-150'))}>
      {children}
    </div>
  );
}
