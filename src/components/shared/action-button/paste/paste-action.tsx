'use client';

import type {
  OnImagePaste,
  OnTextPaste,
  PasteActionProps,
  PasteInputType,
} from './types';

import { Clipboard } from 'lucide-react';
import { useMemo, useSyncExternalStore } from 'react';
import { find } from 'lodash';

import { useDisplay } from '../hooks/use-display';
import { Button } from '@/components/ui/button';

export function PasteAction<T extends PasteInputType = 'string'>({
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
            find(item.types, (t) => t.startsWith('image/')) || '';
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

function getSnapshot(type: PasteInputType) {
  if (typeof window === 'undefined') return false;
  return type === 'string'
    ? !!window.navigator?.clipboard?.readText
    : !!window.navigator?.clipboard?.read;
}

function getServerSnapshot() {
  return false;
}
