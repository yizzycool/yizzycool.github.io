'use client';

import type { CopyActionProps } from './types';

import { Check, Copy } from 'lucide-react';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { isNil } from 'lodash';

import { useDisplay } from '../hooks/use-display';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import toast from '@/utils/toast';

let timer: NodeJS.Timeout;

export function CopyAction({
  display = 'icon-label',
  variant = 'outline',
  size = 'xs',
  rounded,
  bordered,
  className,
  disabled = false,
  content = '',
  label = 'Copy',
  ariaLabel,
  title,
  successToast,
  errorToast = true,
  onSuccess,
  onError,
}: CopyActionProps) {
  const [copied, setCopied] = useState(false);

  const isStringContent = typeof content === 'string';

  const isActionSupported = useSyncExternalStore(
    subscribe,
    () => {
      if (typeof window === 'undefined' || !navigator.clipboard) return false;
      return isStringContent
        ? typeof navigator.clipboard.writeText === 'function'
        : typeof window.ClipboardItem === 'function' &&
            typeof navigator.clipboard.write === 'function';
    },
    getServerSnapshot
  );

  const { showIcon, showLabel } = useDisplay({ display });

  const isMimeTypeSupported = useMemo(() => {
    if (isStringContent) return true;
    if (typeof window === 'undefined' || !window.ClipboardItem) return false;

    const mimeType = content && typeof content !== 'string' ? content.type : '';
    if (!mimeType) return true;

    return typeof ClipboardItem.supports === 'function'
      ? ClipboardItem.supports(mimeType)
      : true;
  }, [isStringContent, content]);

  const isButtonDisabled = useMemo(() => {
    return (
      disabled ||
      isNil(content) ||
      content === '' ||
      !isMimeTypeSupported ||
      !isActionSupported
    );
  }, [disabled, content, isMimeTypeSupported, isActionSupported]);

  const handleCopy = async () => {
    if (isButtonDisabled || !content) return;

    clearTimeout(timer);

    try {
      if (typeof content === 'string') {
        await navigator.clipboard.writeText(content);
      } else {
        const mimeType = content.type || 'application/octet-stream';
        const clipboardItem = new ClipboardItem({
          [mimeType]: content,
        });
        await navigator.clipboard.write([clipboardItem]);
      }

      setCopied(true);
      if (successToast) {
        const message =
          typeof successToast === 'string'
            ? successToast
            : 'Copied to clipboard';
        toast.success(message);
      }
      onSuccess?.();

      timer = setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
      if (errorToast) {
        const message =
          typeof errorToast === 'string'
            ? errorToast
            : 'Failed to copy to clipboard';
        toast.error(message);
      }
      onError?.(e);
    }
  };

  if (!isActionSupported) return null;

  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      size={size}
      rounded={rounded}
      bordered={bordered}
      className={cn(
        copied && [
          'border-emerald-300 bg-emerald-50 text-emerald-600',
          'dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400',
        ],
        className
      )}
      icon={!showIcon ? undefined : copied ? Check : Copy}
      disabled={isButtonDisabled}
      ariaLabel={ariaLabel}
      title={title}
    >
      {!showLabel ? null : copied ? 'Copied' : label}
    </Button>
  );
}

function subscribe() {
  return () => {};
}

function getServerSnapshot() {
  return false;
}
