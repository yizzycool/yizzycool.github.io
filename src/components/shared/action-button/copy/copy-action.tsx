'use client';

import type { CopyActionProps } from './types';

import { Check, Copy } from 'lucide-react';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { isNil } from 'lodash';

import { useDisplay } from '../hooks/use-display';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

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
}: CopyActionProps) {
  const [copied, setCopied] = useState(false);

  const isActionSupported = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const { showIcon, showLabel } = useDisplay({ display });

  const mimeType = useMemo(() => {
    if (typeof content === 'string') {
      return 'text/plain';
    } else if (isNil(content)) {
      return '';
    } else {
      return content.type;
    }
  }, [content]);

  const isMimeTypeSupported = useMemo(() => {
    if (typeof window === 'undefined' || !window.ClipboardItem) return false;
    return typeof ClipboardItem.supports === 'function'
      ? ClipboardItem.supports(mimeType)
      : false;
  }, [mimeType]);

  const isButtonDisabled = useMemo(() => {
    return (
      disabled || isNil(content) || !isMimeTypeSupported || !isActionSupported
    );
  }, [disabled, content, isMimeTypeSupported, isActionSupported]);

  const handleCopy = async () => {
    if (isButtonDisabled) return;
    if (!content) return;

    const mimeType = typeof content === 'string' ? 'text/plain' : content.type;
    const clipboardItemData = {
      [mimeType]: content,
    };
    const clipboardItem = new ClipboardItem(clipboardItemData);
    navigator.clipboard
      .write([clipboardItem])
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((e) => {
        console.log('Clipboard API failed:', e);
      });
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
      disabled={isButtonDisabled || copied}
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

function getSnapshot() {
  return (
    typeof window !== 'undefined' &&
    !!window.ClipboardItem &&
    !!window.navigator?.clipboard?.write
  );
}

function getServerSnapshot() {
  return false;
}
