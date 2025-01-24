'use client';

import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

export default function useSwitchTheme() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    updateHtml();
  }, []);

  const updateHtml = () => {
    if (
      !('theme' in localStorage) &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      document.documentElement.classList.toggle('dark', true);
      document.documentElement.classList.toggle('light', false);
      document.documentElement.dataset.mode = 'system';
      setTheme('system');
    } else if (localStorage.theme === 'dark') {
      document.documentElement.classList.toggle('dark', true);
      document.documentElement.classList.toggle('light', false);
      document.documentElement.dataset.mode = 'dark';
      setTheme('dark');
    } else if (localStorage.theme === 'light') {
      document.documentElement.classList.toggle('light', true);
      document.documentElement.classList.toggle('dark', false);
      document.documentElement.dataset.mode = 'light';
      setTheme('light');
    }

    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    document.documentElement.classList.toggle(
      'dark',
      localStorage.theme === 'dark' ||
        (!('theme' in localStorage) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
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
