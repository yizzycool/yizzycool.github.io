'use client';

import type { ExtraProps } from 'react-markdown';

import clsx from 'clsx';
import { ExternalLink } from 'lucide-react';

export default function LinkParser(
  props: React.ComponentPropsWithoutRef<'a'> & ExtraProps
) {
  const { href, children, node: _node, ...rest } = props;

  const isExternalLink = (href?: string) => {
    if (!href) return false;

    if (
      href.startsWith('/') ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {
      return false;
    }

    return /^https?:\/\//.test(href);
  };

  const isExternal = isExternalLink(href);

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={clsx(
        'font-medium transition-all duration-300 ease-in-out',
        // make underline with background gradient
        'bg-no-repeat [background-position:0_100%] [background-size:0%_2px]',
        'hover:[background-size:100%_2px]',
        'bg-gradient-to-r from-current to-current'
      )}
      {...rest}
    >
      {children}
      {isExternal && (
        <ExternalLink
          className={clsx(
            'ml-1 inline-flex h-4 w-4 align-middle',
            '-translate-y-0.5'
          )}
        />
      )}
    </a>
  );
}
