'use client';

import type { ActionButtonProps } from '@/types/common/action-button';

import { Check, Copy } from 'lucide-react';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { isNil } from 'lodash';

import useDisplay from '../hooks/use-display';
import Button from '../../button';

interface CopyActionProps extends ActionButtonProps {
  content?: string | Blob | null | undefined;
}

export default function CopyAction({
  display = 'icon-label',
  variant = 'secondary',
  size = 'xs',
  rounded,
  bordered,
  className,
  disabled = false,
  content = '',
  label = 'Copy',
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
      className={className}
      icon={!showIcon ? undefined : copied ? Check : Copy}
      disabled={isButtonDisabled}
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
