import type { RegexColorType } from '../../../..';

import { cn } from '@/utils/cn';
import { useMemo } from 'react';
import { forEach, filter, map } from 'lodash';

import { RegexColors } from '../../../..';

type Props = {
  pattern: string;
  flags: string;
  testString: string;
  matches: Array<RegExpExecArray>;
  error: string | null;
};

type HighlightList = Array<{
  matched?: boolean;
  text?: string;
  subGroup?: Array<{
    isGroup?: boolean;
    text?: string;
    color?: RegexColorType;
  }>;
}>;

export default function HighlightMark({
  pattern,
  flags,
  testString,
  matches,
  error,
}: Props) {
  const highlightList: HighlightList = useMemo(() => {
    try {
      const tFlags =
        flags +
        (flags.includes('g') ? '' : 'g') +
        (flags.includes('d') ? '' : 'd');
      const regex = new RegExp(pattern, tFlags);
      const parts: HighlightList = [];

      let lastIndex = 0;
      let match: RegExpExecArray | null;
      let iterations = 0;

      while ((match = regex.exec(testString)) !== null && iterations < 500) {
        iterations++;

        // Text before match
        parts.push({
          matched: false,
          text: testString.slice(lastIndex, match.index),
        });

        // Matched text
        parts.push({
          matched: true,
          text: match[0],
          subGroup: [],
        });

        // ============
        // Find subgroup info
        let subLastIndex = match.index;
        forEach(match.indices?.slice(1), (indice, idx) => {
          if (!indice) return;
          const [start, end] = indice;

          // Text before match of subgroup
          parts[parts.length - 1]?.subGroup?.push({
            text: match?.[0].slice(
              subLastIndex - match.index,
              start - match.index
            ),
          });

          // Matched text of subgroup
          parts[parts.length - 1].subGroup?.push({
            isGroup: true,
            text: match?.[0].slice(start - match.index, end - match.index),
            color: RegexColors[idx % RegexColors.length],
          });

          subLastIndex = end;
        });

        // Text after match of subgroup
        parts[parts.length - 1]?.subGroup?.push({
          text: match?.[0].slice(subLastIndex - match.index),
        });

        // Clear empty text
        if (parts[parts.length - 1]?.subGroup) {
          parts[parts.length - 1].subGroup = filter(
            parts[parts.length - 1].subGroup,
            ({ text }) => !!text
          );
        }
        // ============

        lastIndex = regex.lastIndex;
        if (match[0].length === 0) regex.lastIndex++;
      }
      parts.push({ matched: false, text: testString.slice(lastIndex) });
      return parts;
    } catch (_e) {
      return [];
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern, testString]);

  if (!pattern || error || matches.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute inset-0 z-10 w-full px-4 py-3',
        'pointer-events-none select-none',
        'whitespace-pre-wrap break-words font-mono text-base leading-loose',
        'text-transparent'
      )}
    >
      {highlightList.map(({ matched, text, subGroup }, idx) =>
        matched ? (
          <span key={idx} className="relative">
            {map(subGroup, ({ isGroup, text, color }, idx) =>
              isGroup ? (
                <span
                  key={idx}
                  className={cn(
                    'rounded-sm transition-colors duration-200',
                    color?.bg
                  )}
                >
                  {text}
                </span>
              ) : (
                <span key={idx}>{text}</span>
              )
            )}
            {/* Ring */}
            <div
              className={cn(
                'absolute -bottom-[2px] -left-[2px] -right-[2px] -top-[2px]',
                'rounded-sm border border-neutral-400/50 dark:border-neutral-400/50'
              )}
            />
          </span>
        ) : (
          text
        )
      )}
    </div>
  );
}
