'use client';

import type { LucideIcon } from 'lucide-react';

type Props = {
  htmlFor?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
};

export default function Label({ htmlFor, icon: Icon, children }: Props) {
  return (
    <label
      htmlFor={htmlFor}
      className="block self-start font-semibold sm:self-auto"
    >
      {!!Icon && <Icon className="mr-2 inline-block" size={16} />}
      {children}
    </label>
  );
}
