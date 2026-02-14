'use client';

import { useEffect, useRef, useState } from 'react';
import _random from 'lodash/random';

const Phrases = [
  'Clean design meets chill engineering.',
  'Simple ideas, thoughtfully engineered.',
];
const typingSpeed = 50;
const deletingSpeed = 30;
const stayDuration = 3000;
const startDelay = 2000;

export default function Typewritter() {
  const [isMounted, setIsMounted] = useState(false);
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
    }, startDelay);
  }, []);

  // Main typing logic
  useEffect(() => {
    if (!isMounted) return;

    if (isDeleting) {
      deleteText();
    } else {
      typeText();
    }

    return () => {
      if (!timeoutRef.current) return;
      clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, text, isDeleting, index]);

  const typeText = () => {
    // Typing characters
    if (text.length < Phrases[index].length) {
      const randomTime = _random(0, 20);
      timeoutRef.current = setTimeout(() => {
        setText(Phrases[index].slice(0, text.length + 1));
      }, typingSpeed + randomTime);
    } else {
      // Finished typing → wait → start deleting
      timeoutRef.current = setTimeout(() => {
        setIsDeleting(true);
      }, stayDuration);
    }
  };

  const deleteText = () => {
    // Erasing characters
    if (text.length > 0) {
      timeoutRef.current = setTimeout(() => {
        setText(text.slice(0, -1));
      }, deletingSpeed);
    } else {
      // Move to next phrase
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % Phrases.length);
    }
  };

  return (
    <span>
      {text}
      {/* Blinking cursor */}
      <span className="inline-block w-0 animate-flash-cursor text-center">
        |
      </span>
    </span>
  );
}
