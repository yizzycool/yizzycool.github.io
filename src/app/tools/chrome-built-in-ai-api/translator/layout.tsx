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

    return () => {
      head.removeChild(translatorMeta);
    };
  }, []);

  return children;
}
