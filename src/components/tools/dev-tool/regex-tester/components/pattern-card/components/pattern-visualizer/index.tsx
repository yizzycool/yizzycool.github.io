import clsx from 'clsx';
import { useMemo } from 'react';
import { RegexColors } from '../../../..';
import _forEach from 'lodash/forEach';
import _map from 'lodash/map';
import _isUndefined from 'lodash/isUndefined';

type Props = {
  pattern: string;
};

export default function PatternVisualizer({ pattern }: Props) {
  const groupInfo = useMemo(() => {
    const stack: Array<Array<number>> = [];
    const info: Record<number, number> = {};

    let groupIdx = 0;
    _forEach(pattern, (p, idx) => {
      if (p === '(' && (idx === 0 || p[idx - 1] !== '\\')) {
        stack.push([groupIdx, idx]);
        groupIdx += 1;
      } else if (p === ')' && (idx === 0 || p[idx - 1] !== '\\')) {
        const [leftGroupIdx, leftIdx] = stack.pop() || [];
        if (!_isUndefined(leftGroupIdx)) {
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
      return clsx('font-bold', color.text);
    }
  };

  if (!pattern)
    return <span className="italic text-neutral-400">Type a pattern...</span>;

  return (
    <>
      {_map(pattern, (p, idx) => (
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
