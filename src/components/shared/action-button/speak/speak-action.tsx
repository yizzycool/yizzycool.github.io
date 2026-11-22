'use client';

import type { SpeakActionProps } from './types';

import { Square, Volume2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import useSpeechSynthesis from '@/hooks/window/use-speech-synthesis';

import { useDisplay } from '../hooks/use-display';

export function SpeakAction({
  display = 'icon-label',
  variant = 'outline',
  size = 'xs',
  rounded,
  bordered,
  className,
  disabled = false,
  content = '',
  lang,
  rate,
  label = 'Speak',
  ariaLabel,
  title,
}: SpeakActionProps) {
  const { isSupported, isSpeaking, speak, stop } = useSpeechSynthesis();
  const { showIcon, showLabel } = useDisplay({ display });

  const onClick = () => {
    if (isSpeaking) {
      stop();
      return;
    }
    if (!content.trim()) return;
    speak(content, { lang, rate });
  };

  if (!isSupported) {
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
      icon={showIcon ? (isSpeaking ? Square : Volume2) : undefined}
      disabled={disabled}
      ariaLabel={isSpeaking ? 'Stop speaking' : ariaLabel}
      title={isSpeaking ? 'Stop speaking' : title}
    >
      {showLabel ? (isSpeaking ? 'Stop' : label) : null}
    </Button>
  );
}
