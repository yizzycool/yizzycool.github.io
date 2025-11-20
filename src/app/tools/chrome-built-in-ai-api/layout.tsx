'use client';

import { useEffect } from 'react';
import SupportTable from '@/components/tools/chrome-built-in-ai-api/components/support-table';
import DiscoverMoreFeatures from '@/components/tools/components/discover-more-features';

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Insert Writer/Rewriter API into <head>
  useEffect(() => {
    const head = document.querySelector('head');
    if (!head) return;

    // <meta> tag for writer API
    const writerMeta = document.createElement('meta');
    writerMeta.httpEquiv = 'origin-trial';
    writerMeta.content =
      'AtB791K5UOsfevg80p4MWA1GRrbUf9WPlN9p8U20vRWWi2ps8j5iyaGPwTvZBbUNIKat/38BJTv0CPnN50MQEQ4AAABYeyJvcmlnaW4iOiJodHRwczovL3lpenp5Y29vbC5naXRodWIuaW86NDQzIiwiZmVhdHVyZSI6IkFJV3JpdGVyQVBJIiwiZXhwaXJ5IjoxNzc2NzI5NjAwfQ==';

    head.appendChild(writerMeta);

    // <meta> tag for rewriter API
    const rewriterMeta = document.createElement('meta');
    rewriterMeta.httpEquiv = 'origin-trial';
    rewriterMeta.content =
      'Av34E0dtLmZ1Yte/zZ7HRZV5/AiJ0sFf9ycVFFER0KX1JqwG+t6W7qnPjIXws2xrTArrAtCLRiSY0VFD0JW3XAMAAABaeyJvcmlnaW4iOiJodHRwczovL3lpenp5Y29vbC5naXRodWIuaW86NDQzIiwiZmVhdHVyZSI6IkFJUmV3cml0ZXJBUEkiLCJleHBpcnkiOjE3NzY3Mjk2MDB9';

    head.appendChild(rewriterMeta);

    return () => {
      head.removeChild(writerMeta);
      head.removeChild(rewriterMeta);
    };
  }, []);

  return (
    <>
      {children}
      <DiscoverMoreFeatures type="chromeAiApi" />
      <SupportTable />
    </>
  );
}
