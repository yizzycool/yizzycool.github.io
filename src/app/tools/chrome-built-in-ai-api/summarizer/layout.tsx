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

    // <meta> tag for summarization API
    const summarizationMeta = document.createElement('meta');
    summarizationMeta.httpEquiv = 'origin-trial';
    summarizationMeta.content =
      'Airpl08Nub9d/pND2C8JYghqqWWSHPvBpLMSD0ZZd9pKKpHD6poG3goX9LTnTcJ9boK/Sj0vswnd5pw21GWv9wgAAABfeyJvcmlnaW4iOiJodHRwczovL3lpenp5Y29vbC5naXRodWIuaW86NDQzIiwiZmVhdHVyZSI6IkFJU3VtbWFyaXphdGlvbkFQSSIsImV4cGlyeSI6MTc1MzE0MjQwMH0=';

    head.appendChild(summarizationMeta);

    return () => {
      head.removeChild(summarizationMeta);
    };
  }, []);

  return children;
}
