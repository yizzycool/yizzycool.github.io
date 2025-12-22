import type { RegexColorType } from '../../../..';
import clsx from 'clsx';
import { useMemo } from 'react';
import { RegexColors } from '../../../..';
import _forEach from 'lodash/forEach';
import _filter from 'lodash/filter';
import _map from 'lodash/map';

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
        _forEach(match.indices?.slice(1), ([start, end], idx) => {
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
          parts[parts.length - 1].subGroup = _filter(
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
  }, [pattern, testString]);

  if (!pattern || error || matches.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className={clsx(
        'absolute inset-0 z-10 w-full rounded-lg px-4 py-3',
        'border border-transparent',
        'pointer-events-none select-none',
        'whitespace-pre-wrap break-words font-mono text-base leading-loose',
        'text-transparent'
      )}
    >
      {highlightList.map(({ matched, text, subGroup }, idx) =>
        matched ? (
          <span key={idx} className="relative">
            {_map(subGroup, ({ isGroup, text, color }, idx) =>
              isGroup ? (
                <span
                  key={idx}
                  className={clsx(
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
              className={clsx(
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
