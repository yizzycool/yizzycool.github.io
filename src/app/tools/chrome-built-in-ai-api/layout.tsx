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

    // <meta> tag for translator API
    const translatorMeta = document.createElement('meta');
    translatorMeta.httpEquiv = 'origin-trial';
    translatorMeta.content =
      'AvysjHwmNLNTG6/AzxvWmSXMqmRWz1KFQsxjjLAh/D67mw5u8dx5pmWTqSePihuBVvccTZfboSOAarIUlw0JgwUAAABbeyJvcmlnaW4iOiJodHRwczovL3lpenp5Y29vbC5naXRodWIuaW86NDQzIiwiZmVhdHVyZSI6IlRyYW5zbGF0aW9uQVBJIiwiZXhwaXJ5IjoxNzUzMTQyNDAwfQ==';

    head.appendChild(translatorMeta);

    // <meta> tag for language detector API
    const languageDetectorMeta = document.createElement('meta');
    languageDetectorMeta.httpEquiv = 'origin-trial';
    languageDetectorMeta.content =
      'Ah5QHua0RHVUuzmcQTOx2ns4Suw4txZpGF4yJVYvfMInusoEikvSyX4jNbYx01PMAlUyoxhK+cZJXry+C/TWrAIAAABheyJvcmlnaW4iOiJodHRwczovL3lpenp5Y29vbC5naXRodWIuaW86NDQzIiwiZmVhdHVyZSI6Ikxhbmd1YWdlRGV0ZWN0aW9uQVBJIiwiZXhwaXJ5IjoxNzQ5NTk5OTk5fQ==';

    head.appendChild(languageDetectorMeta);

    // <meta> tag for summarization API
    const summarizationMeta = document.createElement('meta');
    summarizationMeta.httpEquiv = 'origin-trial';
    summarizationMeta.content =
      'Airpl08Nub9d/pND2C8JYghqqWWSHPvBpLMSD0ZZd9pKKpHD6poG3goX9LTnTcJ9boK/Sj0vswnd5pw21GWv9wgAAABfeyJvcmlnaW4iOiJodHRwczovL3lpenp5Y29vbC5naXRodWIuaW86NDQzIiwiZmVhdHVyZSI6IkFJU3VtbWFyaXphdGlvbkFQSSIsImV4cGlyeSI6MTc1MzE0MjQwMH0=';

    head.appendChild(summarizationMeta);

    return () => {
      head.removeChild(translatorMeta);
      head.removeChild(languageDetectorMeta);
      head.removeChild(summarizationMeta);
    };
  }, []);

  return children;
}
