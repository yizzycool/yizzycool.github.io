'use client';

import { Fragment } from 'react';

type JwtTokenHighlighterProps = {
  value: string;
  placeholder?: string;
};

export default function JwtTokenHighlighter({
  value,
  placeholder = 'Paste a JWT token here (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)',
}: JwtTokenHighlighterProps) {
  if (!value) {
    return (
      <span className="text-neutral-400/80 dark:text-neutral-500">
        {placeholder}
      </span>
    );
  }

  let bearerPrefix = '';
  let tokenBody = value;
  const bearerMatch = value.match(/^(Bearer\s+)/i);
  if (bearerMatch) {
    bearerPrefix = bearerMatch[1];
    tokenBody = value.slice(bearerPrefix.length);
  }

  const parts = tokenBody.split('.');

  return (
    <>
      {bearerPrefix && (
        <span className="font-semibold text-neutral-400 dark:text-neutral-500">
          {bearerPrefix}
        </span>
      )}
      {parts.map((part, index) => {
        let colorClass = 'text-neutral-800 dark:text-neutral-200';
        if (index === 0) {
          // Header: Sky Blue (Algorithm & Metadata)
          colorClass = 'text-sky-600 dark:text-sky-400 font-medium';
        } else if (index === 1) {
          // Payload: Elegant Violet (Claims & User Data)
          colorClass = 'text-violet-600 dark:text-violet-400 font-medium';
        } else if (index === 2) {
          // Signature: Amber Gold (Security Seal & Cryptographic Proof)
          colorClass = 'text-amber-600 dark:text-amber-400 font-medium';
        }

        return (
          <Fragment key={index}>
            {index > 0 && (
              <span className="font-bold text-neutral-400 dark:text-neutral-500">
                .
              </span>
            )}
            <span className={colorClass}>{part}</span>
          </Fragment>
        );
      })}
    </>
  );
}
