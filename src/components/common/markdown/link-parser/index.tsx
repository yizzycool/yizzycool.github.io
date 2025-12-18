'use client';

import { ExternalLink } from 'lucide-react';

export default function LinkParser(props: React.ComponentPropsWithoutRef<'a'>) {
  const { href, children, ...rest } = props;

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
      className="inline-flex items-center gap-1 underline"
      {...rest}
    >
      {children}
      {isExternal && <ExternalLink size={14} className="" />}
    </a>
  );
}
