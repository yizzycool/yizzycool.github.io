'use client';

import { Loader2 } from 'lucide-react';

import { BaseDialog } from '@/components/ui/dialog';

type Props = {
  isOpen?: boolean;
};

export default function SystemChecking({ isOpen = true }: Props) {
  return (
    <div
      id="system-checking-block"
      className="absolute inset-0 z-10 backdrop-blur-sm"
    >
      <BaseDialog
        isOpen={isOpen}
        backdrop={false}
        className="sticky bottom-auto top-[68px] h-[calc(100dvh-68px)] w-full"
        dialogClassName="p-6 text-center"
        portalContainer="#system-checking-block"
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              System Checking
            </h3>
            <p className="mt-1 text-xs">
              Checking Chrome Built-in AI status...
            </p>
          </div>
        </div>
      </BaseDialog>
    </div>
  );
}
