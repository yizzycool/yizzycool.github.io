'use client';

import { ArrowDown, ArrowUp, Eraser, Type, Wand2 } from 'lucide-react';
import Button from '@/components/common/button';
import _capitalize from 'lodash/capitalize';
import clsx from 'clsx';
import Label from '@/components/common/label';

const Actions = [
  {
    label: 'Uppercase',
    icon: ArrowUp,
    actionType: 'upper',
  },
  {
    label: 'Lowercase',
    icon: ArrowDown,
    actionType: 'lower',
  },
  {
    label: 'Title',
    icon: Type,
    actionType: 'title',
  },
  {
    label: 'Trim',
    icon: Eraser,
    actionType: 'trim',
  },
];

type Props = {
  setText: React.Dispatch<React.SetStateAction<string>>;
};

export default function Tools({ setText }: Props) {
  const transformText = (actionType: string) => {
    if (actionType === 'upper') {
      setText((prev) => prev.toUpperCase());
    } else if (actionType === 'lower') {
      setText((prev) => prev.toLowerCase());
    } else if (actionType === 'title') {
      setText((prev) => prev.replace(/\w\S*/g, (txt) => _capitalize(txt)));
    } else if (actionType === 'trim') {
      setText((prev) => prev.replace(/\s+/g, ' ').trim());
    }
  };

  return (
    <div
      className={clsx(
        'flex flex-wrap items-center gap-2 p-2',
        'rounded-2xl rounded-t-none',
        'bg-white dark:bg-neutral-900',
        'border border-t-0 border-neutral-200 dark:border-neutral-700'
      )}
    >
      <Label
        icon={Wand2}
        className={clsx(
          'mr-2 flex items-center px-3',
          'text-xs font-black uppercase tracking-widest',
          'border-r border-neutral-200 dark:border-neutral-700',
          'text-neutral-400 dark:text-neutral-500'
        )}
      >
        Text Tools
      </Label>

      {Actions.map(({ label, icon, actionType }) => (
        <Button
          key={label}
          variant="ghost"
          size="sm"
          onClick={() => transformText(actionType)}
          icon={icon}
        >
          {label}
        </Button>
      ))}

      <div className="flex-grow" />
    </div>
  );
}
