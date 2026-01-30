'use client';

import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

import Button from '@/components/common/button';

type Props = {
  icon: LucideIcon;
  text: string;
  onClick: () => void;
};

export default function IconTextButton({ icon: Icon, text, onClick }: Props) {
  return (
    <Button
      variant="ghost"
      rounded="none"
      onClick={onClick}
      className={clsx(
        'flex-col items-center space-y-2 !px-2 hover:bg-transparent dark:hover:bg-transparent'
      )}
    >
      <Icon size={20} />
      <div className="text-xs font-bold uppercase">{text}</div>
    </Button>
  );
}
