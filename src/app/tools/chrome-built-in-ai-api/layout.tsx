'use client';

import { useEffect } from 'react';

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Insert Writer/Rewriter/Prompt API into <head>
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

    // <meta> tag for prompt API
    const promptMeta = document.createElement('meta');
    promptMeta.httpEquiv = 'origin-trial';
    promptMeta.content =
      'AvXWDJ953Yy1wVHjgvANJLXt4aq8sl+zCVdHgIribEZ7kswvdRR4RjOy8qwTJ6J4vhfh4bu9HfRbtqvTq32PtQAAAABneyJvcmlnaW4iOiJodHRwczovL3lpenp5Y29vbC5naXRodWIuaW86NDQzIiwiZmVhdHVyZSI6IkFJUHJvbXB0QVBJTXVsdGltb2RhbElucHV0IiwiZXhwaXJ5IjoxNzc0MzEwNDAwfQ==';

    head.appendChild(promptMeta);

    return () => {
      head.removeChild(writerMeta);
      head.removeChild(rewriterMeta);
      head.removeChild(promptMeta);
    };
  }, []);

  return <div className="relative h-full w-full">{children}</div>;
}
