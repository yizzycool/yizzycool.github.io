'use client';

import { useEffect, useSyncExternalStore } from 'react';

export type Theme = 'dark' | 'light' | 'system';

const themeChangeTarget =
  typeof window !== 'undefined' ? new EventTarget() : null;

export default function useSwitchTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
    document.documentElement.dataset.mode = theme;
  }, [theme]);

  const updateTheme = (newTheme: Theme) => {
    if (newTheme === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', newTheme);
    }
    themeChangeTarget?.dispatchEvent(new Event('change'));
  };

  return {
    theme,
    updateTheme,
  };
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('storage', callback);
  themeChangeTarget?.addEventListener('change', callback);
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', callback);

  return () => {
    window.removeEventListener('storage', callback);
    themeChangeTarget?.removeEventListener('change', callback);
    mediaQuery.removeEventListener('change', callback);
  };
}

function getSnapshot(): Theme {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem('theme') as Theme) || 'system';
}

function getServerSnapshot(): Theme {
  return 'system';
}
