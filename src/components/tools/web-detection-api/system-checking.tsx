'use client';

import { Loader2 } from 'lucide-react';

import StatusCardOverlay from './status-card-overlay';

type Props = {
  isOpen?: boolean;
};

export default function SystemChecking({ isOpen = true }: Props) {
  return (
    <StatusCardOverlay isOpen={isOpen}>
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
    </StatusCardOverlay>
  );
}
