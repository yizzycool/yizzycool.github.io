'use client';

import clsx from 'clsx';
import { Clipboard } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import _find from 'lodash/find';

type InputType = 'string' | 'image';

type OnTextPaste = (text: string) => void;
type OnImagePaste = (blob: Blob) => void;

type OnClick<T extends InputType> = T extends 'string'
  ? OnTextPaste
  : OnImagePaste;

interface Props<T extends InputType> {
  type?: T;
  disabled?: boolean;
  size?: number;
  onClick?: OnClick<T>;
}

export default function PasteAction<T extends InputType>({
  disabled = false,
  onClick = () => {},
  size = 12,
  type = 'string' as T,
}: Props<T>) {
  const [isActionSupported, setIsActionSupported] = useState(false);

  const isButtonDisabled = useMemo(() => {
    return disabled || !isActionSupported;
  }, [disabled, isActionSupported]);

  // Check if ClipboardItem and navigator?.clipboard?.write exist
  useEffect(() => {
    if (type === 'string') {
      setIsActionSupported(!!window.navigator?.clipboard?.readText);
    } else {
      setIsActionSupported(!!window.navigator?.clipboard?.read);
    }
  }, [type]);

  const onPasteClick = async () => {
    if (isButtonDisabled) return;

    const clipboardContents = await navigator.clipboard.read();

    if (type === 'image') {
      for (const item of clipboardContents) {
        if (item.types.includes('image/')) {
          const mimeType =
            _find(item.types, (type) => type.startsWith('image/')) || '';
          const blob = await item.getType(mimeType);
          (onClick as OnImagePaste)(blob);
        }
      }
    } else {
      const text = await navigator.clipboard.readText();
      (onClick as OnTextPaste)(text);
    }
  };

  if (!isActionSupported) return null;

  return (
    <button
      onClick={onPasteClick}
      className={clsx(
        'flex items-center gap-1 rounded px-2 py-1 text-xs transition',
        'bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700',
        'text-neutral-700 dark:text-neutral-300',
        isButtonDisabled && 'pointer-events-none opacity-50'
      )}
    >
      <Clipboard size={size} /> Paste
    </button>
  );
}
