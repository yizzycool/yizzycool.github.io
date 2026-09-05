'use client';

import type { UnsupportedApiType } from './data/unsupported-types';

import { AlertTriangle, Cpu, ExternalLink, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { BaseDialog } from '@/components/ui/dialog';
import { WEB_DETECT_API_NAMES } from './data/unsupported-types';

type Props = {
  apiType: UnsupportedApiType;
  isOpen?: boolean;
};

export default function UnsupportedCard({ apiType, isOpen = true }: Props) {
  return (
    <div
      id="unsupported-card-block"
      className="absolute inset-0 z-10 backdrop-blur-sm"
    >
      <BaseDialog
        isOpen={isOpen}
        hasBackdrop={false}
        className="max-w-md overflow-y-auto p-6 text-center"
        dialogClassName="sticky top-[68px] bottom-auto w-full h-[calc(100dvh-68px)]"
        portalConfig={{
          selectorOrElement: '#unsupported-card-block',
          portalKey: 'unsupported-card-dialog',
        }}
      >
        <div className="flex flex-col items-center justify-center">
          {/* Error Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
            <AlertTriangle
              size={40}
              className="text-red-500 dark:text-red-400"
            />
          </div>

          {/* Text */}
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Browser Not Supported
          </h2>
          <p className="mb-8 text-sm leading-relaxed">
            The Web Detector API ({WEB_DETECT_API_NAMES[apiType]}) is not
            available on this device or browser configuration.
          </p>

          {/* Checklist */}
          <div className="mb-8 space-y-3 rounded-xl bg-neutral-50 p-4 text-left dark:bg-neutral-800">
            <h3 className="mb-1 text-xs font-bold uppercase tracking-wider">
              Requirements
            </h3>

            <div className="flex items-start gap-3">
              <Cpu size={16} className="mt-0.5 text-slate-400" />
              <div className="text-xs">
                <span className="block font-medium text-slate-700 dark:text-slate-200">
                  Supported operating systems
                </span>
                <span className="text-slate-400">
                  Works only on macOS, ChromeOS and Android (Android requires
                  Google Play Services).
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Settings size={16} className="mt-0.5 text-slate-400" />
              <div className="text-xs">
                <span className="block font-medium text-slate-700 dark:text-slate-200">
                  Experimental Flags
                </span>
                <span className="text-slate-400">
                  Enable{' '}
                  <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-700">
                    enable-experimental-web-platform-features
                  </code>{' '}
                  in chrome://flags.
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full space-y-3">
            <Button onClick={() => {}} className="w-full">
              Check Again
            </Button>

            <a
              href="https://developer.chrome.com/docs/capabilities/shape-detection"
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <Button
                variant="ghost"
                size="xs"
                className="w-full text-slate-500"
                icon={ExternalLink}
              >
                View Documentation
              </Button>
            </a>
          </div>
        </div>
      </BaseDialog>
    </div>
  );
}
