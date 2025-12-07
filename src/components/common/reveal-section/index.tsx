'use client';

import useIntersectionObserver from '@/hooks/window/use-intersection-observer';
import clsx from 'clsx';
import { useRef } from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
};

export default function RevealSection({
  children,
  className = '',
  delay = 0,
  threshold = 0.1,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const { hit: isVisible } = useIntersectionObserver({
    targetRef: ref,
    threshold,
  });

  return (
    <div
      ref={ref}
      className={clsx(
        'transform transition-all duration-1000 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0',
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
