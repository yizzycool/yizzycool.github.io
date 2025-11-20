'use client';

import { useEffect } from 'react';
import SupportTable from '@/components/tools/chrome-built-in-ai-api/components/support-table';
import DiscoverMoreFeatures from '@/components/tools/components/discover-more-features';

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Insert Writer API into <head>
  useEffect(() => {
    const head = document.querySelector('head');
    if (!head) return;

    // <meta> tag for writer API
    const writerMeta = document.createElement('meta');
    writerMeta.httpEquiv = 'origin-trial';
    writerMeta.content =
      'AtB791K5UOsfevg80p4MWA1GRrbUf9WPlN9p8U20vRWWi2ps8j5iyaGPwTvZBbUNIKat/38BJTv0CPnN50MQEQ4AAABYeyJvcmlnaW4iOiJodHRwczovL3lpenp5Y29vbC5naXRodWIuaW86NDQzIiwiZmVhdHVyZSI6IkFJV3JpdGVyQVBJIiwiZXhwaXJ5IjoxNzc2NzI5NjAwfQ==';

    head.appendChild(writerMeta);

    return () => {
      head.removeChild(writerMeta);
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
