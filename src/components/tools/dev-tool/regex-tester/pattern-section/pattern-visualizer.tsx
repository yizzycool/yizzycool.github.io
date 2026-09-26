import { cn } from '@/utils/cn';
import { useMemo } from 'react';
import { forEach, map, isUndefined } from 'lodash';

import { RegexColors } from '..';

type Props = {
  pattern: string;
};

export default function PatternVisualizer({ pattern }: Props) {
  const groupInfo = useMemo(() => {
    const stack: Array<Array<number>> = [];
    const info: Record<number, number> = {};

    let isInSquareBrackets = false;
    let groupIdx = 0;
    forEach(pattern, (p, idx) => {
      // Detect square brackets
      if (p === '[' && (idx === 0 || p[idx - 1] !== '\\')) {
        isInSquareBrackets = true;
      } else if (p === ']' && (idx === 0 || p[idx - 1] !== '\\')) {
        isInSquareBrackets = false;
      }
      // Continue if the character is inside the square brackets `[]`
      if (isInSquareBrackets) return;
      // Detect parentheses
      if (p === '(' && (idx === 0 || p[idx - 1] !== '\\')) {
        stack.push([groupIdx, idx]);
        groupIdx += 1;
      } else if (p === ')' && (idx === 0 || p[idx - 1] !== '\\')) {
        const [leftGroupIdx, leftIdx] = stack.pop() || [];
        if (!isUndefined(leftGroupIdx)) {
          info[leftIdx] = leftGroupIdx;
          info[idx] = leftGroupIdx;
        }
      }
    });

    return info;
  }, [pattern]);

  const getDataGroup = (idx: number) => {
    if (idx in groupInfo) {
      return `group-${groupInfo[idx]}`;
    }
  };

  const getSpanClass = (idx: number) => {
    if (idx in groupInfo) {
      const groupIdx = groupInfo[idx];
      const color = RegexColors[groupIdx % RegexColors.length];
      return cn('font-bold', color.text);
    }
  };

  if (!pattern) return '-';

  return (
    <>
      {map(pattern, (p, idx) => (
        <span
          key={p + idx}
          data-group={getDataGroup(idx)}
          className={getSpanClass(idx)}
        >
          {p}
        </span>
      ))}
    </>
  );
}
