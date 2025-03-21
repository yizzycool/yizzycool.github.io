'use client';

import Link from 'next/link';
import { ToolsSelectorDesktop } from '../../../tools-selector';

export default function Navigation() {
  return (
    <>
      <Link
        className="mx-5 px-4 transition-opacity hover:opacity-80"
        href="/blog"
      >
        Blog
      </Link>
      <ToolsSelectorDesktop />
    </>
  );
}
