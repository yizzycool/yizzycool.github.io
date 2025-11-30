'use client';

import { ActionButtonProps } from '@/types/common/action-button';
import { Clipboard } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import useDisplay from '../hooks/use-display';
import Button from '../../button';
import _find from 'lodash/find';

type InputType = 'string' | 'image';

type OnTextPaste = (text: string) => void;
type OnImagePaste = (blob: Blob) => void;

type OnClick<T extends InputType> = T extends 'string'
  ? OnTextPaste
  : OnImagePaste;

interface Props<T extends InputType> extends ActionButtonProps {
  onClick?: OnClick<T>;
  type?: T;
}

export default function PasteAction<T extends InputType>({
  display = 'icon-label',
  size = 'xs',
  disabled = false,
  onClick = () => {},
  type = 'string' as T,
}: Props<T>) {
  const [isActionSupported, setIsActionSupported] = useState(false);

  const { showIcon, showLabel } = useDisplay({ display });

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
    <Button
      onClick={onPasteClick}
      variant="secondary"
      size={size}
      icon={showIcon ? Clipboard : undefined}
      disabled={isButtonDisabled}
    >
      {showLabel ? 'Paste' : null}
    </Button>
  );
}
