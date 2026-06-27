'use client';

import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'system';

export default function useSwitchTheme() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    updateHtml();
  }, []);

  const updateHtml = () => {
    if (typeof window === 'undefined') return;

    const isDark =
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);

    if (!('theme' in localStorage)) {
      document.documentElement.dataset.mode = 'system';
      setTheme('system');
    } else {
      const storedTheme = localStorage.theme as Theme;
      document.documentElement.dataset.mode = storedTheme;
      setTheme(storedTheme);
    }
  };

  const updateTheme = (theme: Theme): undefined => {
    if (theme === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.theme = theme;
    }
    updateHtml();
  };

  return {
    theme,
    updateTheme,
  };
}
