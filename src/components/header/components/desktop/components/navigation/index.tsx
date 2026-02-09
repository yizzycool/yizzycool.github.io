'use client';

import Link from 'next/link';
import { ToolsSelectorDesktop } from '../../../tools-selector';

const NavigationData = [
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
];

export default function Navigation() {
  return (
    <nav className="px-4">
      <ul className="flex items-center justify-end px-4">
        {NavigationData.map(({ link, title }) => (
          <li key={link}>
            <Link
              className="group relative mx-4 transition-opacity hover:text-black hover:dark:text-white"
              href={link}
            >
              {title}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-neutral-900 transition-all duration-300 group-hover:w-full dark:bg-white" />
            </Link>
          </li>
        ))}
        <ToolsSelectorDesktop />
      </ul>
    </nav>
  );
}
