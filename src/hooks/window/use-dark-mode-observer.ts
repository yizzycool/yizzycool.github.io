import { useSyncExternalStore } from 'react';

export default function useDarkModeObserver() {
  const isDark = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return {
    isDark,
  };
}

function subscribe(callback: () => void) {
  const html = document.documentElement;
  const observer = new MutationObserver(callback);

  observer.observe(html, {
    attributes: true,
    attributeFilter: ['class'],
  });

  return () => {
    observer.disconnect();
  };
}

function getSnapshot(): boolean {
  return document.documentElement.classList.contains('dark');
}

function getServerSnapshot(): boolean {
  return false;
}
