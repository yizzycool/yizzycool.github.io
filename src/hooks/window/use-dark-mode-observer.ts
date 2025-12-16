import { useEffect, useState } from 'react';

export default function useDarkModeObserver() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    const html = document.documentElement;

    const observer = new MutationObserver(() => {
      setIsDark(html.classList.contains('dark'));
    });

    observer.observe(html, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // init state
    setIsDark(html.classList.contains('dark'));

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    isDark,
  };
}
