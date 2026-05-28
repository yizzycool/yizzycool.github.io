'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/utils/cn';

const navigationData = [
  {
    link: '/',
    title: 'Home',
  },
  {
    link: '/resume',
    title: 'Resume',
  },
  {
    link: '/blog',
    title: 'Blog',
  },
  {
    link: '/tools',
    title: 'Tools',
  },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="px-4">
      <ul className="flex items-center justify-end px-4">
        {navigationData.map(({ link, title }) => {
          const isActive =
            link === '/' ? pathname === '/' : pathname.startsWith(link);
          return (
            <li key={link}>
              <Link
                className={cn(
                  'group relative mx-4 transition-all duration-300',
                  isActive
                    ? 'font-bold text-neutral-950 dark:text-neutral-50'
                    : 'text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50'
                )}
                href={link}
              >
                {title}
                <span
                  className={cn(
                    'absolute -bottom-1 left-0 h-0.5 bg-neutral-950 transition-all duration-300 dark:bg-neutral-50',
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
