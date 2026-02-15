'use client';

import type { ActionButtonProps } from '@/types/common/action-button';
import { Share2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import useDisplay from '../hooks/use-display';
import Button from '../../button';
import _isNil from 'lodash/isNil';

interface Props extends ActionButtonProps {
  content?: string | File | null | undefined;
  shareTitle?: '';
  shareText?: '';
}

export default function ShareAction({
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
}: Props) {
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

  const shareData = useMemo(() => {
    if (typeof content === 'string') {
      return {
        title: shareTitle,
        text: shareText,
        url: content,
      };
    } else if (_isNil(content)) {
      return {};
    } else {
      return {
        title: shareTitle,
        text: shareText,
        files: [content],
      };
    }
  }, [shareTitle, shareText, content]);

  const isButtonDisabled = useMemo(() => {
    return (
      disabled || _isNil(content) || !isMimeTypeSupported || !isActionSupported
    );
  }, [disabled, content, isMimeTypeSupported, isActionSupported]);

  // Check if navigator.share and navigator.share.canShare exist
  useEffect(() => {
    setIsActionSupported(
      !!window.navigator.share && !!window.navigator.canShare
    );
  }, [shareData]);

  // Check if mimeType is supported
  useEffect(() => {
    setIsMimeTypeSupported(
      !!window.navigator.canShare && window.navigator.canShare(shareData)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mimeType]);

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
