'use client';

import { useCallback, useEffect, useState, RefObject } from 'react';

export interface ElementSize {
  width: number;
  height: number;
}

export interface UseElementSizeOptions<T extends HTMLElement = HTMLElement> {
  targetRef?: RefObject<T | null>;
}

export interface UseElementSizeReturn<T extends HTMLElement = HTMLElement>
  extends ElementSize {
  ref: (node: T | null) => void;
}

/**
 * Hook to dynamically track the width and height of a DOM element or React Ref using ResizeObserver.
 *
 * @example
 * // Usage 1: Let hook provide ref callback
 * const { ref, width, height } = useElementSize<HTMLDivElement>();
 * return <div ref={ref}>...</div>;
 *
 * @example
 * // Usage 2: Pass existing ref object
 * const myRef = useRef<HTMLDivElement>(null);
 * const { width, height } = useElementSize({ targetRef: myRef });
 *
 * @param {UseElementSizeOptions<T>} [options] Optional configuration containing targetRef.
 * @returns {UseElementSizeReturn<T>} Object containing `ref`, `width`, and `height`.
 */
export default function useElementSize<T extends HTMLElement = HTMLElement>(
  options: UseElementSizeOptions<T> = {}
): UseElementSizeReturn<T> {
  const { targetRef } = options;

  const [targetNode, setTargetNode] = useState<T | null>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  const ref = useCallback((node: T | null) => {
    setTargetNode(node);
  }, []);

  useEffect(() => {
    const element = targetRef ? targetRef.current : targetNode;
    if (!element || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const { width, height } = entry.target.getBoundingClientRect();
      setSize((prev) => {
        if (prev.width === width && prev.height === height) {
          return prev;
        }
        return { width, height };
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [targetRef, targetNode]);

  return {
    ref,
    width: size.width,
    height: size.height,
  };
}
