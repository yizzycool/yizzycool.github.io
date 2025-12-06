'use client';

import {
  WebDetectApiNames,
  UnsupportedApiType,
} from '../../data/unsupported-types';
import { AlertTriangle, Cpu, ExternalLink, Settings } from 'lucide-react';
import Button from '@/components/common/button';

export default function UnsupportedCard({
  apiType,
}: {
  apiType: UnsupportedApiType;
}) {
  return (
    <div className="mt-16 flex h-full flex-col items-center justify-center px-6 text-center duration-500 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl border border-neutral-100 bg-white p-8 shadow-2xl shadow-neutral-200/50 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-black/50">
        {/* Error Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
          <AlertTriangle size={40} className="text-red-500 dark:text-red-400" />
        </div>

        {/* Text */}
        <h2 className="mb-3 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          Browser Not Supported
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          The Web Detector API ({WebDetectApiNames[apiType]}) is not available
          on this device or browser configuration.
        </p>

        {/* Checklist */}
        <div className="mb-8 space-y-3 rounded-xl bg-neutral-50 p-4 text-left dark:bg-neutral-800">
          <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Requirements
          </h3>

          <div className="flex items-start gap-3">
            <Cpu size={16} className="mt-0.5 text-neutral-400" />
            <div className="text-xs">
              <span className="block font-medium text-neutral-700 dark:text-neutral-200">
                Supported operating systems
              </span>
              <span className="text-neutral-400">
                Works only on macOS, ChromeOS and Android (Android requires
                Google Play Services).
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Settings size={16} className="mt-0.5 text-neutral-400" />
            <div className="text-xs">
              <span className="block font-medium text-neutral-700 dark:text-neutral-200">
                Experimental Flags
              </span>
              <span className="text-neutral-400">
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
        <div className="space-y-3">
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
              className="w-full text-neutral-500"
              icon={ExternalLink}
            >
              View Documentation
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
