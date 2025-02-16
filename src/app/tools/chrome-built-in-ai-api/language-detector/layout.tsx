'use client';

import { useEffect } from 'react';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Insert Translator API / Language Detector API into <head>
  useEffect(() => {
    const head = document.querySelector('head');
    if (!head) return;

    // <meta> tag for language detector API
    const languageDetectorMeta = document.createElement('meta');
    languageDetectorMeta.httpEquiv = 'origin-trial';
    languageDetectorMeta.content =
      'Ah5QHua0RHVUuzmcQTOx2ns4Suw4txZpGF4yJVYvfMInusoEikvSyX4jNbYx01PMAlUyoxhK+cZJXry+C/TWrAIAAABheyJvcmlnaW4iOiJodHRwczovL3lpenp5Y29vbC5naXRodWIuaW86NDQzIiwiZmVhdHVyZSI6Ikxhbmd1YWdlRGV0ZWN0aW9uQVBJIiwiZXhwaXJ5IjoxNzQ5NTk5OTk5fQ==';

    head.appendChild(languageDetectorMeta);

    return () => {
      head.removeChild(languageDetectorMeta);
    };
  }, []);

  return children;
}
