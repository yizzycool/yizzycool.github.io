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

import toast from '@/utils/toast';

import { useDisplay } from '../hooks/use-display';
import { Button } from '@/components/ui/button';

export function PasteAction<T extends PasteInputType = 'string'>({
  display = 'icon-label',
  variant = 'outline',
  size = 'xs',
  rounded,
  bordered,
  className,
  disabled = false,
  label = 'Paste',
  ariaLabel,
  title,
  onClick = () => {},
  type = 'string' as T,
  successToast = true,
  errorToast = true,
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

    try {
      if (type === 'image') {
        const clipboardContents = await navigator.clipboard.read();
        let foundImage = false;
        for (const item of clipboardContents) {
          if (item.types.includes('image/')) {
            const mimeType =
              find(item.types, (t) => t.startsWith('image/')) || '';
            const blob = await item.getType(mimeType);
            (onClick as OnImagePaste)(blob);
            foundImage = true;
            break;
          }
        }
        if (foundImage) {
          if (successToast) {
            const msg =
              typeof successToast === 'string'
                ? successToast
                : 'Pasted image from clipboard';
            toast.success(msg);
          }
        } else if (errorToast) {
          toast.warning('No image found in clipboard');
        }
      } else {
        const text = await navigator.clipboard.readText();
        (onClick as OnTextPaste)(text);
        if (successToast) {
          const msg =
            typeof successToast === 'string'
              ? successToast
              : 'Pasted from clipboard';
          toast.success(msg);
        }
      }
    } catch (e) {
      console.error('Clipboard paste failed:', e);
      if (errorToast) {
        const msg =
          typeof errorToast === 'string'
            ? errorToast
            : 'Failed to read from clipboard';
        toast.error(msg);
      }
    }
  };

  if (!isActionSupported) return null;

  return (
    <Button
      onClick={onPasteClick}
      variant={variant}
      size={size}
      rounded={rounded}
      bordered={bordered}
      className={className}
      icon={showIcon ? Clipboard : undefined}
      disabled={isButtonDisabled}
      ariaLabel={ariaLabel}
      title={title}
    >
      {showLabel ? label : null}
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
