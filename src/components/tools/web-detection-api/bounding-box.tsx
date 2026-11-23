'use client';

import type { TransformedResults } from './types';

import { isNull, map, round } from 'lodash';

import { cn } from '@/utils/cn';

type Props = {
  results: TransformedResults;
  activeIndex?: number | null;
  onHoverIndex?: (index: number | null) => void;
};

export default function BoundingBox({
  results,
  activeIndex = null,
  onHoverIndex,
}: Props) {
  if (isNull(results)) return null;

  const hasActive = activeIndex !== null && activeIndex !== undefined;

  return (
    <>
      {map(results, ({ label, text, confidence, boundingBox }, idx) => (
        <div
          key={idx}
          onMouseEnter={() => onHoverIndex?.(idx)}
          onMouseLeave={() => onHoverIndex?.(null)}
          className={cn(
            'group absolute cursor-pointer rounded-sm border-2 transition-all duration-150',
            hasActive && activeIndex === idx
              ? 'z-20 border-sky-400 bg-sky-400/25 shadow-[0_0_0_2px_rgba(56,189,248,0.45),0_0_18px_rgba(56,189,248,0.45)]'
              : hasActive
                ? 'z-10 border-blue-500/70 bg-blue-500/10 opacity-45'
                : 'z-10 border-blue-500 bg-blue-500/20 hover:border-sky-400 hover:bg-sky-400/25'
          )}
          style={{
            top: `${round(boundingBox.top)}px`,
            left: `${round(boundingBox.left)}px`,
            width: `${round(boundingBox.width)}px`,
            height: `${round(boundingBox.height)}px`,
          }}
        >
          <span
            className={cn(
              'absolute -left-0.5 -top-5 rounded px-1 py-px font-mono text-[10px] font-bold leading-tight text-white shadow-sm transition-colors',
              hasActive && activeIndex === idx
                ? 'bg-sky-500'
                : 'bg-blue-600 group-hover:bg-sky-500'
            )}
          >
            #{idx + 1}
          </span>

          <div
            className={cn(
              'pointer-events-none absolute -top-7 left-7 z-20 max-w-[220px] truncate whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium text-white shadow-md transition-opacity',
              hasActive && activeIndex === idx
                ? 'bg-sky-600 opacity-100'
                : 'bg-blue-600 opacity-0 group-hover:opacity-100'
            )}
          >
            {text || label}
            {confidence ? ` (${Math.round(confidence * 100)}%)` : ''}
          </div>
        </div>
      ))}
    </>
  );
}
