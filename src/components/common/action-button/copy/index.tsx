'use client';

import type { ActionButtonProps } from '@/types/common/action-button';
import { Check, Copy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import useDisplay from '../hooks/use-display';
import Button from '../../button';
import _isNil from 'lodash/isNil';

interface Props extends ActionButtonProps {
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
}: Props) {
  const [copied, setCopied] = useState(false);
  const [isActionSupported, setIsActionSupported] = useState(false);
  const [isMimeTypeSupported, setIsMimeTypeSupported] = useState(false);

  const { showIcon, showLabel } = useDisplay({ display });

  const mimeType = useMemo(() => {
    if (typeof content === 'string') {
      return 'text/plain';
    } else if (_isNil(content)) {
      return '';
    } else {
      return content.type;
    }
  }, [content]);

  const isButtonDisabled = useMemo(() => {
    return (
      disabled || _isNil(content) || !isMimeTypeSupported || !isActionSupported
    );
  }, [disabled, content, isMimeTypeSupported, isActionSupported]);

  // Check if ClipboardItem and navigator?.clipboard?.write exist
  useEffect(() => {
    setIsActionSupported(
      !!window.ClipboardItem && !!window.navigator?.clipboard?.write
    );
  }, []);

  // Check if mimeType is supported
  useEffect(() => {
    setIsMimeTypeSupported(
      !!window.ClipboardItem && ClipboardItem.supports(mimeType)
    );
  }, [mimeType]);

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
