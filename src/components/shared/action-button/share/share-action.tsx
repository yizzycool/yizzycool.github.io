'use client';

import type { ShareActionProps } from './types';

import { Share2 } from 'lucide-react';
import { useMemo, useSyncExternalStore } from 'react';
import { isNil } from 'lodash';

import { useDisplay } from '../hooks/use-display';
import { Button } from '@/components/ui/button';

export function ShareAction({
  display = 'icon-label',
  variant = 'secondary',
  size = 'xs',
  rounded,
  bordered,
  className,
  disabled = false,
  content = '',
  label = 'Share',
  shareTitle = '',
  shareText = '',
}: ShareActionProps) {
  const isActionSupported = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const { showIcon, showLabel } = useDisplay({ display });

  const shareData = useMemo(() => {
    if (typeof content === 'string') {
      return {
        title: shareTitle,
        text: shareText,
        url: content,
      };
    } else if (isNil(content)) {
      return {};
    } else {
      return {
        title: shareTitle,
        text: shareText,
        files: [content],
      };
    }
  }, [shareTitle, shareText, content]);

  const isMimeTypeSupported = useMemo(() => {
    if (typeof window === 'undefined' || !window.navigator.canShare)
      return false;
    return window.navigator.canShare(shareData);
  }, [shareData]);

  const isButtonDisabled = useMemo(() => {
    return (
      disabled || isNil(content) || !isMimeTypeSupported || !isActionSupported
    );
  }, [disabled, content, isMimeTypeSupported, isActionSupported]);

  const handleShare = async () => {
    if (isButtonDisabled) return;
    if (!content) return;

    navigator.share(shareData).catch((e) => {
      console.log('Share API failed:', e);
    });
  };

  if (!isActionSupported) return null;

  return (
    <Button
      onClick={handleShare}
      variant={variant}
      size={size}
      rounded={rounded}
      bordered={bordered}
      className={className}
      icon={!showIcon ? undefined : Share2}
      disabled={isButtonDisabled}
    >
      {!showLabel ? null : label}
    </Button>
  );
}

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return (
    typeof window !== 'undefined' &&
    !!window.navigator.share &&
    !!window.navigator.canShare
  );
}

function getServerSnapshot() {
  return false;
}
