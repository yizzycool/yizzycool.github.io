'use client';

import { MouseEventHandler } from 'react';
import { ArrowsRightLeftIcon } from '@heroicons/react/20/solid';

export default function SwitchButton({
  onSwitch,
}: {
  onSwitch: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      className="absolute -left-5 top-0 cursor-pointer"
      onClick={onSwitch}
    >
      <ArrowsRightLeftIcon className="h-6 w-6" />
    </button>
  );
}
