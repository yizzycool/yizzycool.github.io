'use client';

import clsx from 'clsx';
import { MouseEventHandler } from 'react';
import { ArrowsRightLeftIcon } from '@heroicons/react/20/solid';

export default function SwitchButton({
  onSwitch,
}: {
  onSwitch: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      className={clsx(
        'm-auto mb-5 block rotate-90 cursor-pointer',
        'md:absolute md:-left-5 md:top-0 md:rotate-0'
      )}
      onClick={onSwitch}
    >
      <ArrowsRightLeftIcon className="h-6 w-6" />
    </button>
  );
}
