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
      'AtzauyFPMorWnwAuEK0+yiWP5JdebU0IBQ/7oH6N9cHplIjab3GQKEwhuFhv4WX00kiKc+PtB+FwDdE5d9uWow0AAABneyJvcmlnaW4iOiJodHRwczovL3lpenp5Y29vbC5naXRodWIuaW86NDQzIiwiZmVhdHVyZSI6IkFJUHJvbXB0QVBJTXVsdGltb2RhbElucHV0IiwiZXhwaXJ5IjoxNzgxNTY4MDAwfQ==';

    head.appendChild(promptMeta);

    // <meta> tag for prompt API
    const proofreaderMeta = document.createElement('meta');
    proofreaderMeta.httpEquiv = 'origin-trial';
    proofreaderMeta.content =
      'ApAaYwVhkSUG/Vtuvh9JW7GHTgZTc+papZMQt8e2yDf7NBEunbHUbGbBHHSjMQwMNM82rjPjF0UMRlxZa2my+A8AAABdeyJvcmlnaW4iOiJodHRwczovL3lpenp5Y29vbC5naXRodWIuaW86NDQzIiwiZmVhdHVyZSI6IkFJUHJvb2ZyZWFkZXJBUEkiLCJleHBpcnkiOjE3NzkxNDg4MDB9';

    head.appendChild(proofreaderMeta);

    return () => {
      head.removeChild(writerMeta);
      head.removeChild(rewriterMeta);
      head.removeChild(promptMeta);
      head.removeChild(proofreaderMeta);
    };
  }, []);

  return <div className="h-full w-full">{children}</div>;
}
