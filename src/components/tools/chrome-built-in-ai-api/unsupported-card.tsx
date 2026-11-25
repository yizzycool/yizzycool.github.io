'use client';

import type { UnsupportedApiType } from './data/unsupported-types';

import {
  AlertTriangle,
  Copy,
  ExternalLink,
  Settings,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import toast from '@/utils/toast';

import {
  CHROME_BUILT_IN_AI_API_FLAGS,
  CHROME_BUILT_IN_AI_API_NAMES,
} from './data/unsupported-types';
import StatusCardOverlay from './status-card-overlay';

type Props = {
  apiType: UnsupportedApiType;
  isOpen?: boolean;
  onEnterDemo?: () => void;
};

export default function UnsupportedCard({
  apiType,
  isOpen = true,
  onEnterDemo,
}: Props) {
  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Copied link for Chrome Desktop');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <StatusCardOverlay isOpen={isOpen}>
      <div className="flex flex-col items-center justify-center">
        {/* Error Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
          <AlertTriangle size={40} className="text-red-500 dark:text-red-400" />
        </div>

        {/* Text */}
        <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Browser Not Supported
        </h2>
        <p className="mb-8 text-sm leading-relaxed">
          Chrome&apos;s built-in AI ({CHROME_BUILT_IN_AI_API_NAMES[apiType]}) is
          not available on this device or browser configuration.
        </p>

        {/* Checklist */}
        <div className="mb-8 w-full space-y-3 rounded-xl bg-neutral-50 p-4 text-left dark:bg-neutral-800">
          <h3 className="mb-1 text-xs font-bold uppercase tracking-wider">
            Requirements
          </h3>

          <div className="flex items-start gap-3">
            <Image
              className="mt-0.5 text-slate-400"
              src="/assets/images/brand/Google/Google_Chrome_icon.svg"
              width={16}
              height={16}
              alt="Google Chrome logo"
            />
            <div className="text-xs">
              <span className="block font-medium text-slate-700 dark:text-slate-200">
                Chrome Version 128+
              </span>
              <span className="text-slate-400">
                Update your browser to the latest version.
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
                  {CHROME_BUILT_IN_AI_API_FLAGS[apiType]}
                </code>{' '}
                in chrome://flags.
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-2.5">
          {onEnterDemo && (
            <Button
              variant="primary"
              icon={Sparkles}
              onClick={onEnterDemo}
              className="w-full"
            >
              Preview Interactive Demo
            </Button>
          )}

          <div className="flex gap-2">
            <Button
              variant={onEnterDemo ? 'outline' : 'primary'}
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Check Again
            </Button>

            <Button
              variant="outline"
              icon={Copy}
              onClick={() => void handleCopyLink()}
              title="Copy link to open in Chrome Desktop"
            >
              Copy URL
            </Button>
          </div>

          <a
            href="https://developer.chrome.com/docs/ai/built-in"
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
    </StatusCardOverlay>
  );
}
