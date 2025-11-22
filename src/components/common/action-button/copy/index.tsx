'use client';

import clsx from 'clsx';
import { Check, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import _isNil from 'lodash/isNil';

export default function CopyAction({
  content = '',
  disabled = false,
}: {
  content?: string | Blob | null | undefined;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const mimeType = useMemo(() => {
    if (typeof content === 'string') {
      return 'text/plain';
    } else if (_isNil(content)) {
      return '';
    } else {
      return content.type;
    }
  }, [content]);

  const isFunctionSupported = useMemo(() => {
    return !!ClipboardItem && !!navigator.clipboard?.write;
  }, []);

  const isClipboardSupportMimeType = useMemo(() => {
    return ClipboardItem.supports(mimeType);
  }, [mimeType]);

  const isButtonDisabled = useMemo(() => {
    return (
      disabled ||
      _isNil(content) ||
      !isClipboardSupportMimeType ||
      !isFunctionSupported
    );
  }, [disabled, content, isClipboardSupportMimeType, isFunctionSupported]);

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

  if (!isFunctionSupported) return null;

  return (
    <button
      onClick={handleCopy}
      className={clsx(
        'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium shadow-sm',
        'border border-gray-200 dark:border-neutral-700',
        'bg-white dark:bg-neutral-800',
        'text-gray-600 dark:text-neutral-300',
        'hover:bg-gray-50 dark:hover:bg-neutral-700',
        isButtonDisabled && 'pointer-events-none opacity-50'
      )}
    >
      {copied ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
