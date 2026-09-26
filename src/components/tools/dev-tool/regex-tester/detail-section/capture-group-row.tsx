import { cn } from '@/utils/cn';

import { RegexColors } from '..';
import { useMemo } from 'react';
import { findKey, isEqual } from 'lodash';

type Props = {
  group: string | undefined;
  index: number;
  indices?: RegExpIndicesArray;
};

export default function CaptureGroupRow({ group, index, indices }: Props) {
  const color = RegexColors[(index - 1) % RegexColors.length];

  const groupName = useMemo(() => {
    if (!indices?.groups) return '';
    if (indices.length <= index) return '';

    return (
      findKey(indices.groups, (val) => {
        return isEqual(val, indices[index]);
      }) || ''
    );
  }, [index, indices]);

  return (
    <>
      <span className={cn('font-bold', color.text)}>
        G{index}
        {!!groupName && '<' + groupName + '>'}
      </span>
      <span className="break-all text-slate-600 dark:text-slate-300">
        {group !== undefined ? (
          group
        ) : (
          <span className="italic text-slate-400">undefined</span>
        )}
      </span>
    </>
  );
}
