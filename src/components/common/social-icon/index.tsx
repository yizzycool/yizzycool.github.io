'use client';

import { LucideIcon } from 'lucide-react';

type Props = {
  icon: LucideIcon;
  href?: string;
  size?: number;
};

export default function SocialIcon({
  icon: Icon,
  href = '',
  size = 20,
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      className="transform rounded-full p-2 text-neutral-500 transition-all duration-300 hover:scale-110 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
    >
      <Icon size={size} />
    </a>
  );
}
