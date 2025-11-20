'use client';

import clsx from 'clsx';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export default function CopyAction({
  content = '',
  disabled = false,
}: {
  content?: string;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!content) return;

    // Try to use the modern Clipboard API, fallback if it fails
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(content)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error('Clipboard API failed', err);
          fallbackCopy();
        });
    } else {
      fallbackCopy();
    }
  };

  // Fallback method using a temporary textarea
  const fallbackCopy = () => {
    const textArea = document.createElement('textarea');
    textArea.value = content;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <button
      onClick={handleCopy}
      className={clsx(
        'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
        'border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50',
        'dark:border dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      {copied ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
