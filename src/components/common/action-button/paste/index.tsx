'use client';

import type { ActionButtonProps } from '@/types/common/action-button';

import { Clipboard } from 'lucide-react';
import { useMemo, useSyncExternalStore } from 'react';
import { find } from 'lodash';

import useDisplay from '../hooks/use-display';
import Button from '../../button';

type InputType = 'string' | 'image';

type OnTextPaste = (text: string) => void;
type OnImagePaste = (blob: Blob) => void;

type OnClick<T extends InputType> = T extends 'string'
  ? OnTextPaste
  : OnImagePaste;

interface PasteActionProps<T extends InputType> extends ActionButtonProps {
  onClick?: OnClick<T>;
  type?: T;
}

export default function PasteAction<T extends InputType>({
  display = 'icon-label',
  size = 'xs',
  disabled = false,
  onClick = () => {},
  type = 'string' as T,
}: PasteActionProps<T>) {
  const isActionSupported = useSyncExternalStore(
    subscribe,
    () => getSnapshot(type),
    getServerSnapshot
  );

  const { showIcon, showLabel } = useDisplay({ display });

  const isButtonDisabled = useMemo(() => {
    return disabled || !isActionSupported;
  }, [disabled, isActionSupported]);

  const onPasteClick = async () => {
    if (isButtonDisabled) return;

    const clipboardContents = await navigator.clipboard.read();

    if (type === 'image') {
      for (const item of clipboardContents) {
        if (item.types.includes('image/')) {
          const mimeType =
            find(item.types, (type) => type.startsWith('image/')) || '';
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

function subscribe() {
  return () => {};
}

function getSnapshot(type: InputType) {
  if (typeof window === 'undefined') return false;
  return type === 'string'
    ? !!window.navigator?.clipboard?.readText
    : !!window.navigator?.clipboard?.read;
}

function getServerSnapshot() {
  return false;
}
