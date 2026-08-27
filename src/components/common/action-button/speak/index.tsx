'use client';

import type { ActionButtonProps } from '@/types/common/action-button';

import { Volume2 } from 'lucide-react';
import { useSyncExternalStore } from 'react';

import useDisplay from '../hooks/use-display';
import Button from '../../button';

interface SpeakActionProps extends ActionButtonProps {
  content: string;
}

export default function SpeakAction({
  display = 'icon-label',
  size = 'xs',
  disabled = false,
  content = '',
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
      variant="outline"
      size={size}
      rounded="full"
      className="rounded-lg sm:rounded-full"
      icon={showIcon ? Volume2 : undefined}
      disabled={disabled}
    >
      {showLabel ? 'Speak' : null}
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
