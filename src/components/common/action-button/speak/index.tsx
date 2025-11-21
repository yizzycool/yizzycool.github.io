'use client';

import clsx from 'clsx';
import { Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import _isNull from 'lodash/isNull';

export default function SpeakAction({
  content = '',
  disabled = false,
  size = 18,
}: {
  content?: string;
  disabled?: boolean;
  size?: number;
}) {
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    setIsSpeechSupported('speechSynthesis' in window);
  }, []);

  const onClick = () => {
    if (!content) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    window.speechSynthesis.speak(utterance);
  };

  if (_isNull(isSpeechSupported) || isSpeechSupported === false) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      title="Swap contents"
      className={clsx(
        'group/speak flex items-center justify-center rounded-full border p-3 shadow-sm',
        'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
        'dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      <Volume2
        size={size}
        className="transition-all duration-500 group-active/speak:scale-110"
      />
    </button>
  );
}
