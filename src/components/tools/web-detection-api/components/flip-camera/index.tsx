'use client';

import { SwitchCamera } from 'lucide-react';

export default function FlipCamera({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="absolute bottom-4 right-4 z-10 h-10 w-10 cursor-pointer rounded-full bg-neutral-700/50 p-2"
      onClick={onClick}
    >
      <SwitchCamera className="h-full w-full" />
    </div>
  );
}
