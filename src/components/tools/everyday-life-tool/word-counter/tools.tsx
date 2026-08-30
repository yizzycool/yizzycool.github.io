'use client';

import { cn } from '@/utils/cn';
import { ArrowDown, ArrowUp, Eraser, Type, Wand2 } from 'lucide-react';
import { capitalize } from 'lodash';

import Button from '@/components/common/button';
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
      setText((prev) => prev.replace(/\w\S*/g, (txt) => capitalize(txt)));
    } else if (actionType === 'trim') {
      setText((prev) => prev.replace(/\s+/g, ' ').trim());
    }
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 p-2.5',
        'rounded-b-xl rounded-t-none',
        'shadow-2xs bg-white/80 backdrop-blur-md dark:bg-neutral-900/80',
        'border border-t-0 border-neutral-200/90 dark:border-neutral-700/80'
      )}
    >
      <Label
        icon={Wand2}
        className={cn(
          'mr-2 flex items-center px-3',
          'text-xs font-bold uppercase tracking-wider',
          'border-r border-neutral-200/90 dark:border-neutral-700/80',
          'text-slate-400 dark:text-slate-500'
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
