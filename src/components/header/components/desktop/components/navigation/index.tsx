'use client';

import Link from 'next/link';
import { ToolsSelectorDesktop } from '../../../tools-selector';

const NavigationData = [
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
    <>
      {NavigationData.map(({ link, title }) => (
        <Link
          key={link}
          className="px-4 transition-opacity hover:opacity-80"
          href={link}
        >
          {title}
        </Link>
      ))}
      <ToolsSelectorDesktop />
    </>
  );
}
