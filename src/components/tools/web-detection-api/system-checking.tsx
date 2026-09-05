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
        hasBackdrop={false}
        className="p-6 text-center"
        dialogClassName="sticky top-[68px] bottom-auto w-full h-[calc(100dvh-68px)]"
        portalConfig={{
          selectorOrElement: '#system-checking-block',
          portalKey: 'system-checking-dialog',
        }}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              System Checking
            </h3>
            <p className="mt-1 text-xs">Checking Web Detector API status...</p>
          </div>
        </div>
      </BaseDialog>
    </div>
  );
}
