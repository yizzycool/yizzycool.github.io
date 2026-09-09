'use client';

import type { SpeakActionProps } from './types';

import { Volume2 } from 'lucide-react';
import { useSyncExternalStore } from 'react';

import { useDisplay } from '../hooks/use-display';
import { Button } from '@/components/ui/button';

export function SpeakAction({
  display = 'icon-label',
  variant = 'outline',
  size = 'xs',
  rounded,
  bordered,
  className,
  disabled = false,
  content = '',
  label = 'Speak',
  ariaLabel,
  title,
}: SpeakActionProps) {
  const isSpeechSupported = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const { showIcon, showLabel } = useDisplay({ display });

  const onClick = () => {
    if (!content) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    window.speechSynthesis.speak(utterance);
  };

  if (!isSpeechSupported) {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      rounded={rounded}
      bordered={bordered}
      className={className}
      icon={showIcon ? Volume2 : undefined}
      disabled={disabled}
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

function getSnapshot() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function getServerSnapshot() {
  return false;
}
